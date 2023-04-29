type BookmarkTreeNode = chrome.bookmarks.BookmarkTreeNode;

export default class Grapple {
  public bookmarks: BookmarkTreeNode[] = [];

  constructor() {
    this.loadBookmarks();
    chrome.bookmarks.onChanged.addListener(this.loadBookmarks.bind(this));
    console.log('Grapple loaded');
  }

  public search(query: string): BookmarkTreeNode[] {
    return this.bookmarks.filter((bookmark) => {
      return bookmark.title.toLowerCase().includes(query.toLowerCase());
    });
  }

  private loadBookmarks(): void {
    chrome.bookmarks.getTree().then((tree) => {
      const flatten = (node: BookmarkTreeNode, acc: BookmarkTreeNode[] = []) => {
        if (node.url) {
          acc.push(node);
        }

        if (node.children) {
          node.children.forEach((child) => flatten(child, acc));
        }

        return acc;
      }

      this.bookmarks = flatten(tree[0]);
      console.log('Bookmarks loaded', this.bookmarks)
    })
  }
}
