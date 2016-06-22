'use strict'

const webBrowser = chrome || webBrowser

const ampLinkElement = document.querySelector(`link[rel="amphtml"][href]`)

const hasAMPPage = () => {
  return !!ampLinkElement
}

// message to background page
const pageInfo = {
  pageURL: location.href,
  hasAMPPage: hasAMPPage(),
}
webBrowser.runtime.sendMessage(pageInfo)