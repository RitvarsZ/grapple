import GrappleEvent, { GrappleEventTypes } from "./event";
import Grapple from "./grapple";

const grapple = new Grapple();
// each grapple tab has its own port
let ports: { [tabId: number]: chrome.runtime.Port } = {};

chrome.runtime.onConnect.addListener((port) => {
  if (port.sender?.tab?.id === undefined) return;

  ports[port.sender?.tab?.id] = port;

  port.onMessage.addListener((m: GrappleEvent) => {
    switch (m.type) {
      case GrappleEventTypes.Search:
        port?.postMessage(new GrappleEvent(GrappleEventTypes.ShowResults, grapple.search(m.payload)));
        break;
      default:
        break;
    }
  })

  port.onDisconnect.addListener(() => {
    if (port.sender?.tab?.id === undefined) return;

    delete ports[port.sender?.tab?.id];
  })
});

chrome.commands.onCommand.addListener((command: string, tab: chrome.tabs.Tab) => {
  switch (command) {
    case "open-grapple-overlay":
      // Open grapple index.html in a new tab
      chrome.tabs.create({ url: chrome.runtime.getURL("index.html"), active: true, index: tab.index + 1 });
      break;
    default:
      break;
  }
});
