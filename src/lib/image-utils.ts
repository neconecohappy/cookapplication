/**
 * 画像をリサイズして Base64 文字列（data URL プレフィックスなし）を返す
 * - 長辺を最大 1024px に縮小
 * - EXIF 回転情報は createImageBitmap が自動処理
 * - JPEG 品質 0.8 で圧縮
 */
export async function resizeImageToBase64(file: File): Promise<string> {
  const MAX_SIZE = 1024;

  const bitmap = await createImageBitmap(file);
  const { width, height } = bitmap;

  let newWidth = width;
  let newHeight = height;
  if (width > MAX_SIZE || height > MAX_SIZE) {
    if (width > height) {
      newWidth = MAX_SIZE;
      newHeight = Math.round(height * (MAX_SIZE / width));
    } else {
      newHeight = MAX_SIZE;
      newWidth = Math.round(width * (MAX_SIZE / height));
    }
  }

  const canvas = document.createElement("canvas");
  canvas.width = newWidth;
  canvas.height = newHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas context を取得できませんでした");
  ctx.drawImage(bitmap, 0, 0, newWidth, newHeight);
  bitmap.close();

  const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
  return dataUrl.split(",")[1];
}
