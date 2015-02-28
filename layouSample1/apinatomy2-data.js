/**
 * Created by Natallia on 05/11/2014.
 */

/////////////////////////////////////////////
//Data structures
/////////////////////////////////////////////

//create material
function Material(id, name, colour, type, children, au) {

    this.id = id;
    this.name = name;
    this.colour = colour;
    this.type = type;
    this.children = children;
    this.au = au;

    this.clone = function () {
        var newMaterial = new Material(this.id, this.name, this.colour, this.type, this.children.slice(0), this.au);
        return newMaterial;
    }

    this.draw = function (svg, vp, onClick) {
        svg.selectAll("g.node").remove();

        var i = 0, duration = 400, root;
        var tree = d3.layout.tree().nodeSize([0, 20]);
        var duration = 750;
        var diagonal = d3.svg.diagonal().projection(function(d) { return [d.y, d.x]; });

        this.x0 = 0;
        this.y0 = 0;
        update(root = this);

        function update(source) {
            var nodes = tree.nodes(root);
            var height = Math.max(vp.height, nodes.length * vp.widthScale + vp.margin);

            d3.select("svg").transition()
                .duration(duration)
                .attr("height", height);

            d3.select(self.frameElement).transition()
                .duration(duration)
                .style("height", height + "px");

            // Compute the "layout".
            nodes.forEach(function(n, i) {
                n.x = i * vp.widthScale;
            });

            // Update the nodes…
            var node = svg.selectAll("g.node").data(nodes, function(d) { return d.id || (d.id = ++i); });

            var nodeEnter = node.enter().append("g")
                .attr("class", "node")
                .attr("transform", function(d) { return "translate(" + source.y0 + "," + source.x0 + ")"; });


            // Enter any new nodes at the parent's previous position.
            nodeEnter.append("rect")
                .attr("y", -vp.widthScale / 2)
                .attr("height", vp.widthScale)
                .attr("width", vp.lengthScale)
                .style("fill", function(d) {return d.colour;})
                .on("click", function(d){
                    onClick(this, d);
                    click(d);
                });

            nodeEnter.append("text")
                .attr("dy", 3.5)
                .attr("dx", 5.5)
                .text(function(d) { return d.id + " - " + d.name; });

            // Transition nodes to their new position.
            nodeEnter.transition()
                .duration(duration)
                .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; })
                .style("opacity", 1);

            node.transition()
                .duration(duration)
                .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; })
                .style("opacity", 1)
                .select("rect")
                .style("fill", function(d) {return d.colour;});

            // Transition exiting nodes to the parent's new position.
            node.exit().transition()
                .duration(duration)
                .attr("transform", function(d) { return "translate(" + source.y + "," + source.x + ")"; })
                .style("opacity", 1e-6)
                .remove();

            // Update the links…
            var link = svg.selectAll("path.link")
                .data(tree.links(nodes), function(d) { return d.target.id; });

            // Enter any new links at the parent's previous position.
            link.enter().insert("path", "g")
                .attr("class", "link")
                .attr("d", function(d) {
                    var o = {x: source.x0, y: source.y0};
                    return diagonal({source: o, target: o});
                })
                .transition()
                .duration(duration)
                .attr("d", diagonal);

            // Transition links to their new position.
            link.transition()
                .duration(duration)
                .attr("d", diagonal);

            // Transition exiting nodes to the parent's new position.
            link.exit().transition()
                .duration(duration)
                .attr("d", function(d) {
                    var o = {x: source.x, y: source.y};
                    return diagonal({source: o, target: o});
                })
                .remove();

            // Stash the old positions for transition.
            nodes.forEach(function(d) {
                d.x0 = d.x;
                d.y0 = d.y;
            });
        }

        // Toggle children on click.
        function click(d) {
            if (d.children) {
                d._children = d.children;
                d.children = null;
            } else {
                d.children = d._children;
                d._children = null;
            }
            update(d);
        }
    }

    //TODO - replace with recursive search for a descendant
    this.getChildIndex = function(childID){
        if (children  != null)
            for (var i = 0; i < children.length; i++) {
                if (children[i].id == childID) return i;
            }
        return -1;
    }

    this.addChildAt = function(child, index){
        console.log(child);
        console.log(index);
        console.log(children);
        if (children  == null) children = [];
        children.splice(index, 0, child);
        console.log(children);
    }

    this.removeChildAt = function(index){
        //console.log(children);
        if (children != null)
            if (index > -1) {
                children.splice(index, 1);
            }

        ////special case when deleting the last item
        //if (children.length == 0){
        //    children = [];
        //} else {
        //    console.log(children);
        //}

    }

    this.replaceChildAt = function(child, index){
        if (children != null)
            children.splice(index, 1, child);
    }


    this.saveMaterialToDatabase = function() {
        var query;
        var xmlhttp;
        query = 'http://open-physiology.org:5054//makelyph/?name=' + encodeURIComponent(this.name) + '&type=' + encodeURIComponent("mix");
        //query += '&layer'+i+'='+encodeURIComponent(layer_ids[i]);
        console.log(query);

    }












}

