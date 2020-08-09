'use strict';

function getAmpLinkElement() {
  return document.querySelector('link[rel="amphtml"][href]');
}

function getCanonicalLinkElement() {
  return document.querySelector('link[rel="canonical"][href]');
}

function isAMP() {
  return document.documentElement.matches('html[⚡], html[amp]');
}

function hasAMP() {
  const ampLinkElement = getAmpLinkElement();
  return !!ampLinkElement;
}

function getAmpURL() {
  const ampLinkElement = getAmpLinkElement();
  return ampLinkElement?.href ?? null;
}

function getCanonicalURL() {
  if (!isAMP()) {
    return null;
  }
  const canonicalLinkElement = getCanonicalLinkElement();
  return canonicalLinkElement?.href ?? null;
}

function getPageType() {
  if (isAMP()) {
    return 'isamp';
  }
  if (hasAMP()) {
    return 'hasamp';
  }
  return '';
}

function getAmpInfo() {
  return {
    pageType: getPageType(),
    ampURL: getAmpURL(),
    canonicalURL: getCanonicalURL(),
  };
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('scirpus: got a message.', message);
  if (message.name === 'get-amp-info') {
    let ampInfo = null;
    if (hasAMP() || isAMP()) {
      ampInfo = getAmpInfo();
    }
    const response = { name: 'amp-info', data: ampInfo };
    console.log('scirpus: sending back a response.', response);
    sendResponse(response);
  }
});
