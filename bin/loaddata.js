var basex = require('basex');
var fs = require("fs");
var path = require('path');
var dive = require('dive');
var dom = require('xmldom').DOMParser;
var xpath = require('xpath');
var models = require('../models');

models.basex.execute("create db conlenso");

function print(err, reply) {
  if (err) {
    console.log("Error: " + err);
  } else {
    console.dir(reply);
  }
}

models.sequelize.sync();

// iterate over directory
dive(__dirname + "/../data", function(err, file) {
  if (err) throw err;
  var filePath = file.substring(path.normalize(__dirname + '/../data').length);

  fs.readFile(file, 'utf-8', function(err, data) {
    if (err) throw err;
    var doc = new dom().parseFromString(data, 'text/xml');
    var select = xpath.useNamespaces({"TEI": "http://www.tei-c.org/ns/1.0"});

    var title = select("//TEI:title/text()", doc)[0].data;

    var author = select("//TEI:name/text()", doc)[0];
    author = author === undefined ? 'Unkown' : author.data;

    var srcDesc  = select("//TEI:sourceDesc", doc)[0].toString();

    models.basex.add(filePath, data, print);

    models.Document.create({ title: title, author: author, sourceDesc: "", path: filePath});
  });

});

