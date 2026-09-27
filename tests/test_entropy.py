"""
Tests for character set validation, bit manipulation, and rejection sampling.
"""
import pytest
from backend.core.charsets import build_charset, get_bits_per_char
from backend.core.entropy import (
    calculate_shannon_entropy,
    map_bitstring_to_characters,
)


def test_build_charset_defaults():
    charset = build_charset()
    # 26 uppercase + 26 lowercase + 10 digits + 26 symbols = 88
    assert len(charset) == 88
    assert len(set(charset)) == len(charset)


def test_build_charset_custom():
    custom = "abc123!?"
    res = build_charset(custom_charset=custom)
    assert res == "abc123!?"


def test_build_charset_empty_error():
    with pytest.raises(ValueError):
        build_charset(
            include_uppercase=False,
            include_lowercase=False,
            include_digits=False,
            include_symbols=False,
        )


def test_get_bits_per_char():
    assert get_bits_per_char(2) == 1
    assert get_bits_per_char(3) == 2
    assert get_bits_per_char(4) == 2
    assert get_bits_per_char(10) == 4
    assert get_bits_per_char(62) == 6
    assert get_bits_per_char(94) == 7


def test_rejection_sampling_synthetic():
    """
    Charset has 3 characters ('A', 'B', 'C').
    Bits per char = 2 (values 0, 1, 2, 3).
    Value 3 (bits '11') MUST BE REJECTED to avoid modulo bias.
    Bit sequence:
      '00' (val 0 -> 'A', accept)
      '11' (val 3 >= 3, reject)
      '01' (val 1 -> 'B', accept)
      '10' (val 2 -> 'C', accept)
    """
    charset = "ABC"
    bits_per_char = 2
    synthetic_bits = "00110110"

    chunks, pwd, bits_used = map_bitstring_to_characters(
        bitstring=synthetic_bits,
        charset=charset,
        target_length=3,
        bits_per_char=bits_per_char,
    )

    assert pwd == "ABC"
    assert len(chunks) == 4
    assert chunks[0].accepted and chunks[0].character == "A"
    assert not chunks[1].accepted and chunks[1].character is None and chunks[1].value == 3
    assert chunks[2].accepted and chunks[2].character == "B"
    assert chunks[3].accepted and chunks[3].character == "C"
    assert bits_used == 8


def test_shannon_entropy_calculation():
    # Pure single character -> 0 entropy
    assert calculate_shannon_entropy("AAAA") == 0.0

    # 4 distinct characters each occurring once -> log2(4) * 4 = 8.0 bits
    assert calculate_shannon_entropy("ABCD") == 8.0
