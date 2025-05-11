const myModalElement = document.getElementById('myModal');
const myModal = bootstrap.Modal.getOrCreateInstance(myModalElement);

function show_modal(title, message){
    return new Promise((resolve) => {
        window.setTimeout(()=>{
            if (myModal._isShown){
                myModal.hide();
            }
        },3000);
        myModalElement.focus();
        document.getElementById('myModalTitle').textContent = title;
        document.getElementById('myModalText').textContent = message;
        myModal.show();
        let close_evt = function () {
            myModal.hide();
        };
        document.addEventListener("keypress", close_evt);
        myModalElement.addEventListener("hidden.bs.modal", function () {
            if (close_evt) {
                document.removeEventListener("keypress", close_evt);
                close_evt = null;
            }
            resolve();
        }, {once: true});
    });
}