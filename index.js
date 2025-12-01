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
   const env = Environment();
   let program = instanciateProgram(woWhite, env);
   // const progOut = preStringify(program);
   await Bun.write(Files.outputFile, JSON.stringify(program, null, 2));
   // await Bun.write(Files.outputFile, JSON.stringify(progOut, null, 2));
})();

function instanciateProgram(data, env) {
   return {
      type: "program",
      // env: Environment(),
      expression: parse(data, env),
   };
}

function parse(tokens, environment) {
   let iter = 0;
   const statements = [];
   let token = eat();
   // console.log(token);

   // console.log("new tokens loaded: ");

   while (token && token.type !== "EOF") {
      const stmt = fig(token, environment);
      if (stmt) statements.push(stmt);
      token = eat();
   }

   // if (tokens.length) tokens.forEach((token) => console.log(token.value));

   // if (!statements.length && tokens) return tokens;
   // return parse(statements);
   if (statements.length) {
      return statements;
   } else {
      // const evaluatedTokens = evaluate(tokens, environment);
      // if (evaluatedTokens) {
      //    return evaluatedTokens;
      // }
      console.log(tokens.length);
      return tokens;
   }

   function eat(i = 1) {
      iter += i;
      return tokens[iter - 1];
   }

   function at() {
      return tokens[iter];
   }

   function fig(token, env) {
      switch (token.type) {
         case "word":
            switch (token.kind) {
               case "keyword":
                  switch (token.value) {
                     case "function":
                        return define(func, token);
                     case "const":
                        return define(constVar, token, env);
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

   function define(cb, token, env) {
      return cb(token, env);
   }

   function letVar(token) {
      return token;
   }

   function constVar(token, env) {
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
      stmt.push({ type: "(eof)" });
      // console.log(stmt);
      tokenRange.push(next.token_num);
      // console.log(JSON.stringify(Parser(parse(stmt, env)), null, 2));
      // console.log(JSON.stringify(parse(stmt, env)), null, 2);
      // console.log("the statement is: ", stmt);
      const pars = Parser(parse(stmt, env));
      // console.log(JSON.stringify(pars, null, 2));
      // console.log(JSON.stringify(pars.prse(), null, 2));
      const returnObj = {
         type: "constant declaration",
         name: varName.value,
         evaluated: false,
         tokenRange: tokenRange,
         // expression: Parser(parse(stmt, env)),
         expression: pars.prse(),
      };
      console.log(returnObj);
      // const evtd = evaluate(returnObj, env)
      return returnObj;
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
   // console.log(expr, env);
   for (const token of expr) {
      if (token.type === "word") {
         if (!env.Variables.has(token.value)) return expr;
      }
      // console.log(token);
   }

   return expr;
}

function Parser(tokens) {
   // console.log(tokens);
   let pos = 0;

   function peek() {
      return tokens[pos];
   }

   function next() {
      return tokens[pos++];
   }

   // Precedence table
   const PRECEDENCE = {
      "+": 10,
      "-": 10,
      "*": 20,
      "/": 20,
   };

   // null denotation (prefix or atom)
   function nud(token) {
      // if (/^[0-9]+$/.test(token.type)) {
      //   return { type: "Literal", value: Number(token.value) };
      // }
      console.log(token);

      if (token.type === "number") {
         return { type: "Literal", value: Number(token.value) };
      }

      if (token.type === "word") {
         return { type: "var", value: token.value };
      }

      if (token.value === "(") {
         const expr = expression(0);
         if (peek().type !== ")") throw "Expected ')'";
         next(); // consume ')'
         return expr;
      }

      if (token.value === "-") {
         // unary prefix
         const right = expression(100);
         return { type: "UnaryExpression", operator: "-", argument: right };
      }

      throw "Unexpected token in nud(): " + token.type;
   }

   // left denotation (infix)
   function led(left, token) {
      if (["+", "-", "*", "/"].includes(token.value)) {
         const right = expression(PRECEDENCE[token.value]);
         return {
            type: "BinaryExpression",
            operator: token.value,
            left,
            right,
         };
      }

      throw "Unexpected token in led(): " + token.type;
   }

   // core Pratt function
   function expression(rbp) {
      let t = next();
      let left = nud(t);

      while (rbp < lbp(peek())) {
         t = next();
         left = led(left, t);
      }

      return left;
   }

   function lbp(token) {
      // console.log(token);
      return PRECEDENCE[token.value] || 0;
   }

   return {
      prse() {
         return expression(0);
      },
   };
}

// ----------------------
// Example
// ----------------------
const input = "1 + 2 * (3 - 4) / 2";
const tokens = tokenize(input);

// console.log(tokens);
const parser = Parser(tokens.filter((thing) => thing.kind !== "format"));
console.log(JSON.stringify(parser, null, 2));
console.log(JSON.stringify(parser.prse(), null, 2));

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
