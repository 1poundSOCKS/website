var topoData;
var base_image = new Image();

fetch('http://localhost:8080/data.json')
  .then(response => response.json())
  .then(data => {
    topoData = data;
    drawTopo(data);
  });

function drawTopo(data) {
  drawTopoImage(data);
  drawRouteTable(data);
  window.addEventListener('resize', resizeTopoImage, false);
}

function drawTopoImage(data) {
  base_image.src = data.topo_image_file;
  base_image.onload = function() {
    resizeTopoImage();
  }
}

function drawRouteTable(data) {
  var routeTable=document.getElementById("route_table");

  data.routes.forEach(element => {
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
  var data = topoData;
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

  data.routes.forEach(element => {
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
        ctx.stroke();
      }
    }
  });
}
