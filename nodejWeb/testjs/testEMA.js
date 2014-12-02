//简单打印EMA数值

var testENV = true;

function adjustFloat(v) {
    return Math.floor(v*100)/100;
}

function localLog(logStr){
	console.log("LOCAL:"+logStr);
	if(!testENV){
		Log(logStr);
	}
}

function EMAOld(records, period) {
	var array_zeros = function(len) {
		var n = [];
		for (var i = 0; i < len; i++) {
			n.push(0.0);
		}
		return n;
	};

	var array_set = function(arr, start, end, value) {
		for (var i = start; i < end; i++) {
			arr[i] = value;
		}
	};

	var array_avg = function(arr, num) {
		var sum = 0.0;
		for (var i = 0; i < num; i++) {
			if (!isNaN(arr[i])) {
				sum += arr[i];
			}
		}
		return sum / num;
	};

	var ticks = [];
	for (var i = 0; i < records.length; i++) {
		ticks.push(records[i].Close);
	}

	var R = array_zeros(ticks.length);
	var multiplier = 2.0 / (period + 1);
	for (var j = period - 1; j < ticks.length && isNaN(ticks[j]); j++){}
	array_set(R, 0, j, NaN);
	for (var i = j; i < ticks.length; i++) {
		if (i == j) {
			R[i] = array_avg(ticks, period);
			if (R[i] == 0) {
				R[i] = ticks[i];
			}
		} else {
			R[i] = ((ticks[i] - R[i - 1]) * multiplier) + R[i - 1];
		}
	}
	return R;
}

function EMA(records, period) {
	var array_zeros = function(len) {
		var n = [];
		for (var i = 0; i < len; i++) {
			n.push(0.0);
		}
		return n;
	};

	var array_set = function(arr, start, end, value) {
		for (var i = start; i < end; i++) {
			arr[i] = value;
		}
	};

	var array_avg = function(arr, num) {
		var sum = 0.0;
		for (var i = 0; i < num; i++) {
			if (!isNaN(arr[i])) {
				sum += arr[i];
			}
		}
		return sum / num;
	};

	var ticks = [];
	for (var i = 0; i < records.length; i++) {
		ticks.push(records[i].Close);
	}

	//EXPMA=[当日或当期收盘价*2 + 上日或上期EXPMA*(N-1)] / (N+1) 　
	var R = array_zeros(ticks.length);
//	var multiplier = 2.0 / (period + 1);
	for (var j = period - 1; j < ticks.length && isNaN(ticks[j]); j++){}
	array_set(R, 0, j, NaN);
	for (var i = j; i < ticks.length; i++) {
		if (i == j) {
//			R[i] = array_avg(ticks, period);
//			R[i] = array_avg(ticks, period);
			R[i] = ticks[i];
//			if (R[i] == 0) {
//				R[i] = ticks[i];
//			}else{
//				localLog("Not equal");
//			}
			
		} else {
//			R[i] = ((ticks[i] - R[i - 1]) * multiplier) + R[i - 1];
			R[i] = (ticks[i] * 2  + R[i - 1] * (period - 1)) / (period + 1);
		}
	}
	return R;
}

function logOHLC(records){
	var record = records[records.length-1];
	var time = new Date(record.Time);
	localLog(time + ":Count" + records.length + ",C:" + record.Close + ",EMA30:" +adjustFloat(getEMA(records,30,records.length-1)) 
			+"," + adjustFloat(getEMA(records,30,records.length-2)));
}

function getEMA(records,period,idx){
	var arr = EMA(records, period);
	var record = records[idx];
	var emaValue = arr[idx];
	return emaValue;
}

function onTick() {
	if(testENV){
		setTimeout(onTick, LoopInterval);
	}
	var records = exchange.GetRecords();
	if (!records || records.length < (EMA_Slow + 3)) {
		return;
	}
//	logEMA(records,EMA_Fast);
	logOHLC(records);
//	logEMA(records,EMA_Mid);
//	logEMA(records,EMA_Slow);
//	printEMAArray(records,EMA_Fast);
//	printEMAArray(records,EMA_Mid);
//	printEMAArray(records,EMA_Slow);
}

function makeRecord(len) {
	var ret = [];
	for (var i = 0; i < len; i++) {
		var record= {};
		record.Time = new Date().getTime();
		record.Close = i;
		ret.push(record);
	}
	return ret;
}

function printNum(len){
	var log = len+ "\t0";
	for(var i=1;i<len;i++){
		log+= "\t" + i;
	}
	localLog(log);
}

function printArray(period,arr){
	var log = period + "\t" + arr[0];
	for(var i=1;i<arr.length;i++){
		log+= "\t" + arr[i];
	}
	localLog(log);
}

function printEMAArray(arr,period){
	printArray(period,EMA(arr, period));
}

function testEMA() {
	var arr = makeRecord(30);
//	localLog("record:"+ JSON.stringify(arr),"Len:", arr.length);
	var r1 = EMA(arr, EMA_Fast);
	var r2 = EMA(arr, EMA_Mid);
	var r3 = EMA(arr, EMA_Slow);
	var r4 = EMA(arr, 2);
	printNum(30);
	printEMAArray(arr,1);
	printEMAArray(arr,2);
	printEMAArray(arr,3);
	printEMAArray(arr,5);
	printEMAArray(arr,7);
	printEMAArray(arr,12);
}

function onexit(){
    Log("Exit");
}

function main() {
	testENV = false;
	Log("start");
	while (true) {
		onTick();
		Sleep(LoopInterval * 1000);
	}
}

//function testTime(){
//	var time = new Date();
//	console.log(time.Format("yyyy-MM-dd hh:mm:ss"));
//	Log(time.Format("yyyy-MM-dd hh:mm:ss"));
//}
//testTime();
//var EMA_Fast = 3;
//var EMA_Mid = 5;
//var EMA_Slow = 7;
//var LoopInterval = 1000;
//var exchange = {};
//exchange.GetRecords=function(){
//	return makeRecord(30);
//};
//function test(){
//	testENV = true;
//	setTimeout(onTick, LoopInterval);
//	localLog("Running");
//}
//


