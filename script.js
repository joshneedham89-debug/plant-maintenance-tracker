/* --- existing styles unchanged above --- */

/* ===============================
   PHASE 3 – PHOTOS (SAFE)
=============================== */

.part-history-photos {
  display: flex;
  gap: 8px;
  margin-top: 6px;
  flex-wrap: wrap;
}

.part-history-photos img {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 8px;
  cursor: pointer;
  border: 2px solid #1f2937;
}

.photo-viewer {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.photo-viewer.hidden {
  display: none;
}

.photo-viewer img {
  max-width: 95%;
  max-height: 95%;
  border-radius: 10px;
}
