// Core app functionality

// Full disclosure, this code isn't super well commented. I don't really plan to work on this
// very much going forward. If that changes maybe I'll come do a better job, but for now
// it is what it is

// Function to determine average hue out of all entries in DB for that user
// Note that it's average of DB entres, not entries shown on-screen (which is limited)
// Not currently used in production
function getAverageHue() {
    
    // Check login status
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {

            // User is signed in.
            let uid = user.uid;

            // Grabs directory location
            let location = firebase.database().ref('users/' + uid + '/log');

            // Takes snapshot
            location.on('value', function(snapshot) {
                
                // Initialize variables
                let averageHue = 0;
                let total = 0;
                
                // For each entry
                snapshot.forEach((childSnapshot) => {
                    
                    // Get data
                    let date = childSnapshot.key;
                    let data = childSnapshot.val();
                    
                    // Get hue specifically
                    let hue = parseInt(data.hue);
                    
                    // Add to average (currently storing the sum)
                    averageHue = averageHue + hue;
                    
                    // Increment total iterations to divide sum by when we're done iterating
                    total ++;
                });
                
                // Set average to actual average, dividing previous value (the sum) by our total iterations (total)
                averageHue = averageHue/total;
                
                // If average isn't 0
                if (averageHue) {
                    // Do something
                    //updateWrap(averageHue);
                }
            });
        }
    });
}

// Takes a date object and formats it to YYYYMMDD, returns formatted date
function formatDate(date) {
    let dd = String(date.getDate()). padStart(2, '0');
    let mm = String(date.getMonth() + 1). padStart(2, '0'); //January is 0!
    let yyyy = date.getFullYear();
    let formattedDate = yyyy + mm + dd;
    return formattedDate;
}

// Takes a number (num) as a number of days prior to today
// Creates a new date object <num> days ago, sends to formatDate to be formatted
// Returns formatted prior date
function adjustDate(num) {
    let today = new Date();
    today.setDate(today.getDate() - num);
    let date = formatDate(today);
    return date;
}

// Returns formatted date of today (YYYYMMDD)
function getToday() {
    let today = new Date();
    let date = formatDate(today);
    return date;
}

// Given a date and data, enters that information to the appropriate DB location
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

// Loads an individual day's cube representation on the "timeline"
// Passing in authenticated uid rather than checking for each cube, because this is
// iterated often

// In retrospect, probably could have just assembled one JSON data object and sent it in one go,
// but oh well.
function loadDayCube(uid, date) {
    
    // Base cube component to reuse
    let cube = $('<div class="cube"></div>');
    
    // Grabs directory location
    let location = firebase.database().ref('users/' + uid + '/log/' + date);

    // Takes snapshot
    location.once('value', function(snapshot) {
        
        // If there is data here
        if (snapshot.exists()) {
            
            // Customize and prepend our cube (prepend because most recent is at the end and we are working backwards in time)
            let data = snapshot.val();
            let mood = data.mood;
            mood = mood/5;
            let hue = data.hue;
            $('#cube-container').prepend(cube.clone().css('background-color', `hsl(${hue}, 70%, 70%)`).css('opacity', `${mood}`).attr('date', date));
            
        // If there is no data
        } else {
            // Display a blank cube for that day
            $('#cube-container').prepend(cube.clone().attr('date', date));
        }
    });
}

// Loads all days to the grid (via loadDayCube)
function loadDays() {
    
    // Adjustable variable to determine how many days are loaded to the grid
    let daysLoaded = 90;
    
    // Checking authentication
    let user = firebase.auth().currentUser;
    firebase.auth().onAuthStateChanged(function(user) {
        
        if (user) {
            
            // User is signed in.
            let uid = user.uid;
            
            // Grabs directory location
            let location = firebase.database().ref('users/' + uid + '/log');

            // Takes snapshot
            location.on('value', function(snapshot) {
                
                // Clearing out cubes from previous times this ran
                $('#cube-container').empty();
                
                // For each day for the past <daysLoaded> days
                for (let i = 0; i < daysLoaded; i++) {
                    let date = adjustDate(i);
                    
                    // Load cube for that day, whether data exists or not
                    loadDayCube(uid, date);
                }
            });
        }
    });
}

