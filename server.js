// const server = Bun.serve({
//    port: 3000,
//    fetch(req) {
//       const filePath = new URL(req.url).pathname;
//
//       // Serve the index.html file for the root path
//       if (filePath === "/" || filePath === "/index.html") {
//          const file = Bun.file("index.html");
//          return new Response(file);
//       }
//
//       // Handle 404 for other paths
//       return new Response("404 Page Not Found", { status: 404 });
//    },
//    error() {
//       return new Response(null, { status: 404 });
//    },
// });
//

const PUBLIC_DIR = "./";

Bun.serve({
   port: 3000,
   async fetch(req) {
      const path = new URL(req.url).pathname;
      const file = Bun.file(
         `${PUBLIC_DIR}${path === "/" ? "/index.html" : path}`,
      );

      // Check if file exists to avoid generic errors
      if (await file.exists()) {
         return new Response(file);
      }

      return new Response("404 Not Found", { status: 404 });
   },
});
// console.log(`Listening on http://localhost:${server.port} ...`);
