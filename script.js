window.addEventListener("load", () => {
    const userDataEl = document.querySelector("#user_data");

    const closeBtnEl = document.querySelector("#close");
    const expandBtnEl = document.querySelector("#expand");
    const enableClosingConfirmationBtnEl = document.querySelector("#enableClosingConfirmation");
    const requestContactBtnEl = document.querySelector("#requestContact");

    const user = window.Bale.WebApp.initDataUnsafe.user;

    userDataEl.innerHTML = `
    ID: ${user.id} <br/>
    First Name: ${user.first_name} <br/>
    Username: ${user.username} <br/>
    `;

    // Show Settings Button
    window.Bale.WebApp.SettingsButton.show();

    // handle onClick event on SettingsButton
    window.Bale.WebApp.onEvent("settingsButtonPressed", () => {
        console.log("Handle onClick event on SettingsButton")
    })

    // close miniapp
    closeBtnEl.addEventListener("click", () => {
        window.Bale.WebApp.close();
    })

    // request user number
    requestContactBtnEl.addEventListener("click", () => {
        // result can be received with 2 ways:
        // 1. passing callback function
        window.Bale.WebApp.requestContact((wasShared)=>{
            console.log("First way: ", wasShared ? "Number shared by user.": "Number not shared by user.")
        });

        // 2. add event handler
        window.Bale.WebApp.onEvent("contactRequested", (event) => {
            const wasShared = event.status === "sent" ;
            console.log("Second way: ", wasShared ?  "Number shared by user.": "Number not shared by user.")
        })
    })

    // enable/disable closing confirmation
    enableClosingConfirmationBtnEl.addEventListener("click", () => {
        if(window.Bale.WebApp.isClosingConfirmationEnabled){
            window.Bale.WebApp.disableClosingConfirmation();
            enableClosingConfirmationBtnEl.textContent="enable closing confirmation"
        }
        else {
            window.Bale.WebApp.enableClosingConfirmation();
            enableClosingConfirmationBtnEl.textContent="disable closing confirmation"
        }
    })

    // expand
    expandBtnEl.addEventListener("click", () => {
        window.Bale.WebApp.expand();
    })
})
