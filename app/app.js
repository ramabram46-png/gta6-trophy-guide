// The Leonida trophy guide — offline tracker. Ticks and checklist counts live in
// localStorage only; nothing leaves the browser. No network requests at runtime.
const LS_EARNED = "gta6-guide-earned-v1";
const LS_CHECKS = "gta6-guide-checklist-v1";
const LS_PREFS = "gta6-guide-prefs-v1";
const RING_C = 2 * Math.PI * 52;

const GRADE_ORDER = { platinum: 0, gold: 1, silver: 2, bronze: 3 };
const GRADE_LABEL = { platinum: "Platinum", gold: "Gold", silver: "Silver", bronze: "Bronze" };
const KIND_LABEL = {
  all: "All", story: "Story", missable: "Missable", collectibles: "Collectibles",
  activities: "Activities", crime: "Crime", quests: "Quests", money: "Money",
};
const KIND_MATCH = {
  story: (t) => t.kind === "story",
  missable: (t) => t.missable,
  collectibles: (t) => t.kind === "collectible",
  activities: (t) => t.kind === "activity" || t.kind === "quest",
  crime: (t) => t.kind === "crime",
  quests: (t) => t.kind === "quest",
  money: (t) => t.kind === "money",
};
const STAGE_MATCH = {
  stage1: (t) => t.kind === "story" || t.kind === "quest",
  stage2: (t) => t.kind === "collectible" || t.kind === "money" || (t.target !== undefined && (t.kind === "activity" || t.kind === "crime")),
  stage3: (t) => !STAGE_MATCH.stage1(t) && !STAGE_MATCH.stage2(t),
};

const doc = await (await fetch("data/trophies.json")).json();
const trophies = doc.trophies;

let earned = new Set(JSON.parse(localStorage.getItem(LS_EARNED) ?? "[]"));
let checks = JSON.parse(localStorage.getItem(LS_CHECKS) ?? "{}");
let prefs = { kind: "all", grade: "all", sort: "guide", search: "", spoilers: false, ...JSON.parse(localStorage.getItem(LS_PREFS) ?? "{}") };

// Screenshot / deep-link states win over saved prefs.
const params = new URLSearchParams(location.search);
if (params.get("kind")) prefs.kind = params.get("kind");
if (params.get("grade")) prefs.grade = params.get("grade");
if (params.get("sort")) prefs.sort = params.get("sort");
if (params.get("search")) prefs.search = params.get("search");
if (params.get("spoilers") === "on") prefs.spoilers = true;
if (params.get("spoilers") === "off") prefs.spoilers = false;

const $ = (id) => document.getElementById(id);
const listEl = $("list"), emptyEl = $("empty"), summaryEl = $("list-summary");

function save() {
  localStorage.setItem(LS_EARNED, JSON.stringify([...earned].sort((a, b) => a - b)));
  localStorage.setItem(LS_CHECKS, JSON.stringify(checks));
  localStorage.setItem(LS_PREFS, JSON.stringify(prefs));
  const now = new Date();
  $("saved").textContent = `Saved in this browser · ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
}

function medallion(grade) {
  const color = { platinum: "#edeae2", gold: "#e8b33c", silver: "#c7cbd1", bronze: "#c08a5a" }[grade];
  return `<svg viewBox="0 0 56 56" role="img" aria-label="${GRADE_LABEL[grade]} trophy">
    <circle cx="28" cy="28" r="27" fill="${color}" fill-opacity="0.12"/>
    <circle cx="28" cy="28" r="27" fill="none" stroke="${color}" stroke-opacity="0.45" stroke-width="1"/>
    <path d="M20 12h16v6a8 8 0 0 1-16 0v-6z" fill="${color}"/>
    <path d="M20 14h-3a5 5 0 0 0 5 6M36 14h3a5 5 0 0 1-5 6" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M28 26v6M22 38h12l-2-6h-8l-2 6zM20 42h16" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;
}

function chip(text, cls) { return `<span class="chip ${cls}">${text}</span>`; }

function esc(s) { return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }

