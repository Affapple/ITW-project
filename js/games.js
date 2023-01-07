// ViewModel KnockOut
var vm = function () {
    console.log('ViewModel initiated...');
    //---Variáveis locais
    var self = this;
    self.baseUri = ko.observable('http://192.168.160.58/Olympics/api/games');
    self.displayName = 'Olympic Games Edition';
    self.error = ko.observable('');
    self.passingMessage = ko.observable('');
    self.records = ko.observableArray([]);
    self.currentPage = ko.observable(1);
    self.pagesize = ko.observable(20);
    self.totalRecords = ko.observable(51);
    self.hasPrevious = ko.observable(false);
    self.hasNext = ko.observable(false);

    self.edition = ko.computed(function(){
        var edicao = getUrlParameter('edition')
        if (edicao == undefined) {return "0";}
        if (String(window.location.href).includes("?")){
            $("#games-tab").click()
        }
        return edicao
    },self);

    self.favourites = {
        Athletes: [],
        Games: [],
        Modalities : [],
        Competitions : []
    }; 

    self.loadFavourites = function(){
        if (localStorage.getItem('favourites') != null){
            self.favourites = JSON.parse(localStorage.favourites)
        } else {
            localStorage.setItem('favourites', JSON.stringify(self.favourites));
        };

        Favoritos = self.favourites.Games;

        Favoritos.forEach(id => {
            $("#favourite_"+id).css('color','red');
        });
    }

    self.updateFavourites = function(id){
        let index = Favoritos.indexOf(String(id))
        if(index !== -1){
            $("#favourite_"+id).css('color', '#333')
            Favoritos.splice(index, 1)
        } else if(index == -1){
            $("#favourite_"+id).css('color', 'red')
            Favoritos.push(String(id))
        };
        console.log(Favoritos)
        console.log(self.favourites);
        window.localStorage.setItem('favourites', JSON.stringify(self.favourites))
    }



    self.previousPage = ko.computed(function () {
        return self.currentPage() * 1 - 1;
    }, self);

    self.nextPage = ko.computed(function () {
        return self.currentPage() * 1 + 1;
    }, self);

    self.fromRecord = ko.computed(function () {
        return self.previousPage() * self.pagesize() + 1;
    }, self);

    self.toRecord = ko.computed(function () {
        return Math.min(self.currentPage() * self.pagesize(), self.totalRecords());
    }, self);
    
    self.totalPages = ko.observable(0);
    self.pageArray = function () {
        var list = [];
        var size = Math.min(self.totalPages(), 9);
        var step;
        if (size < 9 || self.currentPage() === 1)
            step = 0;
        else if (self.currentPage() >= self.totalPages() - 4)
            step = self.totalPages() - 9;
        else
            step = Math.max(self.currentPage() - 5, 0);

        for (var i = 1; i <= size; i++)
            list.push(i + step);
        return list;
    };

    self.loadMap = function(data){
        var map = L.map('map', { zoomSnap: 0.5 }).setView([0.0, 0.0], 1);
        // Set up the OSM layer
        L.tileLayer(
            'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: 'Data © <a href="http://osm.org/copyright">OpenStreetMap</a>',
            maxZoom: 18,
            minZoom: 2,
        }).addTo(map);
        var myIcon = new L.Icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
        });

        console.log(data)
        data.forEach(game => {
            L.marker([game.Lat, game.Lon], { icon: myIcon })
            .bindPopup("<a class='text-decoration-none' href='" + "/gameDetails.html?id=" + game.Id + "'>"+game.Name+"</a><br><b>"+ game.CityName + "," + game.CountryName+  "</b>")
            .addTo(map);
           
        });
    }

    //--- Page Events
    self.activate = function (id) {
        console.log('CALL: getGames...');
        switch (self.edition()){
            case '1':
                var composedUri = self.baseUri() + "?season=" + self.edition() + "&page=" + id + "&pageSize=" + self.pagesize();
                $("#filter").text("Summer")
                $("#clearFilters").removeClass("d-none")
                break;
            case '2':
                var composedUri = self.baseUri() + "?season=" + self.edition() + "&page=" + id + "&pageSize=" + self.pagesize();
                 $("#filter").text("Winter")
                 $("#clearFilters").removeClass("d-none")
                break;
            default:
                var composedUri = self.baseUri() + "?page=" + id + "&pageSize=" + self.pagesize();
        }
        
        

        ajaxHelper(self.baseUri() + "?page=" + 1 + "&pageSize=" + 51, 'GET').done(function(data){
            self.loadMap(data.Records);
        })
        ajaxHelper(composedUri, 'GET').done(function (data) {
            console.log(data);
            hideLoading();
            self.records(data.Records);
            self.currentPage(data.CurrentPage);
            self.hasNext(data.HasNext);
            self.hasPrevious(data.HasPrevious);
            self.pagesize(data.PageSize)
            self.totalPages(data.TotalPages);
            self.totalRecords(data.TotalRecords);
            self.loadFavourites();
        });
    };

    $("#searchArgs").autocomplete({ 
        minLength: 1,
        source: function(request, response) {
            $.ajax({
                type: "GET",
                url : "http://192.168.160.58/Olympics/api/Games/SearchByName",
                data: { 
                    q: $('#searchArgs').val().toLowerCase()
                },
                success: function(data) {
                    if (!data.length) {
                        var result = [{
                            label: 'No results found.',
                            value: response.term,
                            source: " "
                        }];
                        response(result);
                    } else {
                        var nData = $.map(data, function(value, key){
                            return {
                                label: value.Name,
                                value: value.Id,
                                source: "SearchByName"
                            }
                        });
                        results = $.ui.autocomplete.filter(nData, request.term);
                        response(results);
                    }
                },
                error: function(){
                    alert("error");
                }
            }) 
        },
        select: function(event, ui) {
           window.location.href = "./AthletesDetails.html?id=" + ui.item.value;
        },
    });
    

    $("a[role='button']").click(function(){
        filter = $(this).attr('val')
        newURL = '//' + location.host + location.pathname + '?page=1&edition=' + filter
        window.location.href = newURL
    })
    //--- Internal functions
    function ajaxHelper(uri, method, data) {
        self.error(''); // Clear error message
        return $.ajax({
            type: method,
            url: uri,
            dataType: 'json',
            async:false,
            contentType: 'application/json',
            data: data ? JSON.stringify(data) : null,
            error: function (jqXHR, textStatus, errorThrown) {
                console.log("AJAX Call[" + uri + "] Fail...");
                hideLoading();
                self.error(errorThrown);
            }
        });
    }

    function sleep(milliseconds) {
        const start = Date.now();
        while (Date.now() - start < milliseconds); 
    }

    function showLoading() {
        $("#myModal").modal('show', {
            backdrop: 'static',
            keyboard: false
        });
    }
    function hideLoading() {
        $('#myModal').on('shown.bs.modal', function (e) {
            $("#myModal").modal('hide');
        })
    }

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

    //--- start ....
    showLoading();
    var pg = getUrlParameter('page');
    if (pg == undefined)
        self.activate(1);
    else {
        self.activate(pg);
    }
    console.log("VM initialized!");


};

$(document).ready(function () {
    console.log("ready!");
    ko.applyBindings(new vm());
});

$(document).ajaxComplete(function (event, xhr, options) {
    $("#myModal").modal('hide');
})

