/* Phase 3 – Photos */
const photoViewer = document.getElementById("photoViewer");
const photoViewerImg = document.getElementById("photoViewerImg");
const closePhotoViewerBtn = document.getElementById("closePhotoViewer");

/* FORCE CLOSED ON LOAD */
if (photoViewer) {
  photoViewer.classList.add("hidden");
  photoViewer.style.pointerEvents = "none";
  photoViewerImg.src = "";
}

/* OPEN VIEWER */
function openPhotoViewer(src) {
  if (!src) return;
  photoViewerImg.src = src;
  photoViewer.style.pointerEvents = "auto";
  photoViewer.classList.remove("hidden");
}

/* CLOSE VIEWER */
function closePhotoViewer() {
  photoViewerImg.src = "";
  photoViewer.classList.add("hidden");
  photoViewer.style.pointerEvents = "none";
}

closePhotoViewerBtn?.addEventListener("click", closePhotoViewer);
photoViewer?.addEventListener("click", e => {
  if (e.target === photoViewer) closePhotoViewer();
});

document.addEventListener("click", e => {
  const img = e.target.closest("img[data-viewer-src]");
  if (!img) return;
  openPhotoViewer(img.dataset.viewerSrc);
});
