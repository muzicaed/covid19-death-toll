const DataDownloader = require('./data-downloader')
const WorldPopulation = require('./world-population')
const Moment = require('moment')

module.exports = {

  async getData() {
    const processed = {}
    const downloaded = await DataDownloader.fetchData()
    if (downloaded) {
      for (let post of downloaded) {
        process(post, processed)
      }
    }
    return processed
  }
}

function process(post, processed) {
  const converted = convert(post)
  if (!processed[converted.country]) {
    processed[converted.country] = converted
  } else {
    addToExisting(converted, processed)
  }
  return converted
}

function addToExisting(converted, processed) {
  for (let dateKey of Object.keys(converted.dates)) {
    const value = converted.dates[dateKey]
    processed[converted.country].dates[dateKey] += value
  }
  processed[converted.country].total += converted.total
}

function convert(post) {
  const country = post['Country/Region']
  delete post['Country/Region']
  delete post['Province/State']
  delete post['Lat']
  delete post['Long']
  const dates = {}
  let total = 0
  for (let dateKey of Object.keys(post)) {
    const date = Moment(dateKey, 'M/DD/YY').format('YYYY-MM-DD')
    const value = parseInt(post[dateKey])
    dates[date] = value
    total = total + value
  }
  return {
    country: country,
    total: total,
    population: WorldPopulation.fetchData(country),
    dates: dates
  }
}