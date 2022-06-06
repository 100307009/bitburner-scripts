//import { log, getConfiguration, getFilePath, waitForProcessToComplete, runCommand, getNsDataThroughFile } from './helpers.js'

const ran_flag = "/Temp/ran-casino.txt"
let doc = eval("document");
let options;
const argsSchema = [
	['save-sleep-time', 10], // Time to sleep in milliseconds after saving. If you are having trouble with your automatic saves not "taking effect" try increasing this.
	['click-sleep-time', 1], // Time to sleep in milliseconds after clicking any button (or setting text). Increase if your are getting errors on click.
	['use-basic-strategy', false], // Set to true to use the basic strategy (Stay on 17+)
	['enable-logging', false], // Set to true to pop up a tail window and generate logs.
	['kill-all-scripts', false], // Set to true to kill all running scripts before running.
	['no-deleting-remote-files', false], // By default, if --kill-all-scripts, we will also remove remote files to speed up save/reload
	['on-completion-script', null], // Spawn this script when max-charges is reached
	['on-completion-script-args', []], // Optional args to pass to the script when launched
];
export function autocomplete(data, args) {
	data.flags(argsSchema);
	const lastFlag = args.length > 1 ? args[args.length - 2] : null;
	if (["--on-completion-script"].includes(lastFlag))
		return data.scripts;
	return [];
}

/** Helper to log a message, and optionally also tprint it and toast it
 * @param {NS} ns - The nestcript instance passed to your script's main entry point */
export function log(ns, message = "", alsoPrintToTerminal = false, toastStyle = "", maxToastLength = Number.MAX_SAFE_INTEGER) {
	checkNsInstance(ns, '"log"');
	ns.print(message);
	if (toastStyle) ns.toast(message.length <= maxToastLength ? message : message.substring(0, maxToastLength - 3) + "...", toastStyle);
	if (alsoPrintToTerminal) {
		ns.tprint(message);
		// TODO: Find a way write things logged to the terminal to a "permanent" terminal log file, preferably without this becoming an async function.
		//ns.write("log.terminal.txt", message + '\n', 'a'); // Note: we should get away with not awaiting this promise since it's not a script file
	}
	return message;
}

