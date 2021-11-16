var express = require('express');
var bodyParser = require('body-parser');
const multer = require('multer');
var upload = multer({dest:'uploads/'});
const path = require('path');
const fs = require('fs-extra');
global.TextEncoder = require("util").TextEncoder;
global.TextDecoder = require("util").TextDecoder;
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
const { copyFile } = require('fs');

var app = express();

app.use(express.static(path.join(__dirname, "/public")));
app.use(bodyParser.json());

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads/');
    },

    // By default, multer removes file extensions so let's add them back
    filename: function(req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const imageFilter = function(req, file, cb) {
    // Accept images only
    if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF)$/)) {
        req.fileValidationError = 'Only image files are allowed!';
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};

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

app.post('/data/update_topo', (req, res) => {
    UpdateTopo(req.body, res);
});

app.get('/data/crag_list', (req, res) => {
    console.log(`fetch crag list (guide_id='${req.query.guide_id}')`);
    ReadCragsIntoResult(req.query.guide_id, res);
});

app.get('/data/topo', (req, res) => {
    console.log(`fetch topo data (topo_id='${req.query.topo_id}')`);
    ReadTopoIntoResult(req.query.topo_id, res);
});

app.get('/data/topo_list', (req, res) => {
    console.log(`fetch topo list (crag_id='${req.query.crag_id}')`);
    ReadToposIntoResult(req.query.crag_id, res);
});

app.get('/data/crag', (req, res) => {
    console.log(`fetch crag data (crag_id='${req.query.crag_id}')`);
    ReadCragIntoResult(req.query.crag_id, res);
});

app.get('/data/guide', (req, res) => {
    console.log(`fetch guide data (guide_id='${req.query.guide_id}')`);
    ReadGuideIntoResult(req.query.guide_id, res);
});

app.post('/upload-topo-image', upload.any(), (req, res) => {
    console.log(`Body: ${JSON.stringify(req.body)}`);
    console.log(`Top image upload request: ${JSON.stringify(req.files[0])}`);
    if (req.fileValidationError) {
        const response = {result: 'error', value: req.fileValidationError};
        return res.send(JSON.stringify(response));
    }
    else if (!req.files) {
        const response = {result: 'error', value: 'no images selected'};
        return res.send(JSON.stringify(response));
    }
    // else if (err instanceof multer.MulterError) {
    //     const response = {result: 'error', value: err};
    //     return res.send(JSON.stringify(response));
    // }
    // else if (err) {
    //     const response = {result: 'error', value: err};
    //     return res.send(JSON.stringify(response));
    // }

    InstallImageFile(req.files[0], req.body.id)
    .then(installedFilename => {
        const response = {result: 'success', filename: installedFilename};
        return res.send(JSON.stringify(response));
    });
});

app.listen(8080);

const CollectionFilter = {
    ParentId: "parent_id"
}

const ParentCollection = {
    topos: "crags",
    crags: "guides"
}

let ReadGuideIntoResult = (guideId, res) => ReadObjectIntoResult("guides", guideId, res);
let ReadGuidesIntoResult = (res) => ReadCollectionIntoResult("guides", res);
let ReadCragIntoResult = (cragId, res) => ReadFullObjectIntoResult("crags", cragId, res);
let ReadTopoIntoResult = (topoId, res) => ReadFullObjectIntoResult("topos", topoId, res);
let ReadCragsIntoResult = (guideId, res) => ReadFilteredCollectionIntoResult("crags", CollectionFilter.ParentId, guideId, res);
let ReadToposIntoResult = (cragId, res) => ReadFilteredCollectionIntoResult("topos", CollectionFilter.ParentId, cragId, res);

let UpdateTopo = async (data, res) => {
    try {
        console.log(JSON.stringify(data));
        var query = { _id: ObjectId(data._id) };
        delete data._id;
        const mongoClient = await OpenConnection();
        const db = mongoClient.db("main");
        const results = await db.collection('topos').replaceOne(query, data);
        res.send(results);
    }
    catch( e ) {
        console.error(e.message);
        res.end();
    }
}

let AddDocumentToCollection = async (document, collectionName, res) => {
    try {
        const mongoClient = await OpenConnection();
        const db = mongoClient.db("main");
        const results = await db.collection(collectionName).insertOne(document);
        res.send(results);
    }
    catch( e ) {
        console.error(e);
        res.end();
    }
}

let ReadObjectIntoResult = async (collectionName, objectId, res) => {
    try {
        const document = await ReadObject(collectionName, objectId);
        const results = document[0];
        res.send({results});
    }
    catch( e ) {
        console.error(e);
        res.end();
    }
}

let ReadFullObjectIntoResult = async (collectionName, objectId, res) => {
    try {
        const results = await ReadFullObject(collectionName, objectId);
        res.send({results});
    }
    catch( e ) {
        console.error(e);
        res.end();
    }
}

let ReadCollectionIntoResult = async (collectionName, res) => {
    console.log(`reading collection '${collectionName}'`);
    try {
        const results = await ReadCollection(collectionName);
        res.send({results});
    }
    catch( e ) {
        console.error(e);
        res.end();
    }
}

let ReadFilteredCollectionIntoResult = async (collectionName, filterBy, valueToKeep, res) => {
    try {
        const results = await ReadFilteredCollection(collectionName, filterBy, valueToKeep);
        res.send({results});
    }
    catch( e ) {
        console.error(e);
        res.end();
    }
}

let ReadObject = async (collectionName, objectId) => {
    console.log(`reading object '${objectId}' from collection '${collectionName}'`);
    const mongoClient = await OpenConnection();
    const db = mongoClient.db("main");
    const id = ObjectId(objectId);
    return db.collection(collectionName).find({_id: id}).toArray();
}

let ReadFullObject = async (collectionName, objectId) => {
    console.log(`reading object '${objectId}' from collection '${collectionName}'`);
    const mongoClient = await OpenConnection();
    const db = mongoClient.db("main");
    return ReadObjectAndRecurseParent(db, collectionName, ObjectId(objectId));
}

let ReadObjectAndRecurseParent = async (db, collectionName, objectId) => {
    const documents = await db.collection(collectionName).find({_id: objectId}).toArray();
    const results = documents[0];
    if( results.parent_id != undefined ) {
        results.parent_data = await ReadObjectAndRecurseParent(db, ParentCollection[collectionName], ObjectId(results.parent_id));
    }
    return results;
}

let ReadCollection = async (collectionName) => {
    console.log(`reading collection '${collectionName}'`);
    const mongoClient = await OpenConnection();
    const db = mongoClient.db("main");
    return db.collection(collectionName).find({}).toArray();
}

let ReadFilteredCollection = async (collectionName, filterBy, valueToKeep) => {
    console.log(`reading collection '${collectionName}', filtered by ${filterBy}='${valueToKeep}'`);
    const mongoClient = await OpenConnection();
    const db = mongoClient.db("main");
    return db.collection(collectionName).find({[filterBy]: valueToKeep}).toArray();
}

let OpenConnection = () => MongoClient.connect("mongodb://localhost:27017");

let InstallImageFile = async (file, id) => {
    const currentPath = path.join(__dirname, file.path);
    const installedFilename = `${id}${path.extname(file.originalname)}`;
    const destinationPath = path.join(__dirname, "public", "data", "image", installedFilename);
    console.log(`Installing topo image file ${currentPath} to ${destinationPath}`);
    await fs.rename(currentPath, destinationPath);
    return installedFilename;
}
