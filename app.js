function formatDate(date) {
    let dd = String(date.getDate()). padStart(2, '0');
    let mm = String(date.getMonth() + 1). padStart(2, '0'); //January is 0!
    let yyyy = date.getFullYear();
    let formattedDate = yyyy + mm + dd;
    return formattedDate;
}

function adjustDate(num) {
    let today = new Date();
    today.setDate(today.getDate() - num);
    let date = formatDate(today);
    return date;
}

function getToday() {
    let today = new Date();
    let date = formatDate(today);
    return date;
}

function logDay(day, data) {
    // First checks authentication to prevent the user from writing to any directory other than
    // the one associated with their user ID.
    let user = firebase.auth().currentUser;
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            // User is signed in.
            let uid = user.uid;
            
            // Update info at path
            let path = firebase.database().ref('users/' + uid + '/log/' + day);
            path.update(data);
        } else {
            // No user is signed in.
        }
    });
}

function loadDayCube(uid, date) {
    
    let cube = $('<div class="cube"></div>');
    
    // Grabs directory location
    let location = firebase.database().ref('users/' + uid + '/log/' + date);

    // Takes snapshot
    location.once('value', function(snapshot) {
        if (snapshot.exists()) {
            let data = snapshot.val();
            let mood = data.mood;
            mood = mood/5;
            let hue = data.hue;
            $('#cube-container').prepend(cube.clone().css('background-color', `hsl(${hue}, 70%, 70%)`).css('opacity', `${mood}`).attr('date', date));
        } else {
            $('#cube-container').prepend(cube.clone().attr('date', date));
        }
    });
}

function loadDays() {
    // Adjustable variable to determine how many days are loaded to the grid
    let daysLoaded = 90;
    let user = firebase.auth().currentUser;
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            
            // User is signed in.
            let uid = user.uid;
            
            // Grabs directory location
            let location = firebase.database().ref('users/' + uid + '/log');

            // Takes snapshot
            location.on('value', function(snapshot) {
                $('#cube-container').empty();
                for (let i = 0; i < daysLoaded; i++) {
                    let date = adjustDate(i);
                    loadDayCube(uid, date);
                }
            });
        }
    });
}

function loadDayForm(date, editable) {
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {

            // User is signed in.
            let uid = user.uid;

            // Grabs directory location
            let location = firebase.database().ref('users/' + uid + '/log/' + date);

            // Takes snapshot
            location.once('value', function(snapshot) {
                if (snapshot.exists()) {
                    let data = snapshot.val();
                    let mood = data.mood;
                    let hue = data.hue;
                    let notes = data.notes;
                    let formattedDate = date;
                    formattedDate = formattedDate.replace(/(\d{4})(\d{2})(\d{2})/g, '$1-$2-$3');
                    $('#post-date').text(formattedDate);
                    $('#post-day').attr("date", date);
                    $('input[name="post-day-mood"]').prop('checked', false);
                    $(`#mood-${mood}`).prop('checked', true);
                    $('#post-day-hue').val(hue);
                    $('#post-day-notes').val(notes);
                    $('#post-day .rectangle-container').css('background-color', `hsl(${hue}, 70%, 70%)`);
                    if (hue > 30 && hue < 231) {
                        $('.rectangle-container').removeClass('dark');
                        $('.rectangle-container').addClass('light');
                    } else {
                        $('.rectangle-container').removeClass('light');
                        $('.rectangle-container').addClass('dark');
                    }
                    if (editable === true) {
                        $('input[name="post-day-mood"]').prop('disabled', false);
                        $('#post-day-hue').prop('disabled', false);
                        $('#post-day-notes').prop('disabled', false);
                        $('#post-day-submit').show();
                        $('#post-day-edit').hide();
                    } else {
                        $('input[name="post-day-mood"]').prop('disabled', true);
                        $('#post-day-hue').prop('disabled', true);
                        $('#post-day-notes').prop('disabled', true);
                        $('#post-day-submit').hide();
                        $('#post-day-edit').show();
                    }
                } else {
                    // No data found
                    let formattedDate = date;
                    formattedDate = formattedDate.replace(/(\d{4})(\d{2})(\d{2})/g, '$1-$2-$3');
                    $('#post-date').text(formattedDate);
                    $('#post-day').attr("date", date);
                    $('input[name="post-day-mood"]').prop('checked', false);
                    $(`#mood-3`).prop('checked', true);
                    $('#post-day-hue').val(210);
                    $('#post-day-notes').val('');
                    $('#post-day .rectangle-container').css('background-color', `hsl(210, 70%, 70%)`).addClass('dark');
                    let today = getToday();
                    if (editable === true) {
                        $('input[name="post-day-mood"]').prop('disabled', false);
                        $('#post-day-hue').prop('disabled', false);
                        $('#post-day-notes').prop('disabled', false);
                        $('#post-day-submit').show();
                        $('#post-day-edit').hide();
                    } else {
                        $('input[name="post-day-mood"]').prop('disabled', true);
                        $('#post-day-hue').prop('disabled', true);
                        $('#post-day-notes').prop('disabled', true);
                        $('#post-day-submit').hide();
                        $('#post-day-edit').show();
                    }
                }
            });
        } else {
            // No user is signed in.
        }
    });                    
}

