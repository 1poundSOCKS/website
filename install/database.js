global.TextEncoder = require("util").TextEncoder;
global.TextDecoder = require("util").TextDecoder;

var MongoClient = require('mongodb').MongoClient;

console.log("install database");

MongoClient.connect("mongodb://localhost:27017/main", {}, (err, db) => {
  if( err ) {
    console.log(err);
  }
  else {
    console.log("connected");
    RecreateDatabase(db);
  }
});

function RecreateDatabase(db) {
  var dbo = db.db("main");
  dbo.dropDatabase( (err, result) => {
    if( err ) console.log("failed to delete database");
    else console.log("database deleted");
    db.close();
    MongoClient.connect("mongodb://localhost:27017/main", {}, (err, db) => {
      if( err ) {
        console.log(err);
      }
      else {
        InitDatabase(db);
      }
    });
  });
}

function InitDatabase(db) {
  console.log("initialising database");
  var dbo = db.db("main");
  var guides = dbo.createCollection("guides", (err, res) => {
    if (err) {
      console.log(err);
    }
    else {
      console.log("collection created!");
    }
    db.close();
  });
}
