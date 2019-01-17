// Script (C) 2012 by Mark Rosenfelder.
// You can modify the code for non-commercial use; 
// attribution would be nice.
// If you want to make money off it, please contact me.

// Modified by Jason Tamez 2017-2019.
// Code available here: https://github.com/jasontamez/wordgen

var NLEX  = 150,
NSENT = 30,
word,			// Holds a single word at a time
output,		// Holds output (of various kinds)

punc = ".?!",	// Standard punctuation.

cat,			// Used to interpret the categories
ncat,			// (see above)
catindex = "",	// (see above)
badcats,		// (see above)
syl,			// Holds mid-word syllables
nsyl,			//  .length
wisyl,		// Holds word-initial syllables
nwisyl,		//  .length
wfsyl,		// Holds word-final syllables
nwfsyl,		//  .length
snsyl,		// Holds syllables for single-syllable words
nsnsyl,		//  .length
onetype,		// Holds the status of the one-type-of-syllables checkbox

monosyl = 0.0,	// Rate of monosyllabic words
dropoff = 50,	// How steep the dropoff is between one letter/syllable and the next.

rew,			// Holds rewrite rules
nrew,			//  .length
badrew,			// Used to interpret the rules

showsyl = false,	// Show syllable breaks?
slowsyl = false,	// Slow the syllable dropoff even more?

tempArray = [],	// Used internally

//Kcats, Krew,	// Used by Defaults to hold initial HTML state.
//Ksing, Ksyls,
//Kwrdi, Kwrdf,
//Kname,
// These are no longer used?

CustomInfo = false,	// Used by Defaults to check localStorage for saved info.
Customizable = false,	// Used to indicate that saving is possible.

zCounter;		// Used to create IDs for help tooltips later in this script.

//And that, folks, is one heck of a large VAR statement!


// Check the input for validness.
function parseAllInput() {
	var zsyl,counter;
	// Parse the category list.
	cat = $("#cats").val().split(/\r?\n/);
	// Hold on to the number of categories.
	ncat = cat.length;
	// Track whether or not we've encountered errors.
	badcats = false;

	// Make sure categories have structure like V=aeiou

	// Set up a string with all categories.
	catindex = "";
	// Set up a blank array.
	tempArray = [];
	// Go through each category one at a time
	cat.forEach(function(element) {
		// Remove whitespace from element.
		var thiscat = element.trim();
		// Lock up the length of this category.
		const len = thiscat.length;
		if(len === 0) {
			// Blank category. Ignore this.
			ncat--;
		} else if (len < 3 || thiscat.indexOf("=") !== 1 || thiscat.indexOf("=", 2) !== -1) {
			// If the category doesn't have at least three characters...
			//  OR the category doesn't have = as its second character...
			//  OR the category has = somewhere else other than the second character...
			// THEN this is a bad category.
			badcats = true;
			// Ignore it.
			ncat--;
		} else {
			// Add this category to the category index.
			catindex += thiscat.charAt(0);
			// Save this category, it's good!
			tempArray.push(thiscat);
		}
	});
	// Replace cat with the good categories.
	cat = tempArray;

	// Parse the syllable lists.
	zsyl = $("#syls").val().split(/\r?\n/); // zsyl is a temp variable
	syl = parseSyllables(zsyl);
	nsyl = syl.length;

	zsyl = $("#wrdi").val().split(/\r?\n/);
	wisyl = parseSyllables(zsyl);
	nwisyl = wisyl.length;

	zsyl = $("#wrdf").val().split(/\r?\n/);
	wfsyl = parseSyllables(zsyl);
	nwfsyl = wfsyl.length;

	zsyl = $("#sing").val().split(/\r?\n/);
	snsyl = parseSyllables(zsyl);
	nsnsyl = snsyl.length;

	// Parse rewrite rules.
	tempArray = $("#rewrite").val().split(/\r?\n/);
	// Save the length of the rules.
	nrew = tempArray.length;
	// Set up rew as a blank object.
	rew = new Object;
	// Start out as if no rules are bad.
	badrew = false;
	// Set up a counter to give each rule a unique ID.
	counter = 0;
	// Go through each rule one at a time.
	tempArray.forEach(function(rule) {
		// Make sure each rule has two parts.
		var replacement, separatorPosition = rule.indexOf("||");
		if(separatorPosition < 1 || separatorPosition !== rule.lastIndexOf("||")) {
			// If || is -1 (not found) or 0 (at beginning of rule) OR if there are more than once instance of || in the string, ignore this rule.
			nrew--;
			// Mark that there was a bad rule.
			badrew = true;
		} else {
			// Isolate the replacement.
			replacement = rule.substring(separatorPosition + 2);
			// Isolate the rule, and turn it into a regex pattern.
			rule = new RegExp(rule.substring(0, separatorPosition), "g"); // for case insensitivity change "g" to "gi"
			// Save this rule.
			rew[counter.toString()] = [rule, replacement];
			// Increment the counter.
			counter++;
		}
	});
}

