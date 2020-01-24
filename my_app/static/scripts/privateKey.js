document.addEventListener('DOMContentLoaded', () => {
    var input = document.getElementById("privateKey");
    var output = document.getElementById("output");

    input.addEventListener("change", function () {
        if (this.files && this.files[0]) {
            var myFile = this.files[0];
            console.log('ffff')
            console.log(myFile)
            var reader = new FileReader();

            reader.addEventListener('load', function (e) {
                output.textContent = e.target.result;
                const res = code.encryptMessage(e.target.result,'your_password')
                window.sessionStorage.setItem("private_key", res);

            });

            reader.readAsBinaryString(myFile);
        }
    });





});