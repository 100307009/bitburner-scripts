/** @param {NS} ns */
export async function main(ns) {
	const activity = ns.args[0]
	switch(activity){
		case "balanced":
		ns.tail()
		await balanced(ns)
		break

		case "blades":
		await blades(ns)
		break

		default:
		ns.tprint("Missing argument\nCurrently supported:")
		ns.tprint("'balanced' - balanced training. all stats gonna be equal")
		ns.tprint("'blades' - 100 in each to enter bladeburner division")
	}

}

async function balanced(ns) {
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
}

async function blades(ns) {
	while (ns.getPlayer().strength < 100) { ns.singularity.gymWorkout("powerhouse gym", "strength", true); await ns.sleep(1000) }
	while (ns.getPlayer().defense < 100) { ns.singularity.gymWorkout("powerhouse gym", "defense", true); await ns.sleep(1000) }
	while (ns.getPlayer().dexterity < 100) { ns.singularity.gymWorkout("powerhouse gym", "dexterity", true); await ns.sleep(1000) }
	while (ns.getPlayer().agility < 100) { ns.singularity.gymWorkout("powerhouse gym", "agility", true); await ns.sleep(1000) }
}