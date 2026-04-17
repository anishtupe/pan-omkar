from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from models import Shipment, Vehicle, Route
from extensions import db
from datetime import datetime
from sqlalchemy import func

analytics_bp = Blueprint('analytics', __name__)

@analytics_bp.route('/analytics', methods=['GET'])
@jwt_required()
def get_analytics():
    all_shipments = Shipment.query.all()
    
    total = len(all_shipments)
    delivered = sum(1 for s in all_shipments if s.compute_status() == 'Delivered')
    in_transit = sum(1 for s in all_shipments if s.compute_status() == 'In Transit')
    delayed = sum(1 for s in all_shipments if s.compute_status() == 'Delayed')
    pending = sum(1 for s in all_shipments if s.compute_status() == 'Pending')
    
    # Avg delivery time (days) for delivered shipments
    delivery_times = []
    for s in all_shipments:
        if s.actual_delivery_date and s.created_at:
            delta = (s.actual_delivery_date - s.created_at).total_seconds() / 86400
            delivery_times.append(delta)
    avg_delivery_time = round(sum(delivery_times) / len(delivery_times), 2) if delivery_times else 0
    
    # Vehicle utilization
    total_vehicles = Vehicle.query.count()
    in_use = Vehicle.query.filter_by(status='In Transit').count()
    vehicle_utilization = round((in_use / total_vehicles * 100), 1) if total_vehicles else 0
    
    # Top routes by shipment count
    route_counts = {}
    for s in all_shipments:
        key = f"{s.origin} → {s.destination}"
        route_counts[key] = route_counts.get(key, 0) + 1
    top_routes = sorted(route_counts.items(), key=lambda x: x[1], reverse=True)[:5]
    top_routes = [{'route': k, 'count': v} for k, v in top_routes]
    
    # Monthly shipment trends (last 6 months)
    from collections import defaultdict
    monthly = defaultdict(lambda: {'total': 0, 'delivered': 0, 'delayed': 0})
    for s in all_shipments:
        month = s.created_at.strftime('%b %Y')
        monthly[month]['total'] += 1
        status = s.compute_status()
        if status == 'Delivered':
            monthly[month]['delivered'] += 1
        elif status == 'Delayed':
            monthly[month]['delayed'] += 1
    
    # Sort by date
    from datetime import datetime
    def month_key(m):
        try:
            return datetime.strptime(m, '%b %Y')
        except:
            return datetime.min
    
    sorted_months = sorted(monthly.keys(), key=month_key)[-6:]
    trends = [{'month': m, **monthly[m]} for m in sorted_months]
    
    # Status breakdown for pie chart
    status_breakdown = [
        {'label': 'Delivered', 'value': delivered, 'color': '#10b981'},
        {'label': 'In Transit', 'value': in_transit, 'color': '#3b82f6'},
        {'label': 'Delayed', 'value': delayed, 'color': '#ef4444'},
        {'label': 'Pending', 'value': pending, 'color': '#f59e0b'},
    ]
    
    return jsonify({
        'total_shipments': total,
        'delivered': delivered,
        'in_transit': in_transit,
        'delayed': delayed,
        'pending': pending,
        'avg_delivery_time': avg_delivery_time,
        'vehicle_utilization': vehicle_utilization,
        'top_routes': top_routes,
        'trends': trends,
        'status_breakdown': status_breakdown
    })
