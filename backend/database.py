from flask import Flask, request, jsonify # type: ignore
from flask_cors import CORS # type: ignore
from flask_sqlalchemy import SQLAlchemy # type: ignore
import os
import datetime
import uuid
import jwt # type: ignore
from werkzeug.security import generate_password_hash, check_password_hash # type: ignore

app = Flask(__name__)
CORS(app)

# Configure database
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///chat_app.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev_secret_key_change_in_production')

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

# Create the database tables
with app.app_context():
    db.create_all()

# Authentication helper functions
def generate_token(user_id):
    payload = {
        'exp': datetime.datetime.utcnow() + datetime.timedelta(days=1),
        'iat': datetime.datetime.utcnow(),
        'sub': user_id
    }
    return jwt.encode(payload, app.config['SECRET_KEY'], algorithm='HS256')

def decode_token(token):
    try:
        payload = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
        return payload['sub']
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

def token_required(f):
    def decorator(*args, **kwargs):
        token = None
        auth_header = request.headers.get('Authorization')
        
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split(" ")[1]
            
        if not token:
            return jsonify({'message': 'Token is missing'}), 401
            
        user_id = decode_token(token)
        if not user_id:
            return jsonify({'message': 'Token is invalid or expired'}), 401
            
        kwargs['user_id'] = user_id
        return f(*args, **kwargs)
        
    decorator.__name__ = f.__name__
    return decorator

# Routes
@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    
    if not data or not data.get('username') or not data.get('email') or not data.get('password'):
        return jsonify({'message': 'Missing required fields'}), 400
        
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'message': 'Username already exists'}), 409
        
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'message': 'Email already exists'}), 409
        
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
    
    return jsonify({'message': 'User registered successfully'}), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    
    if not data or not data.get('username') or not data.get('password'):
        return jsonify({'message': 'Missing required fields'}), 400
    
    user = User.query.filter_by(username=data['username']).first()
    
    if not user or not user.check_password(data['password']):
        return jsonify({'message': 'Invalid credentials'}), 401
    
    token = generate_token(user.id)
    
    # Update last login time
    user.last_login = datetime.datetime.utcnow()
    db.session.commit()
    
    return jsonify({
        'token': token,
        'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email
        }
    }), 200

@app.route('/api/settings', methods=['GET'])
@token_required
def get_settings(user_id):
    settings = {}
    for setting in Setting.query.filter_by(user_id=user_id).all():
        settings[setting.key] = setting.value
    
    return jsonify(settings), 200

@app.route('/api/settings', methods=['POST'])
@token_required
def update_settings(user_id):
    data = request.get_json()
    
    for key, value in data.items():
        setting = Setting.query.filter_by(user_id=user_id, key=key).first()
        
        if setting:
            setting.value = value
        else:
            setting = Setting(user_id=user_id, key=key, value=value)
            db.session.add(setting)
    
    db.session.commit()
    
    return jsonify({'message': 'Settings updated successfully'}), 200

@app.route('/api/chats', methods=['GET'])
@token_required
def get_all_chats(user_id):
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
def get_all_chats_sorted(user_id):
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
def get_chat(user_id, chat_id):
    chat = Chat.query.filter_by(id=chat_id, user_id=user_id).first()
    
    if not chat:
        return jsonify({'message': 'Chat not found'}), 404
    
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
def save_chat(user_id):
    data = request.get_json()
    
    if not data or not data.get('id') or not data.get('title') or 'messages' not in data:
        return jsonify({'message': 'Missing required fields'}), 400
    
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
    
    if not chat:
        # Create new chat
        chat = Chat(
            id=data['id'],
            title=data['title'],
            timestamp=int(datetime.datetime.now().timestamp() * 1000),
            preview=preview,
            user_id=user_id
        )
        db.session.add(chat)
    else:
        # Update existing chat
        chat.title = data['title']
        chat.timestamp = int(datetime.datetime.now().timestamp() * 1000)
        chat.preview = preview
        
        # Remove old messages
        Message.query.filter_by(chat_id=chat.id).delete()
    
    # Add messages
    for msg in data['messages']:
        message = Message(
            chat_id=chat.id,
            sender=msg.get('sender', 'user'),
            content=msg.get('content', ''),
            timestamp=msg.get('timestamp', int(datetime.datetime.now().timestamp() * 1000))
        )
        db.session.add(message)
    
    db.session.commit()
    
    # Apply storage limit if necessary
    apply_storage_limit(user_id)
    
    # Return the saved chat
    return get_chat(user_id, chat.id)

@app.route('/api/chats/<chat_id>', methods=['DELETE'])
@token_required
def delete_chat(user_id, chat_id):
    chat = Chat.query.filter_by(id=chat_id, user_id=user_id).first()
    
    if not chat:
        return jsonify({'message': 'Chat not found'}), 404
    
    db.session.delete(chat)
    db.session.commit()
    
    return jsonify({'message': 'Chat deleted successfully'}), 200

@app.route('/api/chats', methods=['DELETE'])
@token_required
def clear_all_chats(user_id):
    Chat.query.filter_by(user_id=user_id).delete()
    db.session.commit()
    
    return jsonify({'message': 'All chats cleared successfully'}), 200

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

# Auto-clear function to run as a scheduled task
def perform_auto_clear():
    with app.app_context():
        # Get all users with auto-clear setting
        settings = Setting.query.filter_by(key='autoClear').all()
        
        for setting in settings:
            try:
                auto_clear_days = int(setting.value)
            except ValueError:
                continue
            
            if auto_clear_days <= 0:
                continue
            
            user_id = setting.user_id
            cutoff_time = int((datetime.datetime.now() - datetime.timedelta(days=auto_clear_days)).timestamp() * 1000)
            
            # Delete chats older than the cutoff time
            old_chats = Chat.query.filter(Chat.user_id == user_id, Chat.timestamp < cutoff_time).all()
            
            for chat in old_chats:
                db.session.delete(chat)
            
            if old_chats:
                db.session.commit()

if __name__ == '__main__':
    app.run(debug=False, host='0.0.0.0')