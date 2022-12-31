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
    self.bandeira=ko.observable('');
    self.CountryId = ko.observable(-1)
    self.City = ko.observable('')
    self.Logo = ko.observable('');
    self.Name = ko.observable('');
    self.Photo = ko.observable('');
    self.Season = ko.observable('');
    self.Year = ko.observableArray('');

    self.Modalities = ko.observableArray([]);
    self.Competitions = ko.observableArray([]);
    self.Medals = ko.observableArray([]);

    let = competitionByModality = {}

    self.compbymod = function(modalidade){
        return competitionByModality[modalidade]
    }

    //--- Page Events
    self.activate = function (id) {
        console.log('CALL: getGame...');
        var composedUri = self.baseUri() + 'api/Games/FullDetails?id=' + id;
        pedidoAJAX(composedUri, 'GET').done(function (data) {
            data.Competitions.forEach(competition => {

                if (competitionByModality[competition.Modality] == undefined){
                    competitionByModality[competition.Modality]= [{'compName':competition.Name, 'modId': competition.Id}];
                } else {
                    competitionByModality[competition.Modality].push({'compName':competition.Name, 'modId': competition.Id});
                }
            });
            self.Id(data.Id);
            self.CountryName(data.CountryName);
            self.Name(data.Name);
            self.City(data.City);
            self.Logo(data.Logo);
            self.Photo(data.Photo);
            self.Modalities(data.Modalities);
            self.Medals(data.Medals);
            self.Competitions(data.Competitions)
            let Paises= self.baseUri() + 'api/Countries/SearchByName?q=' + self.CountryName()
            console.log(Paises)
            pedidoAJAX(Paises, 'GET').done(function (dados) {
                self.bandeira(dados[0].Flag)
                self.CountryId(dados[0].Id)
            });

            
        });
        hideLoading()
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