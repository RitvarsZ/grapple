import GrappleEvent, { GrappleEventTypes } from "./event";

const backgroundPort = chrome.runtime.connect({ name: 'grapple-port' });
var results: chrome.bookmarks.BookmarkTreeNode[] = [];

backgroundPort.onMessage.addListener((m: GrappleEvent) => {
  switch (m.type) {
    case GrappleEventTypes.ToggleOverlay:
      toggleOverlay();
      break;
    case GrappleEventTypes.ShowResults:
      results = m.payload;
      renderBookmarks();
      break;
    default:
      break;
  }
});

const toggleOverlay = () => {
  const overlay = document.querySelector('.grapple-container')

  if (!(overlay instanceof HTMLElement)) return

  if (overlay.classList.contains('grapple-container--active')) {
    overlay.classList.remove('grapple-container--active');

    return
  }

  overlay.classList.add('grapple-container--active');
  searchBox.focus();
}

const renderBookmarks = () => {
  searchResults.innerHTML = '';
  console.log(results)
  results.forEach((result) => {
    const bookmarkElement = document.createElement('div');
    bookmarkElement.classList.add('grapple-result');
    const favicon = new URL(chrome.runtime.getURL("/_favicon/"));
    favicon.searchParams.set("pageUrl", result.url || '');
    favicon.searchParams.set("size", "32");
    bookmarkElement.innerHTML = `
      <img src="${favicon.toString()}" />
      <span>${result.title}</span>
    `;
    searchResults.appendChild(bookmarkElement);
  });
}

const template = `
  <div class="grapple-overlay">
    <div class="grapple-search-box">
      <input type="text" id="grapple-input" />
    </div>

    <div class="grapple-search-results"/>
  </div>`;


var overlay = document.createElement('div');
overlay.classList.add('grapple-container');
overlay.innerHTML = template;

var searchBox = overlay.querySelector('#grapple-input') as HTMLInputElement;
var searchResults = overlay.querySelector('.grapple-search-results') as HTMLDivElement;

document.addEventListener('keydown', (event) => {
  switch (event.key) {
    case 'Escape':
      toggleOverlay();
      break;
    case 'Enter':
      if (results[0]) {
        backgroundPort.postMessage(new GrappleEvent(GrappleEventTypes.Navigate, results[0]));
      }
      toggleOverlay();
      break;
    default:
      break;
  }
});

searchBox.addEventListener('input', (event) => {
  if (!(event.target instanceof HTMLInputElement)) return
  backgroundPort.postMessage(new GrappleEvent(GrappleEventTypes.Search, event.target.value));
});

document.body.appendChild(overlay);