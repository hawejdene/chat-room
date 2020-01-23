document.addEventListener('DOMContentLoaded', () => {

    // Connect to websocket
    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);
    var pki = forge.pki;
    var messages = {};

    // Retrieve username
    const username = document.querySelector('#get-username').innerHTML;

    // Set default room
    let room = username + "_" + username;
    let destination = username;


    socket.on('connect', function () {
        const req = createCertifRequest();
        console.log(req)
        socket.emit('connect-user', {'username': username, 'room': room, 'req':req});
    });
    //new message
    socket.on('notification', data => {
        //decrypt message
        if (data["from"] in messages) {
            messages[data["from"]].push({'sender': data["from"], 'msg': data.msg})
        } else {
            messages[data["from"]] = []
            messages[data["from"]].push({'sender': data["from"], 'msg': data.msg})
        }

        if (destination !== data["from"]) {
            const p = document.getElementById('p_' + data.from);
            const badge = document.getElementById("bd_" + data.from);
            if (badge) {
                badge.innerHTML = parseInt(badge.innerHTML) + 1;
            } else {
                const span = document.createElement('span');
                span.setAttribute("class", "badge");
                span.setAttribute("id", "bd_" + data.from);
                span.innerHTML = 1;
                p.append(span);
            }

        } else {
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

    function populateClients(data) {
        document.querySelector('#sidebar').innerHTML = "";
        for (var i = 0; i < data.clients.length; i++) {
            if (data.clients[i] !== username) {
                const p = document.createElement('p');
                const span = document.createElement('span');
                p.setAttribute("class", "notification select-room cursor-pointer");
                p.setAttribute("id", 'p_' + data.clients[i]);
                span.setAttribute("id", data.clients[i]);
                span.innerHTML = data.clients[i];
                p.append(span);
                span.addEventListener("click", function () {
                    sendMessageTo(span.innerHTML)
                });
                document.querySelector('#sidebar').append(p);
            }

        }
    }


    socket.on('new-user', data => {
        populateClients(data)
    });

    socket.on('leave-user', data => {
        populateClients(data)
    });


    // Send messages
    document.querySelector('#send_message').onclick = () => {
        const msg = document.querySelector('#user_message').value;
        if (destination in messages) {
            messages[destination].push({'sender': username, 'msg': msg});
        } else {
            messages[destination] = [];
            messages[destination].push({'sender': username, 'msg': msg});
        }
        populateMessages(messages[destination]);
        //encrypt message with public key of sender
        socket.emit('message', {
            'msg': document.querySelector('#user_message').value,
            'username': username, 'destination': destination, 'room': room
        });

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
        const span = document.getElementById("bd_" + user);
        if (span) {
            span.parentNode.removeChild(span);
        }


        // Highlight selected room
        document.querySelector('#' + CSS.escape('p_' + user)).style.color = "#ffc107";
        document.querySelector('#' + CSS.escape('p_' + user)).style.backgroundColor = "white";

        // Clear message area
        document.querySelector('#display-message-section').innerHTML = '';

        // Autofocus on text box
        document.querySelector("#user_message").focus();

        //reload messages
        if (user in messages) {
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

    /*  function generateKeys() {
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

    }  */

    function createCertificate() {
        // Generate 4096-bit RSA keypair
        var pki = forge.pki;
        var keys = forge.pki.rsa.generateKeyPair(2048);
        console.log(pki.publicKeyToPem(keys.publicKey));
        // Create X.509 certificate
        var cert = forge.pki.createCertificate();
        // Add public key to certificate
        cert.publicKey = keys.publicKey;
        cert.serialNumber = '01';
        cert.validity.notBefore = new Date();
        cert.validity.notAfter = new Date();
        cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1);
        var attrs = [{
            name: 'commonName',
            value: 'insat.org'
        }, {
            name: 'countryName',
            value: 'TN'
        }, {
            shortName: 'ST',
            value: 'Tunis'
        }, {
            name: 'localityName',
            value: 'Blacksburg'
        }, {
            name: 'organizationName',
            value: 'Test'
        }, {
            shortName: 'OU',
            value: 'Test'
        }];
        cert.setSubject(attrs);
        cert.setExtensions([{
            name: 'basicConstraints',
            cA: true
        }, {
            name: 'keyUsage',
            keyCertSign: true,
            digitalSignature: true,
            nonRepudiation: true,
            keyEncipherment: true,
            dataEncipherment: true
        }, {
            name: 'extKeyUsage',
            serverAuth: true,
            clientAuth: true,
            codeSigning: true,
            emailProtection: true,
            timeStamping: true
        }, {
            name: 'nsCertType',
            client: true,
            server: true,
            email: true,
            objsign: true,
            sslCA: true,
            emailCA: true,
            objCA: true
        }, {
            name: 'subjectAltName',
            altNames: [{
                type: 6, // URI
                value: 'http://example.org/webid#me'
            }, {
                type: 7, // IP
                ip: '127.0.0.1'
            }]
        }, {
            name: 'subjectKeyIdentifier'
        }]);
        cert.sign(keys.privateKey);
        var pem = pki.certificateToPem(cert);

        return pem;
    }

    function createCertifRequest() {
        var keys = pki.rsa.generateKeyPair(2048);
        let certificationRequest = pki.createCertificationRequest();
        console.log(certificationRequest);
        certificationRequest.publicKey = keys.publicKey;
        var attrs = [{
            name: 'commonName',
            value: 'insat.org'
        }, {
            name: 'countryName',
            value: 'TN'
        }, {
            shortName: 'ST',
            value: 'Tunis'
        }, {
            name: 'localityName',
            value: 'Blacksburg'
        }, {
            name: 'organizationName',
            value: 'Test'
        }, {
            shortName: 'OU',
            value: 'Test'
        }];
        certificationRequest.setSubject(attrs);
        certificationRequest.sign(keys.privateKey);

        let certificationRequestToPem = pki.certificationRequestToPem(certificationRequest);
        console.log(certificationRequestToPem);
        return certificationRequestToPem;
    }
});










































