export function getConfiguration(ns, argsSchema) {
	checkNsInstance(ns, '"getConfig"');
	const scriptName = ns.getScriptName();
	// If the user has a local config file, override the defaults in the argsSchema
	const confName = `${scriptName}.config.txt`;
	const overrides = ns.read(confName);
	const overriddenSchema = overrides ? [...argsSchema] : argsSchema; // Clone the original args schema    
	if (overrides) {
		try {
			let parsedOverrides = JSON.parse(overrides); // Expect a parsable dict or array of 2-element arrays like args schema
			if (Array.isArray(parsedOverrides)) parsedOverrides = Object.fromEntries(parsedOverrides);
			log(ns, `INFO: Applying ${Object.keys(parsedOverrides).length} overriding default arguments from "${confName}"...`);
			for (const key in parsedOverrides) {
				const override = parsedOverrides[key];
				const matchIndex = overriddenSchema.findIndex(o => o[0] == key);
				const match = matchIndex === -1 ? null : overriddenSchema[matchIndex];
				if (!match)
					throw `Unrecognized key "${key}" does not match of this script's options: ` + JSON.stringify(argsSchema.map(a => a[0]));
				else if (override === undefined)
					throw `The key "${key}" appeared in the config with no value. Some value must be provided. Try null?`;
				else if (match && JSON.stringify(match[1]) != JSON.stringify(override)) {
					if (typeof (match[1]) !== typeof (override))
						log(ns, `WARNING: The "${confName}" overriding "${key}" value: ${JSON.stringify(override)} has a different type (${typeof override}) than the ` +
							`current default value ${JSON.stringify(match[1])} (${typeof match[1]}). The resulting behaviour may be unpredictable.`, false, 'warning');
					else
						log(ns, `INFO: Overriding "${key}" value: ${JSON.stringify(match[1])}  ->  ${JSON.stringify(override)}`);
					overriddenSchema[matchIndex] = { ...match }; // Clone the (previously shallow-copied) object at this position of the new argsSchema
					overriddenSchema[matchIndex][1] = override; // Update the value of the clone.
				}
			}
		} catch (err) {
			log(ns, `ERROR: There's something wrong with your config file "${confName}", it cannot be loaded.` +
				`\nThe error encountered was: ${(typeof err === 'string' ? err : err.message || JSON.stringify(err))}` +
				`\nYour config file should either be a dictionary e.g.: { "string-opt": "value", "num-opt": 123, "array-opt": ["one", "two"] }` +
				`\nor an array of dict entries (2-element arrays) e.g.: [ ["string-opt", "value"], ["num-opt", 123], ["array-opt", ["one", "two"]] ]` +
				`\n"${confName}" contains:\n${overrides}`, true, 'error', 80);
			return null;
		}
	}
	// Return the result of using the in-game args parser to combine the defaults with the command line args provided
	try {
		const finalOptions = ns.flags(overriddenSchema);
		log(ns, `INFO: Running ${scriptName} with the following settings:` + Object.keys(finalOptions).filter(a => a != "_").map(a =>
			`\n  ${a.length == 1 ? "-" : "--"}${a} = ${finalOptions[a] === null ? "null" : JSON.stringify(finalOptions[a])}`).join("") +
			`\nrun ${scriptName} --help  to get more information about these options.`)
		return finalOptions;
	} catch (err) { // Detect if the user passed invalid arguments, and return help text
		const error = ns.args.includes("help") || ns.args.includes("--help") ? null : // Detect if the user explictly asked for help and suppress the error
			(typeof err === 'string' ? err : err.message || JSON.stringify(err));
		// Try to parse documentation about each argument from the source code's comments
		const source = ns.read(scriptName).split("\n");
		let argsRow = 1 + source.findIndex(row => row.includes("argsSchema ="));
		const optionDescriptions = {}
		while (argsRow && argsRow < source.length) {
			const nextArgRow = source[argsRow++].trim();
			if (nextArgRow.length == 0) continue;
			if (nextArgRow[0] == "]" || nextArgRow.includes(";")) break; // We've reached the end of the args schema
			const commentSplit = nextArgRow.split("//").map(e => e.trim());
			if (commentSplit.length != 2) continue; // This row doesn't appear to be in the format: [option...], // Comment
			const optionSplit = commentSplit[0].split("'"); // Expect something like: ['name', someDefault]. All we need is the name
			if (optionSplit.length < 2) continue;
			optionDescriptions[optionSplit[1]] = commentSplit[1];
		}
		log(ns, (error ? `ERROR: There was an error parsing the script arguments provided: ${error}\n` : 'INFO: ') +
			`${scriptName} possible arguments:` + argsSchema.map(a => `\n  ${a[0].length == 1 ? " -" : "--"}${a[0].padEnd(30)} ` +
				`Default: ${(a[1] === null ? "null" : JSON.stringify(a[1])).padEnd(10)}` +
				(a[0] in optionDescriptions ? ` // ${optionDescriptions[a[0]]}` : '')).join("") + '\n' +
			`\nTip: All argument names, and some values support auto-complete. Hit the <tab> key to autocomplete or see possible options.` +
			`\nTip: Array arguments are populated by specifying the argument multiple times, e.g.:` +
			`\n       run ${scriptName} --arrayArg first --arrayArg second --arrayArg third  to run the script with arrayArg=[first, second, third]` +
			(!overrides ? `\nTip: You can override the default values by creating a config file named "${confName}" containing e.g.: { "arg-name": "preferredValue" }`
				: overrides && !error ? `\nNote: The default values are being modified by overrides in your local "${confName}":\n${overrides}`
					: `\nThis error may have been caused by your local overriding "${confName}" (especially if you changed the types of any options):\n${overrides}`), true);
		return null; // Caller should handle null and shut down elegantly.
	}
}

