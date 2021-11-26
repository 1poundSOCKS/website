//
// topo image control
//

// let imageState.image = null;

// var mouseDownOnTopoImage = false;
// var closestTopoPoint = null;
// var highlightedTopoPoint = null;
// var selectedTopoPoints = [];
// var mouseDownPos = null;
// var mouseHasDragged = false;
// var dragPoint = null;

let imageState = { 
  image: null,
  mouseUpPos: null, 
  mouseDownPos: null, 
  transactions: []
};

let LoadImage = (url) => new Promise( (resolve, reject) => {
  const img = new Image();
  img.onload = () => resolve(img);
  img.onerror = (err) => reject(err);
  img.src = url;
});

let LoadAndDisplayImage = async topoData => {
  if( !topoData.image_file ) return;
  imageState.image = await LoadImage(`data/image/${topoData.image_file}`);
  DrawImage(topoData);
  const canvas=document.getElementById("topo-image");
  AddMouseSupportToImage(imageState.image, canvas, topoData);
}

let DrawImage = (topoData) => {
  const canvas=document.getElementById("topo-image");
  const canvasPos = canvas.getBoundingClientRect();
  canvas.width = canvasPos.width;
  canvas.height = canvas.width * imageState.image.height / imageState.image.width;
  var ctx=canvas.getContext("2d");
  ctx.width = canvas.width;
  ctx.height = canvas.height;
  DrawTopoImage(ctx, imageState.image);
  DrawTransactions(ctx, imageState.transactions);
  if( imageState.mouseDownPos && imageState.currentMousePos ) {
    const mouseDownCanvasPos = GetCanvasPosFromImagePos(imageState.image, canvas, imageState.mouseDownPos);
    const currentCanvasPos = GetCanvasPosFromImagePos(imageState.image, canvas, imageState.currentMousePos);
    DrawNewRouteLine(ctx, mouseDownCanvasPos, currentCanvasPos);
  }
}

function DrawNewRouteLine(ctx, startPos, endPos) {
  ctx.strokeStyle = 'white';
  ctx.beginPath();
  ctx.moveTo(startPos.x, startPos.y);
  ctx.lineTo(endPos.x, endPos.y);
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#FFFFFF';
  ctx.stroke();
}

function DrawTopoImage(ctx, image) {
  ctx.drawImage(image, 0, 0, ctx.width, ctx.height);
}

function DrawTransactions(ctx, transactions) {
  for( const transaction of transactions ) {
    const startPos = GetContextPosFromImagePos(imageState.image, ctx, transaction.start);
    const endPos = GetContextPosFromImagePos(imageState.image, ctx, transaction.end);
    DrawNewRouteLine(ctx, startPos, endPos);
  }
}

function AddMouseSupportToImage(image, canvas, topoData) {
  canvas.onmousedown = event => OnMouseDown(event, image, canvas, topoData);
  canvas.onmousemove = event => OnMouseMove(event, image, canvas, topoData);
  canvas.onmouseup = event => OnMouseUp(event, image, canvas, topoData);
  canvas.onmouseenter = event => OnMouseEnter(event, image, canvas, topoData);
  canvas.onmouseleave = event => OnMouseLeave(event, image, canvas, topoData);
  canvas.onclick = event => OnClick(event, image, canvas, topoData);
}

function OnMouseDown(event, image, canvas, topoData) {
  console.log(`mouse down`);
  const selectedRoutes = GetSelectedRoutes(topoData);
  if( selectedRoutes.length == 1 ) {
    imageState.mouseDownPos = GetImageMousePos(event, image, canvas);
  }
}

function OnMouseMove(event, image, canvas, topoData) {
  imageState.currentMousePos = GetImageMousePos(event, image, canvas);
  if( imageState.mouseDownPos ) {
    DrawImage(topoData);
  }
}

