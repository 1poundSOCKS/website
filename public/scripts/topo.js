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

const EDIT_MODE = {
  Create: "Create",
  Modify: "Modify"
}

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const topo = urlParams.get('topo');

if( topo == null ) {
  location.href = '/?topo=0';
  window.reload();
}
else {
  displayTopo();
  const canvas = document.getElementById("topo-image");
  addTopoMouseSupport(base_image, canvas);
  const routeTable = document.getElementById("route-table");
  addRouteTableMouseSupport(base_image, canvas, routeTable);
  const nextTopoButton = document.getElementById("next-topo");
  nextTopoButton.onclick = function(event) {
    topoIndex++;
    location.href = '/?topo=' + topoIndex;
    window.reload();
  }
  const prevTopoButton = document.getElementById("prev-topo");
  prevTopoButton.onclick = function(event) {
    topoIndex--;
    location.href = '/?topo=' + topoIndex;
    window.reload();
  }
}

//
// functions
//

function displayTopo() {
  topoIndex = topo;

  fetch('/guide_data?guidename=' + guideName)
  .then(response => response.json())
  .then(data => {
    guideData = data;
    fetchTopoData();
    refreshControls();
  });
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

function addTopoMouseSupport(image, canvas) {
  
  canvas.onmousemove = function( event ) {
    const editMode = GetEditMode();
    switch( editMode ) {
      case EDIT_MODE.Create:
        OnMouseMoveDuringCreate(event, image, canvas);
        break;
      case EDIT_MODE.Modify:
        OnMouseMoveDuringModify(event, image, canvas);
        break;
    }
  }

  canvas.onmousedown = function( event ) {
    mouseDownOnTopoImage = true;
    mouseHasDragged = false;
    selectedTopoPoints = [];
    addSelectedTopoPoint(selectedTopoPoints, highlightedTopoPoint);
  }

  canvas.onmouseup = function( event ) {
    mouseDownOnTopoImage = false;
    selectedTopoPoints = [];
  }

  canvas.onclick = function( event ) {
    var ctx=canvas.getContext("2d");
    const mousePos = getElementMousePos(canvas, event);
    const imageMousePos = getImagePosFromCanvasPos(image, canvas, mousePos);

    if( !mouseHasDragged ) {
      const selectedRoutes = getSelectedRoutes();
      const selectedRouteIndex = selectedRoutes[0];
      if( selectedRouteIndex != undefined ) {
        const route = topoData.routes[selectedRouteIndex];
        if( highlightedTopoPoint == undefined || highlightedTopoPoint == null) {
          addNewPointToRoute(topoData.points, route, imageMousePos);
        }
        else {
          addExistingPointToRoute(route, highlightedTopoPoint);
        }
        drawTopoRoutes(image, canvas);
      }
    }
  }

  canvas.ondblclick = function( event ) {
  }
}

function addNewPointToRoute(points, route, pos) {
  const pointCount = points.push(pos);
  route.points.push(pointCount - 1);
}

function addExistingPointToRoute(route, imageMousePos) {
  
}

function GetEditMode() {
  return EDIT_MODE.Modify;
}

function OnMouseMoveDuringModify(event, image, canvas) {
  var ctx=canvas.getContext("2d");
  const mousePos = getElementMousePos(canvas, event);
  const imageMousePos = getImagePosFromCanvasPos(image, canvas, mousePos);
  const selectedRoutes = getSelectedRoutes();
  closestTopoPoint = getClosestTopoPoint(imageMousePos, topoData, selectedRoutes);
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

function OnMouseMoveDuringCreate(event, image, canvas) {

}

function addRouteTableMouseSupport(image, canvas, routeTable) {
  routeTable.onclick = function( event ) {
    console.log('table clicked');
    const selectedRoutes = getSelectedRoutes();
    var selectedTopoPoints = [];
    drawTopoImage(image, canvas);
    drawTopoRoutes(image, canvas);
    console.log(selectedRoutes);
  }
}

function getSelectedRoutes() {
  var selectedRoutes = [];
  const checkBoxes = document.getElementById("route-table-body").getElementsByTagName('input');
  for (var i = 0; i < checkBoxes.length; i++) {
    if( checkBoxes[i].checked ) {
      selectedRoutes.push(i);
    }
  }
  return selectedRoutes;
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

function addNewTopoPoint(topoData, pos) {
  topoData.points.push({x: pos.x, y: pos.y});
}

function joinTopoPoints(topoData, points) {
  if( points != undefined && points != null && points.length == 2 ) {
    topoData.lines.push({start: points[0], end: points[1]});
  }
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

function getClosestTopoPoint(imagePos, topoData, selectedRoutes) {
  var closestPoint = { index: -1, distance: Number.MAX_VALUE };
  selectedRoutes.forEach( routeIndex => {
    const points = topoData.routes[routeIndex].points;
    points.forEach( pointIndex => {
      const point = topoData.points[pointIndex];
      var distance = Math.sqrt( Math.pow((imagePos.x-point.x), 2) + Math.pow((imagePos.y-point.y), 2) );
      if( distance < closestPoint.distance ) {
        closestPoint = { index: pointIndex, distance: distance };
      }
     });
  });
  return closestPoint;
}

function getDistinctRoutePoints(route) {
  var points = [];
  route.lines.forEach( line => {
    if( !points.includes(line.start) ) {
      points.push(line.start);
    }
    if( !points.includes(line.end) ) {
      points.push(line.end);
    }
  });
  return points;
}

function drawRouteTable() {
  var routeTable=document.getElementById("route-table-body");
  routeTable.innerHTML = '';
  topoData.routes.forEach(element => {

    var select = document.createElement('td');
    select.innerHTML = '<input class="route-checkbox" type="checkbox" />';

    var id = document.createElement('td');
    id.appendChild(document.createTextNode(element.id));

    var name = document.createElement('td');
    name.appendChild(document.createTextNode(element.name));

    var grade = document.createElement('td');
    grade.appendChild(document.createTextNode(element.grade));

    var row = document.createElement('tr');
    row.appendChild(select);
    row.appendChild(id);
    row.appendChild(name);
    row.appendChild(grade);
    routeTable.appendChild(row);
  });
}

function resizeTopoImage() {
  var canvas=document.getElementById("topo-image");
  drawTopoImage(base_image, canvas);
  drawTopoRoutes(base_image, canvas);
}

function drawTopoImage(image, canvas) {
  var imageWidthToHeightRatio = image.height / image.width;
  var canvasPos = canvas.getBoundingClientRect();
  canvas.width = canvasPos.width;
  canvas.height = canvasPos.height;// * imageWidthToHeightRatio;
  var ctx=canvas.getContext("2d");
  ctx.width = canvas.width;
  ctx.height = canvas.height;
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
}

function drawTopoRoutes(image, canvas) {
  var ctx=canvas.getContext("2d");
  ctx.strokeStyle = 'white';

  var pointsOnCanvas = convertImagePosDataToCanvasPosData(image, canvas, topoData.points);

  const selectedRoutes = getSelectedRoutes();

  topoData.routes.forEach((route, routeIndex) => {
    const lines = GetRouteLines(route);
    lines.forEach(line => {
      ctx.beginPath();
      ctx.moveTo(pointsOnCanvas[line.start].x, pointsOnCanvas[line.start].y);
      ctx.lineTo(pointsOnCanvas[line.end].x, pointsOnCanvas[line.end].y);
      ctx.lineWidth = 2;
      if( selectedRoutes.includes(routeIndex) ) ctx.strokeStyle = '#00FF00';
      else ctx.strokeStyle = '#FFFFFF';
      ctx.stroke();
    });
  });

  topoData.routes.forEach((route, routeIndex) => {
    const lines = GetRouteLines(route);
    lines.forEach(line => {
      ctx.beginPath();
      ctx.arc(pointsOnCanvas[line.start].x, pointsOnCanvas[line.start].y, 5, 0, 2 * Math.PI, false);
      ctx.lineWidth = 1;
      if( selectedTopoPoints.includes(line.start) ) {
        ctx.fillStyle = "#00FF00";
      }
      else {
        ctx.fillStyle = "#000000";
      }
      ctx.fill();
      ctx.beginPath();
      ctx.arc(pointsOnCanvas[line.end].x, pointsOnCanvas[line.end].y, 5, 0, 2 * Math.PI, false);
      ctx.lineWidth = 1;
      if( selectedTopoPoints.includes(line.end) ) {
        ctx.fillStyle = "#00FF00";
      }
      else {
        ctx.fillStyle = "#000000";
      }
      ctx.fill();
    });
  });

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

function GetRouteLines(route) {
  var lines = [];
  var previousPoint = null;
  route.points.forEach(point => {
    if( previousPoint != null ) lines.push({start: previousPoint, end: point});
    previousPoint = point;
  });
  return lines;
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
