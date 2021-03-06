/**
 * Created by Natallia on 05/11/2014.
 */


debugging = true;
var serverPort = 5056; // production - 5055, Development - 5056
/////////////////////////////////////////////
//Data structures
/////////////////////////////////////////////

//create material
function Material(id, name, colour, type, children, au, ont_term) {


    if (type === 'simple'){
        this.id = id;
        this.name = name;
        this.colour = colour;
        this.type = type;
        this.ont_term = ont_term;
    } else if (type === 'mix'){
        this.au = au;
        this.colour = colour;
        this.type = type;
        this.children = children;
        //console.log(this.children);
    } else {
        console.log("Error creating materials");
        return;
    }


    this.getID = function getID(){
        if (this.type === 'simple'){
            return this.id;
        } else if (this.type === 'mix'){
            return this.au.id;
        }
    }

    this.getName = function getName(){
        if (this.type === 'simple'){
            return this.name;
        } else if (this.type === 'mix'){
            return this.au.name;
        }
    }

    //this.hide = false;

    this.clone = function () {
        var newMaterial = new Material(this.id, this.name, this.colour, this.type, this.children.slice(0), this.au);
        return newMaterial;
    }

    this.draw = function (svg, vp, onClick) {

        console.log("Drawing:", this.children);

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
                    console.log(d.children);
                    console.log(d);
                    onClick(this, d);
                    click(d);
                });

            nodeEnter.append("text")
                .attr("dy", 3.5)
                .attr("dx", 5.5)
                .text(function(d) { return d.getID() + " - " + d.getName(); });

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
        //query = 'http://open-physiology.org:5054//makelyph/?name=' + encodeURIComponent(this.name) + '&type=' + encodeURIComponent("mix");
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



function LyphRepo (lyphs){
    this.lyphs = lyphs;


    this.syncLyphsWithServer = function (onSuccess) {
        this.lyphs = [];

        console.log("Loading existing lyphs")
        $.ajax
        ({
            context: this,

            url: "http://open-physiology.org:" + serverPort + "/all_lyphs/",

            jsonp: "callback",

            dataType: "jsonp",


            success: function (response) {
                //console.log(response);

                if (response.hasOwnProperty("Error")) {
                    console.log("Error in getting all lyphs", response)
                    if (notification_enabled)  $.notify("Error Loading Lyphs", "error");
                    return;
                }

                //console.log("Lyphs", response);
                this.lyphs = response;
                //console.log(this.lyphs);
                onSuccess();
                if(notification_enabled) $.notify("Lyphs Loaded " + (new Date() - startTime)/1000 , "success");


            }
        })
    }



    this.getIndexByID = function (id){
        //console.log(this.lyphs,id);
        for (var i =0; i < this.lyphs.length; i++){
            //console.log(this.lyphs[i].id , id);
            if (this.lyphs[i].id ===  id)
                return i;
        }
        return -1;
    }





}

//create layer
function Layer(id, name, thickness, materials, colour) {
    this.id = id;
    this.name = name;
    this.thickness = thickness;
    this.materials = materials;
    this.colour = "#"+((1<<24)*Math.random()|0).toString(16);

    //console.log(this.id, this.name, this.thickness, this.materials, this.colour);


    this.create_on_server = function (cb){
        //URL for accessing create layer api
        var url = "http://open-physiology.org:"+ serverPort + "/makelayer/";

        //If creating a layer with known list of materials
        if (materials  &&  materials.length > 0) {
            url += "?material=" + this.materials[0].id +
            "&thickness=" + this.thickness +
            "&color=" + this.materials[0].colour
        } else { // Creating a blank layer
            url += "?material=none"+
            "&thickness=" + this.thickness;
        }
        url += "?name="+ this.name;




        //function ajax_create_layer () {
        //   this.createLayerOnServer = function createLayerOnServer() {
        return P.resolve($.ajax
        ({
            url: url,

            jsonp: "callback",

            dataType: "jsonp"
        })).then(function (response) {

            if (response.hasOwnProperty("Error")) {
                throw response.Error;
            }

            console.log("Layer created successfully:", response);

            //console.log("Layer Created", response);

            //layerRepo.layers[layerRepo.containsLayer(response.thickness, materialRepo.materials[materialRepo.getIndexByID(response.mtlid)])].id = response.id;
            this.id = response.id;

            ////TODO bad design. Ajax chaining is unpredictable in this case.
            //// Once the layer is successfuly created we attach it the AU where its meant to go.
            ////console.log(index);
            //;



            //TODO bad design - Use of global function. Use callback function instead.
            //rehashaueditor(this);
            //}


            return response;
        }.bind(this));
        //}
    }



    this.sync_materials_to_server = function (){
        console.log("Syncing change in layer to server", "Layer:" + this.id , "Materials:" + this.materials);

        //URL for accessing editlayer api
        var url = "http://open-physiology.org:"+ serverPort + "/editlayer/";
        url += "?layer=" + this.id;

        if (this.materials  &&  this.materials.length > 0) {
            url += "&material="
            for (var i =0; i < this.materials.length ; i ++){
                url += this.materials[i].id;
                if (i +1 < this.materials.length )
                    url += ","
            }

        } else if (this.materials  &&  this.materials.length === 0) {
            url += "&material=none"
        }




        url+="&mutable=yes";

        console.log(url);
        //return;

        $.ajax
        ({
            context: this,
            url: url,

            jsonp: "callback",

            dataType: "jsonp",


            success: function (response) {
                response;

                if (response.hasOwnProperty("Error")) {
                    console.log("Error in udpating materials of the layer:", response);
                    return;
                }

                console.log("Layer material update successfully:", response);
                ;
            }
        });
    }


    this.update_name_thickness_to_server = function update_name_thickness_to_server(){
        console.log("Syncing layer thickness to server", "Layer:" + this.id , "Thickness:" + this.thickness);
        //URL for accessing editlayer api
        var url = "http://open-physiology.org:"+ serverPort + "/editlayer/";
        url += "?layer=" + this.id;
        url += "&thickness=" + this.thickness;
        url += "&name=" + this.name;
        url+="&mutable=yes";

        console.log(url);

        $.ajax
        ({
            context: this,
            url: url,

            jsonp: "callback",

            dataType: "jsonp",

            success: function (response) {
                response;

                if (response.hasOwnProperty("Error")) {
                    console.log("Error in udpating thickness of the layer:", response);
                    return;
                }
                console.log("Layer thickness update successfully:", response);
                ;
            }
        });

    }



    //Create a cloned/copies layer
    this.clone = function () {
        var newLayer = new Layer(this.id, this.name, this.thickness, this.materials);
        return newLayer;
    }



    this.getIndexOfMaterialByID = function (id ){
        for (var i =0; i < this.materials.length ; i++){
            console.log("Param:" + id, "Search" + this.materials[i].id);
            if (this.materials[i].id === id)
            return i;
        }
        return -1;
    }
}



