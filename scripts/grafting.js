/** @param {NS} ns */
const hackPreferred = ["HyperSight Corneal Implant", "Neuronal Densification",
	"Neurotrainer III", "OmniTek InfoLoad", "PC Direct-Neural Interface NeuroNet Injector",
	"PC Direct-Neural Interface Optimization Submodule", "Power Recirculation Core", "QLink",
	"SPTN-97 Gene Modification", "Xanipher"]

const getCost = (ns, name) => ns.grafting.getAugmentationGraftPrice(name);
const getTime = (ns, name) => ns.grafting.getAugmentationGraftTime(name);

export async function main(ns) {
	ns.disableLog("sleep");
	ns.tail();
	let augs = ns.grafting.getGraftableAugmentations();
	augs = augs.filter(v => v.slice(0, 7) != "Hacknet")
	augs.sort((a, b) => getTime(ns, a) - getTime(ns, b));
	ns.print(`Graftable Augmentations:\n${augs}`);
	//    for (const aug of augs) {
	//        ns.print(`Aug: ${aug}, Cost: $${getCost(ns, aug)/1e6}m, Time: ${getTime(ns, aug)}`);
	//    }
	while (augs.length > 0) {
		if (!ns.isBusy()) {
			await ns.sleep(10000);
			augs.sort((a, b) => getTime(ns, a) - getTime(ns, b));

			const hackPreferred = ["HyperSight Corneal Implant", "Neuronal Densification", "ECorp HVMind Implant",
				"Neurotrainer III", "OmniTek InfoLoad", "PC Direct-Neural Interface NeuroNet Injector",
				"PC Direct-Neural Interface Optimization Submodule", "Power Recirculation Core", "QLink",
				"SPTN-97 Gene Modification", "Xanipher", "nickofolas Congruity Implant"].sort((a, b) => getTime(ns, a) - getTime(ns, b));

			let nextAug = "";
			for (const aug of hackPreferred) {
				//            for (const aug of augs) {
				let augCost;
				if (augs.includes(aug) && (augCost = getCost(ns, aug)) < ns.getServerMoneyAvailable("home")) {
					nextAug = aug;
					ns.print(`Aug ${aug} found in ungrafted list and is within budget ($${augCost}).`)
					break;
				} else {
					ns.print(`Aug ${aug} not found in ungrafted list (${!augs.includes(aug)}) or is too expensive ($${augCost}).  Next!`)
				}
			}
			if (nextAug != "") {
				ns.singularity.travelToCity("New Tokyo");
				ns.grafting.graftAugmentation(nextAug, false);
			}
		}
		await ns.sleep(1000);
		//augs = ns.grafting.getGraftableAugmentations();
		//augs = augs.filter(v => v.slice(0, 7) != "Hacknet")
	}
}