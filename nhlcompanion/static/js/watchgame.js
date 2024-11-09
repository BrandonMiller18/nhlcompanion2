let slug = (url) => new URL(url).pathname.match(/[^\/]+/g);
var gameId = slug(document.location.href)[2];

// set variables from cookies
var gameIdMeta = getCookie("nhlc_game_id")
var userTeam = getCookie("nhlc_team");
var streamDelay = getCookie("nhlc_stream_delay");
var webhook = getCookie("nhlc_webhook");
var homeTeamLogo = getCookie("nhlc_homeTeamLogo");
var awayTeamLogo = getCookie("nhlc_awayTeamLogo");
var homeTeamId = getCookie("nhlc_homeTeamId");
var awayTeamId = getCookie("nhlc_awayTeamId");
var userTeamId = getCookie("nhlc_userTeamId");

// set the goal horn file
var goalHorn = new Audio('/static/sounds/' + userTeam.toLowerCase() + '.mp3');

// set default interval to check game data
var interval = 3000;

// set game over to false. If game is over, this will change to true and prevent more calls
var gameOver = false;

function getGameData(callback) {

    $.ajax({
        type: "get",
        url: "/watch-game/_update-score/" + gameId,
        dataType: "json",
        success: function (data) {
            callback(data)
        },
        error: function (err) {
            console.log(err);
        }
    });

};


function showToast(playType, player, playerHeadshot, teamLogo) {
    const toast = document.getElementById('toast');

    if (toast) {
        toast.querySelector('.play-type').textContent = playType;
        toast.querySelector('.player-name').textContent = player;
        toast.querySelector('.player-headshot').src = playerHeadshot;
        toast.querySelector('.team-logo-toast').src = teamLogo;

        // Show the toast with the 'show' class
        toast.classList.add('show');

        //Fade out after 3 seconds
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
}


function setContent(gameData) {
    const liveGameStates = ["LIVE", "CRIT"];
    let isIntermission = gameData.clock.inIntermission;

    $('#home-score').html(gameData.homeTeam.score);
    $('#away-score').html(gameData.awayTeam.score);
    $('#time').html(gameData.clock.timeRemaining);
    $('#period').html(gameData.displayPeriod);


    if (!(liveGameStates.includes(gameData.gameState))) {

        $('#period-label').hide();
        if (gameData.gameState == "FUT") {
            $('#period').html("GAME NOT STARTED<br>Data is automatically refreshed every 30 minutes.");
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
    } else {
        $('#period-label').show();
        $('#time-div').show();

    };

    if (isIntermission) {
        // if intermission, check only every 2 minutes
        interval = 120000;
        $('#period-label').hide();

        switch (gameData.displayPeriod) {
            case 1:
                $('#period').html("1st Intermission");
            case 2:
                $('#period').html("2nd Intermission");
        }
    } else {
        $('#period-label').show();
    }

}


function evaluatePlay(play, gameData) {
    console.log(play.typeDescKey);
    if (play.typeDescKey == "goal") {
        var scoringPlayerId = play.details.scoringPlayerId;
        console.log(scoringPlayerId);
        var scoringPlayerTotal = play.details.scoringPlayerTotal;

        var primaryAssistPlayerId = play.details.assist1PlayerId;
        var secondaryAssistPlayerId = play.details.assist2PlayerId;
        var scoringTeamId = play.details.eventOwnerTeamId;

        var newHomeScore = play.details.homeScore;
        var newAwayScore = play.details.awayScore;


        for (i = 0; i < gameData.rosterSpots.length; i++) {
            if (gameData.rosterSpots[i].playerId == scoringPlayerId) {
                var playerFirstName = gameData.rosterSpots[i].firstName.default;
                var playerLastName = gameData.rosterSpots[i].lastName.default;
                var playerNumber = gameData.rosterSpots[i].sweaterNumber.default;
                var playerHeadshot = gameData.rosterSpots[i].headshot;
                var playerTeamId = gameData.rosterSpots[i].teamId;
                if (playerTeamId == homeTeamId) {
                    var displayLogo = homeTeamLogo
                } else {
                    var displayLogo = awayTeamLogo
                }
                console.log(playerHeadshot);
                showToast('Goal', playerFirstName + ' ' + playerLastName, playerHeadshot, displayLogo);
            };
        };


        if (scoringTeamId == userTeamId) {
            webhookRequest(webhook, null);
            goalHorn.play();
        }


    };
}


async function watchGame(gameData) {
    const liveGameStates = ["LIVE", "CRIT"];

    var seenPlayIds = []
    for (i = 0; i < gameData.plays.length; i++) {
        let eventId = gameData.plays[i].eventId;
        seenPlayIds.push(eventId);
    }

    while (liveGameStates.includes(gameData.gameState)) {
        await new Promise(r => setTimeout(r, streamDelay * 1000));

        getGameData(function (res) {
            console.log(res);
            setContent(res);

            var plays = res.plays

            for (i = 0; i < plays.length; i++) {
                let playId = plays[i].eventId;
                if (!(seenPlayIds.includes(playId))) {
                    evaluatePlay(plays[i], gameData);
                    seenPlayIds.push(playId);
                };
            };
        });
    };
};


$(document).ready(function () {
    getGameData(function (gameData) {
        setContent(gameData);
        watchGame(gameData);
    });
});