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
  fetch('data/crag?cragid=' + data.crag_id)
  .then(response => response.json())
  .then(cragData => {
    fetch('/data/guide?guideid=' + cragData.guide_id)
    .then(response => response.json())
    .then(guideData => {
      const topoName=document.getElementById('topo-name');
      topoName.innerHTML = guideData.name + ' / ' + cragData.name + ' / ' + data.name;
    });
  });

  topoData = data;
  base_image.src = 'data/image/' + topoData.topo_image_file;
  base_image.onload = function() {
    const canvas=document.getElementById("topo-image");
    const canvasPos = canvas.getBoundingClientRect();
    canvas.width = canvasPos.width;
    canvas.height = canvasPos.height / base_image.height * base_image.width;
    drawRouteTable();
    resize();
    window.addEventListener('resize', resize, false);
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
