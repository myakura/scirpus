'use strict';

const getAMPCacheURL = ampURL => {
  if (!ampURL.startsWith('http')) {
    throw new Error('Invalid AMP URL: it does not start with HTTP(S)');
  }
  let cacheURLPrefix = 'https://cdn.ampproject.org/c/';
  if (ampURL.startsWith(cacheURLPrefix)) {
    return ampURL;
  }
  // for HTTPS AMP pages, the prefix has additional `s/`
  cacheURLPrefix += ampURL.startsWith('https:') ? 's/' : '';
  return ampURL.replace(/https?:\/\//, cacheURLPrefix);
};

const updateBrowserAction = (ampInfo, tabID) => {
  let browserActionTitle = 'No AMP page found for this page 😫';
  if (ampInfo) {
    switch (ampInfo.pageType) {
      case 'hasamp':
        browserActionTitle = 'AMP page found for this page ⚡';
        break;
      case 'isamp':
        browserActionTitle = 'This is an AMP page ⚡';
        break;
    }
    chrome.browserAction.setTitle({ tabId: tabID, title: browserActionTitle });
    chrome.browserAction.enable();
  } else {
    chrome.browserAction.setTitle({ tabId: tabID, title: browserActionTitle });
    chrome.browserAction.disable();
  }
};

const updateContextMenu = ampInfo => {
  chrome.contextMenus.removeAll();
  if (ampInfo) {
    let contextMenuObject = {};
    switch (ampInfo.pageType) {
      case 'hasamp':
        contextMenuObject = {
          id: 'scirpus-hasamp',
          title: 'Go to AMP page',
          enabled: true,
        };
        break;
      case 'isamp':
        contextMenuObject = {
          id: 'scirpus-isamp',
          title: 'Go to regular (non-AMP) page',
          enabled: true,
        };
        break;
    }
    chrome.contextMenus.create(contextMenuObject);
  }
};

chrome.browserAction.onClicked.addListener(tab => {
  const tabID = tab.id;
  chrome.tabs.sendMessage(tabID, { name: 'get-amp-info' }, response => {
    const ampInfo = response.data;
    let updateURL = '';
    switch (ampInfo.pageType) {
      case 'hasamp':
        updateURL = getAMPCacheURL(ampInfo.ampURL);
        break;
      case 'isamp':
        updateURL = ampInfo.canonicalURL;
        break;
    }
    !!updateURL && chrome.tabs.update(tabID, { url: updateURL });
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  const tabID = tab.id;
  chrome.tabs.sendMessage(tabID, { name: 'get-amp-info' }, response => {
    const ampInfo = response.data;
    let updateURL = '';
    switch (info.menuItemId) {
      case 'scirpus-hasamp':
        updateURL = getAMPCacheURL(ampInfo.ampURL);
        break;
      case 'scirpus-isamp':
        updateURL = ampInfo.canonicalURL;
        break;
    }
    !!updateURL && chrome.tabs.update(tabID, { url: updateURL });
  });
});

chrome.tabs.onActivated.addListener(activeInfo => {
  const tabID = activeInfo.tabId;
  chrome.tabs.sendMessage(tabID, { name: 'get-amp-info' }, response => {
    updateBrowserAction(response.data, tabID);
    updateContextMenu(response.data);
  });
});

chrome.tabs.onUpdated.addListener((tabID, changeInfo, tab) => {
  // remove out-of-date context menus for pages that take time to load
  chrome.contextMenus.removeAll();

  if (changeInfo.status === 'complete') {
    chrome.tabs.sendMessage(tabID, { name: 'get-amp-info' }, response => {
      updateBrowserAction(response.data, tabID);
      updateContextMenu(response.data);
    });
  }
});
