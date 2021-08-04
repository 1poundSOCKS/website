var express = require('express');
const path = require('path');

var app = express();

app.use(express.static(path.join(__dirname, "/public")));

app.get('/', function(req, res) {
    res.sendFile('./index.html', { root: __dirname });
});

app.listen(8080);
