var operations = {
	'^': '&&',
	'v': '||',
	'!': '!',
	'(': '(',
	')': ')',
	'=': '==',
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
String.prototype.replaceAll = function(token, newToken){
    return this.split(token).join(newToken);
};

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
		vars = vars.replaceAll(op, '');
	vars = vars.toUpperCase().split("").unique();
	
	//Построение выполняемого выражения
	var expr = str;
	for (op in operations)
		expr = expr.replaceAll(op, operations[op]);
	
	var matrix = [];
	var size = Math.pow(2, vars.length);
	for (var i=0; i<size; i++){
		var bin = intToBinaryString(i, vars.length);
		var currExpr = expr;
		for (var j=0; j<vars.length; j++)
			currExpr = currExpr.replaceAll(vars[j], (bin.substr(j, 1) == '1').toString());
		matrix[bin] = eval(currExpr);
	}
	
	return {
		matrix: matrix,
		vars: vars.sort()
	};
}

function getSDNF(vars, matrix){
	var result = '';
	for (key in matrix){
		if (matrix[key] === true){
			result += '(';
			for (var i=0; i<vars.length; i++){
				if (i > 0)
					result += '^';
				if (key.substr(i, 1) == '0')
					result += '!';
				result += vars[i];
			}
			result += ')v';
		}
	}
	if (result.length > 0)
		result = result.substr(0, result.length-1);
	return result;
}

function getSKNF(vars, matrix){
	var result = '';
	for (key in matrix){
		if (matrix[key] === false){
			result += '(';
			for (var i=0; i<vars.length; i++){
				if (i > 0)
					result += 'v';
				if (key.substr(i, 1) == '1')
					result += '!';
				result += vars[i];
			}
			result += ')^';
		}
	}
	if (result.length > 0)
		result = result.substr(0, result.length-1);
	return result;
}

var result = buildMatrix('A^BvC');
for (key in result.matrix)
	if (typeof(result.matrix[key]) != "function")
		console.log(key+' => '+result.matrix[key]);

console.log("SDNF: "+getSDNF(result.vars, result.matrix));
