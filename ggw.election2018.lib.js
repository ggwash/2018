function getRaceID(officedist,electioncycle) {
	var wasRaceFound = 0;
	if (electioncycle.length > 0) {
		for (var specificrace = 0; specificrace < electioncycle.length; specificrace++) {

			if (electioncycle[specificrace].race_name == officedist) {
				wasRaceFound = 1;
				return specificrace;
			}
		};
	};
	if (wasRaceFound == 0) {
		return -1;
	};
};

function getCandidateIDinVotes(candidate_name,specificrace) {
	var wasCandidateFound = 0;
	if (specificrace.length > 0) {
		for (var specificcandidate = 0; specificcandidate < specificrace.length; specificcandidate++) {

			if (specificrace[specificcandidate].name == candidate_name) {
				wasCandidateFound = 1;
				return specificcandidate;
			}
		};
	};
	if (wasCandidateFound == 0) {
		return -1;
	};
};

function getCandidateIDinBios(candidate_name,candidate_biodata) {
	var wasCandidateFound = 0;
	for (const specificcandidate in candidate_biodata) {
		if (candidate_name == candidate_biodata[specificcandidate].name) {
			wasCandidateFound = 1;
			return candidate_biodata[specificcandidate].candidate_id;
		};

	};
	if (wasCandidateFound == 0) {
		console.log("CANDIDATE " +candidate_name +" NOT FOUND IN CANONICAL DATA SOURCE!!!")
		return -1;
	};
};

function getCandidateIDfromResponse(queried_response_id, candidate_responses) {
	var wasResponseFound = 0;
	for (const specific_response in candidate_responses) {
//		console.log("Comparing Loop: "+candidate_responses[specific_response].response_id+ " with Parameter: "+queried_response_id);
		if (candidate_responses[specific_response].response_id == queried_response_id) {
			wasResponseFound = 1;
			return candidate_responses[specific_response].candidate_id;
		};
	};
	if (wasResponseFound == 0) {
		console.log("RESPONSE " +queried_response_id +" NOT FOUND IN CANONICAL DATA SOURCE!!!")
		return -1;
	};
};

