// ------------------ Smovengo Structures -------------------------

// Station Information
tuple StationInfo {
	string stationId;
	float lat;
	float lon;
	int capacity;
	string stationCode;
	string name;
}


// Station Status
tuple StationStatus {
	string stationId;
	int numBikesAvailable;
	int numDocksAvailable;
	int is_returning;
}

// Think to a structure useful for the problem you have to solve
// You don't have necessarily to retreive all pieces of information 
// provided by smovengo but only what is essentiel for the problem 
// to be solved