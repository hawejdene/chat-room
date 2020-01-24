from flask import Flask
from flask_login import LoginManager
from flask_socketio import SocketIO
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
app.secret_key = 'secret key'
app.config['WTF_CSRF_SECRET_KEY'] = 'random key for form'
app.config['LDAP_PROVIDER_URL'] = 'ldap://192.168.56.101:389/'
app.config['LDAP_PROTOCOL_VERSION'] = 3
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgres://fjedpepfinlzgy:6e0e0d75e3690e3b1cd54e1558e1627606f47af3c2992259118c165e48a3a9d4@ec2-54-228-246-214.eu-west-1.compute.amazonaws.com:5432/dsi1kies30mst'

db = SQLAlchemy(app)


# configure login
login = LoginManager(app)
login.init_app(app)
login.login_view = 'login'

db.create_all()