function OnMouseUp(event, image, canvas, topoData) {
  console.log(`mouse up`);
  imageState.mouseUpPos = GetImageMousePos(event, image, canvas);
  if( imageState.mouseDownPos && imageState.mouseUpPos ) {
    imageState.transactions.push({ action: 'add_line', start: imageState.mouseDownPos, end: imageState.mouseUpPos});
    console.log(`${imageState.transactions.length}`);
  }
  imageState.mouseDownPos = null;
}

function OnMouseEnter(event, image, canvas, topoData) {
  console.log(`mouse enter`);
}

function OnMouseLeave(event, image, canvas, topoData) {
  console.log(`mouse leave`);
  imageState.mouseDownPos = null;
  DrawImage(topoData);
}

function OnClick(event, image, canvas, topoData) {
  console.log(`mouse click`);
}

// function OnMouseMove(event, image, canvas, topoData) {
//   const imageMousePos = GetImageMousePos(event, image, canvas);
//   if( mouseDownOnTopoImage && dragPoint != null ) {
//     highlightedTopoPoint = GetDragPoint(imageMousePos, topoData, dragPoint);
//     const imageMouseDownPos = GetImagePosFromCanvasPos(image, canvas, mouseDownPos);
//     const mouseOffset = CalculateMouseOffset(imageMouseDownPos, imageMousePos);
//     const bounds = {minX:0, minY: 0, maxX:image.naturalWidth, maxY: image.naturalHeight };
//     MoveTopoPoint(topoData, dragPoint, mouseOffset, bounds);
//     mouseHasDragged = true;
//   }
//   else {
//     highlightedTopoPoint = GetDragPoint(imageMousePos, topoData);
//   }
//   DrawTopoImage(image, canvas);
//   DrawTopoRoutes(image, canvas, topoData);
//   mouseDownPos = GetElementMousePos(canvas, event);
// }

// function OnMouseDown(event, image, canvas, topoData) {
//   mouseDownOnTopoImage = true;
//   mouseHasDragged = false;
//   highlightedTopoPoint = null;
//   const imageMousePos = GetImageMousePos(event, image, canvas);
//   dragPoint = GetDragPoint(imageMousePos, topoData);
//   DrawTopoImage(image, canvas);
//   DrawTopoRoutes(image, canvas, topoData);
// }

// function OnMouseUp(event, image, canvas, topoData) {
//   mouseDownOnTopoImage = false;
// }

// function OnClick(event, image, canvas, topoData) {
//   const imageMousePos = GetImageMousePos(event, image, canvas);
//   if( mouseHasDragged ) {
//     if( highlightedTopoPoint != null ) {
//       ReplacePoint(dragPoint, highlightedTopoPoint, topoData);
//       DeletePoint(dragPoint, topoData);
//     }
//   }
//   else {
//     const selectedRoutes = GetSelectedRoutes();
//     const selectedRouteIndex = selectedRoutes[0];
//     if( selectedRouteIndex != undefined ) {
//       const route = topoData.routes[selectedRouteIndex];
//       if( highlightedTopoPoint == undefined || highlightedTopoPoint == null) {
//         AddNewPointToRoute(topoData.points, route, imageMousePos);
//       }
//       else {
//         AddExistingPointToRoute(route, highlightedTopoPoint);
//       }
//     }
//   }
//   highlightedTopoPoint = GetDragPoint(imageMousePos, topoData);
//   dragPoint = null;
//   DrawTopoImage(image, canvas);
//   DrawTopoRoutes(image, canvas, topoData);
// }

function GetImageMousePos(event, image, canvas) {
  const mousePos = GetElementMousePos(canvas, event);
  return GetImagePosFromCanvasPos(image, canvas, mousePos);
}

function CalculateMouseOffset(startPos, endPos) {
  return {x: endPos.x - startPos.x, y: endPos.y - startPos.y };
}

function MoveTopoPoint(topoData, topoPoint, offset) {
  topoData.points[topoPoint].x += offset.x;
  topoData.points[topoPoint].y += offset.y;
}

