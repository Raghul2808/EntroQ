"""
Entropy processing, bit manipulation, and rejection sampling.
Guarantees zero modulo bias by discarding bitstrings that exceed charset length.
"""
from dataclasses import dataclass
import math
from collections import Counter


@dataclass
class SamplingChunk:
    chunk_bits: str
    value: int
    accepted: bool
    character: str | None = None


@dataclass
class MappingResult:
    password: str
    chunks: list[SamplingChunk]
    accepted_count: int
    rejected_count: int
    theoretical_entropy_bits: float
    shannon_entropy_bits: float
    bits_consumed: int


def calculate_shannon_entropy(text: str) -> float:
    """
    Computes empirical Shannon entropy of a string:
        H = - sum_{c} p(c) * log2(p(c))
    Returns entropy in bits per character * length (total bits).
    """
    if not text:
        return 0.0
    length = len(text)
    counts = Counter(text)
    entropy_per_char = -sum((count / length) * math.log2(count / length) for count in counts.values())
    return round(entropy_per_char * length, 3)


def map_bitstring_to_characters(
    bitstring: str,
    charset: str,
    target_length: int,
    bits_per_char: int,
) -> tuple[list[SamplingChunk], str, int]:
    """
    Processes a contiguous stream of measured bits into characters using rejection sampling.

    For each b-bit slice:
      1. Parse binary integer v in [0, 2^b - 1]
      2. If v < len(charset): ACCEPT character charset[v]
      3. If v >= len(charset): REJECT to prevent modulo bias

    Returns:
      (chunks_processed, password_so_far, bits_consumed)
    """
    charset_size = len(charset)
    if bits_per_char < 1 or (1 << bits_per_char) < charset_size:
        raise ValueError(f"Invalid bits_per_char={bits_per_char} for charset size {charset_size}")

    chunks: list[SamplingChunk] = []
    generated_chars: list[str] = []
    offset = 0
    total_bits = len(bitstring)

    while offset + bits_per_char <= total_bits and len(generated_chars) < target_length:
        chunk = bitstring[offset : offset + bits_per_char]
        offset += bits_per_char
        val = int(chunk, 2)

        if val < charset_size:
            char = charset[val]
            generated_chars.append(char)
            chunks.append(
                SamplingChunk(
                    chunk_bits=chunk,
                    value=val,
                    accepted=True,
                    character=char,
                )
            )
        else:
            # Rejection sampling avoids modulo bias
            chunks.append(
                SamplingChunk(
                    chunk_bits=chunk,
                    value=val,
                    accepted=False,
                    character=None,
                )
            )

    password = "".join(generated_chars)
    return chunks, password, offset
