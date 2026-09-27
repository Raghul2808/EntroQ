"""
Pydantic schemas for the password generator and quantum circuit visualization endpoint.
"""
from pydantic import BaseModel, Field


class ChunkDetail(BaseModel):
    chunk_bits: str = Field(..., description="Binary slice measured from quantum circuit")
    value: int = Field(..., description="Integer representation of chunk bits")
    accepted: bool = Field(..., description="True if within charset range, False if rejected")
    character: str | None = Field(None, description="Mapped character if accepted")


class QubitStateDetail(BaseModel):
    qubit_index: int = Field(..., description="Index of the qubit (0 to N-1)")
    collapsed_state: int = Field(..., description="Final measured collapsed bit (0 or 1)")
    theoretical_p0: float = Field(0.5, description="Theoretical Born probability of measuring |0>")
    theoretical_p1: float = Field(0.5, description="Theoretical Born probability of measuring |1>")
    superposition_alpha: float = Field(0.7071, description="Pre-measurement amplitude alpha (|0> coefficient)")
    superposition_beta: float = Field(0.7071, description="Pre-measurement amplitude beta (|1> coefficient)")
    chunk_index: int = Field(..., description="Index of character chunk this qubit contributes to")
    bit_position: int = Field(..., description="Position of this bit within the character chunk")
    chunk_accepted: bool = Field(..., description="Whether this qubit's chunk was accepted into password")
    mapped_character: str | None = Field(None, description="Character output if chunk was accepted")


class PerQubitProbability(BaseModel):
    theoretical_p0: float = Field(0.5, description="Theoretical Born probability P(|0>)")
    theoretical_p1: float = Field(0.5, description="Theoretical Born probability P(|1>)")
    empirical_p0: float = Field(..., description="Observed frequency of |0> in primary measurement register")
    empirical_p1: float = Field(..., description="Observed frequency of |1> in primary measurement register")
    zeros_count: int = Field(..., description="Total 0s measured across primary register")
    ones_count: int = Field(..., description="Total 1s measured across primary register")
    total_qubits: int = Field(..., description="Total qubits in register")


class CircuitVisualizationData(BaseModel):
    num_qubits: int = Field(..., description="Number of qubits in quantum circuit")
    num_clbits: int = Field(..., description="Number of classical measurement bits")
    depth: int = Field(..., description="Quantum circuit gate depth")
    gate_counts: dict[str, int] = Field(..., description="Dictionary of quantum gates applied (h, measure)")
    qasm: str = Field(..., description="Complete circuit represented in OpenQASM 2.0")
    text_diagram: str = Field(..., description="Full ASCII/Unicode circuit wire diagram")
    svg_diagram: str | None = Field(None, description="Vector SVG rendering of circuit diagram")


class GeneratePasswordRequest(BaseModel):
    length: int = Field(16, ge=4, le=128, description="Desired password length (4-128)")
    include_uppercase: bool = Field(True, description="Include uppercase letters (A-Z)")
    include_lowercase: bool = Field(True, description="Include lowercase letters (a-z)")
    include_digits: bool = Field(True, description="Include digits (0-9)")
    include_symbols: bool = Field(True, description="Include symbols (!@#$%...)")
    custom_charset: str | None = Field(None, description="Custom character set string (optional)")
    backend_mode: str = Field(
        "simulator",
        description="Execution mode: 'simulator' (ideal), 'noisy_qpu' (transmon noise), or 'ibm_quantum' (hardware queue)",
    )


class GeneratePasswordResponse(BaseModel):
    password: str = Field(..., description="Generated quantum password")
    length: int = Field(..., description="Actual length of generated password")
    charset_size: int = Field(..., description="Total characters in active alphabet")
    bits_per_char: int = Field(..., description="Bits required per character ceil(log2(K))")
    num_qubits: int = Field(..., description="Number of qubits in quantum circuit register")
    backend_mode: str = Field(..., description="Backend mode used for generation")
    backend_name: str = Field(..., description="Human-readable quantum backend description")
    queue_time_ms: float = Field(0.0, description="Simulated or actual quantum hardware queue wait time in ms")
    primary_bitstring: str = Field(..., description="Primary shot measured bitstring across all qubits")
    raw_bitstrings: list[str] = Field(..., description="All measured bitstrings across executed shots")
    total_shots: int = Field(..., description="Number of quantum circuit measurement shots executed")
    accepted_count: int = Field(..., description="Number of accepted chunks")
    rejected_count: int = Field(..., description="Number of rejected chunks due to rejection sampling")
    theoretical_entropy_bits: float = Field(..., description="Theoretical Shannon entropy in bits (L * log2(K))")
    shannon_entropy_bits: float = Field(..., description="Empirical Shannon entropy of generated password in bits")
    execution_time_ms: float = Field(..., description="Backend execution time in milliseconds")
    chunks: list[ChunkDetail] = Field(..., description="Ordered list of sampling chunks showing rejection mechanics")
    circuit: CircuitVisualizationData = Field(..., description="Circuit representations (QASM, text, SVG, depth)")
    qubit_states: list[QubitStateDetail] = Field(..., description="Per-qubit state details before and after measurement")
    probability_distribution: PerQubitProbability = Field(..., description="Born probability vs observed frequency distribution")
