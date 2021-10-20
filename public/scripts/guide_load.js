//
// page load
//

function UpdateTable(tableBody, data) {
  tableBody.innerHTML = '';
  data.results.forEach(crag => {
    var row = document.createElement('tr');
    row.appendChild(document.createElement('td')).appendChild(document.createTextNode(crag._id));
    row.appendChild(document.createElement('td')).appendChild(document.createTextNode(crag.name));
    tableBody.appendChild(row).onclick = event => {
      if( event != undefined ) {
        location.href = '/crag?crag_id=' + event.currentTarget.cells[0].innerText;
        reload();
      }
    };
  });
}

let LoadGuideData = async (guideId) => {
  const response = await fetch(`/data/guide?guide_id=${guideId}`);
  return response.json();
}

let LoadCragList = async (guideId) => {
  const response = await fetch('/data/crag_list?guide_id=' + guideId);
  return response.json();
}

let LoadPage = async (guideId) => {
  const guideData = await LoadGuideData(guideId);
  const cragName=document.getElementById('guide-name');
  cragName.innerHTML = guideData.results.name;

  const cragList = await LoadCragList(guideId);
  const tableBody=document.getElementById('crag-table-body');
  UpdateTable(tableBody, cragList);
}

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const guideId = urlParams.get('guide_id');
LoadPage(guideId);
