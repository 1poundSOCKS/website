//
// topo page load
//

var guideData;
var topoData;
var base_image = new Image();
var guideName = 'baildon_bank';
var topoIndex = 0;
var mouseDownOnTopoImage = false;

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
    const mousePosOnImage = getImagePosFromCanvasPos(image, canvas, mousePos);
    const closestPoint = getClosestPoint(mousePosOnImage, topoData);
    const highlightPoint = getCanvasPosFromImagePos(image, canvas, closestPoint);
    ctx.beginPath();
    ctx.setLineDash([]);
    ctx.arc(highlightPoint.x, highlightPoint.y, 5, 0, 2 * Math.PI, false);
    ctx.lineWidth = 1;
    ctx.fillStyle = "#FF0000";
    ctx.fill();
    if( mouseDownOnTopoImage == true ) {
      ctx.beginPath();
      ctx.setLineDash([]);
      ctx.arc(mousePos.x, mousePos.y, 5, 0, 2 * Math.PI, false);
      ctx.lineWidth = 1;
      ctx.fillStyle = "#000000";
      ctx.fill();
    }
  }

  canvas.onmousedown = function( event ) {
    mouseDownOnTopoImage = true;
  }

  canvas.onmouseup = function( event ) {
    mouseDownOnTopoImage = false;
  }
}

function getElementMousePos(element, event) {
  var rect = element.getBoundingClientRect();
  return {x: event.clientX - rect.left, y: event.clientY - rect.top}
}

function getClosestPoint(mousePos, topoData) {
  var closestPoint = topoData.routes[0].points[0];
  var closestPointDistance = Number.MAX_VALUE;
  topoData.routes.forEach( route => {
    route.points.forEach( point => {
      var distance = Math.sqrt( Math.pow((mousePos.x-point.x), 2) + Math.pow((mousePos.y-point.y), 2) );
      if( distance < closestPointDistance ) {
        closestPoint = point;
        closestPointDistance = distance;
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
  drawTopoImage();
  drawRouteTable();
  window.addEventListener('resize', resizeTopoImage, false);
}

function drawTopoImage() {
  base_image.src = 'topo_data/' + guideName + '/' + topoData.topo_image_file;
  base_image.onload = function() {
    resizeTopoImage();
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
  redrawTopoImage(base_image, canvas);
}

function redrawTopoImage(image, canvas) {
  var ctx=canvas.getContext("2d");
  var imageWidthToHeightRatio = image.height / image.width;
  canvas.width = window.innerWidth * 50 / 100;
  canvas.height = canvas.width * imageWidthToHeightRatio;
  ctx.width = canvas.width;
  ctx.height = canvas.height;
  ctx.drawImage(image, 0, 0, ctx.width, ctx.height);

  ctx.strokeStyle = 'white';
  ctx.lineWidth = 2;

  topoData.routes.forEach(element => {
    var id = element.id;
    var startPos = getCanvasPosFromImagePos(image, canvas, element.points[0]);

    ctx.font = '24px Verdana';
    var textMetrics = ctx.measureText(id);
    var halfTextWidth = textMetrics.width / 2;
    var textHeight = (textMetrics.fontBoundingBoxAscent);
    ctx.fillText(id, startPos.x - halfTextWidth, startPos.y + textHeight);

    var canvasPosData = convertImagePosDataToCanvasPosData(image, canvas, element.points);
    var lineData = createLineDataFromPointData(canvasPosData);

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
