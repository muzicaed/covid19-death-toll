const DataDownloader = require('./data-downloader')
const WorldPopulation = require('./world-population')
const Moment = require('moment')

module.exports = {

  async getData() {
    const downloadedDeathToll = await DataDownloader.fetchDeathTollData()
    const downloadedRecovered = await DataDownloader.fetchRecoveredData()
    const processedDeathToll = process(downloadedDeathToll)
    const processedRecovered = process(downloadedRecovered)
    const merged = mergeData(processedDeathToll, processedRecovered)
    return enhanceData(merged)
  }
}

function mergeData(deathToll, recovered) {
  for (const country in deathToll) {
    const deathTollPost = deathToll[country]
    const recoveredPost = recovered[country]
    deathTollPost.totalRecovered = recoveredPost.total
    deathTollPost.datesRecovered = {}
    for (const dateKey in deathTollPost.dates) {
      deathTollPost.datesRecovered[dateKey] = recoveredPost.dates[dateKey]
    }
  }
  return deathToll
}

function process(downloaded) {
  const processed = {}
  for (let post of downloaded) {
    const converted = convert(post)
    if (!processed[converted.country]) {
      processed[converted.country] = converted
    } else {
      addToExisting(converted, processed)
    }
  }
  return processed
}

function addToExisting(converted, processed) {
  for (let dateKey in converted.dates) {
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
  for (let dateKey in post) {
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
    dates: dates
  }
}

// Adds day-0 = first death per million population
// Adds accumulated data and death per millions
function enhanceData(data) {
  for (const country in data) {
    const post = data[country]
    let accCount = 0
    post.population = WorldPopulation.fetchData(country)
    post.dayZero = null
    post.datesPm = {}
    post.datesIncPerWeekPm = {}
    post.datesEstInfected = {}
    post.datesEstInfectedPercent = {}
    post.totalPm = calcPm(post.total, post.population)
    post.totalEstInfected = calculateEstInfected(post.total, post.totalRecovered, post.population)
    for (const date in post.dates) {
      const value = post.dates[date]
      post.datesPm[date] = calcPm(value, post.population)
      if (post.datesPm[date] > 1.0 && post.dayZero == null) {
        post.dayZero = date
      }
      post.datesEstInfected[date] = calculateEstInfected(value, post.datesRecovered[date])
      post.datesEstInfectedPercent[date] = calculateEstInfectedPercent(post.datesEstInfected[date], post.population)
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
  for (const dateKey in records) {
    const testDate = Moment(dateKey, 'YYY-MM-DD')
    if (testDate >= weekAgo && testDate <= date && lastVal) {
      sum += (records[dateKey] - lastVal)
    }
    lastVal = records[dateKey]
  }
  return round(sum)
}

function calculateEstInfected(deathToll, recovered) {
  return Math.round(((deathToll / 0.015) - (recovered + deathToll)))
}

function calculateEstInfectedPercent(infected, population) {
  const result = (infected / population) * 100
  return parseFloat(result.toFixed(2))
}

function calcPm(value, population) {
  const pm = (value / population) * 1000000
  return round(pm)
}

function round(val) {
  return Math.round((val + Number.EPSILON) * 100) / 100
}