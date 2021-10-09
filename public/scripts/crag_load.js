//
// page load
//

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const cragId = urlParams.get('cragid');

fetch('/data/crag?cragid=' + cragId)
.then(response => response.json())
.then(cragData => {
  fetch('/data/guide?guideid=' + cragData.guide_id)
  .then(response => response.json())
  .then(guideData => {
    const cragName=document.getElementById('crag-name');
    cragName.innerHTML = guideData.name + " / " + cragData.name;
  });
});

fetch('/data/topo_list?cragid=' + cragId)
.then(response => response.json())
.then(data => {
  const tableBody=document.getElementById('topo-table-body');
  UpdateTable(tableBody, data);
});

function UpdateTable(tableBody, data) {
  tableBody.innerHTML = '';
  data.topos.forEach(topo => {
    var row = document.createElement('tr');
    row.appendChild(document.createElement('td')).appendChild(document.createTextNode(topo.id));
    row.appendChild(document.createElement('td')).appendChild(document.createTextNode(topo.name));
    tableBody.appendChild(row).onclick = event => {
      if( event != undefined )
      location.href = '/topo?topoid=' + event.currentTarget.cells[0].innerText;
      reload();
    };
  });
}
