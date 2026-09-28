"""
End-to-End API verification script for all quantum endpoints using standard library urllib.
"""
import urllib.request
import json

BASE = "http://127.0.0.1:8000"

def get(path):
    req = urllib.request.Request(f"{BASE}{path}", headers={"User-Agent": "TestClient"})
    with urllib.request.urlopen(req) as resp:
        return resp.status, json.loads(resp.read().decode())

def post(path, body):
    data = json.dumps(body).encode()
    req = urllib.request.Request(
        f"{BASE}{path}",
        data=data,
        headers={"Content-Type": "application/json", "User-Agent": "TestClient"}
    )
    with urllib.request.urlopen(req) as resp:
        return resp.status, json.loads(resp.read().decode())

def test_all():
    # 1. Health
    status, d = get("/health")
    assert status == 200, f"Health failed: {d}"
    print("[1/6] Health check passed")

    # 2. Generate Character
    status, d = post("/generate", {
        "length": 20,
        "include_uppercase": True,
        "include_lowercase": True,
        "include_digits": True,
        "include_symbols": True,
    })
    assert status == 200, f"Generate char failed: {d}"
    print(f"[2/6] Quantum character key generated: {d['password']} (Entropy: {d['shannon_entropy_bits']:.2f} bits, {d['num_qubits']} qubits)")

    # 3. Generate Passphrase
    status, p = post("/generate/passphrase", {
        "num_words": 5,
        "separator": "-",
        "capitalize": True,
        "include_number": True,
    })
    assert status == 200, f"Generate passphrase failed: {p}"
    print(f"[3/6] Quantum Diceware passphrase: {p['passphrase']} ({p['total_entropy_bits']} bits entropy)")

    # 4. Generate Batch
    status, b = post("/generate/batch", {
        "length": 16,
        "count": 5,
    })
    assert status == 200, f"Generate batch failed: {b}"
    print(f"[4/6] Quantum batch vault generated {len(b['passwords'])} keys in {b['execution_time_ms']}ms")

    # 5. Benchmark Compare
    status, bm = post("/benchmark/compare", {"length": 16})
    assert status == 200, f"Benchmark failed: {bm}"
    print("[5/6] Quantum vs Classical PRNG benchmark passed")

    # 6. Modulo Bias Sandbox
    status, sb = get("/benchmark/modulo-bias?charset_size=10&sample_count=1000")
    assert status == 200, f"Sandbox failed: {sb}"
    print("[6/6] Modulo bias sandbox simulation passed")

    print("\nALL 6 QUANTUM LAB ENDPOINTS FUNCTIONING FLAWLESSLY!")

if __name__ == "__main__":
    test_all()
