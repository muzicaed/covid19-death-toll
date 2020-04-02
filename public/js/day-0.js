var CovidDayZero = {};

CovidDayZero.data = null;
CovidDayZero.zeroChart = null;
CovidDayZero.datesChart = null;
CovidDayZero.incPerWeekChart = null;
CovidDayZero.countries = {
  c1: 'Italy',
  c2: 'Spain',
  c3: 'Sweden',
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
  var timmer = setTimeout(function () {
    $('#loading-screen').fadeIn(100);
  }, 700);
  $.getJSON('/data.json', function (data) {
    clearTimeout(timmer);
    CovidDayZero.data = data;
    prepareEvents();
    updateCharts();
    $('#loading-screen').fadeOut(400);
  });
}

function initChart() {
  var zeroCanvas = $('#day-0');
  if (zeroCanvas) {
    CovidDayZero.zeroChart = createChart(zeroCanvas, 'Day 0 = Death per million population > 1.0');
  }
  var datesCanvas = $('#dates');
  if (datesCanvas) {
    CovidDayZero.datesChart = createChart(datesCanvas, '');
  }
  var incPerWeekCanvas = $('#incPerWeek');
  if (incPerWeekCanvas) {
    CovidDayZero.incPerWeekChart = createChart(incPerWeekCanvas, '');
  }

  var estInfectedCanvas = $('#estInfected');
  if (estInfectedCanvas) {
    CovidDayZero.estInfectedChart = createEstInfectedChart(estInfectedCanvas);
  }
}

function updateCharts() {
  if (CovidDayZero.zeroChart) {
    var zeroData = prepareZeroData();
    CovidDayZero.zeroChart.data.labels = zeroData.labels;
    CovidDayZero.zeroChart.data.datasets = zeroData.datasets;
    CovidDayZero.zeroChart.update();
  }
  if (CovidDayZero.datesChart) {
    var datesData = prepareDatesData('datesPm');
    CovidDayZero.datesChart.data.labels = datesData.labels;
    CovidDayZero.datesChart.data.datasets = datesData.datasets;
    CovidDayZero.datesChart.update();
  }
  if (CovidDayZero.incPerWeekChart) {
    var perWeekData = prepareDatesData('datesIncPerWeekPm');
    CovidDayZero.incPerWeekChart.data.labels = perWeekData.labels;
    CovidDayZero.incPerWeekChart.data.datasets = perWeekData.datasets;
    CovidDayZero.incPerWeekChart.update();
  }

  if (CovidDayZero.estInfectedChart) {
    var estInfectedData = prepareDatesData('datesEstInfectedPercent');
    CovidDayZero.estInfectedChart.data.labels = estInfectedData.labels;
    CovidDayZero.estInfectedChart.data.datasets = estInfectedData.datasets;
    CovidDayZero.estInfectedChart.update();
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
    if (new Date(date) >= zeroDate && CovidDayZero.data[country].dayZero !== null) {
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

function prepareDatesData(field) {
  var datasets = [];
  var labels = null;
  $.each(CovidDayZero.countries, function (key, country) {
    if (country) {
      datasets.push(createDatesDataset(key, country, field));
    }
    if (country && !labels) {
      labels = Object.keys(CovidDayZero.data[country].dates);
    }
  });
  return {
    labels: labels,
    datasets: datasets
  };
}

function createDatesDataset(key, country, field) {
  var countryData = CovidDayZero.data[country][field];
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

function prepareEvents() {
  var countries = Object.keys(CovidDayZero.data);
  countries = countries.sort();
  $('.country-select').each(function () {
    var select = $(this);
    var id = select.attr('id');
    addHighlightedCountires(select, id);
    $.each(countries, function (key, country) {
      if (country == CovidDayZero.countries[id]) {
        select.append('<option value="' + country + '">' + country + '</option>');
      } else {
        select.append('<option value="' + country + '">' + country + '</option>');
      }
    });

    select.on('change', function () {
      CovidDayZero.countries[id] = this.value;
      updateCharts();
    });

    $('#clear-all-countries').on('click', function (e) {
      event.preventDefault();
      CovidDayZero.countries = {
        c1: null,
        c2: null,
        c3: null,
        c4: null
      };

      $('.country-select').each(function () {
        $(this).val('');
      });
      updateCharts();
    });

    $('#button-day-0-lin').on('click', function (e) {
      e.preventDefault();
      makeChartLin(CovidDayZero.zeroChart);
    });

    $('#button-day-0-log').on('click', function (e) {
      e.preventDefault();
      makeChartLog(CovidDayZero.zeroChart);
    });

    $('#button-week-lin').on('click', function (e) {
      e.preventDefault();
      makeChartLin(CovidDayZero.incPerWeekChart);
    });

    $('#button-week-log').on('click', function (e) {
      e.preventDefault();
      makeChartLog(CovidDayZero.incPerWeekChart);
    });

    $('#button-chron-lin').on('click', function (e) {
      e.preventDefault();
      makeChartLin(CovidDayZero.datesChart);
    });

    $('#button-chron-log').on('click', function (e) {
      e.preventDefault();
      makeChartLog(CovidDayZero.datesChart);
    });
  });
}


function createChart(canvas, xTitle) {
  return new Chart(canvas, {
    type: 'line',
    data: null,
    options: {
      tooltips: {
        mode: 'x'
      },
      responsive: true,
      maintainAspectRatio: false,
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
            labelString: xTitle
          }
        }]
      }
    }
  });
}

