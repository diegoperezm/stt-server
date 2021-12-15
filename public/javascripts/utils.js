"use strict";

let prevEdges = [];

// I need to change this name
var show          = 'currentPath';

function setShow(str) {
  switch (str) {
  case 'path':
     show = 'path';
     break;
     default:
     show = 'currentPath';
  }
}
/**
 *
 *  (I need to change this name) 
 * 
 * This one is for change the function
 * (that highlight the edges of the graph) 
 *  without re-write the function call 
 *  inside interpret().onTransition() 
 * 
 *  BUGS:
 * - 1:
 *   show = 'path'; at the start of execution  
 *   and later  
 *   show = 'currentPath';
 *   leaves initial state permanently highlighted 
 * ---------- 
 * 
 * - 2:
 *   show='path';  
 *   some transitions
 *   show='currentPath';
 *   leaves the edges highlighted  
 */
const showFn = (state, g, graphData) =>  {

    let input = state.event.type;
    let v     = prevEdges.length === 0 ? "INITIAL" : prevEdges[0][1] ; 
    let w     = state.value;
    let name  = (v+"-"+w+"-"+ input);

    if(checkIfTransitionIsValid(v,w,name, g) ) { 
       if(show === 'currentPath') {
         highlightNodes(input,w,g);
         highlightCurrentPath(input,w,g, graphData);     
       } else if(show === 'path'){
         highlightNodes(input,w,g);
         highlightPath(input,w,g);   
       } 
    } 
    
}; 

function highlightNodes(input, w, g) {
 if(input === 'xstate.init') {
    g.node(w).elem.style = "fill: red;";
 } else {
    g.node(w).elem.style = "fill: red;";
 }
}

function currentPathInitialState(input,w,g) {
 let arrow;
 let v      = 'INITIAL';
 let name   = (v+"-"+w+"-"+input);
 let a      = g.edge(v,w,name).elem;

 a.children[0].setAttribute('class', 'edgePath active');

 arrow = document.getElementById(a.children[1].children[0].id);
 arrow.children[0].style = "stroke: red; fill: red";

 prevEdges.push([v,w,name]);

}

function currentPathRestOfState(input,w,g) {
 let arrow;
 let labelStyle;   
 let tspanElements = document.getElementsByTagName('tspan');
 let tspanArr      = Array.from(tspanElements);  
 let v             = prevEdges[0][1]; ;
 let name          =  (v+"-"+w+"-"+ input);
 let a             = g.edge(v,w, name).elem;
 a.children[0].setAttribute('class', 'edgePath active');

 arrow = document.getElementById(a.children[1].children[0].id);
 arrow.children[0].style = "stroke: red; fill: red";

 labelStyle = tspanArr.filter( elem => elem.__data__.name === name); 
 labelStyle[0].classList.add('active');

 prevEdges.shift();
 prevEdges.push([v,w,name]);
}

function clearPath(g) {
 let arrow ; 
 let labelStyle;
 let tspanElements = document.getElementsByTagName('tspan');
 let tspanArr      = Array.from(tspanElements);  
 let v     = prevEdges[0][0];
 let w     = prevEdges[0][1];
 let name  = prevEdges[0][2]; 
 let a     = g.edge(v,w,name).elem;

 a.children[0].setAttribute('class', 'edgePath');
 g.node(w).elem.style = "fill: black";

 arrow = document.getElementById(a.children[1].children[0].id);
 arrow.children[0].style = "stroke: black; fill: black";

 labelStyle = tspanArr.filter( elem => elem.__data__.name === name); 
 labelStyle[0].classList.remove('active');
}

function pathInitialState(input, w,g) {
  let arrow;
  let v    = 'INITIAL';
  let name = (v+"-"+w+"-"+ input);
  let a    = g.edge(v,w,name).elem;

  a.children[0].setAttribute('class', 'edgePath active');

  arrow = document.getElementById(a.children[1].children[0].id);
  arrow.children[0].style = "stroke: red; fill: red";

  prevEdges.push([v,w,name]);
}


