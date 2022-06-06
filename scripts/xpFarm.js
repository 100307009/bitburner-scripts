/** @param {NS} ns**/
export async function main(ns) {
	ns.disableLog('ALL');

	//Welcome to the Auto Farm part 2: Electric Boogaloo - Advanced Edition
	//This script is a little more complicated to explain easily, it dedicates high RAM servers to attack high profit servers
	//This is also set and forget, your EXEs and hacking level are reacquired each second, so new servers are added without needing to reboot it
	//Well I hope this brings you ideas, knowledge and or profits :D
	//var files = ['grow.script', 'weak.script', 'hack.script'];
	var file = "weaken-once.js"
	//await ns.write('weak.script', 'weaken(args\[0\])', 'w');
	var target

	if (ns.getHackingLevel() < 10) { target = "n00dles" }
	else target = "nectar-net"


	if (ns.args == "--hacked") {
		var exclude = ns.getPurchasedServers()
		exclude.push("home")
	}
	else {
		var exclude = ['']
	}
	//Servers names that won't be used as hosts or deleted

	var servers; var hosts; var exes; var tmp;
	if (false) { brutessh(); ftpcrack(); relaysmtp(); httpworm(); sqlinject() }

	const checkM = (c, d) => eval(c < ns.getPlayer().money / d)
	const arraySort = (arr) => arr.sort((a, b) => b[0] - a[0])
	function info(t, s) {
		if (t == 'MM') { return ns.getServerMaxMoney(s) }
		if (t == 'MR') { return ns.getServerMaxRam(s) }
		if (t == 'UR') { return ns.getServerUsedRam(s) }
		if (t == 'NPR') { return ns.getServerNumPortsRequired(s) }
		if (t == 'RHL') { return ns.getServerRequiredHackingLevel(s) }
	}

	async function scanExes() { for (let hack of ['brutessh', 'ftpcrack', 'relaysmtp', 'sqlinject', 'httpworm']) { if (ns.fileExists(hack + '.exe')) { exes.push(hack) } } }

	async function scanServers(host, current) {//Combined scan and check
		for (let server of ns.scan(current)) {
			if ((ns.getPurchasedServers().includes(server) || info('NPR', server) <= exes.length) && host != server) {
				if (!ns.getPurchasedServers().includes(server)) { for (let hack of exes) { ns[hack](server) }; ns.nuke(server) }
				if (info('MR', server) > 4 && !exclude.includes(server)) { hosts.push([info('MR', server), server]); hosts = arraySort(hosts) }
				servers.push(server)
				await ns.scp(file, 'home', server)
				await scanServers(current, server)
			}
		}
	}

	async function hackAll() { //Dedicates high RAM servers to high value ones
		for (let host of hosts) {

			function fRam() { return info('MR', host[1]) - info('UR', host[1]) }

			if (fRam() > 2) {
				tmp = Math.floor(fRam() / 1.75);
				if (tmp > 0) {
					// args[0] - server
					// args[1] - wait time
					// args[2] - expected time
					// args[3] - batchNumber
					// args[4] - log color (undefined to disable logging)
					ns.exec(file, host[1], tmp, target, 0,0,0)
					//let pid = ns.exec(scriptName, server, maxThreads, target, delay, expectedTime, batchNumber, logColor, performance.now() + unique++);
				}
			}
		}
	}

	//ns.tail()
	while (true) {//Keeps everything running once per second
		servers = [];
		hosts = ns.args == "--hacked" ? [] : [[Math.max(info('MR', 'home') - 50, 0), 'home']]
		exes = []
		await scanExes()
		await scanServers('', 'home')
		await hackAll()
		await ns.sleep(200)
	}
}