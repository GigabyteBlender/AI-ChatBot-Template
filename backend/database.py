from flask import Flask, request, jsonify, g
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
import os
import datetime
import uuid
import jwt
import logging
import traceback
import time
from werkzeug.security import generate_password_hash, check_password_hash

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s [%(levelname)s] %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('app.log')
    ]
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
cors = CORS(app, resources={r"/api/*": {"origins": "*"}})

# Configure database
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///chat_app.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev_secret_key_change_in_production')
app.config['DEBUG'] = os.environ.get('FLASK_DEBUG', 'True').lower() in ('true', '1', 't')

db = SQLAlchemy(app)

# Define database models
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(200), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    last_login = db.Column(db.DateTime)
    chats = db.relationship('Chat', backref='owner', lazy=True)
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
        
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class Chat(db.Model):
    id = db.Column(db.String(50), primary_key=True)
    title = db.Column(db.String(200))
    preview = db.Column(db.String(200))
    timestamp = db.Column(db.BigInteger)  # Store as milliseconds since epoch
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    
class Message(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    chat_id = db.Column(db.String(50), db.ForeignKey('chat.id'), nullable=False)
    sender = db.Column(db.String(20), nullable=False)  # 'user' or 'assistant'
    content = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.BigInteger)
    chat = db.relationship('Chat', backref=db.backref('messages', lazy=True, cascade='all, delete-orphan'))

