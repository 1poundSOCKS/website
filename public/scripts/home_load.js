//
// page load
//

function UpdateTable(tableBody, data) {
  tableBody.innerHTML = '';
  data.results.forEach(guide => {
    var row = document.createElement('tr');
    row.appendChild(document.createElement('td')).appendChild(document.createTextNode(guide._id));
    row.appendChild(document.createElement('td')).appendChild(document.createTextNode(guide.name));
    tableBody.appendChild(row).onclick = event => {
      if( event != undefined ) {
        location.href = `/guide?guide_id=${event.currentTarget.cells[0].innerText}`;
        reload();
      }
    };
  });
}

let LoadPage = async () => {
  const response = await fetch('/data/guide_list');
  const guideList = await response.json();
  const tableBody=document.getElementById('guide-table-body');
  UpdateTable(tableBody, guideList);
}

LoadPage();
