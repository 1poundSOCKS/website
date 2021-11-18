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

let DrawImage = () => {
  const canvas=document.getElementById("topo-image");
  const canvasPos = canvas.getBoundingClientRect();
  canvas.width = canvasPos.width;
  canvas.height = canvas.width * base_image.height / base_image.width;
  DrawTopoImage(base_image, canvas);
}

let LoadAndDisplayImage = async topoData => {
  if( !topoData.image_file ) return;
  base_image = await LoadImage(`data/image/${topoData.image_file}`);
  DrawImage();
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
  DrawImage();
}

let UploadImage = topoData => {
  const dialog = document.getElementById('upload-image-dialog');
  dialog.onclose = (event) => {
    const rv = dialog.returnValue;
    if( rv == 'confirm' ) {
      var input = document.getElementById("topo-image-file");
      var formData = new FormData();
      formData.append('topo-image', input.files[0]);
      formData.append('id', topoData._id);
      fetch('/upload-topo-image', {
        method: 'POST',
        body: formData
      })
      .then(response => response.json())
      .then(data => {
        console.log(`data=${JSON.stringify(data)}`)
        topoData.image_file = data.filename;
        LoadAndDisplayImage(topoData);
      })
      .catch(e => console.log(`exception: ${e.message}`));
    }
  }
  dialog.showModal();
}

let LoadPage = async (topoId) => {
  const topoData = await LoadTopoData(topoId);
  const topoName=document.getElementById('topo-name');
  topoName.innerHTML = `${topoData.parent_data.parent_data.name} - ${topoData.parent_data.name} - ${topoData.name}`;

  UpdateRouteTable(topoData);
  LoadAndDisplayImage(topoData);
  
  window.addEventListener('resize', Resize, false);

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
