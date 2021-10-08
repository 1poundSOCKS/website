//
// page load
//

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
      if( event != undefined ) {
        location.href = '/crag?cragid=' + event.currentTarget.cells[0].innerText;
        reload();
      }
    };
  });
}