// Trim elements of whitespace and remove blank elements from given array.
function parseSyllables(input) {
	var w = [];
	// Go through each element one by one.
	input.forEach(function(t) {
		// Remove whitespace.
		var trimmed = t.trim();
		// If there is still a string there, add it to the temp array.
		if(trimmed !== '') {
			w.push(trimmed);
		}
	});
	// Return the good info.
	return w;
}

function handleCategoriesInRewriteRule(rule) {
	// %% converts to %.
	// Split along those, then join with % at end.
	var broken = rule.split("%%"),
		rewritten = [],
		testing,catt,chunk,bit,ind;
	while(broken.length) {
		// First, check for category negation.
		// Separate into array, split along !% negations.
		testing = broken.shift().split("!%");
		// Save the first bit (before any !% was found) as chunk.
		chunk = testing.shift();
		// Check each bit one at a time.
		while(testing.length) {
			bit = testing.shift();
			// What's the category being negated?
			catt = bit.charAt(0);
			// Is it actually a category?
			ind = catindex.indexOf(catt);
			if(ind !== -1) {
				// Category found. Replace with [^a-z] construct, where a-z is the category contents.
				chunk += "[^" + cat[ind].substring(2) + "]";
				// If category not found, it gets ignored.
			}
			// Remove category identifier, add to saved chunk.
			chunk += bit.substring(1);
		}
		// Now check for categories.
		// Separate into array, split along % markers.
		testing = chunk.split("%");
		// Save the first bit (before any % was found) as chunk.
		chunk = testing.shift();
		// Check each bit one at a time.
		while(testing.length) {
			bit = testing.shift();
			// What's the category?
			catt = bit.charAt(0);
			// Is it actually a category?
			ind = catindex.indexOf(catt);
			if(ind !== -1) {
				// Category found. Replace with [a-z] construct, where a-z is the category contents.
				chunk += "[" + cat[ind].substring(2) + "]";
				// If category not found, it gets ignored.
			}
			// Remove category identifier, add to saved chunk.
			chunk += bit.substring(1);
		}
		// Save chunk!
		rewritten.push(chunk);
	}
	// Return this info with %% reduced back to %
	return rewritten.join("%");
}

// Calculate a random percentage from 0% to 100%.
function getRandomPercentage() {
	// Math.random never returns 1, so 101 is never returned. (However, it CAN return 0!)
	return Math.floor(Math.random()*101);
}

// Apply rewrite rules. 
function applyRewriteRules(input) {
	var w,parse;
	// Go through each rule one by one.
	for (w = 0; w < nrew; w++) {
		// Grab the rule and replacement.
		parse = rew[w.toString()];
		// Apply the rule to the input with the replacement.
		input = input.replace(parse[0], parse[1]);
	}
	return input;
}


// Cheap iterative implementation of a power law:
// our chances of staying at a bin are pct %.
function PowerLaw(max, pct) {
	var r;
	for (r = 0; true; r = (r+1) % max) { // The 'true' in there means this loop never ends.
		if (getRandomPercentage() < pct) {
			return r;
		}
	}
}


// Similar, but there's a peak at mode.
function PeakedPowerLaw(max, mode, pct) {
	if (Math.random() > 0.5) {
		// going upward from mode
		return mode + PowerLaw(max - mode, pct);
	} else {
		// going downward from mode
		return mode - PowerLaw(mode + 1, pct);
	}
}

// Output a single syllable - this is the guts of the program 
function Syllable(which) {
	// Choose the pattern
	var pattern = syllPatternPick(which),c,theCat,ix,expansion,r2,ch;

	// For each letter in the pattern, find the category
	for (c = 0; c < pattern.length; c++) {
		theCat = pattern.charAt(c);
		// Go find it in the categories list
		ix = catindex.indexOf(theCat);
		if (ix == -1) {
			// Not found: output syllable directly
			word += theCat;
		} else {
			// Choose from this category
			expansion = cat[ix].substr(2);
			
			if (dropoff === 0) {
				r2 = Math.random() * expansion.length;
			} else {
				r2 = PowerLaw(expansion.length, dropoff);
			}

			ch = expansion.charAt(r2);
			word += ch;
		}
	} 
}

