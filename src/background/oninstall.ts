chrome.runtime.onInstalled.addListener(details => {
  if (details.reason === 'install') {
    window.open(chrome.extension.getURL('options-page/options.html'));
  }
});