function card(t) {
  const isEarned = earned.has(t.id);
  const hiddenStory = prefs.spoilers && t.story && !isEarned;
  const name = hiddenStory ? "Hidden story trophy" : t.name;
  const desc = hiddenStory ? "Complete the story to reveal this trophy." : t.description;
  const guide = hiddenStory
    ? "Turn spoilers off, or tick this trophy earned, to read the method."
    : t.guide;
  const target = t.target !== undefined && !hiddenStory
    ? `<div class="target-bar"><div class="target-label"><span>Needs ${t.target.toLocaleString("en-US")}${t.target_of ? ` of ${t.target_of.toLocaleString("en-US")}` : ""}</span><span>${isEarned ? "Done" : "Not yet"}</span></div><div class="target-track"><div class="target-fill" style="width:${isEarned ? 100 : 0}%"></div></div></div>`
    : "";
  const meta = [
    chip(GRADE_LABEL[t.grade], `chip-grade-${t.grade}`),
    chip(KIND_LABEL[t.kind] ?? t.kind, ""),
    t.hidden ? chip("Hidden", "") : "",
    t.missable ? chip("Missable", "chip-missable") : "",
    chip(t.confidence === "confirmed" ? "Confirmed" : t.confidence === "disputed" ? "Disputed" : "Unconfirmed", `chip-${t.confidence}`),
  ].join("");
  const source = hiddenStory ? "" : `<p class="source">Source: <a href="https://www.powerpyx.com/gta-6-grand-theft-auto-vi-trophy-guide-roadmap/" target="_blank" rel="noopener">${esc(t.source)}</a></p>`;
  const note = t.note && !hiddenStory ? `<p class="trophy-note">${esc(t.note)}</p>` : "";
  return `<article class="card${isEarned ? " earned" : ""}" id="trophy-${t.id}" data-id="${t.id}">
    <div class="medallion">${medallion(t.grade)}</div>
    <div class="card-body">
      <div class="card-top"><span class="case-no">${String(t.id).padStart(3, "0")}</span><h3 class="trophy-name">${esc(name)}</h3></div>
      <p class="trophy-desc">${esc(desc)}</p>
      <p class="trophy-guide">${esc(guide)}</p>
      ${target}
      <div class="card-meta">${meta}</div>
      ${source}${note}
    </div>
    <label class="earned-toggle"><input type="checkbox" data-earned="${t.id}" ${isEarned ? "checked" : ""}> Earned</label>
  </article>`;
}

function visible() {
  const q = prefs.search.trim().toLowerCase();
  let out = trophies.filter((t) => {
    if (prefs.grade !== "all" && t.grade !== prefs.grade) return false;
    if (prefs.kind !== "all") {
      const match = KIND_MATCH[prefs.kind] ?? STAGE_MATCH[prefs.kind];
      if (match && !match(t)) return false;
    }
    if (q && !(t.name + " " + t.description + " " + t.guide).toLowerCase().includes(q)) return false;
    return true;
  });
  if (prefs.sort === "name") out = [...out].sort((a, b) => a.name.localeCompare(b.name));
  if (prefs.sort === "grade") out = [...out].sort((a, b) => GRADE_ORDER[a.grade] - GRADE_ORDER[b.grade] || a.id - b.id);
  return out;
}

function renderList() {
  const rows = visible();
  listEl.innerHTML = rows.map(card).join("");
  emptyEl.hidden = rows.length > 0;
  const stageName = { stage1: "stage 1 (story)", stage2: "stage 2 (100% grind)", stage3: "stage 3 (cleanup)" }[prefs.kind];
  summaryEl.textContent = rows.length === trophies.length
    ? "Showing all 55 trophies."
    : `Showing ${rows.length} of 55 trophies${stageName ? ` — ${stageName}` : prefs.kind !== "all" ? ` — ${KIND_LABEL[prefs.kind] ?? prefs.kind}` : ""}${prefs.grade !== "all" ? `, ${GRADE_LABEL[prefs.grade].toLowerCase()} only` : ""}${prefs.search ? `, matching “${prefs.search}”` : ""}.`;
}

function renderProgress() {
  const n = earned.size;
  $("earned-count").textContent = n;
  $("ring-value").style.strokeDashoffset = String(RING_C * (1 - n / trophies.length));
  const byGrade = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
  for (const id of earned) { const t = trophies.find((x) => x.id === id); if (t) byGrade[t.grade]++; }
  $("grade-counts").textContent = `${byGrade.platinum} platinum · ${byGrade.gold} gold · ${byGrade.silver} silver · ${byGrade.bronze} bronze`;
}

function renderStages() {
  $("stages").innerHTML = doc.roadmap.stages.map((s) => `<li data-stage="stage${s.stage}" tabindex="0" role="button" aria-label="Filter to stage ${s.stage} trophies">
    <div class="stage-top"><span class="stage-num">Stage ${s.stage}</span><span class="stage-hours">${esc(s.hours)} hours</span></div>
    <h3>${esc(s.title)}</h3><p>${esc(s.text)}</p>
    <span class="stage-link">Show these trophies →</span>
  </li>`).join("");
  document.querySelectorAll("[data-stage]").forEach((el) => {
    const go = () => {
      prefs.kind = el.dataset.stage;
      document.querySelectorAll("#kind-chips .chip-btn").forEach((b) => b.setAttribute("aria-pressed", "false"));
      save(); renderList();
      document.querySelectorAll("[data-stage]").forEach((x) => x.classList.toggle("active", x === el));
      $("tracker").scrollIntoView({ behavior: "smooth" });
    };
    el.addEventListener("click", go);
    el.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(); } });
  });
}

