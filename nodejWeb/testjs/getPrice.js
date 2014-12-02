var sys = require("util");
var http = require("http");
var fs = require("fs");
var zlib = require('zlib');
var count = 0;
var huobiAPI = "http://api.huobi.com/staticmarket/ticker_btc_json.js";

var onHTTPGet;
var onGetDepth;

var getPrice = function() {
	http.get({
		host : 'api.huobi.com',
		path : '/staticmarket/ticker_btc_json.js'
	}, onHTTPGet).on('error', function(e) {
		console.error(e);
		getPrice();
	});
};

var getDepth = function() {
	http.get({
		host : 'api.huobi.com',
		path : '/staticmarket/depth_btc_json.js'
	}, onGetDepth).on('error', function(e) {
		console.error(e);
		getDepth();
	});
};

onHTTPGet = function(res) {
	res.on('data', function(d) {
		var result = JSON.parse(d);
		var date = new Date();
		date.setTime(result.time * 1000);
		sys.puts(new Date() + " Date: " + date + " Price:" + result.ticker.last);
		setTimeout(getPrice, 1000);
	});
};

onGetDepth = function(res) {
	var data = "";
	res.on('data', function(d) {
		data += d;
	});
	res.on('end', function() {
		var result = JSON.parse(data);
		var asks = result.asks;
		var bids = result.bids;
		var count = Math.min(asks.length, bids.length);
		sys.puts(new Date());
		for (var i = 0; i < count; i++) {
			sys.puts(asks[i] + "\t" + bids[i]);
		}
		data = "";
		sys.puts("Lines:" + asks.length);
		setTimeout(onGetDepth, 100000);
	});
};

var getRecords = function() {
	http.get({
		host : 'api.huobi.com',
		path : '/staticmarket/btc_kline_100_json.js'
	}, onGetRecords).on('error', function(e) {
		console.error(e);
		getRecords();
	});
};

function getTime(record){
//	return new Date(record.)
}

var onGetRecords = function(res) {
	var data = "";
	res.on('data', function(d) {
		data += d;
	});
	res.on('end', function() {
		var result = JSON.parse(data);
		sys.puts(new Date() + " Length:" + result.length + "," + result[result.length-1][0] + "," + result[result.length-2][0]);
		data = "";
		sys.puts(JSON.stringify(result));
		setTimeout(getRecords, 10000);
	});
};

var readURLIntoFile = function(host,url,fileName) {
	var request = http.get({
		host : host,
		path : url
	});
	var data = "";
	request.on('response', function(response) {
		var output = fs.createWriteStream(fileName);
		  switch (response.headers['content-encoding']) {
		    // or, just use zlib.createUnzip() to handle both cases
		    case 'gzip':
		      response.pipe(zlib.createGunzip()).pipe(output);
		      break;
		    case 'deflate':
		      response.pipe(zlib.createInflate()).pipe(output);
		      break;
		    default:
		    	console.log("Normal");
		      response.pipe(output);
		      break;
		  }
	});
	request.on('end', function() {
		sys.puts(data);
//		var result = JSON.parse(data);
//		sys.puts(JSON.stringify(result));
//		data = "";
//		sys.puts(new Date() + " Length:" + result.length);
	});
};


//var onReadURL = function(request) {
//	var data = "";
//	request.on('response', function(response) {
//		var output = fs.createWriteStream('tmp.txt');
//		  switch (response.headers['content-encoding']) {
//		    // or, just use zlib.createUnzip() to handle both cases
//		    case 'gzip':
//		      response.pipe(zlib.createGunzip()).pipe(output);
//		      break;
//		    case 'deflate':
//		      response.pipe(zlib.createInflate()).pipe(output);
//		      break;
//		    default:
//		      response.pipe(output);
//		      break;
//		  }
//	});
//	request.on('end', function() {
//		sys.puts(data);
////		var result = JSON.parse(data);
////		sys.puts(JSON.stringify(result));
////		data = "";
////		sys.puts(new Date() + " Length:" + result.length);
//	});
//};


//main();
//getRecords();
function makeRecordByFile(fileName){
	
}

function readIntoFile(){
	readURLIntoFile("s2.bitcoinwisdom.com","/period?step=900&symbol=huobibtccny&mode=simple","./wishuobi15.txt");
	readURLIntoFile("api.huobi.com","/staticmarket/btc_kline_005_json.js","./huobi15.txt");
}
readIntoFile();
