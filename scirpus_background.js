'use strict'

const webBrowser = chrome || browser

// message from content script
webBrowser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const tabID = sender.tab.id
  if (message.hasAMPPage) {
    webBrowser.pageAction.setTitle({tabId: tabID, title: 'AMP page found for this page⚡'})
    webBrowser.pageAction.show(tabID)
  }
  else if (message.isAMPPage) {
    webBrowser.pageAction.setTitle({tabId: tabID, title: 'This is an AMP page⚡'})
    webBrowser.pageAction.show(tabID)
  }
  else {
    webBrowser.pageAction.setTitle({tabId: tabID, title: 'No AMP page found for this page😫'})
    webBrowser.pageAction.hide(tabID)
  }
})

webBrowser.pageAction.onClicked.addListener(tab => {
  const tabID = tab.id
  webBrowser.tabs.sendMessage(tabID, 'get-page-info', response => {
    if (response.hasAMPPage) {
      webBrowser.tabs.update(tabID, {url: response.ampCacheURL})
    }
    else if (response.isAMPPage) {
      webBrowser.tabs.update(tabID, {url: response.originalPageURL})
    }
  })
})