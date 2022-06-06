let CORPNAME = "Pay2Win"
let HQ = "Sector-12"
let productindustry = "Tobacco";
let DIVISIONS = {
	"Agriculture": "Ireland",
	"Tobacco": "Cuba",
	"Software": "Silicon Valley",
	"Chemical": "China",
	"Fishing": "Norway",
	"Utilities": "Fiji",
	"Energy": "Sun",
	"Mining": "Sibear",
	"Food": "France",
	"RealEstate": "Venezuela"
}
let PRODUCTS = {
	"Tobacco": ["Tobacco Classic", "New Tobacco", "Tobacco Zero", "Diet Tobacco", "Caffeine-Free Tobacco"],
	"RealEstate": ["Hole in the Wall", "Raising Acres", "Skyview", "Frolicking", "Wonderwall"],
	"Food": ["Taco Hole", "Burrito Gorge", "Pizza Slut", "Chicken Jeeka Masala", "Gorge Buffet"],
	"Software": ["MacroHard Write", "MacroHard Paint", "MacroHard Calc", "MacroHard Comms", "MacroHard Base-a-Date"]
}
let OFFERS = [210e9, 5e12, 800e12, 128e15];
//let OFFERS = [210e9/3, 5e12/3, 800e12/3, 128e15/3];

// <tr class="MuiTableRow-root css-1dix92e"><th class="jss2228 MuiTableCell-root MuiTableCell-body MuiTableCell-sizeMedium css-u9whl2" scope="row" colspan="2" style="padding-bottom: 2px; position: relative; top: -3px;"><span class="MuiLinearProgress-root MuiLinearProgress-colorPrimary MuiLinearProgress-determinate css-bnrm1a" role="progressbar" aria-valuenow="80" aria-valuemin="0" aria-valuemax="100"><span class="MuiLinearProgress-bar MuiLinearProgress-barColorPrimary MuiLinearProgress-bar1Determinate css-14usnx9" style="transform: translateX(-20.4732%);"></span></span></th></tr>

// Janaszar - https://discord.com/channels/415207508303544321/923445881389338634/965914553479200808
let EMPLOYEERATIOS = {
	"Food": 28,
	"Tobacco": 9,
	"Pharmaceutical": 31,
	"Computer": 37,
	"Robotics": 30,
	"Software": 37,
	"Healthcare": 27,
	"RealEstate": 0
}

let CITIES = ["Sector-12", "Aevum", "Chongqing", "New Tokyo", "Ishima", "Volhaven"]
let SIMPLEINDUSTRIES = ["Agriculture", "Energy", "Utilities", "Fishing", "Mining", "Chemical", "Pharmaceutical", "Computer", "Robotics", "Software", "RealEstate"];
let PRODUCTINDUSTRIES = ["Food", "Tobacco", "Pharmaceutical", "Computer", "Robotics", "Software", "Healthcare", "RealEstate"];
let WAREHOUSEMULTS = {
	"Energy": [.65, 0, .05, .3],
	"Utilities": [.5, 0, .4, .4],
	"Agriculture": [.72, .2, .3, .3],
	"Fishing": [.15, .35, .5, .2],
	"Mining": [.3, .4, .45, .45],
	"Food": [.05, .15, .3, .25],
	"Tobacco": [.15, .15, .2, .15],
	"Chemical": [.25, .2, .25, .2],
	"Pharmaceutical": [.05, .15, .25, .2],
	"Computer": [.2, 0, .36, .19],
	"Robotics": [.32, .19, 0, .36],
	"Software": [.15, .25, .05, .18],
	"Healthcare": [.1, .1, .1, .1],
	"RealEstate": [0, .05, .6, .6]
}
let SELLPRODS = {
	"Agriculture": ["Food", "Plants"],
	"Software": ["AI Cores"],
	"Energy": ["Energy"],
	"Utilities": ["Water"],
	"Fishing": ["Food"],
	"Mining": ["Metal"],
	"Chemical": ["Chemicals"],
	"Pharmaceutical": ["Drugs"],
	"Computer": ["Hardware"],
	"Robotics": ["Robots"],
	"RealEstate": ["Real Estate"]
}
let MATERIALSIZES = [.005, .06, .5, .1];

function currentround(ns) {
	if (ns.corporation.getCorporation().public) {
		return 5;
	}
	return null === ns.corporation.getInvestmentOffer().round ? 1 : ns.corporation.getInvestmentOffer().round;
}

async function jobfair(ns) {
	for (let division of ns.corporation.getCorporation().divisions) {
		let JOBS = [];

		for (let city of CITIES) {
			JOBS = [];
			switch (division.type) {
				case 'Energy':
				case 'Utilities':
				case 'Agriculture':
				case 'Fishing':
				case 'Mining':
				case 'Chemical':
					JOBS = ["Operations", "Engineer", "Business", "Research & Development", "Research & Development", "Management", "Operations", "Engineer", "Management", "Business"];
					break;
				case "Food":
				case "Tobacco":
				case "Pharmaceutical":
				case "Computer":
				case "Robotics":
				case "Software":
				case "Healthcare":
				case "RealEstate":
					if (city != HQ) {
						// todo: Big Harry: I go 1/1/1/1 +11, 2/1/3/2 + 22, then 6/3/8/6 + 22, then all into r&d after
						JOBS = ["Operations", "Engineer", "Business", "Management"];
						for (let i = 0; i < 11; i++) {
							JOBS.push("Research & Development");
						}
						JOBS = JOBS.concat(["Operations", "Business", "Management", "Business"]);
						for (let i = 0; i < 11; i++) {
							JOBS.push("Research & Development");
						}
						JOBS = JOBS.concat(["Operations", "Operations", "Operations", "Operations", "Engineer", "Engineer", "Business", "Business", "Business", "Business", "Business", "Management", "Management", "Management", "Management"]);
						if (ns.corporation.getDivision(DIVISIONS[division.type]).cities.includes(city)) {
							while (JOBS.length < ns.corporation.getOffice(DIVISIONS[division.type], city).size) {
								JOBS.push("Research & Development");
							}
						}
					} else {
						JOBS = ["Operations"];
						while (JOBS.length < 101) {
							if (JOBS.filter(x => x == "Engineer").length / JOBS.length < EMPLOYEERATIOS[division.type] / 100) {
								JOBS.push("Engineer");
							} else {
								JOBS.push("Management");
							}
						}
					}
					break;
			}
			if (ns.corporation.getDivision(division.name).cities.includes(city)) {
				let employees = ns.corporation.getOffice(division.name, city).employees;
				let i = employees.length - 1;
				while (i >= 0 && ns.corporation.getEmployee(division.name, city, employees[i]).pos == "Unassigned") {
					i -= 1;
				}
				i += 1;
				if (i < employees.length) {
					ns.tprint("Assigning " + division.name + " employee " + employees[i] + " in " + city + " to " + JOBS[ns.corporation.getOffice(division.name, city).employees.indexOf(employees[i]) % JOBS.length]);
					await ns.corporation.assignJob(division.name, city, employees[i], JOBS[ns.corporation.getOffice(division.name, city).employees.indexOf(employees[i]) % JOBS.length]);
					return true;
				}
			}
		}
	}
	await ns.sleep(0);
	return false;
}

