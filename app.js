"use strict";
var express = require('express')
var app = express();
var analyzer = require('chado').analyzer;
var fs = require('fs');
var json = JSON.parse(fs.readFileSync('./chado-result.json'));
var reportArray = analyzer.read(json);
var child_process = require('child_process');
reportArray.forEach(function(elem, index) {elem.id = index});

app.set('view engine', 'jade');
app.set('views', './views');
app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
  res.render('overview', {reportArray : analyzer.groupAssumptions(reportArray)}); 
});

app.get('/filter', function (req, res) {
  var filteredArray = analyzer.groupAssumptions(reportArray).filter(function(group) {
    return group.name == req.query.lib;
  });
  res.render('libview', {libname: req.query.lib, reportArray : filteredArray}); 
});

app.get('/path/:id', function (req, res, next) {
  req.url = '/path/' + req.params.id + '/0';
  next();
});

app.get('/path/:id/:alternative', function (req, res, next) {
  var result = reportArray.filter(function (elem) {return elem.id == req.params.id});
  if (result.length > 0) {
    var paths = analyzer.findPaths(reportArray, result[0]);
    if (paths.length > req.params.alternative) {
      res.render('path', {start: result[0], pathArray : paths[req.params.alternative], alternativeIndex : req.params.alternative, numberOfAlternatives : paths.length});
    } else if (req.params.alternative == 0) {
      res.render('path', {start: result[0], pathArray : [], alternativeIndex : 0, numberOfAlternatives : 0}); 
    } else {
      res.sendStatus(404);
    }
  } else {
    res.sendStatus(404);
  }
});

app.get('/detail/:id', function (req, res, next) {
  var result = reportArray.filter(function (elem) {return elem.id == req.params.id});
  if (result.length > 0) {
    res.render('detail', {
      assumption: result[0], 
      assumptions: analyzer.findAssumptions(reportArray, result[0]), 
      verifications: analyzer.findVerifications(reportArray, result[0]), 
      calledBys: analyzer.findCalledBy(reportArray, result[0])
    }); 
  } else {
    res.sendStatus(404);
  }
});

app.get('/openeditor', function (req, res, next) {
  child_process.exec('start ' + decodeURI(req.query.file));
  res.sendStatus(200);
});

var server = app.listen(3000, function () {

  var host = server.address().address
  var port = server.address().port

  console.log('Example app listening at http://%s:%s', host, port)
});

