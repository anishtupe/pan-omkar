from extensions import db
from datetime import datetime

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), default='manager')  # admin / manager
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'role': self.role,
            'created_at': self.created_at.isoformat()
        }

class Vehicle(db.Model):
    __tablename__ = 'vehicles'
    id = db.Column(db.Integer, primary_key=True)
    type = db.Column(db.String(50), nullable=False)
    capacity = db.Column(db.Float, nullable=False)  # in tons
    driver_name = db.Column(db.String(100), nullable=False)
    status = db.Column(db.String(30), default='Available')  # Available, In Transit, Maintenance
    license_plate = db.Column(db.String(20), unique=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'type': self.type,
            'capacity': self.capacity,
            'driver_name': self.driver_name,
            'status': self.status,
            'license_plate': self.license_plate,
            'created_at': self.created_at.isoformat()
        }

class Route(db.Model):
    __tablename__ = 'routes'
    id = db.Column(db.Integer, primary_key=True)
    origin = db.Column(db.String(100), nullable=False)
    destination = db.Column(db.String(100), nullable=False)
    distance = db.Column(db.Float, nullable=False)  # km
    avg_time = db.Column(db.Float, nullable=False)  # hours
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'origin': self.origin,
            'destination': self.destination,
            'distance': self.distance,
            'avg_time': self.avg_time,
            'created_at': self.created_at.isoformat()
        }

class Shipment(db.Model):
    __tablename__ = 'shipments'
    id = db.Column(db.Integer, primary_key=True)
    tracking_id = db.Column(db.String(20), unique=True, nullable=False)
    origin = db.Column(db.String(100), nullable=False)
    destination = db.Column(db.String(100), nullable=False)
    vehicle_id = db.Column(db.Integer, db.ForeignKey('vehicles.id'), nullable=True)
    driver_name = db.Column(db.String(100))
    weight = db.Column(db.Float, nullable=False)  # tons
    status = db.Column(db.String(30), default='Pending')  # Pending, In Transit, Delivered, Delayed
    expected_delivery_date = db.Column(db.DateTime, nullable=False)
    actual_delivery_date = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    vehicle = db.relationship('Vehicle', backref='shipments', lazy=True)

    def compute_status(self):
        now = datetime.utcnow()
        if self.actual_delivery_date:
            if self.actual_delivery_date > self.expected_delivery_date:
                return 'Delayed'
            return 'Delivered'
        if self.status == 'In Transit' and now > self.expected_delivery_date:
            return 'Delayed'
        return self.status

    def to_dict(self):
        computed = self.compute_status()
        return {
            'id': self.id,
            'tracking_id': self.tracking_id,
            'origin': self.origin,
            'destination': self.destination,
            'vehicle_id': self.vehicle_id,
            'driver_name': self.driver_name,
            'weight': self.weight,
            'status': computed,
            'expected_delivery_date': self.expected_delivery_date.isoformat() if self.expected_delivery_date else None,
            'actual_delivery_date': self.actual_delivery_date.isoformat() if self.actual_delivery_date else None,
            'created_at': self.created_at.isoformat(),
            'vehicle': self.vehicle.to_dict() if self.vehicle else None
        }
