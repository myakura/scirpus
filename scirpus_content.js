'use strict';

class ScirpusContent {
  get ampLinkElement() {
    return document.querySelector(`link[rel="amphtml"][href]`);
  }
  get canonicalLinkElement() {
    return document.querySelector(`link[rel="canonical"][href]`);
  }
  isAMP() {
    const htmlElement = document.documentElement;
    return htmlElement.hasAttribute('⚡') || htmlElement.hasAttribute('amp');
  }
  hasAMP() {
    return !!this.ampLinkElement;
  }
  get ampURL() {
    return this.ampLinkElement?.href ?? null;
  }
  get canonicalURL() {
    if (!this.isAMP()) {
      return null;
    }
    return this.canonicalLinkElement?.href ?? null;
  }
  get pageType() {
    if (this.isAMP()) {
      return 'isamp';
    }
    if (this.hasAMP()) {
      return 'hasamp';
    }
    return '';
  }
  get ampInfo() {
    return {
      pageType: this.pageType,
      ampURL: this.ampURL,
      canonicalURL: this.canonicalURL,
    };
  }
}

// initialize
const scirpusContent = new ScirpusContent();

// message from background page
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.name === 'get-amp-info') {
    let ampInfo = null;
    if (scirpusContent.hasAMP() || scirpusContent.isAMP()) {
      ampInfo = scirpusContent.ampInfo;
    }
    sendResponse({ name: 'amp-info', data: ampInfo });
  }
});