function pathRestOfState(input, w,g) {
  let arrow;
  let labelStyle;
  let tspanElements = document.getElementsByTagName('tspan');
  let tspanArr      = Array.from(tspanElements);  
  let v    =  prevEdges[0][1];
  let name =  (v+"-"+w+"-"+ input);

  let a    =  g.edge(v,w, name).elem;
              a.children[0].setAttribute('class', 'edgePath active');

  arrow = document.getElementById(a.children[1].children[0].id);
  arrow.children[0].style = "stroke: red; fill: red";

  labelStyle = tspanArr.filter( elem => elem.__data__.name === name); 
  labelStyle[0].classList.add('active');

  prevEdges.shift();
  prevEdges.push([v,w,name]);
}


/**
 * This is a simple/naive implementation, first draft etc.:
 *
 *  is not tested (only "works")
 * 
 */
function highlightCurrentPath(input, w,g) {
   if(input === 'xstate.init') {
       currentPathInitialState(input,w,g);
   } else {
       clearPath(g);
       currentPathRestOfState(input,w,g);
   }
}

function highlightPath(input,w,g) {
  if(input === 'xstate.init') {
      pathInitialState(input, w,g);
   } else {
      pathRestOfState(input,w,g);
   }
}

function createGraphConf(
    svgDOMId,
    stateTransitionTable,
    rankdir       = {rankdir: "LR"},
    initialScaleW =   1,
    initialScaleH =   1,
    a             = 100,
    b             =  50,
    ) {

    let graphData = {
        svgDOMId:               svgDOMId,
        stateTransitionTable:   stateTransitionTable,
        rankdir:                {rankdir: rankdir},
        a:                      a,
        b:                      b,
        initialScaleW:          initialScaleW,
        initialScaleH:          initialScaleH
    };     
    
    return graphData;
}

function createGraph(graphData) {
  const ParserDagredD3  = grammarDagreD3.Parser;
  const parserDagredD3  = new ParserDagredD3(grammarDagreD3);

  const g               = new dagreD3
                              .graphlib
                              .Graph({multigraph: true})
                              .setGraph(graphData.rankdir);

  let  edgeList         = parserDagredD3
                              .parse(graphData.stateTransitionTable);
 let states = edgeList[0];
 let edges  = edgeList[1];

 states.forEach(function(state) {
   if(state === "FINAL" || state === 'INITIAL') {
     g.setNode(state, { label: "" }); 
     g.node(state).style = "fill: #333";
   } else {
     g.setNode(state, { label: state }); 
   }
   });

   edges.forEach(
     function(ele) {
       g.setEdge(
         {    v: ele[0],
              w: ele[1],
           name: ele[3]},
         {label: ele[2]});});

   // Set some general styles
   g.nodes().forEach(function(v) {
     var node = g.node(v);
     node.rx = node.ry = 10;
   });

    return {g: g, data: graphData};   
}

function renderGraph(g,graphData) {

   let svgGraph        = document.getElementById(graphData.svgDOMId);
   let svgGraphInfo;

    var svg =   d3.select("#" + graphData.svgDOMId);
    var inner = svg.select("g");

   // Set up zoom support
   var zoom = d3.zoom().on("zoom", function() {
         inner.attr("transform", d3.event.transform);
       });

   svg.call(zoom);
   // Create the renderer

   var render = new dagreD3.render();

   // Run the renderer. This is what draws the final graph.
   render(inner, g);

   svgGraphInfo  =  svgGraph.getBBox();

   svg.call(
     zoom.transform,
       d3.zoomIdentity
           .translate((svgGraphInfo.width)  /  graphData.a, graphData.b)
           .scale(graphData.initialScaleW));

   svg.attr('height', svgGraphInfo.height - (window.innerHeight/ graphData.initialScaleH));

}


function createMachineConf(stateTransitionTable) {
   const ParserXstate        = grammarXstate.Parser;
   const parserXstate        = new ParserXstate(grammarXstate);
   const createMachineConfig = input => parserXstate.parse(input);
   const templateMachineConf = createMachineConfig(stateTransitionTable);

   return templateMachineConf;  
}

/**
 *
 * This is a hack, I will change this later
 *
 */ 
function checkIfTransitionIsValid (v,w,name,g) {
  try {
     let transition = g.edge(v,w, name).elem;
  } catch(e) {
     if(e instanceof TypeError) {
      return false;
     } 
  }
 return true;
};

