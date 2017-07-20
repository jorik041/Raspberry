const GrovePi = require('node-grovepi').GrovePi;
const Board = GrovePi.board;

const sensors = require('../sensors');

let board = null,
    loudness = null,
    rotaryAngle = null;
let button = null;

const options = {
    testRotary: true,
    testLoudness: false,
    testButton: false
}

function start() {
    console.log('starting')

    board = new Board({
        debug: true,
        onError: function (err) {
            console.log('test error:' + err);
        },
        onInit: function (res) {
            if (res) {
                if (options.testLoudness) {
                    loudness = new sensors.LoudnessSensor(2, 5);
                    loudness.start();
                    setInterval(loudnessLoop, 1000);
                }

                if (options.testRotary) {
                    rotaryAngle = new sensors.RotaryAngleSensor(1);
                    rotaryAngle.start();
                    rotaryAngle.on('data', function (res) {
                        console.log('Rotary angle: ' + res);
                    });
                }

                if (options.testButton) {
                    button = new sensors.ButtonSensor(4);
                    button.on('down', function (res) {
                        console.log('Button down: ' + res);
                    });
                }

            } else {
                console.log('Error: test cannot start, problem in the board?');
            }
        }
    })
    board.init();
}


function loudnessLoop() {
    if (!loudness) throw Error('you need to initialize the sensor');
    let res = loudness.read();
    console.log('Loudness value: ' + res);
}

function rotaryloop() {
    let res = rotaryAngle.read();
    console.log('Rotary angle: ' + res);
}

function onExit(err) {
    console.log('ending');

    clearInterval(loudnessLoop);
    clearInterval(rotaryloop);
    if(options.testLoudness) loudness.stop();
    if(options.testRotary) rotaryAngle.stop();

    board.close();
    process.removeAllListeners();
    process.exit();
    if (typeof err != 'undefined')
        console.log(err);
}

// starts the test
start();
// catches ctrl+c event
process.on('SIGINT', onExit);