'use strict'

class ScirpusContent {
  getAMPLinkElement () {
    return document.querySelector(`link[rel="amphtml"][href]`)
  }
  isAMPPage () {
    const htmlElement = document.documentElement
    return htmlElement.hasAttribute('⚡') || htmlElement.hasAttribute('amp')
  }
  hasAMPPage () {
    const ampLinkElement = this.getAMPLinkElement()
    return !!ampLinkElement
  }
  getAMPPageURL () {
    if (!this.hasAMPPage()) {
      return null
    }
    return this.getAMPLinkElement().href
  }
  getAMPCacheURL () {
    if (!this.hasAMPPage()) {
      return null
    }
    const ampURL = this.getAMPPageURL()
    const ampCacheURLPrefix = 'https://cdn.ampproject.org/c/'
    if (ampURL.startsWith(ampCacheURLPrefix)) {
      return ampURL
    }
    // for HTTPS AMP pages, the prefix has additional `s/`
    const secure = (new URL(ampURL)).protocol === 'https:'
    return `${ampCacheURLPrefix}${!!secure ? 's/': ''}${ampURL.replace(/https?:\/\//, '')}`
  }
  getOriginalPageURL () {
    const canonicalLinkElement = document.querySelector(`link[rel="canonical"][href]`)
    if (this.isAMPPage() && !!canonicalLinkElement) {
      return canonicalLinkElement.href
    }
    else {
      return null
    }
  }
  getPageInfo () {
    return {
      pageURL: location.href,
      hasAMPPage: this.hasAMPPage(),
      ampPageURL: this.getAMPPageURL(),
      ampCacheURL: this.getAMPCacheURL(),
      isAMPPage: this.isAMPPage(),
      originalPageURL: this.getOriginalPageURL(),
    }
  }
}

// initialize
const scirpusContent = new ScirpusContent()

// message to background page
chrome.runtime.sendMessage({name: 'page-info', data: scirpusContent.getPageInfo()})

// message from background page
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.name === 'get-page-info') {
    sendResponse({name: 'page-info', data: scirpusContent.getPageInfo()})
  }
})