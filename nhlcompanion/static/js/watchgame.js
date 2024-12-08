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

        //Fade out after x seconds
        setTimeout(() => {
            toast.classList.remove('show');
        }, 10000);
    };
};


function showNotification(title, bodyContent, iconContent) {

    if (!window.Notification) {
        console.log('Browser does not support notifications.');
    } else {
        // check if permission is already granted
        if (window.Notification.permission === 'granted') {
            notify = new window.Notification('A goal was scored!', {
                body: bodyContent,
                icon: iconContent,
            });
        };
    };
};


function setContent(gameData) {
    const liveGameStates = ["LIVE", "CRIT"];
    let isIntermission = gameData.clock.inIntermission;

    $('#home-score').html(gameData.homeTeam.score);
    $('#away-score').html(gameData.awayTeam.score);
    $('#time').html(gameData.clock.timeRemaining);
    $('#period').html(gameData.displayPeriod);


    if (!(liveGameStates.includes(gameData.gameState))) {
        $('#period').hide();
        $('#time-div').hide();

        if (gameData.gameState == "FUT") {
            $('#period-label').html("This game has not started<br>Data is automatically refreshed every 2 minutes.");
            return;
        } else if (gameData.gameState == "PRE") {
            $('#period-label').html("PREGAME<br>Data is automatically refreshed every 30 seconds.");
            return;
        } else {
            $('#period-label').html("GAME OVER");
            return;
        };
    } else {
        $('#period').show();
        $('#time-div').show();
        $('#period-label').html("Period: ");
        $('#time-label').html("Time Remaining: ")
    }

    if (isIntermission) {
        $('#period').hide();

        if (gameData.displayPeriod == 1) {
            $('#period-label').html("1st Intermission");
        } else if (gameData.displayPeriod == 2) {
            $('#period-label').html("2nd Intermission");
        } else {
            $('#period-label').html("Intermission");
        };
    } else {
        $('#period').show();
    };
};


async function evaluatePlay(play, gameData) {
    if (play.typeDescKey == "shot-on-goal" && play.periodDescriptor.number == gameData.displayPeriod) {
        console.log('same period shot');
        return;
    };

    if (play.typeDescKey == "goal") {
        if (play.details.eventOwnerTeamId == userTeamId) {
            webhookRequest(null);
            playGoalHorn();
        };

        var scoringPlayerId = play.details.scoringPlayerId;
        var scoringPlayerTotal = play.details.scoringPlayerTotal;

        var primaryAssistPlayerId = play.details.assist1PlayerId;
        var secondaryAssistPlayerId = play.details.assist2PlayerId;

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
                showToast('Goal', playerFirstName + ' ' + playerLastName, playerHeadshot, displayLogo);
                showNotification(play.typeDescKey, playerFirstName + ' ' + playerLastName, displayLogo);
            };
        };
    };

    return play.eventId // return id to add to seen plays
};


async function watchGame(gameData) {
    const liveGameStates = ["LIVE", "CRIT"];
    const preGameStates = ["PRE", "FUT"];

    let seenPlayIds = []
    for (i = 0; i < gameData.plays.length; i++) {
        let eventId = gameData.plays[i].eventId;
        seenPlayIds.push(eventId);
    }

    while (preGameStates.includes(gameData.gameState)) {
        if (gameData.gameState == "FUT") {
            await new Promise(r => setTimeout(r, 120 * 1000));
        } else if (gameData.gameState == "PRE") {
            await new Promise(r => setTimeout(r, 30 * 1000));
        };

        getGameData(function (res) {
            gameData.gameState = res.gameState;
            setContent(res);
        });
    }

    while (liveGameStates.includes(gameData.gameState)) {
        await new Promise(r => setTimeout(r, streamDelay * 1000));

        getGameData(async function (res) {
            gameData.gameState = res.gameState;
            setContent(res);

            let plays = res.plays

            for (i = 0; i < plays.length; i++) {
                let playId = plays[i].eventId;
                if (!(seenPlayIds.includes(playId))) {
                    seenPlayIds.push(await evaluatePlay(plays[i], gameData));
                };
            };
        });
    };
};


$(document).ready(function () {
    window.Notification.requestPermission();
    getGameData(function (gameData) {
        setContent(gameData);
        watchGame(gameData);
    });
});