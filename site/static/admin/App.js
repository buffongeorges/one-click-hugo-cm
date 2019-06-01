var tabModels = ["class", "sequence", "logic", "simulink"];
var tabModelsMaj = ["Class", "Sequence", "Logic", "Simulink"];
var canvas;
var context;
var canvasWidth = 1000;
var canvasHeight = 650;
var canvasPixels = new Array(canvasWidth,canvasHeight);
var colorBlack = "#000000";
var colorWhite = "#FFFFFF";
var curColor = colorBlack;
var clickColor = new Array();
var clickSize = new Array();
var defaultSize = 2;
var curSize = defaultSize;
var paint;
var mouseX;
var mouseY;
var layerCount=0;
//Variable for saving layers
var clickX = new Array();
var clickY = new Array();
var clickColor = new Array();
var clickSize = new Array();
var clickDrag = new Array();
var timeout;
var lengthTimeout = 500;
var whichEngineModelToUse = "class";
var layerTypeUsed = "shape";
var slider;
var currentFilter;		//###

function initializeSlider(){
	slider = document.getElementById("myRange");
	//Update the current slider value (each time you drag the slider handle)
	slider.oninput = function() {
		lengthTimeout = this.value;
		updateSlider();
	}
	slider.step = "50"
}

function initializeFilter(){		//###
	var filter = document.getElementById('filter');
	
	while(filter.firstChild){
		filter.removeChild(filter.firstChild);
	}
	
	var option = document.createElement("option");
	option.setAttribute("value","all");
	option.innerHTML="All";
	filter.appendChild(option);
	
	for(var i=0;i<tabModels.length;i++){
		var option = document.createElement("option");
		option.setAttribute("value",tabModels[i]);
		option.innerHTML=tabModelsMaj[i];
		filter.appendChild(option);
	}
	
	filter.value="all";
	setFilter();
}

function setDiagramEngine(modelToUse){
	var canvasList = getAllLayerCanvas();
	whichEngineModelToUse = modelToUse;
	
	for(var i=0;i<tabModels.length;i++){
		
		var selectionButton=document.getElementById("set"+tabModelsMaj[i]+"DiagramEngine");
		if(tabModels[i]==modelToUse){
			selectionButton.setAttribute("class","selected");
		}
		else{
			selectionButton.setAttribute("class","");
		}
	}
	
	banner.setAttribute("src","img/banners/"+modelToUse+".png");
	
	if(currentFilter!="all"){
		currentFilter=modelToUse;
		document.getElementById('filter').value=currentFilter;
		postPictureEngineV2();
		updateMainCanvas();
	}
	
	//}
}

function setShapeLayerType(){
	layerTypeUsed="shape";
	var setShapeLayerType=document.getElementById("setShapeLayerType");
	setShapeLayerType.setAttribute("class","selected");
	var setTextLayerType=document.getElementById("setTextLayerType");
	setTextLayerType.setAttribute("class","");

	lengthTimeout=500;
	slider.value = lengthTimeout;
	updateSlider();
}

function setTextLayerType(){
	layerTypeUsed="text";
	var setShapeLayerType=document.getElementById("setShapeLayerType");
	setShapeLayerType.setAttribute("class","");
	var setTextLayerType=document.getElementById("setTextLayerType");
	setTextLayerType.setAttribute("class","selected");

	lengthTimeout=1000;
	slider.value = lengthTimeout;
	updateSlider();
}

function prepareCanvas(){
	var canvasDiv = document.getElementById('canvasDiv');
	canvas = document.createElement('canvas');
	canvas.setAttribute('width', canvasWidth);
	canvas.setAttribute('height', canvasHeight);
	canvas.setAttribute('id', 'canvas');
	canvasDiv.appendChild(canvas);
	if(typeof G_vmlCanvasManager != 'undefined') {
		canvas = G_vmlCanvasManager.initElement(canvas);
	}
	context = canvas.getContext("2d");

	/*context.rect(80,20,150,100);////
	context.stroke();/////*/

	$('#canvas').mousedown(function(e){
		mouseX = e.pageX - this.offsetLeft;
		mouseY = e.pageY - this.offsetTop;

		paint = true;
		addClick(mouseX,mouseY);//////////////
		redrawPoint();
		clearTimeout(timeout);
		//updateTimeLabel("Drawing...")
	});

	$('#canvas').mousemove(function(e){
		if(paint){
			redrawBis(e.pageX - this.offsetLeft, e.pageY - this.offsetTop);
			addClick(mouseX,mouseY,true);/////////////////////
			mouseX = e.pageX - this.offsetLeft;
			mouseY = e.pageY - this.offsetTop;
		}
	});

	$('#canvas').mouseup(function(e){
		paint = false;
		//updateTimeLabel("Pencil raised...")
		timeout = setTimeout(function(){ addLayer();; }, lengthTimeout);
	});

	$('#canvas').mouseleave(function(e){
		paint = false;
	});

	canvas.addEventListener("touchstart", function(e){
		e.preventDefault();
		var touch = e.touches[0];

		mouseX = touch.pageX - this.offsetLeft;
		mouseY = touch.pageY - this.offsetTop;


		paint = true;
		if(!analyzeInProgress && paint)	redrawPoint();
	},false);

	canvas.addEventListener("touchend", function(e){
		e.preventDefault();
		paint = false;
	},false);

	canvas.addEventListener("touchmove", function(e){
		e.preventDefault();
		if(!analyzeInProgress && paint){
			var touch = e.touches[0];

			redrawBis(touch.pageX-this.offsetLeft, touch.pageY-this.offsetTop);
			mouseX = touch.pageX-this.offsetLeft;
			mouseY = touch.pageY-this.offsetTop;
		}
	},false); 

	//updateInfoLabel("Start");
	//updateTimeLabel("Please start to draw!!")
	initializeSlider();
	initializeFilter();			//###
	initStyles();
	initDiagramButtons();
	setDiagramEngine("class");

	/////////
	context.fillStyle = colorWhite;
	context.fillRect(0,0,canvasWidth,canvasHeight);
	/////////

	//resetJSONPreview();
}

function initDiagramButtons(){
	var buttonsBar = document.getElementById('buttonsBar');
	for(var i=0;i<tabModels.length;i++){
		var button = document.createElement("button");
		button.setAttribute("id","set"+tabModelsMaj[i]+"DiagramEngine");
		button.setAttribute("type","button");
		button.setAttribute("class","");
		button.setAttribute("onclick","setDiagramEngine('"+tabModels[i]+"')");
		button.innerHTML=tabModelsMaj[i]+" Diagram";
		
		buttonsBar.appendChild(button);
	}
}

function initStyles(){
	var canvasDiv = document.getElementById('canvasDiv');
	canvasDiv.setAttribute('width', canvasWidth);
}

