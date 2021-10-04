//
// page load
//

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const cragId = urlParams.get('cragid');

fetch('/data/crag?cragid=' + cragId)
.then(response => response.json())
.then(data => {
  const cragName=document.getElementById('crag-name');
  cragName.innerHTML = data.name;
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
    row.appendChild(document.createElement('td')).innerHTML = '<img src="data/image/' + topo.topo_image_file + '" border=3 height=100 width=200>';
    tableBody.appendChild(row).onclick = event => {
      if( event != undefined )
      location.href = '/topo?topoid=' + event.currentTarget.cells[0].innerText;
      reload();
    };
  });
}
