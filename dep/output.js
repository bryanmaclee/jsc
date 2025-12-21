import { access, globalEnv } from "./lib.js";
import err from "./error.js";

const breaker = "\n";
export function output(input) {
   let apStr = "";
   const anon = elId();
   function run(inp) {
      for (const exp of inp.expr) {
         switch (exp.type) {
            case "const_declaration":
               apStr += "const ";
               variable_declaration(exp);
               apStr += ";\n";
               break;
            case "let_declaration":
               apStr += "let ";
               variable_declaration(exp);
               apStr += ";\n";
               break;
            case "var_declaration":
               apStr += "var ";
               variable_declaration(exp);
               apStr += ";\n";
               break;
            case "lin_declaration":
               apStr += "const ";
               variable_declaration(exp);
               apStr += ";  // this is a linear variable type\n";
               break;
            case "function_declaration":
               apStr += "function ";
               fn_declaration(exp);
               break;
            case "return_statement":
               // console.log(exp.type);
               apStr += "return ";
               return_statement(exp);
               break;
            case "conditional_statement":
               conditional_statement(exp);
               break;
            case "func_call":
               func_call(exp);
               break;
            case "element":
               element(exp);
               break;
            case "group":
               group(exp);
               break;
            case "EOF":
               break;
            default:
               apStr += exp.value + " ";
         }
      }
   }

   run(input);
   return apStr;

   function group(exp) {
      run(exp);
   }

   function element(exp) {
      // console.log(exp);
      apStr += `${anon.next(exp.kind).value} = document.createElement("${exp.kind}");\n`;
   }

   function func_call(exp) {
      apStr += exp.name + "(";
      for (const arg of exp.args) {
         apStr += arg + ",";
      }
      apStr = apStr.slice(0, apStr.length - 1);
      apStr += ")";
   }

   function return_statement(exp) {
      run(exp);
      apStr += ";\n";
   }

   function variable_declaration(exp) {
      apStr += exp.name + " = ";
      if ("expr" in exp) {
         run(exp);
      } else {
         console.log("variable_declaration: what was i thinking?");
         for (const tk in exp.expr) {
            apStr += tk.value + " ";
         }
      }
   }

   function conditional_statement(exp) {
      apStr += exp.value + " (" + exp.condition + "){\n";
      if ("expr" in exp) run(exp);
   }

   function fn_declaration(exp) {
      apStr += exp.name + "(" + exp.params.toString() + "){" + breaker;
      run(exp);
      apStr += "}\n";
   }
}

function* elId(type) {
   let id = 0;
   while (1) {
      yield `${type}${id++}`;
   }
}