function LayerRepo(layers){
    this.layers = layers;

    this.getIndexByID = function (id){
        for (var i =0; i < layers.length; i++){
            if (layers[i].id == id) return i;
        }
        return -1;
    }

    this.getNumberOfLayers = function () {
        return layers.length;
    }

    this.addAt = function (layer, index){
        layers.splice(index, 0, layer);
    }

    this.containsLayer = function(thickness, material){
        console.log(layers);
        for (var i =0; i < layers.length; i++){
            if (layers[i].thickness == thickness && layers[i].material.id == material.id) return i;
        }
        return -1;
    }




}

//create layer
function Layer(id, name, thickness, material) {
    this.id = id;
    this.name = name;
    this.thickness = thickness;
    this.material = material;



    //function ajax_create_layer () {
       this.ajx_sync_layer = $.ajax
        ({
            context: this,
            url:
            "http://open-physiology.org:5054/makelayer/" +
            "?material=" + this.material.id +
            "&thickness=" + this.thickness +
            "&color=" + this.material.color ,

            jsonp: "callback",

            dataType: "jsonp",


            success: function (response) {
                response;

                if (response.hasOwnProperty("Error")) {
                   console.log("Layer creation error:" , response);
                    return;
                }

                //console.log("Layer Created", response);

                //layerRepo.layers[layerRepo.containsLayer(response.thickness, materialRepo.materials[materialRepo.getIndexByID(response.mtlid)])].id = response.id;
                this.id = response.id;

                if (typeof 'rehashaueditor' == 'function') {
                    rehashaueditor();
                };

            },
            async:   false
        });



    this.clone = function () {
        var newLayer = new Layer(this.id, this.name, this.thickness, this.material);
        return newLayer;
    }
}

//create Asymmetric Unit
function AsymmetricUnit(id, name, layers, length){
    this.id = id;
    this.name = name;
    this.layers = layers;
    this.length = length;

    this.clone = function(){
        var newAU = new AsymmetricUnit(this.id, this.name, this.layers.slice(0), this.length);
        return newAU;
    }

    this.getNumberOfLayers = function(){
        return layers.length;
    }

    this.getLayerIndex = function(layerID){
        for (var i = 0; i < layers.length; i++) {
            if (layers[i].id == layerID) return i;
        }
        return -1;
    }

    this.addLayerAt = function(layer, index){
        //insert layer to the position 'index'
        layers.splice(index, 0, layer);
    }

    this.removeLayerAt = function(index){
        //remove layer from position 'index'
        if (index > -1) {
            layers.splice(index, 1);
        }
    }

    this.replaceLayerAt = function(layer, index){
        //insert layer to the position i
        layers.splice(index, 1, layer);
    }

    this.getTotalWidth = function(widthScale){
        var res = 0;
        for (var i = 0; i < layers.length; i++){
            res += layers[i].thickness * widthScale;
        }
        return res;
    }

    //Draw AU
    this.draw = function(svg, vp, onClick) {
        var au = this;
        svg.selectAll('rect').remove();
        svg.selectAll('text').remove();
        var prev = vp.margin;
        var attr_width = "width", attr_height = "height", attr_x = "x", attr_y = "y";
        if (vp.orientation == "vertical"){
            attr_width = "height";
            attr_height = "width";
            attr_x = "y";
            attr_y = "x";
        }

        //Draw base
        var baseLength = 0;
        if (au != null) baseLength = au.length;
        svg.append("rect")
            .style("fill", "black")
            .attr(attr_width, baseLength * vp.lengthScale)
            .attr(attr_height, vp.margin);
        if (au == null) return;

        //Draw AU
        svg.selectAll("chart")
            .data(au.layers)
            .enter().append("rect")
            .style("fill", function (d) { console.log(d.material); if (d.material.colour == undefined) return "#888888"; return d.material.colour;})
            .style("fill-opacity" , function (d){if (d.material.colour == undefined)  return 0.5 ; return 1.0})
            .attr(attr_width, function (d) {return au.length * vp.lengthScale;})
            .attr(attr_height, function (d) {return d.thickness * vp.widthScale;})
            .attr(attr_x, function () { return 0;})
            .attr(attr_y, function (d, i) { prev += d.thickness * vp.widthScale; return prev - d.thickness * vp.widthScale;})
            .on("click", onClick);
        //Add labels
        prev = vp.margin;
        svg.selectAll("chart")
            .data(au.layers)
            .enter().append("text")
            .attr("class", "labelText")
            .attr(attr_x, function (d, i) {
                var offset = 0;
                if (vp.orientation == "vertical") offset = 20 * (i % 2);
                return au.length * vp.lengthScale / 2 + offset;})
            .attr(attr_y, function (d) {
                prev += d.thickness * vp.widthScale;
                return prev - d.thickness * vp.widthScale / 2;})
            .text(function(d, i) {  return d.material.id + " - " + d.name});
    }
}

//define visualization settings
function VisualParameters(orientation, lengthScale, widthScale, width, height, margin){
    this.orientation = orientation;
    this.lengthScale = lengthScale;
    this.widthScale = widthScale;
    this.width = width;
    this.height = height;
    this.margin = margin;
}

