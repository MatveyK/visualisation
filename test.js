var widthClient = window.innerWidth;
var heightClient = window.innerHeight;
var links = [];
var keyLinks = [];

var cValue = function(data) {
    return data.keyword;
}
var color = d3.scale.category10();

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

    var keySet = topK;

    var widthInterval = width/data.length;
    var heightInterval = 3.25*height/5;

    //Display rectangles with images and data


    var dataNode = svg.selectAll(".dataNode")
        .data(data)
        .enter()
        .append("g")
        .attr("class", "dataNode");


    dataNode.append("image")
        .attr("xlink:href", function(data) {
            return "img/" + data.imgUrl;
        })
        .attr("x", function(data, i) {
            data.x = i*widthInterval + 0.5*widthInterval;
            return i * widthInterval;
        })
        .attr("y", function(data, i) {
            data.y = heightInterval;
            return data.y;
        })
        .attr("width", widthInterval)
        .attr("height", 100)
        .on("mouseover", function() {
            d3.select(this).transition().duration(200)
                .attr("width", 500)
                .attr("height", 500)
                .attr("y", heightInterval - 250)
        })
        .on("mouseout", function() {
            d3.select(this).transition().duration(200)
                .attr("width", widthInterval)
                .attr("height", 100)
                .attr("y", heightInterval)
        })
        ;

    //Prepare keyWords
    svg.selectAll(".keywords")
        .data(keySet)
        .enter()
        .append("text")
        .attr("class", "keywords")
        .attr("x", function(data, i) {
            data.x = i*width/keySet.length;
            return data.x + 10;
        })
        .attr("y", function(data) {
            data.y = height - 20;
            return data.y;
        })
        .style("fill", function(data) {
            return color(cValue(data));
        })
        .style("font-size", 24)
        .text(function(data) {
            return data.keyword;
        })
        .on("mouseover", function(data) {
            d3.select(this).transition().duration(200)
                .style("font-size", 28);

            var id = "#" + cValue(data).toLowerCase().replace(/\s/g, '').replace(/[0-9]/g, '');
            d3.selectAll(id).transition().duration(200)
                .style("stroke-width", 7)
                .style("stroke-opacity", 1.0)
        })
        .on("mouseout", function(data) {
            d3.select(this).transition().duration(200)
                .style("font-size", 24);

            var id = "#" + cValue(data).toLowerCase().replace(/\s/g, '').replace(/[0-9]/g, '');
            d3.selectAll(id).transition().duration(200)
                .style("stroke-width", 3)
                .style("stroke-opacity", 0.2)
        })
        ;

   // Connect keywords to images
   for(var i = 0; i < keySet.length; i++) {
       for(var j = 0; j < data.length; j++) {
           var keywordArray = data[j].keywords;

           for(var k = 0; k < keywordArray.length; k++) {
               if(keySet[i].keyword == keywordArray[k].name) {
                   var pathData = jQuery.extend(true, {}, data[j]);
                   pathData.y += 100;
                   keyLinks.push({
                       "source": keySet[i], 
                       "target": pathData, 
                       });
               }
           }
       }
   }

   drawKeyLinks(keyLinks);
});

function drawKeyLinks(keyLinks) {
    var diagonal = d3.svg.diagonal()
        .projection(function(data) {
            return [data.x, data.y];
        });

    svg.selectAll(".keyPath")
        .data(keyLinks)
        .enter()
        .append("path")
        .attr("class", "keyPath")
        .attr("id", function(data) {
            return cValue(data.source).toLowerCase().replace(/\s/g, '').replace(/[0-9]/g, '');
        })
        .attr("d", diagonal)
        .style("stroke-width", 3)
        .style("stroke", function(data) {
            return color(cValue(data.source));
        })
        .style("fill", "none")
        .style("stroke-opacity", 0.2)
        .on("mouseover", function(data) {
            var id = "#" + cValue(data.source).toLowerCase().replace(/\s/g, '').replace(/[0-9]/g, '');
            d3.selectAll(id).transition().duration(200)
                .style("stroke-width", 7)
                .style("stroke-opacity", 1.0)
        })
        .on("mouseout", function(data) {
            var id = "#" + cValue(data.source).toLowerCase().replace(/\s/g, '').replace(/[0-9]/g, '');
            d3.selectAll(id).transition().duration(200)
                .style("stroke-width", 3)
                .style("stroke-opacity", 0.2)
        })
        ;
}
