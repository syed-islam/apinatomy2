/**
 * Created by sislam on 25/01/15.
 */
$(document).ready(function() {

    // The event listener for the file upload
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


            var panelWidth = 300, panelHeight = 500;
            var graphRepoSvg = d3.select('#app-body .graphRepo').append("svg")
                .attr("width", panelWidth)
                .attr("height", panelHeight);
            var graphRepoVP = new VisualParameters("horizontal", 5, 20, panelWidth, panelHeight, 0);

            graphRepo.draw(graphRepoSvg, graphRepoVP, onSelectGraph);

            //selectedGraph = newGraph;
            //syncSelectedGraph();




        }
    }
});