//repository of AUs
function AsymmetricUnitRepo(auSet){
    this.auSet = auSet;

    this.getIndexByID = function(id){
        if (auSet != null)
            for (var i = 0; i < auSet.length; i++){
                if (auSet[i].id == id) return i;
            }
        return -1;
    }

    this.isUsedMaterialID = function(id){
        if (auSet != null)
            for (var i = 0; i < auSet.length; i++){
                for (var j = 0; j < auSet[i].layers.length; j++){
                   if (auSet[i].layers[j].material.id == id) return i;
                }
            }
        return -1;
    }

    this.getNumberOfAUs = function(){
        if (auSet == null) return 0;
        return auSet.length;
    }

    this.addAt = function(au, index){
        if (auSet == null) auSet = [];
        auSet.splice(index, 0, au);
    }

    this.removeAt = function(index){
        if (auSet != null && index > -1) {
            auSet.splice(index, 1);
        }
    }

    this.replaceAt = function(au, index){
        if (auSet != null)
            auSet.splice(index, 1, au);
    }

    //Load AUs from the repository
    this.draw = function(svg, vp, onClick) {
        var auRepo = this;
        svg.selectAll('rect').remove();
        svg.selectAll('text').remove();
        var delta = 10; //distance between icons
        var maxWidth = vp.widthScale, maxLength = vp.lengthScale;
        if (auRepo == null) return;
        if (auRepo.auSet.length == 0) return;
        for (var j = 0; j < auRepo.auSet.length; j++) {
            maxWidth = Math.max(maxWidth, auRepo.auSet[j].getTotalWidth(vp.widthScale));
            //maxLength = Math.max(maxLength, auRepo.auSet[j].length * vp.lengthScale);
        }
        for (var j = 0; j < auRepo.auSet.length; j++){
            var yPosition = j * (maxWidth + delta);
            var prev = yPosition;
            svg.selectAll("auRepo")
                .data(auRepo.auSet[j].layers)
                .enter().append("rect")
                .style("fill", function (d) { if (d.material.colour == undefined) return "#888888"; return d.material.colour;})
                .attr("width", function (d) {return /*auRepo.auSet[j].length * */ vp.lengthScale;})
                .attr("height", function (d) {return d.thickness * vp.widthScale;})
                .attr("x", function () { return delta})
                .attr("y", function (d, i) { prev += d.thickness * vp.widthScale; return 10 + prev - d.thickness * vp.widthScale;});
        }
        svg.selectAll("auRepo")
            .data(auRepo.auSet)
            .enter().append("rect")
            .style("fill", "white")
            .style("stroke-width", 0.5)
            .style("stroke", "black")
            .attr("width", vp.width - maxLength - 2 * delta)
            .attr("height", function(d){return (d.getTotalWidth(vp.widthScale) > 10) ? d.getTotalWidth(vp.widthScale) : 15 ;})
            .attr("x", maxLength + 2 * delta)
            .attr("y", function(d, i){return 10 + (i * (maxWidth + delta));})
            .on("click", onClick);
        svg.selectAll("auRepo")
            .data(auRepo.auSet)
            .enter().append("text")
            .attr("x", maxLength + 2 * delta + 5)
            .attr("y", function(d, i){return 15+ (i * (maxWidth + delta) + d.getTotalWidth(vp.widthScale) / 2);})
            .text(function(d){return d.id + " - " + d.name;})
    }
}

//repository of materials
function MaterialRepo(materials){
    this.materials = materials;

    this.getIndexByID = function(id){
        for (var i = 0; i < materials.length; i++){
            if (materials[i].id == id) return i;
        }
        return -1;
    }

    this.getNumberOfMaterials = function(){
        return materials.length;
    }

    this.addAt = function(material, index){
        materials.splice(index, 0, material);
    }

    this.removeAt = function(index){
        if (index > -1) {
            materials.splice(index, 1);
        }
    }

    this.replaceAt = function(material, index){
        materials.splice(index, 1, material);
    }

    this.draw = function(svg, vp, onClick){
        var materialRepo = this;
        svg.selectAll('rect').remove();
        svg.selectAll('text').remove();
        var delta = 10; //distance between icons
        if (materialRepo == null) return;
        svg.selectAll("materialRepo")
            .data(materialRepo.materials)
            .enter().append("rect")
            .style("fill", function (d) {return d.colour;})
            .attr("width", vp.lengthScale)
            .attr("height", vp.widthScale)
            .attr("x", delta)
            .attr("y", function (d, i) { return i * (vp.widthScale + delta);});
        svg.selectAll("materialRepo")
            .data(materialRepo.materials)
            .enter().append("rect")
            .style("fill", "white")
            .style("stroke-width", 0.5)
            .style("stroke", "black")
            .attr("width", vp.width - vp.lengthScale - 2 * delta)
            .attr("height", vp.widthScale)
            .attr("x", vp.lengthScale + 2 * delta)
            .attr("y", function(d, i){return i * (vp.widthScale + delta);})
            .on("click", onClick);
        svg.selectAll("materialRepo")
            .data(materialRepo.materials)
            .enter().append("text")
            .attr("x", vp.lengthScale + 2 * delta + 5)
            .attr("y", function(d, i){return i * (vp.widthScale + delta) + vp.widthScale / 2;})
            .text(function(d){return d.id + " - " + d.name;})
    }
}

function TreeNode(id, name, parent, children){
    this.id = id;
    this.name = name;
    this.parent = parent;
    this.children = children;
}

function TreeVisualParameters(width, height, x0, y0, depthScale, offset){
    this.width = width;
    this.height = height;
    this.x0 = x0;
    this.y0 = y0;
    this.depthScale = depthScale;
    this.offset = offset;
}

