const photoViewer = document.getElementById("photoViewer");
const photoViewerImg = document.getElementById("photoViewerImg");
const closePhotoViewerBtn = document.getElementById("closePhotoViewer");

/* FORCE CLOSED ON LOAD */
if (photoViewer) {
  photoViewer.classList.add("hidden");
  photoViewer.style.display = "none";
  photoViewer.style.pointerEvents = "none";
  photoViewerImg.src = "";
}

function openPhotoViewer(src) {
  if (!src || typeof src !== "string") return;

  photoViewerImg.src = src;
  photoViewer.style.display = "flex";
  photoViewer.style.pointerEvents = "auto";   // ✅ allow clicks
  photoViewer.classList.remove("hidden");
}

function closePhotoViewer() {
  photoViewerImg.src = "";
  photoViewer.classList.add("hidden");
  photoViewer.style.display = "none";
  photoViewer.style.pointerEvents = "none";   // ✅ unblock app
}

closePhotoViewerBtn?.addEventListener("click", closePhotoViewer);

photoViewer?.addEventListener("click", (e) => {
  if (e.target === photoViewer) closePhotoViewer();
});

document.addEventListener("click", (e) => {
  const img = e.target.closest("img[data-viewer-src]");
  if (!img) return;
  openPhotoViewer(img.dataset.viewerSrc);
});