function syllPatternPick(w) {
	var x,y,r;
	switch (w)
	{
		case -1:
			// First syllable
			x = nwisyl;
			y = wisyl;
			break;
		case 0:
			// Middle syllable
			x = nsyl;
			y = syl;
			break;
		case 1:
			// Last syllable
			x = nwfsyl;
			y = wfsyl;
			break;
		case 2:
			// Only syllable
			x = nsnsyl;
			y = snsyl;
			break;
	}
	r = PowerLaw(x, calcDropoff(x));
	return y[r];
}

// Output a single word
function OneWord(capitalize) {
	word = "";

	var nw = 1,w,which;
	if (Math.random() > monosyl) { nw += 1 + PowerLaw(4, 50); }
	which = -1; // First syllable.
	for (w = 0; w < nw ; w++) {
		if (onetype)
		{
			// Only use word-initial syllable box.
			which = -1;
		}
		else if(nw == 1)
		{
			// Only one syllable.
			which = 2;
		}
		else if(w > 0)
		{
			// Final syllable.
			which = 1;
			if(w < nw - 1)
			{
				// Not final syllable.
				which = 0;
			}
		}
		Syllable(which);
		if (showsyl && w < nw - 1) word += "\u00b7";
	}

	word = applyRewriteRules(word);

	if (capitalize) word= word.charAt(0).toUpperCase() + word.substring(1);
	output += word;
}

// Output a pseudo-text
function CreateText() {
	var sent, w, nWord;
	for (sent = 0; sent < NSENT; sent++) {
		nWord = 1 + PeakedPowerLaw(15, 5, 50); 
		for (w = 0; w < nWord; w++) {

			OneWord(w === 0);

			if (w == nWord - 1) {
				output += punc.charAt(PowerLaw(punc.length, 75)); 
			}
			output += " ";
		}
	}
}

// Create a list of NLEX words
function CreateLex(capitalize) {
	var w;
	output += '<div class="lexicon">' + "<table>\n";
	for (w = 0; w < NLEX; w++) {
		if (w % 10 === 0) {
			output += "<tr>";
		}
		output += "<td>";
		OneWord(capitalize);
		output += "</td>";
		if (w % 10 == 9) {
			output += "</tr>\n";
		}
	}
	output += "</table></div>\n";
}

function CreateLongLex() {
	var w;
	for (w = 0; w < NLEX * 5; w++) {
		OneWord(false);
		output += "<br>\n";
	}
}


// Generate all the syllables following a particular pattern, plus an initial.
// 1. Look at the first item in pattern, e.g. V
// 2. For each member m of that class (e.g. aeiou)...
//    a. If it ends the pattern, just generate the word initial + m
//    b. If not, call genall recursively with m added to the initial,
//       and a pattern consisting of the rest of the string.
function genall(initial, pattern) {

	if (pattern.length === 0) { return; }

	var theCat = pattern[0],
		lastOne = pattern.length == 1,
		ix,i,m,members;

	// Find category
	ix = catindex.indexOf(theCat);
	if (ix == -1) {
		// Not a category, just output it straight
		if (lastOne) {
			tempArray.push(applyRewriteRules(initial + theCat));
		} else {
			genall(initial + theCat, pattern.slice(1));
		}
	} else {
		// It's a category; iterate over the members
		members = cat[ix].substr(2);

		for (i = 0; i < members.length; i++) {
			m = members.charAt(i);
			if (lastOne) {
				tempArray.push(applyRewriteRules(initial + m));
			} else {
				genall(initial + m, pattern.slice(1));
			}
		}
	}
}

// Launch process to generate ALL possible syllables.
function CreateAll() {
	tempArray = [];
	word = "";
	var t, w, last, foo, i, sylall, nall, lastel,
		temp = syl.concat(wisyl, wfsyl, snsyl);
	temp.sort();
	last = temp.shift();
	sylall = [last];
	while(temp.length > 0) {
		foo = temp.shift();
		if(foo != last) {
			sylall.push(foo);
			last = foo;
		}
	}
	nall = sylall.length;

	for (w = 0; w < nall; w++) {
		genall("", sylall[w]);
	}

	// Sort
	tempArray = tempArray.sort();

	// Output
	lastel = "";
	for (i = 0; i < tempArray.length; i++) {
		t = tempArray[i];
		if (i === 0 || t != lastel) {
			word += t + "<br>";
			lastel = t;
		}
	}

	output = word;

	tempArray = [];
}

