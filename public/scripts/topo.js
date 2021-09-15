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
var mouseHasDragged = false;

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
      const bounds = {minX:0, minY: 0, maxX:image.naturalWidth, maxY: image.naturalHeight };
      moveTopoPoints(topoData, selectedTopoPoints, mouseOffset, bounds);
      mouseHasDragged = true;
      drawTopoImage(image, canvas);
      drawTopoRoutes(image, canvas);
    }
    else {
      if( closestTopoPoint.distance < 50 ) {
        highlightedTopoPoint = closestTopoPoint.index;
        drawTopoImage(image, canvas);
        drawTopoRoutes(image, canvas);
      }
      else {
        highlightedTopoPoint = null;
        drawTopoImage(image, canvas);
        drawTopoRoutes(image, canvas);
      }
    }
    mouseDownPos = mousePos;
  }

  canvas.onmousedown = function( event ) {
    mouseDownOnTopoImage = true;
    mouseHasDragged = false;
  }

  canvas.onmouseup = function( event ) {
    mouseDownOnTopoImage = false;
  }

  canvas.onclick = function( event ) {
    console.log("mouse clicked");
    if( highlightedTopoPoint != undefined && highlightedTopoPoint != null ) {
      console.log("topo point is highlighted");
      if( containsTopoPoint(selectedTopoPoints, highlightedTopoPoint) ) {
        console.log("already selected, so unselect");
        selectedTopoPoints = removeSelectedTopoPoint(selectedTopoPoints, highlightedTopoPoint);
        drawTopoImage(image, canvas);
        drawTopoRoutes(image, canvas);
      }
      else {
        console.log("NOT selected, so select");
        addSelectedTopoPoint(selectedTopoPoints, highlightedTopoPoint);
        drawTopoRoutes(image, canvas);
      }
    }
    else {
      console.log("topo point is NOT highlighted");
      if( mouseHasDragged == false ) {
        selectedTopoPoints = [];
        drawTopoImage(image, canvas);
        drawTopoRoutes(image, canvas);
      }
    }
  }
}

function calculateMouseOffset(startPos, endPos) {
  return {x: endPos.x - startPos.x, y: endPos.y - startPos.y };
}

function moveTopoPoints(topoData, topoPoints, offset) {
  topoPoints.forEach( point => {
    topoData.points[point].x += offset.x;
    topoData.points[point].y += offset.y;
  });
}

function addSelectedTopoPoint(selectedTopoPoints, highlightedTopoPoint) {
  if( containsTopoPoint(selectedTopoPoints, highlightedTopoPoint) == false ) {
    selectedTopoPoints.push(highlightedTopoPoint);
  }
}

function removeSelectedTopoPoint(selectedTopoPoints, topoPoint) {
  return selectedTopoPoints.filter(point => {
    return !(point == topoPoint);
  });
}

function containsTopoPoint(selectedTopoPoints, highlightedTopoPoint) {
  var found = false;
  selectedTopoPoints.forEach( point => {
    if( highlightedTopoPoint == point ) {
      found = true;
    }
  });
  return found;
}

function getElementMousePos(element, event) {
  var rect = element.getBoundingClientRect();
  return {x: event.clientX - rect.left, y: event.clientY - rect.top}
}

function getClosestTopoPoint(imagePos, topoData) {
  var closestPoint = { index: -1, distance: Number.MAX_VALUE };
  topoData.points.forEach( (point, index) => {
    var distance = Math.sqrt( Math.pow((imagePos.x-point.x), 2) + Math.pow((imagePos.y-point.y), 2) );
    if( distance < closestPoint.distance ) {
      closestPoint = { index: index, distance: distance };
    }
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

  var pointsOnCanvas = convertImagePosDataToCanvasPosData(image, canvas, topoData.points);

  topoData.lines.forEach(line => {
    ctx.beginPath();
    ctx.setLineDash([10, 15]);
    ctx.moveTo(pointsOnCanvas[line.start].x, pointsOnCanvas[line.start].y);
    ctx.lineTo(pointsOnCanvas[line.end].x, pointsOnCanvas[line.end].y);
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#FFFFFF';
    ctx.stroke();
  });

  pointsOnCanvas.forEach( point => {
    ctx.beginPath();
    ctx.setLineDash([]);
    ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI, false);
    ctx.lineWidth = 1;
    ctx.fillStyle = "#000000";
    ctx.fill();
  });

  if( selectedTopoPoints != undefined && selectedTopoPoints != null ) {
    selectedTopoPoints.forEach( point => {
      const canvasPos = getCanvasPosFromImagePos(image, canvas, topoData.points[point]);
      ctx.beginPath();
      ctx.setLineDash([]);
      ctx.arc(canvasPos.x, canvasPos.y, 5, 0, 2 * Math.PI, false);
      ctx.lineWidth = 1;
      ctx.fillStyle = "#00FF00";
      ctx.fill();
    });
  }

  if( highlightedTopoPoint != undefined && highlightedTopoPoint != null ) {
    const canvasPos = getCanvasPosFromImagePos(image, canvas, topoData.points[highlightedTopoPoint]);
    ctx.beginPath();
    ctx.setLineDash([]);
    ctx.arc(canvasPos.x, canvasPos.y, 7, 0, 2 * Math.PI, false);
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#FF0000";
    ctx.stroke();
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
