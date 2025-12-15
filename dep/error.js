import { globalEnv } from "./lib.js";

// const logger = new Worker(new URL("./logger.js", import.meta.url));
// export async function startLogger() {
//    await logger.postMessage("hello");
//    await logger.postMessage("work");
//    await process.on("worker", (worker) => {
//       console.log("New worker created:", worker.threadId);
//    });
//    logger.onmessage = async (ev) => {
//       await console.log("the data is: ", ev.data);
//    };
//    await logger.addEventListener("open", () => {
//       console.log("worker is ready");
//    });
//    return;
// }

export default function err(msg, panic = false, info = "") {
   if (panic) {
      // console.log(globalEnv);
      // await logger.terminate();
      console.log(info);
      throw msg;
      process.exit(1);
   } else {
      console.error(msg);
   }
}
