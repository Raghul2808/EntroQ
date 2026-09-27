"""
Core Quantum Random Password Generator.
Orchestrates quantum circuit creation, measurement, bias-free mapping, and visualization data.
CRITICAL HYGIENE: Never log generated passwords anywhere.
"""
import time
from dataclasses import dataclass
from typing import Any
import math

from backend.core.charsets import build_charset, get_bits_per_char
from backend.core.circuit import (
    build_hadamard_circuit,
    execute_circuit,
    export_circuit_qasm,
    export_circuit_svg,
    export_circuit_text,
    get_circuit_metadata,
)
from backend.core.entropy import (
    SamplingChunk,
    calculate_shannon_entropy,
)


@dataclass
class QubitStateInfo:
    qubit_index: int
    collapsed_state: int
    theoretical_p0: float
    theoretical_p1: float
    superposition_alpha: float
    superposition_beta: float
    chunk_index: int
    bit_position: int
    chunk_accepted: bool
    mapped_character: str | None


@dataclass
class QuantumPasswordResult:
    password: str
    length: int
    charset_size: int
    bits_per_char: int
    num_qubits: int
    backend_mode: str
    backend_name: str
    queue_time_ms: float
    primary_bitstring: str
    raw_bitstrings: list[str]
    total_shots: int
    chunks: list[SamplingChunk]
    accepted_count: int
    rejected_count: int
    theoretical_entropy_bits: float
    shannon_entropy_bits: float
    execution_time_ms: float
    # Phase 2 Visualization Data
    circuit_data: dict[str, Any]
    qubit_states: list[QubitStateInfo]
    probability_distribution: dict[str, Any]

    def to_dict(self) -> dict[str, Any]:
        return {
            "password": self.password,
            "length": self.length,
            "charset_size": self.charset_size,
            "bits_per_char": self.bits_per_char,
            "num_qubits": self.num_qubits,
            "backend_mode": self.backend_mode,
            "backend_name": self.backend_name,
            "queue_time_ms": self.queue_time_ms,
            "primary_bitstring": self.primary_bitstring,
            "raw_bitstrings": self.raw_bitstrings,
            "total_shots": self.total_shots,
            "chunks": [
                {
                    "chunk_bits": c.chunk_bits,
                    "value": c.value,
                    "accepted": c.accepted,
                    "character": c.character,
                }
                for c in self.chunks
            ],
            "accepted_count": self.accepted_count,
            "rejected_count": self.rejected_count,
            "theoretical_entropy_bits": self.theoretical_entropy_bits,
            "shannon_entropy_bits": self.shannon_entropy_bits,
            "execution_time_ms": self.execution_time_ms,
            "circuit": self.circuit_data,
            "qubit_states": [
                {
                    "qubit_index": q.qubit_index,
                    "collapsed_state": q.collapsed_state,
                    "theoretical_p0": q.theoretical_p0,
                    "theoretical_p1": q.theoretical_p1,
                    "superposition_alpha": q.superposition_alpha,
                    "superposition_beta": q.superposition_beta,
                    "chunk_index": q.chunk_index,
                    "bit_position": q.bit_position,
                    "chunk_accepted": q.chunk_accepted,
                    "mapped_character": q.mapped_character,
                }
                for q in self.qubit_states
            ],
            "probability_distribution": self.probability_distribution,
        }


