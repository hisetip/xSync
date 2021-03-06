
// chrome.browserAction.setBadgeText({text: length.toString()});
// chrome.browserAction.setBadgeBackgroundColor({'color': 'red'});

function onError(error) {
  console.log(error)
}

chrome.tabs.onUpdated.addListener(sendTabs);

/* The goal of this is when the windows are closed, the tabs are updated
but it doesn't work.
chrome.windows.onRemoved.addListener((tabId, removeInfo) => {
  lastTimeSent = null;
  sendTabs();
});*/

var lastTimeSent = null; //in ms
var lastTabsSent = null;

function sendTabs() {
  var d = new Date();
  var n = d.getTime();
  if(lastTimeSent != null && (n - lastTimeSent) < 600000 ) {
    return;
  }

  chrome.storage.local.get(['user_dt'], function(item) {
    var user_id = null;
    var browser_id = null;
    var autosync = true;

    if(item.user_dt != null && item.user_dt.id_user != null && item.user_dt.id_browser != null && item.user_dt.autosync != null) {
      user_id = item.user_dt.id_user;
      browser_id = item.user_dt.id_browser;
      autosync = item.user_dt.autosync;
    } else {
      return;
    }

    if(!autosync) {
      return;
    }

    lastTimeSent = n;

    var tosend = [];
    chrome.tabs.query({}, function (tabs) {
      for(var i = 0; i < tabs.length; i++) {
        if(tabs[i].url.startsWith("http"))
          tosend.push({name: tabs[i].title, url: tabs[i].url})
      }  
      if(!changedTabs(tosend)) {
        console.log("Update not sent bc no changes.")
        return;
      }
      lastTabsSent = tosend;

      console.log("Update sent.");

      let tosendJson = JSON.stringify({
            user: user_id,
            browser: browser_id,
            tabz: tosend
          });;
      const xhr = new XMLHttpRequest();
      const url='https://us-central1-xsync-extension.cloudfunctions.net/updateTabs';
      xhr.open("POST", url);
      xhr.setRequestHeader('Content-type', 'text/plain;charset=UTF-8');
      
      xhr.send(tosendJson);
      xhr.onload = () =>  {
        const resp = JSON.parse(xhr.response);
      }
    });
  });
}

function changedTabs(newOnes) {
  if(lastTabsSent == null || newOnes.length != lastTabsSent.length) {
    return true;
  }

  for(var i = 0; i < newOnes.length; i++) {
    if(newOnes[i].url != lastTabsSent[i].url) {
      return true;
    } 
  }
  return false;
}


sendTabs();