function optimizewarehouse(ns, industry, division, city, oops = false) {
	//	ns.tprint(industry, " ", division, " ", city, " ", oops);
	oops = true;
	let warehousesize = ns.corporation.getWarehouse(division, city).size;
	let percentage = .5;
	if (warehousesize >= 500) {
		percentage = .575;
	}
	if (warehousesize >= 3500) {
		percentage = .75;
	}
	let answer = [];
	//	if (!oops) {
	answer = ["Real Estate", "Hardware", "Robots", "AI Cores"].map(x => ns.corporation.getMaterial(division, city, x).qty);
	if (!oops) {
		if (ns.corporation.getCorporation().funds < 0) {
			return [["Real Estate", answer[0]], ["Hardware", answer[1]], ["Robots", answer[2]], ["AI Cores", answer[3]]];
		}
	}
	if (warehousesize > 10000) {
		oops = true;
		warehousesize = 10000;
	}
	//} else {
	if (oops) {
		answer = [0, 0, 0, 0];
	}
	let price = 0;
	let z = 0;
	while (answer[0] * MATERIALSIZES[0] + answer[1] * MATERIALSIZES[1] + answer[2] * MATERIALSIZES[2] + answer[3] * MATERIALSIZES[3] < warehousesize * percentage) {
		let re = answer[0]; let hw = answer[1]; let ro = answer[2]; let ai = answer[3];
		let warehousescores = [
			((.002 * (re + 1 / MATERIALSIZES[0]) + 1) ** WAREHOUSEMULTS[industry][0]) * ((.002 * (hw) + 1) ** WAREHOUSEMULTS[industry][1]) * ((.002 * (ro) + 1) ** WAREHOUSEMULTS[industry][2]) * ((.002 * (ai) + 1) ** WAREHOUSEMULTS[industry][3]),
			((.002 * (re) + 1) ** WAREHOUSEMULTS[industry][0]) * ((.002 * (hw + 1 / MATERIALSIZES[1]) + 1) ** WAREHOUSEMULTS[industry][1]) * ((.002 * (ro) + 1) ** WAREHOUSEMULTS[industry][2]) * ((.002 * (ai) + 1) ** WAREHOUSEMULTS[industry][3]),
			((.002 * (re) + 1) ** WAREHOUSEMULTS[industry][0]) * ((.002 * (hw) + 1) ** WAREHOUSEMULTS[industry][1]) * ((.002 * (ro + 1 / MATERIALSIZES[2]) + 1) ** WAREHOUSEMULTS[industry][2]) * ((.002 * (ai) + 1) ** WAREHOUSEMULTS[industry][3]),
			((.002 * (re) + 1) ** WAREHOUSEMULTS[industry][0]) * ((.002 * (hw) + 1) ** WAREHOUSEMULTS[industry][1]) * ((.002 * (ro) + 1) ** WAREHOUSEMULTS[industry][2]) * ((.002 * (ai + 1 / MATERIALSIZES[[3]]) + 1) ** WAREHOUSEMULTS[industry][3])
		];
		//	warehousescores = warehousescores.map(x => x - ((.002 * (re) + 1) ** WAREHOUSEMULTS[industry][0]) * ((.002 * (hw) + 1) ** WAREHOUSEMULTS[industry][1]) * ((.002 * (ro) + 1) ** WAREHOUSEMULTS[industry][2]) * ((.002 * (ai) + 1) ** WAREHOUSEMULTS[industry][3]));
		if (warehousescores[0] == warehousescores.reduce((a, b) => { return Math.max(a, b) })) {
			if (!oops) {
				price += ns.corporation.getMaterial(DIVISIONS[industry], city, "Real Estate").cost * 1 / MATERIALSIZES[0];
				if (price > ns.corporation.getCorporation().funds / 12) {
					return [["Real Estate", answer[0]], ["Hardware", answer[1]], ["Robots", answer[2]], ["AI Cores", answer[3]]];
				}
			}
			answer[0] += 1 / MATERIALSIZES[0];
			z += 1 / MATERIALSIZES[0];
		}
		if (warehousescores[1] == warehousescores.reduce((a, b) => { return Math.max(a, b) })) {
			if (!oops) {
				price += ns.corporation.getMaterial(DIVISIONS[industry], city, "Hardware").cost * 1 / MATERIALSIZES[1];
				if (price > ns.corporation.getCorporation().funds / 12) {
					return [["Real Estate", answer[0]], ["Hardware", answer[1]], ["Robots", answer[2]], ["AI Cores", answer[3]]];
				}
			}
			answer[1] += 1 / MATERIALSIZES[1];
			z += 1 / MATERIALSIZES[1];
		}
		if (warehousescores[2] == warehousescores.reduce((a, b) => { return Math.max(a, b) })) {
			if (!oops) {
				price += ns.corporation.getMaterial(DIVISIONS[industry], city, "Robots").cost * 1 / MATERIALSIZES[2];
				if (price > ns.corporation.getCorporation().funds / 12) {
					return [["Real Estate", answer[0]], ["Hardware", answer[1]], ["Robots", answer[2]], ["AI Cores", answer[3]]];
				}
			}
			answer[2] += 1 / MATERIALSIZES[2];
			z += 1 / MATERIALSIZES[2];
		}
		if (warehousescores[3] == warehousescores.reduce((a, b) => { return Math.max(a, b) })) {
			if (!oops) {
				price += ns.corporation.getMaterial(DIVISIONS[industry], city, "AI Cores").cost * 1 / MATERIALSIZES[3];
				if (price > ns.corporation.getCorporation().funds / 12) {
					return [["Real Estate", answer[0]], ["Hardware", answer[1]], ["Robots", answer[2]], ["AI Cores", answer[3]]];
				}
			}
			answer[3] += 1 / MATERIALSIZES[3];
			z += 1 / MATERIALSIZES[3];
		}
		//if (z >= 1000) {
		//	return [["Real Estate", answer[0]], ["Hardware", answer[1]], ["Robots", answer[2]], ["AI Cores", answer[3]]];
		//}
		//		await ns.sleep(0);
	}
	return [["Real Estate", answer[0]], ["Hardware", answer[1]], ["Robots", answer[2]], ["AI Cores", answer[3]]];
}

