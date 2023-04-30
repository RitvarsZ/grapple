import GrappleEvent, { GrappleEventTypes } from "./event";
import { Bookmark } from "./grapple";
import "./scss/overlay.scss";

const backgroundPort = chrome.runtime.connect({ name: 'grapple-port' });
var results: Bookmark[] = [];
var selectedResult: number = -1;

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
  const overlay = document.querySelector('[grapple-container]')

  if (!(overlay instanceof HTMLElement)) return

  if(overlay.dataset.grappleVisible === 'true') {
    overlay.dataset.grappleVisible = 'false';

    return
  }

  overlay.dataset.grappleVisible = 'true';
  backgroundPort.postMessage(new GrappleEvent(GrappleEventTypes.Search, ''));
  searchBox.focus();
}

const renderBookmarks = () => {
  searchResults.innerHTML = '';

  results.forEach((result) => {
    const bookmarkElement = document.createElement('div');
    bookmarkElement.classList.add('grapple-result');
    const favicon = new URL(chrome.runtime.getURL("/_favicon/"));
    favicon.searchParams.set("pageUrl", result.url);
    favicon.searchParams.set("size", "32");
    bookmarkElement.innerHTML = `
      <img src="${favicon.toString()}" alt="" />
      <div>
        <div class="title">${result.title}</div>
        <div class="folder">${result.folder}</div>
      </div>
    `;
    searchResults.appendChild(bookmarkElement);
    bookmarkElement.addEventListener('click', () => {
      backgroundPort.postMessage(new GrappleEvent(GrappleEventTypes.Navigate, result));
      toggleOverlay();
    });
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
  const bookmarkElements = searchResults.querySelectorAll('.grapple-result');
  if (bookmarkElements.length === 0) {
    selectedResult = -1;
    return;
  };

  bookmarkElements[selectedResult]?.classList.remove('selected');

  //wrap around
  if (index < 0) {
    index = bookmarkElements.length - 1;
  } else if (index >= bookmarkElements.length) {
    index = 0;
  }

  bookmarkElements[index].classList.add('selected');
  selectedResult = index;
}

const template = `
  <div class="grapple-overlay">
    <div class="grapple-search-box">
      <input type="text" name="grapple-search" id="grapple-input" title="search" />
    </div>

    <div class="grapple-search-results"/>
  </div>`;


var overlay = document.createElement('div');
overlay.attributes.setNamedItem(document.createAttribute('grapple-container'));
overlay.classList.add('grapple-container');
overlay.innerHTML = template;
var searchBox = overlay.querySelector('#grapple-input') as HTMLInputElement;
var searchResults = overlay.querySelector('.grapple-search-results') as HTMLDivElement;

document.addEventListener('keydown', (event) => {
  const overlay = document.querySelector('[grapple-container]') as HTMLElement;
  if (overlay.dataset.grappleVisible === undefined || overlay.dataset.grappleVisible === 'false') return;

  switch (event.key) {
    case 'Escape':
      toggleOverlay();
      searchBox.value = '';
      break;
    case 'Enter':
      if (results[selectedResult]) {
        backgroundPort.postMessage(new GrappleEvent(GrappleEventTypes.Navigate, results[selectedResult]));
      }
      toggleOverlay();
      break;
      case 'ArrowUp':
        selectResult(selectedResult - 1);
        break;
      case 'ArrowDown':
        selectResult(selectedResult + 1);
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