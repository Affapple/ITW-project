let vm = function viewModel(){
    let self = this;

    self.baseUri = ko.observable('http://192.168.160.58/Olympics/');
    self.name = ko.observable("Name");
    self.sex = ko.observable("Sex");
    self.id = getUrlParameter("id")


    self.method="GET"
    self.error = ko.observable('');

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
        let composedUri = self.baseUri + "api/Athletes/FullDetails?id=" + self.id
        pedidoAJAX(composedUri, "GET").done(function(){
            self.name = data.Name;
            self.sex = data.Sex;
            self.height = data.Height;
            self.weight = data.Weight;
            self.bornDate = data.BornDate
            self.bornPlace = data.BornPlace
            self.diedDate = data.BornDate
            self.DiedPlace = data.BornPlace
            self.Photo = data.Photo;
            self.link = data.OlympediaLink
        })
    };
};

$(document).ready(function(){
    ko.applyBindings(vm);
});