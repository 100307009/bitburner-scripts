/** @param {NS} ns */



export async function main(ns) {
	ns.disableLog("sleep");

	while (true) {
		hnManager(ns)
		await useHashes(ns)
		await ns.sleep(1000)
	}

}


function hnManager(ns) {
	const checkM = (c, d) => eval(c < ns.getPlayer().money / d)

	if (checkM(ns.hacknet.getPurchaseNodeCost(), 20)) {
		ns.hacknet.purchaseNode()
	}
	for (let i = 0; i < ns.hacknet.numNodes(); i++) {
		for (let part of ['Level', 'Ram', 'Core', 'Cache']) {
			if (checkM(ns.hacknet['get' + part + 'UpgradeCost'](i), 20)) {
				ns.hacknet['upgrade' + part](i);
			}
		}
	}
}

async function useHashes(ns) {
	if(ns.getPlayer().money < 1e7){
		while(ns.getPlayer().money < 1e7 && ns.hacknet.numHashes() > 4){
			ns.hacknet.spendHashes("Sell for Money")
			await ns.sleep(5)
		}
	}


	if(ns.getPlayer().inBladeburner && ns.bladeburner.getRank() > 1000){
		while(ns.hacknet.hashCost("Exchange for Bladeburner SP") < ns.hacknet.numHashes() ){
			ns.hacknet.spendHashes("Exchange for Bladeburner SP")
			await ns.sleep(5)
		}
	}
	
	
	if(ns.getPlayer().hasCorporation && eval("ns.corporation.getCorporation().divisions").filter(d => d.type == "Tobacco").length > 0){
		if(eval("ns.corporation.getCorporation().divisions").filter(d => d.type == "Tobacco")[0]["research"] < 20000){
			while(ns.hacknet.hashCost("Exchange for Corporation Research") < ns.hacknet.numHashes() ){
				ns.hacknet.spendHashes("Exchange for Corporation Research")
				await ns.sleep(5)
			}
		}
	}

	if(ns.singularity.getOwnedAugumentations() == 0){
		while(ns.hacknet.hashCost("Improve Studying") < ns.hacknet.numHashes() ){
			ns.hacknet.spendHashes("Improve Studying")
			await ns.sleep(5)
		}
	}

	
}