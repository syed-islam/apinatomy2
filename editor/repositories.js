/**
 * Created by Natallia on 13/11/2014.
 */
//Repository of materials
var materialRepo = new MaterialRepo(
        [new Material("#CHEBI_35441", "antiinfective drug", "#"+((1<<24)*Math.random()|0).toString(16), "simple", null, null),
        new Material("#CHEBI_35442", "antiparasitic drug", "#"+((1<<24)*Math.random()|0).toString(16), "simple", null, null),
        new Material("#CHEBI_35440", "(1R,2S)-3-phenylcyclohexa-3,5-diene-1,2-diol", "#"+((1<<24)*Math.random()|0).toString(16), "simple", null, null),
        new Material("#CHEBI_35445", "3,3',5,5'-tetrachlorobiphenyl", "#"+((1<<24)*Math.random()|0).toString(16), "simple", null, null),
        new Material("#CHEBI_51820", "ATTO 590", "#"+((1<<24)*Math.random()|0).toString(16), "simple", null, null),
        new Material("#CHEBI_21695", "N-cyclopropylammelide", "#"+((1<<24)*Math.random()|0).toString(16), "simple", null, null),
        new Material("#CHEBI_35446", "chlorobiphenyl", "#"+((1<<24)*Math.random()|0).toString(16), "simple", null, null),
        new Material("#CHEBI_21694", "N-carboxy-beta-alanine", "#"+((1<<24)*Math.random()|0).toString(16), "simple", null, null),
        new Material("#CHEBI_35443", "anthelminthic drug", "#"+((1<<24)*Math.random()|0).toString(16), "simple", null, null),
        new Material("#CHEBI_51822", "3,7-dideoxy-D-threo-hepto-2,6-diuolosonic acid", "#"+((1<<24)*Math.random()|0).toString(16), "simple", null, null),
        new Material("#CHEBI_21693", "N-carbamyl-L-glutamic acid", "#"+((1<<24)*Math.random()|0).toString(16), "simple", null, null),
        new Material("#CHEBI_35444", "antinematodal drug", "#"+((1<<24)*Math.random()|0).toString(16), "simple", null, null),
        new Material("#CHEBI_51821", "ATTO 590 meta-isomer", "#"+((1<<24)*Math.random()|0).toString(16), "simple", null, null),
        new Material("#CHEBI_35449", "1,3-phenylene group", "#"+((1<<24)*Math.random()|0).toString(16), "simple", null, null),
        new Material("#CHEBI_51824", "N-(3-aminopropyl)-4-aminobutanal", "#"+((1<<24)*Math.random()|0).toString(16), "simple", null, null),
        new Material("#CHEBI_51823", "ATTO 590 para-isomer", "#"+((1<<24)*Math.random()|0).toString(16), "simple", null, null),
        new Material("#CHEBI_21698", "N-cysteinyl-glycosylphosphatidylinositolethanolamine", "#"+((1<<24)*Math.random()|0).toString(16), "simple", null, null),
        new Material("#CHEBI_35447", "biphenyl-4-yl group", "#"+((1<<24)*Math.random()|0).toString(16), "simple", null, null),
        new Material("#CHEBI_51826", "ATTO 610-3", "#"+((1<<24)*Math.random()|0).toString(16), "simple", null, null),
        new Material("#CHEBI_35448", "1,2-phenylene group", "#"+((1<<24)*Math.random()|0).toString(16), "simple", null, null),
        new Material("#CHEBI_51825", "ATTO 610-2", "#"+((1<<24)*Math.random()|0).toString(16), "simple", null, null),
        new Material("#CHEBI_299045", "methyl phosphonate", "#"+((1<<24)*Math.random()|0).toString(16), "simple", null, null),
        new Material("#CHEBI_17594", "hydroquinone", "#"+((1<<24)*Math.random()|0).toString(16), "simple", null, null),
        new Material("#CHEBI_51819", "ATTO 565", "#"+((1<<24)*Math.random()|0).toString(16), "simple", null, null),
        new Material("#CHEBI_17593", "(1->4)-alpha-D-glucooligosaccharide", "#"+((1<<24)*Math.random()|0).toString(16), "simple", null, null),
        new Material("#CHEBI_51818", "ATTO 565 para-isomer", "#"+((1<<24)*Math.random()|0).toString(16), "simple", null, null),
        new Material("#CHEBI_17596", "inosine", "#"+((1<<24)*Math.random()|0).toString(16), "simple", null, null),
        new Material("#CHEBI_51817", "temocillin", "#"+((1<<24)*Math.random()|0).toString(16), "simple", null, null),
        new Material("#CHEBI_51816", "ATTO 565 meta-isomer", "#"+((1<<24)*Math.random()|0).toString(16), "simple", null, null),
        new Material("#CHEBI_17598", "phorbol 12,13-dibutanoate", "#"+((1<<24)*Math.random()|0).toString(16), "simple", null, null),
        new Material("#CHEBI_17597", "4-hydroxybenzaldehyde", "#"+((1<<24)*Math.random()|0).toString(16), "simple", null, null),
        new Material("#CHEBI_35430", "3,3'-diiodothyronine", "#"+((1<<24)*Math.random()|0).toString(16), "simple", null, null),
        new Material("#CHEBI_35431", "3,3'-diiodo-L-thyronine sulfate", "#"+((1<<24)*Math.random()|0).toString(16), "simple", null, null),
        new Material("#CHEBI_35432", "3,3',5-triiodo-L-thyronine sulfate", "#"+((1<<24)*Math.random()|0).toString(16), "simple", null, null),
        new Material("#CHEBI_51811", "ticarcillin(2-)", "#"+((1<<24)*Math.random()|0).toString(16), "simple", null, null),
        new Material("#CHEBI_35433", "calcium bis(dihydrogenphosphate)", "#"+((1<<24)*Math.random()|0).toString(16), "simple", null, null),
        new Material("#CHEBI_51810", "ATTO 495-7", "#"+((1<<24)*Math.random()|0).toString(16), "simple", null, null),
        new Material("#CHEBI_35434", "3,3',5,5'-tetrachlorobiphenyl-4,4'-diol", "#"+((1<<24)*Math.random()|0).toString(16), "simple", null, null),
        new Material("#CHEBI_35435", "4'-amino-biphenyl-4-ol", "#"+((1<<24)*Math.random()|0).toString(16), "simple", null, null),
        new Material("#CHEBI_6257",  "L-isoprenaline", "#"+((1<<24)*Math.random()|0).toString(16), "simple", null, null),
        new Material("#CHEBI_35436", "D-glucoside", "#"+((1<<24)*Math.random()|0).toString(16), "simple", null, null),
        new Material("#CHEBI_51815", "ATTO 520-7", "#"+((1<<24)*Math.random()|0).toString(16), "simple", null, null),
        new Material("#CHEBI_19814", "25-deoxyecdysone", "#"+((1<<24)*Math.random()|0).toString(16), "simple", null, null),
        new Material("#CHEBI_35437", "calcium difluoride", "#"+((1<<24)*Math.random()|0).toString(16), "simple", null, null),
        new Material("#CHEBI_51814", "ATTO 520-4", "#"+((1<<24)*Math.random()|0).toString(16), "simple", null, null),
        new Material("#CHEBI_35438", "nickel coordination entity", "#"+((1<<24)*Math.random()|0).toString(16), "simple", null, null),
        new Material("#CHEBI_19813", "24-methylenecycloartenol", "#"+((1<<24)*Math.random()|0).toString(16), "simple", null, null),
        new Material("#CHEBI_51813", "ATTO 520-3", "#"+((1<<24)*Math.random()|0).toString(16), "simple", null, null),
        new Material("#CHEBI_35439", "pentacyanonickelate(3-)", "#"+((1<<24)*Math.random()|0).toString(16), "simple", null, null),
        new Material("#CHEBI_19812", "24-methylenecholesterol", "#"+((1<<24)*Math.random()|0).toString(16), "simple", null, null)]
);

