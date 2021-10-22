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

let AddCrag = async (cragName, guideId) => {
  const response = await fetch('/data/add_crag', {
    method: 'post',
    headers: {
      'Accept': 'application/json, text/plain, */*',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({name: cragName, parent_id: guideId})
  });

  return response.json();
}

let LoadCragTable = async (guideId) => {
  const cragList = await LoadCragList(guideId);
  const tableBody=document.getElementById('crag-table-body');
  UpdateTable(tableBody, cragList);
}

let LoadPage = async (guideId) => {
  const guideData = await LoadGuideData(guideId);
  const cragName=document.getElementById('guide-name');
  cragName.innerHTML = guideData.results.name;

  await LoadCragTable(guideId);

  const createButton = document.getElementById('add-crag');
  const dialog = document.getElementById('add-crag-dialog');
  createButton.onclick = () => {
    dialog.showModal();
  }

  dialog.addEventListener('close', async () => {
    const rv = dialog.returnValue;
    if( rv == 'confirm' ) {
      const cragName = document.getElementById('crag-name').value;
      const response = await AddCrag(cragName, guideId);
      // TODO: check response
      // {"acknowledged":true,"insertedId":"61726db5a7488601199a1b12"}
      LoadCragTable(guideId);
    }
  });
}

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const guideId = urlParams.get('guide_id');

LoadPage(guideId);
