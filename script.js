/* ---------------- PHASE 3 PHOTOS ---------------- */

const addMaintenancePhotosBtn = document.getElementById("addMaintenancePhotosBtn");
const pendingPhotoThumbs = document.getElementById("pendingPhotoThumbs");
const photoViewer = document.getElementById("photoViewer");
const photoViewerImg = document.getElementById("photoViewerImg");
const closePhotoViewer = document.getElementById("closePhotoViewer");

let pendingPhotos = [];

/* Add photos */
addMaintenancePhotosBtn?.addEventListener("click", () => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  input.multiple = true;

  input.onchange = () => {
    [...input.files].forEach(file => {
      const reader = new FileReader();
      reader.onload = e => {
        pendingPhotos.push(e.target.result);
        renderPendingPhotos();
      };
      reader.readAsDataURL(file);
    });
  };

  input.click();
});

function renderPendingPhotos() {
  pendingPhotoThumbs.innerHTML = "";
  pendingPhotos.forEach(src => {
    const img = document.createElement("img");
    img.src = src;
    img.onclick = () => openPhotoViewer(src);
    pendingPhotoThumbs.appendChild(img);
  });
}

function openPhotoViewer(src) {
  photoViewerImg.src = src;
  photoViewer.classList.remove("hidden");
  photoViewer.classList.add("show");
}

closePhotoViewer?.addEventListener("click", () => {
  photoViewer.classList.add("hidden");
  photoViewer.classList.remove("show");
});

/* Hook into save maintenance */
const originalSave = saveCompletionBtn.onclick;
saveCompletionBtn.onclick = () => {
  if (pendingPhotos.length) {
    const p = parts[completingPartIndex];
    if (!p.history) p.history = [];
    p.history[p.history.length - 1].photos = [...pendingPhotos];
  }
  pendingPhotos = [];
  renderPendingPhotos();
  originalSave();
};
