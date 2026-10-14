
import logging
import resend
from flask import current_app
from markupsafe import escape

logger = logging.getLogger(__name__)


def send_registration_confirmation(registration, event):
    """
    Send an event registration confirmation using the Resend API.

    Returns True if the email is accepted by Resend or bypassed in test mode.
    Returns False if sending fails. Registration itself should remain successful.
    """

    recipient_email = (
        registration.get("email") or ""
    ).strip().lower()

    student_name = registration.get("name") or "Student"
    event_name = event.get("name") or event.get("event_name") or "College Event"
    event_date = event.get("date") or "To be announced"
    event_time = event.get("time") or "To be announced"
    event_venue = event.get("venue") or "To be announced"
    student_id = registration.get("student_id") or "N/A"

    if not recipient_email:
        logger.error("[EMAIL] No recipient email provided.")
        return False

    # Do not send real emails during tests.
    if current_app.config.get("TESTING"):
        logger.info("[EMAIL MOCK/TEST] Confirmation email skipped.")
        return True

    api_key = (
        current_app.config.get("RESEND_API_KEY")
        or ""
    ).strip()

    sender = (
        current_app.config.get("MAIL_DEFAULT_SENDER")
        or "EventHub <onboarding@resend.dev>"
    ).strip()

    if not api_key:
        logger.error("[EMAIL] RESEND_API_KEY is not configured.")
        return False

    # Plain-text email
    text_content = f"""Hello {student_name},

Your registration for "{event_name}" has been successfully confirmed!

Event Details:
- Event: {event_name}
- Date: {event_date}
- Time: {event_time}
- Venue: {event_venue}
- Student ID: {student_id}

We look forward to seeing you at the event.

Best regards,
EventHub Team
College Event Management
"""

    # Escape dynamic values before inserting them into HTML.
    safe_name = escape(str(student_name))
    safe_event = escape(str(event_name))
    safe_date = escape(str(event_date))
    safe_time = escape(str(event_time))
    safe_venue = escape(str(event_venue))
    safe_student_id = escape(str(student_id))

    # HTML confirmation email
    html_content = f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {{
      font-family: Arial, Helvetica, sans-serif;
      line-height: 1.6;
      color: #1e293b;
      background-color: #f8fafc;
      margin: 0;
      padding: 24px;
    }}
    .card {{
      max-width: 560px;
      margin: 0 auto;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 32px;
    }}
    .header {{
      border-bottom: 2px solid #2563eb;
      padding-bottom: 16px;
      margin-bottom: 24px;
    }}
    .title {{
      font-size: 22px;
      font-weight: 700;
      color: #2563eb;
      margin: 0;
    }}
    .badge {{
      display: inline-block;
      background: #ecfdf5;
      color: #059669;
      font-weight: 600;
      font-size: 13px;
      padding: 4px 12px;
      border-radius: 9999px;
      margin-top: 8px;
    }}
    .detail-row {{
      margin: 12px 0;
      font-size: 14px;
    }}
    .detail-label {{
      font-weight: 600;
      color: #64748b;
      display: inline-block;
      width: 100px;
    }}
    .detail-value {{
      color: #0f172a;
      font-weight: 500;
    }}
    .footer {{
      margin-top: 32px;
      padding-top: 16px;
      border-top: 1px solid #e2e8f0;
      font-size: 12px;
      color: #64748b;
      text-align: center;
    }}
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1 class="title">EventHub Registration Confirmed</h1>
      <span class="badge">&#10003; Confirmed</span>
    </div>

    <p>Hello <strong>{safe_name}</strong>,</p>
    <p>You have successfully registered for
       <strong>{safe_event}</strong>.</p>

    <div style="background:#f8fafc;border:1px solid #e2e8f0;
                border-radius:8px;padding:16px;margin:20px 0;">
      <div class="detail-row">
        <span class="detail-label">Event:</span>
        <span class="detail-value">{safe_event}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Date:</span>
        <span class="detail-value">{safe_date}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Time:</span>
        <span class="detail-value">{safe_time}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Venue:</span>
        <span class="detail-value">{safe_venue}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Student ID:</span>
        <span class="detail-value">{safe_student_id}</span>
      </div>
    </div>

    <p>Please present your student ID at the entrance on the event day.</p>

    <div class="footer">
      Sent by EventHub — College Event Registration System.<br>
      This is an automated notification; please do not reply directly.
    </div>
  </div>
</body>
</html>"""

    try:
        resend.api_key = api_key

        logger.info("[EMAIL] Sending confirmation email through Resend.")

        response = resend.Emails.send({
            "from": sender,
            "to": [recipient_email],
            "subject": f"Registration Confirmed: {event_name} — EventHub",
            "text": text_content,
            "html": html_content,
        })

        # Resend normally returns an object containing the email ID.
        response_id = (
            response.get("id")
            if isinstance(response, dict)
            else getattr(response, "id", None)
        )

        if not response_id:
            logger.error("[EMAIL] Resend returned no email ID.")
            return False

        logger.info("[EMAIL] Email accepted by Resend. ID: %s", response_id)
        return True

    except Exception:
        # Avoid logging secrets or full request details.
        logger.exception("[EMAIL] Resend request failed.")
        return False
