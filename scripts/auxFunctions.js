/** @param {NS} ns */



export async function main(ns) {
	ping(ns, "PING from main")
}

export async function ping(ns, msg="PING"){
	ns.alert(msg)
}