/**
 * Quantum Random Password Generator - Advanced Laboratory Suite
 * Integrates:
 * 1. Web Audio API Cryogenic & Geiger Acoustic Sonification
 * 2. Multi-Mode Generation: Character Key, Quantum Diceware Passphrase, Multi-Key Batch Vault
 * 3. Interactive Quantum Gate Sandbox (H, X, Y, Z, S, T) on 3D Bloch Sphere
 * 4. Post-Quantum Cryptanalysis & Grover's Algorithm Search Complexity Meter
 * 5. Air-Gapped Mobile QR Code Transfer & Export Hub (.env, JSON, CSV)
 * 6. Head-to-Head PRNG Benchmark & Modulo Bias Chi-Square Goodness-of-Fit Engine
 */

document.addEventListener("DOMContentLoaded", () => {
  // -------------------------------------------------------------
  // 1. WEB AUDIO API - CRYOGENIC & GEIGER ACOUSTIC SONIFICATION
  // -------------------------------------------------------------
  let audioCtx = null;
  let audioEnabled = true;

  function initAudio() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === "suspended") {
      audioCtx.resume();
    }
  }

  const audioToggleBtn = document.getElementById("audio-toggle-btn");
  const audioBtnIcon = document.getElementById("audio-btn-icon");
  const audioBtnLabel = document.getElementById("audio-btn-label");

  if (audioToggleBtn) {
    audioToggleBtn.addEventListener("click", () => {
      initAudio();
      audioEnabled = !audioEnabled;
      if (audioEnabled) {
        audioToggleBtn.classList.add("active");
        audioBtnIcon.textContent = "🔊";
        audioBtnLabel.textContent = "SOUND: ON";
      } else {
        audioToggleBtn.classList.remove("active");
        audioBtnIcon.textContent = "🔇";
        audioBtnLabel.textContent = "SOUND: OFF";
      }
    });
  }

  // Audio effect 1: Relay Click on Measurement Trigger
  function playRelayClick() {
    if (!audioEnabled || !audioCtx) return;
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = "square";
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.04);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start(now);
    osc.stop(now + 0.04);
  }

  // Audio effect 2: Geiger Counter Crackle for Qubit Superposition
  function playGeigerBurst(count = 6) {
    if (!audioEnabled || !audioCtx) return;
    const now = audioCtx.currentTime;
    for (let i = 0; i < count; i++) {
      const clickTime = now + (i * 0.03) + (Math.random() * 0.015);
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(1400 + Math.random() * 800, clickTime);

      gain.gain.setValueAtTime(0.08, clickTime);
      gain.gain.exponentialRampToValueAtTime(0.001, clickTime + 0.01);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start(clickTime);
      osc.stop(clickTime + 0.012);
    }
  }

  // Audio effect 3: Typewriter Decrypt Tick
  function playTypewriterTick() {
    if (!audioEnabled || !audioCtx) return;
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(1100, now);
    osc.frequency.exponentialRampToValueAtTime(220, now + 0.02);

    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start(now);
    osc.stop(now + 0.02);
  }

  // Audio effect 4: Harmonious Quantum Crystalline Chime
  function playQuantumChime() {
    if (!audioEnabled || !audioCtx) return;
    const now = audioCtx.currentTime;
    const freqs = [523.25, 659.25, 783.99, 1046.50]; // C Major Chord
    freqs.forEach((freq, idx) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + idx * 0.04);

      gain.gain.setValueAtTime(0.05, now + idx * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.04 + 0.4);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start(now + idx * 0.04);
      osc.stop(now + idx * 0.04 + 0.4);
    });
  }

  // Audio effect 5: Sub-Bass Collapse Shockwave
  function playCollapsePulse() {
    if (!audioEnabled || !audioCtx) return;
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.2);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start(now);
    osc.stop(now + 0.2);
  }

  // -------------------------------------------------------------
  // 2. DOM ELEMENTS & CONTROLS
  // -------------------------------------------------------------
  const form = document.getElementById("generator-form");
  const backendSelect = document.getElementById("backend-mode-select");
  const backendBeacon = document.getElementById("backend-status-beacon");
  const backendStatusLabel = document.getElementById("backend-status-label");

  // Mode Selection
  const modeTabBtns = document.querySelectorAll(".mode-tab-btn");
  const charControls = document.getElementById("character-mode-controls");
  const dicewareControls = document.getElementById("diceware-mode-controls");
  const batchControls = document.getElementById("batch-mode-controls");
  let currentMode = "character"; // "character" | "diceware" | "batch"

  // Preset Buttons
  const presetPillBtns = document.querySelectorAll(".preset-pill-btn");

  // Character Mode Inputs
  const lengthSlider = document.getElementById("length-slider");
  const lengthValue = document.getElementById("length-value");
  const qubitReqBadge = document.getElementById("qubit-req-badge");
  const upperCheckbox = document.getElementById("charset-uppercase");
  const lowerCheckbox = document.getElementById("charset-lowercase");
  const digitsCheckbox = document.getElementById("charset-digits");
  const symbolsCheckbox = document.getElementById("charset-symbols");
  const customCharsetInput = document.getElementById("custom-charset-input");

  // Diceware Mode Inputs
  const dicewareWordsSlider = document.getElementById("diceware-words-slider");
  const dicewareWordsVal = document.getElementById("diceware-words-val");
  const dicewareSepSelect = document.getElementById("diceware-sep-select");
  const dicewareCapitalize = document.getElementById("diceware-capitalize");
  const dicewareNumber = document.getElementById("diceware-number");

  // Batch Mode Inputs
  const batchCountSlider = document.getElementById("batch-count-slider");
  const batchCountVal = document.getElementById("batch-count-val");
  const batchTableBody = document.getElementById("batch-table-body");
  let batchGeneratedItems = [];

  // Triggers
  const generateBtn = document.getElementById("generate-btn");
  const regenBtn = document.getElementById("regen-btn");
  const errorMessage = document.getElementById("error-message");

  // Outputs
  const passwordOutput = document.getElementById("password-output");
  const copyBtn = document.getElementById("copy-btn");
  const copyText = document.getElementById("copy-text");
  const entropyRateBadge = document.getElementById("entropy-rate-badge");
  const entropyGaugeBar = document.getElementById("entropy-gauge-bar");
  const entropyEfficiencyReadout = document.getElementById("entropy-efficiency-readout");

  // Export Dropdown
  const exportDropdownBtn = document.getElementById("export-dropdown-btn");
  const exportDropdownMenu = document.getElementById("export-dropdown-menu");
  const exportMenuItems = document.querySelectorAll(".export-menu-item");

  // QR Modal
  const qrModalBtn = document.getElementById("qr-modal-btn");
  const qrModal = document.getElementById("qr-modal");
  const qrModalClose = document.getElementById("qr-modal-close");
  const qrModalDone = document.getElementById("qr-modal-done");
  const qrCanvas = document.getElementById("qr-canvas");

  // Telemetry Elements
  const metricShannonEntropy = document.getElementById("metric-shannon-entropy");
  const metricTheoreticalEntropy = document.getElementById("metric-theoretical-entropy");
  const metricQubits = document.getElementById("metric-qubits");
  const metricShots = document.getElementById("metric-shots");
  const metricRejections = document.getElementById("metric-rejections");
  const metricExecutionTime = document.getElementById("metric-execution-time");

  // Visualizer Containers & Tabs
  const qubitRegisterContainer = document.getElementById("qubit-register-container");
  const samplingChunksContainer = document.getElementById("sampling-chunks-container");
  const circuitDiagramContainer = document.getElementById("circuit-diagram-container");
  const qasmViewContainer = document.getElementById("qasm-view-container");

  // Bloch Sphere Elements
  const blochCanvas = document.getElementById("bloch-canvas");
  const blochQubitSelect = document.getElementById("bloch-qubit-select");
  const blochStateFormula = document.getElementById("bloch-state-formula");
  const blochTheta = document.getElementById("bloch-theta");
  const blochPhi = document.getElementById("bloch-phi");
  const blochZExp = document.getElementById("bloch-z-exp");
  const blochP0 = document.getElementById("bloch-p0");
  const blochP1 = document.getElementById("bloch-p1");
  const blochThetaSlider = document.getElementById("bloch-theta-slider");
  const blochPhiSlider = document.getElementById("bloch-phi-slider");
  const blochThetaReadout = document.getElementById("bloch-theta-readout");
  const blochPhiReadout = document.getElementById("bloch-phi-readout");
  const blochMeasureBtn = document.getElementById("bloch-measure-btn");
  const gateButtons = document.querySelectorAll(".gate-btn");

  // Cryptanalysis Elements
  const cryptoGradeTitle = document.getElementById("crypto-grade-title");
  const cryptoGradeBadge = document.getElementById("crypto-grade-badge");
  const cryptoOnlineTime = document.getElementById("crypto-online-time");
  const cryptoGpuTime = document.getElementById("crypto-gpu-time");
  const cryptoSuperTime = document.getElementById("crypto-super-time");
  const cryptoGroverTime = document.getElementById("crypto-grover-time");
  const cryptoGroverBits = document.getElementById("crypto-grover-bits");
  const cryptoKeyspaceVal = document.getElementById("crypto-keyspace-val");
  const cryptoPqMargin = document.getElementById("crypto-pq-margin");

  // Benchmark Elements
  const runBenchmarkBtn = document.getElementById("run-benchmark-btn");
  const bmQEntropy = document.getElementById("bm-q-entropy");
  const bmQBits = document.getElementById("bm-q-bits");
  const bmQQubits = document.getElementById("bm-q-qubits");
  const bmCEntropy = document.getElementById("bm-c-entropy");
  const bmCBits = document.getElementById("bm-c-bits");

  // Sandbox Elements
  const sandboxKSlider = document.getElementById("sandbox-k-slider");
  const sandboxKVal = document.getElementById("sandbox-k-val");
  const sandboxSamplesSlider = document.getElementById("sandbox-samples-slider");
  const sandboxSamplesVal = document.getElementById("sandbox-samples-val");
  const sandboxRunBtn = document.getElementById("sandbox-run-btn");
  const sandboxNaiveHist = document.getElementById("sandbox-naive-hist");
  const sandboxRejHist = document.getElementById("sandbox-rej-hist");
  const sandboxNaiveChi = document.getElementById("sandbox-naive-chi");
  const sandboxNaiveP = document.getElementById("sandbox-naive-p");
  const sandboxRejChi = document.getElementById("sandbox-rej-chi");
  const sandboxRejP = document.getElementById("sandbox-rej-p");

  // State cache
  let latestGenerationData = null;
  let activeSelectedQubit = 0;
  let currentTheta = Math.PI / 2; // Default superposition: 90 deg
  let currentPhi = 0.0;           // Default 0 deg

  // -------------------------------------------------------------
  // 3. TAB NAVIGATION
  // -------------------------------------------------------------
  const tabButtons = document.querySelectorAll(".tab-btn");
  const tabContents = {
    qubits: document.getElementById("tab-qubits"),
    bloch: document.getElementById("tab-bloch"),
    cryptanalysis: document.getElementById("tab-cryptanalysis"),
    batch: document.getElementById("tab-batch"),
    sampling: document.getElementById("tab-sampling"),
    benchmark: document.getElementById("tab-benchmark"),
    sandbox: document.getElementById("tab-sandbox"),
    circuit: document.getElementById("tab-circuit"),
    qasm: document.getElementById("tab-qasm"),
    explainer: document.getElementById("tab-explainer"),
  };

  function switchTab(targetTab) {
    tabButtons.forEach((b) => {
      const isTarget = b.getAttribute("data-tab") === targetTab;
      b.classList.toggle("active", isTarget);
      b.setAttribute("aria-selected", isTarget ? "true" : "false");
    });

    Object.keys(tabContents).forEach((tabKey) => {
      if (tabContents[tabKey]) {
        tabContents[tabKey].style.display = tabKey === targetTab ? "block" : "none";
      }
    });

    if (targetTab === "bloch") {
      drawBlochSphere();
    }
  }

  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      switchTab(btn.getAttribute("data-tab"));
    });
  });

  // -------------------------------------------------------------
  // 4. GENERATION MODE SWITCHER & PRESETS
  // -------------------------------------------------------------
  modeTabBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      initAudio();
      modeTabBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      currentMode = btn.getAttribute("data-mode");

      charControls.style.display = currentMode === "character" ? "block" : "none";
      dicewareControls.style.display = currentMode === "diceware" ? "block" : "none";
      batchControls.style.display = currentMode === "batch" ? "block" : "none";

      if (currentMode === "diceware") {
        qubitReqBadge.textContent = "10 Qubits";
      } else {
        updateRequiredQubits();
      }
    });
  });

  presetPillBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      initAudio();
      const preset = btn.getAttribute("data-preset");

      if (preset === "post-quantum") {
        setMode("character");
        lengthSlider.value = 32;
        lengthValue.value = 32;
        upperCheckbox.checked = true;
        lowerCheckbox.checked = true;
        digitsCheckbox.checked = true;
        symbolsCheckbox.checked = true;
        customCharsetInput.value = "";
      } else if (preset === "web-sec") {
        setMode("character");
        lengthSlider.value = 16;
        lengthValue.value = 16;
        upperCheckbox.checked = true;
        lowerCheckbox.checked = true;
        digitsCheckbox.checked = true;
        symbolsCheckbox.checked = false;
        customCharsetInput.value = "";
      } else if (preset === "hex-seed") {
        setMode("character");
        lengthSlider.value = 64;
        lengthValue.value = 64;
        upperCheckbox.checked = false;
        lowerCheckbox.checked = false;
        digitsCheckbox.checked = false;
        symbolsCheckbox.checked = false;
        customCharsetInput.value = "0123456789abcdef";
      } else if (preset === "pin") {
        setMode("character");
        lengthSlider.value = 6;
        lengthValue.value = 6;
        upperCheckbox.checked = false;
        lowerCheckbox.checked = false;
        digitsCheckbox.checked = true;
        symbolsCheckbox.checked = false;
        customCharsetInput.value = "";
      } else if (preset === "diceware-5") {
        setMode("diceware");
        dicewareWordsSlider.value = 5;
        dicewareWordsVal.value = 5;
      }

      updateRequiredQubits();
    });
  });

  function setMode(mode) {
    currentMode = mode;
    modeTabBtns.forEach((b) => {
      b.classList.toggle("active", b.getAttribute("data-mode") === mode);
    });
    charControls.style.display = mode === "character" ? "block" : "none";
    dicewareControls.style.display = mode === "diceware" ? "block" : "none";
    batchControls.style.display = mode === "batch" ? "block" : "none";
  }

  // -------------------------------------------------------------
  // 5. PARAMETER BINDINGS
  // -------------------------------------------------------------
  lengthSlider.addEventListener("input", (e) => {
    lengthValue.value = e.target.value;
    updateRequiredQubits();
  });

  dicewareWordsSlider.addEventListener("input", (e) => {
    dicewareWordsVal.value = e.target.value;
  });

  batchCountSlider.addEventListener("input", (e) => {
    batchCountVal.value = e.target.value;
  });

  [upperCheckbox, lowerCheckbox, digitsCheckbox, symbolsCheckbox].forEach((cb) => {
    cb.addEventListener("change", updateRequiredQubits);
  });
  customCharsetInput.addEventListener("input", updateRequiredQubits);

  function calculateActiveCharsetSize() {
    let size = 0;
    if (customCharsetInput.value) {
      return new Set(customCharsetInput.value.split("")).size;
    }
    if (upperCheckbox.checked) size += 26;
    if (lowerCheckbox.checked) size += 26;
    if (digitsCheckbox.checked) size += 10;
    if (symbolsCheckbox.checked) size += 26;
    return size;
  }

  function updateRequiredQubits() {
    if (currentMode === "diceware") {
      qubitReqBadge.textContent = "10 Qubits";
      return;
    }
    const size = calculateActiveCharsetSize();
    if (size <= 1) {
      qubitReqBadge.textContent = "0 Qubits";
      return;
    }
    const bits = Math.ceil(Math.log2(size));
    qubitReqBadge.textContent = `${bits} Qubits`;
  }

  // -------------------------------------------------------------
  // 6. 3D BLOCH SPHERE INTERACTIVE ENGINE & GATE SANDBOX
  // -------------------------------------------------------------
  const ctx = blochCanvas ? blochCanvas.getContext("2d") : null;
  let viewRotX = 20 * (Math.PI / 180);
  let viewRotY = 35 * (Math.PI / 180);
  let isDragging = false;
  let lastMouseX = 0;
  let lastMouseY = 0;

  if (blochCanvas) {
    blochCanvas.addEventListener("mousedown", (e) => {
      initAudio();
      isDragging = true;
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;
    });

    window.addEventListener("mouseup", () => { isDragging = false; });

    window.addEventListener("mousemove", (e) => {
      if (!isDragging) return;
      const dx = e.clientX - lastMouseX;
      const dy = e.clientY - lastMouseY;
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;

      viewRotY += dx * 0.01;
      viewRotX += dy * 0.01;
      viewRotX = Math.max(-Math.PI / 2 + 0.1, Math.min(Math.PI / 2 - 0.1, viewRotX));
      drawBlochSphere();
    });
  }

  function project3D(x, y, z, cx, cy, radius) {
    const cosY = Math.cos(viewRotY);
    const sinY = Math.sin(viewRotY);
    const x1 = x * cosY + z * sinY;
    const z1 = -x * sinY + z * cosY;

    const cosX = Math.cos(viewRotX);
    const sinX = Math.sin(viewRotX);
    const y2 = y * cosX - z1 * sinX;
    const z2 = y * sinX + z1 * cosX;

    const px = cx + x1 * radius;
    const py = cy - y2 * radius;
    return { px, py, zDepth: z2 };
  }

  function drawBlochSphere() {
    if (!ctx) return;
    const width = blochCanvas.width;
    const height = blochCanvas.height;
    const cx = width / 2;
    const cy = height / 2;
    const radius = 105;

    ctx.clearRect(0, 0, width, height);

    // Outer rim circle
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.strokeStyle = "#252e42";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Subtle radial glow
    const sphereGrad = ctx.createRadialGradient(cx - 20, cy - 20, 10, cx, cy, radius);
    sphereGrad.addColorStop(0, "rgba(18, 24, 38, 0.4)");
    sphereGrad.addColorStop(1, "rgba(10, 13, 20, 0.7)");
    ctx.fillStyle = sphereGrad;
    ctx.fill();

    // Equator ring: z = 0
    ctx.beginPath();
    for (let angle = 0; angle <= Math.PI * 2 + 0.1; angle += 0.08) {
      const p = project3D(Math.cos(angle), Math.sin(angle), 0, cx, cy, radius);
      if (angle === 0) ctx.moveTo(p.px, p.py);
      else ctx.lineTo(p.px, p.py);
    }
    ctx.strokeStyle = "rgba(6, 182, 212, 0.35)";
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Longitude Meridian: x = 0
    ctx.beginPath();
    for (let angle = 0; angle <= Math.PI * 2 + 0.1; angle += 0.08) {
      const p = project3D(0, Math.cos(angle), Math.sin(angle), cx, cy, radius);
      if (angle === 0) ctx.moveTo(p.px, p.py);
      else ctx.lineTo(p.px, p.py);
    }
    ctx.strokeStyle = "rgba(45, 53, 77, 0.6)";
    ctx.stroke();

    // Axes
    const origin = project3D(0, 0, 0, cx, cy, radius);
    const axisX = project3D(1.3, 0, 0, cx, cy, radius);
    const axisY = project3D(0, 1.3, 0, cx, cy, radius);
    const axisZ = project3D(0, 0, 1.3, cx, cy, radius);
    const axisNegZ = project3D(0, 0, -1.3, cx, cy, radius);

    // Z-Axis
    ctx.beginPath();
    ctx.moveTo(axisNegZ.px, axisNegZ.py);
    ctx.lineTo(axisZ.px, axisZ.py);
    ctx.strokeStyle = "rgba(148, 163, 184, 0.5)";
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // X-Axis
    ctx.beginPath();
    ctx.moveTo(origin.px, origin.py);
    ctx.lineTo(axisX.px, axisX.py);
    ctx.strokeStyle = "rgba(6, 182, 212, 0.7)";
    ctx.stroke();

    // Y-Axis
    ctx.beginPath();
    ctx.moveTo(origin.px, origin.py);
    ctx.lineTo(axisY.px, axisY.py);
    ctx.strokeStyle = "rgba(100, 116, 139, 0.5)";
    ctx.stroke();

    // Labels
    ctx.font = "bold 11px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#10b981";
    ctx.fillText("|0⟩", axisZ.px + 5, axisZ.py - 4);
    ctx.fillStyle = "#f43f5e";
    ctx.fillText("|1⟩", axisNegZ.px + 5, axisNegZ.py + 12);
    ctx.fillStyle = "#06b6d4";
    ctx.fillText("|+⟩ (X)", axisX.px + 4, axisX.py + 4);
    ctx.fillStyle = "#64748b";
    ctx.fillText("Y", axisY.px + 4, axisY.py + 4);

    // State Vector calculation
    const vx = Math.sin(currentTheta) * Math.cos(currentPhi);
    const vy = Math.sin(currentTheta) * Math.sin(currentPhi);
    const vz = Math.cos(currentTheta);

    const tip = project3D(vx, vy, vz, cx, cy, radius);

    // Draw Vector Line
    ctx.beginPath();
    ctx.moveTo(origin.px, origin.py);
    ctx.lineTo(tip.px, tip.py);
    ctx.strokeStyle = "#f59e0b"; // Warm Amber
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Draw Vector Tip Marker
    ctx.beginPath();
    ctx.arc(tip.px, tip.py, 4.5, 0, Math.PI * 2);
    ctx.fillStyle = "#f59e0b";
    ctx.fill();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1;
    ctx.stroke();

    // Update Bloch Telemetry Cards
    updateBlochTelemetry();
  }

  function updateBlochTelemetry() {
    const thetaDeg = (currentTheta * (180 / Math.PI)).toFixed(1);
    const phiDeg = (currentPhi * (180 / Math.PI)).toFixed(1);

    if (blochTheta) blochTheta.textContent = `${thetaDeg}°`;
    if (blochPhi) blochPhi.textContent = `${phiDeg}°`;
    if (blochThetaReadout) blochThetaReadout.textContent = `${thetaDeg}°`;
    if (blochPhiReadout) blochPhiReadout.textContent = `${phiDeg}°`;

    const p0 = Math.cos(currentTheta / 2) ** 2;
    const p1 = Math.sin(currentTheta / 2) ** 2;
    const expZ = p0 - p1;

    if (blochZExp) blochZExp.textContent = expZ.toFixed(2);
    if (blochP0) blochP0.textContent = `${(p0 * 100).toFixed(1)}%`;
    if (blochP1) blochP1.textContent = `${(p1 * 100).toFixed(1)}%`;

    if (blochStateFormula) {
      if (Math.abs(p0 - 0.5) < 0.05) {
        blochStateFormula.textContent = "|ψ⟩ = (|0⟩ + |1⟩) / √2";
      } else if (p0 > 0.98) {
        blochStateFormula.textContent = "|ψ⟩ = |0⟩ (Ground State)";
      } else if (p1 > 0.98) {
        blochStateFormula.textContent = "|ψ⟩ = |1⟩ (Excited State)";
      } else {
        blochStateFormula.textContent = `|ψ⟩ = ${Math.sqrt(p0).toFixed(2)}|0⟩ + ${Math.sqrt(p1).toFixed(2)}e^(iφ)|1⟩`;
      }
    }
  }

  // Interactive Quantum Gate Button Handlers
  gateButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      initAudio();
      const gate = btn.getAttribute("data-gate");
      if (!gate) return;

      if (gate === "H") {
        // Hadamard: rotates |0> <-> |+>
        if (Math.abs(currentTheta) < 0.1) {
          currentTheta = Math.PI / 2;
          currentPhi = 0.0;
        } else if (Math.abs(currentTheta - Math.PI / 2) < 0.1 && Math.abs(currentPhi) < 0.1) {
          currentTheta = 0.0;
          currentPhi = 0.0;
        } else {
          currentTheta = Math.PI / 2;
          currentPhi = 0.0;
        }
      } else if (gate === "X") {
        // Pauli-X: bit flip theta -> pi - theta
        currentTheta = Math.PI - currentTheta;
      } else if (gate === "Y") {
        // Pauli-Y: bit and phase flip
        currentTheta = Math.PI - currentTheta;
        currentPhi = (Math.PI - currentPhi + 2 * Math.PI) % (2 * Math.PI);
      } else if (gate === "Z") {
        // Pauli-Z: phase flip
        currentPhi = (currentPhi + Math.PI) % (2 * Math.PI);
      } else if (gate === "S") {
        // Phase S: pi/2 rotation
        currentPhi = (currentPhi + Math.PI / 2) % (2 * Math.PI);
      } else if (gate === "T") {
        // Phase T: pi/4 rotation
        currentPhi = (currentPhi + Math.PI / 4) % (2 * Math.PI);
      } else if (gate === "RESET") {
        // Reset to |0>
        currentTheta = 0.0;
        currentPhi = 0.0;
      }

      if (blochThetaSlider) blochThetaSlider.value = Math.round(currentTheta * (180 / Math.PI));
      if (blochPhiSlider) blochPhiSlider.value = Math.round(currentPhi * (180 / Math.PI));

      playRelayClick();
      drawBlochSphere();
    });
  });

  // Projective Measurement on Bloch Sphere
  if (blochMeasureBtn) {
    blochMeasureBtn.addEventListener("click", () => {
      initAudio();
      const p0 = Math.cos(currentTheta / 2) ** 2;
      const collapsed = Math.random() < p0 ? 0 : 1;

      // Collapse statevector
      currentTheta = collapsed === 0 ? 0.0 : Math.PI;
      currentPhi = 0.0;

      if (blochThetaSlider) blochThetaSlider.value = Math.round(currentTheta * (180 / Math.PI));
      if (blochPhiSlider) blochPhiSlider.value = 0;

      playCollapsePulse();
      drawBlochSphere();
    });
  }

  // Continuous Angle Sliders
  if (blochThetaSlider) {
    blochThetaSlider.addEventListener("input", (e) => {
      currentTheta = (parseFloat(e.target.value) * Math.PI) / 180;
      drawBlochSphere();
    });
  }
  if (blochPhiSlider) {
    blochPhiSlider.addEventListener("input", (e) => {
      currentPhi = (parseFloat(e.target.value) * Math.PI) / 180;
      drawBlochSphere();
    });
  }

  if (blochQubitSelect) {
    blochQubitSelect.addEventListener("change", (e) => {
      activeSelectedQubit = parseInt(e.target.value, 10);
      if (latestGenerationData && latestGenerationData.qubit_states) {
        const q = latestGenerationData.qubit_states[activeSelectedQubit];
        if (q) {
          currentTheta = q.collapsed_state === 0 ? 0.0 : Math.PI;
          currentPhi = 0.0;
          if (blochThetaSlider) blochThetaSlider.value = Math.round(currentTheta * (180 / Math.PI));
          if (blochPhiSlider) blochPhiSlider.value = 0;
          drawBlochSphere();
        }
      }
    });
  }

  // -------------------------------------------------------------
  // 7. CRYPTANALYSIS & GROVER QUANTUM ATTACK CALCULATOR
  // -------------------------------------------------------------
  function updateCryptanalysisTelemetry(entropyBits) {
    if (!entropyBits || entropyBits <= 0) return;

    // Keyspace size = 2^H
    const exp10 = (entropyBits * Math.log10(2)).toFixed(1);
    cryptoKeyspaceVal.textContent = `2^${entropyBits.toFixed(1)} (≈ 10^${exp10})`;

    // Online Brute Force at 100/s: (2^H) / 100 seconds
    const onlineSec = Math.pow(2, Math.min(entropyBits, 120)) / 100;
    cryptoOnlineTime.textContent = formatDuration(onlineSec, entropyBits);

    // Fast GPU Cluster (8x RTX 4090) at 10^11 / s
    const gpuSec = Math.pow(2, Math.min(entropyBits, 120)) / 1e11;
    cryptoGpuTime.textContent = formatDuration(gpuSec, entropyBits);

    // Supercomputer at 10^15 / s
    const superSec = Math.pow(2, Math.min(entropyBits, 120)) / 1e15;
    cryptoSuperTime.textContent = formatDuration(superSec, entropyBits);

    // Grover's Algorithm: 2^(H/2) quantum operations
    const groverBits = (entropyBits / 2).toFixed(1);
    cryptoGroverBits.textContent = `${groverBits} Post-Quantum Bits`;
    const groverOpsSec = Math.pow(2, Math.min(entropyBits / 2, 120)) / 1e9; // 1 GHz quantum clock
    cryptoGroverTime.textContent = formatDuration(groverOpsSec, entropyBits / 2);

    if (entropyBits >= 128) {
      cryptoPqMargin.textContent = "Optimal (≥ 64-bit Grover resistance)";
      cryptoGradeTitle.textContent = "MIL-SPEC POST-QUANTUM RESISTANT";
      cryptoGradeTitle.style.color = "var(--quantum-state-0)";
      cryptoGradeBadge.textContent = "EXCELLENT • NIST COMPLIANT";
      cryptoGradeBadge.className = "badge-tag accept";
    } else if (entropyBits >= 80) {
      cryptoPqMargin.textContent = "Adequate (Standard Classical Safety)";
      cryptoGradeTitle.textContent = "ENTERPRISE STANDARD CRYPTO";
      cryptoGradeTitle.style.color = "var(--quantum-gold)";
      cryptoGradeBadge.textContent = "PASS • STANDARD";
      cryptoGradeBadge.className = "badge-tag accept";
    } else {
      cryptoPqMargin.textContent = "Low Quantum Margin";
      cryptoGradeTitle.textContent = "REDUCED SECURITY MARGIN";
      cryptoGradeTitle.style.color = "var(--quantum-rejected)";
      cryptoGradeBadge.textContent = "SHORT KEYSPACE";
      cryptoGradeBadge.className = "badge-tag reject";
    }
  }

  function formatDuration(seconds, origBits) {
    if (origBits > 100) return "> 10²⁴ Years (Infinite)";
    if (seconds > 3.15e16) {
      const gigaYears = seconds / 3.15e16;
      return `${gigaYears.toExponential(1)} Billion Years`;
    }
    if (seconds > 3.15e9) {
      const megaYears = seconds / 3.15e7;
      return `${megaYears.toExponential(1)} Years`;
    }
    if (seconds > 31536000) {
      const years = Math.round(seconds / 31536000);
      return `${years.toLocaleString()} Years`;
    }
    if (seconds > 86400) {
      return `${Math.round(seconds / 86400)} Days`;
    }
    if (seconds > 3600) {
      return `${Math.round(seconds / 3600)} Hours`;
    }
    if (seconds > 60) {
      return `${Math.round(seconds / 60)} Minutes`;
    }
    return `${seconds.toFixed(2)} Seconds`;
  }

  // -------------------------------------------------------------
  // 8. PRIMARY FORM SUBMISSION (ALL MODES)
  // -------------------------------------------------------------
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    initAudio();
    playRelayClick();
    errorMessage.textContent = "";
    errorMessage.style.display = "none";
    generateBtn.disabled = true;
    generateBtn.textContent = "Measuring Wavefunction...";

    const backendMode = backendSelect.value;

    try {
      if (currentMode === "diceware") {
        await executeDicewareGeneration(backendMode);
      } else if (currentMode === "batch") {
        await executeBatchGeneration(backendMode);
      } else {
        await executeCharacterGeneration(backendMode);
      }
      playQuantumChime();
    } catch (err) {
      errorMessage.textContent = err.message || "Measurement error occurred.";
      errorMessage.style.display = "block";
    } finally {
      generateBtn.disabled = false;
      generateBtn.textContent = "Measure Quantum Register";
    }
  });

  if (regenBtn) {
    regenBtn.addEventListener("click", () => {
      initAudio();
      form.requestSubmit();
    });
  }

  // Character Key Generation Handler
  async function executeCharacterGeneration(backendMode) {
    const payload = {
      length: parseInt(lengthSlider.value, 10),
      include_uppercase: upperCheckbox.checked,
      include_lowercase: lowerCheckbox.checked,
      include_digits: digitsCheckbox.checked,
      include_symbols: symbolsCheckbox.checked,
      custom_charset: customCharsetInput.value.trim() || null,
      backend_mode: backendMode,
    };

    const res = await fetch("/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || `Server returned HTTP ${res.status}`);
    }

    const data = await res.json();
    latestGenerationData = data;
    renderGenerationResults(data);
  }

  // Quantum Diceware Passphrase Handler
  async function executeDicewareGeneration(backendMode) {
    const payload = {
      num_words: parseInt(dicewareWordsSlider.value, 10),
      separator: dicewareSepSelect.value,
      capitalize: dicewareCapitalize.checked,
      include_number: dicewareNumber.checked,
      backend_mode: backendMode,
    };

    const res = await fetch("/generate/passphrase", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || `Server returned HTTP ${res.status}`);
    }

    const data = await res.json();
    latestGenerationData = data;
    renderDicewareResults(data);
  }

  // Batch Multi-Key Vault Generation Handler
  async function executeBatchGeneration(backendMode) {
    const payload = {
      length: parseInt(lengthSlider.value, 10),
      count: parseInt(batchCountSlider.value, 10),
      include_uppercase: upperCheckbox.checked,
      include_lowercase: lowerCheckbox.checked,
      include_digits: digitsCheckbox.checked,
      include_symbols: symbolsCheckbox.checked,
      custom_charset: customCharsetInput.value.trim() || null,
      backend_mode: backendMode,
    };

    const res = await fetch("/generate/batch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || `Server returned HTTP ${res.status}`);
    }

    const data = await res.json();
    renderBatchResults(data);
    switchTab("batch");
  }

  // -------------------------------------------------------------
  // 9. RENDERING ENGINES
  // -------------------------------------------------------------
  function renderGenerationResults(data) {
    playGeigerBurst(8);

    // Staggered Typewriter Decryption
    staggeredPasswordReveal(data.password);

    // Update Telemetry
    metricShannonEntropy.textContent = `${data.shannon_entropy_bits.toFixed(2)} b`;
    metricTheoreticalEntropy.textContent = `${data.theoretical_entropy_bits.toFixed(2)} b`;
    metricQubits.textContent = `${data.num_qubits}`;
    metricShots.textContent = `${data.total_shots}`;
    metricRejections.textContent = `${data.rejected_count} (${((data.rejected_count / Math.max(1, data.total_shots)) * 100).toFixed(1)}%)`;
    metricExecutionTime.textContent = `${data.execution_time_ms.toFixed(1)} ms`;

    // Entropy density
    const efficiency = Math.min(100, Math.round((data.shannon_entropy_bits / data.theoretical_entropy_bits) * 100));
    entropyGaugeBar.style.width = `${efficiency}%`;
    entropyEfficiencyReadout.textContent = `${efficiency}%`;
    entropyRateBadge.textContent = `${data.shannon_entropy_bits.toFixed(1)} bits (${efficiency}%)`;

    // Cryptanalysis
    updateCryptanalysisTelemetry(data.theoretical_entropy_bits);

    // Populate Qubit Chips
    renderQubitChips(data.qubit_states);

    // Populate Rejection Table
    renderSamplingTrace(data.chunks);

    // Circuit Diagrams
    renderCircuit(data.circuit);

    // Sync Bloch Sphere Qubit Selector
    syncBlochQubitSelector(data.qubit_states);
  }

  function renderDicewareResults(data) {
    staggeredPasswordReveal(data.passphrase);

    metricShannonEntropy.textContent = `${data.total_entropy_bits.toFixed(2)} b`;
    metricTheoreticalEntropy.textContent = `${data.total_entropy_bits.toFixed(2)} b`;
    metricQubits.textContent = `${data.num_qubits}`;
    metricShots.textContent = `${data.num_words}`;
    metricRejections.textContent = "0 (Exact 2¹⁰)";
    metricExecutionTime.textContent = `${data.execution_time_ms.toFixed(1)} ms`;

    entropyGaugeBar.style.width = "100%";
    entropyEfficiencyReadout.textContent = "100%";
    entropyRateBadge.textContent = `${data.total_entropy_bits.toFixed(1)} bits (100%)`;

    updateCryptanalysisTelemetry(data.total_entropy_bits);

    // Render word trace in sampling tab
    renderDicewareWordTrace(data.word_details);
    renderCircuit(data.circuit);
  }

  function renderBatchResults(data) {
    batchGeneratedItems = data.passwords;
    batchTableBody.innerHTML = "";

    data.passwords.forEach((item) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td style="color: var(--text-tertiary);">${item.index}</td>
        <td style="font-weight: 700; color: var(--quantum-gold); letter-spacing: 0.05em;">${escapeHtml(item.password)}</td>
        <td>${item.length} chars</td>
        <td style="color: var(--quantum-cyan);">${item.entropy_bits.toFixed(1)} bits</td>
        <td>
          <button type="button" class="copy-mini-btn" data-pwd="${escapeHtml(item.password)}">Copy</button>
        </td>
      `;
      batchTableBody.appendChild(tr);
    });

    // Attach copy handlers
    batchTableBody.querySelectorAll(".copy-mini-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const text = btn.getAttribute("data-pwd");
        navigator.clipboard.writeText(text).then(() => {
          const original = btn.textContent;
          btn.textContent = "Copied!";
          btn.style.color = "var(--quantum-state-0)";
          setTimeout(() => {
            btn.textContent = original;
            btn.style.color = "";
          }, 1500);
        });
      });
    });

    // Also populate primary output with first key
    if (data.passwords.length > 0) {
      passwordOutput.value = data.passwords[0].password;
      metricExecutionTime.textContent = `${data.execution_time_ms.toFixed(1)} ms`;
      updateCryptanalysisTelemetry(data.passwords[0].entropy_bits);
    }
  }

  // Typewriter Decryption Reveal Animation
  function staggeredPasswordReveal(targetText) {
    let currentLen = 0;
    const interval = setInterval(() => {
      currentLen++;
      playTypewriterTick();
      const revealed = targetText.slice(0, currentLen);
      const scrambled = Array.from({ length: targetText.length - currentLen }, () =>
        String.fromCharCode(33 + Math.floor(Math.random() * 90))
      ).join("");

      passwordOutput.value = revealed + scrambled;

      if (currentLen >= targetText.length) {
        clearInterval(interval);
        passwordOutput.value = targetText;
      }
    }, 28);
  }

  // -------------------------------------------------------------
  // 10. VISUALIZERS: CHIPS, SAMPLING, CIRCUITS
  // -------------------------------------------------------------
  function renderQubitChips(qubitStates) {
    qubitRegisterContainer.innerHTML = "";
    if (!qubitStates) return;

    qubitStates.forEach((q, idx) => {
      const chip = document.createElement("div");
      chip.className = `qubit-chip collapsed-${q.collapsed_state}`;
      chip.innerHTML = `
        <div class="qubit-chip-label">q[${q.qubit_index}]</div>
        <div class="qubit-chip-state">|${q.collapsed_state}⟩</div>
        <div class="qubit-chip-prob">P(|0⟩): 50%</div>
      `;

      chip.addEventListener("click", () => {
        initAudio();
        blochQubitSelect.value = q.qubit_index;
        activeSelectedQubit = q.qubit_index;
        currentTheta = q.collapsed_state === 0 ? 0.0 : Math.PI;
        currentPhi = 0.0;
        if (blochThetaSlider) blochThetaSlider.value = Math.round(currentTheta * (180 / Math.PI));
        if (blochPhiSlider) blochPhiSlider.value = 0;
        switchTab("bloch");
        playRelayClick();
      });

      qubitRegisterContainer.appendChild(chip);
    });
  }

  function syncBlochQubitSelector(qubitStates) {
    blochQubitSelect.innerHTML = "";
    if (!qubitStates) return;
    qubitStates.forEach((q) => {
      const opt = document.createElement("option");
      opt.value = q.qubit_index;
      opt.textContent = `q[${q.qubit_index}] (Collapsed: |${q.collapsed_state}⟩)`;
      blochQubitSelect.appendChild(opt);
    });
    blochQubitSelect.value = activeSelectedQubit;
  }

  function renderSamplingTrace(chunks) {
    samplingChunksContainer.innerHTML = "";
    if (!chunks) return;

    const table = document.createElement("table");
    table.className = "batch-table";
    table.innerHTML = `
      <thead>
        <tr>
          <th>Chunk Bits</th>
          <th>Integer</th>
          <th>Decision</th>
          <th>Character</th>
        </tr>
      </thead>
      <tbody>
        ${chunks.map((c) => `
          <tr>
            <td style="font-family: var(--font-mono); color: var(--quantum-cyan);">${escapeHtml(c.chunk_bits)}</td>
            <td>${c.value}</td>
            <td>
              <span class="badge-tag ${c.accepted ? 'accept' : 'reject'}">
                ${c.accepted ? 'ACCEPTED (v < K)' : 'DISCARDED (v ≥ K)'}
              </span>
            </td>
            <td style="font-weight: 700; color: var(--quantum-gold);">${c.character ? escapeHtml(c.character) : '—'}</td>
          </tr>
        `).join("")}
      </tbody>
    `;
    samplingChunksContainer.appendChild(table);
  }

  function renderDicewareWordTrace(wordDetails) {
    samplingChunksContainer.innerHTML = "";
    if (!wordDetails) return;

    const table = document.createElement("table");
    table.className = "batch-table";
    table.innerHTML = `
      <thead>
        <tr>
          <th>Word</th>
          <th>Quantum 10-Bit Vector</th>
          <th>Index in 1024 Dict</th>
          <th>Modulo Bias</th>
        </tr>
      </thead>
      <tbody>
        ${wordDetails.map((w) => `
          <tr>
            <td style="font-weight: 700; color: var(--quantum-gold);">${escapeHtml(w.word)}</td>
            <td style="font-family: var(--font-mono); color: var(--quantum-cyan);">${escapeHtml(w.bitstring)}</td>
            <td>#${w.word_index}</td>
            <td><span class="badge-tag accept">0.00% (Exact 2¹⁰)</span></td>
          </tr>
        `).join("")}
      </tbody>
    `;
    samplingChunksContainer.appendChild(table);
  }

  function renderCircuit(circuitData) {
    if (!circuitData) return;
    if (circuitData.svg_diagram) {
      circuitDiagramContainer.innerHTML = circuitData.svg_diagram;
    } else if (circuitData.text_diagram) {
      circuitDiagramContainer.innerHTML = `<pre class="circuit-text-pre">${escapeHtml(circuitData.text_diagram)}</pre>`;
    }
    qasmViewContainer.textContent = circuitData.qasm || "// OpenQASM not available";
  }

  // -------------------------------------------------------------
  // 11. EXPORT HUB & AIR-GAPPED QR CODE
  // -------------------------------------------------------------
  if (exportDropdownBtn && exportDropdownMenu) {
    exportDropdownBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      exportDropdownMenu.classList.toggle("show");
    });

    document.addEventListener("click", () => {
      exportDropdownMenu.classList.remove("show");
    });

    exportMenuItems.forEach((item) => {
      item.addEventListener("click", () => {
        const action = item.getAttribute("data-export");
        const key = passwordOutput.value;
        if (!key) return;

        if (action === "copy-env") {
          navigator.clipboard.writeText(`QUANTUM_SECRET_KEY="${key}"`);
        } else if (action === "copy-shell") {
          navigator.clipboard.writeText(`export QUANTUM_KEY="${key}"`);
        } else if (action === "download-env") {
          const content = `# Generated by Qiskit Quantum Entropy Generator\nQUANTUM_SECRET_KEY="${key}"\nQUANTUM_TIMESTAMP="${new Date().toISOString()}"\n`;
          downloadFile("quantum_secret.env", content, "text/plain");
        } else if (action === "download-json") {
          const content = JSON.stringify(latestGenerationData || { key }, null, 2);
          downloadFile("quantum_audit.json", content, "application/json");
        }
      });
    });
  }

  // QR Code Modal Trigger
  if (qrModalBtn && qrModal) {
    qrModalBtn.addEventListener("click", () => {
      const key = passwordOutput.value;
      if (!key) return;
      if (window.QRCode) {
        new window.QRCode(qrCanvas, {
          width: 220,
          height: 220,
          colorDark: "#38bdf8",
          colorLight: "#0c0f17",
        }).makeCode(key);
      }
      qrModal.classList.add("active");
    });

    [qrModalClose, qrModalDone].forEach((btn) => {
      if (btn) btn.addEventListener("click", () => qrModal.classList.remove("active"));
    });

    qrModal.addEventListener("click", (e) => {
      if (e.target === qrModal) qrModal.classList.remove("active");
    });
  }

  // Batch Export Buttons
  document.getElementById("batch-export-env-btn")?.addEventListener("click", () => {
    if (batchGeneratedItems.length === 0) return;
    const content = batchGeneratedItems.map((item) => `KEY_${item.index}="${item.password}"`).join("\n");
    downloadFile("quantum_batch.env", content, "text/plain");
  });

  document.getElementById("batch-export-csv-btn")?.addEventListener("click", () => {
    if (batchGeneratedItems.length === 0) return;
    const csv = "Index,Password,Length,EntropyBits\n" +
      batchGeneratedItems.map((i) => `${i.index},"${i.password}",${i.length},${i.entropy_bits}`).join("\n");
    downloadFile("quantum_batch.csv", csv, "text/csv");
  });

  document.getElementById("batch-export-json-btn")?.addEventListener("click", () => {
    if (batchGeneratedItems.length === 0) return;
    downloadFile("quantum_batch.json", JSON.stringify(batchGeneratedItems, null, 2), "application/json");
  });

  function downloadFile(filename, text, mime) {
    const blob = new Blob([text], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  // -------------------------------------------------------------
  // 12. BENCHMARK & SANDBOX CALLS
  // -------------------------------------------------------------
  if (runBenchmarkBtn) {
    runBenchmarkBtn.addEventListener("click", async () => {
      initAudio();
      playRelayClick();
      runBenchmarkBtn.disabled = true;
      runBenchmarkBtn.textContent = "Benchmarking...";

      try {
        const payload = {
          length: parseInt(lengthSlider.value, 10),
          include_uppercase: upperCheckbox.checked,
          include_lowercase: lowerCheckbox.checked,
          include_digits: digitsCheckbox.checked,
          include_symbols: symbolsCheckbox.checked,
          custom_charset: customCharsetInput.value.trim() || null,
        };

        const res = await fetch("/benchmark/compare", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          const data = await res.json();
          bmQEntropy.textContent = `${data.quantum.shannon_entropy.toFixed(3)} b`;
          bmQBits.textContent = `0s: ${(data.quantum.bit_balance.ratio_zeros * 100).toFixed(1)}% | 1s: ${(data.quantum.bit_balance.ratio_ones * 100).toFixed(1)}%`;
          bmQQubits.textContent = `${data.quantum.qubits_measured} Qubits`;

          bmCEntropy.textContent = `${data.classical.shannon_entropy.toFixed(3)} b`;
          bmCBits.textContent = `0s: ${(data.classical.bit_balance.ratio_zeros * 100).toFixed(1)}% | 1s: ${(data.classical.bit_balance.ratio_ones * 100).toFixed(1)}%`;
        }
      } finally {
        runBenchmarkBtn.disabled = false;
        runBenchmarkBtn.textContent = "Run Comparative Benchmark";
      }
    });
  }

  if (sandboxRunBtn) {
    sandboxRunBtn.addEventListener("click", async () => {
      initAudio();
      playRelayClick();
      sandboxRunBtn.disabled = true;
      sandboxRunBtn.textContent = "Simulating...";

      try {
        const k = parseInt(sandboxKSlider.value, 10);
        const samples = parseInt(sandboxSamplesSlider.value, 10);
        const res = await fetch(`/benchmark/modulo-bias?charset_size=${k}&sample_count=${samples}`);

        if (res.ok) {
          const data = await res.json();
          renderHistogram(sandboxNaiveHist, data.naive_modulo.frequencies);
          sandboxNaiveChi.textContent = data.naive_modulo.chi_square_statistic.toFixed(2);
          sandboxNaiveP.textContent = data.naive_modulo.p_value < 0.0001 ? "< 10⁻⁴ (Biased)" : data.naive_modulo.p_value.toFixed(4);

          renderHistogram(sandboxRejHist, data.rejection_sampling.frequencies);
          sandboxRejChi.textContent = data.rejection_sampling.chi_square_statistic.toFixed(2);
          sandboxRejP.textContent = `${data.rejection_sampling.p_value.toFixed(4)} (Uniform)`;
        }
      } finally {
        sandboxRunBtn.disabled = false;
        sandboxRunBtn.textContent = "Run Simulation";
      }
    });
  }

  function renderHistogram(container, freqMap) {
    container.innerHTML = "";
    if (!freqMap) return;
    const values = Object.values(freqMap);
    const maxVal = Math.max(...values, 1);
    const isBiased = container.id.includes("naive");

    Object.keys(freqMap).forEach((key) => {
      const count = freqMap[key];
      const pct = (count / maxVal) * 100;
      const bar = document.createElement("div");
      bar.className = `hist-bar ${isBiased ? "biased-bar" : "uniform-bar"}`;
      bar.style.height = `${pct}%`;
      bar.setAttribute("data-count", `${key}: ${count}`);
      container.appendChild(bar);
    });
  }

  if (sandboxKSlider) {
    sandboxKSlider.addEventListener("input", (e) => {
      sandboxKVal.value = e.target.value;
    });
  }
  if (sandboxSamplesSlider) {
    sandboxSamplesSlider.addEventListener("input", (e) => {
      sandboxSamplesVal.value = e.target.value;
    });
  }

  // Copy Key Button
  if (copyBtn) {
    copyBtn.addEventListener("click", () => {
      const text = passwordOutput.value;
      if (!text) return;
      navigator.clipboard.writeText(text).then(() => {
        copyText.textContent = "Copied!";
        copyBtn.style.borderColor = "var(--quantum-state-0)";
        setTimeout(() => {
          copyText.textContent = "Copy Key";
          copyBtn.style.borderColor = "";
        }, 1800);
      });
    });
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // Initial draw and trigger
  updateRequiredQubits();
  drawBlochSphere();
  form.requestSubmit();
});
