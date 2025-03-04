$(document).ready(function () {
    $('#register-form').submit(function (event) {
        event.preventDefault(); // Prevent normal form submission

        var email = $('#email').val();
        var password = $('#password').val();

        $.ajax({
            url: '/register',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ email: email, password: password }),
            success: function (response) {
                alert(response.message); // Show success message
                window.location.href = '/login'; // Redirect to login page
            },
            error: function (xhr) {
                alert(xhr.responseText || 'Registration failed. Try again.');
            }
        });
    });
});