async function adjustallwarehouses(ns) {
	let industries = ns.corporation.getCorporation().divisions.map(x => x.type);
	let done = false;
	let bootstrapMaterialsList = [];
	let lastTick = 0;
	let priceMults = Object();
	for (let city of CITIES) {
		priceMults[city] = Object();
	}
	// BUY
	bootstrapMaterialsList = [];
	//ns.tprint("A")
	for (let city of CITIES) {
		for (let industry of industries) {
			if (ns.corporation.hasWarehouse(DIVISIONS[industry], city)) {
				bootstrapMaterialsList.push([DIVISIONS[industry], city, optimizewarehouse(ns, industry, DIVISIONS[industry], city)]);
			}
		}
	}
	//ns.tprint(bootstrapMaterialsList);	
	for (let city of CITIES) {
		for (let industry of industries) {
			if (ns.corporation.hasWarehouse(DIVISIONS[industry], city)) {
				for (let i of bootstrapMaterialsList) {
					let division = i[0];
					let city = i[1];
					let bootstrapMaterials = i[2];
					for (let row of bootstrapMaterials) {
						let material = row[0];
						let amount = row[1];
						// Buy it if we need it
						if (ns.corporation.getMaterial(division, city, material).qty < amount) {
							ns.tprint(division + ": Buying " + material + " in " + city);
							//ns.tprint(SELLPRODS[ns.corporation.getDivision(division).type]);
							if ((SELLPRODS[ns.corporation.getDivision(division).type] != null) && SELLPRODS[ns.corporation.getDivision(division).type].includes(material)) {
								ns.corporation.sellMaterial(division, city, material, "MAX", "MP");
							} else {
								ns.corporation.sellMaterial(division, city, material, 0, "0");
							}
							ns.corporation.buyMaterial(division, city, material, (amount - ns.corporation.getMaterial(division, city, material).qty) / 10);
						}
					}
				}
			}
		}
	}
	//	ns.tprint("B")
	done = false;
	let z = Date.now();
	while (z - 30000 < Date.now() && !done) {
		done = true;
		for (let i of bootstrapMaterialsList) {
			let division = i[0];
			let city = i[1];
			if (division != "Ireland" && ns.corporation.getWarehouse(division, city).sizeUsed > ns.corporation.getWarehouse(division, city).size * .95) {
				ns.corporation.upgradeWarehouse(division, city);
			}
			let bootstrapMaterials = i[2];
			for (let row of bootstrapMaterials) {
				let material = row[0];
				let amount = row[1];
				// Wait until we have it
				if (ns.corporation.getMaterial(division, city, material).qty < amount) {
					done = false;
					ns.corporation.buyMaterial(division, city, material, (amount - ns.corporation.getMaterial(division, city, material).qty) / 10);
				} else {
					ns.corporation.buyMaterial(division, city, material, 0);
				}
			}
		}
		if (!done) {
			await jobfair(ns);
		}
	}
}

async function adjustallwarehouses_oops(ns) {
	let industries = ns.corporation.getCorporation().divisions.map(x => x.type);
	let done = false;
	let bootstrapMaterialsList = [];
	for (let city of CITIES) {
		for (let industry of industries) {
			if (ns.corporation.hasWarehouse(DIVISIONS[industry], city)) {
				bootstrapMaterialsList.push([DIVISIONS[industry], city, optimizewarehouse(ns, industry, DIVISIONS[industry], city, true)]);
				for (let i of bootstrapMaterialsList) {
					let division = i[0];
					let city = i[1];
					let bootstrapMaterials = i[2];
					for (let row of bootstrapMaterials) {
						let material = row[0];
						let amount = row[1];
						// Sell it if we need it
						if (ns.corporation.getMaterial(division, city, material).qty > amount) {
							ns.tprint("Selling " + material + " in " + city);
							ns.corporation.buyMaterial(division, city, material, 0);
							ns.corporation.sellMaterial(division, city, material, (amount, ns.corporation.getMaterial(division, city, material).qty) / 10, "0");
						}
					}
				}
			}
		}
	}
	while (!done) {
		done = true;
		for (let i of bootstrapMaterialsList) {
			let division = i[0];
			let city = i[1];
			let bootstrapMaterials = i[2];
			for (let row of bootstrapMaterials) {
				let material = row[0];
				let amount = row[1];
				// Wait until we have it
				if (ns.corporation.getMaterial(division, city, material).qty > amount) {
					done = false;
					ns.corporation.sellMaterial(division, city, material, (amount, ns.corporation.getMaterial(division, city, material).qty) / 10, "0");
				} else {
					ns.corporation.sellMaterial(division, city, material, (amount - ns.corporation.getMaterial(division, city, material).qty) / 10, "0");
				}
			}
		}
		if (!done) {
			await jobfair(ns);
		}
	}
}

