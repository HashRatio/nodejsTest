//趋势跟踪补充对冲策略，用来补充对冲趋势跟踪的风险，可以做空做多，根据EMA，金叉自动做多，死叉平仓做空，自动止损止盈，
//默认值回测三个月累计收益百分40+，完整版回测三个月累计收益110%，试用版免费，对完整版有兴趣加我qq1799282696
var _EnableDoShort = false;
var _EnableDoLong = false;

function _N(v, precision) {
    if (typeof(precision) != 'number') {
        precision = 2;
    }
    var d = parseFloat(v.toFixed(Math.max(10, precision+5)));
    s = d.toString().split(".");
    if (s.length < 2 || s[1].length <= precision) {
        return d;
    }

    var b = Math.pow(10, precision);
    return Math.floor(d*b)/b;
}

function GetOrders() {
    var orders = null;
    while (!(orders = exchange.GetOrders())) {
        Sleep(Interval);
    }
    return orders;
}

function CancelPendingOrders() {
    while (true) {
        var orders = GetOrders();
        if (orders.length == 0) {
            return;
        }

        for (var j = 0; j < orders.length; j++) {
            exchange.CancelOrder(orders[j].Id);
            if (j < (orders.length-1)) {
                Sleep(Interval);
            }
        }
    }
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


function updateProft(accountInit, accountNow, ticker) {
    var netNow = accountNow.Balance + accountNow.FrozenBalance + ((accountNow.Stocks + accountNow.FrozenStocks) * ticker.Buy);
    var netInit = accountInit.Balance + accountInit.FrozenBalance + ((accountInit.Stocks + accountInit.FrozenStocks) * ticker.Buy);
    LogProfit(_N(netNow - netInit));
}

var STATE_WAIT_IDLE     = 0;
var STATE_WAIT_BUY      = 1;
var STATE_WAIT_SELL     = 2;
var STATE_BUY           = 3;
var STATE_SELL          = 4;

var State = STATE_WAIT_IDLE;
var InitAccount = null;
var LastBuyPrice = 0;
var LastSellPrice = 0;
var LastRecord = null;
var Goingshort = false;

function onTick(exchange) {
    var oldState = State;

    var records = exchange.GetRecords();
    if (!records || records.length < (EMA_Slow + 3)) {
        return;
    }
    // Price not change
    var newLast = records[records.length-1];
    if ((!LastRecord) || (LastRecord.Time == newLast.Time && LastRecord.Close == newLast.Close)) {
        LastRecord = newLast;
        return;
    }
    LastRecord = newLast;

    var emaFast = EMA(records, EMA_Fast);
    var emaSlow = EMA(records, EMA_Slow);

    if (State == STATE_WAIT_IDLE) {
        if (_EnableDoLong && emaFast[emaFast.length-1] > emaSlow[emaSlow.length-1] && emaFast[emaFast.length-2] <= emaSlow[emaSlow.length-2]) {
            Goingshort = false;
            State = STATE_BUY;
        } else if (_EnableDoShort && (emaFast[emaFast.length-1] < emaSlow[emaSlow.length-1]) && (emaFast[emaFast.length-2] >= emaSlow[emaSlow.length-2])) {
            Goingshort = true;
            State = STATE_SELL;
        } else {
            return;
        }
        Log(State == STATE_BUY ? "开始做多, EMA 快线上穿慢线" : "开始做空, EMA 快线下穿慢线", "Fast:", _N(emaFast[emaFast.length-1]), "Slow", _N(emaSlow[emaSlow.length-1]));
    }

    var ticker = GetTicker();

    // 做多
    if (!Goingshort) {
        if (State == STATE_WAIT_SELL) {
            var ratio = Math.abs((LastBuyPrice - ticker.Last) / LastBuyPrice) * 100;
            if (ticker.Last < LastBuyPrice && ratio >= StopLoss) {
                State = STATE_SELL;
                Log("开始止损, 当前下跌点数:", _N(ratio), "当前价格", ticker.Last, "对比价格", _N(LastBuyPrice));
            } else if (ticker.Last > LastBuyPrice && ratio >= StopProfit) {
                State = STATE_SELL;
                Log("开始止赢, 当前上涨点数:", _N(ratio), "当前价格", ticker.Last, "对比价格", _N(LastBuyPrice));
            } else {
                var emaMid = EMA(records, EMA_Mid);
                if (emaFast[emaFast.length-1] < emaMid[emaMid.length-1]) {
                    State = STATE_SELL;
                    //Log("开始平仓, EMA 快线下穿中线", "Fast:", _N(emaFast[emaFast.length-1]), "Mid", _N(emaMid[emaMid.length-1]));
                }
            }
        }
    } else {
        if (State == STATE_WAIT_BUY) {
            var ratio = Math.abs((ticker.Last - LastSellPrice) / LastSellPrice) * 100;
            if (ticker.Last > LastSellPrice && ratio >= StopLoss) {
                State = STATE_BUY;
                Log("开始止损, 当前上涨点数:", _N(ratio), "当前价格", ticker.Last, "对比价格", _N(LastSellPrice));
            } else if (ticker.Last < LastSellPrice && ratio >= StopProfit) {
                State = STATE_BUY;
                Log("开始止盈, 当前下跌点数:", _N(ratio), "当前价格", ticker.Last, "对比价格", _N(LastSellPrice));
            } else {
                var emaMid = EMA(records, EMA_Mid);
                if (emaFast[emaFast.length-1] > emaMid[emaFast.length-1]) {
                    State = STATE_BUY;
                    //Log("开始平仓, EMA 快线上穿中线", "Fast:", _N(emaFast[emaFast.length-1]), "Mid", _N(emaMid[emaFast.length-1]));
                }
            }
        }

    }

    if (State != STATE_BUY && State != STATE_SELL) {
        return;
    }
 
    var orders = GetOrders();
    if (orders.length > 0) {
        if (((State == STATE_BUY) && (LastBuyPrice >= (ticker.Buy-SlidePrice))) || ((State == STATE_SELL) && (LastSellPrice <= (ticker.Sell-SlidePrice)))) {
            return;
        }
    }
    // Buy or Sell, Cancel pending orders first
    CancelPendingOrders();
    // Wait Ticker Update
    Sleep(1000);
    var account = GetAccount();
    // Update Ticker
    ticker = GetTicker();

    // 做多
    if (!Goingshort) {
        if (State == STATE_BUY) {
            var price = ticker.Buy + SlidePrice;
            var amount = _N(Math.min(AmountOnce, account.Balance / price));
            if (amount >= exchange.GetMinStock()) {
                if (exchange.Buy(price, amount)) {
                    LastBuyPrice = price;
                }
            } else {
                State = STATE_WAIT_SELL;
            }
        } else {
            var sellAmount = Math.min(AmountOnce, account.Stocks - InitAccount.Stocks);
            if (sellAmount > exchange.GetMinStock()) {
                exchange.Sell(ticker.Sell - SlidePrice, sellAmount);
                LastSellPrice = price;
            } else {
                // No stocks, wait buy and log profit
                updateProft(InitAccount, account, ticker);
                State = STATE_WAIT_IDLE;
            }
        }
    } else {
        if (State == STATE_BUY) {
            var price = ticker.Buy + SlidePrice;
            var amount = _N(Math.min(AmountOnce, account.Balance / price, InitAccount.Stocks - account.Stocks));
            if (amount >= exchange.GetMinStock()) {
                exchange.Buy(price, amount);
                LastBuyPrice = price;
            } else {
                updateProft(InitAccount, account, ticker);
                State = STATE_WAIT_IDLE;
            }
        } else {
            var price = ticker.Sell - SlidePrice;
            var sellAmount = Math.min(AmountOnce, account.Stocks);
            if (sellAmount > exchange.GetMinStock()) {
                exchange.Sell(price, sellAmount);
                LastSellPrice = price;
            } else {
                // No stocks, wait buy and log profit
                State = STATE_WAIT_BUY;
            }
        }
    }
}

function main() {
    EnableLog(LogOrders);
    InitAccount = GetAccount();
    LoopInterval = Math.min(1, LoopInterval);
    Log('交易平台:', exchange.GetName(), InitAccount);

    _EnableDoLong = (OpType == 0 || OpType == 1);
    _EnableDoShort = (OpType == 0 || OpType == 2) && (InitAccount.Stocks > exchange.GetMinStock());
    LoopInterval = Math.max(LoopInterval, 1);
    while (true) {
        onTick(exchange);
        Sleep(LoopInterval*1000);
    }
}