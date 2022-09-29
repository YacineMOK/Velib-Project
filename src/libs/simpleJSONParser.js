// ------------------ Functions for basic JSON format parsing -----------------
// not fully compliant but enough for what we need

/*
JSON documents contain only two types of structures :
	- objects (sets of  key:value pairs ) : { .... } ;
	- ordered lists of values : [ .... ]
Keys are strings :
Values can be :
	- objects 
	- ordered lists
	- boolean
	- numbers
	- strings
	- the null value
*/

// Parses a JSON string s and represent its content using structered Objects
// Sequences are converted to EmacsScript Arrays
// Structures are converted to EmacsScript Objects
// ****  Note : this assumes that no "}" appear within a string ****
// ****  Note : this assumes that no "]" appear within a string ****

function parseSimpleJSON(s) {
	// Assumes that s is a string encoding a JSON Object
	// Note : we assume the strings objects do not contain escaped characters
	var i = 0;
	var cAti = s.charAt(i);
	var result;
	var j;
	if (cAti == "[") {   // Ordered list of values
		j = s.lastIndexOf("]");  // Assuming not within a string
		result = new Array();
		parseArrayElements(s,i+1,j-1,result);
	} 
	else if (cAti == "{") {	// An object (set of key:value pairs)
		j = s.lastIndexOf("}");  // Assuming not within a string
		result = new Object();
		parseKeyValuesElements(s,i+1,j-1,result);
	} else {
		writeln("ERROR : in parseSimpleJSON function : invalid JSON string : \n" + s);
		fail();
	}
	return result;
}

// Parses the substring of s between positions i and j (included) 
// for the content of a Sequences (i.e. either no Elt, a single Elt or a sequence Elt[,Elt]* )
// Discovered elements are added to the Array a
function parseArrayElements(s,i,j,a){
//    writeln("DEBUG [parseArrayElements] : ", "between ",i,",",j,"  substring = ",s.substring(i,j+1));	
	// elements can be boolean, strings, numbers, arrays or objects or the null value
	var index = 0;
	i = pos_of_next_visible_char(s,i,j);
	while (i<=j) { // The array is not empty
		// find end position the element beginning in i
		var res = findNextEltAndItsPosition(s,i,j);
		a[index] = res.val,
		i = pos_of_next_visible_char(s,res.pos + 1,j);
		if (i < j && s.charAt(i) =="," ){
			i++;
			index++;
		}
//    writeln("DEBUG [parseArrayElements] : Exit a = ",a.toString);	
	}
}

// Parses string s between position i and j (included) for contents of Structures 
// (i.e. either nothing, one pair Key:Value  or a sequence Key:Value[,Key:Value]* )
// Discovered Key:Valuee pairs are added as properties to the Object o
function parseKeyValuesElements(s,i,j,o){
//    writeln("DEBUG [parseKeyValuesElements] : ", "between ",i,",",j,"  s = ",s);	
    i = pos_of_next_visible_char(s,i,j); // skip invisible
	while (i<j) {  // The object is not empty
		// reading one key:value
		var nextElt = findNextEltAndItsPosition(s,i,j);	
		var key = nextElt.val;
		//var key = key.substring(1,key.length-1);
		
		if (typeof key  != "string") {	// key should be a string
			writeln("ERROR [parseKeyValuesElements] : invalid key at pos ", i, " in \n" + s);
			fail();
		} else {	// key is a string
			i = nextElt.pos+1;
			i = pos_of_next_visible_char(s,i,j);
			if (s.charAt(i) != ":") { // invalid separator
				writeln("ERROR [parseKeyValuesElements] : unfound key/value separator : after ", key, " in " + s + "\n");
				fail();
			} else { // correct separator
				i++; // skip ":" char
				var followingElt = findNextEltAndItsPosition(s,i,j);
				if (key.charAt(0) == "\"" && key.charAt(key.length-1) == "\"" )	{
					key = key.substring(1,key.length-1);  // remove quotes at begin and end
				}
				// writeln("DEBUG [parseKeyValuesElements] : followingElt.val = ",followingElt.val);					
				o[key] = followingElt.val; // storing value for key in object o
//				writeln("DEBUG [parseKeyValuesElements] : i = pos_of_next_visible_char(s,followingElt.pos + 1,j); ")
				i = followingElt.pos + 1;
//				writeln("DEBUG [parseKeyValuesElements] : END i : ",i," Char c =  ",s.charAt(i)," ",s.charCodeAt(i) )
				if (i<j)
					i = pos_of_next_visible_char(s,i,j);
				if (s.charAt(i) == ",") {
					i++;						// moving to the next pair (skipping ",")
				} else if (i < j) { 
//					writeln("DEBUG [parseKeyValuesElements] : char c =  ",s.charAt(i)," ",s.charCodeAt(i));
//					writeln("DEBUG [parseKeyValuesElements] : ", "c = ",c.toInt," i = ",i,", h = j",j,"  s = ",s);
					fail();
				};
			}
		}
//		writeln("DEBUG [parseKeyValuesElements] Exit : i,j= ",i,",",j);	

	}
}


