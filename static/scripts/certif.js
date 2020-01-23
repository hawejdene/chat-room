

    document.addEventListener('DOMContentLoaded', () => {
    var pki = forge.pki;
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
    document.getElementById('register').onclick = () => {
        console.log("cpin")
        const req = createCertifRequest();
        const form = document.getElementById('form');
        form.elements["request"].value =req;
        console.log(form.elements["request"].value)
        form.submit();

    };
});