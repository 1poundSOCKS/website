//
// page load
//

let LoadImage = (url) => new Promise( (resolve, reject) => {
  const img = new Image();
  img.onload = () => resolve(img);
  img.onerror = (err) => reject(err);
  img.src = url;
});

let LoadTopoData = async (topoId) => {
  const response = await fetch(`/data/topo?topo_id=${topoId}`);
  return response.json();
}

function Resize() {
  var canvas=document.getElementById("topo-image");
  drawTopoImage(base_image, canvas);
  drawTopoRoutes(base_image, canvas);
}

let LoadPage = async (topoId) => {
  const topoData = await LoadTopoData(topoId);
  const topoName=document.getElementById('topo-name');
  topoName.innerHTML = `${topoData.results.parent_data.parent_data.name} - ${topoData.results.parent_data.name} - ${topoData.results.name}`;

  base_image = await LoadImage(`data/image/${topoData.results.image_file}`);
  const canvas=document.getElementById("topo-image");
  const canvasPos = canvas.getBoundingClientRect();
  canvas.width = canvasPos.width;
  canvas.height = canvasPos.height / base_image.height * base_image.width;
  drawRouteTable(topoData);
  Resize();
  
  window.addEventListener('resize', Resize, false);
  AddMouseSupportToCanvas(base_image, canvas);
  const routeTable = document.getElementById("route-table");
  AddMouseSupportToTable(base_image, canvas, routeTable);
}

var topoData;
var base_image;

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const topoId = urlParams.get('topo_id');

LoadPage(topoId);
