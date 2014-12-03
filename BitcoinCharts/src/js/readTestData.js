//Read testData into memory
var fs = require('fs');

function toDateString(dateInS) {
	var t = new Date(Number(dateInS));
    var year = t.getFullYear();
    var month = t.getMonth() + 1;
    var day = t.getDate();
    var hour = t.getHours();
    var minute = t.getMinutes();
    var second = t.getSeconds();

    if (month < 10) {
        month = '0' + month;
    }
    if (day < 10) {
        day = '0' + day;
    }
    if (hour < 10) {
        hour = '0' + hour;
    }
    if (minute < 10) {
        minute = '0' + minute;
    }
    if (second < 10) {
        second = '0' + second;
    }

    return year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second;
}

function adjustFloat(v) {
    return Math.floor(v*100)/100;
}

function sort(arr, dir) {
	dir = dir || 'asc';
	if (arr.length == 0)
		return [];

	var left = new Array();
	var right = new Array();
	var pivot = arr[0];

	if (dir === 'asc') {// 升序
		for (var i = 1; i < arr.length; i++) {
			arr[i].Time < pivot.Time ? left.push(arr[i]) : right.push(arr[i]);
		}
	} else {// 降序
		for (var i = 1; i < arr.length; i++) {
			arr[i].Time > pivot.Time ? left.push(arr[i]) : right.push(arr[i]);
		}
	}
	return sort(left, dir).concat(pivot, sort(right, dir));
}

function readRecords(fileName) {
	fs.readFile('./testdata.txt', function(err, data) {
		if (err) {
			throw err;
		}
		var jsonObj = JSON.parse(data);
		var space = ' ';
		var newLine = '\n';
		var chunks = [];
		var length = 0;
		var obj2 = jsonObj;
		//Unique
		var dict = {};
		for (var i = 0; i < jsonObj.length; i++) {
			dict[jsonObj[i].Time] = jsonObj[i];
		}

		var arr = [];
		for ( var key in dict) {
			arr.push(dict[key]);
		}

		var sorted = sort(arr, 'dasc');
		for (var i = 0; i < sorted.length; i++) {
			sorted[i].Time = new Date(sorted[i].Time);
			console.log(JSON.stringify(sorted[i]));
		}
		console.log("Orig Length:" + jsonObj.length);
		console.log("Sorted Unique Length:" + sorted.length);

		//    sort(jsonObj,'');
		//    for(var i = 0 ;i <jsonObj.length;i++){
		//    	console.log(JSON.stringify(jsonObj[i]));    	
		//    }

		//    for(var i=0,size=jsonObj.length;i<size;i++){
		//        var one = jsonObj[i];
		//        //what value you want 
		//        var value1 = one['value1'];
		//        var value2 = one['value2'];
		//        var value = value1 +space+value2+space+.....+newLine;
		//        var buffer = new Buffer(value);
		//        chunks.push(buffer);
		//        length += buffer.length;
		//    }
		//    
		//    var resultBuffer = new Buffer(length);
		//    for(var i=0,size=chunks.length,pos=0;i<size;i++){
		//        chunks[i].copy(resultBuffer,pos);
		//        pos += chunks[i].length;
		//    }

		//    fs.writeFile('./resut.txt',resultBuffer,function(err){
		//        if(err) throw err;
		//        console.log('has finished');
		//    });

	});
}

var readData = function(fileName) {
	fs.readFile(fileName, function(err, data) {
		if (err) {
			throw err;
		}
		var jsonObj = JSON.parse(data);
		console.log(JSON.stringify(jsonObj));
		console.log("Orig Length:" + jsonObj.length);
	});	
}

var biggestVolume = 0;
var biggestVolumeDate = 0;
var biggestChange= 0;
var biggestPriceChangeDate= 0;

function testRecords(records){
	var record = records[records.length-1];
	var time = new Date(records[records.length-1].Time);
	var averageVolume = 0;
	var averageChange = 0;
	console.log("Open\tHigh\tLow\tClose\tChange\tVolume");
	for(var i =0;i<records.length;i++){
		var r = records[i];
		averageVolume+= r.Volume;
		averageChange+= r.High - r.Low;
		console.log(toDateString(r.Time) + ":\t"+ adjustFloat(r.Open)
				+ "\t"+  adjustFloat(r.High) + "\t"+  adjustFloat(r.Low) 
				+ "\t"+  adjustFloat(r.Close)+ "\t"+  adjustFloat(r.High - r.Low)
				+ "\t"+  adjustFloat(r.Volume)
				+ "\t"+  adjustFloat(r.Volume/(r.High - r.Low)));

	}
	console.log("Total Volume In " + records.length + " records:" + adjustFloat(averageVolume));
	averageVolume = adjustFloat(averageVolume / records.length);
	averageChange = adjustFloat(averageChange / records.length);
	if(record.Volume>biggestVolume){
		biggestVolume=record.Volume;
		biggestVolumeDate = record.Time;
	}
	var priceChange = adjustFloat(record.High - record.Low);
	if(priceChange>biggestChange){
		biggestChange = priceChange;
		biggestPriceChangeDate = record.Time;
	}
	var color = "#ff0000";
	var recordLen = records.length;
	var info = "Volume:" + record.Volume + ",PriceChange:" + priceChange 
	+ ",\r\nAverageVolume:" + averageVolume + ",AverageChange:" + averageChange +
	",\r\nBiggestVolume:" + biggestVolume + " ,Date:" + toDateString(biggestVolumeDate) +
	",\r\nBiggestChange:" + biggestChange + " ,Date:" + toDateString(biggestPriceChangeDate)
	+ ",\r\nRecordCount:" + recordLen;	
	console.log(info);
	if (record.Volume > averageVolume * 3 && priceChange > averageChange * 2 ) {
		console.log("Big");
	}
}

