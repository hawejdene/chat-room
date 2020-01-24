    document.addEventListener('DOMContentLoaded', () => {

         function download(filename, text) {
            var element = document.createElement('a');
            element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
            element.setAttribute('download', filename);

            element.style.display = 'none';
            document.body.appendChild(element);

            element.click();

            document.body.removeChild(element);
        }
        document.getElementById('download').onclick = ()=> {
             const certification = document.getElementById('certification').innerHTML;
             download("certification.txt",certification);
        }

});