//create Asymmetric Unit
function AsymmetricUnit(id, name, layers, length, misc_materials, common_materials){
    this.id = id;
    this.name = name;
    this.layers = layers;
    this.length = length;
    this.misc_materials = misc_materials;
    this.common_materials = common_materials;



    this.update_common_materials = function update_common_materials(){
        var au = this;
        $.ajax
        ({
            url:
            "http://open-physiology.org:"+ serverPort + "/template/" + this.id + "?commons=yes" ,

            jsonp: "callback",

            dataType: "jsonp",
            success: function (response) {
                response;

                if (response.hasOwnProperty("Error")) {
                    console.log("Not able to load the template:" , response);
                    return;
                }
                console.log(response);
                au.common_materials = response.common_materials;
                rehashaueditor_onCurrentLayer();

            }
        });
    }


    this.create_on_server = function (type){
        if (type != 'mix')
            type = 'shell';
        console.log("Creating AU on server of type", type);

        //URL for accessing make template api
        var url = "http://open-physiology.org:"+ serverPort + "/maketemplate/";
        url += "?name=" + this.name;
        url +=  "&type=" +type;
        url +=  "&length=" +this.length;

        if (layers && layers.length > 0){
            for (var i =0; i < layers.length ; i++){
                url += "&layer" + i+1 + "=" + layers[i].id;
            }
        }

        console.log(url)

        //Create AU on the server
        $.ajax
        ({
            context: this,
            url: url,

            jsonp: "callback",

            dataType: "jsonp",


            success: function (response) {
                response;

                if (response.hasOwnProperty("Error")) {
                    console.log("AU Creation Error:", response);
                    return;
                }

                console.log("AU created successfully:", response);

                this.id = response.id;
                this.update_common_materials();


                rehashaueditor();
                ;
            }
        });
    }


    this.is_built_from_template = function is_built_from_template(mat, au, callBack){

        //URL for accessing editlayer api
        var url = "http://open-physiology.org:"+ serverPort + "/is_built_from_template/";
        url += "?part=" + au.id;
        url += "&templates=" + mat.id;

        console.log(url);

        $.ajax
        ({
            context: this,
            url: url,

            jsonp: "callback",

            dataType: "jsonp",

            success: function (response) {
                response;

                console.log(response);

                if (response.hasOwnProperty("Error")) {
                    console.log("Validation error:", response);
                    return;
                }

                if (response.response === "no")
                    callBack();
                else
                    console.log("material can't be added to self");
            }
        });



    }


    this.move_layer = function (layer, pos){
        console.log("Moving Layer", "AU:" + this.id);

        //URL for accessing editlayer api
        var url = "http://open-physiology.org:"+ serverPort + "/edit_template/";
        url += "?template=" + this.id;
        url += "&movelayer=" + layer.id;
        url += "&topos=" + pos;


        console.log(url);

        $.ajax
        ({
            context: this,
            url: url,

            jsonp: "callback",

            dataType: "jsonp",

            success: function (response) {
                response;

                if (response.hasOwnProperty("Error")) {
                    console.log("Error in moving layer within AU:", response);
                    return;
                }
                console.log("Layer moved successfully:", response);
                ;
            }
        });
    }

    this.delete = function (auRepo, removeIndex, editorSyncFunction){
        console.log("Deleting Lyph Template from Server", "Lyhp Template:" + this.id);

        //URL for accessing editlayer api
        var url = "http://open-physiology.org:"+ serverPort + "/delete_templates/";
        url += "?template=" + this.id;

        console.log(url);

        $.ajax
        ({
            context: this,
            url: url,

            jsonp: "callback",

            dataType: "jsonp",

            success: function (response) {
                response;

                if (response.hasOwnProperty("Error")) {
                    console.log("Error in deleting Lyph Template:", response);
                    alert("Error in deleting Lyph Template:" + response.Error);
                    return;
                }
                console.log("Delete Lyph Template:", this.id, " " , response);

                auRepo.removeAt(removeIndex);
                editorSyncFunction();

            }
        });
    }

    this.sync_au_to_server = function(){
        console.log("Syncing AU server", "AU:" + this.id);

        //URL for accessing editlayer api
        var url = "http://open-physiology.org:"+ serverPort + "/edit_template/";
        url += "?template=" + this.id;

        if (this.misc_materials &&  this.misc_materials.length > 0) {
            url += "&misc_materials="
            for (var i =0; i < this.misc_materials.length ; i ++){
                url += this.misc_materials[i].id;
                if (i +1 < this.misc_materials.length )
                    url += ","
            }

        } else if (this.misc_materials &&  this.misc_materials.length === 0) {
            url += "&misc_materials=none"
        }

        url += "&name=" +this.name;
        url += "&length=" +this.length;


        console.log(url);

        $.ajax
        ({
            context: this,
            url: url,

            jsonp: "callback",

            dataType: "jsonp",

            success: function (response) {
                response;

                if (response.hasOwnProperty("Error")) {
                    console.log("Error in udpating misc_materials of AU:", response);
                    return;
                }

                console.log("Misc material update successfully:", response);
                this.update_common_materials();
                ;
            }
        });




    }

    this.getIndexByIDMiscMaterials= function (id){
        for (var i = 0; i < this.misc_materials.length; i++){
            if (this.misc_materials[i].id === id){
                return i;
            }
        }
        return -1;
    }

    this.clone = function(onSelectAU, onSelectLayer, auRepo, layerRepo, materialRepo){
        //The parameter functions are used for callback following successful cloning of the Lyph Template.
        var url = "http://open-physiology.org:"+ serverPort + "/clone/";
        url += "?template=" + this.id;

        console.log(url);

        $.ajax
        ({
            context: this,
            url: url,

            jsonp: "callback",

            dataType: "jsonp",

            success: function (response) {
                response;

                if (response.hasOwnProperty("Error")) {
                    console.log("Error in cloning Template", response);
                    return;
                }

                console.log(response);

                // Load shell structure into local database
                    if (response.type === "shell"){

                        var layers_content= [];
                        for (var j = 0; j < response.layers.length; j++){

                            var materials = [];

                            for (var k =0; k < response.layers[j].materials.length; k++){
                                if (materialRepo && materialRepo.getIndexByID(response.layers[j].materials[k].id) > -1)
                                    materials.push(materialRepo.materials[materialRepo.getIndexByID(response.layers[j].materials[k].id)]);
                                else{
                                    materials.push(auRepo.auSet[auRepo.getIndexByID(response.layers[j].materials[k].id)]);
                                }
                            }

                            var newLayer  = null;
                            if (auRepo)
                                newLayer = new Layer(response.layers[j].id, response.layers[j].name, ((response.layers[j].thickness == "unspecified")? 1: response.layers[j].thickness), materials);
                            else
                                newLayer = new Layer(response.layers[j].id, response.layers[j].name, ((response.layers[j].thickness == "unspecified")? 1: response.layers[j].thickness), materials);
                            if (layerRepo == null){
                                layerRepo = new LayerRepo([newLayer]);
                            } else {
                                layerRepo.addAt(newLayer,0);
                            }

                            //layers.push(newLayer);
                            layers_content.push(newLayer);
                            newLayer = null;
                        }

                        var toto = new AsymmetricUnit(response.id, response.name, layers_content, (response.length && response.length != "unspecified") ? response.length : 1 , response.misc_materials, []);


                        toto.update_common_materials();

                        //console.log(toto);
                        if (auRepo == null) auRepo  = new AsymmetricUnitRepo([toto]);
                        else auRepo.addAt(toto,0);

                        //sync_lyphTemplate_list();
                        onSelectAU(toto);
                        onSelectLayer(toto.layers[0]);

                    }
                    //applyFilter();

                //call onselectAU function

                //call onselectLayer function.


                ;
            }
        });




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

        //Add layer to AU at the server.

        console.log("Adding Layer to AU on server", index)

        //URL for accessing make template api
        var url = "http://open-physiology.org:"+ serverPort + "/layer_to_template/";
        url += "?template=" + this.id;
        url +=  "&layer=" + layer.id;
        url += "&pos=" + (index + 1);

        console.log(url)

        //Create AU on the server
        $.ajax
        ({
            context: this,
            url: url,

            jsonp: "callback",

            dataType: "jsonp",


            success: function (response) {
                response;

                if (response.hasOwnProperty("Error")) {
                    console.log("Adding Layer to AU Error:", response);
                    return;
                }

                console.log("Added Layer to Template:", response);
                this.update_common_materials();

                rehashaueditor(layer);
                ;
            }
        });
    }

    this.removeLayerAt = function(index){


        //TODO The layer also need to be removed from the server.




        console.log("Removing Layer from AU on server")

        //URL for accessing make template api
        var url = "http://open-physiology.org:"+ serverPort + "/layer_from_template/";
        url += "?template=" + this.id;
        url +=  "&layer=" + layers[index].id;


        console.log(url)
        //return;

        //Create AU on the server
        $.ajax
        ({
            context: this,
            url: url,

            jsonp: "callback",

            dataType: "jsonp",


            success: function (response) {
                response;

                if (response.hasOwnProperty("Error")) {
                    console.log("Removing Layer to AU Error:", response);
                    return;
                }

                console.log("Layer successfully removed from AU", response);
                this.update_common_materials();

                //rehashaueditor();
                //;
            }
        });




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
    this.draw = function(svg, vp, onSelectLayer, selectedLayer, onSelectInfoTab) {
        var au = this;
        console.log("AU", au);
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

        //Draw AU Base

        //In the following substituting au.length with length so that it can be revived later but for now its fixed to 1.
        var length =1;

        var baseLength = 0;
        if (au != null) baseLength = length;
        svg.append("rect")
            .style("fill", "black")
            .attr(attr_width, baseLength * vp.lengthScale)
            .attr(attr_height, vp.margin);
        if (au == null) return;



        //Draw AU Layers
        svg.selectAll("chart")
            .data(au.layers)
            .enter().append("rect")
            .style("fill", function (d) {return d.colour;})
            .style("fill-opacity" , function (d){return 0.6})
            .style("stroke", function(d){
                //console.log("Manual Selected Layer:", selectedLayer);
                if (selectedLayer === d) {
                    //selectedLayer = null;
                    return "red";
                }
            })
            .attr(attr_width, function (d) {return length * vp.lengthScale;})
            .attr(attr_height, function (d) {return d.thickness * vp.widthScale;})
            .attr(attr_x, function () { return 0;})
            .attr(attr_y, function (d, i) { prev += d.thickness * vp.widthScale; return prev - d.thickness * vp.widthScale;})




        //Add labels
        prev = vp.margin;
        svg.selectAll("chart")
            .data(au.layers)
            .enter().append("text")
            .attr("class", "labelText")
            .attr(attr_x, function (d, i) {
                var offset = 0;
                if (vp.orientation == "vertical") offset = 20 * (i % 2);
                return length * vp.lengthScale / 2 + offset;})
            .attr(attr_y, function (d) {
                prev += d.thickness * vp.widthScale;
                return prev - d.thickness * vp.widthScale / 2;})
            .text(function(d, i) {
                var lbl = "";
                lbl = d.id + " - ";
                d.name ? lbl += d.name : lbl += "";
                lbl += " - ";
                if (d.materials)
                    lbl += d.materials.length;
                else
                    lbl+= "0";
                return lbl;
            });




        // Draw Tab1
        svg.selectAll("chart")
            .data([au])
            .enter()
            .append("rect")
            .style("fill", function (d) {return "#808080";})
            .style("fill-opacity" , function (d){return 0.7})
            .style("stroke", function(d){
                if (selectedLayer === d) {
                    if (d.tabselected === 1){
                        return "red";
                        d.tabselected = 0;
                    }

                }
                //return "blue";
            })
            .style("stroke-width", function(d){
                return 2;
            })
            .attr(attr_width, function (d) {return length * vp.lengthScale /3 ;})
            .attr(attr_height, function (d) {return 0.6 * vp.widthScale;})
            .attr(attr_x, function () { return 0;})
            .attr(attr_y, function (d, i) { return prev;})
            .on("click", function (d){
                //console.log("tab 1 clicked");
                d.tabselected = 1;
                //console.log(d);
                onSelectLayer(d);
            });


        // Draw Tab1 Label
        svg.selectAll("chart")
            .data([au])
            .enter().append("text")
            .attr("class", "labelText")
            //.attr(attr_width, function (d) {return au.length * vp.lengthScale /3 ;})
            //.attr(attr_height, function (d) {return 0.3 * vp.widthScale;})
            .attr(attr_x, function () { return length * vp.lengthScale /6;})
            .attr(attr_y, function (d, i) { return prev + 13;})
            .text(function(d, i) {
                return "Location Unknown - " + d.misc_materials.length;
            });



        // Draw Tab2
        svg.selectAll("chart")
            .data([au])
            .enter()
            .append("rect")
            .style("fill", function (d) {return "#808080";;})
            .style("fill-opacity" , function (d){return 0.7})
            .style("stroke", function(d){
                if (selectedLayer === d) {
                    //console.log(d.tabselected)
                    if (d.tabselected === 2){
                        return "red";
                        d.tabselected = 0;
                    }
                }
                //return "blue";
            })
            .style("stroke-width", function(d){
                return 2;
            })
            .attr(attr_width, function (d) {return length * vp.lengthScale /3 ;})
            .attr(attr_height, function (d) {return 0.6 * vp.widthScale;})
            .attr(attr_x, function () { return length * vp.lengthScale * 2/3;})
            .attr(attr_y, function (d, i) { return prev;})
            .on("click", function(d){
                //console.log(" tab 2 - clicked");
                d.tabselected = 2;
                //console.log(d);
                onSelectInfoTab(d);
            });

        // Draw Tab2 Label
        svg.selectAll("chart")
            .data([au])
            .enter().append("text")
            .attr("class", "labelText")
            //.attr(attr_width, function (d) {return au.length * vp.lengthScale /3 ;})
            //.attr(attr_height, function (d) {return 0.3 * vp.widthScale;})
            .attr(attr_x, function () { return (length * vp.lengthScale * 2/3) + (length * vp.lengthScale /6);})
            .attr(attr_y, function (d, i) { return prev + 13;})
            .text(function(d, i) {
                console.log(d.common_materials);
                return "Common" + " - " + d.common_materials.length;
            });


        //Draw AU Layer Highlights Separately to allow the highlight to override other drawings.
        prev = vp.margin;
        svg.selectAll("chart")
            .data(au.layers)
            .enter().append("rect")
            //.style("fill", function (d) {return d.colour;})
            .style("fill-opacity" , function (d){return 0})
            .style("stroke", function(d){
                //console.log("Manual Selected Layer:", selectedLayer);
                if (selectedLayer === d) {
                    //selectedLayer = null;
                    console.log("compare here", selectedLayer, d);
                    return "red";
                }
            })
            .style("stroke-width", function(d){
                if (selectedLayer === d) {
                    //selectedLayer = null;
                    return 3;
                }
            })
            .attr(attr_width, function (d) {return length * vp.lengthScale;})
            .attr(attr_height, function (d) {return d.thickness * vp.widthScale;})
            .attr(attr_x, function () { return 0;})
            .attr(attr_y, function (d, i) { prev += d.thickness * vp.widthScale; return prev - d.thickness * vp.widthScale;})
            .on("click", onSelectLayer);


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
    this.draw = function(svg, vp, onClick, manualSelectedAU, filterable) {
        //console.log(filterable);
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

        var skipcount = 0;

            for (var j = 0; j < auRepo.auSet.length ; j++){

            if (auRepo.auSet[j].hide && auRepo.auSet[j].hide === true) {
                skipcount ++;
                continue;
            }


            var yPosition = (j - skipcount) * (maxWidth + delta);
            var prev = yPosition;
            svg.selectAll("auRepo")
                .data(auRepo.auSet[j].layers)
                .enter().append("rect")
                .style("fill", function (d) { return d.colour;})
                .attr("width", function (d) {return /*auRepo.auSet[j].length * */ vp.lengthScale;})
                .attr("height", function (d) {return d.thickness * vp.widthScale;})
                .attr("x", function () { return delta})
                .attr("y", function (d, i) {
                    prev += d.thickness * vp.widthScale;
                    return 10 + prev - d.thickness * vp.widthScale;
                });
        }


        svg.selectAll("auRepo")
            .data(auRepo.auSet.filter(function (el){
                return !el.hide || el.hide === false;
            }))
            .enter().append("rect")
            .style("fill", function(d){
                if (manualSelectedAU === d) {
                    //manualSelectedAU = null;
                    return "yellow";
                }
                return "white";
            })
            .style("stroke-width", 0.5)
            .style("stroke", function(d){
                //console.log("Manual Selected AU:", manualSelectedAU);
                if (manualSelectedAU === d) {
                    //manualSelectedAU = null;
                    return "red";
                }
                return "black";
            })
            .attr("width", vp.width - maxLength - 2 * delta)
            .attr("height", function(d){return (d.getTotalWidth(vp.widthScale) > 10) ? d.getTotalWidth(vp.widthScale) : 15 ;})
            .attr("x", maxLength + 2 * delta)
            .attr("y", function(d, i){return 10 + (i * (maxWidth + delta));})
            .on("click", onClick);


        svg.selectAll("auRepo")
            .data(auRepo.auSet.filter(function (el){
                //console.log("filterable",filterable)
                return !el.hide || el.hide === false;
            }))
            .enter().append("text")
            .attr("x", function(){
                return maxLength + 2 * delta + 5;
            })
            .attr("y", function(d, i){return 15+ (i * (maxWidth + delta) + d.getTotalWidth(vp.widthScale) / 2);})
            .text(function(d){return (d.id).replace("TEMPLATE_", "T_") + " - " + d.name;})

        svg.attr("height", function(){
            var visibleAUCount = 0;
            for (var i = 0; i < auRepo.auSet.length; i++){
                if (!auRepo.auSet[i].hide || auRepo.auSet[i].hide === false){
                    visibleAUCount++;
                }
            }
            return 10 + (visibleAUCount * (maxWidth + delta));
        });

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

    this.draw = function(svg, vp, onClick, manualSelectedMaterial){
        //console.log("draw called");
        var materialRepo = this;
        svg.selectAll('rect').remove();
        svg.selectAll('text').remove();
        var delta = 10; //distance between icons
        if (materialRepo == null) return;
        svg.selectAll("materialRepo")
            .data(materialRepo.materials.filter(function (el){
                //if (!el.hide || el.hide === false) console.log(el);
                return !el.hide || el.hide === false;
            }))
            .enter().append("rect")
            .style("fill", function (d) {return d.colour;})
            .attr("width", vp.lengthScale)
            .attr("height", vp.widthScale)
            .attr("x", delta)
            .attr("y", function (d, i) { return i * (vp.widthScale + delta);});

        svg.selectAll("materialRepo")
            .data(materialRepo.materials.filter(function (el){
                return !el.hide || el.hide === false;
            }))
            .enter().append("rect")
            .style("fill", function (d){
                if (manualSelectedMaterial === d){
                    return "yellow";
                }
                return "white";
            })
            .style("stroke-width", 0.5)
            .style("stroke", function(d){
                //console.log("Manual Selected Material:", manualSelectedMaterial);
                if (manualSelectedMaterial === d) {
                    //manualSelectedMaterial = null;
                    return "red";
                }
                return "black";
            })
            .attr("width", vp.width - vp.lengthScale - 2 * delta)
            .attr("height", vp.widthScale)
            .attr("x", vp.lengthScale + 2 * delta)
            .attr("y", function(d, i){return i * (vp.widthScale + delta);})
            .on("click", onClick);

        svg.selectAll("materialRepo")
            .data(materialRepo.materials.filter(function (el){
                return !el.hide || el.hide === false;
            }))
            .enter().append("text")
            .attr("x", vp.lengthScale + 2 * delta + 5)
            .attr("y", function(d, i){return i * (vp.widthScale + delta) + vp.widthScale / 2  + 4;})
            .text(function(d){return (d.getID()).replace("TEMPLATE_", "T_") + " - " + d.getName();})


        svg.attr("height", function(){
            var visibleMaterialsCount = 0;
            for (var i = 0; i < materialRepo.materials.length; i++){
                if (!materialRepo.materials[i].hide || materialRepo.materials[i].hide === false){
                    visibleMaterialsCount++;
                }
            }
            return (visibleMaterialsCount * (vp.widthScale + delta));
        });

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
function Node(id, name, x, y, tree, fixed, location, locationtype){
    this.id = id;
    this.name = name;
    this.x = x;
    this.y = y;
    this.tree = tree;
    this.fixed = fixed;
    this.location = location;
    this.locationtype = locationtype;
}

//Annoation

function Annotations(annotation, pubmedID){
    this.annotation = annotation;
    this.pubmedID = pubmedID;
}




//graph link
function Link(source, target, au, type, edgeid, description, fma, left, right, highlighted, annotations, species){
    this.source = source;
    this.target = target;
    this.au = au;
    this.type = type;
    this.edgeid = edgeid;
    this.description = description;
    this.fma = fma;
    this.left = left;
    this.right = right;
    this.highlighted = highlighted;
    this.annotations = annotations;
    this.species = species;


    this.getAnnotationIndexByID = function (id) {

        if (!annotations || !annotations.length)
            return;

        for (var i =0; i < annotations.length; i++){
            if (annoations[i].annotation === id){
                return i;
            }
        }
        return -1;
    }
}

function Rectangle(id, x, y, width, height, lyph, location){
    this.id = id;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.lyph = lyph;
    this.location = location;
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

    this.draw = function(svg, vp, onClick, selectedGraph){
        var graphRepo = this;
        svg.selectAll('rect').remove();
        svg.selectAll('text').remove();
        if (graphRepo == null) return;
        var delta = 10; //distance between icons
        svg.selectAll("graphRepo")
            .data(graphRepo.graphs.filter(function (el){
                return !el.hide || el.hide === false;
            }))
            .enter().append("rect")
            .style("fill", function(d){
                if (d === selectedGraph){
                    return "yellow"
                }
                return "white"

            })
            .style("stroke-width", 0.5)
            .style("stroke", function(d){
                if (d === selectedGraph)
                    return "red";
                return "black"
            })
            .attr("width", vp.width - vp.lengthScale)
            .attr("height", vp.widthScale)
            .attr("x", vp.lengthScale)
            .attr("y", function(d, i){return i * (vp.widthScale + delta);})
            .on("click", function(d){
                onClick(d);
            });


        //d3.select(this).style("stroke", "red");
        //d3.select(selectedGraphNode).style("stroke", "black");

        svg.selectAll("graphRepo")
            .data(graphRepo.graphs.filter(function (el){
                return !el.hide || el.hide === false;
            }))
            .enter().append("text")
            .attr("x", vp.lengthScale + 5)
            .attr("y", function(d, i){return i * (vp.widthScale + delta) + vp.widthScale / 2;})
            .text(function(d){return d.id + " - " + (d.name ?  d.name : "") ;})

        svg.attr("height", function(){
            var visibleGraphCount = 0;
            for (var i = 0; i < graphRepo.graphs.length; i++){
                if (!graphRepo.graphs[i].hide || graphRepo.graphs[i].hide === false){
                    visibleGraphCount++;
                }
            }
            return 10 + (visibleGraphCount * 30);
        });

    }
}




//TODO: This part will go into the api2.data.js
// set up initial nodes and links
//  - nodes are known by 'id', not by index in array.
//  - fixed nodes (as a bold red circle).
//  - links are always source < target; edge directions are set by 'left' and 'right'.

function Graph(id, name, nodes, links, rectangles) {

    this.id = id;
    this.name = name;
    this.nodes = nodes;
    this.links = links;
    this.rectangles = rectangles;

    var lastNodeId = nodes.length - 1;

    this.keyboardShortcutEnabled = true;

    this.selected_node = null;
    this.selected_link = null;
    this.selected_rectangle = null;

    this.multiple_selection = [];

    var colors = d3.scale.category10();




    this.containsLyphWithName= function(name){
        for (var i =0; i < this.rectangles.length;i++){
            if (this.rectangles[i].lyph && this.rectangles[i].lyph.name.toString().toLocaleLowerCase().indexOf(name) > -1 ){
                return true;
            }
        }
        return false;
    }
    //TODO: Add multiple select ability from the other code.

    this.clone = function () {
        var newGraph = new Graph(this.id, this.name, this.nodes.slice(0), this.links.slice(0));
        return newGraph;
    }

    this.getNodeIndexByID = function (id){
        for (var i =0; i < nodes.length; i++){
            if (nodes[i].id === id)
                return i;
        }
        return -1;
    }

    this.getLinkIndexbyID = function (id){
        for (var i =0; i < links.length; i++){
            if (links[i].edgeid === id)
                return i;
        }
        return -1;
    }

    this.getRectangleIndexByID = function (id){
        //console.log(id);
        for (var i =0; i < rectangles.length; i++){
            if (rectangles[i].id === id)
                return i;
        }
        return -1;
    }

    //graph.saveGraphtoServer(refresh_graph, syncSelectedGraph, onSelectLink, graph.selected_rectangle);
    this.saveGraphtoServer = function(refresh_graph, syncSelectedGraph, onSelectLink, selected_rectangle){
        $("#graphSave").css('color','');
        this.name = graphName.value;

        //console.log(actualSelectedGraphIndex);
        //TODO There is copy of the save axax in the Graph DS. Start using that.
        var query = "";

        if (this.saved != null){
            query = "http://open-physiology.org:"+serverPort+"/editview/?view=" + this.id;
            query += "&name=" + this.name;
        } else {
            query = "http://open-physiology.org:"+serverPort+"/makeview/?name="+this.name
        }

        //var query = "http://open-physiology.org:"+serverPort+"/makeview/?"
        for (var i =0; i < this.nodes.length ; i++){
            query += "&node" + (i + 1)+ "="+ encodeURIComponent(this.nodes[i].name);
            query += "&x"+ (i + 1) +"="+ encodeURIComponent(this.nodes[i].x);
            query += "&y"+ (i + 1) +"="+encodeURIComponent(this.nodes[i].y);
        }

        //console.log(this);

        for (var i =0; i < this.rectangles.length; i++){
            query += "&lyph"+ (i + 1) +"="+  (this.rectangles[i].lyph ? encodeURIComponent(this.rectangles[i].lyph.id) : "null");
            query += "&lx"+ (i + 1) +"="+encodeURIComponent(this.rectangles[i].x)
            query += "&ly"+ (i + 1) +"="+encodeURIComponent(this.rectangles[i].y)
            query += "&width"+ (i + 1) +"="+encodeURIComponent(this.rectangles[i].width)
            query += "&height"+ (i + 1) +"="+encodeURIComponent(this.rectangles[i].height);

        }

        console.log(query);

        if (notification_enabled) $.notify("Requesting server to save view", "info");

        // ajax call to save graph view
        $.ajax
        ({
            url:query,

            jsonp: "callback",

            dataType: "jsonp",

            context:this,

            success: function (response) {
                response;


                if (response.hasOwnProperty("Error")) {
                    console.log("Graph View Save error" , response);
                    alert("Graph View Save error" , response);
                    if (notification_enabled) $.notify("Error while saving view", "error");
                    return;
                }

                if (notification_enabled) $.notify("View saved to server", "success");

                console.log(response);
                this.id = response.id;
                this.saved = true;
                this.reloadGraphFromServer(syncSelectedGraph, onSelectLink, selected_rectangle);
                //refresh_graph();
                //syncSelectedGraph();
            }
        });



    }




    this.syncGraphLyphWithServer = function(rectangleToUpdate){
        return;
        console.log(rectangleToUpdate);
        $.ajax
        ({
            context:this,

            url:"http://open-physiology.org:"+serverPort+"/lyphs_from_view/?view="+ this.id +"&lyphs=" +rectangleToUpdate.id,

            jsonp: "callback",

            dataType: "jsonp",


            success: function (response) {
                response;


                if (response.hasOwnProperty("Error")) {
                    console.log("Lyph cannot be removed from view:" , response);
                    return;
                }
                console.log(response);


                var url = "http://open-physiology.org:"+serverPort+"/lyphs_to_view/?view="+ this.id +"&lyphs=" +rectangleToUpdate.id + "&lx1=" + parseInt(rectangleToUpdate.id.x) + "&ly1=" + parseInt(rectangleToUpdate.id.y) + + "&height1=" + parseInt(rectangleToUpdate.id.height) + "&width1=" + parseInt(rectangleToUpdate.id.width) ;
                console.log(url);

                $.ajax
                ({
                    context:this,

                    url:url,

                    jsonp: "callback",

                    dataType: "jsonp",


                    success: function (response) {
                        response;


                        if (response.hasOwnProperty("Error")) {
                            console.log("Lyph cannot be removed from view:" , response);
                            return;
                        }

                        console.log(response);




                    }
                });

            }
        });
    }





    this.reloadGraphFromServer = function (callBackAfterSuccess, onSelectLink, selected_rectangle){

        if (notification_enabled) $.notify("Loading View "  + (new Date() - startTime)/1000 , "info");

        $.ajax
        ({
            context:this,

            url:"http://open-physiology.org:"+serverPort+"/lyphview/"+this.id,

            jsonp: "callback",

            dataType: "jsonp",


            success: function (response) {
                response;


                if (response.hasOwnProperty("Error")) {
                    console.log("Node creation error:" , response);
                    if (notification_enabled) $.notify("Server error", "error");
                    return;
                }

                if (notification_enabled) $.notify("Server returned view info " + (new Date() - startTime)/1000 , "success");


                //console.log(url)
                console.log("Response:" , response);

                    this.nodes = [];
                    this.edges = [];
                    this.rectangles = [];
                    this.id = null;
                    this.name = null;

                    this.id = response.id;
                    this.name = response.name;
                    this.saved = true;

                    //load rectangles
                    for (var j =0; j < response.lyphs.length; j++){
                        var tmpRect = new Rectangle(response.lyphs[j].id, parseInt(response.lyphs[j].x), parseInt(response.lyphs[j].y),parseInt(response.lyphs[j].width), parseInt(response.lyphs[j].height), response.lyphs[j].lyph, response.lyphs[j].location);
                        this.rectangles.push(tmpRect);
                    }

                    populateRectangleNames(this.rectangles);


                    //load nodes
                    for (var j =0; j < response.nodes.length; j++){
                        this.nodes.push(new Node(response.nodes[j].id, response.nodes[j].id, parseInt(response.nodes[j].x), parseInt(response.nodes[j].y), null, true, response.nodes[j].location, response.nodes[j].loctype));
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
                                    //console.log("Looking", response[i].nodes[j].exits[k].via.annots.length, response[i].nodes[j].exits[k].via.annots[0]);
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
                            this.edges.push(newEdge);
                        }
                    }

                console.log(this);


                this.selected_rectangle = this.rectangles[this.rectangles.length -1];

                if (selected_rectangle){
                    if (this.getRectangleIndexByID(selected_rectangle.id) > -1){
                        this.selected_rectangle = this.rectangles[this.getRectangleIndexByID(selected_rectangle.id)];
                    }
                }


                if (notification_enabled) $.notify("View loaded successfully " + (new Date() - startTime)/1000 , "success");

                if (callBackAfterSuccess) {
                    callBackAfterSuccess();
                }
                if (onSelectLink){
                    console.log(this.selected_rectangle);
                    onSelectLink(this.selected_rectangle);
                }
            }
        });






    };


    this.draw = function (svg, onSelectNode, onSelectLink, onSelectRectangle, refresh_graph, syncSelectedGraph) {

        //console.log(this);
        //console.log("caller is " + arguments.callee.caller.toString());
        var width = parseInt(svg.attr("width"));
        var height = parseInt(svg.attr("height"));
        var nodeRadius = 8;
        var graph = this;

        multiple_selected_node_1 = null;
        multiple_selected_node_2 = null;

        //console.log(onSelectNode);

        // mouse event vars

            var mousedown_link = null,
            mousedown_node = null,
            mouseup_node = null,
            insert_node = null;

            var rectangle_draw = null;
            var rectangle_draw_started = null;
            var rectangle_x =  null;
            var rectangle_y = null;
            var resize_rectangle = null;
            var drag_button_enabled = false;





        // init D3 force layout
        var force = d3.layout.force()
            .nodes(nodes)
            .links(links)
            .size([width, height])
            .linkDistance(150)
            .charge(-550)
            .gravity(0.12)
            .on('tick', tick)

        var customDrag = force.drag()
            .on("drag", dragmove)
            .on("dragend", dragended);

        function dragended(d) {
            d.fixed = true;
        }

        function dragmove(d) {

            if (d.location){
                var boundingx = null;
                var boundingy = null;
                var boundingwidth = null;
                var boundingheight = null;

                for (var i = 0; i < rectangles.length; i++){
                    if (rectangles[i].id === d.location){

                        if (d.locationtype === "interior") {
                            boundingx = rectangles[i].x;
                            boundingy = rectangles[i].y;
                            boundingwidth = rectangles[i].width;
                            boundingheight = rectangles[i].height;

                            if (d.px > boundingx + boundingwidth - nodeRadius) d.px = boundingx + boundingwidth - nodeRadius;
                            if (d.px < boundingx + nodeRadius) d.px = boundingx + nodeRadius;
                            if (d.py > boundingy + boundingheight - nodeRadius) d.py = boundingy + boundingheight - nodeRadius;
                            if (d.py < boundingy + nodeRadius) d.py = boundingy + nodeRadius;


                        } else if (d.locationtype === "border") {
                            boundingx = rectangles[i].x;
                            boundingy = rectangles[i].y;
                            boundingwidth = rectangles[i].width;
                            boundingheight = rectangles[i].height;


                            if (d.x != boundingx  && d.x != boundingx + boundingwidth ){
                                if (Math.abs(d.py - boundingy) < Math.abs(d.py - (boundingy + boundingheight))){
                                    d.py = boundingy;
                                } else {
                                    d.py = boundingy + boundingheight;
                                }

                                //console.log(d.x, boundingx);
                            }
                            if (d.px > boundingx + boundingwidth  ) d.px = boundingx + boundingwidth ;
                            if (d.px < boundingx) d.px = boundingx ;
                            if (d.py > boundingy + boundingheight ) d.py = boundingy + boundingheight;
                            if (d.py < boundingy) d.py = boundingy;
                        }


                        break;
                    }
                }


            }

            if (d.px > width ) d.px = width ;
            if (d.px < 0 ) d.px = 0;
            if (d.py > height ) d.py = height ;
            if (d.py < 0 ) d.py = 0;
            $('#graphSave').css('color','red');
            restart();

        }




        var resizeRectangle= function resizeRectangle(d){
            resize_rectangle = d;
        }


        var customRectdrag = d3.behavior.drag()
            .origin(Object)
            .on("drag", rectdragmove);

        var offset = null;

        function rectdragmove(d){
            if (rectangle_draw) return;
            $('#graphSave').css('color','red');

            //graph.syncGraphLyphWithServer(graph.selected_rectangle);


            if (!offset) offset = [d3.event.x - d.x, d3.event.y - d.y ];
            //console.log(d3.event.x, offset);

            //move all nodes related to the selected rectangle

            for (var i =0; i < nodes.length; i++){
                if (nodes[i].location === d.id ){
                    //nodes[i].fixed = false;

                    nodes[i].px = nodes[i].px + (d3.event.x - offset[0]- d.x);
                    nodes[i].py = nodes[i].py + (d3.event.y - offset[1]- d.y);
                    //console.log(d3.event.y - offset[1]- d.y)


                } else {
                    //if (nodes[i].px > d3.event.x - offset[0] && nodes[i].px + nodeRadius < d3.event.x - offset[0] + d.width  && nodes[i].py + nodeRadius > d3.event.y - offset[1] && nodes[i].py + nodeRadius < d3.event.y - offset[1] + d.height ) nodes[i].px = nodes[i].px + (d3.event.x - offset[0]- d.x);
                    //if (nodes[i].px + nodeRadius < d3.event.x - offset[0] + d.width && nodes[i].py + nodeRadius > d3.event.y - offset[1] && nodes[i].py + nodeRadius < d3.event.y - offset[1] + d.height ) nodes[i].px = nodes[i].px + (d3.event.x - offset[0]- d.x);

                }
            }

            //move all contained rectangles.
            for (var j =0; j < rectangles.length; j++){
                //console.log("contained test", rectangles[j], isContainedIn(d, rectangles[j]));
                if (isContainedIn(d,rectangles[j])){
                    //console.log("true", rectangles[j]);
                    rectangles[j].x = rectangles[j].x + (d3.event.x - offset[0] - d.x);
                    rectangles[j].y = rectangles[j].y + (d3.event.y - offset[1] - d.y);


                    //move nodes of the contained rectangle
                    for (var k =0; k < nodes.length; k++){
                        if (nodes[k].location === rectangles[j].id) {

                            nodes[k].px = nodes[k].px + (d3.event.x - offset[0] - d.x);
                            nodes[k].py = nodes[k].py + (d3.event.y - offset[1] - d.y);
                            //console.log(d3.event.y - offset[1]- d.y)
                        }
                    }
                }
            }


            //actually move the current rectangle.
            d.x = d3.event.x - offset[0];
            d.y = d3.event.y - offset[1];




            //d.y = d3.event.y;
            //console.log(d3.event.dx, d3.event.dy, d3.event.x, d3.event.y);


            restart();


        }


        function isContainedIn(container, item){
            if (container === item) return false;

            var p = item;

            while(p){
                if (p === container) return true;
                if (p.location){
                    p = rectangles[graph.getRectangleIndexByID(p.location)];
                } else {
                    return false;
                }
            }
            return false;

        }



        // line displayed when dragging new nodes
        var drag_line = svg.append('svg:path')
            .attr('class', 'link dragline hidden')
            .attr('d', 'M0,0L0,0');

        // handles to link and node element groups
        var path = svg.append('g').attr('class', 'graph').selectAll('path'),
            pathoverlay = svg.append('g').attr('class', 'graph').selectAll('path'),
            circle = svg.append('g').attr('class', 'graph').selectAll('g'),
            labels = svg.append('g').attr('class', 'graph').selectAll('text'),
            auIcon = svg.append('g').attr('class','graph').selectAll('rect'),
            boxes = svg.append('g').attr('class', 'graph'),
            boxlabels = svg.append('g').attr('class', 'graph'),
            boxcorners = svg.append('g').attr('class', 'boxcorners'),
            boxhighlights = svg.append('g').attr('class', 'graph');
        ;


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

                //check if interior rectangle
                if (d.location){
                    var boundingx = null;
                    var boundingy = null;
                    var boundingwidth = null;
                    var boundingheight = null;

                    for (var i = 0; i < rectangles.length; i++){
                        if (rectangles[i].id === d.location){
                            //console.log(rectangles[i].id , d.location, d.locationtype)
                            if (d.locationtype === "interior") {
                                //console.log(rectangles[i].id , d.location, d.locationtype)
                                boundingx = rectangles[i].x;
                                boundingy = rectangles[i].y;
                                boundingwidth = rectangles[i].width;
                                boundingheight = rectangles[i].height;
                                //var localx = d.x;
                                //var localy  = d.y;

                                if (d.x > boundingx + boundingwidth - nodeRadius) d.x = boundingx + boundingwidth - nodeRadius;
                                if (d.x < boundingx + nodeRadius) d.x = boundingx + nodeRadius;
                                if (d.y > boundingy + boundingheight - nodeRadius) d.y = boundingy + boundingheight - nodeRadius;
                                if (d.y < boundingy + nodeRadius) d.y = boundingy + nodeRadius;

                                //d.x = localx;
                                //d.y = localy;

                                return 'translate(' + d.x + ',' + d.y + ')';
                            } else if (d.locationtype === "border") {
                                boundingx = rectangles[i].x;
                                boundingy = rectangles[i].y;
                                boundingwidth = rectangles[i].width;
                                boundingheight = rectangles[i].height;


                                //if (d.x != boundingx  && d.x != boundingx + boundingwidth ){
                                //    if (Math.abs(d.y - boundingy) < Math.abs(d.y - (boundingy + boundingheight))){
                                //        d.y = boundingy;
                                //    } else {
                                //        d.y = boundingy + boundingheight;
                                //    }
                                //}

                                if (Math.abs(d.y - boundingy) <= Math.abs(d.y - (boundingy + boundingheight)) &&
                                    Math.abs(d.y - boundingy) <= Math.abs(d.x - (boundingx)) &&
                                    Math.abs(d.y - boundingy) <= Math.abs(d.x - (boundingx + boundingwidth))){
                                    d.y = boundingy;
                                } else if (Math.abs(d.y - (boundingy + boundingheight)) < Math.abs(d.y - boundingy) &&
                                    Math.abs(d.y - (boundingy + boundingheight)) < Math.abs(d.x - boundingx) &&
                                    Math.abs(d.y - (boundingy + boundingheight)) < Math.abs(d.x - (boundingx + boundingwidth))){
                                    d.y = boundingy + boundingheight;
                                } else if (Math.abs(d.x - boundingx) < Math.abs(d.y - boundingy) &&
                                    Math.abs(d.x - boundingx) < Math.abs(d.y - (boundingy + boundingheight)) &&
                                    Math.abs(d.x - boundingx) < Math.abs(d.x - (boundingx + boundingwidth))){
                                    d.x = boundingx;
                                } else if (Math.abs(d.x - (boundingx + boundingwidth)) < Math.abs(d.y - boundingy) &&
                                    Math.abs(d.x - (boundingx + boundingwidth)) < Math.abs(d.y - (boundingy + boundingheight)) &&
                                    Math.abs(d.x - (boundingx + boundingwidth)) < Math.abs(d.x - boundingx )) {
                                    d.x = boundingx + boundingwidth;
                                }




                                if (d.x > boundingx + boundingwidth  ) d.x = boundingx + boundingwidth ;
                                if (d.x < boundingx) d.x = boundingx ;
                                if (d.y > boundingy + boundingheight ) d.y = boundingy + boundingheight;
                                if (d.y < boundingy) d.y = boundingy;
                                return 'translate(' + d.x + ',' + d.y + ')';

                            }


                            break;
                        }
                    }


                }


                //check if on border of rectangle

                //check if its going into a rectangle

                //check if its going outside the svg

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

            pathoverlay.attr('d', function (d) {
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
                var rot = 0;
                var dy = parseInt(d.target.y) - parseInt(d.source.y);
                var dx = parseInt(d.target.x) - parseInt(d.source.x);
                rot = Math.atan2(dy, dx) * 180/Math.PI;
                //console.log(rot);
                if (rot < -90 || rot > 90 )
                    rot += 180;
                return "translate(" + (d.target.x + d.source.x) / 2 + "," + (d.target.y + d.source.y) / 2 + ") rotate (" + rot + ")";
            });

            //restart();


        }




        // update graph (called when needed)
        var restart = function restart() {


            rectangles = graph.rectangles;

            //graph.saveGraphToServer();


            svg.selectAll('g.graph').remove();
            boxes = svg.append('g').attr('class', 'graph').selectAll('rect');
            pathoverlay = svg.append('g').attr('class', 'graph').selectAll('path');
            path = svg.append('g').attr('class', 'graph').selectAll('path');
            labels = svg.append('g').attr('class', 'graph').selectAll('text');
            auIcon = svg.append('g').attr('class','graph').selectAll('rect');
            circle = svg.append('g').attr('class', 'graph').selectAll('g');
            boxlabels = svg.append('g').attr('class', 'graph');
            boxcorners = svg.append('g').attr('class', 'graph').selectAll('g');
            boxhighlights = svg.append('g').attr('class', 'graph').selectAll('g');



            boxes = boxes.data(rectangles);

            //Rendering labels for the boxes
            boxlabels = boxes.enter().append('svg:text');
            boxlabels.attr('x' ,function (d) {return d.x})
                .attr('y' ,function (d) {return d.y-5 })
                .text( function (d) { if(d.lyph && d.lyph.id) return d.lyph.id + " - " + d.lyph.name; return ""});



            //////box highlights
            //boxhighlights = boxhighlights.data(rectangles);
            //boxhighlights = boxhighlights.enter().append('svg:rect');
            //boxhighlights.attr('x' ,function (d) {return d.x})
            //    .attr('y' ,function (d) {return d.y})
            //    .attr('width' ,function (d) {return d.width})
            //    .attr('height' ,function (d) {return d.height})
            //    .attr('stroke-width', 20)
            //    .attr('stroke-opacity', 1)
            //    .attr('stroke', function (d) {
            //        if (graph.selected_rectangle  === d)
            //            return 'yellow';
            //        return false
            //    })
            //    .attr('fill', 'none')



            //Rendering the boxes themselves
            boxes = boxes.enter().append('svg:rect');
            boxes.attr('x' ,function (d) {return d.x})
                .attr('y' ,function (d) {return d.y})
                .attr('width' ,function (d) {return d.width})
                .attr('height' ,function (d) {return d.height})
                .attr('class', 'rectangles')
                .attr('stroke', function (d){

                    //if (d === graph.selected_rectangle)
                    //    return 'blue';
                    if (!d.location)
                        return ' lightgray';
                    if (d.location === findSmallestContainer(d))
                        return 'green';
                    else
                        return 'red';
                })
                .attr('stroke-dasharray', function(d){
                    if (graph.selected_rectangle  === d)
                        return '10,6';
                })
                .call(customRectdrag)
                .on('mousedown', function (d) {
                    console.log("rectangle click");
                    graph.selected_rectangle = d;
                    graph.selected_link = null;
                    graph.selected_node = null;

                    console.log("rectangle clicked", graph.selected_rectangle);
                    onSelectLink(d);
                    restart();
                });

            //Rendering corner boxes for resize
            boxcorners = boxcorners.data(rectangles);
            boxcorners = boxcorners.enter().append('svg:rect');
            boxcorners.attr('x' ,function (d) {return d.x + d.width - 5})
                .attr('y' ,function (d) {return d.y + d.height - 5})
                .attr('width' ,function (d) {return 10})
                .attr('height' ,function (d) {return 10})
                .attr('class', 'boxcorners')
                .on('mousedown', function (d) {
                    console.log("resize click");
                    graph.selected_link = null;
                    graph.selected_node = null;
                    graph.selected_rectangle = d;
                    resizeRectangle(d);
                    restart();
                });








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

                    //console.log(rectangle_draw);

                    if (d3.event.keyCode == 68 || rectangle_draw) return;

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
                    graph.selected_rectangle = null;

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
                    if (drag_button_enabled) return;

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

            //show node IDs
            //g.append('svg:text')
            //    .attr('x', 0)
            //    .attr('y', 4)
            //    .attr('class', 'id')
            //    .text(function (d) {
            //        return d.name;
            //    });

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
                .style("fill", function (d) {
                    return d.colour;
                })
                .attr("height", function (d) {return d.thickness * 5;})
                .attr("width", function (d) {return  20;})
                .attr("x", function(d){return 0;})
                .attr("y", function(d, i){ return ((i+1) * 5);})
                //.attr("y", function (d, i) {
                //    if (i ==0) prev =0; // reset the starting y for layers for each link
                //    if (i ==0) prev =0; // reset the starting y for layers for each link
                //    prev += d.thickness * layerHeight; //remember the relative Y coordinate of the current layer
                //
                //    return prev - d.thickness * layerHeight;
                //})
                .attr("class", "layer")

            ;

            auIcon.selectAll(".outline")
                .data(function (d){
                    if (d.au){
                        return [d.au];
                    }
                    return [];
                }).enter().append("rect")
                .attr("height", function (d) {return d.layers.length * 5;})
                .attr("width", function (d) {return 20;})
                .attr("x", function(d){return 0;})
                .attr("y", function(d, i){ return 5;})
                .on("mousedown", function (d){
                    console.log("Clicked on Template:" + d.id );
                    window.open("asymmetric-unit.html?template=" + d.id, '_blank');
                })
                .style("fill-opacity" , function (d){return 0})
                .append("title")
                .text(function(d) {
                    var tooltip = "";
                    for (var i =0; i < d.layers.length ; i++){

                        tooltip += d.layers[i].name + ":";
                        tooltip += "{";

                        for (var j =0; j < d.layers[i].materials.length; j++){
                            tooltip += d.layers[i].materials[j].name;
                            if (j+1 < d.layers[i].materials.length  )
                                tooltip += ",";
                        }



                        tooltip += "}";
                        if (i+1 < d.layers.length  )
                            tooltip += "\n";

                    }


                    return   tooltip; })



            // path (link) group
            path = path.data(links);
            pathoverlay = pathoverlay.data(links);

            // update existing links
            path = path.classed('selected', function (d) {
                return d === graph.selected_link;
            })



            pathoverlay = pathoverlay.classed('selected', function (d) {
                return d === graph.selected_link;
            })


            // add new links
            pathoverlay.enter().append('path')
                //.attr('class', 'link')
                .style("stroke-width", "12")
                .style("stroke-opacity", "0.2")
                .style('stroke', function (d) {
                    if (d.highlighted) {
                        return d3.rgb(255, 0, 0);
                    }
                })


           path.enter().append('path')
                .attr('class', 'link')
               //.style("stroke-opacity", "0.6")
               //.style("opacity", "0.6")
                .classed('selected', function (d) {
                    return d === graph.selected_link;
                })
               .style('stroke', function (d) {
                   return d3.rgb(colors(d.type));
               })
               .on('mousedown', function (d) {
                    if (d3.event.ctrlKey) return;

                    // select link
                    mousedown_link = d;
                    if (mousedown_link === graph.selected_link) {
                        graph.selected_link = null;
                        $("#ins").text("Deselected Link:" + d.id);
                    } else {
                        graph.selected_link = mousedown_link;
                        console.log(graph.selected_link);
                        $("#ins").text("Selected Link: [" + d.source.id + "," + d.target.id + "]");
                    }
                    graph.selected_node = null;
                   graph.selected_rectangle = null;
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
                    s += "Annots:" + d.annotations;
                    return s;

                })
            ;


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

            //console.log("5", rectangle_draw);

            if (d3.event.keyCode == 68 || mousedown_node || mousedown_link) return;


            if (rectangle_draw) {
                console.log("2");
                rectangle_draw_started = true;

                rectangle_x = d3.mouse(this)[0];
                rectangle_y = d3.mouse(this)[1];
                console.log("Draw rect", rectangle_x, rectangle_y);
                graph.rectangles.push(new Rectangle("R" + rectangles.length, rectangle_x, rectangle_y, 1, 1, null, null));
                console.log(rectangles);
                restart();
                return;
            }

            // insert new node at point
            if (insert_node) {
                var point = d3.mouse(this),
                    node = new Node(++lastNodeId, ".", point[0], point[1], null, true);
                nodes.push(node);
                insert_node = false;

                restart();

                //ajax call to create new node.
                //function ajax_create_new_node () {
                $.ajax
                ({
                    url:
                        "http://open-physiology.org:"+ serverPort + "/makelyphnode/" ,

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

            restart();
        }

        function mousemove() {
            if (rectangle_draw && rectangle_draw_started){
                console.log("3");
                rectangles[rectangles.length-1].width = d3.mouse(this)[0] - rectangles[rectangles.length-1].x;
                rectangles[rectangles.length-1].height = d3.mouse(this)[1] - rectangles[rectangles.length-1].y;
                //console.log(rectangles[rectangles.length-1]);
                restart();
                return;
            }


            if (resize_rectangle){

                var newWidth = (d3.mouse(this)[0] - resize_rectangle.x > 5) ? d3.mouse(this)[0] - resize_rectangle.x : 5 ;
                var newHeight = (d3.mouse(this)[1] - resize_rectangle.y > 5) ? d3.mouse(this)[1] - resize_rectangle.y : 5 ;

                resize_rectangle.width = newWidth;
                resize_rectangle.height = newHeight;
                //console.log("Resizing rectangle", resize_rectangle.width)
                restart();
                return;
            }


            if (!mousedown_node) return;

            if (drag_button_enabled) return;

            // update drag line
            drag_line.attr('d', 'M' + mousedown_node.x + ',' + mousedown_node.y + 'L' + d3.mouse(this)[0] + ',' + d3.mouse(this)[1]);

            restart();
        }

        function mouseup() {


            //graph.reloadGraphFromServer(restart);
            console.log(graph.selected_rectangle);
            //graph.syncGraphLyphWithServer(graph.selected_rectangle)


            //graph.selected_rectangle = rectangles[rectangles.length-1];

            if (rectangle_draw){
                console.log("4");
                console.log(rectangles);
                graph.selected_rectangle = rectangles[rectangles.length-1];

                //onSelectLink(graph.selected_rectangle);
                //graph.syncGraphLyphWithServer(graph.selected_rectangle);

                rectangle_draw = false;
                rectangle_draw_started = false;

                //graph.saveGraphtoServer(refresh_graph, syncSelectedGraph, onSelectLink, graph.selected_rectangle);


                $('#userconsole').text("Rectangle draw done.");

            }

            if (resize_rectangle){
                //graph.saveGraphtoServer(refresh_graph, syncSelectedGraph, onSelectLink, graph.selected_rectangle);
                //graph.syncGraphLyphWithServer(graph.selected_rectangle);
                console.log("Resizing done")
                resize_rectangle = null;

                //restart();
            }

            graph.saveGraphtoServer(refresh_graph, syncSelectedGraph, onSelectLink, graph.selected_rectangle);


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

            restart();
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
                drag_button_enabled = true;
            }





            if (!graph.keyboardShortcutEnabled) return;

            //TODO figure out the effect of removing the following line?
            //if (!graph.selected_node && !graph.selected_link) return;
            switch (d3.event.keyCode) {
                case 88: // x
                case 46: // delete

                    if (graph.selected_node) {
                        nodes.splice(nodes.indexOf(graph.selected_node), 1);
                        spliceLinksForNode(graph.selected_node);
                    } else if (graph.selected_link) {
                        links.splice(links.indexOf(graph.selected_link), 1);
                    } else if (graph.selected_rectangle){
                        console.log(graph.selected_rectangle);
                        console.log(rectangles);
                        rectangles.splice(rectangles.indexOf(graph.selected_rectangle), 1)
                        console.log(rectangles);
                    }
                    graph.selected_rectangle = null;
                    graph.selected_link = null;
                    graph.selected_node = null;
                    graph.saveGraphtoServer(refresh_graph, syncSelectedGraph);
                    //lastNodeId--;
                    //restart();
                    break;
                //case 66: // B
                //    if (graph.selected_link) {
                //        // set link direction to both left and right
                //        graph.selected_link.left = true;
                //        graph.selected_link.right = true;
                //    }
                //    restart();
                //    break;
                //case 76: // L
                //    if (graph.selected_link) {
                //        // set link direction to left only
                //        graph.selected_link.left = true;
                //        graph.selected_link.right = false;
                //    }
                //    restart();
                //    break;
                ////case 82: // R
                //    if (graph.selected_node) {
                //        // toggle node fixed
                //        graph.selected_node.fixed = !graph.selected_node.fixed;
                //    } else if (graph.selected_link) {
                //        // set link direction to right only
                //        graph.selected_link.left = false;
                //        graph.selected_link.right = true;
                //    }
                //    restart();
                //    break;
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
                case 83: //s
                    if (!graph.selected_link) {
                        console.log("Link not selected");
                        return;
                    } else {
                        breakLink();
                    }
                    restart();
                    break;
                case 67: //c

                    if (!graph.selected_node) {
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
                case 82: // R - Rectangle
                    if (notification_enabled) $.notify("Draw Rectangle active. Click and drag to draw rectangle", "info");
                    console.log("r clicked", graph.rectangles);
                    for (var rcounter = 0; rcounter < graph.rectangles.length; rcounter++){
                        console.log("id", graph.rectangles[rcounter].id);
                        if (graph.rectangles[rcounter].id === null || graph.rectangles[rcounter].id === ""){
                            alert("You cannot have more than one undefined rectangle in the view" );
                            return;
                        }
                    }

                    $('#userconsole').text("Rectangle draw enable, click and move mouse right, bottom to draw.");
                    rectangle_draw = true;
                    console.log("1", rectangle_draw);
                    break;
                case 73: // I - insert node
                    insert_node = true;
                    break;
                case 76: // l - remove node location data
                    //console.log(graph.selected_node);
                    if (graph.selected_node) {
                        graph.selected_node.location = null;
                        graph.selected_node.locationtype = null;
                        //console.log(graph.selected_node);
                    }
                    break;
                case 65: // a - Attach node to lyph
                    $('#userconsole').text("Attaching node to interior of lyph");
                    attachNodeToLyph("interior");
                    break;
                case 66: // b - Attach node to lyph
                    $('#userconsole').text("Attaching node to interior of lyph");
                    attachNodeToLyph("border");
                    break;

                case 69:  //e - assign rectangle to rectangle.
                    assignRectangleToRectange();
                    break;


            }
        }


        function findSmallestContainer(rect){
            //console.log("Finding smallest container");
            //console.log(graph.selected_rectangle);
            var smallestContainer =null;
            var smallestContainerSize =0;

            for (var i = 0; i < rectangles.length; i++){

                if (rect.id === rectangles[i].id)
                    continue;
                //console.log("checking containment against", rectangles[i]);

                if (rect.x >= rectangles[i].x && rect.y >= rectangles[i].y
                    && rect.width <= rectangles[i].width - (rect.x - rectangles[i].x)
                    && rect.height <= rectangles[i].height - (rect.y - rectangles[i].y)
                ){
                    //console.log(rect, "is contained in", rectangles[i]);
                    if (smallestContainer == null || rectangles[i].height * rectangles[i].width < smallestContainerSize){
                        smallestContainer = rectangles[i];
                        smallestContainerSize = rectangles[i].height * rectangles[i].width;
                    }
                }
            }

            if (smallestContainer === null) {
                //console.log("No valid container found");
                return null;
            }
            else {
                //console.log(smallestContainer, " is the containing rectangle");
                return smallestContainer.id;
            }
        }



        function assignRectangleToRectange(){
            console.log("Assigning rectangle to rectangle");

            //console.log(graph.selected_rectangle);


            if (!graph.selected_rectangle.lyph){
                alert("Please save lyph before attempting to assign location" );
                return;
            }


            //console.log(graph.selected_rectangle);
            var smallestContainer =null;
            var smallestContainerSize =0;


            for (var i = 0; i < rectangles.length; i++){

                if (graph.selected_rectangle.id === rectangles[i].id)
                    continue;
                console.log("checking containment against", rectangles[i]);

                if (graph.selected_rectangle.x >= rectangles[i].x && graph.selected_rectangle.y >= rectangles[i].y
                    && graph.selected_rectangle.width <= rectangles[i].width - (graph.selected_rectangle.x - rectangles[i].x)
                    && graph.selected_rectangle.height <= rectangles[i].height - (graph.selected_rectangle.y - rectangles[i].y)
                ){
                    console.log(graph.selected_rectangle, "is contained in", rectangles[i]);
                    if (smallestContainer == null || rectangles[i].height * rectangles[i].width < smallestContainerSize){
                        smallestContainer = rectangles[i];
                        smallestContainerSize = rectangles[i].height * rectangles[i].width;
                    }
                }
            }

            if (smallestContainer === null) {
                console.log("No valid container found");
                graph.selected_rectangle.location = null;
            }
            else {
                console.log(smallestContainer, " is the containing rectangle");
                graph.selected_rectangle.location = smallestContainer.id;
                d3.select('#lyphLocation').property("value", smallestContainer.lyph.name);

            }

                //Send ajax call to update the lyph with the location information
                $.ajax
                ({
                    url:
                    "http://open-physiology.org:"+serverPort+"/editlyph/"+
                    "?lyph="+ graph.selected_rectangle.lyph.id +
                    "&location=" + graph.selected_rectangle.location,

                    jsonp: "callback",

                    dataType: "jsonp",


                    success: function (response) {
                        response;

                        if (response.hasOwnProperty("Error")) {
                            console.log("Lyph Locaiton Assignmnet Error" , response);
                            return;
                        }

                        console.log(response);

                    }
                });
            //}

            restart();
        }

        function attachNodeToLyph(locationType){
            //console.log(graph.selected_node.x, graph.selected_node.y);

            var boundingx = null;
            var boundingy = null;
            var boundingwidth = null;
            var boundingheight = null;

            var boundingRectangleSize = null;
            var boundingRectangleID = null;
            var boundingRectangleLyphID = null;

            for (var i = 0; i < rectangles.length; i++){ // check for interior

                boundingx = rectangles[i].x;
                boundingy = rectangles[i].y;
                boundingwidth = rectangles[i].width;
                boundingheight = rectangles[i].height;


                //console.log(boundingRectangleID);
                console.log(rectangles);

                if (graph.selected_node.x > boundingx + boundingwidth + (nodeRadius/2)) continue;
                if (graph.selected_node.x < boundingx - (nodeRadius/2) ) continue;
                if (graph.selected_node.y > boundingy + boundingheight + (nodeRadius /2)) continue;
                if (graph.selected_node.y < boundingy - (nodeRadius/2)) continue;

                if (boundingRectangleSize){
                    if ((boundingwidth * boundingheight) < boundingRectangleSize){
                        boundingRectangleSize = boundingwidth * boundingheight;
                        boundingRectangleID = rectangles[i].id;
                        boundingRectangleLyphID = rectangles[i].lyph.id;
                    }
                } else {
                    boundingRectangleSize = boundingwidth * boundingheight;
                    boundingRectangleID = rectangles[i].id;
                    boundingRectangleLyphID = rectangles[i].lyph.id;
                }

            }


            graph.selected_node.location = boundingRectangleID;
            graph.selected_node.locationtype = locationType;
            //graph.selected_node.fixed = true;
            console.log(graph.selected_node, boundingRectangleLyphID);
            $('#userconsole').text("Attached node " + graph.selected_node.name + " to " + locationType + " of lyph " + boundingRectangleID);

            //send ajax request to store location information in database

            //send ajax request
            $.ajax
            ({
                context: this,
                url:
                "http://open-physiology.org:"+ serverPort + "/editlyphnode/" +
                "?node=" + graph.selected_node.name +
                    "&location=" + boundingRectangleLyphID +
                    "&loctype=" + locationType,

                jsonp: "callback",

                dataType: "jsonp",


                success: function (response) {


                    if (response.hasOwnProperty("Error")) {
                        console.log("Lyph node update error" , response);
                        return;
                    }

                    console.log(response)   ;





                }
            });


        }


        //TODO: Improve the breakLink function
        function breakLink() {

            var breakCount = 2;
            //$.prompt("What's your name?",
            //    function(s){$.alert('Your name is '+s);});

            breakCount = prompt("Number of replacement edges?");


            //store start and end nodes
            var startnode = graph.selected_link.source;
            var lastnode = graph.selected_link.target;
            var insertBorderNodes = null;
            var startNodeLocation = startnode.location;
            var lastNodeLocation = lastnode.location;


            startnode.location != lastnode.location ?  insertBorderNodes = true:insertBorderNodes= false;

            console.log(startNodeLocation,lastNodeLocation);

            //remove the link between then nodes
            links.splice(links.indexOf(graph.selected_link), 1);


            //insert n nodes and edges
            for (var i = 0; i < breakCount; i++) {

                (function (){

                    var generatedNode = new Node(++lastNodeId,".", 100,100,null,true, null, null);

                    if (i === 0 && insertBorderNodes){
                        generatedNode.location = startNodeLocation;
                        generatedNode.locationtype = "border";
                        generatedNode.locationLyph = getRectangleLyph(generatedNode.location);
                        generatedNode.x = (startnode.x + lastnode.x)/2;
                        generatedNode.y = (startnode.y + lastnode.y)/2;
                    }
                    if (i === breakCount -1 && insertBorderNodes){
                        generatedNode.location = lastNodeLocation;
                        generatedNode.locationtype = "border";
                        generatedNode.locationLyph = getRectangleLyph(generatedNode.location);
                        generatedNode.x = (startnode.x + lastnode.x)/2;
                        generatedNode.y = (startnode.y + lastnode.y)/2;
                    }

                    console.log("generated node", generatedNode);

                    //ajax call to create new node.
                    //function ajax_create_new_node () {
                    $.ajax
                    ({
                        url:
                            "http://open-physiology.org:"+ serverPort + "/makelyphnode/" +
                                "?location=" + encodeURIComponent(generatedNode.locationLyph) +
                                "&loctype=" + encodeURIComponent(generatedNode.locationtype)
                        ,

                        jsonp: "callback",

                        dataType: "jsonp",


                        success: function (response) {
                            response;

                            if (response.hasOwnProperty("Error")) {
                                console.log("Node creation error:" , response);
                                return;
                            }
                            generatedNode.name = response.id;

                            //console.log(node.name);

                            restart();
                        }
                    });

                    nodes.push(generatedNode);
                    links.push({source: startnode, target: generatedNode, left: false, right: false, highlighted: false})
                    startnode = generatedNode;
                }());


            }

            links.push({source: startnode, target: lastnode, left: false, right: false, highlighted: false})

            //removing selection of link as the link no longer exists
            graph.selected_link = null;
            console.log(nodes);
            console.log(links)


        }


        function keyup() {
            lastKeyDown = -1;

            // ctrl
            if (d3.event.keyCode === 68) {
                circle
                    .on('mousedown.drag', null)
                    .on('touchstart.drag', null);
                svg.classed('ctrl', false);
                drag_button_enabled = false;
            }
        }

        function getRectangleLyph(id){
            for (var i =0; i < rectangles.length; i++){
                if (rectangles[i].id === id) {
                    console.log(rectangles[i].id, id);
                    return rectangles[i].lyphID;
                }
            }
        }

        // app starts here
        svg.on('mousedown', mousedown)
            .on('mousemove', mousemove)
            .on('mouseup', mouseup);
        d3.select(window)
            .on('keydown', keydown)
            .on('keyup', keyup);

        //asking for a reload of the data
        //console.log(restart);

        restart();
    }



}