// User hit the action button.  Make things happen!
function process() {
	//Read parameters
	var w,whichWay = $("input[type=radio][name=outtype]:checked").val();

	showsyl = $("#showsyl").prop("checked");
	slowsyl = $("#slowsyl").prop("checked");
	onetype = $("#onetype").prop("checked");


	monosyl = Number($("input[type=radio][name=monosyl]:checked").val());
	// x != x when x is NaN
	if(monosyl != monosyl || monosyl > 1.0) {
		monosyl = 1.0;
	} else if (monosyl < 0.0) {
		monosyl = 0.0;
	}

	dropoff = Number($("input[type=radio][name=dropoff]:checked").val());
	if(dropoff != dropoff || dropoff > 45) {
		dropoff = 45;
	} else if(dropoff < 0) {
		dropoff = 0;
	}

	// Stuff we can do once
	output = "";

	// Parse all those boxes.
	parseAllInput();

	// Error checking
	if (onetype && (ncat <= 0 || nwisyl <= 0)) {
		output = "You must have categories and syllable types to generate text."
	} else if (!onetype && (ncat <= 0 || nsyl <= 0 || nwisyl <= 0 || nwfsyl <= 0 || nsnsyl <= 0)) {
		output = "You must have categories and all syllable types to generate text.";
	} else if (badcats) {
		output = "Categories must be of the form V=aeiou<br>" +
		"That is, a single letter, an equal sign, then a list of possible expansions.";
	} else if (badrew) {
		output = "Rewrite rules must be in the form x||y<br>" +
		"That is, a rule (x), followed by two vertical bars, followed by a replacement expression (y, which may be blank).";
	} else {
		// Actually generate text
		switch (whichWay) {
			case "text":
				CreateText();
				break;
			case "dict":
				CreateLex(false);
				break;
			case "dictC":
				CreateLex(true);
				break;
			case "longdict":
				CreateLongLex();
				break;
			case "genall":
				CreateAll();
		}
	}

	// Set the output field
	$("#outputText").html(output);
}

function calcDropoff(num) {
	// Syllable dropoff
	if (slowsyl) {
		if (num == 2)
		{
			return 50;
		}
		if (num == 3)
		{
			return 40;
		}
		if (num < 9)
		{
			return 46 - num * 4;
		}
		return 11;
 	}
	if (num < 9)
	{
		return 60 - num * 5;
	}
	return 12;
}

function erase() {
	$("#outputText").html("");
}

function clearBoxes() {
	$("#cats,#wrdi,#syls,#sing,#wrdf,#rewrite").val(""); // boxes
	$("#monoLessFrequent,#dropoffMedium,#textOutput").prop("checked", true); // radio
	//$("#onetype").prop("checked", true); // checkbox
	//$("#showsyl,#slowsyl,#onetype").prop("checked", false); // checkbox
	$("#showsyl,#slowsyl").prop("checked", false); // checkbox
	$("#defaultName").text("");
}

function prepImport() {
	$("#importBoxArea").show();
	$("body").css("overflow", "hidden");
}

function removeImportBox() {
	$("#importTextBox").val("");
	$("#importBoxArea").hide();
	$("body").css("overflow", "auto");
}

function doImport() {
	var patt = /--CATS--\n([\s\S]*)\n--REWRITE--\n([\s\S]*)\n--MONO--\n([\s\S]*)\n--MID--\n([\s\S]*)\n--INIT--\n([\s\S]*)\n--FINAL--\n([\s\S]*)\n--FLAGS--\n([01]) ([01]) ([^ ]+) ([^ ]+)/,
		toImport = $("#importTextBox").val(),
		m = patt.exec(toImport);
	if(m === null) {
		return alert("Incorrect format.");
	}
	$("#cats").val(m[1]);
	$("#rewrite").val(m[2]);
	$("#sing").val(m[3]);
	$("#syls").val(m[4]);
	$("#wrdi").val(m[5]);
	$("#wrdf").val(m[6]);
	$("#onetype").prop("checked", ((m[7] == "0") ? false : true));
	$("#slowsyl").prop("checked", ((m[8] == "0") ? false : true));
	$("#" + m[9]).prop("checked", true);
	$("#" + m[10]).prop("checked", true);
	syllablicChangeDetection($("#onetype")[0]);
	alert("Import Successful!");
	$("#importTextBox").val("");
	$("#importBoxArea").hide();
	$("body").css("overflow", "auto");
}