// Parses the string s, between position i and j, to find the value of an element
// and returns it as a Object gathering both the element itself and the index in s
// corresponding to the position of the last char in s of the found element.
function findNextEltAndItsPosition(s,i,j){
//	writeln("DEBUG : calling [findNextEltAndItsPosition] on substring " + i + "," + j + " of "+ s.substring(i,j));
	// elements can be boolean, strings, numbers, arrays or objects or the null value
	var result = new Object();
	var pos = pos_of_next_visible_char(s,i,j); // skip possible spacing
	i = pos;
	var c = s.charAt(pos);
//	writeln("DEBUG :  [findNextEltAndItsPosition] c = >", c, "< a pos = ",pos);
	//------
	if (c == "[") {	// Case of Sequence --> converted to an Array
		var anArray = new Array();
		var sqbCounter = 1;
		while (sqbCounter != 0) {
			pos++;
			if (s.charAt(pos) == "[")
				sqbCounter++;
			else if (s.charAt(pos) == "]")
				sqbCounter--;
		}	// ****  Note : this assumes that no square bracket appear within a string****  
		parseArrayElements(s,i+1,pos-1,anArray)
		result.val = anArray;
		result.pos = pos;
	//------
	} else if (c == "{") {	// Case of a Structure --> Converted to an Object
		var anObject = new Object();
		var bCounter = 1;
		while (bCounter !=0) {
			pos++;
			if (s.charAt(pos) == "{")
				bCounter++;
			else if (s.charAt(pos) == "}")
				bCounter--;
		} // ****  Note : this assumes that no "}"  appear within a string ****
		parseKeyValuesElements(s,i+1,pos-1,anObject);
		result.val = anObject;
		result.pos = pos;		
	//------
	} else if (c == "\"") {	// Case of a string beginning
				// One has to check if this is an escaped double quote
		pos = s.indexOf("\"",pos+1);  // next double quote from position pos1+1
		  // except if escaped... otherwise the next non escaped double quote
		while ((s.charAt(pos-1) == "\\") && (s.charAt(pos-2) != "\\"))
			// case of an escaped code (and the backslash itself is not escaped)
			pos = s.indexOf("\"",pos+1);
//		result.val = s.substring(i,pos+1);
		result.val = s.substring(i+1,pos);
		result.pos = pos;
//		writeln("DEBUG :  [findNextEltAndItsPosition] found string  " + result.val);
	//------
	} else if (s.indexOf("true",pos) == pos) {  // Case of the boolean true
		result.val = true;
		result.pos = pos+3;
	//------
	} else if (s.indexOf("false",pos) == pos) {// Case of the boolean false
		result.val = false;
		result.pos = pos+4;
	//------
	} else if (s.indexOf("null",pos) == pos) { // Case of null
		result.val = null;
		result.pos = pos+3;
	//------
	} else {  // A number... or an error
		var cd = s.charCodeAt(pos);
		if (isSign(cd)  || isDigit(cd)) {	// Could be a number 
			if (isSign(cd)) {	// begins with a sign
				pos++;
				cd = charCodeAt(pos);
			}
			while(isDigit(cd)) { // skip digit
				pos++;
				cd = s.charCodeAt(pos);
			}
			//
			if (cd == 46) { //  code of "." - => decimal point  or error 
				pos++;
				cd = s.charCodeAt(pos);
				if (isDigit(cd)) { // beginning of decimal Part
					while (isDigit(cd)) {
						pos++;
						cd = s.charCodeAt(pos);
					} // end of decimal part
					// optional exponent part
					if ( isExponentCode(cd) ) {  
						 if (   isDigit(s.charCodeAt(pos+1)) 
						     && isDigit(s.charCodeAt(pos+2)) )
						 		pos = pos+3;
						 else { // Bad exponent description
							writeln("ERROR [findNextEltAndItsPosition] : incorrect exponent in number at pos "+ i + " in \n",s);
							fail();
						 }
					}
				} 
				else { // Bad decimal part description
					writeln("ERROR [findNextEltAndItsPosition] : incorrect (decimal) number at pos "+ i + " in \n",s);
					fail();
				}
			}
			
			result.val = eval(s.substring(i,pos)); // Evaluate the number
			result.pos = pos-1;
	//------
		} else { if (i < j)
					writeln("ERROR [findNextEltAndItsPosition] : incorrect JSON element at pos "+ i + " in \n",s);
					fail();
		}
	}
// 	writeln("DEBUG : exit [findNextEltAndItsPosition] : j =  ",j, " result.val = ", result.val, " result.pos = ", result.pos);
	return result;
}

