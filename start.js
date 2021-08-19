var express = require('express');
const path = require('path');
const fs = require('fs-extra');

var app = express();

app.use(express.static(path.join(__dirname, "/public")));

app.get('/', function(req, res) {
    res.write('\
        <html>\
        <head>\
        <meta charset="utf-8">\
        <title>FreeTopo</title>\
        <link rel="stylesheet" href="stylesheets/default.css">\
        </head>\
        <body>\
        <div class="header">Baildon Bank</div>\
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

app.get('/data', function(req, res) {
    if( req.query.topo.length != undefined && req.query.topo.length > 0 )
        res.sendFile('./public/baildon_bank/topo_data/' + req.query.topo + '.json', { root: __dirname });
    else
        res.end();
});

app.listen(8080);
