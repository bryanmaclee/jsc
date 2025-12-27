const other = new Worker("./workerThread.js");

other.postMessage("hello worker");
other.onmessage = (ev) => {
   console.log(ev.data);
};