async function simpleCorp(ns, industries, firstone) {

	await adjustallwarehouses(ns);
	let lastmessage = "";

	while (true) {
		let upgraded = false;
		ns.tprint("Start Division");
		// Start the division
		for (let industry of industries) {
			if (ns.corporation.getCorporation().divisions.map(x => x['type']).filter(x => x == industry).length == 0) {
				while (ns.corporation.getExpandIndustryCost(industry) > ns.corporation.getCorporation().funds) {
					await jobfair(ns);
				}
				ns.corporation.expandIndustry(industry, DIVISIONS[industry]);
			}
		}

		// Unlock Smart Supply
		if (!ns.corporation.hasUnlockUpgrade("Smart Supply")) {
			ns.corporation.unlockUpgrade("Smart Supply");
		}

		ns.tprint("Expand")
		for (let industry of industries) {
			for (let city of CITIES) {
				while (!ns.corporation.getCorporation().divisions.map(x => [x['type'], x['cities']]).filter(x => x[0] == industry)[0][1].includes(city)) {
					try {
						ns.tprint("Trying to expand " + industry + " to " + city);
						ns.corporation.expandCity(DIVISIONS[industry], city);
					} catch { await jobfair(ns); }
				}
			}
		}

		ns.tprint("Hire");
		// Hire People
		for (let industry of industries) {
			for (let city of CITIES) {
				while (ns.corporation.getOffice(DIVISIONS[industry], city)['employees'].length < [3, 3, 9, 9, 9, 9][currentround(ns)]) {
					if (ns.corporation.getOffice(DIVISIONS[industry], city)['employees'].length == ns.corporation.getOffice(DIVISIONS[industry], city).size) {
						while (ns.corporation.getOfficeSizeUpgradeCost(DIVISIONS[industry], city, 3) > ns.corporation.getCorporation().funds) {
							await jobfair(ns);
						}
						ns.corporation.upgradeOfficeSize(DIVISIONS[industry], city, 3);
					}
					ns.tprint("Hired " + ns.corporation.hireEmployee(DIVISIONS[industry], city).name + " in " + city + " for " + DIVISIONS[industry]);
				}
			}
		}

		ns.tprint("Warehouse");
		// Get Warehouses
		for (let industry of industries) {
			for (let city of CITIES) {
				while (!ns.corporation.hasWarehouse(DIVISIONS[industry], city)) {
					try {
						ns.tprint("Trying to get a warehouse in " + city);
						ns.corporation.purchaseWarehouse(DIVISIONS[industry], city);
					} catch { await jobfair(ns); }
				}
			}
		}

		ns.tprint("Advert");
		// Buy one Advert
		for (let industry of industries) {
			while (ns.corporation.getDivision(DIVISIONS[industry])['upgrades'][1] < 1) {
				ns.corporation.hireAdVert(DIVISIONS[industry]);
				if (ns.corporation.getDivision(DIVISIONS[industry])['upgrades'][1] == 0) {
					await jobfair(ns);
				}
			}
		}

		ns.tprint("Smart");
		for (let level = 1; level <= [0, 0, 10, 10, 10, 10][currentround(ns)]; level++) {
			for (let upgrade of ["Smart Factories", "Smart Storage"]) {
				while (ns.corporation.getUpgradeLevel(upgrade) < level) {
					if (ns.corporation.getUpgradeLevelCost(upgrade) <= ns.corporation.getCorporation().funds) {
						ns.tprint(upgrade, ": ", level);
						ns.corporation.levelUpgrade(upgrade);
						upgraded = true;
					} else {
						await jobfair(ns);
					}
				}
			}
		}

		ns.tprint("Upgrade");
		// Upgrade Warehouse Size
		for (let industry of industries) {
			for (let city of CITIES) {
				while (ns.corporation.getWarehouse(DIVISIONS[industry], city).size < [300, 300, 2000, 3800, 3800, 3800][currentround(ns)]) {
					if (ns.corporation.getUpgradeWarehouseCost(DIVISIONS[industry], city) <= ns.corporation.getCorporation().funds) {
						ns.corporation.upgradeWarehouse(DIVISIONS[industry], city);
						ns.tprint("Upgraded warehouse in " + city + " for " + DIVISIONS[industry]);
						upgraded = true;
					} else {
						await jobfair(ns);
					}
				}
			}
		}

		ns.tprint("Sales");
		// Set up sales
		for (let industry of industries) {
			for (let city of CITIES) {
				ns.corporation.setSmartSupply(DIVISIONS[industry], city, true);
				for (let product of SELLPRODS[industry]) {
					ns.corporation.sellMaterial(DIVISIONS[industry], city, product, "MAX", "MP");
				}
			}
		}

		ns.tprint("STUFF");
		for (let level = 1; level <= [0, 2, 2, 10, 10, 10][currentround(ns)]; level++) {
			for (let upgrade of ["Smart Factories", "FocusWires", "Neural Accelerators", "Speech Processor Implants", "Nuoptimal Nootropic Injector Implants"]) {
				while (ns.corporation.getUpgradeLevel(upgrade) < level) {
					if (ns.corporation.getUpgradeLevelCost(upgrade) <= ns.corporation.getCorporation().funds) {
						ns.tprint(upgrade, ": ", level);
						ns.corporation.levelUpgrade(upgrade);
					} else {
						await jobfair(ns);
					}
				}
			}
		}

		// C'mon, get happy.
		if (false) {
			let done = true;
			while (!done) {
				done = true;
				for (let industry of industries) {
					for (let city of CITIES) {
						let employees = ns.corporation.getOffice(DIVISIONS[industry], city).employees.map(employee => ns.corporation.getEmployee(DIVISIONS[industry], city, employee));
						//					if (500000 * employees.length < ns.corporation.getCorporation().funds && (99.998 > employees.map(x => x.ene).reduce((a, b) => { return a + b; }) / employees.length)) {
						if ((99.998 > employees.map(x => x.ene).reduce((a, b) => { return a + b; }) / employees.length)) {
							//ns.tprint("Buying coffee for " + industry + " " + city);
							//await ns.corporation.buyCoffee(DIVISIONS[industry], city);
							done = false;
						}
						//					if (500000 * employees.length < ns.corporation.getCorporation().funds && (99.998 > employees.map(x => x.hap).reduce((a, b) => { return a + b; }) / employees.length || 100 > employees.map(x => x.mor).reduce((a, b) => { return a + b; }) / employees.length)) {
						if ((99.998 > employees.map(x => x.hap).reduce((a, b) => { return a + b; }) / employees.length || 100 > employees.map(x => x.mor).reduce((a, b) => { return a + b; }) / employees.length)) {
							//ns.tprint("Throwing party for " + industry + " " + city);
							//await ns.corporation.throwParty(DIVISIONS[industry], city, 500000);
							done = false;
						}
						let message = "Funds: " + ns.corporation.getCorporation().funds.toString() + " | Happiness: " + Number((employees.map(x => x.hap).reduce((a, b) => { return a + b; }) / employees.length)).toFixed(2).toString() + " | Energy: " + Number((employees.map(x => x.ene).reduce((a, b) => { return a + b; }) / employees.length)).toFixed(2).toString() + " | Morale: " + Number((employees.map(x => x.mor).reduce((a, b) => { return a + b; }) / employees.length)).toFixed(2).toString();
						if (message != lastmessage) {
							ns.tprint(message);
							lastmessage = message;
						}
					}
				}
				if (await jobfair(ns)) {
					while (await jobfair(ns));
				} else {
					await adjustallwarehouses(ns);
					await ns.sleep(10000);
				}
			}
		}


		if (currentround(ns) >= 3) {
			await adjustallwarehouses(ns);
			return;
		}

		// Investing
		if (ns.corporation.getInvestmentOffer().round <= 2) {
			ns.tprint("Investment: " + currentround(ns).toString() + " " + ns.corporation.getInvestmentOffer().funds.toString());
			while (ns.corporation.getInvestmentOffer().funds < OFFERS[currentround(ns) - 1]) {
				while (await jobfair(ns));
				await adjustallwarehouses(ns);
				ns.tprint("Better offer? " + ns.corporation.getInvestmentOffer().funds.toString() + " " + (ns.corporation.getInvestmentOffer().funds / OFFERS[currentround(ns) - 1] * 100).toString());
			}
			ns.tprint("Accepting offer.");
			ns.corporation.acceptInvestmentOffer();
		}

		await jobfair(ns);
		await adjustallwarehouses(ns);
	}
}


