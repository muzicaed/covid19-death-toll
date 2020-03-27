const Axios = require('axios')
const url = 'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_deaths_global.csv'
const Csv = require('csvtojson')

module.exports = {

  async fetchData() {
    const response = await Axios.get(url)
    if (response.data) {
      const data = Csv().fromString(response.data)
      return data
    }
    return null
  }
}