var express = require('express');
const path = require('path');
const fs = require('fs-extra');

var app = express();

app.use(express.static(path.join(__dirname, "/public")));

app.get('/', function(req, res) {
    res.sendFile('./index.html', { root: __dirname });
});

app.get('/crag', function(req, res) {
    res.sendFile('./crag.html', { root: __dirname });
});

app.get('/topo', function(req, res) {
    res.sendFile('./topo.html', { root: __dirname });
});

app.get('/data/crag_list', function(req, res) {
    const folder = './public/data/crags/';
    fs.readdir(folder, (err, files) => {
        var output = {crags: []};
        files.forEach(file => {
            const fileContents = fs.readFileSync('./public/data/crags/' + file, 'utf8');
            const fileData = JSON.parse(fileContents);
            output.crags.push({id: fileData.id, name: fileData.name});
        });
        const outputString = JSON.stringify(output);
        res.send(outputString);
    })
});

app.get('/data/topo', function(req, res) {
    if( req.query.topoid.length != undefined && req.query.topoid.length > 0 )
        res.sendFile('./public/data/topo/' + req.query.topoid + '.json', { root: __dirname });
    else
        res.end();
});

app.get('/data/crag', function(req, res) {
    if( req.query.cragid.length != undefined && req.query.cragid.length > 0 )
        res.sendFile('./public/data/crags/' + req.query.cragid + '.json', { root: __dirname });
    else
        res.end();
});

app.listen(8080);
