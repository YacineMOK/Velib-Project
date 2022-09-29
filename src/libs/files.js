// ------------------ Function on files -----------------

/* Reads the content of a file and returns its content as a string
 */
function file_to_string(file) {
	var f = new IloOplInputFile(file);
    if (f.exists) {
 //     writeln("Reading file : ", fichier );
      var s = "";
      while (!f.eof) {
        s = s  + f.readline() +"\n";
      }
      f.close();	// Fermeture fichier instance
    }
    else
      writeln("\nWARNING : the file ", file," doesn't exist");
	return s;
}


/* Saves the string aString into a file corresponding to filePath
 * Don't overwrite filePath if it exists and issue a warning in this case
 */ 
function save_string_to_file(filePath,aString) {
	var f = new IloOplOutputFile(filePath);
    if (f.exists) {
      writeln("\nWARNING : the file ", filePath ," already exist !\n Original file preserved");
    //     writeln("Reading file : ", fichier );
    }
    else {
    	f.writeln(aString);
      	f.close();	// Fermeture fichier instance
    }
}


/* extract fileName from a full or relative filepath
 */ 
function file_base_name(filePath) {
 	var beginPos = filePath.lastIndexOf("/");
	if (beginPos == -1)
		beginPos = 0;
	else
		beginPos++;
	return(filePath.substring(beginPos));
}

/* extract fileName from a full or relative filepath (without its extension)
 */ 
function file_base_name_without_extension(filePath) {
 	var file_bn = file_base_name(filePath);
	var extensionPos = file_bn.lastIndexOf(".");
	if (extensionPos == -1)
		extensionPos = file_bn.length;
	return(file_bn.substring(0,extensionPos));
}