function save(){
	if(layerCount>0){
		var jsonPreview = document.getElementById('jsonPreview');
		jsonPreview.innerHTML="JSON INFOS:<br/>";
		var allCanvas = getAllLayerCanvas();
		for(var i=0;i<allCanvas.length;i++){
			jsonPreview.innerHTML+=getBoundingBox(allCanvas[i])+"<br/>";
			jsonPreview.innerHTML+=saveCanvas(allCanvas[i])+"<br/>";
			//resetCanvas(allCanvas[i]);///
		}
		//updateInfoLabel("Saved");
	}else{
		var jsonPreview = document.getElementById('jsonPreview');
		jsonPreview.innerHTML="JSON INFOS:<br/>";
		//updateInfoLabel("Nothing to Save");
	}
}

function saveCanvas(tempcanvas){
	/*var ctx = tempcanvas.getContext("2d");
	var imgData=ctx.getImageData(0,0,canvasWidth,canvasHeight);
	var data=imgData.data;
	for(var i=0;i<data.length;i+=4){
		if(data[i+3]<255){
			data[i]=255-data[i];
			data[i+1]=255-data[i+1];
			data[i+2]=255-data[i+2];
			data[i+3]=255-data[i+3];
		}
	}
	ctx.putImageData(imgData,0,0);*/
	return tempcanvas.toDataURL("image/jpeg");
}

/*function resetCanvas(tempcanvas){
	var ctx = tempcanvas.getContext("2d");
	var imgData=ctx.getImageData(0,0,canvasWidth,canvasHeight);
	var data=imgData.data;
	for(var i=0;i<data.length;i+=4){
		if(data[i+3]<255){
			data[i]=255-data[i];
			data[i+1]=255-data[i+1];
			data[i+2]=255-data[i+2];
			data[i+3]=255-data[i+3];
		}
	}
	ctx.putImageData(imgData,0,0);
}*/

function getBoundingBox(tempcanvas){
	//Return [x,y,w,h]
	var tempcontext = tempcanvas.getContext("2d");
	var imageData = tempcontext.getImageData(0,0,canvasWidth,canvasHeight);
	var data = imageData.data;
	var maxX = 0;
	var maxY = 0;
	var minX = canvasWidth;
	var minY = canvasHeight;
	var xTemp;
	var yTemp;
	for(var k=0;k<data.length;k+=4){
		//if(data[k+3]==255)
		//if(data[k]==0 && data[k+1]==0 && data[k+2]==0 && data[k+3]==255){
		if(!(data[k]==255 && data[k+1]==255 && data[k+2]==255)){
			xTemp=(k/4)%canvasWidth;
			yTemp=Math.trunc((k/4)/canvasWidth);
			if(xTemp>maxX) maxX=xTemp;
			if(yTemp>maxY) maxY=yTemp;
			if(xTemp<minX) minX=xTemp;
			if(yTemp<minY) minY=yTemp;		
		}
	}
	return [minX,minY,maxX-minX+1,maxY-minY+1];
	//alert(pixelData);
}

function getAllLayerCanvas(){
	var canvasList = new Array();
	for(var i=0;i<layerCount;i++){
		var templayer = document.getElementById('canvas'+i);
		//alert(templayer);
		canvasList.push(templayer);
	}
	return canvasList;
}

function addClick(x,y,dragging){
	clickX.push(x);
	clickY.push(y);
	clickDrag.push(dragging);
	clickColor.push(curColor);
	clickSize.push(curSize);
}

function resetClick(){
	clickX=new Array();
	clickY=new Array();
	clickDrag=new Array();
	clickColor=new Array();
	clickSize=new Array();
}

function getCurrentLayerCanvas(){
	var tempcanvas = document.createElement('canvas');
	tempcanvas.setAttribute('id', "canvas"+layerCount);///////
	tempcanvas.setAttribute('width', canvasWidth);
	tempcanvas.setAttribute('height', canvasHeight);
	tempcanvas.setAttribute("layerType",layerTypeUsed);
	tempcanvas.setAttribute("modelType",whichEngineModelToUse);	//###
	if(typeof G_vmlCanvasManager != 'undefined') {
		canvas = G_vmlCanvasManager.initElement(canvas);
	}
	var tempcontext = tempcanvas.getContext("2d");
	tempcontext.lineJoin = "round";
	/////////
	tempcontext.fillStyle = colorWhite;
	tempcontext.fillRect(0,0,canvasWidth,canvasHeight);
	/////////
	for(var i=0; i < clickX.length; i++){		
		tempcontext.beginPath();
		if(clickDrag[i] && i){
			tempcontext.moveTo(clickX[i-1], clickY[i-1]);
		}else{
			tempcontext.moveTo(clickX[i]-1, clickY[i]);
		}
		tempcontext.lineTo(clickX[i], clickY[i]);
		tempcontext.closePath();
		tempcontext.strokeStyle = clickColor[i];
		tempcontext.lineWidth = clickSize[i];
		tempcontext.stroke();
	}
	return tempcanvas;
}

function redrawPoint(){
	context.lineJoin = "round";
	context.beginPath();
	context.arc(mouseX,mouseY,curSize/2,0*Math.PI,2*Math.PI);
	context.closePath();
	context.fillStyle = curColor;
	context.fill();
}

function redrawBis(x,y){
	context.lineJoin = "round";
	context.beginPath();
	context.moveTo(mouseX,mouseY);
	context.lineTo(x,y);
	context.closePath();
	context.strokeStyle = curColor;
	context.lineWidth = curSize;
	context.stroke();
}

function importModel(){
	resetPage();
	//resetInput();
	var name = document.getElementById('fileInput'); 
	var file = name.files[0];           
	var reader = new FileReader();
	reader.onload = function(event) {
		json = event.target.result;
		//alert(json);
		//alert("UpdateClient");
		updateClientUiState(json);
		/*alert("PostPictureEngine");
		postPictureEngineV2();
		alert("updateMainCanvas");
		updateMainCanvas();*/
	}
	reader.readAsText(file);
	resetInput();
}

function updateClientUiState(json){
	var jsonParse = JSON.parse(json);

	//var typeOfDiagram = jsonParse.usedModel;
	/*if(typeOfDiagram=="class"){
		setClassDiagramEngine();
	}else if(typeOfDiagram=="sequence"){
		setSequenceDiagramEngine();
	}else if(typeOfDiagram=="logic"){
		setLogicDiagramEngine();
	}else if(typeOfDiagram=="simulink"){
		setSimulinkDiagramEngine();
	}*/
	setDiagramEngine(tabModels[0]);
	var shapes = jsonParse.shapes;
	var texts = jsonParse.texts;
	//alert(shapes.length);
	for(var i=0;i<shapes.length;i++){
		//addShapeImported(jsonParse.shapes[i].uri,i,"shape",texts.length+shapes.length);
		//setDiagramEngine(jsonParse.shapes[i].model);
		addShapeImported(jsonParse.shapes[i].uri,jsonParse.shapes[i].model,i,"shape",texts.length+shapes.length);
	}

	for(var i=shapes.length;i<shapes.length+texts.length;i++){
		//addShapeImported(jsonParse.texts[i-shapes.length].uri,i,"text",texts.length+shapes.length);
		addShapeImported(jsonParse.texts[i-shapes.length].uri,jsonParse.shapes[i-shapes.length].model,i,"text",texts.length+shapes.length);
	}
}

