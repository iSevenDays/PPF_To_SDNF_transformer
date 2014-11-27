var operations = {
	'^': '&&',
	'∧': '&&',
	'|': '^1||!',
	'v': '||',
	'∨': '||',
	'!': '!',
	'¬': '!',
	'(': '(',
	')': ')',
	'=': '==',
	'↔': '==',
	'->': '^1||',
	'→': '^1||',
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
* Конструктор преобразователя
* @param str ППФ
* @return преобразователь, соответствующий вырежению str
*/
function Transformer(str) {
	/**
	* Проверяет ключ на валидность
	* @param n ключ, который нужно проверить
	* @return true, если ключ подходит для обработки
	*/
	this._isKeyValid = function (n){
		return /^[0-9-]*$/.test(n);
	}
	
	/**
	* Строит СДНФ по заданной матрице и переменным
	* @return Совершенная дизъюнктивная нормальная форма
	*/
	this.getSDNF = function(){
		var matrix = this.clearing ? this._clearMatrix() : this.matrix;
		var result = '';
		for (key in matrix){
			//Отсеиваем только нужные ключи
			if (key.length === this.vars.length && this._isKeyValid(key) && matrix[key] === true){
				result += '(';
				
				//Проходимся по всем переменным и смотрим нужно ли их выводить
				var flag = false;
				for (var i=0; i<this.vars.length; i++){
					if (key.substr(i, 1) == '-')
						continue;
					if (flag)
						result += ' ^ ';
					if (key.substr(i, 1) == '0')
						result += '!';
					result += this.vars[i];
					flag = true;
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
	* @return Совершенная конъюнктивная нормальная форма
	*/
	this.getSKNF = function(){
		var matrix = this.clearing ? this._clearMatrix() : this.matrix;
		var result = '';
		for (key in matrix){
			if (key.length === this.vars.length && this._isKeyValid(key) && matrix[key] === false){
				result += '(';
				var flag = false;
				for (var i=0; i<this.vars.length; i++){
					if (key.substr(i, 1) == '-')
						continue;
					if (flag)
						result += ' v ';
					if (key.substr(i, 1) == '1')
						result += '!';
					result += this.vars[i];
					flag = true;
				}
				result += ') ^ ';
			}
		}
		if (result.length > 0)
			result = result.substr(0, result.length-3);
		return result;
	}

	/**
	* Подготавливает матрицу для создания СДНФ и СКНФ исключая повторяющиеся элементы. Аналогично методу Карт Карно.
	* @param matrix исходная матрица
	* @return сокращённая матрица, которая необходима для построения СДНФ и СКНФ
	*/
	this._clearMatrix = function(){
		var one = [];
		var zero = [];
		for (key in this.matrix)
			this.matrix[key] ? one.push(key) : zero.push(key);
		
		//Изменяет символ в строке с определённым номером
		var changeVal = function(orig, pos, val){
			return orig.substr(0, pos) + val + orig.substr(pos+1);
		}
		
		//Меняет 1 на 0 и наоборот в строке с номером pos
		var invertVal = function(orig, pos){
			if (orig.substr(pos, 1) == '1')
				return changeVal(orig, pos, '0');
			else
				return changeVal(orig, pos, '1');
		}
		
		//Рекурсивная функция сокращения
		var clear = function(arr){
			for (_key in arr){
				//Пропускаем функции
				if (typeof(arr[_key]) == "function")
					continue;
				
				key = arr[_key];
				
				for (var i=0; i<key.length; i++){
					if (key.substr(i, 1) == '-')
						continue;
					var index = arr.indexOf(invertVal(key, i));
					if (index != -1){
						delete arr[_key];
						delete arr[index];
						arr.push(changeVal(key, i, '-'));
						clear(arr);
						return;
					}
				}
			}
		};
		
		clear(one);
		clear(zero);
		
		var matrix = {};
		for (var i=0; i<one.length; i++)
			matrix[one[i]] = true;
		for (var i=0; i<zero.length; i++)
			matrix[zero[i]] = false;
		
		this._clearMatrix = function(){
			return matrix;
		}
		
		return matrix;
	}
	
	/**
	* Преобразует число в строковую двоичную систему исчисления
	* @param num исходное число
	* @param len необходимая длина двоичной строки
	* @return строка, представляющая из себя двоичную запись числа num длиной len
	*/
	this._intToBinaryString = function(num, len){
		var str = num.toString(2);
		while (str.length < len)
			str = "0"+str;
		return str;
	}
	
	/**
	* Возвращает таблицу истинности для заданного выражения
	* @return таблица истинности
	*/
	this.getMatrix = function(){
		return this.matrix;
	}
	
	this.clearing = false;
	
	this.expression = str;
	
	//Получение всех переменных из выражения
	this.vars = str.replace(/\s/g, '');
	for (op in operations)
		this.vars = this.vars.replaceAll(op, '');
	this.vars = this.vars.toUpperCase().split("").unique().sort();
	
	//Преобразование выполняемого выражения
	var expr = this.expression;
	for (op in operations)
		expr = expr.replaceAll(op, operations[op]);
	expr = expr.replaceAll('!!', '');
	
	//Построение таблицы истинности
	this.matrix = [];
	var size = Math.pow(2, this.vars.length);
	for (var i=0; i<size; i++){
		var bin = this._intToBinaryString(i, this.vars.length);
		var currExpr = expr;
		for (var j=0; j<this.vars.length; j++)
			currExpr = currExpr.replaceAll(this.vars[j], (bin.substr(j, 1) == '1').toString());
		this.matrix[bin] = eval(currExpr);
	}
	
	return this;
};

//A^(Bv!C)^D^FvG^!(AvHvI)->((!L^M)|(Y->O))