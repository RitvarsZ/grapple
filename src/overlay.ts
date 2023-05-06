import GrappleEvent, { GrappleEventTypes } from "./event";
import { Bookmark } from "./grapple";
import "./scss/overlay.scss";

const backgroundPort = chrome.runtime.connect({ name: 'grapple-port' });
var results: Bookmark[] = [];
var selectedResult: number = -1;

backgroundPort.onMessage.addListener((m: GrappleEvent) => {
  switch (m.type) {
    case GrappleEventTypes.ShowResults:
      results = m.payload;
      renderBookmarks();
      break;
    default:
      break;
  }
});

const renderBookmarks = () => {
  searchResults.innerHTML = '';

  results.forEach((result) => {
    const bookmarkElement = document.createElement('a');
    bookmarkElement.href = result.url;
    bookmarkElement.classList.add('grapple-result');
    const favicon = new URL(chrome.runtime.getURL("/_favicon/"));
    favicon.searchParams.set("pageUrl", result.url);
    favicon.searchParams.set("size", "32");
    bookmarkElement.innerHTML = `
      <img src="${favicon.toString()}" alt="icon" />
      <div>
        <div class="title">${result.title}</div>
        <div class="folder">${result.folder}</div>
      </div>
    `;
    searchResults.appendChild(bookmarkElement);

    bookmarkElement.addEventListener('mousemove', () => {
      selectResult(results.indexOf(result));
    });
  });

  if (results[0]) {
    selectResult(0)
  } else {
    selectedResult = -1;
  }
}

const selectResult = (index: number) => {
  const bookmarkElements = searchResults.querySelectorAll('.grapple-result') as NodeListOf<HTMLAnchorElement>;
  if (bookmarkElements.length === 0) {
    selectedResult = -1;
    return;
  };

  //wrap around
  if (index < 0) {
    index = bookmarkElements.length - 1;
  } else if (index >= bookmarkElements.length) {
    index = 0;
  }

  bookmarkElements[index].focus({ preventScroll: true });
  bookmarkElements[index].scrollIntoView({ behavior: 'smooth', block: 'center' })
  selectedResult = index;
}

var searchBox = document.querySelector('#grapple-input') as HTMLInputElement;
var searchResults = document.querySelector('.grapple-search-results') as HTMLDivElement;

document.addEventListener('keydown', (event) => {
  switch (event.key) {
    case 'Escape':
      backgroundPort.disconnect();
      window.close();
      break;
    case 'Enter':
      break;
    case 'ArrowUp':
      selectResult(selectedResult - 1);
      event.preventDefault();
      break;
    case 'ArrowDown':
      selectResult(selectedResult + 1);
      event.preventDefault();
      break;
    default:
      searchBox.focus();
      break;
  }
});

searchBox.addEventListener('input', (event) => {
  if (!(event.target instanceof HTMLInputElement)) return
  backgroundPort.postMessage(new GrappleEvent(GrappleEventTypes.Search, event.target.value));
});

backgroundPort.postMessage(new GrappleEvent(GrappleEventTypes.Search, ''));
