import { truncateInput, Files, deps, preStringify } from "./dep/lib";
import { tokenize } from "./dep/lexer";
import { Environment } from "./dep/env.js";
// import { Scope } from "./dep/scope.js";
// import { evaluateExpr } from "./dep/eval.js";

(async function () {
  const datastr = await Bun.file(Files.testFile()).text();
  const data = truncateInput(datastr);
  console.log(data);
  const lexed = tokenize(data);
  await Bun.write(Files.outputText, JSON.stringify(lexed, null, 2));
  const woWhite = lexed.filter((thing) => thing.kind !== "format");
  await Bun.write(Files.outputTrunk, JSON.stringify(woWhite, null, 2));
  let program = instanciateProgram(woWhite);
  // const progOut = preStringify(program);
  await Bun.write(Files.outputFile, JSON.stringify(program, null, 2));
  // await Bun.write(Files.outputFile, JSON.stringify(progOut, null, 2));
})();

function instanciateProgram(data) {
  return {
    type: "program",
    // envir: Environment(),
    content: 'this',
    expression: parse(data),
  };
}

function parse(tokens) {
    let iter = 0;
    const statements = [];

  function eat(i = 1) {
    iter += i;
    return tokens[iter - 1];
  }

  function at() {
    return tokens[iter];
  }

  let token = eat();

  while (token.type !== "EOF") {
    statements.push( fig(token));
    token = eat();
  }
    return statements;

  function fig(token) {
    switch (token.type) {
      case "word":
        switch (token.value) {
          case "function":
            return define(func, token);
          case "const":
            return define(constVar, token);
        }
    }

    function define(cb, token) {
      return cb(token);
    }

    function constVar(){
        const tokenRange = [token.token_num];   
        let scp = 1;
        const varName = eat();
        const v = 1;
        eat();
        const stmt = [];
        while (at().type !==  'semi_colon'){
        stmt.push(eat());
        }

        return {
            type: "constant declaration",
            name: varName.value,
            tokenRange: tokenRange,
            statement: stmt,
        };
    }

    function func(token) {
      // console.log(token)
      const tokenRange = [token.token_num];
      let scp = 1;
      const stmt = []
      const fnName  = eat()
      eat();
      let next = eat()
      const params = [];
      while (next.type !== 'close_paren'){
        params.push(next.value)
        next = eat()
      } 
      eat()
      next = eat();
      while (next.type !== 'close_curly' && scp !== 0){
        console.log('in da loop', next.value)
        stmt.push(next)
        next = eat()
      }
      tokenRange.push(next.token_num)

      return {
        type: "function declaration",
        name: fnName.value,
        params: params,
        tokenRange: tokenRange,
        statement: stmt,
      };
    }
  }
}

// const worker = new Worker(new URL("./worker.js", import.meta.url));
// worker.postMessage("hello");
// console.log(worker.postMessage('msg'))
// process.on("worker", (worker) => {
//   console.log("New worker created:", worker.threadId);
// });
// worker.onmessage = (ev) => {
//   console.log(ev.data);
// };
// worker.addEventListener("open", () => {
//   console.log("worker is ready");
// });
