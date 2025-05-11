const myModal = bootstrap.Modal.getOrCreateInstance(document.getElementById('myModal'));

function show_modal(title, message){
    document.getElementById('myModal').focus();
    document.getElementById('myModalTitle').textContent = title;
    document.getElementById('myModalText').textContent = message;
    myModal.show();
    let close_evt = function () {
        myModal.hide();
    };
    document.addEventListener("keypress", close_evt);
    $("#myModal").on("hidden.bs.modal", function () {
        if (timeout_id !== -1) {
            window.clearTimeout(timeout_id);
            timeout_id = -1;
        }
        if (close_evt) {
            document.removeEventListener("keypress", close_evt);
            close_evt = null;
        }
    });
}