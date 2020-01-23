from flask import Flask, render_template, redirect, url_for, flash, request
from flask_login import login_user, current_user, login_required, logout_user
from flask_sqlalchemy import SQLAlchemy
from passlib.hash import pbkdf2_sha256

from ca import generateSelfSignedCertif, signRequestCSR
from models import User
from wtform_fields import *
from flask_login import LoginManager, login_user
from flask_socketio import SocketIO, send, emit, join_room, leave_room
from time import localtime, strftime, time

app = Flask(__name__)
app.secret_key = 'secret key'

app.config[
    'SQLALCHEMY_DATABASE_URI'] = 'postgres://fjedpepfinlzgy:6e0e0d75e3690e3b1cd54e1558e1627606f47af3c2992259118c165e48a3a9d4@ec2-54-228-246-214.eu-west-1.compute.amazonaws.com:5432/dsi1kies30mst'

db = SQLAlchemy(app)

# initialze flask socketIo
socketio = SocketIO(app)
clients = []
rooms = []
messages = {}
# configure login
login = LoginManager(app)
login.init_app(app)


@login.user_loader
def load_user(id):
    return User.query.get(int(id))


@app.route("/register", methods=['GET', 'POST'])
def register():
    reg_form = RegistrationForm()
    if reg_form.username.data and reg_form.password.data and reg_form.request.data:
        username = reg_form.username.data
        password = reg_form.password.data
        # hask passwd
        hashed_pswd = pbkdf2_sha256.hash(password)

        # sign certification
        print(reg_form.request.data)
        with open("E:\\GL4\\my_keys\\demande_"+username+".pem", "wb") as f:
            f.write(bytes(reg_form.request.data, 'utf-8'))
        certification = signRequestCSR(username)


        # add user to db
        user = User(username=username, password=hashed_pswd)
        db.session.add(user)
        db.session.commit()

        # add user to ldap

        flash('register wish success, please login', 'success')
        login_form = LoginForm()
        return render_template("login.html", form=login_form, certification=certification)
    return render_template("index.html", form=reg_form)


@app.route("/login", methods=['GET', 'POST'])
def login():
    login_form = LoginForm()

    # Allow login if validation success
    if login_form.validate_on_submit():
        user_object = User.query.filter_by(username=login_form.username.data).first()
        login_user(user_object)
        return redirect(url_for('chat'))

    return render_template("login.html", form=login_form)


@app.route("/chat", methods=['GET', 'POST'])
def chat():
    if not current_user.is_authenticated:
        flash(' please login', 'danger')
        # return redirect(url_for('login'))
    return render_template("chat.html", username=current_user.username, clients=clients)


@app.route("/logout", methods=['GET', 'POST'])
def logout():
    logout_user()
    flash('You have logged out successfully', 'success')
    return redirect(url_for('login'))


@socketio.on('connect-user')
def connect(data):
    username = data["username"]
    room = data["room"]
    join_room(room)
    if username not in clients:
        clients.append(username)
    # Broadcast that new user has joined
    print(data['req'])
    with open("E:\\GL4\\my_keys\\demande.pem", "wb") as f:
         f.write(bytes(data['req'], 'utf-8'))
    test = signRequestCSR()
    print(test)
    emit('new-user', {'username': username, 'room': room, 'clients': clients}, broadcast=True)


@socketio.on('leave-app')
def connect(data):
    username = data["username"]
    room = data["room"]
    if username in clients:
        clients.remove(current_user.username)
    # Broadcast that new user has left
    emit('leave-user', {'username': username, 'room': room, 'clients': clients}, broadcast=True)


@socketio.on('message')
def message(data):
    destination = ''
    if 'destination' in data:
        destination = data['destination']
    msg = {"msg": data['msg'], "username": data['username']}
    userRoom = destination + '_' + destination
    emit('notification',
         {"from": data['username'], "msg": data['msg'], 'clients': clients},
         room=userRoom)





if __name__ == "__main__":
    #generateSelfSignedCertif()
    socketio.run(app, debug=True)

