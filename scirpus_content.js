'use strict';

class ScirpusContent {
  get ampLinkElement() {
    return document.querySelector(`link[rel="amphtml"][href]`);
  }
  isAMP() {
    const htmlElement = document.documentElement;
    return htmlElement.hasAttribute('⚡') || htmlElement.hasAttribute('amp');
  }
  hasAMP() {
    return !!this.ampLinkElement;
  }
  get ampURL() {
    if (!this.hasAMP()) {
      return null;
    }
    return this.ampLinkElement.href;
  }
  get canonicalURL() {
    const canonicalLinkElement = document.querySelector(
      `link[rel="canonical"][href]`,
    );
    if (!!canonicalLinkElement && this.isAMP()) {
      return canonicalLinkElement.href;
    } else {
      return null;
    }
  }
  get pageType() {
    let type = '';
    if (this.hasAMP()) {
      type = 'hasamp';
    }
    if (this.isAMP()) {
      type = 'isamp';
    }
    return type;
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
