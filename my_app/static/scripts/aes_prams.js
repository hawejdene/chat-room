
    //   var iv = forge.random.getBytes(8);
    //   var keySize = 16;
    //   var salt = forge.random.getBytes(8);
    //  function aesEncryption(msg) {
    //     var key = forge.pkcs5.pbkdf2('Secret Passphrase', 0, 1000, keySize);
    //     var input = forge.util.createBuffer(msg, 'utf8');
    //     var cipher = forge.cipher.createCipher('AES-CBC', key);
    //     cipher.start({iv: 0});
    //     cipher.update(input);
    //     cipher.finish();
    //     var ciphertext = cipher.output.getBytes();
    //     return ciphertext;
    // }
    //
    // function aesDecrypt(msg) {
    //     input = forge.util.createBuffer(msg);
    //     var key = forge.pkcs5.pbkdf2('Secret Passphrase', 0, 1000, keySize);
    //     var decipher = forge.cipher.createDecipher('AES-CBC', key);
    //     decipher.start({iv: 0});
    //     decipher.update(input);
    //     decipher.finish();
    //     return decipher.output.toString('utf8');
    // }

    let code = (function(){
    return{
      encryptMessage: function(messageToencrypt = '', secretkey = ''){
        var encryptedMessage = CryptoJS.AES.encrypt(messageToencrypt, secretkey);
        return encryptedMessage.toString();
      },
      decryptMessage: function(encryptedMessage = '', secretkey = ''){
        var decryptedBytes = CryptoJS.AES.decrypt(encryptedMessage, secretkey);
        var decryptedMessage = decryptedBytes.toString(CryptoJS.enc.Utf8);

        return decryptedMessage;
      }
    }
})();