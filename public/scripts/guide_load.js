//
// page load
//

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const guideId = urlParams.get('guideid');

fetch('/data/guide?guideid=' + guideId)
.then(response => response.json())
.then(data => {
  const cragName=document.getElementById('guide-name');
  cragName.innerHTML = data.name;
});

fetch('/data/crag_list')
.then(response => response.json())
.then(data => {
  const tableBody=document.getElementById('crag-table-body');
  UpdateTable(tableBody, data);
});

function UpdateTable(tableBody, data) {
  tableBody.innerHTML = '';
  data.documents.forEach(crag => {
    var row = document.createElement('tr');
    row.appendChild(document.createElement('td')).appendChild(document.createTextNode(crag._id));
    row.appendChild(document.createElement('td')).appendChild(document.createTextNode(crag.name));
    tableBody.appendChild(row).onclick = event => {
      if( event != undefined ) {
        location.href = '/crag?cragid=' + event.currentTarget.cells[0].innerText;
        reload();
      }
    };
  });
}
