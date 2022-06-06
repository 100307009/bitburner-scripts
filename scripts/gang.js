let GANG = "The Syndicate";
let WANTED_THRESHOLD = 10; // If your wanted level is higher than this and your penalty is greater than (1-WANTED_PENALTY_THRESHOLD)....
let WANTED_PENALTY_THRESHOLD = .9; // ... then do vigilante stuff.
let MINIMUM_DEFENSE = 300; // Don't stop combat training until this defense is reached.
let TRAFFICK_CHANCE = .8; // Odds of arms trafficking vs terrorism
let REP_CHECK = 1.5; // Don't ascend anyone with over 1.5x the average rep of the group.
let MINIMUM_RESPECT = 100; // Don't start ascension until the average respect is at least this.
let CLASH_TARGET = .6; // Don't go to war until you have this much of a chance against all remaining gangs.

/** @param {NS} ns **/
export async function main(ns) {
	if (!ns.gang.inGang()) {
		ns.gang.createGang(GANG); // Slum Snakes rule!
	}
	if (ns.gang.inGang()) {
		let starttime = Date.now();
		while (true) {
			// Recruit as many Steves as possible.
			while (ns.gang.recruitMember("Steve-" + Math.floor(Math.random() * 100).toString())); // There may be some Steve collision. Oh well.
			let members = ns.gang.getMemberNames();

			// Set the Steves to their tasks.
			members.map(x => ns.gang.setMemberTask(x, (ns.gang.getGangInformation().wantedLevel >= WANTED_THRESHOLD && ns.gang.getGangInformation().wantedPenalty <= WANTED_PENALTY_THRESHOLD) ? "Vigilante Justice" : (ns.gang.getMemberInformation(x).def < MINIMUM_DEFENSE ? "Train Combat" : (Math.random() <= TRAFFICK_CHANCE ? "Human Trafficking" : "Terrorism"))));

			// Determine if anyone is worthy of ascension
			let avgrespect = members.map(x => ns.gang.getMemberInformation(x).earnedRespect).reduce((a, b) => a + b, 0) / members.length;
			let ascendable = members.filter(x => ns.gang.getAscensionResult(x) != null).sort((a, b) => { return (ns.gang.getAscensionResult(a).str + ns.gang.getAscensionResult(a).dex + ns.gang.getAscensionResult(a).def) / 3 - (ns.gang.getAscensionResult(b).str + ns.gang.getAscensionResult(b).dex + ns.gang.getAscensionResult(b).def) / 3 }).filter(x => ns.gang.getMemberInformation(x).earnedRespect <= REP_CHECK * avgrespect).filter(x => (ns.gang.getAscensionResult(x).dex + ns.gang.getAscensionResult(x).str + ns.gang.getAscensionResult(x).def) / 3 >= 1.15);
			if (avgrespect >= MINIMUM_RESPECT && ascendable.length > 0) {
				if (ns.gang.ascendMember(ascendable[ascendable.length - 1])) {
					ns.toast(ascendable[ascendable.length-1] + " ascended!", "success", 10000);
				}
			}

			// Buy equipment, but only if SQLInject.exe exists
			if (ns.fileExists("SQLInject.exe")) {
    			let equip = ns.gang.getEquipmentNames();
				for (let j = 0; j < equip.length; j++) {
					for (let i = 0; i < members.length; i++) {
						if (ns.gang.purchaseEquipment(members.sort((a, b) => ns.gang.getMemberInformation(a).str_mult - ns.gang.getMemberInformation(b).str_mult)[i], equip.sort((a, b) => { return ns.gang.getEquipmentCost(a) - ns.gang.getEquipmentCost(b) })[j])) {
							i = -1;
						};
					}
				}
			}

			// Chill until clash time
			while (Date.now() <= starttime) {
				await ns.sleep(0);
			}

			// Clash time
			members.map(x => ns.gang.setMemberTask(x, "Territory Warfare"));
			// No hitting yourself, and gangs with no territory don't matter
			let othergangs = Object.keys(ns.gang.getOtherGangInformation()).filter(x => x != GANG && ns.gang.getOtherGangInformation()[x].territory > 0);
			if (othergangs.length > 0) {
				// Sporadic progress update.
				//othergangs.map(x => ns.toast(x + " " + ns.gang.getChanceToWinClash(x).toString(), "success", 10000));
				// If there's a high enough chance of victory against every gang, go to war.
				if (othergangs.every(x => ns.gang.getChanceToWinClash(x) >= CLASH_TARGET))
					ns.gang.setTerritoryWarfare(true);
				let startpower = ns.gang.getGangInformation().power;
				// Chill until the clash tick processes.
				while (ns.gang.getGangInformation().power == startpower) {
					await ns.sleep(0);
				}
			}

			// Set the goal time for the next clash at 19 seconds from now.
			starttime = Date.now() + 19000;
			ns.gang.setTerritoryWarfare(false);
		}
	}
}