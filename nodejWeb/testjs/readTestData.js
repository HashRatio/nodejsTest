//Read testData into memory
var fs = require('fs');

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

function readHuobi(fileName) {
	fs.readFile(fileName, function(err, data) {
		if (err) {
			throw err;
		}
		var jsonObj = JSON.parse(data);
		console.log("Orig Length:" + jsonObj.length);
		console.log(JSON.stringify(jsonObj));
	});	
}

readHuobi("./tmp.txt");