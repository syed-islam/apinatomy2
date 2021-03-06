

var rehashaueditor; // TODO BAD DESIGN
var rehashaueditor_onCurrentLayer; // TODO BAD DESIGN

var auEditor = function () {







    var config = {
        content: [{
            type: 'row',
            content: [
                {
                    type:'component',
                    componentName: 'left',
                    componentState: {  },
                    width: 25,
                    isClosable: false
                },
                {
                    type:'component',
                    componentName: 'center',
                    componentState: {  },
                    width: 50,
                    isClosable: false
                },
                {
                    type:'column',
                    componentState: {  },
                    width: 25,
                    content: [
                        {
                            type:'component',
                            componentName: 'Lyph Templates',
                            componentState: {  },
                            width: 25,
                            isClosable: false
                        },
                        {
                            type:'component',
                            componentName: 'Material Pallet',
                            componentState: {  },
                            width: 25,
                            isClosable: false
                        },
                        {
                            type:'component',
                            componentName: 'Lyph Pallet',
                            componentState: {  },
                            width: 25,
                            isClosable: false
                        },
                        {
                            type:'component',
                            componentName: 'Bunch of other stuff',
                            componentState: {  },
                            width: 25,
                            isClosable: false
                        },
                        {
                            type:'component',
                            componentName: 'Whatever',
                            componentState: {  },
                            width: 25,
                            isClosable: false
                        }
                    ]
                }
            ]
        }]
    };

    var myLayout = new GoldenLayout( config, $('#app-body') );

    myLayout.registerComponent( 'left', function( container, state ){
        container.getElement().css('position', 'relative').append($('#left-panel').detach());
    });
    myLayout.registerComponent( 'center', function( container, state ){
        container.getElement().css('position', 'relative').append($('#chart').detach());
    });
    myLayout.registerComponent( 'Lyph Templates', function( container, state ){
        container.getElement().css({
            overflowY: 'scroll'
        }).append($('#lyph-templates').detach());
    });
    myLayout.registerComponent( 'Material Pallet', function( container, state ){
        container.getElement().css({
            overflowY: 'scroll'
        }).append($('#material-pane').detach());
    });
    myLayout.registerComponent( 'Lyph Pallet', function( container, state ){
        container.getElement().css({
            overflowY: 'scroll'
        }).append($('#au-pane2').detach());
    });
    myLayout.registerComponent( 'Bunch of other stuff', function( container, state ){
        container.getElement().css({
            overflowY: 'scroll'
        }).append($('#filter-thing').detach());
    });
    myLayout.registerComponent( 'Whatever', function( container, state ){
        container.getElement().css({
            overflowY: 'scroll'
        }).append($('#repos').detach());
    });

    myLayout.init();








    var auRepo =  new AsymmetricUnitRepo([]);
    var layerRepo = new LayerRepo([]);
    var materialRepo = new MaterialRepo([]);




    var width = 960, height = 500;
    var panelWidth = 300, panelHeight = 50;

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


    var onTabSelect = function (d){
        console.log("Tab clicked")
        selectedLayer = d;
        console.log(d);


        d3.select("#layerID").property("value", "Common");
        d3.select("#layerName").property("value", "Common");
        d3.select("#layerThickness").property("value", "-");

        //$("#thelist").empty()

        //d3.select("#layerID").property("value", layer.id);
        ////d3.select("#layerName").property("value", layer.name);
        //d3.select("#layerThickness").property("value", layer.thickness);


        //TODO For now we are using the ajax call below. But its better to cache this information at every change of the Lyph.
        requestcommonmaterials(d);

        //disable the add and remove buttons
        $('#addMaterial').attr('disabled','disabled');
        $('#removeMaterial').attr('disabled','disabled');
        $('#layerDelete').attr('disabled','disabled');;
        $('#layerUpdate').attr('disabled','disabled');;

        selectedAU.draw(svg, mainVP, onSelectLayer, selectedLayer, onTabSelect);

    }


    var requestcommonmaterials = function requestcommonmaterials (au){
        //au.update_common_materials();
        onSelectLayer(selectedLayer);
         $("#thelist").empty()
         if (au.common_materials && au.common_materials.length > 0){
             for (var i =0; i < au.common_materials.length; i++){
                 $('#thelist').append('<option value=' + au.common_materials[i].id + '> ' + (au.common_materials[i].id).replace("TEMPLATE_", "T_") + " " + au.common_materials[i].name  + "</option")
             }
         } else {
             $('#thelist').append('<option value=fake> ' + "No items common in all Layers" +   "</option")
         }
    }



    d3.select('#showMaterialDetails').on("click", function(){
        //console.log("Show Materials Details");
        var localselection = thelist.value;
        //console.log(localsection);

        if (auRepo.getIndexByID(localselection) > -1){
            console.log("Found AU");
            window.open("asymmetric-unit.html?template=" + localselection, '_blank');
        } else {
            alert("Material is not a 'shell' structure");
        }
    });


    d3.select('#layerUp').on("click", function(){
        console.log("Layer Move Up");
        if (selectedLayer && selectedAU.getLayerIndex(selectedLayer.id) > 0){
            console.log("Moving up");
            swap_layers(selectedAU.getLayerIndex(selectedLayer.id), selectedAU.getLayerIndex(selectedLayer.id) - 1);
            onSelectLayer(selectedLayer);
        } else {
            console.log("Already at top");
        }
    })


    d3.select('#layerDown').on("click", function(){
        console.log("Layer Move Down");
        if (selectedLayer && selectedAU.getLayerIndex(selectedLayer.id) < selectedAU.layers.length -1 ){
            console.log("Moving Down");
            swap_layers(selectedAU.getLayerIndex(selectedLayer.id), selectedAU.getLayerIndex(selectedLayer.id) + 1);
            onSelectLayer(selectedLayer);

        } else {
            console.log("Already at bottom");
        }
    })


    function swap_layers(layer1Index, layer2Index) {
        //send server request to perform swap on the server.
        selectedAU.move_layer(selectedAU.layers[layer1Index], layer1Index + 1 + (layer2Index - layer1Index));

        tmp = selectedAU.layers[layer1Index];
        selectedAU.layers[layer1Index] = selectedAU.layers[layer2Index];
        selectedAU.layers[layer2Index]=  tmp ;


    }


    d3.select('#applymaterialfilter').on("click", function () {
        applyFilter();

    })


    d3.select("#materialFilter").on("input", function() {
        if (materialFilter.value.trim().length > 0 && materialFilter.value.trim().length < 3){
            return;
        }
        applyFilter();
    })



    //function applyNegativeFilter()




    function applyFilter () {

        d3.select("#materialFilter").property("value", (materialFilter.value).replace("T_", "TEMPLATE_"));
        console.log("Applying Filtering", materialFilter.value.trim());

        //If the filter is empty
        if (materialFilter.value.trim() === "") {
            console.log(worklist.value);

            //Show all materials
            for (var i =0; i < materialRepo.materials.length ; i++){
                materialRepo.materials[i].hide = false;
                selectedMaterial = materialRepo.materials[0];
            }
            materialRepo.draw(materialRepoSvg, materialRepoVP, onSelectMaterial, selectedMaterial);


            //Show all AU's except the currently selected AU
            for (var i = 0; i < auRepo.auSet.length ; i++){
                if (auRepo.auSet[i].id === worklist.value){
                    auRepo.auSet[i].hide = true;
                } else {
                    auRepo.auSet[i].hide = false;
                }
            }

            redraw_aurepos();
            return;
        }


        $.ajax
        ({
            url:
            "http://open-physiology.org:"+ serverPort + "/templates_involving/?ont=" + encodeURIComponent(materialFilter.value)  ,

            jsonp: "callback",

            dataType: "jsonp",
            success: function (response) {
                var data = response;

                for (var i =0; i < materialRepo.materials.length ; i++){
                    materialRepo.materials[i].hide = true;
                }

                for (i =0; i < auRepo.auSet.length; i ++){
                    auRepo.auSet[i].hide = true;
                }



                if (data.hasOwnProperty("Error")) {
                    console.log("Nothing matching" , response);
                    materialRepo.draw(materialRepoSvg, materialRepoVP, onSelectMaterial, selectedMaterial);
                    redraw_aurepos();
                    return;
                }
                console.log(data)


                for (var i =0; i < materialRepo.materials.length ; i++){
                    materialRepo.materials[i].hide = true;
                }

                for (i =0; i < auRepo.auSet.length; i ++){
                    auRepo.auSet[i].hide = true;
                }


                materialRepo.draw(materialRepoSvg, materialRepoVP, onSelectMaterial, null);
                auRepo.draw(auMaterialRepoSvg,auRepoVP,onSelectMaterialAU, null ,true);

                for (var j = 0; j < data.length; j++){
                    console.log(data[j].id);
                    console.log(materialRepo.getIndexByID(data[j].id));
                    console.log(auRepo.getIndexByID(data[j].id));
                    if (materialRepo.getIndexByID(data[j].id) > -1){
                        materialRepo.materials[materialRepo.getIndexByID(data[j].id)].hide = false;
                        selectedMaterial = materialRepo.materials[materialRepo.getIndexByID(data[j].id)];
                        console.log("calling material repo.draw");
                        materialRepo.draw(materialRepoSvg, materialRepoVP, onSelectMaterial, selectedMaterial);
                        console.log(materialRepo);
                    } else if (auRepo.getIndexByID(data[j].id) > -1){
                        console.log(data[j].id);
                        auRepo.auSet[auRepo.getIndexByID(data[j].id)].hide = false;
                        auRepo.auSet[auRepo.getIndexByID(worklist.value)].hide = true;
                        console.log(worklist.value);
                        auRepo.draw(auMaterialRepoSvg,auRepoVP,onSelectMaterialAU, null ,true);
                    }

                }

                //select the first material showing after filtering finishes

                for (var k = 0; k < materialRepo.materials.length; k++ ){
                    if (materialRepo.materials[k].hide === false){
                        onSelectMaterial(materialRepo.materials[k]);
                        return;
                    }
                }

                for (k = 0; k < auRepo.auSet.length; k++ ){
                    if (auRepo.auSet[k].hide === false){
                        onSelectMaterial(auRepo.auSet[k]);
                        return;
                    }
                }


            }
        });
    }



    d3.select('#clearfilter').on("click", function () {
        console.log("Removing filter");
        d3.select("#materialFilter").property("value", "");
        applyFilter();
        //for (var i =0; i < materialRepo.materials.length ; i++){
        //    materialRepo.materials[i].hide = false;
        //    selectedMaterial = materialRepo.materials[0];
        //    materialRepo.draw(materialRepoSvg, materialRepoVP, onSelectMaterial, selectedMaterial);
        //}
        //
        //for (var i =0; i < auRepo.auSet.length ; i++){
        //    auRepo.auSet[i].hide = false;
        //    redraw_aurepos();
        //}


    })







    var onSelectLayer = function (d){



        if (d === null ){
            $('#addMaterial').attr('disabled','disabled');
            $('#removeMaterial').attr('disabled','disabled');
            $('#layerDelete').attr('disabled','disabled');
            $('#layerUpdate').attr('disabled','disabled');
            d3.select("#layerID").property("value", "");
            d3.select("#layerName").property("value", "");
            d3.select("#layerThickness").property("value","");
            $("#thelist").empty()
            $('#thelist').append('<option value=fake> ' + "" +   "</option")
            return;
        }


        $('#addMaterial').removeAttr('disabled');
        $('#removeMaterial').removeAttr('disabled');
        $('#layerDelete').removeAttr('disabled');
        $('#layerUpdate').removeAttr('disabled');




        selectedLayer = d;
        console.log(d);
        updateLayerParameters(selectedLayer);
        selectedAU.draw(svg, mainVP, onSelectLayer, selectedLayer, onTabSelect);



        ////if (this != selectedLayerNode){
        //    d3.select(this).style("stroke", "red").style("stroke-width", 2);
        //    d3.select(selectedLayerNode).style("stroke", "black").style("stroke-width", 0);
        //    selectedLayerNode = this;
        //    selectedLayer = d;
        //    console.log("Layer Selected")
        //    console.log("Layer Selected")
        //    updateLayerParameters(selectedLayer);
        //
        ////}
    }

    var onSelectAU = function(d){

        if ($('#worklist').value != d.id)
            $('#worklist').val(d.id);

        selectedAU = d;
        syncSelectedAU();
    }




    var onSelectMaterialAU = function(d){
        selectedMaterial = d;
        materialRepo.draw(materialRepoSvg, materialRepoVP, onSelectMaterial, selectedMaterial, true);
        auRepo.draw(auMaterialRepoSvg,auRepoVP,onSelectMaterialAU, selectedMaterial,true);
    }



    //Function used directly and as callback function to handle new material selection.
    //@param {material} d material to be selected.
    var onSelectMaterial = function(d){
            selectedMaterial = d;
            materialRepo.draw(materialRepoSvg, materialRepoVP, onSelectMaterial, selectedMaterial, true);
            auRepo.draw(auMaterialRepoSvg,auRepoVP,onSelectMaterialAU, selectedMaterial,true);

    }



    ///////////////////////////////////////////////////////
    //Demo
    ///////////////////////////////////////////////////////
    ////Init visual parameters
    var mainVP = new VisualParameters("horizontal", 500, 30, width, height, 10);
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
        selectedAU.draw(svg, mainVP, onSelectLayer, selectedLayer, onTabSelect);
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

    //function updateMaterialParameters(material){
    //    console.log(material);
    //    d3.select("#materialID").property("value", material.id);
    //    d3.select("#materialName").property("value", material.name);
    //}

    d3.select("#materialID").on("input", function () {
        var materialIndex  = materialRepo.getIndexByID(materialID.value);
        if (materialIndex > -1)
            d3.select("#materialName").property("value", materialRepo[materialIndex].name);
    });


    d3.select("#thelist").on("change", function(){
        console.log(thelist.value);
    })


    d3.select("#auPopulate").on("click", function (){
        console.log("click", this);
        populateName(d3.select("#auName"))
    })


    d3.select("#layerPopulate").on("click", function (){
        //console.log("click", this);
        populateName(d3.select("#layerName"))
    })

    function populateName (component){
        var name = "";
        if (selectedMaterial) {
            console.log(component, selectedMaterial);

            //Create Name from selected Materail
            name += selectedMaterial.name;
            if (selectedMaterial.ont_term){
                name += " - " + selectedMaterial.ont_term;
            }


            component.property("value", name);

            //Update appropriate textbox



            console.log(name);


        } else {
            alert("Material not selected");
        }
    }



    ////////////////////////////////////////////////////////////
    //AU Parameters
    ////////////////////////////////////////////////////////////
    function updateAUParameters(au){
        d3.select("#auID").property("value", au.id);
        d3.select("#auName").property("value", au.name);
        d3.select("#auLength").property("value", au.length);
    }

    function updateAU(au){
        //au.id = auID.value;
        au.name = auName.value;
        au.length = auLength.value;
        au.sync_au_to_server();

        au.draw(svg, mainVP, onSelectLayer, selectedLayer);
        //auRepo.draw(auRepoSvg, auRepoVP, onSelectAU);
        //redraw_aurepos();
        rehashaueditor();
    }


    function cloneAU(au){
        //
        //var newAU = null;
        //if (au != null){
        //    newAU = au.clone();
        //    newAU.id = auID.value+"_clone";
        //    newAU.name = auName.value+"_clone";
        //    newAU.length = auLength.value;
        //}
        //else {
        //    //newAU = new AsymmetricUnit("newAU", "newAu", [], auLength.value);
        //    //console.log(newAU);
        //    alert("No AU Selected");
        //    return;
        //}
        //
        //if (auRepo == null) auRepo  = new AsymmetricUnitRepo([newAU]);
        //else auRepo.addAt(newAU, 0);
        //
        ////auRepo.draw(auRepoSvg, auRepoVP, onSelectAU);
        ////newau.draw()
        //newAU.draw(svg, mainVP, onSelectLayer);
        //redraw_aurepos();

        if (au != null){
            console.log("Cloing selected Lyph Template")
            au.clone(onSelectAU, onSelectLayer,auRepo, layerRepo, materialRepo);

        } else {
            alert("No  Lyph Template Selected for Cloning.")
        }

    }



    function reSyncEverythingWithAUSetUpdate(){
        redraw_aurepos();
        sync_lyphTemplate_list();
        applyFilter();
        handle_Lyph_Selection(auRepo.auSet[0].id)
    }


    function newAU(){
        var newAU = null;
        newAU = new AsymmetricUnit("", "", [], 1, [], []);
        newAU.create_on_server();
        console.log("New Template Created:", newAU);
        if (auRepo == null)
            auRepo  = new AsymmetricUnitRepo([newAU]);
        else
            auRepo.addAt(newAU, 0);
        //newAU.draw(svg, mainVP, onSelectLayer);
        redraw_aurepos();
        //onSelectAU(newAU); //Selecting the AU

        sync_lyphTemplate_list();
        applyFilter();
        handle_Lyph_Selection(auRepo.auSet[0].id);


    }


    function saveAUtoServer(au){
        console.log(au);
        var query = "http://open-physiology.org:"+ serverPort + "/maketemplate/" +
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



    d3.select("#removeMaterial").on("click", function(){
        console.log("Remove material button clicked");




        if (thelist.value && thelist.value != "fake" ){




            if (selectedLayer instanceof Layer) {
                console.log($("#thelist").val());
                selectedLayer.materials.splice(selectedLayer.getIndexOfMaterialByID($("#thelist").val()), 1);
                $("#thelist").find("option[value='" + $("#thelist").val() + "']").remove();

                selectedLayer.sync_materials_to_server();
                selectedAU.update_common_materials();

                if (selectedLayer.materials.length == 0){
                    $('#thelist').append('<option value=fake> ' + "No Material in Layer" +   "</option")
                }
            } else if (selectedLayer instanceof AsymmetricUnit){
                selectedLayer.misc_materials.splice(selectedLayer.getIndexByIDMiscMaterials($("#thelist").val()), 1)
                $("#thelist").find("option[value='" + $("#thelist").val() + "']").remove();

                selectedLayer.sync_au_to_server();


                if (selectedLayer.misc_materials.length == 0){
                    $('#thelist').append('<option value=fake> ' + "No Material outside defined layers" +   "</option")
                }

            }







        } else {
            console.log("No material selected for removal")
        }




    })



    //Add Material to Layer
    d3.select("#addMaterial").on("click", function(){
        //Validation to check that we are not adding material to self.
        //Using filtering to perform validation
        selectedAU.is_built_from_template(selectedMaterial, selectedAU, addMaterialToLayer);
    });

    function addMaterialToLayer (){
        console.log("call back test f");
        //Validation passed

        if (selectedLayer instanceof Layer) {

            console.log("Add Material ", selectedMaterial, " to layer:", selectedLayer);

            //Do not allow for duplicate materials in the same layer
            if (selectedLayer.materials && selectedLayer.materials.length > 0 && selectedLayer.getIndexOfMaterialByID(selectedMaterial.id) > -1) {
                console.log("Material already exists in layer.")
                return;
            }

            var existingMaterials = selectedLayer.materials;

            //if layer already has materials
            if (existingMaterials) {
                existingMaterials.splice(0, 0, selectedMaterial);
            } else { // if layer is previously empty
                selectedLayer.materials = [selectedMaterial];
            }

            $('#thelist').append('<option value=' + selectedMaterial.id + '> ' + (selectedMaterial.id).replace("TEMPLATE_", "T_") + "</option")

            selectedLayer.sync_materials_to_server();
            selectedAU.update_common_materials();


            console.log(selectedLayer.materials);
            onSelectLayer(selectedLayer);

        } else if (selectedLayer instanceof AsymmetricUnit){
            console.log("Dealing with Tabs")
            console.log("Add Material ", selectedMaterial, " to outside layer of AU:", selectedLayer);

            //Todo: Do not allow the same material to be added twice.
            $("#thelist").find("option[value='fake']").remove();

            selectedLayer.misc_materials.push(selectedMaterial);
            selectedLayer.sync_au_to_server();

            $('#thelist').append('<option value=' + selectedMaterial.id + '> ' + (selectedMaterial.id).replace("TEMPLATE_", "T_") + " " + selectedMaterial.name + "</option")

        }
    }




    //New AU Button Click
    d3.select("#auNew").on("click", function() {
        newAU();
    })

    d3.select("#auClone").on("click", function() {
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
                if (confirm("Delete Lyph Template" + selectedAU.id + "?")) {

                    selectedAU.delete(auRepo, index, reSyncEverythingWithAUSetUpdate );


                    //auRepo.removeAt(index);
                    //if (auRepo.auSet.length > 0) selectedAU = auRepo.auSet[0];
                    //selectedAU.draw(svg, mainVP, onSelectLayer, selectedLayer, onTabSelect);
                    ////auRepo.draw(auRepoSvg, auRepoVP, onSelectAU);
                    //redraw_aurepos();
                    //updateAUParameters(selectedAU);

                }
            }
        } else {
            alert("No Lyph Template Selected");
        }
    })

    ////////////////////////////////////////////////////////////
    //Layer parameters
    ////////////////////////////////////////////////////////////
    function updateLayerParameters(layer){
        console.log("Updating parameter", layer);
        if (layer instanceof Layer){
            d3.select("#layerID").property("value", layer.id);
            d3.select("#layerName").property("value", (layer.name) ? layer.name : "" );
            d3.select("#layerThickness").property("value", layer.thickness);
            //d3.select("#materialID").property("value", layer.materials[0].id);
            //d3.select("#materialID").property("value", layer.materials[0].id);
            //d3.select("#materialName").property("value", layer.materials[0].name);

            //Update the materials list
            $("#thelist").empty()
            if (layer.materials && layer.materials.length > 0 ) {
                for (var i = 0; i < layer.materials.length; i++) {
                    $('#thelist').append('<option value=' + layer.materials[i].id + '> ' + (layer.materials[i].id).replace("TEMPLATE_", "T_") + "  " +  layer.materials[i].name +   "</option")
                }
            } else {
                $('#thelist').append('<option value=fake> ' + "No Material in Layer" +   "</option")
            }
        } else if (layer instanceof AsymmetricUnit){
            //console.log("Tab selected", selectedAU.selectedtab);
            d3.select("#layerID").property("value", "Location Unknown");
            d3.select("#layerName").property("value", "Location Unknown");
            d3.select("#layerThickness").property("value", "-");

            $('#layerDelete').attr('disabled','disabled');;
            $('#layerUpdate').attr('disabled','disabled');;

            $("#thelist").empty()
            if (layer.misc_materials && layer.misc_materials.length > 0 ) {
                for (var i = 0; i < layer.misc_materials.length; i++) {
                    $('#thelist').append('<option value=' + layer.misc_materials[i].id + '> ' + (layer.misc_materials[i].id).replace("TEMPLATE_", "T_") + "  " +  layer.misc_materials[i].name +   "</option")
                }
            } else {
                $('#thelist').append('<option value=fake> ' + "No Material outside defined layers" +   "</option")
            }
        }
    }



    function deleteLayer(au, layer){
        if (au != null && layer != null && layer instanceof Layer){
            if (confirm("Delete layer " + layer.id + " from AU " + au.id + "?")){
                var index = au.getLayerIndex(selectedLayer.id);
                if (index > -1){
                    au.removeLayerAt(index);
                    if (au.layers.length > 0){
                        selectedLayer = selectedAU.layers[0];
                        onSelectLayer(selectedLayer);
                    } else {
                        onSelectLayer(null);

                    }
                    au.draw(svg, mainVP, onSelectLayer,selectedLayer);
                }
            }
        } else {
            alert("Cannot delete a layer: " + (au == null )? " AU is not selected!" : " layer is not selected!");
        }
    }



    //Handle Add Layer
    d3.select("#layerClone").on("click", function() {

        //Ensure that an AU is selected where the layer can be added.
        if (!selectedAU){
            alert("No AU Selected. Please create/select AU first");
            return;
        }


        if (debugging) console.log("Adding new layer");

        //Create new blank layer
        var newLayer = new Layer("LAYER_" +  (layerRepo ? layerRepo.getNumberOfLayers() + 1 : "1") , "", layerThickness.value ? layerThickness.value : 1)


        //TODO very bad way of chaining on Ajax return calls.
        newLayer.create_on_server().then(function (/*response*/) {
            return selectedAU.addLayerAt(newLayer, layerInsertLocation());
        }).then(function (/*response*/) {
            rehashaueditor(newLayer);
        }).catch(function (err) {
            console.error("Error:", err);
        });







        // Add blank layer to layer repo
        if (layerRepo){
            if (debugging) console.log("Layer Repo Exists");
            layerRepo.addAt(newLayer, 0);
        } else {
            console.log("Layer Repo Uninitialised");
            layerRepo = new LayerRepo([newLayer]);
        }
        //if (debugging) console.log(layerRepo);
        //onSelectLayer(newLayer)
    })


    function layerInsertLocation(){
        if (selectedAU.getNumberOfLayers() === 0 )
            return 0;

        if (selectedAU.getLayerIndex(selectedLayer.id) < 0){
            return selectedAU.getNumberOfLayers();
        }
        return selectedAU.getLayerIndex(selectedLayer.id);

    }



    //Todo incorporate the code as handle material and remove the following function.
    //Previous Handle Add Layer
    // d3.select("#DefunctlayerClone").on("click", function() {
    //     //if (selectedAU.getLayerIndex(layerID.value) > -1){
    //     //    alert("Cannot create a new layer: another layer with such ID exists!");
    //     //    return;
    //     //}
    //
    //     //console.log(layers);
    //
    //     var material  = (materialRepo.getIndexByID(materialID.value) > auRepo.getIndexByID(materialID.value)) ? materialRepo.materials[materialRepo.getIndexByID(materialID.value)] : auRepo.auSet[auRepo.getIndexByID(materialID.value)];
    //     if (!material) {
    //         alert("Cannot update the level: no material with such ID exists!");
    //         return;
    //     }
    //
    //
    //    var materials = [material];
    //
    //
    //     //var  = materialRepo.materials[materialIndex];
    //
    //     console.log("LayerRepo:" ,(layerRepo == null));
    //
    //     //If this is the first AU we are creating and the layerRepo is null
    //     if (layerRepo == null){
    //         var newLayer = new Layer("Layer_1", materialName.value, 1, materials);
    //         layerRepo = new LayerRepo([newLayer]);
    //
    //         var pos = 0;
    //
    //         if (selectedLayer instanceof AsymmetricUnit)
    //            pos = selectedAU.layers.length;
    //
    //
    //
    //
    //        console.log(pos);
    //
    //
    //         selectedAU.addLayerAt(newLayer, pos);
    //         selectedAU.draw(svg, mainVP, onSelectLayer, selectedLayer, onTabSelect);
    //         //auRepo.draw(auRepoSvg, auRepoVP, onSelectAU);
    //         redraw_aurepos();
    //         console.log(layerRepo);
    //     } else { // If AUs already exist
    //         var layerindex = layerRepo.containsLayer(layerThickness.value, materials);
    //         if (layerindex > -1) {  // Layer exists so simply add
    //             //var index = selectedAU.getLayerIndex(selectedLayer.id) + 1;
    //             //if (index == 0) index = selectedAU.getNumberOfLayers();
    //             selectedAU.addLayerAt(layerRepo.layers[layerindex], 0);
    //             selectedAU.draw(svg, mainVP, onSelectLayer, selectedLayer, onTabSelect);
    //             //auRepo.draw(auRepoSvg, auRepoVP, onSelectAU);
    //             redraw_aurepos();
    //         } else { // Layer does not exist, create a new layer
    //             newLayer = new Layer(layerID.value, materialName.value, layerThickness.value, material);
    //             //var index = selectedAU.getLayerIndex(selectedLayer.id) + 1;
    //             //if (index == 0) index = selectedAU.getNumberOfLayers();
    //             layerRepo.addAt(newLayer, 0);
    //             selectedAU.addLayerAt(newLayer, 0);
    //             selectedAU.draw(svg, mainVP, onSelectLayer, selectedLayer, onTabSelect);
    //             //auRepo.draw(auRepoSvg, auRepoVP, onSelectAU);
    //             redraw_aurepos();
    //         }
    //     }
    //
    //     console.log(auRepo);
    //     //newLayer = new Layer(layerID.value, materialName.value, layerThickness.value, material);
    //     ////layers.push(newLayer);
    //     //var index = selectedAU.getLayerIndex(selectedLayer.id) + 1;
    //     //if (index == 0) index = selectedAU.getNumberOfLayers();
    //     //selectedAU.addLayerAt(newLayer, index);
    //     //selectedAU.draw(svg, mainVP, onSelectLayer);
    //     //auRepo.draw(auRepoSvg, auRepoVP, onSelectAU);
    //})



    d3.select("#layerUpdate").on("click", function() {
        if (selectedAU != null && selectedLayer != null){
            //var materialIndex  = materialRepo.getIndexByID(materialID.value);
            //if (materialIndex == -1){
            //    alert("Cannot update the level: no material with such ID exists!");
            //    return;
            //}
            //if (layerID.value != selectedLayer.id){
            //    if (selectedAU.getLayerIndex(layerID.value) > -1) {
            //        alert("Cannot update the layer: another layer with such ID exists!");
            //        return;
            //    }
            //    selectedLayer.id = layerID.value;
            //}
            //selectedLayer.name = layerName.value;
            //selectedLayer.thickness = layerThickness.value;
            //if (materialIndex >= 0)
            //    selectedLayer.material = materialRepo.materials[materialIndex];
            //selectedAU.draw(svg, mainVP, onSelectLayer, selectedLayer, onTabSelect);
            ////auRepo.draw(auRepoSvg, auRepoVP, onSelectAU);
            //redraw_aurepos();

            console.log("Updating layer");
            selectedLayer.thickness = (layerThickness.value) ? layerThickness.value : 1;
            selectedLayer.name = layerName.value.trim();
            selectedAU.draw(svg, mainVP, onSelectLayer, selectedLayer, onTabSelect);
            selectedLayer.update_name_thickness_to_server();


        } else {
            alert("Layer not selected");
        }
    })




    d3.select("#layerRestore").on("click", function() {
        if (selectedAU != null){
            updateLayerParameters(selectedLayer);
        }
    })

    d3.select("#layerDelete").on("click", function() {
        if (selectedAU != null && selectedLayer){
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
        selectedAU.draw(svg, mainVP, onSelectLayer, selectedLayer, onTabSelect);
    });

    d3.select("#vpThickness").on("input", function () {
        d3.select("#vpThickness-value").text(vpThickness.value);
        mainVP.widthScale = vpThickness.value;
        selectedAU.draw(svg, mainVP, onSelectLayer, selectedLayer, onTabSelect);
    });

    d3.select("#vpOrientation").on("change", function () {
        var value = "horizontal";
        if (this.vpOrientation[1].checked) value = "vertical";
        mainVP.orientation = value;
        selectedAU.draw(svg, mainVP, onSelectLayer, selectedLayer, onTabSelect);
    });






///////////////////////////////////
// Loading Lyph Data from Server
///////////////////////////////////

    var load_all_materials = function (){

        console.log("Loading existing lyphs/materials")
        $.ajax
        ({
            url:
                "http://open-physiology.org:"+ serverPort + "/all_templates/?commons=yes",
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
                    console.log(response);
                    return;
                }

                //Todo: We should only make a single pass through the dataset.

                if (debugging) console.log("Loading all Basic Templates")
                for (var i = 0; i < data.length; i++) {
                    if (data[i].type === "basic"){
                        //TODO Replace type "simple" with basic for consistency
                        materialRepo.addAt(new Material(data[i].id, data[i].name, "#"+((1<<24)*Math.random()|0).toString(16), "simple", null, null, data[i].ont_term),0);
                        //materialRepo.draw(materialRepoSvg, materialRepoVP, onSelectMaterial);
                        onSelectMaterial(materialRepo.materials[0]);
                    }
                }
                console.log(materialRepo);


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
                        console.log(i, data[i]);

                        //console.log(data[i]);
                        // Create appropriate layers for the lyph

                        var layers_content= [];
                        for (var j = 0; j < data[i].layers.length;j++){

                            var materials = [];

                            for (var k =0; k < data[i].layers[j].materials.length; k++){
                                if (materialRepo && materialRepo.getIndexByID(data[i].layers[j].materials[k].id) > -1)
                                    materials.push(materialRepo.materials[materialRepo.getIndexByID(data[i].layers[j].materials[k].id)]);
                                else{
                                    materials.push(auRepo.auSet[auRepo.getIndexByID(data[i].layers[j].materials[k].id)]);
                                }
                            }

                            var newLayer  = null;
                            if (auRepo)
                                newLayer = new Layer(data[i].layers[j].id, data[i].layers[j].name, ((data[i].layers[j].thickness == "unspecified")? 1: data[i].layers[j].thickness), materials);
                            else
                                newLayer = new Layer(data[i].layers[j].id, data[i].layers[j].name, ((data[i].layers[j].thickness == "unspecified")? 1: data[i].layers[j].thickness), materials);
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
                        var toto = new AsymmetricUnit(data[i].id, data[i].name, layers_content, (data[i].length && data[i].length != "unspecified") ? data[i].length : 1 , data[i].misc_materials, data[i].common_materials);


                        //console.log(toto);
                        if (auRepo == null) auRepo  = new AsymmetricUnitRepo([toto]);
                        else auRepo.addAt(toto,0);
                        //console.log(auRepo.auSet[0]);

                        //auRepo.draw(auRepoSvg, auRepoVP, onSelectAU);
                        //auRepo.draw(auMaterialRepoSvg, auRepoVP, onSelectMaterialAU);

                        //redraw_aurepos();
                        sync_lyphTemplate_list();

                    }
                    applyFilter();
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
                make_appropriate_selection();

            }
        });
    };




    //Create Basic Lyph
    d3.select("#createBasicLyph").on("click", function () {
        console.log("Creating Basic Template", autocomplete.value);

        //send request to create basic template
        $.ajax
        ({
            url:
            "http://open-physiology.org:"+ serverPort + "/template/"+
            encodeURIComponent(autocomplete.value),
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
                    materialRepo.addAt(new Material(data.id, data.name, "#"+((1<<24)*Math.random()|0).toString(16), "simple", null, null,data.ont_term), 0);
                    console.log("Selecting the new material")
                    onSelectMaterial(materialRepo.materials[0]);
                } else{
                    console.log("Basic Material Already Exists");
                }
            }

        });

    });



    function redraw_aurepos(){
        //auRepo.draw(auRepoSvg, auRepoVP, onSelectAU);
        auRepo.draw(auMaterialRepoSvg, auRepoVP, onSelectMaterialAU);
    }



    rehashaueditor_onCurrentLayer = function rehashaueditor_onCurrentLayer (){
        rehashaueditor(selectedLayer)
    }



    rehashaueditor = function rehashaueditor(selectLayer){
        //console.log("callback test");
        //console.log(layerRepo);
        selectedAU.draw(svg, mainVP, onSelectLayer, selectedLayer, onTabSelect);
        //auRepo.draw(auRepoSvg, auRepoVP, onSelectAU);
        sync_lyphTemplate_list(selectedAU);
        handle_Lyph_Selection(worklist.value, selectLayer);
        redraw_aurepos();
    }




    var sync_lyphTemplate_list = function sync_lyphTemplate_list(selection){
        $('#worklist').empty();
        console.log(auRepo);
        for (var i =0; i < auRepo.auSet.length; i++){
            $('#worklist').append('<option value='+auRepo.auSet[i].id+'> ' + (auRepo.auSet[i].id).replace("TEMPLATE_", "T_") + " " + auRepo.auSet[i].name  +   "</option")
        }

        if (selection){
            $('#worklist').val(selection.id);
        }
    }



    d3.select('#worklist').on("change", function(){
        console.log("selection changed", worklist.value);
        //The apply filter method applies the filter and uses the selection change value as well.
        applyFilter();
        handle_Lyph_Selection(worklist.value)
        console.log(auRepo);
    })


    var handle_Lyph_Selection = function handle_Lyph_Selection (selection, layerToSelect){
        selectedAU = auRepo.auSet[auRepo.getIndexByID(selection)]
        console.log(selectedAU);
        selectedLayer = null;
        onSelectAU(selectedAU);

        if (layerToSelect){
            onSelectLayer(layerToSelect);
        } else {
            if (selectedAU.layers.length > 0) {
                selectedLayer = selectedAU.layers[0];
                onSelectLayer(selectedLayer);
            } else {
                onSelectLayer(null);

            }
        }
    }


    $(function() {
        $( "#autocomplete" ).autocomplete({
            source: function( request, response ) {
                $.ajax({
                    url: "http://open-physiology.org:5052/autocomplete-case-insensitive/" + request.term,
                    dataType: "jsonp",
                    data: {
                        q: request.term
                    },
                    success: function( data ) {
                        response( data.Results);
                    }
                });
            },
            minLength: 3,
            select: function( event, ui ) {
                $.ajax
                ({
                    url:
                    "http://open-physiology.org:"+ serverPort + "/template/"+
                    encodeURIComponent(autocomplete.value),
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
                            materialRepo.addAt(new Material(data.id, data.name, "#"+((1<<24)*Math.random()|0).toString(16), "simple", null, null,data.ont_term), 0);
                            console.log("Selecting the new material")
                            onSelectMaterial(materialRepo.materials[0]);
                        } else{
                            console.log("Basic Material Already Exists");
                        }
                    }

                });

            },
            open: function() {
                $( this ).removeClass( "ui-corner-all" ).addClass( "ui-corner-top" );
            },
            close: function() {
                $( this ).removeClass( "ui-corner-top" ).addClass( "ui-corner-all" );
            }
        });
    });


    d3.select('#resetLyphLayerData').on("click", function(){
        $( "#dialog-confirm" ).dialog({
            resizable: false,
            height:140,
            modal: true,
            buttons: {
                "Delete all items": function() {
                    $.ajax
                    ({
                        url:
                        "http://open-physiology.org:"+ serverPort + "/reset_db/?templates=yes",
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
                            location.reload();
                        }

                    });
                    $( this ).dialog( "close" );


                },
                Cancel: function() {
                    $( this ).dialog( "close" );
                }
            }
        });
    })


    function make_appropriate_selection(){
        var selectionTemplate =getUrlParameter("template");
        var redirectAU = null;
        if (selectionTemplate){
            console.log(selectionTemplate);
            if (auRepo.getIndexByID(selectionTemplate) > -1) {
                redirectAU = auRepo.auSet[auRepo.getIndexByID(selectionTemplate)];
                onSelectAU(redirectAU);
                if (redirectAU.getNumberOfLayers() > 0) {
                    onSelectLayer(redirectAU.layers[0]);
                } else {
                    onSelectLayer(null);
                }
            }
        }

    }

    function getUrlParameter(sParam)
    {
        var sPageURL = window.location.search.substring(1);
        var sURLVariables = sPageURL.split('&');
        for (var i = 0; i < sURLVariables.length; i++)
        {
            var sParameterName = sURLVariables[i].split('=');
            if (sParameterName[0] == sParam)
            {
                return sParameterName[1];
            }
        }
    }


    //Initialisation of the materials from the Database.
    load_all_materials();


}();
