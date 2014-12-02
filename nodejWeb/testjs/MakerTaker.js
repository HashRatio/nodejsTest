function adjustFloat(v) {
    return Math.floor(v*100)/100;
}

function GetOrders() {
    var orders = null;
    while (!(orders = exchange.GetOrders())) {
        Sleep(Interval);
    }
    return orders;
}

function GetAccount() {
    var account;
    while (!(account = exchange.GetAccount())) {
        Sleep(Interval);
    }
    return account;
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

var lastAccount = null;
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

var InitAccount = null;
var LastOrdersLength = null;
var netInit = 0;

function onTick() {
    var records = exchange.GetRecords();
    if (!records || records.length < (EMA_Slow + 3)) {
        return;
    }
    //取上一分钟的H/L中间值作为做市中间价格
    var record = records[records.length-1];
    var mid = adjustFloat(record.High + record.Low/2);
//    mid = adjustFloat(ticker.Buy + (ticker.Sell - ticker.Buy) / 2);
//    if(typeof(MidPrice)!=='undefined'){
//        mid = MidPrice;
//    }else{
//        mid = adjustFloat(ticker.Buy + (ticker.Sell - ticker.Buy) / 2);
//    }
    
    var ticker = GetTicker();
    var account = GetAccount();
    var orders = GetOrders();
    if (LastOrdersLength !== null && LastOrdersLength != orders.length) {
        updateProfit(InitAccount, account, ticker);
    }
    LastOrdersLength = orders.length;
    var numBuy = parseInt(Math.min(MaxNets / 2 , OrderDiff / Step, (account.Balance-ReserveMoney) / ticker.Buy / Lot));
    var numSell = parseInt(Math.min(MaxNets / 2, (account.Stocks-ReserveBTC) / Lot));
    var num = Math.max(numBuy, numSell);
    var ordersKeep = [];
    var queue = [];
    for (var i = 1; i < num; i++) {
        var buyPrice = adjustFloat(mid - (i * Step));
        var sellPrice = adjustFloat(mid + (i * Step));
        var alreadyBuy = false;
        var alreadySell = false;
        for (j = 0; j < orders.length; j++) {
            if (orders[j].Type == ORDER_TYPE_BUY) {
                if (Math.abs(orders[j].Price - buyPrice) < (Step / 2)) {
                    alreadyBuy = true;
                    ordersKeep.push(orders[j].Id);
                }
            } else {
                if (Math.abs(orders[j].Price - sellPrice) < (Step / 2)) {
                    alreadySell = true;
                    ordersKeep.push(orders[j].Id);
                }
            }
        }
        if ((!alreadyBuy) && (i < numBuy)) {
            queue.push([buyPrice, ORDER_TYPE_BUY]);
        }
        if ((!alreadySell) && (i < numSell)) {
            queue.push([sellPrice, ORDER_TYPE_SELL]);
        }
    }

    for (var i = 0; i < orders.length; i++) {
        var keep = false;
        for (var j = 0; j < ordersKeep.length; j++) {
            if (orders[i].Id == ordersKeep[j]) {
                keep = true;
            }
        }
        if (!keep) {
            exchange.CancelOrder(orders[i].Id);
            LastOrdersLength--;
        }
    }

    for (var i = 0; i < queue.length; i++) {
        if (queue[i][1] == ORDER_TYPE_BUY) {
            exchange.Buy(queue[i][0], Lot);
        } else {
            exchange.Sell(queue[i][0], Lot);
        }
        LastOrdersLength++;
    }
}

function CancelPendingOrders(orderType) {
    while (true) {
        var orders = GetOrders();
        var count = 0;
        if (typeof(orderType) != 'undefined') {
            for (var i = 0; i < orders.length; i++) {
                if (orders[i].Type == orderType) {
                    count++;
                }
            }
        } else {
            count = orders.length;
        }
        if (count == 0) {
            return;
        }

        for (var j = 0; j < orders.length; j++) {
            if (typeof(orderType) == 'undefined' || (orderType == orders[j].Type)) {
                exchange.CancelOrder(orders[j].Id, orders[j]);
                if (j < (orders.length-1)) {
                    Sleep(Interval);
                }
            }
        }
    }
}

function onexit(){
    CancelPendingOrders();
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

    var R = array_zeros(ticks.length);
    var multiplier = 2.0 / (period + 1);
    for (var j = period - 1; j < ticks.length && isNaN(ticks[j]); j++);
    array_set(R, 0, j, NaN);
    for (var i = j; i < ticks.length; i++) {
        if (i == j) {
            R[i] = array_avg(ticks, period);
            if (R[i] == 0) {
                R[i] = ticks[i];
            }
        } else {
            R[i] = ( (ticks[i] - R[i-1] ) * multiplier) + R[i-1];
        }
    }
    return R;
}

function main() {
    if (DisableLog) {
        EnableLog(false);
    }
    LogStatus("Start");
    //SetErrorFilter("502:|503:|unexpected|network|timeout|WSARecv|Connect|GetAddr|no such|reset|received|EOF");
    InitAccount = GetAccount();
    var ticker = GetTicker();
    netInit = InitAccount.Balance + InitAccount.FrozenBalance + ((InitAccount.Stocks + InitAccount.FrozenStocks) * ticker.Buy);
    Log(InitAccount);
    LogStatus(InitAccount,"Running");
    LoopInterval = Math.max(LoopInterval, 1);
    Lot = Math.max(exchange.GetMinStock(), Lot);
    while (true) {
        onTick();
        Sleep(LoopInterval * 1000);
    }
}