// Loads a form for entering a day's (date) information, with an added parameter to allow edits by default
// or require an extra click
function loadDayForm(date, editable) {
    
    // The usual authorization check
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {

            // User is signed in.
            let uid = user.uid;

            // Grabs directory location
            let location = firebase.database().ref('users/' + uid + '/log/' + date);

            // Takes snapshot
            location.once('value', function(snapshot) {
                if (snapshot.exists()) {
                    
                    // Finding our values from the snapshot
                    let data = snapshot.val();
                    let mood = data.mood;
                    let hue = data.hue;
                    let notes = data.notes;
                    let formattedDate = date;
                    
                    // Converting YYYYMMDD to a more readable YYYY-MM-DD for the UI
                    formattedDate = formattedDate.replace(/(\d{4})(\d{2})(\d{2})/g, '$1-$2-$3');
                    $('#post-date').text(formattedDate);
                    
                    // HTML/CSS changes to the form to reflect loaded data
                    $('#post-day').attr("date", date);
                    $('input[name="post-day-mood"]').prop('checked', false);
                    $(`#mood-${mood}`).prop('checked', true);
                    $('#post-day-hue').val(hue);
                    $('#post-day-notes').val(notes);
                    $('#post-day .rectangle-container').css('background-color', `hsl(${hue}, 70%, 70%)`);
                    
                    // Adjust UI to be more readable depending on background color
                    if (hue > 30 && hue < 231) {
                        $('#post-day .rectangle-container').removeClass('dark');
                        $('#post-day .rectangle-container').addClass('light');
                    } else {
                        $('#post-day .rectangle-container').removeClass('light');
                        $('#post-day .rectangle-container').addClass('dark');
                    }
                    
                    // If it is editable, make form elements usable, show/hide appropriate buttons
                    if (editable === true) {
                        $('input[name="post-day-mood"]').prop('disabled', false);
                        $('#post-day-hue').prop('disabled', false);
                        $('#post-day-notes').prop('disabled', false);
                        $('#post-day-submit').show();
                        $('#post-day-edit').hide();
                        
                    // Otherwise make form elements disabled, show/hide appropriate buttons
                    } else {
                        $('input[name="post-day-mood"]').prop('disabled', true);
                        $('#post-day-hue').prop('disabled', true);
                        $('#post-day-notes').prop('disabled', true);
                        $('#post-day-submit').hide();
                        $('#post-day-edit').show();
                    }
                // If this day doesn't have any data in DB
                } else {
                    // No data found
                    let formattedDate = date;
                    formattedDate = formattedDate.replace(/(\d{4})(\d{2})(\d{2})/g, '$1-$2-$3');
                    $('#post-date').text(formattedDate);
                    $('#post-day').attr("date", date);
                    
                    // Set some default values to the form (to prevent empty fields being sent back)
                    $('input[name="post-day-mood"]').prop('checked', false);
                    $(`#mood-3`).prop('checked', true);
                    $('#post-day-hue').val(210);
                    $('#post-day-notes').val('');
                    $('#post-day .rectangle-container').css('background-color', `hsl(210, 70%, 70%)`).addClass('dark');
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
    
    // Sign Up form functionality
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
    
    // Log In form functionality
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
    
    //Switching Forms between log in and sign up
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
    
    // Sign Out form functionality
    $('#sign-out').click(function(event) {
        event.preventDefault();
        firebase.auth().signOut()
            .then(() => {
                // Sign-out successful.
            }).catch((error) => {
                // An error happened.
        });
        window.location.reload();
        return false;
    });
    
    // Changes background of post day form based on selected hue
    $('#post-day-hue').on('input', function() {
        let hue = $(this).val();
        $('#post-day .rectangle-container').css('background-color', `hsl(${hue}, 70%, 70%)`);
        if (hue > 30 && hue < 231) {
            $('#post-day .rectangle-container').removeClass('dark');
            $('#post-day .rectangle-container').addClass('light');
        } else {
            $('#post-day .rectangle-container').removeClass('light');
            $('#post-day .rectangle-container').addClass('dark');
        }
    });
    
    // Sends form data to DB, calls updates to app timeline
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

    // Handles clicks on any cube in the app timeline
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
    
    // Edit button in a day view functionality
    $('#post-day-edit').click(function(event) {
        $('input[name="post-day-mood"]').prop('disabled', false);
        $('#post-day-hue').prop('disabled', false);
        $('#post-day-notes').prop('disabled', false);
        $('#post-day-submit').show();
        $('#post-day-edit').hide();
    });
    
    // App options controls
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
    
    // Close form functionality
    $('#app').on('click', '#close-post', function() {
        $('#post-day').fadeOut();
    });
});