function renderChecklist() {
  $("checklist-lines").innerHTML = doc.checklist100.map((line, i) => {
    const v = Math.min(checks[i] ?? 0, line.of);
    return `<li><span class="line-name">${esc(line.line)}</span>
      <span class="stepper"><button type="button" data-step="${i}" data-d="-1" aria-label="Decrease ${esc(line.line)}" ${v === 0 ? "disabled" : ""}>−</button>
      <button type="button" data-step="${i}" data-d="1" aria-label="Increase ${esc(line.line)}" ${v >= line.of ? "disabled" : ""}>+</button></span>
      <span class="line-count">${v} <span class="need">/ ${line.need} needed · ${line.of} total</span></span></li>`;
  }).join("");
  document.querySelectorAll("[data-step]").forEach((btn) => btn.addEventListener("click", () => {
    const i = Number(btn.dataset.step);
    const line = doc.checklist100[i];
    checks[i] = Math.max(0, Math.min(line.of, (checks[i] ?? 0) + Number(btn.dataset.d)));
    save(); renderChecklist();
  }));
}

function renderAudit() {
  $("audit-list").innerHTML = doc.audit.map((a) => `<li><h3>${esc(a.topic)}</h3><p>${esc(a.finding)}</p></li>`).join("");
  $("source-list").innerHTML = doc.sources.map((s) => s.url
    ? `<li><a href="${s.url}" target="_blank" rel="noopener">${esc(s.name)}</a> — ${esc(s.covers)}${s.accessed ? ` (checked ${s.accessed})` : ""}.</li>`
    : `<li>${esc(s.name)} — ${esc(s.covers)}.</li>`).join("");
}

function renderChips() {
  const kinds = ["all", "story", "missable", "collectibles", "activities", "crime", "quests", "money"];
  $("kind-chips").innerHTML = kinds.map((k) => `<button type="button" class="chip-btn" data-kind="${k}" aria-pressed="${prefs.kind === k}">${KIND_LABEL[k]}</button>`).join("");
  document.querySelectorAll("#kind-chips .chip-btn").forEach((b) => b.addEventListener("click", () => {
    prefs.kind = b.dataset.kind;
    document.querySelectorAll("[data-stage]").forEach((x) => x.classList.remove("active"));
    document.querySelectorAll("#kind-chips .chip-btn").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    save(); renderList();
  }));
}

listEl.addEventListener("change", (e) => {
  const box = e.target.closest("[data-earned]");
  if (!box) return;
  const id = Number(box.dataset.earned);
  if (box.checked) earned.add(id); else earned.delete(id);
  save(); renderProgress(); renderList();
});

$("search").value = prefs.search;
$("grade").value = prefs.grade;
$("sort").value = prefs.sort;
$("spoilers").checked = prefs.spoilers;
$("search").addEventListener("input", (e) => { prefs.search = e.target.value; save(); renderList(); });
$("grade").addEventListener("change", (e) => { prefs.grade = e.target.value; save(); renderList(); });
$("sort").addEventListener("change", (e) => { prefs.sort = e.target.value; save(); renderList(); });
$("spoilers").addEventListener("change", (e) => { prefs.spoilers = e.target.checked; save(); renderList(); });

$("export").addEventListener("click", () => {
  const blob = new Blob([JSON.stringify({ app: "gta6-trophy-guide", exported_at: new Date().toISOString(), earned: [...earned].sort((a, b) => a - b), checklist: checks }, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "gta6-trophy-progress.json";
  a.click();
  URL.revokeObjectURL(a.href);
});
$("import").addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    const ids = new Set(trophies.map((t) => t.id));
    earned = new Set((data.earned ?? []).filter((id) => ids.has(id)));
    if (data.checklist) checks = data.checklist;
    save(); renderProgress(); renderList(); renderChecklist();
  } catch { alert("That file is not a trophy progress export."); }
  e.target.value = "";
});
$("reset").addEventListener("click", () => {
  if (!confirm("Clear every tick and checklist count in this browser?")) return;
  earned = new Set(); checks = {};
  save(); renderProgress(); renderList(); renderChecklist();
});

renderChips();
renderStages();
renderChecklist();
renderAudit();
renderProgress();
renderList();
save();

// Deep links: open a trophy, or jump to a section.
if (params.get("open")) {
  const el = document.getElementById(`trophy-${params.get("open")}`);
  if (el) el.scrollIntoView({ block: "center" });
}
if (params.get("section") === "roadmap") $("roadmap").scrollIntoView();
if (params.get("section") === "audit") $("audit").scrollIntoView();
