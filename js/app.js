var database = firebase.database();
document.getElementById("add-data").onclick = function (e) {
    var fullname = document.getElementById('fullname').value;
    var email = document.getElementById('email').value;
    if (fullname == "" || email == "") {
        document.getElementById("failed").style.display = "block";
    } else {
        var rootRef = firebase.database().ref();
        var storesRef = rootRef.child('jbc/registration/');
        var newStoreRef = storesRef.push();
        newStoreRef.set({
            fullname: fullname,
            email: email,
        }).then(data => {
            console.log("OK");
            document.getElementById("alertBlock").style.display = "block";
            document.getElementById("failed").style.display = "none";
            document.getElementById("add-data").style.display = "none";
            document.getElementById("fullname").style.display = "none";
            document.getElementById("email").style.display = "none";
        });
    }
}