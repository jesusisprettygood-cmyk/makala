import { cpSync, existsSync } from "node:fs"

if (existsSync("public")) {
  cpSync("public", "dist", { recursive: true, force: true })
}
