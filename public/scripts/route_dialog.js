let GetRouteTypeSelection = () => {
  return [
    {key: 'trad', value: 'Trad'},
    {key: 'sport', value: 'Sport'},
    {key: 'boulder', value: 'Boulder'}
  ]
}

let GetGradeSystemSelection = () => {
  return [
    {key: 'uk', value: 'UK'},
    {key: 'french', value: 'French'},
    {key: 'font', value: 'Font'},
    {key: 'v', value: 'V'}
  ]
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
        {key: 'e1', value: 'E1'},
        {key: 'e2', value: 'E2'},
        {key: 'e3', value: 'E3'},
        {key: 'e4', value: 'E4'},
        {key: 'e5', value: 'E5'},
        {key: 'e6', value: 'E6'},
        {key: 'e7', value: 'E7'},
        {key: 'e8', value: 'E8'},
        {key: 'e9', value: 'E9'},
        {key: 'e10', value: 'E10'},
        {key: 'e11', value: 'E11'},
        {key: 'e12', value: 'E12'}
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
        {key: '5a', value: 'F5a'},
        {key: '5b', value: 'F5b'},
        {key: '5c', value: 'F5c'},
        {key: '6a', value: 'F6a'},
        {key: '6a+', value: 'F6a+'},
        {key: '6b', value: 'F6b'},
        {key: '6b+', value: 'F6b+'},
        {key: '6c', value: 'F6c'},
        {key: '6c+', value: 'F6c+'},
        {key: '7a', value: 'F7a'},
        {key: '7a+', value: 'F7a+'},
        {key: '7b', value: 'F7b'},
        {key: '7b+', value: 'F7b'},
        {key: '7c', value: 'F7c'},
        {key: '7c+', value: 'F7c'},
        {key: '8a', value: 'F8a'},
        {key: '8a+', value: 'F8a+'},
        {key: '8b', value: 'F8b'},
        {key: '8b+', value: 'F8b+'},
        {key: '8c', value: 'F8c'},
        {key: '8c+', value: 'F8c+'},
        {key: '9a', value: 'F9a'},
        {key: '9a+', value: 'F9a+'},
        {key: '9b', value: 'F9b'},
        {key: '9b+', value: 'F9b+'},
        {key: '9c', value: 'F9c'},
        {key: '9c+', value: 'F9c+'}
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
        {key: '7b', value: '7b'},
        {key: '7c', value: '7c'}
      ];
    default:
      return [];
  }
}

let GetDisplayValueFromStoredValue = (values) => {
  let object = {};
  values.forEach( value => {
    object[value.key] = value.value;
  })

  return object;
}

let GetStoredValueFromDisplayValue = (values) => {
  let object = {};
  values.forEach( value => {
    object[value.value] = value.key;
  })

  return object;
}

let GetRouteTypeDisplayObject = () => GetDisplayValueFromStoredValue(GetRouteTypeSelection());
let GetRouteTypeStorageObject = () => GetStoredValueFromDisplayValue(GetRouteTypeSelection());
let GetGradeSelectionObject = (system) => GetDisplayValueFromStoredValue(GetGradeSelection(system));
let GetAdditionalGradeSelectionObject = (system) => GetDisplayValueFromStoredValue(GetAdditionalGradeSelection(system));

let GetRouteTypeForDisplay = (storageValue) => GetRouteTypeDisplayObject()[storageValue];
let GetRouteTypeForStorage = (displayValue) => GetRouteTypeStorageObject()[displayValue];

let GetDisplayGrade = (grade) => {
  if( grade == undefined ) return '';
  const gradeSelection = GetGradeSelectionObject(grade.system);
  const additionalGradeSelection = GetAdditionalGradeSelectionObject(grade.system);
  return (additionalGradeSelection[grade.additional_value] == undefined ) ? 
  gradeSelection[grade.value] : `${gradeSelection[grade.value]} ${additionalGradeSelection[grade.additional_value]}`;
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

let GetSelectionHtml = (selection) => {
  let html = [];
  selection.forEach( item => {
    html.push(`<option value="${item.key}">${item.value}</option>`);
  });
  return html.join('');
}

let GetRouteTypeSelectionHtml = () => GetSelectionHtml(GetRouteTypeSelection());
let GetGradeSystemSelectionHtml = () => GetSelectionHtml(GetGradeSystemSelection());
let GetGradeSelectionHtml = (system) => GetSelectionHtml(GetGradeSelection(system));

let GetFullGradeSelectionHtml = (system) => {
  let gradeHtml = [];
  gradeHtml.push(`<label for="route-grade">Route grade:</label>`);
  gradeHtml.push(`<select id="route-grade"><option value="" selected="selected"></option>`);
  gradeHtml.push(GetGradeSelectionHtml(system));
  gradeHtml.push('</select>');

  const additionalGradeDefs = GetAdditionalGradeSelection(system);
  if( additionalGradeDefs.length > 0 ) {
    gradeHtml.push(`<select id="additional-route-grade"><option value="" selected="selected"></option>`);
    additionalGradeDefs.forEach( def => {
      gradeHtml.push(`<option value="${def.key}">${def.value}</option>`);
    });
    gradeHtml.push('</select>');
  }
  return gradeHtml.join('');
}

let InitRouteDialog = (route) => {
  const routeType = document.getElementById('route-type');
  routeType.innerHTML = GetRouteTypeSelectionHtml();

  const gradeSystem = document.getElementById('route-grade-system');
  gradeSystem.innerHTML = GetGradeSystemSelectionHtml();

  gradeSystem.onchange = () => document.getElementById('system-specific-grade').innerHTML = GetFullGradeSelectionHtml(gradeSystem.value);

  document.getElementById('route-name').value = (route.name == undefined) ? '' : route.name;
  document.getElementById('route-type').value = (route.type == undefined) ? '' : route.type;
  document.getElementById('route-grade-system').value = (route.grade == undefined || route.grade.system == undefined) ? '' : route.grade.system;

  document.getElementById('system-specific-grade').innerHTML = GetFullGradeSelectionHtml(gradeSystem.value);

  document.getElementById('route-grade').value = (route.grade == undefined || route.grade.value == undefined) ? '' : route.grade.value;
  const additionalRouteGradeFieldDropdown = document.getElementById('additional-route-grade');
  if( additionalRouteGradeFieldDropdown != undefined ) {
    additionalRouteGradeFieldDropdown.value = (route.grade == undefined || route.grade.additional_value == undefined) ? '' : route.grade.additional_value;
  }
}

let UpdateRouteFromDialog = (route) => {
  route.name = document.getElementById('route-name').value;
  route.type = document.getElementById('route-type').value;
  route.grade = {};
  route.grade.system = document.getElementById('route-grade-system').value;
  route.grade.value = GetRouteGradeValue(route.grade.system);
  route.grade.additional_value = GetAdditionalRouteGradeValue(route.grade.system);
}

let EditRouteDialog = (route, onconfirm) => {
  InitRouteDialog(route);
  const dialog = document.getElementById('route-dialog');
  dialog.onclose = (event) => {
    const rv = dialog.returnValue;
    if( rv == 'confirm' ) {
      UpdateRouteFromDialog(route);
      onconfirm(route);
    }
  }
  dialog.showModal();
}
