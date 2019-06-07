// node module
const https = require('https');
const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const reply = require('./reply');

const actionBasic = require('./action/basic');
const actionHelp = require('./action/help');
const actionEnjoy = require('./action/enjoy');
const actionScheduler = require('./action/scheduler');

var app = express();

//  set SSL
var https_options = {
   ca: fs.readFileSync('/etc/letsencrypt/live/weather-bot.online/chain.pem', 'utf8'),
   key: fs.readFileSync('/etc/letsencrypt/live/weather-bot.online/privkey.pem', 'utf8'),
   cert: fs.readFileSync('/etc/letsencrypt/live/weather-bot.online/fullchain.pem', 'utf8')
};
const CHANNEL_ACCESS_TOKEN = "NxcrY/NSnfmMUwHUBnk92OUkaBrlBfF128P7Bva4E4O5AsUD4gl9XSNCdxAY1mqfyP3WFvbutIwFYpxPTHdNaakt3RBqL0KjN6Ex4bUVqZpw1M1xWVdWLHIUfInQCf/rElQmam9lLeTAQ5jsZw+q4AdB04t89/1O/w1cDnyilFU=";
app.use(bodyParser.json());

app.get('/hook', function (reqeust, response) {
    response.writeHead(200, {'Content-Type' : 'text/html'});
    response.end('<h1>Weather-Bot, wonhee3795@naver.com<h1>');
    console.log('complete send data');
});
app.get('/test', function (req, res) {
	res.writeHead(200, {'Content-Type' : 'text/html'});
	res.end('test');
	console.log('test');
});
app.get('/.well-known/acme-challenge/UWaG9KAVQXuTk_YN4L9aGur8V9yFDuB36fQ8sW9tcE8', function (req, res) {
console.log('hello');	
res.writeHead(200, {'Content-Tye' : 'text/html'});
	res.end('UWaG9KAVQXuTk_YN4L9aGur8V9yFDuB36fQ8sW9tcE8.ts8nV1MCFPNFfVfKWhGVII9tcUTd8Gy0KumsmG77IVk');
});

app.post('/hook', function (request, response) {

    var eventObj = request.body.events[0];
    var source = eventObj.source;
    var message = eventObj.message;

    // request log
    console.log('======================', new Date() ,'======================');
    console.log('[request]', request.body);
    console.log('[request source] ', eventObj.source);
    console.log('[request message]', eventObj.message);

    if(message.type == "text" && message.text.indexOf("@momo") != -1){
        reply.send(CHANNEL_ACCESS_TOKEN, eventObj.replyToken, actionBasic.getBasicExpress());
    }
    else if(message.type == "text" && /^@.+/g.test(message.text)){
        var cmd = message.text.split('@')[1];
        console.log('[command]', cmd);

        if(typeof cmd !== "undefined" && cmd != ""){
            if(cmd == "h" || cmd == "help"){
                reply.send(CHANNEL_ACCESS_TOKEN, eventObj.replyToken, actionHelp.getHelpExpress());
            }
            else if(/^r\[.+\]/g.test(cmd)){
                reply.send(CHANNEL_ACCESS_TOKEN, eventObj.replyToken, actionEnjoy.getRandomExpress(cmd));
            }
            else if(cmd == "food" || cmd == "밥집"){
                reply.send(CHANNEL_ACCESS_TOKEN, eventObj.replyToken, actionEnjoy.getFoodExpress());
            }
            else if(cmd == "contact" || cmd == "ct"){
                reply.send(CHANNEL_ACCESS_TOKEN, eventObj.replyToken, actionHelp.getContactExpress());
            }
            else if(/^reserve/g.test(cmd) || /^예약/g.test(cmd)){

                var receiverId = null;
                var dropCmdMessages = cmd.split('reserve ')[1];

                switch (source.type){
                    case "user" : receiverId = source.userId; break;
                    case "group" : receiverId = source.groupId; break;
                    case "room" : receiverId = source.roomId; break;
                }
                
                if(dropCmdMessages.indexOf('-l') != -1){
                    reply.send(CHANNEL_ACCESS_TOKEN, eventObj.replyToken, actionScheduler.getReservedList(receiverId));
                }
                else if(dropCmdMessages.indexOf('-r') != -1){
                    var scheduledId = dropCmdMessages.replace('-r', '').trim();
                    var removeItemInfo = actionScheduler.removeReservedItem(receiverId, scheduledId);
                    reply.send(CHANNEL_ACCESS_TOKEN, eventObj.replyToken, actionScheduler.gerRemoveMessage(removeItemInfo))
                }
                else{
                    var onceFlag = true;
                    var data = actionScheduler.reserveParser(dropCmdMessages);
                    
                    if(dropCmdMessages.indexOf('-once') == -1){
                        onceFlag = false;
                    }

                    if(dropCmdMessages.indexOf('-once') == -1){
                        onceFlag = false;
                    }

                    actionScheduler.setReserve(CHANNEL_ACCESS_TOKEN, receiverId, data.time, data.message, onceFlag);
                    reply.send(CHANNEL_ACCESS_TOKEN, eventObj.replyToken, actionScheduler.getReservedMessage(data.time, data.message, !onceFlag))
                }
            }

        }
    }

    response.sendStatus(200);
});
//
// app.use(express.static(__dirname + '/img'));

https.createServer(https_options, app).listen(4443, function(){
  console.log("HTTPS SERVER IS RUNNING");
});
var server = http.createServer(app).listen(8080, function() {
    console.log('HTTP SERVER IS RUNNING');
});
server.on('error', onError);
server.on('onListening', onListening);
function onError(error) {
    if (error.syscall !== 'listen') {
      throw error;
    }
  
    var bind = typeof port === 'string'
      ? 'Pipe ' + port
      : 'Port ' + port;
  
    // handle specific listen errors with friendly messages
    switch (error.code) {
      case 'EACCES':
        console.error(bind + ' requires elevated privileges');
        process.exit(1);
        break;
      case 'EADDRINUSE':
        console.error(bind + ' is already in use');
        process.exit(1);
        break;
      default:
        throw error;
    }
  }

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
    var addr = server.address();
    var bind = typeof addr === 'string'
      ? 'pipe ' + addr
      : 'port ' + addr.port;
    debug('Listening on ' + bind);
}
