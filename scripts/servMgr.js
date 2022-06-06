/** @param {NS} ns */

const baseRam = 1024

export async function main(ns) {
	ns.tail()
	ns.clearLog()
	ns.disableLog('ALL');
	if (ns.getPurchasedServerCost(baseRam) > ns.getPlayer().money) {
		ns.print("not enough money to buy server")
		return
	}
	//is there a need to buy more?
	//if (ns.getPurchasedServers().length == ns.getPurchasedServerLimit())

	if (ns.args[0] == "loop") {
		while (true) {
			log(ns)
			pServerManager(ns)
			await ns.sleep(1000)

		}
	}
	else {
		pServerManager(ns)
	}



}

async function pServerManager(ns) {
	let ram = 0;
	let ramList = [baseRam];

	for (let num of ramList) {
		if (num <= ns.getPurchasedServerMaxRam() && (ns.getPurchasedServerCost(num) < ns.getPlayer().money)) {
			//ns.print(ns.getPurchasedServerCost(ram) < ns.getPlayer().money)
			ramList.push(num * 2);
			ram = num;
		} else {
			break
		}
	}



	if (ns.getPurchasedServers().length < ns.getPurchasedServerLimit() && ram > 0) {
		buyServer(ns, ram)
	}
	let servList = ns.getPurchasedServers()
	//ns.print(servList)
	let minRam = servList[0] || null
	if (servList.length > 0) {
		for (let serv of servList) {
			minRam = ns.getServerMaxRam(minRam) < ns.getServerMaxRam(serv) ? minRam : serv
			//ns.print(serv, " ", ns.getServerMaxRam(serv), " ", minRam)
		}
	}
	//ns.print(checkM(ns.getPurchasedServerCost(ram), 1))
	if (ns.getServerMaxRam(minRam) < ram && ns.getPurchasedServerCost(ram) < ns.getPlayer().money) {
		ns.killall(minRam);
		ns.deleteServer(minRam);
		ns.print("Retired " + minRam)
		buyServer(ns, ram);
	}
}

function log(ns) {
	ns.clearLog();
	let slaves = ns.getPurchasedServers()
	slaves.sort((a, b) => (ns.getServerMaxRam(a) < ns.getServerMaxRam(b)) - (ns.getServerMaxRam(a) > ns.getServerMaxRam(b)))
	for (let s of slaves) {
		ns.print(s)
	}
	ns.print('═════════════════════════════════════════')
	ns.print("Total servers: " + slaves.length)


}

function buyServer(ns, r) {
	ns.purchaseServer('slave-' + ns.nFormat(r * 1000000000, '0.0b'), r)
	ns.print('Acquired slave-' + ns.nFormat(r * 1000000000, '0.0b'))
}