var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
            var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
                return new bootstrap.Tooltip(tooltipTriggerEl)
            })
    var self = this;
    self.baseUri = ko.observable('http://192.168.160.58/Olympics/');

    self.error = ko.observable('');

 $("#searchAll").parent().removeClass("col-lg-5")
 $("#searchAll").parent().addClass("col-md-4")
 $("#ui-id-1").css("z-index", "100")
 $(".fixed-top").css("z-index", "2")


    $("#searchAll").autocomplete({ 
        minLength: 4,
        source: function(request, response) {
            $.ajax({
                type: "GET",
                url : "http://192.168.160.58/Olympics/api/Utils/Search",
                data: { 
                    q: $('#searchAll').val().toLowerCase()
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
                                label: value.Name + " ( " + value.TableName + " )",
                                table : value.TableName,
                                value: value.Id,
                                source: "Search"
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
           window.location.href = "./" + ui.item.table.toLowerCase() + "Details.html?id=" + ui.item.value
        },
    });


