
// src/ocr/onnxRuntime.ts
import { InferenceSession, Tensor, env } from 'onnxruntime-react-native';
import { Platform } from 'react-native';

env.wasm.numThreads = 2;

const getModelUri = async (filename: string) => {
  if (Platform.OS === 'ios') {
    const RNFS = require('react-native-fs');
    return `${RNFS.MainBundlePath}/${filename}`;
  } else {
    return `models/${filename}`;
  }
};

// ====== TIPOS / UTILS ======
type PreprocessDetResult = {
  data: Float32Array;
  w: number;
  h: number;
  scaleX: number;
  scaleY: number;
};

const roundToMultiple = (x: number, m: number) => Math.max(m, Math.round(x / m) * m);

function computeTargetSize(width: number, height: number, targetLongSide = 960, multiple = 32) {
  const long = Math.max(width, height);
  const scale = targetLongSide / long;
  const wRaw = Math.round(width * scale);
  const hRaw = Math.round(height * scale);
  const w = Math.max(multiple, roundToMultiple(wRaw, multiple));
  const h = Math.max(multiple, roundToMultiple(hRaw, multiple));
  return { w, h, scaleX: w / width, scaleY: h / height };
}

function bilinearResizeRGB(
  src: Uint8Array, srcW: number, srcH: number, dstW: number, dstH: number
): Float32Array {
  const dst = new Float32Array(dstW * dstH * 3);
  const scaleX = srcW / dstW;
  const scaleY = srcH / dstH;
  for (let dy = 0; dy < dstH; dy++) {
    const sy = (dy + 0.5) * scaleY - 0.5;
    const y0 = Math.max(0, Math.floor(sy));
    const y1 = Math.min(srcH - 1, y0 + 1);
    const wy = sy - y0;
    for (let dx = 0; dx < dstW; dx++) {
      const sx = (dx + 0.5) * scaleX - 0.5;
      const x0 = Math.max(0, Math.floor(sx));
      const x1 = Math.min(srcW - 1, x0 + 1);
      const wx = sx - x0;
      const idx00 = (y0 * srcW + x0) * 3;
      const idx01 = (y0 * srcW + x1) * 3;
      const idx10 = (y1 * srcW + x0) * 3;
      const idx11 = (y1 * srcW + x1) * 3;
      const w00 = (1 - wx) * (1 - wy);
      const w01 = wx * (1 - wy);
      const w10 = (1 - wx) * wy;
      const w11 = wx * wy;
      const didx = (dy * dstW + dx) * 3;
      dst[didx + 0] = src[idx00 + 0] * w00 + src[idx01 + 0] * w01 + src[idx10 + 0] * w10 + src[idx11 + 0] * w11;
      dst[didx + 1] = src[idx00 + 1] * w00 + src[idx01 + 1] * w01 + src[idx10 + 1] * w10 + src[idx11 + 1] * w11;
      dst[didx + 2] = src[idx00 + 2] * w00 + src[idx01 + 2] * w01 + src[idx10 + 2] * w10 + src[idx11 + 2] * w11;
    }
  }
  return dst;
}

function normalizeHWCtoCHW(
  srcRGB: Float32Array | Uint8Array, w: number, h: number,
  mean: [number, number, number] = [0.485, 0.456, 0.406],
  std: [number, number, number] = [0.229, 0.224, 0.225]
): Float32Array {
  const out = new Float32Array(3 * w * h);
  const planeSize = w * h;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const srcIdx = (y * w + x) * 3;
      const r = Number(srcRGB[srcIdx + 0]) / 255.0;
      const g = Number(srcRGB[srcIdx + 1]) / 255.0;
      const b = Number(srcRGB[srcIdx + 2]) / 255.0;
      const dstIndex = y * w + x;
      out[0 * planeSize + dstIndex] = (r - mean[0]) / std[0];
      out[1 * planeSize + dstIndex] = (g - mean[1]) / std[1];
      out[2 * planeSize + dstIndex] = (b - mean[2]) / std[2];
    }
  }
  return out;
}

export function preprocessForDet(
  rgbData: Uint8Array,
  width: number,
  height: number,
  options?: { targetLongSide?: number; multiple?: number; mean?: [number, number, number]; std?: [number, number, number]; }
): PreprocessDetResult {
  const { w, h, scaleX, scaleY } = computeTargetSize(
    width, height,
    options?.targetLongSide ?? 960,
    options?.multiple ?? 32
  );
  const resized = bilinearResizeRGB(rgbData, width, height, w, h);
  const chw = normalizeHWCtoCHW(resized, w, h, options?.mean, options?.std);
  return { data: chw, w, h, scaleX, scaleY };
}

// ====== SESIONES (exportadas) ======
let detSession: InferenceSession | null = null;
let recSession: InferenceSession | null = null;

export async function initOCR() {
  const detUri = await getModelUri('ch_ppocr_mobile_v2.0_det_infer.onnx');
  const recUri = await getModelUri('ch_ppocr_mobile_v2.0_rec_infer.onnx');
  detSession = await InferenceSession.create(detUri);
  recSession = await InferenceSession.create(recUri);
}

// ====== PLACEHOLDERS (debes implementarlas o importarlas) ======
type DetBox = { polygon: [number, number][], score: number };

