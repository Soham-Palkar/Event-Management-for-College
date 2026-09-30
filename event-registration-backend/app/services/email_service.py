import logging
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from flask import current_app

logger = logging.getLogger(__name__)


def send_registration_confirmation(registration, event):
    """
    Send an email confirmation to the student after successful registration.
    
    :param registration: dict or Row with 'name', 'email', 'student_id', 'registered_at'
    :param event: dict or Row with 'event_name'/'name', 'date', 'time', 'venue'
    :return: bool indicating whether email sending succeeded or was bypassed in dev/test
    """
    smtp_server = current_app.config.get('SMTP_SERVER')
    smtp_port = current_app.config.get('SMTP_PORT', 587)
    smtp_username = current_app.config.get('SMTP_USERNAME', '').strip()
    smtp_password = current_app.config.get('SMTP_PASSWORD', '').strip()
    smtp_use_tls = current_app.config.get('SMTP_USE_TLS', True)
    sender = current_app.config.get('MAIL_DEFAULT_SENDER', 'EventHub College <no-reply@eventhub.college.edu>')

    recipient_email = registration.get('email', '').strip().lower()
    student_name = registration.get('name', 'Student')
    event_name = event.get('name') or event.get('event_name', 'College Event')
    event_date = event.get('date', '')
    event_time = event.get('time', '')
    event_venue = event.get('venue', '')

    if not recipient_email:
        print("[EMAIL] Error: No recipient email provided.")
        logger.error("[EMAIL] No recipient email provided.")
        return False

    # Check if SMTP is configured or in test mode
    if not smtp_username or not smtp_password or current_app.config.get('TESTING'):
        msg_dev = (
            f"[EMAIL MOCK/DEV] Confirmation email queued for {recipient_email} "
            f"for event '{event_name}' (Date: {event_date}, Time: {event_time}, Venue: {event_venue}). "
            f"(Set SMTP_USERNAME and SMTP_PASSWORD in .env for live delivery)"
        )
        print(msg_dev)
        logger.info(msg_dev)
        return True

    # Construct MIME message
    msg = MIMEMultipart('alternative')
    msg['Subject'] = f"Registration Confirmed: {event_name} — EventHub"
    msg['From'] = sender
    msg['To'] = recipient_email

    # Plain text version
    text_content = f"""Hello {student_name},

Your registration for "{event_name}" has been successfully confirmed!

Event Details:
- Event: {event_name}
- Date: {event_date}
- Time: {event_time}
- Venue: {event_venue}
- Student ID: {registration.get('student_id', 'N/A')}

We look forward to seeing you at the event.

Best regards,
EventHub Team
College Event Management
"""

    # HTML version
    html_content = f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1e293b; background-color: #f8fafc; margin: 0; padding: 24px; }}
    .card {{ max-width: 560px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }}
    .header {{ border-bottom: 2px solid #2563eb; padding-bottom: 16px; margin-bottom: 24px; }}
    .title {{ font-size: 22px; font-weight: 700; color: #2563eb; margin: 0; }}
    .badge {{ display: inline-block; background-color: #ecfdf5; color: #059669; font-weight: 600; font-size: 13px; padding: 4px 12px; border-radius: 9999px; margin-top: 8px; }}
    .detail-row {{ margin: 12px 0; font-size: 14px; }}
    .detail-label {{ font-weight: 600; color: #64748b; display: inline-block; width: 100px; }}
    .detail-value {{ color: #0f172a; font-weight: 500; }}
    .footer {{ margin-top: 32px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; text-align: center; }}
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1 class="title">EventHub Registration Confirmed</h1>
      <span class="badge">✓ Confirmed</span>
    </div>
    <p>Hello <strong>{student_name}</strong>,</p>
    <p>You have successfully registered for <strong>{event_name}</strong>.</p>
    
    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 20px 0;">
      <div class="detail-row"><span class="detail-label">Event:</span> <span class="detail-value">{event_name}</span></div>
      <div class="detail-row"><span class="detail-label">Date:</span> <span class="detail-value">{event_date}</span></div>
      <div class="detail-row"><span class="detail-label">Time:</span> <span class="detail-value">{event_time}</span></div>
      <div class="detail-row"><span class="detail-label">Venue:</span> <span class="detail-value">{event_venue}</span></div>
      <div class="detail-row"><span class="detail-label">Student ID:</span> <span class="detail-value">{registration.get('student_id', 'N/A')}</span></div>
    </div>

    <p>Please present your student ID at the entrance on the day of the event.</p>

    <div class="footer">
      Sent by EventHub — College Event Registration System.<br>
      This is an automated notification, please do not reply directly.
    </div>
  </div>
</body>
</html>"""

    msg.attach(MIMEText(text_content, 'plain'))
    msg.attach(MIMEText(html_content, 'html'))

    try:
        print(f"[EMAIL] Sending confirmation email to {recipient_email}")
        if smtp_port == 465:
            server = smtplib.SMTP_SSL(smtp_server, smtp_port, timeout=10)
        else:
            server = smtplib.SMTP(smtp_server, smtp_port, timeout=10)
            if smtp_use_tls:
                server.starttls()
                
        print(f"[EMAIL] SMTP connection established")
        server.login(smtp_username, smtp_password)
        server.send_message(msg)
        server.quit()
        
        print(f"[EMAIL] Confirmation email sent successfully to {recipient_email}")
        logger.info(f"[EMAIL] Confirmation email sent successfully to {recipient_email}")
        return True
    except Exception as exc:
        print(f"[EMAIL] Failed to send confirmation email to {recipient_email}: {exc}")
        logger.error(f"[EMAIL] Failed to send confirmation email to {recipient_email}: {exc}")
        # Return False to log failure without failing registration HTTP response
        return False
