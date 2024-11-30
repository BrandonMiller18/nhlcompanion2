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
    return false;
}


function webhookRequest(payload) {
    let enableWebhook = getCookie("nhlc_enable_webhook");
    let webhook = getCookie("nhlc_webhook");
    if (enableWebhook == "true") { $.post(webhook, payload); }
}


async function createGoalHorn() {
    const team = getCookie("nhlc_team");
    const filepath = '/static/sounds/';

    const resp = await fetch(filepath + team.toLowerCase() + '.mp3');

    if (resp.ok) {
        const goalHorn = new Audio(filepath + team.toLowerCase() + '.mp3');
        return goalHorn;
    } else {
        const goalHorn = new Audio(filepath + 'goal.mp3');
        return goalHorn;
    };
};