async function fraud(ns) {
	ns.tprint("Committing investor fraud.")
	let fraudmat = ns.corporation.getCorporation().divisions.map(x => ns.corporation);
	let frauditem = []
	try { frauditem = ns.corporation.getCorporation().divisions.map(x => ns.corporation.getDivision(x.name).products.map(y => [ns.corporation.getDivision(x.name).type, x.name, y, isNaN(ns.corporation.getProduct(x.name, y).sCost.replace("MP", "").replace("*", "")) ? 1 : parseInt(ns.corporation.getProduct(x.name, y).sCost.replace("MP", "").replace("*", "")), ns.corporation.getProduct(x.name, y)['properties'].qlt])).flat().filter(x => x[0] == productindustry).sort((a, b) => { return b[4] - a[4] }); } catch {
		frauditem = ns.corporation.getCorporation().divisions.map(x => ns.corporation.getDivision(x.name).products.map(y => [ns.corporation.getDivision(x.name).type, x.name, y, 1, ns.corporation.getProduct(x.name, y)['properties'].qlt])).flat().filter(x => x[0] == productindustry).sort((a, b) => { return b[4] - a[4] });
	}
	ns.tprint("Stuff");
	if (frauditem.length > 0) {
		for (let i = 0; i < frauditem.length; i++) {
			for (let j = i + 1; j < frauditem.length; j++) {
				if (frauditem[i][0] == frauditem[j][0]) {
					frauditem.splice(j);
					j -= 1;
				}
			}
		}
	}
	ns.tprint("Things");
	if (frauditem.length > 0) {
		for (let city of CITIES) {
			try { frauditem.map(x => ns.corporation.setProductMarketTA2(x[1], x[2], false)); } catch { }
			frauditem.map(x => ns.corporation.sellProduct(x[1], city, x[2], "MAX", "10000000000000000000000", true));
		}
	}
	let z = 0;
	while (z < 30 && ((frauditem.length > 0 ? (CITIES.map(x => frauditem.map(y => ns.corporation.getWarehouse(y[1], x).size - ns.corporation.getWarehouse(y[1], x).sizeUsed)).flat().reduce((a, b) => { return a + b })) : 0) > 100)) {
		await ns.sleep(10000);
		z += 1;
	}
	if (frauditem.length > 0) {
		for (let city of CITIES) {
			frauditem.map(x => ns.corporation.sellProduct(x[1], city, x[2], "MAX", (x[4] - 1).toString() + "*MP", true));
			try { frauditem.map(x => ns.corporation.setProductMarketTA2(x[1], x[2], true)); } catch { }
		}
	}
	await ns.sleep(30000);
}

