//
// page load
//

//var guideData;
var topoData;
var base_image = new Image();

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const topoId = urlParams.get('topoid');

if( topoId == undefined || topoId == null ) {
  location.href = '/topo?topoid=0';
  reload();
}
else {
  fetch('/data/topo?topoid=' + topoId)
  .then(response => response.json())
  .then(data => {
    topoData = data;
    base_image.src = 'data/topo/' + topoData.topo_image_file;
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
}

function resize() {
  var canvas=document.getElementById("topo-image");
  drawTopoImage(base_image, canvas);
  drawTopoRoutes(base_image, canvas);
}
