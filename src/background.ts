import GrappleEvent, { GrappleEventTypes } from "./event";
import Grapple from "./grapple";

const grapple = new Grapple();
// each tab has its own port
let ports: { [tabId: number]: chrome.runtime.Port } = {};

chrome.runtime.onConnect.addListener((port) => {
  if (port.sender?.tab?.id === undefined) return;

  ports[port.sender?.tab?.id] = port;

  port.onMessage.addListener((m: GrappleEvent) => {
    switch (m.type) {
      case GrappleEventTypes.Search:
        port?.postMessage(new GrappleEvent(GrappleEventTypes.ShowResults, grapple.search(m.payload)));
        break;
      case GrappleEventTypes.Navigate:
        chrome.tabs.create({ url: m.payload.url, active: true });
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

chrome.commands.onCommand.addListener((command, tab) => {
  if (!tab.id) return;

  switch (command) {
    case "open-grapple-overlay":
      // Send the message to the content script in the tab where the user pressed the command.
      ports[tab.id]?.postMessage(new GrappleEvent(GrappleEventTypes.ToggleOverlay, {}));
      break;
    default:
      break;
  }
});
