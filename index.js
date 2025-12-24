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
});

async function main() {
   // await startLogger();
   // const datastr = await Bun.file(Files.testFile()).text();
   const dataStr = await Bun.file(Files.testFile());
   const byts = await dataStr.bytes();
   let theStr = "";
   // for (const al of byts) {
   //    theStr += String.fromCharCode(al);
   // }
   theStr += String.fromCharCode(...byts);
   console.log(theStr);
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
   // // console.trace();
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

main();

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
