declare module 'gifenc' {
  export interface GifEncoderOptions {
    initialCapacity?: number;
    auto?: boolean;
  }

  export interface GifFrameOptions {
    palette: number[][];
    delay?: number;
    transparent?: boolean | number;
    transparentIndex?: number;
    repeat?: number;
    colorDepth?: number;
    dispose?: number;
  }

  export interface GifEncoderInstance {
    reset(): void;
    finish(): void;
    bytes(): Uint8Array;
    bytesView(): Uint8Array;
    writeFrame(index: Uint8Array, width: number, height: number, options?: GifFrameOptions): void;
  }

  export function GIFEncoder(options?: GifEncoderOptions): GifEncoderInstance;
  export function quantize(data: Uint8Array, maxColors?: number): number[][];
  export function applyPalette(data: Uint8Array, palette: number[][]): Uint8Array;

  const defaultExport: typeof GIFEncoder;
  export default defaultExport;
}


