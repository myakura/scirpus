'use strict'

const webBrowser = chrome || browser

// message from content script
webBrowser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const tabID = sender.tab.id
  if (message.hasAMPPage) {
    webBrowser.pageAction.setTitle({tabId: tabID, title: 'AMP page found for this page⚡'})
    webBrowser.pageAction.show(tabID)
  }
  else {
    webBrowser.pageAction.setTitle({tabId: tabID, title: 'No AMP page found for this page😫'})
    webBrowser.pageAction.hide(tabID)
  }
})