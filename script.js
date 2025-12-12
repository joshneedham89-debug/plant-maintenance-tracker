let parts = [];
let currentTons = 0;
let completingPartIndex = null;
let completionPhotos = [];

const compPhotoInput = document.getElementById("compPhotoInput");
const photoPreview = document.getElementById("photoPreview");
const photoViewer = document.getElementById("photoViewer");
const photoViewerImg = document.getElementById("photoViewerImg");

function showToast(msg) {
  const t = document.getElementById("toastContainer");
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 2000);
}

function compressImage(file) {
  return new Promise(resolve => {
    const img = new Image();
    const reader = new FileReader();
    reader.onload = e => img.src = e.target.result;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const scale = Math.min(1, 900 / img.width);
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", 0.7));
    };
    reader.readAsDataURL(file);
  });
}

compPhotoInput?.addEventListener("change", async () => {
  for (const file of compPhotoInput.files) {
    const src = await compressImage(file);
    completionPhotos.push({ type: "local", src });

    const img = document.createElement("img");
    img.src = src;
    img.onclick = () => openPhotoViewer(src);
    photoPreview.appendChild(img);
  }
});

function openPhotoViewer(src) {
  photoViewerImg.src = src;
  photoViewer.classList.remove("hidden");
}

photoViewer?.addEventListener("click", () => {
  photoViewer.classList.add("hidden");
});

document.getElementById("closeCompletePanel")?.addEventListener("click", () => {
  document.getElementById("completePanelOverlay").classList.add("hidden");
});

document.getElementById("saveCompletionBtn")?.addEventListener("click", () => {
  showToast("Maintenance saved with photos");
  completionPhotos = [];
  photoPreview.innerHTML = "";
  document.getElementById("completePanelOverlay").classList.add("hidden");
});
