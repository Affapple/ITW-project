var vm = function() {
    console.log('ViewModel initiated...');
    //---Variáveis locais
    var self = this;
    self.baseUri = ko.observable('http://192.168.160.58/Olympics/api/Countries/');
    self.displayName = 'Country Details';
    self.error = ko.observable('');
    self.passingMessage = ko.observable('');
    //--- Data Record
    self.Id = ko.observable('');
    self.Name = ko.observable('');
    self.Ioc = ko.observable('');
    self.Flag = ko.observable('');
    self.Events = ko.observableArray('');
    self.Participant = ko.observableArray('');

    //--- Page Events
    self.activate = function(id) {
        console.log('CALL: getCountry...');
        var composedUri = self.baseUri() + id;
        ajaxHelper(composedUri, 'GET').done(function(data) {
            console.log(data);
            self.Id(data.Id);
            self.Name(data.Name);
            self.Flag(data.Flag)
            self.Ioc(data.IOC);
            self.Events(data.Events);
            self.Participant(data.Participant)
            hideLoading();
        });
    };
    //--- Internal functions
    function ajaxHelper(uri, method, data) {
        self.error('');
        return $.ajax({
            type: method,
            url: uri,
            dataType: 'json',
            contentType: 'application/json',
            data: data ? JSON.stringify(data) : null,
            error: function(jqXHR, textStatus, errorThrown) {
                console.log("AJAX Call[" + uri + "] Fail...");
                hideLoading();
                self.error(errorThrown);
            }
        });

    }



    function getUrlParameter(sParam) {
        var sPageURL = window.location.search.substring(1),
            sURLVariables = sPageURL.split('&'),
            sParameterName,
            i;

        for (i = 0; i < sURLVariables.length; i++) {
            sParameterName = sURLVariables[i].split('=');

            if (sParameterName[0] === sParam) {
                return sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
            }
        }
    };

    ko.bindingHandlers.jScrollPane = {
        init: function(element, valueAccessor) {
            var o = valueAccessor() || {};

            // initialize
            $(element).jScrollPane(o.options);

            var reinit = function() {
                var scroll = $(element).data("jsp");
                if (scroll) {
                    scroll.reinitialise();
                }
            };

            $(window).resize(reinit);

            if (o.subscribe) {
                o.subscribe.subscribe(function() {
                    setTimeout(reinit, 0);
                });
            }
        }
    };

 

    //--- start ....
    showLoading();
    var id = getUrlParameter('id');
    console.log(id);
    if (id == undefined)
        self.activate(1);
    else {
        self.activate(id);
    }

       //Get data for Graph
       composedUri = "http://192.168.160.58/Olympics/api/Statistics/Medals_Games?id=" + id
       ajaxHelper(composedUri, 'GET').done(function (data) {
           self.graphData = data
           let array = [["Game Name", "Gold", "Silver", "Bronze"],]
           data.forEach(game => {
               var gold = game.Medals[0].Counter;
               var silver = game.Medals[1].Counter;
               var bronze = game.Medals[2].Counter;
               array.push([game.GameName, gold, silver, bronze]);
           })
           google.charts.load('current', {
               'packages': ['corechart']
           });
   
           google.charts.setOnLoadCallback(drawChart);
   
           function drawChart() {
               console.log(array)
               var dados = google.visualization.arrayToDataTable(array);
   
               var options = {
                   title: "Medals Won by" + self.Name(),
                   bar: {groupWidth: "95%"},
                   width: "100%",
                   height: 400,
                   colors : ['gold','silver', '#b87333'],
                   isStacked: true,
               };
   
               var chart = new google.visualization.BarChart(document.getElementById('medals_div'));
   
               chart.draw(dados, options);
           }
       });
};
function showLoading() {
    $('#myModal').modal('show', {
        backdrop: 'static',
        keyboard: false
    });
}

function hideLoading() {
    $('#myModal').on('shown.bs.modal', function(e) {
        $("#myModal").modal('hide');
    })
}

$(document).ready(function() {
    console.log("ready!");
    ko.applyBindings(new vm());
});
$(document).ajaxComplete(function(){
    hideLoading();
})