'use strict'

const updatePageAction = (message, tabID) => {
  if (message.data.hasAMPPage) {
    chrome.pageAction.setTitle({tabId: tabID, title: 'AMP page found for this page ⚡'})
    chrome.pageAction.show(tabID)
  }
  else if (message.data.isAMPPage) {
    chrome.pageAction.setTitle({tabId: tabID, title: 'This is an AMP page ⚡'})
    chrome.pageAction.show(tabID)
  }
  else {
    chrome.pageAction.setTitle({tabId: tabID, title: 'No AMP page found for this page 😫'})
    chrome.pageAction.hide(tabID)
  }
}

const updateContextMenu = (message) => {
  chrome.contextMenus.removeAll()
  if (message.data.hasAMPPage) {
    chrome.contextMenus.create({id: 'scirpus-hasamp', title: 'Go to AMP page', enabled: true})
  }
  else if (message.data.isAMPPage) {
    chrome.contextMenus.create({id: 'scirpus-isamp', title: 'Go to regular (non-AMP) page', enabled: true})
  }
}

chrome.pageAction.onClicked.addListener(tab => {
  const tabID = tab.id
  chrome.tabs.sendMessage(tabID, {name: 'get-page-info'}, response => {
    if (response.data.hasAMPPage) {
      chrome.tabs.update(tabID, {url: response.data.ampCacheURL})
    }
    else if (response.data.isAMPPage) {
      chrome.tabs.update(tabID, {url: response.data.originalPageURL})
    }
  })
})

chrome.contextMenus.onClicked.addListener((info, tab) => {
  const tabID = tab.id
  chrome.tabs.sendMessage(tabID, {name: 'get-page-info'}, response => {
    if (info.menuItemId === 'scirpus-hasamp') {
      chrome.tabs.update(tabID, {url: response.data.ampCacheURL})
    }
    else if (info.menuItemId === 'scirpus-isamp') {
      chrome.tabs.update(tabID, {url: response.data.originalPageURL})
    }
  })
})

chrome.tabs.onActivated.addListener(activeInfo => {
  const tabID = activeInfo.tabId
  chrome.tabs.sendMessage(tabID, {name: 'get-page-info'}, response => {
    updatePageAction(response, tabID)
    updateContextMenu(response)
  })
})

chrome.tabs.onUpdated.addListener((tabID, changeInfo, tab) => {
  // remove out-of-date context menus for pages that take time to load
   chrome.contextMenus.removeAll()

  if (changeInfo.status === 'complete') {
    chrome.tabs.sendMessage(tabID, {name: 'get-page-info'}, response => {
      updatePageAction(response, tabID)
      updateContextMenu(response)
    })
  }
})