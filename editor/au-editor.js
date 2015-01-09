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
        if (this != selectedLayerNode){
            d3.select(this).style("stroke", "red").style("stroke-width", 2);
            d3.select(selectedLayerNode).style("stroke", "black").style("stroke-width", 0);
            selectedLayerNode = this;
            selectedLayer = d;
            updateLayerParameters(selectedLayer);
        }
    }

    var onSelectAU = function(d){
        if (this != selectedAUNode){
            d3.select(this).style("stroke", "red");
            d3.select(selectedAUNode).style("stroke", "black");
            selectedAUNode = this;
            selectedAU = d;
            if (selectedAU.layers != null && selectedAU.layers.length > 0)
                selectedLayer = selectedAU.layers[0];
            syncSelectedAU();
            updateLayerParameters(selectedLayer);
        }
    }

    var onSelectMaterial = function(d){
        if (this != selectedMaterial){
            d3.select(this).style("stroke", "red");
            d3.select(selectedMaterialNode).style("stroke", "black");
            selectedMaterialNode = this;
            selectedMaterial = d;
            updateMaterialParameters(selectedMaterial);
        }
    }

    ///////////////////////////////////////////////////////
    //Demo
    ///////////////////////////////////////////////////////
    //Init visual parameters
    var mainVP = new VisualParameters("horizontal", 250, 50, width, height, 10);
    var auRepoVP = new VisualParameters("horizontal", 30, 5, panelWidth, panelHeight, 0);
    var materialRepoVP = new VisualParameters("horizontal", 20, 20, panelWidth, panelHeight, 0);

    auRepo.draw(auRepoSvg, auRepoVP, onSelectAU);
    materialRepo.draw(materialRepoSvg, materialRepoVP, onSelectMaterial);
    loadMaterialRepoToDatalist(materialRepo);

    selectedAU = auRepo.auSet[0];
    if (selectedAU.layers != null && selectedAU.layers.length > 0)
        selectedLayer = selectedAU.layers[0];
    if (materialRepo.materials != null && materialRepo.materials.length > 0)
        selectedMaterial = materialRepo.materials[0];
    syncSelectedAU();
    updateLayerParameters(selectedLayer);
    window.addEventListener("keydown", function (e) {onDocumentKeyDown(e);}, false);

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
        auRepo.draw(auRepoSvg, auRepoVP, onSelectAU);
    }

    function cloneAU(au){
        if (auRepo.getIndexByID(auID.value) > -1){
            alert("Cannot create a new AU: another AU with such ID exists!");
            return;
        }
        var newAU = null;
        if (au != null){
            newAU = au.clone();
            newAU.id = auID.value;
            newAU.name = auName.value;
            newAU.length = auLength.value;
        }
        else newAU = new AsymmetricUnit(auID.value, auName.value, [], auLength.value);
        auRepo.addAt(newAU, auRepo.auSet.length - 1);
        auRepo.draw(auRepoSvg, auRepoVP, onSelectAU);
    }

    d3.select("#auClone").on("click", function() {
        cloneAU(selectedAU);
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
                    auRepo.draw(auRepoSvg, auRepoVP, onSelectAU);
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
            d3.select("#materialID").property("value", layer.material.id);
            d3.select("#materialName").property("value", layer.material.name);
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

     d3.select("#layerClone").on("click", function() {
         if (selectedAU.getLayerIndex(layerID.value) > -1){
             alert("Cannot create a new layer: another layer with such ID exists!");
             return;
         }
         var materialIndex  = materialRepo.getIndexByID(materialID.value);
         if (materialIndex == -1){
             alert("Cannot update the level: no material with such ID exists!");
             return;
         }
         var material = materialRepo.materials[materialIndex];
         var newLayer = null;
         if (selectedLayer != null){
             newLayer = selectedLayer.clone();
             newLayer.id = layerID.value;
             newLayer.name = layerName.value;
             newLayer.thickness = layerThickness.value;
             newLayer.material = material;
         }
         else
             newLayer = new Layer(layerID.value, layerName.value, layerThickness.value, material);
         var index = selectedAU.getLayerIndex(selectedLayer.id) + 1;
         if (index == 0) index = selectedAU.getNumberOfLayers();
         selectedAU.addLayerAt(newLayer, index);
         selectedAU.draw(svg, mainVP, onSelectLayer);
         auRepo.draw(auRepoSvg, auRepoVP, onSelectAU);
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
            auRepo.draw(auRepoSvg, auRepoVP, onSelectAU);
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
}();
