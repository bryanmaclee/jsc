import { tokenTypes } from "../dep/syntax";

export function ditchWhite(str) {
   return str.filter((thing) => thing.kind !== "format");
}

export function truncateInput(datastr) {
   const begin = "BEGIN;";
   const dataStart = datastr.includes(begin)
      ? datastr.substring(
           datastr.indexOf("BEGIN;") +
              begin.length +
              tokenTypes[0]?.test.exec(datastr)?.length,
        )
      : datastr;
   const data = dataStart.includes("END;")
      ? dataStart.substring(0, dataStart.indexOf("END;"))
      : dataStart;
   return data;
}

const args = process.argv.slice(2);

export const Files = {
   inTest: "./tests/test.js",
   outputFile: "out/program.json",
   outputText: "out/tokens.json",
   outputTrunk: "out/truncated.json",
   testFile: function () {
      return args[0] ? args[0] : this.inTest;
   },
};

export function preStringify(data) {
   let rVal;
   if ("envir" in data) {
      rVal = JSON.parse(JSON.stringify(data.envir));
      rVal.Variables = Object.fromEntries(data.envir.Variables);
      rVal.Constants = Array.from(data.envir.Constants);
      rVal.UnUtilizedVars = Array.from(data.envir.UnUtilizedVars);
      rVal.Functions = Array.from(data.envir.Functions);
      rVal.FunctionStrs = Object.fromEntries(data.envir.FunctionStrs);
      data.envir = rVal;
   }
   console.log(data);
   if ("expression" in data) {
      if (data.expression) {
         if (data.expression.length) {
            for (const a of data.expression) {
               preStringify(a);
            }
         }
      }
   }
   return data;
}

export const deps = [];
export const stack = [];

export function pushOnStack(fnName, params = [], callerEnv) {
   stack.push({
      fnName,
      params,
      callerEnv,
   });
}

export function popOffstack() {
   return stack.pop();
}

// let testFile = "";
// if (args[0]) {
//   testFile = args[0];
// } else {
//   testFile = Files.inTest;
// }
