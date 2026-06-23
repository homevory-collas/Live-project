/**
 * ============================================================
 *  邮件发送 / Email sending
 *  默认把验证码打印到控制台（开发用）。
 *  Default: prints the code to the console (dev only).
 *
 *  ⚠️ 生产环境必须接入真实邮件服务（SendGrid / AWS SES / Resend / SMTP）。
 *     在 sendEmail() 里替换为你的服务商调用即可。没有它，验证码到不了用户邮箱。
 *     Plug a real email provider into sendEmail() for production; otherwise the
 *     code never reaches the user's inbox.
 * ============================================================ */
import 'dotenv/config';

const PROVIDER = process.env.MAIL_PROVIDER || '';   // '', 'resend', 'sendgrid', ...
const MAIL_KEY = process.env.MAIL_API_KEY || '';
const MAIL_FROM = process.env.MAIL_FROM || 'no-reply@livearena.example';

export async function sendEmail(to, subject, text) {
  // —— 真实服务商示例（Resend）/ real provider example (Resend) ——
  if (PROVIDER === 'resend' && MAIL_KEY) {
    try {
      const r = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${MAIL_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: MAIL_FROM, to, subject, text }),
      });
      return r.ok;
    } catch (e) { console.error('[mail] send failed', e); return false; }
  }
  // TODO(mail): 在此添加 SendGrid / SES / SMTP 分支 / add other providers here.

  // —— 开发回退：打印到控制台 / dev fallback: print ——
  console.log(`\n[mail:DEV] To: ${to}\n[mail:DEV] ${subject}\n[mail:DEV] ${text}\n`);
  return true;
}

export const mailConfigured = () => PROVIDER && MAIL_KEY;
