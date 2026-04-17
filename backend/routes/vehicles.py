from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from extensions import db
from models import Vehicle

vehicles_bp = Blueprint('vehicles', __name__)

@vehicles_bp.route('/vehicles', methods=['GET'])
@jwt_required()
def get_vehicles():
    vehicles = Vehicle.query.order_by(Vehicle.id).all()
    return jsonify([v.to_dict() for v in vehicles])

@vehicles_bp.route('/vehicles/<int:id>', methods=['GET'])
@jwt_required()
def get_vehicle(id):
    v = Vehicle.query.get_or_404(id)
    return jsonify(v.to_dict())

@vehicles_bp.route('/vehicles', methods=['POST'])
@jwt_required()
def create_vehicle():
    data = request.get_json()
    required = ['type', 'capacity', 'driver_name']
    for field in required:
        if not data.get(field):
            return jsonify({'error': f'{field} is required'}), 400
    
    if data.get('license_plate') and Vehicle.query.filter_by(license_plate=data['license_plate']).first():
        return jsonify({'error': 'License plate already exists'}), 409
    
    v = Vehicle(
        type=data['type'],
        capacity=float(data['capacity']),
        driver_name=data['driver_name'],
        status=data.get('status', 'Available'),
        license_plate=data.get('license_plate', '')
    )
    db.session.add(v)
    db.session.commit()
    return jsonify(v.to_dict()), 201

@vehicles_bp.route('/vehicles/<int:id>', methods=['PUT'])
@jwt_required()
def update_vehicle(id):
    v = Vehicle.query.get_or_404(id)
    data = request.get_json()
    
    if 'type' in data: v.type = data['type']
    if 'capacity' in data: v.capacity = float(data['capacity'])
    if 'driver_name' in data: v.driver_name = data['driver_name']
    if 'status' in data: v.status = data['status']
    if 'license_plate' in data: v.license_plate = data['license_plate']
    
    db.session.commit()
    return jsonify(v.to_dict())

@vehicles_bp.route('/vehicles/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_vehicle(id):
    v = Vehicle.query.get_or_404(id)
    db.session.delete(v)
    db.session.commit()
    return jsonify({'message': 'Vehicle deleted'})