class Setting(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    key = db.Column(db.String(50), nullable=False)
    value = db.Column(db.String(200))
    user = db.relationship('User', backref=db.backref('settings', lazy=True))
    
    __table_args__ = (db.UniqueConstraint('user_id', 'key', name='_user_setting_uc'),)

# Request logging middleware
@app.before_request
def before_request():
    g.start_time = time.time()
    request_data = None
    if request.is_json:
        try:
            request_data = request.get_json()
        except Exception as e:
            request_data = "Invalid JSON"
    
    logger.info(f"REQUEST: {request.method} {request.path}")
    logger.debug(f"REQUEST HEADERS: {dict(request.headers)}")
    if request_data:
        if isinstance(request_data, dict) and 'password' in request_data:
            # Hide sensitive data
            safe_data = request_data.copy()
            safe_data['password'] = '******'
            logger.debug(f"REQUEST BODY: {safe_data}")
        else:
            logger.debug(f"REQUEST BODY: {request_data}")

@app.after_request
def after_request(response):
    try:
        response_data = response.get_json() if response.is_json else None
        duration = time.time() - g.start_time
        status_code = response.status_code
        
        if status_code >= 400:
            log_level = logging.ERROR
        else:
            log_level = logging.INFO
        
        logger.log(log_level, f"RESPONSE: {request.method} {request.path} - Status: {status_code} - Duration: {duration:.2f}s")
        
        if response_data and status_code >= 400:
            logger.error(f"RESPONSE BODY: {response_data}")
    except Exception as e:
        logger.error(f"Error in after_request: {str(e)}")
    
    return response

# Error handlers
@app.errorhandler(400)
def bad_request(error):
    response = jsonify({
        'error': 'Bad Request',
        'message': str(error),
        'status': 400
    })
    response.status_code = 400
    return response

@app.errorhandler(401)
def unauthorized(error):
    response = jsonify({
        'error': 'Unauthorized',
        'message': 'Authentication required or failed',
        'status': 401
    })
    response.status_code = 401
    return response

@app.errorhandler(404)
def not_found(error):
    response = jsonify({
        'error': 'Not Found',
        'message': f"The requested URL {request.path} was not found on the server",
        'status': 404
    })
    response.status_code = 404
    return response

@app.errorhandler(500)
def server_error(error):
    tb = traceback.format_exc()
    logger.error(f"Internal Server Error: {str(error)}\n{tb}")
    response = jsonify({
        'error': 'Internal Server Error',
        'message': str(error) if app.config['DEBUG'] else 'An internal error occurred',
        'status': 500
    })
    response.status_code = 500
    return response

# Create the database tables
with app.app_context():
    db.create_all()

# Authentication helper functions
def generate_token(user_id):
    payload = {
        'exp': datetime.datetime.utcnow() + datetime.timedelta(days=1),
        'iat': datetime.datetime.utcnow(),
        'sub': str(user_id)  # Convert user_id to string
    }
    token = jwt.encode(payload, app.config['SECRET_KEY'], algorithm='HS256')
    # Ensure the token is a string
    if isinstance(token, bytes):
        return token.decode('utf-8')
    return token

def decode_token(token):
    try:
        payload = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
        return int(payload['sub'])  # Convert back to integer if needed
    except jwt.ExpiredSignatureError:
        logger.warning(f"Token expired: {token[:10]}...")
        return None
    except jwt.InvalidTokenError as e:
        logger.warning(f"Invalid token: {token[:10]}... Error: {str(e)}")
        return None

def token_required(f):
    def decorator(*args, **kwargs):
        token = None
        auth_header = request.headers.get('Authorization')
        
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split(" ")[1]
            
        if not token:
            logger.warning(f"No token provided for {request.method} {request.path}")
            return jsonify({'error': 'Unauthorized', 'message': 'Authentication token is missing', 'status': 401}), 401
            
        user_id = decode_token(token)
        if not user_id:
            logger.warning(f"Invalid token provided for {request.method} {request.path}")
            return jsonify({'error': 'Unauthorized', 'message': 'Authentication token is invalid or expired', 'status': 401}), 401
            
        # Check if user exists
        user = User.query.get(user_id)
        if not user:
            logger.warning(f"Token refers to non-existent user ID {user_id}")
            return jsonify({'error': 'Unauthorized', 'message': 'User not found', 'status': 401}), 401
            
        logger.info(f"Authenticated request from user: {user.username} (ID: {user_id})")
        kwargs['user_id'] = user_id
        return f(*args, **kwargs)
        
    decorator.__name__ = f.__name__
    return decorator

@app.route('/api/request-reset', methods=['POST'])
def request_password_reset():
    data = request.get_json()
    
    if not data or not data.get('email'):
        return jsonify({'error': 'Bad Request', 'message': 'Email is required', 'status': 400}), 400
        
    user = User.query.filter_by(email=data['email']).first()
    
    if not user:
        # Don't reveal whether the user exists for security
        logger.info(f"Password reset requested for non-existent email: {data['email']}")
        return jsonify({'message': 'If the email exists, a reset link has been sent'}), 200
    
    logger.info(f"Password reset requested for user: {user.username} (ID: {user.id})")
    # In a real app, you would generate a reset token and send email here
    # For now, we'll just return a success message
    
    return jsonify({'message': 'If the email exists, a reset link has been sent'}), 200

@app.route('/api/reset-password', methods=['POST'])
def reset_password():
    data = request.get_json()
    
    if not data or not data.get('token') or not data.get('password'):
        return jsonify({'error': 'Bad Request', 'message': 'Token and password are required', 'status': 400}), 400
    
    # In a real app, you would validate the token and update the password
    # For now, just return a success message
    
    return jsonify({'message': 'Password has been reset successfully'}), 200

# Routes
@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'Bad Request', 'message': 'No data provided', 'status': 400}), 400
        
    missing_fields = []
    for field in ['username', 'email', 'password']:
        if not data.get(field):
            missing_fields.append(field)
    
    if missing_fields:
        return jsonify({'error': 'Bad Request', 'message': f'Missing required fields: {", ".join(missing_fields)}', 'status': 400}), 400
        
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'error': 'Conflict', 'message': 'Username already exists', 'status': 409}), 409
        
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Conflict', 'message': 'Email already exists', 'status': 409}), 409
        
    try:
        user = User(username=data['username'], email=data['email'])
        user.set_password(data['password'])
        
        db.session.add(user)
        db.session.commit()
        
        # Add default settings
        storage_limit = Setting(user_id=user.id, key='storageLimit', value='10')
        auto_clear = Setting(user_id=user.id, key='autoClear', value='30')
        
        db.session.add(storage_limit)
        db.session.add(auto_clear)
        db.session.commit()
        
        logger.info(f"New user registered: {user.username} (ID: {user.id})")
        return jsonify({'message': 'User registered successfully'}), 201
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error registering user: {str(e)}\n{traceback.format_exc()}")
        return jsonify({'error': 'Internal Server Error', 'message': str(e) if app.config['DEBUG'] else 'Registration failed', 'status': 500}), 500

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'Bad Request', 'message': 'No data provided', 'status': 400}), 400
        
    missing_fields = []
    for field in ['username', 'password']:
        if not data.get(field):
            missing_fields.append(field)
    
    if missing_fields:
        return jsonify({'error': 'Bad Request', 'message': f'Missing required fields: {", ".join(missing_fields)}', 'status': 400}), 400
    
    user = User.query.filter_by(username=data['username']).first()
    
    if not user:
        logger.warning(f"Login attempt with non-existent username: {data['username']}")
        return jsonify({'error': 'Unauthorized', 'message': 'Invalid credentials', 'status': 401}), 401
    
    if not user.check_password(data['password']):
        logger.warning(f"Failed login attempt for user: {user.username} (ID: {user.id})")
        return jsonify({'error': 'Unauthorized', 'message': 'Invalid credentials', 'status': 401}), 401
    
    token = generate_token(user.id)
    
    # Update last login time
    user.last_login = datetime.datetime.utcnow()
    db.session.commit()
    
    logger.info(f"Successful login for user: {user.username} (ID: {user.id})")
    return jsonify({
        'token': token,
        'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email
        }
    }), 200

