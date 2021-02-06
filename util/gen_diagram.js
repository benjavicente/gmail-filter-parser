import "https://unpkg.com/chevrotain@7.1.1/lib/chevrotain.js";
import { parserInstance } from "../src/parser.js";

const result = parserInstance.getSerializedGastProductions();
const html = chevrotain.createSyntaxDiagramsCode(result);
Deno.writeTextFileSync("docs/diagram.html", html);
