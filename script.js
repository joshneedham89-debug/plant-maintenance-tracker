const PARTS_KEY="pm_parts",TONS_KEY="pm_tons";
let parts=[],currentTons=0,completingPartIndex=null,completionPhotos=[];

const screens=document.querySelectorAll(".screen");
const navButtons=document.querySelectorAll(".nav-btn");

const tonsRunEl=document.getElementById("tonsRun");
const currentTonsInput=document.getElementById("currentTonsInput");
const updateTonsBtn=document.getElementById("updateTonsBtn");
const resetTonsBtn=document.getElementById("resetTonsBtn");

const partsList=document.getElementById("partsList");

const completePanelOverlay=document.getElementById("completePanelOverlay");
const completePanel=document.getElementById("completePanel");
const closeCompletePanelBtn=document.getElementById("closeCompletePanel");
const compDate=document.getElementById("compDate");
const compTons=document.getElementById("compTons");
const compNotes=document.getElementById("compNotes");
const saveCompletionBtn=document.getElementById("saveCompletionBtn");

const compPhotoInput=document.getElementById("compPhotoInput");
const photoPreview=document.getElementById("photoPreview");
const photoViewer=document.getElementById("photoViewer");
const photoViewerImg=document.getElementById("photoViewerImg");

function saveState(){
  localStorage.setItem(PARTS_KEY,JSON.stringify(parts));
  localStorage.setItem(TONS_KEY,currentTons);
}

function loadState(){
  document.querySelectorAll(".panel-overlay").forEach(o=>o.classList.add("hidden"));
  document.querySelectorAll(".slide-panel").forEach(p=>p.classList.remove("show"));

  parts=JSON.parse(localStorage.getItem(PARTS_KEY))||[];
  currentTons=Number(localStorage.getItem(TONS_KEY))||0;
  currentTonsInput.value=currentTons;
  renderParts();
  renderDashboard();
}

function showScreen(id){
  screens.forEach(s=>s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
  navButtons.forEach(b=>b.classList.toggle("active",b.dataset.screen===id));
}

navButtons.forEach(b=>b.onclick=()=>showScreen(b.dataset.screen));

function renderDashboard(){ tonsRunEl.textContent=currentTons; }

function renderParts(){
  partsList.innerHTML="";
  parts.forEach((p,i)=>{
    const d=document.createElement("div");
    d.className="card";
    d.innerHTML=`<strong>${p.name||"Part"}</strong>
    <button class="primary-btn full">Complete</button>`;
    d.querySelector("button").onclick=()=>openCompletePanel(i);
    partsList.appendChild(d);
  });
}

function openCompletePanel(i){
  completingPartIndex=i;
  compDate.value=new Date().toISOString().split("T")[0];
  compTons.value=currentTons;
  compNotes.value="";
  completionPhotos=[];
  photoPreview.innerHTML="";
  completePanelOverlay.classList.remove("hidden");
  setTimeout(()=>completePanel.classList.add("show"),10);
}

function closeCompletePanel(){
  completePanel.classList.remove("show");
  completePanelOverlay.classList.add("hidden");
}

closeCompletePanelBtn.onclick=closeCompletePanel;

function compressImage(file){
  return new Promise(r=>{
    const img=new Image(),fr=new FileReader();
    fr.onload=e=>img.src=e.target.result;
    img.onload=()=>{
      const c=document.createElement("canvas");
      const s=Math.min(1,900/img.width);
      c.width=img.width*s;c.height=img.height*s;
      c.getContext("2d").drawImage(img,0,0,c.width,c.height);
      r(c.toDataURL("image/jpeg",.7));
    };
    fr.readAsDataURL(file);
  });
}

compPhotoInput.onchange=async()=>{
  for(const f of compPhotoInput.files){
    const src=await compressImage(f);
    completionPhotos.push({src});
    const i=document.createElement("img");
    i.src=src;i.onclick=()=>{photoViewerImg.src=src;photoViewer.classList.remove("hidden")};
    photoPreview.appendChild(i);
  }
};

photoViewer.onclick=()=>photoViewer.classList.add("hidden");

saveCompletionBtn.onclick=()=>{
  const p=parts[completingPartIndex];
  if(!p) return;
  p.history=p.history||[];
  p.history.push({date:compDate.value,tons:Number(compTons.value),notes:compNotes.value,photos:completionPhotos});
  p.lastTons=Number(compTons.value);
  saveState();
  closeCompletePanel();
  renderParts();
};

updateTonsBtn.onclick=()=>{
  currentTons=Number(currentTonsInput.value)||0;
  saveState();renderDashboard();
};

resetTonsBtn.onclick=()=>{
  currentTons=0;currentTonsInput.value=0;
  saveState();renderDashboard();
};

loadState();
