const Fs = require('fs')
//const Axios = require('axios')
//const baseUrl = 'https://data.opendatasoft.com/api/records/1.0/search/?dataset=world-population%40kapsarc&q='

const cache = {}

module.exports = {

  fetchData(country) {
    if (cache[country]) return cache[country]
    const value = getValue(country)
    cache[country] = value
    return value
  }
}

function getValue(country) {
  const jsonString = Fs.readFileSync(`./data/${country}.json`)
  if (jsonString) {
    let latestYear = 0
    let latestData = null
    const data = JSON.parse(jsonString)
    for (const record of data.records) {
      const recordYear = parseInt(record.fields.year)
      if (recordYear > latestYear) {
        latestYear = recordYear
        latestData = record.fields.value
      }
    }
    return latestData
  }
  return null
}