$('document').ready(function() {
    
    // Tracker to handle whether or not a user is currently logged in, updates UI accordingly
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            // User is signed in
            var uid = user.uid;
            $('#authenticate').hide();
            $('#app').fadeIn();
            $('#profile-actions').fadeIn();
            loadDays();
            
            let date = getToday();
            // Grabs directory location
            let location = firebase.database().ref('users/' + uid + '/log/' + date);

            // Takes snapshot
            location.once('value', function(snapshot) {
                if (snapshot.exists()) {
                    $('#edit-day').fadeIn();
                } else {
                    $('#log-day').fadeIn();
                }
            });
            
        } else {
            // User is signed out
            $('#profile-actions').hide();
            $('#app').hide();
            $('#authenticate').fadeIn();
        }
    });
    
    // Sign Up
    $("#sign-up-form").submit(function(event) {
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
    $("#log-in-form").submit(function(event) {
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
    $('#view-log-in').click(function(event) {
        event.preventDefault();   
        $('#sign-up-form').hide();
        $('#log-in-form').fadeIn();
        return false;
    });
                            
    $('#view-sign-up').click(function(event) {
        event.preventDefault();
        $('#log-in-form').hide();
        $('#sign-up-form').fadeIn();
        return false;
    });
    
    // Sign Out
    $('#sign-out').click(function(event) {
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
    
    $("#post-day-form").submit(function(event) {
        event.preventDefault();
        let date;
        let mood = $('input[name="post-day-mood"]:checked').val();
        let hue = $('#post-day-hue').val();
        let notes = $('#post-day-notes').val();
        let data = {
            mood: mood,
            hue: hue,
            notes, notes
        };
        let dateAttr = $('#post-day').attr("date");
        if (typeof dateAttr !== 'undefined' && dateAttr !== false) {
            date = dateAttr;
            logDay(date, data);
        } else {
            date = getToday();
            logDay(date, data);
        }
        let today = getToday();
        if (dateAttr === today) {
            $('#log-day').hide();
            $('#edit-day').show();
        }
        loadDays();
        $('#post-day').fadeOut();
        return false;
    });

    $('#cube-container').on('click', '.cube' , function() {
        let date = $(this).attr('date');
        let today = getToday();
        if (date === today) {
            loadDayForm(date, true);
        } else {
            loadDayForm(date, false);
        }
        $('#post-day').fadeIn();
    });
    
    $('#post-day-edit').click(function(event) {
        $('input[name="post-day-mood"]').prop('disabled', false);
        $('#post-day-hue').prop('disabled', false);
        $('#post-day-notes').prop('disabled', false);
        $('#post-day-submit').show();
        $('#post-day-edit').hide();
    });
    
    $('#app').on('click', '#log-day', function() {
        let date = getToday();
        loadDayForm(date, true);
        $('#post-day').fadeIn();
    });
    
    $('#app').on('click', '#edit-day', function() {
        let date = getToday();
        loadDayForm(date, true);
        $('#post-day').fadeIn();
    });
    
    $('#app').on('click', '#close-post', function() {
        $('#post-day').fadeOut();
    });
});
