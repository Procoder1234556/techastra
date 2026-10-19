import nodemailer from 'nodemailer';
import { config } from '../config.js';
import {
  countActiveGmailAccounts,
  incrementGmailSent,
  pickGmailAccountForSend,
} from '../repositories/gmailAccounts.js';

let smtpTransport;
const gmailTransports = new Map();

function getSmtpTransport() {
  if (!config.email.host) return null;
  if (!smtpTransport) {
    smtpTransport = nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      secure: config.email.secure,
      auth: config.email.user
        ? { user: config.email.user, pass: config.email.pass }
        : undefined,
    });
  }
  return smtpTransport;
}

export async function emailProviderStatus() {
  const gmailCount = await countActiveGmailAccounts();
  return {
    smtp: Boolean(config.email.host),
    zepto: Boolean(config.email.zeptoToken),
    gmail: gmailCount > 0,
    gmailPoolSize: gmailCount,
    active: getActiveProvider(gmailCount > 0),
  };
}

function emailProviderStatusSync() {
  return {
    smtp: Boolean(config.email.host),
    zepto: Boolean(config.email.zeptoToken),
    gmail: false,
    active: getActiveProvider(false),
  };
}

function getActiveProvider(hasGmailPool = false) {
  if (config.email.preferred === 'gmail' && hasGmailPool) return 'gmail';
  if (config.email.preferred === 'zepto' && config.email.zeptoToken) return 'zepto';
  if (config.email.preferred === 'smtp' && config.email.host) return 'smtp';
  if (config.email.zeptoToken) return 'zepto';
  if (config.email.host) return 'smtp';
  if (hasGmailPool) return 'gmail';
  return null;
}

function getGmailTransport(email, appPassword) {
  const key = email;
  if (!gmailTransports.has(key)) {
    gmailTransports.set(
      key,
      nodemailer.createTransport({
        service: 'gmail',
        auth: { user: email, pass: appPassword },
      }),
    );
  }
  return gmailTransports.get(key);
}

async function sendViaGmailPool({ to, subject, html, text, category }) {
  const account = await pickGmailAccountForSend(category || 'notifications');
  if (!account) throw new Error('No Gmail pool account with remaining daily capacity');
  const transport = getGmailTransport(account.email, account.app_password);
  await transport.sendMail({
    from: `"${config.email.fromName}" <${account.email}>`,
    to,
    subject,
    html: html || `<p>${text || ''}</p>`,
    text,
  });
  await incrementGmailSent(account.id);
  return { provider: 'gmail', from: account.email };
}

async function sendViaZepto({ to, subject, html, text }) {
  const res = await fetch('https://api.zeptomail.com/v1.1/email', {
    method: 'POST',
    headers: {
      Authorization: config.email.zeptoToken.startsWith('Zoho-enczapikey')
        ? config.email.zeptoToken
        : `Zoho-enczapikey ${config.email.zeptoToken}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      from: {
        address: config.email.from,
        name: config.email.fromName,
      },
      to: [{ email_address: { address: to } }],
      subject,
      htmlbody: html || `<p>${text || ''}</p>`,
      textbody: text || undefined,
    }),
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`ZeptoMail failed (${res.status}): ${errText.slice(0, 200)}`);
  }
  return { provider: 'zepto' };
}

async function sendViaSmtp({ to, subject, html, text }) {
  const transport = getSmtpTransport();
  if (!transport) throw new Error('SMTP not configured');
  await transport.sendMail({
    from: `"${config.email.fromName}" <${config.email.from}>`,
    to,
    subject,
    html: html || `<p>${text || ''}</p>`,
    text,
    replyTo: config.email.replyTo || undefined,
  });
  return { provider: 'smtp' };
}

/**
 * Send one email. Returns null when no provider is configured (caller should fall back to in-app only).
 */
export async function sendEmail({ to, subject, html, text, category }) {
  const gmailCount = await countActiveGmailAccounts();
  const provider = getActiveProvider(gmailCount > 0);
  if (!provider) return null;
  if (provider === 'gmail') return sendViaGmailPool({ to, subject, html, text, category });
  if (provider === 'zepto') return sendViaZepto({ to, subject, html, text });
  return sendViaSmtp({ to, subject, html, text });
}

export { emailProviderStatusSync };

export async function sendTestEmail(to) {
  const result = await sendEmail({
    to,
    subject: 'Techastra MailerHub test',
    html: '<p>If you received this, your email provider is configured correctly.</p>',
    text: 'If you received this, your email provider is configured correctly.',
  });
  if (!result) {
    return { sent: false, mode: 'no_provider', message: 'Set EMAIL_HOST or ZEPTOMAIL_TOKEN in .env' };
  }
  return { sent: true, ...result };
}
