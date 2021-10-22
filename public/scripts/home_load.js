//
// page load
//

let UpdateTable = (tableBody, data) => {
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

let CreateGuide = async (guideName) => {
  const response = await fetch('/data/add_guide', {
    method: 'post',
    headers: {
      'Accept': 'application/json, text/plain, */*',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({name: guideName})
  });

  return response.json();
}

let LoadGuideTable = async () => {
  const response = await fetch('/data/guide_list');
  const guideList = await response.json();
  const tableBody=document.getElementById('guide-table-body');
  UpdateTable(tableBody, guideList);
}

let LoadPage = async () => {
  await LoadGuideTable();

  const createButton = document.getElementById('create-guide');
  const dialog = document.getElementById('create-guide-dialog');
  createButton.onclick = () => {
    dialog.showModal();
  }
  
  dialog.addEventListener('close', async () => {
    const rv = dialog.returnValue;
    if( rv == 'confirm' ) {
      const guideName = document.getElementById('guide-name').value;
      const response = await CreateGuide(guideName);
      // TODO: check response
      // {"acknowledged":true,"insertedId":"61726db5a7488601199a1b12"}
      LoadGuideTable();
    }
  });
}

LoadPage();
