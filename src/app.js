const http = require('http');
const https = require('https');
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const reply = require('./reply');
// Add routes
// for LINE API
// TODO: Hide for security
const CHANNEL_ACCESS_TOKEN = "";
// for SSL
// TODO: Hide for security
// var https_options = {
//     ca: fs.readFileSync('utf8'),
//     key: fs.readFileSync('utf8'),
//     cert: fs.readFileSync('utf8')
//  };
// set Express
var app = express();
app.use(bodyParser.json());
/// HTTP GET
app.get('/hook', function (reqeust, response) {
    response.writeHead(200, {'Content-Type' : 'text/html'});
    response.end('<h1>Weather-Bot, developed by leveloper97@gmail.com<h1>');
});
// HTTP POST
app.post('/hook', function (request, response) {
    var eventObj = request.body.events[0];
    var message = eventObj.message;
    var request = require('request');
    // 전역 변수 사용
    var data = [{
        "type": "text",
        "text": "data",
    }]
    if (message.type === "text" && message.text === "날씨") {
        //TODO: HIde for security
        request.get('', function(err, res, body) {
            weatherData = JSON.parse(body);
            data[0].text = "현재 서울의 온도: "
                            +(weatherData.main.temp-273.15).toFixed(2)+"℃,"
                            +" 습도: "+weatherData.main.humidity+"%,"+
                           " 구름: "+weatherData.clouds.all+"%,"+
                           " 바람: "+weatherData.wind.speed+"ms,"+
                           " 전반적으로 "+weatherData.weather[0].main+"합니다.\ "
            reply.send(CHANNEL_ACCESS_TOKEN, eventObj.replyToken, data);
        });
    } else {
        data[0].text = message.text+"을(를) 입력받았습니다. 해당 기능은 제공하지 않습니다.";
        reply.send(CHANNEL_ACCESS_TOKEN, eventObj.replyToken, data);
    }
    response.sendStatus(200);
});

// listening for HTTPS
https.createServer(https_options, app).listen(4443, function(){
    console.log("HTTPS CHAT SERVER IS RUNNING");
});

// listening for HTTP
http.createServer(app).listen(8080, function() {
    console.log("HTTP CHAT SERVER IS RUNNING");
})
