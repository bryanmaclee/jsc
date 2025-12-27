import {
   truncateInput,
   Files,
   deps,
   preStringify,
   ditchWhite,
   access,
   globalEnv,
} from "./dep/lib.js";
import { tokenize } from "./dep/lexer.js";
import { Environment } from "./dep/env.js";
import { parse } from "./dep/parser.js";
import { output } from "./dep/output.js";
import { outOpt } from "./dep/outOpt.js";
import err from "./dep/error.js";
// import { startLogger } from "./dep/error.js";

// const run = async () => {
//    console.log("Application is running...");
//    // ... perform asynchronous operations ...
//    main();
//    // Exit the process with a success code
//    process.exit(0);
// };
//
// run().catch(console.error);

process.on("exit", (code) => {
   console.log(`Process is exiting with code ${code}`);
   // Perform synchronous cleanup here
   // lexer.terminate();
});

process.on("worker", (worker) => {
   console.log("worker made", worker.threadId);
});

// const lexer = new Worker("./par/lexer.js");

const lexer = new Worker("./par/lexer.js", {
   type: "module",
});
lexer.addEventListener("open", () => {
   main();
   // lexer.postMessage("hello lexer thread");
});

lexer.addEventListener("close", (ev) => {
   console.log("lexer is finished up");
});

// const lexer = new Worker("./workerThread.js");

lexer.onmessage = async (ev) => {
   await Bun.write("./out/sharedTokens.json", JSON.stringify(ev.data, null, 2));
   // access.tokens = ev.data;
   // console.log(lexer.threadId);
   // if (ev.data === "termMe") {
   //    lexer.terminate();
   // }
};
// process.exit();

async function main() {
   console.log("running main");
   const dataStr = await Bun.file(Files.testFile()).text();
   const data = truncateInput(dataStr);
   await lexer.postMessage(data);
   // const byts = await dataStr.arrayBuffer();
   // const sharedTokens = new SharedArrayBuffer(byts.byteLength);
   // const bytsViews = new Uint8Array(byts);
   // const stb = new Uint8Array(sharedTokens);
   // stb.set(bytsViews);
   // lexer.postMessage(stb);
   // console.log(access.tokens, "yo hoho");
   // const str = String.fromCharCode(...stb);
   // const data = truncateInput(access.tokens);
   // lexer.terminate();

   // let theStr = "";
   // theStr += String.fromCharCode(...byts);
   // console.log(theStr);
}

function continueStuff() {
   // const data = truncateInput(datastr);
   // console.log(data);
   // const lexed = tokenize(data);
   // tokenize(data);
   // await Bun.write(Files.outputText, JSON.stringify(access.tokens, null, 2));
   // // const woWhite = lexed.filter((thing) => thing.kind !== "format");
   // access.trunc = access.tokens.filter((thing) => thing.kind !== "format");
   // await Bun.write(Files.outputTrunk, JSON.stringify(access.trunc, null, 2));
   // let program = instanciateProgram(access.tokens, globalEnv);
   // // console.trace();k
   // const out = output(program);
   // const opt = outOpt(program);
   // // console.log(out);
   // await Bun.write(Files.programFile, out);
   // await Bun.write(Files.optimizedFile, opt);
   // // const progOut = preStringify(program);
   // // typeChecker(program);
   // await Bun.write(Files.outputFile, JSON.stringify(program, null, 2));
   // console.log(globalEnv);
   // await Bun.write(Files.outputFile, JSON.stringify(progOut, null, 2));
}

// main();

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
