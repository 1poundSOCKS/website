//
// route table control
//

let UpdateRouteTable = (routes) => {
  if( !routes ) return;
  var routeTable=document.getElementById("route-table-body");
  routeTable.innerHTML = '';
  routes.forEach( (route, index) => {
    var row = CreateRowFromObject(route, index+1);
    routeTable.appendChild(row).onclick = event => {
      if( event != undefined ) {
        const checkBox = GetRowCheckBox(event.currentTarget);//.cells[0].children[0];
        checkBox.checked = !checkBox.checked;
      }
    }
  });
}

let UpdateRow = (row, route) => {
  row.innerHTML = GetRowHTML(route, row.rowIndex);
}

let MoveSelectedRouteUp = () => {
  ShiftSelectedRoutes(-1);
}

let MoveSelectedRouteDown = () => {
  ShiftSelectedRoutes(1);
}

let ShiftSelectedRoutes = (distance) => {
  const rowsToMove = GetSelectedRows();
  const rowIds = rowsToMove.map(row => GetRowId(row));
  const rows = GetRowsAsArray();
  rowsToMove.forEach( rowToMove => {
    SwapRows(rows, rowToMove.rowIndex - 1, rowToMove.rowIndex - 1 + distance);
  });
  ReIndexTable();
  SelectRowsById(rowIds);
}

let ReIndexTable = () => {
  GetRowsAsArray().forEach( row => UpdateRowIndex(row) );
}

let SwapRows = (rows, firstIndex, secondIndex) => {
  if( !rows[firstIndex] || !rows[secondIndex]) return;
  const firstRowContent = rows[firstIndex].innerHTML;
  const secondRowContent = rows[secondIndex].innerHTML;
  rows[firstIndex].innerHTML = secondRowContent;
  rows[secondIndex].innerHTML = firstRowContent;
}

let DeleteSelectedRows = () => {
  const table=GetRouteTable();
  for( let rowIndex = table.rows.length-1; rowIndex > 0; rowIndex-- ) {
    console.log(`rowIndex=${rowIndex}`);
    const row = table.rows[rowIndex];
    if( RowIsSelected(row) ) table.deleteRow(rowIndex);
  }
}

let RouteArrayToIdSet = routes => new Set(array.map(route => route.id));

let GetRouteTable = () => routeTable=document.getElementById("route-table");

let CreateRowFromObject = (route, index) => {
  let row = document.createElement('tr');
  row.innerHTML = GetRowHTML(route, index);
  return row;
}

let GetRowHTML = (route, index) => {
  return `<td>${route.id}</td>
  <td><input id="route-checkbox" class="route-checkbox" type="checkbox"/></td>
  <td>${index}</td>
  <td>${route.name}</td>
  <td>${GetRouteTypeForDisplay(route.type)}</td>
  <td>${GetFullGradeForDisplay(route.grade)}</td>`;
}

let GetRowCheckBox = row => row.cells[1].children[0];

let GetRowIndexCell = row => row.cells[2];

let SetRowIndex = (row, index) => GetRowIndexCell(row).innerText = index;

let UpdateRowIndex = row => SetRowIndex(row, row.rowIndex);

let RowIsSelected = row => (GetRowCheckBox(row) != undefined) ? GetRowCheckBox(row).checked : false;

let GetRowsAsArray = () => Array.from(document.getElementById('route-table').rows).filter(row => row.rowIndex > 0);

let GetSelectedRows = () => {
  let selectedRows = [];
  const rows = GetRowsAsArray();
  rows.forEach( row => {
    if( RowIsSelected(row) ) selectedRows.push(row);
  });
  return selectedRows;
}

let GetSelectedRowIds = () => {
  return GetSelectedRows().map(row => GetRowId(row));
}

let SelectRowsById = (ids) => {
  const idSet = new Set(ids);
  GetRowsAsArray().forEach(row => {
    if( idSet.has(GetRowId(row)) ) GetRowCheckBox(row).checked = true;
  });
}

let GetUnselectedRows = () => GetRowsAsArray().filter(row => !IsRowSelected(row));

let GetRowId = row => row.cells[0].innerText;

let SelectRoutes = (routes) => {
  const rows = GetRowsAsArray();
  const selectedRows = rows.filter(row => {
    const rowId = GetRowId(row);
    return (routes.filter(route => (route.id == rowId)).length > 0);
  });
  for( let row of selectedRows ) {
    GetRowCheckBox(row).checked = true;
  }
}
