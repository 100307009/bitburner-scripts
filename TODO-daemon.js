import { ping } from "/scripts/auxFunctions";


/** @param {NS} ns */
export async function main(ns) {
	ns.disableLog('ALL');
	ns.tail()
	//ping(ns, "daemon")
	if (!ns.getPlayer().tor) {
		await kickstart(ns)
	}


}
async function runCasino(ns){
	if (!ns.isRunning('casino.js', ns.getHostname()) && ns.getPlayer().money < 1e9) {
		if (ns.getPlayer().city != "Aevum") { ns.singularity.travelToCity("Aevum") }
		ns.exec("casino.js", ns.getHostname(), 1)
		await ns.sleep(10000)
	}
	await ns.sleep(5000)
}

//HACKING STRATEGY
/*
--FIRST TIMER--
sleeves to shock recovery
start hacknet
get seed money (10M?)
move to aevum
savescum casino.js
join Aevum 
move to sector12
join Sector12 
move to volhaven
study algorithms at volhaven
buy tor
buy BruteSSH, FTPCrack
run servMgr.js
run xpFarm @ hacknet nodes
run untargeted batcher
invade && backdoor CSEC
kill hacknet
upgrade home server when possible (loop)
map augs path
farm faction rep for augs lvl
	sector12
	Aevum
	CSEC
	NiteSec
get money for all augs
install all augs
*/
async function hackPhaseOne(ns){
	ns.print("Starting Phase ONE")
	ns.exec("/scripts/sleeves.js", ns.getHostname(), 1, "shockRecovery")
	ns.exec("/scripts/hnMgr.js", ns.getHostname(), 1)
	//awaiting seed money
	while(ns.getPlayer().money < 1e7){ns.sleep(1000)}
	if (ns.getPlayer().city != "Aevum") { ns.singularity.travelToCity("Aevum") }
	//savescum casino.js
	await runCasino(ns)

}


/*
--SECOND PHASE--
sleeves to shock recovery
run xpFarm
move to aevum
savescum casino.js
move to volhaven
study algorithms at volhaven
move to Chongqing
join chongqing
move to new tokyo
join new tokyo
move to ishima
join ishima
join Tian Di Hui
buy tor
buy BruteSSH, FTPCrack
kill xpFarm
run servMgr.js
run untargeted batcher
upgrade home server when possible (loop)
map augs path
farm faction rep for augs lvl
	chongqing
	new tokyo
	ishima
	Tian Di Hui
get money for all augs
install all augs
*/

/*
--THIRD PHASE--
sleeves to shock recovery
run xpFarm
move to aevum
savescum casino.js
move to volhaven
study algorithms at volhaven
buy tor
buy BruteSSH, FTPCrack
kill xpFarm
run servMgr.js
run untargeted batcher
upgrade home server when possible (loop)
join volhaven
invade && backdoor avmnite-02h
invade && backdoor I.I.I.I
join NiteSec
join Black Hand
map augs path
farm faction rep for augs lvl of joined factions
get money for all augs
install all augs
*/

/*
--4TH PHASE--
sleeves to shock recovery
run xpFarm
move to aevum
savescum casino.js
move to volhaven
study algorithms at volhaven
sleep 1min
kill xpFarm
run grafting (most expensive affordable)
run servMgr.js
run untargeted batcher
sleep 5min ('til 10b)
buy tor
buy 4 tools
invade && backdoor run4theh111z 
join BitRunners
farm faction rep for augs lvl of joined factions
get money for all augs
install all augs
*/


async function kickstart(ns) {
	//kickstart

	if (ns.getPlayer().hack < 5) {
		ns.exec("xpFarm.js", ns.getHostname(), 1)
		ns.print("running XP farm for 5 mins")
		await ns.sleep(5 * 60 * 1000)
		ns.killall()
	}

	if (ns.getPlayer().money < 1e6) {
		ns.print("Prefarming initial seed money")
		ns.exec("breach.js", ns.getHostname(), 1)
		while (ns.getPlayer().money < 1e6) {
			let pid = ns.exec("manager.js", ns.getHostname(), 1, "n00dles", 1, false)
			while (ns.isRunning(pid, ns.getHostname())) { await ns.sleep(1000) }

		}
	}

	if (!ns.isRunning('casino.js', ns.getHostname()) && ns.getPlayer().money < 1e9) {
		ns.print("Seed money complete.\nMilking Casino")
		if (ns.getPlayer().city != "Aevum") { ns.singularity.travelToCity("Aevum") }
		ns.exec("casino.js", ns.getHostname(), 1)
		await ns.sleep(1000)
	}
	// TOR + breach
	if (!ns.fileExists("SQLInject.exe")) {
		ns.print("getting TOR and hacking tools")
		ns.singularity.purchaseTor()
		ns.singularity.purchaseProgram("BruteSSH.exe")
		ns.singularity.purchaseProgram("FTPCrack.exe")
		ns.singularity.purchaseProgram("relaySMTP.exe")
		ns.singularity.purchaseProgram("HTTPWorm.exe")
		ns.singularity.purchaseProgram("SQLInject.exe")
		ns.exec("breach.js", ns.getHostname(), 1)
	}
	//upgrade home ram to 4TB?
	if (ns.getServerMaxRam("home") < 4096) {
		while (ns.getPlayer().money > ns.singularity.getUpgradeHomeRamCost() && ns.getServerMaxRam("home") < 4096) {
			upgradeHome(ns)
		}
		ns.singularity.softReset(ns.getScriptName())
	}
}

async function startMoneyFarm(ns) {
	if (!ns.isRunning("scripts/servMgr.js", ns.getHostname())) { ns.exec("scripts/servMgr.js", ns.getHostname(), 1) }
	if (!ns.isRunning("controller.js", ns.getHostname())) { ns.exec("controller.js", ns.getHostname(), 1) }
}

async function upgradeHome(ns) {
	if (ns.singularity.getUpgradeHomeRamCost() < ns.getPlayer().money) {
		ns.singularity.upgradeHomeRam()
	}

	if (ns.singularity.getUpgradeHomeCoresCost() < ns.getPlayer().money) {
		ns.singularity.upgradeHomeCores()
	}
}

// 8GB ram


// 32GB ram