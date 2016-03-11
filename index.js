var widthClient = window.innerWidth;
var heightClient = window.innerHeight;
var links = [];
var keyLinks = [];

var cValue = function(d) { return d.keyword;},
    color = d3.scale.category10();

var margin = {top: 20, right: 20, bottom: 20, left: 20},
	width = widthClient - margin.right - margin.left,
	height = heightClient - margin.top - margin.bottom;

var svg = d3.select("body").append("svg")
	.attr("width", width + margin.right + margin.left)
	.attr("height", height + margin.top + margin.bottom)
	.append("g")
	.attr("transform", "translate(" + margin.left + "," + margin.top + ")")
	;

//Loading External Data
var format = d3.time.format("%Y");
d3.json("json/data.json", function(error, data) {
  data.sort(function (a, b) {
	  if (format.parse(a.date.toString()) > format.parse(b.date.toString())) {
	    return 1;
	  }
	  if (format.parse(a.date.toString()) < format.parse(b.date.toString())) {
	    return -1;
	  }
	  return 0;
	});

//Sorting 
var rKeys = [];
data.forEach(function(d,i){
	d.keywords.forEach(function(d1,i1){
		rKeys.push(d1.name);
	});
});

//Keywords Set/Array
var mySet = new Set(rKeys);
var myArr = Array.from(mySet);


var topK = [];
for(var i=0;i<myArr.length;i++){
	topK.push({"keyword":myArr[i], "freq":0});
	for(var j=0;j<rKeys.length;j++){
		if(myArr[i]==rKeys[j]){
			topK[i].freq++;
		}
	}
}

topK.sort(function (a, b) {
	  if (a.freq > b.freq) {
	    return 1;
	  }
	  if (a.freq < b.freq) {
	    return -1;
	  }
	  return 0;
	});


var wE = width/data.length;
var hE = 3.25*height/5;

//Displaying a Bounding Rectangle for the Precedents' Image (Optional)
	svg.selectAll(".rectImg")
		.data(data)
	 	.enter()
		.append("rect")
		.attr("class","rectImg")
		.attr("width",wE)//
		.attr("height",100)
		.attr("x",function(d,i){d.x = i*wE+0.5*wE; return i*wE;})
		.attr("y", function(d,i){d.y = hE; return d.y})
		.attr("rx",10) 
		.attr("ry",10) 
		.style("stroke","black")
		.style("stroke-opacity",0.5)
		.style("fill","none")
		;

//Displaying Timeline Dates above Precedents' Image
	svg.selectAll(".dateText")
		.data(data)
	 	.enter()
		.append("text")
		.attr("class","dateText")
		.attr("x",function(d,i){d.x = i*wE+0.5*wE; return i*wE;})
		.attr("y", 20)
		.style("fill","black")
		.style("font-size",function(d) { return 12;})
		.text(function(d){return d.date})
		;

//Displaying Precedents' Image
 var imgData = 	svg.selectAll(".precedentImg")
	  	.data(data)
	  	.enter()
	  	.append("image")
		.attr("class","precedentImg")
		.attr("id",function(d){return d.title;})
		.attr("xlink:href", function(d){return "img/"+d.imgUrl;})
		.attr("width",wE)//
		.attr("height",100)
		.attr("x",function(d,i){return i*wE;})
		.attr("y", hE)
        .on("mouseover", function() {
            d3.select(this).transition().duration(500)
                .attr("width", 500)
                .attr("height", 500)
                .attr("y", hE - 250)
        })
        .on("mouseout", function() {
            d3.select(this).transition().duration(300)
                .attr("width", wE)
                .attr("height", 100)
                .attr("y", hE)
        })
	  ;

//Displaying Keywords' Text
	// svg.selectAll("text")
	svg.selectAll(".keyText")
		.data(topK)
	 	.enter()
		.append("text")
		.attr("class","keyText")
		.attr("x",function(d,i){d.x = i*width/topK.length; return d.x+10;})
		.attr("y", function(d){d.y = height-20;  return d.y})
		.style("fill",function(d) { return color(cValue(d));})
		.style("font-size",function(d) { return 12;})
		// .style("font-size",function(d) { return 5*d.freq;})
		.text(function(d){return d.keyword})
		.on("mouseover", function(d,i) {
			})
		.on("mouseout", function(d,i) {
			})
		;

//Prepare Data for Connecting Keywords to Precedents
	for(var i =0;i<topK.length;i++){
		for(var j = 0;j<data.length;j++){
			var thisArray = data[j].keywords;
			for(var k =0;k<thisArray.length;k++){
				if(topK[i].keyword == thisArray[k].name){
					var dataCopy = jQuery.extend(true, {}, data[j]);
					dataCopy.y +=100;
					keyLinks.push({"source" : topK[i],"target":dataCopy});
				}
			}
		}
	}

	drawKeyLinks(keyLinks);

//Prepare Data for Connecting Precedents to Precedents
	for(var i =0;i<data.length-1;i++){
		var thisArray = data[i].keywords;
		for(var l =i+1;l<data.length;l++){
			var thatArray = data[l].keywords;
			if(thisArray.length>0){
			 for(var j =0;j<thisArray.length;j++){
			 	for(var k =0;k<thatArray.length;k++){
			 		 if((thisArray[j]!=null) && (thisArray[j].name==thatArray[k].name)){

			 			links.push({"source" : data[i],"target":data[l],"keyword": thisArray[j].name,"weight": thisArray[j].weight});
			 			var removed = thisArray.splice(j,1);
				 		}
				 	}
				} 
			}	
		}				 		
	}

	drawLinks(links);

});


//Connect Keywords to Precedents
function drawKeyLinks(links) {
var diagonal = d3.svg.diagonal()
	.projection(function(d) { return [d.x, d.y]; });

  svg.selectAll(".keylink")
	  .data(links)
	  .enter()
	  .append("path")
	  .attr("class", "keylink")
	  .attr("d", diagonal)
	  .style("stroke-width",2)
      .style("stroke", function(d) { return color(cValue(d.source));}) 
	  ;

 }


//Connect Precedents to Precedents
function drawLinks(links) {
    var radians = d3.scale.linear()
        .range([1.5*Math.PI, 2.5*Math.PI]);

    var arc = d3.svg.line.radial()
        .interpolate("basis")
        .tension(0)
        .angle(function(d) { return radians(d); });

 
    svg.selectAll(".link")
        .data(links)
        .enter()
        .append("path")
        .attr("class", "link")
        .attr("transform", function(d, i) {
            var xshift = d.source.x + (d.target.x - d.source.x) / 2;
            var yshift = d.source.y;
            return "translate(" + xshift + ", " + yshift + ")";
        })
        .attr("d", function(d, i) {
            var xdist = Math.abs(d.source.x - d.target.x);
            arc.radius(xdist / 2);
            var points = d3.range(0, Math.ceil(xdist / 3));

            radians.domain([0, points.length - 1]);
            return arc(points);
        })
        .style("stroke-width",function(d, i) {return 10*d.weight;})
        .style("stroke", function(d) { return color(cValue(d));}) 
        .on('mouseover', function(d) {
            d3.select(this)
                .transition().duration(300)
                .style('stroke-width', 20)
                .style('stroke-opacity', 1.0);
        })
        .on('mouseout', function() {
            d3.select(this)
                .transition().duration(300)
                .style('stroke-width', 4)
                .style('stroke-opacity', 0.5);
        })
        ;
}

