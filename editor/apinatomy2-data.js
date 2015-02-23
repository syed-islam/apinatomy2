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
        $.ajax
        ({
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

                layerRepo.layers[layerRepo.containsLayer(response.thickness, materialRepo.materials[materialRepo.getIndexByID(response.mtlid)])].id = response.id;


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
            .style("fill", function (d) {return d.material.colour;})
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
            .text(function(d) { return d.id + " - " + d.name});
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
                .style("fill", function (d) {return d.material.colour;})
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
function Node(id, name, x, y, tree){
    this.id = id;
    this.name = name;
    this.x = x;
    this.y = y;
    this.tree = tree;
}

//graph link
function Link(source, target, au,type, edgeid, description, fma){
    this.source = source;
    this.target = target;
    this.au = au;
    this.type = type;
    this.edgeid = edgeid;
    this.description = description;
    this.fma = fma;
}

//create Graph
function Graph(id, name, nodes, links){
    this.id = id;
    this.name = name;
    this.nodes = nodes;
    this.links = links;

    this.selected_node = null;
    this.selected_link = null;
    this.multiple_select = [];

    var a_pressed = false;

    this.clone = function () {
        var newGraph = new Graph(this.id, this.name, this.nodes.slice(0), this.links.slice(0));
        return newGraph;
    }

    this.addLink = function(mousedown_node, mouseup_node, au){
        var source, target;
        if (mousedown_node.id < mouseup_node.id) {
            source = mousedown_node;
            target = mouseup_node;
        } else {
            source = mouseup_node;
            target = mousedown_node;
        }
        var link = links.filter(function (l) {
            return (l.source === source && l.target === target);
        })[0];

        if (!link) {
            link = new Link(source, target, au);
            links.push(link);
        }
        return link;
    }

    this.getMaxWidth = function(){
        var maxVal=0;
        for (var i =0; i < nodes.length; i++){
            if (nodes[i].x > maxVal) {
                maxVal = nodes[i].x;
            }
        }
        return maxVal;
    }

    this.getMaxHeight = function(){
        var maxVal=0;
        for (var i =0; i < nodes.length; i++){
            if (nodes[i].y > maxVal) {
                maxVal = nodes[i].y;
            }
        }
        return maxVal;
    }

    this.addNode = function(point){
        var nodeId = this.getNextID();
        var node = new Node(nodeId, "..." , point[0], point[1], null);
        nodes.push(node);

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


                refresh_graph();
            }
        });















    }

    this.deleteNode = function(node){
        nodes.splice(nodes.indexOf(node), 1);

        var toSplice = links.filter(function(l) {
            return (l.source === node || l.target === node);
        });
        toSplice.map(function(l) {
            links.splice(links.indexOf(l), 1);
        });
    }

    this.deleteLink = function(link){
        links.splice(links.indexOf(link), 1);
    }

    this.getNextID = function(){
        var freeIds = [];
        for (var i = 0; i < nodes.length; i++){
            freeIds[nodes[i].id] = true;
        }
        for (var i = 0; i < freeIds.length; i++){
            if (!freeIds[i]) return i;
        }
        return freeIds.length;
    }

    this.getNodeIndexByID = function (id){
        for (var i =0; i < nodes.length; i++){
            if (nodes[i].id === id)
                return i;
        }
        return -1;
    }

    this.getMultipleSection= function (){
        return this.multiple_select;
    }

    this.draw = function(svg, offset, onSelectNode, onSelectLink, onMultipleSelectEdge) {
        //console.log((this.getMaxX() +100) + " " + (this.getMaxY() +100) );
        svg.attr("height", this.getMaxHeight() < 540 ? 540 : this.getMaxHeight() +50);
        svg.attr("width", this.getMaxWidth() < 590 ? 590 : this.getMaxWidth() + 50);

        var colors = d3.scale.category10();
        var graph = this;
        var mousedown_link = null,
            mousedown_node = null,
            mouseup_node = null;

        function resetMouseVars() {
            mousedown_node = null;
            mouseup_node = null;
            mousedown_link = null;
        }

        var drag_line = svg.append('svg:path')
            .attr('class', 'link dragline hidden')
            .attr('d', 'M0,0L0,0');


        var path, circle;

        function update() {
            svg.selectAll('g.graph').remove();

            path = svg.append('g').attr('class', 'graph');
            circle = svg.append('g').attr('class', 'graph');
            circle = circle.selectAll('g').data(nodes, function (d) {return d.id;});
            circle.selectAll('circle')
                .style('fill', function (d) {
                    return (d === graph.selected_node) ? d3.rgb(colors(d.id)).brighter().toString() : colors(d.id);
                })
            ;


            var g = circle.enter().append('g').attr('class', 'graph');

            g.append('circle')
                .attr('class', 'node')
                .attr('r', 12)
                .attr('cx', function (d) {
                    return d.x;
                })
                .attr('cy', function (d) {
                    return d.y;
                })
                .style('fill', function (d) {
                    return (d === graph.selected_node) ? d3.rgb(colors(d.id)).brighter().toString() : colors(d.id);
                })
                .style('stroke', function (d) {
                    return d3.rgb(colors(d.id)).darker().toString();
                })
                .on('mousedown', function (d) {
                    if (d3.event.ctrlKey) return;
                    mousedown_node = d;
                    if (mousedown_node === graph.selected_node)
                        graph.selected_node = null;
                    else
                        graph.selected_node = mousedown_node;
                    graph.selected_link = null;
                    drag_line
                        .classed('hidden', false)
                        .attr('d', 'M' + mousedown_node.x + ',' + mousedown_node.y + 'L' + mousedown_node.x + ',' + mousedown_node.y);
                    onSelectNode();
                    update();
                })
                .on('mouseup', function (d) {
                    if (!mousedown_node) return;
                    drag_line.classed('hidden', true)
                    mouseup_node = d;
                    if (mouseup_node === mousedown_node) {
                        resetMouseVars();
                        return;
                    }
                    graph.selected_link = graph.addLink(mousedown_node, mouseup_node, null);
                    graph.selected_node = null;
                    update();
                })
                .append("svg:title")
                .text(function(d){return "Name:"+ d.name;});
            ;

            g.append('text')
                .attr('x', function (d) {
                    return d.x;
                })
                .attr('y', function (d) {
                    return d.y;
                })
                .attr('class', 'id')
                .text(function (d) {
                    return d.name;
                });

            // drawing paths
            path = path.selectAll('path').data(links);
            path.classed('selected', function (d) {
                return d === graph.selected_link;
            });

            path.enter().append('path')
                .attr('class', 'link')
                .classed('selected', function (d) {
                    console.log(graph.multiple_select.length === 0);
                    if (graph.multiple_select.length === 0)
                        return d === graph.selected_link;
                    else {
                        for (var i =0; i < graph.multiple_select.length; i++){
                            if (d === graph.multiple_select[i]) return true;
                        }
                            return false;
                    }

                })
                .style('stroke', function (d) {
                    return d3.rgb(colors(d.type));
                })
                .attr('d', function (d) {
                    var deltaX = d.target.x - d.source.x,
                        deltaY = d.target.y - d.source.y,
                        dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY),
                        normX = deltaX / dist,
                        normY = deltaY / dist,
                        sourcePadding = 12,
                        targetPadding = 12,
                        sourceX = d.source.x + (sourcePadding * normX),
                        sourceY = d.source.y + (sourcePadding * normY),
                        targetX = d.target.x - (targetPadding * normX),
                        targetY = d.target.y - (targetPadding * normY);
                    return 'M' + sourceX + ',' + sourceY + 'L' + targetX + ',' + targetY;
                })
                .on('mousedown', function (d) {
                    if (d3.event.ctrlKey) return;


                    mousedown_link = d;


                    // creating multiple selection
                    if (a_pressed){
                        graph.multiple_select.push(mousedown_link);
                        console.log(graph.multiple_select);
                        onMultipleSelectEdge();
                        update();
                        return;
                    }


                    if (mousedown_link === graph.selected_link)
                        graph.selected_link = null;
                    else
                        graph.selected_link = mousedown_link;
                    graph.selected_node = null;
                    onSelectLink();
                    update();
                })
                .append("svg:title")
                .text(function(d) {
                    var s = "Edge ID:" + d.edgeid + "\n";
                    s += "Description:" + d.description + "\n";
                    s += "FMA:" + d.fma+ "\n";
                    s += "AU:" + d.au+ "\n";
                    s += "Type:" + d.type+ "\n";
                    return s;
                })
            ;

            path.enter().append('text')
                .attr('x', function (d) {
                    return (d.target.x + d.source.x)/2;
                })
                .attr('y', function (d) {
                    return (d.target.y + d.source.y)/2;
                })
                .attr('class', 'au')
                .text(function (d) {
                    //return "test";
                    if (d.au)
                       return d.au.id;
                });

            //Variable 'path' already gives us access to a graph edge with associated link
            //To draw a set of layers, we create a 'g' element (group) and place it to the middle of the edge
            var auIcon = path.enter().append("g")
                .attr("transform", function (d) {
                    return "translate(" + (d.target.x + d.source.x) / 2 + "," + (d.target.y + d.source.y) / 2 + ")";
                });

            var layerHeight = 5; var layerLength = 20;
            var prev = 0; //a variable to accumulate offset for layers
            //To draw layers, we must get access to layers of the AU associated with each link
            //However, not all links have AUs assigned, in this case we return an empty array
            auIcon.selectAll(".layer")
                .data(function (d){
                    if (d.au) return d.au.layers;
                    return [];
                }).enter() //we just started an iteration over layers
                .append("rect")
                .attr("height", function (d) {return d.thickness * layerHeight;})
                .attr("width", function (d) {return layerLength;})
                .attr("x", function(){return 0;})
                .attr("y", function (d, i) {
                    if (i ==0) prev =0; // reset the starting y for layers for each link
                    prev += d.thickness * layerHeight; //remember the relative Y coordinate of the current layer

                    return prev - d.thickness * layerHeight;
                })
                .style("fill", function (d) {
                    return d.material.colour;
                })
                .attr("class", "layer")
            ;

            //console.log("here");

            //path.selectAll("links")
            //    .data(auRepo)
            //    .append("rect")
            //    .attr('x', function (d) {
            //                    return (d.target.x + d.source.x) / 2;
            //                })
            //                .attr('y', function (d) {
            //                    return (d.target.y + d.source.y) / 2;
            //                })
            //                .attr("height", function (d) {
            //                    return 10;
            //                })
            //                .attr("width", function (d) {
            //                    return 20;
            //                })
            //                .style("fill", function (d) {
            //                    return "black"
            //                });


            //var tukusvg = path.enter().append("g")
            //
            //tukusvg.append("rect")
            //    .attr('x', function (d) {
            //                    return (d.target.x + d.source.x) / 2;
            //                })
            //                .attr('y', function (d) {
            //                    return (d.target.y + d.source.y) / 2;
            //                })
            //                .attr("height", function (d) {
            //                    return 10;
            //                })
            //                .attr("width", function (d) {
            //                    return 20;
            //                })
            //                .style("fill", function (d) {
            //                    return "black"
            //                });

            //var jsonRectangles = [
            //    { "x_axis": 10, "y_axis": 10, "height": 10, "width":10, "color" : "green" },
            //    { "x_axis": 50, "y_axis": 50, "height": 20, "width":20, "color" : "green" }
            //]
            ////try 3
            //for (var j = 0; j < this.links.length ; j++) {
            //    if (this.links[j].au != null) {
            //        for (var k = 0; k < this.links[j].au.layers.length; k++) {
            //            console.log(this.links[j].au.layers.length);
            //            path.select("path").append("rect")
            //                .attr('x', function (d) {
            //                    return (d.target.x + d.source.x) / 2;
            //                })
            //                .attr('y', function (d) {
            //                    return (d.target.y + d.source.y) / 2;
            //                })
            //                .attr("height", function (d) {
            //                    return 10;
            //                })
            //                .attr("width", function (d) {
            //                    return 20;
            //                })
            //                .style("fill", function (d) {
            //                    return "black"
            //                });
            //        }
            //    }
            //}





            //
            //
            ////try 1
            //path.enter().append("rect")
            //    .attr('x', function (d) {
            //        return (d.target.x + d.source.x)/2;
            //    })
            //    .attr('y', function (d) {
            //        return (d.target.y + d.source.y)/2;
            //    })
            //  .attr("height", function (d,i) { return jsonRectangles[i].height; })
            //  .attr("width", function (d,i) { return jsonRectangles[i].width; })
            //  .style("fill", function(d) { return "black" });



            //try 2
            //var svgContainer = path.enter().append("svg")
            //var rectangles = svgContainer.selectAll("rect")
            //                             .data(jsonRectangles)
            //                             .enter()
            //                             .append("rect");
            //var rectangleAttributes = rectangles
            //                          .attr("x", function (d) { return svg.selectAll("path"); })
            //                          .attr("y", function (d) { return d.y_axis; })
            //                          .attr("height", function (d) { return d.height; })
            //                          .attr("width", function (d) { return d.width; })
            //                          .style("fill", function(d) { return d.color; });





        }

        var drag = d3.behavior.drag()
            .origin(function() {
                var t = d3.select(this).select('circle');
                return {x: t.attr("x"), y:t.attr("y")}
            })
            .on("drag", function (d) {
                var dragTarget = d3.select(this).select('circle');
                //var new_cx = d.x, new_cy= d.y;
                var new_cx, new_cy;
                dragTarget.attr("cx", function () {
                        new_cx = d3.event.dx + parseInt(dragTarget.attr("cx"));
                        //new_cx = d3.mouse(this)[0] - 681;
                        //console.log(d3.mouse(this));
                        return new_cx;
                    })
                    .attr("cy", function () {
                        new_cy = d3.event.dy +  parseInt(dragTarget.attr("cy"));
                        //new_cy = d3.mouse(this)[1] - 80 ;
                        //console.log("y" +new_cy);
                        return new_cy;
                    });
                //TODO: transform to relative svg;
                d.x = new_cx - offset[0];
                d.y = new_cy - offset[1];
                //d.x = new_cx ;
                //d.y = new_cy ;
                update();
            });

        function mousemove() {
            if (!mousedown_node) return;
            drag_line.attr('d', 'M' + mousedown_node.x + ',' + mousedown_node.y + 'L' + d3.mouse(this)[0] + ',' + d3.mouse(this)[1]);
            update();
        }

        function mouseup() {
            if (mousedown_node) drag_line.classed('hidden', true)
            svg.classed('active', false);
            resetMouseVars();
        }

        function mousedown() {
            svg.classed('active', true);
            if (d3.event.ctrlKey || mousedown_node || mousedown_link) return;
            var point = d3.mouse(this);
            graph.addNode(point);
            update();
        }

        function keydown() {
            if (d3.event.keyCode === 65){
                (a_pressed)? a_pressed = false : a_pressed = true;
                console.log(a_pressed);
                if (!a_pressed) {graph.multiple_select = []; update()};
                return;
            }

            if (d3.event.keyCode === 17) {// ctrl
                circle.call(drag);
                svg.classed('ctrl', true);
            }
            if (graph.selected_node || graph.selected_link) {
                switch (d3.event.keyCode) {
                    case 46: // delete
                        if (graph.selected_node) {
                            graph.deleteNode(graph.selected_node);
                        } else if (graph.selected_link) {
                            graph.deleteLink(graph.selected_link);
                        }
                        graph.selected_link = null;
                        graph.selected_node = null;
                        update();
                }
            }
        }

        function keyup() {
            if (d3.event.keyCode === 17) {// ctrl
                circle
                    .on('mousedown.drag', null)
                    .on('touchstart.drag', null);
                svg.classed('ctrl', false);
            }
        }

        svg.on('mousedown', mousedown)
            .on('mousemove', mousemove)
            .on('mouseup', mouseup);

        d3.select(window)
            .on('keydown',keydown)
            .on('keyup',keyup);

        update();
    };

    this.import = function(){
    }

    this.export = function(){
    }
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
