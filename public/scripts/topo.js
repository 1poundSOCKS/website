//
// topo page load
//

var guideData;
var topoData;
var base_image = new Image();
var guideName = 'baildon_bank';
var topoIndex = 0;

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
      //fetchTopoData();
    //refreshControls();
  }

  prevTopoButton.onclick = function(event) {
    topoIndex--;
    location.href = '/?topo=' + topoIndex;
    window.reload();
    //fetchTopoData();
    //refreshControls();
  }
}

function addMouseSupport() {
  let topoImage = document.getElementById("topo_image");
  topoImage.onmouseover = function( event ) {
    
  }
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
  drawTopoLines();
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
  var ctx=canvas.getContext("2d");
  var imageWidthToHeightRatio = base_image.height / base_image.width;
  canvas.width = window.innerWidth * 50 / 100;
  canvas.height = canvas.width * imageWidthToHeightRatio;
  var imageWidthToCanvasWidthRatio = canvas.width / base_image.width;
  var imageHeightToCanvasHeightRatio = canvas.height / base_image.height;
  ctx.width = canvas.width;
  ctx.height = canvas.height;
  ctx.drawImage(base_image, 0, 0, ctx.width, ctx.height);

  ctx.strokeStyle = 'white';
  ctx.lineWidth = 2;

  topoData.routes.forEach(element => {
    var id = element.id;
    var startX = element.points[0].x * imageWidthToCanvasWidthRatio;
    var startY = element.points[0].y * imageHeightToCanvasHeightRatio;

    ctx.font = '24px Verdana';
    var textMetrics = ctx.measureText(id);
    var halfTextWidth = textMetrics.width / 2;
    var textHeight = (textMetrics.fontBoundingBoxAscent);
    ctx.fillText(id, startX - halfTextWidth, startY + textHeight);

    for (let iStart = 0; iStart < element.points.length; iStart++) {

      var startPoint = element.points[iStart];
      var endPoint = element.points[iStart+1];
      
      if( startPoint != undefined && endPoint != undefined ) {
        var startX = startPoint.x * imageWidthToCanvasWidthRatio;
        var startY = startPoint.y * imageHeightToCanvasHeightRatio;
        var endX = endPoint.x * imageWidthToCanvasWidthRatio;
        var endY = endPoint.y * imageHeightToCanvasHeightRatio;

        ctx.beginPath();
        ctx.setLineDash([10, 15]);
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.strokeStyle = '#FFFFFF';
        ctx.stroke();

        ctx.beginPath();
        ctx.setLineDash([]);
        ctx.arc(startX, startY, 5, 0, 2 * Math.PI, false);
        ctx.lineWidth = 1;
        ctx.fillStyle = "#000000";
        ctx.fill();
      }

      if( startPoint != undefined && endPoint == undefined ) {
        var startX = startPoint.x * imageWidthToCanvasWidthRatio;
        var startY = startPoint.y * imageHeightToCanvasHeightRatio;
        ctx.beginPath();
        ctx.setLineDash([]);
        ctx.arc(startX, startY, 5, 0, 2 * Math.PI, false);
        ctx.lineWidth = 1;
        ctx.fillStyle = "#000000";
        ctx.fill();
      }
    }
  });
}