@app.route('/api/user', methods=['GET'])
@token_required
def get_user_info(**kwargs):
    user_id = kwargs['user_id']  # Retrieve user_id from kwargs
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'Not Found', 'message': 'User not found', 'status': 404}), 404
    
    return jsonify({
        'id': user.id,
        'username': user.username,
        'email': user.email
    }), 200

@app.route('/api/settings', methods=['GET'])
@token_required
def get_settings(**kwargs):
    user_id = kwargs['user_id']  # Retrieve user_id from kwargs
    settings = {}
    for setting in Setting.query.filter_by(user_id=user_id).all():
        settings[setting.key] = setting.value
    
    return jsonify(settings), 200

@app.route('/api/settings', methods=['POST'])
@token_required
def update_settings(**kwargs):
    user_id = kwargs['user_id']
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'Bad Request', 'message': 'No data provided', 'status': 400}), 400
    
    try:
        for key, value in data.items():
            setting = Setting.query.filter_by(user_id=user_id, key=key).first()
            
            if setting:
                setting.value = value
            else:
                setting = Setting(user_id=user_id, key=key, value=value)
                db.session.add(setting)
        
        db.session.commit()
        logger.info(f"Settings updated for user ID: {user_id}")
        return jsonify({'message': 'Settings updated successfully'}), 200
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error updating settings for user ID {user_id}: {str(e)}")
        return jsonify({'error': 'Internal Server Error', 'message': str(e) if app.config['DEBUG'] else 'Failed to update settings', 'status': 500}), 500

@app.route('/api/chats', methods=['GET'])
@token_required
def get_all_chats(**kwargs):
    user_id = kwargs['user_id']  # Retrieve user_id from kwargs
    # Fetch all chats for the user
    chats = Chat.query.filter_by(user_id=user_id).all()
    
    # Convert to the format expected by the frontend
    chat_dict = {}
    for chat in chats:
        chat_dict[chat.id] = {
            'id': chat.id,
            'title': chat.title,
            'timestamp': chat.timestamp,
            'preview': chat.preview
        }
    
    return jsonify(chat_dict), 200