/** @param {NS} ns */
export async function main(ns) {
	ns.disableLog("sleep");

	try { ns.corporation.createCorporation(CORPNAME, false); } catch { }
	try { ns.corporation.createCorporation(CORPNAME, true); } catch { }
	try { ns.corporation.getCorporation() } catch { return }

	let priceMults = Object();
	for (let city of CITIES) {
		priceMults[city] = Object();
	}
	let lastTick = Date.now();
	let bootstrapMaterials = [];

	//while (await jobfair(ns));
	//	await adjustallwarehouses_oops(ns);
	await simpleCorp(ns, ["Agriculture"], true);
	ns.tprint("Bootstrapped.")
	// await simpleCorp(ns, ["Chemical", "Fishing", "Utilities", "Energy", "Mining"], false);

	for (let level = 1; level <= [0, 2, 2, 2, 2, 2][currentround(ns)]; level++) {
		for (let upgrade of ["DreamSense"]) {
			while (ns.corporation.getUpgradeLevel(upgrade) < level) {
				if (ns.corporation.getUpgradeLevelCost(upgrade) <= ns.corporation.getCorporation().funds) {
					ns.tprint(upgrade, ": ", level);
					ns.corporation.levelUpgrade(upgrade);
				} else {
					await jobfair(ns);
				}
			}
		}
	}


	// and now, Tobacco
	if (ns.corporation.getCorporation().divisions.map(x => x['type']).filter(x => x == productindustry).length == 0) {
		while (ns.corporation.getExpandIndustryCost(productindustry) > ns.corporation.getCorporation().funds) {
			await jobfair(ns);
		}
		ns.corporation.expandIndustry(productindustry, DIVISIONS[productindustry]);
		await adjustallwarehouses(ns);
	}

	// Expand to all cities
	for (let city of CITIES) {
		while (!ns.corporation.getCorporation().divisions.map(x => [x['type'], x['cities']]).filter(x => x[0] == productindustry)[0][1].includes(city)) {
			try {
				ns.tprint("Trying to expand " + productindustry + " to " + city);
				ns.corporation.expandCity(DIVISIONS[productindustry], city);
			} catch { await jobfair(ns); }
		}

		// Hire People
		ns.tprint("Hiring");
		//		while (ns.corporation.getOfficeSizeUpgradeCost(DIVISIONS[productindustry], city, 3) < ns.corporation.getCorporation().funds && ns.corporation.getOffice(DIVISIONS[productindustry], city)['employees'].length < 15) {
		while (ns.corporation.getOffice(DIVISIONS[productindustry], city)['employees'].length < 45) {
			if (ns.corporation.getOffice(DIVISIONS[productindustry], city)['employees'].length == ns.corporation.getOffice(DIVISIONS[productindustry], city).size) {
				while (ns.corporation.getOfficeSizeUpgradeCost(DIVISIONS[productindustry], city, 3) > ns.corporation.getCorporation().funds) {
					await jobfair(ns);
				}
				ns.corporation.upgradeOfficeSize(DIVISIONS[productindustry], city, 3);
			}
			let employee = ns.corporation.hireEmployee(DIVISIONS[productindustry], city);
			ns.tprint("Hired " + employee.name + " in " + city + " for " + DIVISIONS[productindustry]);
		}
		while (ns.corporation.hireEmployee(DIVISIONS[productindustry], city));
		ns.tprint("Hiring done.");
	}

	for (let city of CITIES) {
		ns.corporation.getDivision(DIVISIONS[productindustry])['products'].map(x => priceMults[city][x] == 1);
	}
	let lastoffer = 0;
	if (ns.corporation.getCorporation().public) {
		// Time to start getting paid
		ns.corporation.issueDividends(.1);
	}
	ns.tprint("Yay");
	while (true) {
		let didsomething = false;
		let warehouse = true;
		// Buy Wilson Analytics
		//		if (ns.corporation.hasResearched(DIVISIONS[productindustry], "Market-TA.II")) {
		while (ns.corporation.getUpgradeLevelCost("Wilson Analytics") <= ns.corporation.getCorporation().funds && (ns.corporation.getDivision(DIVISIONS[productindustry])['products'].length > 0 || ns.corporation.getUpgradeLevel("Wilson Analytics") < 10)) {
			ns.corporation.levelUpgrade("Wilson Analytics");
			ns.tprint("Upgraded Wilson Analytics: " + ns.corporation.getUpgradeLevel("Wilson Analytics").toString());
			didsomething = true;
		}
		//		} else {
		//while (ns.corporation.getUpgradeLevelCost("Project Insight") <= ns.corporation.getCorporation().funds && (ns.corporation.getDivision(DIVISIONS[productindustry])['products'].length > 0 || ns.corporation.getUpgradeLevel("Project Insight") < 100)) {
		//	ns.corporation.levelUpgrade("Project Insight");
		//	ns.tprint("Upgraded Project Insight: " + ns.corporation.getUpgradeLevel("Project Insight").toString());
		//	didsomething = true;
		//}
		//}

		// Warehouse Purchasing
		for (let industry of ns.corporation.getCorporation().divisions.map(x => x.type)) {
			for (let city of CITIES) {
				if (!ns.corporation.hasWarehouse(DIVISIONS[industry], city)) {
					if (ns.corporation.getPurchaseWarehouseCost() < ns.corporation.getCorporation().funds) {
						ns.tprint("Trying to get a " + industry + " warehouse in " + city);
						ns.corporation.purchaseWarehouse(DIVISIONS[industry], city);
						didsomething = true;
						warehouse = true;
					} else {
						await jobfair(ns);
					}
				}
			}
		}

		// The hiring at HQ / advert
		if (CITIES.map(city => ns.corporation.getOffice(DIVISIONS[productindustry], city).size).reduce((a, b) => { return a + b; }) < 1800) {
			while ((CITIES.map(city => ns.corporation.getOffice(DIVISIONS[productindustry], city).size).reduce((a, b) => { return a + b; }) < 1800) && ((ns.corporation.getCorporation().funds > Math.min(ns.corporation.getDivision(DIVISIONS[productindustry])['products'].length == 0 ? ns.corporation.getOfficeSizeUpgradeCost(DIVISIONS[productindustry], HQ, 3) : ns.corporation.getHireAdVertCost(DIVISIONS[productindustry]), ns.corporation.getOfficeSizeUpgradeCost(DIVISIONS[productindustry], HQ, 3))))) {
				if ((CITIES.map(city => ns.corporation.getOffice(DIVISIONS[productindustry], city).size).reduce((a, b) => { return a + b; }) < 1800) && (ns.corporation.getOfficeSizeUpgradeCost(DIVISIONS[productindustry], HQ, 3) <= ns.corporation.getHireAdVertCost(DIVISIONS[productindustry]))) {
					for (let city of CITIES) {
						if (ns.corporation.getOffice(DIVISIONS[productindustry], city).size < 300 && (ns.corporation.getOfficeSizeUpgradeCost(DIVISIONS[productindustry], city, 3) <= ns.corporation.getCorporation().funds)) {
							ns.tprint(productindustry + ": Upgrading Office Size at " + city);
							ns.corporation.upgradeOfficeSize(DIVISIONS[productindustry], city, 3);
							didsomething = true;
						} else {
							ns.tprint("City " + city + " " + ns.corporation.getCorporation().funds.toString() + " " + ns.corporation.getHireAdVertCost(DIVISIONS[productindustry]).toString() + " " + ns.corporation.getOfficeSizeUpgradeCost(DIVISIONS[productindustry], city, 3).toString());
						}
					}
				} else {
					ns.corporation.hireAdVert(DIVISIONS[productindustry]);
					didsomething = true;
				}
				await ns.sleep(0);
			}
			await ns.sleep(0)
		} else {
			try { while (ns.corporation.hireAdVert(DIVISIONS[productindustry])) didsomething = true; } catch { }
		}
		for (let city of CITIES) {
			if (ns.corporation.getOffice(DIVISIONS[productindustry], city).employees.length < ns.corporation.getOffice(DIVISIONS[productindustry], city).size) {
				let employee = ns.corporation.hireEmployee(DIVISIONS[productindustry], city);
				ns.tprint("Hired " + employee.name + " in " + city + " for " + DIVISIONS[productindustry]);
				didsomething = true;
			}
		}

		// Hi-Tech R&D Laboratory
		if (ns.corporation.getDivision(DIVISIONS[productindustry]).research >= ns.corporation.getResearchCost(DIVISIONS[productindustry], "Hi-Tech R&D Laboratory") && !ns.corporation.hasResearched(DIVISIONS[productindustry], "Hi-Tech R&D Laboratory")) {
			ns.corporation.research(DIVISIONS[productindustry], "Hi-Tech R&D Laboratory");
			ns.tprint(DIVISIONS[productindustry] + ": Acquired Hi-Tech R&D Laboratory");
			didsomething = true;
		}

		// Market-TA
		if (ns.corporation.getDivision(DIVISIONS[productindustry]).research >= (ns.corporation.getResearchCost(DIVISIONS[productindustry], "Market-TA.I") + ns.corporation.getResearchCost(DIVISIONS[productindustry], "Market-TA.II")) && !ns.corporation.hasResearched(DIVISIONS[productindustry], "Market-TA.I")) {
			ns.corporation.research(DIVISIONS[productindustry], "Market-TA.I");
			ns.corporation.research(DIVISIONS[productindustry], "Market-TA.II");
			ns.tprint(DIVISIONS[productindustry] + ": Market-TA");
			didsomething = true;
		}
		if (ns.corporation.hasResearched(DIVISIONS[productindustry], "Market-TA.II")) {
			CITIES.map(city => ns.corporation.getDivision(DIVISIONS[productindustry])['products'].map(x => ns.corporation.sellProduct(DIVISIONS[productindustry], city, x, "MAX", "0", true)));
			ns.corporation.getDivision(DIVISIONS[productindustry])['products'].map(x => ns.corporation.setProductMarketTA2(DIVISIONS[productindustry], x, true));
		}
		// Buy Project Insight
		//			if (ns.corporation.getCorporation().public) {
		//		if (!ns.corporation.hasResearched(DIVISIONS[productindustry], "Market-TA.II")) {
		if (ns.corporation.getUpgradeLevel("Project Insight") < 200 && (ns.corporation.getUpgradeLevelCost("Project Insight") <= ns.corporation.getCorporation().funds)) {
			ns.corporation.levelUpgrade("Project Insight");
			ns.tprint(DIVISIONS[productindustry] + ": Acquired Project Insight " + ns.corporation.getUpgradeLevel("Project Insight").toString());
			didsomething = true;
		}
		//		}
		//			}

		//			// Create more products
		//			for (let upgrade of ["uPgrade: Fulcrum", "uPgrade: Capacity.I", "uPgrade: Capacity.II"]) {
		//			if (ns.corporation.getDivision(DIVISIONS[productindustry]).research / 2 >= ns.corporation.getResearchCost(DIVISIONS[productindustry], upgrade) && !ns.corporation.hasResearched(DIVISIONS[productindustry], upgrade)) {
		//					ns.corporation.research(DIVISIONS[productindustry], upgrade);
		//				}
		//			}
		//		}
		//		if (ns.corporation.hasResearched(DIVISIONS[productindustry], "Market-TA.II")) {
		for (let upgrade of ["FocusWires", "Neural Accelerators", "Speech Processor Implants", "Nuoptimal Nootropic Injector Implants", "Project Insight", "Smart Factories", "Smart Storage", "ABC SalesBots", "DreamSense"]) {
			if (ns.corporation.getUpgradeLevel(upgrade) < [0, 2, 20, 100, 150, 200][currentround(ns)] && ns.corporation.getUpgradeLevelCost(upgrade) <= ns.corporation.getCorporation().funds) {
				ns.corporation.levelUpgrade(upgrade);
				ns.tprint(upgrade, ": ", ns.corporation.getUpgradeLevel(upgrade));
			}
		}

		//		}
		// Then, the products
		if (ns.corporation.getDivision(DIVISIONS[productindustry])['products'].length == 0 || ns.corporation.getProduct(DIVISIONS[productindustry], ns.corporation.getDivision(DIVISIONS[productindustry])['products'][ns.corporation.getDivision(DIVISIONS[productindustry])['products'].length - 1]).developmentProgress > 90) {
			if (ns.corporation.getDivision(DIVISIONS[productindustry])['products'].length > 0) {
				for (let city of CITIES) {
					priceMults[city][ns.corporation.getDivision(DIVISIONS[productindustry])['products'][ns.corporation.getDivision(DIVISIONS[productindustry])['products'].length - 1]] = 1;
				}
			}
			ns.tprint("Product time?");
			if (ns.corporation.getDivision(DIVISIONS[productindustry])['products'].length == 0) {
				while (ns.corporation.getCorporation().funds < 2000000000) {
					await jobfair(ns);
				}
				let newProductName = PRODUCTS[productindustry].filter(x => !ns.corporation.getDivision(DIVISIONS[productindustry])['products'].includes(x))[0];
				ns.corporation.makeProduct(DIVISIONS[productindustry], HQ, newProductName, ns.corporation.getDivision(DIVISIONS[productindustry])['products'].length == 0 ? 1000000000 : ns.corporation.getCorporation().funds / 2, ns.corporation.getDivision(DIVISIONS[productindustry])['products'].length == 0 ? 1000000000 : ns.corporation.getCorporation().funds / 2);
			} else {
				while (ns.corporation.getCorporation().funds < Math.min(10e80, Math.max(2000000000, ns.corporation.getHireAdVertCost(DIVISIONS[productindustry]))) || (ns.corporation.getDivision(DIVISIONS[productindustry])['products'].length > 0 && ns.corporation.getProduct(DIVISIONS[productindustry], ns.corporation.getDivision(DIVISIONS[productindustry])['products'][ns.corporation.getDivision(DIVISIONS[productindustry])['products'].length - 1]).developmentProgress < 100)) {
					// Price Adjusting
					if (!ns.corporation.hasResearched(DIVISIONS[productindustry], "Market-TA.II")) {
						if (lastTick + 10000 < Date.now()) {
							lastTick = Date.now();
							for (let product of ns.corporation.getDivision(DIVISIONS[productindustry])['products']) {
								let z = 0;
								for (let city of CITIES) {
									priceMults[city][product] = priceMults[city][product] ? priceMults[city][product] : 1;
									if (Object.values(ns.corporation.getProduct(DIVISIONS[productindustry], product).cityData).map(x => x[0]).reduce((a, b) => { return a + b; }) > 0) {
										z = z - 1;
									} else {
										z = z + 1;
									}
								}
								for (let city of CITIES) {
									priceMults[city][product] = priceMults[city][product] ? priceMults[city][product] : 1;
									if (z < 1) {
										priceMults[city][product] = Math.max(1, priceMults[city][product] - 1);
									}
									if (z > 1) {
										priceMults[city][product] = Math.max(1, priceMults[city][product] + 1);
									}
									ns.corporation.sellProduct(DIVISIONS[productindustry], HQ, product, "MAX", priceMults[city][product].toString() + "*MP", true);
								}
							}
						}
					}

					await jobfair(ns);
				}
				ns.tprint("Product time.");
				if (ns.corporation.getDivision(DIVISIONS[productindustry])['products'].length == (3 + (ns.corporation.hasResearched(DIVISIONS[productindustry], "uPgrade: Capacity.I") ? 1 : 0) + (ns.corporation.hasResearched(DIVISIONS[productindustry], "uPgrade: Capacity.II") ? 1 : 0))) {
					ns.corporation.discontinueProduct(DIVISIONS[productindustry], ns.corporation.getDivision(DIVISIONS[productindustry])['products'].map(x => [ns.corporation.getProduct(DIVISIONS[productindustry], x)['properties'].qlt, x]).sort((a, b) => a[0] - b[0])[0][1]);
				}
				let newProductName = PRODUCTS[productindustry].filter(x => !ns.corporation.getDivision(DIVISIONS[productindustry])['products'].includes(x))[0];
				if (ns.corporation.getDivision(DIVISIONS[productindustry])['products'].length > 0) {
					for (let city of CITIES) {
						priceMults[city][ns.corporation.getDivision(DIVISIONS[productindustry])['products'][ns.corporation.getDivision(DIVISIONS[productindustry])['products'].length - 1]] = 1;
					}
				}
				ns.corporation.makeProduct(DIVISIONS[productindustry], HQ, newProductName, ns.corporation.getDivision(DIVISIONS[productindustry])['products'].length == 0 ? 1000000000 : ns.corporation.getCorporation().funds / 2, ns.corporation.getDivision(DIVISIONS[productindustry])['products'].length == 0 ? 1000000000 : ns.corporation.getCorporation().funds / 2);
				didsomething = true;
			}
		}

		// Price Adjusting
		if (!ns.corporation.hasResearched(DIVISIONS[productindustry], "Market-TA.II")) {
			if (lastTick + 10000 < Date.now()) {
				lastTick = Date.now();
				for (let product of ns.corporation.getDivision(DIVISIONS[productindustry])['products']) {
					let z = 0;
					for (let city of CITIES) {
						priceMults[city][product] = priceMults[city][product] ? priceMults[city][product] : 1;
						if (Object.values(ns.corporation.getProduct(DIVISIONS[productindustry], product).cityData).map(x => x[0]).reduce((a, b) => { return a + b; }) > 0) {
							z = z - 1;
						} else {
							z = z + 1;
						}
					}
					for (let city of CITIES) {
						priceMults[city][product] = priceMults[city][product] ? priceMults[city][product] : 1;
						if (z < 1) {
							priceMults[city][product] = Math.max(1, priceMults[city][product] - 1);
						}
						if (z > 1) {
							priceMults[city][product] = Math.max(1, priceMults[city][product] + 1);
						}
						ns.corporation.sellProduct(DIVISIONS[productindustry], HQ, product, "MAX", priceMults[city][product].toString() + "*MP", true);
					}
				}
			}
		}

		await adjustallwarehouses(ns);

		// Third round of investing
		if (ns.corporation.getInvestmentOffer().round <= 3) {
			if (lastoffer != ns.corporation.getInvestmentOffer().funds) {
				ns.tprint("Third round offer? " + ns.corporation.getInvestmentOffer().funds.toString(), " ", (100 * ns.corporation.getInvestmentOffer().funds / 800000000000000).toString());
				lastoffer = ns.corporation.getInvestmentOffer().funds;
			}
			if (ns.corporation.getInvestmentOffer().funds > OFFERS[2]) {
				while (CITIES.map(city => ns.corporation.getUpgradeWarehouseCost(DIVISIONS[productindustry], city)).reduce((a, b) => { return Math.min(a, b) }) < ns.corporation.getCorporation().funds) {
					let warehouses = CITIES.map(city => [ns.corporation.getUpgradeWarehouseCost(DIVISIONS[productindustry], city), city]).sort((a, b) => { return a[0] - b[0] });
					ns.corporation.upgradeWarehouse(DIVISIONS[productindustry], warehouses[0][1]);
					warehouse = true;
				}
				await fraud(ns);
				ns.tprint("Accepting offer.");
				ns.tprint("Third round offer! " + ns.corporation.getInvestmentOffer().funds.toString(), " ", (100 * ns.corporation.getInvestmentOffer().funds / OFFERS[2]).toString());
				ns.corporation.acceptInvestmentOffer();
			}
		}

		// Fourth round of investing
		if (ns.corporation.getInvestmentOffer().round == 4) {
			if (lastoffer != ns.corporation.getInvestmentOffer().funds) {
				ns.tprint("Fourth round offer? " + ns.corporation.getInvestmentOffer().funds.toString(), " ", (100 * ns.corporation.getInvestmentOffer().funds / OFFERS[3]).toString());
				lastoffer = ns.corporation.getInvestmentOffer().funds;
			}
			if (ns.corporation.getInvestmentOffer().funds > OFFERS[3]) {
				while (CITIES.map(city => ns.corporation.getUpgradeWarehouseCost(DIVISIONS[productindustry], city)).reduce((a, b) => { return Math.min(a, b) }) < ns.corporation.getCorporation().funds) {
					let warehouses = CITIES.map(city => [ns.corporation.getUpgradeWarehouseCost(DIVISIONS[productindustry], city), city]).sort((a, b) => { return a[0] - b[0] });
					ns.corporation.upgradeWarehouse(DIVISIONS[productindustry], warehouses[0][1]);
					warehouse = true;
				}
				await fraud(ns);
				ns.tprint("Accepting offer.");
				ns.tprint("Fourth round offer! " + ns.corporation.getInvestmentOffer().funds.toString(), " ", (100 * ns.corporation.getInvestmentOffer().funds / 1000000000000000).toString());
				ns.corporation.acceptInvestmentOffer();
				ns.corporation.goPublic(0);
				ns.corporation.issueDividends(.1);
			}
		}
		if (!didsomething) {
			await jobfair(ns);
		}
	}

	ns.tprint("Done");
	ns.tprint(ns.corporation.getCorporation());
	ns.tprint(ns.corporation.getDivision(DIVISIONS[productindustry]));
}