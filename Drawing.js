function draw (){
    
    var svg , colors, simulation,width,height,link,node;
    var me=this;
    var jsonfile;

    var graphNodes = [];
    var graphLinks = [];

    this.getGraphFile = function(){
        return jsonfile;
    }

    this.initilization = function(graphFile){
        
         jsonfile = graphFile;
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

            d3.json(jsonfile, function (error, graph){
                if (error) throw error;
                graphNodes = graph.nodes;
                graphLinks = graph.links;
                me.NodesWithShowTrue();
               
            })
    }

    this.hideInternalStructure = function(d)
    {      
        
            var identifier = d.id;
            d.showInternalStructure = "false";
        
            var n = graphNodes;
            var l = graphLinks;

            var newNodes = [];
            var newNodesNames = [];
            var indexNodes = [];
            var nodesToBeShown = [];
            var nodesToBeShownIndexex = [];
        
            for(var i=0; i<n.length; i++)
            {   var ident = n[i].id;
                if(ident = identifier)
                {   var interStru = d.internalStructure;
                    
                       for(var j=0; j<interStru.length; j++)
                        {   
                            for(var k=0; k<n.length; k++)
                            {  var temp = interStru[j];
                               if(temp == n[k].id)
                               {    n[k].show = "false"; 
                                    if(!newNodesNames.includes(n[k].name))
                                      {
                                        newNodesNames.push(n[k].name);
                                        newNodes.push(n[k]);
                                        indexNodes.push(n[k].id);
                                      }
                               }
                            }
                        }   
                }
               if(!newNodesNames.includes(n[i].name))
                {
                      newNodesNames.push(n[i].name);
                      newNodes.push(n[i]);
                      indexNodes.push(n[i].id);
                }
                
            }
            
            for(var s = 0; s<newNodes.length; s++)
            { 

              if(newNodes[s].show == "true")
              { if(newNodes[s].id == d.id)
                {
                    newNodes[s].showInternalStructure = "false"; 
                }
                nodesToBeShown.push(newNodes[s]);
                nodesToBeShownIndexex.push(newNodes[s].id);
              }
            }
             svg = d3.select("#svg-id");
             svg.selectAll("*").remove();
             var Res = me.filterlinks(l,nodesToBeShownIndexex);
             me.update(Res, nodesToBeShown);
          
                  
    }
    
    
    this.showInternalStructure = function(d)
    {   
        
        var identifier = d.id;
        d.showInternalStructure="true";
        var n = graphNodes;
        var l = graphLinks;
        
        var newNodes = [];
        var newNodesNames = [];
        var indexNodes = [];
        var nodesToBeShown = [];
        var nodesToBeShownIndexex = [];
        for(var i=0; i<n.length; i++)
        {   var ident = n[i].id;
            if(ident = identifier)
            {   var interStru = d.internalStructure;
                if(interStru.length != 0)
                {
                   for(var j=0; j<interStru.length; j++)
                    {   
                        for(var k=0; k<n.length; k++)
                        {  var temp = interStru[j];
                           if(temp == n[k].id)
                           {    n[k].show = "true"; 
                                if(!newNodesNames.includes(n[k].name))
                                  {
                                    newNodesNames.push(n[k].name);
                                    newNodes.push(n[k]);
                                    indexNodes.push(n[k].id);
                                  }
                           }
                        }
                    }  
                }    
            }
           if(!newNodesNames.includes(n[i].name))
                {
                  newNodesNames.push(n[i].name);
                  newNodes.push(n[i]);
                  indexNodes.push(n[i].id);
                }
            
        }
        
        for(var s = 0; s<newNodes.length; s++)
        {   
            if(newNodes[s].show == "true")
            { 
                if(newNodes[s].id==d.id)
                {
                newNodes[s].showInternalStructure = "true";
                }
              nodesToBeShown.push(newNodes[s]);
              nodesToBeShownIndexex.push(newNodes[s].id);
            }
        }

       console.log("Links in SHowInternalStructure: "+l.length,nodesToBeShownIndexex);
        var Res = me.filterlinks(l,nodesToBeShownIndexex);
        
        svg = d3.select("#svg-id");
        svg.selectAll("*").remove();
        me.update(Res, nodesToBeShown);
       
    }

    this.filterlinks = function(linkss1, indexChos){
        var linkRes=[];
        
        var linkss= graphLinks
        console.log("in FilterLinks: ",linkss)
        for(var i=0;i<linkss.length; i++)
        {    console.log("111source: ",linkss[i].source.id+", target: ",linkss[i].target.id)
       
           var source = parseInt(linkss[i].source.id);
           var target = parseInt(linkss[i].target.id);
           if(isNaN(source)){
            source = parseInt(linkss[i].source);
           }
           if(isNaN(target)){
            target = parseInt(linkss[i].target);
           }
         console.log("source: "+source+", target: "+target)
           var exist1 = indexChos.indexOf(source);
           var exist2 = indexChos.indexOf(target);
         console.log("exist source: "+exist1+", exist target: "+exist2)
           if((exist1!=-1)&&(exist2!=-1)){
               linkRes.push(linkss[i]);
           }

        }
        return linkRes;
    }
   
    

    this.NodesWithShowTrue = function(){
        var showNodes=[];
       
            var ns = graphNodes;
            var lins = graphLinks;
            var indexShowChos= [];
            for(var i=0; i<ns.length; i++)
            {
                var showValue = ns[i].show;
                if(showValue == "true")
                {   
                    showNodes.push(ns[i]); 
                    indexShowChos.push(ns[i].id); 
                }
            }
            
            var Res = me.filterlinks(lins,indexShowChos);
            me.update(Res, showNodes);  
    }


    this.refresh = function(begin,end,probability,lifeSpanLength){ 
        svg = d3.select("#svg-id");
        svg.selectAll("*").remove();

       if(typeof probability == "undefined") alert ("Choose values plz!");
       else{
         this.ChooseValues(begin,end,probability,lifeSpanLength); 
       }
    }

    this.ChooseValues = function(begin,end,probability,lifeSpanLength){ 
       var valuesChosing=[];
       
      
            var nods= graphNodes;
            var elemtNode = {"name":"", "label":[],"id":0};
            var linkss= graphLinks;
            var indexChos= [];
            for (var i=0; i< nods.length;i++){
                var element = nods[i];
                var nodeLabel = nods[i].label;
                var prob = nodeLabel[0];
                var beginTimeStamp = nodeLabel[1];
                var endTimeStamp = nodeLabel[2];
                var lslength = (endTimeStamp-beginTimeStamp);
                if((prob>=probability)&&(beginTimeStamp>=begin)
                    &&(endTimeStamp<=end)&&(lslength>=lifeSpanLength)
                    &&(nods[i].show == "true")) {
                    valuesChosing.push(element); 
                    indexChos.push(element.id);
                }
            }
          var linkRes = me.filterlinks(linkss,indexChos);
          me.update(linkRes, valuesChosing);
    }
    
    this.update = function (links, nodes) {  
        
        var svg =  d3.select("#svg-id");
        link = svg.selectAll(".link")
            .data(links)
            .enter()
            .append("line")
            .attr("class", "link")
            .attr('marker-end','url(#arrowhead)');
        console.error("link",link);
        link.append("title")
            .text(function (d) {
               
                return d.type;});

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
            
            );
           
        node.append("circle")
            .attr("r", 10)
            
            .style("fill", getColor)
        node.append("title")
            .text(function (d) {return d.id;});
        node.append("text")
            .attr("dy", -20)
            .text(function (d) {return d.name;})
        node.append("text")
            .attr("dy", -40)
            .text(function (d) { if(d.label[0]!=null && d.label[1]!=null && d.label[2]!=null)
                                 return "{"+d.label[0]+", ["+d.label[1]+"%, "+d.label[2]+"%]}";
                                 else
                                 return "";});
       
        node.on("click", test);
        simulation = d3.forceSimulation()
            .force("link", d3.forceLink().id(function (d) {return d.id;}).distance(100).strength(1))
            .force("charge", d3.forceManyBody())
            .force("center", d3.forceCenter(1500/2, 1000 / 2));
       
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
            .attr("y2", function (d) { return d.target.y;});
        node.attr("transform", function (d) {
            
                return "translate(" + d.x + ", " + d.y + ")";
            });
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
    
    function test(d)
    { 
        if(d.internalStructure.length != 0)
        {   
            if(d.showInternalStructure=="true")
            { 
               me.hideInternalStructure(d);
            }
            else
            {
               me.showInternalStructure(d);
            }
        }
       
    }

    function getColor(d)
    {   
        var test = false;
        
                if(d.internalStructure.length!= 0 && d.showInternalStructure =="false")
                {  
                    return"CornflowerBlue";            
                }
                else
                {
                    return "Crimson";
                }    
    }
    }
