// TODO: This part is the driver from the graph-construction.js

var refresh_graph;
var selectedAU = null;

var graphEditor = function () {


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
        if (this != selectedGraphNode){
            d3.select(this).style("stroke", "red");
            d3.select(selectedGraphNode).style("stroke", "black");
            selectedGraphNode = this;
            selectedGraph = d;
            syncSelectedGraph();
        }
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
        //console.log(d)
        if (d){
            //Update link parameters
            updateEdgeParameters(d);
            selectedAU = d.au;
            updateAUParameters(selectedAU);
            $('#userconsole').text("Edge " + d.edgeid + " selected");


        }
    }

    function updateEdgeParameters(edge){
        console.log("Updating edge parameter:" , edge);

        edge.edgeid != null ? d3.select("#edgeID").property("value", edge.edgeid) : d3.select("#edgeID").property("value", "")
        edge.type != null ? d3.select("#edgeType").property("value", edge.type) : d3.select("#edgeType").property("value", "")
        edge.description != null ? d3.select("#edgeDescription").property("value", edge.description) : d3.select("#edgeDescription").property("value", "");
        edge.annotations != null ? d3.select("#edgeAnnotation").property("value", edge.annotations) :d3.select("#edgeAnnotation").property("value", "");
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
            d3.select("#graphID").property("value", graph.id);
            d3.select("#graphName").property("value", graph.name);
        }
    }


    d3.select("#graphClone").on("click", function() {
        cloneGraph(selectedGraph);
    })


    d3.select("#assignRectangleLyph").on("click", function(){
        selectedGraph.selected_rectangle.lyphID = $('#rectangleID').val().trim();
        selectedGraph.selected_rectangle.lyphName = $('#rectangleName').val().trim();
        console.log(selectedGraph.selected_rectangle)
        refresh_graph();
    })

    d3.select("#searchRectangleLyph").on("click", function() {

        $('#userconsole').text("Searching for lyph: " + $("#rectangleID").val().trim());

        //send ajax request
        $.ajax
        ({
            context: this,
            url:
            "http://open-physiology.org:5055/lyph/" +
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

        //send ajax request
        $.ajax
        ({
            context: this,
            url:
            "http://open-physiology.org:5055/lyphpath/" +
            "?fromlyph=" + $('#startLyph').val().trim() +
            "&tolyph=" + $('#endLyph').val().trim() +
            "&numpaths=" + numPaths
            ,

            jsonp: "callback",

            dataType: "jsonp",


            success: function (response) {
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

                    selectedGraph.draw(svg, onSelectNode, onSelectLink, onSelectRectangle);

                }



            }
        });

    })




    d3.select("#annotationHighligh").on("click", function() {
        console.log("Highlight Annotations");
        for (var i =0 ; i < selectedGraph.links.length; i++){

            console.log(selectedGraph.links[i].annotations);
                selectedGraph.links[i].highlighted = false;
            if (selectedGraph.links[i].annotations){
                if (selectedGraph.links[i].annotations.indexOf($("#highlightAnnotation").val().trim()) > -1)
                   selectedGraph.links[i].highlighted = true;
            }
            //if (selectedGraph.links[i].annotations.contains($("#highlightAnnotation").val().trim()))
            //   selectedGraph.links[i].highlighted = true;
            //else
            //    selectedGraph.links[i].highlighted = false;
        }
        selectedGraph.draw(svg, onSelectNode, onSelectLink, onSelectRectangle);
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
        selectedGraph.draw(svg, onSelectNode, onSelectLink, onSelectRectangle);
    }






    d3.select("#graphNew").on("click", function(){
        console.log("new Graph");
        var nodes = [];
        var edges = [];
        var id = null;
        var newGraph = null;
        var rectangles = []

        //nodes.push(new Node("1", ".", 200, 200, null, true));

        newGraph = new Graph (graphRepo.graphs.length, graphRepo.graphs.length, nodes, edges, rectangles);
        graphRepo.addAt(newGraph, 0);
        selectedGraph = graphRepo.graphs[0];
        //graphRepo.draw(graphRepoSvg, graphRepoVP, onSelectGraph);
        refresh_graph();
        console.log(graphRepo);

    });



    function cloneGraph(graph){
        //if (graphRepo.getIndexByID(graphID.value) > -1){
        //    alert("Cannot create a new graph: another graph with such ID exists!");
        //    return;
        //}

        var newGraph = null;
        if (graph != null){
            newGraph = graph.clone();
            newGraph.id = graphID.value+"_cloned";
            newGraph.name = graphName.value+"_cloned";
        }
        else newGraph = new Graph(graphID.value, graphName.value, [], [], []);
        graphRepo.addAt(newGraph, 0);
        graphRepo.draw(graphRepoSvg, graphRepoVP, onSelectGraph);
        selectedGraph = newGraph;
        syncSelectedGraph();
    }

    d3.select("#graphSave").on("click",function(){
        var actualSelectedGraphIndex = graphRepo.getIndexByID(selectedGraph.id);
        //console.log(actualSelectedGraphIndex);


        var query = "http://open-physiology.org:5055/makeview/?"
        for (var i =0; i < selectedGraph.nodes.length ; i++){
            query += "&node" + (i + 1)+ "="+ encodeURIComponent(selectedGraph.nodes[i].name);
            query += "&x"+ (i + 1) +"="+ encodeURIComponent(selectedGraph.nodes[i].x);
            query += "&y"+ (i + 1) +"="+encodeURIComponent(selectedGraph.nodes[i].y);
        }

        console.log(selectedGraph);

        for (var i =0; i < selectedGraph.rectangles.length; i++){
            query += "&lyph"+ (i + 1) +"="+encodeURIComponent(selectedGraph.rectangles[i].lyphID)
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
                graphRepo.graphs[actualSelectedGraphIndex].id = response.id;
                refresh_graph();
            }
        });


    })


    function syncSelectedGraph(){
        selectedGraph.draw(svg, onSelectNode, onSelectLink, onSelectRectangle);
        updateGraphParameters(selectedGraph);
    }

    d3.select("#auUpdate").on("click", function() {
        if (selectedGraph.multiple_selection.length > 0){
            for (var i =0; i < selectedGraph.multiple_selection.length; i ++){
                console.log(selectedGraph.multiple_selection[i]);
                selectedGraph.multiple_selection[i].au = selectedAU;
                selectedGraph.draw(svg, onSelectNode, onSelectLink, onSelectRectangle);

                $.ajax
                ({
                    url:
                    "http://open-physiology.org:5054/assignlyph/"+
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
            selectedGraph.draw(svg, onSelectNode, onSelectLink, onSelectRectangle);


            console.log(selectedAU.id, selectedGraph.selected_link.edgeid);

            // ajax call to update the lyph assignment
            $.ajax
            ({
                url:
                "http://open-physiology.org:5054/assignlyph/"+
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
            "http://open-physiology.org:5055/annotate/"+
            "?lyph="+ encodeURIComponent(selectedGraph.selected_link.edgeid) +
            "&annot="+encodeURIComponent($("#edgeAnnotation").val().trim()),

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

    d3.select("#edgeSave").on("click", function(){
        console.log("Selected link:", selectedGraph.selected_link);
        var actualEdge = selectedGraph.selected_link;
        var edgeType = $("#edgeType").val().trim();
        var edgeName = $("#edgeDescription").val().trim();
        var fromNode = selectedGraph.selected_link.source ;
        var toNode = selectedGraph.selected_link.target;
        var edgeLyphID = $("#auID").val().trim();

        console.log("EdgeSave:", edgeType, edgeName, fromNode, toNode, edgeLyphID);


        //Update the local data
        selectedGraph.selected_link.au = auRepo.auSet[auRepo.getIndexByID($("#auID").val().trim())];
        selectedGraph.selected_link.type = $("#edgeType").val().trim();
        selectedGraph.selected_link.description = $("#edgeDescription").val().trim();
        selectedGraph.selected_link.annotations = $("#edgeAnnotation").val().trim();

        // ajax call to create a lyphedge
        $.ajax
        ({
            url:
            "http://open-physiology.org:5055/makelyph/"+
            "?type="+ encodeURIComponent($("#edgeType").val().trim())+
            "&name="+ encodeURIComponent($("#edgeDescription").val().trim())+
            "&from="+ encodeURIComponent(selectedGraph.selected_link.source.name)+
            "&to="+ encodeURIComponent(selectedGraph.selected_link.target.name)+
            "&template="+ encodeURIComponent($("#auID").val().trim())
            ,

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
    });

    var addEdgeAnnotations = function addEdgeAnnotations (id, annotations){
        $.ajax
        ({
            url:
            "http://open-physiology.org:5055/annotate/"+
            "?lyphs=" + id +
            "&annot=" + annotations
            ,

            jsonp: "callback",

            dataType: "jsonp",


            success: function (response) {
                response;


                if (response.hasOwnProperty("Error")) {
                    console.log("Edge creation error:" , response);
                    return;
                }

                console.log("Response:", response);

                //addEdgeAnnotations(response.id, $("#edgeAnnotation").val().trim() );
                //actualEdge.edgeid = response.id;
                refresh_graph();
            }
        });
    }






    var load_all_graphs = function load_all_graphs(){
        console.log("Loading existing views");

        // ajax call to load all graph view
        $.ajax
        ({
            url:"http://open-physiology.org:5055/all_lyphviews/",

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

                    //load view meta data
                    id = response[i].id;


                    newGraph = new Graph(id, id, nodes, edges, rectangles);



                    //load rectangles
                    for (var j =0; j < response[i].lyphs.length; j++){
                        rectangles.push(new Rectangle(response[i].lyphs[j].id, parseInt(response[i].lyphs[j].x), parseInt(response[i].lyphs[j].y),parseInt(response[i].lyphs[j].width), parseInt(response[i].lyphs[j].height), response[i].lyphs[j].id, ""));
                    }

                    populateRectangleNames(rectangles);

                    //load nodes
                    for (var j =0; j < response[i].nodes.length; j++){
                        nodes.push(new Node(response[i].nodes[j].id, response[i].nodes[j].id, parseInt(response[i].nodes[j].x), parseInt(response[i].nodes[j].y), null, true, response[i].nodes[j].location, response[i].nodes[j].loctype));
                    }


                    //load edges
                    for (var j =0; j < response[i].nodes.length; j++){
                        //console.log(response[i].nodes[j].exits.length)
                        for (var k =0; k < response[i].nodes[j].exits.length; k++){
                            //console.log(response[i].nodes[j].id);
                            //console.log("source", newGraph.nodes[newGraph.getNodeIndexByID(response[i].nodes[j].id)]);
                            //console.log("target", newGraph.nodes[newGraph.getNodeIndexByID(response[i].nodes[j].exits[k].to)]);
                            //console.log("au", (response[i].nodes[j].exits[k].via.lyph)? auRepo.auSet[auRepo.getIndexByID(response[i].nodes[j].exits[k].via.lyph)] : null);
                            //console.log("type", response[i].nodes[j].exits[k].via.type );
                            //console.log("description", response[i].nodes[j].exits[k].via.name );
                            //console.log("fma",response[i].nodes[j].exits[k].via.fma );



                            var newEdge = new Link(
                                newGraph.nodes[newGraph.getNodeIndexByID(response[i].nodes[j].id)],
                                newGraph.nodes[newGraph.getNodeIndexByID(response[i].nodes[j].exits[k].to)],
                                (response[i].nodes[j].exits[k].via.template)? auRepo.auSet[auRepo.getIndexByID(response[i].nodes[j].exits[k].via.template.id)]: null,
                                response[i].nodes[j].exits[k].via.type,
                                response[i].nodes[j].exits[k].via.id,
                                response[i].nodes[j].exits[k].via.name,
                                response[i].nodes[j].exits[k].via.fma,
                                null,
                                null,
                                false,
                                function(){
                                    //console.log("in");
                                    console.log("Looking", response[i].nodes[j].exits[k].via.annots.length, response[i].nodes[j].exits[k].via.annots[0]);
                                    var annotations = "";
                                    for (var ai = 0; ai < response[i].nodes[j].exits[k].via.annots.length; ai++){
                                        annotations = annotations + response[i].nodes[j].exits[k].via.annots[ai].obj + " ";
                                        //annotations += response[i].nodes[j].exits[k].vai.annots[ai].obj;
                                    }
                                    //console.log("Annnots" , annotations)
                                    return annotations.trim();
                                }()
                                //j % 2 ===0 ?true: false
                            );
                            edges.push(newEdge);
                        }
                    }




                    //console.log("Edges", edges);
                    newGraph.selected_link = newGraph.links[0];
                    newGraph.selected_node = newGraph.nodes[0];
                    newGraph.selected_rectangle = newGraph.rectangles[0];
                    //console.log(newGraph.rectangles[0]);

                    console.log("New Graph:", newGraph);

                    graphRepo.addAt(newGraph,0);


                    selectedGraph = graphRepo.graphs[0];
                    selectedGraph.draw(svg, onSelectNode, onSelectLink, onSelectRectangle);
                    graphRepo.draw(graphRepoSvg, graphRepoVP, onSelectGraph);
                    updateGraphParameters(selectedGraph);


                }

                console.log(graphRepo);
                //console.log(response);
                //
                //graphRepo.graphs[actualSelectedGraphIndex].id = response.id;
                //refresh_graph();
            }
        });


    }


    function populateRectangleNames(rectangles){
        for (var i =0; i < rectangles.length; i++){

            (function () {
                //$('#userconsole').text("Searching for lyph: " + $("#rectangleID").val().trim());
                var rect= rectangles[i];

                //send ajax request
                $.ajax
                ({

                    context: this,
                    url: "http://open-physiology.org:5055/lyph/" +
                    rect.id,

                    jsonp: "callback",

                    dataType: "jsonp",


                    success: function (response) {
                        //console.log(response);

                        if (response.hasOwnProperty("Error")) {
                            console.log("Lyph not found", response);
                            $('#userconsole').text(response.Error);
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
            "http://open-physiology.org:5054/lyphpath/" +
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
                selectedGraph.draw(svg, onSelectNode,onSelectLink,onSelectRectangle);
                graphRepo.draw(graphRepoSvg, graphRepoVP, onSelectGraph);
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

        console.log("Loading existing lyphs")
        $.ajax
        ({
            url:
                "http://open-physiology.org:5055/all_templates/",
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
                    if ( path.Error == "No path found" )
                        alert( "No path found" );
                    else
                        alert( "Error: " + path.Error );

                    return;
                }

                console.log("Lyph Loaded");



                //Todo: We should only make a single pass through the dataset.
                //load all basic types
                for (var i = 0; i < data.length; i++) {
                    if (data[i].type === "basic"){
                        materialRepo.addAt(new Material(data[i].id, data[i].name, "#"+((1<<24)*Math.random()|0).toString(16), "simple", null, null),0);
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




                //load all shell types
                for (var i = 0; i < data.length; i++) {
                    if (data[i].type === "shell"){
                        //console.log(data[i]);
                        // Create appropriate layers for the lyph
                        //if (i === 10) continue;
                        console.log(i);

                        var layers_content= [];
                        for (var j = 0; j < data[i].layers.length;j++){
                            //TODO

                            //console.log(data[i].layers[j])
                            var newLayer  = null;
                            if (auRepo)
                                newLayer = new Layer(data[i].layers[j].id, data[i].layers[j].mtlname, ((data[i].layers[j].thickness == "unspecified")? 1: data[i].layers[j].thickness), (materialRepo.getIndexByID(data[i].layers[j].mtlid) > auRepo.getIndexByID(data[i].layers[j].mtlid)) ? materialRepo.materials[materialRepo.getIndexByID(data[i].layers[j].mtlid)] : auRepo.auSet[auRepo.getIndexByID(data[i].layers[j].mtlid)]);
                            else
                                newLayer = new Layer(data[i].layers[j].id, data[i].layers[j].mtlname, ((data[i].layers[j].thickness == "unspecified")? 1: data[i].layers[j].thickness), materialRepo.materials[materialRepo.getIndexByID(data[i].layers[j].mtlid)]);
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
                        var toto = new AsymmetricUnit(data[i].id, data[i].name, layers_content, 1);


                        //console.log(toto);
                        if (auRepo == null) auRepo  = new AsymmetricUnitRepo([toto]);
                        else auRepo.addAt(toto,0);
                        //console.log(auRepo.auSet[0]);

                        auRepo.draw(auRepoSvg, auRepoVP, onSelectAU);
                        //auRepo.draw(auMaterialRepoSvg, auRepoVP, onSelectMaterialAU);
                        //redraw_aurepos();
                    }
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

                load_all_graphs();

            }
        });
    };



    refresh_graph = function refresh_graph(){
        selectedGraph.draw(svg, onSelectNode, onSelectLink, onSelectRectangle);
        graphRepo.draw(graphRepoSvg, graphRepoVP, onSelectGraph);

    }
    load_all_materials();


}();









