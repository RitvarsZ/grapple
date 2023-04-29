type BookmarkTreeNode = chrome.bookmarks.BookmarkTreeNode;

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
    return this.bookmarks.filter((bookmark) => {
      return bookmark.fullTitle.toLowerCase().includes(query.toLowerCase());
    });
  }

  private loadBookmarks(): void {
    chrome.bookmarks.getTree().then((tree) => {
      console.log(tree)
      const flatten = (node: BookmarkTreeNode, acc: Bookmark[] = [], parentTitle: string = '') => {
        if (node.url) {
          acc.push({
            fullTitle: `${parentTitle} / ${node.title}`,
            title: node.title,
            url: node.url,
            folder: parentTitle,
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
