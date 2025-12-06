export function output(input) {
   let apStr = "";
   for (const exp of input.expr) {
      if (exp.type === "constant declaration") {
         apStr += "const ";
         apStr += exp.name + " = ";
         if (exp.evaluated) {
            apStr += exp.evaluated;
         }
         apStr += ";\n";
      }
   }
   return apStr;
}
