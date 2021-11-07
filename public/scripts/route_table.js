let CreateRowFromObject = (route) => {
  let row = document.createElement('tr');
  row.innerHTML = 
  `<td><input id="route-checkbox" class="route-checkbox" type="checkbox"/></td>
  <td>${route.id}</td>
  <td>${route.name}</td>
  <td>${GetRouteTypeForDisplay(route.type)}</td>
  <td>${GetDisplayGrade(route.grade)}</td>`;
  return row;
}

let GetRowCheckBox = row => row.cells[0].children[0];

let IsRowSelected = row => (GetRowCheckBox(row) != undefined) ? GetRowCheckBox(row).checked : false;

let GetRowsAsArray = () => Array.from(document.getElementById('route-table').rows);

let GetSelectedRows = () => GetRowsAsArray().filter(row => IsRowSelected(row));

let GetRowId = row => row.cells[1].innerText;

let GetRouteFromRow = (topoData, row) => GetRouteById(topoData, GetRowId(row));

let GetSelectedRoutes = topoData => GetSelectedRows().map(row => GetRouteFromRow(topoData, row));

let SetSelectedRoutes = (topoData, routes) => {
  const rows = GetRowsAsArray();
  rows.filter(row => {
    const rowId = GetRowId(row);
    return (routes.filter(route => route.id == rowId).length > 0);
  });
}

let UpdateRouteTable = (topoData) => {
  var routeTable=document.getElementById("route-table-body");
  routeTable.innerHTML = '';
  if( topoData.routes != undefined ) {
    topoData.routes.forEach(route => {
      var row = CreateRowFromObject(route);
      routeTable.appendChild(row).onclick = event => {
        if( event != undefined ) {
          const checkBox = event.currentTarget.cells[0].children[0];
          checkBox.checked = !checkBox.checked;
        }
      };
    });
  }
}
