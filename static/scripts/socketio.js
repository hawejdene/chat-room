

document.addEventListener('DOMContentLoaded', () => {

    // Connect to websocket
    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

    // Retrieve username
    const username = document.querySelector('#get-username').innerHTML;

    // Set default room
    let room = username + "_" + username;
    let destination = username;


    socket.on('connect', function () {
         socket.emit('connect-user', {'username': username, 'room': room});
    });
    //new message
      socket.on('notification', data => {
         console.log("notification",data);
         console.log(room)
          console.log(room == data.room2)
         if (room !== data.room && room !== data.room2 ){
             const p = document.getElementById('p_'+data.from);
             const badge = document.getElementById("bd_"+data.from);
             if (badge){
                 badge.innerHTML = parseInt(badge.innerHTML) + 1;
             }else {
                   const span = document.createElement('span');
                   span.setAttribute("class","badge" );
                   span.setAttribute("id","bd_"+data.from );
                   span.innerHTML = 1;
                   p.append(span);
             }

         }
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
            if(data.clients[i] !==username){
            const p = document.createElement('p');
            const span = document.createElement('span');
            p.setAttribute("class", "notification select-room cursor-pointer");
            p.setAttribute("id", 'p_'+data.clients[i]);
            span.setAttribute("id", data.clients[i]);
            span.innerHTML = data.clients[i];
            p.append(span);
            span.addEventListener("click", function() {
                sendMessageTo(span.innerHTML)
            });
            document.querySelector('#sidebar').append(p);
            }

        }
    });

    socket.on('leave-user', data => {
        console.log("leave", data)
        document.querySelector('#sidebar').innerHTML = "";
        for(var i = 0; i < data.clients.length; i++) {
            if(data.clients[i] !== username){
                    const p = document.createElement('p');
            const span = document.createElement('span');
            p.setAttribute("class", "notification select-room cursor-pointer");
            p.setAttribute("id", 'p_'+data.clients[i])
             span.setAttribute("id", data.clients[i]);
             span.innerHTML = data.clients[i];
            p.append(span);
             span.addEventListener("click", function() {
                sendMessageTo(span.innerHTML);
            });
            document.querySelector('#sidebar').append(p);
            }

        }
    });


     // Send messages
    document.querySelector('#send_message').onclick = () => {
        console.log("send to room", room);
        socket.emit('message', {'msg': document.querySelector('#user_message').value,
            'username': username, 'destination': destination, 'room': room});

        document.querySelector('#user_message').value = '';
    };



    // Logout from chat
    document.querySelector("#logout-btn").onclick = () => {
        socket.emit('leave-app', {'username': username, 'room': room});
    };


   function checkRoom(user1, user2) {
      if(user1 > user2){
          return user1 + '_' + user2
      }else {
          return user2 + '_' + user1
      }
   }

    function sendMessageTo(user) {
        console.log("to ", user);
        socket.emit('join-user', {
            'username': username, 'to': user, 'room': user});

             room = checkRoom(username,user);
             destination = user;
            document.querySelectorAll('.select-room').forEach(p => {
            p.style.color = "black";
        });
          //remove notfication
            const span = document.getElementById("bd_"+user);
            if (span){
            span.parentNode.removeChild(span);
            }


          // Highlight selected room
        document.querySelector('#' + CSS.escape('p_'+user)).style.color = "#ffc107";
        document.querySelector('#' + CSS.escape('p_'+user)).style.backgroundColor = "white";

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