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

let CreateRowFromObject = (route) => {
  let row = document.createElement('tr');
  row.innerHTML = 
  `<td><input id="route-checkbox" class="route-checkbox" type="checkbox"/></td>
  <td>${route.id}</td>
  <td>${route.name}</td>
  <td>${GetRouteTypeForDisplay(route.type)}</td>
  <td>${GetDisplayGrade(route.grade)}</td>`;
  return row;
}

// let CreateObjectFromRow = (row) => {
//   return {id: row.cells[1].innerText, name: row.cells[2].innerText, type: GetRouteTypeForStorage(row.cells[3].innerText)};
// }

let UpdateRouteTable = (topoData) => {
  var routeTable=document.getElementById("route-table-body");
  routeTable.innerHTML = '';
  if( topoData.routes != undefined ) {
    topoData.routes.forEach(route => {
      var row = CreateRowFromObject(route);
      routeTable.appendChild(row).onclick = event => {
        if( event != undefined ) {
          const checkBox = event.currentTarget.cells[0].children[0];
          checkBox.checked = !checkBox.checked;
        }
      };
    });
  }
}

let GetRouteById = (topoData, id) => {
  for( let route of topoData.routes ) {
    if( route.id == id ) return route;
  }
  return null;
}

let GetSelectedRoute = (topoData) => {
  const table = document.getElementById('route-table');
  for (let row of table.rows) {
    const checkBox = row.cells[0].children[0];
    if( checkBox != undefined ) {
      if( checkBox.checked ) {
        return GetRouteById(topoData, row.cells[1].innerText);
      }
    }
  }
  return null;
}

let UpdateRouteById = (topoData, newRoute) => {
  const newRoutes = topoData.routes.map(route => {
    return (route.id == newRoute.id) ? newRoute : route;
  });
}

let LoadPage = async (topoId) => {
  const topoData = await LoadTopoData(topoId);
  const topoName=document.getElementById('topo-name');
  topoName.innerHTML = `${topoData.parent_data.parent_data.name} - ${topoData.parent_data.name} - ${topoData.name}`;

  UpdateRouteTable(topoData);
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
  addButton.onclick = () => {
    const route = {};
    EditRouteDialog(route, (newRoute) => {
      topoData.routes = (topoData.routes == undefined) ? [] : topoData.routes;
      newRoute.id = topoData.routes.length + 1;
      topoData.routes.push(newRoute);
      UpdateRouteTable(topoData);
    });
  }
  
  const editRouteButton = document.getElementById('edit-route');
  editRouteButton.onclick = () => {
    const route = GetSelectedRoute(topoData);
    if( route != null ) {
      EditRouteDialog(route, (newRoute) => {
        UpdateRouteById(topoData, newRoute);
        UpdateRouteTable(topoData);
      });
    }
  }
  
  const saveButton = document.getElementById('save-changes');
  saveButton.onclick = () => {
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
