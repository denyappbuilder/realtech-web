const MIME_PODLE_PRIPONY = new Map([
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".png", "image/png"],
  [".webp", "image/webp"],
]);

/** MIME enclosure z přípony coveru. Neznámou příponu vynechá. */
export function mimeTypeProEnclosure(imagePath) {
  const lastSlash = Math.max(imagePath.lastIndexOf("/"), imagePath.lastIndexOf("\\"));
  const name = lastSlash === -1 ? imagePath : imagePath.slice(lastSlash + 1);
  const lastDot = name.lastIndexOf(".");
  if (lastDot <= 0) return undefined;
  return MIME_PODLE_PRIPONY.get(name.slice(lastDot).toLowerCase());
}