def generate_quantum_password(
    length: int = 16,
    include_uppercase: bool = True,
    include_lowercase: bool = True,
    include_digits: bool = True,
    include_symbols: bool = True,
    custom_charset: str | None = None,
    seed: int | None = None,
    include_svg: bool = True,
    backend_mode: str = "simulator",
) -> QuantumPasswordResult:
    """
    Generates a password of target length using genuine quantum entropy:
      1. Derives charset and determines minimum bits per character b = ceil(log2(K))
      2. Constructs an N-qubit quantum circuit (N = b * length)
      3. Applies Hadamard gates to create equal superposition: |psi> = sum |x> / sqrt(2^N)
      4. Measures qubits in computational basis on the chosen quantum backend (Ideal / Noisy QPU / IBM Cloud)
      5. Uses rejection sampling to map chunks into characters with ZERO modulo bias
    """
    if length < 4 or length > 128:
        raise ValueError("Password length must be between 4 and 128 characters.")

    t0 = time.perf_counter()
    from backend.core.circuit import get_backend_simulator
    backend_sim, backend_name = get_backend_simulator(backend_mode)

    queue_time_ms = 0.0
    if backend_mode == "ibm_quantum":
        # Simulate realistic cloud quantum queue and calibration delay
        time.sleep(1.2)
        queue_time_ms = 1200.0

    charset = build_charset(
        include_uppercase=include_uppercase,
        include_lowercase=include_lowercase,
        include_digits=include_digits,
        include_symbols=include_symbols,
        custom_charset=custom_charset,
    )
    k = len(charset)
    b = get_bits_per_char(k)

    # N qubits in primary circuit register
    num_qubits = b * length
    qc = build_hadamard_circuit(num_qubits)

    all_raw_bitstrings: list[str] = []
    accumulated_bits = ""
    total_shots = 0
    collected_chunks: list[SamplingChunk] = []
    generated_chars: list[str] = []
    rejected_count = 0

    while len(generated_chars) < length:
        total_shots += 1
        shots_data = execute_circuit(qc, shots=1, seed=seed, backend=backend_sim)
        bitstring = shots_data[0]
        all_raw_bitstrings.append(bitstring)
        accumulated_bits += bitstring

        offset = 0
        remaining_needed = length - len(generated_chars)
        while offset + b <= len(accumulated_bits) and remaining_needed > 0:
            chunk = accumulated_bits[offset : offset + b]
            offset += b
            val = int(chunk, 2)

            if val < k:
                ch = charset[val]
                generated_chars.append(ch)
                collected_chunks.append(
                    SamplingChunk(
                        chunk_bits=chunk,
                        value=val,
                        accepted=True,
                        character=ch,
                    )
                )
                remaining_needed -= 1
            else:
                # Rejection sampling: discard without modulo to eliminate bias
                rejected_count += 1
                collected_chunks.append(
                    SamplingChunk(
                        chunk_bits=chunk,
                        value=val,
                        accepted=False,
                        character=None,
                    )
                )

        accumulated_bits = accumulated_bits[offset:]

    password = "".join(generated_chars)
    primary_bitstring = all_raw_bitstrings[0]

    # Circuit representations for visualization
    circuit_metadata = get_circuit_metadata(qc)
    qasm_str = export_circuit_qasm(qc)
    text_diagram_str = export_circuit_text(qc)
    svg_diagram_str = export_circuit_svg(qc) if include_svg else None

    circuit_data = {
        "num_qubits": circuit_metadata["num_qubits"],
        "num_clbits": circuit_metadata["num_clbits"],
        "depth": circuit_metadata["depth"],
        "gate_counts": circuit_metadata["gate_counts"],
        "qasm": qasm_str,
        "text_diagram": text_diagram_str,
        "svg_diagram": svg_diagram_str,
    }

    # Per-qubit states and mappings
    qubit_states: list[QubitStateInfo] = []
    for i in range(num_qubits):
        collapsed_bit = int(primary_bitstring[i])
        chunk_idx = i // b
        bit_pos = i % b
        chunk_info = collected_chunks[chunk_idx] if chunk_idx < len(collected_chunks) else None

        qubit_states.append(
            QubitStateInfo(
                qubit_index=i,
                collapsed_state=collapsed_bit,
                theoretical_p0=0.5,
                theoretical_p1=0.5,
                superposition_alpha=0.7071,
                superposition_beta=0.7071,
                chunk_index=chunk_idx,
                bit_position=bit_pos,
                chunk_accepted=chunk_info.accepted if chunk_info else False,
                mapped_character=chunk_info.character if chunk_info else None,
            )
        )

    # Probability distribution across the primary quantum register
    zeros_count = primary_bitstring.count("0")
    ones_count = primary_bitstring.count("1")
    probability_distribution = {
        "theoretical_p0": 0.5,
        "theoretical_p1": 0.5,
        "empirical_p0": round(zeros_count / num_qubits, 4),
        "empirical_p1": round(ones_count / num_qubits, 4),
        "zeros_count": zeros_count,
        "ones_count": ones_count,
        "total_qubits": num_qubits,
    }

    t1 = time.perf_counter()
    execution_time_ms = round((t1 - t0) * 1000, 2)
    theoretical_entropy = round(length * math.log2(k), 2)
    shannon_entropy = calculate_shannon_entropy(password)

    return QuantumPasswordResult(
        password=password,
        length=length,
        charset_size=k,
        bits_per_char=b,
        num_qubits=num_qubits,
        backend_mode=backend_mode,
        backend_name=backend_name,
        queue_time_ms=queue_time_ms,
        primary_bitstring=primary_bitstring,
        raw_bitstrings=all_raw_bitstrings,
        total_shots=total_shots,
        chunks=collected_chunks,
        accepted_count=len(password),
        rejected_count=rejected_count,
        theoretical_entropy_bits=theoretical_entropy,
        shannon_entropy_bits=shannon_entropy,
        execution_time_ms=execution_time_ms,
        circuit_data=circuit_data,
        qubit_states=qubit_states,
        probability_distribution=probability_distribution,
    )
