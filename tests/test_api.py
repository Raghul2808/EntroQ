"""
Integration tests for FastAPI endpoints.
"""
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)


def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy", "service": "quantum-password-generator"}


def test_generate_default():
    response = client.post("/generate", json={})
    assert response.status_code == 200
    data = response.json()

    assert "password" in data
    assert len(data["password"]) == 16
    assert data["length"] == 16
    assert data["num_qubits"] > 0
    assert len(data["primary_bitstring"]) == data["num_qubits"]
    assert data["accepted_count"] == 16
    assert data["rejected_count"] >= 0
    assert data["total_shots"] >= 1
    assert data["theoretical_entropy_bits"] > 0
    assert data["shannon_entropy_bits"] > 0
    assert len(data["chunks"]) >= 16

    # Phase 2 Visualization Data Assertions
    assert "circuit" in data
    assert data["circuit"]["num_qubits"] == data["num_qubits"]
    assert "OPENQASM 2.0;" in data["circuit"]["qasm"]
    assert "text_diagram" in data["circuit"]
    assert "qubit_states" in data
    assert len(data["qubit_states"]) == data["num_qubits"]
    assert data["qubit_states"][0]["theoretical_p0"] == 0.5
    assert data["qubit_states"][0]["collapsed_state"] in (0, 1)

    assert "probability_distribution" in data
    prob = data["probability_distribution"]
    assert prob["theoretical_p0"] == 0.5
    assert prob["theoretical_p1"] == 0.5
    assert prob["zeros_count"] + prob["ones_count"] == data["num_qubits"]
    assert round(prob["empirical_p0"] + prob["empirical_p1"], 2) == 1.0


def test_generate_custom_length():
    response = client.post("/generate", json={"length": 24})
    assert response.status_code == 200
    data = response.json()
    assert len(data["password"]) == 24
    assert data["length"] == 24


def test_generate_digits_only():
    response = client.post(
        "/generate",
        json={
            "length": 12,
            "include_uppercase": False,
            "include_lowercase": False,
            "include_digits": True,
            "include_symbols": False,
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data["password"]) == 12
    assert all(c in "0123456789" for c in data["password"])
    assert data["charset_size"] == 10
    assert data["bits_per_char"] == 4  # ceil(log2(10)) = 4


def test_generate_custom_charset():
    response = client.post(
        "/generate",
        json={
            "length": 8,
            "custom_charset": "ALPHA-01!",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data["password"]) == 8
    assert all(c in "ALPHA-01!" for c in data["password"])


def test_generate_validation_errors():
    # Length too small
    res_small = client.post("/generate", json={"length": 2})
    assert res_small.status_code == 422  # Pydantic validation error

    # Length too large
    res_large = client.post("/generate", json={"length": 200})
    assert res_large.status_code == 422

    # All charsets disabled
    res_no_chars = client.post(
        "/generate",
        json={
            "length": 16,
            "include_uppercase": False,
            "include_lowercase": False,
            "include_digits": False,
            "include_symbols": False,
        },
    )
    assert res_no_chars.status_code == 400
    assert "at least 2 characters" in res_no_chars.json()["detail"]


def test_generate_noisy_qpu():
    response = client.post("/generate", json={"length": 8, "backend_mode": "noisy_qpu"})
    assert response.status_code == 200
    data = response.json()
    assert data["backend_mode"] == "noisy_qpu"
    assert "Transmon Noise Model" in data["backend_name"]
    assert len(data["password"]) == 8


def test_rate_limiter():
    from backend.core.rate_limiter import SlidingWindowRateLimiter
    from fastapi import Request

    limiter = SlidingWindowRateLimiter(max_requests=2, window_seconds=60)
    mock_request = Request({"type": "http", "client": ("192.168.1.100", 1234), "headers": []})

    # First two should pass
    limiter.check(mock_request)
    limiter.check(mock_request)

    # Third must raise 429
    import pytest
    from fastapi import HTTPException
    with pytest.raises(HTTPException) as exc_info:
        limiter.check(mock_request)
    assert exc_info.value.status_code == 429
    assert "Rate limit exceeded" in exc_info.value.detail


def test_benchmark_endpoints():
    # Test head-to-head comparison
    resp = client.post("/benchmark/compare", json={"length": 8})
    assert resp.status_code == 200
    data = resp.json()
    assert "quantum" in data
    assert "classical_prng" in data
    assert data["quantum"]["modulo_bias"] == "0.00% (Rejection Sampling enforced)"

    # Test modulo bias sandbox
    resp_sandbox = client.get("/benchmark/modulo-bias?charset_size=10&sample_count=500")
    assert resp_sandbox.status_code == 200
    sandbox = resp_sandbox.json()
    assert len(sandbox["naive_modulo"]["bins"]) == 10
    assert len(sandbox["rejection_sampling"]["bins"]) == 10
    assert sandbox["rejection_sampling"]["is_uniform"] is True


