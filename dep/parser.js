import { tokenize } from "./lexer.js";
import { ditchWhite } from "./lib.js";

// const exp = ditchWhite(tokenize("10 + 4 / 2"));
// console.log("parsed: ", JSON.stringify(parser(exp.reverse())));
const runTests = false;

export function parse(tokens, environment) {
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

   function isEvalable(expr, op, env) {
      let lhs, rhs;
      if ((expr.lhs && expr.lhs.expr) || (expr.rhs && expr.rhs.expr)) {
         if (expr.lhs && expr.lhs.expr) {
            lhs = isEvalable(expr.lhs.expr, expr.lhs.op, env);
         } else {
            lhs = Number(expr.lhs);
            if (isNaN(lhs)) return false;
         }
         if (expr.rhs && expr.rhs.expr) {
            rhs = isEvalable(expr.rhs.expr, expr.rhs.op, env);
         } else {
            rhs = Number(expr.rhs);
            if (isNaN(rhs)) return false;
         }
      } else {
         rhs = Number(expr.rhs);
         lhs = Number(expr.lhs);
         if (isNaN(rhs) || isNaN(rhs)) {
            if (env.Variables.has(expr.lhs)) {
               lhs = env.Variables.get(expr.lhs);
            }
            if (env.Variables.has(expr.rhs)) {
               rhs = env.Variables.get(expr.rhs);
            }
         }
      }
      const evd = evaluateBinExp(lhs, rhs, op);
      return evd ? evd : false;
   }

   // function typeChecker

   function evaluateBinExp(lhs, rhs, op) {
      switch (op) {
         case "+":
            return lhs + rhs;
         case "-":
            return lhs - rhs;
         case "*":
            return lhs * rhs;
         case "/":
            return lhs / rhs;
         default:
            return false;
      }
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
      stmt.push({ type: "EOF" });
      tokenRange.push(next.token_num);
      const pars = parser(stmt.reverse());
      const evald = isEvalable(pars.expr, pars.op, env);
      if (evald) env.Variables.set(varName.value, evald);
      const returnObj = {
         type: "constant declaration",
         name: varName.value,
         evaluated: evald,
         tokenRange: tokenRange,
         expr: pars,
      };
      return returnObj;
   }

   function func(token) {
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
         lhs = { op: op.value, expr: { lhs: lhs, rhs: rhs } };
      }
      return lhs;
   }
   return parseExpr(tokens);
}
/*
18: grouping 	n/a 	Grouping
(x) 	[1]
17: access and call 	left-to-right 	Member access
x.y 	[2]
Optional chaining
x?.y
n/a 	Computed member access
x[y] 	[3]
new with argument list
new x(y) 	[4]
Function call
x(y)
import(x)
16: new 	n/a 	new without argument list
new x
15: postfix operators 	n/a 	Postfix increment
x++ 	[5]
Postfix decrement
x--
14: prefix operators 	n/a 	Prefix increment
++x 	[6]
Prefix decrement
--x
Logical NOT
!x
Bitwise NOT
~x
Unary plus
+x
Unary negation
-x
typeof x
void x
delete x 	[7]
await x
13: exponentiation 	right-to-left 	Exponentiation
x ** y 	[8]
12: multiplicative operators 	left-to-right 	Multiplication
x * y
Division
x / y
Remainder
x % y
11: additive operators 	left-to-right 	Addition
x + y
Subtraction
x - y
10: bitwise shift 	left-to-right 	Left shift
x << y
Right shift
x >> y
Unsigned right shift
x >>> y
9: relational operators 	left-to-right 	Less than
x < y
Less than or equal
x <= y
Greater than
x > y
Greater than or equal
x >= y
x in y
x instanceof y
8: equality operators 	left-to-right 	Equality
x == y
Inequality
x != y
Strict equality
x === y
Strict inequality
x !== y
7: bitwise AND 	left-to-right 	Bitwise AND
x & y
6: bitwise XOR 	left-to-right 	Bitwise XOR
x ^ y
5: bitwise OR 	left-to-right 	Bitwise OR
x | y
4: logical AND 	left-to-right 	Logical AND
x && y
3: logical OR, nullish coalescing 	left-to-right 	Logical OR
x || y
Nullish coalescing operator
x ?? y 	[9]
2: assignment and miscellaneous 	right-to-left 	Assignment
x = y 	[10]
Addition assignment
x += y
Subtraction assignment
x -= y
Exponentiation assignment
x **= y
Multiplication assignment
x *= y
Division assignment
x /= y
Remainder assignment
x %= y
Left shift assignment
x <<= y
Right shift assignment
x >>= y
Unsigned right shift assignment
x >>>= y
Bitwise AND assignment
x &= y
Bitwise XOR assignment
x ^= y
Bitwise OR assignment
x |= y
Logical AND assignment
x &&= y
Logical OR assignment
x ||= y
Nullish coalescing assignment
x ??= y
right-to-left 	Conditional (ternary) operator
x ? y : z 	[11]
right-to-left 	Arrow
x => y 	[12]
n/a 	yield x
yield* x
Spread
...x 	[13]
1: comma 	left-to-right 	Comma operator
x, y
*/
