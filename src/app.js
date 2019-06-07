const http = require('http');
const https = require('https');
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const reply = require('./reply');
// Add routes
const actionBasic = require('./action/basic');
const actionError = require('./action/error');
const actionHelp = require('./action/help');
const actionEnjoy = require('./action/enjoy');
const actionScheduler = require('./action/scheduler');
// for LINE API
const CHANNEL_ACCESS_TOKEN = "NxcrY/NSnfmMUwHUBnk92OUkaBrlBfF128P7Bva4E4O5AsUD4gl9XSNCdxAY1mqfyP3WFvbutIwFYpxPTHdNaakt3RBqL0KjN6Ex4bUVqZpw1M1xWVdWLHIUfInQCf/rElQmam9lLeTAQ5jsZw+q4AdB04t89/1O/w1cDnyilFU=";
// for SSL
var https_options = {
    ca: fs.readFileSync('/etc/letsencrypt/live/weather-bot.online/chain.pem', 'utf8'),
    key: fs.readFileSync('/etc/letsencrypt/live/weather-bot.online/privkey.pem', 'utf8'),
    cert: fs.readFileSync('/etc/letsencrypt/live/weather-bot.online/fullchain.pem', 'utf8')
 };
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
    if (message.type === "text" && (message.text === "날씨" || message.text.includes("날씨"))) {
        request.get('http://api.openweathermap.org/data/2.5/weather?q=Seoul&appid=47606880441212d2f8a5f073e0b044e4', function(err, res, body) {
            weatherData = JSON.parse(body);
            data[0].text = "현재 서울의 온도: "
                            +(weatherData.main.temp-273.15).toFixed(2)+"℃,"
                            +" 습도: "+weatherData.main.humidity+"%,"+
                           " 구름: "+weatherData.clouds.all+"%,"+
                           " 바람: "+weatherData.wind.speed+"ms,"+
                           " 전반적으로 "+weatherData.weather[0].main+"합니다.\ "
            reply.send(CHANNEL_ACCESS_TOKEN, eventObj.replyToken, data);
        });
    } else if (message.type === "text" && (message.text === "미세먼지" || message.text.includes("미세먼지"))) {
        //TODO: HIde for security // 37.511168,127.029248,15z
        request.get('http://api.airvisual.com/v2/nearest_city?lat=37.511168&lon=127.029248&rad=500&key=GEfFaZztZy9bMJr6m', function(err, res, body) {
            dustData = JSON.parse(body);
            var aqius= dustData.data.current.pollution
            var result
            if (aqius < 30) {
                result = "좋음";
            } else if (30 <= aqius < 50) {
                result = "보통";
            } else if (50 <= aqius < 70) {
                result = "나쁨";
            } else {
                result = "최악"        
            } 

            data[0].text = "현재 서울의 미세먼지: " +result + "입니다."
                            
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