/** Gets the path for the given local file, taking into account optional subfolder relocation via git-pull.js **/
export function getFilePath(file) {
	const subfolder = '';  // git-pull.js optionally modifies this when downloading
	return pathJoin(subfolder, file);
}

/**
 * Wait for a process id to complete running
 * Importing incurs a maximum of 0.1 GB RAM (for ns.isRunning) 
 * @param {NS} ns - The nestcript instance passed to your script's main entry point
 * @param {int} pid - The process id to monitor
 * @param {bool=} verbose - (default false) If set to true, pid and result of command are logged.
 **/
export async function waitForProcessToComplete(ns, pid, verbose) {
	checkNsInstance(ns, '"waitForProcessToComplete"');
	if (!verbose) disableLogs(ns, ['isRunning']);
	return await waitForProcessToComplete_Custom(ns, ns.isRunning, pid, verbose);
}

/**
 * An advanced version of waitForProcessToComplete that lets you pass your own "isAlive" test to reduce RAM requirements (e.g. to avoid referencing ns.isRunning)
 * Importing incurs 0 GB RAM (assuming fnIsAlive is implemented using another ns function you already reference elsewhere like ns.ps) 
 * @param {NS} ns - The nestcript instance passed to your script's main entry point
 * @param {function} fnIsAlive - A single-argument function used to start the new sript, e.g. `ns.isRunning` or `pid => ns.ps("home").some(process => process.pid === pid)`
 **/
export async function waitForProcessToComplete_Custom(ns, fnIsAlive, pid, verbose) {
	checkNsInstance(ns, '"waitForProcessToComplete_Custom"');
	if (!verbose) disableLogs(ns, ['asleep']);
	// Wait for the PID to stop running (cheaper than e.g. deleting (rm) a possibly pre-existing file and waiting for it to be recreated)
	let start = Date.now();
	for (var retries = 0; retries < 1000; retries++) {
		if (!fnIsAlive(pid)) break; // Script is done running
		if (verbose && retries % 100 === 0) ns.print(`Waiting for pid ${pid} to complete... (${formatDuration(Date.now() - start)})`);
		await ns.asleep(10);
	}
	// Make sure that the process has shut down and we haven't just stopped retrying
	if (fnIsAlive(pid)) {
		let errorMessage = `run-command pid ${pid} is running much longer than expected. Max retries exceeded.`;
		ns.print(errorMessage);
		throw errorMessage;
	}
}

/** Evaluate an arbitrary ns command by writing it to a new script and then running or executing it.
 * @param {NS} ns - The nestcript instance passed to your script's main entry point
 * @param {string} command - The ns command that should be invoked to get the desired data (e.g. "ns.getServer('home')" )
 * @param {string=} fileName - (default "/Temp/{commandhash}-data.txt") The name of the file to which data will be written to disk by a temporary process
 * @param {args=} args - args to be passed in as arguments to command being run as a new script.
 * @param {bool=} verbose - (default false) If set to true, the evaluation result of the command is printed to the terminal
 */
export async function runCommand(ns, command, fileName, args = [], verbose = false, maxRetries = 5, retryDelayMs = 50) {
	checkNsInstance(ns, '"runCommand"');
	if (!verbose) disableLogs(ns, ['run']);
	return await runCommand_Custom(ns, ns.run, command, fileName, args, verbose, maxRetries, retryDelayMs);
}

/** Joins all arguments as components in a path, e.g. pathJoin("foo", "bar", "/baz") = "foo/bar/baz" **/
export function pathJoin(...args) {
	return args.filter(s => !!s).join('/').replace(/\/\/+/g, '/');
}

/** @param {NS} ns **/
export function disableLogs(ns, listOfLogs) { ['disableLog'].concat(...listOfLogs).forEach(log => checkNsInstance(ns, '"disableLogs"').disableLog(log)); }


