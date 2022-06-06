/** @param {NS} ns */
export async function main(ns) {
	let invites = ns.singularity.checkFactionInvitations()
	for(let i of invites){
		ns.singularity.joinFaction(i)
	}
	ns.singularity.softReset("intFarm.js")
}