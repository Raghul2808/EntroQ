"""
Von Neumann Quantum Bit Debiasing Extractor.
Eliminates asymmetric readout skew and T1 relaxation bias from noisy transmon measurements.
"""


def von_neumann_extract(bitstring: str) -> tuple[str, int]:
    """
    Processes a raw quantum bitstring in non-overlapping pairs:
      '01' -> '0'
      '10' -> '1'
      '00', '11' -> discarded
    Returns (debiased_bitstring, discarded_pairs_count).
    """
    clean_bits: list[str] = []
    discarded_pairs = 0
    num_pairs = len(bitstring) // 2

    for i in range(0, num_pairs * 2, 2):
        pair = bitstring[i : i + 2]
        if pair == "01":
            clean_bits.append("0")
        elif pair == "10":
            clean_bits.append("1")
        else:
            discarded_pairs += 1

    return "".join(clean_bits), discarded_pairs