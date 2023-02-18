const rangeMap = new Map();
rangeMap.set("Synop", 10000)
rangeMap.set("GIWS", 1000)
rangeMap.set("Pluvio", 1000)
rangeMap.set("Manual precipitation", 1000)
rangeMap.set("Manual snow", 1000)
rangeMap.set("CityProbe2", 100)
// TODO: figure out what a reasonable sensor range is. 

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
  // Translation for values found at:
  // https://docs.cityflow.live/#get-device-types
  // GET https://api.cityflow.live/devices/types
  constructor(options) {
    //console.log(options)
    this.device_id = options.device_id
    this.sensorType = "CityProbe2"
    this.time = options.time
    this.avg_particle_size__mcm = options.aPS
    this.battery_level__pct = options.b
    this.humidity__pct = options.h
    this.luminosity__lx = options.l
    this.rain_avg__dB = options.r
    this.particle_pollution = "-----------"
    this.PM1__mcgPERcm3 = options.mP1
    this.PM2_5__mcgPERcm3 = options.mP2
    this.PM4__mcgPERcm3 = options.mP4
    this.PM10__mcgPERcm3 = options.mPX
    this.noise="----------"
    this.average__dB_A = options.nA
    this.maximum__dB_A = options.nMa
    this.minimum__db_A = options.nMi
    this.standarddeviation = options.nS
    this.particle_concentration="----------"
    this.pc_1__cm3 = options.nP1
    this.pc_2_5__cm3 = options.nP2
    this.pc_4__cm3 = options.nP4
    this.particulate_concentration="----------"
    this.p_conc__cm3 = options.nPX
    this.pressure_hPa = options.p
    this.temperature_celcius = options.t
    this.particlepollution_microgramsCM3 = options.p2
    this.iconUrl='img/montem_logo.jpg'

    // locationdata
    this.city = options.city
    this.country = options.country
    this.location_name = options.location_name
    this.location = options.location
  }
}

export class DMIFreeDataSensor { 
  constructor(options){    //this.sensorType = options.properties.type
    console.log("OPTIONS")
    console.log(options)
    this.sensorSource = "DMI"
    this.iconUrl = 'img/dmi_logo.png'
    // This looks really stupid, but doing this lets us just copy fields into the sensor afterwards.
    let ST = options.stationType
    delete options.stationType
    this.sensorType = ST
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
    this.explaination_of_values = "<a href =https://confluence.govcloud.dk/pages/viewpage.action?pageId=26476621> link </a>" 
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
  getRangeMap(key){
    console.log("K: " + key + ", " + typeof(key))
    return rangeMap.get(key);
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

