# xSync

## What it does
This [open-source](TODOLink) extension allows the user to sync tabs between different browsers (e.g., Firefox and Chrome).

## How it works
* The user logs in with a user key and can see the tabs from all the logged-in browsers. This key is personal and **should be kept private** (since anyone with it can see the user's tabs' names and URLs).
* If the user has no key yet, the user can click on the register button and a key is automatically generated for the user.
* This extension is fully [open-source](TODOlink)

## Permisions asked
* **Storage**
  * This permission is asked so that we can save the user key so that the user doesn't have to login each time it opens the extension.
* **Tabs**
  * We use this permission to access the titles/names and URLs of the browser tabs. We don't access/save the content of the page itself—only it's title and URL.

## Where to install it
* You can find the Firefox extension [here](link) and the Chrome extension [here](link).

## Terms and Conditions and Privacy Policy
* By using this open-source extension you are agreeing to it's [privacy policy](linkhere) and [terms and conditions](linkhere).

## How this repository is organized
The repository is organized into two parts:
* Frontend
  * Where it has the client code. Each folder for each browser.
* Backend
  * Where it has the server code. This code is implemented using NodeJS and it's made to work on Firebase Cloud Functions.

## Next steps
* Making it available for Safari and Opera.
* Also syncing bookmarks between different browsers.
* Whatever you want to do—that's one of the reasons why it's open source 😉

## About me
* You can find me at [menino.eu](https://menino.eu). Hit me up if you need anything.
* If you find this useful, consider buying me a beer by donating to [paypal.me/hisetip](paypal.me/hisetip).
