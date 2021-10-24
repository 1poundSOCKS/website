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
  const response = await fetch('/data/update_topo');
  const data = await response.json();
  return data.results;
}

function Resize() {
  var canvas=document.getElementById("topo-image");
  drawTopoImage(base_image, canvas);
  drawTopoRoutes(base_image, canvas);
}

let UpdateRouteTable = (topoData) => {
  var routeTable=document.getElementById("route-table-body");
  routeTable.innerHTML = '';
  if( topoData.routes != undefined ) {
    topoData.routes.forEach(element => {
      const select = document.createElement('td');
      select.innerHTML = '<input class="route-checkbox" type="checkbox" />';
      const id = document.createElement('td');
      id.appendChild(document.createTextNode(element.id));
      const name = document.createElement('td');
      name.appendChild(document.createTextNode(element.name));
      const grade = document.createElement('td');
      grade.appendChild(document.createTextNode(element.grade));
      const row = document.createElement('tr');
      row.appendChild(select);
      row.appendChild(id);
      row.appendChild(name);
      row.appendChild(grade);
      routeTable.appendChild(row);
    });
  }
}

let LoadPage = async (topoId) => {
  const topoData = await LoadTopoData(topoId);
  const topoName=document.getElementById('topo-name');
  topoName.innerHTML = `${topoData.parent_data.parent_data.name} - ${topoData.parent_data.name} - ${topoData.name}`;
/*
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
*/
  const addButton = document.getElementById('add-route');
  const dialog = document.getElementById('add-route-dialog');
  addButton.onclick = () => {
    dialog.showModal();
  }

  dialog.addEventListener('close', async () => {
    const rv = dialog.returnValue;
    if( rv == 'confirm' ) {
      const routeName = document.getElementById('route-name').value;
      if( topoData.routes == undefined ) topoData.routes = [{id: 1, name: routeName}];
      else topoData.routes.push({id: topoData.routes.length + 1, name: routeName});
      UpdateRouteTable(topoData);
      // TODO: check response
      // {"acknowledged":true,"insertedId":"61726db5a7488601199a1b12"}
    }
  });
  
  const saveButton = document.getElementById('save-changes');
}

var topoData;
var base_image;

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const topoId = urlParams.get('topo_id');

LoadPage(topoId);
