const STORAGE_KEY = "lucidchart-academy-progress";

let lessons = [];
let quiz = [];
let currentId = null;

function loadProgress() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

function saveProgress(progress) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

function markComplete(id) {
  const progress = loadProgress();
  progress[id] = true;
  saveProgress(progress);
  renderSidebar();
  updateProgressBar();
}

function updateProgressBar() {
  const progress = loadProgress();
  const done = lessons.filter((l) => progress[l.id]).length;
  const pct = lessons.length ? Math.round((done / lessons.length) * 100) : 0;
  document.getElementById("progress-fill").style.width = pct + "%";
  document.getElementById("progress-label").textContent = pct + "%";
}

function renderSidebar() {
  const progress = loadProgress();
  const sidebar = document.getElementById("sidebar");
  sidebar.innerHTML = "";
  lessons.forEach((lesson) => {
    const item = document.createElement("div");
    item.className = "nav-item" + (lesson.id === currentId ? " active" : "") + (progress[lesson.id] ? " done" : "");
    item.innerHTML = `<span class="nav-check">${progress[lesson.id] ? "✓" : ""}</span><span>${lesson.title}</span>`;
    item.addEventListener("click", () => selectLesson(lesson.id));
    sidebar.appendChild(item);
  });
}

function selectLesson(id) {
  currentId = id;
  location.hash = id;
  renderSidebar();
  renderLesson(id);
}

function renderLesson(id) {
  const lesson = lessons.find((l) => l.id === id) || lessons[0];
  const content = document.getElementById("content");
  content.innerHTML = "";

  const title = document.createElement("h1");
  title.className = "lesson-title";
  title.textContent = lesson.title;
  content.appendChild(title);

  const summary = document.createElement("p");
  summary.className = "lesson-summary";
  summary.textContent = lesson.summary;
  content.appendChild(summary);

  lesson.sections.forEach((section) => {
    const card = document.createElement("div");
    card.className = "section-card" + (section.tip ? " tip" : "");
    const h3 = document.createElement("h3");
    h3.textContent = section.heading;
    const p = document.createElement("p");
    p.textContent = section.body || section.tip;
    card.appendChild(h3);
    card.appendChild(p);
    content.appendChild(card);
  });

  if (lesson.practice) {
    const canvasContainer = document.createElement("div");
    canvasContainer.id = "practice-canvas-container";
    content.appendChild(canvasContainer);
    initPracticeCanvas(canvasContainer, () => markComplete(lesson.id));
  }

  if (lesson.quiz) {
    const quizContainer = document.createElement("div");
    quizContainer.id = "quiz-container";
    content.appendChild(quizContainer);
    renderQuiz(quizContainer, () => markComplete(lesson.id));
  }

  const nav = document.createElement("div");
  nav.className = "lesson-nav";

  const idx = lessons.findIndex((l) => l.id === lesson.id);
  const prevBtn = document.createElement("button");
  prevBtn.className = "secondary";
  prevBtn.textContent = "← Previous";
  prevBtn.disabled = idx === 0;
  prevBtn.addEventListener("click", () => selectLesson(lessons[idx - 1].id));

  const rightGroup = document.createElement("div");

  if (!lesson.practice && !lesson.quiz) {
    const completeBtn = document.createElement("button");
    completeBtn.className = "secondary";
    const progress = loadProgress();
    completeBtn.textContent = progress[lesson.id] ? "✓ Completed" : "Mark as complete";
    completeBtn.addEventListener("click", () => {
      markComplete(lesson.id);
      completeBtn.textContent = "✓ Completed";
    });
    rightGroup.appendChild(completeBtn);
  }

  const nextBtn = document.createElement("button");
  nextBtn.textContent = idx === lessons.length - 1 ? "Finish" : "Next →";
  nextBtn.disabled = idx === lessons.length - 1;
  nextBtn.style.marginLeft = "0.5rem";
  nextBtn.addEventListener("click", () => selectLesson(lessons[idx + 1].id));
  rightGroup.appendChild(nextBtn);

  nav.appendChild(prevBtn);
  nav.appendChild(rightGroup);
  content.appendChild(nav);
}

function renderQuiz(container, onPass) {
  const answers = new Array(quiz.length).fill(null);

  quiz.forEach((q, qIdx) => {
    const block = document.createElement("div");
    block.className = "quiz-question";
    const heading = document.createElement("h3");
    heading.textContent = `${qIdx + 1}. ${q.question}`;
    block.appendChild(heading);

    const optionsWrap = document.createElement("div");
    optionsWrap.className = "quiz-options";

    q.options.forEach((opt, oIdx) => {
      const btn = document.createElement("button");
      btn.className = "quiz-option";
      btn.textContent = opt;
      btn.addEventListener("click", () => {
        if (answers[qIdx] !== null) return;
        answers[qIdx] = oIdx;
        [...optionsWrap.children].forEach((child, i) => {
          if (i === q.answer) child.classList.add("correct");
          else if (i === oIdx) child.classList.add("incorrect");
        });
        maybeShowScore();
      });
      optionsWrap.appendChild(btn);
    });

    block.appendChild(optionsWrap);
    container.appendChild(block);
  });

  const scoreEl = document.createElement("div");
  scoreEl.className = "quiz-score";
  container.appendChild(scoreEl);

  function maybeShowScore() {
    if (answers.some((a) => a === null)) return;
    const correct = answers.filter((a, i) => a === quiz[i].answer).length;
    scoreEl.textContent = `Score: ${correct}/${quiz.length}`;
    if (correct === quiz.length) onPass();
  }
}

async function init() {
  const [lessonsRes, quizRes] = await Promise.all([
    fetch("content/lessons.json"),
    fetch("content/quiz.json"),
  ]);
  lessons = await lessonsRes.json();
  quiz = await quizRes.json();

  const hashId = location.hash.replace("#", "");
  currentId = lessons.find((l) => l.id === hashId) ? hashId : lessons[0].id;

  renderSidebar();
  renderLesson(currentId);
  updateProgressBar();
}

init();
