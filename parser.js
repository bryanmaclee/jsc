import { tokenize } from "./dep/lexer.js";
import { ditchWhite } from "./dep/lib.js";

// const exp = ditchWhite(tokenize("10 + 4 / 2"));
// console.log("parsed: ", JSON.stringify(parser(exp.reverse())));
const runTests = false;

export function parse(tokens, environment) {
   let iter = 0;
   const statements = [];
   let token = eat();
   while (token && token.type !== "EOF") {
      const stmt = fig(token, environment);
      if (stmt) statements.push(stmt);
      token = eat();
   }
   if (statements.length) {
      return statements;
   } else {
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

   function isEvalable(expr) {}

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
      stmt.push({ type: "EOF" });
      tokenRange.push(next.token_num);
      const pars = parser(stmt.reverse());
      const returnObj = {
         type: "constant declaration",
         name: varName.value,
         evaluated: false,
         tokenRange: tokenRange,
         expr: pars,
      };
      return typeChecker(returnObj, env);
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
         expr: stmt,
      };
   }
}

export function parser(tokens) {
   let pos = 0;

   function peak() {
      return tokens[tokens.length - 1];
   }

   function next() {
      return tokens.pop();
   }

   const precedence = {
      "+": [10, 11],
      "-": [10, 11],
      "*": [20, 21],
      "/": [20, 21],
      "%": [20, 21],
   };

   function parseExpr(tkns, mbp = 0) {
      // console.log(tkns);
      let lhs = next().value;
      // console.log("left: ", lhs);
      if (lhs === "(") {
         lhs = parseExpr(tkns);
         next();
      }
      while (true) {
         // console.log("left: ", lhs, "\npeak: ", peak().value);
         let op = peak();
         // console.log(op);
         if (op.type === "EOF" || op.value === ")") break;
         const [lbp, rbp] = precedence[op.value];
         if (lbp < mbp) break;
         next();
         // console.log("lets recur shall we");
         let rhs = parseExpr(tkns, rbp);
         lhs = { operation: op.value, expr: { lhs: lhs, rhs: rhs } };
      }
      return lhs;
   }
   return parseExpr(tokens);
}

function typeChecker(program, env) {
   for (const stmt of program.expr) {
      console.log(stmt);
      if (stmt.type === "constant declaration") {
         if (stmt.evaluated) {
            env.types.set(stmt.name, typeof stmt.evaluated);
         }
      }
   }
   console.log(env);
}
