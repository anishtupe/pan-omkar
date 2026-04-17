from flask import Blueprint, jsonify, Response
from flask_jwt_extended import jwt_required
from models import Shipment
import csv, io

reports_bp = Blueprint('reports', __name__)

@reports_bp.route('/reports', methods=['GET'])
@jwt_required()
def get_reports():
    shipments = Shipment.query.order_by(Shipment.created_at.desc()).all()
    report_data = []
    for s in shipments:
        d = s.to_dict()
        report_data.append({
            'tracking_id': d['tracking_id'],
            'origin': d['origin'],
            'destination': d['destination'],
            'driver_name': d['driver_name'],
            'weight': d['weight'],
            'status': d['status'],
            'expected_delivery_date': d['expected_delivery_date'],
            'actual_delivery_date': d['actual_delivery_date'],
            'created_at': d['created_at']
        })
    return jsonify({'reports': report_data, 'total': len(report_data)})

@reports_bp.route('/reports/export', methods=['GET'])
@jwt_required()
def export_reports():
    shipments = Shipment.query.order_by(Shipment.created_at.desc()).all()
    
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(['Tracking ID', 'Origin', 'Destination', 'Driver', 'Weight (tons)',
                     'Status', 'Expected Delivery', 'Actual Delivery', 'Created At'])
    
    for s in shipments:
        d = s.to_dict()
        writer.writerow([
            d['tracking_id'], d['origin'], d['destination'], d['driver_name'],
            d['weight'], d['status'], d['expected_delivery_date'],
            d['actual_delivery_date'] or '', d['created_at']
        ])
    
    output.seek(0)
    return Response(
        output.getvalue(),
        mimetype='text/csv',
        headers={'Content-Disposition': 'attachment; filename=pan_omkar_report.csv'}
    )
