// Cloudflare R2 (compatible con S3) para la multimedia pesada: videos y fotos en
// alta resolución. Solo se usa en el servidor; las claves nunca llegan al navegador.
// El navegador sube directo a R2 con una URL prefirmada (ver /api/upload/r2).
import {
  DeleteObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const env = () => ({
  accountId: process.env.CLOUDFLARE_R2_ACCOUNT_ID,
  accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
  secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
  bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME,
  publicUrl: process.env.CLOUDFLARE_R2_PUBLIC_URL?.replace(/\/+$/, ""),
});

export const isR2Configured = () => Object.values(env()).every(Boolean);

let client: S3Client | null = null;

// Se crea al usarse (no al importar) para que el build no falle sin las variables.
function r2() {
  const { accountId, accessKeyId, secretAccessKey } = env();
  if (!isR2Configured()) throw new Error("Faltan las variables CLOUDFLARE_R2_* en el servidor.");
  client ??= new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId: accessKeyId!, secretAccessKey: secretAccessKey! },
  });
  return client;
}

const bucket = () => env().bucket!;

export const r2PublicUrl = (key: string) => `${env().publicUrl}/${key}`;

// URL para que el navegador haga un PUT del archivo. Tipo y tamaño quedan
// firmados: R2 rechaza la subida si el archivo no coincide con lo autorizado.
export async function presignUpload(key: string, contentType: string, size: number) {
  const command = new PutObjectCommand({
    Bucket: bucket(),
    Key: key,
    ContentType: contentType,
    ContentLength: size,
    CacheControl: "public, max-age=31536000, immutable",
  });
  const uploadUrl = await getSignedUrl(r2(), command, { expiresIn: 15 * 60 });
  return { uploadUrl, publicUrl: r2PublicUrl(key) };
}

// Claves que sube /api/upload/r2 (y las únicas que el panel puede borrar).
export const isPanelKey = (key: string) => /^(fotos|videos)\/[\w.-]+$/.test(key);

export async function listR2Objects() {
  const { Contents = [] } = await r2().send(new ListObjectsV2Command({ Bucket: bucket(), MaxKeys: 1000 }));
  return Contents.filter((o) => o.Key).map((o) => ({
    key: o.Key!,
    size: o.Size ?? 0,
    lastModified: o.LastModified?.toISOString() ?? null,
  }));
}

export async function deleteR2Object(key: string) {
  await r2().send(new DeleteObjectCommand({ Bucket: bucket(), Key: key }));
}
