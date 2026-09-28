"""
Unit tests for Quantum Diceware Passphrase generation.
"""
import pytest
from backend.core.diceware import generate_quantum_passphrase, DICEWARE_1024_WORDLIST


def test_diceware_dictionary_size():
    assert len(DICEWARE_1024_WORDLIST) == 1024
    # All words should be lowercase distinct strings
    assert len(set(DICEWARE_1024_WORDLIST)) == 1024
    for w in DICEWARE_1024_WORDLIST:
        assert isinstance(w, str) and len(w) > 0


def test_quantum_passphrase_generation():
    result = generate_quantum_passphrase(num_words=5, separator="-", capitalize=False)
    assert result.num_words == 5
    assert len(result.words) == 5
    assert result.passphrase == "-".join(result.words)
    assert result.total_entropy_bits == 50.0  # 5 * 10
    assert result.num_qubits == 10
    assert len(result.word_details) == 5
    for wd in result.word_details:
        assert wd.word in DICEWARE_1024_WORDLIST
        assert 0 <= wd.word_index < 1024
        assert len(wd.bitstring) == 10


def test_quantum_passphrase_custom_options():
    result = generate_quantum_passphrase(num_words=4, separator=".", capitalize=True, include_number=True)
    assert result.num_words == 4
    # With include_number=True, there are 4 words + 1 digit
    assert len(result.words) == 5
    assert "." in result.passphrase
    # First word should be capitalized
    assert result.words[0][0].isupper()
    # Last item should be a digit
    assert result.words[-1].isdigit()


def test_quantum_passphrase_bounds():
    with pytest.raises(ValueError):
        generate_quantum_passphrase(num_words=2)  # too low

    with pytest.raises(ValueError):
        generate_quantum_passphrase(num_words=15)  # too high