function test(){
	fs.readFile("./records.txt", function(err, data) {
		if (err) {
			throw err;
		}
		var records = JSON.parse(data);
		testRecords(records);
		console.log("RecordStartDate:" + toDateString(records[0].Time));
		console.log("RecordEndDate::" + toDateString(records[records.length-1].Time))
		console.log("RecordCount:" + records.length)
	});	
}
//test();

function makeRecordsForWisdom(origRecords){
	var records = [];
	for(var i=0;i<origRecords.length;i++){
		var record = {};
		var origRecord = origRecords[i];
//		Right 2014-12-02 16:45:00:	2349.42	2350	2349	2349.01	196.83
//			  2014-12-02 16:45:00:	2349.42	2350	2348	2349.03	461.7
		//[1417511700,28901045,28901580,2350.72,2349.9,2351,2349.4,312.0329,227.288,84.7451,733340]
		record.Time = origRecord[0] * 1000;
		record.Open = origRecord[3];
		record.High = origRecord[5];
		record.Low = origRecord[6];
		record.Close = origRecord[4];
		record.Volume = origRecord[7];
		record.Tag = "wishuobi";
		records.push(record);
	}
	return records;
}

function parseHuobiDate(dateStr){
	var date = new Date();
	date.setFullYear(Number(dateStr.substring(0,4)),Number(dateStr.substring(4,6))-1,Number(dateStr.substring(6,8)));
//	20141202 1755 00000
	date.setHours(Number(dateStr.substring(8,10)),Number(dateStr.substring(10,12)),0,0);
	return date.getTime();
}

function makeRecordsForHuobiAPI(origRecords){
	var records = [];
	for(var i=0;i<origRecords.length;i++){
		var record = {};
		var origRecord = origRecords[i];
//		Right 2014-12-02 16:45:00:	2349.42	2350	2349	2349.01	196.83
//			  2014-12-02 16:45:00:	2349.42	2350	2348	2349.03	461.7
		//[1417511700,28901045,28901580,2350.72,2349.9,2351,2349.4,312.0329,227.288,84.7451,733340]
//		console.log(origRecord[0]);
		record.Time = parseHuobiDate(origRecord[0]);
		record.Open = origRecord[1];
		record.High = origRecord[2];
		record.Low = origRecord[3];
		record.Close = origRecord[4];
		record.Volume = origRecord[5];
		record.Tag = "huobi";
		records.push(record);
	}
	return records;
}

var allRecord = [];
var flag1 = false;
var flag2 = false;


function make1MinRecordsFromHuobiFile(fileName){
	fs.readFile(fileName, function(err, data) {
		if (err) {
			throw err;
		}
		var origRecords = JSON.parse(data);
		var records = makeRecordsForHuobiAPI(origRecords);
		records = mergeInto(records,5);
//		testRecords(records);
		for(var i=0;i<records.length;i++){
			allRecord.push(records[i]);
		}
		console.log("OrigLen:"+origRecords.length);
		console.log("MergedLen:"+records.length);
		flag1 = true;
	});	
}

function make15MinRecordsFromHuobiFile(fileName){
	fs.readFile(fileName, function(err, data) {
		if (err) {
			throw err;
		}
		var origRecords = JSON.parse(data);
		var records = makeRecordsForHuobiAPI(origRecords);
		testRecords(records);
//		for(var i=0;i<records.length;i++){
//			allRecord.push(records[i]);
//		}
		flag2 = true;
	});	
}


function makeRecordsFromWisHuobiFile(fileName){
	fs.readFile(fileName, function(err, data) {
		if (err) {
			throw err;
		}
		var origRecords = JSON.parse(data);
		var records = makeRecordsForWisdom(origRecords);
		for(var i=0;i<records.length;i++){
			allRecord.push(records[i]);
		}
		flag2 = true;
//		testRecords(records);
	});	
}
//huobi:2015-01-02 18:15:00:	2369.05	2370.9	2364	2364.98	538.14
//Wis: 	2014-12-02 18:15:00:	2369.05	2370.9	2364	2364.64	566.16

function testAllRecord(){
	make1MinRecordsFromHuobiFile("./huobi1Min.txt");
	make15MinRecordsFromHuobiFile("./huobi30Min.txt");
//	makeRecordsFromHuobiFile("./huobi15.txt");
	var onTimer = function (){
		if(flag1 && flag2){// 
			console.log("File OK");
			var sorted = sort(allRecord,'asc');
			testRecords(sorted);
		}else{
			console.log("Wait...");
			setTimeout(onTimer,10);
		}
	}
	setTimeout(onTimer,10);
}


function mergeInto(origRecords,period){
	var records = [];
	var startTime = origRecords[0].Time;
	var record = {};
	record.Time = 0;
	var millis = period * 60000;
	for(var i=0;i<origRecords.length;i++){
		var r = origRecords[i];
		if(r.Time>=record.Time+millis){
			//New record
			record = {};
			//Check Time, trim to 0,15,45
			var date = new Date(r.Time);
			date.setMinutes(date.getMinutes()-(date.getMinutes()%period));
			record.Time = date.getTime();
			record.Open = r.Open;
			record.High = r.High;
			record.Low = r.Low;
			record.Tag = origRecords.Tag;
			record.Volume = r.Volume;
			record.Tag = r.Tag;
			records.push(record);
		}else{
			if(r.High>record.High){
				record.High = r.High;
			}
			if(r.Low<record.Low){
				record.Low = r.Low;
			}
			record.Close = r.Close;
			record.Volume += r.Volume;
		}
	}
	return records;
}


//testAllRecord();
make15MinRecordsFromHuobiFile("./huobi1Min.txt");
