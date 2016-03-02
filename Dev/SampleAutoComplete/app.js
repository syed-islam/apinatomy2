

var graphEditor = function () {
    var result = null;

    $(function() {

        $( "#name" ).autocomplete({
            source: function( request, response ) {
                $.ajax({
                    url: "http://open-physiology.org:5052/autocomplete-case-insensitive/" + request.term,
                    dataType: "jsonp",
                    data: {
                        q: request.term
                    },
                    success: function( data ) {
                        console.log(data);
                        result = data;
                        response( data.Results);
                    }
                });
            },
            minLength: 1,
            select: function( event, ui ) {
                console.log(ui.item.value);
                console.log(result.IRIs[findPositionInArray(result.Results, ui.item.value)][0].iri);
                $('#ontid').val(extractID(result.IRIs[findPositionInArray(result.Results, ui.item.value)][0].iri));




            },
            open: function() {
                $( this ).removeClass( "ui-corner-all" ).addClass( "ui-corner-top" );
            },
            close: function() {
                $( this ).removeClass( "ui-corner-top" ).addClass( "ui-corner-all" );
            }
        });
    });


    findPositionInArray = function findPositionInArray(array, item){
        for (i =0; i < array.length; i++){
            if (array[i] == item){
                return i;
            }
        }

    }

    extractID = function extractID(url){
        if (url.indexOf("fma#") > 0)
            delimeterPos = url.indexOf("fma#") + 4;
        else if (url.indexOf("gene_ontology#") > 0)
            delimeterPos = url.indexOf("gene_ontology") + "gene_ontology#".length;
        else
            delimeterPos = url.lastIndexOf("/") +1 ;
        console.log(url.substring(delimeterPos))
        return url.substring(delimeterPos)
    }

}();









