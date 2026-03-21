/**
 * BounceModule — Automated bounce detection and list hygiene.
 *
 * ## What it does
 * Polls the `bounces@<domain>` IMAP mailbox for every active ServerDomain once per hour.
 * Parses incoming NDR (Non-Delivery Report) emails, classifies them as hard or soft bounces,
 * and persists results in the `bounced_emails` MongoDB collection.
 *
 * ## MTA compatibility
 * Fully MTA-agnostic. Works with Exim, Postfix, or any mail server that delivers NDRs
 * to the envelope sender address. No MTA-specific configuration required.
 *
 * ## Bounce types
 *  - hard (5.x.x DSN) — permanent failure. Address/domain does not exist. Never send again.
 *  - soft (4.x.x DSN) — temporary failure. Mailbox full, server busy. May recover.
 *
 * ## Credentials
 * Uses ROOT_MAIL_USER_PASSWORD from env (same password used for admin@domain SMTP auth).
 * IMAP connects to mail.<domain>:993 (SSL) as bounces@<domain>.
 *
 * ## Exports
 * BouncePollerService is exported so other modules (e.g. CampaignModule) can call
 * filterHardBounces(emails[]) to pre-filter recipient lists before sending.
 *
 * ## Admin API
 *  GET    /api/bounces                  — list bounces (filter by domain, type, paginate)
 *  POST   /api/bounces/poll             — manually trigger full poll across all domains
 *  POST   /api/bounces/poll/:domain     — manually trigger poll for one domain
 *  POST   /api/bounces/check            — bulk check if emails are hard-bounced
 *  DELETE /api/bounces/:email           — remove an email from the bounce list (admin correction)
 *
 * ## Related docs
 *  docs/bulk-email-system.md — system architecture and known issues
 */
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  BouncedEmail,
  BouncedEmailSchema,
} from './schemas/bounced-email.schema';
import { BouncePollerService } from './bounce-poller.service';
import { BounceController } from './bounce.controller';
import {
  ServerDomain,
  ServerDomainSchema,
} from 'src/servers-domains/schemas/server-domain.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: BouncedEmail.name, schema: BouncedEmailSchema },
      { name: ServerDomain.name, schema: ServerDomainSchema },
    ]),
  ],
  controllers: [BounceController],
  providers: [BouncePollerService],
  exports: [BouncePollerService], // exported so other modules can use filterHardBounces
})
export class BounceModule {}
