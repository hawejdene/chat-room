

document.addEventListener('DOMContentLoaded', () => {

    // Connect to websocket
    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

    // Retrieve username
    const username = document.querySelector('#get-username').innerHTML;

    // Set default room
    let room = username + "_" + username;


    socket.on('connect', function () {
         socket.emit('connect-user', {'username': username, 'room': room});
    });
    //new message
      socket.on('notification', data => {
         console.log("notification",data)
    });
    // Display all incoming messages
    socket.on('message', data => {
        console.log('receivre', data);
        if (data.all_messages) {
            document.querySelector('#display-message-section').innerHTML = '';
            for(var i = 0; i < data.all_messages.length; i++) {
            const p = document.createElement('p');
            const span_username = document.createElement('span');
            const br = document.createElement('br');
            // Display user's own message
            if (data.all_messages[i].username == username) {
                    p.setAttribute("class", "my-msg");

                    // Username
                    span_username.setAttribute("class", "my-username");
                    span_username.innerText = data.all_messages[i].username;

                    // HTML to append
                    p.innerHTML += span_username.outerHTML + br.outerHTML + data.all_messages[i].msg + br.outerHTML;

                    //Append
                    document.querySelector('#display-message-section').append(p);
            }
            // Display other users' messages
            else {
                p.setAttribute("class", "others-msg");

                // Username
                span_username.setAttribute("class", "other-username");
                span_username.innerText = data.all_messages[i].username;

                // HTML to append
                p.innerHTML += span_username.outerHTML + br.outerHTML + data.all_messages[i].msg + br.outerHTML ;

                //Append
                document.querySelector('#display-message-section').append(p);
            }
        }
        }   else {
                printSysMsg(data.msg);
            }
        scrollDownChatWindow();
    });

    socket.on('new-user', data =>{
        console.log("new ", data)
        document.querySelector('#sidebar').innerHTML = "";
        for(var i = 0; i < data.clients.length; i++) {
            const p = document.createElement('p');
            p.setAttribute("class", "select-room cursor-pointer");
              p.setAttribute("id", data.clients[i]);
            p.innerHTML += data.clients[i];
            p.addEventListener("click", function() {
                console.log(p.innerHTML);
                sendMessageTo(p.innerHTML)
            });
            document.querySelector('#sidebar').append(p);
        }
    });

    socket.on('leave-user', data => {
        console.log("leave", data)
        document.querySelector('#sidebar').innerHTML = "";
        for(var i = 0; i < data.clients.length; i++) {
            const p = document.createElement('p');
            p.setAttribute("class", "select-room cursor-pointer");
            p.setAttribute("id", data.clients[i]);
            p.innerHTML += data.clients[i];
             p.addEventListener("click", function() {
                console.log(p.innerHTML);
            });
            document.querySelector('#sidebar').append(p);
        }
    });


     // Send messages
    document.querySelector('#send_message').onclick = () => {
        console.log("send to room", room);
        socket.emit('message', {'msg': document.querySelector('#user_message').value,
            'username': username, 'room': room});

        document.querySelector('#user_message').value = '';
    };



    // Logout from chat
    document.querySelector("#logout-btn").onclick = () => {
        socket.emit('leave-app', {'username': username, 'room': room});
    };



    function sendMessageTo(user) {
        console.log("to ", user);
        socket.emit('join-user', {
            'username': username, 'to': user, 'room': user});

             room = username + '_' + user;

            document.querySelectorAll('.select-room').forEach(p => {
            p.style.color = "black";
        });

          // Highlight selected room
        document.querySelector('#' + CSS.escape(user)).style.color = "#ffc107";
        document.querySelector('#' + CSS.escape(user)).style.backgroundColor = "white";

        // Clear message area
        document.querySelector('#display-message-section').innerHTML = '';

        // Autofocus on text box
        document.querySelector("#user_message").focus();
    }

    // Scroll chat window down
    function scrollDownChatWindow() {
        const chatWindow = document.querySelector("#display-message-section");
        chatWindow.scrollTop = chatWindow.scrollHeight;
    }

    // Print system messages
    function printSysMsg(msg) {
        const p = document.createElement('p');
        p.setAttribute("class", "system-msg");
        p.innerHTML = msg;
        document.querySelector('#display-message-section').append(p);
        scrollDownChatWindow()

        // Autofocus on text box
        document.querySelector("#user_message").focus();
    }
});