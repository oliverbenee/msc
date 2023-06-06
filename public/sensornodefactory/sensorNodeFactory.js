const unitMap = new Map();
unitMap.set("geometry", {name: "geometry", unit: ""})
unitMap.set("device_type", {name: "device type", unit:""})
unitMap.set("device_id", {name: "device id", unit:""})
unitMap.set("t", {name: "temperature", unit: "celsius"})
unitMap.set("h", {name: "humidity", unit: "%"})
unitMap.set("p", {name: "pressure", unit: "hPa"})
unitMap.set("l", {name: "luminosity", unit: "lux"})
unitMap.set("radia_glob", {name: "Radiation", unit: "W/m2"})
unitMap.set("wind_dir", {name: "Wind Direction", unit: "°"})
unitMap.set("wind_speed", {name: "Wind Speed", unit: "m/s"})
unitMap.set("precip", {name: "Precipitation", unit: "kg/m2"})
unitMap.set("sun", {name: "Sun", unit: "min"})
unitMap.set("visibility", {name: "Visibility", unit: "m"})
unitMap.set("mP1", {name: "PM1", unit: "µg/cm3"})
unitMap.set("mP2", {name: "PM2.5", unit: "µg/cm3"})
unitMap.set("mPX", {name: "PM10", unit: "µg/cm3"})
unitMap.set("height", {name: "Height", unit: "m"})
unitMap.set("nA", {name: "Noise Average", unit: "dBa"})
unitMap.set("eCO2", {name: "equivalent CO2", unit: "ppm"})
unitMap.set("TVOC", {name: "Total Volatile Organic Compounds", unit: "ppb"})
unitMap.set("so2", {name: "Sulfur Dioxide", unit: "µg/m3"})
unitMap.set("no2", {name: "Nitrogen Dioxide", unit: "µg/m3"})
unitMap.set("nox", {name: "Nitrogen Oxide (any)", unit: "µg/m3"})

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
rangeMap.set("WiFi router", 20)

const publisherMap = new Map();
publisherMap.set("CityProbe2", "Montem")
publisherMap.set("Synop", "DMI")
publisherMap.set("Pluvio", "DMI")
publisherMap.set("GIWS", "DMI")
publisherMap.set("SmartCitizen Kit 1.1", "SmartCitizen")
publisherMap.set("SCK 2.1", "SmartCitizen")
publisherMap.set("SCK 2.1 GPS", "SmartCitizen")
publisherMap.set("Tide-gauge-primary", "DMI")
publisherMap.set("Tide-gauge-secondary", "DMI")

publisherMap.set("WiFi router", "Aarhus Municipality")

publisherMap.set("AU air quality sensor", "Aarhus Universitet")
publisherMap.set("MET.no air quality sensor", "MET.no")
publisherMap.set("Instruments from HC Oersted Institute", "HC Oersted Institute")
publisherMap.set("Open-Meteo Weather station", "Open-Meteo")

publisherMap.set("CORE", "SMHI")
publisherMap.set("ADDITIONAL", "SMHI")

publisherMap.set("OpenSenseMap Sensor", "OpenSenseMap")

const iconMap = new Map();
iconMap.set("CityProbe2", "img/montem_logo.jpg")
iconMap.set("Synop", "img/dmi_metobs.png")
iconMap.set("Pluvio", "img/dmi_metobs.png")
iconMap.set("GIWS", "img/dmi_metobs.png")
iconMap.set("Tide-gauge-primary", "img/dmi_oceanobs.png")
iconMap.set("Tide-gauge-secondary", "img/dmi_oceanobs.png")
iconMap.set("Open-Meteo Weather station", "img/open-meteo.png")

// all the smartCitizen ones
iconMap.set("SmartCitizen Kit 1.1", "img/smartcitizen.png")
iconMap.set("SCK 2.1", "img/smartcitizen.png")
iconMap.set("SCK 2.1 GPS", "img/smartcitizen.png")

iconMap.set("WiFi router", "img/msql.png")

iconMap.set("null", "img/sensor_image.png")
iconMap.set("TEST", "img/sensor_image.png")

iconMap.set("MET.no air quality sensor", "img/met_no.png")
iconMap.set("Instruments from HC Oersted Institute", "img/kobkomm.jpg")
iconMap.set("AU air quality sensor", "img/au_logo.png")

iconMap.set("CORE", "img/smhi_logo.png")
iconMap.set("ADDITIONAL", "img/smhi_logo.png")

iconMap.set("OpenSenseMap Sensor", "img/opensensemap.png")