function addShapeImported(uri,model,i,layertype,numberOfImportedPictures){		// jsonPart = part of the JSON for ONE shape
	//if(clickX.length>=1 && notAllWhite()){
	var layerDisplay = document.getElementById('layerDisplay');
	//Creation of the layerView
	var layerView = document.createElement("div");
	layerView.setAttribute('id', "layerView"+i);///
	layerView.setAttribute('class', "layerView");
	//Creation of the layerDiv=================================================================================
	var layerDiv = document.createElement("div");
	layerDiv.setAttribute('id', "layer"+i);///
	layerDiv.setAttribute('class', "layer");
	layerDiv.setAttribute('style', "width:"+canvasWidth+"px; height:"+canvasHeight+"px;");
	var tempcanvas = document.createElement("canvas");
	tempcanvas.setAttribute('width', canvasWidth);
	tempcanvas.setAttribute('height', canvasHeight);
	tempcanvas.setAttribute('id', "canvas"+i);
	tempcanvas.setAttribute('layertype', layertype);
	tempcanvas.setAttribute('modeltype', model);

	var ctx = tempcanvas.getContext('2d');
	var img = new Image;
	img.onload = function(){
		//alert("loadImg");
		ctx.drawImage(img,0,0); // Or at whatever offset you like

		layerDiv.appendChild(tempcanvas);
		layerView.appendChild(layerDiv);

		var layerSuppressButton = document.createElement("button");
		layerSuppressButton.setAttribute('id', "layerSuppressButton"+i);///
		layerSuppressButton.setAttribute('class', "layerSuppressButton");
		layerSuppressButton.setAttribute('onclick', "suppressLayer("+i+")");///
		layerSuppressButton.innerHTML = "DELETE LAYER "+i;
		layerView.appendChild(layerSuppressButton);

		var layerChangeTypeButton = document.createElement("button");
		layerChangeTypeButton.setAttribute('id', "layerChangeTypeButton"+i);///
		layerChangeTypeButton.setAttribute('class', "layerChangeTypeButton");
		layerChangeTypeButton.setAttribute('onclick', "changeTypeLayer("+i+")");///
		var toto = "SHAPE";
		if(layerTypeUsed=="shape"){
			toto="TEXT";
		}
		layerChangeTypeButton.innerHTML = "CHANGE TYPE OF LAYER "+i+" TO "+toto;
		layerView.appendChild(layerChangeTypeButton);
		
		var layerChangeModelSpinner = document.createElement("select");
		layerChangeModelSpinner.setAttribute("id","layerChangeModelSpinner"+i);

		for(var k=0;k<tabModels.length;k++){
			var option = document.createElement("option");
			option.setAttribute("value",tabModels[k]);
			option.innerHTML = tabModelsMaj[k];
			layerChangeModelSpinner.appendChild(option);
		}
		
		/*var optionClass = document.createElement("option");
		optionClass.setAttribute("value","class");
		optionClass.innerHTML = "Class";
		layerChangeModelSpinner.appendChild(optionClass);

		var optionSequence = document.createElement("option");
		optionSequence.setAttribute("value","sequence");
		optionSequence.innerHTML = "Sequence";
		layerChangeModelSpinner.appendChild(optionSequence);

		var optionLogic = document.createElement("option");
		optionLogic.setAttribute("value","logic");
		optionLogic.innerHTML = "Logic";
		layerChangeModelSpinner.appendChild(optionLogic);
		
		var optionSimulink = document.createElement("option");
		optionSimulink.setAttribute("value","simulink");
		optionSimulink.innerHTML = "Simulink";
		layerChangeModelSpinner.appendChild(optionSimulink);*/

		layerChangeModelSpinner.value=model;
		//alert(layerChangeModelSpinner.value);
		layerChangeModelSpinner.setAttribute("onchange","changeTypeModel("+i+","+"\"layerChangeModelSpinner\""+")");

		layerView.appendChild(layerChangeModelSpinner);
		layerDisplay.insertBefore(layerView,layerDisplay.firstChild);
		
		//ADD A THUMBNAIL
		var thumbnailDiv = document.getElementById('thumbnailDiv');
		var thumbnailImageDiv = document.createElement("div");
		thumbnailImageDiv.setAttribute('id', "thumbnailImageDiv"+layerCount);
		thumbnailImageDiv.setAttribute('class', "thumbnailImageDivision");
		var thumbnailImage = document.createElement("img");
		thumbnailImage.setAttribute('src', uri);
		thumbnailImage.setAttribute("id","thumbnailImage"+layerCount);
		thumbnailImage.setAttribute("class","thumbnailImageClass");
		
		thumbnailImageDiv.appendChild(thumbnailImage);
		
		var thumbnailButtonsDiv = document.createElement("div");
		thumbnailButtonsDiv.setAttribute("class","buttonsDiv");
		
		var thumbnailSuppressButton = document.createElement("button");
		thumbnailSuppressButton.setAttribute('id', "thumbnailSuppressButton"+layerCount);///
		thumbnailSuppressButton.setAttribute('class', "thumbnailSuppressButton");
		thumbnailSuppressButton.setAttribute('onclick', "suppressLayer("+layerCount+")");///
		//thumbnailSuppressButton.innerHTML = "DELETE LAYER "+layerCount;
		thumbnailButtonsDiv.appendChild(thumbnailSuppressButton);

		var thumbnailChangeTypeButton = document.createElement("button");
		thumbnailChangeTypeButton.setAttribute('id', "thumbnailChangeTypeButton"+layerCount);///
		//thumbnailChangeTypeButton.setAttribute('class', "thumbnailChangeTypeButton");
		thumbnailChangeTypeButton.setAttribute('onclick', "changeTypeLayer("+layerCount+")");///
		thumbnailChangeTypeButton.setAttribute('class', "thumbnailChangeTypeButtonToShape");
		if(layerTypeUsed=="shape"){
			thumbnailChangeTypeButton.setAttribute('class', "thumbnailChangeTypeButtonToText");
		}
		//thumbnailChangeTypeButton.innerHTML = "CHANGE TYPE OF LAYER "+layerCount+" TO "+toto;
		thumbnailButtonsDiv.appendChild(thumbnailChangeTypeButton);

		var thumbnailChangeModelSpinner = document.createElement("select");
		thumbnailChangeModelSpinner.setAttribute("id","thumbnailChangeModelSpinner"+layerCount);

		for(var k=0;k<tabModels.length;k++){
			var option = document.createElement("option");
			option.setAttribute("value",tabModels[k]);
			option.innerHTML = tabModelsMaj[k];
			thumbnailChangeModelSpinner.appendChild(option);
		}
		
		/*var optionClass = document.createElement("option");
		optionClass.setAttribute("value","class");
		optionClass.innerHTML = "Class";
		thumbnailChangeModelSpinner.appendChild(optionClass);

		var optionSequence = document.createElement("option");
		optionSequence.setAttribute("value","sequence");
		optionSequence.innerHTML = "Sequence";
		thumbnailChangeModelSpinner.appendChild(optionSequence);

		var optionLogic = document.createElement("option");
		optionLogic.setAttribute("value","logic");
		optionLogic.innerHTML = "Logic";
		thumbnailChangeModelSpinner.appendChild(optionLogic);
		
		var optionSimulink = document.createElement("option");
		optionSimulink.setAttribute("value","simulink");
		optionSimulink.innerHTML = "Simulink";
		thumbnailChangeModelSpinner.appendChild(optionSimulink);*/

		thumbnailChangeModelSpinner.value=model;
		//alert(layerChangeModelSpinner.value);
		thumbnailChangeModelSpinner.setAttribute("onchange","changeTypeModel("+layerCount+","+"\"thumbnailChangeModelSpinner\""+")");

		thumbnailButtonsDiv.appendChild(thumbnailChangeModelSpinner);
		
		thumbnailImageDiv.appendChild(thumbnailButtonsDiv);
		
		thumbnailDiv.insertBefore(thumbnailImageDiv,thumbnailDiv.firstChild);

		//updateInfoLabel("Imported pictures : "+(i+1)+"/"+numberOfImportedPictures);
		layerCount=i+1;
		if(layerCount==numberOfImportedPictures){
			//alert("PostPictureEngine");
			postPictureEngineV2();
			//alert("updateMainCanvas");
			updateMainCanvas();
		}
		//alert("updateMainCanvas");
		//updateMainCanvas();///////////UPDATEEEEEEEEEEEEEEe
	};
	img.src = uri;


	//}
}

