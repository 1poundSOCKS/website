global.TextEncoder = require("util").TextEncoder;
global.TextDecoder = require("util").TextDecoder;

var MongoClient = require('mongodb').MongoClient;

console.log("install database");

const mongoClient = new MongoClient("mongodb://localhost:27017/main");
RecreateDatabase(mongoClient);

async function RecreateDatabase(client) {
  await client.connect();
  var dbo = client.db("main");
  await dbo.dropDatabase();
  await client.close();
  await client.connect();
  await InitDatabase(client);
  client.close();
}

async function InitDatabase(client) {
  console.log("initialising database");
  var dbo = client.db("main");
  await dbo.createCollection("guides");
  console.log("collection 'guides' created!");
  await dbo.createCollection("crags");
  console.log("collection 'crags' created!");
  await dbo.createCollection("topos");
  console.log("collection 'topos' created!");
}
