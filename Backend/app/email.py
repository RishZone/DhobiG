"""
Outbound email, via SMTP.

Deliberately provider-agnostic: SES, SendGrid, Postmark, Mailgun, and most
other transactional email providers all expose an SMTP relay, so a single
smtplib integration covers all of them without extra SDK dependencies.
Point SMTP_HOST/PORT/USERNAME/PASSWORD at whichever provider you use — see
each provider's "SMTP relay" / "SMTP credentials" docs for the values.

If SMTP isn't configured (e.g. local dev with no email provider set up),
sends are logged instead of delivered, so the app degrades gracefully
rather than crashing — mirroring the fallback pattern already used for the
LLM (ai/rag/llm.py) and the embedder (ai/rag/hashing_embedder.py).

IMPORTANT: callers must never put a sensitive token/secret in an API
response as a substitute for sending it here — logging-instead-of-sending
is a *local dev convenience*, not a production delivery path.
"""
import logging
import os
import smtplib
from email.mime.text import MIMEText

logger = logging.getLogger("dhobig.email")

SMTP_HOST = os.getenv("SMTP_HOST")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USERNAME = os.getenv("SMTP_USERNAME")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")
SMTP_FROM_EMAIL = os.getenv("SMTP_FROM_EMAIL", "no-reply@dhobig.com")
SMTP_USE_TLS = os.getenv("SMTP_USE_TLS", "true").lower() != "false"

EMAIL_CONFIGURED = bool(SMTP_HOST and SMTP_USERNAME and SMTP_PASSWORD)

if not EMAIL_CONFIGURED:
    logger.warning(
        "SMTP is not configured (SMTP_HOST/SMTP_USERNAME/SMTP_PASSWORD unset). "
        "Emails will be logged instead of delivered. Set these env vars "
        "before deploying to production."
    )


def send_email(to_email: str, subject: str, body: str) -> bool:
    """
    Send a plain-text email.

    Returns True if the message was handed off to the SMTP server
    successfully, False if it was only logged (SMTP not configured) or if
    sending failed. Callers should treat False as "not delivered" but
    generally still return a generic success response to the end user (see
    forgot_password) so as not to leak account existence or transient
    infra failures.
    """
    if not EMAIL_CONFIGURED:
        logger.warning("Email NOT sent (SMTP unconfigured). to=%s subject=%r", to_email, subject)
        logger.info("Email body (dev-only log):\n%s", body)
        return False

    msg = MIMEText(body)
    msg["Subject"] = subject
    msg["From"] = SMTP_FROM_EMAIL
    msg["To"] = to_email

    try:
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=10) as server:
            if SMTP_USE_TLS:
                server.starttls()
            server.login(SMTP_USERNAME, SMTP_PASSWORD)
            server.sendmail(SMTP_FROM_EMAIL, [to_email], msg.as_string())
        return True
    except Exception:
        logger.exception("Failed to send email to %s", to_email)
        return False


def send_password_reset_email(to_email: str, reset_link: str, ttl_minutes: int) -> bool:
    subject = "Reset your DhobiG password"
    body = (
        "We received a request to reset your DhobiG password.\n\n"
        f"Reset it here (this link expires in {ttl_minutes} minutes):\n{reset_link}\n\n"
        "If you didn't request this, you can safely ignore this email — "
        "your password will not be changed."
    )
    return send_email(to_email, subject, body)