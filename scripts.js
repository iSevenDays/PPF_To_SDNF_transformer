var operations = {
	'^': '&&',
	'∧': '&&',
	'v': '||',
	'∨': '||',
	'!': '!',
	'¬': '!',
	'(': '(',
	')': ')',
	'=': '==',
	'↔': '==',
	'->': '^1||',
	'→': '^1||'
};

/**
* Проверяет содержится ли в массиве элемент elem
* @param elem элемент, который нужно проверить
* @return true, если в массиве содержится элемент elem
*/
Array.prototype.contains = function(elem) {
    for(var i=0; i<this.length; i++) 
        if(this[i] === elem)
			return true;
    return false;
};

/**
* Оставляет в массиве только уникальные элементы. Все остальные удаляются
*/
Array.prototype.unique = function() {
    var arr = [];
    for(var i=0; i<this.length; i++)
        if(!arr.contains(this[i]))
            arr.push(this[i]);
    return arr; 
}

/**
* Заменяет все вхождения строки token на строку newToken
* @param token искомая строка
* @param newToken то, на что нужно заменять искомую строку
* @return строка после обработки
*/
String.prototype.replaceAll = function(token, newToken){
    return this.split(token).join(newToken);
};

/**
* Преобразует число в строковую двоичную систему исчисления
* @param num исходное число
* @param len необходимая длина двоичной строки
* @return строка, представляющая из себя двоичную запись числа num длиной len
*/
function intToBinaryString(num, len){
	var str = num.toString(2);
	while (str.length < len)
		str = "0"+str;
	return str;
}

/**
* Разбирает выражение str и строит таблицу истинности
* @param str выражение
* @return {matrix: таблица истинности, vars: список переменных в выражении}
*/
function buildMatrix(str){
	//Получение всех переменных из выражения
	var vars = str.replace(/\s/g, '');
	for (op in operations)
		vars = vars.replaceAll(op, '');
	vars = vars.toUpperCase().split("").unique();
	
	//Преобразование выполняемого выражения
	var expr = str;
	for (op in operations)
		expr = expr.replaceAll(op, operations[op]);
	
	//Построение таблицы истинности
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

/**
* Подготавливает матрицу для создания СДНФ и СКНФ исключая повторяющиеся элементы. Аналогично методу Карт Карно.
* @param matrix исходная матрица
* @return сокращённая матрица, которая необходима для построения СДНФ и СКНФ
*/
function clearMatrix(matrix){
	var one = [];
	var zero = [];
	for (key in matrix)
		matrix[key] ? one.push(key) : zero.push(key);
	
	//Меняет 1 на 0 и наоборот в строке с номером pos
	var invertVal = function(orig, pos){
		if (orig.substr(pos, 1) == '1')
			return changeVal(orig, pos, '0');
		else
			return changeVal(orig, pos, '1');
	}
	
	//Изменяет символ в строке с определённым номером
	var changeVal = function(orig, pos, val){
		return orig.substr(0, pos) + val + orig.substr(pos+1);
	}
	
	//Рекурсивная функция сокращения
	var clear = function(arr){
		for (key in arr){
			//Пропускаем функции
			if (typeof(arr[key]) == "function")
				continue;
			
			key = arr[key];
			
			for (var i=0; i<key.length; i++){
				if (key.substr(i, 1) == '-')
					continue;
				if (arr.contains(invertVal(key, i))){
					delete arr[arr.indexOf(key)];
					delete arr[arr.indexOf(invertVal(key, i))];
					arr.push(changeVal(key, i, '-'));
					clear(arr);
					return;
				}
			}
		}
	};
	
	clear(one);
	clear(zero);
	
	matrix = {};
	for (var i=0; i<one.length; i++)
		matrix[one[i]] = true;
	for (var i=0; i<zero.length; i++)
		matrix[zero[i]] = false;
	return matrix;
}

/**
* Проверяет ключ на валидность
* @param n ключ, который нужно проверить
* @return true, если ключ подходит для обработки
*/
function isKeyValid(n){
	return /^[0-9-]*$/.test(n);
}

/**
* Строит СДНФ по заданной матрице и переменным
* @param vars массив с названием переменных
* @param matrix таблица истинности
* @return Совершенная дизъюнктивная нормальная форма
*/
function getSDNF(vars, matrix){
	matrix = clearMatrix(matrix);
	var result = '';
	for (key in matrix){
		//Отсеиваем только нужные ключи
		if (key.length === vars.length && isKeyValid(key) && matrix[key] === true){
			result += '(';
			
			//Проходимся по всем переменным и смотрим нужно ли их выводить
			for (var i=0; i<vars.length; i++){
				if (key.substr(i, 1) == '-')
					continue;
				if (i > 0)
					result += ' ^ ';
				if (key.substr(i, 1) == '0')
					result += '!';
				result += vars[i];
			}
			result += ') v ';
		}
	}
	//Обрезаем лишние куски формулы
	if (result.length > 0)
		result = result.substr(0, result.length-3);
	return result;
}

/**
* Строит СКНФ по заданной матрице и переменным
* @param vars массив с названием переменных
* @param matrix таблица истинности
* @return Совершенная конъюнктивная нормальная форма
*/
function getSKNF(vars, matrix){
	matrix = clearMatrix(matrix);
	var result = '';
	for (key in matrix){
		if (key.length === vars.length && isKeyValid(key) && matrix[key] === false){
			result += '(';
			var flag = false;
			for (var i=0; i<vars.length; i++){
				if (key.substr(i, 1) == '-')
					continue;
				if (flag)
					result += ' v ';
				if (key.substr(i, 1) == '1')
					result += '!';
				result += vars[i];
				flag = true;
			}
			result += ') ^ ';
		}
	}
	if (result.length > 0)
		result = result.substr(0, result.length-3);
	return result;
}