/** @param {NS} ns */
export async function main(ns) {
	let task = ns.args[0];
	let cash = ns.getServerMoneyAvailable('home');

	switch (task) {
		case "shockRecovery":
			for (let i = 0; i < 8; i++) {
				ns.print('Setting sleeve ' + i + ' to Shock Recovery');
				ns.sleeve.setToShockRecovery(i);
			}
			//Statements executed when the
			//result of expression matches value1
			break;
		case "gangFarm":
			for (let i = 0; i < 8; i++) {
				ns.print('Setting sleeve ' + i + ' to Commit Homicide');
				ns.sleeve.setToCommitCrime(i, "Homicide");
			}
			break;

		case "crimeFarm":
			for (let i = 0; i < 8; i++) {
				ns.print('Setting sleeve ' + i + ' to Commit Heist');
				ns.sleeve.setToCommitCrime(i, "Heist");
			}
			break;

		case "trainCombat":
			for (let i = 0; i < 8; i++) {
				if (ns.sleeve.getInformation(i).city != 'Sector-12') {
					if (cash > 1_000_000) {
						ns.sleeve.travel(i, 'Sector-12');
					}
					else {
						ns.tprint('Sleeve ' + i + ' is not in Sector-12 and cash is tight, aborting training.');
						continue;
					}
				}

				const stats = ['Train Strength', 'Train Defense', 'Train Dexterity', 'Train Agility'];
				const statIndex = i % 4;

				ns.tprint('Sleeve ' + i + ' is starting to to ' + stats[statIndex] + ' at ' + 'Powerhouse Gym');
				ns.sleeve.setToGymWorkout(i, 'Powerhouse Gym', stats[statIndex]);
			}
			break;

		case "trainHack":
			for (let i = 0; i < 8; i++) {
				if (ns.sleeve.getInformation(i).city != 'Volhaven') {
					if (cash > 1_000_000) {
						ns.sleeve.travel(i, 'Volhaven');
					}
					else {
						ns.tprint('Sleeve ' + i + ' is not in Volhaven and cash is tight, aborting study.');
						continue;
					}
				}

				ns.tprint('Sleeve ' + i + ' is starting to study Algorithms at ZB Institute of Technology');
				ns.sleeve.setToUniversityCourse(i, 'ZB Institute of Technology', "Algorithms");
			}
			break;

		case "trainCha":
			for (let i = 0; i < 8; i++) {
				if (ns.sleeve.getInformation(i).city != 'Volhaven') {
					if (cash > 1_000_000) {
						ns.sleeve.travel(i, 'Volhaven');
					}
					else {
						ns.tprint('Sleeve ' + i + ' is not in Volhaven and cash is tight, aborting study.');
						continue;
					}
				}

				ns.tprint('Sleeve ' + i + ' is starting to study Leadership at ZB Institute of Technology');
				ns.sleeve.setToUniversityCourse(i, 'ZB Institute of Technology', "Leadership");
			}
			break;
		/*
				case "corpJob":
				//preconditions: hacking 250+, cha 100+, fuckton'o'augs
					const corps = [
						"MegaCorp", //Sector-12 | megacorp
						"Blade Industries", //Sector-12 | blade 
						"Four Sigma", //Sector-12 | 4sigma      
		
						"NWO", //Volhaven | nwo
						"OmniTek Incorporated", //Volhaven | omnitek     
		
						"Bachman & Associates", //Aevum | ~none~
						"Clarke Incorporated", //Aevum | clarkinc                
						"Fulcrum Technologies", //Aevum | fulcrumassets, fulcrumtech 
						"ECorp", //Aevum | ecorp
		
						"KuaiGong International" //Chongqing | kuai-gong  
					]
					for(let c of corps){
						ns.singularity.applyToCompany(c, "Software Job")
					}
		
					//zero
					ns.sleeve.travel(0, 'Sector-12');
					ns.sleeve.setToCompanyWork(0, "MegaCorp")
					ns.sleeve.setToCompanyWork(1, "Blade Industries")
					ns.sleeve.setToCompanyWork(2, "Four Sigma")
					ns.sleeve.setToCompanyWork(3, "NWO")
					ns.sleeve.setToCompanyWork(4, "OmniTek Incorporated")
					ns.sleeve.setToCompanyWork(5, "Bachman & Associates")
					ns.sleeve.setToCompanyWork(6, "Clarke Incorporated")
					ns.sleeve.setToCompanyWork(7, "ECorp")
		break;
		*/
		case "BBgenOps":
			for (let i = 0; i < 8; i++) {
				ns.tprint('Sleeve ' + i + ' is infiltrating synthoid population');
				ns.sleeve.setToBladeburnerAction(i, "Infiltrate synthoids")
			}
			break;

		case "BBsupport":
			for (let i = 0; i < 8; i++) {
				ns.tprint('Sleeve ' + i + ' is supporting Player');
				ns.sleeve.setToBladeburnerAction(i, "Support main sleeve")
			}
			break;


		default:
			ns.print("Help")


	}

}