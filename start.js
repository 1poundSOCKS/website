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
                <div class="edit-buttons">\
                    <button class="topo-command-button" type="button" id="prev-topo">Previous</button>\
                    <button class="topo-command-button" type="button" id="next-topo">Next</button>\
                    <button class="topo-command-button" type="button" id="reset-route">Reset route</button>\
                    <button class="topo-command-button" type="button" id="done">Done</button>\
                </div>\
                <div class="flex-container">\
                    <div style="width: 40%">\
                        <table class="route-table" id="route-table">\
                            <thead>\
                                <tr>\
                                    <th class="route-checkbox-header"></th>\
                                    <th>Id</th>\
                                    <th>Name</th>\
                                    <th>Grade</th>\
                                </tr>\
                            </thead>\
                            <tbody id="route-table-body"></tbody>\
                        </table>\
                    </div>\
                    <div style="width: 60%">\
                        <canvas class="topo-image" id="topo-image"></canvas>\
                    </div>\
                </div>\
                <script src="scripts/topo.js"></script>\
            </body>\
        </html>'
    );
  
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
