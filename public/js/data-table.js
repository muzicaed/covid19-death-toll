var CovidDataTable = {};

CovidDataTable.execute = function () {
  $.getJSON('/data.json', function (res) {
    var tableBody = $('#table-body');
    var countries = objValues(res)
    countries.sort(function (a, b) {
      return b.totalPm - a.totalPm
    })
    $.each(countries, function (i, country) {
      if (country.total && country.total > 0) {
        console.log(country.totalPm);
        var tr = $('<tr></tr>')
        tr.append('<th scope="row">' + (i + 1) + '</th>');
        tr.append('<td>' + country.country + '</td>');
        tr.append('<td class="text-right">' + formatNumber(country.total) + '</td>');
        tr.append('<td class="text-right">' + formatNumber(country.totalPm) + '</td>');
        tr.append('<td class="text-right">' + formatNumber(country.population) + '</td>');
        tr.append('<td class="text-right">' + (country.dayZero ? country.dayZero : 'N/A') + '</td>');
        tableBody.append(tr);
      }
    });
  });
}

function formatNumber(num) {
  if (num) {
    let format = num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1 ');
    return format.toString().replace('.', ',');
  }
  return '';
}

function objValues(obj) {
  return $.map(obj, function (value, index) {
    return [value];
  });
}

$(function () {
  CovidDataTable.execute();
});