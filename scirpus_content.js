'use strict'

const webBrowser = chrome || webBrowser

const ampLinkElement = document.querySelector(`link[rel="amphtml"][href]`)

const isAMPPage = () => {
  const html = document.documentElement
  return html.hasAttribute('⚡') || html.hasAttribute('amp')
}

const hasAMPPage = () => {
  return !!ampLinkElement
}

const getAMPPageURL = () => {
  if (!hasAMPPage()) {
    return null
  }
  return ampLinkElement.href
}

const getAMPCacheURL = () => {
  if (!hasAMPPage()) {
    return null
  }
  const ampURL = getAMPPageURL()
  const ampCacheURLPrefix = 'https://cdn.ampproject.org/c/'
  if (ampURL.startsWith(ampCacheURLPrefix)) {
    return ampURL
  }
  // for HTTPS AMP pages, the prefix has additional `s/`
  const secure = (new URL(ampURL)).protocol === 'https:'
  return `${ampCacheURLPrefix}${!!secure ? 's/': ''}${ampURL.replace(/https?:\/\//, '')}`
}

const getOriginalPageURL = () => {
  const canonicalLinkElement = document.querySelector(`link[rel="canonical"][href]`)
  if (isAMPPage() && !!canonicalLinkElement) {
    return canonicalLinkElement.href
  }
  else {
    return null
  }
}

const getPageInfo = () => {
  return {
    pageURL: location.href,
    hasAMPPage: hasAMPPage(),
    ampPageURL: getAMPPageURL(),
    ampCacheURL: getAMPCacheURL(),
    isAMPPage: isAMPPage(),
    originalPageURL: getOriginalPageURL(),
  }
}

// message to background page
webBrowser.runtime.sendMessage({name: 'page-info', data: getPageInfo()})

// message from background page
webBrowser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.name === 'get-page-info') {
    sendResponse({name: 'page-info', data: getPageInfo()})
  }
})