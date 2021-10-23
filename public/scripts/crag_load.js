//
// page load
//

function UpdateTable(tableBody, data) {
  tableBody.innerHTML = '';
  data.results.forEach(topo => {
    var row = document.createElement('tr');
    row.appendChild(document.createElement('td')).appendChild(document.createTextNode(topo._id));
    row.appendChild(document.createElement('td')).appendChild(document.createTextNode(topo.name));
    tableBody.appendChild(row).onclick = event => {
      if( event != undefined ) {
        location.href = `/topo?topo_id=${event.currentTarget.cells[0].innerText}`;
        reload();
      }
    };
  });
}

let LoadCragData = async (cragId) => {
  const response = await fetch(`/data/crag?crag_id=${cragId}`);
  return response.json();
}

let LoadTopoList = async (cragId) => {
  const response = await fetch(`/data/topo_list?crag_id=${cragId}`);
  return response.json();
}

let LoadTopoTable = async (cragId) => {
  const topoList = await LoadTopoList(cragId);
  const tableBody=document.getElementById('topo-table-body');
  UpdateTable(tableBody, topoList);
}

let AddTopo = async (topoName, cragId) => {
  const response = await fetch('/data/add_topo', {
    method: 'post',
    headers: {
      'Accept': 'application/json, text/plain, */*',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({name: topoName, parent_id: cragId})
  });

  return response.json();
}

let LoadPage = async (cragId) => {
  const cragData = await LoadCragData(cragId);
  const cragName=document.getElementById('crag-name');
  cragName.innerHTML = `${cragData.results.parent_data.name} - ${cragData.results.name}`;

  LoadTopoTable(cragId);

  const createButton = document.getElementById('add-topo');
  const dialog = document.getElementById('add-topo-dialog');
  createButton.onclick = () => {
    dialog.showModal();
  }

  dialog.addEventListener('close', async () => {
    const rv = dialog.returnValue;
    if( rv == 'confirm' ) {
      const topoName = document.getElementById('topo-name').value;
      const response = await AddTopo(topoName, cragId);
      // TODO: check response
      // {"acknowledged":true,"insertedId":"61726db5a7488601199a1b12"}
      LoadTopoTable(cragId);
    }
  });
}

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const cragId = urlParams.get('crag_id');

LoadPage(cragId);
