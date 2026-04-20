import { writeFileSync } from "node:fs"
import { renderToStaticMarkup } from "react-dom/server"
import { Denik } from "../app/components/icons/denik"

const html = renderToStaticMarkup(Denik({ fill: "#5158F6" }) as any)
writeFileSync("public/images/denik-logo.svg", html)
console.log("wrote public/images/denik-logo.svg")
