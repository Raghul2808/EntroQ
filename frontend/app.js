/**
 * Quantum Random Password Generator - Frontend Application Logic
 * Phase 5 & 6: Deliberate Generation Sequence, Shannon Entropy Density Gauge,
 * Hardware Backend Selection & Queue Simulation, Scientific Explainer.
 */

document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
  const form = document.getElementById("generator-form");
  const backendSelect = document.getElementById("backend-mode-select");
  const backendBeacon = document.getElementById("backend-status-beacon");
  const backendStatusLabel = document.getElementById("backend-status-label");

  const lengthSlider = document.getElementById("length-slider");
  const lengthValue = document.getElementById("length-value");
  const qubitReqBadge = document.getElementById("qubit-req-badge");
  const upperCheckbox = document.getElementById("charset-uppercase");
  const lowerCheckbox = document.getElementById("charset-lowercase");
  const digitsCheckbox = document.getElementById("charset-digits");
  const symbolsCheckbox = document.getElementById("charset-symbols");
  const customCharsetInput = document.getElementById("custom-charset-input");
  const generateBtn = document.getElementById("generate-btn");
  const regenBtn = document.getElementById("regen-btn");
  const errorMessage = document.getElementById("error-message");

  const passwordOutput = document.getElementById("password-output");
  const copyBtn = document.getElementById("copy-btn");
  const copyText = document.getElementById("copy-text");
  const entropyRateBadge = document.getElementById("entropy-rate-badge");
  const entropyGaugeBar = document.getElementById("entropy-gauge-bar");
  const entropyEfficiencyReadout = document.getElementById("entropy-efficiency-readout");

  // Telemetry Elements
  const metricShannonEntropy = document.getElementById("metric-shannon-entropy");
  const metricTheoreticalEntropy = document.getElementById("metric-theoretical-entropy");
  const metricQubits = document.getElementById("metric-qubits");
  const metricShots = document.getElementById("metric-shots");
  const metricRejections = document.getElementById("metric-rejections");
  const metricExecutionTime = document.getElementById("metric-execution-time");

  // Visualization Containers
  const qubitRegisterContainer = document.getElementById("qubit-register-container");
  const samplingChunksContainer = document.getElementById("sampling-chunks-container");
  const circuitDiagramContainer = document.getElementById("circuit-diagram-container");
  const qasmViewContainer = document.getElementById("qasm-view-container");

  // Tab Elements
  const tabButtons = document.querySelectorAll(".tab-btn");
  const tabContents = {
    qubits: document.getElementById("tab-qubits"),
    sampling: document.getElementById("tab-sampling"),
    circuit: document.getElementById("tab-circuit"),
    qasm: document.getElementById("tab-qasm"),
    explainer: document.getElementById("tab-explainer"),
  };

  // Tab Switching
  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetTab = btn.getAttribute("data-tab");
      tabButtons.forEach((b) => {
        b.classList.remove("active");
        b.setAttribute("aria-selected", "false");
      });
      btn.classList.add("active");
      btn.setAttribute("aria-selected", "true");

      Object.keys(tabContents).forEach((tabKey) => {
        if (tabContents[tabKey]) {
          tabContents[tabKey].style.display = tabKey === targetTab ? "block" : "none";
        }
      });
    });
  });

  // Backend Selector Listener
  backendSelect.addEventListener("change", () => {
    const mode = backendSelect.value;
    if (mode === "simulator") {
      backendStatusLabel.textContent = "BACKEND: AER SIMULATOR (IDEAL)";
      backendBeacon.style.backgroundColor = "var(--quantum-state-0)";
      backendBeacon.style.boxShadow = "0 0 8px var(--quantum-state-0)";
    } else if (mode === "noisy_qpu") {
      backendStatusLabel.textContent = "BACKEND: TRANSMON NOISE QPU";
      backendBeacon.style.backgroundColor = "var(--quantum-cyan)";
      backendBeacon.style.boxShadow = "0 0 8px var(--quantum-cyan)";
    } else if (mode === "ibm_quantum") {
      backendStatusLabel.textContent = "BACKEND: IBM QUANTUM CLOUD";
      backendBeacon.style.backgroundColor = "var(--quantum-gold)";
      backendBeacon.style.boxShadow = "0 0 8px var(--quantum-gold)";
    }
  });

  // Calculate required qubits dynamically based on UI parameters
  function updateEstimatedQubits() {
    const len = parseInt(lengthSlider.value, 10);
    let charsetSize = 0;
    if (customCharsetInput.value.trim().length > 0) {
      charsetSize = new Set(customCharsetInput.value.trim()).size;
    } else {
      if (upperCheckbox.checked) charsetSize += 26;
      if (lowerCheckbox.checked) charsetSize += 26;
      if (digitsCheckbox.checked) charsetSize += 10;
      if (symbolsCheckbox.checked) charsetSize += 26;
    }

    if (charsetSize < 2) {
      qubitReqBadge.textContent = "Invalid Charset";
      qubitReqBadge.style.color = "var(--quantum-rejected)";
      return;
    }

    const bitsPerChar = Math.ceil(Math.log2(charsetSize));
    const totalQubits = bitsPerChar * len;
    qubitReqBadge.textContent = `${totalQubits} Qubits (${bitsPerChar}b/char)`;
    qubitReqBadge.style.color = "var(--quantum-gold)";
  }

  // Input listeners
  lengthSlider.addEventListener("input", (e) => {
    lengthValue.textContent = e.target.value;
    updateEstimatedQubits();
  });

  [upperCheckbox, lowerCheckbox, digitsCheckbox, symbolsCheckbox].forEach((cb) => {
    cb.addEventListener("change", updateEstimatedQubits);
  });
  customCharsetInput.addEventListener("input", updateEstimatedQubits);
  updateEstimatedQubits();

  // Enter Superposition Animation on all Qubit chips
  function enterSuperpositionAnimation(numQubits) {
    qubitRegisterContainer.innerHTML = "";
    for (let i = 0; i < numQubits; i++) {
      const chip = document.createElement("div");
      chip.className = "qubit-chip";
      chip.id = `qubit-chip-${i}`;
      chip.innerHTML = `
        <span class="qubit-id">q[${i}]</span>
        <div class="qubit-indicator superposition">|ψ⟩</div>
        <span class="qubit-tag">P(0)=0.5</span>
      `;
      qubitRegisterContainer.appendChild(chip);
    }
  }

  // Typewriter Sequential Character Reveal Effect
  function animatePasswordReveal(fullPassword) {
    passwordOutput.value = "";
    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex < fullPassword.length) {
        passwordOutput.value += fullPassword[currentIndex];
        currentIndex++;
      } else {
        clearInterval(interval);
      }
    }, 28);
  }

  // Staggered Micro-Animation for Qubit Collapse
  function animateQubitCollapse(qubitStates) {
    qubitStates.forEach((q, idx) => {
      setTimeout(() => {
        const chip = document.getElementById(`qubit-chip-${q.qubit_index}`);
        if (!chip) return;
        
        chip.className = `qubit-chip ${q.chunk_accepted ? "accepted-chunk" : "rejected-chunk"}`;
        const indicatorClass = q.collapsed_state === 1 ? "state-1" : "state-0";
        const tagText = q.chunk_accepted 
          ? `<span class="qubit-tag char-badge">‘${q.mapped_character}’ [c${q.chunk_index}]</span>`
          : `<span class="qubit-tag discard-badge">REJECT [c${q.chunk_index}]</span>`;

        chip.innerHTML = `
          <span class="qubit-id">q[${q.qubit_index}]</span>
          <div class="qubit-indicator ${indicatorClass}">|${q.collapsed_state}⟩</div>
          ${tagText}
        `;
      }, Math.min(idx * 8, 400)); // Cap total collapse animation at 400ms
    });
  }

  // Handle Form Submission
  async function triggerGeneration() {
    errorMessage.textContent = "";
    errorMessage.classList.remove("visible");
    generateBtn.disabled = true;
    regenBtn.disabled = true;
    generateBtn.classList.add("running");

    const mode = backendSelect.value;
    if (mode === "ibm_quantum") {
      generateBtn.textContent = "Queuing & Calibrating on Quantum Hardware...";
    } else {
      generateBtn.textContent = "Creating Superposition & Measuring...";
    }

    const len = parseInt(lengthSlider.value, 10);
    const estimatedQubits = parseInt(qubitReqBadge.textContent, 10) || len * 6;

    // Phase 5 Step 1 & 2: Circuit builds & Qubits enter superposition
    enterSuperpositionAnimation(estimatedQubits);

    const payload = {
      length: len,
      include_uppercase: upperCheckbox.checked,
      include_lowercase: lowerCheckbox.checked,
      include_digits: digitsCheckbox.checked,
      include_symbols: symbolsCheckbox.checked,
      custom_charset: customCharsetInput.value.trim() || null,
      backend_mode: mode,
    };

    try {
      const response = await fetch("/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.status === 429) {
        const retryAfter = response.headers.get("Retry-After") || "30";
        throw new Error(`Rate limit reached: Quantum hardware endpoint throttled. Please wait ${retryAfter}s.`);
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: "Network error" }));
        throw new Error(errorData.detail || `Server returned HTTP ${response.status}`);
      }

      const data = await response.json();
      renderGenerationResult(data);
    } catch (err) {
      errorMessage.textContent = `Execution Error: ${err.message}`;
      errorMessage.classList.add("visible");
    } finally {
      generateBtn.disabled = false;
      regenBtn.disabled = false;
      generateBtn.classList.remove("running");
      generateBtn.textContent = "Measure Quantum Register";
    }
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    triggerGeneration();
  });

  regenBtn.addEventListener("click", () => {
    triggerGeneration();
  });

  // Copy to clipboard
  copyBtn.addEventListener("click", async () => {
    if (!passwordOutput.value) return;
    try {
      await navigator.clipboard.writeText(passwordOutput.value);
      copyBtn.classList.add("copied");
      copyText.textContent = "Copied to Clipboard!";
      setTimeout(() => {
        copyBtn.classList.remove("copied");
        copyText.textContent = "Copy Key";
      }, 2000);
    } catch (err) {
      copyText.textContent = "Copy Failed";
    }
  });

  function renderGenerationResult(data) {
    // Phase 5 Step 4: Reveal password character by character
    animatePasswordReveal(data.password);

    // Entropy Density Calculation
    const entropyDensity = (data.shannon_entropy_bits / data.length).toFixed(2);
    const theoreticalDensity = (data.theoretical_entropy_bits / data.length).toFixed(2);
    const efficiency = Math.min(100, Math.round((data.shannon_entropy_bits / data.theoretical_entropy_bits) * 100));

    entropyRateBadge.textContent = `${entropyDensity} b/char (Theoretical: ${theoreticalDensity})`;
    entropyGaugeBar.style.width = `${efficiency}%`;
    entropyEfficiencyReadout.textContent = `${efficiency}% Efficiency (${data.shannon_entropy_bits} bits)`;

    // Telemetry Readouts
    metricShannonEntropy.textContent = `${data.shannon_entropy_bits} bits`;
    metricTheoreticalEntropy.textContent = `${data.theoretical_entropy_bits} bits`;
    metricQubits.textContent = `${data.num_qubits} (${data.bits_per_char}b/char)`;
    metricShots.textContent = `${data.total_shots} shot(s)`;
    metricRejections.textContent = `${data.rejected_count} (${((data.rejected_count / Math.max(1, data.chunks.length)) * 100).toFixed(1)}%)`;
    
    const latencyText = data.queue_time_ms > 0
      ? `${data.execution_time_ms} ms (Queue: ${data.queue_time_ms} ms)`
      : `${data.execution_time_ms} ms`;
    metricExecutionTime.textContent = latencyText;

    // Phase 5 Step 3: Animate Qubit Collapse
    animateQubitCollapse(data.qubit_states);

    // Render Trace Table
    renderSamplingTable(data.chunks);

    // Render Circuit SVG
    renderCircuit(data.circuit);

    // Render OpenQASM 2.0
    qasmViewContainer.textContent = data.circuit.qasm;
  }

  function renderSamplingTable(chunks) {
    samplingChunksContainer.innerHTML = "";
    const table = document.createElement("table");
    table.className = "instrument-table";

    table.innerHTML = `
      <thead>
        <tr>
          <th>Chunk</th>
          <th>Binary Slice</th>
          <th>Integer Value</th>
          <th>Sampling Status</th>
          <th>Mapped Character</th>
        </tr>
      </thead>
      <tbody>
        ${chunks
          .map(
            (c, idx) => `
          <tr class="${c.accepted ? "accepted-row" : "rejected-row"}">
            <td>#${idx + 1}</td>
            <td><code>${c.chunk_bits}</code></td>
            <td>${c.value}</td>
            <td>
              <span class="badge-tag ${c.accepted ? "accept" : "reject"}">
                ${c.accepted ? "ACCEPTED" : "DISCARDED (REJECTION SAMPLING)"}
              </span>
            </td>
            <td><strong>${c.character ? c.character : "—"}</strong></td>
          </tr>
        `
          )
          .join("")}
      </tbody>
    `;
    samplingChunksContainer.appendChild(table);
  }

  function renderCircuit(circuit) {
    circuitDiagramContainer.innerHTML = "";
    if (circuit.svg_diagram) {
      circuitDiagramContainer.innerHTML = circuit.svg_diagram;
    } else {
      const pre = document.createElement("pre");
      pre.textContent = circuit.text_diagram;
      circuitDiagramContainer.appendChild(pre);
    }
  }

  // Trigger initial generation on page load
  triggerGeneration();
});
