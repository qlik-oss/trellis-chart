// Get the max in json array
export function getMax(arr, prop) {
  var max;
  for (var i=0 ; i<arr.length ; i++) {
    if (!max || parseInt(arr[i][prop]) > parseInt(max[prop]))
      max = arr[i];
  }
  return max;
}

export function isNumber(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

export function getNearestXth(n){ //find the nearest 10th, 100th, 1000th... + Adjsutment 10% for axis Scale
  const l = Math.floor(n).length;
  const rounded = Math.round(n/10^l)*10^l+10^(l-1);
  return rounded;
}

export function getScaleAndPrecision(x) {
  x = parseFloat(x).toFixed(3) + "";
  var scale = x.indexOf(".");
  if (scale == -1) return null;
  return {
    scale : scale,
    precision : x.length - scale - 1
  };
}
