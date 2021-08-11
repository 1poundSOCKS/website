const baildonBankData = '{\
    "topo_image_file": "baildon_bank/img/scar_wall.JPG", \
    "routes": [ \
      { "name": "Scar Wall", "grade": "E5 6b", "start_x": 1500, "start_y": 2800, "end_x": 1450, "end_y": 500 }, \
      { "name": "Scar", "grade": "E2 5b", "start_x": 2000, "start_y": 2800, "end_x": 2300, "end_y": 450 }, \
      { "name": "The Flakes", "grade": "E3 5c", "start_x": 2600, "start_y": 2800, "end_x": 2600, "end_y": 460 }, \
      { "name": "Intrepid", "grade": "E6 6a", "start_x": 3000, "start_y": 2800, "end_x": 3000, "end_y": 550 } \
    ] \
  }'

window.addEventListener('resize', resizeCanvas, false);
resizeCanvas();

var routeTable=document.getElementById("route_table");

const data = JSON.parse(baildonBankData)

data.routes.forEach(element => {
    var name = document.createElement('td');
    name.appendChild(document.createTextNode(element.name));
    var grade = document.createElement('td');
    grade.appendChild(document.createTextNode(element.grade));
    var row = document.createElement('tr');
    row.appendChild(name);
    row.appendChild(grade);
    routeTable.appendChild(row);
    });

function resizeCanvas() {
    const data = JSON.parse(baildonBankData)

    var canvas=document.getElementById("topo_image");
    var ctx=canvas.getContext("2d");
    base_image = new Image();

    base_image.src = data.topo_image_file;
    base_image.onload = function() {
        var imageWidthToHeightRatio = base_image.height / base_image.width;
        canvas.width = window.innerWidth * 50 / 100;
        canvas.height = canvas.width * imageWidthToHeightRatio;
        var imageWidthToCanvasWidthRatio = canvas.width / base_image.width;
        var imageHeightToCanvasHeightRatio = canvas.height / base_image.height;
        ctx.width = canvas.width;
        ctx.height = canvas.height;
        ctx.drawImage(base_image, 0, 0, ctx.width, ctx.height);
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        data.routes.forEach(element => {
        var startX = element.start_x;
        var startY = element.start_y;
        var endX = element.end_x;
        var endY = element.end_y;
        ctx.beginPath();
        ctx.setLineDash([10, 15]);
        ctx.moveTo(startX * imageWidthToCanvasWidthRatio, startY * imageHeightToCanvasHeightRatio);
        ctx.lineTo(endX * imageWidthToCanvasWidthRatio, endY * imageHeightToCanvasHeightRatio);
        ctx.stroke();
        });
    }
}