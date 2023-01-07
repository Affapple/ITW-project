$(document).ready(function () {
    //Get data for Graph
    function loadData(type, titulo, cores, div) {
        console.log("yey again")
        var composedUri = 'http://192.168.160.58/Olympics/api/Statistics/Medals_Country'
        pedidoAJAX(composedUri, 'GET').done(function (data) {
            self.graphData = data
            let array = [["Country", "Medals"],]
            data.forEach(country => {
                switch (type) {
                    case 'gold':
                        var counter = country.Medals[0].Counter;
                        break
                    case 'bronze':
                        var counter = country.Medals[1].Counter;
                        break
                    case 'silver':
                        var counter = country.Medals[2].Counter;
                        break
                    default:
                        var counter = country.Medals[0].Counter +
                            country.Medals[1].Counter +
                            country.Medals[2].Counter;
                }
                array.push([country.CountryName, counter]);
            })
            console.log(array)
            google.charts.load('current', { 'packages': ['geochart'] });

            google.charts.setOnLoadCallback(drawChart);

            function drawChart() {

                var dados = google.visualization.arrayToDataTable(array);
                var options = {
                    title: titulo,
                    width: "100%",
                    height: 600,
                    colors: cores
                };
                console.table(options)
                var chart = new google.visualization.GeoChart(document.getElementById(div));
                chart.draw(dados, options);
            }

        });
    }


    function pedidoAJAX(uri, method, data) {
        self.error(''); // Clear error message
        return $.ajax({
            type: method,
            url: uri,
            dataType: 'json',
            crossDomain: true,
            contentType: 'application/json',
            data: data ? JSON.stringify(data) : null,
            error: function (jqXHR, textStatus, errorThrown) {
                console.log("AJAX Call[" + uri + "] Fail...");
                hideLoading();
                self.error(errorThrown);
            }
        });
    }
    $('button').click(function () {
        var val = $(this).attr('id')

        console.log(val)
        if (val != null) {
            console.log("yey")
            loadmap(val)
        }
    })
    let loadmap = function (type) {
        switch (type) {
            case 'gold-tab0':
                if (gold) { return }
                console.log("yey")

                loadData('gold', "Countries with most gold medals", ["gold"], "geographGold_div");
                gold = true;
                break;

            case 'silver-tab0':
                if (silver) { return }

                loadData('silver', "Countries with most silver medals", ["silver"], "geographSilver_div");
                silver = true;
                break;

            case 'bronze-tab0':
                if (bronze) { return }
                loadData('bronze', "Countries with most bronze medals", ["#b87333"], "geographBronze_div");
                bronze = true;
                break;

            default:
                if (all) { return }
                loadData('all', "Countries by most medal wons", [], "geographOverall_div");
                all = true;
        }
    }
    loadmap('all')
    function showLoading() {
        $('#myModal').modal('show', {
            backdrop: 'static',
            keyboard: false
        });
    }
    showLoading();
    function hideLoading() {
        $('#myModal').on('shown.bs.modal', function (e) {
            $("#myModal").modal('hide');
        })
    }
})
let all = false
let gold = false;
let silver = false;
let bronze = false;


$(document).ajaxComplete(function (event, xhr, options) {
    $("#myModal").modal('hide');
})