const functions = require('firebase-functions');
var admin = require("firebase-admin");

var serviceAccount = require("./secret/firebase_privkey.json");

var cors = require('cors')({origin: true});

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://xsync-extension.firebaseio.com"
});

/*// adds a tab
exports.addTab = functions.https.onRequest(async (req, res) => {
    cors(req, res, () => {});

    // Grab the text parameter.
    const body = JSON.parse(req.body);
    const user = body.user;
    const browser_id = body.browser;
    const tab_url = body.taburl;
    const tab_name = body.tabname;

    if(user === null || browser_id === null || tab_url === null || tab_name === null) {
      res.status(404).send("");
      return;
    }

    let query = admin.firestore().collection('users').doc(user);

    var u = await (await admin.firestore().collection('users').doc(user).get()).data();

    if(u === null) {
      res.status(404).send("");
      return;
    }

    if(u.dailyreqcount >= 1000) {
      res.status(500).send("Too many requests for today.");
    }

    var oldDate= new Date(u.lastaccess.seconds * 1000);

    if(oldDate.getUTCDay() !== new Date().getUTCDay()) {
      u.dailyreqcount = 0;
    } else {
      u.dailyreqcount = u.dailyreqcount + 1;
    }

    u.lastaccess = new Date();
    
    var browserExists = false;
    for(var i = 0; i < u.browsers.length; i++) {
      if(u.browsers[i].name === browser_id) {
        browserExists = true;
        var tabfound = false;
        for(var j = 0; j < u.browsers[i].tabs.length; j++) {
          if(u.browsers[i].tabs[j].url === tab_url) {
            tabfound = true;
          }
        }
        if(!tabfound) {
          u.browsers[i].tabs.push({name: tab_name, url: tab_url});
        }
      }
    }
    if(!browserExists) {
      var tabsA = [];
      tabsA.push({name: tab_name, url: tab_url});
      u.browsers.push({name: browser_id, tabs: tabsA});
    }

    await admin.firestore().collection('users').doc(user).set(u).then(ref => {
      res.json("");
      return true;
    });
  });

// removes a tab
exports.removeTab = functions.https.onRequest(async (req, res) => {
    cors(req, res, () => {});
    // Grab the text parameter.
    const body = JSON.parse(req.body);
    const user = body.user;
    const browser_id = body.browser;
    const tab_url = body.taburl;

    if(user === null || browser_id === null || tab_url === null) {
      res.status(404).send("");
      return;
    }

    let query = admin.firestore().collection('users').doc(user);

    var u = await (await admin.firestore().collection('users').doc(user).get()).data();

    if(u === null) {
      res.status(404).send("");
      return;
    }

    if(u.dailyreqcount >= 1000) {
      res.status(500).send("Too many requests for today.");
    }

    var oldDate= new Date(u.lastaccess.seconds * 1000);

    if(oldDate.getUTCDay() !== new Date().getUTCDay()) {
      u.dailyreqcount = 0;
    } else {
      u.dailyreqcount = u.dailyreqcount + 1;
    }

    u.lastaccess = new Date();
    
    for(var i = 0; i < u.browsers.length; i++) {
      if(u.browsers[i].name === browser_id) {
        for(var j = 0; j < u.browsers[i].tabs.length; j++) {
          if(u.browsers[i].tabs[j].url === tab_url) {
            u.browsers[i].tabs.splice(j, 1);
            break;
          }
        }
      }
    }

    await admin.firestore().collection('users').doc(user).set(u).then(ref => {
      res.json("");
      return true;
    });
  });*/

// list user tabs
exports.listTabs = functions.https.onRequest(async (req, res) => {
    cors(req, res, () => {});
    // Grab the text parameter.
    const body = JSON.parse(req.body);
    const user = body.user;

    if(user === null) {
      res.json({error: true});
      return;
    }

    var u = await (await admin.firestore().collection('users').doc(user).get()).data();
    
    if(u === undefined) {
      res.json({error: true});
      return;
    }

    if(u.dailyreqcount >= 1000) {
      res.json({error: true});
      return;
    }

    var oldDate= new Date(u.lastaccess.seconds * 1000);

    if(oldDate.getUTCDay() !== new Date().getUTCDay()) {
      u.dailyreqcount = 0;
    } else {
      u.dailyreqcount = u.dailyreqcount + 1;
    }

    u.lastaccess = new Date();

    await admin.firestore().collection('users').doc(user).update('dailyreqcount', u.dailyreqcount);

    res.json(u.browsers);
  });

  // creates a user
exports.newUser = functions.https.onRequest(async (req, res) => {
  cors(req, res, () => {});
  // Grab the text parameter.
  const body = JSON.parse(req.body);
  const browser_id = body.browser;
  const tabs = body.tabs;

  if(browser_id === null || tabs === null) {
    res.json({error: true});
    return;
  }
    const writeResult = await admin.firestore().collection('users').add({browsers: [{name: browser_id, tabs: tabs}], dailyreqcount: 0, lastaccess: new Date()} );
    // Send back a message that we've succesfully written the message
    res.json({result: writeResult.id});
  });

exports.updateTabs = functions.https.onRequest(async (req, res) => {
    cors(req, res, () => {});

    // Grab the text parameter.
    const body = JSON.parse(req.body);
    const user = body.user;
    const browser_id = body.browser;
    const tabs = body.tabz

    if(user === null || browser_id === null || tabs === null) {
      res.json({error: true});
      return;
    }

    var u = await (await admin.firestore().collection('users').doc(user).get()).data();

    if(u === undefined) {
      res.json({error: true});
      return;
    }

    if(u.dailyreqcount >= 1000) {
      res.send("Too many requests for today.");
      return;
    }

    var oldDate= new Date(u.lastaccess.seconds * 1000);

    if(oldDate.getUTCDay() !== new Date().getUTCDay()) {
      u.dailyreqcount = 0;
    } else {
      u.dailyreqcount = u.dailyreqcount + 1;
    }

    u.lastaccess = new Date();
    
    var browserExists = false;
    for(var i = 0; i < u.browsers.length; i++) {
      if(u.browsers[i].name === browser_id) {
        browserExists = true;
        u.browsers[i].tabs = tabs;
      }
    }
    if(!browserExists) {
      u.browsers.push({name: browser_id, tabs: tabs});
    }

    var newBrowsers = [];
    for(i = 0; i < u.browsers.length; i++) {
      if(u.browsers[i].tabs.length > 0) {
        newBrowsers.push(u.browsers[i]);
      }
    }

    u.browsers = newBrowsers;

    await admin.firestore().collection('users').doc(user).set(u).then(ref => {
      res.json("");
      return true;
    });
  });
  
    // deletes user account
exports.deleteUser = functions.https.onRequest(async (req, res) => {
  cors(req, res, () => {});
  // Grab the text parameter.
  const body = JSON.parse(req.body);
  const user_id = body.user;

  if(user_id === null) {
    res.json({error: true});
    return;
  }
    const writeResult = await admin.firestore().collection('users').doc(user_id).delete();

    var u = await (await admin.firestore().collection('users').doc(user_id).get()).data();

    if(u !== undefined) {
      res.json({error: true});
      return;
    }

    // Send back a message that we've succesfully deleted
    res.json({deleted: true});
  });