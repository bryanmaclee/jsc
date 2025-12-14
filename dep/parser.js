import { type_checker } from "./typechecker.js";
import { Environment } from "./env.js";
import { tokenize } from "./lexer.js";
import { globalEnv } from "./lib.js";
import err from "./error.js";

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
   const unhandledTokens = [];

   // console.log("function func: ", tokens.length);
   while (token && token?.type !== "EOF") {
      const stmt = fig(token, environment);
      if (stmt) statements.push(stmt);
      if (!stmt && statements.length) {
         // unhandledTokens.push(token);
         statements.push(token);
      }
      token = eat();
   }

   if (statements.length) {
      // console.log(iter, tokens.length);
      // for (const ut of unhandledTokens) {
      //    statements.push(ut);
      // }
      return statements;
   } else {
      if (tokens.at(-1).type === "EOF") tokens.pop();
      return tokens;
   }

   function eat(i = 1) {
      // console.log(tokens[iter]);
      while (tokens[iter]?.kind === "format") iter++;
      iter += i;
      return tokens[iter - 1];
   }

   function at() {
      while (tokens[iter]?.kind === "format") iter++;
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
                           console.log(env);
                           return define(Return, token, env);
                        }
                     case "const":
                     case "let":
                     case "var":
                     case "lin":
                        // console.log("main switch var types: ", token.value);
                        return define(vars, token, env);
                     default:
                        // console.error(
                        //    `keyword: < ${token.value} > has not been set up to parse`,
                        // );
                        break;
                  }
                  if (env.Functions.has(token.value)) {
                     return define(fn_call, token, env);
                  }
               case "identifier":
                  // console.log(env.Functions);
                  if (at().value === "(") {
                     // console.log(env);
                     // if (!env.Functions.has(token.value)) {
                     //
                     //    err(
                     //       `function ${token.value} does not exist or is unaccessible`,
                     //    );
                     // }
                     // console.log("ksldjfklsjdfksjdklfjklsdjfkljsdklj");
                     return define(fn_call, token, env);
                  }
                  // console.log(globalEnv);
                  // console.log(env);
                  // console.log(
                  //    "this is in the main switch: ",
                  //    token.value,
                  //    accessibleVars(token.value, env),
                  // );
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
      // console.log("defining... ", cb);
      const tokenRange = [token.token_num];
      const k = cb(token, env);
      let temp = k.expr;
      // if (!k?.expr?.at(-1)?.token_num) {
      //    while ("expr" in temp) {
      //       // console.log("temp: ", temp);
      //       temp = temp.expr;
      //    }
      //    while (temp.length) temp = temp.at(-1);
      //    tokenRange.push(temp.expr.at(-1).token_num);
      // } else {
      //    tokenRange.push(k.expr.at(-1).token_num);
      // }
      // k.tokenRange = tokenRange;
      return k;
   }

   function fn_call(token, env) {
      const tokenRange = [token.token_num];
      const callerName = token.value;
      // const theFn = env.Functions.get(callerName);

      const theFn = accessibleFuncs(token.value, env);
      // console.log(theFn);
      const fnEnv = theFn.environment;
      fnEnv.Variables.clear();
      fnEnv.UnUtilizedVars.clear();
      fnEnv.Constants.clear();
      eat();
      let next = eat();
      const args = [];
      while (next.type !== "close_paren") {
         if (args.length) {
            if (expect(",")) continue;
         }
         args.push(next.value);
         fnEnv.assignVar(fnEnv.params[args.length - 1], next.value);
         next = eat();
      }
      // console.log(at(), iter, tokens.length);
      // for (const v of fnEnv.Constants) {
      //    fnEnv.Variables.delete(v);
      //    fnEnv.UnUtilizedVars.delete(v);
      //    fnEnv.Constants.delete(v);
      // }
      // console.log(theFn.expr);
      const ev = parse(theFn.expr, fnEnv);
      // console.log(ev);
      const returnEval = ev.filter((part) => part.type === "return_statement");
      return {
         type: "func_call",
         name: callerName,
         args: args,
         evaluated: returnEval[0].evaluated,
         fnRef: theFn.environment.Name,
         fnLin: theFn.environment.Lineage,
         // tokenRange: tokenRange,
      };
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
         if (next.value === "return" && scp === "}") retAt = stmt.length;
         stmt.push(next);
         next = eat();
      }
      stmt.push(next);
      // const retStmt = stmt.splice(retAt, stmt.length - 1);
      // stmt.push(eof);
      // retStmt.push(eof);
      const newEnv = Environment(env, fnName.value, "function");
      newEnv.params = [];
      for (const par of params) {
         newEnv.declareVar(par, "let");
         newEnv.params.push(par);
      }
      env.Children.push(newEnv);
      tokenRange.push(next.token_num);
      // console.log("the func is onnnnnnnnnnnnnnnnnn");
      env.assignFn(fnName.value, {
         environment: newEnv,
         params: params,
         expr: stmt,
         // ret: retStmt,
      });
      // console.log(env.Functions);
      return {
         type: "function_declaration",
         name: fnName.value,
         params: params,
         tokenRange: tokenRange,
         // expr: parse(stmt.toSpliced(retAt, 0, ...retStmt), newEnv),
         expr: parse(stmt, newEnv),
         // expr: stmt,
      };
   }

   function vars(token, env) {
      const varName = eat().value;
      // console.log("this is in the vars function: ", varName);
      eat();
      let stmt = [];
      let next = eat();
      let pScp = 0;
      let bScp = 0;
      while (
         (next !== undefined &&
            next.type !== "semi_colon" &&
            next.kind !== "EOF") ||
         bScp !== 0 ||
         pScp !== 0
      ) {
         switch (next.value) {
            case "(":
               pScp++;
               break;
            case ")":
               pScp--;
               break;
            case "{":
               bScp++;
               break;
            case "}":
               bScp--;
               break;
         }
         // if (next.type === "word") {
         //    if (env.Functions.has(next.value)) {
         //       const callAr = [next];
         //       next = eat();
         //       while (next.value !== ")") {
         //          if (next.value !== ",") callAr.push(next);
         //          next = eat();
         //       }
         //       callAr.push(next);
         //       callAr.push(eof);
         //       console.log(callAr);
         //       const ans = parse(callAr, env)[0];
         //       stmt.push({
         //          value: ans,
         //          type: "number",
         //          kind: "numeric_lit",
         //       });
         //       next = eat();
         //    }
         // }
         stmt.push(next);
         next = eat();
      }
      // console.log(stmt);
      stmt.push(eof);
      env.declareVar(varName, token.value);
      // console.log(stmt);
      stmt = parse(stmt, env);
      // console.log(stmt);
      const toBun = passToBun(stmt, env);
      if (toBun) {
         env.assignVar(varName, toBun, token.value);
      } else {
         env.assignVar(varName, undefined, token.value);
      }
      return {
         type: `${token.value}_declaration`,
         name: varName,
         evaluated: toBun,
         expr: parse(stmt, env),
      };
   }

   function Return(token, env) {
      console.log(env);
      let next = eat();
      let scp = 1;
      const expr = [];
      while (next.value !== ";" && next.value !== "}" && scp !== 0) {
         expr.push(next);
         next = eat();
      }
      expr.push(eof);
      const parsed = parse(expr, env);
      // return passToBun(parse(expr, env), env);
      // console.log(parsed);
      return {
         type: "return_statement",
         evaluated: passToBun(parsed, env),
         expr: parsed,
      };
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

function accessibleFuncs(qry, env) {
   // console.log("this is in accessibleVars: ", qry);
   if (env.Functions.has(qry)) return env.getVar(qry);
   if (env.params?.includes(qry)) return false;
   let parent = globalEnv;
   let is_set = false;
   let set_val = 0;
   const linCpy = [...env.Lineage];
   // console.log(linCpy, env);
   for (const ancestor of linCpy) {
      // console.log(parent.Functions);
      if (parent.Functions.has(qry)) {
         set_val = parent.Functions.get(qry);
         is_set = true;
      }
      parent = parent.Children[ancestor];
   }
   // console.log(env);
   const lin = env.Lineage;
   if (is_set) return set_val;
   // console.log(env, qry);
   const erStr = `function ${qry} dose not exist`;
   err(erStr, 1);
   return false;
}

function accessibleVars(qry, env) {
   // console.log("this is in accessibleVars: ", qry);
   if (env.Variables.has(qry)) return env.getVar(qry);
   if (env.params?.includes(qry)) return false;
   let parent = globalEnv;
   let is_set = false;
   let set_val = 0;
   const linCpy = [...env.Lineage];
   for (const ancestor of linCpy) {
      if (parent.Variables.has(qry)) {
         set_val = parent.getVar(qry);
         is_set = true;
      }
      parent = parent.Children[ancestor];
   }
   // console.log(env);
   const lin = env.Lineage;
   if (is_set) return set_val;
   const erStr = `variable ${qry} dose not exist`;
   err(erStr, 1);
   return false;
}

export function passToBun(tokens, env) {
   // console.log("bun is processing: ", tokens);
   let evalStr = "";
   for (const token of tokens) {
      // console.log(token.value);
      // console.log(token);
      if (token.type !== "EOF") {
         if (token.type === "func_call") {
            if (token.evaluated) {
               evalStr += token.evaluated;
            }
         } else if (token.kind === "identifier") {
            // if (env.Functions.has(token.value)) {
            //    if (token.evaluated) {
            //       console.log(token.evaluated);
            //    }
            // }
            if (env.Variables.has(token.value)) {
               evalStr += env.getVar(token.value);
            } else {
               accessibleVars(token.value, env);
               return false;
            }
         } else {
            evalStr += token.value;
         }
      }
   }
   // console.log("BUN says", evalStr);
   let evaluation = eval(evalStr);
   // console.log(evaluation);
   if (typeof evaluation === "string") {
      evaluation = '"' + evaluation + '"';
   }
   return evaluation;
}
