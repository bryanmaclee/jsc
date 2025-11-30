import { deps } from "./lib.js";
const operators = ["*", "/", "+", "-"];

export function evaluateExpr(tokens, env) {
  let iter = 0;
  let exit = false;
  const statements = [];
  if (tokens.at(-1).type === 'semi_colon')tokens.pop();

  function eat(i = 1) {
    iter += i;
    return tokens[iter - i];
  }

  function at(i = 0) {
    return tokens[iter + i];
  }

  for (const operator of operators) {
    iter = 0;
    while (at()) {
      if (at().value === operator) {
        let preAtom = at(-1);
        let postAtom = at(1);
        const thisOp = at();
        if (preAtom.type === "word") {
          if (env.Variables.has(preAtom.value)) {
            deps.push(preAtom.value);
            preAtom = { value: env.Variables.get(preAtom.value) };
          } else {
            if (env.part === "fn_dec") {
              // return;
              eat();
              continue
            } else {
              throw `${preAtom.value} is undefined!!!`;
            }
          }
        } else if (preAtom.type === "number") {
        }
        if (!preAtom) preAtom = { value: 0 };
        if (!postAtom) postAtom = { value: 0 };
        const part = evaluatePart(
          parseFloat(preAtom.value),
          parseFloat(postAtom.value),
          thisOp.value
        );
        tokens.splice(iter - 1, 3, part);
        if (tokens.length === 1) {
          return part;
        }
      } else {
        eat();
      }
    }
  }
  function evaluatePart(pre, post, op) {
    switch (op) {
      case "*":
        return { value: pre * post };
      case "/":
        return { value: pre / post };
      case "+":
        return { value: pre + post };
      case "-":
        return { value: pre - post };
    }
  }
}
