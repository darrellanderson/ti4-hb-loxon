import sharp, { Metadata } from "sharp";

const OUTLINE_WIDTH: number = 5;

export async function center(pngFilename: string) {
  const metadata: Metadata = await sharp(pngFilename).metadata();
  const width: number = metadata.width || 1;
  const height: number = metadata.height || 1;

  const trimmed: Buffer = await sharp(pngFilename)
    .trim({
      threshold: 0,
    })
    .toBuffer();
  await sharp({
    create: {
      width,
      height,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 0 },
    },
  })
    .composite([{ input: trimmed, gravity: "center" }])
    .png()
    .toFile(pngFilename);

  console.log(`Overwrote: ${pngFilename}`);
}

/**
 * Create an opaque version of a PNG with a white background.
 *
 * @param pngFilename
 */
export async function opaqueJpg(
  pngFilename: string,
  grayscale: boolean = false
) {
  const src: string = pngFilename;
  const dst: string = pngFilename.replace(/.png$/, ".jpg");
  if (src === dst) {
    throw new Error("src is dst???");
  }

  await sharp(src)
    .flatten({ background: { r: 255, g: 255, b: 255 } })
    .grayscale(grayscale)
    .jpeg()
    .toFile(dst);

  console.log(`Created: ${dst}`);
}

/**
 * Create an outlined version of a PNG with a feathered edge and white background.
 *
 * See https://github.com/lovell/sharp/issues/3759
 *
 * @param pngFilename
 */
export async function outlineMask(pngFilename: string) {
  const src: string = pngFilename;
  const dst: string = pngFilename.replace(/.png$/, "-mask.png");
  if (src === dst) {
    throw new Error("src is dst???");
  }

  const metadata: Metadata = await sharp(src).metadata();
  const width: number = metadata.width || 1;
  const height: number = metadata.height || 1;

  const innerMask: Buffer = await sharp(src).extractChannel("alpha").toBuffer();

  // Need two steps to remove blurred alpha.
  const blurredOuterMask: Buffer = await sharp(src)
    .blur(OUTLINE_WIDTH)
    .flatten(true)
    .toColorspace("b-w")
    .toBuffer();
  const outerMask: Buffer = await sharp(blurredOuterMask)
    .threshold(1)
    .unflatten()
    .extractChannel("alpha")
    .toBuffer();

  const mask: Buffer = await sharp(outerMask)
    .composite([{ input: innerMask, blend: "add" }])
    .toBuffer();

  await sharp({
    create: {
      width,
      height,
      channels: 4,
      background: { r: 255, g: 0, b: 0, alpha: 255 },
    },
  })
    .composite([{ input: mask, blend: "multiply" }])
    .png()
    .toFile(dst);

  console.log(`Created: ${dst}`);
}

export async function outlineFeathered(pngFilename: string) {
  const src: string = pngFilename;
  const dst: string = pngFilename.replace(/.png$/, "-mask.png");
  if (src === dst) {
    throw new Error("src is dst???");
  }

  const metadata: Metadata = await sharp(src).metadata();
  const width: number = metadata.width || 1;
  const height: number = metadata.height || 1;

  // White ship, black background.
  const inner: Buffer = await sharp(src).extractChannel("alpha").toBuffer();

  // Black ship + outline, white outer background.
  // Need two steps to remove blurred alpha.
  const blurredInnerMask: Buffer = await sharp(inner)
    .blur(OUTLINE_WIDTH)
    .flatten(true)
    .toColorspace("b-w")
    .toBuffer();
  const outerMask: Buffer = await sharp(blurredInnerMask)
    .threshold(1)
    .unflatten()
    .extractChannel("alpha")
    .png()
    .toBuffer();
  const blurredOuter: Buffer = await sharp(outerMask)
    .blur(OUTLINE_WIDTH)
    .png()
    .toBuffer();

  const mask: Buffer = await sharp(blurredOuter)
    .composite([{ input: inner, blend: "add" }])
    .png()
    .toBuffer();

  await sharp({
    create: {
      width,
      height,
      channels: 4,
      background: { r: 255, g: 0, b: 0, alpha: 255 },
    },
  })
    .composite([{ input: mask, blend: "multiply" }])
    .png()
    .toFile(dst);

  console.log(`Created: ${dst}`);
}

