import { type_checker } from "./typechecker.js";
import { Environment } from "./env.js";
import { tokenize } from "./lexer.js";
import { globalEnv } from "./lib.js";
import err from "./error.js";
import { defined_element_lable, buildElement } from "./elements.js";

const runTests = false;

const eof = {
   value: "EOF",
   length: 3,
   type: "EOF",
   kind: "EOF",
};

export function parse(tokens, log = false) {
   // if (log) console.log(tokens);
   let scope = 0;
   let outStr = "";
   for (const token of tokens) {
      outStr += token.value;
   }
   let iter = 0;
   const statements = [];
   let token = eat();
   const unhandledTokens = [];
   while (token && token?.type !== "EOF") {
      const stmt = fig(token);
      if (stmt) {
         statements.push(stmt);
      } else {
         statements.push(token);
      }
      token = eat();
   }

   if (statements.length) {
      return statements;
   } else {
      if (tokens.at(-1).type === "EOF") tokens.pop();
      return tokens;
   }

   function eat(i = 1) {
      while (tokens[iter]?.kind === "format") iter++;
      iter += i;
      return tokens[iter - 1];
   }

   function at(i = 0) {
      while (tokens[iter]?.kind === "format") iter++;
      return tokens[iter + i];
   }

   function fig(token) {
      switch (token.type) {
         case "word":
            switch (token.kind) {
               case "keyword":
                  switch (token.value) {
                     case "function":
                        return define(func, token);
                     case "return":
                        return define(Return, token);
                     case "const":
                     case "let":
                     case "var":
                     case "lin":
                        return define(vars, token);
                     case "if":
                     case "while":
                     case "for":
                        return define(conditional, token);
                     default:
                        break;
                  }
               case "identifier":
                  if (at().value === "(") {
                     return define(fn_call, token);
                  }
                  break;
            }
         case "white_space":
         case "new_line":
         case "string":
         case "operator":
            switch (token.kind) {
               case "less_than":
                  if (defined_element_lable(at())) {
                     const elAr = [token, eat()];
                     let next = eat();
                     while (next.value !== ">") {
                        elAr.push(next);
                        next = eat();
                     }
                     elAr.push(next);
                     console.log(buildElement(elAr));
                     return buildElement(elAr);
                  }
                  break;
            }
            break;
         default:
            console.log("PARSER found unrecognized token: ", token.value);
            return false;
      }
   }

   // function element(token){

   function expect(thing) {
      // console.log(thing);
      if (at().value !== thing) {
         console.error(
            `expected ${thing}. got ${at().value} at line ${at().line} col ${at().start_col}.`,
         );
         return false;
      }
      return eat();
   }

   function define(cb, token, env) {
      const tokenRange = [token.token_num];
      const k = cb(token, env);
      let temp = k.expr;
      return k;
   }

   function fn_call(token, env) {
      const tokenRange = [token.token_num];
      const callerName = token.value;
      eat();
      let next = eat();
      const args = [];
      while (next.kind !== "close_paren") {
         if (args.length) {
            if (expect(",")) continue;
         }
         args.push(next.value);
         next = eat();
      }
      return {
         type: "func_call",
         name: callerName,
         args: args,
      };
   }

   function func(token, env) {
      const tokenRange = [token.token_num];
      let scp = 0;
      const stmt = [];
      const fnName = eat();
      eat();
      let next = eat();
      const params = [];
      while (next.kind !== "close_paren") {
         params.push(next.value);
         next = eat();
      }
      let first = true;
      while (scp !== 0 || first) {
         first = false;
         next = eat();
         if (next.value === "}") {
            scope--;
            scp--;
            if (scp !== 0) stmt.push(next);
         } else if (next.value === "{") {
            if (scp !== 0) stmt.push(next);
            scope++;
            scp++;
         } else {
            stmt.push(next);
         }
      }
      tokenRange.push(next.token_num);
      return {
         type: "function_declaration",
         scope: scope,
         name: fnName.value,
         params: params,
         tokenRange: tokenRange,
         expr: parse(stmt),
      };
   }

   function vars(token, env) {
      const varName = eat().value;
      eat();
      let stmt = [];
      let next = eat();
      let pScp = 0;
      let bScp = 0;
      while (
         (next !== undefined &&
            next.kind !== "semi_colon" &&
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
         stmt.push(next);
         next = eat();
      }
      stmt.push(eof);
      stmt = parse(stmt, env);
      return {
         type: `${token.value}_declaration`,
         name: varName,
         expr: parse(stmt, env),
      };
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
      const parsed = parse(expr, env, true);
      return {
         type: "return_statement",
         expr: parsed,
      };
   }

   function conditional(token, env) {
      const tokenRange = [token.token_num];
      let scp = 1;
      const loop =
         token.value === "while" || token.value === "for" ? true : false;
      const stmt = [];
      eat();
      let next = eat();
      let condition = "";
      while (next.kind !== "close_paren") {
         condition += next.value + " ";
         next = eat();
      }
      condition = condition.substring(0, condition.length - 1);
      eat();
      while (scp !== 0) {
         next = eat();
         stmt.push(next);
         if (next.value === "}") scp--;
         else if (next.value === "{") scp++;
         next = at();
      }
      stmt.push(next);
      stmt.push({ type: "EOF" });
      // const newEnv = Environment(env, "anonymous", "conditional");
      parse(stmt);
      // env.Children.push(newEnv);
      tokenRange.push(next.token_num);
      return type_checker(
         {
            type: "conditional_statement",
            value: token.value,
            loop: loop,
            condition: condition,
            tokenRange: tokenRange,
            expr: stmt,
         },
         // env,
      );
   }

   function accessibleFuncs(qry, env) {
      if (env.Functions.has(qry)) return env.Functions.get(qry);
      if (env.params?.includes(qry)) return false;
      let parent = globalEnv;
      let is_set = false;
      let set_val = 0;
      const linCpy = [...env.Lineage];
      for (const ancestor of linCpy) {
         if (parent.Functions.has(qry)) {
            set_val = parent.Functions.get(qry);
            is_set = true;
         }
         parent = parent.Children[ancestor];
      }
      const lin = env.Lineage;
      if (is_set) return set_val;
      const erStr = `function ${qry} dose not exist`;
      // console.trace();
      err(erStr, 1);
      return false;
   }

   function accessibleVars(qry, env) {
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
      const lin = env.Lineage;
      if (is_set) return set_val;
      const erStr = `variable ${qry} dose not exist`;
      err(erStr, 1);
      return false;
   }

   function passToBun(tokens, env) {
      // console.log("bun is processing: ", tokens);
      let evalStr = "";
      for (const token of tokens) {
         if (token.type !== "EOF") {
            if (token.type === "func_call") {
               if (token.evaluated) {
                  evalStr += token.evaluated;
               }
            } else if (token.kind === "identifier") {
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
}
