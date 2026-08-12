import { mkdirSync } from "node:fs"
import sharp from "sharp"

const source = "src/assets/tafakuri-logo.png"
const outDir = "public"

mkdirSync(outDir, { recursive: true })

const cream = { r: 237, g: 233, b: 225, alpha: 1 }

await sharp(source)
  .resize(32, 32, { fit: "contain", background: cream })
  .png()
  .toFile(`${outDir}/favicon-32.png`)

await sharp(source)
  .resize(48, 48, { fit: "contain", background: cream })
  .png()
  .toFile(`${outDir}/favicon-48.png`)

await sharp(source)
  .resize(180, 180, { fit: "contain", background: cream })
  .png()
  .toFile(`${outDir}/apple-touch-icon.png`)

console.log("Generated favicon-32.png, favicon-48.png, apple-touch-icon.png")