export async function outlineFeatheredNoCenter(pngFilename: string) {
  const src: string = pngFilename;
  const dst: string = pngFilename.replace(/.png$/, "-mask-no-center.png");
  if (src === dst) {
    throw new Error("src is dst???");
  }

  const metadata: Metadata = await sharp(src).metadata();
  const width: number = metadata.width || 1;
  const height: number = metadata.height || 1;

  // White ship, black background.
  const inner: Buffer = await sharp(src).extractChannel("alpha").toBuffer();

  // Black ship + outline, white outer background.
  // Need two steps to remove blurred alpha.
  const blurredInnerMask: Buffer = await sharp(inner)
    .blur(OUTLINE_WIDTH)
    .flatten(true)
    .toColorspace("b-w")
    .toBuffer();
  const outerMask: Buffer = await sharp(blurredInnerMask)
    .threshold(1)
    .unflatten()
    .extractChannel("alpha")
    .png()
    .toBuffer();
  const blurredOuter: Buffer = await sharp(outerMask)
    .blur(OUTLINE_WIDTH)
    .png()
    .toBuffer();

  const mask: Buffer = await sharp(blurredOuter).png().toBuffer();

  await sharp({
    create: {
      width,
      height,
      channels: 4,
      background: { r: 255, g: 0, b: 0, alpha: 255 },
    },
  })
    .composite([{ input: mask, blend: "multiply" }])
    .png()
    .toFile(dst);

  console.log(`Created: ${dst}`);
}

export async function outlineOnly(pngFilename: string) {
  const src: string = pngFilename;
  const dst: string = pngFilename.replace(/.png$/, "-outline-only.png");
  if (src === dst) {
    throw new Error("src is dst???");
  }

  // White ship, black background.
  const inner: Buffer = await sharp(src).extractChannel("alpha").toBuffer();

  // White ship + outline, black outer background.
  // Need two steps to remove blurred alpha.
  const blurredInnerMask: Buffer = await sharp(inner)
    .blur(OUTLINE_WIDTH)
    .flatten(true)
    .toColorspace("b-w")
    .toBuffer();
  const outerMask: Buffer = await sharp(blurredInnerMask)
    .threshold(1)
    .unflatten()
    .negate()
    .extractChannel("alpha")
    .png()
    .toBuffer();

  await sharp(outerMask)
    .unflatten()
    .composite([{ input: pngFilename, blend: "multiply" }])
    .negate()
    .png()
    .toFile(dst);

  console.log(`Created: ${dst}`);
}

/**
 * Mask of just the inner image, no ouline.
 *
 * @param pngFilename
 */
export async function innerMask(pngFilename: string) {
  const src: string = pngFilename;
  const dst: string = pngFilename.replace(/.png$/, "-inner-mask.png");
  if (src === dst) {
    throw new Error("src is dst???");
  }

  const metadata: Metadata = await sharp(src).metadata();
  const width: number = metadata.width || 1;
  const height: number = metadata.height || 1;

  // White ship, black background.
  const inner: Buffer = await sharp(src)
    .extractChannel("alpha")
    .unflatten()
    .toBuffer();

  // Color
  await sharp({
    create: {
      width,
      height,
      channels: 4,
      background: { r: 255, g: 0, b: 0, alpha: 255 },
    },
  })
    .composite([{ input: inner, blend: "multiply" }])
    .png()
    .toFile(dst);

  console.log(`Created: ${dst}`);
}

export async function clipCircle(inFilename: string, pngFilename: string) {
  const src: string = inFilename;
  const dst: string = pngFilename;
  if (src === dst) {
    throw new Error("src is dst???");
  }

  const x: number = 16;
  const w: number = 256 - x * 2;
  const r: number = Math.floor(w / 2);
  const circle = Buffer.from(
    `<svg viewBox="0 0 256 256"><rect x="${x}" y="${x}" width="${w}" height="${w}" rx="${r}" ry="${r}"/></svg>`
  );

  // Clip circle (circle not to edge).
  await sharp(src)
    .png()
    .ensureAlpha(1)
    .composite([{ input: circle, blend: "dest-in" }])
    .toFile(dst);

  console.log(`Created: ${dst}`);
}
