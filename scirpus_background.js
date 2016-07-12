'use strict'

const getAMPCacheURL = (ampURL) => {
  if (!ampURL.startsWith('http')) {
    throw new Error('Invalid AMP URL: it does not start with HTTP(S)')
  }
  let ampCacheURLPrefix = 'https://cdn.ampproject.org/c/'
  if (ampURL.startsWith(ampCacheURLPrefix)) {
    return ampURL
  }
  // for HTTPS AMP pages, the prefix has additional `s/`
  ampCacheURLPrefix += (ampURL.startsWith('https:')) ? 's/' : ''
  return ampURL.replace(/https?:\/\//, ampCacheURLPrefix)
}

const updatePageAction = (ampInfo, tabID) => {
  let pageActionTitle = 'No AMP page found for this page 😫'
  if (ampInfo) {
    switch (ampInfo.pageType) {
      case 'hasamp':
        pageActionTitle = 'AMP page found for this page ⚡'
        break
      case 'isamp':
        pageActionTitle = 'This is an AMP page ⚡'
        break
    }
    chrome.pageAction.setTitle({tabId: tabID, title: pageActionTitle})
    chrome.pageAction.show(tabID)
  }
  else {
    chrome.pageAction.setTitle({tabId: tabID, title: pageActionTitle})
    chrome.pageAction.hide(tabID)
  }
}

const updateContextMenu = (ampInfo) => {
  chrome.contextMenus.removeAll()
  if (ampInfo) {
    let contextMenuObject = {}
    switch (ampInfo.pageType) {
      case 'hasamp':
        contextMenuObject = {id: 'scirpus-hasamp', title: 'Go to AMP page', enabled: true}
        break
      case 'isamp':
        contextMenuObject = {id: 'scirpus-isamp', title: 'Go to regular (non-AMP) page', enabled: true}
        break
    }
    chrome.contextMenus.create(contextMenuObject)
  }
}

chrome.pageAction.onClicked.addListener(tab => {
  const tabID = tab.id
  chrome.tabs.sendMessage(tabID, {name: 'get-amp-info'}, response => {
    const ampInfo = response.data
    let updateURL = ''
    switch (ampInfo.pageType) {
      case 'hasamp':
        updateURL = getAMPCacheURL(ampInfo.ampPageURL)
        break
      case 'isamp':
        updateURL = ampInfo.canonicalURL
        break
    }
    !!updateURL && chrome.tabs.update(tabID, {url: updateURL})
  })
})

chrome.contextMenus.onClicked.addListener((info, tab) => {
  const tabID = tab.id
  chrome.tabs.sendMessage(tabID, {name: 'get-amp-info'}, response => {
    const ampInfo = response.data
    let updateURL = ''
    switch (info.menuItemId) {
      case 'scirpus-hasamp':
        updateURL = getAMPCacheURL(ampInfo.ampPageURL)
        break
      case 'scirpus-isamp':
        updateURL = ampInfo.canonicalURL
        break
    }
    !!updateURL && chrome.tabs.update(tabID, {url: updateURL})
  })
})

chrome.tabs.onActivated.addListener(activeInfo => {
  const tabID = activeInfo.tabId
  chrome.tabs.sendMessage(tabID, {name: 'get-amp-info'}, response => {
    updatePageAction(response.data, tabID)
    updateContextMenu(response.data)
  })
})

chrome.tabs.onUpdated.addListener((tabID, changeInfo, tab) => {
  // remove out-of-date context menus for pages that take time to load
  chrome.contextMenus.removeAll()

  if (changeInfo.status === 'complete') {
    chrome.tabs.sendMessage(tabID, {name: 'get-amp-info'}, response => {
      updatePageAction(response.data, tabID)
      updateContextMenu(response.data)
    })
  }
})