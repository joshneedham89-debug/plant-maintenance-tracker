/* ===============================
   PHASE 3 – SAFE PHOTOS
   (no overlays touched)
=============================== */

let photoViewer;
let photoViewerImg;

document.addEventListener("DOMContentLoaded", () => {
  // create viewer once
  photoViewer = document.createElement("div");
  photoViewer.className = "photo-viewer hidden";
  photoViewer.innerHTML = `<img>`;
  document.body.appendChild(photoViewer);
  photoViewerImg = photoViewer.querySelector("img");

  photoViewer.addEventListener("click", () => {
    photoViewer.classList.add("hidden");
  });
});

/* Image compression */
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

/* Hook into EXISTING saveCompletionBtn */
saveCompletionBtn?.addEventListener("click", async () => {
  const p = parts[completingPartIndex];
  if (!p) return;

  const date = compDate.value;
  const tons = Number(compTons.value);
  const notes = (compNotes.value || "").trim();

  if (!date || isNaN(tons)) {
    showToast("Enter date + tons", "error");
    return;
  }

  // OPTIONAL photos
  let photos = [];
  if (confirm("Add photos to this maintenance?")) {
    const picker = document.createElement("input");
    picker.type = "file";
    picker.accept = "image/*";
    picker.multiple = true;

    await new Promise(resolve => {
      picker.onchange = async () => {
        for (const file of picker.files) {
          const src = await compressImage(file);
          photos.push(src);
        }
        resolve();
      };
      picker.click();
    });
  }

  const historyEntry = {
    date,
    tons,
    notes,
    photos
  };

  if (!p.history) p.history = [];
  p.history.push(historyEntry);

  p.date = date;
  p.lastTons = tons;

  saveState();
  renderParts();
  renderDashboard();
  closeCompletePanel();
  showToast("Maintenance logged");
});

/* Inject photos into history render */
const _origRenderParts = renderParts;
renderParts = function () {
  _origRenderParts();

  document.querySelectorAll(".part-details").forEach((details, idx) => {
    const p = parts[idx];
    if (!p || !Array.isArray(p.history)) return;

    const last = p.history[p.history.length - 1];
    if (!last || !last.photos || !last.photos.length) return;

    const wrap = document.createElement("div");
    wrap.className = "part-history-photos";

    last.photos.forEach(src => {
      const img = document.createElement("img");
      img.src = src;
      img.onclick = () => {
        photoViewerImg.src = src;
        photoViewer.classList.remove("hidden");
      };
      wrap.appendChild(img);
    });

    details.appendChild(wrap);
  });
};
