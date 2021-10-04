//
// page load
//

var topoData;
var base_image = new Image();

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const topoId = urlParams.get('topoid');

fetch('/data/topo?topoid=' + topoId)
.then(response => response.json())
.then(data => {
  topoData = data;
  base_image.src = 'data/image/' + topoData.topo_image_file;
  base_image.onload = function() {
    drawRouteTable();
    resize();
    window.addEventListener('resize', resize, false);
    const canvas = document.getElementById("topo-image");
    AddMouseSupportToCanvas(base_image, canvas);
    const routeTable = document.getElementById("route-table");
    AddMouseSupportToTable(base_image, canvas, routeTable);
  }
});

function resize() {
  var canvas=document.getElementById("topo-image");
  drawTopoImage(base_image, canvas);
  drawTopoRoutes(base_image, canvas);
}
