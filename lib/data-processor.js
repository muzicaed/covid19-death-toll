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
    return enhanceData(processed)
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

// Adds day-0 = first death per million population
// Adds accumulated data and death per millions
function enhanceData(data) {
  for (const country of Object.keys(data)) {
    const post = data[country]
    let accCount = 0
    post.dayZero = null
    post.datesAccumulated = {}
    post.datesAccumulatedPm = {}
    post.totalPm = calcPm(post.total, post.population)
    for (const date of Object.keys(post.dates)) {
      const value = post.dates[date]
      accCount += value
      post.datesAccumulated[date] = accCount
      post.datesAccumulatedPm[date] = calcPm(accCount, post.population)
      if (post.datesAccumulatedPm[date] > 1.0 && post.dayZero == null) {
        post.dayZero = date
      }
    }
  }
  return data
}

function calcPm(value, population) {
  const pm = (value / population) * 1000000
  return Math.round((pm + Number.EPSILON) * 100) / 100
}