@app.route('/api/chats/sorted', methods=['GET'])
@token_required
def get_all_chats_sorted(**kwargs):
    user_id = kwargs['user_id']  # Retrieve user_id from kwargs
    # Fetch all chats for the user, sorted by timestamp (newest first)
    
    chats = Chat.query.filter_by(user_id=user_id).order_by(Chat.timestamp.desc()).all()
    
    result = []
    for chat in chats:
        # Fetch messages for this chat
        messages = []
        for msg in chat.messages:
            messages.append({
                'sender': msg.sender,
                'content': msg.content,
                'timestamp': msg.timestamp
            })
            
        result.append({
            'id': chat.id,
            'title': chat.title,
            'timestamp': chat.timestamp,
            'preview': chat.preview,
            'messages': messages
        })
    
    return jsonify(result), 200

@app.route('/api/chats/<chat_id>', methods=['GET'])
@token_required
def get_chat(chat_id, **kwargs):
    user_id = kwargs['user_id']
    chat = Chat.query.filter_by(id=chat_id, user_id=user_id).first()
    if not chat:
        logger.warning(f"Chat not found: {chat_id} for user ID: {user_id}")
        return jsonify({'error': 'Not Found', 'message': 'Chat not found', 'status': 404}), 404

    # Fetch messages for this chat
    messages = []
    for msg in chat.messages:
        messages.append({
            'sender': msg.sender,
            'content': msg.content,
            'timestamp': msg.timestamp
        })

    result = {
        'id': chat.id,
        'title': chat.title,
        'timestamp': chat.timestamp,
        'preview': chat.preview,
        'messages': messages
    }

    return jsonify(result), 200

@app.route('/api/chats', methods=['POST'])
@token_required
def save_chat(**kwargs):
    user_id = kwargs['user_id']
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Bad Request', 'message': 'No data provided', 'status': 400}), 400

    missing_fields = []
    for field in ['id', 'title']:
        if not data.get(field):
            missing_fields.append(field)
        if 'messages' not in data:
            missing_fields.append('messages')
        if missing_fields:
            return jsonify({'error': 'Bad Request', 'message': f'Missing required fields: {", ".join(missing_fields)}', 'status': 400}), 400

    try:
        # Check if chat exists
        chat = Chat.query.filter_by(id=data['id'], user_id=user_id).first()

        # Generate preview from messages
        preview = "New chat"
        if data['messages']:
            for msg in data['messages']:
                if msg.get('sender') == 'user':
                    content = msg.get('content', '')
                    preview = content[:27] + '...' if len(content) > 30 else content
                    break

        current_time = int(datetime.datetime.now().timestamp() * 1000)

        if not chat:
            # Create new chat
            chat = Chat(
                id=data['id'],
                title=data['title'],
                timestamp=current_time,
                preview=preview,
                user_id=user_id
            )
            db.session.add(chat)
            logger.info(f"Creating new chat: {data['id']} for user ID: {user_id}")
        else:
            # Update existing chat
            chat.title = data['title']
            chat.timestamp = current_time
            chat.preview = preview

            # Remove old messages
            Message.query.filter_by(chat_id=chat.id).delete()
            logger.info(f"Updating existing chat: {data['id']} for user ID: {user_id}")

        # Add messages
        for msg in data['messages']:
            message = Message(
                chat_id=chat.id,
                sender=msg.get('sender', 'user'),
                content=msg.get('content', ''),
                timestamp=msg.get('timestamp', current_time)
            )
            db.session.add(message)

        db.session.commit()

        # Apply storage limit if necessary
        apply_storage_limit(user_id)

        # Return the chat
        return get_chat(chat_id=chat.id, **kwargs)

    except Exception as e:
        db.session.rollback()
        logger.error(f"Error saving chat for user ID {user_id}: {str(e)}")
        return jsonify({'error': 'Internal Server Error', 'message': str(e) if app.config['DEBUG'] else 'Failed to save chat', 'status': 500}), 500

