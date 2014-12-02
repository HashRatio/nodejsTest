var sys = require("util")
var http = require("http");
var count = 0;
http.createServer(function(request, response) {
 //   response.sendHeader(200, {"Content-Type": "text/html"});
    response.writeHeader(200, {"Content-Type": "text/html"});
    for(var i=0;i<100;i++){
    	response.write("Hello World!" + i);
    	Sleep(1000);
    }
    response.end();
}).listen(8080);
sys.puts("Server running at http://localhost:8080/");
process.Sleep(1000);