function doExport() {
	var toExport = "--CATS--\n" + $("#cats").val() +
		"\n--REWRITE--\n" + $("#rewrite").val() +
		"\n--MONO--\n" + $("#sing").val() +
		"\n--MID--\n" + $("#syls").val() +
		"\n--INIT--\n" + $("#wrdi").val() +
		"\n--FINAL--\n" + $("#wrdf").val() +
		"\n--FLAGS--\n" +
		($("#onetype").prop("checked") ? "1" : "0") + " " +
		($("#slowsyl").prop("checked") ? "1" : "0") + " " +
		$("input[name=monosyl]:checked").attr("id") + " " +
		$("input[name=dropoff]:checked").attr("id");
	$("#importTextBox").val(toExport);
	$("#importBoxArea").show();
	$("body").css("overflow", "hidden");
	alert("Export Successful. Copy this for your own records.\n\nHit 'Cancel' when you're done.");
}

// Save current info to the browser, if possible.
function saveCustom() {
	if(!Customizable) {
		alert("Your browser does not support Local Storage and cannot save your information.");
		return;
	} else if (CustomInfo && !confirm("You already have information saved. Do you want to overwrite it?")) {
		alert("Previous information saved.");
		return;
	}
	localStorage.setItem("CustomCats",	$("#cats").val());
	localStorage.setItem("CustomRewrite",	$("#rewrite").val());
	localStorage.setItem("CustomSing",	$("#sing").val());
	localStorage.setItem("CustomSyls",	$("#syls").val());
	localStorage.setItem("CustomWrdi",	$("#wrdi").val());
	localStorage.setItem("CustomWrdf",	$("#wrdf").val());
	localStorage.setItem("CustomOneType",	$("#onetype").prop("checked"));
	localStorage.setItem("CustomSlowsyl",	$("#slowsyl").prop("checked"));
	localStorage.setItem("CustomMono",	$("input[name=monosyl]:checked").attr("id"));
	localStorage.setItem("CustomDropoff",	$("input[name=dropoff]:checked").attr("id"));

	CustomInfo = true;
	if($("#predef option[value=-1]").length < 1) {
		$("#predef").prepend('<option value="-1">Custom</option>');
	}
	$("#predef").val("-1");
	alert("Saved to browser.");
}

function clearCustom() {
	if(!Customizable) {
		alert("Your browser does not support Local Storage and cannot save your information.");
		return;
	} else if (!CustomInfo) {
		alert("You don't have anything saved.");
		return;
	} else if (!confirm("Are you sure you want to delete your saved settings?")) {
		alert("Settings saved.");
		return;
	}
	window.localStorage.clear();
	CustomInfo = false;
	$("#predef option[value=-1]").remove();
	alert("Cleared from browser.");
}

// Display the IPA
function showipa() {
	word = '<span class="desc">Latin:</span>' + "\n" + '<div class="extraGroup">';
	var	frst = [ 0x00a1, 0x00bf, 0x00d8, 0x00f8, 0x2c60, 0xa722, 0xa78b, 0xa7b0, 0xab30, 0xab60, "x",   0x0250, "x",                0x0370, 0x0376, 0x037a, 0x0386, 0x0388, 0x038c, 0x038e, 0x03a3, 0xab65, "x",        0x0400, 0x048a, 0xa640, 0xa680, "x",        0x0531, 0x0561 ],
		last = [ 0x00a1, 0x00d6, 0x00f6, 0x024f, 0x2c7f, 0xa787, 0xa7ad, 0xa7b7, 0xab5a, 0xab64, "IPA", 0x02ff, "Greek and Coptic", 0x0373, 0x0377, 0x037f, 0x0386, 0x038a, 0x038c, 0x03a1, 0x03ff, 0xab65, "Cyrillic", 0x0482, 0x052f, 0xa66e, 0xa69b, "Armenian", 0x0556, 0x0587 ],
		i, j, len;
	for (i = 0, len = frst.length; i < len; i++) {
		if (frst[i] === "x") {
			word += "</div>\n" + '<br><br><span class="desc">' + last[i] + ":</span>\n" + '<div class="extraGroup">';
		} else {
			for (j = frst[i]; j <= last[i]; j++) {
				word += '<span title="'+ j + ': ' + getUnicodeName(j) + '">' + String.fromCharCode(j) + "</span>";
			}
		}
	}
	word += "</div>\n";
	$("#outputText").html(word);
}

// Advanced Options open/close
function advancedOptions() {
	$("#advancedOpen").toggleClass("closed");
}

