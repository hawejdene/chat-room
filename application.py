from flask import Flask, render_template, redirect, url_for, flash, request
from flask_login import login_user, current_user, login_required, logout_user
from flask_sqlalchemy import SQLAlchemy
from passlib.hash import pbkdf2_sha256
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
    print(reg_form.username.data)
    if reg_form.username.data and reg_form.password.data:
        username = reg_form.username.data
        password = reg_form.password.data
        # hask passwd
        hashed_pswd = pbkdf2_sha256.hash(password)

        # add user to db
        user = User(username=username, password=hashed_pswd)
        db.session.add(user)
        db.session.commit()

        flash('register wish success, please login', 'success')
        return redirect(url_for('login'))
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
    print('clients')
    print(clients)
    # Broadcast that new user has joined
    emit('new-user', {'username': username, 'room': room, 'clients': clients}, broadcast=True)


@socketio.on('leave-app')
def connect(data):
    username = data["username"]
    room = data["room"]
    if username in clients:
        clients.remove(current_user.username)
    print('leaveee')
    print(clients)
    # Broadcast that new user has left
    emit('leave-user', {'username': username, 'room': room, 'clients': clients}, broadcast=True)


@socketio.on('message')
def message(data):
    print(data)
    room = data['room']
    msg = {"msg": data['msg'], "username": data['username']}
    newRoom2 = room.split('_')[1] + '_' + room.split('_')[0]
    userRoom = room.split('_')[1] + '_' + room.split('_')[1]
    if not messages or (room not in messages) or (newRoom2 not in messages):
        messages[room] = []
        messages[newRoom2] = []
        messages[room].append(msg)
        messages[newRoom2].append(msg)
    else:
        messages[room].append(msg)
        messages[newRoom2].append(msg)

    send({"username": data['username'], "msg": data['msg'], 'all_messages': messages[room]}, room=room)
    send({"username": data['username'], "msg": data['msg'], 'all_messages': messages[room]}, room=newRoom2)
    emit('notification', {"from": room.split('_')[0], "msg": "new message", 'clients': clients}, room=userRoom)


@socketio.on('join-user')
def message(data):
    # user join room user_userTo
    user = data["username"]
    userTo = data["to"]
    newRoom = user + '_' + userTo
    join_room(newRoom)
    if newRoom in messages:
        send({"username": data['username'], "msg": "load message", 'all_messages': messages[newRoom]}, room=newRoom)


if __name__ == "__main__":
    socketio.run(app, debug=True)
