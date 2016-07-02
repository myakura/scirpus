'use strict'

const webBrowser = chrome || browser

const updatePageAction = (message, sender) => {
  const tabID = sender.tab.id
  if (message.name === 'page-info') {
    if (message.data.hasAMPPage) {
      webBrowser.pageAction.setTitle({tabId: tabID, title: 'AMP page found for this page ⚡'})
      webBrowser.pageAction.show(tabID)
    }
    else if (message.data.isAMPPage) {
      webBrowser.pageAction.setTitle({tabId: tabID, title: 'This is an AMP page ⚡'})
      webBrowser.pageAction.show(tabID)
    }
    else {
      webBrowser.pageAction.setTitle({tabId: tabID, title: 'No AMP page found for this page 😫'})
      webBrowser.pageAction.hide(tabID)
    }
  }
}

// message from content script
webBrowser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  updatePageAction(message, sender)
})

webBrowser.pageAction.onClicked.addListener(tab => {
  const tabID = tab.id
  webBrowser.tabs.sendMessage(tabID, {name: 'get-page-info'}, response => {
    if (response.data.hasAMPPage) {
      webBrowser.tabs.update(tabID, {url: response.data.ampCacheURL})
    }
    else if (response.data.isAMPPage) {
      webBrowser.tabs.update(tabID, {url: response.data.originalPageURL})
    }
  })
})