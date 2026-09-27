"""
FastAPI API route definitions with rate limiting and hardware backend selection.
"""
import logging
from fastapi import APIRouter, HTTPException, Request, status
from backend.schemas.generator import GeneratePasswordRequest, GeneratePasswordResponse
from backend.core.generator import generate_quantum_password
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
        "with Hadamard superposition gates and bias-free rejection sampling."
    ),
)
def generate_password_endpoint(
    request: GeneratePasswordRequest,
    http_request: Request,
) -> GeneratePasswordResponse:
    # Rate Limiting (Phase 6 Hardening)
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
        )

        # CRITICAL HYGIENE: Never log the generated password!
        logger.info(
            "Quantum generation completed: backend=%s, length=%d, qubits=%d, shots=%d, rejections=%d, latency=%.2fms",
            result.backend_mode,
            result.length,
            result.num_qubits,
            result.total_shots,
            result.rejected_count,
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
