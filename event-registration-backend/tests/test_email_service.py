from unittest.mock import MagicMock, patch
from app.services.email_service import send_registration_confirmation


def test_email_service_sends_formatted_email_via_smtp(app):
    """Test send_registration_confirmation creates correct MIME message with student and event info."""
    with app.app_context():
        # Temporarily enable mock SMTP credentials to test SMTP transport path
        app.config['TESTING'] = False
        app.config['SMTP_USERNAME'] = 'user@example.com'
        app.config['SMTP_PASSWORD'] = 'secret-app-pwd'
        app.config['SMTP_SERVER'] = 'smtp.example.com'
        app.config['SMTP_PORT'] = 587
        app.config['SMTP_USE_TLS'] = True

        registration = {
            'name': 'Sarah Connor',
            'email': 'sarah@college.edu',
            'student_id': 'CS2026-99',
            'registered_at': '2026-10-01T12:00:00Z'
        }
        event = {
            'event_name': 'AI & Robotics Symposium',
            'date': '2026-11-15',
            'time': '10:00 AM',
            'venue': 'Tech Hall 1'
        }

        with patch('smtplib.SMTP') as mock_smtp:
            instance = MagicMock()
            mock_smtp.return_value = instance

            success = send_registration_confirmation(registration, event)

            assert success is True
            mock_smtp.assert_called_once_with('smtp.example.com', 587, timeout=10)
            instance.starttls.assert_called_once()
            instance.login.assert_called_once_with('user@example.com', 'secret-app-pwd')
            instance.send_message.assert_called_once()
            instance.quit.assert_called_once()

            # Verify message contents
            sent_msg = instance.send_message.call_args[0][0]
            assert sent_msg['To'] == 'sarah@college.edu'
            assert 'AI & Robotics Symposium' in sent_msg['Subject']


def test_email_service_catches_smtp_exception(app):
    """Test send_registration_confirmation catches SMTP exceptions cleanly and returns False."""
    with app.app_context():
        app.config['TESTING'] = False
        app.config['SMTP_USERNAME'] = 'user@example.com'
        app.config['SMTP_PASSWORD'] = 'bad-pwd'

        registration = {
            'name': 'Error Tester',
            'email': 'err@college.edu',
            'student_id': 'ERR01'
        }
        event = {
            'name': 'Crash Event',
            'date': '2026-12-01',
            'time': '01:00 PM',
            'venue': 'Room 101'
        }

        with patch('smtplib.SMTP') as mock_smtp:
            mock_smtp.side_effect = Exception("Authentication failed 535-5.7.8")

            success = send_registration_confirmation(registration, event)
            assert success is False


def test_email_service_mock_when_credentials_empty(app):
    """Test send_registration_confirmation queues/bypasses safely when credentials are blank."""
    with app.app_context():
        app.config['TESTING'] = False
        app.config['SMTP_USERNAME'] = ''
        app.config['SMTP_PASSWORD'] = ''

        registration = {'name': 'Dev Mode', 'email': 'dev@college.edu'}
        event = {'event_name': 'Dev Event', 'date': '2026-10-10', 'time': '10:00 AM', 'venue': 'Main Lab'}

        success = send_registration_confirmation(registration, event)
        assert success is True
