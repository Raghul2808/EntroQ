"""
Schemas for Quantum Diceware Passphrase and Batch Generation endpoints.
"""
from pydantic import BaseModel, Field
from backend.schemas.generator import CircuitVisualizationData, GeneratePasswordRequest


class WordDetailSchema(BaseModel):
    word: str = Field(..., description="Selected word from 1024-word cryptographic dictionary")
    word_index: int = Field(..., description="Integer index in dictionary [0, 1023]")
    bitstring: str = Field(..., description="10-bit binary measurement from quantum circuit")
    qubits_used: int = Field(10, description="Number of qubits measured for this word")


class GeneratePassphraseRequest(BaseModel):
    num_words: int = Field(5, ge=3, le=12, description="Number of words in passphrase (3-12)")
    separator: str = Field("-", description="Separator between words (e.g. '-', '.', '_', ' ')")
    capitalize: bool = Field(False, description="Whether to capitalize each word")
    include_number: bool = Field(False, description="Whether to append a quantum random number")
    backend_mode: str = Field(
        "simulator",
        description="Execution mode: 'simulator', 'noisy_qpu', or 'ibm_quantum'",
    )


class GeneratePassphraseResponse(BaseModel):
    passphrase: str = Field(..., description="Final generated quantum Diceware passphrase")
    words: list[str] = Field(..., description="List of chosen words")
    num_words: int = Field(..., description="Number of words generated")
    wordlist_size: int = Field(..., description="Wordlist size (1024)")
    bits_per_word: float = Field(..., description="Entropy bits per word (10.0)")
    total_entropy_bits: float = Field(..., description="Total Shannon entropy in bits")
    num_qubits: int = Field(..., description="Qubits in quantum circuit")
    backend_mode: str = Field(..., description="Quantum execution engine")
    backend_name: str = Field(..., description="Human-readable backend label")
    execution_time_ms: float = Field(..., description="Execution latency in ms")
    word_details: list[WordDetailSchema] = Field(..., description="Per-word quantum measurement trace")
    circuit: CircuitVisualizationData = Field(..., description="Circuit visualization diagrams")


class GenerateBatchRequest(GeneratePasswordRequest):
    count: int = Field(5, ge=2, le=20, description="Number of passwords to generate in batch (2-20)")


class BatchItem(BaseModel):
    index: int = Field(..., description="1-based index in batch")
    password: str = Field(..., description="Generated quantum password")
    entropy_bits: float = Field(..., description="Theoretical entropy in bits")
    length: int = Field(..., description="Password length")


class GenerateBatchResponse(BaseModel):
    passwords: list[BatchItem] = Field(..., description="Generated batch list")
    total_count: int = Field(..., description="Total keys generated")
    backend_mode: str = Field(..., description="Backend engine used")
    execution_time_ms: float = Field(..., description="Total batch execution time in ms")