export class CityLabSensor {
  constructor(options){
    this.device_id = options.device_id || 7
    this.device_type = "CityLab"

    // Data types. TODO: Update how data values are fetched.
    this.air_temperature = options.air_temperature
    this.humidity = options.humidity
    this.pressure = options.pressure
    this.lux = options.lux
    this.solar_radiation = options.solar_radiation
    this.wind_speed = options.wind_speed
    this.wind_vane = options.wind_vane
    this.rain = options.rain
  }
}

export class CityProbeSensor {
  constructor(options) {
    this.sensorSource="OpenData Aarhus"
    this.device_type="CityProbe"
    this.device_id = options.deviceid
    this.time = options.published_at
    this.battery_level__pct = options.battery
    this.measurements = "------------------------"
    this.noise=options.noise
    this.CO = options.CO
    this.temperature__celcius = options.temperature
    this.humidity__pct = options.humidity
    this.luminosity__lx = options.illuminance
    this.pressure__hPa = options.pressure
    this.PM2_5__mcgPERcm3 = options.PM2_5
    this.NO2 = options.NO2
    this.noise_max=options.noise_max
  }
}

/*
  UPDATE 18-04-2023:
  Unfortunately, it appears, that the founders of Montem A/S has shut down their business. 
  The code here is preserved for documentation purposes. 
export class CityProbe2Sensor { 
  // Translation for values found at:
  // https://docs.cityflow.live/#get-device-types
  // GET https://api.cityflow.live/devices/types
  constructor(options) {
    //console.log(options)
    this.sensorSource="Montem"
    this.device_type="CityProbe2"
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

export class CityProbe2Factory {
  create(options){
    return new CityProbe2Sensor(options)
  }
}
*/

export class DMIFreeDataSensor { 
  constructor(options){    
    this.sensorSource="DMI"
    // This looks really stupid, but doing this lets us just copy fields into the sensor afterwards.
    let ST = options.stationType
    delete options.stationType
    this.device_type = ST
    this.device_id=options[0].properties.stationId.toString()
    this.time = options[0].properties.created // seems to be changing between created and observed every so often????

    this.temperature__celcius = [0]
    this.humidity__pct = [0]
    this.pressure__hPa = [0]
    this.radia_glob = [0]
    this.wind_dir = [0]
    this.wind_speed = [0]
    this.precip = [0]
    this.sun = [0]
    this.visibility = [0]

    this.jsonmap = new Map()

    // The code essentially copies known properties into variables in the class. 
    for (const element in options) {
      if (Object.hasOwnProperty.call(options, element)) {
        var thing = options[element].properties;
        var propertyname = thing.parameterId
        var propertyvalue = thing.value
        let isTemp = (propertyname.includes("temp") || propertyname.includes("tw"))
        if(isTemp && propertyvalue != Infinity){this.temperature__celcius.push(parseFloat(propertyvalue));}
        else if(propertyname.includes("hum")){
          this.humidity__pct.push(parseFloat(propertyvalue))
        } else if(propertyname.includes("pressure")){
          this.pressure__hPa.push(parseFloat(propertyvalue))
        } else if(propertyname.includes("radia")){
          this.radia_glob.push(parseInt(propertyvalue))
        } else if(propertyname.includes("wind_dir")){
          this.wind_dir.push(parseInt(propertyvalue))
        } else if(propertyname.includes("wind") && !propertyname.includes("dir")){
          this.wind_speed.push(parseFloat(propertyvalue))
        } else if(propertyname.includes("precip") && !propertyname.includes("dur")){
          this.precip.push(parseFloat(propertyvalue))
        } else if(propertyname.includes("sun")){
          this.sun.push(propertyvalue)
        } else if(propertyname.includes("visib")){
          this.visibility.push(parseInt(propertyvalue))
        }
        // Save a backup value for preservation. 
        this.jsonmap.set(propertyname, propertyvalue)
      }
    }
    this.jsonmap = JSON.stringify(Object.fromEntries(this.jsonmap))

    this.temperature__celcius = average(this.temperature__celcius)
    this.humidity__pct = average(this.humidity__pct)
    this.pressure__hPa = average(this.pressure__hPa)
    this.radia_glob = average(this.radia_glob)
    this.wind_dir = average(this.wind_dir)
    this.wind_speed = average(this.wind_speed)
    this.precip = average(this.precip)
    this.sun = average(this.sun)
    this.visibility = average(this.visibility)
    
    //console.log("insert", "t:" + this.temperature__celcius + ", h:"+ this.humidity__pct +", p:" + this.pressure__hPa+ ", r:" + this.radia_glob+", w:"+ this.wind_dir+ ", ws:"+ this.wind_speed+", pre:"+ this.precip+", s:"+ this.sun+", v:"+ this.visibility)
    this.explaination_of_values = "<a href=https://confluence.govcloud.dk/pages/viewpage.action?pageId=26476621> link </a>" 
    this.parameters = "<a href=https://confluence.govcloud.dk/pages/viewpage.action?pageId=26476616> link </a>"
  }
}

