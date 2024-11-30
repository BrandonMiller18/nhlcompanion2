// Create a global variable for the goalHorn
let goalHorn;

async function playGoalHorn() {
    // Ensure goalHorn is resolved from the createGoalHorn function
    if (!goalHorn) {
        goalHorn = await createGoalHorn();
    };

    goalHorn.play();

    const goalHornButton = $('#goal-horn');
    goalHornButton.text("Disable Horn");
    goalHornButton.attr("onclick", "stopGoalHorn()");
    goalHornButton.addClass("disable-goal-horn");
};

function stopGoalHorn() {
    if (goalHorn) {
        goalHorn.pause();
        goalHorn.currentTime = 0; // Reset playback to the start
    };

    const goalHornButton = $('#goal-horn');
    goalHornButton.html("<i style='margin-right: 10px;' class='fa-solid fa-volume-high'></i>Sound Goal Horn");
    goalHornButton.attr("onclick", "playGoalHorn()");
    goalHornButton.removeClass("disable-goal-horn");
};