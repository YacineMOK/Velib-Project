/*********************************************
 * Generic main bloc for displaying the first found solution 
 * and displaying the total number of solutions
 *********************************************/
 
main {
    cpt = 0;                // compteur pour compter le nb de solutions
    thisOplModel.generate();
    cp.startNewSearch();
    if (cp.next()){     // Affiche la premiere solution
        thisOplModel.postProcess();
        cpt+=1;
    }
    while(cp.next())    // Compte le nb de solutions
        cpt+=1;     
    
    writeln("---> Nous avons ", cpt, " differentes solutions."); 
}
