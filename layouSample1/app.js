// TODO: This part is the driver from the graph-construction.js

var graphEditor = function () {

    //Init visual parameters
    var panelWidth = 300, panelHeight = 500;
    var width = 530;
    var height = 580;
    var auRepoVP = new VisualParameters("horizontal", 30, 5, panelWidth, panelHeight, 0);
    var graphRepoVP = new VisualParameters("horizontal", 5, 20, panelWidth, panelHeight, 0);


    //Creating the required svgs for the page
    var svg = d3.select('#app-body .graph')
        .append('svg:svg')
        .attr('width', width)
        .attr('height', height)
    //.attr("style", "outline: thin solid red;");


    var auRepoSvg = d3.select('#app-body .auRepo').append("svg")
        .attr("width", panelWidth)
        .attr("height", panelHeight);


    var graphRepoSvg = d3.select('#app-body .graphRepo').append("svg")
        .attr("width", panelWidth)
        .attr("height", panelHeight);










    var graph = new ForceGraph("1", "G1", nodes, links);
    graph.draw(svg);
}();










//TODO: This part will go into the api2.data.js
// set up initial nodes and links
//  - nodes are known by 'id', not by index in array.
//  - fixed nodes (as a bold red circle).
//  - links are always source < target; edge directions are set by 'left' and 'right'.

function ForceGraph(id, name, nodes, links) {

        this.id = id;
        this.name = name;
        this.nodes = nodes;
        this.links = links;
        var lastNodeId = nodes.length - 1;

        var colors = d3.scale.category10();

        //TODO: Add multiple select ability from the other code.

        this.clone = function () {
            var newGraph = new ForceGraph(this.id, this.name, this.nodes.slice(0), this.links.slice(0));
            return newGraph;
        }



    this.draw = function (svg) {
        var width = parseInt(svg.attr("width"));
        var height = parseInt(svg.attr("height"));
        var nodeRadius =7;


        // init D3 force layout
        var force = d3.layout.force()
            .nodes(nodes)
            .links(links)
            .size([width, height])
            .linkDistance(45)
            .charge(-250)
            //.gravity(0.1)
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
        var path = svg.append('svg:g').selectAll('path'),
            circle = svg.append('svg:g').selectAll('g');

        // mouse event vars
        var selected_node = null,
            selected_link = null,
            mousedown_link = null,
            mousedown_node = null,
            mouseup_node = null;
        multiple_selected_node_1 = null;
        multiple_selected_node_2 = null;

        function resetMouseVars() {
            mousedown_node = null;
            mouseup_node = null;
            mousedown_link = null;
        }

        // update force layout (called automatically each iteration)
        function tick() {
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

            circle.attr('transform', function (d) {
                //return 'translate(' + Math.min(d.x, width -10)  + ',' + Math.max(d.y, 0+10) + ')';
                return 'translate(' + Math.max(10, Math.min(width - 10, d.x)) + ',' + Math.max(10, Math.min(height - 10, d.y)) + ')';

            });
        }

        // update graph (called when needed)
        var restart = function restart() {
            // path (link) group
            path = path.data(links);

            // update existing links
            path.classed('selected', function (d) {
                return d === selected_link;
            })
                .style('marker-start', function (d) {
                    return d.left ? 'url(#start-arrow)' : '';
                })
                .style('marker-end', function (d) {
                    return d.right ? 'url(#end-arrow)' : '';
                });


            // add new links
            path.enter().append('svg:path')
                .attr('class', 'link')
                .classed('selected', function (d) {
                    return d === selected_link;
                })
                .style('marker-start', function (d) {
                    return d.left ? 'url(#start-arrow)' : '';
                })
                .style('marker-end', function (d) {
                    return d.right ? 'url(#end-arrow)' : '';
                })
                .on('mousedown', function (d) {
                    if (d3.event.ctrlKey) return;

                    // select link
                    mousedown_link = d;
                    if (mousedown_link === selected_link) {
                        selected_link = null;
                        $("#ins").text("Deselected Link:" + d.id);
                    } else {
                        selected_link = mousedown_link;
                        $("#ins").text("Selected Link: [" + d.source.id + "," + d.target.id + "]");
                    }
                    selected_node = null;
                    restart();
                });

            // remove old links
            path.exit().remove();


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
                    return (d === selected_node) ? d3.rgb(colors(d.id)).brighter().toString() : colors(d.id);
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
                    if (mousedown_node === selected_node) {
                        selected_node = null;
                        $("#ins").text("Deselected node:" + d.id);
                    }
                    else {
                        selected_node = mousedown_node;
                        $("#ins").text("Selected node:" + d.id);
                    }
                    selected_link = null;

                    // reposition drag line
                    drag_line
                        .style('marker-end', 'url(#end-arrow)')
                        .classed('hidden', false)
                        .attr('d', 'M' + mousedown_node.x + ',' + mousedown_node.y + 'L' + mousedown_node.x + ',' + mousedown_node.y);

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
                        link = {source: source, target: target, left: false, right: false};
                        link[direction] = true;
                        links.push(link);
                    }

                    // select new link
                    selected_link = link;
                    selected_node = null;
                    restart();
                });

            // show node IDs
            g.append('svg:text')
                .attr('x', 0)
                .attr('y', 4)
                .attr('class', 'id')
                .text(function (d) {
                    return d.id;
                });

            // remove old nodes
            circle.exit().remove();

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
                node = {id: ++lastNodeId, fixed: false};
            node.x = point[0];
            node.y = point[1];
            nodes.push(node);

            restart();
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
            d3.event.preventDefault();

            if (lastKeyDown !== -1) return;
            lastKeyDown = d3.event.keyCode;

            // ctrl
            if (d3.event.keyCode === 68) {
                //circle.call(force.drag);
                circle.call(customDrag);
                svg.classed('ctrl', true);
            }

            if (!selected_node && !selected_link) return;
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
                    if (selected_node) {
                        console.log(selected_node.fixed);
                        if (selected_node.fixed) {
                            selected_node.fixed = false;
                        } else {
                            selected_node.fixed = true;
                        }
                        console.log(selected_node.fixed);
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

