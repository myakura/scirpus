'use strict'

class ScirpusContent {
  get ampLinkElement () {
    return document.querySelector(`link[rel="amphtml"][href]`)
  }
  isAMPPage () {
    const htmlElement = document.documentElement
    return htmlElement.hasAttribute('⚡') || htmlElement.hasAttribute('amp')
  }
  hasAMPPage () {
    const ampLinkElement = this.ampLinkElement
    return !!ampLinkElement
  }
  get ampPageURL () {
    if (!this.hasAMPPage()) {
      return null
    }
    return this.ampLinkElement.href
  }
  get ampCacheURL () {
    if (!this.hasAMPPage()) {
      return null
    }
    const ampURL = this.ampPageURL
    const ampCacheURLPrefix = 'https://cdn.ampproject.org/c/'
    if (ampURL.startsWith(ampCacheURLPrefix)) {
      return ampURL
    }
    // for HTTPS AMP pages, the prefix has additional `s/`
    const secure = (new URL(ampURL)).protocol === 'https:'
    return `${ampCacheURLPrefix}${!!secure ? 's/': ''}${ampURL.replace(/https?:\/\//, '')}`
  }
  get originalPageURL () {
    const canonicalLinkElement = document.querySelector(`link[rel="canonical"][href]`)
    if (this.isAMPPage() && !!canonicalLinkElement) {
      return canonicalLinkElement.href
    }
    else {
      return null
    }
  }
  get pageInfo () {
    return {
      pageURL: location.href,
      hasAMPPage: this.hasAMPPage(),
      ampPageURL: this.ampPageURL,
      ampCacheURL: this.ampCacheURL,
      isAMPPage: this.isAMPPage(),
      originalPageURL: this.originalPageURL,
    }
  }
}

// initialize
const scirpusContent = new ScirpusContent()

// message from background page
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.name === 'get-page-info') {
    sendResponse({name: 'page-info', data: scirpusContent.pageInfo})
  }
})