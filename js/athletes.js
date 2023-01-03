let vm = function athletesTableViewModel() {
    let self = this;

    self.baseUri = ko.observable('http://192.168.160.58/Olympics/api');

    self.records = ko.observableArray([]); 

    self.error = ko.observable('');
    self.currentPage = ko.observable(1);
    self.pageSize = ko.observable(20);
    self.totalPages = ko.observable(1)
    self.totalRecords = ko.observable(1);
    self.hasPrevious = ko.observable(false);
    self.hasNext = ko.observable(false);
    self.searchParams= ko.observable("");
    self.filter = ko.observable("")
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

        Favoritos = self.favourites.Athletes;

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


    self.previousPage = ko.computed(function(){
        return parseInt(self.currentPage()) - 1 ;
    }, self);

    self.nextPage = ko.computed(function(){
        return parseInt(self.currentPage()) + 1 ;
    }, self);


    self.fromRecord = ko.computed(function () {
        return self.previousPage() * self.pageSize() + 1;
    }, self);

    self.toRecord = ko.computed(function () {
        return Math.min(self.currentPage() * self.pageSize(), self.totalRecords());
    }, self);
    
    self.totalPages = ko.observable(1);
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


    
    function startLoading(page){
        showLoading();
        if (self.filter() != "") {
            composedUri = self.baseUri()+ "/Athletes?page=" + page + "&pagesize=" + self.pageSize() + "&sortby=" + self.filter();
            $("#clearFilters").removeClass("d-none")
        } else if (self.searchParams() == "") {
            composedUri = self.baseUri() + "/Athletes?page="+ page + "&pageSize=" + self.pageSize();
        } else {
            composedUri = self.baseUri() + "/Athletes/SearchByName?q=" + self.searchParams();
        }
        console.log(composedUri)

        pedidoAJAX(composedUri, 'GET').done(function (data) {
            console.log(data);

            if ( self.searchParams() == "" || self.filter() != ""){
                self.records(data.Records);
                self.currentPage(data.CurrentPage);
                self.hasNext(data.HasNext);
                self.hasPrevious(data.HasPrevious);
                self.pageSize(data.PageSize)
                self.totalPages(data.TotalPages);
                self.totalRecords(data.TotalRecords);
            } else {
                self.currentPage(page);
                self.records(data.slice(20*(self.currentPage()-1), 20*(self.currentPage()) ));
                self.totalRecords(data.length);
                self.totalPages(parseInt(data.length/20 + 1));
            };
            self.loadFavourites();
            $('a.page-link').click(function(){
                var gotoPage = $(this).attr('goto');
                if (gotoPage==undefined){
                    return
                } 
                var attr = ""
                if (self.filter() != ""){
                    attr = "&filter=" + self.filter();
                } else if (self.searchParams() != "") {
                    attr = "&search=" +  self.searchParams();
                };
                var newURL = '//' + location.host + location.pathname + "?page=" + gotoPage + attr;
                window.location.href = newURL
            })

            hideLoading();
        });
    }

    $("#search").click(function(){
        namePart = $("#searchArgs").val().replace(/ /g, "+");
        newURL = '//' + location.host + location.pathname + '?page=1&search=' + namePart
        window.location.href = newURL
    })

    $("a[role='button']").click(function(){
        filter = $(this).attr('val')
        console.log(filter)
        newURL = '//' + location.host + location.pathname + '?page=1&filter=' + filter
        window.location.href = newURL
    })
    
    // inicializar pedido
    let pg = getUrlParameter('page');
    let srch = getUrlParameter('search');
    let filter = getUrlParameter('filter');


    if (srch != undefined){self.searchParams(srch)}
    if (filter!=undefined){self.filter(filter)}
    
    if (pg == undefined){
        startLoading(page = 1);
    } else {
        startLoading(page = pg)
    }


}

$(document).ready(function(){
    console.log("ready!");
    ko.applyBindings(new vm);
    self.hideLoading();
});

// funcoes gerais
function getUrlParameter(sParam) {
    console.log(window.location.search.substring(1))
    var sPageURL = window.location.search.substring(1),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;
    console.log("sPageURL=", sPageURL);
    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            console.log(sParameterName[1])
            return sParameterName[1] === undefined ? false : decodeURIComponent(sParameterName[1]);
        }
    }
};
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