function createEstInfectedChart(canvas) {
  return new Chart(canvas, {
    type: 'line',
    data: null,
    options: {
      tooltips: {
        mode: 'x'
      },
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        yAxes: [{
          scaleLabel: {
            display: true,
            labelString: 'Estimated percent of population infected'
          },
          ticks: {
            min: 0,
            callback: function (value) {
              return value + '%'
            }
          }
        }]
      }
    }
  });
}

function addHighlightedCountires(select, id) {
  select.append('<option ' + (id == 'c1' ? 'selected' : '') + ' value="Italy">Italy</option>');
  select.append('<option  ' + (id == 'c2' ? 'selected' : '') + ' value="Spain">Spain</option>');
  select.append('<option value="Belgium">Belgium</option>');
  select.append('<option value="Netherlands">Netherlands</option>');
  select.append('<option value="France">France</option>');
  select.append('<option value="Switzerland">Switzerland</option>');
  select.append('<option value="Luxembourg">Luxembourg</option>');
  select.append('<option value="Iran">Iran</option>');
  select.append('<option value="United Kingdom">United Kingdom</option>');
  select.append('<option  ' + (id == 'c3' ? 'selected' : '') + ' value="Sweden">Sweden</option>');
  select.append('<option value="US">USA</option>');
  select.append('<option value="Korea, South">South Korea</option>');
  select.append('<option value="China">China</option>');
  select.append('<option disabled value="">---------------------</option>');
}

function objValues(obj) {
  return $.map(obj, function (value, index) {
    return [value];
  });
}

function makeChartLog(chart) {
  chart.options.scales.yAxes[0].type = 'logarithmic';
  chart.options.scales.yAxes[0].scaleLabel.labelString = 'Death toll, per million population (logarithmic)';
  chart.options.scales.yAxes[0].ticks.callback = function (value, index, values) {
    if (value === 1000000) return "1M";
    if (value === 100000) return "100K";
    if (value === 10000) return "10K";
    if (value === 1000) return "1K";
    if (value === 100) return "100";
    if (value === 10) return "10";
    if (value === 0) return "0";
    return null;
  };
  chart.update();
}

function makeChartLin(chart) {
  chart.options.scales.yAxes[0].type = 'linear';
  chart.options.scales.yAxes[0].scaleLabel.labelString = 'Death toll, per million population';
  chart.options.scales.yAxes[0].ticks.callback = function (value, index, values) { return value };
  chart.update();
}

$(function () {
  CovidDayZero.execute();
});