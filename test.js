const axios = require("axios");
const {
  Machine,
  interpret,
  assign,
} = require("./public/javascripts/xstate.js");
const blessed = require("blessed");

const {
  createGraph,
  createGraphConf,
  createMachineConf,
} = require("./utils.js");

const screenOptions = {
  tags: true,
  dockBorders: true,
  autoPadding: true,
  smartCSR: true,
  fullUnicode: true,
  debug: true,
  title: "TESTING",
};

const screen = blessed.screen(screenOptions);

const button = blessed.button({
  mouse: true,
  keys: true,
  shrink: true,
  padding: {
    left: 1,
    right: 1,
  },
  left: "center",
  top: 2,
  shrink: true,
  name: "send a",
  content: "send a",
  style: {
    bg: "blue",
    focus: {
      bg: "red",
    },
    hover: {
      bg: "red",
    },
  },
});

const boxB = blessed.box({
  top: "left",
  width: "30%",
  height: "100%",
  tags: true,
  border: {
    type: "line",
  },
});

boxB.append(button);
screen.append(boxB);

screen.key(["escape", "C-c"], function () {
  return process.exit(0);
});

button.on("press", function () {
  testMachineService.send("a");
});

const stt = `
id: testing
     *A a  B
      B a  C 
      C a  D
      D a  E 
      E a A
`;

const testMachineConf = createMachineConf(stt);
const testMachine = Machine(testMachineConf);

const testMachineService = interpret(testMachine).onTransition((state) => {
  screen.render();
  sendEvent(state);
});

updateGraph(stt);
testMachineService.start();

function updateGraph(stt) {
  axios
    .post("http://localhost:5000/graph", {
      data: stt,
    })
    .then(function (response) {})
    .catch(function (error) {
      console.log("error", error.Error, error.errno);
    });
}

function sendEvent(state) {
  axios
    .post("http://localhost:5000/event", {
      data: state,
    })
    .then(function (response) {})
    .catch(function (error) {
      console.log("error", error.Error, error.errno);
    });
}
