type BookmarkTreeNode = chrome.bookmarks.BookmarkTreeNode;
import fuzzysort from "fuzzysort";

export interface Bookmark {
  fullTitle: string;
  folder: string;
  title: string;
  url: string;
}

export default class Grapple {
  public bookmarks: Bookmark[] = [];

  constructor() {
    this.loadBookmarks();
    chrome.bookmarks.onChanged.addListener(this.loadBookmarks.bind(this));
    chrome.bookmarks.onMoved.addListener(this.loadBookmarks.bind(this));
    chrome.bookmarks.onCreated.addListener(this.loadBookmarks.bind(this));
  }

  public search(query: string): Bookmark[] {
    const result = fuzzysort.go(query, this.bookmarks, {
      key: ['fullTitle'],
      all: true,
      limit: 15,
    })

    // Workaround with fuzzysort using { all: true } - highlighter for empty query does not work
    if (!query) {
      return result.map((r) => r.obj)
    }

    return result.map((r) => {
      const highlight = fuzzysort.highlight(r, '<b>', '</b>')
      const parts = highlight ? highlight.split(' / ') : null
      
      return {
        ...r.obj,
        title: parts?.pop() || r.obj.title,
        folder: parts?.join(' / ') || r.obj.folder,
      } as Bookmark
    })
  }

  private loadBookmarks(): void {
    chrome.bookmarks.getTree().then((tree) => {
      const flatten = (node: BookmarkTreeNode, acc: Bookmark[] = [], parentTitle: string = '') => {
        if (node.url) {
          acc.push({
            title: node.title,
            url: node.url,
            folder: parentTitle,
            fullTitle: parentTitle ? `${parentTitle} / ${node.title}` : node.title,
          } as Bookmark);
        }

        if (node.children) {
          parentTitle = parentTitle ? `${parentTitle} / ${node.title}` : node.title;
          node.children.forEach((child) => flatten(child, acc, parentTitle));
        }

        return acc;
      }

      this.bookmarks = flatten(tree[0]);
    })
  }
}
