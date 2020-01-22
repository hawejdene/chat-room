

document.addEventListener('DOMContentLoaded', () => {

    // Connect to websocket
    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

    var messages = {};

    // Retrieve username
    const username = document.querySelector('#get-username').innerHTML;

    // Set default room
    let room = username + "_" + username;
    let destination = username;


    socket.on('connect', function () {
        console.log("gen keys");
        generateKeys();
         socket.emit('connect-user', {'username': username, 'room': room});
    });
    //new message
      socket.on('notification', data => {
          //decrypt message
            if (data["from"] in messages){
             messages[data["from"]].push({'sender': data["from"],'msg':data.msg})
         }else {
              messages[data["from"]] = []
             messages[data["from"]].push({'sender': data["from"],'msg':data.msg})
         }

         if (destination !== data["from"] ){
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

         }else {
             populateMessages(messages[data["from"]]);
         }

    });
// Display all incoming messages
      function populateMessages(messages) {
          document.querySelector('#display-message-section').innerHTML = '';
          for (var i = 0; i < messages.length; i++) {
              const p = document.createElement('p');
              const span_username = document.createElement('span');
              const br = document.createElement('br');
              // Display user's own message
              if (messages[i].sender == username) {
                  p.setAttribute("class", "my-msg");

                  // Username
                  span_username.setAttribute("class", "my-username");
                  span_username.innerText = messages[i].sender;

                  // HTML to append
                  p.innerHTML += span_username.outerHTML + br.outerHTML + messages[i].msg + br.outerHTML;

                  //Append
                  document.querySelector('#display-message-section').append(p);
              }
              // Display other users' messages
              else {
                  p.setAttribute("class", "others-msg");

                  // Username
                  span_username.setAttribute("class", "other-username");
                  span_username.innerText = messages[i].sender;

                  // HTML to append
                  p.innerHTML += span_username.outerHTML + br.outerHTML + messages[i].msg + br.outerHTML;

                  //Append
                  document.querySelector('#display-message-section').append(p);
              }


          }
      }

      function populateClients(data){
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
      }


    socket.on('new-user', data =>{
        populateClients(data)
    });

    socket.on('leave-user', data => {
        populateClients(data)
    });


     // Send messages
    document.querySelector('#send_message').onclick = () => {
        const msg = document.querySelector('#user_message').value;
         if (destination in messages){
             messages[destination].push({'sender': username,'msg':msg});
         }else {
              messages[destination] = [];
             messages[destination].push({'sender': username,'msg':msg});
         }
        populateMessages(messages[destination]);
         //encrypt message with public key of sender
        socket.emit('message', {'msg': document.querySelector('#user_message').value,
            'username': username, 'destination': destination, 'room': room});

        document.querySelector('#user_message').value = '';
    };

    // Logout from chat
    document.querySelector("#logout-btn").onclick = () => {
        socket.emit('leave-app', {'username': username, 'room': room});
    };


    function sendMessageTo(user) {

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

        //reload messages
        if (user in messages){
        populateMessages(messages[user]);
        }

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

      function generateKeys() {
      const keySize = 2048;
      const crypt = new JSEncrypt({default_key_size: keySize});

      crypt.getKey();
      console.log("public key: ",crypt.getPrivateKey());
      console.log("private key: ", crypt.getPrivateKey());

    }

     function encrypt(msg, pubKey) {
      const encrypt = new JSEncrypt();
      encrypt.setPublicKey(pubKey);
      const result = encrypt.encrypt(msg);
      return result;
    }

    function decrypt(msg, privateKey) {
         const decrypt = new JSEncrypt();
         decrypt.setPrivateKey(privateKey);
         const result = decrypt.decrypt(msg);

    }

});










































































