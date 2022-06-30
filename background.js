/* global browser */

const offlineTabs = new Set();
const queryFilter = { highlighted: true, currentWindow: true };

function onBeforeRequestCallback(details) {
    if(offlineTabs.has(details.tabId)){
        return {cancel: true};
    }
}

function onRemoved(tabId) {
	if(offlineTabs.has(tabId)){
        offlineTabs.delete(tabId);
	}
}

function setOnline(tabId){
    if(offlineTabs.has(tabId)){
        offlineTabs.delete(tabId);
    }
    browser.browserAction.setBadgeText({tabId, text: 'ON' });
    browser.browserAction.setBadgeBackgroundColor({tabId, color: 'green'});
}

function setOffline(tabId){
    if(!offlineTabs.has(tabId)){
        offlineTabs.add(tabId);
    }
    browser.browserAction.setBadgeText({tabId, text: 'OFF' });
    browser.browserAction.setBadgeBackgroundColor({tabId, color: 'red'});
}
async function setHighlightedTabsOnline(){
    (await browser.tabs.query(queryFilter)).map( t => t.id ).forEach( tabId => {
        setOnline(tabId);
    });
}

async function setHighlightedTabsOffline(){
    (await browser.tabs.query(queryFilter)).map( t => t.id ).forEach( tabId => {
        setOffline(tabId);
    });
}

async function onClicked(tab){
    if(offlineTabs.has(tab.id)){
        setOnline(tab.id);
    }else{
        setOffline(tab.id);
    }
}

browser.browserAction.setBadgeText({text: 'ON' });
browser.browserAction.setBadgeBackgroundColor({color: 'green'});

browser.menus.create({
	title: "Online",
	contexts: ["tab"],
    onclick: setHighlightedTabsOnline
});

browser.menus.create({
	title: "Offline",
	contexts: ["tab"],
    onclick: setHighlightedTabsOffline
});

browser.webRequest.onBeforeRequest.addListener(onBeforeRequestCallback, { urls: ["<all_urls>"] }, ["blocking"] );
browser.browserAction.onClicked.addListener(onClicked);
browser.tabs.onRemoved.addListener(onRemoved);

