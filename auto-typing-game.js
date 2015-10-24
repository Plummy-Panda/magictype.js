var net = require('net');
var config = require('./config');

var regexpScore = /Score: (.*)/;
var regexpNotAlphabet = /[^a-zA-Z]+/;
var lastScore = 0;
var playing = true;

var client = new net.Socket();
client.connect(config.port, config.host, function() {
  console.log('Connected to ' + config.host + ':' + config.port);
});

client.on('data', function(data) {
  if (data.indexOf('=====Magic Type Menu=====') > -1 && playing) {
    console.log('[*] Play a game!');
    client.write('1\r\n');
  }

  if (data.indexOf('Choose the speed level(1-9):') > -1 && playing) {
    console.log('[*] Choose speed level at ' + config.level + '!');
    client.write(config.level + '\r\n');
  }

  if (data && !playing) {
    console.log(data.toString());
    console.log('Waiting to die to get flag!');
    if (data.indexOf('=====Magic Type Menu=====') > -1) {
      client.destroy();
    }
  }

  if (data.indexOf('|') > -1 && playing) {
    var socre = regexpScore.exec(data.toString());
    var noScore = data.toString().replace(/Score: .*/, '');
    var word = noScore.replace(regexpNotAlphabet, '').trim();

    if (socre) {
      if (lastScore !== socre[1]) {
        lastScore = socre[1];
        console.log(socre[0]);
      }

      if (socre[1] >= config.stopThresholdScore) {
        playing = false;
      }
    }

    if (word !== '') {
      var cleanWord = noScore.replace(/[^a-zA-Z]+/g, '').trim();
      client.write(word + '\r\n');
      console.log('Found string ' + cleanWord + ' and write to server: ' + cleanWord);
    }
  }
});

client.on('close', function() {
  console.log('Connection closed');
});
