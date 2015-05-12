var rehashaueditor;

var auEditor = function () {

    var width = 960, height = 500;
    var panelWidth = 300, panelHeight = 500;

    // create canvas
    var svg = d3.select('#app-body .chart').append("svg")
        .attr("width", width)
        .attr("height", height);

    var auRepoSvg = d3.select('#app-body .auRepo').append("svg")
        .attr("width", panelWidth)
        .attr("height", panelHeight);

    var auMaterialRepoSvg = d3.select('#app-body .auRepo2').append("svg")
        .attr("width", panelWidth)
        .attr("height", panelHeight);


    var materialRepoSvg = d3.select('#app-body .materialRepo').append("svg")
        .attr("width", panelWidth)
        .attr("height", panelHeight);

    /////////////////////////////////////////////////////////
    //Visualization
    /////////////////////////////////////////////////////////
    var selectedAUNode = null;    //Selected AU
    var selectedAU = null;        //Selected AU data
    var selectedLayerNode = null; //Selected layer
    var selectedLayer = null;     //Selected layer data
    var selectedMaterialNode = null;  //Selected material
    var selectedMaterial = null;  //Selected material data

    var onSelectLayer = function (d){
        selectedLayer = d;
        selectedAU.draw(svg, mainVP, onSelectLayer, selectedLayer);
        updateLayerParameters(selectedLayer);
        ////if (this != selectedLayerNode){
        //    d3.select(this).style("stroke", "red").style("stroke-width", 2);
        //    d3.select(selectedLayerNode).style("stroke", "black").style("stroke-width", 0);
        //    selectedLayerNode = this;
        //    selectedLayer = d;
        //    console.log("Layer Selected")
        //    updateLayerParameters(selectedLayer);
        //
        ////}
    }

    var onSelectAU = function(d){
        //if (this != selectedAUNode){
        //    d3.select(this).style("stroke", "red");
        //    d3.select(selectedAUNode).style("stroke", "black");
        //    selectedAUNode = this;
        //    selectedAU = d;
        //    if (selectedAU.layers != null && selectedAU.layers.length > 0)
        //        selectedLayer = selectedAU.layers[0];
        //    syncSelectedAU();
        //    updateLayerParameters(selectedLayer);
        //}
        selectedAU = d;
        auRepo.draw(auRepoSvg, auRepoVP, onSelectAU, selectedAU);
        syncSelectedAU();
    }




    var onSelectMaterialAU = function(d){
        console.log(d);
        if (this != selectedMaterial){
            d3.select(this).style("stroke", "red");
            d3.select(selectedMaterialNode).style("stroke", "black");
            selectedMaterialNode = this;
            selectedMaterial = d;
            updateMaterialParameters(selectedMaterial);
        }
    }



    //Function used directly and as callback function to handle new material selection.
    //@param {material} d material to be selected.
    var onSelectMaterial = function(d){
            selectedMaterial = d;
            materialRepo.draw(materialRepoSvg, materialRepoVP, onSelectMaterial, selectedMaterial);
            updateMaterialParameters(selectedMaterial);
    }



    ///////////////////////////////////////////////////////
    //Demo
    ///////////////////////////////////////////////////////
    ////Init visual parameters
    var mainVP = new VisualParameters("horizontal", 500, 50, width, height, 10);
    var auRepoVP = new VisualParameters("horizontal", 30, 5, panelWidth, panelHeight, 0);
    var materialRepoVP = new VisualParameters("horizontal", 20, 20, panelWidth, panelHeight, 0);

    //auRepo.draw(auRepoSvg, auRepoVP, onSelectAU);
    //materialRepo.draw(materialRepoSvg, materialRepoVP, onSelectMaterial);
    //loadMaterialRepoToDatalist(materialRepo);
    //
    //selectedAU = auRepo.auSet[0];
    //if (selectedAU.layers != null && selectedAU.layers.length > 0)
    //    selectedLayer = selectedAU.layers[0];
    //if (materialRepo.materials != null && materialRepo.materials.length > 0)
    //    selectedMaterial = materialRepo.materials[0];
    //syncSelectedAU();
    //updateLayerParameters(selectedLayer);
    //window.addEventListener("keydown", function (e) {onDocumentKeyDown(e);}, false);

    ////////////////////////////////////////////////////////////
    function syncSelectedAU(){
        updateAUParameters(selectedAU);
        updateVisualParameters(mainVP);
        selectedAU.draw(svg, mainVP, onSelectLayer);
    }

    ////////////////////////////////////////////////////////////
    function onDocumentKeyDown(evt){
        var keyCode = evt.which;
        //Delete layer
        if (keyCode == 46) {//DEL
            deleteLayer(selectedAU, selectedLayer);
        }
    }

    ////////////////////////////////////////////////////////////
    //Material parameters
    ////////////////////////////////////////////////////////////
    function loadMaterialRepoToDatalist(materialRepo){
        d3.select('datalist#materials')
            .selectAll('options')
            .data(materialRepo.materials)
            .enter()
            .append("option")
            .attr("value", function(d){return d.id;});
    }

    function updateMaterialParameters(material){
        console.log(material);
        d3.select("#materialID").property("value", material.id);
        d3.select("#materialName").property("value", material.name);
    }

    d3.select("#materialID").on("input", function () {
        var materialIndex  = materialRepo.getIndexByID(materialID.value);
        if (materialIndex > -1)
            d3.select("#materialName").property("value", materialRepo[materialIndex].name);
    });

    ////////////////////////////////////////////////////////////
    //AU Parameters
    ////////////////////////////////////////////////////////////
    function updateAUParameters(au){
        d3.select("#auID").property("value", au.id);
        d3.select("#auName").property("value", au.name);
        d3.select("#auLength").property("value", au.length);
    }

    function updateAU(au){
        au.id = auID.value;
        au.name = auName.value;
        au.length = auLength.value;

        au.draw(svg, mainVP, onSelectLayer);
        //auRepo.draw(auRepoSvg, auRepoVP, onSelectAU);
        redraw_aurepos();
    }

    function cloneAU(au){
        console.log("here");

        //if (auRepo.getIndexByID(auID.value) > -1){
        //    alert("Cannot create a new AU: another AU with such ID exists!");
        //    return;
        //}
        var newAU = null;
        if (au != null){
            newAU = au.clone();
            newAU.id = auID.value+"_clone";
            newAU.name = auName.value+"_clone";
            newAU.length = auLength.value;
        }
        else {
            //newAU = new AsymmetricUnit("newAU", "newAu", [], auLength.value);
            //console.log(newAU);
            alert("No AU Selected");
            return;
        }

        if (auRepo == null) auRepo  = new AsymmetricUnitRepo([newAU]);
        else auRepo.addAt(newAU, 0);

        //auRepo.draw(auRepoSvg, auRepoVP, onSelectAU);
        //newau.draw()
        newAU.draw(svg, mainVP, onSelectLayer);
        redraw_aurepos();
    }

    function newAU(){
        var newAU = null;
        newAU = new AsymmetricUnit("newAU" + (auRepo ? auRepo.auSet.length +1  : 1), "newAu" + + (auRepo ? auRepo.auSet.length +1  : 1), [], (auLength.value) ? auLength.value : 1);
        console.log("New AU Created:", newAU);
        if (auRepo == null) auRepo  = new AsymmetricUnitRepo([newAU]);
        else auRepo.addAt(newAU, 0);
        newAU.draw(svg, mainVP, onSelectLayer);
        redraw_aurepos();
        onSelectAU(newAU); //Selecting the AU


    }


    function saveAUtoServer(au){
        console.log(au);
        var query = "http://open-physiology.org:5055/maketemplate/" +
            "?name=" + encodeURIComponent(au.name) +
            "&type=" + encodeURIComponent("shell");
        for ( var i = 0; i < au.layers.length; i ++){
            query += "&layer"+(i+1) + "="+  encodeURIComponent(au.layers[i].id);
        }
        console.log(query);

        $.ajax
        ({
            url:query,

            jsonp: "callback",

            dataType: "jsonp",


            success: function (response) {
                response;

                if (response.hasOwnProperty("Error")) {
                    console.log("Layer creation error:" , response);
                    return;
                }

                console.log("AU Create:", response);

                if (au.id == response.id){
                    console.log("AU already saved to database");
                    return;
                }

                if (auRepo.getIndexByID(response.id) > -1){
                    console.log("AU already exists in database as" , response.id,response.name);
                    $('#userconsole').text("AU already exists in database as" , response.id,response.name);

                    return;
                }

                console.log("New AU");
                au.id = response.id;
                au.name = response.name;

                rehashaueditor();

            }
        });









    }

    //New AU Button Click
    d3.select("#auNew").on("click", function() {
        console.log("here");
        newAU();
    })

    d3.select("#auClone").on("click", function() {
        console.log("here");
        cloneAU(selectedAU);
    })

    d3.select("#auSave").on("click", function() {
        if (selectedAU != null){
            saveAUtoServer(selectedAU)
        }
    })


    d3.select("#auUpdate").on("click", function() {
        if (selectedAU != null){
            if (auID.value != selectedAU.id && auRepo.getIndexByID(auID.value) > -1){
                alert("Cannot update AU: another AU with such ID exists!");
                return;
            }
            updateAU(selectedAU);
        } else {
            alert("Error: AU is not selected!");
        }
    })

    d3.select("#auRestore").on("click", function() {
        if (selectedAU != null){
            updateAUParameters(selectedAU);
        }
    })

    d3.select("#auDelete").on("click", function() {
        if (selectedAU != null) {
            var index = auRepo.getIndexByID(selectedAU.id);
            if (index > -1) {
                if (confirm("Delete asymmetric unit " + selectedAU.id + "?")) {
                    auRepo.removeAt(index);
                    if (auRepo.auSet.length > 0) selectedAU = auRepo.auSet[0];
                    selectedAU.draw(svg, mainVP, onSelectLayer);
                    //auRepo.draw(auRepoSvg, auRepoVP, onSelectAU);
                    redraw_aurepos();
                    updateAUParameters(selectedAU);

                }
            }
        }
    })

    ////////////////////////////////////////////////////////////
    //Layer parameters
    ////////////////////////////////////////////////////////////
    function updateLayerParameters(layer){
        if (layer != null){
            d3.select("#layerID").property("value", layer.id);
            d3.select("#layerName").property("value", layer.name);
            d3.select("#layerThickness").property("value", layer.thickness);
            //d3.select("#materialID").property("value", layer.materials[0].id);
            //d3.select("#materialName").property("value", layer.materials[0].name);
        }
    }

    function deleteLayer(au, layer){
        if (au != null && layer != null){
            if (confirm("Delete layer " + layer.id + " from AU " + au.id + "?")){
                var index = au.getLayerIndex(selectedLayer.id);
                if (index > -1){
                    au.removeLayerAt(index);
                    au.draw(svg, mainVP, onSelectLayer);
                }
            }
        } else {
            alert("Cannot delete a layer: " + (au == null )? " AU is not selected!" : " layer is not selected!");
        }
    }



    //Handle Add Layer
    d3.select("#layerClone").on("click", function() {
        if (debugging) console.log("Adding new layer");


        //Create new blank layer
        var newLayer = new Layer("Layer_" +  (layerRepo ? layerRepo.getNumberOfLayers() + 1 : "1") , layerName.value ? layerName.value : "Layer_" + (layerRepo ? layerRepo.getNumberOfLayers() + 1 : "1"), layerThickness.value ? layerThickness.value : 1)

        // Add blank layer to layer repo
        if (layerRepo){
            if (debugging) console.log("Layer Repo Exists");
            layerRepo.addAt(newLayer, 0);
        } else {
            console.log("Layer Repo Uninitialised");
            layerRepo = new LayerRepo([newLayer]);
        }
        if (debugging) console.log(layerRepo);

        //Add new layer to AU
        if (selectedAU){
            console.log("Adding layer Selected AU:", selectedAU);
            //TODO - Add layers in a more user-friendly way, below the  selected layer rather than at position 0.
            selectedAU.addLayerAt(newLayer, 0);
        } else {
            //TODO - Perhaps move this error condition as a check before even creating the layers.
            console.log("No AU Selected");
            selectedAU.addLayerAt(newLayer, 0);
        }

        //Draw the AU
        //selectedAU.draw(svg, mainVP, onSelectLayer);
        onSelectLayer(newLayer)


    })



    //Todo incorporate the code as handle material and remove the following function.
    //Previous Handle Add Layer
     d3.select("#DefunctlayerClone").on("click", function() {
         //if (selectedAU.getLayerIndex(layerID.value) > -1){
         //    alert("Cannot create a new layer: another layer with such ID exists!");
         //    return;
         //}

         //console.log(layers);

         var material  = (materialRepo.getIndexByID(materialID.value) > auRepo.getIndexByID(materialID.value)) ? materialRepo.materials[materialRepo.getIndexByID(materialID.value)] : auRepo.auSet[auRepo.getIndexByID(materialID.value)];
         if (!material) {
             alert("Cannot update the level: no material with such ID exists!");
             return;
         }


        var materials = [material];


         //var  = materialRepo.materials[materialIndex];

         console.log("LayerRepo:" ,(layerRepo == null));

         //If this is the first AU we are creating and the layerRepo is null
         if (layerRepo == null){
             var newLayer = new Layer("Layer_1", materialName.value, 1, materials);
             layerRepo = new LayerRepo([newLayer]);
             selectedAU.addLayerAt(newLayer, 0);
             selectedAU.draw(svg, mainVP, onSelectLayer);
             //auRepo.draw(auRepoSvg, auRepoVP, onSelectAU);
             redraw_aurepos();
             console.log(layerRepo);
         } else { // If AUs already exist
             var layerindex = layerRepo.containsLayer(layerThickness.value, materials);
             if (layerindex > -1) {  // Layer exists so simply add
                 //var index = selectedAU.getLayerIndex(selectedLayer.id) + 1;
                 //if (index == 0) index = selectedAU.getNumberOfLayers();
                 selectedAU.addLayerAt(layerRepo.layers[layerindex], 0);
                 selectedAU.draw(svg, mainVP, onSelectLayer);
                 //auRepo.draw(auRepoSvg, auRepoVP, onSelectAU);
                 redraw_aurepos();
             } else { // Layer does not exist, create a new layer
                 newLayer = new Layer(layerID.value, materialName.value, layerThickness.value, material);
                 //var index = selectedAU.getLayerIndex(selectedLayer.id) + 1;
                 //if (index == 0) index = selectedAU.getNumberOfLayers();
                 layerRepo.addAt(newLayer, 0);
                 selectedAU.addLayerAt(newLayer, 0);
                 selectedAU.draw(svg, mainVP, onSelectLayer);
                 //auRepo.draw(auRepoSvg, auRepoVP, onSelectAU);
                 redraw_aurepos();
             }
         }

         console.log(auRepo);
         //newLayer = new Layer(layerID.value, materialName.value, layerThickness.value, material);
         ////layers.push(newLayer);
         //var index = selectedAU.getLayerIndex(selectedLayer.id) + 1;
         //if (index == 0) index = selectedAU.getNumberOfLayers();
         //selectedAU.addLayerAt(newLayer, index);
         //selectedAU.draw(svg, mainVP, onSelectLayer);
         //auRepo.draw(auRepoSvg, auRepoVP, onSelectAU);
    })



    d3.select("#layerUpdate").on("click", function() {
        if (selectedAU != null && selectedLayer != null){
            var materialIndex  = materialRepo.getIndexByID(materialID.value);
            if (materialIndex == -1){
                alert("Cannot update the level: no material with such ID exists!");
                return;
            }
            if (layerID.value != selectedLayer.id){
                if (selectedAU.getLayerIndex(layerID.value) > -1) {
                    alert("Cannot update the layer: another layer with such ID exists!");
                    return;
                }
                selectedLayer.id = layerID.value;
            }
            selectedLayer.name = layerName.value;
            selectedLayer.thickness = layerThickness.value;
            if (materialIndex >= 0)
                selectedLayer.material = materialRepo.materials[materialIndex];
            selectedAU.draw(svg, mainVP, onSelectLayer);
            //auRepo.draw(auRepoSvg, auRepoVP, onSelectAU);
            redraw_aurepos();
        } else {
            alert("Cannot update a layer: " + (selectedAU == null )? " AU is not selected!" : " layer is not selected!");
        }
    })

    d3.select("#layerRestore").on("click", function() {
        if (selectedAU != null){
            updateLayerParameters(selectedLayer);
        }
    })

    d3.select("#layerDelete").on("click", function() {
        if (selectedAU != null){
            deleteLayer(selectedAU, selectedLayer);
        }
    })



    ////////////////////////////////////////////////////////////
    //Visual Parameters
    ////////////////////////////////////////////////////////////
    function updateVisualParameters(vp){
        d3.select("#vpLength-value").text(vp.lengthScale);
        d3.select("#vpLength").property("value", vp.lengthScale);
        d3.select("#vpThickness-value").text(vp.widthScale);
        d3.select("#vpThickness").property("value", vp.widthScale);
        if (vp.orientation == "vertical")
            d3.select("#vpOrientation_v").property("checked", true)
        else
            d3.select("#vpOrientation_h").property("checked", true);
    }

    d3.select("#vpLength").on("input", function () {
        d3.select("#vpLength-value").text(vpLength.value);
        mainVP.lengthScale = vpLength.value;
        selectedAU.draw(svg, mainVP, onSelectLayer);
    });

    d3.select("#vpThickness").on("input", function () {
        d3.select("#vpThickness-value").text(vpThickness.value);
        mainVP.widthScale = vpThickness.value;
        selectedAU.draw(svg, mainVP, onSelectLayer);
    });

    d3.select("#vpOrientation").on("change", function () {
        var value = "horizontal";
        if (this.vpOrientation[1].checked) value = "vertical";
        mainVP.orientation = value;
        selectedAU.draw(svg, mainVP, onSelectLayer);
    });






///////////////////////////////////
// Loading Lyph Data from Server
///////////////////////////////////

    var load_all_materials = function (){

        console.log("Loading existing lyphs/materials")
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
                if (debugging) console.log("Request URL:", this.url);
                var data = response;
               if (debugging) console.log("Response:", response);


                if ( data.hasOwnProperty( "Error" ) )
                {
                    if (debugging) console.log("Error: " + path.Error );
                    return;
                }

                //Todo: We should only make a single pass through the dataset.

                if (debugging) console.log("Loading all Basic Templates")
                for (var i = 0; i < data.length; i++) {
                    if (data[i].type === "basic"){
                        //TODO Replace type "simple" with basic for consistency
                        materialRepo.addAt(new Material(data[i].id, data[i].name, "#"+((1<<24)*Math.random()|0).toString(16), "simple", null, null),0);
                        materialRepo.draw(materialRepoSvg, materialRepoVP, onSelectMaterial);
                        onSelectMaterial(materialRepo.materials[0]);
                    }
                }


                //Todo - Load all Mix Types
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





                if (debugging) console.log("Loading all Shell Templates");
                for (var i = 0; i < data.length; i++) {
                    if (data[i].type === "shell"){

                        //if (i === 10) continue;
                        console.log(i);

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

                        //auRepo.draw(auRepoSvg, auRepoVP, onSelectAU);
                        //auRepo.draw(auMaterialRepoSvg, auRepoVP, onSelectMaterialAU);
                        redraw_aurepos();
                    }
                }



                if (auRepo != null ) {
                    //auRepo.draw(auRepoSvg, auRepoVP, onSelectAU);
                    redraw_aurepos();
                    selectedAU = auRepo.auSet[0];
                }

                //TODO add this back
                //materialRepo.draw(materialRepoSvg, materialRepoVP, onSelectMaterial);
                loadMaterialRepoToDatalist(materialRepo);


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




    //Create Basic Lyph
    d3.select("#createBasicLyph").on("click", function () {
        console.log("Creating Basic Template", fmaID.value);

        //send request to create basic template
        $.ajax
        ({
            url:
            "http://open-physiology.org:5055/template/"+
            encodeURIComponent(fmaID.value),
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
                if (materialRepo.getIndexByID(data.id)== -1 ) {
                    console.log("Creating new basic material and added to material repo");
                    materialRepo.addAt(new Material(data.id, data.name, "#"+((1<<24)*Math.random()|0).toString(16), "simple", null, null), 0);
                    console.log("Selecting the new material")
                    onSelectMaterial(materialRepo.materials[0]);
                } else{
                    console.log("Basic Material Already Exists");
                }
            }

        });

    });



    function redraw_aurepos(){
        auRepo.draw(auRepoSvg, auRepoVP, onSelectAU);
        auRepo.draw(auMaterialRepoSvg, auRepoVP, onSelectMaterialAU);
    }



    rehashaueditor = function rehasheverything(){
        console.log("callback test");
        //console.log(layerRepo);
        selectedAU.draw(svg, mainVP, onSelectLayer);
        //auRepo.draw(auRepoSvg, auRepoVP, onSelectAU);
        redraw_aurepos();
    }






    //Initialisation of the materials from the Database.
    load_all_materials();

}();
