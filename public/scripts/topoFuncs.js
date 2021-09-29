//
// functions
//

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

  canvas.onmousedown = OnMouseDownOnTopo;

  canvas.onmouseup = OnMouseUpOnTopo;

  canvas.onclick = OnMouseClickOnTopo;
}

function GetEditMode() {
  return EDIT_MODE.Modify;
}

function OnMouseMoveDuringModify(event, image, canvas) {
  var ctx=canvas.getContext("2d");
  const mousePos = getElementMousePos(canvas, event);
  const imageMousePos = getImagePosFromCanvasPos(image, canvas, mousePos);
  if( mouseDownOnTopoImage && dragPoint != null ) {
    highlightedTopoPoint = GetDragPoint(imageMousePos, topoData, dragPoint);
    const imageMouseDownPos = getImagePosFromCanvasPos(image, canvas, mouseDownPos);
    const mouseOffset = calculateMouseOffset(imageMouseDownPos, imageMousePos);
    const bounds = {minX:0, minY: 0, maxX:image.naturalWidth, maxY: image.naturalHeight };
    moveTopoPoint(topoData, dragPoint, mouseOffset, bounds);
    mouseHasDragged = true;
    drawTopoImage(image, canvas);
    drawTopoRoutes(image, canvas);
  }
  else {
    highlightedTopoPoint = GetDragPoint(imageMousePos, topoData);
    drawTopoImage(image, canvas);
    drawTopoRoutes(image, canvas);
  }
  mouseDownPos = mousePos;
}

function OnMouseMoveDuringCreate(event, image, canvas) {

}

function OnMouseDownOnTopo( event ) {
  mouseDownOnTopoImage = true;
  mouseHasDragged = false;
  const canvas = document.getElementById("topo-image");
  var ctx=canvas.getContext("2d");
  const mousePos = getElementMousePos(canvas, event);
  const imageMousePos = getImagePosFromCanvasPos(base_image, canvas, mousePos);
  dragPoint = GetDragPoint(imageMousePos, topoData);
  highlightedTopoPoint = null;
  drawTopoImage(base_image, canvas);
  drawTopoRoutes(base_image, canvas);
}

function OnMouseUpOnTopo( event ) {
  mouseDownOnTopoImage = false;
}

function OnMouseClickOnTopo( event ) {
  const canvas = document.getElementById("topo-image");
  var ctx=canvas.getContext("2d");
  const mousePos = getElementMousePos(canvas, event);
  const imageMousePos = getImagePosFromCanvasPos(base_image, canvas, mousePos);
  if( mouseHasDragged ) {
    if( highlightedTopoPoint != null ) {
      ReplacePoint(dragPoint, highlightedTopoPoint, topoData);
      DeletePoint(dragPoint, topoData);
    }
  }
  else {
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
    }
  }
  highlightedTopoPoint = GetDragPoint(imageMousePos, topoData);
  dragPoint = null;
  drawTopoImage(base_image, canvas);
  drawTopoRoutes(base_image, canvas);
}

function addRouteTableMouseSupport(image, canvas, routeTable) {
  routeTable.onclick = function( event ) {
    drawTopoImage(image, canvas);
    drawTopoRoutes(image, canvas);
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

function getUnselectedRoutes() {
  var unselectedRoutes = [];
  const checkBoxes = document.getElementById("route-table-body").getElementsByTagName('input');
  for (var i = 0; i < checkBoxes.length; i++) {
    if( !checkBoxes[i].checked ) {
      unselectedRoutes.push(i);
    }
  }
  return unselectedRoutes;
}

function calculateMouseOffset(startPos, endPos) {
  return {x: endPos.x - startPos.x, y: endPos.y - startPos.y };
}

function moveTopoPoint(topoData, topoPoint, offset) {
  topoData.points[topoPoint].x += offset.x;
  topoData.points[topoPoint].y += offset.y;
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

function ReplacePoint(thisPoint, withPoint, topoData) {
  topoData.routes.forEach( route => {
    var newPoints = route.points.map( point => {
      if( point == thisPoint ) return withPoint;
      else return point;
    });
    console.log(newPoints);
    route.points = newPoints;
  });
}

function DeletePoint(pointToDelete, topoData) {
  topoData.routes.forEach( route => {
    const newPoints = route.points.map( point => {
      if( point < pointToDelete ) return point;
      else return point - 1;
    });
    route.points = newPoints;
  });
  topoData.points = topoData.points.filter( (point, pointIndex) => {
    return ( pointIndex != pointToDelete );
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

function getClosestTopoPoint(imagePos, topoData, pointToIgnore) {
  var closestPoint = { index: -1, distance: Number.MAX_VALUE };
  topoData.points.forEach( (point, pointIndex) => {
    if( pointIndex != pointToIgnore ) {
      var distance = Math.sqrt( Math.pow((imagePos.x-point.x), 2) + Math.pow((imagePos.y-point.y), 2) );
      if( distance < closestPoint.distance ) {
        closestPoint = { index: pointIndex, distance: distance };
      }
    }
  });
  return closestPoint;
}

function GetDragPoint(imagePos, topoData, pointToIgnore) {
  var dragPoint = null;
  const closestTopoPoint = getClosestTopoPoint(imagePos, topoData, pointToIgnore);
  if( closestTopoPoint.distance < 50 ) {
    dragPoint = closestTopoPoint.index;
  }
  return dragPoint;
}

function addNewPointToRoute(points, route, pos) {
  const pointCount = points.push(pos);
  route.points.push(pointCount - 1);
}

function addExistingPointToRoute(route, imageMousePos) {
  
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

  const unselectedRoutes = getUnselectedRoutes();

  unselectedRoutes.forEach( routeIndex => {
    const route = topoData.routes[routeIndex];
    const lines = GetRouteLines(route);
    lines.forEach(line => {
      ctx.beginPath();
      ctx.moveTo(pointsOnCanvas[line.start].x, pointsOnCanvas[line.start].y);
      ctx.lineTo(pointsOnCanvas[line.end].x, pointsOnCanvas[line.end].y);
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#FFFFFF';
      ctx.stroke();
    });
  });

  const selectedRoutes = getSelectedRoutes();

  selectedRoutes.forEach( routeIndex => {
    const route = topoData.routes[routeIndex];
    const lines = GetRouteLines(route);
    lines.forEach(line => {
      ctx.beginPath();
      ctx.moveTo(pointsOnCanvas[line.start].x, pointsOnCanvas[line.start].y);
      ctx.lineTo(pointsOnCanvas[line.end].x, pointsOnCanvas[line.end].y);
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#00FF00';
      ctx.stroke();
    });
  });
/*
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
*/
  pointsOnCanvas.forEach((point, pointIndex) => {
    ctx.beginPath();
    ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI, false);
    ctx.lineWidth = 1;
    if( pointIndex == dragPoint ) {
      ctx.fillStyle = "#00FF00";
    }
    else {
      ctx.fillStyle = "#000000";
    }
    ctx.fill();
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
