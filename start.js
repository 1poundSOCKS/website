var express = require('express');
const path = require('path');
const fs = require('fs-extra');

var app = express();

app.use(express.static(path.join(__dirname, "/public")));

app.get('/', function(req, res) {
    res.sendFile('./index.html', { root: __dirname });
});

app.get('/topo', function(req, res) {
    res.sendFile('./topo.html', { root: __dirname });
});

app.get('/data/topo', function(req, res) {
    if( req.query.topoid.length != undefined && req.query.topoid.length > 0 )
        res.sendFile('./public/data/topo/' + req.query.topoid + '.json', { root: __dirname });
    else
        res.end();
});

app.get('/data/crag_list', function(req, res) {
    res.sendFile('./public/data/crags/index.json', { root: __dirname });
});

app.listen(8080);
