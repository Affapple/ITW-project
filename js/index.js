// ViewModel KnockOut
var vm = function () {
    console.log('ViewModel initiated...');
    //---Variáveis locais
    var self = this;
    self.baseUri = ko.observable('http://192.168.160.58/Olympics/');

    self.error = ko.observable('');

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

    self.complete = function (nick) {
        var composedUri = self.baseUri() + "api/Utils/Search?q=" + nick;
        ajaxHelper(composedUri, 'GET').done(function (data) {
            var dataComplete = data.slice(0, 5);
            var arrayData = []
            dataComplete.forEach(item => {
                arrayData.push(item["Name"]);
            });
            $("#searchbar").autocomplete({
                minLength: 3,
                source: arrayData,
            });
        console.log(dataComplete);
        });
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

    $('#searchbar').keyup(function () {
        // var mika = $('#searchbar').val();
        // console.log(mika)

        // if (mika.length>=3){
        //     self.complete(mika);
        // }
    });

};

$(document).ready(function () {
    console.log("ready!");
    ko.applyBindings(new vm());
});

$(document).ajaxComplete(function (event, xhr, options) {
    $("#myModal").modal('hide');
})


