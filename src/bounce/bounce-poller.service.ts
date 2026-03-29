import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ImapFlow } from 'imapflow';
import { simpleParser } from 'mailparser';
import {
  BouncedEmail,
  BouncedEmailDocument,
} from './schemas/bounced-email.schema';
import {
  ServerDomain,
  ServerDomainDocument,
} from 'src/servers-domains/schemas/server-domain.schema';

@Injectable()
export class BouncePollerService {
  private readonly logger = new Logger(BouncePollerService.name);

  // DSN permanent failure codes (5.x.x) → hard bounce
  private readonly HARD_BOUNCE_PATTERN = /\b5\.\d+\.\d+\b/;
  // DSN temporary failure codes (4.x.x) → soft bounce
  private readonly SOFT_BOUNCE_PATTERN = /\b4\.\d+\.\d+\b/;

  constructor(
    @InjectModel(BouncedEmail.name)
    private bouncedEmailModel: Model<BouncedEmailDocument>,
    @InjectModel(ServerDomain.name)
    private serverDomainModel: Model<ServerDomainDocument>,
  ) {}

  /**
   * Runs every hour. Polls bounces@<domain> for all active domains.
   * MTA-agnostic — works with Exim, Postfix, or any IMAP-capable mail server.
   */
  @Cron(CronExpression.EVERY_HOUR)
  async pollAllDomains(): Promise<void> {
    const domains = await this.serverDomainModel
      .find({ status: 'active' })
      .select('domain')
      .lean();

    if (!domains.length) return;

    this.logger.log(`Starting bounce poll for ${domains.length} domain(s)`);

    for (const { domain } of domains) {
      try {
        await this.pollDomain(domain);
      } catch (err) {
        // Log and continue — one domain failure should not block others
        this.logger.error(
          `Failed to poll bounces for ${domain}: ${err.message}`,
        );
      }
    }

    this.logger.log('Bounce poll complete');
  }

  /**
   * Poll a single domain's bounce mailbox.
   * Exposed publicly so it can be triggered manually via the admin API.
   */
  async pollDomain(
    domain: string,
  ): Promise<{ processed: number; errors: number }> {
    const host = `mail.${domain}`;
    const user = `bounces@${domain}`;
    const password = process.env.ROOT_MAIL_USER_PASSWORD || '';

    if (!password) {
      this.logger.warn(
        `ROOT_MAIL_USER_PASSWORD not set, skipping bounce poll for ${domain}`,
      );
      return { processed: 0, errors: 0 };
    }

    // Port/SSL config — reads from env so it can be overridden per deployment.
    // Exim/Postfix default: 993 SSL. Some setups use 143 + STARTTLS.
    const imapPort = parseInt(process.env.BOUNCE_IMAP_PORT || '993', 10);
    const imapSecure = process.env.BOUNCE_IMAP_SECURE !== 'false'; // default true

    this.logger.log(
      `Connecting to ${host}:${imapPort} (secure=${imapSecure}) as ${user}`,
    );

    const client = new ImapFlow({
      host,
      port: imapPort,
      secure: imapSecure,
      auth: { user, pass: password },
      logger: {
        debug: () => {},
        info: (obj) => this.logger.debug(JSON.stringify(obj)),
        warn: (obj) => this.logger.warn(JSON.stringify(obj)),
        error: (obj) => this.logger.error(JSON.stringify(obj)),
      },
      tls: {
        rejectUnauthorized: false,
        checkServerIdentity: () => undefined,
      },
    });

    // Surface connection errors clearly
    client.on('error', (err) => {
      this.logger.error(`IMAP connection error for ${domain}: ${err.message}`);
    });

    let processed = 0;
    let errors = 0;
    let connectionError: Error | null = null;

    try {
      await client.connect();
      this.logger.log(`IMAP connected to ${host} for ${domain}`);
      const lock = await client.getMailboxLock('INBOX');

      try {
        // Fetch all unseen messages
        const messages: any[] = [];
        for await (const msg of client.fetch(
          { seen: false },
          { source: true, uid: true },
        )) {
          messages.push({ uid: msg.uid, source: msg.source });
        }

        if (!messages.length) {
          this.logger.debug(`No new bounces for ${domain}`);
          return { processed: 0, errors: 0 };
        }

        this.logger.log(
          `Processing ${messages.length} bounce(s) for ${domain}`,
        );

        for (const msg of messages) {
          try {
            await this.processNdr(msg.source, domain);
            // Mark as seen after successful processing
            await client.messageFlagsAdd({ uid: msg.uid }, ['\\Seen'], {
              uid: true,
            });
            processed++;
          } catch (err) {
            this.logger.warn(
              `Failed to process NDR for ${domain}: ${err.message}`,
            );
            errors++;
          }
        }
      } finally {
        lock.release();
      }
    } catch (err) {
      connectionError = err;
      this.logger.error(`IMAP session error for ${domain}: ${err.message}`);
    } finally {
      // logout() can throw if connection already dropped — ignore that
      try {
        await client.logout();
      } catch (_) {}
    }

    if (connectionError) throw connectionError;

    return { processed, errors };
  }

