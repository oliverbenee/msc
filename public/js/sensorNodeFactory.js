const rangeMap = new Map();
rangeMap.set("Synop", 25000)
rangeMap.set("GIWS", 1000)
rangeMap.set("Pluvio", 10000)
rangeMap.set("Manual precipitation", 1000)
rangeMap.set("Manual snow", 1000)
rangeMap.set("CityProbe2", 300)
rangeMap.set("SmartCitizen Kit 1.1", 300)
rangeMap.set("SCK 2.1", 300)
rangeMap.set("SCK 2.1 GPS", 300)
// TODO: figure out what a reasonable sensor range is. 

const publisherMap = new Map();
publisherMap.set("CityProbe2", "Montem")
publisherMap.set("Synop", "DMI")
publisherMap.set("Pluvio", "DMI")
publisherMap.set("GIWS", "DMI")
publisherMap.set("SmartCitizen Kit 1.1", "SmartCitizen")
publisherMap.set("SCK 2.1", "SmartCitizen")
publisherMap.set("SCK 2.1 GPS", "SmartCitizen")

const iconMap = new Map();
iconMap.set("CityProbe2", "img/montem_logo.jpg")
iconMap.set("Synop", "img/dmi_logo.png")
iconMap.set("Pluvio", "img/dmi_logo.png")
iconMap.set("GIWS", "img/dmi_logo.png")

// all the smartCitizen ones
iconMap.set("SmartCitizen Kit 1.1", "img/smartcitizen.png")
iconMap.set("SCK 2.1", "img/smartcitizen.png")
iconMap.set("SCK 2.1 GPS", "img/smartcitizen.png")

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
}

export class CityProbe2Sensor { 
  // Translation for values found at:
  // https://docs.cityflow.live/#get-device-types
  // GET https://api.cityflow.live/devices/types
  constructor(options) {
    //console.log(options)
    this.sensorSource="Montem"
    this.sensorType="CityProbe2"
    this.device_id = options.device_id
    this.time = options.time

    this.battery_level__pct = options.b
    this.measurements = "----------"
    this.pressure__hPa = options.p
    this.temperature__celcius = options.t
    this.humidity__pct = options.h
    this.luminosity__lx = options.l
    this.rain_avg__dB = options.r
    this.particle_pollution = "-----------"
    this.particlepollution_microgramsCM3 = options.p2
    this.avg_particle_size__mcm = options.aPS
    this.PM1__mcgPERcm3 = options.mP1
    this.PM2_5__mcgPERcm3 = options.mP2
    this.PM4__mcgPERcm3 = options.mP4
    this.PM10__mcgPERcm3 = options.mPX
    this.noise="----------"
    this.average__dB_A = options.nA
    this.maximum__dB_A = options.nMa
    this.minimum__dB_A = options.nMi
    this.standarddeviation = options.nS
    this.particle_concentration="----------"
    this.pc_1__cm3 = options.nP1
    this.pc_2_5__cm3 = options.nP2
    this.pc_4__cm3 = options.nP4
    this.particulate_concentration="----------"
    this.p_conc__cm3 = options.nPX

    // locationdata
    this.city = options.city
    this.country = options.country
    this.location_name = options.location_name
    this.location = options.location
  }
}

