/**
 * Created by sislam on 14/02/15.
 */

var width = 960,
    height = 500,
    fill = d3.scale.category20();

// mouse event vars
var selected_node = null,
    selected_link = null,
    mousedown_link = null,
    mousedown_node = null,
    mouseup_node = null;
    doubleCliked_node = null;
    moveActive = false;

// init svg
var outer = d3.select("#chart")
    .append("svg:svg")
    .attr("width", width)
    .attr("height", height)
    .attr("pointer-events", "all");

var vis = outer
    .append('svg:g')
    .call(d3.behavior.zoom().on("zoom", rescale))
    .on("dblclick.zoom", null)
    .append('svg:g')
    .on("mousemove", mousemove)
    .on("mousedown", mousedown)
    .on("mouseup", mouseup);
    //.on("dblclick", doubleClicked);

vis.append('svg:rect')
    .attr('width', width)
    .attr('height', height)
    .attr('fill', 'white');

// init force layout
var force = d3.layout.force()
    .size([width, height])
    .nodes([{}]) // initialize with a single node
    .linkDistance(50)
    .charge(-200)
    .on("tick", tick);

var drag = d3.behavior.drag()
    .origin(function(d) { return d; })
    .on("dragstart", dragstarted)
    .on("drag", dragged)
    .on("dragend", dragended);

function dragstarted(d){
    console.log("start");
    d3.event.sourceEvent.stopPropagation();
    d.fixed = false;
    //d3.select(this).classed("dragging", true);
}

function dragged(d){
    if (moveActive){
        //force.stop();
        d3.select(this).attr("cx", d.x = d3.event.x).attr("cy", d.y = d3.event.y);
        //vis.call(d3.behavior.zoom().on("zoom"), null);
        d3.event.sourceEvent.stopPropagation();
    }

}

function dragended(d){
    console.log("Drag ended");
    console.log(d);
    d.fixed = true;
    vis.call(d3.behavior.zoom().on("zoom"), rescale);
}

// line displayed when dragging new nodes
var drag_line = vis.append("line")
    .attr("class", "drag_line")
    .attr("x1", 0)
    .attr("y1", 0)
    .attr("x2", 0)
    .attr("y2", 0);

// get layout properties
var nodes = force.nodes(),
    links = force.links(),
    node = vis.selectAll(".node"),
    link = vis.selectAll(".link");

// add keyboard callback
d3.select(window)
    .on("keydown", keydown);

redraw();

// focus on svg
// vis.node().focus();

function mousedown() {
    if (!mousedown_node && !mousedown_link) {
        // allow panning if nothing is selected
        vis.call(d3.behavior.zoom().on("zoom"), rescale);
        return;
    }
}

function doubleClicked(){

    alert("clicked");
    return;
}

function mousemove() {
    if (!mousedown_node) return;

    // update drag line
    drag_line
        .attr("x1", mousedown_node.x)
        .attr("y1", mousedown_node.y)
        .attr("x2", d3.svg.mouse(this)[0])
        .attr("y2", d3.svg.mouse(this)[1]);

}

function mouseup() {

        if (mousedown_node) {
            if (!moveActive) {
            // hide drag line
            drag_line
                .attr("class", "drag_line_hidden")

            if (!mouseup_node) {
                // add node
                var point = d3.mouse(this),
                    node = {x: point[0], y: point[1]},
                    n = nodes.push(node);

                // select new node
                selected_node = node;
                selected_link = null;

                // add link to mousedown node
                links.push({source: mousedown_node, target: node});
            }

            redraw();
            } else {
                drag_line
                    .attr("class", "drag_line_hidden");

            }
        }
        // clear mouse eva
}

function resetMouseVars() {
    mousedown_node = null;
    mouseup_node = null;
    mousedown_link = null;
}

function tick() {
    link.attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

    node.attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; });
}

// rescale g
function rescale() {
    var trans=d3.event.translate;
    var scale=d3.event.scale;

    vis.attr("transform",
        "translate(" + trans + ")"
        + " scale(" + scale + ")");
}

// redraw force layout
function redraw() {

    link = link.data(links);

    link.enter().insert("line", ".node")
        .attr("class", "link")
        .on("mousedown",
        function(d) {
            mousedown_link = d;
            if (mousedown_link == selected_link) selected_link = null;
            else selected_link = mousedown_link;
            selected_node = null;
            redraw();
        })

    link.exit().remove();

    link
        .classed("link_selected", function(d) { return d === selected_link; });

    node = node.data(nodes);

    node.enter().insert("circle")
        .attr("class", "node")
        .attr("r", 5)
        .on("mousedown",
        function(d) {
            // disable zoom
            vis.call(d3.behavior.zoom().on("zoom"), null);

            mousedown_node = d;
            if (mousedown_node == selected_node) selected_node = null;
            else selected_node = mousedown_node;
            selected_link = null;

            console.log(moveActive);
            // reposition drag line
            if (!moveActive) {
                drag_line
                    .attr("class", "link")
                    .attr("class", "link")
                    .attr("x1", mousedown_node.x)
                    .attr("y1", mousedown_node.y)
                    .attr("x2", mousedown_node.x)
                    .attr("y2", mousedown_node.y);
            } else {

            }

            redraw();
        })
        .on("mousedrag",
        function(d) {
            alert("drag event");
        })
        .on("mouseup",
        function(d) {
            //if (!moveActive) {

                if (mousedown_node) {
                    mouseup_node = d;
                    if (mouseup_node == mousedown_node) {
                        resetMouseVars();
                        return;
                    }

                    // add link
                    var link = {source: mousedown_node, target: mouseup_node};
                    links.push(link);

                    // select new link
                    selected_link = link;
                    selected_node = null;

                    // enable zoom
                    vis.call(d3.behavior.zoom().on("zoom"), rescale);
                    redraw();
                }
            //}
        })
        .on("dblclick",
        function(d){
            if(d.fixed) {
                d3.select(this).classed("node_fixed", false);
                d.fixed = false;
            } else {
                d3.select(this).classed("node_fixed", true);
                d.fixed = true;
            }
            redraw();
        })
        .call(drag)
        .transition()
        .duration(750)
        .ease("elastic")
        .attr("r", 6.5)
        ;

    node.exit().transition()
        .attr("r", 0)
        .remove();

    node
        .classed("node_selected", function(d) { return d === selected_node; });






    if (d3.event) {
        // prevent browser's default behavior
        d3.event.preventDefault();
    }

    force.start();

}

function spliceLinksForNode(node) {
    toSplice = links.filter(
        function(l) {
            return (l.source === node) || (l.target === node); });
    toSplice.map(
        function(l) {
            links.splice(links.indexOf(l), 1); });
}

function keydown() {

    if (d3.event.keyCode == 65 && moveActive){
        moveActive = false;
    } else if (d3.event.keyCode == 65 && !moveActive){
        moveActive = true;
    }

    if (!selected_node && !selected_link) return;
    switch (d3.event.keyCode) {
        case 8: // backspace
        case 46:  // delete
            if (selected_node) {
                nodes.splice(nodes.indexOf(selected_node), 1);
                spliceLinksForNode(selected_node);
            }
            else if (selected_link) {
                links.splice(links.indexOf(selected_link), 1);
            }
            selected_link = null;
            selected_node = null;
            redraw();
            break;
        //case 70: // f
        //    selected_node.fixed = true;
        //    redraw();
        //    break;

    }
}


