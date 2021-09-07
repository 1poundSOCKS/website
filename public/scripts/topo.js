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
  displayTopo();
  addMouseSupport();
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

function addMouseSupport() {
  let topoImage = document.getElementById("topo_image");
  topoImage.onmousemove = function( event ) {
    if( mouseDownOnTopoImage == true ) {
      var ctx=topoImage.getContext("2d");
      const mousePos = getElementMousePos(topoImage, event);
      ctx.beginPath();
      ctx.setLineDash([]);
      ctx.arc(mousePos.x, mousePos.y, 5, 0, 2 * Math.PI, false);
      ctx.lineWidth = 1;
      ctx.fillStyle = "#000000";
      ctx.fill();
    }
  }

  topoImage.onmousedown = function( event ) {
    mouseDownOnTopoImage = true;
  }

  topoImage.onmouseup = function( event ) {
    mouseDownOnTopoImage = false;
  }
}

function getElementMousePos(element, event) {
  var rect = element.getBoundingClientRect();
  return {x: event.clientX - rect.left, y: event.clientY - rect.top}
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
    var startPos = getImagePosFromCanvasPos(image, canvas, element.points[0]);

    ctx.font = '24px Verdana';
    var textMetrics = ctx.measureText(id);
    var halfTextWidth = textMetrics.width / 2;
    var textHeight = (textMetrics.fontBoundingBoxAscent);
    ctx.fillText(id, startPos.x - halfTextWidth, startPos.y + textHeight);

    for (let iStart = 0; iStart < element.points.length; iStart++) {

      var startPoint = element.points[iStart];
      var endPoint = element.points[iStart+1];
      
      if( startPoint != undefined && endPoint != undefined ) {
        var startPos = getImagePosFromCanvasPos(image, canvas, startPoint);
        var endPos = getImagePosFromCanvasPos(image, canvas, endPoint);

        ctx.beginPath();
        ctx.setLineDash([10, 15]);
        ctx.moveTo(startPos.x, startPos.y);
        ctx.lineTo(endPos.x, endPos.y);
        ctx.strokeStyle = '#FFFFFF';
        ctx.stroke();

        ctx.beginPath();
        ctx.setLineDash([]);
        ctx.arc(startPos.x, startPos.y, 5, 0, 2 * Math.PI, false);
        ctx.lineWidth = 1;
        ctx.fillStyle = "#000000";
        ctx.fill();
      }

      if( startPoint != undefined && endPoint == undefined ) {
        var startPos = getImagePosFromCanvasPos(image, canvas, startPoint);
        ctx.beginPath();
        ctx.setLineDash([]);
        ctx.arc(startPos.x, startPos.y, 5, 0, 2 * Math.PI, false);
        ctx.lineWidth = 1;
        ctx.fillStyle = "#000000";
        ctx.fill();
      }
    }
  });
}

function getImagePosFromCanvasPos(image, canvas, pos) {
  var imageWidthToCanvasWidthRatio = canvas.width / image.width;
  var imageHeightToCanvasHeightRatio = canvas.height / image.height;
  return {x: pos.x * imageWidthToCanvasWidthRatio, y: pos.y * imageHeightToCanvasHeightRatio};
}
