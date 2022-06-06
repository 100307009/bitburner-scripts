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

	if (!ns.isRunning('sigmastart.js', ns.getHostname() && ns.getPlayer().money < 1e9) {
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