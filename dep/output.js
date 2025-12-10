import { access, globalEnv } from "./lib.js";
import err from "./error.js";

const breaker = "\n";
export function output(input) {
   // console.log(JSON.stringify(input, null, 3));
   let apStr = "";
   function run(inp) {
      // console.log(
      //    "the input: {\n",
      //    inp.expr,
      //    "\n\n}..........................done",
      // );
      console.log(inp.expr);
      for (const exp of inp.expr) {
         switch (exp.type) {
            case "const_declaration":
               apStr += "const ";
               variable_declaration(exp);
               break;
            case "let_declaration":
               apStr += "let ";
               variable_declaration(exp);
               break;
            case "var_declaration":
               apStr += "var ";
               variable_declaration(exp);
               break;
            case "lin_declaration":
               apStr += "const ";
               variable_declaration(exp);
               break;
            case "function_declaration":
               apStr += "function ";
               fn_declaration(exp);
               break;
            case "return_statement":
               apStr += "return ";
               return_statement(exp);
               break;
            default:
               apStr += exp.value + " ";
            // console.error("got nothing here ", exp);
            // err(`output error on: ${exp}`);
         }
      }
   }
   // console.log(globalEnv);
   // console.log(apStr);
   run(input);
   return apStr;

   function return_statement(exp) {
      run(exp);
      apStr += "\n";
   }

   function variable_declaration(exp) {
      apStr += exp.name + " = ";
      if (exp.evaluated) {
         apStr += exp.evaluated;
      } else {
         if ("expr" in exp) {
            run(exp);
         } else {
            for (const tk in exp.expr) {
               apStr += tk.value + " ";
            }
         }
      }
      apStr += ";\n";
   }

   function fn_declaration(exp) {
      apStr += exp.name + "(" + exp.params.toString() + "){" + breaker;
      console.log("sompin hea    ", exp.expr);
      run(exp);
      apStr += "}";
      // for (const st of exp.expr) {
      //    if (st.type !== "EOF") {
      //       if (st.value) {
      //          apStr += st.value;
      //       } else {
      //          console.log("thie statement is: ", st);
      //          run(st);
      //       }
      //       // console.log(st);
      //       if (access.tokens[st.token_num]?.kind === "format") {
      //          apStr += access.tokens[st.token_num].value;
      //          continue;
      //       }
      //       // console.error("i dont know");
      //    }
      // }
      // apStr += "};\n";
   }
}

function let_declaration(exp) {
   apStr += exp.name + " = ";
   if (exp.evaluated) {
      apStr += exp.evaluated;
   }
   apStr += ";\n";
}

function var_declaration(exp) {
   apStr += exp.name + " = ";
   if (exp.evaluated) {
      apStr += exp.evaluated;
   }
   apStr += ";\n";
}

function lin_declaration(exp) {
   apStr += "const ";
   apStr += exp.name + " = ";
   if (exp.evaluated) {
      apStr += exp.evaluated;
   }
   apStr += ";  // this is a linear variable type\n";
}