var m1 = new Material("m:002", "Composite material 2", "#808080", "composite", materialRepo.materials.slice(0, materialRepo.materials.length / 2), null);
var m2 = new Material("m:003", "Composite material 3", "#808080", "composite", materialRepo.materials.slice(materialRepo.materials.length / 2, materialRepo.materials.length - 1), null);
var material = new Material("m:001", "Composite material 1", "#D3D3D3", "composite", [m1, m2], null);

materialRepo.addAt(m1, 0);
materialRepo.addAt(m2, 0);
materialRepo.addAt(material, 0);

//Sample AUs
var layers = [
    new Layer("l:001", "Chyme/Chyle", 1, materialRepo.materials[0]),
    new Layer("l:002", "Mucosa", 1, materialRepo.materials[1]),
    new Layer("l:003", "Submucosa", 1, materialRepo.materials[2]),
    new Layer("l:004", "Internal Muscle", 1, materialRepo.materials[3]),
    new Layer("l:005", "External Muscle", 1, materialRepo.materials[4]),
    new Layer("l:006", "Serosa", 1, materialRepo.materials[5])];

//1
var au = new AsymmetricUnit("au:001", "Gastrointestinal tract", layers, 1);
//2
var layers1 = layers.slice(0);
var au1 = new AsymmetricUnit("au:002", "Sample AU-1", layers1, 1);
au1.removeLayerAt(2);
//3
var layers2 = layers.slice(0);
var au2 = new AsymmetricUnit("au:003", "Sample AU-2", layers2, 1);
au2.addLayerAt(new Layer("l:007", "Skin", 1, "#FFC0CB"), 6);
//4
var layers3 = layers.slice(0);
var au3 = new AsymmetricUnit("au:004", "Sample AU-3", layers3, 1);
au3.replaceLayerAt(new Layer("l:008", "Fat", 2, "#008000"), 3);

