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
        <div>\
        <button type="button" id="prev_topo">Previous</button>\
        <button type="button" id="next_topo">Next</button>\
        </div>\
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
  
    //res.sendFile(path.join(__dirname, '/index.html'));
    res.end();
});

app.get('/guide_data', function(req, res) {
    if( req.query.guidename != undefined && req.query.guidename.length > 0 )
        res.sendFile('./public/guide_data/' + req.query.guidename + '.json', { root: __dirname });
    else
        res.end();
});

app.get('/topo_data', function(req, res) {
    if( req.query.guidename != undefined && req.query.guidename.length > 0 &&
        req.query.topoid.length != undefined && req.query.topoid.length > 0 )
        res.sendFile('./public/topo_data/' + req.query.guidename + '/' + req.query.topoid + '.json', { root: __dirname });
    else
        res.end();
});

app.listen(8080);
