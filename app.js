
$("#sign-up-form").submit(function(event){
    let email = $('#sign-up-email').val();
    let password = $('#sign-up-password').val();
    firebase.auth().createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Signed in 
            var user = userCredential.user;
            // ...
        })
        .catch((error) => {
            var errorCode = error.code;
            var errorMessage = error.message;
            $('#authenticate').find('.error-field p').text(errorMessage);
            // ..
    });
    event.preventDefault();
});

/*// Sign In
firebase.auth().signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
        // Signed in
        var user = userCredential.user;
        // ...
    })
    .catch((error) => {
        var errorCode = error.code;
        var errorMessage = error.message;
});


// Sign Out
firebase.auth().signOut()
    .then(() => {
        // Sign-out successful.
    }).catch((error) => {
        // An error happened.
});
*/
