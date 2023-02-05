export class CityLabSensor {
  constructor(options){
    this.device_id = options.device_id || 7 // Unique sensor id for identification.
    this.sensorType = "CityLab" // Sensor type identifier.

    // Data types. TODO: Update how data values are fetched.
    this.air_temperature = options.air_temperature // Temperature data. 
    this.humidity = options.humidity // humidity data. 
    this.pressure = options.pressure // Pressure data.
    this.lux = options.lux // Light data (lux).
    this.solar_radiation = options.solar_radiation
    this.wind_speed = options.wind_speed // wind velocity
    this.wind_vane = options.wind_vane // wind direction
    this.rain = options.rain //rain data
    this.iconUrl='img/sensor_image.png'
  }

  getData(){
    return Object.keys(this)
  }
}

export class CityProbe2Sensor { 
  constructor(options) {
    this.device_id = options.device_id
    this.sensorType = "CityProbe2"
    this.time = options.time
    this.aPS = options.aPS
    this.b = options.b
    this.h = options.h
    this.l = options.l
    this.mP1 = options.mP1
    this.mP2 = options.mP2
    this.mP4 = options.mP4
    this.mPX = options.mPX
    this.nA = options.nA
    this.nMa = options.nMa
    this.nMi = options.nMi
    this.nP1 = options.nP1
    this.nP2 = options.nP2
    this.nP4 = options.nP4
    this.nPX = options.nPX
    this.nS = options.nS
    this.p = options.p
    this.t = options.t
    this.iconUrl='img/montem_logo.jpg'

    // locationdata
    this.city = options.city
    this.country = options.country
    this.location_name = options.location_name
    this.location = options.location
  }
}

export class DMIFreeDataSensor { 
  constructor(options){
    this.source = "DMI"
    this.iconUrl = 'img/dmi_logo.png'
    // TODO: Rewrite in a way that is readable. 
    // The code essentially copies known properties into variables in the class. 
    for (const element in options) {
      if (Object.hasOwnProperty.call(options, element)) {
        var thing = options[element].properties;
        let propertyname = thing.parameterId
        let propertyvalue = thing.value
        //console.log(propertyname +": "+ propertyvalue)
        eval("this."+propertyname+"="+propertyvalue) // Unceremoniously yoinked from: https://stackoverflow.com/questions/5613834/convert-string-to-variable-name-in-javascript
      }
    }    
    //jQuery.extend(this, options[0].properties)//FIXME: This only assigns one value, and i KNOW, there are more. How do we add them?
  }
}

export class NullSensor {
  constructor(){
    this.description = "There is a known sensor location here, but there is no data for it. "
    this.iconUrl='img/sensor_image.png'
  }
}
export class SensorFactory {
  // The other methods make more sense in my head. This requires reading the method every time and is dumb and stupid and also dumb. But leave it there for those... SPESHUL ones???? TODO: should this be deleted.
  create (options) {
    if(!options.sensorType) {return "no type specified"};

    let sensor;
    
    if(options.sensorType === "CityLab"){sensor = new CityLabSensor(options);}
    if(options.sensorType === "CityProbe2"){sensor = new CityProbe2Sensor(options);}
  
    sensor.sensorType = options.sensorType;
    return sensor;
  }
  createCityLabSensor(options) {
    return new CityLabSensor(options);
  }
  createCityProbe2Sensor(options) {
    return new CityProbe2Sensor(options);
  }
  createNullSensor() {
    return new NullSensor()
  }
  createDMIFreeDataSensor(options){
    return new DMIFreeDataSensor(options);
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
    sensorType: "CityLab"
  })
  Object.keys(sensor2).forEach((prop, index) => {console.log(prop + ": " + Object.values(sensor2)[index])})

  console.log("--------------------------------")
  console.log("test sensor 3")
  const sensor3 = sensorfactory.createCityLabSensor({device_id: 3})
  Object.keys(sensor3).forEach((prop, index) => {console.log(prop + ": " + Object.values(sensor3)[index])})

  console.log("----------------------------------------------------------------")
  console.log("test sensor 4")
  const sensor4 = sensorfactory.createCityProbe2Sensor({device_id:4})
  Object.keys(sensor4).forEach((prop, index) => {console.log(prop + ": " + Object.values(sensor4)[index])})
}
//test();

