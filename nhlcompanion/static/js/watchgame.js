// the game_id and user's team are set in the HTML as meta tags
// get the data from the meta tags and assign them to variables
var gameIdMeta = document.getElementById('game_id');
var game_id = gameIdMeta.getAttribute('data');
var userTeamMeta = document.getElementById('user_team');
var userTeam = userTeamMeta.getAttribute('data'); 
var streamDelayMeta = document.getElementById('stream_delay');
var streamDelay = streamDelayMeta.getAttribute('data') * 1000; 

// set the goal horn file
var goalHorn = new Audio('/static/sounds/' + userTeam.toLowerCase() + '.mp3');

// set default interval to check game data
var interval = 3000;

// set game over to false. If game is over, this will change to true and prevent more calls
var gameOver = false;

// KNOWN BUG WITH INTERVAL - on the first call, the interval is always 3 seconds, so no matter the state the call will be made twice
// this leads to an extra call even if the game is over or not started yet. 

function getGameData() {
    let gameData = $.ajax({
        type: "POST",
        url: "/watch-game/_update-score/" + game_id,
        success: function(){
            console.log("UPDATED SCORES");
            // if game over is false, run these functions, if true, do nothing
            if (!gameOver) {
                setTimeout(function() {
                    let newGameData = getGameData();
                    updateScore(newGameData);
                }, interval); // run this function at the determined interval based on game state
            } else {
                console.log("Game is over! :)")
            };
        },
        async: false
    });

    let res = gameData.responseJSON;

    return res;
};   

function updateScore(gameData) {

    // if game is not live, break function, do not send AJAX call, set scores
    if (gameData) {
        if (gameData.gameState != "LIVE") {
            $('#home-score').html(gameData.homeTeam.score);
            $('#away-score').html(gameData.awayTeam.score);
            $('#period-label').hide();
            if (gameData.gameState == "FUT") {
                $('#period').html("GAME NOT STARTED<br>Data is automatically refreshed every 30
                 minutes.");
                $('#time-div').hide();
                // if not started, check API every 30 minutes
                interval = 1800000; 
            } else if (gameData.gameState == "PRE") {
                $('#period').html("GAME ABOUT TO START<br>Data is automatically refreshed every 2 minutes.");
                // if pregame, check API every 2 minutes
                interval = 120000; 
            } else {
                $('#period').html("GAME OVER");
                $('#time-div').hide();
                gameOver = true;
                return;
            };
            $('#time-div').hide();
        };
    };

    // find current score as displayed on the page, this value is updated
    // if the new score is differnet... initial value is "Getting scores..."
    let homeScore = $('#home-score').html();
    let awayScore = $('#away-score').html()

    // set the new scores
    let newHomeScore = JSON.parse(gameData.homeTeam.score);
    let newAwayScore = JSON.parse(gameData.awayTeam.score);

    // get last period type of game returns str REG or OT (i think....)
    gameData.gameOutcome ? lastPeriodType = gameData.gameOutcome.lastPeriodType : lastPeriodType = false;

    // get game state returns str: LIVE, OFF, FUT
    let gameState = gameData.gameState;

    // get intermission state returns true/false
    let isIntermission = gameData.clock.inIntermission;

    // get period to display
    let displayPeriod = gameData.displayPeriod;

        if (isIntermission) {
            // if intermission, check only every 2 minutes
            interval = 120000;
            switch (displayPeriod) {
                case 1:
                    $('#period').html("1st Intermission");
                case 2:
                    $('#period').html("2nd Intermission");
            }
        } else if (gameData.gameState == "PRE" || gameData.gameState == "FUT" ) {
            console.log("pass")
        } else {
            interval = 3000;
            $('#period').html(displayPeriod);
        };

    // set the clock time 
    $('#time').html(gameData.clock.timeRemaining);

    // check if new score is different from old score
    // if it is, change it -- also checks if user_team for goal horn
    if (newHomeScore != homeScore ) {
        setTimeout(function() {
            $('#home-score').html(newHomeScore);
            console.log("Home team score update");
            if (newHomeScore > homeScore) {
                console.log("Home team scores");
            if (userTeam == gameData.homeTeam.abbrev) {
                goalHorn.play();
            };
            };
        }, streamDelay);
    };

    if (newAwayScore != awayScore) {
        setTimeout(function() {
            $('#away-score').html(newAwayScore);
            console.log("Away team score update");
            if (newAwayScore > awayScore) {
                console.log("Away team scores");
            if (userTeam == gameData.awayTeam.abbrev) {
                goalHorn.play();
            };
            };
        }, streamDelay);
    };

    console.log("Refreshing data every: " + interval / 1000 + " seconds");
}


   // when document loads, get the initial game data then run the update_score function
$(document).ready(function() {
    // get initial data to set game state, etc...
    let gameData = getGameData();

    // call function to continually update scores
    updateScore(gameData);
}); 