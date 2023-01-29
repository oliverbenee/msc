export class CityLabSensor {
  constructor(options){
    this.device_id = options.device_id || 7 // Unique sensor id for identification.
    this.sensorType = "CityLab" // Sensor type identifier.

    // Data types. TODO: Update how data values are fetched.
    this.air_temperature = options.air_temperature || -144.0 // Temperature data. 
    this.humidity = options.humidity || 100.0 // humidity data. 
    this.pressure = options.pressure || 97402.03125 // Pressure data.
    this.lux = options.lux || 503 // Light data (lux).
    this.solar_radiation = options.solar_radiation || 0
    this.wind_speed = options.wind_speed || 7.20000028610229 // wind velocity
    this.wind_vane = options.wind_vane || 2 // wind direction
    this.rain = options.rain || 0 //rain data
  }

  getData(){
    return Object.keys(this)
  }
}

export class CityProbe2Sensor { 
  constructor(options) {
    this.aPS = options.aPS || 0.54,
    this.b = options.b || 100,
    this.h = options.h || 74.51,
    this.l = options.l || 59.4,
    this.location = options.location || "228",
    this.mP1 = options.mP1 || 9.11,
    this.mP2 = options.mP2 || 10.22,
    this.mP4 = options.mP4 || 10.69,
    this.mPX = options.mPX || 10.79,
    this.nA = options.nA || 54.63,
    this.nMa = options.nMa || 55.29,
    this.nMi = options.nMi || 45.23,
    this.nP1 = options.nP1 || 71.87,
    this.nP2 = options.nP2 || 72.67,
    this.nP4 = options.nP4 || 72.82,
    this.nPX = options.nPX || 72.85,
    this.nS = options.nS || 1.27,
    this.p = options.p || 1025.58,
    this.t = options.t || 4.38,
    this.device_id = options.device_id || "e00fce68fca36d2a30038a13"
    this.sensorType = "CityProbe2"
  }

  getData(){ 
    return object.keys(this)
  }
}

export class SensorFactory {
  create (options) {
    if(!options.sensorType) {return "no type specified"};

    let sensor;
    
    if(options.sensorType === "CityLab"){sensor = new CityLabSensor(options);}
    if(options.sensorType === "CityProbe2"){sensor = new CityProbe2Sensor(options);}
  
    sensor.sensorType = options.sensorType;
    return sensor;
  }
};

function test(){
  const sensorfactory = new SensorFactory();
  const sensor = sensorfactory.create({
    device_id: 1,
    sensorType: "CityLab"
  })
  console.log("-------------------------------------")
  console.log("test sensor 1")
  Object.keys(sensor).forEach((prop, index) => {console.log(prop + ": " + Object.values(sensor)[index])})
  console.log("-------------------------------------")
  console.log("test sensor 2")
  const sensor2 = sensorfactory.create({
    device_id: 2,
    sensorType: "CityProbe2"
  })
  Object.keys(sensor2).forEach((prop, index) => {console.log(prop + ": " + Object.values(sensor2)[index])})
}
test();

