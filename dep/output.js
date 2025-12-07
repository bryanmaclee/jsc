import { access } from "./lib.js";

let apStr = "";
const breaker = "\n";
export function output(input) {
   // console.log(input);
   for (const exp of input.expr) {
      switch (exp.type) {
         case "const_declaration":
            const_declaration(exp);
            break;
         case "let_declaration":
            let_declaration(exp);
            break;
         case "var_declaration":
            var_declaration(exp);
            break;
         case "lin_declaration":
            lin_declaration(exp);
            break;
         case "function_declaration":
            fn_declaration(exp);
            break;
      }
   }
   return apStr;
}

function fn_declaration(exp) {
   apStr += "function ";
   apStr += exp.name + "(" + exp.params.toString() + "){" + breaker;
   for (const st of exp.expr) {
      apStr += st.value;
      // console.log(st);
      if (access.tokens[st.token_num].kind === "format") {
         apStr += access.tokens[st.token_num].value;
         continue;
      }
   }
   apStr += "};\n";
}

function const_declaration(exp) {
   apStr += "const ";
   apStr += exp.name + " = ";
   if (exp.evaluated) {
      apStr += exp.evaluated;
   }
   apStr += ";\n";
}

function let_declaration(exp) {
   apStr += "let ";
   apStr += exp.name + " = ";
   if (exp.evaluated) {
      apStr += exp.evaluated;
   }
   apStr += ";\n";
}

function var_declaration(exp) {
   apStr += "var ";
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
