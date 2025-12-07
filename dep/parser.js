import { type_checker } from "./typechecker.js";
import { Environment } from "./env.js";
import { tokenize } from "./lexer.js";

const runTests = false;

const eof = {
   value: "EOF",
   length: 3,
   type: "EOF",
   kind: "EOF",
};

export function parse(tokens, environment) {
   // if (tokens.length < 8) console.log(tokens);
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
      tokens.pop();
      return tokens;
   }

   function eat(i = 1) {
      // console.log(tokens[iter]);
      while (tokens[iter].kind === "format") iter++;
      iter += i;
      return tokens[iter - 1];
   }

   function at() {
      while (tokens[iter].kind === "format") iter++;
      return tokens[iter];
   }

   function fig(token, env) {
      switch (token.type) {
         case "word":
            switch (token.kind) {
               case "keyword":
                  switch (token.value) {
                     case "function":
                        return define(func, token, env);
                     case "return":
                        if (env.Type === "function") {
                           return define(Return, token, env);
                        }
                     case "const":
                     case "let":
                     case "var":
                     case "lin":
                        return define(vars, token, env);
                     default:
                        console.error(
                           `keyword: < ${token.value} > has not been set up to parse`,
                        );
                        break;
                  }
                  if (env.Functions.has(token.value)) {
                     return define(fn_call, token, env);
                  }
               case "identifier":
                  if (env.Functions.has(token.value)) {
                     return define(fn_call, token, env);
                  }
                  // console.log("unknown context of identifier", token.value);
                  break;
            }
         default:
            // console.log("PARSER found unrecognized token: ", token.value);
            return false;
      }
   }

   function expect(thing) {
      if (at().value !== thing) {
         console.error(`expected ${thing}. got ${at()}.`);
         return false;
      }
      return eat();
   }

   function define(cb, token, env) {
      return cb(token, env);
   }

   function fn_call(token, env) {
      // console.log("in call", token);
      const tokenRange = [token.token_num];
      const fnName = token.value;
      const theFn = env.Functions.get(fnName);
      const fnEnv = theFn.environment;
      eat();
      let next = eat();
      // console.log(fnName, next.value);
      const args = [];
      while (next.type !== "close_paren") {
         if (args.length) {
            if (expect(",")) continue;
         }
         args.push(next.value);
         fnEnv.assignVar(fnEnv.params[args.length - 1], next.value);
         next = eat();
      }
      // console.log("function environment: ", fnEnv);
      // console.log("function expression: ", theFn.expr);
      theFn.expr.push(eof);
      const dille = parse(theFn.expr, fnEnv);
      // console.log("bar o: ", dille);
      // console.log("bar opera: ", theFn);
      const lol = parse(theFn.ret, fnEnv);
      if (lol.length === 1) return lol[0];
      // console.log(dille);
      // tokenRange.push(eat().tokenNum);
      // console.log(createFnEnv(theFn, args));
      // return {
      //    type: "func_call",
      //    name: fnName.value,
      //    evaluated: "ev",
      //    tokenRange: tokenRange,
      // };
   }

   function Return(token, env) {
      let next = eat();
      let scp = 1;
      const expr = [];
      while (next.value !== ";" && next.value !== "}" && scp !== 0) {
         expr.push(next);
         next = eat();
      }
      expr.push(eof);
      // console.trace();
      return passToBun(parse(expr, env), env);
   }

   function func(token, env) {
      const tokenRange = [token.token_num];
      let scp = 1;
      const stmt = [];
      const returnStmt = [];
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
      let retAt = 0;
      while (next.type !== "close_curly" && scp !== 0) {
         if (next.value === "}") scp--;
         else if (next.value === "{") scp++;
         if (next.value === "return") retAt = stmt.length;
         stmt.push(next);
         next = eat();
      }
      stmt.push(next);
      // console.error("i want this stmt");
      // console.log(stmt);
      const retStmt = stmt.splice(retAt, stmt.length - 1);
      // console.log(stmt, retStmt);
      stmt.push(eof);
      retStmt.push(eof);
      // console.log(stmt);
      const newEnv = Environment(env, fnName.value, "function");
      newEnv.params = [];
      // console.log("back into parse");
      for (const par of params) {
         newEnv.declareVar(par, "let");
         newEnv.params.push(par);
      }
      parse(stmt, newEnv);
      env.Children.push(newEnv);
      tokenRange.push(next.token_num);
      // console.log(stmt, retStmt);
      // console.log(stmt.toSpliced(retAt, 0, ...retStmt));
      env.assignFn(fnName.value, {
         environment: newEnv,
         params: params,
         expr: stmt,
         ret: retStmt,
      });
      return type_checker(
         {
            type: "function_declaration",
            name: fnName.value,
            params: params,
            tokenRange: tokenRange,
            expr: stmt.toSpliced(retAt, 0, ...retStmt),
         },
         env,
      );
   }

   function vars(token, env) {
      const tokenRange = [token.token_num];
      const varName = eat();
      eat();
      const stmt = [];
      let next = eat();
      while (
         next.type !== "semi_colon" &&
         next !== undefined &&
         next.kind !== "keyword" &&
         next.kind !== "EOF"
      ) {
         if (next.type === "word") {
            if (env.Functions.has(next.value)) {
               const callAr = [next];
               next = eat();
               while (next.value !== ")") {
                  callAr.push(next);
                  next = eat();
               }
               callAr.push(next);
               callAr.push(eof);
               const ans = parse(callAr, env)[0];
               stmt.push({
                  value: ans,
                  type: "number",
                  kind: "numeric_lit",
               });
               next = eat();
            }
         }
         stmt.push(next);
         next = eat();
      }
      stmt.push(eof);
      tokenRange.push(next.token_num);
      const toBun = passToBun(stmt, env);
      env.declareVar(varName.value, token.value);
      if (toBun) {
         env.assignVar(varName.value, toBun);
      } else {
         env.assignVar(varName.value, undefined);
      }
      // console.log(env);
      return type_checker(
         {
            type: `${token.value}_declaration`,
            name: varName.value,
            evaluated: toBun,
            tokenRange: tokenRange,
            // expr: pars,
         },
         env,
      );
   }

   function conditional(token, env) {
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
         if (next.value === "}") scp--;
         else if (next.value === "{") scp++;
         next = eat();
      }
      stmt.push(next);
      stmt.push({ type: "EOF" });
      const newEnv = Environment(env, fnName.value, "function");
      // console.log("back into parse");
      parse(stmt, newEnv);
      env.Children.push(newEnv);
      tokenRange.push(next.token_num);
      env.assignFn(fnName.value);
      return type_checker(
         {
            type: "function_declaration",
            name: fnName.value,
            params: params,
            tokenRange: tokenRange,
            expr: stmt,
         },
         env,
      );
   }
}

export function passToBun(tokens, env) {
   // console.log("bun is processing: ", tokens, env);
   let evalStr = "";
   for (const token of tokens) {
      // console.log(token.value);
      if (token.type !== "EOF") {
         if (token.kind === "identifier") {
            if (env.Variables.has(token.value)) {
               evalStr += env.getVar(token.value);
            } else {
               return false;
            }
         } else {
            evalStr += token.value;
         }
      }
   }
   // console.log(evalStr);
   let evaluation = eval(evalStr);
   if (typeof evaluation === "string") {
      evaluation = '"' + evaluation + '"';
   }
   return evaluation;
}
