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
  const data = await response.json();
  return data.results;
}

let UpdateTopoData = async (topoData) => {
  const response = await fetch('/data/update_topo', {
    method: 'post',
    headers: {
      'Accept': 'application/json, text/plain, */*',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(topoData)
  });

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
  topoName.innerHTML = `${topoData.parent_data.parent_data.name} - ${topoData.parent_data.name} - ${topoData.name}`;

  UpdateRouteTable(topoData);
  
  // base_image = await LoadImage(`data/image/${topoData.results.image_file}`);
  // const canvas=document.getElementById("topo-image");
  // const canvasPos = canvas.getBoundingClientRect();
  // canvas.width = canvasPos.width;
  // canvas.height = canvasPos.height / base_image.height * base_image.width;
  // drawRouteTable(topoData);
  // Resize();
  
  // window.addEventListener('resize', Resize, false);
  // AddMouseSupportToCanvas(base_image, canvas);
  // const routeTable = document.getElementById("route-table");
  // AddMouseSupportToTable(base_image, canvas, routeTable);

  document.getElementById('add-route').onclick = () => {
    const route = {};
    EditRouteDialog(route, (newRoute) => {
      topoData.routes = (topoData.routes == undefined) ? [] : topoData.routes;
      newRoute.id = topoData.routes.length + 1;
      topoData.routes.push(newRoute);
      UpdateRouteTable(topoData);
    });
  }
  
  document.getElementById('edit-route').onclick = () => {
    EditSelectedRoute(topoData);
  }
  
  document.getElementById('move-route-up').onclick = () => {
    MoveSelectedRouteUp(topoData);
  }
  
  document.getElementById('move-route-down').onclick = () => {
    MoveSelectedRouteDown(topoData);
  }
  
  document.getElementById('delete-routes').onclick = () => {
    DeleteSelectedRoutes(topoData);
  }
  
  document.getElementById('save-changes').onclick = () => {
    delete topoData.parent_data;
    UpdateTopoData(topoData);
  }
}

var topoData;
var base_image;

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const topoId = urlParams.get('topo_id');

LoadPage(topoId);
