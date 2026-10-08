// Comprime en el navegador un video antes de subirlo: lo pasa a MP4 (H.264 + AAC)
// a 1080p como máximo, para que la galería cargue rápido. Usa WebCodecs (Chrome,
// Edge, Safari 16.4+, Firefox 130+). Si el navegador no puede comprimirlo, o el
// resultado no pesa menos, se sube el original.
import {
  ALL_FORMATS,
  BlobSource,
  BufferTarget,
  Conversion,
  Input,
  Mp4OutputFormat,
  Output,
  QUALITY_MEDIUM,
} from "mediabunny";

const MAX_SIDE = 1920;

export async function compressVideo(file: File, onProgress?: (fraction: number) => void): Promise<File> {
  if (typeof VideoEncoder === "undefined") return file;

  const input = new Input({ source: new BlobSource(file), formats: ALL_FORMATS });
  try {
    const track = await input.getPrimaryVideoTrack();
    if (!track) return file;

    // Solo se fija el lado largo; el otro se calcula manteniendo la proporción.
    const { displayWidth: w, displayHeight: h } = track;
    const size = Math.max(w, h) > MAX_SIDE ? (w >= h ? { width: MAX_SIDE } : { height: MAX_SIDE }) : {};

    const output = new Output({
      format: new Mp4OutputFormat({ fastStart: "in-memory" }), // empieza a reproducirse sin descargarlo entero
      target: new BufferTarget(),
    });
    const conversion = await Conversion.init({
      input,
      output,
      video: { ...size, codec: "avc", quality: QUALITY_MEDIUM, forceTranscode: true },
      audio: { codec: "aac", quality: QUALITY_MEDIUM },
      showWarnings: false,
    });
    if (!conversion.isValid) return file;

    if (onProgress) conversion.onProgress = (p) => onProgress(p);
    await conversion.execute();

    const buffer = output.target.buffer;
    if (!buffer || buffer.byteLength >= file.size) return file;
    const name = `${file.name.replace(/\.[^.]+$/, "") || "video"}.mp4`;
    return new File([buffer], name, { type: "video/mp4" });
  } catch (err) {
    console.warn("[video] no se pudo comprimir, se sube el original", err);
    return file;
  } finally {
    input.dispose();
  }
}
