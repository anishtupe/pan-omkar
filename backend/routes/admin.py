from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models import User
import bcrypt

admin_bp = Blueprint('admin', __name__)

def admin_required(fn):
    from functools import wraps
    @wraps(fn)
    def wrapper(*args, **kwargs):
        uid = get_jwt_identity()
        user = User.query.get(int(uid))
        if not user or user.role != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
        return fn(*args, **kwargs)
    return wrapper

@admin_bp.route('/admin/users', methods=['GET'])
@jwt_required()
@admin_required
def get_users():
    users = User.query.order_by(User.id).all()
    return jsonify([u.to_dict() for u in users])

@admin_bp.route('/admin/users', methods=['POST'])
@jwt_required()
@admin_required
def create_user():
    data = request.get_json()
    if not data.get('email') or not data.get('password') or not data.get('name'):
        return jsonify({'error': 'Name, email and password required'}), 400
    
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already exists'}), 409
    
    hashed = bcrypt.hashpw(data['password'].encode(), bcrypt.gensalt()).decode()
    user = User(
        name=data['name'],
        email=data['email'],
        password=hashed,
        role=data.get('role', 'manager')
    )
    db.session.add(user)
    db.session.commit()
    return jsonify(user.to_dict()), 201

@admin_bp.route('/admin/users/<int:id>', methods=['PUT'])
@jwt_required()
@admin_required
def update_user(id):
    user = User.query.get_or_404(id)
    data = request.get_json()
    if 'name' in data: user.name = data['name']
    if 'role' in data: user.role = data['role']
    if 'email' in data: user.email = data['email']
    if 'password' in data:
        user.password = bcrypt.hashpw(data['password'].encode(), bcrypt.gensalt()).decode()
    db.session.commit()
    return jsonify(user.to_dict())

@admin_bp.route('/admin/users/<int:id>', methods=['DELETE'])
@jwt_required()
@admin_required
def delete_user(id):
    user = User.query.get_or_404(id)
    db.session.delete(user)
    db.session.commit()
    return jsonify({'message': 'User deleted'})
