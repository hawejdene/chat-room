

    document.addEventListener('DOMContentLoaded', () => {
    var pki = forge.pki;
    var private_key;
    var keys;


        function download(filename, text) {
            var element = document.createElement('a');
            element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
            element.setAttribute('download', filename);

            element.style.display = 'none';
            document.body.appendChild(element);

            element.click();

            document.body.removeChild(element);
        }
          function createCertifRequest(commonName,countryName,ST,localityName,organizationName,OU) {
        let certificationRequest = pki.createCertificationRequest();
        console.log(certificationRequest);
        certificationRequest.publicKey = keys.publicKey;

        var attrs = [{
            name: 'commonName',
            value: commonName
        }, {
            name: 'countryName',
            value: countryName
        }, {
            shortName: 'ST',
            value: ST
        }, {
            name: 'localityName',
            value: localityName
        }, {
            name: 'organizationName',
            value: organizationName
        }, {
            shortName: 'OU',
            value: OU
        }];
        certificationRequest.setSubject(attrs);
        certificationRequest.sign(keys.privateKey);

        let certificationRequestToPem = pki.certificationRequestToPem(certificationRequest);
        return certificationRequestToPem;
    }

    document.getElementById('crq').onclick = () => {

        const form = document.getElementById('form');
        const commonName = form.elements["commonName"].value;
        const countryName = form.elements["countryName"].value;
        const ST = form.elements["ST"].value;
        const localityName = form.elements["localityName"].value;
        const organizationName = form.elements["organizationName"].value;
        const OU = form.elements["OU"].value;
        const req = createCertifRequest(commonName,countryName,ST,localityName,organizationName,OU);
        const div = document.getElementById("certificateReq");
        const p = document.createElement("p");
        p.innerHTML = req;
        div.append(req)
        form.elements["request"].value =req;
        //console.log(form.elements["request"].value);
        //form.submit();

    };

      document.getElementById("register").onclick = () => {
          const form = document.getElementById('form');
          form.submit();
        }



    document.getElementById('download').onclick = () => {
             const form = document.getElementById('form');
             const user= form.elements["username"].value;
        keys = pki.rsa.generateKeyPair(2048);
        const publicKeyPem = forge.pki.publicKeyToPem(keys.publicKey);
        const privateKeyPem = forge.pki.privateKeyToPem(keys.privateKey);
        download("private_key_"+user+".txt", privateKeyPem)
        download("public_key_"+user+".txt",publicKeyPem)
    }
});