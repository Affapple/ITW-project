// ViewModel KnockOut
let api_url
let searchSelected
const tooltips = document.querySelectorAll('.tt')
tooltips.forEach(t => {
    new bootstrap.Tooltip(t)
});

var vm = function () {
    console.log('ViewModel initiated...');
    //---Variáveis locais
    var self = this;
    self.search = '';
    self.baseUri = ko.observable('http://192.168.160.58/Olympics/api/Competitions/');
    self.displayName = 'Competitions List';
    self.error = ko.observable('');
    self.passingMessage = ko.observable('');
    self.records = ko.observableArray([]);
    self.currentPage = ko.observable(1);
    self.pagesize = ko.observable(20);
    self.totalRecords = ko.observable(50);
    self.hasPrevious = ko.observable(false);
    self.hasNext = ko.observable(false);
    self.filter = 'null';

    self.favourites = {
        Athletes: [],
        Games: [],
        Modalities : [],
        Competitions : [],
        Countries : []
    }; 

    self.loadFavourites = function(){
        if (localStorage.getItem('favourites') != null){
            self.favourites = JSON.parse(localStorage.favourites)
        } else {
            localStorage.setItem('favourites', JSON.stringify(self.favourites));
        };

        Favoritos = self.favourites.Competitions;

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

    //--- Page Events
    self.activate = function (id) {
        console.log('CALL: getGames...');
        var composedUri = self.baseUri() + "?page=" + id + "&pageSize=" + self.pagesize();
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
        composedUri2 = self.baseUri();
        ajaxHelper(composedUri2, 'GET').done(function(data) {
            hideLoading();
            var tags = [];
            for (var x = 0; x < data.Total; x++) {
                var c = data.List[x];
                tags.push(c.Name);
            };
            console.log(tags)
            $("#searchbar").autocomplete({
                minLength: 3,
                source: tags
            });
        });
    };
    

    //--- Internal functions
    function ajaxHelper(uri, method, data) {
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

    search = function () {
        console.log("search");
        self.search = $("#searchArgs").val()
        var api = 'http://192.168.160.58/Olympics/api/Competitions/SearchByName?q=' + $("#searchArgs").val();
        self.countrieslist = [];
        ajaxHelper(api,'GET').done(function(data){
            console.log(data);
            showLoading();
            self.records(data);
            $('#pagination').addClass("d-none");
            $('#line').addClass("d-none");
            self.totalRecords(data.length);
            hideLoading();
            for (var info in data) {
                self.countrieslist.push(data[info]);
            }
        });
    }

    $("#searchArgs").autocomplete({ 
        minLength: 2,
        source: function(request, response) {
            $.ajax({
                type: "GET",
                url : "http://192.168.160.58/Olympics/api/Competitions/SearchByName",
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
           window.location.href = "./competitionsDetails.html?id=" + ui.item.value;
        },
    });

    $(".countryFilter").change(function() {

        p = $(".countryFilter" +" option:selected").val();
        self.filter = p;
        if (p != 'null') {
            showLoading();
            var url = '';
            if (self.search != '' ) {
                url = 'http://192.168.160.58/Olympics/api/Competitions/SearchByName?q=' + self.search;
            } else {
                url = self.baseUri();
            }
            ajaxHelper(url, 'GET').done(function(data) {
                console.log("if null \n", data)
                var auto = [];
                if (self.search != '') {
                    console.log(data.Records.length)

                    for (var a = 0; a < data.Records.length; a++) {
                        var v = data.Records[a];
                        if (v.Modality == p) {
                            auto.push(v);
                        }
                    }
                } else {
                    for (var a = 0; a < data.Records.length; a++) {
                        var v = data.Records[a];
                        if (v.Modality == p) {
                            auto.push(v);
                        }
                    }
                }
                console.log(auto)
                self.records(auto);
                self.totalRecords(auto.length);
                $("#pagination").addClass("d-none");
                $("#line").addClass("d-none");
                $('#mapa').addClass("d-none")
            })
            hideLoading();
        } else {
            showLoading();
            var url = '';
            if (self.search != '') {
                url = 'http://192.168.160.58/Olympics/api/Competitions/SearchByName?q=' + self.search;
            } else {
                url = self.baseUri();
            }
            ajaxHelper(url, 'GET').done(function(data) {
                var auto = [];
                if (self.search != '') {
                    for (var a = 0; a < data.Records.length; a++) {
                        var v = data.Records[a];
                        auto.push(v);
                    }
                } else {
                    console.log(data)
                    for (var a = 0; a < data.Records.length; a++) {
                        var v = data.Records[a];
                        auto.push(v);
                    }
                }
                self.records(auto);
                self.totalRecords(auto.length);
                $("#pagination").addClass("d-none");
                $("#line").addClass("d-none");
                $('#mapa').addClass("d-none")
            })
            hideLoading();
        }

    });


    //--- start ....
    showLoading();
    var pg = getUrlParameter('page');
    console.log(pg);
    if (pg == undefined)
        self.activate(1);
    else {
        self.activate(pg);
    }
    console.log("VM initialized!");
};


    $(document).keypress(function(key) {
        if (key.which == 13) {
            search();
        }
    });


$(document).ready(function () {
    console.log("ready!");
    ko.applyBindings(new vm());
});

$(document).ajaxComplete(function (event, xhr, options) {
    $("#myModal").modal('hide');
})