// Defaults
function defaultme(defN) {
	switch (defN) {
		case -1:// Custom Info
			if(CustomInfo) {
				$("#cats").val(localStorage.getItem("CustomCats"));
				$("#rewrite").val(localStorage.getItem("CustomRewrite"));
				$("#sing").val(localStorage.getItem("CustomSing"));
				$("#syls").val(localStorage.getItem("CustomSyls"));
				$("#wrdi").val(localStorage.getItem("CustomWrdi"));
				$("#wrdf").val(localStorage.getItem("CustomWrdf"));
				$("#onetype").prop("checked", localStorage.getItem("CustomOneType") === "true");
				$("#slowsyl").prop("checked", localStorage.getItem("CustomSlowsyl") === "true");
				$("#" + localStorage.getItem("CustomMono")).prop("checked", true);
				$("#" + localStorage.getItem("CustomDropoff")).prop("checked", true);
			} else {
				defaultme(0);
			}
			break;
		case 1: // Original default
			$("#cats").val("C=ptkbdg\nR=rl\nV=ieaou");
			$("#wrdi").val("CV\nV\nCRV");
			$("#syls,#sing,#wrdf").val("");
			$("#onetype").prop("checked", true);
			$("#slowsyl").prop("checked", false);
			$("#rewrite").val("ki||" + String.fromCharCode(269) + "i");
			$("#monoLessFrequent,#dropoffMedium").prop("checked", true);
			break;
		case 2: // Large inventory
			$("#cats").val("C=ptknslrmbdgfvwyh" + String.fromCharCode(353) + "z" +
				String.fromCharCode(241) + "x" + String.fromCharCode(269, 382, 330) +
				"\nV=aiuoe" + String.fromCharCode(603,596,226,244,252,246) + "\nR=rly");
			$("#wrdi").val("CV\nV\nCVC\nCRV");
			$("#syls,#sing,#wrdf").val("");
			$("#rewrite").val(String.fromCharCode(226) + "||ai\n" + String.fromCharCode(244) + "||au");
			$("#onetype").prop("checked", true);
			$("#slowsyl").prop("checked", false);
			$("#monoLessFrequent,#dropoffMedium").prop("checked", true);
			break;
		case 3: // Latinate
			$("#cats").val("C=tkpnslrmfbdghvyh\nV=aiueo\nU=aiu" + String.fromCharCode(224,234) +
				"\nR=rl\nM=nsrmltc\nK=ptkbdg");
			$("#wrdi").val("CV\nCUM\nV\nUM\nKRV\nKRUM");
			$("#syls,#sing,#wrdf").val("");
			$("#rewrite").val("ka||ca\nko||co\nku||cu\nkr||cr");
			$("#onetype").prop("checked", true);
			$("#slowsyl").prop("checked", false);
			$("#monoLessFrequent,#dropoffMedium").prop("checked", true);
			break;
		case 4: // Simple
			$("#cats").val("C=tpknlrsm" + String.fromCharCode(654) + "bdg" + String.fromCharCode(241) +
				"fh\nV=aieuo" + String.fromCharCode(257, 299, 363, 275, 333) + "\nN=n" +
				String.fromCharCode(331));
			$("#wrdi").val("CV\nV\nCVN");
			$("#syls,#sing,#wrdf").val("");
			$("#rewrite").val("aa||" + String.fromCharCode(257) + "\nii||" + String.fromCharCode(299) +
				"\nuu||" + String.fromCharCode(363) + "\nee||" + String.fromCharCode(275) + "\noo||" +
				String.fromCharCode(333) + "\nnb||mb\nnp||mp");
			$("#onetype").prop("checked", true);
			$("#slowsyl").prop("checked", false);
			$("#monoLessFrequent,#dropoffMedium").prop("checked", true);
			break;
		case 5: // Chinese
			$("#cats").val("C=ptknlsm" + String.fromCharCode(353) + "yw" + String.fromCharCode(269) +
				"hf" + String.fromCharCode(331) + "\nV=auieo\nR=rly\nN=nn" + String.fromCharCode(331) +
				"mktp\nW=io\nQ=ptk" + String.fromCharCode(269));
			$("#wrdi").val("CV\nQ" + String.fromCharCode(688) + "V\nCVW\nCVN\nVN\nV\nQ" +
				String.fromCharCode(688) + "VN");
			$("#syls,#sing,#wrdf").val("");
			$("#rewrite").val("uu||wo\noo||ou\nii||iu\naa||ia\nee||ie");
			$("#slowsyl").prop("checked", false);
			$("#onetype").prop("checked", true);
			$("#monoLessFrequent,#dropoffMedium").prop("checked", true);
			break;
		case 6: // Kartaran
			$("#cats").val("S=tspkThfS\nC=kstSplrLnstmTNfh\nI=aoueAOUE\nV=aoiueAOUE\nE=sfSnmNktpTh");
			$("#rewrite").val("([aeiou])\\1{2,}||$1$1\n([AEOU])\\1+||$1\n(%V{2})%V+||$1\nh+||h\n" +
				"h(%V%E)\\b||H$1\nh(%V%C{0,2}%V)\\b||H$1\n(%V)h(%V)\\b||$1H$2\n\\bh||H\nh\\b||H\n" +
				"h||\nH||h\nA||a" + String.fromCharCode(301) + "\nO||o" + String.fromCharCode(301) +
				"\nU||u" + String.fromCharCode(301) + "\nE||e" + String.fromCharCode(301) + "\n" +
				String.fromCharCode(301) + "i||i\n" + String.fromCharCode(301) + "T||" +
				String.fromCharCode(301) + "t\n" + String.fromCharCode(301) + "S||" +
				String.fromCharCode(301) + "s\n" + String.fromCharCode(301) + "L||" +
				String.fromCharCode(301) + "l\n" + String.fromCharCode(301) + "N||" +
				String.fromCharCode(301) + "n\n(\\B.\\B[aeou])i||$1" + String.fromCharCode(301) +
				"\n(%C)\\1||$1\n[tkpT]r||r\nn[pTk]||nt\nm[tTk]||mp\nN[ptk]||NT\nk[nmN]||k\n" +
				"p[nN]||pm\nt[mN]||tn\nT[nm]||TN\np[sSh]||pf\nt[fSh]||ts\nT[fsh]||TS\nk[fsS]||kh\n" +
				"f[sSh]||fp\ns[fSh]||st\nS[fsh]||ST\nh[fsS]||hk\nft||fp\nsT||st\nSt||ST\n" +
				"([TSLN])[tsln]||$1\n([tsln])[TSLN]||$1\nNT||nT\nTN||tN\nST||sT\nTS||tS\nT||t" +
				String.fromCharCode(769) + "\nL||" + String.fromCharCode(314) + "\nS||" +
				String.fromCharCode(347) + "\nN||" + String.fromCharCode(324));
			$("#sing").val("SV\nSVE\nSV\nSV");
			$("#syls").val("SV\nI\nCV\nSVC");
			$("#wrdi").val("SV\nV\nSVC");
			$("#wrdf").val("I\nVE\nV\nVE\nSVE\nV\nCV\nVE\nCVE");
			$("#onetype,#slowsyl").prop("checked", false);
			$("#monoRare,#dropoffMedium").prop("checked", true);
			break;
		case 7: // Reemish
			$("#cats").val("I=rlmnpbBTRG\nC=pbtdkgnmGszSZwrlBTR\nE=pbtdkgnmGl\nM=pbtdkgnmGrlszSZw\n" + 
				"S=pbtdkg\nN=nmG\nX=szSZwrlnmG\nA=wrl\nV=aIuioe");
			$("#rewrite").val("^(b|p)w||$1\n^G||w\n(%X)%X||$1\n(%N|%A)(%S)||$2\n%X(%S%A)||$1\n" + 
				"^g([ei])||gh$1\nG||ng\nS||sh\nZ||zh\ni||ee\nI||i\ni$||e\nB||" +
				String.fromCharCode(664) + "\nT||" + String.fromCharCode(451) + "\nR||" +
				String.fromCharCode(450));
			$("#sing").val("IVN\nVS\nCVE\nSAV\nSAVE\nCV\nCVN");
			$("#syls").val("SV\nNV\nMV\nSAV\nSV\nSV\nNV\nMV\nSAV\nSVX\nMVX\nSAVX");
			$("#wrdi").val("SV\nIV\nAV\nCV\nSAV\nVX\nSV\nIV\nAV\nCV\nSAV\nVX\nAVX\nCVX\nIVX\nVX\nSAVX");
			$("#wrdf").val("MV\nMVE\nMV\nMVE\nSAV\nSAVE");
			$("#onetype,#slowsyl").prop("checked", false);
			$("#monoFrequent,#dropoffSlow").prop("checked", true);
			break;
		default: // Null
			return alert("Choose something from the list, first.");
	}
	syllablicChangeDetection($("#onetype")[0]);
}


