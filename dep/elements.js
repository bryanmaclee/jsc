import { elementTypes } from "./syntax.js";

const els = new Set(elementTypes.map((el) => el.elType));

export function buildElement(exp) {
   exp.pop();
   exp.shift();
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
