import { showGrappleOverlay } from "./overlay";
chrome.commands.onCommand.addListener((command) => {
  if (command === "open-grapple-overlay") {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      const activeTab = tabs[0];

      if (activeTab.id === undefined) {
        return
      }

      chrome.scripting.executeScript({
        target: { tabId: activeTab.id },
        func: showGrappleOverlay,
      });
    });
  }
});
