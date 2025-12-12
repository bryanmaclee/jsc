// this is my first worker

self.onmessage = (event) => {
   console.log("worker data is: ", event.data);
   postMessage("world");
};
