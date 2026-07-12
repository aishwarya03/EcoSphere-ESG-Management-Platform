import nodemailer from 'nodemailer';

let transporter;

const getTransporter = () => {
  if (transporter) return transporter;

  if (process.env.SMTP_HOST) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: process.env.SMTP_USER
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        : undefined,
    });
  } else {
    // Dev fallback: no SMTP configured, log emails to the console instead of sending.
    transporter = {
      sendMail: async (options) => {
        console.log('\n--- Email (dev mode, no SMTP configured) ---');
        console.log(`To: ${options.to}`);
        console.log(`Subject: ${options.subject}`);
        console.log(options.text || options.html);
        console.log('---------------------------------------------\n');
      },
    };
  }

  return transporter;
};

export const sendInviteEmail = async ({ to, organizationName, inviteUrl }) => {
  const transport = getTransporter();

  await transport.sendMail({
    from: process.env.SMTP_FROM || 'EcoSphere <no-reply@ecosphere.app>',
    to,
    subject: `You've been invited to join ${organizationName} on EcoSphere`,
    text: `You've been invited to join ${organizationName} on EcoSphere.\n\nSet up your account: ${inviteUrl}\n\nThis link expires in 7 days.`,
  });
};
