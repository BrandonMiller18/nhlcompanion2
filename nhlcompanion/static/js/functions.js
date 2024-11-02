function setCookie(cookie) {
    document.cookie = cookie + ';path=/';
}

function getCookie(name) {
    // Create a name pattern to match the cookie
    const namePattern = name + "=";
    // Decode the cookie string and split by semicolon
    const decodedCookie = decodeURIComponent(document.cookie);
    const cookiesArray = decodedCookie.split(';');

    // Loop through cookies to find the match
    for (let cookie of cookiesArray) {
        cookie = cookie.trim(); // Remove whitespace
        if (cookie.indexOf(namePattern) === 0) {
            return cookie.substring(namePattern.length);
        }
    }

    // Return null if the cookie is not found
    return null;
}
