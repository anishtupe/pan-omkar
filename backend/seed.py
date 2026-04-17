from extensions import db
from models import User, Vehicle, Route, Shipment
from datetime import datetime, timedelta
import bcrypt
import random
import string

CITIES = [
    "Mumbai", "Delhi", "Bangalore", "Chennai", "Kolkata",
    "Hyderabad", "Pune", "Ahmedabad", "Jaipur", "Surat",
    "Lucknow", "Kanpur", "Nagpur", "Indore", "Bhopal",
    "Visakhapatnam", "Vadodara", "Patna", "Ludhiana", "Agra"
]

VEHICLE_TYPES = ["Truck", "Mini Truck", "Container", "Tanker", "Flatbed", "Refrigerated"]
DRIVERS = [
    "Rajesh Kumar", "Suresh Patel", "Amit Shah", "Vijay Singh", "Ravi Verma",
    "Manoj Tiwari", "Dinesh Yadav", "Prakash Gupta", "Anil Sharma", "Sanjay Mishra"
]

def generate_tracking_id():
    return 'POL' + ''.join(random.choices(string.digits, k=8))

def seed_database():
    # Only seed if DB is empty
    if User.query.first():
        return

    print("Seeding database...")

    # --- USERS ---
    admin_pw = bcrypt.hashpw('admin123'.encode(), bcrypt.gensalt()).decode()
    manager_pw = bcrypt.hashpw('manager123'.encode(), bcrypt.gensalt()).decode()

    users = [
        User(name='Admin User', email='admin@panomkar.com', password=admin_pw, role='admin'),
        User(name='Priya Manager', email='manager@panomkar.com', password=manager_pw, role='manager'),
        User(name='Rahul Logistics', email='rahul@panomkar.com', password=manager_pw, role='manager'),
    ]
    db.session.add_all(users)
    db.session.commit()

    # --- VEHICLES ---
    vehicles = []
    plates = set()
    statuses = ['Available', 'In Transit', 'Maintenance']
    for i in range(10):
        plate = f"MH{random.randint(10,99)}{''.join(random.choices(string.ascii_uppercase,k=2))}{random.randint(1000,9999)}"
        while plate in plates:
            plate = f"MH{random.randint(10,99)}{''.join(random.choices(string.ascii_uppercase,k=2))}{random.randint(1000,9999)}"
        plates.add(plate)
        v = Vehicle(
            type=random.choice(VEHICLE_TYPES),
            capacity=round(random.uniform(2.0, 30.0), 1),
            driver_name=DRIVERS[i % len(DRIVERS)],
            status=statuses[i % 3],
            license_plate=plate
        )
        vehicles.append(v)
    db.session.add_all(vehicles)
    db.session.commit()

    # --- ROUTES ---
    routes = []
    seen_routes = set()
    while len(routes) < 15:
        o = random.choice(CITIES)
        d = random.choice(CITIES)
        if o == d or (o, d) in seen_routes:
            continue
        seen_routes.add((o, d))
        dist = round(random.uniform(100, 2000), 1)
        r = Route(
            origin=o,
            destination=d,
            distance=dist,
            avg_time=round(dist / random.uniform(40, 70), 1)
        )
        routes.append(r)
    db.session.add_all(routes)
    db.session.commit()

    # --- SHIPMENTS ---
    vehicle_list = Vehicle.query.all()
    shipments = []
    for i in range(50):
        o = random.choice(CITIES)
        d = random.choice([c for c in CITIES if c != o])
        created = datetime.utcnow() - timedelta(days=random.randint(1, 60))
        expected = created + timedelta(days=random.randint(2, 10))
        
        status_roll = random.random()
        if status_roll < 0.35:
            status = 'Delivered'
            actual = expected - timedelta(hours=random.randint(-24, 48))
        elif status_roll < 0.65:
            status = 'In Transit'
            actual = None
        elif status_roll < 0.80:
            status = 'Delayed'
            actual = None
            expected = datetime.utcnow() - timedelta(days=random.randint(1, 5))
        else:
            status = 'Pending'
            actual = None

        v = random.choice(vehicle_list)
        s = Shipment(
            tracking_id=generate_tracking_id(),
            origin=o,
            destination=d,
            vehicle_id=v.id,
            driver_name=v.driver_name,
            weight=round(random.uniform(0.5, 25.0), 2),
            status=status,
            expected_delivery_date=expected,
            actual_delivery_date=actual,
            created_at=created
        )
        shipments.append(s)
    db.session.add_all(shipments)
    db.session.commit()

    print("Seeding complete! 3 users, 10 vehicles, 15 routes, 50 shipments created.")
    print("Admin login: admin@panomkar.com / admin123")
    print("Manager login: manager@panomkar.com / manager123")
