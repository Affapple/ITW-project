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

        let composedUri = self.baseUri() + "api/Athletes?page="+ page + "&pagesize=" + self.pageSize();

        pedidoAJAX(composedUri, 'GET').done(function (data) {
            console.log(data);
            
            self.records(data.Records);
            self.currentPage(data.CurrentPage);
            self.hasNext(data.HasNext);
            self.hasPrevious(data.HasPrevious);
            self.pagesize(data.PageSize)
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
