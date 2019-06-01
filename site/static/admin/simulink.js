var icons = {
  "sum":
  "M 10 10 54 10 54 12 14 12 33 32 14 52 54 52 54 54 10 54 31 32 Z",
  
  "absolute":
  "M 20 10 20 54 24 54 24 10 Z M 44 10 44 54 40 54 40 10 Z",
  
  "integral":
  "M 10 54 C 54 54 10 12 54 12 L 51 10 C 10 10 51 52 10 52 Z",
};

function initSimulink(){
	
	//if (window.goSamples) goSamples();  // init for these samples -- you don't need to call this
  var $ = go.GraphObject.make;  // for conciseness in defining templates
  myDiagram =
	$(go.Diagram, "myDiagramDiv",  // create a new Diagram in the HTML DIV element "myDiagramDiv"
	  {
		initialContentAlignment: go.Spot.Center,
		allowDrop: true,  // Nodes from the Palette can be dropped into the Diagram
		"draggingTool.isGridSnapEnabled": true,  // dragged nodes will snap to a grid of 10x10 cells
		"undoManager.isEnabled": true
	  });
  // when the document is modified, add a "*" to the title and enable the "Save" button
  myDiagram.addDiagramListener("Modified", function(e) {
	var button = document.getElementById("saveModel");
	if (button) button.disabled = !myDiagram.isModified;
	var idx = document.title.indexOf("*");
	if (myDiagram.isModified) {
	  if (idx < 0) document.title += "*";
	} else {
	  if (idx >= 0) document.title = document.title.substr(0, idx);
	}
  });
  //var palette = new go.Palette("palette");  // create a new Palette in the HTML DIV element "palette"
  // creates relinkable Links that will avoid crossing Nodes when possible and will jump over other Links in their paths
  myDiagram.linkTemplate =
	$(go.Link,
	  {
		routing: go.Link.AvoidsNodes,
		curve: go.Link.JumpOver,
		corner: 3,
		relinkableFrom: true, relinkableTo: true,
		selectionAdorned: false, // Links are not adorned when selected so that their color remains visible.
		shadowOffset: new go.Point(0, 0), shadowBlur: 5, shadowColor: "blue",
	  },
	  new go.Binding("isShadowed", "isSelected").ofObject(),
	  $(go.Shape,
		{ name: "SHAPE", strokeWidth: 2, stroke: "blue" }));
  // node template helpers
  var sharedToolTip =
	$(go.Adornment, "Auto",
	  $(go.Shape, "RoundedRectangle", { fill: "lightyellow" }),
	  $(go.TextBlock, { margin: 2 },
		new go.Binding("text",  "" , function(d) { return d.category; })));
	
	function nodeStyle() {
	return [new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
			new go.Binding("isShadowed", "isSelected").ofObject(),
			{
			  selectionAdorned: false,
			  shadowOffset: new go.Point(0, 0),
			  shadowBlur: 15,
			  shadowColor: "blue",
			  toolTip: sharedToolTip
			}];
  }
  function shapeStyle() {
	return {
	  name: "NODESHAPE",
	  fill: "lightgray",
	  stroke: "black",
	  desiredSize: new go.Size(64, 64),
	  strokeWidth: 2
	};
  }
  
  function portStyle(input) {
	return {
	  desiredSize: new go.Size(6, 6),
	  fill: "black",
	  fromSpot: go.Spot.Right,
	  fromLinkable: !input,
	  toSpot: go.Spot.Left,
	  toLinkable: input,
	  cursor: "pointer"
	};
  }
  
	var sumTemplate =
		$(go.Node, "Spot", nodeStyle(),
			$(go.Shape, "Rectangle", shapeStyle(),
				{fill:"white"}),
			$(go.Shape,  
				{ geometryString: "F M 10 10 54 10 54 12 14 12 33 32 14 52 54 52 54 54 10 54 31 32 Z", fill: "black" }),
				$(go.Shape, "Rectangle", portStyle(true),
		{ portId: "in", alignment: new go.Spot(0, 0.5) }),
		$(go.Shape, "Rectangle", portStyle(false),
		{ portId: "out", alignment: new go.Spot(1, 0.5) })
				
		);
		
	var absoluteTemplate =
		$(go.Node, "Spot", nodeStyle(),
			$(go.Shape, "Rectangle", shapeStyle(),
				{fill:"white"}),
			$(go.Shape,  
				{ geometryString: "F M 20 10 20 54 24 54 24 10 Z M 44 10 44 54 40 54 40 10 Z", fill: "black" }),
				$(go.Shape, "Rectangle", portStyle(true),
		{ portId: "in", alignment: new go.Spot(0, 0.5) }),
		$(go.Shape, "Rectangle", portStyle(false),
		{ portId: "out", alignment: new go.Spot(1, 0.5) })
		);
		
	var integralTemplate =
		$(go.Node, "Spot", nodeStyle(),
			$(go.Shape, "Rectangle", shapeStyle(),
				{fill:"white"}),
			$(go.Shape,  
				{ geometryString: "F M 10 54 C 54 54 10 12 54 12 L 51 10 C 10 10 51 52 10 52 Z", fill: "black" }),
				$(go.Shape, "Rectangle", portStyle(true),
		{ portId: "in", alignment: new go.Spot(0, 0.5) }),
		$(go.Shape, "Rectangle", portStyle(false),
		{ portId: "out", alignment: new go.Spot(1, 0.5) })
		);
		
	var inputTemplate =
		$(go.Node, "Spot", nodeStyle(),
			$(go.Shape, "Circle", shapeStyle(),
				{fill:"white"}),
				$(go.Shape, "Rectangle", portStyle(false),
		{ portId: "out", alignment: new go.Spot(1, 0.5) })
		);
		
	var outputTemplate =
		$(go.Node, "Spot", nodeStyle(),
			$(go.Shape, "Rectangle", shapeStyle(),
				{fill:"white"}),
				$(go.Shape, "Rectangle", portStyle(true),
		{ portId: "in", alignment: new go.Spot(0, 0.5) })
		);
		
	myDiagram.nodeTemplateMap.add("sumBlock", sumTemplate);
	myDiagram.nodeTemplateMap.add("absoluteBlock", absoluteTemplate);
	myDiagram.nodeTemplateMap.add("integralBlock", integralTemplate);
	myDiagram.nodeTemplateMap.add("input", inputTemplate);
	myDiagram.nodeTemplateMap.add("output", outputTemplate);
}

// save a model to and load a model from JSON text, displayed below the Diagram
function save() {
  document.getElementById("mySavedModel").value = myDiagram.model.toJson();
  myDiagram.isModified = false;
}
function load() {
  myDiagram.model = go.Model.fromJson(document.getElementById("mySavedModel").value);
}

function loadFromJSONSimulink(json){
  myDiagram.model = go.Model.fromJson(json);
}	