  /**
   * Parse a raw NDR email and persist the bounce record.
   * Handles standard DSN format (RFC 3464) used by both Exim and Postfix.
   */
  private async processNdr(source: Buffer, domain: string): Promise<void> {
    const parsed = await simpleParser(source);

    // Extract the failed recipient address from the NDR
    const failedEmail = this.extractFailedEmail(parsed);
    if (!failedEmail) {
      this.logger.debug('Could not extract failed email from NDR, skipping');
      return;
    }

    // Extract DSN status code and determine bounce type
    const { statusCode, bounceType, diagnosticMessage } =
      this.extractBounceInfo(parsed);

    // Upsert — if we've seen this bounce before, update it rather than duplicate
    await this.bouncedEmailModel.findOneAndUpdate(
      { email: failedEmail, domain },
      {
        email: failedEmail,
        domain,
        bounceType,
        statusCode,
        diagnosticMessage,
        // Use the NDR email's Date header — this is when the bounce actually
        // occurred, not when the poller processed it.
        bouncedAt: parsed.date ?? new Date(),
      },
      { upsert: true, new: true },
    );

    this.logger.debug(
      `Recorded ${bounceType} bounce for ${failedEmail} on ${domain}`,
    );
  }

  /**
   * Extract the original failed recipient from the NDR.
   * Checks multiple locations in order of reliability:
   *  1. DSN Final-Recipient header (most reliable, RFC 3464)
   *  2. Original-Recipient header
   *  3. To header of the original message (attached part)
   *  4. Subject line patterns (fallback)
   */
  private extractFailedEmail(parsed: any): string | null {
    const emailRegex = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/;

    // 1. DSN Final-Recipient (most reliable)
    const finalRecipient = parsed.headers?.get('final-recipient');
    if (finalRecipient) {
      const match = finalRecipient.match(emailRegex);
      if (match) return match[0].toLowerCase();
    }

    // 2. Original-Recipient header
    const originalRecipient = parsed.headers?.get('original-recipient');
    if (originalRecipient) {
      const match = originalRecipient.match(emailRegex);
      if (match) return match[0].toLowerCase();
    }

    // 3. Scan text body for "failed recipient" patterns common in Exim/Postfix NDRs
    const text = parsed.text || '';
    const patterns = [
      /failed.*?:\s*([a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,})/i,
      /undeliverable.*?to\s+([a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,})/i,
      /delivery.*?failed.*?([a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,})/i,
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) return match[1].toLowerCase();
    }

    // 4. Last resort — first email in body that isn't the bounce address itself
    const allEmails =
      text.match(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g) || [];
    const candidate = allEmails.find(
      (e) => !e.startsWith('bounces@') && !e.startsWith('mailer-daemon@'),
    );
    return candidate ? candidate.toLowerCase() : null;
  }

  /**
   * Extract DSN status code and classify as hard or soft bounce.
   * RFC 3464 DSN codes: 5.x.x = permanent, 4.x.x = temporary
   */
  private extractBounceInfo(parsed: any): {
    statusCode: string;
    bounceType: 'hard' | 'soft';
    diagnosticMessage: string;
  } {
    const text = parsed.text || '';
    const subject = parsed.subject || '';
    const combined = `${subject} ${text}`;

    // Try to find DSN status code
    const dsnMatch = combined.match(/\b([45]\.\d+\.\d+)\b/);
    const statusCode = dsnMatch ? dsnMatch[1] : '';

    // Determine bounce type
    let bounceType: 'hard' | 'soft' = 'soft'; // default to soft if unclear
    if (statusCode.startsWith('5') || this.HARD_BOUNCE_PATTERN.test(combined)) {
      bounceType = 'hard';
    } else if (
      statusCode.startsWith('4') ||
      this.SOFT_BOUNCE_PATTERN.test(combined)
    ) {
      bounceType = 'soft';
    } else {
      // No DSN code found — check subject for common permanent failure keywords
      const hardKeywords =
        /user unknown|no such user|does not exist|invalid address|mailbox not found/i;
      if (hardKeywords.test(combined)) bounceType = 'hard';
    }

    // Extract diagnostic message (first meaningful line from body)
    const diagnosticMessage =
      text.split('\n').find((line) => line.trim().length > 20) || '';

    return {
      statusCode,
      bounceType,
      diagnosticMessage: diagnosticMessage.trim().slice(0, 500),
    };
  }

  /**
   * Check if an email is a known hard bounce.
   * Used by campaign service or list upload to pre-filter recipients.
   */
  async isHardBounce(email: string): Promise<boolean> {
    const record = await this.bouncedEmailModel.findOne({
      email: email.toLowerCase(),
      bounceType: 'hard',
    });
    return !!record;
  }

  /**
   * Bulk check — returns the set of hard-bounced emails from a given list.
   * Efficient for pre-filtering large recipient lists.
   */
  async filterHardBounces(emails: string[]): Promise<Set<string>> {
    const normalised = emails.map((e) => e.toLowerCase());
    const records = await this.bouncedEmailModel
      .find({ email: { $in: normalised }, bounceType: 'hard' })
      .select('email')
      .lean();
    return new Set(records.map((r) => r.email));
  }
}
