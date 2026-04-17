from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from extensions import db
from models import Route

routes_bp = Blueprint('routes_api', __name__)

@routes_bp.route('/routes', methods=['GET'])
@jwt_required()
def get_routes():
    routes = Route.query.order_by(Route.id).all()
    return jsonify([r.to_dict() for r in routes])

@routes_bp.route('/routes/<int:id>', methods=['GET'])
@jwt_required()
def get_route(id):
    r = Route.query.get_or_404(id)
    return jsonify(r.to_dict())

@routes_bp.route('/routes', methods=['POST'])
@jwt_required()
def create_route():
    data = request.get_json()
    required = ['origin', 'destination', 'distance', 'avg_time']
    for field in required:
        if data.get(field) is None:
            return jsonify({'error': f'{field} is required'}), 400
    
    r = Route(
        origin=data['origin'],
        destination=data['destination'],
        distance=float(data['distance']),
        avg_time=float(data['avg_time'])
    )
    db.session.add(r)
    db.session.commit()
    return jsonify(r.to_dict()), 201

@routes_bp.route('/routes/<int:id>', methods=['PUT'])
@jwt_required()
def update_route(id):
    r = Route.query.get_or_404(id)
    data = request.get_json()
    if 'origin' in data: r.origin = data['origin']
    if 'destination' in data: r.destination = data['destination']
    if 'distance' in data: r.distance = float(data['distance'])
    if 'avg_time' in data: r.avg_time = float(data['avg_time'])
    db.session.commit()
    return jsonify(r.to_dict())

@routes_bp.route('/routes/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_route(id):
    r = Route.query.get_or_404(id)
    db.session.delete(r)
    db.session.commit()
    return jsonify({'message': 'Route deleted'})
