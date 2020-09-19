var user_id = null;
var browser_id = null;
var autosync = true;

function main() {
  document.getElementsByClassName('log-in')[0].style.display = 'none';
  document.getElementsByClassName('name-prompt')[0].style.display = 'none';
  document.getElementsByClassName('browser-choice')[0].style.display = 'none';
  document.getElementsByClassName('switch-tabs')[0].style.display = 'none';
  retrieveStorage();
}

function retrieveStorage() { 
  chrome.storage.local.get(['user_dt'], gotStorage);
}

function gotStorage(item) {
  if(item.user_dt != null && item.user_dt.id_user != null && item.user_dt.id_browser != null && item.user_dt.autosync != null) {
    user_id = item.user_dt.id_user;
    browser_id = item.user_dt.id_browser;
    autosync = item.user_dt.autosync;
    
    if(autosync) {
      document.getElementById('autosyncButton').value = 'Turn Off AutoSync';
      document.getElementById('autosyncText').textContent = 'AutoSync On';
    } else {
      document.getElementById('autosyncButton').value = 'Turn On AutoSync';
      document.getElementById('autosyncText').textContent = 'AutoSync Off';
    }
  }

  if(user_id != null) {
    listTabs();
    document.getElementsByClassName('log-in')[0].style.display = 'none';
    document.getElementsByClassName('name-prompt')[0].style.display = 'none';
    document.getElementsByClassName('browser-choice')[0].style.display = 'none';
    document.getElementsByClassName('switch-tabs')[0].style.display = 'initial';
  } else {
    document.getElementsByClassName('log-in')[0].style.display = 'initial';
    document.getElementsByClassName('name-prompt')[0].style.display = 'none';
    document.getElementsByClassName('browser-choice')[0].style.display = 'none';
    document.getElementsByClassName('switch-tabs')[0].style.display = 'none';
  }
  
}

function onError(error) {
  console.log(error)
}

function listTabs() {
    //popular tabs from backend aqui
    const xhr = new XMLHttpRequest();
    const url='https://us-central1-xsync-extension.cloudfunctions.net/listTabs';
    let json = JSON.stringify({
      user: user_id
    });
    
    xhr.open("POST", url);
    xhr.setRequestHeader('Content-type', 'text/plain;charset=UTF-8');
    
    xhr.send(json);

    document.getElementById('tabs-list').textContent = "Loading tabs...";

    xhr.onload = () =>  {
      const resp = JSON.parse(xhr.response);

      if(resp.error == true) {
        //log off user

        let tosendJson = JSON.stringify({
              user: user_id,
              browser: browser_id,
              tabz: []
            });
        const xhr = new XMLHttpRequest();
        const url='https://us-central1-xsync-extension.cloudfunctions.net/updateTabs';
        xhr.open("POST", url);
        xhr.setRequestHeader('Content-type', 'text/plain;charset=UTF-8');
        
        xhr.send(tosendJson);
        xhr.onload = () =>  {
        }
        user_id = null;
        browser_id = null;
        chrome.storage.local.remove("user_dt", function() {
          console.log("logged out"); chrome.runtime.reload();
        });
      }

      let tabsList = document.getElementById('tabs-list');
      let currentTabs = document.createDocumentFragment();
      tabsList.textContent = '';

      for (let br of resp) {
        var enterElement = document.createElement('ent');
        
        if(br.name === browser_id) {
          enterElement.textContent = br.name + " (this browser)";
        } else {
          enterElement.textContent = br.name;
        }
        enterElement.style = "font-weight: bold";
        currentTabs.appendChild(enterElement);

        let tabs = br.tabs;
        for (let tab of tabs) {
          let tabLink = document.createElement('a');

          tabLink.textContent = tab.name;
          tabLink.style = "text-decoration: underline; color:grey;";
          tabLink.onclick = function() {
            chrome.tabs.create({url: tab.url});
          }
          tabLink.onmouseover = function() {
            tabLink.style.color = "blue";
            tabLink.style.cursor = "pointer";
          }
          tabLink.onmouseleave = function() {
            tabLink.style.color = "grey";
            tabLink.style.cursor = "auto";
          }
          tabLink.classList.add('switch-tabs');
          currentTabs.appendChild(tabLink);
        }
      }
      tabsList.appendChild(currentTabs);
    }
    
}

document.addEventListener("DOMContentLoaded", main);

function getCurrentWindowTabs() {
  return chrome.tabs.query({currentWindow: true});
}

