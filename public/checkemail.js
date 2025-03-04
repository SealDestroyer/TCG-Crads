// $(document).ready(function () {
//     $('#email').on('input', function () {
//         var email = $(this).val();
//         var emailError = $('#email-error');
//         var registerButton = $('#register-button');
//         var emailPattern = /^[a-zA-Z0-9._%+-]+@gmail\.com$/; // Only allows @gmail.com

//         // If user has not typed "@gm", do nothing
//         if (!email.includes("@gm")) {
//             emailError.text(''); // Clear any error message
//             registerButton.prop('disabled', false).css({ 'background-color': '', 'color': '' });
//             return;
//         }

//         // Now validate the full "@gmail.com" format
//         if (!emailPattern.test(email)) {
//             registerButton.prop('disabled', true).css({ 'background-color': '#ff7f6e', 'color': 'black' });
//             emailError.text('Only @gmail.com emails are allowed!').css('color', 'red');
//             return; // STOP AJAX from running
//         }

//         // Run AJAX only if the email is valid
//         $.ajax({
//             url: '/checkEmail',
//             type: 'GET',
//             data: { email: email },
//             success: function (response) {
//                 if (!emailPattern.test(email)) {
//                     // If the user changes the email while AJAX is running, don't update UI
//                     return;
//                 }

//                 if (response.exists) {
//                     registerButton.prop('disabled', true).css({ 'background-color': '#ff7f6e', 'color': 'black' });
//                     emailError.text('Email already registered!').css('color', 'red');
//                 } else {
//                     registerButton.prop('disabled', false).css({ 'background-color': '', 'color': '' });
//                     emailError.text('Email is available!').css('color', 'green');
//                 }
//             },
//             error: function () {
//                 emailError.text('Error checking email. Please try again.').css('color', 'red');
//             }
//         });
//     });
// });

$(document).ready(function () {
    $('#email').on('input', function () {
        var email = $(this).val();
        var emailError = $('#email-error');
        var registerButton = $('#register-button');
        var emailPattern = /^[a-zA-Z0-9._%+-]+@gmail\.com$/; // Only allows @gmail.com format

        // If the email is too short, clear errors and disable the register button
        if (email.length < 10) {
            emailError.text('').removeClass('active');
            registerButton.prop('disabled', true).css({ 'background-color': '#ff7f6e', 'color': 'black' });
            return;
        }

        // If the email does not exactly match the pattern, show validation error and disable button
        if (!emailPattern.test(email)) {
            emailError.text('Only @gmail.com emails are allowed!').css('color', 'red').addClass('active');
            registerButton.prop('disabled', true).css({ 'background-color': '#ff7f6e', 'color': 'black' });
            return; // Stop here so AJAX is not fired
        }

        // Format is correct, clear error messages
        emailError.text('').removeClass('active');

        // Run AJAX to check if the email already exists
        $.ajax({
            url: '/checkEmail',
            type: 'GET',
            data: { email: email },
            success: function (response) {
                // Double-check current email in case user changed it while AJAX was running
                var currentEmail = $('#email').val();
                if (!emailPattern.test(currentEmail)) {
                    emailError.text('Only @gmail.com emails are allowed!').css('color', 'red').addClass('active');
                    registerButton.prop('disabled', true).css({ 'background-color': '#ff7f6e', 'color': 'black' });
                    return;
                }
                if (response.exists) {
                    registerButton.prop('disabled', true).css({ 'background-color': '#ff7f6e', 'color': 'black' });
                    emailError.text('Email already registered!').css('color', 'red').addClass('active');
                } else {
                    registerButton.prop('disabled', false).css({ 'background-color': '', 'color': '' });
                    emailError.text('Email is available!').css('color', 'green').addClass('active');
                }
            },
            error: function () {
                emailError.text('Error checking email. Please try again.').css('color', 'red').addClass('active');
            }
        });
    });

    // Additional validation on register button click
    $('#register-button').on('click', function (e) {
        var email = $('#email').val().trim();
        var password = $('#password').val().trim();
        var emailError = $('#email-error');
        var passwordError = $('#password-error');

        // Clear previous errors
        emailError.text('').removeClass('active');
        passwordError.text('').removeClass('active');

        if (email === '') {
            emailError.text('Please enter your email.').css('color', 'red').addClass('active');
            e.preventDefault(); // Prevent form submission
        }

        if (password === '') {
            passwordError.text('Please enter your password.').css('color', 'red').addClass('active');
            e.preventDefault(); // Prevent form submission
        }
    });
});