/**
 * Retrieve the result of an ns command by executing it in a temporary .js script, writing the result to a file, then shuting it down
 * Importing incurs a maximum of 1.1 GB RAM (0 GB for ns.read, 1 GB for ns.run, 0.1 GB for ns.isRunning).
 * Has the capacity to retry if there is a failure (e.g. due to lack of RAM available). Not recommended for performance-critical code.
 * @param {NS} ns - The nestcript instance passed to your script's main entry point
 * @param {string} command - The ns command that should be invoked to get the desired data (e.g. "ns.getServer('home')" )
 * @param {string=} fName - (default "/Temp/{commandhash}-data.txt") The name of the file to which data will be written to disk by a temporary process
 * @param {args=} args - args to be passed in as arguments to command being run as a new script.
 * @param {bool=} verbose - (default false) If set to true, pid and result of command are logged.
 **/
export async function getNsDataThroughFile(ns, command, fName, args = [], verbose = false, maxRetries = 5, retryDelayMs = 50) {
	checkNsInstance(ns, '"getNsDataThroughFile"');
	if (!verbose) disableLogs(ns, ['run', 'isRunning']);
	return await getNsDataThroughFile_Custom(ns, ns.run, ns.isRunning, command, fName, args, verbose, maxRetries, retryDelayMs);
}
/** @param {NS} ns 
 * Returns a helpful error message if we forgot to pass the ns instance to a function */
export function checkNsInstance(ns, fnName = "this function") { if (!ns.print) throw `The first argument to ${fnName} should be a 'ns' instance.`; return ns; }

/**
 * An advanced version of getNsDataThroughFile that lets you pass your own "fnRun" and "fnIsAlive" implementations to reduce RAM requirements
 * Importing incurs no RAM (now that ns.read is free) plus whatever fnRun / fnIsAlive you provide it
 * Has the capacity to retry if there is a failure (e.g. due to lack of RAM available). Not recommended for performance-critical code.
 * @param {NS} ns - The nestcript instance passed to your script's main entry point
 * @param {function} fnRun - A single-argument function used to start the new sript, e.g. `ns.run` or `(f,...args) => ns.exec(f, "home", ...args)`
 * @param {function} fnIsAlive - A single-argument function used to start the new sript, e.g. `ns.isRunning` or `pid => ns.ps("home").some(process => process.pid === pid)`
 * @param {args=} args - args to be passed in as arguments to command being run as a new script.
 **/
export async function getNsDataThroughFile_Custom(ns, fnRun, fnIsAlive, command, fName, args = [], verbose = false, maxRetries = 5, retryDelayMs = 50) {
	checkNsInstance(ns, '"getNsDataThroughFile_Custom"');
	if (!verbose) disableLogs(ns, ['read']);
	const commandHash = hashCode(command);
	fName = fName || `/Temp/${commandHash}-data.txt`;
	const fNameCommand = (fName || `/Temp/${commandHash}-command`) + '.js'
	// Defend against stale data by pre-writing the file with invalid data TODO: Remove if this condition is never encountered
	await ns.write(fName, "STALE", 'w');
	// Prepare a command that will write out a new file containing the results of the command
	// unless it already exists with the same contents (saves time/ram to check first)
	// If an error occurs, it will write an empty file to avoid old results being misread.
	const commandToFile = `let result="";try{result=JSON.stringify(
        ${command}
        );}catch{} const f="${fName}"; if(ns.read(f)!=result) await ns.write(f,result,'w')`;
	// Run the command with auto-retries if it fails
	const pid = await runCommand_Custom(ns, fnRun, commandToFile, fNameCommand, args, false, maxRetries, retryDelayMs);
	// Wait for the process to complete
	await waitForProcessToComplete_Custom(ns, fnIsAlive, pid, verbose);
	if (verbose) ns.print(`Process ${pid} is done. Reading the contents of ${fName}...`);
	// Read the file, with auto-retries if it fails
	let lastRead;
	try {
		const fileData = await autoRetry(ns, () => ns.read(fName), f => (lastRead = f) !== undefined && f !== "" && f !== "STALE",
			() => `ns.read('${fName}') returned no result ("${lastRead}") (command likely failed to run).` +
				`\n  Command: ${command}\n  Script: ${fNameCommand}` +
				`\nEnsure you have sufficient free RAM to run this temporary script.`,
			maxRetries, retryDelayMs, undefined, verbose);
		if (verbose) ns.print(`Read the following data for command ${command}:\n${fileData}`);
		return JSON.parse(fileData); // Deserialize it back into an object/array and return
	} finally {
		// If we failed to run the command, clear the "stale" contents we created earlier. Ideally, we would remove the file entirely, but this is not free.
		if (lastRead == "STALE") await ns.write(fName, "", 'w');
	}
}

