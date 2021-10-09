function authenticateSuccessful(user) {
}

$('document').ready(function() {
    $("#sign-up-form").submit(function(event){
        event.preventDefault();
        let email = $('#sign-up-email').val();
        let password = $('#sign-up-password').val();
        firebase.auth().createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
                // Signed in 
                var user = userCredential.user;
                console.log(user);
                // ...
            })
            .catch((error) => {
                var errorCode = error.code;
                var errorMessage = error.message;
                $('#authenticate').find('.error-field p').text(errorMessage);
                $('#authenticate').find('.error-field').fadeIn();
                // ..
        });
        return false;
    });
    $("#log-in-form").submit(function(event){
        event.preventDefault();
        let email = $('#log-in-email').val();
        let password = $('#log-in-password').val();
        firebase.auth().signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
                // Signed in
                var user = userCredential.user;
                console.log(user);
                // ...
            })
            .catch((error) => {
                var errorCode = error.code;
                var errorMessage = error.message;
                $('#authenticate').find('.error-field p').text(errorMessage);
                $('#authenticate').find('.error-field').fadeIn();
                // ..
        });
        return false;
    });
    
    $('#view-log-in').click(function(event){
        event.preventDefault();   
        $('#sign-up-form').hide();
        $('#log-in-form').fadeIn();
        return false;
    });
                            
    $('#view-sign-up').click(function(event){
        event.preventDefault();
        $('#log-in-form').hide();
        $('#sign-up-form').fadeIn();
        return false;
    });
    
    $('#sign-out').click(function(event){
        event.preventDefault();
        firebase.auth().signOut()
            .then(() => {
                // Sign-out successful.
            }).catch((error) => {
                // An error happened.
        });
        return false;
    });
});