//Predefs
function loadPredef() {
	var predef = $("#predef").val();
	defaultme(Number(predef));
}

function syllablicChangeDetection(what)  {
	if(what.checked) {
		$("#p_multi,.multiswap").hide();
		$(".singleswap").show();
	} else {
		$("#p_multi,.multiswap").show();
		$(".singleswap").hide();
	}
}

zCounter = 1;
$(document).ready(function() {
	// Check for localStorage.
	if(typeof(Storage) !== "undefined") {
		Customizable = true;
		if(localStorage.getItem("CustomCats") !== null) {
			CustomInfo = true;
			// Set default to the custom info.
			$("#predef").prepend('<option value="-1">Custom</option>');
			$("#predef").val("-1");
			defaultme(-1);
		}
	}

	// Set up p_multi toggle
	$("#onetype").change(function() { syllablicChangeDetection($("#onetype")[0]); });
	syllablicChangeDetection($("#onetype")[0]);

	// Set up help tooltips
	$(".help").click(function() {
		var info = $(this).find("span.info");
		var lleft, iw, ww, rt, offset, helppp, popped;
		if($(this).hasClass("popOut")) {
			//
			// Handle tooltips from the Advanced Options
			popped = $(this).attr("data-clicked");
			if(typeof popped !== "undefined") {
				// data-clicked is defined? Then we've been clicked. Remove the tooltip.
				$("#" + popped).remove();
				// Remove the stored info.
				$(this).removeAttr("data-clicked");
			} else {
				// data-clicked isn't defined? Then create a tooltip.
				// We can't simply show the tooltip box, since it's constrained by the flex container.
				offset = $(this).offset();
				helppp = info.html();
				// Create an ID to remember this by, using the ever-increased zCounter.
				++zCounter;
				popped = "popup" + zCounter;
				// Store that ID on the question mark.
				$(this).attr("data-clicked", popped);
				// Create new tooltip node.
				$("body").append('<div class="info" id="' + popped + '"></div>');
				// Select the new node
				info = $("#" + popped);
				// Set it up.
				info.toggle();
				// Check to see if we're going to go off the edge of the window.
				lleft = offset.left;
				iw = info.width() + 20;       // Width of info box (plus padding)
				ww = $(document).width();     // Window width
				rt = lleft + $(this).width(); // Starting left position
				if((rt + iw) > ww) {
					// Close to right edge of window.
					if(rt <= iw) {
						// Close to left edge, too. Calculate best fit.
						if(ww <= iw) {
							lleft -= rt;
							lleft += 2;
						} else {
							lleft += (ww - (rt + iw));
							lleft -= 3;
						}
					} else {
						// Just move it left.
						lleft -= iw;
					}
				}
				info.html(helppp).css({"z-index": zCounter, "top": offset.top + 10, "left": lleft} );
				info.click(function() {
					// Delete the stored info from the parent question mark.
					$('span[data-clicked="' + $(this).attr("id") + '"]').removeAttr("data-clicked");
					// Remove this.
					$(this).remove();
				});
			}
		} else {
			//
			// Handle tooltips in main body
			info.toggle();
			info.css("transform", "translateX(0px)");
			if(info.is(":visible")) {
				++zCounter;
				info.css("z-index", zCounter);
				iw = info.width() + 20;             // Width of info box (plus padding)
				ww = $(document).width();           // Window width
				offset = $(this).offset();
				rt = offset.left + $(this).width(); // Starting left position
				if((rt + iw) > ww) {
					// Close to right edge of window.
					if(rt <= iw) {
						// Close to left edge of window, too!
						// Calculate best fit.
						if(ww <= iw) {
							// WHY would your window be so small??
							// Push it to the left edge. Hope we can scroll.
							//	0 - (rt - 2)
							//	0 - rt + 2
							//	2 - rt
							info.css("transform", "translateX(" + (2 - rt) + "px)");
						} else {
							// Moving it left 'iw' pushes it off the left edge.
							// Leaving it pushes it off the right edge by '(ww - (rt + iw))' pixels.
							// So move it leftward '(ww - (rt + iw))' and add a bit of padding
							// Should leave it just off the right edge!
							//	ww - (rt + iw)
							//	ww - rt - iw
							info.css("transform", "translateX(" + (ww - rt - iw) + "px)");
						}
					} else {
						// To the left, to the left. Every tool you tip, in a box to the left.
						info.css("transform", "translateX(" + (0 - iw) + "px)");
					}
				}
			}
		}
	});
});