let _ns; // Lazy global copy of ns so we can sleep in the click handler

/** @param {NS} ns 
 *  Super recommend you kill all other scripts before starting this up. **/
export async function main(ns) {
	options = getConfiguration(ns, argsSchema);
	if (!options) return; // Invalid options, or ran in --help mode.
	_ns = ns;
	const saveSleepTime = options['save-sleep-time'];
	if (options['enable-logging'])
		ns.tail()
	else
		ns.disableLog("ALL");

	// Step 1: Go to Aevum if we aren't already there. (Must be done manually if you don't have SF4)
	if (ns.getPlayer().city != "Aevum") {
		return ns.tprint("ERROR: You must travel to to Aevum to use this script");
	}
	await ns.sleep(100)
	// Helper function to detect if the "Stop [[faction|company] work|styding|training]" etc... button from the focus screen is up
	const checkForFocusScreen = () =>
		find("//button[contains(text(), 'Stop playing')]") ? false : // False positive, casino "stop" button, no problems here
			find("//button[contains(text(), 'Stop')]"); // Otherwise, a button with "Stop" on it is probably from the work screen

	// Step 2: Navigate to the City Casino
	try { // Try to do this without SF4, because it's faster and doesn't require a temp script to be cleaned up below
		const btnStopAction = checkForFocusScreen();
		if (btnStopAction) // If we were performing an action unfocused, it will be focused on restart and we must stop that action to navigate.
			await click(btnStopAction);
		// Click our way to the city casino
		await click(find("//div[(@role = 'button') and (contains(., 'City'))]"));
		await click(find("//span[@aria-label = 'Iker Molina Casino']"));
	} catch { // Use SF4 as a fallback, it's more reliable.
		try { await getNsDataThroughFile(ns, 'ns.goToLocation("Iker Molina Casino")', '/Temp/go-to-location.txt'); }
		catch { return ns.tprint("ERROR: Failed to travel to the casino both using UI navigation and using SF4 as a fall-back."); }
	}
	// Pick the game we wish to automate (Blackjack)
	await click(find("//button[contains(text(), 'blackjack')]"));

	// Step 3: Get some buttons we will need to play blackjack
	const inputWager = find("//input[@value = 1000000]");
	const btnStartGame = find("//button[text() = 'Start']");
	const btnSaveGame = find("//button[@aria-label = 'save game']");

	// Step 4: Clean up temp files and kill other running scripts to speed up the reload cycle
	if (ns.ls("home", "/Temp/").length > 0) { // Do a little clean-up to speed up save/load.
		// Step 4.5: Test that we aren't already kicked out of the casino before doing drastic things like killing scripts
		await setText(inputWager, `1`); // Bet just a dollar and quick the game right away, no big deal
		await click(btnStartGame);
		if (find("//p[contains(text(), 'Count:')]")) {
			const btnStay = find("//button[text() = 'Stay']");
			if (btnStay) await click(btnStay); // Trigger the game to end if we didn't instantly win/lose our $1 bet.
		} else {
			// Because we haven't killed scripts yet, it's possible another script stole focus again. Detect and handle that case.
			if (checkForFocusScreen())
				return ns.tprint("ERROR: It looks like something stole focus while we were trying to automate the casino. Please try again.");
			await ns.write(ran_flag, true, "w"); // Write a flag other scripts can check for indicating we think we've been kicked out of the casino.
			return ns.tprint("INFO: We've appear to already have been previously kicked out of the casino.");
		}
		// Kill all other scripts if enabled (note, we assume that if the temp folder is empty, they're already killed and this is a reload)
		if (options['kill-all-scripts'])
			await killAllOtherScripts(ns, !options['no-deleting-remote-files']);
		// Clear the temp folder on home (all transient scripts / outputs)
		await waitForProcessToComplete(ns, ns.run(getFilePath('cleanup.js')));
	}

	// Step 5: Save the fact that this script is now running, so that future reloads start this script back up immediately.
	if (saveSleepTime) await ns.asleep(saveSleepTime); // Anecdotally, some users report the first save is "stale" (doesn't include blackjack.js running). Maybe this delay helps?
	await click(btnSaveGame);
	if (saveSleepTime) await ns.asleep(saveSleepTime);

	// Step 6: Play until we lose
	while (true) {
		const bet = Math.min(1E8, ns.getPlayer().money * 0.9 /* Avoid timing issues with other scripts spending money */);
		await setText(inputWager, `${bet}`);
		await click(btnStartGame);
		const btnHit = find("//button[text() = 'Hit']");
		const btnStay = find("//button[text() = 'Stay']");
		let won;
		do { // Inner-loop to play a single hand
			won = find("//p[contains(text(), 'lost')]") ? false : // Detect whether we lost or won. Annoyingly, when we win with blackjack, "Won" is Title-Case.
				find("//p[contains(text(), 'won')]") || find("//p[contains(text(), 'Won')]") ? true : null;
			if (won === null) {
				if (find("//p[contains(text(), 'Tie')]")) break; // If we tied, break and start a new hand.
				const txtCount = find("//p[contains(text(), 'Count:')]");
				if (!txtCount) { // If we can't find the count, we've either been kicked out, or maybe routed to another screen.
					return checkForFocusScreen() /* Detect the case where we started working/training */ ?
						ns.tprint("ERROR: It looks like something stole focus while we were trying to automate the casino. Please try again.") :
						await onCompletion(ns); // Otherwise, assume we've been kicked out of the casino for having stolen the max 10b
				}
				const allCounts = txtCount.querySelectorAll('span');
				const highCount = Number(allCounts[allCounts.length - 1].innerText);
				const shouldHit = options['use-basic-strategy'] ? highCount < 17 : shouldHitAdvanced(ns, txtCount);
				if (options['enable-logging']) ns.print(`INFO: Count is ${highCount}, we will ${shouldHit ? 'Hit' : 'Stay'}`);
				await click(shouldHit ? btnHit : btnStay);
				await ns.sleep(1); // Yeild for an instant so the UI can update and process events
			}
		} while (won === null);
		if (won === null) continue; // Only possible if we tied and broke out early. Start a new hand.
		if (!won) { // Reload if we lost
			eval("window").onbeforeunload = null; // Disable the unsaved changes warning before reloading
			await ns.sleep(saveSleepTime); // Yeild execution for an instant incase the game needs to finish a save or something
			location.reload(); // Force refresh the page without saving           
			return await ns.asleep(10000); // Keep the script alive to be safe. Presumably the page reloads before this completes.
		}
		await click(btnSaveGame); // Save if we won
		if (saveSleepTime) await ns.asleep(saveSleepTime);
	}
}

