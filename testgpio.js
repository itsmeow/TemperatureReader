const ledPhysical = 17;
const dht11Physical = 4;

const Gpio = require("pigpio").Gpio;
let errorLED = new Gpio(ledPhysical, { mode: Gpio.OUTPUT });
errorLED.pwmRange(25);
console.log("LED on");
errorLED.pwmWrite(25);
setTimeout(() => {
  console.log("LED off");
  errorLED.pwmWrite(0);
}, 5000);

const dht = require("pigpio-dht");
const sensor = dht(dht11Physical, 11);
sensor.on("result", (data) => {
  console.log(data);
});
console.log("Sensor read start");
sensor.read();
