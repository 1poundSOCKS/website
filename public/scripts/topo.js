//
// topo page load
//

var guideData;
var topoData;
var base_image = new Image();
var guideName = 'baildon_bank';
var topoIndex = 0;
var mouseDownOnTopoImage = false;
var closestTopoPoint;
var highlightedTopoPoint;
var selectedTopoPoints = [];
var mouseDownPos;

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const topo = urlParams.get('topo');

if( topo == null ) {
  location.href = '/?topo=0';
  window.reload();
}
else {
  let canvas = document.getElementById("topo_image");
  displayTopo();
  addMouseSupport(base_image, canvas);
}

//
// functions
//

function displayTopo() {
  topoIndex = topo;

  var nextTopoButton = document.getElementById("next_topo");
  var prevTopoButton = document.getElementById("prev_topo");

  fetch('/guide_data?guidename=' + guideName)
  .then(response => response.json())
  .then(data => {
    guideData = data;
    fetchTopoData();
    refreshControls();
  });

  nextTopoButton.onclick = function(event) {
    topoIndex++;
    location.href = '/?topo=' + topoIndex;
    window.reload();
  }

  prevTopoButton.onclick = function(event) {
    topoIndex--;
    location.href = '/?topo=' + topoIndex;
    window.reload();
  }
}

function addMouseSupport(image, canvas) {
  canvas.onmousemove = function( event ) {
    var ctx=canvas.getContext("2d");
    const mousePos = getElementMousePos(canvas, event);
    const imageMousePos = getImagePosFromCanvasPos(image, canvas, mousePos);
    closestTopoPoint = getClosestTopoPoint(imageMousePos, topoData);
    if( mouseDownOnTopoImage ) {
      const imageMouseDownPos = getImagePosFromCanvasPos(image, canvas, mouseDownPos);
      const mouseOffset = calculateMouseOffset(imageMouseDownPos, imageMousePos);
      applyMouseOffset(topoData, selectedTopoPoints, mouseOffset);
      drawTopoImage(image, canvas);
      drawTopoRoutes(image, canvas);
    }
    else {
      if( closestTopoPoint.distance < 50 ) {
        highlightedTopoPoint = closestTopoPoint;
        drawTopoRoutes(image, canvas);
      }
      else {
        highlightedTopoPoint = null;
        drawTopoRoutes(image, canvas);
      }
    }
    mouseDownPos = mousePos;
  }

  canvas.onmousedown = function( event ) {
    mouseDownOnTopoImage = true;
    var ctx=canvas.getContext("2d");
    mouseDownPos = getElementMousePos(canvas, event);
    if( highlightedTopoPoint != undefined && highlightedTopoPoint != null ) {
      addSelectedTopoPoint(selectedTopoPoints, highlightedTopoPoint);
      drawTopoRoutes(image, canvas);
    }
  }

  canvas.onmouseup = function( event ) {
    mouseDownOnTopoImage = false;    
  }
}

function calculateMouseOffset(startPos, endPos) {
  return {x: endPos.x - startPos.x, y: endPos.y - startPos.y };
}

function applyMouseOffset(topoData, selectedTopoPoints, mouseOffset) {
  selectedTopoPoints.forEach( point => {
    topoData.routes[point.routeIndex].points[point.pointIndex].x += mouseOffset.x;
    topoData.routes[point.routeIndex].points[point.pointIndex].y += mouseOffset.y;
  });
}

function addSelectedTopoPoint(selectedTopoPoints, highlightedTopoPoint) {
  if( !containsTopoPoint(selectedTopoPoints, highlightedTopoPoint) ) {
    selectedTopoPoints.push(highlightedTopoPoint);
  }
}

function containsTopoPoint(selectedTopoPoints, highlightedTopoPoint) {
  selectedTopoPoints.forEach( point => {
    if( highlightedTopoPoint.routeIndex == point.routeIndex && highlightedTopoPoint.pointIndex == point.pointIndex ) {
      return true;
    }
  });
  return false;
}

function getElementMousePos(element, event) {
  var rect = element.getBoundingClientRect();
  return {x: event.clientX - rect.left, y: event.clientY - rect.top}
}

function getClosestTopoPoint(imagePos, topoData) {
  var closestPoint = { routeIndex: 0, pointIndex: 0, distance: Number.MAX_VALUE };
  topoData.routes.forEach( (route, routeIndex) => {
    route.points.forEach( (point, pointIndex) => {
      var distance = Math.sqrt( Math.pow((imagePos.x-point.x), 2) + Math.pow((imagePos.y-point.y), 2) );
      if( distance < closestPoint.distance ) {
        closestPoint = { routeIndex: routeIndex, pointIndex: pointIndex, distance: distance };
      }
    });
  });
  return closestPoint;
}

function refreshControls() {
  if( guideData.topos[topoIndex + 1] == undefined ) nextTopoButton.disabled = true;
  else nextTopoButton.disabled = false;

  if( guideData.topos[topoIndex - 1] == undefined ) prevTopoButton.disabled = true;
  else prevTopoButton.disabled = false;
}

function fetchTopoData() {
  topoId = guideData.topos[topoIndex];

  fetch('/topo_data?guidename=' + guideName + '&topoid=' + topoId)
    .then(response => response.json())
    .then(data => {
      topoData = data;
      drawTopo();
  });
}