// ¡OJO! Estas funciones/variables deben existir o el código no compila:
function postprocessDB(...args: any[]): DetBox[] {
  // TODO: implementa tu postproceso DB y devuelve cajas
  return [];
}
function warpAndCrop(...args: any[]): { data: Float32Array; w: number; h: number } {
  // TODO: recorte con transformación de perspectiva y redimensionar a alto 32
  return { data: new Float32Array(32 * 32 * 3), w: 32, h: 32 };
}
function preprocessForRec(...args: any[]): { data: Float32Array; w: number; h: number } {
  // TODO: normalización para REC (típicamente 1x3x32xW con mean/std diferentes)
  return { data: new Float32Array(3 * 32 * 32), w: 32, h: 32 };
}
function formatLogits(tensor: Tensor): number[][] {
  // Convierte [1, T, C] o [T, C] a matriz 2D
  const dims = (tensor as any).dims ?? [];
  const data = tensor.data as Float32Array;
  if (dims.length === 3) {
    const T = dims[1], C = dims[2];
    const out: number[][] = [];
    for (let t = 0; t < T; t++) {
      const row: number[] = [];
      for (let c = 0; c < C; c++) {
        row.push(data[t * C + c]);
      }
      out.push(row);
    }
    return out;
  } else if (dims.length === 2) {
    const T = dims[0], C = dims[1];
    const out: number[][] = [];
    for (let t = 0; t < T; t++) {
      const row: number[] = [];
      for (let c = 0; c < C; c++) {
        row.push(data[t * C + c]);
      }
      out.push(row);
    }
    return out;
  }
  return [];
}
const charset: string[] = []; // Carga aquí tu diccionario de PP-OCR (ch_...)

// Decodificador CTC (el que te compartí antes)
function softmax(vec: number[]): number[] {
  const maxV = Math.max(...vec);
  const exps = vec.map(v => Math.exp(v - maxV));
  const sumExp = exps.reduce((a, b) => a + b, 0);
  return exps.map(e => e / sumExp);
}
export function ctcDecode(logits2D: number[][], charset: string[], blankIndex: number = 0) {
  const seqLen = logits2D.length;
  if (seqLen === 0) return { text: '', conf: 0 };
  const numClasses = logits2D[0].length;
  const argmaxIndices: number[] = [];
  const argmaxProbs: number[] = [];
  for (let t = 0; t < seqLen; t++) {
    const probs = softmax(logits2D[t]);
    let maxIdx = 0, maxProb = probs[0];
    for (let c = 1; c < numClasses; c++) {
      if (probs[c] > maxProb) { maxProb = probs[c]; maxIdx = c; }
    }
    argmaxIndices.push(maxIdx);
    argmaxProbs.push(maxProb);
  }
  const collapsedIndices: number[] = [];
  const collapsedProbs: number[] = [];
  let prevIdx: number | null = null;
  for (let t = 0; t < seqLen; t++) {
    const idx = argmaxIndices[t], p = argmaxProbs[t];
    if (idx === prevIdx) continue;
    prevIdx = idx;
    if (idx === blankIndex) continue;
    collapsedIndices.push(idx);
    collapsedProbs.push(p);
  }
  let text = '';
  for (const idx of collapsedIndices) {
    const charsetIdx = idx - (blankIndex === 0 ? 1 : 0);
    if (charsetIdx >= 0 && charsetIdx < charset.length) text += charset[charsetIdx];
  }
  const conf = collapsedProbs.length
    ? collapsedProbs.reduce((a, b) => a + b, 0) / collapsedProbs.length
    : 0;
  return { text, conf };
}

// ====== PIPELINE ======
export async function runOCRFromBitmap(rgbData: Uint8Array, width: number, height: number) {
  if (!detSession || !recSession) await initOCR();

  // 1) DET
  const detInp = preprocessForDet(rgbData, width, height);
  const detTensor = new Tensor('float32', detInp.data, [1, 3, detInp.h, detInp.w]);
  const detOut = await detSession!.run({ [detSession!.inputNames[0]]: detTensor });
  const detProbKey = detSession!.outputNames[0];
  const detProb = detOut[detProbKey] as Tensor;

  const boxes: DetBox[] = postprocessDB(
    detProb.data as Float32Array,
    (detProb as any).dims,
    { binThreshold: 0.3, boxThreshold: 0.5, minBoxSize: 5 },
    { origW: width, origH: height, procW: detInp.w, procH: detInp.h }
  );

  // 2) CROP + REC
  const results: { box: DetBox; text: string; conf: number }[] = [];
  for (const box of boxes) {
    const crop = warpAndCrop(rgbData, width, height, box.polygon, { outH: 32 });
    const recInp = preprocessForRec(crop.data, crop.w, crop.h);
    const recTensor = new Tensor('float32', recInp.data, [1, 3, recInp.h, recInp.w]);
    const recOut = await recSession!.run({ [recSession!.inputNames[0]]: recTensor });
    const recLogitsKey = recSession!.outputNames[0];
    const logits = recOut[recLogitsKey] as Tensor;
    const { text, conf } = ctcDecode(formatLogits(logits), charset);
    results.push({ box, text, conf });
  }

  return results.filter(r => r.conf >= 0.5)
                .sort((a, b) => a.box.polygon[0][1] - b.box.polygon[0][1]);
}
