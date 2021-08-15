var express = require('express');
const path = require('path');
const fs = require('fs-extra');

var app = express();

app.use(express.static(path.join(__dirname, "/public")));

app.get('/', function(req, res) {
    var jsonData = fs.readFileSync('public/baildon_bank/data.json');
    data = JSON.parse(jsonData);

    res.write('\
        <html>\
        <head>\
        <meta charset="utf-8">\
        <title>FreeTopo</title>\
        <link rel="stylesheet" href="stylesheets/default.css">\
        </head>\
        <body>\
        <div class="header">FreeTopo</div>\
        <div style="margin-top:20px;">\
        <canvas class="topo_image" id="topo_image"></canvas>\
        <table style="margin-top:20px;">\
            <thead>\
            <tr>\
            <th>Route</th>\
            <th>Name</th>\
            <th>Grade</th>\
            </tr>\
            </thead>\
            <tbody id="route_table"></tbody>\
        </table>\
        <script src="scripts/topo.js"></script>\
        </div>\
        </body>\
    </html>');
  
  res.end();
});

app.get('/data.json', function(req, res) {
    res.sendFile('./public/baildon_bank/data.json', { root: __dirname });
});

app.listen(8080);
