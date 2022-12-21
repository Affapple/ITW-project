let vm = function viewModel(){
    let self = this;

    self.baseUri = ko.observable('http://192.168.160.58/Olympics/');
    self.Name = ko.observable('');
    self.Sex = ko.observable('');
    self.Weight = ko.observable('');
    self.Height = ko.observable('');
    self.Photo = ko.observable('');
    self.Link = ko.observable('');
    self.BornDate = ko.observable('');
    self.DiedDate = ko.observable('');
    self.atleta = ko.observableArray([]);
    self.Medals = ko.observableArray([]);

    self.Id = getUrlParameter("id");
    self.error = ko.observable("")

    function pedidoAJAX(uri, method, data){
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
        console.log("sPageURL=", sPageURL);
        for (i = 0; i < sURLVariables.length; i++) {
            sParameterName = sURLVariables[i].split('=');

            if (sParameterName[0] === sParam) {
                return sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
            }
        }
    };

    function loadPage(){
        let composedUri = self.baseUri() + "api/Athletes/FullDetails?id=" + self.Id
        pedidoAJAX(composedUri, "GET").done(function(data){
            self.atleta(data);
            self.Name(data.Name);
            self.Sex(data.Sex);
            self.Photo(data.Photo);
            self.Weight(data.Weight);
            self.Height(data.Height);
            self.BornDate(data.BornDate);
            self.DiedDate(data.DiedDate);
            self.Medals(data.Medals)
            console.log(self.Medals())
        });
    };

    loadPage();
};

$(document).ready(function(){
    ko.applyBindings(vm);
});