//
// page load
//

fetch('/data/guide_list')
.then(response => response.json())
.then(data => {
  const tableBody=document.getElementById('guide-table-body');
  UpdateTable(tableBody, data);
});

function UpdateTable(tableBody, data) {
  tableBody.innerHTML = '';
  data.guides.forEach(guide => {
    var row = document.createElement('tr');
    row.appendChild(document.createElement('td')).appendChild(document.createTextNode(guide.id));
    row.appendChild(document.createElement('td')).appendChild(document.createTextNode(guide.name));
    tableBody.appendChild(row).onclick = event => {
      if( event != undefined ) {
        location.href = '/guide?guideid=' + event.currentTarget.cells[0].innerText;
        reload();
      }
    };
  });
}
