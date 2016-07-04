'use strict'

const updatePageAction = (message, sender) => {
  const tabID = sender.tab.id
  if (message.name === 'page-info') {
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
}

// message from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  updatePageAction(message, sender)
})

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