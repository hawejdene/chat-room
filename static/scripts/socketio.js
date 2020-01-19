

document.addEventListener('DOMContentLoaded', () => {


    // Connect to websocket
    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);
    let room = "Lounge";
     joinRoom("Lounge");

     document.querySelector('#send_message').onclick = () => {
         socket.send({
             'msg':document.querySelector('#user_message').value,
             'username': username,
             'room': room,
         });

         document.querySelector("#user_message").value = '';
     };


    socket.on('connect', () => {
        socket.send("I am connected");
    });

     socket.on('message', data => {
         console.log("eee",data)
        const p = document.createElement('p');
        const span_username = document.createElement('span');
        const span_timestamp = document.createElement('span');
        const br = document.createElement('br');

        if (data.username) {
              span_username.innerHTML = data.username;
        p.innerHTML = span_username.outerHTML + br.outerHTML + data.msg + br.outerHTML + br.outerHTML ;
        document.querySelector("#dispaly-message-section").append(p);
        }else {
            printSysMsg(data.msg)
        }

    });

     // Select a room
    document.querySelectorAll('.select-room').forEach(p => {
        p.onclick = () => {
            let newRoom = p.innerHTML
            // Check if user already in the room
            if (newRoom === room) {
                msg = `You are already in ${room} room.`;
                printSysMsg(msg);
            } else {
                leaveRoom(room);
                joinRoom(newRoom);
                room = newRoom;
            }
        };
    });

    // Trigger 'leave' event if user was previously on a room
    function leaveRoom(room) {
        socket.emit('leave', {'username': username, 'room': room});

        document.querySelectorAll('.select-room').forEach(p => {
            p.style.color = "black";
        });
    }

     // Trigger 'join' event
    function joinRoom(room) {

        // Join room
        socket.emit('join', {'username': username, 'room': room});

        // Highlight selected room


        // Clear message area
        document.querySelector("#dispaly-message-section").innerHTML = '';

        // Autofocus on text box
        document.querySelector("#user_message").focus();
    }



    // Print system messages
    function printSysMsg(msg) {
        const p = document.createElement('p');
        p.setAttribute("class", "system-msg");
        p.innerHTML = msg;
        document.querySelector("#dispaly-message-section").append(p);


        // Autofocus on text box
        document.querySelector("#user_message").focus();
    }


});