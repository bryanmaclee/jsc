import { elementTypes } from "./syntax.js";

const els = new Set(elementTypes.map((el) => el.elType));

export function buildElement(exp) {
   const shift = exp[0].value === "<" ? 1 : 0;
   const pop = exp[exp.length - 1].value === ">" ? -1 : undefined;
   exp = exp.slice(shift, pop);
   return {
      type: "element",
      kind: exp[0].value,
      expr: exp,
   };
}

export function defined_element_lable(token) {
   if (els.has(token.value)) {
      return true;
   } else {
      return false;
   }
}
