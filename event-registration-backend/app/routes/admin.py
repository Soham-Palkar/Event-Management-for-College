from flask import Blueprint, current_app, jsonify, request

admin_bp = Blueprint('admin', __name__, url_prefix='/api/admin')


@admin_bp.route('/login', methods=['POST'])
def admin_login():
    """Authenticate administrator using configured credentials."""
    data = request.get_json() or {}
    admin_id = str(data.get('adminId') if data.get('adminId') is not None else data.get('admin_id', '')).strip()
    password = str(data.get('password', ''))

    configured_id = current_app.config.get('ADMIN_ID', 'ADMIN001')
    configured_password = current_app.config.get('ADMIN_PASSWORD', 'EventHub@2026')

    if not admin_id or not password:
        return jsonify({
            'code': 'UNAUTHORIZED',
            'error': 'UNAUTHORIZED',
            'message': 'Admin ID and password are required.'
        }), 401

    if admin_id != configured_id or password != configured_password:
        return jsonify({
            'code': 'UNAUTHORIZED',
            'error': 'UNAUTHORIZED',
            'message': 'Invalid admin ID or password.'
        }), 401

    return jsonify({
        'success': True,
        'adminId': admin_id,
        'token': f"admin-session-{admin_id}"
    }), 200