function Tree(root){
    this.root = root;
    this.levels = 2;
    this.branching = 2;

    this.draw = function(svg, vp) {
         var root = this.root, duration = 400, i = 0;
         var tree = d3.layout.tree().size([vp.width, vp.height]);
         var diagonal = d3.svg.diagonal().projection(function(d) { return [d.x, d.y]; });
         svg = svg.append("g").attr('class', 'tree').attr("transform", "translate(" +
             (vp.x0 + vp.offset.x)+ "," + (vp.y0 + vp.offset.y) + ")");
         update(root);

         function update(source) {
             svg.select("g.tree").remove();

             var nodes = tree.nodes(root).reverse(),
                 links = tree.links(nodes);

             // Normalize for fixed-depth.
             nodes.forEach(function (d) {
                 d.y = d.depth * vp.depthScale;
             });

             // Update the nodes…
             var node = svg.selectAll("g.nodeTree")
                 .data(nodes, function (d) {
                     return d.id || (d.id = ++i);
                 });

             // Enter any new nodes at the parent's previous position.
             var nodeEnter = node.enter().append("g")
                 .attr("class", "nodeTree")
                 .attr("transform", function (d) {
                     return "translate(" + source.x0 + "," + source.y0 + ")";
                 })
                 .on("click", click);

             nodeEnter.append("circle")
                 .attr("r", 1e-6)
                 .style("fill", function (d) {
                     return d._children ? "lightsteelblue" : "#fff";
                 });

             nodeEnter.append("text")
                 .attr("x", function (d) {
                     return d.children || d._children ? -15 : 15;
                 })
                 .attr("dy", ".35em")
                 .attr("text-anchor", function (d) {
                     return d.children || d._children ? "end" : "start";
                 })
                 .text(function (d) {
                     return d.name;
                 })
                 .style("fill-opacity", 1e-6);


             // Transition nodes to their new position.
             var nodeUpdate = node.transition()
                 .duration(duration)
                 .attr("transform", function (d) {
                     return "translate(" + d.x + "," + d.y + ")";
                 });

             nodeUpdate.select("circle")
                 .attr("r", 10)
                 .style("fill", function (d) {
                     return d._children ? "lightsteelblue" : "#fff";
                 });

             nodeUpdate.select("text")
                 .style("fill-opacity", 1);


             // Transition exiting nodes to the parent's new position.
             var nodeExit = node.exit().transition()
                 .duration(duration)
                 .attr("transform", function (d) {
                     return "translate(" + source.x + "," + source.y + ")";
                 })
                 .remove();

             nodeExit.select("circle")
                 .attr("r", 1e-6);

             nodeExit.select("text")
                 .style("fill-opacity", 1e-6);

             // Update the links…
             var link = svg.selectAll("path.linkTree")
                 .data(links, function (d) {
                     return d.target.id;
                 });

             // Enter any new links at the parent's previous position.
             link.enter().insert("path", "g")
                 .attr("class", "linkTree")
                 .attr("d", function (d) {
                     var o = {x: source.x0, y: source.y0};
                     return diagonal({source: o, target: o});
                 });

             // Transition links to their new position.
             link.transition()
                 .duration(duration)
                 .attr("d", diagonal);

             // Transition exiting nodes to the parent's new position.
             link.exit().transition()
                 .duration(duration)
                 .attr("d", function (d) {
                     var o = {x: source.x, y: source.y};
                     return diagonal({source: o, target: o});
                 })
                 .remove();

             // Stash the old positions for transition.
             nodes.forEach(function (d) {
                 d.x0 = d.x;
                 d.y0 = d.y;
             });
         }

        // Toggle children on click.
        function click(d) {
            if (d.children) {
                d._children = d.children;
                d.children = null;
            } else {
                d.children = d._children;
                d._children = null;
            }
            update(d);
        }
     }
}

//graph node
function Node(id, name, x, y, tree, fixed){
    this.id = id;
    this.name = name;
    this.x = x;
    this.y = y;
    this.tree = tree;
    this.fixed = fixed;
}

//graph link
function Link(source, target, au,type, edgeid, description, fma, left, right){
    this.source = source;
    this.target = target;
    this.au = au;
    this.type = type;
    this.edgeid = edgeid;
    this.description = description;
    this.fma = fma;
    this.left = left;
    this.right = right;
}


//repository of Graphs
function GraphRepo(graphs){
    this.graphs = graphs;

    this.getIndexByID = function(id){
        for (var i = 0; i < graphs.length; i++){
            if (graphs[i].id == id) return i;
        }
        return -1;
    }

    this.addAt = function(graph, index){
        graphs.splice(index, 0, graph);
    }

    this.removeAt = function(index){
        if (index > -1) {
           graphs.splice(index, 1);
        }
    }

    this.replaceAt = function(graph, index){
        graphs.splice(index, 1, graph);
    }

    this.draw = function(svg, vp, onClick){
        var graphRepo = this;
        svg.selectAll('rect').remove();
        svg.selectAll('text').remove();
        if (graphRepo == null) return;
        var delta = 10; //distance between icons
        svg.selectAll("graphRepo")
            .data(graphRepo.graphs)
            .enter().append("rect")
            .style("fill", "white")
            .style("stroke-width", 0.5)
            .style("stroke", "black")
            .attr("width", vp.width - vp.lengthScale)
            .attr("height", vp.widthScale)
            .attr("x", vp.lengthScale)
            .attr("y", function(d, i){return i * (vp.widthScale + delta);})
            .on("click", onClick);
        svg.selectAll("graphRepo")
            .data(graphRepo.graphs)
            .enter().append("text")
            .attr("x", vp.lengthScale + 5)
            .attr("y", function(d, i){return i * (vp.widthScale + delta) + vp.widthScale / 2;})
            .text(function(d){return d.id + " - " + d.name;})
    }
}




