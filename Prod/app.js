// TODO: This part is the driver from the graph-construction.js

var refresh_graph;
var selectedAU = null;
var populateRectangleNames;

var graphEditor = function () {

    var lyphRepo = new LyphRepo([]);
    var graphViewerURL = "http://open-physiology.org:8810/dist/example/example.html";


    $('#userconsole').text("Hello, Welcome to ApiNATOMY 2.0");



    //The following setup is used to ignore all keyboard shortcuts being handled by the graph when the focus is on one of the user input boxes.
    var setupHandleForKeyboardShortcuts  = function setupHandleForKeyboardShortcuts(){
        function customfocus(element){
            $(element).focusin(function() {
                if (selectedGraph)
                    selectedGraph.keyboardShortcutEnabled = false;
            })
            $(element).focusout(function() {
                if (selectedGraph)
                    selectedGraph.keyboardShortcutEnabled = true;
            })

        }

        //populate the input elements to ignore
        customfocus('#edgeDescription');
        customfocus('#edgeType');
        customfocus('#edgeAnnotation');
        customfocus('#nodeName1');
        customfocus('#highlightAnnotation');
        customfocus('#startLyph');
        customfocus('#endLyph');
        customfocus('#rectangleID');
        customfocus('#edgeSpecies');
        customfocus('#provenance')
        customfocus('#graphName');
        customfocus('#lyphFMA');
        customfocus(('#lyphListBox'));
    }();




    //Init visual parameters
    var panelWidth = 300, panelHeight = 500;
    var width = 530;
    var height = 580;
    var auRepoVP = new VisualParameters("horizontal", 30, 5, panelWidth, panelHeight, 0);
    var graphRepoVP = new VisualParameters("horizontal", 5, 20, panelWidth, panelHeight, 0);



    //Creating the required svgs for the page
    var svg = d3.select('#app-body .graph')
        .append('svg:svg')
        .attr('width', width)
        .attr('height', height)
    //.attr("style", "outline: thin solid red;");


    var auRepoSvg = d3.select('#app-body .auRepo').append("svg")
        .attr("width", panelWidth)
        .attr("height", panelHeight);


    var graphRepoSvg = d3.select('#app-body .graphRepo').append("svg")
        .attr("width", panelWidth)
        .attr("height", panelHeight);


    //Tracking user interaction
    ////////////////////////////////////////////////
    var selectedGraph = null;
    var selectedGraphNode = null;
    var selectedAUNode = null;
    selectedAU = null;




    //Handling user interactions through call back functions
    var onSelectAU = function(d){
        //if (this != selectedAUNode){
            d3.select(this).style("stroke", "red");
        if (this != selectedAUNode)
            d3.select(selectedAUNode).style("stroke", "black");
            selectedAUNode = this;
            selectedAU = d;
            updateAUParameters(selectedAU);
        //}
    }

    var onSelectGraph = function(d){
        //if (this != selectedGraphNode){

            //selectedGraphNode = this;
            selectedGraph = d;

            selectedGraph.reloadGraphFromServer(syncSelectedGraph);

                //syncSelectedGraph();
        //}
    }


    var onSelectRectangle = function (d){
        updateRectangleParameter(d);
        $('#userconsole').text("Lyph " + d.lyphID + " selected")
    }


    function updateRectangleParameter(rectangle){

        (rectangle.lyphID) ? $('#rectangleID').val(rectangle.lyphID) : $('#rectangleID').val("");
        (rectangle.lyphName) ? $('#rectangleName').val(rectangle.lyphName) : $('#rectangleName').val("");
    }


    var onSelectNode = function(d){
        //if (selectedGraph.selected_node){
        //    //Update node parameters (tree parameters)
        //    //Display tree
        //    if (selectedGraph.selected_node.tree){
        //        var treeVP = new TreeVisualParameters(width - 2 * panelWidth, height,
        //            selectedGraph.selected_node.x - 150, selectedGraph.selected_node.y, 150, {x:-20, y:20});
        //        selectedGraph.selected_node.tree.draw(svg, treeVP);
        //    }
        //} else {
        //    svg.select("g.tree").remove();
        //}
        //d3.select("#graphID").property("value", "foul");
        //d3.select("#nodeName").property("value", "foul");
        //console.log("Node select callback", d);
        updateNodeParameter(d);
        $('#userconsole').text("Node " + d.id + " selected")
    }

    var onSelectLink = function(d){
        console.log(d);

        if (d instanceof Link){
            //Update link parameters
            updateEdgeParameters(d);
            selectedAU = d.au;
            updateAUParameters(selectedAU);
            $('#userconsole').text("Edge " + d.edgeid + " selected");
        }

        if (d instanceof Rectangle){
            console.log("Taking Parameter from Rectangle");

            if (d.lyph && d.lyph.template)
                updateAUParameters(d.lyph.template);
            else
                updateAUParameters(null);
            updateRectangleParameters(d);
        }
    }


    function updateRectangleParameters(rect){
        console.log(rect);

        rect.lyph && rect.lyph.id != null ? d3.select("#edgeID").property("value", rect.lyph.id) : d3.select("#edgeID").property("value", "")
        rect.lyph && rect.lyph.name != null ? d3.select("#edgeDescription").property("value", rect.lyph.name) : d3.select("#edgeDescription").property("value", "");
        rect.lyph && rect.lyph.type != null ? d3.select("#edgeType").property("value", rect.lyph.type) : d3.select("#edgeType").property("value", "1")
        rect.lyph && rect.lyph.species!= null ? d3.select("#edgeSpecies").property("value", rect.lyph.species) : d3.select("#edgeSpecies").property("value", "Human");
        rect.lyph && rect.location != null ? d3.select("#lyphLocation").property("value", lyphRepo.lyphs[lyphRepo.getIndexByID(rect.location)].name) : d3.select("#lyphLocation").property("value", "");
        rect.lyph && rect.lyph.fma != null ? d3.select("#lyphFMA").property("value", rect.lyph.fma) : d3.select("#lyphFMA").property("value", "");
        d3.select("#edgeAnnotation").property("value", "");
        d3.select("#provenance").property("value", "");
        $('#thelist').empty();
        if(rect.lyph && rect.lyph.annots){
            console.log(rect.lyph.annots)
            for (var i = 0; i < rect.lyph.annots.length; i ++){
                console.log(rect.lyph.annots[i].obj );
                console.log(rect.lyph.annots[i].pubmed.id );
                $('#thelist').append('<option value='+  rect.lyph.annots[i].obj +"|"+ rect.lyph.annots[i].pubmed.id +'> ' + rect.lyph.annots[i].obj +" | "+ rect.lyph.annots[i].pubmed.id +   "</option");
            }
        }
    }

    function updateEdgeParameters(edge){
        console.log("Updating edge parameter:" , edge);

        edge.edgeid != null ? d3.select("#edgeID").property("value", edge.edgeid) : d3.select("#edgeID").property("value", "")
        edge.type != null ? d3.select("#edgeType").property("value", edge.type) : d3.select("#edgeType").property("value", "")
        edge.description != null ? d3.select("#edgeDescription").property("value", edge.description) : d3.select("#edgeDescription").property("value", "");
        //edge.annotations != null ? d3.select("#edgeAnnotation").property("value", edge.annotations) :d3.select("#edgeAnnotation").property("value", "");
        d3.select("#edgeAnnotation").property("value", "");
        d3.select("#provenance").property("value", "");
        edge.species != null ? d3.select("#edgeSpecies").property("value", edge.species) : d3.select("#edgeSpecies").property("value", "");
        $('#thelist').empty();
        if(edge.annotation){
            for (var i = 0; i < edge.annotations.length; i ++){
                //console.log(edge.annotations[i].annotation, edge.annotations[i].pubmedID.id);
                $('#thelist').append('<option value='+  edge.annotations[i].annotation +"|"+ edge.annotations[i].pubmedID.id +'> ' + edge.annotations[i].annotation +" | "+ edge.annotations[i].pubmedID.id  +   "</option");
            }
        }
    }




    function updateNodeParameter(node){

        if (node != null){
            //console.log(node);
            d3.select("#nodeName1").property("value", node.name);
        } else {
            d3.select("#nodeName1").property("value","");
        }
    }

    function updateGraphParameters(graph){
        if (graph != null){
            d3.select("#graphID").property("value", graph.id);
            d3.select("#graphName").property("value", graph.name);
        }
    }


    function updateAUParameters(au){
       if (au != null){
            d3.select("#auID").property("value", au.id);
            d3.select("#auName").property("value", au.name);
        } else {
            d3.select("#auID").property("value", "");
            d3.select("#auName").property("value", "");
        }
    }



    //////////////////////////////////////////////////////////
    //graphRepo.draw(graphRepoSvg, graphRepoVP, onSelectGraph);
    if (auRepo != null)
        auRepo.draw(auRepoSvg, auRepoVP, onSelectAU);

    //selectedGraph = graphRepo.graphs[0];
    //syncSelectedGraph();


    function updateGraphParameters(graph){
        if (graph != null){
            //console.log(graph);
            d3.select("#graphID").property("value", graph.id);
            d3.select("#graphName").property("value", graph.name? graph.name : "" );
        }
    }



    d3.select('#deleteLyph').on('click', function(){
        console.log("Delete lyph");
        //ajax request to delete lyph
        var URL =
            "http://open-physiology.org:"+serverPort+"/delete_lyphs/"+
            "?lyphs="+ encodeURIComponent($('#lyphListBox').data(lyphListBox.value)) ;
        console.log(URL);
        $.ajax
        ({
            url: URL,

            jsonp: "callback",

            dataType: "jsonp",


            success: function (response) {
                response;

                if (response.hasOwnProperty("Error")) {
                    console.log("Not able to delete lyph:" , response);
                    return;
                }

                for (var i =0; i < selectedGraph.rectangles.length; i++){
                    if (selectedGraph.rectangles[i].lyph && selectedGraph.rectangles[i].lyph.id === $('#lyphListBox').data(lyphListBox.value)){
                        selectedGraph.rectangles.splice(selectedGraph.getRectangleIndexByID($('#lyphListBox').data(lyphListBox.value)),1);
                    }
                }

                selectedGraph.draw(svg, onSelectNode, onSelectLink, onSelectRectangle, refresh_graph, syncSelectedGraph);
            }
        });


    })


    d3.select('#syncLyph').on("click", function(){

        if (!selectedGraph.selected_rectangle){
            alert("Please select box before attempting re-use" );
            return;
        }

        console.log("Syncing Lyph Data");

        var lyphToSyncData = lyphRepo.lyphs[lyphRepo.getIndexByID($('#lyphListBox').data(lyphListBox.value))];
        //console.log(lyphToSyncData);


        if (!lyphToSyncData ){
            alert("You need to select from the list of lyphs provided" );
            return;
        }


        console.log(selectedGraph.rectangles);
        for (var j = 0; j < selectedGraph.rectangles.length; j++){
            if (selectedGraph.rectangles[j].lyph  && lyphToSyncData.id === selectedGraph.rectangles[j].lyph.id){
                alert("The Lyph:"  + lyphToSyncData.name + " already exists in this view!");
                return;
            }
        }


        lyphToSyncData.id != null ? d3.select("#edgeID").property("value", lyphToSyncData.id) : d3.select("#edgeID").property("value", "")
        lyphToSyncData.name != null ? d3.select("#edgeDescription").property("value", lyphToSyncData.name) : d3.select("#edgeDescription").property("value", "");
        lyphToSyncData.type != null ? d3.select("#edgeType").property("value", lyphToSyncData.type) : d3.select("#edgeType").property("value", "")
        lyphToSyncData.species!= null ? d3.select("#edgeSpecies").property("value", lyphToSyncData.species) : d3.select("#edgeSpecies").property("value", "");
        lyphToSyncData.from.location != null ? d3.select("#lyphLocation").property("value", lyphToSyncData.from.location) : d3.select("#lyphLocation").property("value", "");
        lyphToSyncData.fma != null ? d3.select("#lyphFMA").property("value", lyphToSyncData.fma) : d3.select("#lyphLocation").property("value", "");
        d3.select("#edgeAnnotation").property("value", "");
        d3.select("#provenance").property("value", "");
        $('#thelist').empty();
        if(lyphToSyncData.annots){
            console.log(lyphToSyncData.annots)
            for (var i = 0; i < lyphToSyncData.annots.length; i ++){
                //console.log(rect.lyph.annots[i].obj );
                //console.log(rect.lyph.annots[i].pubmed.id );
                $('#thelist').append('<option value='+  lyphToSyncData.annots[i].obj +"|"+ lyphToSyncData.annots[i].pubmed.id +'> ' + lyphToSyncData.annots[i].obj +" | "+ lyphToSyncData.annots[i].pubmed.id +   "</option");
            }
        }

        saveLyph();
    });



    d3.select("#lyphDelete").on("click", function() {
        console.log("Lyph Delete");
        if (selectedGraph.selected_rectangle){
            console.log("Delete", selectedGraph.selected_rectangle )


            //ajax request to delete lyph
            var URL =
                "http://open-physiology.org:"+serverPort+"/delete_lyphs/"+
                "?lyphs="+ encodeURIComponent(selectedGraph.selected_rectangle.lyph.id) ;
            console.log(URL);
            $.ajax
            ({
                url: URL,

                jsonp: "callback",

                dataType: "jsonp",


                success: function (response) {
                    response;

                    if (response.hasOwnProperty("Error")) {
                        console.log("Not able to delete lyph:" , response);
                        return;
                    }

                    console.log(response);

                    selectedGraph.rectangles.splice(selectedGraph.rectangles.indexOf(selectedGraph.selected_rectangle), 1);
                    selectedGraph.draw(svg, onSelectNode, onSelectLink, onSelectRectangle, refresh_graph, syncSelectedGraph);
                    load_all_lyphs();
                }
            });


        } else if (selectedGraph.selected_link){
            console.log("Delete", selectedGraph.selected_link )
        }


    })


    d3.select("#graphClone").on("click", function() {
        cloneGraph(selectedGraph);
    })


    d3.select("#assignRectangleLyph").on("click", function() {
        //send ajax request
        $.ajax
        ({
            context: this,
            url: "http://open-physiology.org:" + serverPort + "/lyph/" +
            $("#rectangleID").val().trim(),

            jsonp: "callback",

            dataType: "jsonp",


            success: function (response) {
                console.log(response);

                if (response.hasOwnProperty("Error")) {
                    console.log("Lyph not found", response);
                    $('#userconsole').text(response.Error);
                    $("#rectangleName").val("");
                    return;
                }


                //selectedGraph.selected_rectangle.lyphID = $('#rectangleID').val().trim();
                //selectedGraph.selected_rectangle.lyphName = $('#rectangleName').val().trim();
                //console.log(selectedGraph.selected_rectangle)
                selectedGraph.selected_rectangle.lyphID = response.id;
                selectedGraph.selected_rectangle.lyphName = response.name;
                selectedGraph.selected_rectangle.from = response.from;
                selectedGraph.selected_rectangle.to = response.to;
                selectedGraph.selected_rectangle.fma = response.fma;
                selectedGraph.selected_rectangle.species = response.species;
                refresh_graph();
            }
        })
    })



    d3.select('#graphDelete').on('click', function (){

        //send ajax request
        $.ajax
        ({
            context: this,
            url:
            "http://open-physiology.org:"+serverPort+"/delete_views/?views=" +
            selectedGraph.id ,

            jsonp: "callback",

            dataType: "jsonp",


            success: function (response) {
                console.log(response)   ;

                if (response.hasOwnProperty("Error")) {
                    console.log("Unable to delete view" , response);
                    return;
                }

                graphRepo.graphs.splice(graphRepo.getIndexByID(selectedGraph.id),1);
                selectedGraph = graphRepo.graphs[0];
                onSelectGraph(selectedGraph);

            }
        });




    })

    d3.select('#removeAnnotation').on('click', function (){

        //TODO - currently causes a server crash.

       console.log('Remove Annotation Clicked');
        console.log(thelist.value);
        var clinicalIndexToRemove = thelist.value.split("|")[0];
        console.log(clinicalIndexToRemove);
        //ajax call to remove annotation
        var URL =
            "http://open-physiology.org:"+serverPort+"/remove_annotations/"+
            "?lyphs="+ encodeURIComponent(selectedGraph.selected_link.edgeid) +
            "&annot="+encodeURIComponent(clinicalIndexToRemove) ;
        console.log(URL);
        $.ajax
        ({
            url: URL,

            jsonp: "callback",

            dataType: "jsonp",


            success: function (response) {
                response;

                if (response.hasOwnProperty("Error")) {
                    console.log("Annotation Removal Error:" , response);
                    return;
                }

                console.log(response);

                //Remove from the dropdown box
                $("#thelist").find("option[value='" + $("#thelist").val() + "']").remove();

                //Remove from the link structure.

            }
        });
    });


    d3.select("#searchRectangleLyph").on("click", function() {

        $('#userconsole').text("Searching for lyph: " + $("#rectangleID").val().trim());

        //send ajax request
        $.ajax
        ({
            context: this,
            url:
            "http://open-physiology.org:"+serverPort+"/lyph/" +
            $("#rectangleID").val().trim() ,

            jsonp: "callback",

            dataType: "jsonp",


            success: function (response) {
                console.log(response)   ;

                if (response.hasOwnProperty("Error")) {
                    console.log("Lyph not found" , response);
                    $('#userconsole').text(response.Error);
                    $("#rectangleName").val("");
                    return;
                }

                $('#userconsole').text("Lyph found");
                $('#rectangleName').val(response.name);



            },
            async:   false
        });




    })


    d3.select("#highlightPath").on("click", function(){
        var numPaths = 16;

        if($('#shortest').is(':checked'))
            numPaths = 1;


        var URL = "http://open-physiology.org:"+serverPort+"/lyphpath/" +
            "?fromlyph=" + $('#startLyph').val().trim() +
            "&tolyph=" + $('#endLyph').val().trim() +
            "&numpaths=" + numPaths;
        console.log(URL);
        //send ajax request
        $.ajax
        ({
            context: this,
            url: URL

            ,

            jsonp: "callback",

            dataType: "jsonp",


            success: function (response) {
                console.log(URL);
                console.log(response)   ;

                if (response.hasOwnProperty("Error")) {
                    console.log("PAth not found" , response);
                    return;
                }

                clearHighlight();

                // loop through the number of paths
                for (var i =0; i < response.length; i ++){
                     // loop through and identify edges on the paths

                    console.log(response[i]);

                    for (var j =0; j < response[i].length; j++){
                        console.log(response[i].edges[j].id);


                        if (selectedGraph.getLinkIndexbyID(response[i].edges[j].id) > -1 ){
                            selectedGraph.links[selectedGraph.getLinkIndexbyID(response[i].edges[j].id)].highlighted = true;
                        }
                    }

                    selectedGraph.draw(svg, onSelectNode, onSelectLink, onSelectRectangle, refresh_graph, syncSelectedGraph);

                }



            }
        });

    })




    d3.select("#annotationHighligh").on("click", function() {
        console.log("Highlight Annotations");
        for (var i =0 ; i < selectedGraph.links.length; i++){

            console.log(selectedGraph.links[i].annotations);
                selectedGraph.links[i].highlighted = false;

            for (var j =0; j < selectedGraph.links[i].annotations.length; j++){
                if (selectedGraph.links[i].annotations[j].annotation.indexOf($("#highlightAnnotation").val().trim()) > -1)
                    selectedGraph.links[i].highlighted = true;
            }
            //if (selectedGraph.links[i].annotations){
            //    if (selectedGraph.links[i].annotations.indexOf($("#highlightAnnotation").val().trim()) > -1)
            //       selectedGraph.links[i].highlighted = true;
            //}
            //if (selectedGraph.links[i].annotations.contains($("#highlightAnnotation").val().trim()))
            //   selectedGraph.links[i].highlighted = true;
            //else
            //    selectedGraph.links[i].highlighted = false;
        }
        selectedGraph.draw(svg, onSelectNode, onSelectLink, onSelectRectangle, refresh_graph, syncSelectedGraph);
    })




    d3.select("#clearHighlight1").on("click", function() {
        clearHighlight();
    })

    d3.select("#clearHighlight2").on("click", function() {
        clearHighlight();
    })

    function clearHighlight(){
        console.log(selectedGraph);
        for (var i =0 ; i < selectedGraph.links.length; i++){
            selectedGraph.links[i].highlighted = false;
        }
        selectedGraph.draw(svg, onSelectNode, onSelectLink, onSelectRectangle, refresh_graph, syncSelectedGraph);
    }






    d3.select("#graphNew").on("click", function(){
        console.log("new Graph");
        var nodes = [];
        var edges = [];
        var id = null;
        var newGraph = null;
        var rectangles = []

        //nodes.push(new Node("1", ".", 200, 200, null, true));

        newGraph = new Graph ("", "", nodes, edges, rectangles);
        graphRepo.addAt(newGraph, 0);
        selectedGraph = graphRepo.graphs[0];
        syncSelectedGraph();
        //graphRepo.draw(graphRepoSvg, graphRepoVP, onSelectGraph);
        refresh_graph();
        console.log(graphRepo);

    });



    function cloneGraph(graph){
        //var newGraph = null;
        //if (graph != null){
        //    newGraph = graph.clone();
        //    newGraph.id = graphID.value+"_cloned";
        //    newGraph.name = graphName.value+"_cloned";
        //}
        //else newGraph = new Graph(graphID.value, graphName.value, [], [], []);
        //graphRepo.addAt(newGraph, 0);
        //graphRepo.draw(graphRepoSvg, graphRepoVP, onSelectGraph);
        //selectedGraph = newGraph;
        //syncSelectedGraph();

        var query = "http://open-physiology.org:"+serverPort+"/makeview/?"
        for (var i =0; i < selectedGraph.nodes.length ; i++){
            query += "&node" + (i + 1)+ "="+ encodeURIComponent(selectedGraph.nodes[i].name);
            query += "&x"+ (i + 1) +"="+ encodeURIComponent(selectedGraph.nodes[i].x);
            query += "&y"+ (i + 1) +"="+encodeURIComponent(selectedGraph.nodes[i].y);
        }

        console.log(selectedGraph);

        for (var i =0; i < selectedGraph.rectangles.length; i++){
            query += "&lyph"+ (i + 1) +"="+  (selectedGraph.rectangles[i].lyph ? encodeURIComponent(selectedGraph.rectangles[i].lyph.id) : "null");
            query += "&lx"+ (i + 1) +"="+encodeURIComponent(selectedGraph.rectangles[i].x)
            query += "&ly"+ (i + 1) +"="+encodeURIComponent(selectedGraph.rectangles[i].y)
            query += "&width"+ (i + 1) +"="+encodeURIComponent(selectedGraph.rectangles[i].width)
            query += "&height"+ (i + 1) +"="+encodeURIComponent(selectedGraph.rectangles[i].height);

        }

        console.log(query);

        // ajax call to save graph view
        $.ajax
        ({
            url:query,

            jsonp: "callback",

            dataType: "jsonp",


            success: function (response) {
                response;


                if (response.hasOwnProperty("Error")) {
                    console.log("Graph View Save error" , response);
                    return;
                }

                console.log(response);



                var nodes = [];
                var edges = [];
                var rectangles = [];
                var id = null;
                var newGraph = null;
                var name = null;

                //load view meta data
                id = response.id;
                name  = response.name;


                newGraph = new Graph(id, name, nodes, edges, rectangles);



                //load rectangles
                for (var j =0; j < response.lyphs.length; j++){
                    console.log(response.lyphs[j].lyph);
                    var tmpRect = new Rectangle(response.lyphs[j].id, parseInt(response.lyphs[j].x), parseInt(response.lyphs[j].y),parseInt(response.lyphs[j].width), parseInt(response.lyphs[j].height), response.lyphs[j].lyph, response.lyphs[j].location);
                    rectangles.push(tmpRect);
                }

                console.log("Loaded Rectangles", rectangles);

                populateRectangleNames(rectangles);

                //load nodes
                for (var j =0; j < response.nodes.length; j++){
                    nodes.push(new Node(response.nodes[j].id, response.nodes[j].id, parseInt(response.nodes[j].x), parseInt(response.nodes[j].y), null, true, response.nodes[j].location, response.nodes[j].loctype));
                }


                //load edges
                for (var j =0; j < response.nodes.length; j++){
                    //console.log(response[i].nodes[j].exits.length)
                    for (var k =0; k < response.nodes[j].exits.length; k++){

                        var newEdge = new Link(
                            newGraph.nodes[newGraph.getNodeIndexByID(response.nodes[j].id)],
                            newGraph.nodes[newGraph.getNodeIndexByID(response.nodes[j].exits[k].to)],
                            (response.nodes[j].exits[k].via.template)? auRepo.auSet[auRepo.getIndexByID(response.nodes[j].exits[k].via.template.id)]: null,
                            response.nodes[j].exits[k].via.type,
                            response.nodes[j].exits[k].via.id,
                            response.nodes[j].exits[k].via.name,
                            response.nodes[j].exits[k].via.fma,
                            null,
                            null,
                            false,
                            function(){
                                //console.log("in");
                                console.log("Looking", response.nodes[j].exits[k].via.annots.length, response.nodes[j].exits[k].via.annots[0]);
                                var annotations = [];
                                for (var ai = 0; ai < response.nodes[j].exits[k].via.annots.length; ai++){
                                    annotations.push(new Annotations(response.nodes[j].exits[k].via.annots[ai].obj, response.nodes[j].exits[k].via.annots[ai].pubmed));
                                    //annotations += response[i].nodes[j].exits[k].vai.annots[ai].obj;
                                }
                                //console.log("Annnots" , annotations)
                                return annotations;
                            }(),
                            response.nodes[j].exits[k].via.species
                            //j % 2 ===0 ?true: false
                        );
                        edges.push(newEdge);
                    }
                }




                //console.log("Edges", edges);
                newGraph.selected_link = newGraph.links[0];
                newGraph.selected_node = newGraph.nodes[0];
                newGraph.selected_rectangle = newGraph.rectangles[0];
                newGraph.saved = true;
                //console.log(newGraph.rectangles[0]);

                console.log("New Graph:", newGraph);

                graphRepo.addAt(newGraph,0);


                selectedGraph = graphRepo.graphs[0];
                selectedGraph.draw(svg, onSelectNode, onSelectLink, onSelectRectangle,refresh_graph, syncSelectedGraph);
                graphRepo.draw(graphRepoSvg, graphRepoVP, onSelectGraph,selectedGraph);
                updateGraphParameters(selectedGraph);




            console.log(graphRepo);
        //console.log(response);
        //
        //graphRepo.graphs[actualSelectedGraphIndex].id = response.id;
        //refresh_graph();

            }
        });



    }



    //TODO - Thursday. >> Requested SAM for a single API call to support this.
    d3.select("#graphSave").on("click",function(){

        selectedGraph.saveGraphtoServer(refresh_graph, syncSelectedGraph);
        //selectedGraph.reloadGraphFromServer(syncSelectedGraph);


    })





    function syncSelectedGraph(){

        console.log(selectedGraph);
        selectedGraph.selected_rectangle =  selectedGraph.rectangles[selectedGraph.rectangles.length -1];
        onSelectLink(selectedGraph.rectangles[selectedGraph.rectangles.length -1]);
        graphRepo.draw(graphRepoSvg, graphRepoVP, onSelectGraph, selectedGraph);

        console.log(selectedGraph.rectangles[0])


        console.log(selectedGraph);
        selectedGraph.draw(svg, onSelectNode, onSelectLink, onSelectRectangle,refresh_graph, syncSelectedGraph);
        updateGraphParameters(selectedGraph);
    }

    d3.select("#auUpdate").on("click", function() {
        if (selectedGraph.multiple_selection.length > 0){
            for (var i =0; i < selectedGraph.multiple_selection.length; i ++){
                console.log(selectedGraph.multiple_selection[i]);
                selectedGraph.multiple_selection[i].au = selectedAU;
                selectedGraph.draw(svg, onSelectNode, onSelectLink, onSelectRectangle,refresh_graph, syncSelectedGraph);

                $.ajax
                ({
                    url:
                    "http://open-physiology.org:"+serverPort+"/assignlyph/"+
                    "?lyph="+ encodeURIComponent(selectedAU.id) +
                    "&edge="+encodeURIComponent(selectedGraph.getMultipleSection()[i].edgeid),

                    jsonp: "callback",

                    dataType: "jsonp",


                    success: function (response) {
                        response;


                        if (response.hasOwnProperty("Error")) {
                            console.log("Node creation error:" , response);
                            return;
                        }

                        console.log(response);
                    }
                });




            }

            return;
        }

        if (selectedGraph.selected_link){
            selectedGraph.selected_link.au = selectedAU;
            selectedGraph.draw(svg, onSelectNode, onSelectLink, onSelectRectangle, refresh_graph, syncSelectedGraph);


            console.log(selectedAU.id, selectedGraph.selected_link.edgeid);

            // ajax call to update the lyph assignment
            $.ajax
            ({
                url:
                "http://open-physiology.org:"+serverPort+"/assignlyph/"+
                "?lyph="+ encodeURIComponent(selectedAU.id) +
                "&edge="+encodeURIComponent(selectedGraph.selected_link.edgeid),

                jsonp: "callback",

                dataType: "jsonp",


                success: function (response) {
                    response;


                    if (response.hasOwnProperty("Error")) {
                        console.log("Node creation error:" , response);
                        return;
                    }

                    console.log(response);
                }
            });
        } else {
            alert("Error: Link is not selected!");
        }
    });

    $("#annotateEdge").click(function(){
        console.log("Annotage edge");
        console.log("Annotations", $("#edgeAnnotation").val().trim());
        selectedGraph.selected_link.annotations = $("#edgeAnnotation").val().trim();
        $('#thelist').append('<option value='+ $("#edgeAnnotation").val().trim() +"|" + $("#provenance").val().trim()+'> ' + $("#edgeAnnotation").val().trim() +" | " + $("#provenance").val().trim() +   "</option")

        //ajax call to save annotations
        annotate_lyph();
    });

    var annotate_lyph = function annotate_lyph(){
        //ajax call to save annotations
        console.log("Ajax call to save annotations.");

        // ajax call to update the lyph assignment
        $.ajax
        ({
            url:
            "http://open-physiology.org:"+serverPort+"/annotate/"+
            "?lyph="+ encodeURIComponent(selectedGraph.selected_link.edgeid) +
            "&annot="+encodeURIComponent($("#edgeAnnotation").val().trim()) +
            "&pubmed=" + encodeURIComponent($("#provenance").val().trim()),

            jsonp: "callback",

            dataType: "jsonp",


            success: function (response) {
                response;

                if (response.hasOwnProperty("Error")) {
                    console.log("Annotation error:" , response);
                    return;
                }

                console.log(response);
            }
        });
    };



    d3.select('#openGraphViewer').on('click',function(){
        console.log("Opening Viewer at:", graphViewerURL + "?root=" + $('#lyphList').val() );
        window.open(graphViewerURL + "?root=" + $('#lyphListBox').data(lyphListBox.value) +"&port=" + serverPort, '_blank');
    });



        d3.select("#edgeSave").on("click", function() {
            saveLyph();
    });


    function saveLyph(){


        //Perform validation  to ensure that the lyph name doesn't already exist.

        var url =  "http://open-physiology.org:"+serverPort+"/lyphs_by_prefix/?prefix="+$("#edgeDescription").val().trim();

        $.ajax
        ({
            url: url,

            jsonp: "callback",

            dataType: "jsonp",


            success: function (response) {
                response;


                if (response.hasOwnProperty("Error")) {
                    console.log("Error in obtaining a list of lyphs:", response);
                    return;
                }


                console.log(response);
                for (var i =0; i < response.length; i++){
                    if ($("#edgeDescription").val().trim() === response[i].name && $("#edgeID").val().trim() != response[i].id){
                        //console.log(response[i].id , response[i].name, " already exists");
                        alert("Lyph:"  + response[i].name + " already exists in the database!");
                        return;
                    }
                }
                saveLyphData();
            }
        });
    }






    function saveLyphData() {

        console.log("Selected link:", selectedGraph.selected_link);
        console.log("Selected rect:", selectedGraph.selected_rectangle);

        if (selectedGraph.selected_link && selectedGraph.selected_rectangle === null){

            var actualEdge = selectedGraph.selected_link;
            var edgeType = $("#edgeType").val().trim();
            var edgeName = $("#edgeDescription").val().trim();
            var fromNode = selectedGraph.selected_link.source ;
            var toNode = selectedGraph.selected_link.target;
            var edgeLyphID = $("#auID").val().trim();
            var lyphSpecies = $("#edgeSpecies").val().trim();



            console.log("EdgeSave:", edgeType, edgeName, fromNode, toNode, edgeLyphID);

            //Update the local data
            selectedGraph.selected_link.au = auRepo.auSet[auRepo.getIndexByID($("#auID").val().trim())];
            selectedGraph.selected_link.type = $("#edgeType").val().trim();
            selectedGraph.selected_link.description = $("#edgeDescription").val().trim();
            selectedGraph.selected_link.annotations = $("#edgeAnnotation").val().trim();
            selectedGraph.selected_link.species = $("#edgeSpecies").val().trim();



            //ajax call to check if lyph already exists.

            var URL = "http://open-physiology.org:" + serverPort + "/lyph/" +
                encodeURIComponent($("#edgeID").val().trim());
            $.ajax
            ({
                url: URL,

                jsonp: "callback",

                dataType: "jsonp",


                success: function (response) {
                    console.log(response);



                    if (response.hasOwnProperty("Error")) {
                        console.log("Lyph Doesn't Exist:" , response);

                        //create new lyph
                        var URL2 =  "http://open-physiology.org:"+serverPort+"/makelyph/?"
                        URL2 += "type="+ encodeURIComponent($("#edgeType").val().trim())
                        URL2 +=  "&name="+ encodeURIComponent($("#edgeDescription").val().trim())
                        URL2 +=  "&from="+ encodeURIComponent(selectedGraph.selected_link.source.name)
                        URL2 +=  "&to="+ encodeURIComponent(selectedGraph.selected_link.target.name)
                        if ($("#auID").val().trim() != "")
                            URL2 +=  "&template="+ encodeURIComponent($("#auID").val().trim())
                        URL2 +=  "&species=" + encodeURIComponent($("#edgeSpecies").val().trim());

                    } else {
                        console.log("Lyph Exists");

                        // edit exiting lyph
                        var URL2 =  "http://open-physiology.org:"+serverPort+"/editlyph/"
                        URL2+= "?lyph=" + response.id;
                        URL2 += "&type="+ encodeURIComponent($("#edgeType").val().trim())
                        URL2 += "&name="+ encodeURIComponent($("#edgeDescription").val().trim())
                        if ($("#auID").val().trim() != "")
                            URL2 +=  "&template="+ encodeURIComponent($("#auID").val().trim())
                        URL2 += "&species=" + encodeURIComponent($("#edgeSpecies").val().trim());
                    }


                    // ajax call to create a lyphedge


                    console.log(URL2);

                    $.ajax
                    ({
                        url: URL2,

                        jsonp: "callback",

                        dataType: "jsonp",


                        success: function (response) {
                            response;



                            if (response.hasOwnProperty("Error")) {
                                console.log("Edge creation error:" , response);
                                return;
                            }

                            console.log("Response:", response);
                            selectedGraph.selected_link.edgeid = response.id;

                            addEdgeAnnotations(response.id, $("#edgeAnnotation").val().trim() );
                            //actualEdge.edgeid = response.id;
                            refresh_graph();
                            updateEdgeParameters(selectedGraph.selected_link);
                        }
                    });




                    //console.log("Response:", response);
                    //selectedGraph.selected_link.edgeid = response.id;
                    //
                    //addEdgeAnnotations(response.id, $("#edgeAnnotation").val().trim() );
                    ////actualEdge.edgeid = response.id;
                    //refresh_graph();
                    //updateEdgeParameters(selectedGraph.selected_link);
                }
            });
        } else if (selectedGraph.selected_link === null && selectedGraph.selected_rectangle) {
            var actualRect = selectedGraph.selected_rectangle;
            var edgeType = $("#edgeType").val().trim();
            var edgeName = $("#edgeDescription").val().trim();
            var edgeLyphID = $("#auID").val().trim();
            var lyphSpecies = $("#edgeSpecies").val().trim();
            var fma =  $("#lyphFMA").val().trim();


                //check if lyphs already exists
                var URL = "http://open-physiology.org:" + serverPort + "/lyph/" +
                    encodeURIComponent($("#edgeID").val().trim());
                $.ajax
                ({
                    url: URL,

                    jsonp: "callback",

                    dataType: "jsonp",


                    success: function (response) {
                        console.log(response);


                        if (response.hasOwnProperty("Error")) {
                            console.log("Lyph Doesn't Exist:", response);

                            //create new lyph
                            var URL2 = "http://open-physiology.org:" + serverPort + "/makelyph/?"
                            URL2 += "type=" + encodeURIComponent($("#edgeType").val().trim())
                            URL2 += "&name=" + encodeURIComponent($("#edgeDescription").val().trim())
                            URL2 += "&from=new"
                            URL2 += "&to=new"
                            if ($("#auID").val().trim() != "")
                                URL2 += "&template=" + encodeURIComponent($("#auID").val().trim())
                            URL2 += "&species=" + encodeURIComponent($("#edgeSpecies").val().trim());
                            URL2 += "&fma=" +  encodeURIComponent($("#lyphFMA").val().trim());

                        } else {
                            console.log("Lyph Exists");

                            // edit exiting lyph
                            var URL2 = "http://open-physiology.org:" + serverPort + "/editlyph/"
                            URL2 += "?lyph=" + response.id;
                            URL2 += "&type=" + encodeURIComponent($("#edgeType").val().trim())
                            URL2 += "&name=" + encodeURIComponent($("#edgeDescription").val().trim())
                            if ($("#auID").val().trim() != "")
                                URL2 += "&template=" + encodeURIComponent($("#auID").val().trim())
                            URL2 += "&species=" + encodeURIComponent($("#edgeSpecies").val().trim());
                            URL2 += "&fma=" +  encodeURIComponent($("#lyphFMA").val().trim());
                        }


                        // ajax call to create a lyphedge


                        console.log(URL2);

                        $.ajax
                        ({
                            url: URL2,

                            jsonp: "callback",

                            dataType: "jsonp",


                            success: function (response) {
                                response;


                                if (response.hasOwnProperty("Error")) {
                                    console.log("Edge creation error:", response);
                                    return;
                                }

                                console.log("Response:", response);
                                selectedGraph.selected_rectangle.lyph = response;
                                selectedGraph.selected_rectangle.id = response.id;

                                selectedGraph.saveGraphtoServer(refresh_graph, syncSelectedGraph);

                                //actualEdge.edgeid = response.id;
                                refresh_graph();
                                //updateRectangleParameter(selectedGraph.selected_rectangle);
                                onSelectLink(selectedGraph.selected_rectangle)
                            }
                        });


                    }

            })
        } else {
            console.log("Selection of Lyph ambigious")
        }


    }





    var addEdgeAnnotations = function addEdgeAnnotations (id, annotations){
        console.log("Working on annotations");
        //$.ajax
        //({
        //    url:
        //    "http://open-physiology.org:"+serverPort+"/annotate/"+
        //    "?lyphs=" + id +
        //    "&annot=" + annotations+
        //    "&pubmed=dummy"
        //    ,
        //
        //    jsonp: "callback",
        //
        //    dataType: "jsonp",
        //
        //
        //    success: function (response) {
        //        response;
        //
        //        console.log(response);
        //
        //        if (response.hasOwnProperty("Error")) {
        //            console.log("Annotation error:");
        //            return;
        //        }
        //
        //        console.log("Response:", response);
        //
        //        //addEdgeAnnotations(response.id, $("#edgeAnnotation").val().trim() );
        //        //actualEdge.edgeid = response.id;
        //        refresh_graph();
        //    }
        //});
    }






    var load_all_graphs = function load_all_graphs(){
        console.log("Loading existing views");

        // ajax call to load all graph view
        $.ajax
        ({
            url:"http://open-physiology.org:"+serverPort+"/all_lyphviews/",

            jsonp: "callback",

            dataType: "jsonp",


            success: function (response) {
                response;


                if (response.hasOwnProperty("Error")) {
                    console.log("Node creation error:" , response);
                    return;
                }


                console.log("Response:" , response);
                for (var i =0; i < response.length; i++){
                    //console.log(response[i]);
                    var nodes = [];
                    var edges = [];
                    var rectangles = [];
                    var id = null;
                    var newGraph = null;
                    var name = null;

                    //load view meta data
                    id = response[i].id;
                    name = response[i].name;


                    newGraph = new Graph(id, name, nodes, edges, rectangles);
                    newGraph.saved = true;

                    //Removed the loading of all the graphs before showing the current graph.
                    
                    ////load rectangles
                    //for (var j =0; j < response[i].lyphs.length; j++){
                    //    //console.log(response[i].lyphs[j].lyph);
                    //    var tmpRect = new Rectangle(response[i].lyphs[j].id, parseInt(response[i].lyphs[j].x), parseInt(response[i].lyphs[j].y),parseInt(response[i].lyphs[j].width), parseInt(response[i].lyphs[j].height), response[i].lyphs[j].lyph, response[i].lyphs[j].location);
                    //    //view tmpRect;
                    //    rectangles.push(tmpRect);
                    //}
                    //
                    ////console.log("Loaded Rectangles", rectangles);
                    //
                    //if (response.length -1 === i)
                    //    populateRectangleNames(rectangles);
                    //
                    ////load nodes
                    //for (var j =0; j < response[i].nodes.length; j++){
                    //    nodes.push(new Node(response[i].nodes[j].id, response[i].nodes[j].id, parseInt(response[i].nodes[j].x), parseInt(response[i].nodes[j].y), null, true, response[i].nodes[j].location, response[i].nodes[j].loctype));
                    //}
                    //
                    //
                    ////load edges
                    //for (var j =0; j < response[i].nodes.length; j++){
                    //    //console.log(response[i].nodes[j].exits.length)
                    //    for (var k =0; k < response[i].nodes[j].exits.length; k++){
                    //        //console.log(response[i].nodes[j].id);
                    //        //console.log("source", newGraph.nodes[newGraph.getNodeIndexByID(response[i].nodes[j].id)]);
                    //        //console.log("target", newGraph.nodes[newGraph.getNodeIndexByID(response[i].nodes[j].exits[k].to)]);
                    //        //console.log("au", (response[i].nodes[j].exits[k].via.lyph)? auRepo.auSet[auRepo.getIndexByID(response[i].nodes[j].exits[k].via.lyph)] : null);
                    //        //console.log("type", response[i].nodes[j].exits[k].via.type );
                    //        //console.log("description", response[i].nodes[j].exits[k].via.name );
                    //        //console.log("fma",response[i].nodes[j].exits[k].via.fma );
                    //
                    //
                    //
                    //        var newEdge = new Link(
                    //            newGraph.nodes[newGraph.getNodeIndexByID(response[i].nodes[j].id)],
                    //            newGraph.nodes[newGraph.getNodeIndexByID(response[i].nodes[j].exits[k].to)],
                    //            (response[i].nodes[j].exits[k].via.template)? auRepo.auSet[auRepo.getIndexByID(response[i].nodes[j].exits[k].via.template.id)]: null,
                    //            response[i].nodes[j].exits[k].via.type,
                    //            response[i].nodes[j].exits[k].via.id,
                    //            response[i].nodes[j].exits[k].via.name,
                    //            response[i].nodes[j].exits[k].via.fma,
                    //            null,
                    //            null,
                    //            false,
                    //            function(){
                    //                //console.log("in");
                    //                //console.log("Looking", response[i].nodes[j].exits[k].via.annots.length, response[i].nodes[j].exits[k].via.annots[0]);
                    //                var annotations = [];
                    //                for (var ai = 0; ai < response[i].nodes[j].exits[k].via.annots.length; ai++){
                    //                    annotations.push(new Annotations(response[i].nodes[j].exits[k].via.annots[ai].obj, response[i].nodes[j].exits[k].via.annots[ai].pubmed));
                    //                    //annotations += response[i].nodes[j].exits[k].vai.annots[ai].obj;
                    //                }
                    //                //console.log("Annnots" , annotations)
                    //                return annotations;
                    //            }(),
                    //            response[i].nodes[j].exits[k].via.species
                    //            //j % 2 ===0 ?true: false
                    //        );
                    //        edges.push(newEdge);
                    //    }
                    //}




                    //console.log("Edges", edges);
                    //newGraph.selected_link = newGraph.links[0];
                    //newGraph.selected_node = newGraph.nodes[0];
                    //newGraph.selected_rectangle = newGraph.rectangles[0];
                    //console.log(newGraph.rectangles[0]);

                    //console.log("New Graph:", newGraph);

                    graphRepo.addAt(newGraph,0);
                    //newGraph.selected_rectangle = newGraph.rectangles[newGraph.rectangles -1];


                    selectedGraph = graphRepo.graphs[0];
                    selectedGraph.selected_rectangle = selectedGraph.rectangles[selectedGraph.rectangles.length -1];
                    onSelectLink(selectedGraph.selected_rectangle )

                }


                //selectedGraph.draw(svg, onSelectNode, onSelectLink, onSelectRectangle);
                graphRepo.draw(graphRepoSvg, graphRepoVP, onSelectGraph, selectedGraph);
                updateGraphParameters(selectedGraph);






                //console.log(graphRepo);
                //console.log(response);
                //
                //graphRepo.graphs[actualSelectedGraphIndex].id = response.id;
                selectedGraph.reloadGraphFromServer(syncSelectedGraph);
                //refresh_graph();
            }
        });


    }


    populateRectangleNames = function populateRectangleNames(rectangles){
        for (var i =0; i < rectangles.length; i++){

            (function () {
                //$('#userconsole').text("Searching for lyph: " + $("#rectangleID").val().trim());
                var rect= rectangles[i];

                //send ajax request
                $.ajax
                ({

                    context: this,
                    url: "http://open-physiology.org:"+serverPort+"/lyph/" +
                    rect.id,

                    jsonp: "callback",

                    dataType: "jsonp",


                    success: function (response) {
                        //console.log(response);

                        if (response.hasOwnProperty("Error")) {
                            //console.log("Lyph not found", response);
                            //$('#userconsole').text(response.Error);
                            return;
                        }

                        rect.lyphName = response.name;
                        if (selectedGraph){
                            refresh_graph();
                        }
                    }
                });
            }());
        }
    }


    //////////////////////////////////////////////////////////////////////////////////
    ///     Load Shortest Path Graph
    //////////////////////////////////////////////////////////////////////////////////

    $("#loadSubGraph").click(function(){
        launch_subgraph_ajax()
    });


    var launch_subgraph_ajax = function launch_subgraph_ajax (){
        console.log("here");
        var startNode = $('#startNode').val().trim();
        var endNode =  $('#endNode').val().trim();

        if ( startNode == "" || endNode == "" ) {
            alert("Both start and end node have to be specified.");
            return;
        }
        $.ajax
        ({
            url:
            "http://open-physiology.org:"+serverPort+"/lyphpath/" +
            "?from=" + encodeURIComponent( startNode ) +
            "&to=" + encodeURIComponent( endNode ),

            jsonp:
                "callback",

            dataType:
                "jsonp",

            success: function( response )
            {
                var path = response;

                if ( path.hasOwnProperty( "Error" ) )
                {
                    if ( path.Error == "No path found" )
                        alert( "No path found" );
                    else
                        alert( "Error: " + path.Error );

                    return;
                }

                if ( path.length == 0 )
                {
                    alert( "You entered the same node twice, so the shortest path is the trivial empty path." );
                    return;
                }

                //console.log(path);
                var resultlist = "";
                var nodes= [];
                var link = [];
                var rectangles = [];

                console.log(response);
                //return;

                for ( var i = 0; i < path.length; i++ )
                {
                    //resultlist +=
                    //"Edge id:" + path.edges[i].id + " " +
                    //"From:" + path.edges[i].from.id + ", " +
                    //"to:" + path.edges[i].to.id + ", " +
                    //"au:" + path.edges[i].au + ", " +
                    //"fma:" + path.edges[i].fma + ", " +
                    //"Description:" + path.edges[i].name + ", " +
                    //"Type:" + path.edges[i].type + ", " +
                    //"\n"
                    //;
                    //
                    //console.log( resultlist + "\n (A total of " + path.length + " steps)" );

                    //console.log(path);

                    // Creating Nodes
                    if (doesNodesContainNode(nodes, path.edges[i].from.id) == null) {
                        nodes.push(new Node(nodes.length, path.edges[i].from.id, ((nodes.length +1) * 100) , ((nodes.length +1) * 100) , null, false));
                    }

                    if (doesNodesContainNode(nodes, path.edges[i].to.id) == null) {
                        nodes.push(new Node(nodes.length, path.edges[i].to.id, ((nodes.length +1) * 100), ((nodes.length +1) * 100), null, false));
                    }
                }
                console.log ("Nodes:", nodes);

                //console.log(auRepo.auSet[auRepo.getIndexByID(path.edges[0].lyph.id)]);
                ////Adding edges to the graph
                for (var i = 0; i < path.length; i++) {
                    //console.log(i, path.edges[i].lyph);
                    link.push(new Link( nodes[getNodePosition(nodes, path.edges[i].from.id)],
                            nodes[getNodePosition(nodes, path.edges[i].to.id)],
                            (path.edges[i].lyph) ? auRepo.auSet[auRepo.getIndexByID(path.edges[i].lyph.id)]: undefined,
                            //path.edges[i].lyph,
                            path.edges[i].type,
                            path.edges[i].id,
                            path.edges[i].name,
                            path.edges[i].fma,
                            false,
                            false
                        )
                    );
                }
                //source, target, au,type, edgeid, description, fma


                //Creating sub-graph from ajax data
                var graphAjax= new Graph("Subgraph_"+(graphRepo.graphs.length+1), startNode+" ---> "+endNode, nodes, link, rectangles);

                ////adding graph, selecting graph, drawing graphrepo and graph.
                graphRepo.addAt(graphAjax,0);
                selectedGraph = graphRepo.graphs[0];
                selectedGraph.draw(svg, onSelectNode,onSelectLink,onSelectRectangle, refresh_graph, syncSelectedGraph);
                graphRepo.draw(graphRepoSvg, graphRepoVP, onSelectGraph,selectedGraph);
                updateGraphParameters(selectedGraph);


            }
        });


        // function to check whether node has already been loaded
        var doesNodesContainNode = function doesNodesContainNode (nodes, name){
            for (i =0; i < nodes.length; i++){
                //console.log(nodes[i].name + "==" + name);
                if (nodes[i].name === name){
                    return nodes[i];
                }
            }
            return null;
        };

        // identify the node position in the nodes structure
        var getNodePosition = function (nodes, name){
            for (i =0; i < nodes.length; i++){
                if (nodes[i].name === name){
                    return i;
                }
            }
            return null;
        };



    }

    var load_all_materials = function load_all_materials (){

        console.log("Loading existing lyphs/materials")
        $.ajax
        ({
            url:
                "http://open-physiology.org:"+serverPort+"/all_templates/",
            jsonp:
                "callback",
            dataType:
                "jsonp",
            success: function( response )
            {
                var data = response;
                console.log("Response:", response);


                if ( data.hasOwnProperty( "Error" ) )
                {
                    console.log(response);
                    return;
                }

                console.log("Lyph Loaded");



                //Todo: We should only make a single pass through the dataset.
                //load all basic types
                for (var i = 0; i < data.length; i++) {
                    if (data[i].type === "basic"){
                        //TODO Replace type "simple" with basic for consistency
                        materialRepo.addAt(new Material(data[i].id, data[i].name, "#"+((1<<24)*Math.random()|0).toString(16), "simple", null, null, data[i].ont_term),0);
                    }
                }


                ////load all mix types
                //
                //for (var i = 0; i < data.length; i++) {
                //    if (data[i].type === "mix"){
                //        //console.log(data[i]);
                //        var composite_material_content = [];
                //        for (var j = 0; j < data[i].layers.length;j++){
                //            composite_material_content.push(materialRepo.materials[materialRepo.getIndexByID(data[i].layers[j].mtlid)]);
                //        }
                //        materialRepo.addAt(new Material(data[i].id, data[i].name, "#"+((1<<24)*Math.random()|0).toString(16), "composite", composite_material_content, null), 0);
                //    }
                //}


                //materialRepo.draw(materialRepoSvg, materialRepoVP, onSelectMaterial);




                if (debugging) console.log("Loading all Shell Templates");
                for (var i = 0; i < data.length; i++) {
                    if (data[i].type === "shell"){

                        //if (i === 10) continue;
                        //console.log(i, data[i]);

                        //console.log(data[i]);
                        // Create appropriate layers for the lyph

                        var layers_content= [];
                        for (var j = 0; j < data[i].layers.length;j++){

                            var materials = [];

                            for (var k =0; k < data[i].layers[j].materials.length; k++){
                                if (materialRepo && materialRepo.getIndexByID(data[i].layers[j].materials[k].id) > -1)
                                    materials.push(materialRepo.materials[materialRepo.getIndexByID(data[i].layers[j].materials[k].id)]);
                                else{
                                    materials.push(auRepo.auSet[auRepo.getIndexByID(data[i].layers[j].materials[k].id)]);
                                }
                            }

                            var newLayer  = null;
                            if (auRepo)
                                newLayer = new Layer(data[i].layers[j].id, data[i].layers[j].name, ((data[i].layers[j].thickness == "unspecified")? 1: data[i].layers[j].thickness), materials);
                            else
                                newLayer = new Layer(data[i].layers[j].id, data[i].layers[j].name, ((data[i].layers[j].thickness == "unspecified")? 1: data[i].layers[j].thickness), materials);
                            if (layerRepo == null){
                                layerRepo = new LayerRepo([newLayer]);
                            } else {
                                layerRepo.addAt(newLayer,0);
                            }

                            //layers.push(newLayer);
                            layers_content.push(newLayer);
                            newLayer = null;
                        }
                        //console.log(layers_content);
                        //create AU with the layers
                        var toto = new AsymmetricUnit(data[i].id, data[i].name, layers_content, (data[i].length && data[i].length != "unspecified") ? data[i].length : 1 , data[i].misc_materials, data[i].common_materials);


                        //console.log(toto);
                        if (auRepo == null) auRepo  = new AsymmetricUnitRepo([toto]);
                        else auRepo.addAt(toto,0);
                        //console.log(auRepo.auSet[0]);

                        //auRepo.draw(auRepoSvg, auRepoVP, onSelectAU);
                        //auRepo.draw(auMaterialRepoSvg, auRepoVP, onSelectMaterialAU);

                        //redraw_aurepos();
                        //sync_lyphTemplate_list();

                    }
                    //applyFilter();
                }



                if (auRepo != null ) {
                    auRepo.draw(auRepoSvg, auRepoVP, onSelectAU);
                    //redraw_aurepos();
                    selectedAU = auRepo.auSet[0];
                }

                //materialRepo.draw(materialRepoSvg, materialRepoVP, onSelectMaterial);
                //loadMaterialRepoToDatalist(materialRepo);


                if (selectedAU != null && selectedAU.layers != null && selectedAU.layers.length > 0)
                    selectedLayer = selectedAU.layers[0];

                if (materialRepo.materials != null && materialRepo.materials.length > 0)
                    selectedMaterial = materialRepo.materials[0];

                if (selectedAU != null) {
                    //syncSelectedAU();
                    //updateLayerParameters(selectedLayer);
                }


                //window.addEventListener("keydown", function (e) {onDocumentKeyDown(e);}, false);

                //console.log("LayerRepo:" , layerRepo);



            }
        });
    };



    refresh_graph = function refresh_graph(){
        //load_all_lyphs();
        selectedGraph.draw(svg, onSelectNode, onSelectLink, onSelectRectangle, refresh_graph, syncSelectedGraph);
        graphRepo.draw(graphRepoSvg, graphRepoVP, onSelectGraph, selectedGraph);

    }



    function load_all_lyphs (){
        lyphRepo.syncLyphsWithServer(syncLyphList);
    }

    function syncLyphList(){
        console.log("Syncing Lyph List with Server");
        $('#lyphList').empty();
        for (var i =0 ; i < lyphRepo.lyphs.length; i++){
            $('#lyphList').append('<option value=' + lyphRepo.lyphs[i].id + '> ' +lyphRepo.lyphs[i].name + "</option")
        }
    }


    $(function() {

        $( "#edgeDescription" ).autocomplete({
            source: function( request, response ) {
                $.ajax({
                    url: "http://open-physiology.org:5052/autocomplete-case-insensitive/" + request.term,
                    dataType: "jsonp",
                    data: {
                        q: request.term
                    },
                    success: function( data ) {
                        console.log(data);
                        response( data.Results);
                    }
                });
            },
            minLength: 1,
            select: function( event, ui ) {


                $.ajax
                ({
                    url:
                    "http://open-physiology.org:"+ serverPort + "/template/"+
                    encodeURIComponent(edgeDescription.value),
                    jsonp:
                        "callback",
                    dataType:
                        "jsonp",
                    success: function( response )
                    {
                        console.log("Request URL:", this.url);
                        var data = response;

                        if ( data.hasOwnProperty( "Error" ) )
                        {
                            console.log("Error:", data.Error);
                            return;
                        }

                        console.log("Response:" , data);
                        d3.select("#lyphFMA").property("value", data.ont_term);
                    }

                });

            },
            open: function() {
                $( this ).removeClass( "ui-corner-all" ).addClass( "ui-corner-top" );
            },
            close: function() {
                $( this ).removeClass( "ui-corner-top" ).addClass( "ui-corner-all" );
            }
        });
    });



    $(function() {

        $( "#lyphListBox" ).autocomplete({
            source: function( request, response ) {
                var serachPrefix = "";
                console.log(request.term.split(" - ")[1]);
                if (request.term.indexOf(" - ") > -1)
                    serachPrefix  =request.term.split(" - ")[1];
                else
                    serachPrefix  = request.term
                $.ajax({
                    url: "http://open-physiology.org:"+ serverPort +"/lyphs_by_prefix/?prefix=" + serachPrefix ,
                    dataType: "jsonp",
                    data: {
                        q: request.term
                    },
                    success: function( data ) {
                        $('#lyphListBox').data("", "-1");

                        console.log(data);
                        //console.log(lyphRepo.lyphs);
                        var returnedLyphs = [];

                        for (var i =0; i < data.length; i ++) {
                            var combinedlabel =data[i].id + " - " + data[i].name;
                            returnedLyphs.push({label:combinedlabel, id:data[i].id});

                            var indexAtRepo = lyphRepo.getIndexByID(data[i].id);
                            if (indexAtRepo > -1){
                                lyphRepo.lyphs[indexAtRepo] = data[i];
                            } else {
                                lyphRepo.lyphs.push(data[i]);
                            }
                        }

                        //console.log(lyphRepo.lyphs);
                        response(returnedLyphs);
                    }
                });
            },
            minLength: 0,
            select: function( event, ui ) {
                console.log(ui.item.id);

                $('#lyphListBox').data(ui.item.value, ui.item.id);
                console.log($('#lyphListBox').data(lyphListBox.value));


            },
            open: function() {
                $( this ).removeClass( "ui-corner-all" ).addClass( "ui-corner-top" );
            },
            close: function() {
                $( this ).removeClass( "ui-corner-top" ).addClass( "ui-corner-all" );
            }
        });
    });





    load_all_lyphs();
    load_all_materials();
    load_all_graphs();


}();









