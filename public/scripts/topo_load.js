//
// page load
//

let LoadImage = (url) => new Promise( (resolve, reject) => {
  const img = new Image();
  img.onload = () => resolve(img);
  img.onerror = (err) => reject(err);
  img.src = url;
});

let LoadTopoData = async (topoId) => {
  const response = await fetch(`/data/topo?topo_id=${topoId}`);
  const data = await response.json();
  return data.results;
}

let UpdateTopoData = async (topoData) => {
  const response = await fetch('/data/update_topo', {
    method: 'post',
    headers: {
      'Accept': 'application/json, text/plain, */*',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(topoData)
  });

  return response.json();
}

function Resize() {
  var canvas=document.getElementById("topo-image");
  drawTopoImage(base_image, canvas);
  drawTopoRoutes(base_image, canvas);
}

let GetGradeSelection = (system) => {
  switch( system ) {
    case 'uk':
      return [
        {key: 'm', value: 'Mod'}, 
        {key: 'd', value: 'Diff'},
        {key: 'vd', value: 'VDiff'},
        {key: 'hvd', value: 'HVD'},
        {key: 's', value: 'Severe'},
        {key: 'hs', value: 'HS'},
        {key: 'vs', value: 'VS'},
        {key: 'hvs', value: 'HVS'},
        {key: 'e1', value: 'E1'}
      ];
    case 'french':
      return [
        {key: '1', value: 'F1'}, 
        {key: '1+', value: 'F1+'},
        {key: '2', value: 'F2'},
        {key: '2+', value: 'F2+'},
        {key: '3', value: 'F3'},
        {key: '3+', value: 'F3+'},
        {key: '4', value: 'F4'},
        {key: '4+', value: 'F4+'},
        {key: '5a', value: 'F5a'}
      ];
      default:
        return [];
  }
}

let GetAdditionalGradeSelection = (system) => {
  switch( system ) {
    case 'uk':
      return [
        {key: '4a', value: '4a'}, 
        {key: '4b', value: '4b'},
        {key: '4c', value: '4c'},
        {key: '5a', value: '5a'},
        {key: '5b', value: '5b'},
        {key: '5c', value: '5c'},
        {key: '6a', value: '6a'},
        {key: '6b', value: '6b'},
        {key: '6c', value: '6c'},
        {key: '7a', value: '7a'},
        {key: '7b', value: '7b'}
      ];
    default:
      return [];
  }
}

let GetGradeSelectionObject = (system) => {
  let object = new Object;
  const gradeSelection = GetGradeSelection(system);
  gradeSelection.forEach( grade => {
    object[grade.key] = grade.value;
  })

  return object;
}

let GetAdditionalGradeSelectionObject = (system) => {
  let object = new Object;
  const gradeSelection = GetAdditionalGradeSelection(system);
  gradeSelection.forEach( grade => {
    object[grade.key] = grade.value;
  })

  return object;
}

let GetDisplayRouteType = (type) => {
  switch(type) {
    case 'sport': return 'Sport';
    case 'trad' : return 'Trad';
    default: return '';
  }
}

let GetDisplayGrade = (grade) => {
  if( grade == undefined ) return '';
  const gradeSelection = GetGradeSelectionObject(grade.system);
  const additionalGradeSelection = GetAdditionalGradeSelectionObject(grade.system);
  return (additionalGradeSelection[grade.additional_value] == undefined ) ? 
  gradeSelection[grade.value] : `${gradeSelection[grade.value]} ${additionalGradeSelection[grade.additional_value]}`;
}

let UpdateRouteTable = (topoData) => {
  var routeTable=document.getElementById("route-table-body");
  routeTable.innerHTML = '';
  let html = '';
  if( topoData.routes != undefined ) {
    topoData.routes.forEach(element => {
      html += 
      `<tr>
        <td><input class="route-checkbox" type="checkbox" /></td>
        <td>${element.id}</td>
        <td>${element.name}</td>
        <td>${GetDisplayRouteType(element.type)}</td>
        <td>${GetDisplayGrade(element.grade)}</td>
      </tr>`;
    });
  }

  routeTable.innerHTML = html;
}

let GetRouteGradeValue = (system) => {
  switch( system ) {
    case 'uk':
      return document.getElementById('route-grade').value;
    case 'french':
      return document.getElementById('route-grade').value;
  }
}

let GetAdditionalRouteGradeValue = (system) => {
  switch( system ) {
    case 'uk':
      return document.getElementById('additional-route-grade').value;
    default:
      return undefined;
  }
}

let GetGradeSelectionHtml = (system) => {
  let gradeHtml = [];
  gradeHtml.push(`<label for="route-grade">Route grade:</label>`);
  gradeHtml.push(`<select id="route-grade"><option value="" selected="selected"></option>`);
  const gradeDefs = GetGradeSelection(system);
  gradeDefs.forEach( gradeDef => {
    gradeHtml.push(`<option value="${gradeDef.key}">${gradeDef.value}</option>`);
  });
  gradeHtml.push('</select>');
  const additionalGradeDefs = GetAdditionalGradeSelection(system);
  if( additionalGradeDefs != null ) {
    gradeHtml.push(`<select id="additional-route-grade"><option value="" selected="selected"></option>`);
    additionalGradeDefs.forEach( def => {
      gradeHtml.push(`<option value="${def.key}">${def.value}</option>`);
    });
    gradeHtml.push('</select>');
  }
  return gradeHtml.join('');
}

let LoadPage = async (topoId) => {
  const topoData = await LoadTopoData(topoId);
  const topoName=document.getElementById('topo-name');
  topoName.innerHTML = `${topoData.parent_data.parent_data.name} - ${topoData.parent_data.name} - ${topoData.name}`;

  UpdateRouteTable(topoData);
  /*
  base_image = await LoadImage(`data/image/${topoData.results.image_file}`);
  const canvas=document.getElementById("topo-image");
  const canvasPos = canvas.getBoundingClientRect();
  canvas.width = canvasPos.width;
  canvas.height = canvasPos.height / base_image.height * base_image.width;
  drawRouteTable(topoData);
  Resize();
  
  window.addEventListener('resize', Resize, false);
  AddMouseSupportToCanvas(base_image, canvas);
  const routeTable = document.getElementById("route-table");
  AddMouseSupportToTable(base_image, canvas, routeTable);
*/
  const addButton = document.getElementById('add-route');
  const dialog = document.getElementById('add-route-dialog');
  addButton.onclick = () => {
    dialog.showModal();
  }

  dialog.addEventListener('close', async () => {
    const rv = dialog.returnValue;
    if( rv == 'confirm' ) {
      const routeName = document.getElementById('route-name').value;
      const routeType = document.getElementById('route-type').value;
      const routeGradeSystem = document.getElementById('route-grade-system').value;
      const routeGradeValue = GetRouteGradeValue(routeGradeSystem);
      const addtionalRouteGradeValue = GetAdditionalRouteGradeValue(routeGradeSystem);
      topoData.routes = (topoData.routes == undefined) ? [] : topoData.routes;
      let routeGrade = {system: routeGradeSystem, value: routeGradeValue, additional_value: addtionalRouteGradeValue};
      let route = {id: topoData.routes.length + 1, name: routeName, type: routeType, grade: routeGrade };
      topoData.routes.push(route);
      UpdateRouteTable(topoData);
      // TODO: check response
      // {"acknowledged":true,"insertedId":"61726db5a7488601199a1b12"}
    }
  });
  
  const saveButton = document.getElementById('save-changes');
  saveButton.onclick = () => {
    delete topoData.parent_data;
    UpdateTopoData(topoData);
  }

  const gradeSystem = document.getElementById('route-grade-system');
  gradeSystem.onchange = () => {
    const gradeSelection = document.getElementById('system-specific-grade');
    gradeSelection.innerHTML = GetGradeSelectionHtml(gradeSystem.value);
  }
}

var topoData;
var base_image;

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const topoId = urlParams.get('topo_id');

LoadPage(topoId);
