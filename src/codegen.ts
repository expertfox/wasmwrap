const HEADER_WARNING_COMMENT = "WARNING: This file was autogenerated by wasmwrap and should not be edited manually."

export interface RenderData {
    typescript: boolean;
    base64Wasm: string;
    module: "esm" | "commonjs";
    includeDecode: boolean;
}

function renderDecodeFunction(data: RenderData, E: string) {
    return `const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
const lookup = new Uint8Array(256);
for (let i = 0; i < CHARS.length; i++) {
  lookup[CHARS.charCodeAt(i)] = i;
}

${data.typescript
? `${E}function decode(base64: string): ArrayBuffer {`
: `${E}function decode(base64) {`}
  let bufferLength = base64.length * 0.75;
  const len = base64.length;

  if (base64[len - 1] === "=") bufferLength--;
  if (base64[len - 2] === "=") bufferLength--;

  const bytes = new Uint8Array(bufferLength);
  let p = 0;
  for (let i = 0; i < len; i+=4) {
    const encoded1 = lookup[base64.charCodeAt(i)];
    const encoded2 = lookup[base64.charCodeAt(i+1)];
    const encoded3 = lookup[base64.charCodeAt(i+2)];
    const encoded4 = lookup[base64.charCodeAt(i+3)];

    bytes[p++] = (encoded1 << 2) | (encoded2 >> 4);
    bytes[p++] = ((encoded2 & 15) << 4) | (encoded3 >> 2);
    bytes[p++] = ((encoded3 & 3) << 6) | (encoded4 & 63);
  }

  return bytes.buffer;
}`
}

export function renderCode(data: RenderData): string {
    // Export prefix for variables and functions (ESM)
    const E = data.module === "esm" ? `export `: ``;

    return `// ${HEADER_WARNING_COMMENT}
${data.includeDecode ? renderDecodeFunction(data, E) : ``}
${E}const base64 = "${data.base64Wasm}";
${data.includeDecode ? `${E}const buffer = decode(base64);`: ``}
${data.module === "commonjs"? `module.exports = { base64${data.includeDecode?`, buffer, decode`:``} };\n` :``}`
}
