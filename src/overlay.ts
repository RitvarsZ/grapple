export function showGrappleOverlay() {
  if (document.querySelector('.grapple-overlay')) {
    return;
  }

  const overlay = document.createElement('div');
  overlay.className = 'grapple-overlay';
  overlay.style.position = 'fixed';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100%';
  overlay.style.height = '100%';
  overlay.style.background = 'rgba(0, 0, 0, 0.5)';
  overlay.style.zIndex = '9999';

  const searchBox = document.createElement('input');
  searchBox.type = 'text';
  searchBox.style.position = 'absolute';
  searchBox.style.top = '50%';
  searchBox.style.left = '50%';
  searchBox.style.transform = 'translate(-50%, -50%)';

  overlay.appendChild(searchBox);
  document.body.appendChild(overlay);

  searchBox.focus();

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      const overlay = document.querySelector('.grapple-overlay');
      if (overlay) {
        document.body.removeChild(overlay);
      }
    }
  });
}