export class DMIFreeDataSensor { 
  constructor(options){    
    this.sensorSource="DMI"
    // This looks really stupid, but doing this lets us just copy fields into the sensor afterwards.
    let ST = options.stationType
    delete options.stationType
    this.sensorType = ST
    this.device_id=options[0].properties.stationId.toString()
    this.time = options[0].properties.observed

    this.temperature__celcius = []
    this.humidity__pct = []
    this.pressure__hPa = []
    this.radia_glob = []
    this.wind_dir = []
    this.wind_speed = []
    this.precip = []
    this.sun = []
    this.visibility = []

    // The code essentially copies known properties into variables in the class. 
    for (const element in options) {
      if (Object.hasOwnProperty.call(options, element)) {
        var thing = options[element].properties;
        var propertyname = thing.parameterId
        var propertyvalue = parseFloat(thing.value)
        //console.log("name: " + propertyname + ", value: " + propertyvalue)
        if(propertyname.includes("temp") && !propertyname.includes("min") && !propertyname.includes("max") &&propertyvalue != Infinity){this.temperature__celcius.push(parseFloat(propertyvalue));}
        else if(propertyname.includes("hum")){this.humidity__pct.push(propertyvalue)}
        else if(propertyname.includes("pressure")){this.pressure__hPa.push(propertyvalue)} 
        else if(propertyname.includes("radia")){this.radia_glob.push(propertyvalue)}
        else if(propertyname.includes("wind_dir")){this.wind_dir.push(propertyvalue)}
        else if(propertyname.includes("wind_speed")){this.wind_speed.push(propertyvalue)}
        else if(propertyname.includes("precip") && !propertyname.includes("dur")){this.precip.push(propertyvalue)}
        else if(propertyname.includes("sun")){this.sun.push(propertyvalue)}
        else if(propertyname.includes("visib")){this.visibility.push(propertyvalue)}
        else { /*console.log("not pushed");*/ eval("this."+propertyname+"="+propertyvalue) } // Unceremoniously yoinked from: https://stackoverflow.com/questions/5613834/convert-string-to-variable-name-in-javascript
      }
    }


    var length = this.temperature__celcius.length
    if(length > 1){
      //console.log("temp: " + this.temperature__celcius)
      this.temperature__celcius = this.temperature__celcius.reduce((acc, cv) => {return acc += parseFloat(cv)}, 0)/length
    } if(length == 0){this.temperature__celcius = 0}
    length = this.humidity__pct.length
    if(length > 1){
      //console.log("hum: " + this.humidity__pct)
      this.humidity__pct = this.humidity__pct.reduce((acc, cv) => {return acc += parseFloat(cv)}, 0)/length
    } if(length == 0){this.humidity__pct = 0}
    length = this.pressure__hPa.length
    if(length > 1){
      //console.log("pre: " + this.pressure__hPa)
      this.pressure__hPa = this.pressure__hPa.reduce((acc, cv) => {return acc += parseFloat(cv)}, 0)/length
    } if(length == 0){this.pressure__hPa = 0}
    length = this.radia_glob.length
    if(length > 1){
      //console.log("rad: " + this.radia_glob)
      this.radia_glob = this.radia_glob.reduce((acc, cv) => {return acc += parseFloat(cv)}, 0)/length
    } if(length == 0){this.radia_glob = 0}
    length = this.wind_dir.length
    if(length > 1){
      //console.log("wnd: " + this.wind_dir)
      this.wind_dir = this.wind_dir.reduce((acc, cv) => {return acc += parseFloat(cv)}, 0)/length
    } if(length == 0){this.wind_dir = 0}
    length = this.wind_speed.length
    if(length > 1){
      //console.log("wsp: " + this.wind_speed)
      this.wind_speed = this.wind_speed.reduce((acc, cv) => {return acc += parseFloat(cv)}, 0)/length
    } if(length == 0){this.wind_speed = 0}
    length = this.precip.length
    if(length > 1){
      //console.log("cip: " + this.precip)
      this.precip = this.precip.reduce((acc, cv) => {return acc += parseFloat(cv)}, 0)/length
    } if(length == 0){this.precip = 0}
    length = this.sun.length
    if(length > 1){
      //console.log("sun: " + this.sun)
      this.sun = this.sun.reduce((acc, cv) => {return acc += parseFloat(cv)}, 0)/length
    } if(length == 0){this.sun = 0}
    length = this.visibility.length
    if(length > 1){
      //console.log("vis: " + this.visibility)
      this.visibility = this.visibility.reduce((acc, cv) => {return acc += parseFloat(cv)}, 0)/length
    } if(length == 0){this.visibility = 0}
    
    //console.log("VALUES:")
    //console.log("t:" + this.temperature__celcius + ", h:"+ this.humidity__pct +", p:" + this.pressure__hPa+ ", r:" + this.radia_glob+", w:"+ this.wind_dir+ ", ws:"+ this.wind_speed+", pre:"+ this.precip+", s:"+ this.sun+", v:"+ this.visibility)
    this.explaination_of_values = "<a href=https://confluence.govcloud.dk/pages/viewpage.action?pageId=26476621> link </a>" 
    this.parameters = "<a href=https://confluence.govcloud.dk/pages/viewpage.action?pageId=26476616> link </a>"
  }
}

const NULL = null

export class SmartCitizenKitDevice {
  constructor(options){
    this.sensorSource = "SmartCitizen"
    this.sensorType = options.kit.name
    this.device_id = options.kit.uuid
    this.time = options.updated_at

    this.mDigitalAmbientLightSensor = null
    this.mI2SDigitalMemsMicrophonewithcustomAudioProcessingAlgorithm = null
    this.mTemperature = null
    this.mHumidity = null
    this.mDigitalBarometricPressureSensor = null
    this.mParticleMatterPM2_5 = null
    this.mParticleMatterPM10 = null
    this.mParticleMatterPM1 = null
    this.mEquivalentCarbonDioxideDigitalIndoorSensor = null
    this.mTotalVolatileOrganicCompoundsDigitalIndoorSensor = null

    options.data.sensors.forEach(elem => {
      if(elem.value && elem.description){
        elem.description = "m"+elem.description.replace(/^\s+|\s+$/gm,'').trim().replaceAll(" ","").replaceAll("(","").replaceAll(")","").replaceAll(".","_").replaceAll("/","")
        if(elem.value != undefined && elem.value != null && elem.value != "null"){ 
          //console.log("this." + elem.description + "="+elem.value)
          eval("this." +elem.description + "=" + "'" + elem.value.toFixed(1) +"'") // toFixed forces decimals.
        } else {
          eval("this." + elem.description + "= NULL")
        }
      }
    })

    /*
    this.battery_level__pct = options.b
    this.measurements = "----------"
    this.luminosity__lx = ""
    this.noise__dBA = ""
    this.temperature__celcius = ""
    this.humidity__pct = ""
    this.pressure__hPa = ""
    this.PM2_5__mcgPERcm3 = ""
    this.PM10__mcgPERcm3 = ""
    this.PM1__mcgPERcm3 = ""
    this.eCO2__ppm = ""
    this.TVOC__ppb = ""
    */
  }
}

export class NullSensor {
  constructor(){
    this.sensorSource="null"
    this.sensorType = "null"
    this.device_id="null"
    // save newest timestamp
    this.time = new Date().toISOString()
    this.iconUrl='img/dmi_logo.jpg'  

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
  createSmartCitizenKitSensor(options){
    return new SmartCitizenKitDevice(options);
  }
  getRangeMap(key){
    //console.log("K: " + key + ", " + typeof(key))
    return rangeMap.get(key);
  }
  getIconMap(key){
    return iconMap.get(key);
  }
  getPublisherMap(key){
    return publisherMap.get(key);
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

