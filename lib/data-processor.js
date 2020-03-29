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
    return enhanceDayZeroData(processed)
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
  const startDate = Moment('2020-03-01')
  const country = post['Country/Region']
  delete post['Country/Region']
  delete post['Province/State']
  delete post['Lat']
  delete post['Long']
  const dates = {}
  let total = 0
  for (let dateKey of Object.keys(post)) {
    const date = Moment(dateKey, 'M/DD/YY')
    const dateStr = date.format('YYYY-MM-DD')
    const value = parseInt(post[dateKey])
    if (startDate <= date) {
      dates[dateStr] = value
    }
    total = value
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
function enhanceDayZeroData(data) {
  for (const country of Object.keys(data)) {
    const post = data[country]
    let accCount = 0
    post.dayZero = null
    post.datesPm = {}
    post.datesIncPerWeekPm = {}
    post.totalPm = calcPm(post.total, post.population)
    for (const date of Object.keys(post.dates)) {
      const value = post.dates[date]
      post.datesPm[date] = calcPm(value, post.population)
      if (post.datesPm[date] > 1.0 && post.dayZero == null) {
        post.dayZero = date
      }
      post.datesIncPerWeekPm[date] = calculateIncreasePerWeek(date, post.datesPm)
    }

  }
  return data
}

function calculateIncreasePerWeek(dateStr, records) {
  let sum = 0.0
  let lastVal = null
  const date = Moment(dateStr, 'YYY-MM-DD')
  const weekAgo = Moment(dateStr, 'YYY-MM-DD').subtract(8, 'days')
  for (const dateKey of Object.keys(records)) {
    const testDate = Moment(dateKey, 'YYY-MM-DD')
    if (testDate >= weekAgo && testDate <= date && lastVal) {
      sum += (records[dateKey] - lastVal)
    }
    lastVal = records[dateKey]
  }
  return round(sum)
}

function calcPm(value, population) {
  const pm = (value / population) * 1000000
  return round(pm)
}

function round(val) {
  return Math.round((val + Number.EPSILON) * 100) / 100
}