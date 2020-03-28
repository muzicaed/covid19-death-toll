var CovidDayZero = {};

CovidDayZero.data = null;
CovidDayZero.zeroChart = null;
CovidDayZero.datesChart = null;
CovidDayZero.countries = {
  c1: 'Italy',
  c2: 'Spain',
  c3: 'US',
  c4: 'Sweden'
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
  var zeroCanvas = $('#day-0');
  if (zeroCanvas) {
    CovidDayZero.zeroChart = createChart(zeroCanvas, 'Day 0 = First day when death per million population > 1.0');
  }
  var datesCanvas = $('#dates');
  if (datesCanvas) {
    CovidDayZero.datesChart = createChart(datesCanvas, 'Dates');
  }
}

function updateChart() {
  if (CovidDayZero.zeroChart) {
    var zeroData = prepareZeroData();
    CovidDayZero.zeroChart.data.labels = zeroData.labels;
    CovidDayZero.zeroChart.data.datasets = zeroData.datasets;
    CovidDayZero.zeroChart.update();
  }
  if (CovidDayZero.datesChart) {
    var datesData = prepareDatesData();
    CovidDayZero.datesChart.data.labels = datesData.labels;
    CovidDayZero.datesChart.data.datasets = datesData.datasets;
    CovidDayZero.datesChart.update();
  }
}

function prepareZeroData() {
  var datasets = [];
  $.each(CovidDayZero.countries, function (key, country) {
    if (country) {
      datasets.push(createZeroDataset(key, country));
    }
  });
  return {
    labels: createLabels(datasets),
    datasets: datasets
  };
}

function createZeroDataset(key, country) {
  var data = []
  var countryData = CovidDayZero.data[country].datesPm;
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

function prepareDatesData() {
  var datasets = [];
  var labels = null;
  $.each(CovidDayZero.countries, function (key, country) {
    if (country) {
      datasets.push(createDatesDataset(key, country));
    }
    if (!labels) {
      labels = Object.keys(CovidDayZero.data[country].dates);
    }
  });
  return {
    labels: labels,
    datasets: datasets
  };
}

function createDatesDataset(key, country) {
  var countryData = CovidDayZero.data[country].datesPm;
  return {
    label: country,
    data: objValues(countryData),
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


function createChart(canvas, xTitle) {
  return new Chart(canvas, {
    type: 'line',
    data: null,
    options: {
      responsive: true,
      maintainAspectRatio: false,
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
            labelString: xTitle
          }
        }]
      }
    }
  });
}

function objValues(obj) {
  return $.map(obj, function (value, index) {
    return [value];
  });
}

$(function () {
  CovidDayZero.execute();
});