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
        updateNodeParameter(selectedGraph.selected_node);
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

    function updateNodeParameter(node){
        if (node != null){
            d3.select("#nodeName").property("value",node.name);
        } else {
            d3.select("#nodeName").property("value","");
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

    d3.select("#nodeDelete").on("click", function() {
        //alert(selectedGraph.selected_node.name);
        if (selectedGraph.selected_node != null) {
            selectedGraph.deleteNode(selectedGraph.selected_node);
            selectedGraph.draw(svg, svgOffset, onSelectNode, onSelectLink);
        }
    })

    d3.select("#nodeUpdate").on("click", function() {
        if (selectedGraph.selected_node != null) {
            selectedGraph.selected_node.name = nodeName.value;
            //graph.id = graphID.value;
            //graph.name = graphName.value;
            graphRepo.draw(graphRepoSvg, graphRepoVP, onSelectGraph);
            selectedGraph.draw(svg, svgOffset, onSelectNode, onSelectLink);
        }
    })



    ///////////////////////////////
    /// File Import Setup
    ///////////////////////////////

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
            var file = evt.target.files[0];
            var nodes= [];
            var link = [];
            //console.log(file);

            d3.csv(file.name, function(data) {
                var dataset = data.map(function(d) { return [ d["node1"] , d["node2"], d["entity"] ]; });
                if (graphRepo.getIndexByID(dataset[0][2]) > -1 ){
                    alert('This entity is already loaded!');
                } else {
                    // It is possible to combine these two loops to make the code faster
                    for (var i = 0; i < dataset.length; i++) {
                        if (doesNodesContainNode(nodes, dataset[i][0]) == null) {
                            nodes.push(new Node(nodes.length, dataset[i][0], 50 * (nodes.length + 1), 50 * (nodes.length + 1), null));
                        }
                        if (doesNodesContainNode(nodes, dataset[i][1]) == null) {
                            nodes.push(new Node(nodes.length, dataset[i][1], 50 * (nodes.length + 1), 50 * (nodes.length + 1), null));
                        }
                    }

                    for (var i = 0; i < dataset.length; i++) {
                        link.push(new Link(nodes[getNodePosition(nodes, dataset[i][0])], nodes[getNodePosition(nodes, dataset[i][1])]));

                    }
                    var graphImported = new Graph(dataset[0][2], dataset[0][2]+"_import", nodes, link);
                    graphRepo.addAt(graphImported,0);
                    graphRepo.draw(graphRepoSvg, graphRepoVP, onSelectGraph);

                    //Todo : Update the selected graph following import.
                }
            });

            // function to check whether node has already been loaded
            var doesNodesContainNode = function(nodes, name){
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

            //console.log(graphRepo.graphs.length);


        }
    }


    ///////////////////////////////
    /// File Import Setup
    ///////////////////////////////
    //console.log(selectedGraph.links);


    var fname = selectedGraph.name+".csv";

    //var csvContent = "data:text/csv;charset=utf-8,";
    var csvContent ="";
    $("#download").click(function(){
        var test_array = [["entity","node1","node2"]];
        for (i =0; i < selectedGraph.links.length;i++) {
            //console.log(selectedGraph.links[i].source.name);
            //console.log(selectedGraph.links[i].target.name);
            var newEntry = [selectedGraph.id,selectedGraph.links[i].source.name,selectedGraph.links[i].target.name];
            test_array.push(newEntry);
        }

        console.log(test_array);


        test_array.forEach(function(infoArray, index){
            dataString = infoArray.join(",");
            csvContent += dataString+ "\n";
        });

        //var encodedUri = encodeURI(csvContent);
        //window.open(encodedUri);

        var blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        if (navigator.msSaveBlob) { // IE 10+
            navigator.msSaveBlob(blob, filename);
        } else {
            var link = document.createElement("a");
            if (link.download !== undefined) { // feature detection
                // Browsers that support HTML5 download attribute
                var url = URL.createObjectURL(blob);
                link.setAttribute("href", url);
                link.setAttribute("download", fname);
                link.style = "visibility:hidden";
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        }

        csvContent ="";
    });



}();