export function average(array) {
  let AL = array.length-1
  let sum = array.reduce((acc, cv) => {return acc += cv}, 0)
  let avg = (sum/AL) || 0
  return avg;
}

export class DMIFreeDataSensorFactory {
  create(options){
    return new DMIFreeDataSensor(options)
  }
}

const NULL = null

export class SmartCitizenKitDevice {
  constructor(options){
    this.sensorSource = "SmartCitizen"
    this.device_type = options.kit.name
    this.device_id = options.id // FINTE: options.kit.uuid er et mærkat for sensor typen og det er forkert!!!
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

    // FIXME: This is garbage. It creates security holes the size of Jupiter. Use a JSON column instead.
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

    this.json = options

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

export class SmartCitizenKitFactory {
  create(options){
    return new SmartCitizenKitDevice(options)
  }
}

export class WiFiRouterLocation {
  constructor(options){
    this.sensorSource = "Open Data Aarhus WiFi Routers"
    this.device_type = "WiFi router"
    this.device_id = options.id
    this.city = options.city
    this.name = options.name
    this.zip = options.zip
    this.street = options.street
    this.department = options.department
    this.houseno = options.houseno
  }
}

export class WiFiRouterFactory {
  create(options) {
    return new WiFiRouterLocation(options)
  }
}

export class NullSensor {
  constructor(options){
    this.sensorSource="null"
    this.device_type = "null"
    this.device_id="null"
    // save newest timestamp. TODO: not sure if safe to delete.
    this.time = new Date().toISOString()

    this.description = "There is a known sensor location here, but there is no data for it. "
    //this.iconUrl='img/sensor_image.png'
  }
}

export class NullSensorFactory {
  create(options){
    return new NullSensor()
  }
}

export class SensorOptions {
  getRangeMap(key){
    return rangeMap.get(key);
  }
  getIconMap(key){
    return iconMap.get(key);
  }
  getPublisherMap(key){
    return publisherMap.get(key);
  }
  getUnitMap(key){
    return unitMap.get(key);
  }
}

export class MetNoAirQualitySensor {
  constructor(options){
    this.sensorSource = "MET.no"
    //console.log("OPT", options)
    this.device_type = "MET.no air quality sensor"
    this.device_id = options.device_id
    this.name = options.location_name
    this.municipality = options.municipality
    
    this.height = options.height
    
    this.temperature__celcius = average([0, options.air_temperature_0m, options.air_temperature_2m, options.air_temperature_20m, options.air_temperature_100m, options.air_temperature_200m, options.air_temperature_500m])
    this.humidity__pct = options.relative_humidity_2m
    this.wind_speed = options.wind_speed
    this.precip=options.rainfall_amount + options.snowfall_amount
    this.wind_dir = options.wind_direction
    this.pressure__hPa = options.surface_air_pressure
    this.jsonmap = {
      rainfall_amount: options.rainfall_amount,
      snowfall_amount: options.snowfall_amount,
      air_temperature_0m: options.air_temperature_0m, 
      air_temperature_2m: options.air_temperature_2m, 
      air_temperature_20m: options.air_temperature_20m, 
      air_temperature_100m: options.air_temperature_100m, 
      air_temperature_200m: options.air_temperature_200m, 
      air_temperature_500m: options.air_temperature_500m,
      json: options
    }
  }
}

export class MetNoAirQualitySensorFactory {
  create(options){
    return new MetNoAirQualitySensor(options)
  }
}

export class AarhusUniversityAirqualitySensor {
  constructor(options){
    //console.log("OPT", options)
    this.sensorSource = "Aarhus Universitet"
    this.device_id = options.device_id
    this.device_type = "AU air quality sensor"
    this.data_location = "https://envs2.au.dk/Luftdata/Presentation/table/Aarhus/" + options.device_id
    //this.latest = options.latest
    this.time = options.latest.time
    this.no2 = 0 + options.latest.no2
    this.nox = 0 + options.latest.nox
    this.co = 0 + options.latest.co
    this.o3 = 0 + options.latest.o3
    this.so2 = 0 + options.latest.so2
    this.PM10__mcgPERcm3 = 0 + options.latest.mpx
    this.PM2_5__mcgPERcm3 = 0 + options.latest.pm25

    this.jsonmap = options.latest
  }
}

export class AarhusUniversityAirqualitySensorFactory {
  create(options){
    return new AarhusUniversityAirqualitySensor(options)
  }
}

// https://www.opendata.dk/city-of-copenhagen/meteorologi#resource-hc-oersted-institutet-meteorologi.csv
export class CopenhagenMeterologySensor {
  constructor(options){
    console.log("OPTIONS", options)

    this.device_type = "Instruments from HC Oersted Institute"

    this.id = undefined
    this.date = undefined
    this.time = undefined
    this.wind_dir = undefined
    this.wind_speed = undefined
    this.temperature__celcius = undefined
    this.humidity__pct = undefined
    this.GSwm2 = undefined

    for (const key in options) {
      console.log("data for key '" + key + "' is '" + options[key] + "'")
      let K2 = key.toString().replace(" ","").replace(" ","").replace("(","").replace(")","").replace("%","").replace("/","").trim()
      if(K2 == '_id'){this.id=options[key]}
      else if(K2 == 'Dato'){this.date=options[key]}
      else if(K2 == 'Tid'){this.time=options[key]}
      else if(K2 == 'VRgrader'){this.wind_dir=options[key]}
      else if(K2 == 'VHms'){this.wind_speed=options[key]}
      else if(K2 == 'TgraderC'){this.temperature__celcius=options[key]}
      else if(K2 == 'RH'){this.humidity__pct=options[key]}
      else if(K2 == 'GSwm2'){this.GSwm2=options[key]}
      else{console.log("actual K2 is: '" + K2 + "'")}
    }
  }
}

export class CopenhagenMeterologySensorFactory {
  create(options){
    return new CopenhagenMeterologySensor(options)
  }
}


function test(){
  const sensorfactory = new SensorFactory();
  const sensor = sensorfactory.create({
    device_id: 1,
    device_type: "CityLab"
  })
  console.log("-------------------------------------")
  console.log("test sensor 1")
  Object.keys(sensor).forEach((prop, index) => {console.log(prop + ": " + Object.values(sensor)[index])})
  console.log("-------------------------------------")
  console.log("test sensor 2")
  const sensor2 = sensorfactory.create({
    device_id: 2,
    device_type: "CityLab"
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

export class OpenMeteoStation {
  constructor(options){
    this.sensorSource="Open-Meteo"
    this.device_type="Open-Meteo Weather station"
    this.device_id=options.device_id
    let hour = new Date().getHours()
    this.time=options.hourly.time[hour]
    this.temperature__celcius = options.hourly.temperature_2m[hour]
    this.humidity__pct = options.hourly.relativehumidity_2m[hour]
    this.precip = options.hourly.precipitation[hour]
    this.pressure__hPa = options.hourly.surface_pressure[hour]
    this.visibility = options.hourly.visibility[hour]
    this.wind_speed=options.hourly.windspeed_10m[hour]
    this.wind_dir=options.hourly.winddirection_10m[hour]
  }
}

export class OpenMeteoStationFactory {
  create(options){
    return new OpenMeteoStation(options)
  }
}

export class OpenSenseMapSensor {
  constructor(options){
    this.device_id = options["_id"]
    this.time = options["lastMeasurementAt"]
    this.name = options["name"] || ""
    this.exposure = options["exposure"] || ""
    this.model = options["model"] || ""
    this.description = options["description"] || ""
    this.sensorSource = "OpenSenseMap"
    this.device_type ="OpenSenseMap Sensor"
    this.json = options.sensors

    // if sensors exist
    if(options["sensors"]){
      // console.log("SENSORS LIST", options.sensors)
      // iterate through the array.
      options.sensors.forEach((element) => {
        try { // for each element try to see if a measurement exists.
          const measurement = element;
          // console.log("M", measurement)
          const measurementType = measurement.title
          const measurementValue = parseFloat(measurement.lastMeasurement["value"])
          // name and value are known. Save one to "JSON" column and make the rest into standard columns
          switch(measurementType){
            case "Temperatur": 
              this.t = measurementValue; 
              break
            case "rel. Luftfeuchte": 
              this.h = measurementValue
              break
            case "Luftdruck": 
              this.p = measurementValue
              break
            case "Windrichtung":
              this.wind_dir = measurementValue
              break
            case "PM2.5":
              this.mp2 = measurementValue
              break
            case "PM10":
              this.mpx = measurementValue
              break
            case "Beleuchtungsstärke":
              this.l = measurementValue
              break
            case "Regen":
              this.precip = measurementValue
              break
            case "Windgeschwindigkeit":
              this.wind_speed = measurementValue
              break
          }
        } catch(e){}
      }) 
    }
  }   
}

export class OpenSenseMapSensorFactory {
  create(options){
    return new OpenSenseMapSensor(options)
  }
}