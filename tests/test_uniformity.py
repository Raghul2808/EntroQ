"""
Statistical uniformity tests using Pearson's Chi-squared Goodness-of-Fit test.
Verifies that quantum measurement + rejection sampling produces a genuinely uniform distribution
with zero modulo bias.
"""
from collections import Counter
from scipy.stats import chisquare
from backend.core.generator import generate_quantum_password


def test_chi_square_uniformity_digits():
    """
    Test uniformity over 10 digits ('0'-'9').
    Bits per char = 4 (range 0..15).
    Rejection sampling rejects 10..15.
    If modulo bias existed (e.g. val % 10), digits 0-5 would have double probability (2/16 vs 1/16).
    Chi-squared test will decisively reject modulo bias, but PASS for true rejection sampling.
    """
    sample_size = 2000
    target_charset = "0123456789"
    k = len(target_charset)

    # Generate characters in batches of 50 to reach sample_size
    collected = []
    while len(collected) < sample_size:
        batch_len = min(50, sample_size - len(collected))
        res = generate_quantum_password(
            length=batch_len,
            include_uppercase=False,
            include_lowercase=False,
            include_digits=True,
            include_symbols=False,
            include_svg=False,
        )
        collected.extend(list(res.password))

    counts = Counter(collected)
    observed = [counts.get(ch, 0) for ch in target_charset]
    expected = [sample_size / k] * k

    # Pearson's chi-squared test
    stat, p_value = chisquare(f_obs=observed, f_exp=expected)

    # Under null hypothesis H0 (uniformity), p_value should exceed significance level alpha = 0.01
    assert p_value > 0.01, f"Chi-square test failed: p={p_value:.5f}, observed={observed}"


def test_chi_square_uniformity_letters():
    """
    Test uniformity over 26 uppercase letters ('A'-'Z').
    Bits per char = 5 (range 0..31).
    Rejection sampling rejects 26..31.
    """
    sample_size = 2600
    target_charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    k = len(target_charset)

    collected = []
    while len(collected) < sample_size:
        batch_len = min(65, sample_size - len(collected))
        res = generate_quantum_password(
            length=batch_len,
            include_uppercase=True,
            include_lowercase=False,
            include_digits=False,
            include_symbols=False,
            include_svg=False,
        )
        collected.extend(list(res.password))

    counts = Counter(collected)
    observed = [counts.get(ch, 0) for ch in target_charset]
    expected = [sample_size / k] * k

    stat, p_value = chisquare(f_obs=observed, f_exp=expected)
    assert p_value > 0.01, f"Chi-square test failed: p={p_value:.5f}, stat={stat:.2f}"
