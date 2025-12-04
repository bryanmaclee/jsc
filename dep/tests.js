import { ditchWhite } from "./lib.js";
import { tokenize } from "./lexer.js";
import { parser } from "./parser.js";

const runTests = false;

function testParser() {
   const tests = [
      {
         test: "(10 + 4) / 2",
         answer:
            '{"operation":"/","expr":[{"operation":"+","expr":["10","4"]},"2"]}',
      },
      {
         test: "10 * 4 - 2",
         answer:
            '{"operation":"-","expr":[{"operation":"*","expr":["10","4"]},"2"]}',
      },
      {
         test: "10 + 4 / 2",
         answer:
            '{"operation":"+","expr":["10",{"operation":"/","expr":["4","2"]}]}',
      },
   ];

   for (const test of tests) {
      const tst = ditchWhite(tokenize(test.test)).reverse();
      if (JSON.stringify(parser(tst)) === test.answer) {
         console.log(`%cPASSED test: ${test.test}`, 'background-color: "#0f0"');
         continue;
      }
      console.log("%cFAILED test: ", test.test);
   }
}
if (runTests) testParser();
