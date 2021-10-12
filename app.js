function logDay(day, data) {
    // First checks authentication to prevent the user from writing to any directory other than
    // the one associated with their user ID.
    var user = firebase.auth().currentUser;
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            // User is signed in.
            let uid = user.uid;
            
            // Update info at specific path
            var path = firebase.database().ref('users/' + uid + '/ log/' + day);
            path.update(data);
        } else {
            // No user is signed in.
        }
    });
}

$('document').ready(function() {
    
    // Tracker to handle whether or not a user is currently logged in, updates UI accordingly
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            // User is signed in, see docs for a list of available properties
            // https://firebase.google.com/docs/reference/js/firebase.User
            var uid = user.uid;
            $('#authenticate').hide();
            $('#app').fadeIn();
            $('#profile-actions').fadeIn();
        } else {
            // User is signed out
            $('#profile-actions').hide();
            $('#app').hide();
            $('#authenticate').fadeIn();
        }
    });
    
    // Sign Up
    $("#sign-up-form").submit(function(event){
        event.preventDefault();
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
                $('#authenticate').find('.error-field').fadeIn();
                // ..
        });
        return false;
    });
    
    // Log In
    $("#log-in-form").submit(function(event){
        event.preventDefault();
        let email = $('#log-in-email').val();
        let password = $('#log-in-password').val();
        firebase.auth().signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
                // Signed in
                var user = userCredential.user;
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
    
    //Switching Forms
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
    
    // Sign Out
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
    
    $('#post-day-hue').on('input', function() {
        let hue = $(this).val();
        $('#post-day .rectangle-container').css('background-color', `hsl(${hue}, 70%, 70%)`);
        if (hue > 30 && hue < 231) {
            $('.rectangle-container').removeClass('dark');
            $('.rectangle-container').addClass('light');
        } else {
            $('.rectangle-container').removeClass('light');
            $('.rectangle-container').addClass('dark');
        }
    });
    
    $("#post-day-form").submit(function(event){
        event.preventDefault();
        let mood = $('input[name="post-day-mood"]:checked').val();
        let hue = $('#post-day-hue').val();
        let notes = $('#post-day-notes').val();
        let data = {
            mood: mood,
            hue: hue,
            notes, notes
        };
        let today = new Date();
        let dd = String(today.getDate()). padStart(2, '0');
        let mm = String(today.getMonth() + 1). padStart(2, '0'); //January is 0!
        let yyyy = today.getFullYear();
        let date = yyyy + mm + dd;
        logDay(date, data);
        return false;
    });
});
