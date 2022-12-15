//TODO Mudar esta merda toda para aparecer fullDetails (shitEmplementation)

let vm = function athletesTableViewModel() {
    let self = this;

    self.baseUri = ko.observable('http://192.168.160.58/Olympics/');
    self.name = ko.observable("Name");
    self.sex = ko.observable("Sex");
    self.records = ko.observableArray([]);

    self.method="GET"
    self.error = ko.observable('');
    self.currentPage = ko.observable(1);
    self.pageSize = ko.observable(20);
    self.totalPages = ko.observable(10)
    self.totalRecords = ko.observable(50);
    self.hasPrevious = ko.observable(false);
    self.hasNext = ko.observable(false);

    self.previousPage = ko.computed(function(){
        return parseInt(self.currentPage()) - 1 ;
    }, self);

    self.nextPage = ko.computed(function(){
        return parseInt(self.currentPage()) + 1 ;
    }, self);
    
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

    self.fromRecord = ko.computed(function () {
        return self.previousPage() * self.pageSize() + 1;
    }, self);

    self.toRecord = ko.computed(function () {
        return Math.min(self.currentPage() * self.pageSize(), self.totalRecords());
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

        let composedUri = self.baseUri() + "api/Athletes?page="+ page + "&pageSize=" + self.pageSize();

        pedidoAJAX(composedUri, 'GET').done(function (data) {
            console.log(data);
            
            self.records(data.Records);
            self.currentPage(data.CurrentPage);
            self.hasNext(data.HasNext);
            self.hasPrevious(data.HasPrevious);
            self.pageSize(data.PageSize)
            self.totalPages(data.TotalPages);
            self.totalRecords(data.TotalRecords);

            //self.SetFavourites();
            hideLoading();
        });
        hideLoading();    
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
    }

    // inicializar pedido
    var pg = getUrlParameter('page');
    if (pg == undefined)
        startLoading(1);
    else {
        startLoading(pg);
    }
};




$(document).ready(function(){
    console.log("ready!");
    ko.applyBindings(new vm);

});