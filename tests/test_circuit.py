"""
Tests for quantum circuit construction and AerSimulator execution.
"""
import pytest
from backend.core.circuit import build_hadamard_circuit, execute_circuit


def test_build_hadamard_circuit_structure():
    num_qubits = 8
    qc = build_hadamard_circuit(num_qubits)
    assert qc.num_qubits == num_qubits
    assert qc.num_clbits == num_qubits

    # Check operations: each qubit must have an 'h' gate and a 'measure'
    gate_names = [inst.operation.name for inst in qc.data]
    h_count = sum(1 for name in gate_names if name == "h")
    measure_count = sum(1 for name in gate_names if name == "measure")

    assert h_count == num_qubits
    assert measure_count == num_qubits


def test_build_hadamard_circuit_invalid_qubits():
    with pytest.raises(ValueError, match="at least 1"):
        build_hadamard_circuit(0)


def test_execute_circuit_shape_and_length():
    num_qubits = 12
    qc = build_hadamard_circuit(num_qubits)
    results = execute_circuit(qc, shots=3)

    assert len(results) == 3
    for bitstring in results:
        assert len(bitstring) == num_qubits
        assert all(bit in ("0", "1") for bit in bitstring)


def test_single_qubit_superposition_probabilities():
    """
    Measuring |+> = (|0> + |1>)/sqrt(2) over many shots should yield approximately
    50% '0' and 50% '1' with high statistical confidence.
    """
    qc = build_hadamard_circuit(1)
    shots = 2000
    results = execute_circuit(qc, shots=shots)
    zeros = sum(1 for s in results if s == "0")
    ones = sum(1 for s in results if s == "1")

    # Ratio should be close to 0.5 (within 4 sigma for N=2000: sigma = sqrt(2000*0.25) ~ 22.3)
    assert abs(zeros - 1000) < 100
    assert abs(ones - 1000) < 100


def test_circuit_exports():
    from backend.core.circuit import (
        export_circuit_qasm,
        export_circuit_text,
        export_circuit_svg,
        get_circuit_metadata,
    )

    qc = build_hadamard_circuit(4)
    qasm_str = export_circuit_qasm(qc)
    assert "OPENQASM 2.0;" in qasm_str
    assert "h q[0];" in qasm_str

    text_str = export_circuit_text(qc)
    assert "q_0:" in text_str

    svg_str = export_circuit_svg(qc)
    assert svg_str is not None
    assert "<svg" in svg_str

    meta = get_circuit_metadata(qc)
    assert meta["num_qubits"] == 4
    assert meta["depth"] == 2
    assert meta["gate_counts"]["h"] == 4