function AddNewTopoPoint(topoData, pos) {
  topoData.points.push({x: pos.x, y: pos.y});
}

function JoinTopoPoints(topoData, points) {
  if( points != undefined && points != null && points.length == 2 ) {
    topoData.lines.push({start: points[0], end: points[1]});
  }
}

function AddSelectedTopoPoint(selectedTopoPoints, highlightedTopoPoint) {
  if( containsTopoPoint(selectedTopoPoints, highlightedTopoPoint) == false ) {
    selectedTopoPoints.push(highlightedTopoPoint);
  }
}

function RemoveSelectedTopoPoint(selectedTopoPoints, topoPoint) {
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

function ContainsTopoPoint(selectedTopoPoints, highlightedTopoPoint) {
  var found = false;
  selectedTopoPoints.forEach( point => {
    if( highlightedTopoPoint == point ) {
      found = true;
    }
  });
  return found;
}

function GetElementMousePos(element, event) {
  var rect = element.getBoundingClientRect();
  return {x: event.clientX - rect.left, y: event.clientY - rect.top}
}

function GetClosestTopoPoint(imagePos, topoData, pointToIgnore) {
  if( !topoData.points ) return null;
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
  const closestTopoPoint = GetClosestTopoPoint(imagePos, topoData, pointToIgnore);
  if( !closestTopoPoint ) return null;
  if( closestTopoPoint.distance < 50 ) {
    dragPoint = closestTopoPoint.index;
  }
  return dragPoint;
}

function AddNewPointToRoute(points, route, pos) {
  const pointCount = points.push(pos);
  route.points.push(pointCount - 1);
}

function GetDistinctRoutePoints(route) {
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

function DrawTopoRoutes(image, canvas, topoData) {
  var ctx=canvas.getContext("2d");
  ctx.strokeStyle = 'white';

  var pointsOnCanvas = ConvertImagePosDataToCanvasPosData(image, canvas, topoData.points);

  const unselectedRoutes = GetUnselectedRoutes(topoData);

  unselectedRoutes.forEach( route => {
    // const route = topoData.routes[routeIndex];
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

  const selectedRoutes = GetSelectedRoutes(topoData);

  selectedRoutes.forEach( route => {
    // const route = topoData.routes[routeIndex];
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
  if( !route.points ) return [];

  var lines = [];
  var previousPoint = null;
  route.points.forEach(point => {
    if( previousPoint != null ) lines.push({start: previousPoint, end: point});
    previousPoint = point;
  });
  return lines;
}

function ConvertImagePosDataToCanvasPosData(image, canvas, imagePosData) {
  if( !imagePosData ) return [];

  var canvasPosData = [];
  for (let iStart = 0; iStart < imagePosData.length; iStart++) {
    var canvasPos = GetCanvasPosFromImagePos(image, canvas, imagePosData[iStart]);
    canvasPosData.push(canvasPos);
  }

  return canvasPosData;
}

function GetCanvasPosFromImagePos(image, canvas, pos) {
  var widthRatio = canvas.width / image.width;
  var heightRatio = canvas.height / image.height;
  return {x: pos.x * widthRatio, y: pos.y * heightRatio};
}

function GetContextPosFromImagePos(image, ctx, pos) {
  var widthRatio = ctx.width / image.width;
  var heightRatio = ctx.height / image.height;
  return {x: pos.x * widthRatio, y: pos.y * heightRatio};
}

function GetImagePosFromCanvasPos(image, canvas, pos) {
  var widthRatio = image.width / canvas.width;
  var heightRatio = image.height / canvas.height;
  return {x: pos.x * widthRatio, y: pos.y * heightRatio};
}

function CreateLineDataFromPointData(pointData) {
  var lineData = [];
  for (let iStart = 0; iStart < pointData.length - 1; iStart++) {
      lineData.push({start: pointData[iStart], end: pointData[iStart+1]});
  }
  return lineData;
}
