function FavouritesViewModel() {
    let self = this;
    self.error = ko.observable("");

    self.baseUri = ko.observable('http://192.168.160.58/Olympics/api');

    self.list = ['Athletes', 'Games', 'Modalities', 'Competitions'];

    self.Athletes = ko.observableArray([])
    self.Games = ko.observableArray([])
    self.Modalities = ko.observableArray([])
    self.Competitions = ko.observableArray([])

    self.favourites = {
        Athletes: [],
        Games: [],
        Modalities: [],
        Competitions: []
    };

    // loadFavourites
    if (localStorage.getItem('favourites') != null) {
        self.favourites = JSON.parse(localStorage.favourites)
    }
    var Favoritos = self.favourites;
    self.hasFavourites = ko.computed(function () {
        console.log(self.favourites)
        if (self.favourites == null) return false

        let i = 0;
        self.list.forEach(type => {

            if (self.favourites[type].length == 0) i++
        }); if (i == 4) return false
        return true
    });

    self.updateFavourites = function (id, type) {
        let index = Favoritos[type].indexOf(String(id))
        if (index !== -1) {
            $("#favourite_" + type + '_' + id).css('color', '#333')
            Favoritos[type].splice(index, 1)
        } else if (index == -1) {
            $("#favourite_" + type + '_' + id).css('color', 'red')
            Favoritos[type].push(String(id))
        };
        console.log(Favoritos[type])
        console.log(self.favourites);
        window.localStorage.setItem('favourites', JSON.stringify(self.favourites))
    };
    function pedidoAJAX(uri, method, data) {
        self.error("")
    
        return $.ajax({
            type: method,
            url: uri,
            dataType: "json",
            async:false,
            data: data ? JSON.stringify(data) : null,
    
            error: function (jqXHR, textStatus, errorThrown) {
                console.log("AJAX Call[" + uri + "] Fail...");
                self.error(errorThrown);
            },
        })
    };

    self.loadAthletes = function () {
        var atletas = new Array;

        Favoritos.Athletes.forEach(id => {
            var composedUri = self.baseUri() + "/Athletes/" + id
            pedidoAJAX(composedUri, 'GET').done(function (data) {
                atletas.push({
                    'Name': data.Name,
                    'Id': data.Id,
                    'Photo': data.Photo
                });
            })
        })
        
        return atletas;
    }
    self.loadGames = function () {
        var jogos = new Array;

        Favoritos.Games.forEach(id => {
            var composedUri = self.baseUri() + "/Games/" + id
            pedidoAJAX(composedUri, 'GET').done(function (data) {
                jogos.push({
                    'Name': data.Name,
                    'Id': data.Id,
                    'Logo': data.Logo
                });
            })
        })
        return jogos;
    }
    self.loadModalities = function () {
        var modalidades = new Array;

        Favoritos.Modalities.forEach(id => {
            var composedUri = self.baseUri() + "/Modalities/" + id
            pedidoAJAX(composedUri, 'GET').done(function (data) {
                modalidades.push({
                    'Name': data.Name,
                    'Id': data.Id,
                    'Photo': data.Photo,
                });
            })
        })
        return modalidades;
    }
    self.loadCompetitions = function () {
        var competicoes = new Array;
        Favoritos.Competitions.forEach(id => {
            var composedUri = self.baseUri() + "/Competitions/" + id
            pedidoAJAX(composedUri, 'GET').done(function (data) {
                competicoes.push({
                    'Name': data.Name,
                    'Id': data.Id,
                    'Photo': data.Photo,
                });
            })
        })
        return competicoes;
    }



    function startLoading() {

        if (self.hasFavourites()) {
            console.log(self.loadModalities())
            self.Athletes(self.loadAthletes());
            self.Games(self.loadGames());
            self.Modalities(self.loadModalities());
            self.Competitions(self.loadCompetitions());
        }

    }
    startLoading();
};


$(document).ready(function () {
    console.log("ready!");
    showLoading();
    let vm = new FavouritesViewModel()
    ko.applyBindings(vm)
    self.hideLoading();
});

// funcoes gerais
function showLoading() {
    $("#loadingModal").modal('show', {
        backdrop: 'static',
        keyboard: false
    });
};
function hideLoading() {
    $('#loadingModal').on('shown.bs.modal', function (e) {
        $("#loadingModal").modal('hide');
    })
};



