from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models import Shipment, Vehicle, User
from datetime import datetime
import random, string

shipments_bp = Blueprint('shipments', __name__)

def generate_tracking_id():
    return 'POL' + ''.join(random.choices(string.digits, k=8))

def require_role(*roles):
    from functools import wraps
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            uid = get_jwt_identity()
            user = User.query.get(int(uid))
            if not user or user.role not in roles:
                return jsonify({'error': 'Unauthorized'}), 403
            return fn(*args, **kwargs)
        return wrapper
    return decorator

@shipments_bp.route('/shipments', methods=['GET'])
@jwt_required()
def get_shipments():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    status_filter = request.args.get('status')
    search = request.args.get('search', '')
    
    query = Shipment.query
    if status_filter:
        query = query.filter_by(status=status_filter)
    if search:
        query = query.filter(
            db.or_(
                Shipment.tracking_id.ilike(f'%{search}%'),
                Shipment.origin.ilike(f'%{search}%'),
                Shipment.destination.ilike(f'%{search}%'),
                Shipment.driver_name.ilike(f'%{search}%')
            )
        )
    
    paginated = query.order_by(Shipment.created_at.desc()).paginate(page=page, per_page=per_page, error_out=False)
    return jsonify({
        'shipments': [s.to_dict() for s in paginated.items],
        'total': paginated.total,
        'pages': paginated.pages,
        'current_page': page
    })

@shipments_bp.route('/shipments/<int:id>', methods=['GET'])
@jwt_required()
def get_shipment(id):
    s = Shipment.query.get_or_404(id)
    return jsonify(s.to_dict())

@shipments_bp.route('/shipments', methods=['POST'])
@jwt_required()
def create_shipment():
    data = request.get_json()
    required = ['origin', 'destination', 'weight', 'expected_delivery_date']
    for field in required:
        if not data.get(field):
            return jsonify({'error': f'{field} is required'}), 400
    
    try:
        exp_date = datetime.fromisoformat(data['expected_delivery_date'].replace('Z',''))
    except:
        return jsonify({'error': 'Invalid date format'}), 400
    
    vehicle = None
    if data.get('vehicle_id'):
        vehicle = Vehicle.query.get(data['vehicle_id'])
    
    s = Shipment(
        tracking_id=generate_tracking_id(),
        origin=data['origin'],
        destination=data['destination'],
        vehicle_id=data.get('vehicle_id'),
        driver_name=vehicle.driver_name if vehicle else data.get('driver_name', ''),
        weight=float(data['weight']),
        status=data.get('status', 'Pending'),
        expected_delivery_date=exp_date,
        actual_delivery_date=datetime.fromisoformat(data['actual_delivery_date'].replace('Z','')) if data.get('actual_delivery_date') else None
    )
    db.session.add(s)
    db.session.commit()
    return jsonify(s.to_dict()), 201

@shipments_bp.route('/shipments/<int:id>', methods=['PUT'])
@jwt_required()
def update_shipment(id):
    s = Shipment.query.get_or_404(id)
    data = request.get_json()
    
    if 'origin' in data: s.origin = data['origin']
    if 'destination' in data: s.destination = data['destination']
    if 'weight' in data: s.weight = float(data['weight'])
    if 'driver_name' in data: s.driver_name = data['driver_name']
    if 'vehicle_id' in data: s.vehicle_id = data['vehicle_id']
    if 'status' in data: s.status = data['status']
    if 'expected_delivery_date' in data:
        try:
            s.expected_delivery_date = datetime.fromisoformat(data['expected_delivery_date'].replace('Z',''))
        except: pass
    if 'actual_delivery_date' in data:
        try:
            s.actual_delivery_date = datetime.fromisoformat(data['actual_delivery_date'].replace('Z','')) if data['actual_delivery_date'] else None
        except: pass
    
    # Auto-detect delay
    if s.actual_delivery_date and s.actual_delivery_date > s.expected_delivery_date:
        s.status = 'Delayed'
    elif s.actual_delivery_date:
        s.status = 'Delivered'
    
    db.session.commit()
    return jsonify(s.to_dict())

@shipments_bp.route('/shipments/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_shipment(id):
    s = Shipment.query.get_or_404(id)
    db.session.delete(s)
    db.session.commit()
    return jsonify({'message': 'Shipment deleted'})
