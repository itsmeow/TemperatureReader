const dht = require("dht");
const moment = require("moment");
const mariadb = require("mariadb");
const Gpio = require("pigpio").Gpio;
const pool = mariadb.createPool({
  host: "127.0.0.1",
  user: "tempsense",
  connectionLimit: 5,
});
const sensor = dht(4, 11);
let errorLED;

const Start = () => {
  let hasError = false;

  errorLED = new Gpio(11, { mode: Gpio.OUTPUT });

  sensor.on("result", async (data) => {
    let tempF = +(data.temperature * (9 / 5) + 32).toFixed(2);
    console.log(
      `[${moment().format("YYYY-MM-DD hh:mma ss[s]")}] temp: ${tempF}°F ${
        data.temperature
      }°C, humidity: ${data.humidity}%`
    );
    let conn;
    try {
      conn = await pool.getConnection();
      const res = await conn.query(
        "INSERT INTO `temperature`.`temperature` VALUES (NOW(), ?, ?)",
        [data.temperature, data.humidity]
      );
      console.log(res);
      if (hasError) {
        errorLED.digitalWrite(0);
        hasError = false;
      }
    } catch (err2) {
      console.log(err2);
      errorLED.digitalWrite(1);
      hasError = true;
    } finally {
      if (conn) conn.end();
    }
  });

  sensor.on("badChecksum", () => {
    console.log("Error reading sensor - bad checksum");
    errorLED.digitalWrite(1);
    hasError = true;
  });

  setInterval(sensor.read, 30000);
  sensor.read();
};

try {
  Start();
} catch (err) {
  errorLED.digitalWrite(1);
  throw err;
}
