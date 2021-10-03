//
// page load
//

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const cragId = urlParams.get('cragid');

fetch('/data/crag?cragid=' + cragId)
.then(response => response.json())
.then(data => {
  const cragName=document.getElementById('crag-name');
  cragName.innerHTML = data.name;
  ;
});
