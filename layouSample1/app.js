// TODO: This part is the driver from the graph-construction.js

var graphEditor = function () {

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
    var selectedAU = null;




    //Handling user interactions through call back functions
    var onSelectAU = function(d){
        if (this != selectedAUNode){
            d3.select(this).style("stroke", "red");
            d3.select(selectedAUNode).style("stroke", "black");
            selectedAUNode = this;
            selectedAU = d;
            updateAUParameters(selectedAU);
        }
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
    graphRepo.draw(graphRepoSvg, graphRepoVP, onSelectGraph);
    if (auRepo != null)
        auRepo.draw(auRepoSvg, auRepoVP, onSelectAU);

    selectedGraph = graphRepo.graphs[0];
    syncSelectedGraph();


    function updateGraphParameters(graph){
        if (graph != null){
            d3.select("#graphID").property("value", graph.id);
            d3.select("#graphName").property("value", graph.name);
        }
    }


    function syncSelectedGraph(){
        selectedGraph.draw(svg);
        updateGraphParameters(selectedGraph);
    }






    var load_all_graphs = function load_all_graphs(){
        console.log("Loading existing views");

        // ajax call to load all graph view
        $.ajax
        ({
            url:"http://open-physiology.org:5054/all_lyphviews/",

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
                    console.log(response[i]);
                    var nodes = [];
                    var edges = [];
                    var id = null;
                    var newGraph = null;

                    //load view meta data
                    id = response[i].id;

                    //load nodes
                    for (var j =0; j < response[i].nodes.length; j++){
                        nodes.push(new Node(response[i].nodes[j].id, response[i].nodes[j].id , parseInt(response[i].nodes[j].x), parseInt(response[i].nodes[j].y, null)));
                    }

                    console.log("Nodes:", nodes);
                    newGraph = new Graph(id, id, nodes, edges);



                    //load edges
                    for (var j =0; j < response[i].nodes.length; j++){
                        //console.log(response[i].nodes[j].exits.length)
                        for (var k =0; k < response[i].nodes[j].exits.length; k++){
                            //console.log("source", newGraph.nodes[newGraph.getNodeIndexByID(response[i].nodes[j].id)]);
                            //console.log("target", newGraph.nodes[newGraph.getNodeIndexByID(response[i].nodes[j].exits[k].to)]);
                            //console.log("au", (response[i].nodes[j].exits[k].via.lyph)? auRepo.auSet[auRepo.getIndexByID(response[i].nodes[j].exits[k].via.lyph)] : null);
                            //console.log("type", response[i].nodes[j].exits[k].via.type );
                            //console.log("description", response[i].nodes[j].exits[k].via.name );
                            //console.log("fma",response[i].nodes[j].exits[k].via.fma );

                            var newEdge = new Link(
                                newGraph.nodes[newGraph.getNodeIndexByID(response[i].nodes[j].id)],
                                newGraph.nodes[newGraph.getNodeIndexByID(response[i].nodes[j].exits[k].to)],
                                (response[i].nodes[j].exits[k].via.lyph)? auRepo.auSet[auRepo.getIndexByID(response[i].nodes[j].exits[k].via.lyph.id)]: null,
                                response[i].nodes[j].exits[k].via.type,
                                response[i].nodes[j].exits[k].via.id,
                                response[i].nodes[j].exits[k].via.name,
                                response[i].nodes[j].exits[k].via.fma

                            );
                            edges.push(newEdge);
                        }
                    }




                    //console.log("Edges", edges);
                    newGraph.selected_link = newGraph.links[0];
                    newGraph.selected_node = newGraph.nodes[0];

                    console.log("New Graph:", newGraph);

                    graphRepo.addAt(newGraph,0);


                    selectedGraph = graphRepo.graphs[0];
                    selectedGraph.draw(svg, svgOffset, onSelectNode, onSelectLink, onMultipleEdgeSelect);
                    graphRepo.draw(graphRepoSvg, graphRepoVP, onSelectGraph);
                    updateGraphParameters(selectedGraph);


                }

                //console.log(response);
                //
                //graphRepo.graphs[actualSelectedGraphIndex].id = response.id;
                //refresh_graph();
            }
        });


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
                        nodes.push(new Node(nodes.length, path.edges[i].from.id, ((nodes.length +1) *200) , 200 , null, false));
                    }

                    if (doesNodesContainNode(nodes, path.edges[i].to.id) == null) {
                        nodes.push(new Node(nodes.length, path.edges[i].to.id, ((nodes.length +1) * 200), 200, null, false));
                    }
                }

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
                var graphAjax= new Graph("Subgraph_"+(graphRepo.graphs.length+1), startNode+" ---> "+endNode, nodes, link);

                ////adding graph, selecting graph, drawing graphrepo and graph.
                graphRepo.addAt(graphAjax,0);
                selectedGraph = graphRepo.graphs[0];
                selectedGraph.draw(svg);
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
                "http://open-physiology.org:5054/all_lyphs/",
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

                        var layers_content= [];
                        for (var j = 0; j < data[i].layers.length;j++){
                            //TODO

                            var newLayer  = null;
                            if (auRepo)
                                newLayer = new Layer(data[i].layers[j].id, data[i].layers[j].mtlname, ((data[i].layers[j].thickness == "unspecified")? 1: data[i].layers[j].thickness), (materialRepo.getIndexByID(data[i].layers[j].mtlid) > auRepo.getIndexByID(data[i].layers[j].mtlid)) ? materialRepo.materials[materialRepo.getIndexByID(data[i].layers[j].mtlid)] : auRepo.auSet[auRepo.getIndexByID(data[i].layers[j].mtlid)]   );
                            else
                                newLayer = new Layer(data[i].layers[j].id, data[i].layers[j].mtlname, ((data[i].layers[j].thickness == "unspecified")? 1: data[i].layers[j].thickness), materialRepo.materials[materialRepo.getIndexByID(data[i].layers[j].mtlid)]   );
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
                    syncSelectedAU();
                    updateLayerParameters(selectedLayer);
                }


                window.addEventListener("keydown", function (e) {onDocumentKeyDown(e);}, false);

                //console.log("LayerRepo:" , layerRepo);

            }
        });
    };


    load_all_materials();
    load_all_graphs();

}();









