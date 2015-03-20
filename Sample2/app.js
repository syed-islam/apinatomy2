// TODO: This part is the driver from the graph-construction.js

var refresh_graph;

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
    }

    var onSelectLink = function(d){
        //console.log(d)
        if (d){
            //Update link parameters
            updateEdgeParameters(d);
            selectedAU = d.au;
            updateAUParameters(selectedAU);
        }
    }

    function updateEdgeParameters(edge){
        console.log("Updating edge parameter:" , edge);

        edge.edgeid != null ? d3.select("#edgeID").property("value", edge.edgeid) : d3.select("#edgeID").property("value", "")
        edge.type != null ? d3.select("#edgeType").property("value", edge.type) : d3.select("#edgeType").property("value", "")
        edge.description != null ? d3.select("#edgeDescription").property("value", edge.description) : d3.select("#edgeDescription").property("value", "");
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

    d3.select("#graphNew").on("click", function(){
        console.log("new Graph");
        var nodes = [];
        var edges = [];
        var id = null;
        var newGraph = null;

        //nodes.push(new Node("1", ".", 200, 200, null, true));

        newGraph = new Graph (graphRepo.graphs.length, graphRepo.graphs.length, nodes, edges);
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
        else newGraph = new Graph(graphID.value, graphName.value, [], []);
        graphRepo.addAt(newGraph, 0);
        graphRepo.draw(graphRepoSvg, graphRepoVP, onSelectGraph);
        selectedGraph = newGraph;
        syncSelectedGraph();
    }

    d3.select("#graphSave").on("click",function(){
        var actualSelectedGraphIndex = graphRepo.getIndexByID(selectedGraph.id);
        //console.log(actualSelectedGraphIndex);


        var query = "http://open-physiology.org:5054/makeview/?"
        for (var i =0; i < selectedGraph.nodes.length ; i++){
            query += "&node" + (i + 1)+ "="+ encodeURIComponent(selectedGraph.nodes[i].name);
            query += "&x"+ (i + 1) +"="+ encodeURIComponent(selectedGraph.nodes[i].x);
            query += "&y"+ (i + 1) +"="+encodeURIComponent(selectedGraph.nodes[i].y);
        }

        //console.log(query);

        // ajax call to save graph view
        $.ajax
        ({
            url:query,

            jsonp: "callback",

            dataType: "jsonp",


            success: function (response) {
                response;


                if (response.hasOwnProperty("Error")) {
                    console.log("Node creation error:" , response);
                    return;
                }

                console.log(response);
                graphRepo.graphs[actualSelectedGraphIndex].id = response.id;
                refresh_graph();
            }
        });


    })


    function syncSelectedGraph(){
        selectedGraph.draw(svg, onSelectNode, onSelectLink);
        updateGraphParameters(selectedGraph);
    }

    d3.select("#auUpdate").on("click", function() {
        if (selectedGraph.multiple_selection.length > 0){
            for (var i =0; i < selectedGraph.multiple_selection.length; i ++){
                console.log(selectedGraph.multiple_selection[i]);
                selectedGraph.multiple_selection[i].au = selectedAU;
                selectedGraph.draw(svg, onSelectNode, onSelectLink);

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
            selectedGraph.draw(svg, onSelectNode, onSelectLink);


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

        // ajax call to create a lyphedge
        $.ajax
        ({
            url:
            "http://open-physiology.org:5054/makelyphedge/"+
            "?type="+ encodeURIComponent($("#edgeType").val().trim())+
            "&name="+ encodeURIComponent($("#edgeDescription").val().trim())+
            "&from="+ encodeURIComponent(selectedGraph.selected_link.source.name)+
            "&to="+ encodeURIComponent(selectedGraph.selected_link.target.name)+
            "&lyph="+ encodeURIComponent($("#auID").val().trim())
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
                //actualEdge.edgeid = response.id;
                refresh_graph();
            }
        });
    });




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
                    //console.log(response[i]);
                    var nodes = [];
                    var edges = [];
                    var id = null;
                    var newGraph = null;

                    //load view meta data
                    id = response[i].id;


                    newGraph = new Graph(id, id, nodes, edges);

                    //load nodes
                    for (var j =0; j < response[i].nodes.length; j++){


                        //Testing Code
                            if (response[i].nodes[j].id === "50022481" || response[i].nodes[j].id === "50022493"){
                                nodes.push(new Node(response[i].nodes[j].id, response[i].nodes[j].id , parseInt(response[i].nodes[j].x), parseInt(response[i].nodes[j].y), null, true, undefined, undefined));
                            } else if(response[i].nodes[j].id === "50022482" || response[i].nodes[j].id === "50010931_0" || response[i].nodes[j].id === "50022480"){
                                nodes.push(new Node(response[i].nodes[j].id, response[i].nodes[j].id , parseInt(response[i].nodes[j].x), parseInt(response[i].nodes[j].y), null, true, undefined, undefined));
                            }
                        else {
                            nodes.push(new Node(response[i].nodes[j].id, response[i].nodes[j].id , parseInt(response[i].nodes[j].x), parseInt(response[i].nodes[j].y), null, true));
                        }

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
                                (response[i].nodes[j].exits[k].via.lyph)? auRepo.auSet[auRepo.getIndexByID(response[i].nodes[j].exits[k].via.lyph.id)]: null,
                                response[i].nodes[j].exits[k].via.type,
                                response[i].nodes[j].exits[k].via.id,
                                response[i].nodes[j].exits[k].via.name,
                                response[i].nodes[j].exits[k].via.fma,
                                null,
                                null,
                                j % 2 ===0 ?true: false
                            );
                            edges.push(newEdge);
                        }
                    }




                    //console.log("Edges", edges);
                    newGraph.selected_link = newGraph.links[0];
                    newGraph.selected_node = newGraph.nodes[0];

                    //console.log("New Graph:", newGraph);

                    graphRepo.addAt(newGraph,0);


                    selectedGraph = graphRepo.graphs[0];
                    selectedGraph.draw(svg, onSelectNode, onSelectLink);
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
                var graphAjax= new Graph("Subgraph_"+(graphRepo.graphs.length+1), startNode+" ---> "+endNode, nodes, link);

                ////adding graph, selecting graph, drawing graphrepo and graph.
                graphRepo.addAt(graphAjax,0);
                selectedGraph = graphRepo.graphs[0];
                selectedGraph.draw(svg, onSelectNode,onSelectLink);
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
                    //syncSelectedAU();
                    //updateLayerParameters(selectedLayer);
                }


                //window.addEventListener("keydown", function (e) {onDocumentKeyDown(e);}, false);

                //console.log("LayerRepo:" , layerRepo);

            }
        });
    };



    refresh_graph = function refresh_graph(){
        selectedGraph.draw(svg, onSelectNode, onSelectLink);
        graphRepo.draw(graphRepoSvg, graphRepoVP, onSelectGraph);

    }
    load_all_materials();
    load_all_graphs();

}();









