let CreateRowFromObject = (route, index) => {
  let row = document.createElement('tr');
  row.innerHTML = 
  `<td>${route.id}</td>
  <td><input id="route-checkbox" class="route-checkbox" type="checkbox"/></td>
  <td>${index}</td>
  <td>${route.name}</td>
  <td>${GetRouteTypeForDisplay(route.type)}</td>
  <td>${GetFullGradeForDisplay(route.grade)}</td>`;
  return row;
}

let GetRowCheckBox = row => row.cells[1].children[0];

let IsRowSelected = row => (GetRowCheckBox(row) != undefined) ? GetRowCheckBox(row).checked : false;

let GetRowsAsArray = () => Array.from(document.getElementById('route-table').rows).filter(row => row.rowIndex > 0);

let GetSelectedRows = () => GetRowsAsArray().filter(row => IsRowSelected(row));

let GetUnselectedRows = () => GetRowsAsArray().filter(row => !IsRowSelected(row));

let GetRowId = row => row.cells[0].innerText;

let GetRouteFromRow = (topoData, row) => GetRouteById(topoData, GetRowId(row));

let GetSelectedRoutes = topoData => GetSelectedRows().map(row => GetRouteFromRow(topoData, row));

let GetUnselectedRoutes = topoData => GetUnselectedRows().map(row => GetRouteFromRow(topoData, row));

let SetSelectedRoutes = (routes) => {
  const rows = GetRowsAsArray();
  const selectedRows = rows.filter(row => {
    const rowId = GetRowId(row);
    return (routes.filter(route => (route.id == rowId)).length > 0);
  });
  for( let row of selectedRows ) {
    GetRowCheckBox(row).checked = true;
  }
}

let UpdateRouteTable = (topoData) => {
  var routeTable=document.getElementById("route-table-body");
  routeTable.innerHTML = '';
  if( topoData.routes != undefined ) {
    topoData.routes.forEach((route, index) => {
      var row = CreateRowFromObject(route, index+1);
      routeTable.appendChild(row).onclick = event => {
        if( event != undefined ) {
          const checkBox = GetRowCheckBox(event.currentTarget);//.cells[0].children[0];
          checkBox.checked = !checkBox.checked;
        }
      };
    });
  }
}

let EditSelectedRoute = topoData => {
  const routes = GetSelectedRoutes(topoData);
  if( routes.length != 1 ) return;
  EditRouteDialog(routes[0], (newRoute) => {
    UpdateRouteById(topoData, newRoute);
    UpdateRouteTable(topoData);
    SetSelectedRoutes(routes);
  });
}

let MoveSelectedRouteUp = topoData => {
  const routes = GetSelectedRoutes(topoData);
  if( routes.length != 1 ) return;
  const previousRoute = GetPreviousRoute(topoData, routes[0]);
  SwapRoutes(topoData, routes[0], previousRoute);
  UpdateRouteTable(topoData);
  SetSelectedRoutes(routes);
}

let MoveSelectedRouteDown = topoData => {
  const routes = GetSelectedRoutes(topoData);
  if( routes.length != 1 ) return;
  const nextRoute = GetNextRoute(topoData, routes[0]);
  SwapRoutes(topoData, routes[0], nextRoute);
  UpdateRouteTable(topoData);
  SetSelectedRoutes(routes);
}

let DeleteSelectedRoutes = topoData => {
  const unselectedRoutes = GetUnselectedRoutes(topoData);
  topoData.routes = unselectedRoutes;
  UpdateRouteTable(topoData);
}
