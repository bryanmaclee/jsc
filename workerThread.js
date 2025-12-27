self.onmessage = (ev) => {
   console.log(ev.data);
   postMessage("hello main");
};
