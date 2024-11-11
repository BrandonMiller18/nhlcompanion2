let wakeLock = null;

async function requestWakeLock() {

    if (confirm("Allow NHL Companion to keep your browser awake?\nSwitching to a new tab may stop the app.")) {
        try {
            wakeLock = await navigator.wakeLock.request("screen");
            console.log("Wake lock is active");
        } catch (err) {
            console.error("Failed to acquire wake lock:", err);
        }
    } else {
        console.log("Wake lock denied.")
    }

}

async function releaseWakeLock() {
    if (wakeLock !== null) {
        try {
            await wakeLock.release();
            wakeLock = null;
            console.log("Wake lock has been released");
        } catch (err) {
            console.error("Failed to release wake lock:", err);
        }
    }
}

document.addEventListener("visibilitychange", async () => {
    if (document.visibilityState === "visible") {
        await requestWakeLock();
    } else {
        await releaseWakeLock();
    }
});

window.addEventListener("load", async () => {
    await requestWakeLock();
});
