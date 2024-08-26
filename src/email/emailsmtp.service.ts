const { SMTPServer } = require('smtp-server');
const { simpleParser } = require('mailparser');
const nodemailer = require('nodemailer');
const dns = require('dns');
const dkim = require('nodemailer-dkim');
const fs = require('fs');

// Create SMTP server
const server = new SMTPServer({
  onData(stream, session, callback) {
    simpleParser(stream, {}, (err, parsed) => {
      if (err) {
        return callback(err);
      }

      console.log('Email received from:', parsed.from.text);
      console.log('Email subject:', parsed.subject);
      console.log('Email body:', parsed.text);

      // Relay email to recipient's server
      relayEmail(parsed, callback);
    });
  },
  onAuth(auth, session, callback) {
    const username = 'admin@monkeymediaservices.com';
    const password = 'yourpassword';

    if (auth.username === username && auth.password === password) {
      callback(null, { user: username });
    } else {
      callback(new Error('Invalid username or password'));
    }
  },
  authOptional: true,
});

// Start SMTP server
server.listen(25, () => {
  console.log('SMTP server is listening on port 25');
});

// Function to relay email to recipient's server
function relayEmail(parsedEmail, callback) {
  const recipient = parsedEmail.to.value[0].address;

  dns.resolveMx(recipient.split('@')[1], (err, addresses) => {
    if (err || addresses.length === 0) {
      return callback(new Error('No MX records found for domain'));
    }

    const mxRecord = addresses[0].exchange;
    const transporter = nodemailer.createTransport({
      host: mxRecord,
      port: 25,
      secure: false,
    });

    // Use DKIM for signing emails
    transporter.use(
      'stream',
      dkim.signer({
        domainName: 'monkeymediaservices.com',
        keySelector: 'selector',
        privateKey: fs.readFileSync('selector.private', 'utf8'),
      }),
    );

    const mailOptions = {
      from: parsedEmail.from.text,
      to: recipient,
      subject: parsedEmail.subject,
      text: parsedEmail.text,
      html: parsedEmail.html,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return callback(error);
      }
      console.log('Message sent:', info.messageId);
      callback();
    });
  });
}
