"""
Character set definitions and validation for quantum entropy mapping.
"""
import math
import string

DEFAULT_UPPERCASE = string.ascii_uppercase  # 26 chars
DEFAULT_LOWERCASE = string.ascii_lowercase  # 26 chars
DEFAULT_DIGITS = string.digits              # 10 chars
DEFAULT_SYMBOLS = "!@#$%^&*()-_=+[]{}|;:,.<>?"  # 30 standard symbols


def build_charset(
    include_uppercase: bool = True,
    include_lowercase: bool = True,
    include_digits: bool = True,
    include_symbols: bool = True,
    custom_charset: str | None = None,
) -> str:
    """
    Constructs a validated character set with unique characters.
    """
    if custom_charset is not None:
        # Deduplicate while preserving order
        seen = set()
        chars = []
        for ch in custom_charset:
            if ch not in seen and not ch.isspace():
                seen.add(ch)
                chars.append(ch)
        charset = "".join(chars)
        if not charset:
            raise ValueError("Custom charset must contain at least 2 non-whitespace characters.")
        return charset

    chars = []
    if include_uppercase:
        chars.append(DEFAULT_UPPERCASE)
    if include_lowercase:
        chars.append(DEFAULT_LOWERCASE)
    if include_digits:
        chars.append(DEFAULT_DIGITS)
    if include_symbols:
        chars.append(DEFAULT_SYMBOLS)

    combined = "".join(chars)
    # Deduplicate preserving deterministic order
    seen = set()
    deduped = []
    for ch in combined:
        if ch not in seen:
            seen.add(ch)
            deduped.append(ch)

    charset = "".join(deduped)
    if len(charset) < 2:
        raise ValueError("Selected character set must contain at least 2 characters.")
    return charset


def get_bits_per_char(charset_size: int) -> int:
    """
    Calculates the minimum number of bits needed to address charset_size items.
    b = ceil(log2(charset_size))
    """
    if charset_size < 2:
        raise ValueError("Charset size must be at least 2.")
    return math.ceil(math.log2(charset_size))
