document.addEventListener('DOMContentLoaded', () => {
    var input = document.getElementById("myCertif");
    var output = document.getElementById("output");


    input.addEventListener("change", function () {
        if (this.files && this.files[0]) {
            var myFile = this.files[0];
            var reader = new FileReader();

            reader.addEventListener('load', function (e) {
                output.textContent = e.target.result;

            });

            reader.readAsBinaryString(myFile);
        }
    });

    document.getElementById("login").onclick = () => {
        const form = document.getElementById("form");
          form.elements["certification"].value =output.textContent;
          form.submit();
    }

});