//Repository of AUs
var auRepo = new AsymmetricUnitRepo([au, au1, au2, au3]);

////////////////////////////////////////////////////////////////
//Tree
////////////////////////////////////////////////////////////////
var treeChild1 = new TreeNode("1", "child 1", null, []);
var treeChild3 = new TreeNode("2", "child 2", null, []);
var treeChild2 = new TreeNode("3", "child 2", null, [treeChild3]);
var treeChild4 = new TreeNode("4", "child 4", null, []);
treeChild3.parent = treeChild2;
var treeRoot = new TreeNode("0", "root", null, [treeChild1, treeChild2, treeChild4]);
treeChild1.parent = treeRoot;
treeChild2.parent = treeRoot;
var tree = new Tree(treeRoot);

////////////////////////////////////////////////////////////
//Repository of graphs
///////////////////////////////////////////////////////////

var nodes = [
        new Node(0, 100, 100, null),
        new Node (1, 200, 200, null),
        new Node (2, 300, 300, tree)
    ],
    links = [
        new Link(nodes[0], nodes[1]),
        new Link(nodes[1], nodes[2])
    ],
    nodes1 = [
            new Node(0, 100, 100, null),
            new Node (1, 200, 200, null),
            new Node (2, 300, 300, null),
            new Node (3, 400, 400, tree)
    ],
    links1 = [
            new Link(nodes1[0], nodes1[1]),
            new Link(nodes1[1], nodes1[2]),
            new Link(nodes1[2], nodes1[3])
    ]
;

var graph = new Graph("Graph 1", "Testing graph", nodes, links);
var graph1 = new Graph("Syed 1", "Syed Testing", nodes1, links1);



//Syed Attempting file import.


var nodes= [];
var link = [];
d3.csv("Test.csv", function(data) {
    var dataset = data.map(function(d) { return [ +d["id"], +d["x"], +d["y"] ]; });
    for (var i =0; i < dataset.length;i++){
        nodes.push(new Node(dataset[i][0],dataset[i][1], dataset[i][2],null));
    }
    console.log(nodes);
});

d3.csv("Test1.csv", function(data) {
    var dataset = data.map(function(d) { return [ +d["source"], +d["target"] ]; });
    for (var i =0; i < dataset.length;i++){
        link.push(new Link(nodes[Number(dataset[i][0])], nodes[Number(dataset[i][1])]));
    }
    console.log(link);
});



var graphImported = new Graph("Imported", "Import", nodes, link);

var graphRepo = new GraphRepo([graph, graph1, graphImported]);
