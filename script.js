// Wait for the window's "load" event before executing the script to ensure DOM and libraries are fully loaded
window.addEventListener("load", () => {
    // Select elements in our new layout to update user information dynamically
    const valNameEl = document.querySelector("#val_name");
    const valUsernameEl = document.querySelector("#val_username");
    const valIdEl = document.querySelector("#val_id");
    const avatarTextEl = document.querySelector("#avatar_text");

    // Select the newly designed interactive action cards
    const closeCardEl = document.querySelector("#close");
    const expandCardEl = document.querySelector("#expand");
    const enableClosingConfirmationCardEl = document.querySelector("#enableClosingConfirmation");
    const requestContactCardEl = document.querySelector("#requestContact");

    // Safety check: verify if the Bale SDK is running in the native messenger environment
    const isBaleEnv = window.Bale && window.Bale.WebApp && window.Bale.WebApp.initDataUnsafe;

    // Retrieve user data if available, otherwise prepare a beautiful fallback mock environment for desktop browsers
    let user = {
        id: "42998877",
        first_name: "Bale Developer",
        username: "bale_dev_mode"
    };

    if (isBaleEnv && window.Bale.WebApp.initDataUnsafe.user) {
        user = window.Bale.WebApp.initDataUnsafe.user;
    }

    // Populate user profile info to the dynamic fields in our glassmorphic card
    valNameEl.textContent = user.first_name || "Unknown User";
    valUsernameEl.textContent = user.username ? `@${user.username}` : "Not Set";
    valIdEl.textContent = user.id || "-";

    // Set high-fidelity profile avatar text initials
    if (user.first_name) {
        const initials = user.first_name.trim().split(" ");
        if (initials.length >= 2) {
            avatarTextEl.textContent = (initials[0][0] + initials[1][0]).toUpperCase();
        } else if (initials[0]) {
            avatarTextEl.textContent = initials[0].substring(0, 2).toUpperCase();
        }
    } else {
        avatarTextEl.textContent = "BD";
    }

    // Initialize native settings button and event listener if available in Bale environment
    if (isBaleEnv) {
        // Show Bale settings button in the native navigation header
        window.Bale.WebApp.SettingsButton.show();

        // Listen for standard settings press event callback
        window.Bale.WebApp.onEvent("settingsButtonPressed", () => {
            console.log("Handle onClick event on SettingsButton");
        });
    }

    // Listen to close card click trigger
    closeCardEl.addEventListener("click", () => {
        if (isBaleEnv) {
            // Close the current Bale Mini App viewport session
            window.Bale.WebApp.close();
        } else {
            alert("[Mock Environment] Close action card clicked. In native app, this shuts the Mini App.");
        }
    });

    // Listen to share contact card click trigger
    requestContactCardEl.addEventListener("click", () => {
        if (isBaleEnv) {
            // Method 1: Callback response handling
            window.Bale.WebApp.requestContact((wasShared) => {
                console.log("Method 1 sharing state: ", wasShared ? "Shared" : "Not shared");
            });

            // Method 2: Global event handling
            window.Bale.WebApp.onEvent("contactRequested", (event) => {
                const wasShared = event.status === "sent";
                console.log("Method 2 sharing state: ", wasShared ? "Shared" : "Not shared");
            });
        } else {
            alert("[Mock Environment] Request Contact action card clicked.");
        }
    });

    // Set closing confirmation initial active state on app load
    let confirmationEnabled = false;
    if (isBaleEnv) {
        confirmationEnabled = window.Bale.WebApp.isClosingConfirmationEnabled;
    }

    // Local utility function to cleanly update closing confirmation UI states
    const updateConfirmationUI = (enabled) => {
        const confirmationTitle = document.querySelector("#confirmationText");
        const confirmationDesc = enableClosingConfirmationCardEl.querySelector(".card-desc");
        
        if (enabled) {
            enableClosingConfirmationCardEl.classList.add("active-state");
            confirmationTitle.textContent = "Disable Close Alert";
            confirmationDesc.textContent = "Closing confirmation is currently ACTIVE";
        } else {
            enableClosingConfirmationCardEl.classList.remove("active-state");
            confirmationTitle.textContent = "Enable Close Alert";
            confirmationDesc.textContent = "Confirm exit to prevent data loss";
        }
    };

    // Execute initial state check to sync CSS class names
    updateConfirmationUI(confirmationEnabled);

    // Listen to clicks on the close confirmation toggle card
    enableClosingConfirmationCardEl.addEventListener("click", () => {
        if (isBaleEnv) {
            if (window.Bale.WebApp.isClosingConfirmationEnabled) {
                window.Bale.WebApp.disableClosingConfirmation();
                updateConfirmationUI(false);
            } else {
                window.Bale.WebApp.enableClosingConfirmation();
                updateConfirmationUI(true);
            }
        } else {
            confirmationEnabled = !confirmationEnabled;
            updateConfirmationUI(confirmationEnabled);
            console.log("[Mock Environment] Closing confirmation status: ", confirmationEnabled);
        }
    });

    // Listen to clicks on the expand card to maximize viewport space
    expandCardEl.addEventListener("click", () => {
        if (isBaleEnv) {
            // Request the Bale container client to expand the view
            window.Bale.WebApp.expand();
        } else {
            alert("[Mock Environment] Expand card clicked. In native app, this expands viewport to maximum.");
        }
    });
});
