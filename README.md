# Quantum Random Password Generator (QRNG)

> **Cryptographic Entropy from Quantum State Superposition & Born Rule Collapse**  
> Built with **Python 3.12**, **FastAPI**, **Qiskit Aer**, and a custom **dark laboratory instrument** frontend.

---

## 1. Scientific & Quantum Foundations

### The Problem with Pseudo-Randomness (PRNGs)
Classical random generators (like Python's `random.random()`, based on the Mersenne Twister MT19937) are **deterministic state machines**. Given an internal 624-word state vector or initial seed, the entire output sequence is completely predictable and mathematically reversible. They do not produce true randomness, only pseudo-random numbers.

### True Quantum Entropy via the Born Rule
In quantum mechanics, measurement outcomes are fundamentally non-deterministic. For each password generation:
1. An $N$-qubit register is prepared in the ground state $|0\rangle^{\otimes N}$.
2. A **Hadamard gate ($H$)** is applied to every qubit:
   $$H |0\rangle = \frac{1}{\sqrt{2}}(|0\rangle + |1\rangle)$$
   This transforms the system into a maximal, equal superposition of all $2^N$ computational basis states:
   $$|\psi\rangle = \frac{1}{\sqrt{2^N}} \sum_{x \in \{0,1\}^N} |x\rangle$$
3. Each qubit is measured in the computational $Z$-basis. According to the **Born Rule**, the probability of measuring any specific bitstring $x$ is:
   $$P(x) = |\langle x | \psi \rangle|^2 = \left|\frac{1}{\sqrt{2^N}}\right|^2 = \frac{1}{2^N}$$
   This produces genuine, physical entropy derived directly from quantum state collapse.

### Zero Modulo Bias via Rejection Sampling
When mapping a random integer $v \in [0, 2^b - 1]$ to an alphabet of size $K$ (where $b = \lceil \log_2 K \rceil$), naive systems compute $v \pmod K$.  
Because $2^b$ is rarely an exact multiple of $K$, indices from $0$ to $(2^b \pmod K) - 1$ have higher probability than higher indices—this is **modulo bias**.

**Our Solution — Rejection Sampling:**
- If $v < K$: The character at index $v$ is **accepted**.
- If $v \ge K$: The chunk is **rejected and discarded**. Additional quantum bits are measured.
- **Mathematical Uniformity Proof:**
  $$P(v = i \mid v < K) = \frac{P(v = i)}{P(v < K)} = \frac{1/2^b}{K / 2^b} = \frac{1}{K} \quad \forall i \in \{0, \dots, K-1\}$$
  Every character in the alphabet has the exact same probability $1/K$. Modulo bias is completely eliminated ($0.00\%$ bias).

### Theoretical vs. Empirical Shannon Entropy
For an alphabet of size $K$ and password length $L$:
- **Maximum Theoretical Entropy:**
  $$H_{\text{max}} = L \times \log_2(K) \quad \text{bits}$$
- **Empirical Shannon Entropy:**
  $$H_{\text{empirical}} = - L \sum_{c \in \text{chars}} p(c) \log_2 p(c) \quad \text{bits}$$
  Our system computes both in real-time, verifying near-100% entropy density.

### Hardware Noise & Decoherence (Physical vs Ideal)
In real superconducting transmon processors (such as IBM Quantum Eagle/Heron chips):
- Qubits undergo thermal relaxation ($T_1$) and dephasing ($T_2$).
- Readout measurement has physical fidelity limits ($\approx 1.5\%$ readout error).
- Our backend provides a **Transmon Noise Model** simulating realistic single-qubit depolarizing noise ($0.1\%$) and asymmetric readout errors alongside the ideal stabilizer simulator.

---

## 2. Architecture

```
qqc/
├── backend/
│   ├── api/
│   │   └── routes.py         # POST /generate with rate limiting & hygiene
│   ├── core/
│   │   ├── charsets.py       # Alphabet validation & bit calculation
│   │   ├── circuit.py        # Qiskit circuit builder, noise models & exports
│   │   ├── entropy.py        # Rejection sampling & Shannon calculations
│   │   ├── generator.py      # Orchestrator combining circuit + entropy
│   │   └── rate_limiter.py   # Sliding-window rate limiter
│   ├── schemas/
│   │   └── generator.py      # Pydantic request/response schemas
│   └── main.py               # FastAPI entrypoint + static files mount
├── frontend/
│   ├── index.html            # Semantic HTML instrument chassis
│   ├── style.css             # Custom cryogenic laboratory design system
│   └── app.js                # Superposition collapse animation & telemetry
├── tests/
│   ├── test_api.py           # Endpoint integration & rate limit tests
│   ├── test_circuit.py       # Quantum circuit structure & Born rule tests
│   ├── test_entropy.py       # Rejection sampling & Shannon entropy tests
│   └── test_uniformity.py    # Pearson Chi-squared Goodness-of-Fit tests
├── Dockerfile                # Multi-stage production container
├── docker-compose.yml        # One-command orchestration
├── render.yaml               # PaaS deployment spec
└── requirements.txt          # Frozen dependencies
```

---

## 3. Cryptographic & Security Hygiene

1. **Zero Server-Side Logging of Secrets:**
   The server logger records only sanitized metadata (`length`, `qubits`, `shots`, `rejections`, `latency`). Passwords, raw measurement bitstrings, and secret keys are **never** logged to stdout, stderr, or persistent storage.
2. **Rate Limiting:**
   Built-in sliding-window rate limiter (30 requests/minute per IP) prevents denial-of-service and protects quantum simulation resources.
3. **OpenQASM 2.0 Export:**
   Every generated key can be inspected as canonical OpenQASM assembly, allowing scientific verification on external quantum hardware.

---

## 4. Quickstart & Local Execution

### Prerequisites
- Python 3.12+
- `pip`

### Installation & Run
```bash
# 1. Clone repository & enter workspace
git clone <repo-url> qqc
cd qqc

# 2. Create virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Start the server
uvicorn backend.main:app --port 8000 --host 127.0.0.1
```

Open your browser to: **`http://127.0.0.1:8000`**

---

## 5. Running the Automated Test Suite

Run all 21 unit, integration, and statistical uniformity tests:
```bash
pytest -v
```

### Statistical Uniformity Testing (`test_uniformity.py`)
Applies **Pearson's Chi-squared Goodness-of-Fit Test** ($\alpha = 0.01$) over thousands of generated characters to mathematically prove zero modulo bias.

---

## 6. Docker Deployment

```bash
# Build and run containerized service
docker-compose up --build -d
```
Service runs on port `8000` with automated health checks enabled.

---

## 7. API Reference

### `POST /generate`

**Request Body:**
```json
{
  "length": 16,
  "include_uppercase": true,
  "include_lowercase": true,
  "include_digits": true,
  "include_symbols": true,
  "custom_charset": null,
  "backend_mode": "simulator"
}
```
*`backend_mode` options:* `"simulator"` (ideal), `"noisy_qpu"` (transmon noise), `"ibm_quantum"` (hardware queue).

**Response (Sample):**
```json
{
  "password": "r#4W!9bK8m$L2p*Q",
  "length": 16,
  "charset_size": 88,
  "bits_per_char": 7,
  "num_qubits": 112,
  "backend_mode": "simulator",
  "backend_name": "AerSimulator (Ideal Superposition)",
  "queue_time_ms": 0.0,
  "primary_bitstring": "0100110...",
  "raw_bitstrings": ["0100110..."],
  "total_shots": 1,
  "accepted_count": 16,
  "rejected_count": 2,
  "theoretical_entropy_bits": 103.35,
  "shannon_entropy_bits": 64.0,
  "execution_time_ms": 12.8,
  "circuit": {
    "num_qubits": 112,
    "depth": 2,
    "qasm": "OPENQASM 2.0;\n...",
    "svg_diagram": "<svg>...</svg>"
  },
  "qubit_states": [ ... ],
  "probability_distribution": {
    "theoretical_p0": 0.5,
    "theoretical_p1": 0.5,
    "empirical_p0": 0.5089,
    "empirical_p1": 0.4911
  }
}
```

---

## 8. License & Attribution
MIT License • Engineered for cryptographic transparency and quantum education.
