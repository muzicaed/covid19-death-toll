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
  initChart();
  $.getJSON('/data.json', function (data) {
    CovidDayZero.data = data;
    prepareSelect();
    updateChart();
  });
}

function initChart() {
  var canvas = $('#day-0');
  if (canvas) {
    CovidDayZero.chart = new Chart(canvas, {
      type: 'line',
      data: null,
      options: {
        scales: {
          yAxes: [{
            type: 'logarithmic',
            ticks: {
              callback: function (value, index, values) {
                if (value === 1000000) return "1M";
                if (value === 100000) return "100K";
                if (value === 10000) return "10K";
                if (value === 1000) return "1K";
                if (value === 100) return "100";
                if (value === 10) return "10";
                if (value === 0) return "0";
                return null;
              }
            },
            scaleLabel: {
              display: true,
              labelString: 'Death toll, per million population (logarithmic)'
            }
          }],
          xAxes: [{
            scaleLabel: {
              display: true,
              labelString: 'Day 0 = First day when death per million population > 1.0'
            }
          }]
        }
      }
    });
  }
}

function updateChart() {
  if (CovidDayZero.chart) {
    var data = prepareData();
    CovidDayZero.chart.data.labels = data.labels;
    CovidDayZero.chart.data.datasets = data.datasets;
    CovidDayZero.chart.update();
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