/** @param {NS} ns 
 *  Helper to kill all scripts on all other servers, except this one **/
async function killAllOtherScripts(ns, removeRemoteFiles) {
	// Kill processes on home (except this one)
	const thisScript = ns.getScriptName();
	const otherPids = ns.ps().filter(p => p.filename != thisScript).map(p => p.pid);
	let pid = await runCommand(ns, 'ns.args.forEach(pid => ns.kill(pid))',
		'/Temp/kill-scripts-by-id.js', otherPids);
	await waitForProcessToComplete(ns, pid);
	log(ns, `INFO: Killed ${otherPids.length} other scripts running on home...`, true);

	// Kill processes on all other servers
	const allServers = await getNsDataThroughFile(ns, 'scanAllServers(ns)', '/Temp/scanAllServers.txt');
	const serversExceptHome = allServers.filter(s => s != "home");
	pid = await runCommand(ns, 'ns.args.forEach(host => ns.killall(host))',
		'/Temp/kill-all-scripts-on-servers.js', serversExceptHome);
	await waitForProcessToComplete(ns, pid);
	log(ns, 'INFO: Killed all scripts running on other hosts...', true);

	// If enabled, remove files on all other servers
	if (removeRemoteFiles) {
		pid = await runCommand(ns, 'ns.args.forEach(host => ns.ls(host).forEach(file => ns.rm(file, host)))',
			'/Temp/delete-files-on-servers.js', serversExceptHome)
		await waitForProcessToComplete(ns, pid);
		log(ns, 'INFO: Removed all files on other hosts...', true)
	}
}

