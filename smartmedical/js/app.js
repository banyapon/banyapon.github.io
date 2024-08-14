var database = firebase.database();
document.getElementById("add-data").onclick = function (e) {
    var fullname = document.getElementById('name').value;
    var email = document.getElementById('email').value;
    var phone = document.getElementById('phone').value;
    var position = document.getElementById('position').value;
    var messenger = document.getElementById('messenger').value;
    var organization = document.getElementById('organization').value;
    var message = document.getElementById('message').value;
    if (fullname == "" || email == "") {
        document.getElementById("failed").style.display = "block";
    } else {
        var rootRef = firebase.database().ref();
        var storesRef = rootRef.child('smartmedical/registration/');
        var newStoreRef = storesRef.push();
        newStoreRef.set({
            fullname: fullname,
            email: email,
            phone, phone,
            position: position,
            organization: organization,
            messenger, messenger,
            message, message,
        }).then(data => {
            console.log("OK");
            document.getElementById("alertBlock").style.display = "block";
            document.getElementById("failed").style.display = "none";
            document.getElementById("add-data").style.display = "none";
            document.getElementById("fullname").style.display = "none";
            document.getElementById("email").style.display = "none";
            document.getElementById("register").style.display = "none";

        });
       document.getElementById("register").style.display = "none";
    }
}
