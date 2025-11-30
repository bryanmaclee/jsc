import { truncateInput, Files, deps, preStringify } from "./dep/lib";
import { tokenize } from "./dep/lexer";
import { Environment } from "./dep/env.js";
// import { Scope } from "./dep/scope.js";
// import { evaluateExpr } from "./dep/eval.js";

const access = {
   vars: {},
   lets: {},
   consts: {},
   funcs: {},
   lins: {},
   tmp: null,
   lineage: ["global"],
};

(async function () {
   const datastr = await Bun.file(Files.testFile()).text();
   const data = truncateInput(datastr);
   console.log(data);
   const lexed = tokenize(data);
   await Bun.write(Files.outputText, JSON.stringify(lexed, null, 2));
   const woWhite = lexed.filter((thing) => thing.kind !== "format");
   await Bun.write(Files.outputTrunk, JSON.stringify(woWhite, null, 2));
   // const env = Environment();
   let program = instanciateProgram(woWhite);
   // const progOut = preStringify(program);
   await Bun.write(Files.outputFile, JSON.stringify(program, null, 2));
   // await Bun.write(Files.outputFile, JSON.stringify(progOut, null, 2));
})();

function instanciateProgram(data) {
   return {
      type: "program",
      // env: Environment(),
      expression: parse(data),
   };
}

function parse(tokens) {
   let iter = 0;
   const statements = [];
   let token = eat();
   // console.log(token);

   // console.log("new tokens loaded: ");

   while (token && token.type !== "EOF") {
      const stmt = fig(token);
      if (stmt) statements.push(stmt);
      token = eat();
   }

   // if (tokens.length) tokens.forEach((token) => console.log(token.value));

   // if (!statements.length && tokens) return tokens;
   // return parse(statements);
   if (statements.length) {
      return statements;
   } else {
      return evaluate(tokens);
   }

   function eat(i = 1) {
      iter += i;
      return tokens[iter - 1];
   }

   function at() {
      return tokens[iter];
   }

   function fig(token) {
      switch (token.type) {
         case "word":
            switch (token.kind) {
               case "keyword":
                  switch (token.value) {
                     case "function":
                        return define(func, token);
                     case "const":
                        return define(constVar, token);
                     case "let":
                        return define(letVar, token);
                     default:
                        break;
                  }
               // case "identifier":
               //   if (environment.Variables.has(token.value)) {
               //     console.log("this is a var");
               //   }
               //
               //   break;
            }
         default:
            return false;
      }
   }

   function define(cb, token) {
      return cb(token);
   }

   function letVar(token) {
      return token;
   }

   function constVar(token) {
      const tokenRange = [token.token_num];
      // let scp = 1;
      const varName = eat();
      // const v = 1;
      eat();
      const stmt = [];
      let next = eat();
      while (
         next.type !== "semi_colon" &&
         next !== undefined &&
         next.kind !== "keyword" &&
         next.kind !== "EOF"
      ) {
         stmt.push(next);
         next = eat();
      }
      // console.log(stmt);
      tokenRange.push(next.token_num);
      return {
         type: "constant declaration",
         name: varName.value,
         evaluated: false,
         tokenRange: tokenRange,
         statement: parse(stmt),
      };
   }

   function func(token) {
      // console.log(token)
      const tokenRange = [token.token_num];
      let scp = 1;
      const stmt = [];
      const fnName = eat();
      eat();
      let next = eat();
      const params = [];
      while (next.type !== "close_paren") {
         params.push(next.value);
         next = eat();
      }
      eat();
      next = eat();
      while (next.type !== "close_curly" && scp !== 0) {
         // console.log("in da loop", next.value);
         stmt.push(next);
         next = eat();
      }
      tokenRange.push(next.token_num);

      return {
         type: "function declaration",
         name: fnName.value,
         params: params,
         tokenRange: tokenRange,
         expression: stmt,
      };
   }
}

function evaluate(expr, env) {
   for (const token of expr) {
      if (token.type === "word") {
         if (!env.variables.has(token.value)) return expr;
      }
      console.log(token);
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
