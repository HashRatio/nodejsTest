function simpleTest(){
	var call = new Packages.com.hashratio.btccharts.CallByJavaScript();
	call.call();
	//var frame = new Packages.javax.swing.JFrame("abc");
	//frame.setSize(400,300);
	//frame.setVisible(true);
	var prop = new Packages.com.hashratio.scripts.Prop();
	//println(JSON.stringify(prop));
	prop.setA("abc");
	println(prop.getA());
}

function adjustFloat(v) {
    return Math.floor(v*100)/100;
}

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

//simpleTest();
var biggestVolume = 0;
var biggestVolumeDate = 0;
var biggestChange= 0;
var biggestPriceChangeDate= 0;


function testRecords(records){
	var record = records[records.length-1];
	var time = new Date(records[records.length-1].Time);
	var averageVolume = 0;
	var averageChange = 0;
	println("Open\tHigh\tLow\tClose\tChange\tVolume");
	for(var i =0;i<records.length;i++){
		var r = records[i];
		averageVolume+= r.Volume;
		averageChange+= r.High - r.Low;
		println(toDateString(r.Time) + ":\t"+ adjustFloat(r.Open)
				+ "\t"+  adjustFloat(r.High) + "\t"+  adjustFloat(r.Low) 
				+ "\t"+  adjustFloat(r.Close)+ "\t"+  adjustFloat(r.High - r.Low)
				+ "\t"+  adjustFloat(r.Volume)
				+ "\t"+  adjustFloat(r.Volume/(r.High - r.Low)));

	}
	println("Total Volume In " + records.length + " records:" + adjustFloat(averageVolume));
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
	println(info);
	if (record.Volume > averageVolume * 3 && priceChange > averageChange * 2 ) {
		println("Big");
	}
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

function readFileTest(){
	var str = Packages.com.hashratio.btccharts.Tools.loadFileToString("data/huobi1Min.txt");
	var records = JSON.parse(str);
	records = makeRecordsForHuobiAPI(records);
	testRecords(records);
}

readFileTest();