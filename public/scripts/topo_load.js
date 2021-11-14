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

let Resize = () => {
  var canvas=document.getElementById("topo-image");
  drawTopoImage(base_image, canvas);
  drawTopoRoutes(base_image, canvas);
}

let UploadImage = topoData => {
  //let dialogDoc = new Document();
  //const htmlElement = dialogDoc.createElement('html');
  //const root = dialogDoc.appendChild(htmlElement);
  //const root = dialogDoc.getRootNode();
  //root.innerHTML = `<body>
  // <dialog id="upload-image-dialog">
  // <form method="dialog">
  // </form>
  // </dialog>
  // </body>`;
  const dialog = document.getElementById('upload-image-dialog');
  dialog.onclose = (event) => {
    const rv = dialog.returnValue;
    if( rv == 'confirm' ) {
      var input = document.querySelector('input[type="file"]')

      var data = new FormData()
      data.append('file', input.files[0])
      data.append('user', 'hubot')
      
      fetch('/avatars', {
        method: 'POST',
        body: data
      })
    }
  }
  dialog.showModal();
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
  
  document.getElementById('upload-image').onclick = () => {
    UploadImage(topoData);
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
