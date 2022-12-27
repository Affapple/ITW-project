let vm = function viewModel() {
    let self = this;

    self.baseUri = ko.observable('http://192.168.160.58/Olympics/');
    self.Name = ko.observable('');
    self.Sex = ko.observable('');
    self.Weight = ko.observable('');
    self.Height = ko.observable('');
    self.Photo = ko.observable('');
    self.Link = ko.observable('');
    self.BornDate = ko.observable('');
    self.BornPlace = ko.observable('');
    self.DiedDate = ko.observable('');
    self.OlympLink = ko.observable('')
    self.atleta = ko.observableArray([]);
    self.Medals = ko.observableArray([]);
    self.bronzeMedals = ko.observable(0);
    self.silverMedals = ko.observable(0);
    self.goldMedals = ko.observable(0);
    self.flag = ko.observable('')
    self.flagName = ko.observable('')

    self.Id = getUrlParameter("id");
    self.error = ko.observable("")

    function pedidoAJAX(uri, method, data) {
        self.error("")

        return $.ajax({
            type: method,
            url: uri,
            dataType: "json",
            data: data ? JSON.stringify(data) : null,

            error: function (jqXHR, textStatus, errorThrown) {
                console.log("AJAX Call[" + uri + "] Fail...");
                hideLoading();
                self.error(errorThrown);
            },
        })
    };

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

    function loadPage() {
        let composedUri = self.baseUri() + "api/Athletes/FullDetails?id=" + self.Id

        pedidoAJAX(composedUri, "GET").done(function (data) {
            self.atleta(data);
            self.Name(data.Name);
            self.Sex(data.Sex);
            self.Photo(data.Photo);
            self.Weight(data.Weight);
            self.Height(data.Height);
            self.OlympLink(data.OlympediaLink);

            self.BornDate(String(data.BornDate).substring(0, 10));

            self.BornPlace(String(data.BornPlace).match(/\(([^)]+)\)/)[0])
            let Paises = self.baseUri() + 'api/Countries/SearchByName?q=' + String(self.BornPlace()).substring(1,2)
            console.log(Paises)
            pedidoAJAX(Paises, 'GET').done(function (dados) {
                dados.forEach(pais => {
                    console.log(pais.IOC)
                    if (pais.IOC == self.BornPlace()) {
                        self.flag(pais.Flag);
                        self.flagName(pais.Name);
                        return true;
                    };
                });
            });
            self.DiedDate(String(data.DiedDate).substring(0, 10));

            self.Medals(data.Medals)
            self.Medals().forEach(medal => {
                if (medal.MedalName == "Gold") { self.goldMedals(medal.Counter) };
                if (medal.MedalName == "Silver") { self.silverMedals(medal.Counter) };
                if (medal.MedalName == "Bronze") { self.bronzeMedals(medal.Counter) };
            });
        });


    };

    loadPage();

};

$(document).ready(function () {
    ko.applyBindings(vm);
});