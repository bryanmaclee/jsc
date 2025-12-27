import { Tokens, operator } from "../dep/syntax.js";
import { access } from "../dep/lib.js";
//
self.onmessage = (ev) => {
   // console.log(ev.data);
   // try {
   //    tone.dothing();
   // } catch {
   //    process.exit;
   // }
   // console.log(Tokens);
   // postMessage("hello main thread");
   // console.log(ev.data);
   // const tokens = tokenize(ev.data);
   // const str = String.fromCharCode(...ev.data);
   // console.log(str);
   // const tokens = tokenize(ev.data);
   tokenize(ev.data);
   // console.log("print the tokens", tokens);
   postMessage(tokens);
   process.exit();
};
// self.terminate();

const tokens = [];
function tokenize(src) {
   let itter = 0;
   let startCol = 1;
   let char = 1;
   let line = 1;
   let tokenNumber = 0;
   let lineStartPos = 1;

   function inc() {
      char++;
      itter++;
   }

   function skippable(str) {
      if (str === " " || str === "\t") {
         return "s";
      } else if (str === "\n" || str === "\r") {
         return "l";
      }
      return false;
   }

   function isKeyword(word) {
      const kw = Tokens.keyword.map((w) => w.type);
      return kw.includes(word);
   }

   function isAlpha(src) {
      const rx = /[a-zA-Z_$]/;
      return rx.test(src);
   }

   function isAlphaNum(src) {
      const rx = /[a-zA-Z0-9_$]/;
      return rx.test(src);
   }

   function isNum(src) {
      const rx = /[0-9]/;
      return rx.test(src);
   }

   function c() {
      return src[itter];
   }

   function addAndInc(val, tok) {
      add(val, tok);
      inc();
   }

   function add(value, type, kind, addTok = true) {
      const token = {
         value,
         length: value.length,
         type,
         kind,
         position: itter - value.length + 1,
         line: line,
         start_col: char - value.length,
         end_col: char - 1,
         token_num: addTok ? ++tokenNumber : null,
      };
      // access.tokens.push(token);
      // return token;
      tokens.push(token);
   }

   while (itter < src.length) {
      let chunk = "";
      let usefullVar;
      chunk += c();
      if (isNum(chunk)) {
         inc();
         while (itter < src.length && (isNum(c()) || c() === ".")) {
            chunk += c();
            inc();
         }
         add(chunk, "number", "numeric_lit");
         continue;
      } else if (isAlpha(c())) {
         inc();
         while (itter < src.length && isAlphaNum(c())) {
            chunk += c();
            inc();
         }
         if (isKeyword(chunk)) {
            add(chunk, "word", "keyword");
         } else {
            add(chunk, "word", "identifier");
         }
         continue;
      } else if ((usefullVar = skippable(chunk))) {
         inc();
         if (usefullVar === "l") {
            char = 1;
            add(chunk, "format", "new_line");
            lineStartPos = itter;
            line++;
         } else {
            add(chunk, "format", "white_space");
         }
         continue;
      } else if (operator.has(chunk)) {
         inc();
         if (chunk === '"' || chunk === "'") {
            let quoteType = chunk;
            while (c() !== quoteType) {
               chunk += c();
               inc();
            }
            chunk += c();
            inc();
            add(chunk, "string", "literal");
            continue;
         }
         while (itter < src.length && operator.has(chunk + c())) {
            chunk += c();
            inc();
         }
         add(chunk, "operator", operator.get(chunk));
         continue;
      }
      console.error(
         `Lexer Error:\nunrecognized character: "${chunk}" found in source at line ${line} char ${
            char - chunk.length
         } position: ${itter}`,
      );
      return tokens;
   }
   add("EOF", "EOF", "EOF");
   // return tokens;
}