function drawTopo() {
  loadTopoImage();
  window.addEventListener('resize', resizeTopoImage, false);
}

function loadTopoImage() {
  base_image.src = 'topo_data/' + guideName + '/' + topoData.topo_image_file;
  base_image.onload = function() {
    resizeTopoImage();
    drawRouteTable();
  }
}

function drawRouteTable() {
  var routeTable=document.getElementById("route_table");
  routeTable.innerHTML = '';
  topoData.routes.forEach(element => {
    var id = document.createElement('td');
    id.appendChild(document.createTextNode(element.id));
    var name = document.createElement('td');
    name.appendChild(document.createTextNode(element.name));
    var grade = document.createElement('td');
    grade.appendChild(document.createTextNode(element.grade));
    var row = document.createElement('tr');
    row.appendChild(id);
    row.appendChild(name);
    row.appendChild(grade);
    routeTable.appendChild(row);
  });
}

function resizeTopoImage() {
  var canvas=document.getElementById("topo_image");
  drawTopoImage(base_image, canvas);
  drawTopoRoutes(base_image, canvas);
}

function drawTopoImage(image, canvas) {
  var ctx=canvas.getContext("2d");
  var imageWidthToHeightRatio = image.height / image.width;
  canvas.width = window.innerWidth * 50 / 100;
  canvas.height = canvas.width * imageWidthToHeightRatio;
  ctx.width = canvas.width;
  ctx.height = canvas.height;
  ctx.drawImage(image, 0, 0, ctx.width, ctx.height);
}

function drawTopoRoutes(image, canvas) {
  var ctx=canvas.getContext("2d");
  ctx.strokeStyle = 'white';

  topoData.routes.forEach(element => {
    var id = element.id;
    var startPos = getCanvasPosFromImagePos(image, canvas, element.points[0]);

    ctx.font = '24px Verdana';
    ctx.lineWidth = 1;
    var textMetrics = ctx.measureText(id);
    var halfTextWidth = textMetrics.width / 2;
    var textHeight = (textMetrics.fontBoundingBoxAscent);
    ctx.fillStyle = "#000000";
    ctx.fillText(id, startPos.x - halfTextWidth, startPos.y + textHeight);

    var canvasPosData = convertImagePosDataToCanvasPosData(image, canvas, element.points);
    var lineData = createLineDataFromPointData(canvasPosData);

    ctx.lineWidth = 2;

    lineData.forEach(element => {
      ctx.beginPath();
      ctx.setLineDash([10, 15]);
      ctx.moveTo(element.start.x, element.start.y);
      ctx.lineTo(element.end.x, element.end.y);
      ctx.strokeStyle = '#FFFFFF';
      ctx.stroke();
    });

    canvasPosData.forEach(element => {
      ctx.beginPath();
      ctx.setLineDash([]);
      ctx.arc(element.x, element.y, 5, 0, 2 * Math.PI, false);
      ctx.lineWidth = 1;
      ctx.fillStyle = "#000000";
      ctx.fill();
    });
  });
  
  if( selectedTopoPoints != undefined && selectedTopoPoints != null ) {
    selectedTopoPoints.forEach( point => {
      const canvasPosData = convertImagePosDataToCanvasPosData(image, canvas, topoData.routes[point.routeIndex].points);
      const selectedTopoPos = canvasPosData[point.pointIndex];
      ctx.beginPath();
      ctx.setLineDash([]);
      ctx.arc(selectedTopoPos.x, selectedTopoPos.y, 5, 0, 2 * Math.PI, false);
      ctx.lineWidth = 1;
      ctx.fillStyle = "#00FF00";
      ctx.fill();
    });
  }

  if( highlightedTopoPoint != undefined && highlightedTopoPoint != null ) {
    const canvasPosData = convertImagePosDataToCanvasPosData(image, canvas, topoData.routes[highlightedTopoPoint.routeIndex].points);
    const highlightedTopoPos = canvasPosData[highlightedTopoPoint.pointIndex];
    ctx.beginPath();
    ctx.setLineDash([]);
    ctx.arc(highlightedTopoPos.x, highlightedTopoPos.y, 5, 0, 2 * Math.PI, false);
    ctx.lineWidth = 1;
    ctx.fillStyle = "#FF0000";
    ctx.fill();
  }
}

function convertImagePosDataToCanvasPosData(image, canvas, imagePosData) {
  var canvasPosData = [];
  for (let iStart = 0; iStart < imagePosData.length; iStart++) {
    var canvasPos = getCanvasPosFromImagePos(image, canvas, imagePosData[iStart]);
    canvasPosData.push(canvasPos);
  }

  return canvasPosData;
}

function getCanvasPosFromImagePos(image, canvas, pos) {
  var widthRatio = canvas.width / image.width;
  var heightRatio = canvas.height / image.height;
  return {x: pos.x * widthRatio, y: pos.y * heightRatio};
}

function getImagePosFromCanvasPos(image, canvas, pos) {
  var widthRatio = image.width / canvas.width;
  var heightRatio = image.height / canvas.height;
  return {x: pos.x * widthRatio, y: pos.y * heightRatio};
}

function createLineDataFromPointData(pointData) {
  var lineData = [];
  for (let iStart = 0; iStart < pointData.length - 1; iStart++) {
      lineData.push({start: pointData[iStart], end: pointData[iStart+1]});
  }
  return lineData;
}
