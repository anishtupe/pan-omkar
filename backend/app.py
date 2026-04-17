from flask import Flask
from flask_cors import CORS
from extensions import db, jwt
from routes.auth import auth_bp
from routes.shipments import shipments_bp
from routes.vehicles import vehicles_bp
from routes.routes_api import routes_bp
from routes.analytics import analytics_bp
from routes.reports import reports_bp
from routes.admin import admin_bp
from seed import seed_database
import os

def create_app():
    app = Flask(__name__)
    
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///pan_omkar.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_SECRET_KEY'] = 'pan-omkar-super-secret-key-2024'
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = False
    
    CORS(app, origins=["http://localhost:3000"], supports_credentials=True)
    
    db.init_app(app)
    jwt.init_app(app)
    
    app.register_blueprint(auth_bp, url_prefix='/api')
    app.register_blueprint(shipments_bp, url_prefix='/api')
    app.register_blueprint(vehicles_bp, url_prefix='/api')
    app.register_blueprint(routes_bp, url_prefix='/api')
    app.register_blueprint(analytics_bp, url_prefix='/api')
    app.register_blueprint(reports_bp, url_prefix='/api')
    app.register_blueprint(admin_bp, url_prefix='/api')
    
    with app.app_context():
        db.create_all()
        seed_database()
    
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, port=5000)
