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

process.on("exit", (code) => {
   console.log(`Process is exiting with code ${code}`);
});

async function main() {
   const datastr = await Bun.file(Files.testFile()).text();
   const data = truncateInput(datastr);
   tokenize(data);
   await Bun.write(Files.outputText, JSON.stringify(access.tokens, null, 2));
   access.trunc = access.tokens.filter((thing) => thing.kind !== "format");
   await Bun.write(Files.outputTrunk, JSON.stringify(access.trunc, null, 2));
   let program = instanciateProgram(access.tokens, globalEnv);
   const out = output(program);
   const opt = outOpt(program);
   await Bun.write(Files.programFile, out);
   await Bun.write(Files.optimizedFile, opt);
   await Bun.write(Files.outputFile, JSON.stringify(program, null, 2));
}
// main();

async function start() {
   // const datastr = await Bun.file(Files.testFile()).text();
   const data = truncateInput(await Bun.file(Files.testFile()).text());
   console.log(data);
}

start();

function instanciateProgram(data, env) {
   return {
      type: "program",
      expr: parse(data, env),
   };
}
