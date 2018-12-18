import $ from 'jquery';
import d3 from './lib/d3.v3.min';
import dimple from './lib/dimple.v2.2.0.min';
import { getMax, isNumber, getNearestXth, getScaleAndPrecision } from './utilities';

var palette = [
  "#b0afae", "#7b7a78", "#545352", "#4477aa", "#7db8da", "#b6d7ea",
  "#46c646", "#f93f17", "#ffcf02", "#276e27","#ffffff", "#000000"
];

function drawChart(svg, data, options, w, h) {
  if(options.chartType !== "pie" ) {
    // Get Max of measures in order to scale the measure axis uniformly accross trellis
    var arrayPosMax1 = getMax(data, "measure1");
    var arrayPosMax2 = undefined;

    if(data.length == 4 && isNumber(data[3])) {
      arrayPosMax2 = getMax(data, "measure2");
    }

    let arrayMax;
    if(options.isStacked) {
      arrayMax = arrayPosMax1.measure1 + arrayPosMax2.measure2;
    } else {
      arrayMax = Math.max(arrayPosMax1.measure1, (!arrayPosMax2 ? 0 : arrayPosMax2.measure2) );
    }

    // Get the neareast rounded 10th, 100th, 1000th ...
    var maxMeasureAxis = getNearestXth(arrayMax);
  }

  // Get a unique list of dimensions values
  var xDim = dimple.getUniqueValues(data, "dim");
  var tDim = dimple.getUniqueValues(data, "trellis");

  // Set the bounds for the charts
  var row = 0,
    col = 0,
    top = options.trellisLabelSize/2 + 20,
    left = (options.chartOrientation == "horizontal" ? 100 : (options.chartType == "pie" ? 25 : 50)),
    inMarg = 50;


  var width = ((w-left) / Math.min(tDim.length, options.nCols)) - inMarg;
  var height = ((h-((options.chartType == "pie" ? 40 : 120)-inMarg)) / Math.min(tDim.length, options.nRows)) - inMarg ;
  var totalWidth = w;

  /* Create Color Palette from Qlik palette -----------------------------------------------------*/
  var qlikColor12 = [
    [ "#4477aa" ],
    [ "#4477aa", "#cc6677" ],
    [ "#4477aa", "#ddcc77", "#cc6677" ],
    [ "#4477aa", "#117733", "#ddcc77", "#cc6677" ],
    [ "#332288", "#88ccee", "#117733", "#ddcc77", "#cc6677" ],
    [ "#332288", "#88ccee", "#117733", "#ddcc77", "#cc6677", "#aa4499" ],
    [ "#332288", "#44aa99", "#88ccee", "#117733", "#ddcc77", "#cc6677", "#aa4499" ],
    [ "#332288", "#44aa99", "#88ccee", "#117733", "#999933", "#ddcc77", "#cc6677", "#aa4499" ],
    [ "#332288", "#44aa99", "#88ccee", "#117733", "#999933", "#ddcc77", "#cc6677", "#882255", "#aa4499" ],
    [ "#332288", "#44aa99", "#88ccee", "#117733", "#999933", "#ddcc77", "#661100", "#cc6677", "#882255", "#aa4499" ],
    [ "#332288", "#6699cc", "#44aa99", "#88ccee", "#117733", "#999933", "#ddcc77", "#661100", "#cc6677", "#882255", "#aa4499" ],
    [ "#332288", "#6699cc", "#88ccee", "#44aa99", "#117733", "#999933", "#ddcc77", "#661100", "#cc6677", "#aa4466", "#882255", "#aa4499" ]
  ];

  let colorPalette;

  // Force color by dimension for pie and ring charts
  if (options.chartType == "pie" || options.colorBy == "dimension" ) {
    var nDim = xDim.length - 1;
    var colorSet = qlikColor12[nDim];
  }
  else {
    if (options.colorBy == "single" && options.singleColor) {
      colorPalette = [
        new dimple.color(options.singleColor, options.singleColor, (options.chartType == "area" ? 0.5 : 0.8) )
      ];
    }
  }

  // Draw a chart for each of the trellis values ---------------------------------------------
  tDim.forEach(function (tDimValue) {
    // Wrap to the row above
    if (left + ((col + 1) * (width + inMarg)) > totalWidth) {
      row += 1;
      col = 0;
    }

    // Filter for the trellis in the iteration
    var chartData = dimple.filterData(data, "trellis", tDimValue);

    // Use d3 to draw a text label for the trellis
    if (options.trellisLabelPos == "inside") {
      svg
        .append("text")
        .attr("x", left + (col * (width + inMarg)) + width/2 )
        .attr("y", top + (row * (height+ inMarg)) + height/2 )
        .style("font-family", "sans-serif")
        .style("text-anchor", "middle")
        .style("alignment-baseline", "middle")
        .style("font-size", options.trellisLabelSize+"px")
        .style("font-weight", "bold")
        .style("opacity", 0.3)
        .text(chartData[0].trellis);
    }
    else {
      svg
        .append("text")
        .attr("x", left + (col * (width + inMarg)) + width/2 )
        .attr("y", top + (row * (height+ inMarg)) - Math.min(10, options.trellisLabelSize) )
        .style("font-family", "sans-serif")
        .style("text-anchor", "middle")
        .style("font-size", options.trellisLabelSize+"px")
        .style("font-weight", "bold")
        .style("opacity", 0.5)
        .text(chartData[0].trellis);
    }

    // Create a chart at the correct point in the trellis
    var myChart = new dimple.chart(svg, chartData);

    myChart.setBounds(
      left + (col * (width + inMarg)),
      top + (row * (height + inMarg)),
      width,
      height);

    if(options.chartType == "pie" ) {
      var p = myChart.addMeasureAxis("p", "measure1");
      p.addOrderRule("xDim");
    } else {
      if (options.chartOrientation == "vertical") {
        // Add x and fix ordering so that all charts are the same
        var x = myChart.addCategoryAxis("x", "dim");
        x.addOrderRule(xDim);

        // Add y and fix scale so that all charts are the same
        var y = myChart.addMeasureAxis("y", "measure1");
        y.overrideMax = maxMeasureAxis;
        y.showGridlines = options.showGrid;
        y.ticks = 5;
      }

      if (options.chartOrientation == "horizontal") {
        // Add x and fix ordering so that all charts are the same
        var y = myChart.addCategoryAxis("y", "dim");
        y.addOrderRule(xDim);

        // Add y and fix scale so that all charts are the same
        var x = myChart.addMeasureAxis("x", "measure1");
        x.overrideMax = maxMeasureAxis;
        x.showGridlines = options.showGrid;
        x.ticks = 5;
      }
    }

    // Assign persistent colors by Dimension
    if (options.chartType == "pie" || options.colorBy == "dimension" ) {
      var c=0;
      xDim.forEach(function(xDimValue){
        myChart.assignColor(xDimValue, colorSet[c], colorSet[c], 1);
        c += 1;
      });
    } else {
      myChart.defaultColors = colorPalette;
    }

    // Draw the bars.  Passing null here would draw all bars with
    // the same color.  Passing owner second colors by owner, which
    // is normally bad practice in a bar chart but works in a trellis.
    // Month is only passed here so that it shows in the tooltip.
    let s;
    switch(options.chartType){
      case "bar" :
        s = myChart.addSeries(["trellis", "dim"], dimple.plot.bar);
        break;
      case "line" :
        s = myChart.addSeries(null, dimple.plot.line);
        break;
      case "area" :
        s = myChart.addSeries(null, dimple.plot.area);
        break;
      case "lollipop" :
        s = myChart.addSeries(["trellis", "dim"], dimple.plot.area);
        break;
      case "pie" :
        s = myChart.addSeries(["trellis", "dim"], dimple.plot.pie);
        s.innerRadius = options.innerRadius+"%";
        break;
      case "step" :
        s = myChart.addSeries(null, dimple.plot.line);
        s.interpolation = "step";
    }

    // Handle Value on Data points , only display when size allows
    if (options.valueLabels && options.chartType !== "pie" ) {
      s.afterDraw = function (shape, data) {
        // Get the shape as a d3 selection
        var s = d3.select(shape),
          rect = {
            x: parseFloat(s.attr("x")),
            y: parseFloat(s.attr("y")),
            width: parseFloat(s.attr("width")),
            height: parseFloat(s.attr("height"))
          };
        if (rect.width > 20 && options.chartOrientation =="vertical") {
          svg.append("text")
            .attr("x", rect.x + rect.width / 2 )
            .attr("y", rect.y - 10)
            .style("text-anchor", "middle")
            .style("font-size", "10px")
            .style("font-family", "sans-serif")
            .style("opacity", 0.6)
          // Format the number
            .text(d3.format(",.1f")(data.yValue / 1000) );
        }
        if (rect.height > 10 && options.chartOrientation =="horizontal") {
          var xVal = getScaleAndPrecision(data.xValue);
          svg.append("text")
            .attr("x", rect.x + rect.width + 10 )
            .attr("y", rect.y + rect.height / 2)
            .style("text-anchor", "start")
            .style("font-size", "10px")
            .style("alignment-baseline", "middle")
            .style("font-family", "sans-serif")
            .style("opacity", 0.6)
          // Format the number
            .text(d3.format(",.1f")(data.xValue / (1000^(Math.max(Math.floor((xVal.scale-2)/3), 0)))) );
        }
      };
    }

    // Draw the chart
    myChart.draw();

    // Clean Axis Label and titles
    if (options.chartType !== "pie") {
      // Once drawn we can access the shapes
      // If this is not in the first column remove the y text
      if (col > 0 || options.measureLabelHide) {
        y.shapes.selectAll("text").remove();
      }
      // If this is not in the last row remove the x text
      if ((row < options.nRows-1 && (tDim.length / options.nCols) > row+1) || options.dimLabelHide) {
        x.shapes.selectAll("text").remove();
      }
      else {
        x.shapes.selectAll("text").style("font-size", "12px");
        x.shapes.selectAll("text").style("text-anchor", "end");
        x.shapes.selectAll("text").attr("transform", "translate(-5, 15) rotate(-40)");
      }
      // Remove the axis labels
      y.titleShape.remove();
      x.titleShape.remove();
    }

    // Move to the next column
    col += 1;
  });
}

