// ViewModel KnockOut
var vm = function () {
    console.log('ViewModel initiated...');
    //---Variáveis locais
    var self = this;
    self.baseUri = ko.observable('http://192.168.160.58/Olympics/');
    self.displayName = 'Olympic Games edition Details';
    self.error = ko.observable('');
    //--- Data Record
    self.Id = ko.observable('');
    self.CountryName = ko.observable('');
    self.bandeira = ko.observable('');
    self.CountryId = ko.observable(-1)
    self.City = ko.observable('')
    self.Logo = ko.observable('');
    self.Name = ko.observable('');
    self.Photo = ko.observable('');
    self.Season = ko.observable('');

    self.AthletesNumber = ko.observable(0);
    self.CountriesNumber = ko.observable(0);

    self.Year = ko.observableArray('');

    self.Modalities = ko.observableArray([]);
    self.Competitions = ko.observableArray([]);
    self.Medals = ko.observableArray([]);

    let = competitionByModality = {}

    self.compbymod = function (modalidade) {
        return competitionByModality[modalidade]
    }

    //--- Page Events
    self.activate = function (id) {
        console.log('CALL: getGame...');
        var composedUri = self.baseUri() + 'api/Games/FullDetails?id=' + id;
        pedidoAJAX(composedUri, 'GET').done(function (data) {
            data.Competitions.forEach(competition => {
                if (competitionByModality[competition.Modality] == undefined) {
                    competitionByModality[competition.Modality] = [{ 'compName': competition.Name, 'compId': competition.Id }];
                } else {
                    competitionByModality[competition.Modality].push({ 'compName': competition.Name, 'compId': competition.Id });
                }
            });
            self.Season(data.Season);
            self.Id(data.Id);
            self.CountryName(data.CountryName);
            self.Name(data.Name);
            self.City(data.City);
            self.Logo(data.Logo);
            self.Photo(data.Photo);
            self.Modalities(data.Modalities);
            self.Medals(data.Medals);
            self.Competitions(data.Competitions)
            self.AthletesNumber(data.Athletes.length)

            let Paises = self.baseUri() + 'api/Countries/SearchByName?q=' + self.CountryName()
            pedidoAJAX(Paises, 'GET').done(function (dados) {
                self.bandeira(dados[0].Flag)
                self.CountryId(dados[0].Id)
            });

        });

        // Get number of countries who joined 
        composedUri = self.baseUri() + 'api/Statistics/Games_Countries'
        pedidoAJAX(composedUri, 'GET').done(function (data) {
            self.CountriesNumber(data[id].Counter)
        });

        //Get data for Graph
        composedUri = self.baseUri() + 'api/Statistics/Medals_Country?id=' + id
        pedidoAJAX(composedUri, 'GET').done(function (data) {
            self.graphData = data
            let goldArray = [["Country",  "Gold"],]
            let silverArray = [["Country",  "Silver"],]
            let bronzeArray = [["Country",  "Bronze"],]
            data.forEach(country => {
                var gold = country.Medals[0].Counter;
                var silver = country.Medals[1].Counter;
                var bronze = country.Medals[2].Counter;
                goldArray.push([country.CountryName,  gold]);
                silverArray.push([country.CountryName,  silver]);
                bronzeArray.push([country.CountryName,  bronze]);
            })
            google.charts.load('current', {'packages':['corechart']});

            google.charts.setOnLoadCallback(drawChart);

            function drawChart() {
                console.log(goldArray)
                var goldDados = google.visualization.arrayToDataTable(goldArray);
                var silverDados = google.visualization.arrayToDataTable(silverArray);
                var bronzeDados = google.visualization.arrayToDataTable(bronzeArray);
                goldDados.sort([{column: 1}]);
                silverDados.sort([{column: 1}]);
                bronzeDados.sort([{column: 1}]);
                var goldoptions = {
                    title: "Distribution of Gold Medals By Country",
                    width: "100%",
                    height:300,
                    is3D: true,
                    pieStartAngle: 90

                };
                var silveroptions = {
                    title: "Distribution of Silver Medals By Country",
                    width: "100%",
                    height:300,
                    is3D:true,
                    pieStartAngle: 90
                };
                var bronzeoptions = {
                    title: "Distribution of bronze Medals By Country",
                    width: "100%",
                    height:300,
                    is3D:true,
                    pieStartAngle: 90,


                };

                var silverchart = new google.visualization.PieChart(document.getElementById('silverPie_div'));
                var goldchart = new google.visualization.PieChart(document.getElementById('goldPie_div'));
                var bronzechart = new google.visualization.PieChart(document.getElementById('bronzePie_div'));

                silverchart.draw(silverDados, silveroptions);
                goldchart.draw(goldDados, goldoptions);
                bronzechart.draw(bronzeDados, bronzeoptions);
            }
        });
        hideLoading();

    };

    //--- Internal functions
    function pedidoAJAX(uri, method, data) {
        self.error(''); // Clear error message
        return $.ajax({
            type: method,
            url: uri,
            dataType: 'json',
            contentType: 'application/json',
            data: data ? JSON.stringify(data) : null,
            error: function (jqXHR, textStatus, errorThrown) {
                console.log("AJAX Call[" + uri + "] Fail...");
                hideLoading();
                self.error(errorThrown);
            }
        });
    }
    function showLoading() {
        $('#myModal').modal('show', {
            backdrop: 'static',
            keyboard: false
        });
    }
    function hideLoading() {
        $('#myModal').on('shown.bs.modal', function (e) {
            $("#myModal").modal('hide');
        })
    }



    //--- start ....
    showLoading();
    var id = getUrlParameter('id');
    console.log(id);
    if (id == undefined)
        self.activate(1);
    else {
        self.activate(id);
    }
    console.log("VM initialized!");
};

$(document).ready(function () {
    console.log("document.ready!");
    ko.applyBindings(new vm());
});

$(document).ajaxComplete(function (event, xhr, options) {
    $("#myModal").modal('hide');
})

function getUrlParameter(sParam) {
    var sPageURL = window.location.search.substring(1),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
        }
    }
};