/**
 * Created by Natallia on 07/11/2014.
 */
var materialEditor = function () {
    var width = 960, height = 500;
    var panelWidth = 300, panelHeight = 500;

    var margin = 20;
    // create canvas
    var svg = d3.select('#app-body .chart').append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(" + margin + "," + margin + ")");

    var materialRepoSvg = d3.select('#app-body .materialRepo').append("svg")
        .attr("width", panelWidth)
        .attr("height", panelHeight);

    var auRepoSvg = d3.select('#app-body .auRepo').append("svg")
        .attr("width", panelWidth)
        .attr("height", panelHeight);

    /////////////////////////////////////////////////////////
    //Visualization
    /////////////////////////////////////////////////////////
    var selectedMaterialNode = null;  //Selected material
    var selectedMaterial = null;  //Selected material data
    var selectedAUNode = null;    //Selected AU
    var selectedAU = null;        //Selected AU data
    var selectedChildNode = null; //Selected submaterial
    var selectedChild = null;     //Selected submaterial

    var onSelectMaterial = function(d){
        if (this != selectedMaterial){
            d3.select(this).style("stroke", "red");
            d3.select(selectedMaterialNode).style("stroke", "black");
            selectedMaterialNode = this;
            selectedMaterial = d;
            syncSelectedMaterial();
        }
    }

    var onSelectAU = function(d){
        if (this != selectedAUNode){
            d3.select(this).style("stroke", "red");
            d3.select(selectedAUNode).style("stroke", "black");
            selectedAUNode = this;
            selectedAU = d;
            syncSelectedAU();
        }
    }

    var onSelectChild = function(node, d){
        if (node != selectedChildNode){
            d3.select(node).style("stroke", "red").style("stroke-width", 2);
            d3.select(selectedChildNode).style("stroke", "black").style("stroke-width", 0);
            selectedChildNode = node;
            selectedChild = d;
            syncSelectedChild();
        }
    }

    ///////////////////////////////////////////////////////////

    //Visual parameters
    var mainVP = new VisualParameters("horizontal", 350, 30, width, height, margin);
    var auRepoVP = new VisualParameters("horizontal", 30, 5, panelWidth, panelHeight, 0);
    var materialRepoVP = new VisualParameters("horizontal", 20, 20, panelWidth, panelHeight, 0);

    auRepo.draw(auRepoSvg, auRepoVP, onSelectAU);
    loadAURepoToDatalist(auRepo);

    materialRepo.draw(materialRepoSvg, materialRepoVP, onSelectMaterial);
    loadMaterialRepoToDatalist(materialRepo);

    if (materialRepo.materials != null && materialRepo.materials.length > 0)
        selectedMaterial = materialRepo.materials[0];
    syncSelectedMaterial();

    ////////////////////////////////////////////////
    //Material
    ////////////////////////////////////////////////
    function syncSelectedMaterial(){
        updateVisualParameters(mainVP);
        if (selectedMaterial !=  null){
            updateMaterialParameters(selectedMaterial);
            selectedMaterial.draw(svg, mainVP, onSelectChild);
            syncMaterialType();
        }
    }

    function syncMaterialType(){
        if (selectedMaterial.type == "composite" && selectedMaterial.children != null && selectedMaterial.children.length > 0)
            selectedChild = selectedMaterial.children[0];
        if (selectedMaterial.type == "AU" && selectedMaterial.au != null)
            selectedAU = selectedMaterial.au;
        syncSelectedChild();
        syncSelectedAU();
    }

    function updateMaterialParameters(material){
        d3.select("#materialID").property("value", material.id);
        d3.select("#materialName").property("value", material.name);
        d3.select("#materialColour").property("value", material.colour);
        d3.select("#materialType").property("value", material.type);
    }




    d3.select("#materialType").on("input", function () {
        if (materialType == "AU"){
            if (selectedMaterial.au != null)
                updateAUParameters(selectedMaterial.au)
            else
                if (auRepo.auSet != null && auRepo.auSet.length > 0)
                    updateAUParameters(auRepo.auSet[0]);
        } else {
            updateAUParameters(null);
        }
        if (materialType == "composite"){
            if (selectedMaterial.children != null)
                updateChildParameters(selectedMaterial.children[0])
        } else {
            updateChildParameters(null);
        }
    });

    //////////////////////////////////////
    //AU
    /////////////////////////////////////
    function syncSelectedAU(){
        if (selectedMaterial.type == "AU"){
            updateAUParameters(selectedAU);
        } else{
            updateAUParameters(null);
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

    function loadAURepoToDatalist(auRepo){
        d3.select('datalist#auSet')
            .selectAll('options')
            .data(auRepo.auSet)
            .enter()
            .append("option")
            .attr("value", function(d){return d.id;});
    }

    d3.select("#auID").on("input", function () {
        var auIndex  = auRepo.getIndexByID(auID.value);
        if (auIndex > -1)
            d3.select("#auName").property("value", auRepo.auSet[auIndex].name);
    });

    ////////////////////////////////
    //Material parameters
    ////////////////////////////////

    d3.select("#materialClone").on("click", function () {
        var current_MaterialID = $('#materialID').val();
        $('#materialID').val(current_MaterialID + "_cloned");
        //d3.select('#materialClone').attr("disabled", "true");
        d3.select('#materialSave').attr("disabled", null);

        if (materialRepo.getIndexByID(materialID.value) > -1) {
            alert("Cannot create a new material: another material with such ID exists!");
            return;
        }
        var newMaterial = null;
        if (selectedMaterial != null) {
            newMaterial = selectedMaterial.clone();
            newMaterial.id = materialID.value;
            newMaterial.name = materialName.value;
            newMaterial.colour = materialColour.value;
            newMaterial.type = materialType.value;
        } else
            newMaterial = new Material(materialID.value, materialName.value, materialColour.value, materialType.value, [], null);
        if (newMaterial.type == "AU") {
            var auIndex = auRepo.getIndexByID(auID.value);
            if (auIndex > -1)
                newMaterial.au = auRepo.auSet[auIndex];
        } else
            newMaterial.au = null;
        if (newMaterial.type != "composite"){
            newMaterial.children = [];
        }
        //materialRepo.addAt(newMaterial, materialRepo.materials.length - 1);
        materialRepo.addAt(newMaterial, 0);
        //console.log(materialRepo.materials);
        //console.log(materialRepo.materials[0]);
        //console.log(materialRepo.materials[1]);

        materialRepo.draw(materialRepoSvg, materialRepoVP, onSelectMaterial);



        newMaterial.saveMaterialToDatabase();




    })

    d3.select("#materialUpdate").on("click", function () {
        if (selectedMaterial != null) {
            if (materialID.value != selectedMaterial.id && materialRepo.getIndexByID(materialID.value) > -1) {
                alert("Cannot update material: another material with such ID exists!");
                return;
            }
            selectedMaterial.id = materialID.value;
            selectedMaterial.name = materialName.value;
            selectedMaterial.colour = materialColour.value;
            selectedMaterial.type = materialType.value;
            if (selectedMaterial.type == "AU"){
                var auIndex  = auRepo.getIndexByID(auID.value);
                if (auIndex > -1)
                    selectedMaterial.au = auRepo.auSet[auIndex];
            }
            if (selectedMaterial.type != "AU"){
                selectedMaterial.au = null;
            }
            if (selectedMaterial.type != "composite"){
                selectedMaterial.children = [];
            }
            syncSelectedMaterial();
            materialRepo.draw(materialRepoSvg, materialRepoVP, onSelectMaterial);
        } else {
            alert("Error: material is not selected!");
        }
    })

    d3.select("#materialRestore").on("click", function () {
        if (selectedMaterial != null) {
            updateMaterialParameters(selectedMaterial);
        }
    })

    d3.select("#materialDelete").on("click", function () {
        if (selectedMaterial != null) {
            var auIndex = auRepo.isUsedMaterialID(selectedMaterial.id);
            if (auIndex > -1) {
                alert("Cannot delete the material: one or more AUs use it!");
                return;
            }
            var index = materialRepo.getIndexByID(selectedMaterial.id);
            if (index > -1) {
                if (confirm("Delete material " + selectedMaterial.id + "?")) {
                    materialRepo.removeAt(index);
                    if (materialRepo.materials.length > 0) selectedMaterial = materialRepo.materials[0];
                    syncSelectedMaterial();
                    materialRepo.draw(materialRepoSvg, materialRepoVP, onSelectMaterial);
                    loadMaterialRepoToDatalist(materialRepo);
                }
            }
        }
    })

    d3.select("#createBasicLyph").on("click", function () {
        console.log("Creating basic lyph");
        console.log(fmaID.value);

        //send request to create lyph

        $.ajax
        ({
            url:
                "http://open-physiology.org:5054/lyph/"+
                encodeURIComponent(fmaID.value),
            jsonp:
                "callback",
            dataType:
                "jsonp",
            success: function( response )
            {
                console.log(this.url);
                var data = response;

                if ( data.hasOwnProperty( "Error" ) )
                {
                  console.log(data.Error);
                    return;
                }

                console.log(data);
                if (materialRepo.getIndexByID(data.id)== -1 )
                    load_all_materials();
                else
                    console.log("Basic Material already exisits");

            }

        });

        //

    })

    //////////////////////////////////////
    //Sub-material parameters
    /////////////////////////////////////
    function loadMaterialRepoToDatalist(materialRepo){
        d3.select('datalist#materials')
            .selectAll('options')
            .data(materialRepo.materials)
            .enter()
            .append("option")
            .attr("value", function(d){return d.id;});
    }

    d3.select("#childID").on("input", function () {
        var childIndex  = materialRepo.getIndexByID(childID.value);
        if (childIndex > -1)
            d3.select("#childName").property("value", materialRepo.materials[childIndex].name);
    });

    function syncSelectedChild(){
        if (selectedMaterial.type == "composite"){
            updateChildParameters(selectedChild);
        } else{
            updateChildParameters(null);
        }
    }

    function updateChildParameters(child){
        if (child != null){
            d3.select("#childID").property("value", child.id);
            d3.select("#childName").property("value", child.name);
        } else {
            d3.select("#childID").property("value", "");
            d3.select("#childName").property("value", "");
        }
    }

    function deleteChild(material, child){
        if (material != null && child != null){
            console.log("Gets here");
            if (confirm("Delete sub-material " + child.id + " from material " + material.id + "?")){
                var index = material.getChildIndex(child.id);
                if (index > -1){
                    //console.log(materialRepo.materials[0]);
                    //console.log(materialRepo.materials[1]);
                    material.removeChildAt(index);
                    //console.log(materialRepo.materials[0]);
                    //console.log(materialRepo.materials[1]);
                    syncSelectedMaterial();
                } else {
                    alert("Failed to delete the sub-material: perhaps, it is not the direct child of the selected material!");
                }
            }
        } else {
            alert("Cannot delete the sub-material: " + (material == null )? " material is not selected!" : " sub-material is not selected!");
        }
    }

    //select child as the main material
    d3.select("#childEdit").on("click", function() {
        //TODO find the node in the repository
        //selectedMaterialNode = this;
        selectedMaterial = selectedChild;
        if (selectedMaterial.children != null && selectedMaterial.children.length > 0)
            selectedChild = selectedMaterial.children[0];
        syncSelectedMaterial();
    })

    d3.select("#childAdd").on("click", function() {
        if (selectedMaterial.getChildIndex(childID.value) > -1){
            alert("Cannot add a new sub-material, a sub-material with such ID is already in the set!");
            return;
        }
        var materialIndex  = materialRepo.getIndexByID(childID.value);
        if (materialIndex == -1){
            alert("Cannot update the sub-material: no material with such ID exists!");
            return;
        }
        var newMaterial = materialRepo.materials[materialIndex];
        selectedMaterial.addChildAt(newMaterial, 0);
        selectedMaterial.draw(svg, mainVP, onSelectChild);
    })

    d3.select("#childUpdate").on("click", function() {
        if (selectedMaterial != null && selectedChild != null){
            var materialIndex  = materialRepo.getIndexByID(childID.value);
            if (materialIndex == -1){
                alert("Cannot update the sub-material: no material with such ID exists!");
                return;
            }
            if (childID.value != selectedChild.id){
                if (selectedMaterial.getChildIndex(childID.value) > -1) {
                    alert("Cannot update the sub-material: another sub-material with such ID exists!");
                    return;
                }
                var childIndex = selectedMaterial.getChildIndex(selectedChild.id);
                if (childIndex > -1)
                    selectedMaterial.replaceChildAt(materialRepo.materials[materialIndex], childIndex);
                selectedMaterial.draw(svg, mainVP, onSelectChild);
            }
        } else {
            alert("Cannot update the sub-material: " + (selectedMaterial == null )? " Material is not selected!" : " sub-material is not selected!");
        }
    })

    d3.select("#childRestore").on("click", function() {
        if (selectedMaterial != null){
            updateChildParameters(selectedChild);
        }
    })

    d3.select("#childDelete").on("click", function() {
        if (selectedChild != null){
            //console.log(selectedMaterial);
            //console.log(selectedChild);
            deleteChild(selectedMaterial, selectedChild);
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
    }

    d3.select("#vpLength").on("input", function () {
        d3.select("#vpLength-value").text(vpLength.value);
        mainVP.lengthScale = vpLength.value;
        syncSelectedMaterial();
    });

    d3.select("#vpThickness").on("input", function () {
        d3.select("#vpThickness-value").text(vpThickness.value);
        mainVP.widthScale = vpThickness.value;
        syncSelectedMaterial();
    });



///////////////////////////////////
// Loading Lyph Data from Server
///////////////////////////////////

    var load_all_materials = function (){
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


                //load all mix types

                for (var i = 0; i < data.length; i++) {
                    if (data[i].type === "mix"){
                        //console.log(data[i]);
                        var composite_material_content = [];
                        for (var j = 0; j < data[i].layers.length;j++){
                            composite_material_content.push(materialRepo.materials[materialRepo.getIndexByID(data[i].layers[j].mtlid)]);
                        }
                        materialRepo.addAt(new Material(data[i].id, data[i].name, "#"+((1<<24)*Math.random()|0).toString(16), "composite", composite_material_content, null), 0);
                    }
                }
                materialRepo.draw(materialRepoSvg, materialRepoVP, onSelectMaterial);


                //load all shell types
                for (var i = 0; i < data.length; i++) {
                    if (data[i].type === "shell"){
                        console.log(data[i]);
                        // Create appropriate layers for the lyph

                        var layers_content= [];
                        for (var j = 0; j < data[i].layers.length;j++){
                            console.log(data[i].layers[j]);
                            layers_content.push(new Layer(data[i].layers[j].id, data[i].layers[j].mtlname, ((data[i].layers[j].thickness == "unspecified")? 1: data[i].layers[j].thickness), materialRepo.materials[materialRepo.getIndexByID(data[i].layers[j].mtlid)]   ));
                        }
                        console.log(layers_content);
                        //create AU with the layers
                        var toto = new AsymmetricUnit(data[i].id, data[i].name, layers_content, 1);

                        //console.log(toto);
                        auRepo.addAt(toto,0);
                        //console.log(auRepo.auSet[0]);

                        auRepo.draw(auRepoSvg, auRepoVP, onSelectAU);
                    }
                }

                console.log(auRepo);




            }

        });


    };


    load_all_materials();



}();






