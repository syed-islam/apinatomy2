/**
 * Created by Natallia on 16/09/2014.
 */
// set up SVG for D3
var graphEditor = function () {
    var width = 950,
        height = 600;
    //Init visual parameters
    var panelWidth = 300, panelHeight = 500;

    var svg = d3.select('#app-body .graph')
        .append('svg')
        .attr('width', width)
        .attr('height', height);

    var mainVP = new VisualParameters("horizontal", 20, 20, width - 2 * panelWidth, height, 0);

    var auRepoSvg = d3.select('#app-body .auRepo').append("svg")
        .attr("width", panelWidth)
        .attr("height", panelHeight);

    var graphRepoSvg = d3.select('#app-body .graphRepo').append("svg")
        .attr("width", panelWidth)
        .attr("height", panelHeight);

    var auRepoVP = new VisualParameters("horizontal", 30, 5, panelWidth, panelHeight, 0);
    var graphRepoVP = new VisualParameters("horizontal", 5, 20, panelWidth, panelHeight, 0);

    //TODO: how to determine correct offset (top left position of svg) for correct drag-and-drop
    var svgOffset = [340, 70];

    ////////////////////////////////////////////////
    var selectedGraph = null;
    var selectedGraphNode = null;
    var selectedAUNode = null;
    var selectedAU = null;

    ///////////////////////////////////////////////////////
    //Demo
    ///////////////////////////////////////////////////////
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
        if (selectedGraph.selected_node){
            //Update node parameters (tree parameters)
            //Display tree
            if (selectedGraph.selected_node.tree){
                var treeVP = new TreeVisualParameters(width - 2 * panelWidth, height,
                        selectedGraph.selected_node.x - 150, selectedGraph.selected_node.y, 150, {x:-20, y:20});
                selectedGraph.selected_node.tree.draw(svg, treeVP);
            }
        } else {
            svg.select("g.tree").remove();
        }
    }

    var onSelectLink = function(d){
        if (selectedGraph.selected_link){
            //Update link parameters
            selectedAU = selectedGraph.selected_link.au;
            updateAUParameters(selectedAU);
        }
    }

    //////////////////////////////////////////////////////////
    graphRepo.draw(graphRepoSvg, graphRepoVP, onSelectGraph);
    auRepo.draw(auRepoSvg, auRepoVP, onSelectAU);

    selectedGraph = graphRepo.graphs[0];
    syncSelectedGraph();

    //////////////////////////////////
    //AU parameters
    //////////////////////////////////

    function updateAUParameters(au){
        if (au != null){
            d3.select("#auID").property("value", au.id);
            d3.select("#auName").property("value", au.name);
        } else {
            d3.select("#auID").property("value", "");
            d3.select("#auName").property("value", "");
        }
    }

    d3.select("#auUpdate").on("click", function() {
        if (selectedGraph.selected_link){
            selectedGraph.selected_link.au = selectedAU;
            selectedGraph.draw(svg, svgOffset, onSelectNode, onSelectLink);
        } else {
            alert("Error: Link is not selected!");
        }
    })

    d3.select("#auRestore").on("click", function() {
        if (selectedGraph.selected_link){
            selectedAU = selectedGraph.selected_link.au;
            updateAUParameters(selectedAU);
        }
    })

    d3.select("#auDelete").on("click", function() {
        if (selectedGraph.selected_link) {
           if (confirm("Delete associated AU?")) {
               selectedGraph.selected_link.au = null;
               selectedAU = null;
               updateAUParameters(selectedAU);
               selectedGraph.draw(svg, svgOffset, onSelectNode, onSelectLink);
           }
        }
    })

    //////////////////////////////////
    //Graph parameters
    //////////////////////////////////
    function syncSelectedGraph(){
        selectedGraph.draw(svg, svgOffset, onSelectNode, onSelectLink);
        updateGraphParameters(selectedGraph);
    }

    function updateGraphParameters(graph){
        if (graph != null){
            d3.select("#graphID").property("value", graph.id);
            d3.select("#graphName").property("value", graph.name);
        }
    }

    function updateGraph(graph){
        graph.id = graphID.value;
        graph.name = graphName.value;
        graphRepo.draw(graphRepoSvg, graphRepoVP, onSelectGraph);
    }

    function cloneGraph(graph){
        if (graphRepo.getIndexByID(graphID.value) > -1){
            alert("Cannot create a new graph: another graph with such ID exists!");
            return;
        }
        var newGraph = null;
        if (graph != null){
            newGraph = graph.clone();
            newGraph.id = graphID.value;
            newGraph.name = graphName.value;
        }
        else newGraph = new Graph(graphID.value, graphName.value, [], []);
        graphRepo.addAt(newGraph, 0);
        graphRepo.draw(graphRepoSvg, graphRepoVP, onSelectGraph);
        selectedGraph = newGraph;
        syncSelectedGraph();
    }

    d3.select("#graphClone").on("click", function() {
        cloneGraph(selectedGraph);
    })

    d3.select("#graphUpdate").on("click", function() {

        if (selectedGraph != null){
            if (graphID.value != selectedGraph.id && graphRepo.getIndexByID(graphID.value) > -1){
                alert("Cannot update graph: another graph with such ID exists!");
                return;
            }
            updateGraph(selectedGraph);
        } else {
            alert("Error: Graph is not selected!");
        }
    })

    d3.select("#graphRestore").on("click", function() {
        if (selectedGraph != null){
            updateGraphParameters(selectedGraph);
        }
    })

    d3.select("#graphDelete").on("click", function() {
        if (selectedGraph != null) {
            var index = graphRepo.getIndexByID(selectedGraph.id);
            if (index > -1) {
                if (confirm("Delete graph " + selectedGraph.id + "?")) {
                    graphRepo.removeAt(index);
                    if (graphRepo.graphs.length > 0) {
                        selectedGraph = graphRepo.graphs[0];
                        selectedGraph.draw(svg, svgOffset, onSelectNode, onSelectLink);
                    }
                    graphRepo.draw(graphRepoSvg, graphRepoVP, onSelectGraph);
                    updateGraphParameters(selectedGraph);
                }
            }
        }
    })


    //Syed Adding

    document.getElementById('txtFileUpload').addEventListener('change', upload, false);

    // Method that checks that the browser supports the HTML5 File API
    function browserSupportFileUpload() {
        var isCompatible = false;
        if (window.File && window.FileReader && window.FileList && window.Blob) {
            isCompatible = true;
        }
        return isCompatible;
    }

    // Method that reads and processes the selected file
    function upload(evt) {
        if (!browserSupportFileUpload()) {
            alert('The File APIs are not fully supported in this browser!');
        } else {
            alert('here we go!');
            var file = evt.target.files[0];



            var nodes= [];
            var link = [];
            d3.csv("Test.csv", function(data) {
                var dataset = data.map(function(d) { return [ d["node1"] , d["node2"]]; });

                for (var i =0; i < dataset.length; i++){
                    if (doesNodesContainNode(nodes,dataset[i][0]) ==  null ) {
                        nodes.push(new Node(nodes.length, dataset[i][0], 50 * (nodes.length + 1), 50 * (nodes.length + 1), null));
                    }
                    if (doesNodesContainNode(nodes,dataset[i][1]) ==  null ) {
                        nodes.push(new Node(nodes.length, dataset[i][1], 50 * (nodes.length + 1), 50 * (nodes.length + 1), null));
                    }
                }

                for (var i =0; i < dataset.length; i++){
                    link.push(new Link(nodes[getNodePosition(nodes,dataset[i][0])], nodes[getNodePosition(nodes,dataset[i][1])]));

                }
            });


            var doesNodesContainNode = function(nodes, name){
                for (i =0; i < nodes.length; i++){
                    //console.log(nodes[i].name + "==" + name);
                    if (nodes[i].name === name){
                        return nodes[i];
                    }
                }
                return null;
            };

            var getNodePosition = function (nodes, name){
                for (i =0; i < nodes.length; i++){
                    if (nodes[i].name === name){
                        return i;
                    }
                }
                return null;
            };

            console.log(graphRepo.graphs.length);

            var graphImported = new Graph("Imported", "Import", nodes, link);
            graphRepo.addAt(graphImported,0);

            console.log(graphRepo.graphs.length);
            //var panelWidth = 300, panelHeight = 500;
            //var graphRepoSvg = d3.select('#app-body .graphRepo').append("svg")
            //    .attr("width", panelWidth)
            //    .attr("height", panelHeight);
            //var graphRepoVP = new VisualParameters("horizontal", 5, 20, panelWidth, panelHeight, 0);

            graphRepo.draw(graphRepoSvg, graphRepoVP, onSelectGraph);

            //selectedGraph = newGraph;
            //syncSelectedGraph();




        }
    }


}();