// checks if ascii code corresponds to a digit
function isDigit(code) {
	return (code >=48 && code <= 59)  // 0 1 2 3 4 5 6 7 8 9
}

// checks if ascii code corresponds to a sign
function isSign(code) {
	return (code == 45 || code == 443)  // - +
}

// checks if ascii code corresponds to a char for a number exponent
function isExponentCode(code) {
	return (code == 69 || code == 101)  // E e
}





// Serializes an emacsScript object as a JSON string 
//  (except for the property "toString" which is discarded)
function value2JSON(v) {
	if (typeof v == "undefined") {
		writeln ("ERROR : only defined structures can be converted to JSON format");
		fail();
	} else {
		var result = "";
		if (v == true || v == false  || v == null || typeof v == "number")
			result = result + v;
		else if (typeof v == "string")
			//result = result + "\"" + v + "\"";
			result = result + v ;
		else if (typeof v == "object") { // object or array
			var vl = v.length;
			if (vl == "undefined") { // v is an object
				var keyValueArray = new Array();
				var index = 0;
				for (key in v ) 
					if (key != "toString"){			
						keyValueArray[index] = key + ":" + value2JSON(v[key]);
						index++;
					}
				result = result + "{" + keyValueArray.join(",") + "}";
			} else { // v is an array
				result = result + "[";
				if (vl > 0) {
					result = result + value2JSON(v[0]); 
					for (var i = 1 ; i < vl;i++) 
						result = result + "," + value2JSON(v[i]);
				}
				result = result + "]";
			}
		}
	}
	return result;
}

function indent_write(v,indent) {
		for (var i = 0; i < indent; i++)
			write(" ");
		write(v);
}

	// return
function pos_of_next_visible_char(s,i,j) {
	var c = s.charAt(i);
	while (i<=j && (c == "\n" || c == " " || c == "\t" || c == "\r" || c == "\f" || c == "\b") ) { // ignore non printable caracters
		i++;
		c = s.charAt(i);
	}
	return i;

}


function indent_writeln(v,indent) {
		indent_write(v,indent);
		write("\n");
}

// writes an object recursively as a tree (useful for Objects inspection)
function displayTree(v,indent) {
if (typeof indent == "undefined")
		indent = 4;
	var t = typeof v;
	if (  t == "boolean" 
		|| t == "string" 
		|| t == "number"
		|| t == "undefined" )
		write(v);	
	else if (t == "date") 
		write(v.toString());	
	else if (v == null) 	//caution : (typeof null) returns "object"
		write(v);	
	else if (t == "object") { // object or array
		var vl = v.length;
		if (vl == "undefined") { // v is an object
			indent_writeln("Object : {", indent);
			for (var key in v)  {
				indent_write("",indent+4)
				write(key," = ");
				displayTree(v[key],indent+4);
				writeln(",");
			}
			indent_write("}", indent);
		} else { // v is an array
			indent_write("Array : [", indent);
			if (vl > 0) {
				writeln()
				for (var i = 0 ; i < vl; i++)  {
					indent_write("",indent+4)
					displayTree(v[i],indent+4);
					writeln(",");
				}
				indent_write("]", indent);
			} else 
				write("]");
		}
	} else if (t == "function") 
		write("function");
	return;
}



		
		
		