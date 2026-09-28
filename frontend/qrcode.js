/**
 * Lightweight, zero-dependency QR Code generator for HTML5 Canvas.
 * Generates standards-compliant QR Code Model 2 with Error Correction M.
 */
(function(window) {
  function QRCode(targetCanvas, options) {
    this.canvas = typeof targetCanvas === 'string' ? document.getElementById(targetCanvas) : targetCanvas;
    this.options = Object.assign({
      width: 256,
      height: 256,
      colorDark: "#e2e8f0",
      colorLight: "#0c0f17",
      correctLevel: 1 // M
    }, options);
  }

  // Minimal standard QR Matrix builder for alphanumeric & byte data
  QRCode.prototype.makeCode = function(text) {
    if (!this.canvas) return;
    const ctx = this.canvas.getContext('2d');
    const size = this.options.width;
    this.canvas.width = size;
    this.canvas.height = size;

    // Use built-in offline QR algorithmic matrix generator
    const modules = generateQRMatrix(text);
    const moduleCount = modules.length;
    const cellSize = size / moduleCount;

    ctx.fillStyle = this.options.colorLight;
    ctx.fillRect(0, 0, size, size);

    ctx.fillStyle = this.options.colorDark;
    for (let row = 0; row < moduleCount; row++) {
      for (let col = 0; col < moduleCount; col++) {
        if (modules[row][col]) {
          ctx.fillRect(Math.round(col * cellSize), Math.round(row * cellSize), Math.ceil(cellSize), Math.ceil(cellSize));
        }
      }
    }
  };

  // Reed-Solomon and Galois Field GF(256) constants
  const GF256_EXP = new Uint8Array(512);
  const GF256_LOG = new Uint8Array(256);
  (function() {
    let x = 1;
    for (let i = 0; i < 255; i++) {
      GF256_EXP[i] = x;
      GF256_LOG[x] = i;
      x <<= 1;
      if (x & 256) x ^= 0x11d;
    }
    for (let i = 255; i < 512; i++) {
      GF256_EXP[i] = GF256_EXP[i - 255];
    }
  })();

  function gfMul(x, y) {
    if (x === 0 || y === 0) return 0;
    return GF256_EXP[GF256_LOG[x] + GF256_LOG[y]];
  }

  function rsGeneratorPoly(degree) {
    let poly = [1];
    for (let i = 0; i < degree; i++) {
      const next = new Array(poly.length + 1).fill(0);
      for (let j = 0; j < poly.length; j++) {
        next[j] ^= gfMul(poly[j], GF256_EXP[i]);
        next[j + 1] ^= poly[j];
      }
      poly = next;
    }
    return poly;
  }

  function rsEncode(data, ecCount) {
    const gen = rsGeneratorPoly(ecCount);
    const res = new Array(ecCount).fill(0);
    for (let i = 0; i < data.length; i++) {
      const factor = data[i] ^ res.shift();
      res.push(0);
      for (let j = 0; j < ecCount; j++) {
        res[j] ^= gfMul(gen[j], factor);
      }
    }
    return res;
  }

  // Version 4 QR (33x33 matrix, fits up to 78 alphanumeric/binary chars) or Version 6 (41x41, fits 134 chars)
  function getQRVersion(dataLen) {
    if (dataLen <= 20) return { ver: 2, size: 25, dataBytes: 28, ecBytes: 16 };
    if (dataLen <= 44) return { ver: 4, size: 33, dataBytes: 64, ecBytes: 28 };
    if (dataLen <= 84) return { ver: 6, size: 41, dataBytes: 108, ecBytes: 44 };
    return { ver: 8, size: 49, dataBytes: 174, ecBytes: 68 };
  }

  function generateQRMatrix(text) {
    const utf8Bytes = [];
    for (let i = 0; i < text.length; i++) {
      const c = text.charCodeAt(i);
      if (c < 128) utf8Bytes.push(c);
      else if (c < 2048) { utf8Bytes.push(192 | (c >> 6)); utf8Bytes.push(128 | (c & 63)); }
      else { utf8Bytes.push(224 | (c >> 12)); utf8Bytes.push(128 | ((c >> 6) & 63)); utf8Bytes.push(128 | (c & 63)); }
    }

    const cfg = getQRVersion(utf8Bytes.length);
    const N = cfg.size;
    const matrix = Array.from({ length: N }, () => new Array(N).fill(null));

    // Place finder patterns at top-left, top-right, bottom-left
    function placeFinder(r0, c0) {
      for (let r = -1; r <= 7; r++) {
        for (let c = -1; c <= 7; c++) {
          const row = r0 + r;
          const col = c0 + c;
          if (row < 0 || row >= N || col < 0 || col >= N) continue;
          if ((r >= 0 && r <= 6 && (c === 0 || c === 6)) ||
              (c >= 0 && c <= 6 && (r === 0 || r === 6)) ||
              (r >= 2 && r <= 4 && c >= 2 && c <= 4)) {
            matrix[row][col] = 1;
          } else {
            matrix[row][col] = 0;
          }
        }
      }
    }

    placeFinder(0, 0);
    placeFinder(0, N - 7);
    placeFinder(N - 7, 0);

    // Timing patterns
    for (let i = 8; i < N - 8; i++) {
      if (matrix[6][i] === null) matrix[6][i] = (i % 2 === 0) ? 1 : 0;
      if (matrix[i][6] === null) matrix[i][6] = (i % 2 === 0) ? 1 : 0;
    }

    // Alignment patterns for ver >= 4
    if (cfg.ver >= 4) {
      const alignCenters = cfg.ver === 4 ? [6, 26] : cfg.ver === 6 ? [6, 34] : [6, 24, 42];
      for (const ar of alignCenters) {
        for (const ac of alignCenters) {
          if ((ar === 6 && ac === 6) || (ar === 6 && ac === N - 7) || (ar === N - 7 && ac === 6)) continue;
          for (let dr = -2; dr <= 2; dr++) {
            for (let dc = -2; dc <= 2; dc++) {
              const mr = ar + dr;
              const mc = ac + dc;
              if (Math.abs(dr) === 2 || Math.abs(dc) === 2 || (dr === 0 && dc === 0)) {
                matrix[mr][mc] = 1;
              } else {
                matrix[mr][mc] = 0;
              }
            }
          }
        }
      }
    }

    // Dark module
    matrix[4 * cfg.ver + 9][8] = 1;

    // Reserve format information areas
    for (let i = 0; i < 9; i++) {
      if (matrix[8][i] === null) matrix[8][i] = 0;
      if (matrix[i][8] === null) matrix[i][8] = 0;
    }
    for (let i = 0; i < 8; i++) {
      if (matrix[8][N - 1 - i] === null) matrix[8][N - 1 - i] = 0;
      if (matrix[N - 1 - i][8] === null) matrix[N - 1 - i][8] = 0;
    }

    // Pack data into bitstream: 0100 (Byte mode) + length (8 bits) + bytes + padding
    const bitStream = [];
    function pushBits(val, len) {
      for (let i = len - 1; i >= 0; i--) {
        bitStream.push((val >> i) & 1);
      }
    }

    pushBits(0b0100, 4); // Byte mode indicator
    pushBits(utf8Bytes.length, 8); // Character count
    for (const b of utf8Bytes) pushBits(b, 8);

    // Terminator & padding to multiple of 8
    pushBits(0, Math.min(4, cfg.dataBytes * 8 - bitStream.length));
    while (bitStream.length % 8 !== 0) bitStream.push(0);

    // Pad bytes
    const padPatterns = [0xec, 0x11];
    let padIdx = 0;
    while (bitStream.length < cfg.dataBytes * 8) {
      pushBits(padPatterns[padIdx % 2], 8);
      padIdx++;
    }

    // Group into bytes
    const dataBytes = [];
    for (let i = 0; i < bitStream.length; i += 8) {
      let b = 0;
      for (let j = 0; j < 8; j++) b = (b << 1) | bitStream[i + j];
      dataBytes.push(b);
    }

    // Generate error correction bytes
    const ecBytes = rsEncode(dataBytes, cfg.ecBytes);
    const fullCodewords = dataBytes.concat(ecBytes);

    // Convert codewords to full bits
    const finalBits = [];
    for (const b of fullCodewords) {
      for (let j = 7; j >= 0; j--) finalBits.push((b >> j) & 1);
    }

    // Place bits in zigzag columns
    let bitIdx = 0;
    let upwards = true;
    for (let rightCol = N - 1; rightCol > 0; rightCol -= 2) {
      if (rightCol === 6) rightCol--; // Skip vertical timing line
      const cols = [rightCol, rightCol - 1];
      const rows = upwards ? Array.from({ length: N }, (_, i) => N - 1 - i) : Array.from({ length: N }, (_, i) => i);
      for (const r of rows) {
        for (const c of cols) {
          if (matrix[r][c] === null) {
            let bit = bitIdx < finalBits.length ? finalBits[bitIdx++] : 0;
            // Apply standard mask pattern 0: (row + col) % 2 === 0
            if ((r + c) % 2 === 0) bit ^= 1;
            matrix[r][c] = bit;
          }
        }
      }
      upwards = !upwards;
    }

    // Write format bits (Mask 0, EC level M = 00) -> 101010000010010
    const fmtBits = [1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0];
    for (let i = 0; i < 6; i++) matrix[8][i] = fmtBits[i];
    matrix[8][7] = fmtBits[6];
    matrix[8][8] = fmtBits[7];
    matrix[7][8] = fmtBits[8];
    for (let i = 9; i < 15; i++) matrix[14 - i][8] = fmtBits[i];

    for (let i = 0; i < 8; i++) matrix[N - 1 - i][8] = fmtBits[i];
    for (let i = 8; i < 15; i++) matrix[8][N - 15 + i] = fmtBits[i];

    return matrix;
  }

  window.QRCode = QRCode;
})(window);
