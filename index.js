import {
   truncateInput,
   Files,
   deps,
   preStringify,
   ditchWhite,
   access,
} from "./dep/lib";
import { tokenize } from "./dep/lexer";
import { Environment } from "./dep/env.js";
import { parse } from "./dep/parser.js";
import { output } from "./dep/output.js";

const globalEnv = Environment();

(async function () {
   const datastr = await Bun.file(Files.testFile()).text();
   const data = truncateInput(datastr);
   console.log(data);
   // const lexed = tokenize(data);
   tokenize(data);
   await Bun.write(Files.outputText, JSON.stringify(access.tokens, null, 2));
   // const woWhite = lexed.filter((thing) => thing.kind !== "format");
   access.trunc = access.tokens.filter((thing) => thing.kind !== "format");
   await Bun.write(Files.outputTrunk, JSON.stringify(access.trunc, null, 2));
   let program = instanciateProgram(access.tokens, globalEnv);
   // console.trace();
   // console.log(globalEnv);
   const out = output(program);
   await Bun.write(Files.programFile, out);
   // const progOut = preStringify(program);
   // typeChecker(program);
   await Bun.write(Files.outputFile, JSON.stringify(program, null, 2));
   // await Bun.write(Files.outputFile, JSON.stringify(progOut, null, 2));
})();

function instanciateProgram(data, env) {
   return {
      type: "program",
      // env: Environment(),
      expr: parse(data, env),
   };
}

function evaluate(expr, env) {
   for (const token of expr) {
      if (token.type === "word") {
         if (!env.Variables.has(token.value)) return expr;
      }
   }
   return expr;
}

// const worker = new Worker(new URL("./worker.js", import.meta.url));
// worker.postMessage("hello");
// console.log(worker.postMessage('msg'))
// process.on("worker", (worker) => {
//   console.log("New worker created:", worker.threadId);
// });
// worker.onmessage = (ev) => {
//   console.log(ev.data);
// };
// worker.addEventListener("open", () => {
//   console.log("worker is ready");
// });
