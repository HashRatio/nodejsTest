//Show Volume And Price

var testENV = true;
var ts = require("./readTestData.js");

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

function localLog(logStr){
	console.log("LOCAL:"+logStr);
//	if(!testENV){
//		Log(logStr);
//	}
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
var biggestChange = 0;
var biggestVolume = 0;
var biggestVolumeDate = new Date();
var biggestPriceChangeDate = new Date();

function GetAccount() {
    var account;
    while (!(account = exchange.GetAccount())) {
        Sleep(Interval);
    }
    return account;
}

function buy(ticker,account){
	var buyPrice = ticker.Buy + 5;
	var numBuy = adjustFloat((account.Balance) / buyPrice);
		//Math.min(MaxLot,adjustFloat((account.Balance) / buyPrice));
    if(numBuy>Lot){
    	exchange.Buy(buyPrice, numBuy);
    	updateProfit(InitAccount, account, ticker);
    	return true;
    }
    return false;
}

function sell(ticker,account){
	var sellPrice = ticker.Sell - 5;
	var numSell = account.Stocks;
	//Math.min(MaxLot,account.Stocks);
//	Log("Number To Sell:" + numSell)
    if(numSell>Lot){
    	exchange.Sell(sellPrice, numSell);
    	updateProfit(InitAccount, account, ticker);
    	return true;
    }
    return false;
}
function ifBuySell(records,ticker,account){
	var record = records[records.length-1];
	var time = new Date(record.Time);
	var averageVolume = 0;
	var averageChange = 0;
	for(var i =0;i<records.length;i++){
		averageVolume+= records[i].Volume;
		averageChange+= records[i].High - records[i].Low;
	}
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
	var info = "Price:" + ticker.Buy +  ",Volume:" + record.Volume + ",PriceChange:" + priceChange + ",AverageVolume:" + averageVolume + ",AverageChange" + averageChange +
	",BiggestVolume:" + biggestVolume + " ,Date:" + toDateString(biggestVolumeDate) +
	",BiggestChange:" + biggestChange + " ,Date:" + toDateString(biggestPriceChangeDate) + ",RecordCount:" + recordLen;	
	localLog(info);
	if (record.Volume > averageVolume * 3 && priceChange > averageChange * 2 ) {
		Log(info,color);
	}else{
		Log(info);
	}
}

function getEMA(records,period,idx){
	var arr = EMA(records, period);
	var record = records[idx];
	var emaValue = arr[idx];
	return emaValue;
}

function GetTicker(e) {
    if (typeof(e) == 'undefined') {
        e = exchange;
    }
    var ticker;
    while (!(ticker = e.GetTicker())) {
        Sleep(Interval);
    }
    return ticker;
}

function GetOrders() {
    var orders = null;
    while (!(orders = exchange.GetOrders())) {
        Sleep(Interval);
    }
    return orders;
}

var firstTime = true;
function onTick() {
	var records = exchange.GetRecords();
	if (!records || records.length < (EMA_Slow + 3)) {
		return;
	}
	if(firstTime){
		firstTime = false;
		localLog(JSON.stringify(records));
	}
	var ticker = GetTicker();
	var account = GetAccount();
	ifBuySell(records,ticker,account);
}

var lastAccount = null;
var InitAccount = null;
var LastOrdersLength = null;
var netInit = 0;
var lastLogTime = 0;

function recordProfit(profit){
    var now = new Date().getTime();
    //Default LogInterVal 10Min
    var interval = 600000;
    if(typeof(LogInterval) !== 'undefined'){
        interval = LogInterval*60000;
    }
    if(now-lastLogTime>interval){
        LogProfit(profit,exchange.GetAccount());
        lastLogTime = now;
    }
}

function updateProfit(accountInit, accountNow, ticker) {
    var netNow = accountNow.Balance + accountNow.FrozenBalance + ((accountNow.Stocks + accountNow.FrozenStocks) * ticker.Buy);
    if(lastAccount === null){
        lastAccount = accountInit;
    }
    var profit = adjustFloat(netNow - netInit);
    var profitRate = adjustFloat((netNow - netInit)/netInit*100);
    var info = " Balance Change:" + adjustFloat(accountNow.Balance + accountNow.FrozenBalance - lastAccount.Balance - lastAccount.FrozenBalance)
        + " BTC:" + adjustFloat(accountNow.Stocks + accountNow.FrozenStocks - lastAccount.Stocks - lastAccount.FrozenStocks) 
        + ",Profit:" + profit +", ProfitRate:" + profitRate + "%";
    LogStatus(accountNow, info);
    //现在只记录账户净余额
    recordProfit(adjustFloat(netNow));
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
	InitAccount = GetAccount();
	Log("start",InitAccount);
	var ticker = GetTicker();
	netInit = InitAccount.Balance + InitAccount.FrozenBalance + ((InitAccount.Stocks + InitAccount.FrozenStocks) * ticker.Buy);
	updateProfit(InitAccount, InitAccount, ticker);
	var records = exchange.GetRecords();
	Log("RecordCount:" + records.length);
	while (true) {
		onTick();
		Sleep(LoopInterval * 1000);
	}
}

