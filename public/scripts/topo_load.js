//
// page load
//

let Resize = () => {
  DrawImage(topoData);
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
  topoData = await LoadTopoData(topoId);
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

let topoData = null;

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const topoId = urlParams.get('topo_id');

LoadPage(topoId);
