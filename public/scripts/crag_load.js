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

let LoadPage = async (cragId) => {
  const cragData = await LoadCragData(cragId);
  const cragName=document.getElementById('crag-name');
  cragName.innerHTML = `${cragData.results.parent_data.name} - ${cragData.results.name}`;

  const topoList = await LoadTopoList(cragId);
  const tableBody=document.getElementById('topo-table-body');
  UpdateTable(tableBody, topoList);
}

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const cragId = urlParams.get('crag_id');

LoadPage(cragId);
