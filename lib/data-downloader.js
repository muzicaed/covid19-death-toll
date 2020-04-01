const Axios = require('axios')
const deathTollUrl = 'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_deaths_global.csv'
const recoveredUrl = 'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_recovered_global.csv'
const Csv = require('csvtojson')

module.exports = {

  async fetchDeathTollData() {
    const response = await Axios.get(deathTollUrl)
    if (response.data) {
      return await Csv().fromString(response.data)
    }
    return null
  },

  async fetchRecoveredData() {
    const response = await Axios.get(recoveredUrl)
    if (response.data) {
      return await Csv().fromString(response.data)
    }
    return null
  }
}