/** @param {NS} ns 
 *  Run when we can no longer gamble at the casino (presumably because we've been kicked out) **/
async function onCompletion(ns) {
	await ns.write(ran_flag, true, "w"); // Write an file indicating we think we've been kicked out of the casino.
	ns.tprint("SUCCESS: We've been kicked out of the casino.");

	// Run the completion script before shutting down    
	let completionScript = options['on-completion-script'];
	if (!completionScript) return;
	let completionArgs = options['on-completion-script-args'];
	if (ns.run(completionScript, 1, ...completionArgs))
		log(ns, `INFO: casino.js shutting down and launching ${completionScript}...`, false, 'info');
	else
		log(ns, `WARNING: casino.js shutting down, but failed to launch ${completionScript}...`, false, 'warning');
}

// Some DOM helpers (partial credit to @ShamesBond)
async function click(elem) {
	await elem[Object.keys(elem)[1]].onClick({ isTrusted: true });
	if (options['click-sleep-time']) await _ns.asleep(options['click-sleep-time']);
}
async function setText(input, text) {
	await input[Object.keys(input)[1]].onChange({ isTrusted: true, target: { value: text } });
	if (options['click-sleep-time']) await _ns.asleep(options['click-sleep-time']);
}
function find(xpath) { return doc.evaluate(xpath, doc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue; }

// Better logic for when to HIT / STAY (Partial credit @drider)
function shouldHitAdvanced(ns, playerCountElem) {
	const txtPlayerCount = playerCountElem.textContent.substring(7);
	const player = parseInt(txtPlayerCount.match(/\d+/).shift());
	const dealer = getDealerCount();
	if (options['enable-logging']) ns.print(`Player Count Text: ${txtPlayerCount}, Player: ${player}, Dealer: ${dealer}`);
	// Strategy to minimize house-edge. See https://wizardofodds.com/blackjack/images/bj_4d_s17.gif
	if (txtPlayerCount.includes("or")) { // Player has an Ace
		if (player >= 9) return false; // Stay on Soft 19 or higher
		if (player == 8 && dealer <= 8) return false; // Soft 18 - Stay if dealer has 8 or less
		return true; // Otherwise, hit on Soft 17 or less
	}
	if (player >= 17) return false; // Stay on Hard 17 or higher
	if (player >= 13 && dealer <= 6) return false; // Stay if player has 13-16 and dealer shows 6 or less.
	if (player == 12 && 4 <= dealer && dealer <= 6) return false; // Stay if player has 12 and dealer has 4 to 6	
	return true;// Otherwise Hit
}
function getDealerCount() {
	const text = find("//p[contains(text(), 'Dealer')]/..").innerText.substring(8, 9);
	let cardValue = parseInt(text);
	return isNaN(cardValue) ? (text == 'A' ? 11 : 10) : cardValue;
}