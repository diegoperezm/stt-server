const { Machine, interpret, assign } = XState;
const socket = io();

socket.on("connect", () => {
  socket.send("connected");
});

var g;

socket.on("graph", (stt) => {
  let calcGraphConf = createGraphConf("svgGraph", stt, "LR", 1, 1);
  g = createGraph(calcGraphConf);
  renderGraph(g.g, g.data);
});

socket.on("event", (evt) => {
  showFn(evt, g.g);
});
