var operations = {
	'^': '&&',
	'v': '||'
};

Array.prototype.contains = function(v) {
    for(var i = 0; i < this.length; i++) {
        if(this[i] === v) return true;
    }
    return false;
};
Array.prototype.unique = function() {
    var arr = [];
    for(var i = 0; i < this.length; i++) {
        if(!arr.contains(this[i])) {
            arr.push(this[i]);
        }
    }
    return arr; 
}

function intToBinaryString(num, len){
	var str = num.toString(2);
	while (str.length < len)
		str = "0"+str;
	return str;
}

function buildMatrix(str){
	//Получение всех переменных из выражения
	var vars = str;
	for (op in operations)
		vars = vars.replace(op, '');
	vars = vars.split("").unique();
	
	//Построение исполнябельного выражения
	var expr = str;
	for (op in operations)
		expr = expr.replace(op, operations[op]);
	
	var matrix = [];
	var size = Math.pow(2, vars.length);
	for (var i=0; i<size; i++){
		var bin = intToBinaryString(i, vars.length);
		var currExpr = expr;
		for (var j=0; j<vars.length; j++)
			currExpr = currExpr.replace(vars[j], (bin.substr(j, 1) == '1').toString());
		matrix[bin] = eval(currExpr);
	}
	
	return matrix;
}

var matrix = buildMatrix('A^BvC');
for (key in matrix)
	console.log(key+' => '+matrix[key]);