const PROBLEMS_KEY = "pm_problems";

let problems = JSON.parse(localStorage.getItem(PROBLEMS_KEY)) || [];

/* DASHBOARD */
function renderDashboard() {
  document.getElementById("openProblemsCount").textContent =
    problems.filter(p => p.status === "Open").length;
}

/* PROBLEM REPORTING */
const reportProblemBtn = document.getElementById("reportProblemBtn");
const problemOverlay = document.getElementById("problemOverlay");
const problemPanel = document.getElementById("problemPanel");
const closeProblemPanel = document.getElementById("closeProblemPanel");
const saveProblemBtn = document.getElementById("saveProblemBtn");

reportProblemBtn.onclick = () => {
  problemOverlay.classList.remove("hidden");
  setTimeout(() => problemPanel.classList.add("show"), 10);
};

closeProblemPanel.onclick = () => closeProblem();

function closeProblem() {
  problemPanel.classList.remove("show");
  setTimeout(() => problemOverlay.classList.add("hidden"), 200);
}

saveProblemBtn.onclick = () => {
  const desc = document.getElementById("problemDesc").value.trim();
  const severity = document.getElementById("problemSeverity").value;

  if (!desc) return alert("Enter description");

  problems.push({
    desc,
    severity,
    status: "Open",
    date: new Date().toISOString().split("T")[0]
  });

  localStorage.setItem(PROBLEMS_KEY, JSON.stringify(problems));
  renderDashboard();
  closeProblem();
};

/* INIT */
renderDashboard();
