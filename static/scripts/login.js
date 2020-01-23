

    document.addEventListener('DOMContentLoaded', () => {

    document.getElementById('register').onclick = () => {
        console.log("cpin")
        const req = createCertifRequest();
        const form = document.getElementById('form');
        form.elements["request"].value =req;
        console.log(form.elements["request"].value)
        form.submit();

    };
});