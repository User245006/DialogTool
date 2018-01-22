function draw (){
    var svg , colors, simulation,width,height,link,node;
    this.initilization = function(){
         colors = d3.scaleOrdinal(d3.schemeCategory10);
         svg = d3.select("svg")
         .attr("id","svg-id"),
            width = +svg.attr("width"),
            height = +svg.attr("height"),
            node,
            link;
        svg.append('defs').append('marker')
            .attrs({'id':'arrowhead',
                'viewBox':'-0 -5 10 10',
                'refX':13,
                'refY':0,
                'orient':'auto',
                'markerWidth':13,
                'markerHeight':13,
                'xoverflow':'visible'})
            .append('svg:path')
            .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
            .attr('fill', '#999')
            .style('stroke','none');

        simulation = d3.forceSimulation()
            .force("link", d3.forceLink().id(function (d) {return d.id;}).distance(100).strength(1))
            .force("charge", d3.forceManyBody())
            .force("center", d3.forceCenter(width / 2, height / 2));
        var me=this;
            d3.json("graph3.json", function (error, graph){
            if (error) throw error;
            //console.log(graph.nodes);
            //me.update(graph.links, graph.nodes);
            me.NodesWithShowTrue(graph);
        })
    }
    
    this.refresh = function(begin,end,probability,lifeSpanLength,compositeStructure){ 
        svg = d3.select("#svg-id");
        svg.selectAll("*").remove();

       if(typeof probability == "undefined") alert ("Choose values plz!");
       else{
         this.ChooseValues(begin,end,probability,lifeSpanLength,compositeStructure);
       }
    }

    this.NodesWithShowTrue = function(graph){
        var showNodes=[];
        var me=this;
        d3.json("graph3.json", function (error, graph) {
            var ns = graph.nodes;
            var lins = graph.links;
            var indexShowChos= [];
            for(var i=0; i<ns.length; i++)
            {
                var showValue = ns[i].show;
                if(showValue == "true")
                {   console.log("show= "+showValue);
                    showNodes.push(ns[i]); 
                    indexShowChos.push(ns[i].id); 
                }
            }
            var Res = me.filterlinks(lins,indexShowChos);
            me.update(Res, showNodes);
            
        })

    }
    this.ChooseValues = function(begin,end,probability,lifeSpanLength,compositeStructure){
       var valuesChosing=[];
       var me=this;
        d3.json("graph3.json", function (error, graph) {
            var nods= graph.nodes;
            
            var elemtNode = {"name":"", "label":[],"id":0};
            var linkss= graph.links;
            var indexChos= [];
            for (var i=0; i< nods.length;i++){
                var element= nods[i];
                var nodeLabel = nods[i].label;
                var prob= nodeLabel[0];
                var beginTimeStamp = nodeLabel[1];
                var endTimeStamp = nodeLabel[2];
                var lslength = (endTimeStamp-beginTimeStamp);
                if((prob>=probability)&&(beginTimeStamp>=begin)
                    &&(endTimeStamp<=end)&&(lslength>=lifeSpanLength)
                    &&(nods[i].show == "true")) {
                    valuesChosing.push(element); // add in the list
                    indexChos.push(element.id);
                }
            }
          var linkRes=  me.filterlinks(linkss,indexChos);
            me.update(linkRes, valuesChosing);
        }) 
    }
    this.filterlinks = function(linkss,indexChos){
        var linkRes=[];
        for(var i=0;i<linkss.length; i++)
        {  var source= linkss[i].source;
           var target= linkss[i].target;
           var exist1= indexChos.indexOf(source);
           var exist2=indexChos.indexOf(target);
           if((exist1!=-1)&&(exist2!=-1)){
               linkRes.push(linkss[i]);
           }

        }
        return linkRes;
    }
   
    this.update=function (links, nodes) {        
        var svg=  d3.select("#svg-id");
        link = svg.selectAll(".link")
            .data(links)
            .enter()
            .append("line")
            .attr("class", "link")
            .attr('marker-end','url(#arrowhead)')
        link.append("title")
            .text(function (d) {return d.type;});
        edgepaths = svg.selectAll(".edgepath")
            .data(links)
            .enter()
            .append('path')
            .attrs({
                'class': 'edgepath',
                'fill-opacity': 0,
                'stroke-opacity': 0,
                'id': function (d, i) {return 'edgepath' + i}
            })
            .style("pointer-events", "none");
        edgelabels = svg.selectAll(".edgelabel")
            .data(links)
            .enter()
            .append('text')
            .style("pointer-events", "none")
            .attrs({
                'class': 'edgelabel',
                'id': function (d, i) {return 'edgelabel' + i},
                'font-size': 12,
                'font-weight': 'bold',
                'fill': '#131313'
            });
        edgelabels.append('textPath')
            .attr('xlink:href', function (d, i) {return '#edgepath' + i})
            .style("text-anchor", "middle")
            .style("pointer-events", "none")
            .attr("startOffset", "50%")
            .text(function (d) {return d.type});
        node = svg.selectAll(".node")
            .data(nodes)
            .enter()
            .append("g")
            .attr("class", "node")
            .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            //.on("click", showInternalStructure)
            );
        node.append("circle")
            .attr("r", 10)
            .style("fill", function (d, i) {return colors(i);})
        node.append("title")
            .text(function (d) {return d.id;});
        node.append("text")
            .attr("dy", -20)
            .text(function (d) {return d.name;})
        node.append("text")
            .attr("dy", -40)
            .text(function (d) {return "{"+d.label[0]+", ["+d.label[1]+", "+d.label[2]+"]}";});
        node.on("click",showInternalStructure);
        simulation = d3.forceSimulation()
            .force("link", d3.forceLink().id(function (d) {return d.id;}).distance(100).strength(1))
            .force("charge", d3.forceManyBody())
            .force("center", d3.forceCenter(800/2, 800 / 2));
       
        simulation
            .nodes(nodes)
            .on("tick", ticked);
        simulation.force("link")
            .links(links);
    }
    function ticked() {
        link
            .attr("x1", function (d) {return d.source.x;})
            .attr("y1", function (d) {return d.source.y;})
            .attr("x2", function (d) {return d.target.x;})
            .attr("y2", function (d) {return d.target.y;});
        node
            .attr("transform", function (d) {return "translate(" + d.x + ", " + d.y + ")";});
        edgepaths.attr('d', function (d) {
            return 'M ' + d.source.x + ' ' + d.source.y + ' L ' + d.target.x + ' ' + d.target.y;
        });
        edgelabels.attr('transform', function (d) {
            if (d.target.x < d.source.x) {
                var bbox = this.getBBox();
                rx = bbox.x + bbox.width / 2;
                ry = bbox.y + bbox.height / 2;
                return 'rotate(180 ' + rx + ' ' + ry + ')';
            }
            else {
                return 'rotate(0)';
            }
        });
    }
    function dragstarted(d) {
        if (!d3.event.active) simulation.alphaTarget(0.3).restart()
        d.fx = d.x;
        d.fy = d.y;
    }
    function dragged(d) {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
    }

    function showInternalStructure(d, nodes)
    {
        var identifier = d.id;
        d3.json("graph3.json", function (graph){
        var n = graph.nodes;
        var l = graph.links;
        
        for(var i=0; i<n.length; i++)
        {
            var ident = n[i].id;
            if(ident = identifier)
            {
                
                if(n[i].internalStructure.length!=0)
                {
                for(var j=0; j<n[i].internalStructure.length; j++)
                {   console.log("a node has internal structure: "+n[i]);
                    for(var k=0; k<n.length; k++)
                    {
                        if(n[i].internalStructure[j] == n[k].id)
                        {   // here write the code for composite structure vizualization
                            console.log("added node");
                    
                        }
                    }
                }
                    
                }
                
            }
        }
        })
        
    }
}