@app.route('/api/chats/<chat_id>', methods=['DELETE'])
@token_required
def delete_chat(user_id, chat_id):
    chat = Chat.query.filter_by(id=chat_id, user_id=user_id).first()
    
    if not chat:
        logger.warning(f"Attempted to delete non-existent chat: {chat_id} for user ID: {user_id}")
        return jsonify({'error': 'Not Found', 'message': 'Chat not found', 'status': 404}), 404
    
    try:
        db.session.delete(chat)
        db.session.commit()
        logger.info(f"Deleted chat: {chat_id} for user ID: {user_id}")
        return jsonify({'message': 'Chat deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error deleting chat {chat_id} for user ID {user_id}: {str(e)}")
        return jsonify({'error': 'Internal Server Error', 'message': str(e) if app.config['DEBUG'] else 'Failed to delete chat', 'status': 500}), 500

@app.route('/api/chats', methods=['DELETE'])
@token_required
def clear_all_chats(user_id):
    try:
        count = Chat.query.filter_by(user_id=user_id).count()
        Chat.query.filter_by(user_id=user_id).delete()
        db.session.commit()
        logger.info(f"Cleared all chats ({count} total) for user ID: {user_id}")
        return jsonify({'message': 'All chats cleared successfully'}), 200
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error clearing all chats for user ID {user_id}: {str(e)}")
        return jsonify({'error': 'Internal Server Error', 'message': str(e) if app.config['DEBUG'] else 'Failed to clear chats', 'status': 500}), 500

@app.route('/api/generate-chat-id', methods=['GET'])
@token_required
def generate_chat_id(user_id):
    new_id = f"chat_{int(datetime.datetime.now().timestamp() * 1000)}_{uuid.uuid4().hex[:7]}"
    return jsonify({'id': new_id}), 200

# Helper function to manage storage limits
def apply_storage_limit(user_id):
    # Get storage limit setting
    storage_limit_setting = Setting.query.filter_by(user_id=user_id, key='storageLimit').first()
    
    if not storage_limit_setting or not storage_limit_setting.value:
        return
    
    try:
        max_storage_count = int(storage_limit_setting.value)
    except ValueError:
        logger.warning(f"Invalid storage limit value for user ID {user_id}: {storage_limit_setting.value}")
        return
    
    if max_storage_count <= 0:
        return
    
    # Get all chats, sorted by timestamp (newest first)
    chats = Chat.query.filter_by(user_id=user_id).order_by(Chat.timestamp.desc()).all()
    
    # If we have more chats than the limit, delete the oldest ones
    if len(chats) > max_storage_count:
        chats_to_delete = chats[max_storage_count:]
        
        for chat in chats_to_delete:
            db.session.delete(chat)
        
        db.session.commit()
        logger.info(f"Applied storage limit for user ID {user_id}: deleted {len(chats_to_delete)} chats")

# Auto-clear function to run as a scheduled task
def perform_auto_clear():
    with app.app_context():
        # Get all users with auto-clear setting
        settings = Setting.query.filter_by(key='autoClear').all()
        
        for setting in settings:
            try:
                auto_clear_days = int(setting.value)
            except ValueError:
                logger.warning(f"Invalid auto-clear setting for user ID {setting.user_id}: {setting.value}")
                continue
            
            if auto_clear_days <= 0:
                continue
            
            user_id = setting.user_id
            cutoff_time = int((datetime.datetime.now() - datetime.timedelta(days=auto_clear_days)).timestamp() * 1000)
            
            # Delete chats older than the cutoff time
            old_chats = Chat.query.filter(Chat.user_id == user_id, Chat.timestamp < cutoff_time).all()
            
            if old_chats:
                for chat in old_chats:
                    db.session.delete(chat)
                db.session.commit()
                logger.info(f"Auto-cleared {len(old_chats)} old chats for user ID {user_id}")

# Health check endpoint
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'ok',
        'version': '1.0.0',
        'timestamp': int(datetime.datetime.now().timestamp())
    }), 200

if __name__ == '__main__':
    app.run(debug=app.config['DEBUG'], host='0.0.0.0')