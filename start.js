var express = require('express');
var bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs-extra');
global.TextEncoder = require("util").TextEncoder;
global.TextDecoder = require("util").TextDecoder;
var MongoClient = require('mongodb').MongoClient;

var app = express();

app.use(express.static(path.join(__dirname, "/public")));
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.sendFile('./home.html', { root: __dirname });
});

app.get('/guide', (req, res) => {
    res.sendFile('./guide.html', { root: __dirname });
});

app.get('/crag', (req, res) => {
    res.sendFile('./crag.html', { root: __dirname });
});

app.get('/topo', (req, res) => {
    res.sendFile('./topo.html', { root: __dirname });
});

app.get('/data/guide_list', (req, res) => {
    ReadGuidesIntoResult(res);
});

app.post('/data/add_guide', (req, res) => {
    AddDocumentToCollection(req.body, 'guides', res);
});

app.post('/data/add_crag', (req, res) => {
    AddDocumentToCollection(req.body, 'crags', res);
});

app.post('/data/add_topo', (req, res) => {
    AddDocumentToCollection(req.body, 'topos', res);
});

app.get('/data/crag_list', (req, res) => {
    ReadCragsIntoResult(req.query.guideid, res);
});

app.get('/data/topo', (req, res) => {
    ReadTopoIntoResult(req.query.topoid, res);
});

app.get('/data/topo_list', (req, res) => {
    ReadToposIntoResult(req.query.cragid, res);
});

app.get('/data/crag', function(req, res) {
    ReadCragIntoResult(req.query.cragid, res);
});

app.get('/data/guide', function(req, res) {
    ReadGuideIntoResult(req.query.guideid, res);
});

app.listen(8080);

const CollectionFilter = {
	Id: "_id",
    ParentId: "parent_id"
}

let ReadGuideIntoResult = (guideId, res) => ReadFilteredCollectionIntoResult("guides", guideId, CollectionFilter.Id, res);
let ReadGuidesIntoResult = (res) => ReadCollectionIntoResult("guides", res);
let ReadCragIntoResult = (cragId, res) => ReadFilteredCollectionIntoResult("crags", cragId, CollectionFilter.Id, res);
let ReadTopoIntoResult = (topoId, res) => ReadFilteredCollectionIntoResult("topos", topoId, CollectionFilter.Id, res);
let ReadCragsIntoResult = (guideId, res) => ReadFilteredCollectionIntoResult("crags", guideId, CollectionFilter.ParentId, res);
let ReadToposIntoResult = (cragId, res) => ReadFilteredCollectionIntoResult("topos", cragId, CollectionFilter.ParentId, res);

async function AddDocumentToCollection(document, collectionName, res) {
    try {
        const mongoClient = await OpenConnection();
        const db = mongoClient.db("main");
        await db.collection(collectionName).insertOne(document);
        res.end();
    }
    catch( e ) {
        console.error(e);
        res.end();
    }
}

async function ReadCollectionIntoResult(collectionName, res) {
    try {
        const mongoClient = await OpenConnection();
        const db = mongoClient.db("main");
        const documents = await db.collection(collectionName).find({}).toArray();
        res.send({documents});
    }
    catch( e ) {
        console.error(e);
        res.end();
    }
}

async function ReadFilteredCollectionIntoResult(collectionName, valueToKeep, filterBy, res) {
    try {
        const mongoClient = await OpenConnection();
        const db = mongoClient.db("main");
        const documents = await db.collection(collectionName).find({[filterBy]: valueToKeep}).toArray();
        res.send({documents});
    }
    catch( e ) {
        console.error(e);
        res.end();
    }
}

function OpenConnection() {
    return MongoClient.connect("mongodb://localhost:27017");
}
