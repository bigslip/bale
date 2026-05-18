// Wait for the window's "load" event before executing the script to ensure DOM and libraries are fully loaded
window.addEventListener("load", () => {
    // Select elements in our layout to update user information dynamically
    const valNameEl = document.querySelector("#val_name");
    const valUsernameEl = document.querySelector("#val_username");
    const valIdEl = document.querySelector("#val_id");
    const avatarTextEl = document.querySelector("#avatar_text");

    // Select the interactive action cards
    const closeCardEl = document.querySelector("#close");
    const expandCardEl = document.querySelector("#expand");
    const enableClosingConfirmationCardEl = document.querySelector("#enableClosingConfirmation");
    const requestContactCardEl = document.querySelector("#requestContact");
    
    // Select the new interactive capability cards
    const toggleBackButtonCardEl = document.querySelector("#toggleBackButtonCard");
    const mockBackButtonEl = document.querySelector("#mockBackButton");
    const headerColorCardEl = document.querySelector("#headerColorCard");
    const scanQrCardEl = document.querySelector("#scanQrCard");
    const sendDataCardEl = document.querySelector("#sendDataCard");
    const sendDataInputEl = document.querySelector("#sendDataInput");
    const sendDataBtnEl = document.querySelector("#sendDataBtn");
    
    // Select mock terminal console elements
    const consoleLogsEl = document.querySelector("#consoleLogs");
    const clearConsoleBtnEl = document.querySelector("#clearConsoleBtn");

    // Safety check: verify if the Bale SDK is running in the native messenger environment
    const isBaleEnv = window.Bale && window.Bale.WebApp && window.Bale.WebApp.initDataUnsafe;

    // Local Mock Console Logging Helper
    const logToConsole = (message, type = "info") => {
        const timestamp = new Date().toLocaleTimeString();
        const logEntry = document.createElement("div");
        logEntry.className = `log-entry ${type}`;
        logEntry.textContent = `[${timestamp}] ${message}`;
        consoleLogsEl.appendChild(logEntry);
        consoleLogsEl.scrollTop = consoleLogsEl.scrollHeight;
    };

    // Clear console output handler
    clearConsoleBtnEl.addEventListener("click", () => {
        consoleLogsEl.innerHTML = '<div class="log-entry system">[System] Logs cleared.</div>';
    });

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
        logToConsole("Native SettingsButton initialized & shown.", "system");

        // Listen for standard settings press event callback
        window.Bale.WebApp.onEvent("settingsButtonPressed", () => {
            logToConsole("Native SettingsButton clicked!", "event");
        });
    }

    // Listen to close card click trigger
    closeCardEl.addEventListener("click", () => {
        logToConsole("Programmatic close WebApp session requested.", "info");
        if (isBaleEnv) {
            // Close the current Bale Mini App viewport session
            window.Bale.WebApp.close();
        } else {
            if (confirmationEnabled) {
                if (confirm("[Mock Environment] Are you sure you want to close the Mini App?")) {
                    logToConsole("[Mock Environment] Action close session confirmed.", "info");
                    alert("[Mock Environment] Close action card clicked. In native app, this shuts the Mini App.");
                } else {
                    logToConsole("[Mock Environment] Action close session cancelled by user.", "error");
                }
            } else {
                alert("[Mock Environment] Close action card clicked. In native app, this shuts the Mini App.");
            }
        }
    });

    // Listen to share contact card click trigger
    requestContactCardEl.addEventListener("click", () => {
        logToConsole("Requesting contact information...", "info");
        if (isBaleEnv) {
            // Method 1: Callback response handling
            window.Bale.WebApp.requestContact((wasShared, phoneNumber) => {
                logToConsole(`Contact sharing Callback received: ${wasShared ? "Shared" : "Rejected"}`, wasShared ? "info" : "error");
                if (wasShared && phoneNumber) {
                    logToConsole(`Phone Number: ${phoneNumber}`, "info");
                }
            });

            // Method 2: Global event handling
            window.Bale.WebApp.onEvent("contactRequested", (event) => {
                const wasShared = event.status === "sent";
                logToConsole(`Contact sharing Event received. Status: ${event.status}`, "event");
            });
        } else {
            const simulatedShare = confirm("[Mock Scanner] Share simulated phone number (+98 912 345 6789)?");
            if (simulatedShare) {
                logToConsole("[Mock Environment] Phone number shared successfully: +98 912 345 6789", "info");
            } else {
                logToConsole("[Mock Environment] Phone number sharing cancelled by user.", "error");
            }
        }
    });

    // Set closing confirmation initial active state on app load
    let confirmationEnabled = false;
    if (isBaleEnv) {
        confirmationEnabled = window.Bale.WebApp.isClosingConfirmationEnabled;
    }

    const beforeUnloadHandler = (e) => {
        e.preventDefault();
        e.returnValue = "Are you sure you want to exit?";
        return e.returnValue;
    };

    // Local utility function to cleanly update closing confirmation UI states
    const updateConfirmationUI = (enabled) => {
        const confirmationTitle = document.querySelector("#confirmationText");
        const confirmationDesc = enableClosingConfirmationCardEl.querySelector(".card-desc");
        
        if (enabled) {
            enableClosingConfirmationCardEl.classList.add("active-state");
            confirmationTitle.textContent = "Disable Close Alert";
            confirmationDesc.textContent = "Closing confirmation is currently ACTIVE";
            if (!isBaleEnv) {
                window.addEventListener("beforeunload", beforeUnloadHandler);
            }
        } else {
            enableClosingConfirmationCardEl.classList.remove("active-state");
            confirmationTitle.textContent = "Enable Close Alert";
            confirmationDesc.textContent = "Confirm exit to prevent data loss";
            if (!isBaleEnv) {
                window.removeEventListener("beforeunload", beforeUnloadHandler);
            }
        }
        logToConsole(`Closing confirmation behavior updated: ${enabled ? "ENABLED" : "DISABLED"}`, "info");
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
        }
    });

    // --- Back Button Control ---
    let backButtonVisible = false;
    
    const updateBackButtonUI = (visible) => {
        const titleEl = toggleBackButtonCardEl.querySelector("#backButtonText");
        const descEl = toggleBackButtonCardEl.querySelector(".card-desc");
        
        if (visible) {
            toggleBackButtonCardEl.classList.add("active-state");
            titleEl.textContent = "Disable Back Button";
            descEl.textContent = "Native header Back Button is currently VISIBLE";
            if (!isBaleEnv) {
                mockBackButtonEl.style.display = "flex";
            }
        } else {
            toggleBackButtonCardEl.classList.remove("active-state");
            titleEl.textContent = "Enable Back Button";
            descEl.textContent = "Toggle native header back button";
            if (!isBaleEnv) {
                mockBackButtonEl.style.display = "none";
            }
        }
        logToConsole(`Back Button visibility state: ${visible ? "VISIBLE" : "HIDDEN"}`, "info");
    };

    if (isBaleEnv) {
        // Register standard Native Back Button click listener
        window.Bale.WebApp.BackButton.onClick(() => {
            logToConsole("Native Back Button clicked!", "event");
        });
    } else {
        // Listen to Mock Back Button click trigger
        mockBackButtonEl.addEventListener("click", () => {
            logToConsole("[Mock Environment] Floating Back Button clicked!", "event");
            alert("[Mock Environment] Back Button clicked. Return callback executed.");
        });
    }

    toggleBackButtonCardEl.addEventListener("click", () => {
        if (isBaleEnv) {
            if (window.Bale.WebApp.BackButton.isVisible) {
                window.Bale.WebApp.BackButton.hide();
                updateBackButtonUI(false);
            } else {
                window.Bale.WebApp.BackButton.show();
                updateBackButtonUI(true);
            }
        } else {
            backButtonVisible = !backButtonVisible;
            updateBackButtonUI(backButtonVisible);
        }
    });

    // --- Dynamic Header Theme Color Picker ---
    const swatches = headerColorCardEl.querySelectorAll(".color-swatch");
    
    swatches.forEach(swatch => {
        swatch.addEventListener("click", (e) => {
            e.stopPropagation(); // Prevent trigger card click
            const hexColor = swatch.getAttribute("data-color");
            
            // Sync Swatch UI
            swatches.forEach(s => s.classList.remove("active-swatch"));
            swatch.classList.add("active-swatch");

            logToConsole(`Requesting Header Theme Color: ${hexColor}`, "info");

            if (isBaleEnv) {
                window.Bale.WebApp.setHeaderColor(hexColor);
            } else {
                // Morph the mock desktop body or header container styling dynamically
                const mockHeader = document.querySelector("header");
                if (mockHeader) {
                    mockHeader.style.background = `linear-gradient(135deg, ${hexColor}33, ${hexColor}15)`;
                    mockHeader.style.borderBottom = `2px solid ${hexColor}66`;
                    logToConsole(`[Mock Environment] Updated header background and border border accent to ${hexColor}`, "info");
                }
            }
        });
    });

    // --- Scan QR Code ---
    scanQrCardEl.addEventListener("click", () => {
        logToConsole("Launching native QR Code Scanner popup...", "info");
        if (isBaleEnv) {
            // Method 1: standard callback response handling
            window.Bale.WebApp.showScanQrPopup({ text: "Scan any QR code inside console demo" }, (text) => {
                logToConsole(`QR Scanner Callback result: ${text}`, "info");
            });

            // Method 2: Global event callback (fallback and verification)
            window.Bale.WebApp.onEvent("qrTextReceived", (event) => {
                logToConsole(`QR Scanner Event data: ${event.data}`, "event");
            });
        } else {
            const mockQr = prompt("[Mock Scanner] Enter text/URL payload to simulate a successful QR scan:");
            if (mockQr !== null) {
                logToConsole(`[Mock Environment] QR Code scanned: "${mockQr}"`, "info");
            } else {
                logToConsole("[Mock Environment] QR scanning cancelled by user.", "error");
            }
        }
    });

    // --- Send Data to Bot ---
    // Prevent default click-active behavior on the card itself due to interactive inputs
    sendDataCardEl.addEventListener("click", (e) => {
        e.stopPropagation();
    });

    const handleSendData = () => {
        const rawData = sendDataInputEl.value.trim();
        
        if (!rawData) {
            logToConsole("Send Data Error: Payload is empty.", "error");
            return;
        }

        // Measure payload byte size (Bale SDK limit is 4096 bytes)
        const byteSize = new Blob([rawData]).size;
        logToConsole(`Payload: "${rawData}" (${byteSize} bytes)`, "info");

        if (byteSize > 4096) {
            logToConsole("Send Data Error: Payload exceeds max size of 4096 bytes.", "error");
            return;
        }

        logToConsole("Sending payload data back to Bale Bot...", "info");

        if (isBaleEnv) {
            window.Bale.WebApp.sendData(rawData);
        } else {
            logToConsole(`[Mock Environment] sendData() executed with payload: "${rawData}"`, "info");
            alert(`[Mock Environment] sendData() called.\nPayload: "${rawData}"\n\nIn a real Bale conversation, this closes the WebApp and posts the text directly to the bot.`);
            sendDataInputEl.value = "";
        }
    };

    sendDataBtnEl.addEventListener("click", handleSendData);
    sendDataInputEl.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            handleSendData();
        }
    });

    // Listen to clicks on the expand card to maximize viewport space
    expandCardEl.addEventListener("click", () => {
        logToConsole("Requesting viewport expand...", "info");
        if (isBaleEnv) {
            // Request the Bale container client to expand the view
            window.Bale.WebApp.expand();
        } else {
            alert("[Mock Environment] Expand card clicked. In native app, this expands viewport to maximum.");
        }
    });
});
