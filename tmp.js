/** @param {NS} ns */

export async function main(ns) {

	//await startup(ns)
	//await pumpCombat(ns)
	//ns.tprint(calculateIntelligenceBonus(1000, 1))
	getFiles(ns, "")
}


async function pumpCombat(ns) {
	while (true) {
		let stats = [["strength", ns.getPlayer().strength],
		["defense", ns.getPlayer().defense],
		["dexterity", ns.getPlayer().dexterity],
		["agility", ns.getPlayer().agility]]
		let min = 0
		//ns.tprint(stats[0][1])
		for (let s = 0; s < 4; s++) {
			if (stats[s][1] < stats[min][1]) {
				min = s
			}
		}
		ns.singularity.gymWorkout("powerhouse gym", stats[min][0], ns.singularity.isFocused())
		await ns.sleep(1000)


	}
	/*
	while (ns.getPlayer().strength < 100) { ns.singularity.gymWorkout("powerhouse gym", "strength", true); await ns.sleep(1000) }
	while (ns.getPlayer().defense < 100) { ns.singularity.gymWorkout("powerhouse gym", "defense", true); await ns.sleep(1000) }
	while (ns.getPlayer().dexterity < 100) { ns.singularity.gymWorkout("powerhouse gym", "dexterity", true); await ns.sleep(1000) }
	while (ns.getPlayer().agility < 100) { ns.singularity.gymWorkout("powerhouse gym", "agility", true); await ns.sleep(1000) }
*/
}

function rmRf(ns, dir = "/Temp") {
	let files = ns.ls("home", dir)

	//ns.tprint(files)
	for (let f of files) {
		ns.rm(f, "home")
	}
}


export function calculateIntelligenceBonus(intelligence, weight) {
	return Math.floor(weight * Math.pow(intelligence, 0.8) / 6)
}

function getFiles(ns, dir = ".") {
	let files = ns.ls("home", dir)
	for (let f of files) {
		ns.tprint("download "+f )
	}
}