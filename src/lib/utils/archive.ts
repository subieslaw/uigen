import JSZip from "jszip";

export async function buildZipFromFiles(
  files: Record<string, string>
): Promise<Uint8Array> {
  const zip = new JSZip();
  for (const [path, content] of Object.entries(files)) {
    zip.file(path.startsWith("/") ? path.slice(1) : path, content);
  }
  return zip.generateAsync({ type: "uint8array" });
}