function assemble_election_data(candidate_info, votes_committee, votes_noncommittee, candidate_responses, rating_instances) {
	var overall_presentations_by_id = [];
	var committee_presentations_by_id = [];
	var noncommittee_presentations_by_id = [];
	var val_overall_votes_by_id = [];
	var val_committee_votes_by_id = [];
	var val_noncommittee_votes_by_id = [];
	for (var candidate_num = 1; candidate_num <= 196; candidate_num++) {
		overall_presentations_by_id.push(0);
		committee_presentations_by_id.push(0);
		noncommittee_presentations_by_id.push(0);
		val_overall_votes_by_id.push(0);
		val_committee_votes_by_id.push(0);
		val_noncommittee_votes_by_id.push(0);
	};
	for (const current_rating_event in rating_instances) {
		   /* "fields": [
      "first",
      "last",
      "email",
      "jurisdiction",
      "subscribe",
      "ec_member",
      "ip",
      "response1_id",
      "response2_id",
      "sequence",
      "choice",
      "comments",
      "time_rated"
    ] */
    //	console.log(rating_instances);
   // 	console.log(candidate_responses);
   // 	console.log("Current rating event: "+current_rating_event);
   // 	console.log(rating_instances[current_rating_event]);
    	var response_id1_for_event = rating_instances[current_rating_event].response1_id;
    	var response_id2_for_event = rating_instances[current_rating_event].response2_id;
    	var committee_status_of_event = rating_instances[current_rating_event].ec_member;
    	if ((response_id1_for_event < rating_instances.length ) && (response_id2_for_event < rating_instances.length)) {
    		var candidate_id_of_response = getCandidateIDfromResponse(response_id1_for_event,candidate_responses);
			candidate_id_of_response--;
			overall_presentations_by_id[candidate_id_of_response]++;
			if (committee_status_of_event) {
				committee_presentations_by_id[candidate_id_of_response]++;	
			} else {
				noncommittee_presentations_by_id[candidate_id_of_response]++;
			}
			candidate_id_of_response = getCandidateIDfromResponse(response_id2_for_event,candidate_responses);
			candidate_id_of_response--;
			overall_presentations_by_id[candidate_id_of_response]++;
			if (committee_status_of_event) {
				committee_presentations_by_id[candidate_id_of_response]++;	
			} else {
				noncommittee_presentations_by_id[candidate_id_of_response]++;
			}
		};
		

	};
	//console.log(overall_presentations_by_id);
	var election_data = [];
	for (const race in votes_committee) {
	//	console.log(votes_committee[race]);
		var race_id = getRaceID(votes_committee[race].officedist,election_data);
		if (race_id == -1) {
			var new_race = {
				race_name	: " ",
				candidates 	: [],
				questions 	: [],
				evaluations : [],
			};

			election_data.push(new_race);
			race_id = election_data.length - 1;
			election_data[race_id].race_name = votes_committee[race].officedist;
	//		console.log("New Race: "+election_data[race_id].race_name);
		};
		var candidate_idnum = getCandidateIDinBios(votes_committee[race].name,candidate_info);
		var new_candidate = {
			name 				: votes_committee[race].name,
			id 					: candidate_idnum,
			num_overall 		: -1,
			num_committee 		: votes_committee[race].ontop,
			num_noncommittee 	: -1,
			val_num_overall		: -1,
			val_num_committee	: -1,
			val_num_noncommittee : -1,
			pc_overall			: -0.1,
			pc_committee		: -0.1,
			pc_noncommittee		: -0.1,
			overall_presentations : overall_presentations_by_id[(candidate_idnum -1)],
			committee_presentations : committee_presentations_by_id[(candidate_idnum -1)],
			noncommittee_presentations : noncommittee_presentations_by_id[(candidate_idnum -1)],

		};

		election_data[race_id].candidates.push(new_candidate);
//		console.log(new_candidate);

	};

	for (const race in votes_noncommittee) {
		var race_id = getRaceID(votes_noncommittee[race].officedist,election_data);
		if (race_id == -1) {
			var new_race = {
				race_name	: votes_noncommittee[race].officedist,
				candidates 	: [],
				questions 	: [],
				evaluations : [],
			};

			election_data.push(new_race);
			race_id = election_data.length - 1;
	//		console.log("New Race: "+election_data[race_id].race_name);
		};
		var candidate_id = getCandidateIDinVotes(votes_noncommittee[race].name,election_data[race_id].candidates);
		if (candidate_id == -1) {
			var candidate_idnum = getCandidateIDinBios(votes_committee[race].name,candidate_info);
			var new_candidate = {
				name 				: votes_noncommittee[race].name,
				id 					: candidate_idnum,
				num_overall 		: votes_noncommittee[race].ontop,
				num_committee 		: 0,
				num_noncommittee 	: votes_noncommittee[race].ontop,
			val_num_overall		: -1,
			val_num_committee	: -1,
			val_num_noncommittee : -1,
				pc_overall			: -0.1,
				pc_committee		: -0.1,
				pc_noncommittee		: -0.1,
				overall_presentations : overall_presentations_by_id[(candidate_idnum -1)],
				committee_presentations : committee_presentations_by_id[(candidate_idnum -1)],
				noncommittee_presentations : noncommittee_presentations_by_id[(candidate_idnum -1)],
			};
			election_data[race_id].candidates.push(new_candidate);
			candidate_id = election_data[race_id].candidates.length -1;
//			console.log("Race: "+election_data[race_id].race_name+" New Candidate: "+election_data[race_id].candidates[candidate_id].name);
		};
//		console.log("Race: "+election_data[race_id].race_name+" Current Candidate: "+election_data[race_id].candidates[candidate_id].name + " Adding " + votes_noncommittee[race].ontop + " to noncommittee vote totals");
		election_data[race_id].candidates[candidate_id].val_num_overall			= 
		election_data[race_id].candidates[candidate_id].val_num_committee 		= 
		election_data[race_id].candidates[candidate_id].val_num_noncommittee 	= 
		election_data[race_id].candidates[candidate_id].num_noncommittee = votes_noncommittee[race].ontop;
		election_data[race_id].candidates[candidate_id].num_overall = election_data[race_id].candidates[candidate_id].num_noncommittee + election_data[race_id].candidates[candidate_id].num_committee;
		election_data[race_id].candidates[candidate_id].pc_overall 		= (100 * election_data[race_id].candidates[candidate_id].num_overall) 		/ (election_data[race_id].candidates[candidate_id].overall_presentations);
		election_data[race_id].candidates[candidate_id].pc_committee 	= (100 * election_data[race_id].candidates[candidate_id].num_committee) 	/ (election_data[race_id].candidates[candidate_id].committee_presentations);
		election_data[race_id].candidates[candidate_id].pc_noncommittee	= (100 * election_data[race_id].candidates[candidate_id].num_noncommittee) 	/ (election_data[race_id].candidates[candidate_id].noncommittee_presentations);


	};
//	console.log("Votes totals incorporated, data frame status follows");
//	console.log(election_data);
	return election_data

};


/*
Assemble

Race
	Candidates
		per question percentages
		overall
		committee
		non-committee
	Questions
		label
		percentages
	Evaluations

*/
