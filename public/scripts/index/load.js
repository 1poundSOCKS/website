//
// page load
//

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const topoId = urlParams.get('topoid');

fetch('/data/crag_list')
.then(response => response.json())
.then(data => {
  const tableBody=document.getElementById('crag-table-body');
  UpdateTable(tableBody, data);
});

function UpdateTable(tableBody, data) {
  tableBody.innerHTML = '';
  data.crags.forEach(crag => {
    var row = document.createElement('tr');
    row.appendChild(document.createElement('td')).appendChild(document.createTextNode(crag.id));
    row.appendChild(document.createElement('td')).appendChild(document.createTextNode(crag.name));
    tableBody.appendChild(row).onclick = event => {
      if( event != undefined )
      //alert(event.currentTarget.rowIndex);
      alert(event.currentTarget.cells[0].innerText);
    };
  });
}