function paint ($element, layout) {
  var qMatrix = layout.qHyperCube.qDataPages[0].qMatrix;

  // Create a new array for our extension with a row for each row in the qMatrix
  var data = qMatrix.map(function(e){
    var dataItem = {
      dim: e[0].qText,
      trellis: e[1].qText,
      measure1: e[2].qNum
    };
    if (e.length > 3) {
      dataItem.measure2 = e[3].qNum;
    }
    return dataItem;
  });

  var options = {
    nCols: layout.properties.trellis.nColumns,
    nRows: layout.properties.trellis.nRows,
    chartType: layout.properties.trellis.chartType,
    innerRadius: layout.properties.trellis.innerRadius,
    chartOrientation: layout.properties.trellis.chartOrientation,
    dimLabelHide: layout.properties.labels.hideDimensionLabel,
    measureLabelHide: layout.properties.labels.hideMeasureLabel,
    valueLabels: layout.properties.labels.valueLabels,
    colorBy: layout.properties.colors.colorBy,
    singleColor: palette[layout.properties.colors.singleColor],
    showGrid: layout.properties.trellis.showGrid,
    trellisLabelSize: layout.properties.labels.trellisLabelSize,
    trellisLabelPos: layout.properties.labels.trellisLabelPos
  };

  // Initialize div container to receive the SVG.
  var width = $element.width();
  var height = $element.height();
  var id = "container_" + layout.qInfo.qId;

  if(document.getElementById(id)) {
    $("#" + id).empty();
  }
  else {
    $element.append($('<div />').attr("id", id).width(width).height(height));
  }

  // Create SVG container  - this is analog to d3.select().append("svg")...
  var svg = dimple.newSvg("#" + id, width, height);

  drawChart(svg, data, options, width, height);
}

export default paint;
