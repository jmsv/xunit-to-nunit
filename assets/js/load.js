// Display message when converted test has been copied
function showCopiedSnackbar() {
    var x = document.getElementById("snackbar")
    x.className = "show";
    setTimeout(function () {
        x.className = x.className.replace("show", "");
    }, 3000);
}


// Function to run when page loads
function loadPage() {
    // Initialise clipboard
    new Clipboard('.clipboard');
}
window.onload = loadPage; // Runs above function
