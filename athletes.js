let vm = function athletesTableViewModel() {
    let self = this;

    self.baseUri = ko.observable('http://192.168.160.58/Olympics/api/athletes/FullDetails?id=');
    self.name = ko.observable("Name");
    self.sex = ko.observable("Sex");
    self.Height = ko.observable("Height");
    self.Weight = ko.observable("Weight");
    self.records = ko.observableArray([]);
    self.currentPage = ko.observable(1);
    self.pagesize = ko.observable(20);
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

    function pedidoAJAX(uri, method){
        self.error("idk tf im doing tbh")
        return $.ajax({
            type: method,
            url: uri,
            dataType: "json",
            data: JSON.stringify(data),
            
            beforeSend: function(){console.log(method, " ", uri, "...")},
            
            error: function (jqXHR, textStatus, errorThrown) {
                console.log("AJAX Call[" + uri + "] Fail...");
                self.error(errorThrown);
            
            },
            success: function (){
                console.log("AJAX CAll", method, uri,"\nSuccess")
            }
        })
    };

    function startLoading(){
        showLoading();
        id = 0
        do {
            data = pedidoAJAX(self.baseUri + (id++))
        } while(data.length > 0);
        hideLoading();
    };

    // inicializar pedido
    startLoading()
};




$(document).ready(function(){
    ko.applyBindigs(new vm);

});
