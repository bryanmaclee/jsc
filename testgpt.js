// ----------------------
// Tokenizer
// ----------------------
function tokenize(input) {
   const tokens = [];
   let i = 0;

   while (i < input.length) {
      const c = input[i];

      if (/\s/.test(c)) {
         i++;
         continue;
      }

      if (/[0-9]/.test(c)) {
         let num = c;
         i++;
         while (/[0-9]/.test(input[i])) num += input[i++];
         tokens.push({ type: "number", value: num });
         continue;
      }

      if ("+-*/()".includes(c)) {
         tokens.push({ type: c, value: c });
         i++;
         continue;
      }

      throw new Error("Unexpected character: " + c);
   }

   tokens.push({ type: "(eof)", value: "" });
   return tokens;
}

// ----------------------
// Pratt Parser
// ----------------------
function Parser(tokens) {
   let pos = 0;

   function peek() {
      return tokens[pos];
   }
   function next() {
      return tokens[pos++];
   }

   const PRECEDENCE = {
      "+": 10,
      "-": 10,
      "*": 20,
      "/": 20,
   };

   function nud(token) {
      if (token.type === "number") {
         return { type: "Literal", value: Number(token.value) };
      }

      if (token.type === "(") {
         const expr = expression(0);
         if (peek().type !== ")") throw "Expected ')'";
         next();
         return expr;
      }

      if (token.type === "-") {
         const right = expression(100);
         return { type: "UnaryExpression", operator: "-", argument: right };
      }

      throw "Unexpected token in nud(): " + token.type;
   }

   function led(left, token) {
      if (["+", "-", "*", "/"].includes(token.type)) {
         const right = expression(PRECEDENCE[token.type]);
         return {
            type: "BinaryExpression",
            operator: token.type,
            left,
            right,
         };
      }

      throw "Unexpected token in led(): " + token.type;
   }

   function lbp(token) {
      return PRECEDENCE[token.type] || 0;
   }

   function expression(rbp) {
      let t = next();
      let left = nud(t);

      while (rbp < lbp(peek())) {
         t = next();
         left = led(left, t);
      }

      return left;
   }

   return {
      parse() {
         return expression(0);
      },
   };
}

// ----------------------
// Test
// ----------------------
const input = "1 + 2 * (3 - 4) / 2";
const tokens = tokenize(input);
console.log(tokens);
const parser = Parser(tokens);
console.log(JSON.stringify(parser.parse(), null, 2));
