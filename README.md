# EntroQ — Quantum Cryptographic Password & Passphrase Generator

[![Python](https://img.shields.io/badge/Python-3.12+-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Qiskit](https://img.shields.io/badge/Qiskit-1.3+-6929C4?logo=qiskit&logoColor=white)](https://qiskit.org/)
[![Tests](https://img.shields.io/badge/Tests-26%20Passed-10b981)](https://github.com/Raghul2808/EntroQ)
[![License: MIT](https://img.shields.io/badge/License-MIT-f59e0b.svg)](LICENSE)

> **True physical entropy derived from quantum state superposition, Born rule wavefunction collapse, and mathematically verified zero-bias rejection sampling.**

---

## ⚡ Overview

Most classical password generators rely on deterministic Pseudo-Random Number Generators (PRNGs) like Python's `random` (Mersenne Twister MT19937) or standard OS entropy pools. While adequate for non-critical use, PRNGs operate on internal deterministic state machines and often suffer from subtle **modulo bias** when mapping raw bits into custom character sets.

**EntroQ** is a full-stack quantum cryptographic tool built with **Qiskit** and **FastAPI**. It simulates genuine quantum circuits on superconducting transmon architecture, executing Hadamard transformations to achieve maximal superposition and measuring non-deterministic bitstrings governed strictly by the Born Rule.

---

## 🔬 Core Quantum & Cryptographic Principles

### 1. Hadamard Superposition & Born Rule Collapse
For an $N$-qubit quantum register initialized in ground state $|0\rangle^{\otimes N}$, an individual Hadamard gate ($H$) is applied to every qubit:

$$H |0\rangle = \frac{1}{\sqrt{2}} (|0\rangle + |1\rangle)$$

The composite system enters an equal superposition across all $2^N$ basis states:

$$|\psi\rangle = \frac{1}{\sqrt{2^N}} \sum_{x \in \{0, 1\}^N} |x\rangle$$

Upon projective measurement in the computational $Z$-basis, the wavefunction collapses non-deterministically according to the **Born Rule**:

$$P(x) = |\langle x | \psi \rangle|^2 = \frac{1}{2^N}$$

### 2. Elimination of Modulo Bias via Rejection Sampling
When mapping a measured integer $v \in [0, 2^b - 1]$ to an alphabet of size $K$ (where $b = \lceil \log_2 K \rceil$), naive systems compute $v \pmod K$. Because $2^b$ is rarely an exact multiple of $K$, lower indices receive disproportionately higher probability.

**EntroQ enforces strict Rejection Sampling:**
* Any chunk measurement where $v \ge K$ is discarded.
* New quantum shots are collected until a valid integer $0 \le v < K$ is obtained.
* **Uniformity Guarantee:**
  $$P(v = i \mid v < K) = \frac{P(v = i)}{P(v < K)} = \frac{1 / 2^b}{K / 2^b} = \frac{1}{K} \quad \forall i \in \{0, \dots, K-1\}$$
  Every character is guaranteed exact uniform probability ($0.00\%$ modulo bias).

---

## ✨ Features

- **Dual Entropy Modes**:
  - **Quantum Character Keys**: High-entropy passwords with custom alphabet toggles (uppercase, lowercase, digits, symbols) or user-defined character sets.
  - **Quantum Diceware Passphrases**: Memorable multi-word passphrases using 10-qubit measurement vectors ($2^{10} = 1024$ words per block).
- **Physical Transmon Qubit Register**:
  - **Chunk Bays View**: Visualizes grouped qubits per character chunk with silicon carrier bays, raw integers, and acceptance/rejection tags.
  - **Die Matrix View**: High-density silicon transmon cell layout.
  - **Interactive 3D Bloch Sphere**: Click any qubit in the register to inspect its exact coordinates, polar angle ($\theta$), and azimuthal angle ($\phi$).
- **Realistic Transmon Noise Simulation**:
  - Run with ideal statevector simulation (`AerSimulator`) or realistic noisy quantum hardware modeling thermal depolarization ($T_1/T_2$) and readout errors.
- **Circuit Telemetry & OpenQASM 2.0 Export**:
  - Inspect circuit depth, gate counts, SVG diagrams, and export canonical OpenQASM assembly for verification on real quantum computers.
- **Empirical Shannon Entropy Analytics**:
  - Real-time calculation of theoretical maximum vs. empirical Shannon entropy bits.
- **Interactive Educational Suites**:
  - **Live Benchmark**: Head-to-head comparison between Quantum RNG and Classical PRNG across execution speed, bit balance, and Shannon entropy.
  - **Modulo Bias Sandbox**: Live Monte Carlo distribution simulation demonstrating why naive modulo arithmetic fails vs. rejection sampling.
- **Cryptographic Hygiene**:
  - Zero server-side logging of generated secrets.
  - Sliding-window IP rate limiting (30 requests/min).
  - One-click zero-clipboard copy and encrypted-ready QR code generation.

---

## 📁 Repository Structure

```
EntroQ/
├── backend/
│   ├── api/
│   │   └── routes.py             # REST endpoints (generate, diceware, benchmarks, circuit)
│   ├── core/
│   │   ├── charsets.py           # Alphabet definitions & bit-depth validation
│   │   ├── circuit.py            # Qiskit circuit builder, noise models & QASM export
│   │   ├── diceware.py           # 1024-word Diceware passphrase generator
│   │   ├── entropy.py            # Rejection sampling & Shannon calculations
│   │   ├── generator.py          # Quantum generation pipeline orchestrator
│   │   └── rate_limiter.py       # Sliding-window IP rate limiter
│   ├── schemas/
│   │   └── generator.py          # Pydantic validation schemas
│   └── main.py                   # FastAPI application & static file router
├── frontend/
│   ├── index.html                # Laboratory chassis interface
│   ├── style.css                 # Cryogenic hardware design system
│   └── app.js                    # Superposition collapse animation & 3D Bloch sphere
├── tests/
│   ├── test_api.py               # Endpoint validation & rate limit tests
│   ├── test_circuit.py           # Quantum circuit structure & superposition tests
│   ├── test_diceware.py          # Diceware wordlist & passphrase tests
│   ├── test_entropy.py           # Rejection sampling & entropy math tests
│   └── test_uniformity.py        # Pearson Chi-squared Goodness-of-Fit tests
├── Dockerfile                    # Production multi-stage container
├── docker-compose.yml            # Docker orchestration
├── render.yaml                   # Render deployment specification
├── railway.toml                  # Railway deployment configuration
├── requirements.txt              # Production Python dependencies
└── README.md
```

---

## 🚀 Quickstart & Local Setup

### Prerequisites
* **Python 3.12+**
* `pip` and `git`

### 1. Clone the Repository
```bash
git clone https://github.com/Raghul2808/EntroQ.git
cd EntroQ
```

### 2. Create and Activate Virtual Environment
```bash
# macOS / Linux:
python3 -m venv .venv
source .venv/bin/activate

# Windows:
python -m venv .venv
.venv\Scripts\activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Launch the Server
```bash
uvicorn backend.main:app --port 8000 --host 127.0.0.1 --reload
```

Open your browser at: **`http://127.0.0.1:8000`**

---

## 🧪 Testing & Verification

Run the full automated test suite (26 unit, integration, and statistical uniformity tests):

```bash
pytest -v
```

### Statistical Uniformity Testing (`tests/test_uniformity.py`)
Applies **Pearson's Chi-squared Goodness-of-Fit Test** ($\alpha = 0.01$) over sampled distributions to verify mathematically that character occurrences match a uniform distribution with zero modulo bias.

---


## 📡 API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/health` | API health check and simulator status |
| `POST` | `/generate` | Generate quantum password with rejection sampling |
| `POST` | `/diceware` | Generate quantum Diceware passphrase |
| `POST` | `/batch` | Generate up to 10 keys simultaneously |
| `GET` | `/circuit/inspect` | Returns QASM 2.0 and SVG representation of an $N$-qubit circuit |
| `GET` | `/benchmark/compare` | Head-to-head comparison: Quantum RNG vs. Python PRNG |
| `GET` | `/benchmark/modulo-simulation` | Monte Carlo rejection sampling vs. modulo simulation data |

### Example `POST /generate`
```bash
curl -X POST "http://127.0.0.1:8000/generate" \
     -H "Content-Type: application/json" \
     -d '{
       "length": 16,
       "include_uppercase": true,
       "include_lowercase": true,
       "include_digits": true,
       "include_symbols": true,
       "backend_mode": "simulator"
     }'
```

---

## 📄 License
This project is licensed under the [MIT License](LICENSE). Built for quantum education, cryptographic transparency, and high-entropy security.
