"""
FastAPI API route definitions with rate limiting and hardware backend selection.
"""
import logging
import time
from fastapi import APIRouter, HTTPException, Request, status

from backend.schemas.generator import GeneratePasswordRequest, GeneratePasswordResponse
from backend.schemas.diceware import (
    GeneratePassphraseRequest,
    GeneratePassphraseResponse,
    GenerateBatchRequest,
    GenerateBatchResponse,
    BatchItem,
    WordDetailSchema,
)
from backend.core.generator import generate_quantum_password
from backend.core.diceware import generate_quantum_passphrase
from backend.core.rate_limiter import rate_limiter

logger = logging.getLogger("qrng_api")
router = APIRouter()


@router.post(
    "/generate",
    response_model=GeneratePasswordResponse,
    status_code=status.HTTP_200_OK,
    summary="Generate Quantum Password",
    description=(
        "Generates a password using true quantum randomness from an AerSimulator circuit "
        "with Hadamard superposition gates, optional Von Neumann debiasing, and bias-free rejection sampling."
    ),
)
def generate_password_endpoint(
    request: GeneratePasswordRequest,
    http_request: Request,
) -> GeneratePasswordResponse:
    rate_limiter.check(http_request)

    try:
        result = generate_quantum_password(
            length=request.length,
            include_uppercase=request.include_uppercase,
            include_lowercase=request.include_lowercase,
            include_digits=request.include_digits,
            include_symbols=request.include_symbols,
            custom_charset=request.custom_charset,
            backend_mode=request.backend_mode,
            apply_von_neumann=request.apply_von_neumann,
        )

        # CRITICAL HYGIENE: Never log the generated password!
        logger.info(
            "Quantum generation completed: backend=%s, vn_debias=%s, length=%d, qubits=%d, shots=%d, rejections=%d, vn_discarded=%d, latency=%.2fms",
            result.backend_mode,
            result.von_neumann_enabled,
            result.length,
            result.num_qubits,
            result.total_shots,
            result.rejected_count,
            result.von_neumann_discarded_pairs,
            result.execution_time_ms,
        )

        return GeneratePasswordResponse(**result.to_dict())
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )
    except HTTPException:
        raise
    except Exception as exc:
        logger.error("Error during quantum generation: %s", str(exc), exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Quantum circuit execution failed.",
        )


@router.post(
    "/benchmark/compare",
    summary="Quantum vs Classical PRNG Benchmark",
    description="Executes a live head-to-head comparison between Quantum AerSimulator and Classical Mersenne Twister PRNG.",
)
def benchmark_compare_endpoint(request: GeneratePasswordRequest) -> dict:
    try:
        from backend.core.benchmark import run_quantum_vs_prng_benchmark
        return run_quantum_vs_prng_benchmark(
            length=request.length,
            include_uppercase=request.include_uppercase,
            include_lowercase=request.include_lowercase,
            include_digits=request.include_digits,
            include_symbols=request.include_symbols,
            custom_charset=request.custom_charset,
        )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))
    except Exception as exc:
        logger.error("Benchmark error: %s", str(exc), exc_info=True)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Benchmark failed.")


@router.get(
    "/benchmark/modulo-bias",
    summary="Modulo Bias Sandbox Simulator",
    description="Simulates character distributions under Naive Modulo vs Quantum Rejection Sampling.",
)
def modulo_bias_sandbox_endpoint(charset_size: int = 10, sample_count: int = 1000) -> dict:
    try:
        from backend.core.benchmark import run_modulo_bias_simulation
        return run_modulo_bias_simulation(charset_size=charset_size, sample_count=sample_count)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))
    except Exception as exc:
        logger.error("Modulo bias sandbox error: %s", str(exc), exc_info=True)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Simulation failed.")


@router.post(
    "/generate/passphrase",
    response_model=GeneratePassphraseResponse,
    status_code=status.HTTP_200_OK,
    summary="Generate Quantum Diceware Passphrase",
    description="Generates a memorable, cryptographically secure passphrase using quantum measurement bitstrings mapped to a 1024-word EFF dictionary.",
)
def generate_passphrase_endpoint(
    request: GeneratePassphraseRequest,
    http_request: Request,
) -> GeneratePassphraseResponse:
    rate_limiter.check(http_request)
    try:
        result = generate_quantum_passphrase(
            num_words=request.num_words,
            separator=request.separator,
            capitalize=request.capitalize,
            include_number=request.include_number,
            backend_mode=request.backend_mode,
        )
        return GeneratePassphraseResponse(
            passphrase=result.passphrase,
            words=result.words,
            num_words=result.num_words,
            wordlist_size=result.wordlist_size,
            bits_per_word=result.bits_per_word,
            total_entropy_bits=result.total_entropy_bits,
            num_qubits=result.num_qubits,
            backend_mode=result.backend_mode,
            backend_name=result.backend_name,
            execution_time_ms=result.execution_time_ms,
            word_details=[
                WordDetailSchema(
                    word=w.word,
                    word_index=w.word_index,
                    bitstring=w.bitstring,
                    qubits_used=w.qubits_used,
                )
                for w in result.word_details
            ],
            circuit=result.circuit,
        )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))
    except Exception as exc:
        logger.error("Diceware generation error: %s", str(exc), exc_info=True)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Passphrase generation failed.")


@router.post(
    "/generate/batch",
    response_model=GenerateBatchResponse,
    status_code=status.HTTP_200_OK,
    summary="Batch Quantum Password Generation",
    description="Generates a batch of up to 20 quantum random passwords in a single request.",
)
def generate_batch_endpoint(
    request: GenerateBatchRequest,
    http_request: Request,
) -> GenerateBatchResponse:
    rate_limiter.check(http_request)
    t0 = time.perf_counter()
    passwords: list[BatchItem] = []

    try:
        for idx in range(request.count):
            res = generate_quantum_password(
                length=request.length,
                include_uppercase=request.include_uppercase,
                include_lowercase=request.include_lowercase,
                include_digits=request.include_digits,
                include_symbols=request.include_symbols,
                custom_charset=request.custom_charset,
                backend_mode=request.backend_mode,
                apply_von_neumann=request.apply_von_neumann,
            )
            passwords.append(
                BatchItem(
                    index=idx + 1,
                    password=res.password,
                    entropy_bits=res.theoretical_entropy_bits,
                    length=res.length,
                )
            )

        total_time_ms = (time.perf_counter() - t0) * 1000.0
        return GenerateBatchResponse(
            passwords=passwords,
            total_count=len(passwords),
            backend_mode=request.backend_mode,
            execution_time_ms=round(total_time_ms, 2),
        )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))
    except Exception as exc:
        logger.error("Batch generation error: %s", str(exc), exc_info=True)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Batch generation failed.")