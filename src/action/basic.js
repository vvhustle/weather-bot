module.exports.getWeather = function () {
    var request = require('request');
    var async = require('async');
    var data = {};
    request.get('http://api.openweathermap.org/data/2.5/weather?q=Seoul&appid=47606880441212d2f8a5f073e0b044e4', function(err, res, body) {
        var data = {
            temp: "",
            weather: ""
        };
        var task = [
            function(callback) {
                console.log('1');
                data.temp = "temp";
                data.weahter = "weahter";
                return callback();
            },
            function(callback) {
                console.log('2');
                return callback('ok');
            }
        ];
        async.waterfall(task, function(err, result) {
            console.log('3');
            data = body;
        });
    });
    console.log('please', data);
    return [{
        "type": "text",
        "text": "data"
    }];
};
    
module.exports.getDust = function () {
    return [{
        "type": "text",
        "text": "서울 특별시 강남구의 미세먼지는 입니다."
    }];
};