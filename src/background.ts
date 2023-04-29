import GrappleEvent, { GrappleEventTypes } from "./event";
import Grapple from "./grapple";

const grapple = new Grapple();
let grapplePort: chrome.runtime.Port | undefined = undefined;

chrome.runtime.onConnect.addListener((port) => {
  grapplePort = port;

  grapplePort.onMessage.addListener((m: GrappleEvent) => {
    switch (m.type) {
      case GrappleEventTypes.Search:
        grapplePort?.postMessage(new GrappleEvent(GrappleEventTypes.ShowResults, grapple.search(m.payload)));
        break;
      case GrappleEventTypes.Navigate:
        chrome.tabs.create({ url: m.payload.url, active: true });
        break;
      default:
        break;
    }
  })
});

chrome.commands.onCommand.addListener((command, tab) => {
  if (!tab.id) return;

  switch (command) {
    case "open-grapple-overlay":
      grapplePort?.postMessage(new GrappleEvent(GrappleEventTypes.ToggleOverlay, {}));
      break;
    default:
      break;
  }
});