document.addEventListener("click", (e) => {
  function callOnActiveTab(callback) {
    getCurrentWindowTabs().then((tabs) => {
      for (var tab of tabs) {
        if (tab.active) {
          callback(tab, tabs);
        }
      }
    });
  }

  if (e.target.id === "flogin") {
    user_id = document.getElementById('fname').value;

    // reset the error messages 
    document.getElementsByClassName('error-empty-key')[0].style.display = 'none';
    document.getElementsByClassName('error-wrong-key')[0].style.display = 'none';
    
    // prevent the user from trying to sign up with a empty key
    if (user_id == "") {
      document.getElementsByClassName('error-empty-key')[0].style.display = 'inline';
      return;
    }

    const xhr = new XMLHttpRequest();
    const url='https://us-central1-xsync-extension.cloudfunctions.net/listTabs';
    let json = JSON.stringify({
      user: user_id
    });
    
    xhr.open("POST", url);
    xhr.setRequestHeader('Content-type', 'text/plain;charset=UTF-8');
    
    xhr.send(json);
    xhr.onload = () =>  {
      const resp = JSON.parse(xhr.response);
      if(resp.error != null) {
        document.getElementsByClassName('error-wrong-key')[0].style.display = 'inline';
        console.log("User not found!");
        return;
      }
      document.getElementsByClassName('log-in')[0].style.display = 'none';
      document.getElementsByClassName('browser-choice')[0].style.display = 'initial';
      var browsers = [];
      for (let br of resp) {
        browsers.push(br.name);
      }
      var str = ''; // variable to store the options
      for (var i=0; i < browsers.length;++i){
        str += '<option value="'+browsers[i]+'" />'; // Storing options in variable
      }

      var my_list = document.getElementById("browsers-datalist");
      my_list.innerHTML = str;

    }
  }

  if(e.target.id === "fregister") {
    document.getElementsByClassName('log-in')[0].style.display = 'none';
    document.getElementsByClassName('name-prompt')[0].style.display = 'initial';

    browser_id = "Browser" + Math.floor((Math.random() * 10) + 1);
    document.getElementById('browser-name').value = browser_id;
  }

  if(e.target.id === "pcancel") {
    document.getElementsByClassName('log-in')[0].style.display = 'initial';
    document.getElementsByClassName('name-prompt')[0].style.display = 'none';
    document.getElementsByClassName('browser-choice')[0].style.display = 'none';
    browser_id = null;

    document.getElementsByClassName('error-empty-name')[0].style.display = 'none';
  }

  if(e.target.id === "psubmit") {
    // reset the error message for the new try
    document.getElementsByClassName('error-empty-name')[0].style.display = 'none';

    browser_id = document.getElementById('browser-name').value;

    // prevent the user from submiting a empty browser name
    if(browser_id == "") {
      document.getElementsByClassName('error-empty-name')[0].style.display = 'inline';
      return;
    }

    // remove the form display
    document.getElementsByClassName('name-prompt')[0].style.display = 'none';

    /*
    if(!window.confirm("You can find the Terms and Conditions here: https://menino.eu/xSync/termsandconditions\nYou can find the Privacy Policy here: https://menino.eu/xSync/privacypolicy\nClick OK if you have read, you understand and agree with the Terms and Conditions and the Privacy Policy.")) {
      document.getElementsByClassName('log-in')[0].style.display = 'initial';
      return;
    }
    */

    var tosend = [];
    chrome.tabs.query({}, function (tabs) {
      for(var i = 0; i < tabs.length; i++) {
        if(tabs[i].url.startsWith("http"))
          tosend.push({name: tabs[i].title, url: tabs[i].url})
      }
      const xhr = new XMLHttpRequest();
      const url='https://us-central1-xsync-extension.cloudfunctions.net/newUser';
      let json = JSON.stringify({
        browser: browser_id,
        tabs : tosend
      });
      
      xhr.open("POST", url);
      xhr.setRequestHeader('Content-type', 'text/plain;charset=UTF-8');
      
      xhr.send(json);
      xhr.onload = () =>  {
        const resp = JSON.parse(xhr.response);
        user_id = resp.result;

        document.getElementsByClassName('log-in')[0].style.display = 'none';
        document.getElementsByClassName('switch-tabs')[0].style.display = 'initial';
        listTabs();
        let user_dtt = {name: "user_dt", id_user: user_id, id_browser: browser_id, autosync: true};
        chrome.storage.local.set({user_dt: user_dtt}, function() {
          console.log('saved');
        });
      }
      
      

    });

  }

  if(e.target.id === "fbrowser") {
    // reset the error message for the new try
    document.getElementsByClassName('error-empty-name-after-login')[0].style.display = 'none';

    browser_id = document.getElementById('browsers').value;

     // prevent the user from submiting a empty browser name
     if(browser_id == "") {
      document.getElementsByClassName('error-empty-name-after-login')[0].style.display = 'inline';
      return;
    }

    document.getElementsByClassName('browser-choice')[0].style.display = 'none';
    document.getElementsByClassName('switch-tabs')[0].style.display = 'initial';
    let user_dtt = {name: "user_dt", id_user: user_id, id_browser: browser_id, autosync: true};
    chrome.storage.local.set({user_dt: user_dtt}, function(value) {console.log("saved")});
    manuallySendTabs();
    listTabs();
  }

  if(e.target.id === "syncb") {
    manuallySendTabs();
  }

  if(e.target.id === "privPolicy" || e.target.id === "privacyLink") {
    chrome.tabs.create({url: "https://menino.eu/xSync/privacypolicy"});
  }

  if(e.target.id === "termCond" || e.target.id === "termsLink") {
    chrome.tabs.create({url: "https://menino.eu/xSync/termsandconditions"});
  }

  if(e.target.id === "aboutB") {
    chrome.tabs.create({url: "https://menino.eu/xSync"});
  }

  if(e.target.id === "autosyncButton") {
    if(autosync) {
      autosync = false;
      document.getElementById('autosyncText').textContent = 'AutoSync Off';
      document.getElementById('autosyncButton').value = 'Turn On AutoSync';
    } else {
      autosync = true;
      document.getElementById('autosyncText').textContent = 'AutoSync On';
      document.getElementById('autosyncButton').value = 'Turn Off AutoSync';
    }

    let user_dtt = {name: "user_dt", id_user: user_id, id_browser: browser_id, autosync: autosync};
    chrome.storage.local.set({user_dt: user_dtt}, function(value) {console.log("saved")});
  }

  if(e.target.id === "viewUserKey") {
    window.alert("This is your user key: " + user_id + " \n\nKeep it safe (since anybody with it can access your synced content).")
  }

  if(e.target.id === "remAccount") {
    if(!window.confirm("Are you sure that you want to permanently delete your account? This will delete all information linked to your user key.")) {
      return;
    }

    console.log("Deleting account.");

    let tosendJson = JSON.stringify({
          user: user_id
        });
    const xhr = new XMLHttpRequest();
    const url='https://us-central1-xsync-extension.cloudfunctions.net/deleteUser';
    xhr.open("POST", url);
    xhr.setRequestHeader('Content-type', 'text/plain;charset=UTF-8');
    
    xhr.send(tosendJson);
    xhr.onload = () =>  {
      const resp = JSON.parse(xhr.response);
      console.log(xhr.response)
      if(resp.deleted === true) {
        user_id = null;
        browser_id = null;
        chrome.storage.local.remove('user_dt', function() {
          console.log("account removed"); chrome.runtime.reload();
        });
      } else {
        window.alert("Error deleting. Try again, please. Or contact us at menino.eu.")
      }
      
    }
    
  }

  if(e.target.id === "signoff") {
    console.log("Update sent w/ empty tabs.");

    let tosendJson = JSON.stringify({
          user: user_id,
          browser: browser_id,
          tabz: []
        });
    const xhr = new XMLHttpRequest();
    const url='https://us-central1-xsync-extension.cloudfunctions.net/updateTabs';
    xhr.open("POST", url);
    xhr.setRequestHeader('Content-type', 'text/plain;charset=UTF-8');
    
    xhr.send(tosendJson);
    xhr.onload = () =>  {
    }
    user_id = null;
    browser_id = null;
    chrome.storage.local.remove("user_dt", function() {
      console.log("logged out"); chrome.runtime.reload();
    });
  }

  e.preventDefault();
});


function manuallySendTabs() {
  var tosend = [];
  chrome.tabs.query({}, function (tabs) {
    for(var i = 0; i < tabs.length; i++) {
      if(tabs[i].url.startsWith("http"))
        tosend.push({name: tabs[i].title, url: tabs[i].url})
    }

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
      listTabs();
    }
  });
}



