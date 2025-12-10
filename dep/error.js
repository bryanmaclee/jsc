import { globalEnv } from "./lib.js";
export default function err(msg, panic = false) {
   if (panic) {
      // console.log(globalEnv);
      throw msg;
   } else {
      console.error(msg);
   }
}
