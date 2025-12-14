/* ===================================================
   PHASE 3B – PHOTO DISPLAY (ADDITIVE ONLY)
=================================================== */

/* --- Inject thumbnails into history render --- */
const originalRenderParts = renderParts;

renderParts = function () {
  originalRenderParts();

  document.querySelectorAll(".part-history").forEach(hist => {
    const idx = hist.closest(".part-details")?.dataset.details;
    if (idx === undefined) return;

    const p = parts[idx];
    if (!Array.isArray(p.history)) return;

    hist.innerHTML = `<div class="part-meta"><b>History:</b></div>` +
      p.history.slice().reverse().slice(0,2).map(h => {
        const thumbs = Array.isArray(h.photos) && h.photos.length
          ? `<div class="photo-thumbs">
              ${h.photos.map(ph => `<img src="${ph}" class="thumb">`).join("")}
            </div>`
          : "";
        return `<div class="part-meta">• ${h.date} – ${h.tons} tons${thumbs}</div>`;
      }).join("");
  });
};

/* --- Fullscreen viewer --- */
const photoViewer = document.getElementById("photoViewer");
const photoViewerImg = document.getElementById("photoViewerImg");
const closePhotoViewer = document.getElementById("closePhotoViewer");

document.addEventListener("click", e => {
  if (e.target.classList.contains("thumb")) {
    photoViewerImg.src = e.target.src;
    photoViewer.classList.remove("hidden");
  }
});

closePhotoViewer.addEventListener("click", () => {
  photoViewer.classList.add("hidden");
  photoViewerImg.src = "";
});
