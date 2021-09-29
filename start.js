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
                <div class="header">FreeTopo - Crags</div>\
                <div class="edit-buttons">\
                    <button class="topo-command-button" type="button" id="add-crag">Add crag</button>\
                </div>\
                <div>\
                    <table class="crag-table" id="crag-table">\
                        <thead>\
                            <tr>\
                                <th class="crag-checkbox-header"></th>\
                                <th>Id</th>\
                                <th>Name</th>\
                            </tr>\
                        </thead>\
                        <tbody id="route-table-body"></tbody>\
                    </table>\
                    </div>\
                </div>\
                <script src="scripts/crags.js"></script>\
            </body>\
        </html>'
    );
  
    res.end();
});

app.get('/topo', function(req, res) {
    res.write('\
        <html>\
            <head>\
                <meta charset="utf-8">\
                <title>FreeTopo</title>\
                <link rel="stylesheet" href="stylesheets/default.css">\
            </head>\
            <body>\
                <div class="header">FreeTopo - </div>\
                <div class="edit-buttons">\
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
                <script src="scripts/topoFuncs.js"></script>\
                <script src="scripts/topoLoad.js"></script>\
            </body>\
        </html>'
    );
  
    res.end();
});

app.get('/topo_data', function(req, res) {
    if( req.query.topoid.length != undefined && req.query.topoid.length > 0 )
        res.sendFile('./public/topo_data/' + req.query.topoid + '.json', { root: __dirname });
    else
        res.end();
});

app.listen(8080);