function exportModelWithFilters(){
	var xhr = new XMLHttpRequest();
	var url = "exportModelWithFilters";
	xhr.onreadystatechange = function() {
		if(xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {		// 200 quand on sera en NETWORK
			var json=xhr.responseText;
			//prompt("Copy to clipboard: Ctrl+C, Enter",json);
			download("model.json",json);
		}
	}

	xhr.open("POST", url, true);

	xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");


	var canvasList = getAllLayerCanvas();
	var shapeCanvasList = new Array();
	var textCanvasList = new Array();
	for(var i=0;i<canvasList.length;i++){
		if(canvasList[i].getAttribute("layertype")=="shape"){
			shapeCanvasList.push(canvasList[i]);
		}
		if(canvasList[i].getAttribute("layertype")=="text"){
			textCanvasList.push(canvasList[i]);
		}
	}
	//var request = "engineModel="+whichEngineModelToUse;
	var request = "shapeLayersSize="+shapeCanvasList.length;
	request += "&textLayersSize="+textCanvasList.length;
	var sizeShapeCanvasList = shapeCanvasList.length;
	for(var i=0;i<sizeShapeCanvasList;i++){
		var uri = saveCanvas(shapeCanvasList[i]);
		//resetCanvas(shapeCanvasList[i]);
		var bbox = getBoundingBox(shapeCanvasList[i]);
		var modelType = shapeCanvasList[i].getAttribute("modeltype");

		//if(i!=0)
		request+="&model"+i+"="+modelType+"&uri"+i+"="+uri+"&x"+i+"="+bbox[0]+"&y"+i+"="+bbox[1]+"&w"+i+"="+bbox[2]+"&h"+i+"="+bbox[3];
		/*else
			request+="uri"+i+"="+uri+"&x"+i+"="+bbox[0]+"&y"+i+"="+bbox[1]+"&w"+i+"="+bbox[2]+"&h"+i+"="+bbox[3];*/
	}
	for(var i=0;i<textCanvasList.length;i++){
		var uri = saveCanvas(textCanvasList[i]);
		//resetCanvas(textCanvasList[i]);
		var bbox = getBoundingBox(textCanvasList[i]);
		var modelType = textCanvasList[i].getAttribute("modeltype");
		//if(i!=0)
		request+="&model"+(i+sizeShapeCanvasList)+"="+modelType+"&uri"+(i+sizeShapeCanvasList)+"="+uri+"&x"+(i+sizeShapeCanvasList)+"="+bbox[0]+"&y"+(i+sizeShapeCanvasList)+"="+bbox[1]+"&w"+(i+sizeShapeCanvasList)+"="+bbox[2]+"&h"+(i+sizeShapeCanvasList)+"="+bbox[3];
		/*else
			request+="uri"+i+"="+uri+"&x"+i+"="+bbox[0]+"&y"+i+"="+bbox[1]+"&w"+i+"="+bbox[2]+"&h"+i+"="+bbox[3];*/
	}

	//alert(request);
	xhr.send(request);
}


function exportModel(){
	var xhr = new XMLHttpRequest();
	var url = "exportModel";
	xhr.onreadystatechange = function() {
		if(xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {		// 200 quand on sera en NETWORK
			var json=xhr.responseText;
			//prompt("Copy to clipboard: Ctrl+C, Enter",json);
			download("model.json",json);
		}
	}

	xhr.open("POST", url, true);

	xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");


	var canvasList = getAllLayerCanvas();
	var shapeCanvasList = new Array();
	var textCanvasList = new Array();
	for(var i=0;i<canvasList.length;i++){
		if(canvasList[i].getAttribute("layerType")=="shape"){
			shapeCanvasList.push(canvasList[i]);
		}
		if(canvasList[i].getAttribute("layerType")=="text"){
			textCanvasList.push(canvasList[i]);
		}
	}
	var request = "engineModel="+whichEngineModelToUse;
	request += "&shapeLayersSize="+shapeCanvasList.length;
	request += "&textLayersSize="+textCanvasList.length;
	var sizeShapeCanvasList = shapeCanvasList.length;
	for(var i=0;i<sizeShapeCanvasList;i++){
		var uri = saveCanvas(shapeCanvasList[i]);
		//resetCanvas(shapeCanvasList[i]);
		var bbox = getBoundingBox(shapeCanvasList[i]);
		//if(i!=0)
		request+="&uri"+i+"="+uri+"&x"+i+"="+bbox[0]+"&y"+i+"="+bbox[1]+"&w"+i+"="+bbox[2]+"&h"+i+"="+bbox[3];
		/*else
			request+="uri"+i+"="+uri+"&x"+i+"="+bbox[0]+"&y"+i+"="+bbox[1]+"&w"+i+"="+bbox[2]+"&h"+i+"="+bbox[3];*/
	}
	for(var i=0;i<textCanvasList.length;i++){
		var uri = saveCanvas(textCanvasList[i]);
		//resetCanvas(textCanvasList[i]);
		var bbox = getBoundingBox(textCanvasList[i]);
		//if(i!=0)
		request+="&uri"+(i+sizeShapeCanvasList)+"="+uri+"&x"+(i+sizeShapeCanvasList)+"="+bbox[0]+"&y"+(i+sizeShapeCanvasList)+"="+bbox[1]+"&w"+(i+sizeShapeCanvasList)+"="+bbox[2]+"&h"+(i+sizeShapeCanvasList)+"="+bbox[3];
		/*else
			request+="uri"+i+"="+uri+"&x"+i+"="+bbox[0]+"&y"+i+"="+bbox[1]+"&w"+i+"="+bbox[2]+"&h"+i+"="+bbox[3];*/
	}

	xhr.send(request);
}

function download(filename, text) {
	var element = document.createElement('a');
	element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
	element.setAttribute('download', filename);

	element.style.display = 'none';
	document.body.appendChild(element);

	element.click();

	document.body.removeChild(element);
}

function postPictureEngineV2(){
	var xhr = new XMLHttpRequest();
	var url = "postPictureEngineV2";
	xhr.onreadystatechange = function() {
		if(xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {		// 200 quand on sera en NETWORK
			var engineDiv = document.getElementById("engineDiv");
			var paraph = document.createElement("p");
			var response = xhr.responseText.split("%split%");
			paraph.innerHTML=response[0];
			shouldILoop=0;
			if(whichEngineModelToUse=="class"){
				/*var plantuml = document.getElementById("plantUmlImg");
				plantuml.setAttribute("uml",response[1]);
				plantuml.removeAttribute("src");
				plantuml_runonce();*/
				diagramDiv = document.getElementById("myDiagramDiv");
				if(go.Diagram.fromDiv(diagramDiv)!=null){
					go.Diagram.fromDiv(diagramDiv).div = null;
				}
				initClass(response[1]);		// the loadFromJSON is made in initClass
				//loadFromJSONClass(response[1]);
			}
			if(whichEngineModelToUse=="sequence"){
				diagramDiv = document.getElementById("myDiagramDiv");
				if(go.Diagram.fromDiv(diagramDiv)!=null){
					go.Diagram.fromDiv(diagramDiv).div = null;
				}
				initSequence();
				loadFromJSONSequence(response[1]);
			}
			if(whichEngineModelToUse=="logic"){
				shouldILoop=1;
				diagramDiv = document.getElementById("myDiagramDiv");
				if(go.Diagram.fromDiv(diagramDiv)!=null){
					go.Diagram.fromDiv(diagramDiv).div = null;
				}
				initLogic();
				loadFromJSONLogic(response[1]);
			}
			if(whichEngineModelToUse=="simulink"){
				diagramDiv = document.getElementById("myDiagramDiv");
				if(go.Diagram.fromDiv(diagramDiv)!=null){
					go.Diagram.fromDiv(diagramDiv).div = null;
				}
				initSimulink();
				loadFromJSONSimulink(response[1]);
			}
			//engineDiv.appendChild(paraph);
			engineDiv.insertBefore(paraph,engineDiv.firstChild);
		}
	}

	xhr.open("POST", url, true);

	xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");


	var canvasList = getAllLayerCanvas();
	var shapeCanvasList = new Array();
	var textCanvasList = new Array();
	for(var i=0;i<canvasList.length;i++){
		if(canvasList[i].getAttribute("layerType")=="shape"){
			if(canvasList[i].getAttribute("modelType")==whichEngineModelToUse){		//###
				shapeCanvasList.push(canvasList[i]);
			}
		}
		if(canvasList[i].getAttribute("layerType")=="text"){
			textCanvasList.push(canvasList[i]);
		}
	}
	var request = "engineModel="+whichEngineModelToUse;
	request += "&shapeLayersSize="+shapeCanvasList.length;
	request += "&textLayersSize="+textCanvasList.length;
	var sizeShapeCanvasList = shapeCanvasList.length;
	for(var i=0;i<sizeShapeCanvasList;i++){
		var uri = saveCanvas(shapeCanvasList[i]);
		//resetCanvas(shapeCanvasList[i]);
		var bbox = getBoundingBox(shapeCanvasList[i]);
		//if(i!=0)
		request+="&uri"+i+"="+uri+"&x"+i+"="+bbox[0]+"&y"+i+"="+bbox[1]+"&w"+i+"="+bbox[2]+"&h"+i+"="+bbox[3];
		/*else
			request+="uri"+i+"="+uri+"&x"+i+"="+bbox[0]+"&y"+i+"="+bbox[1]+"&w"+i+"="+bbox[2]+"&h"+i+"="+bbox[3];*/
	}
	for(var i=0;i<textCanvasList.length;i++){
		var uri = saveCanvas(textCanvasList[i]);
		//resetCanvas(textCanvasList[i]);
		var bbox = getBoundingBox(textCanvasList[i]);
		//if(i!=0)
		request+="&uri"+(i+sizeShapeCanvasList)+"="+uri+"&x"+(i+sizeShapeCanvasList)+"="+bbox[0]+"&y"+(i+sizeShapeCanvasList)+"="+bbox[1]+"&w"+(i+sizeShapeCanvasList)+"="+bbox[2]+"&h"+(i+sizeShapeCanvasList)+"="+bbox[3];
		/*else
			request+="uri"+i+"="+uri+"&x"+i+"="+bbox[0]+"&y"+i+"="+bbox[1]+"&w"+i+"="+bbox[2]+"&h"+i+"="+bbox[3];*/
	}

	xhr.send(request);
}

function addLayer(){
	if(clickX.length>=1 && notAllWhite()){
		// ADD A LAYER DIV WITH A CANVAS IN AN HIDDEN DIV =============================================================================0
		var layerDisplay = document.getElementById('layerDisplay');
		//Creation of the layerView
		var layerView = document.createElement("div");
		layerView.setAttribute('id', "layerView"+layerCount);///
		layerView.setAttribute('class', "layerView");
		//Creation of the layerDiv=================================================================================
		var layerDiv = document.createElement("div");
		layerDiv.setAttribute('id', "layer"+layerCount);///
		layerDiv.setAttribute('class', "layer");
		layerDiv.setAttribute('style', "width:"+canvasWidth+"px; height:"+canvasHeight+"px;");
		var tempcanvas = getCurrentLayerCanvas();
		var uri = saveCanvas(tempcanvas);
		//resetCanvas(tempcanvas);
		var bbox = getBoundingBox(tempcanvas);
		layerDiv.appendChild(tempcanvas);
		layerView.appendChild(layerDiv);
		//layerDisplay.appendChild(layerDiv);
		//Creation of the button to suppress a layer
		var layerSuppressButton = document.createElement("button");
		layerSuppressButton.setAttribute('id', "layerSuppressButton"+layerCount);///
		layerSuppressButton.setAttribute('class', "layerSuppressButton");
		layerSuppressButton.setAttribute('onclick', "suppressLayer("+layerCount+")");///
		layerSuppressButton.innerHTML = "DELETE LAYER "+layerCount;
		layerView.appendChild(layerSuppressButton);

		var layerChangeTypeButton = document.createElement("button");
		layerChangeTypeButton.setAttribute('id', "layerChangeTypeButton"+layerCount);///
		layerChangeTypeButton.setAttribute('class', "layerChangeTypeButton");
		layerChangeTypeButton.setAttribute('onclick', "changeTypeLayer("+layerCount+")");///
		var toto = "SHAPE";
		if(layerTypeUsed=="shape"){
			toto="TEXT";
		}
		layerChangeTypeButton.innerHTML = "CHANGE TYPE OF LAYER "+layerCount+" TO "+toto;
		layerView.appendChild(layerChangeTypeButton);

		var layerChangeModelSpinner = document.createElement("select");
		layerChangeModelSpinner.setAttribute("id","layerChangeModelSpinner"+layerCount);

		for(var i=0;i<tabModels.length;i++){
			var option = document.createElement("option");
			option.setAttribute("value",tabModels[i]);
			option.innerHTML = tabModelsMaj[i];
			layerChangeModelSpinner.appendChild(option);
		}

		layerChangeModelSpinner.value=whichEngineModelToUse;
		//alert(layerChangeModelSpinner.value);
		layerChangeModelSpinner.setAttribute("onchange","changeTypeModel("+layerCount+","+"\"layerChangeModelSpinner\""+")");

		layerView.appendChild(layerChangeModelSpinner);

		//
		/*var layerInfo = var layerView = document.createElement("div");
		layerInfo.setAttribute('id', "layerInfo"+layerCount);
		layerInfo.innerHTML="Not analyzed yet!";
		layerView.appendChild(layerInfo);*/
		//

		//layerDisplay.appendChild(layerSuppressButton);
		//layerDisplay.appendChild(layerView);
		layerDisplay.insertBefore(layerView,layerDisplay.firstChild);
		
		//ADD A THUMBNAIL
		var thumbnailDiv = document.getElementById('thumbnailDiv');
		var thumbnailImageDiv = document.createElement("div");
		thumbnailImageDiv.setAttribute('id', "thumbnailImageDiv"+layerCount);
		thumbnailImageDiv.setAttribute('class', "thumbnailImageDivision");
		var thumbnailImage = document.createElement("img");
		thumbnailImage.setAttribute('src', uri);
		thumbnailImage.setAttribute("id","thumbnailImage"+layerCount);
		thumbnailImage.setAttribute("class","thumbnailImageClass");
		
		thumbnailImageDiv.appendChild(thumbnailImage);
		
		var thumbnailButtonsDiv = document.createElement("div");
		thumbnailButtonsDiv.setAttribute("class","buttonsDiv");
		
		var thumbnailSuppressButton = document.createElement("button");
		thumbnailSuppressButton.setAttribute('id', "thumbnailSuppressButton"+layerCount);///
		thumbnailSuppressButton.setAttribute('class', "thumbnailSuppressButton");
		thumbnailSuppressButton.setAttribute('onclick', "suppressLayer("+layerCount+")");///
		//thumbnailSuppressButton.innerHTML = "DELETE LAYER "+layerCount;
		thumbnailButtonsDiv.appendChild(thumbnailSuppressButton);

		var thumbnailChangeTypeButton = document.createElement("button");
		thumbnailChangeTypeButton.setAttribute('id', "thumbnailChangeTypeButton"+layerCount);///
		//thumbnailChangeTypeButton.setAttribute('class', "thumbnailChangeTypeButton");
		thumbnailChangeTypeButton.setAttribute('onclick', "changeTypeLayer("+layerCount+")");///
		
		thumbnailChangeTypeButton.setAttribute('class', "thumbnailChangeTypeButtonToShape");
		if(layerTypeUsed=="shape"){
			thumbnailChangeTypeButton.setAttribute('class', "thumbnailChangeTypeButtonToText");
		}
		//thumbnailChangeTypeButton.innerHTML = "CHANGE TYPE OF LAYER "+layerCount+" TO "+toto;
		thumbnailButtonsDiv.appendChild(thumbnailChangeTypeButton);

		var thumbnailChangeModelSpinner = document.createElement("select");
		thumbnailChangeModelSpinner.setAttribute("id","thumbnailChangeModelSpinner"+layerCount);

		for(var i=0;i<tabModels.length;i++){
			var option = document.createElement("option");
			option.setAttribute("value",tabModels[i]);
			option.innerHTML = tabModelsMaj[i];
			thumbnailChangeModelSpinner.appendChild(option);
		}
		
		/*var optionClass = document.createElement("option");
		optionClass.setAttribute("value","class");
		optionClass.innerHTML = "Class";
		thumbnailChangeModelSpinner.appendChild(optionClass);

		var optionSequence = document.createElement("option");
		optionSequence.setAttribute("value","sequence");
		optionSequence.innerHTML = "Sequence";
		thumbnailChangeModelSpinner.appendChild(optionSequence);

		var optionLogic = document.createElement("option");
		optionLogic.setAttribute("value","logic");
		optionLogic.innerHTML = "Logic";
		thumbnailChangeModelSpinner.appendChild(optionLogic);
		
		var optionSimulink = document.createElement("option");
		optionSimulink.setAttribute("value","simulink");
		optionSimulink.innerHTML = "Simulink";
		thumbnailChangeModelSpinner.appendChild(optionSimulink);*/

		thumbnailChangeModelSpinner.value=whichEngineModelToUse;
		//alert(layerChangeModelSpinner.value);
		thumbnailChangeModelSpinner.setAttribute("onchange","changeTypeModel("+layerCount+","+"\"thumbnailChangeModelSpinner\""+")");

		thumbnailButtonsDiv.appendChild(thumbnailChangeModelSpinner);
		
		thumbnailImageDiv.appendChild(thumbnailButtonsDiv);
		
		thumbnailDiv.insertBefore(thumbnailImageDiv,thumbnailDiv.firstChild);
		
		//updateInfoLabel("Layer"+layerCount+" Added");
		//updateTimeLabel("Drawing added !");
		layerCount++;
		resetClick();
		postPictureEngineV2();
	}
}

function changeTypeModel(n,spinnerName){
	var layerDisplay = document.getElementById('layerDisplay');
	var layerViewList = getAllLayerView();

	var canvasN = document.getElementById('canvas'+n);
	var model = document.getElementById(spinnerName+n).value;
	
	document.getElementById("thumbnailChangeModelSpinner"+n).value=model;
	document.getElementById("layerChangeModelSpinner"+n).value=model;
	
	canvasN.setAttribute("modeltype",model);
	deleteUriFromHashMapToRecogniseChangedModel(n);
	//if(getAllLayerCanvas().length>=1){
	/*if(model == "class"){
		setClassDiagramEngine();
	}else if(model == "sequence"){
		setSequenceDiagramEngine();
	}else if(model == "logic"){
		setLogicDiagramEngine();
	}else if(model == "simulink"){
		setSimulinkDiagramEngine();
	}*/
	setDiagramEngine(model);
	postPictureEngineV2();
	//}
}

function deleteUriFromHashMapToRecogniseChangedModel(n){
	var xhr = new XMLHttpRequest();
	var url = "deleteUriFromHashMapToRecogniseChangedModel";
	xhr.onreadystatechange = function() {
		if(xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {		// 200 quand on sera en NETWORK
			if(getAllLayerCanvas().length>=1){
				postPictureEngineV2();
			}
		}
	}

	xhr.open("POST", url, true);

	xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

	var canvasN = document.getElementById('canvas'+n);
	var uri = saveCanvas(canvasN);
	//resetCanvas(canvasN);
	
	var request = "uri="+uri;

	xhr.send(request);
}

function suppressLayer(n){
	//Remove Picture from thumbnailDiv
	var thumbnailDiv = document.getElementById("thumbnailDiv");
	var thumbnailImageDivList = getAllThumbnailImageDiv();
	thumbnailDiv.removeChild(thumbnailImageDivList[n]);
	updateAllThumbnailID(n);
	
	//Remove Layer from layerDiv
	var layerDisplay = document.getElementById('layerDisplay');
	var layerViewList = getAllLayerView();
	layerDisplay.removeChild(layerViewList[n]);
	updateAllLayerID(n);
	
	//updateAllID(n);
	
	
	//updateInfoLabel("Layer"+n+" Deleted");
	layerCount--;
	if(getAllLayerCanvas().length>=1){
		postPictureEngineV2();
	}
	updateMainCanvas();
}
function changeTypeLayer(n){
	var layerDisplay = document.getElementById('layerDisplay');
	var layerViewList = getAllLayerView();

	var canvasN = document.getElementById('canvas'+n);
	var buttonChangeTypeLayer = document.getElementById("layerChangeTypeButton"+n);
	var thumbnailButtonChangeTypeLayer = document.getElementById("thumbnailChangeTypeButton"+n);
	var type = canvasN.getAttribute('layertype');
	if(type=='shape'){
		canvasN.setAttribute('layertype','text');
		buttonChangeTypeLayer.innerHTML = "CHANGE TYPE OF LAYER "+n+" TO SHAPE";
		//thumbnailButtonChangeTypeLayer.innerHTML = "CHANGE TYPE OF LAYER "+n+" TO SHAPE";
		thumbnailButtonChangeTypeLayer.setAttribute('class', "thumbnailChangeTypeButtonToShape");
	}
	else{
		canvasN.setAttribute('layertype','shape');
		buttonChangeTypeLayer.innerHTML = "CHANGE TYPE OF LAYER "+n+" TO TEXT";
		//thumbnailButtonChangeTypeLayer.innerHTML = "CHANGE TYPE OF LAYER "+n+" TO TEXT";
		thumbnailButtonChangeTypeLayer.setAttribute('class', "thumbnailChangeTypeButtonToText");
	}

	//updateInfoLabel("Layer"+n+" changed type");
	if(getAllLayerCanvas().length>=1){
		postPictureEngineV2();
	}
}

function updateAllLayerID(n){
	var allLayerView = getAllLayerView();
	var allLayerDiv = getAllLayerDiv();
	var allLayerCanvas = getAllLayerCanvas();
	var allLayerSuppressButton = getAllLayerSuppressButton();
	var allLayerChangeTypeButton = getAllLayerChangeTypeButton();
	var allLayerSpinnerModel = getAllLayerSpinnerModel();
	//var allLayerInfo = getAllLayerInfo();//////
	for(var i=n+1;i<layerCount;i++){
		allLayerView[i].setAttribute('id', "layerView"+(i-1));
		allLayerDiv[i].setAttribute('id', "layer"+(i-1));
		allLayerCanvas[i].setAttribute('id', "canvas"+(i-1));
		allLayerSuppressButton[i].setAttribute('id', "layerSuppressButton"+(i-1));
		allLayerSuppressButton[i].setAttribute('onclick', "suppressLayer("+(i-1)+")");
		allLayerSuppressButton[i].innerHTML = "DELETE LAYER "+(i-1);
		allLayerChangeTypeButton[i].setAttribute('id', "layerChangeTypeButton"+(i-1));
		allLayerChangeTypeButton[i].setAttribute('onclick', "changeTypeLayer("+(i-1)+")");
		
		
		if(allLayerCanvas[i].getAttribute("layertype")=="shape"){
			allLayerChangeTypeButton[i].innerHTML = "CHANGE TYPE OF LAYER "+(i-1)+" TO TEXT";
		}else{
			allLayerChangeTypeButton[i].innerHTML = "CHANGE TYPE OF LAYER "+(i-1)+" TO SHAPE";
		}
		allLayerSpinnerModel[i].setAttribute("id","layerChangeModelSpinner"+(i-1));
		allLayerSpinnerModel[i].setAttribute("onchange","changeTypeModel("+(i-1)+","+"\"layerChangeModelSpinner\""+")");

		//allLayerInfo[i].setAttribute("id","layerInfo"+(i-1));/////
	}
}
function updateAllThumbnailID(n){
	var allThumbnailImageDiv = getAllThumbnailImageDiv();
	var allThumbnailImage = getAllThumbnailImage();
	
	var allThumbnailSuppressButton = getAllThumbnailSuppressButton();
	var allThumbnailSpinnerModel = getAllThumbnailSpinnerModel();
	var allThumbnailChangeTypeButton = getAllThumbnailChangeTypeButton();
	var allLayerCanvas = getAllLayerCanvas();
	
	for(var i=n+1;i<layerCount;i++){
		allThumbnailImageDiv[i].setAttribute("id","thumbnailImageDiv"+(i-1));
		allThumbnailImage[i].setAttribute("id","thumbnailImage"+(i-1));
		
		allThumbnailSuppressButton[i].setAttribute('id', "thumbnailSuppressButton"+(i-1));
		allThumbnailSuppressButton[i].setAttribute('onclick', "suppressLayer("+(i-1)+")");
		//allThumbnailSuppressButton[i].innerHTML = "DELETE LAYER "+(i-1);
		allThumbnailChangeTypeButton[i].setAttribute('id', "thumbnailChangeTypeButton"+(i-1));
		allThumbnailChangeTypeButton[i].setAttribute('onclick', "changeTypeLayer("+(i-1)+")");
		
		if(allLayerCanvas[i].getAttribute("layertype")=="shape"){
			//allThumbnailChangeTypeButton[i].innerHTML = "CHANGE TYPE OF LAYER "+(i-1)+" TO TEXT";
			allThumbnailChangeTypeButton[i].setAttribute('class', "thumbnailChangeTypeButtonToText");
		}else{
			//allThumbnailChangeTypeButton[i].innerHTML = "CHANGE TYPE OF LAYER "+(i-1)+" TO SHAPE";
			allThumbnailChangeTypeButton[i].setAttribute('class', "thumbnailChangeTypeButtonToShape");
		}
		
		allThumbnailSpinnerModel[i].setAttribute("id","thumbnailChangeModelSpinner"+(i-1));
		allThumbnailSpinnerModel[i].setAttribute("onchange","changeTypeModel("+(i-1)+","+"\"thumbnailChangeModelSpinner\""+")");
	}
	
}

function updateMainCanvas(){
	var allLayerCanvas = getAllLayerCanvas();
	//alert("listCanvas");
	//alert(allLayerCanvas);
	//alert("endlistCanvas");
	context.clearRect(0, 0, canvasWidth, canvasHeight);
	context.fillStyle = colorWhite;
	context.fillRect(0,0,canvasWidth,canvasHeight);
	for(var i=0;i<allLayerCanvas.length;i++){
		var tempCanvas = allLayerCanvas[i];
		if(tempCanvas.getAttribute("modeltype")==currentFilter || currentFilter=="all"){		//###
			var tempContext = tempCanvas.getContext("2d");
			var imageData = tempContext.getImageData(0,0,canvasWidth,canvasHeight);
			var data = imageData.data;
			//var contextData = context.getImageData(0,0,canvasWidth,canvasHeight).data;
			var threshold = 16;
			for(var k=0;k<data.length;k+=4){
				//if(data[k+3]==255)
				//if(data[k]==0 && data[k+1]==0 && data[k+2]==0 && data[k+3]==255){
				if(!(data[k]>=threshold && data[k+1]>=threshold && data[k+2]>=threshold)){
					context.lineWidth = curSize;
					context.lineJoin = "round";
					context.beginPath();
					context.arc((k/4)%canvasWidth,(k/4)/canvasWidth,curSize/4,0*Math.PI,2*Math.PI);
					context.closePath();
					context.fillStyle = colorBlack;
					context.fill();
				}
			}
		}
	}
}

function getAllThumbnailSuppressButton(){
	var thumbnailSuppressButtonList = new Array();
	for(var i=0;i<layerCount;i++){
		var templayer = document.getElementById('thumbnailSuppressButton'+i);
		thumbnailSuppressButtonList.push(templayer);
	}
	return thumbnailSuppressButtonList;
}
function getAllThumbnailChangeTypeButton(){
	var thumbnailChangeTypeButtonList = new Array();
	for(var i=0;i<layerCount;i++){
		var templayer = document.getElementById('thumbnailChangeTypeButton'+i);
		thumbnailChangeTypeButtonList.push(templayer);
	}
	return thumbnailChangeTypeButtonList;
}
function getAllThumbnailSpinnerModel(){
	var thumbnailSpinnerModelList = new Array();
	for(var i=0;i<layerCount;i++){
		var tempSpinner = document.getElementById("thumbnailChangeModelSpinner"+i);
		thumbnailSpinnerModelList.push(tempSpinner);
	}
	return thumbnailSpinnerModelList;
}

function getAllLayerView(){
	var layerViewList = new Array();
	for(var i=0;i<layerCount;i++){
		var templayerview = document.getElementById('layerView'+i);
		layerViewList.push(templayerview);
	}
	return layerViewList;
}
function getAllThumbnailImageDiv(){
	var thumbnailImageDivList = new Array();
	for(var i=0;i<layerCount;i++){
		var tempThumbnailImageDiv = document.getElementById('thumbnailImageDiv'+i);
		thumbnailImageDivList.push(tempThumbnailImageDiv);
	}
	return thumbnailImageDivList;
}
function getAllThumbnailImage(){
	var thumbnailImageList = new Array();
	for(var i=0;i<layerCount;i++){
		var tempThumbnailImage = document.getElementById('thumbnailImage'+i);
		thumbnailImageList.push(tempThumbnailImage);
	}
	return thumbnailImageList;
}
function getAllLayerDiv(){
	var layerDivList = new Array();
	for(var i=0;i<layerCount;i++){
		var templayer = document.getElementById('layer'+i);
		layerDivList.push(templayer);
	}
	return layerDivList;
}
function getAllLayerSuppressButton(){
	var layerSuppressButtonList = new Array();
	for(var i=0;i<layerCount;i++){
		var templayer = document.getElementById('layerSuppressButton'+i);
		layerSuppressButtonList.push(templayer);
	}
	return layerSuppressButtonList;
}
function getAllLayerChangeTypeButton(){
	var layerChangeTypeButtonList = new Array();
	for(var i=0;i<layerCount;i++){
		var templayer = document.getElementById('layerChangeTypeButton'+i);
		layerChangeTypeButtonList.push(templayer);
	}
	return layerChangeTypeButtonList;
}
function getAllLayerSpinnerModel(){
	var layerSpinnerModelList = new Array();
	for(var i=0;i<layerCount;i++){
		var tempSpinner = document.getElementById("layerChangeModelSpinner"+i);
		layerSpinnerModelList.push(tempSpinner);
	}
	return layerSpinnerModelList;
}
/*function getAllLayerInfo(){/////////////////////
	var layerInfoList = new Array();
	for(var i=0;i<layerCount;i++){
		var templayer = document.getElementById('layerInfo'+i);
		layerInfoList.push(templayer);
	}
	return layerInfoList;
}*/

function notAllWhite(){
	for(var i=0;i<clickColor.length;i++){
		if(clickColor[i]==colorBlack){
			return true;
		}
	}
	return false;
}

/*function updateInfoLabel(text){
	var fieldNameElement = document.getElementById('infoLabel');
	fieldNameElement.innerHTML = text;
}

function updateTimeLabel(text){
	var fieldNameElement = document.getElementById('timeLabel');
	fieldNameElement.innerHTML = text;

	updateSlider();
}*/

function updateSlider(){
	var fieldNameElement = document.getElementById('sliderValue');
	fieldNameElement.innerHTML = "Time Interval : "+lengthTimeout;
}

function resetPage(){
	context.clearRect(0, 0, canvasWidth, canvasHeight);
	/////////
	context.fillStyle = colorWhite;
	context.fillRect(0,0,canvasWidth,canvasHeight);
	/////////
	curColor = colorBlack;
	curSize = defaultSize;
	layerCount=0;
	//updateInfoLabel("Page Reset");
	var layerDisplay = document.getElementById('layerDisplay');
	while(layerDisplay.firstChild){
		layerDisplay.removeChild(layerDisplay.firstChild);
	}
	initializeFilter();		//###
	resetClick();
	//resetJSONPreview();
	resetEngine();
	resetGoJS();
	resetThumbnails();
}

function resetThumbnails(){
	var thumbnailDiv = document.getElementById('thumbnailDiv');
	while(thumbnailDiv.firstChild){
		thumbnailDiv.removeChild(thumbnailDiv.firstChild);
	}
}
function resetGoJS(){
	diagramDiv = document.getElementById("myDiagramDiv");
	if(go.Diagram.fromDiv(diagramDiv)!=null){
		go.Diagram.fromDiv(diagramDiv).div = null;
	}
}

function resetInput(){
	var inputToReset = document.getElementById("fileInput");
	inputToReset.value="";
}

function resetEngine(){
	var engineDiv = document.getElementById("engineDiv");
	while (engineDiv.firstChild) {
		engineDiv.removeChild(engineDiv.firstChild);
	}
}

/*function resetJSONPreview(){
	var jsonPreview = document.getElementById('jsonPreview');
	jsonPreview.innerHTML="JSON INFOS:<br/>";
}*/


function setFilter(){	//###
	var filter = document.getElementById('filter');
	currentFilter = filter.value;
	if(currentFilter != "all"){
		/*if(currentFilter == "class"){
			setClassDiagramEngine();
		}else if(currentFilter == "sequence"){
			setSequenceDiagramEngine();
		}else if(currentFilter == "logic"){
			setLogicDiagramEngine();
		}else if(currentFilter == "simulink"){
			setSimulinkDiagramEngine();
		}*/
		setDiagramEngine(currentFilter);
		postPictureEngineV2();
	}
	updateMainCanvas();
}