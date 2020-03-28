var CovidDayZero = {};

CovidDayZero.data = null;
CovidDayZero.chart = null;
CovidDayZero.countries = {
  c1: 'Italy',
  c2: 'US',
  c3: 'Spain',
  c4: null
}
CovidDayZero.borderColors = {
  c1: '#22cc22',
  c2: '#55bbee',
  c3: '#bb44bb',
  c4: '#ed880e'
}

CovidDayZero.execute = function () {
  $.getJSON('/data.json', function (data) {
    CovidDayZero.data = data;
    prepareSelect();
    updateChart();
  });
}

function updateChart() {
  var canvas = $('#day-0');
  var data = prepareData();
  if (canvas) {
    CovidDayZero.chart = new Chart(canvas, {
      type: 'line',
      data: data,
      options: {
        scales: {
          yAxes: [{
            scaleLabel: {
              display: true,
              labelString: 'Death toll, per million population'
            }
          }],
          xAxes: [{
            scaleLabel: {
              display: true,
              labelString: 'Days since 1 death per million population'
            }
          }]
        }
      }
    });
  }
}

function prepareData() {
  var datasets = [];
  $.each(CovidDayZero.countries, function (key, country) {
    if (country) {
      datasets.push(createDataset(key, country))
    }
  });
  return {
    labels: createLabels(datasets),
    datasets: datasets
  };
}

function createDataset(key, country) {
  var data = []
  var countryData = CovidDayZero.data[country].datesAccumulatedPm;
  var zeroDate = new Date(CovidDayZero.data[country].dayZero);
  console.log(zeroDate);
  $.each(countryData, function (date, value) {
    if (new Date(date) > zeroDate && CovidDayZero.data[country].dayZero !== null) {
      data.push(value);
    }
  });

  return {
    label: country,
    data: objValues(data),
    lineTension: 0.1,
    borderColor: CovidDayZero.borderColors[key],
    backgroundColor: 'rgba(0,0,0,0)'
  };
}

function createLabels(datasets) {
  var lables = [];
  var highestCount = 0;
  $.each(datasets, function (key, set) {
    if (set.data.length > highestCount) {
      highestCount = set.data.length;
    }
  });
  for (var i = 0; i < highestCount; i++) {
    lables.push('Day ' + i);
  }
  return lables;
}

function objValues(obj) {
  return $.map(obj, function (value, index) {
    return [value];
  });
}

function prepareSelect() {
  var countries = Object.keys(CovidDayZero.data);
  countries = countries.sort();
  $('.country-select').each(function () {
    var select = $(this);
    var id = select.attr('id');
    $.each(countries, function (key, country) {
      if (country == CovidDayZero.countries[id]) {
        select.append('<option selected value="' + country + '">' + country + '</option>');
      } else {
        select.append('<option value="' + country + '">' + country + '</option>');
      }

    });
    select.on('change', function () {
      CovidDayZero.countries[id] = this.value;
      updateChart();
    });
  });
}

$(function () {
  CovidDayZero.execute();
});