//TODO: This part will go into the api2.data.js
// set up initial nodes and links
//  - nodes are known by 'id', not by index in array.
//  - fixed nodes (as a bold red circle).
//  - links are always source < target; edge directions are set by 'left' and 'right'.

function Graph(id, name, nodes, links) {

    this.id = id;
    this.name = name;
    this.nodes = nodes;
    this.links = links;
    var lastNodeId = nodes.length - 1;

    this.selected_node = null;
    this.selected_link = null;

    this.multiple_selection = [];

    var colors = d3.scale.category10();

    //TODO: Add multiple select ability from the other code.

    this.clone = function () {
        var newGraph = new Graph(this.id, this.name, this.nodes.slice(0), this.links.slice(0));
        return newGraph;
    }



    this.draw = function (svg, onSelectNode, onSelectLink) {
        var width = parseInt(svg.attr("width"));
        var height = parseInt(svg.attr("height"));
        var nodeRadius =12;
        var graph = this;

        multiple_selected_node_1 = null;
        multiple_selected_node_2 = null;

        //console.log(onSelectNode);

        // mouse event vars

            var mousedown_link = null,
            mousedown_node = null,
            mouseup_node = null;



        // init D3 force layout
        var force = d3.layout.force()
            .nodes(nodes)
            .links(links)
            .size([width, height])
            .linkDistance(150)
            .charge(-250)
            //.gravity(-0.12)
            .on('tick', tick)

        var customDrag = force.drag()
            .on("drag", dragmove)
            .on("dragend", dragended);

        function dragended(d) {
            d.fixed = true;
        }

        function dragmove(d) {
            //console.log(d.px);
            if (d.px > width - nodeRadius) d.px = width - nodeRadius;
            if (d.px < 0 + nodeRadius) d.px = nodeRadius;
            if (d.py > height - nodeRadius) d.py = height - nodeRadius;
            if (d.py < 0 + nodeRadius) d.py = nodeRadius;
            restart();
            //if(d.px > length) d.px = length;
            //if(d.py > width) d.py = width;
            //if(d.py > length) d.py = length;
        }

        // define arrow markers for graph links
        svg.append('svg:defs').append('svg:marker')
            .attr('id', 'end-arrow')
            .attr('viewBox', '0 -5 10 10')
            .attr('refX', 6)
            .attr('markerWidth', 3)
            .attr('markerHeight', 3)
            .attr('orient', 'auto')
            .append('svg:path')
            .attr('d', 'M0,-5L10,0L0,5')
            .attr('fill', '#000');

        svg.append('svg:defs').append('svg:marker')
            .attr('id', 'start-arrow')
            .attr('viewBox', '0 -5 10 10')
            .attr('refX', 4)
            .attr('markerWidth', 3)
            .attr('markerHeight', 3)
            .attr('orient', 'auto')
            .append('svg:path')
            .attr('d', 'M10,-5L0,0L10,5')
            .attr('fill', '#000');

        // line displayed when dragging new nodes
        var drag_line = svg.append('svg:path')
            .attr('class', 'link dragline hidden')
            .attr('d', 'M0,0L0,0');

        // handles to link and node element groups
        var path = svg.append('g').attr('class', 'graph').selectAll('path'),
            circle = svg.append('g').attr('class', 'graph').selectAll('g'),
            labels = svg.append('g').attr('class', 'graph').selectAll('text'),
            auIcon = svg.append('g').attr('class','graph').selectAll('rect');
            //au_layers = svg.append('g').attr('class','graph').selectAll('.layer');





        function resetMouseVars() {
            mousedown_node = null;
            mouseup_node = null;
            mousedown_link = null;
        }

        // update force layout (called automatically each iteration)
        function tick() {

            circle.attr('transform', function (d) {
                //return 'translate(' + Math.min(d.x, width -10)  + ',' + Math.max(d.y, 0+10) + ')';
                return 'translate(' + Math.max(nodeRadius*2, Math.min(width - nodeRadius*2, d.x)) + ',' + Math.max(nodeRadius*2, Math.min(height - nodeRadius*2, d.y)) + ')';

            });

            // draw directed edges with proper padding from node centers
            path.attr('d', function (d) {
                var deltaX = d.target.x - d.source.x,
                    deltaY = d.target.y - d.source.y,
                    dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY),
                    normX = deltaX / dist,
                    normY = deltaY / dist,
                    sourcePadding = d.left ? 17 : nodeRadius,
                    targetPadding = d.right ? 17 : nodeRadius,
                    sourceX = d.source.x + (sourcePadding * normX),
                    sourceY = d.source.y + (sourcePadding * normY),
                    targetX = d.target.x - (targetPadding * normX),
                    targetY = d.target.y - (targetPadding * normY);
                return 'M' + sourceX + ',' + sourceY + 'L' + targetX + ',' + targetY;
            });


            labels.attr("x", function(d){
                //adding x, y property to layers
                //console.log(d);
                if (d.au) {
                    d.au.layers.sourcex = d.source.x;
                    d.au.layers.sourcey = d.source.y;
                    d.au.layers.targetx = d.target.x;
                    d.au.layers.targety = d.target.y;
                }

                //console.log ("changed", d);
                return (d.source.x + d.target.x) /2;})
                .attr("y", function(d){return (d.source.y + d.target.y) /2;})

            //auIcon.attr("x", function(d){ return (d.source.x + d.target.x) /2;})
            //    .attr("y", function(d){return ((d.source.y+ + d.target.y) /2) + 10;})

            auIcon.attr("transform", function (d) {
                return "translate(" + (d.target.x + d.source.x) / 2 + "," + (d.target.y + d.source.y) / 2 + ")";
            });

            //restart();


        }

        // update graph (called when needed)
        var restart = function restart() {
            svg.selectAll('g.graph').remove();

            circle = svg.append('g').attr('class', 'graph').selectAll('g');
            path = svg.append('g').attr('class', 'graph').selectAll('path');
            labels = svg.append('g').attr('class', 'graph').selectAll('text');
            auIcon = svg.append('g').attr('class','graph').selectAll('rect');

            //svg.selectAll("path.link").remove();
            //svg.selectall("").remove();
            //path = svg.append('g').attr('class', 'graph');






            // circle (node) group
            // NB: the function arg is crucial here! nodes are known by id, not by index!
            circle = circle.data(nodes, function (d) {
                return d.id;
            });

            // update existing nodes
            circle.selectAll('circle')
                .style('fill', function (d) {
                    return (d === selected_node) ? d3.rgb(colors(d.id)).brighter().toString() : colors(d.id);
                })
                .classed('fixed', function (d) {
                    return d.fixed;
                });

            // add new nodes
            var g = circle.enter().append('svg:g');

            g.append('svg:circle')
                .attr('class', 'node')
                .attr('r', nodeRadius)
                .style('fill', function (d) {
                    return (d === graph.selected_node) ? d3.rgb(colors(d.id)).brighter().toString() : colors(d.id);
                })
                .style('stroke', function (d) {
                    return d3.rgb(colors(d.id)).darker().toString();
                })
                .classed('fixed', function (d) {
                    return d.fixed;
                })
                .on('mouseover', function (d) {
                    if (!mousedown_node || d === mousedown_node) return;
                    // enlarge target node
                    d3.select(this).attr('transform', 'scale(1.1)');
                })
                .on('mouseout', function (d) {
                    if (!mousedown_node || d === mousedown_node) return;
                    // unenlarge target node
                    d3.select(this).attr('transform', '');
                })
                .on('mousedown', function (d) {

                    if (d3.event.keyCode == 68) return;

                    // select node
                    mousedown_node = d;
                    if (mousedown_node === graph.selected_node) {
                        graph.selected_node = null;
                        $("#ins").text("Deselected node:" + d.id);
                    }
                    else {
                        graph.selected_node = mousedown_node;
                        $("#ins").text("Selected node:" + d.id);
                    }
                    graph.selected_link = null;

                    // reposition drag line
                    drag_line
                        .style('marker-end', 'url(#end-arrow)')
                        .classed('hidden', false)
                        .attr('d', 'M' + mousedown_node.x + ',' + mousedown_node.y + 'L' + mousedown_node.x + ',' + mousedown_node.y);
                    onSelectNode(d);
                    restart();
                })
                .on('mouseup', function (d) {

                    if (!mousedown_node) return;

                    // needed by FF
                    drag_line
                        .classed('hidden', true)
                        .style('marker-end', '');

                    // check for drag-to-self
                    mouseup_node = d;
                    if (mouseup_node === mousedown_node) {
                        resetMouseVars();
                        return;
                    }

                    // unenlarge target node
                    d3.select(this).attr('transform', '');

                    // add link to graph (update if exists)
                    // NB: links are strictly source < target; arrows separately specified by booleans
                    var source, target, direction;
                    if (mousedown_node.id < mouseup_node.id) {
                        source = mousedown_node;
                        target = mouseup_node;
                        //direction = 'right';
                    } else {
                        source = mouseup_node;
                        target = mousedown_node;
                        //direction = 'left';
                    }

                    var link;
                    link = links.filter(function (l) {
                        return (l.source === source && l.target === target);
                    })[0];

                    if (link) {
                        link[direction] = true;
                    } else {
                        //link = {source: source, target: target, left: false, right: false};
                        link = new Link(source, target, null,".",".","...", "..", false, false),
                            link[direction] = true;
                        links.push(link);
                    }

                    // select new link
                    graph.selected_link = link;
                    graph.selected_node = null;
                    restart();
                })
                .append("svg:title")
                .text(function(d){return "Name:"+ d.name;});
            ;

            // show node IDs
            g.append('svg:text')
                .attr('x', 0)
                .attr('y', 4)
                .attr('class', 'id')
                .text(function (d) {
                    return d.name;
                });

            // remove old nodes
            circle.exit().remove();




            auIcon = auIcon.data(links);

            auIcon = auIcon.enter().append("g")
            //    .attr("transform", function (d) {
            //        return "translate(" + (d.target.x + d.source.x) / 2 + "," + (d.target.y + d.source.y) / 2 + ")";
            //    });

            auIcon.selectAll(".layer")
                .data(function (d){
                    if (d.au){
                        return d.au.layers;
                    }
                    return [];
                }).enter() //we just started an iteration over layers
                .append("rect")
                .attr("height", function (d) {return d.thickness * 5;})
                .attr("width", function (d) {return  15;})
                .attr("x", function(d){return 0;})
                .attr("y", function(d, i){ return ((i+1) * 5);})
                //.attr("y", function (d, i) {
                //    if (i ==0) prev =0; // reset the starting y for layers for each link
                //    prev += d.thickness * layerHeight; //remember the relative Y coordinate of the current layer
                //
                //    return prev - d.thickness * layerHeight;
                //})
                .style("fill", function (d) {
                    if (d.material.colour == undefined) return "#888888"; return d.material.colour;
                })
                .attr("class", "layer")
            ;


            //var au_layers = auIcon.enter().append("g");
            //
            //console.log(au_layers);
            //    au_layers.selectAll(".layer")
            //    .data(function (d){
            //        if (d.au) {
            //            for (var i = 0; i < d.au.layers.length; i++) {
            //                d.au.layers[i].x = 0;
            //                //console.log(d.au.layers[i]);
            //                d.au.layers[i].y = (i + 1) * 10;
            //            }
            //            console.log("Updating layers:", d.au.layers);
            //            return d.au.layers;
            //        }
            //        return [];
            //    }).enter()
            //    .append('text')
            //    .attr("x", function(d, i) {d.x;/*return (d.source.y + d.target.y) / 2;*/ })
            //    .attr("y", function(d, i ) {d.y; })
            //    .attr("text-anchor", "middle")
            //    .text(function(d) {return "help" });







            labels = labels.data(links);

            labels.enter().append('text')
                .attr("x", function(d) { return (d.source.y + d.target.y) / 2; })
                .attr("y", function(d) { return (d.source.x + d.target.x) / 2; })
                .attr("text-anchor", "middle")
                .text(function(d) {if (d.au) return d.au.id; });


            // path (link) group
            path = path.data(links);

            // update existing links
            path = path.classed('selected', function (d) {
                return d === graph.selected_link;
            })
                //.style('marker-start', function (d) {
                //    return d.left ? 'url(#start-arrow)' : '';
                //})
                //.style('marker-end', function (d) {
                //    return d.right ? 'url(#end-arrow)' : '';
                //});


            // add new links
           path.enter().append('path')
                .attr('class', 'link')
                .classed('selected', function (d) {
                    return d === graph.selected_link;
                })
                //.attr('d', function (d) {
                //    var deltaX = d.target.x - d.source.x,
                //        deltaY = d.target.y - d.source.y,
                //        dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY),
                //        normX = deltaX / dist,
                //        normY = deltaY / dist,
                //        sourcePadding = 12,
                //        targetPadding = 12,
                //        sourceX = d.source.x + (sourcePadding * normX),
                //        sourceY = d.source.y + (sourcePadding * normY),
                //        targetX = d.target.x - (targetPadding * normX),
                //        targetY = d.target.y - (targetPadding * normY);
                //    return 'M' + sourceX + ',' + sourceY + 'L' + targetX + ',' + targetY;
                //})
                .on('mousedown', function (d) {
                    if (d3.event.ctrlKey) return;

                    // select link
                    mousedown_link = d;
                    if (mousedown_link === graph.selected_link) {
                        graph.selected_link = null;
                        $("#ins").text("Deselected Link:" + d.id);
                    } else {
                        graph.selected_link = mousedown_link;
                        $("#ins").text("Selected Link: [" + d.source.id + "," + d.target.id + "]");
                    }
                    graph.selected_node = null;
                    onSelectLink(d);
                    restart();
                })
                .append("svg:title")
                .text(function(d) {
                    //console.log(d.au);
                    var s = "Edge ID:" + d.edgeid + "\n";
                    s += "Description:" + d.description + "\n";
                    s += "FMA:" + d.fma+ "\n";
                    if (d.au)
                        s += "AU:" + d.au.id + "\n";
                    s += "Type:" + d.type+ "\n";
                    return s;

                })
            ;

            //path.append('text')
            //    .attr('x', function (d) {
            //        return (d.target.x + d.source.x)/2;
            //    })
            //    .attr('y', function (d) {
            //        return (d.target.y + d.source.y)/2;
            //    })
            //    .attr('class', 'au')
            //    .text(function (d) {
            //        //return "test";
            //        if (d.au)
            //            return d.au.id;
            //    });


            // remove old links
            path.exit().remove();




            // set the graph in motion
            force.start();
        }

        function mousedown() {
            // prevent I-bar on drag
            //d3.event.preventDefault();

            // because :active only works in WebKit?
            svg.classed('active', true);

            if (d3.event.keyCode == 68 || mousedown_node || mousedown_link) return;

            // insert new node at point
            var point = d3.mouse(this),
                node = new Node(++lastNodeId,".", 100,100,null,false);
            node.x = point[0];
            node.y = point[1];
            nodes.push(node);

            restart();

            //ajax call to create new node.
            //function ajax_create_new_node () {
            $.ajax
            ({
                url:
                    "http://open-physiology.org:5054/makelyphnode/" ,

                jsonp: "callback",

                dataType: "jsonp",


                success: function (response) {
                    response;

                    if (response.hasOwnProperty("Error")) {
                        console.log("Node creation error:" , response);
                        return;
                    }
                    node.name = response.id;

                    console.log(node.name);
                    restart();


                }
            });
        }

        function mousemove() {
            if (!mousedown_node) return;

            // update drag line
            drag_line.attr('d', 'M' + mousedown_node.x + ',' + mousedown_node.y + 'L' + d3.mouse(this)[0] + ',' + d3.mouse(this)[1]);

            restart();
        }

        function mouseup() {
            if (mousedown_node) {
                // hide drag line
                drag_line
                    .classed('hidden', true)
                    .style('marker-end', '');
            }

            // because :active only works in WebKit?
            svg.classed('active', false);

            // clear mouse event vars
            resetMouseVars();
        }

        function spliceLinksForNode(node) {
            var toSplice = links.filter(function (l) {
                return (l.source === node || l.target === node);
            });
            toSplice.map(function (l) {
                links.splice(links.indexOf(l), 1);
            });
        }

        // only respond once per keydown
        var lastKeyDown = -1;

        function keydown() {
            //d3.event.preventDefault();

            if (lastKeyDown !== -1) return;
            lastKeyDown = d3.event.keyCode;

            // ctrl
            if (d3.event.keyCode === 68) {
                //circle.call(force.drag);
                circle.call(customDrag);
                svg.classed('ctrl', true);
            }

            if (!graph.selected_node && !graph.selected_link) return;
            switch (d3.event.keyCode) {
                case 8: // backspace
                case 46: // delete
                    if (selected_node) {
                        nodes.splice(nodes.indexOf(selected_node), 1);
                        spliceLinksForNode(selected_node);
                    } else if (selected_link) {
                        links.splice(links.indexOf(selected_link), 1);
                    }
                    selected_link = null;
                    selected_node = null;
                    //lastNodeId--;
                    restart();
                    break;
                case 66: // B
                    if (selected_link) {
                        // set link direction to both left and right
                        selected_link.left = true;
                        selected_link.right = true;
                    }
                    restart();
                    break;
                case 76: // L
                    if (selected_link) {
                        // set link direction to left only
                        selected_link.left = true;
                        selected_link.right = false;
                    }
                    restart();
                    break;
                case 82: // R
                    if (selected_node) {
                        // toggle node fixed
                        selected_node.fixed = !selected_node.fixed;
                    } else if (selected_link) {
                        // set link direction to right only
                        selected_link.left = false;
                        selected_link.right = true;
                    }
                    restart();
                    break;
                case 70: //f
                    if (graph.selected_node) {
                        console.log(graph.selected_node.fixed);
                        if (graph.selected_node.fixed) {
                            graph.selected_node.fixed = false;
                        } else {
                            graph.selected_node.fixed = true;
                        }
                        console.log(graph.selected_node.fixed);
                    }
                    restart();
                    break;
                case 65: //A
                    if (!selected_link) {
                        console.log("Link not selected");
                        return;
                    } else {
                        breakLink();
                    }
                    restart();
                    break;
                case 67: //C

                    if (!selected_node) {
                        console.log("Node not selected");
                        return;
                    } else {
                        if (!multiple_selected_node_1) {
                            multiple_selected_node_1 = selected_node;
                            console.log(multiple_selected_node_1);
                            return;
                        } else {
                            multiple_selected_node_2 = selected_node;
                            console.log(multiple_selected_node_2)
                        }

                        if (multiple_selected_node_1 == multiple_selected_node_2) {
                            console.log("same node selected");
                            multiple_selected_node_1 = null;
                            multiple_selected_node_2 = null;
                        } else {
                            console.log("Find path")


                            //reset
                            multiple_selected_node_1 = null;
                            multiple_selected_node_2 = null;
                        }

                    }
                    break;

            }
        }


        //TODO: Improve the breakLink function
        function breakLink() {

            console.log(selected_link.source);
            console.log(selected_link.target);
            console.log(links.indexOf(selected_link));

            //store start and end nodes
            var startnode = selected_link.source;
            var lastnode = selected_link.target;


            //remove the link between then nodes
            links.splice(links.indexOf(selected_link), 1);

            //insert n nodes and edges
            for (var i = 0; i < 20; i++) {
                var generatedNode = {id: ++lastNodeId, fixed: false, x: 50, y: 50, weight: 1};
                nodes.push(generatedNode);
                links.push({source: startnode, target: generatedNode, left: false, right: true})
                startnode = generatedNode;
            }
            links.push({source: startnode, target: lastnode, left: false, right: true})

            //removing selection of link as the link no longer exists
            selected_link = null;


        }


        function keyup() {
            lastKeyDown = -1;

            // ctrl
            if (d3.event.keyCode === 68) {
                circle
                    .on('mousedown.drag', null)
                    .on('touchstart.drag', null);
                svg.classed('ctrl', false);
            }
        }

        // app starts here
        svg.on('mousedown', mousedown)
            .on('mousemove', mousemove)
            .on('mouseup', mouseup);
        d3.select(window)
            .on('keydown', keydown)
            .on('keyup', keyup);
        restart();
    }

}

