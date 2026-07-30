function initPracticeCanvas(container, onComplete) {
  const WIDTH = 760;
  const HEIGHT = 420;

  const state = {
    tool: "start", // start | process | decision | end | connect
    shapes: [], // {id, type, x, y, label}
    connectors: [], // {from, to}
    connectFirst: null,
    nextId: 1,
    completed: false,
  };

  const toolbox = document.createElement("div");
  toolbox.className = "canvas-toolbox";

  const tools = [
    { id: "start", label: "⬭ Start" },
    { id: "process", label: "▭ Process" },
    { id: "decision", label: "◇ Decision" },
    { id: "end", label: "⬭ End" },
    { id: "connect", label: "→ Connect" },
  ];

  const toolButtons = {};
  tools.forEach((t) => {
    const btn = document.createElement("button");
    btn.className = "tool secondary";
    btn.textContent = t.label;
    btn.addEventListener("click", () => {
      state.tool = t.id;
      state.connectFirst = null;
      Object.values(toolButtons).forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      clearSelection();
    });
    toolButtons[t.id] = btn;
    toolbox.appendChild(btn);
  });
  toolButtons.start.classList.add("active");

  const resetBtn = document.createElement("button");
  resetBtn.className = "secondary";
  resetBtn.textContent = "↺ Reset";
  resetBtn.addEventListener("click", reset);
  toolbox.appendChild(resetBtn);

  container.appendChild(toolbox);

  const frame = document.createElement("div");
  frame.className = "canvas-frame";
  container.appendChild(frame);

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("width", "100%");
  svg.setAttribute("height", HEIGHT);
  svg.setAttribute("viewBox", `0 0 ${WIDTH} ${HEIGHT}`);
  frame.appendChild(svg);

  const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
  defs.innerHTML = `
    <marker id="arrowhead" markerWidth="10" markerHeight="8" refX="9" refY="4" orient="auto">
      <polygon points="0 0, 10 4, 0 8" fill="#4763e4" />
    </marker>`;
  svg.appendChild(defs);

  const connectorLayer = document.createElementNS("http://www.w3.org/2000/svg", "g");
  const shapeLayer = document.createElementNS("http://www.w3.org/2000/svg", "g");
  svg.appendChild(connectorLayer);
  svg.appendChild(shapeLayer);

  const statusEl = document.createElement("div");
  statusEl.className = "canvas-status";
  statusEl.textContent = "Place a Start, Process, Decision, and End shape, then connect them.";
  container.appendChild(statusEl);

  svg.addEventListener("click", (e) => {
    if (e.target !== svg) return; // clicks on shapes are handled separately
    if (state.tool === "connect") return;
    const pt = svgPoint(e);
    addShape(state.tool, pt.x, pt.y);
  });

  function svgPoint(e) {
    const rect = svg.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * WIDTH;
    const y = ((e.clientY - rect.top) / rect.height) * HEIGHT;
    return { x, y };
  }

  function defaultLabel(type) {
    return { start: "Start", process: "Do something", decision: "Decision?", end: "End" }[type];
  }

  function addShape(type, x, y) {
    const shape = { id: state.nextId++, type, x, y, label: defaultLabel(type) };
    state.shapes.push(shape);
    drawShape(shape);
    evaluateCompletion();
  }

  function clearSelection() {
    [...shapeLayer.children].forEach((g) => g.classList.remove("selected"));
  }

  function drawShape(shape) {
    const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    g.classList.add("shape-node");
    g.dataset.id = shape.id;

    let el;
    const w = 130, h = 60;
    if (shape.type === "decision") {
      el = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
      const cx = shape.x, cy = shape.y;
      el.setAttribute("points", `${cx},${cy - h / 2} ${cx + w / 2},${cy} ${cx},${cy + h / 2} ${cx - w / 2},${cy}`);
      el.setAttribute("fill", "#fff4e5");
      el.setAttribute("stroke", "#d98a1a");
      el.setAttribute("stroke-width", "2");
    } else if (shape.type === "start" || shape.type === "end") {
      el = document.createElementNS("http://www.w3.org/2000/svg", "ellipse");
      el.setAttribute("cx", shape.x);
      el.setAttribute("cy", shape.y);
      el.setAttribute("rx", w / 2);
      el.setAttribute("ry", h / 2.4);
      el.setAttribute("fill", shape.type === "start" ? "#e3f8ea" : "#fbeaea");
      el.setAttribute("stroke", shape.type === "start" ? "#1f9d55" : "#d64545");
      el.setAttribute("stroke-width", "2");
    } else {
      el = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      el.setAttribute("x", shape.x - w / 2);
      el.setAttribute("y", shape.y - h / 2);
      el.setAttribute("width", w);
      el.setAttribute("height", h);
      el.setAttribute("rx", 8);
      el.setAttribute("fill", "#e8ecfd");
      el.setAttribute("stroke", "#4763e4");
      el.setAttribute("stroke-width", "2");
    }
    g.appendChild(el);

    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", shape.x);
    text.setAttribute("y", shape.y + 5);
    text.setAttribute("text-anchor", "middle");
    text.setAttribute("font-size", "13");
    text.setAttribute("fill", "#1e2433");
    text.textContent = shape.label;
    g.appendChild(text);

    g.addEventListener("mousedown", (e) => onShapeMouseDown(e, shape, g, text));
    g.addEventListener("dblclick", () => {
      const next = prompt("Label for this shape:", shape.label);
      if (next !== null && next.trim()) {
        shape.label = next.trim();
        text.textContent = shape.label;
      }
    });

    shapeLayer.appendChild(g);
  }

  function onShapeMouseDown(e, shape, g, text) {
    e.stopPropagation();

    if (state.tool === "connect") {
      if (!state.connectFirst) {
        state.connectFirst = shape;
        clearSelection();
        g.classList.add("selected");
      } else if (state.connectFirst.id !== shape.id) {
        state.connectors.push({ from: state.connectFirst.id, to: shape.id });
        drawConnectors();
        clearSelection();
        state.connectFirst = null;
        evaluateCompletion();
      }
      return;
    }

    let dragging = true;
    const onMove = (moveEvt) => {
      if (!dragging) return;
      const pt = svgPoint(moveEvt);
      shape.x = pt.x;
      shape.y = pt.y;
      redrawShape(shape);
      drawConnectors();
    };
    const onUp = () => {
      dragging = false;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }

  function redrawShape(shape) {
    const g = shapeLayer.querySelector(`[data-id="${shape.id}"]`);
    if (!g) return;
    g.remove();
    drawShape(shape);
  }

  function drawConnectors() {
    connectorLayer.innerHTML = "";
    state.connectors.forEach((c) => {
      const from = state.shapes.find((s) => s.id === c.from);
      const to = state.shapes.find((s) => s.id === c.to);
      if (!from || !to) return;
      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", from.x);
      line.setAttribute("y1", from.y);
      line.setAttribute("x2", to.x);
      line.setAttribute("y2", to.y);
      line.setAttribute("stroke", "#4763e4");
      line.setAttribute("stroke-width", "2");
      line.setAttribute("marker-end", "url(#arrowhead)");
      connectorLayer.appendChild(line);
    });
  }

  function evaluateCompletion() {
    const hasStart = state.shapes.some((s) => s.type === "start");
    const hasEnd = state.shapes.some((s) => s.type === "end");
    const hasDecision = state.shapes.some((s) => s.type === "decision");
    const enoughConnectors = state.connectors.length >= 2;

    if (hasStart && hasEnd && hasDecision && enoughConnectors) {
      statusEl.textContent = "✓ Nice — that's a complete basic flowchart. Lesson marked as done.";
      statusEl.classList.add("complete");
      if (!state.completed) {
        state.completed = true;
        onComplete();
      }
    } else {
      const missing = [];
      if (!hasStart) missing.push("a Start shape");
      if (!hasDecision) missing.push("a Decision shape");
      if (!hasEnd) missing.push("an End shape");
      if (!enoughConnectors) missing.push("at least 2 connectors");
      statusEl.classList.remove("complete");
      statusEl.textContent = "Still need: " + missing.join(", ") + ".";
    }
  }

  function reset() {
    state.shapes = [];
    state.connectors = [];
    state.connectFirst = null;
    state.completed = false;
    shapeLayer.innerHTML = "";
    connectorLayer.innerHTML = "";
    statusEl.classList.remove("complete");
    statusEl.textContent = "Place a Start, Process, Decision, and End shape, then connect them.";
  }
}
