import { languages } from "../src/core/i18n.js";
import { speechCatalog } from "../src/core/speech.js";
console.log(JSON.stringify(Object.fromEntries(languages.map(({code})=>[code,speechCatalog(code)]))));
