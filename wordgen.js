// Script (C) 2012 by Mark Rosenfelder.
// You can modify the code for non-commercial use; 
// attribution would be nice.
// If you want to make money off it, please contact me.

// Modified by Jason Tamez 2017-2019.
// Code available here: https://github.com/jasontamez/wordgen

var categories,			// Used to interpret the categories
previousCat = false,		// Holds previous categories, to save processing
midWordSyls,			// Holds mid-word syllables
wordInitSyls,			// Holds word-initial syllables
wordFinalSyls,			// Holds word-final syllables
singleWordSyls,			// Holds syllables for single-syllable words
previousMidWordSyls = false,
previousWordInitSyls = false,
previousWordFinalSyls = false,
previousSingleWordSyls = false,	// These four hold previous syllable boxes, to save processing

rew,				// Holds rewrite rules
nrew,					//  .length
previousRew = false,	// Holds previous rewrite rules, to save processing
rewSep = false,		// Separates rewrite selector from replacement

CustomInfo = false,	// Used by Defaults to check localStorage for saved info
Customizable = false,	// Used to indicate that saving is possible

getter = new XMLHttpRequest(), // Used to download stored predefs
predefFilename = "/predefs.txt", // Where they are stored
predefs = {}; // Used to store predefs


// Helper functions to streamline some often-used function calls.
function $i(x, doc = document) {
	return doc.getElementById(x);
}
function $q(x, doc = document) {
	return doc.querySelector(x);
}
function $a(x, doc = document) {
	return doc.querySelectorAll(x);
}
function $e(tag, text = false, atts = false) {
	var e = document.createElement(tag);
	if(text !== false) {
		e.textContent = text;
	}
	if(atts !== false) {
		Object.entries(atts).forEach(pair => e.setAttribute(pair[0], pair[1]));
	}
	return e;
}
function $t(text) {
	return document.createTextNode(text);
}
function $f() {
	return document.createDocumentFragment();
}


// Trim elements of whitespace and remove blank elements from given array.
function parseSyllables(input) {
	var output = [];
	// Split input by linebreaks and then go through each element one by one.
	input.split(/\r?\n/).forEach(function(t) {
		// Remove whitespace.
		var trimmed = t.trim();
		// If there is still a string there, add it to the temp array.
		if(trimmed !== '') {
			output.push(trimmed);
		}
	});
	// Return the good info.
	return output;
}

function handleCategoriesInRewriteRule(rule) {
	// %% converts to %.
	// Split along those, then join with % at end.
	var broken = rule.split("%%"),
		rewritten = [],
		testing,catt,chunk,bit;
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
			if(categories.index.indexOf(catt) !== -1) {
				// Category found. Replace with [^a-z] construct, where a-z is the category contents.
				chunk += "[^" + categories[catt] + "]";
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
			if(categories.index.indexOf(catt) !== -1) {
				// Category found. Replace with [a-z] construct, where a-z is the category contents.
				chunk += "[" + categories[catt] + "]";
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

// Apply rewrite rules to input. 
function applyRewriteRules(input) {
	var counter,parse;
	// Go through each rule one by one.
	for (counter = 0; counter < nrew; counter++) {
		// Grab the rule and replacement.
		parse = rew[counter.toString()];
		// Apply the rule to the input with the replacement.
		input = input.replace(parse[0], parse[1]);
	}
	return input;
}

// Calculate a random percentage from 0% to 100%.
function getRandomPercentage() {
	// Math.random never returns 1, so 101 is never returned. (However, it CAN return 0!)
	return Math.floor(Math.random()*101);
}


// Cheap iterative implementation of a power law:
//   Returns a number from 0 to max, favoring the lower end.
//   1) Counter starts at zero, and we grab a random percentage.
//   2) If the random percentage is less than pct, return the value of the counter.
//   3) Otherwise, increment counter and try again.
//   4) If counter becomes equal to max, reset it to 0.
function powerLaw(max, pct) {
	var r;
	for (r = 0; true; r = (r+1) % max) { // The 'true' in there means this loop never ends on its own.
		if (getRandomPercentage() < pct) {
			return r;
		}
	}
}

// Similar, but there's a peak at mode.
function peakedPowerLaw(max, mode, pct) {
	if (Math.random() > 0.5) {
		// going upward from mode
		return mode + powerLaw(max - mode, pct);
	} else {
		// going downward from mode
		return mode - powerLaw(mode + 1, pct);
	}
}

// Output a single syllable - this is the guts of the program 
function oneSyllable(word, which, dropoff, slowSylDrop) {
	// Choose the pattern
	var pattern = syllPatternPick(which, slowSylDrop),c,theCat,expansion,r2,ch;

	// For each letter in the pattern, find the category
	for (c = 0; c < pattern.length; c++) {
		theCat = pattern.charAt(c);
		// Go find it in the categories list
		if (categories.index.indexOf(theCat) === -1) {
			// Not found: output syllable directly
			word += theCat;
		} else {
			// Choose from this category
			expansion = categories[theCat];

			if (dropoff === 0) {
				r2 = Math.random() * expansion.length;
			} else {
				r2 = powerLaw(expansion.length, dropoff);
			}

			ch = expansion.charAt(r2);
			word += ch;
		}
	}
	return word;
}

function syllPatternPick(which, slowSylDrop) {
	var n,s;
	switch (which) {
		case -1:
			// First syllable
			n = wordInitSyls.length;
			s = wordInitSyls;
			break;
		case 0:
			// Middle syllable
			n = midWordSyls.length;
			s = midWordSyls;
			break;
		case 1:
			// Last syllable
			n = wordFinalSyls.length;
			s = wordFinalSyls;
			break;
		case 2:
			// Only syllable
			n = singleWordSyls.length;
			s = singleWordSyls;
			break;
	}
	return s[powerLaw(n, calcDropoff(n, slowSylDrop))];
}

// Output a single word
function getOneWord(capitalize, monoRate, oneType, showSyls, dropoff, slowSylDrop) {
	var numberOfSyllables = 1,currentSyllable,whichBox,word = "";
	// Determine if we're making a one-syllable word.
	if (Math.random() > monoRate) {
		// We've got word with 2-6 syllables.
		numberOfSyllables += 1 + powerLaw(4, 50);
	}
	// Check if we're a monosyllable word.
	if(numberOfSyllables === 1) {
		word = oneSyllable("", oneType ? -1 : 2, dropoff, slowSylDrop);
	} else {
		// We're a polysyllabic word.
		for (currentSyllable = 1; currentSyllable <= numberOfSyllables; currentSyllable++) {
			if (oneType || currentSyllable === 1) {
				// Either one syllable box only, or we're in the first syllable.
				whichBox = -1;
			} else if(currentSyllable > 1) {
				// Not the first syllable...
				if(currentSyllable < numberOfSyllables) {
					// Not final syllable.
					whichBox = 0;
				} else {
					// Final syllable.
					whichBox = 1;
				}
			}
			word = oneSyllable(word, whichBox, dropoff, slowSylDrop);
			// Add syllable-separator mark (if we're between syllables and if it's asked for).
			if (showSyls && currentSyllable < numberOfSyllables) {
				word += "\u00b7";
			}
		}
	}
	

	// Apply rewrite rules to the completed word.
	word = applyRewriteRules(word);

	// Capitalize if asked for.
	if (capitalize) {
		word= word.charAt(0).toUpperCase() + word.substring(1);
	}
	return word;
}

// Output a pseudo-text.
function createText(monoRate, oneType, showSyls, dropoff, slowSylDrop) {
	var	sent,w,nWord,output = "",
		nSentences = getAdvancedNumber($i("sentences"), 30, 500);
	for (sent = 0; sent < nSentences; sent++) {
		nWord = 1 + peakedPowerLaw(15, 5, 50);
		for (w = 0; w < nWord; w++) {

			output += getOneWord(w === 0, monoRate, oneType, showSyls, dropoff, slowSylDrop);

			if (w === nWord - 1) {
				output += ".....?!".charAt(Math.floor(Math.random() * 7));
			}
			output += " ";
		}
	}
	return $t(output);
}

// Create a list of nLexTotal words
function createLex(capitalize, monoRate, oneType, showSyls, dropoff, slowSylDrop) {
	var w,
		output = $e("div"),
		nLexTotal = getAdvancedNumber($i("lexiconLength"), 150, 1000);
	output.classList.add("lexicon");
	output.style.gridTemplateColumns = "repeat(auto-fit, minmax(" + getAdvancedNumber($i("wordLengthInEms"), 10, 1000).toString() + "em, 1fr) )";
	for (w = 0; w < nLexTotal; w++) {
		//if (w % 10 === 0) {
		//	output += "<tr>";
		//}
		let frag = $e("div", getOneWord(capitalize, monoRate, oneType, showSyls, dropoff, slowSylDrop));
		output.appendChild(frag);
		//if (w % 10 === 9) {
		//	output += "</tr>\n";
		//}
	}
	return output;
}

// Create a list of nLexTotal * 5 words
function createLongLex(monoRate, oneType, showSyls, dropoff, slowSylDrop) {
	var	w, output=$f(),
		nLexTotal = getAdvancedNumber($i("largeLexiconLength"), 750, 5000);
	for (w = 0; w < nLexTotal; w++) {
		output.append(getOneWord(false, monoRate, oneType, showSyls, dropoff, slowSylDrop), $e("br"));
	}
	return output;
}

// Pull a number from the Advanced Options, making sure it's a positive number less than max.
function getAdvancedNumber(id, normal, max) {
	var x = parseInt(id.value);
	if(isNaN(x) || x < 1) {
		return normal;
	}
	if(x > max) {
		return max;
	}
	return x;
}



// Launch process to generate ALL possible syllables.
function getEverySyllable() {
	// Set up an empty Set to hold generated syllables and an empty variable to hold transformed info.
	var	setUp = new Set(),
		frag = $f(),
		output;
	// Make a Set out of all syllables.
	const syllables = new Set(midWordSyls.concat(wordInitSyls, wordFinalSyls, singleWordSyls));
	// Go through each syllable one at a time.
	syllables.forEach(function(unit) {
		// Go through each category one at a time.
		recurseCategories(setUp, "", unit.split(''));
	});
	// Translate the set into an array.
	output = [...setUp];
	// Sort it.
	output.sort();
	// Join into HTML string and return output.
	frag.appendChild($t(output.shift()));
	output.forEach( syll => frag.append($e("br"), syll) );
	return frag;
}

// Go through categories recursively, adding finished words to the given Set.
function recurseCategories(givenSet, input, toGo) {
	var next = [],now;
	// Copy given array.
	next.push(...toGo);
	// Find new category.
	now = next.shift();
	// Check to see if the category exists.
	if(categories.index.indexOf(now) === -1) {
		// It doesn't exist. Not a category. Save directly into input.
		input += now;
		if(!next.length) {
			// This is done. Run through rewrite rules and save into the Set.
			givenSet.add(applyRewriteRules(input));
		} else {
			// Continue the recursion.
			recurseCategories(givenSet, input, next);
		}
	} else if (next.length > 0) {
		// Category exists. More to come.
		categories[now].split('').forEach(function(char) {
			// Recurse deeper.
			recurseCategories(givenSet, input + char, next);
		});
	} else {
		// Category exists. Final category.
		// Go through each character in the run.
		categories[now].split('').forEach(function(char) {
			// Run this info through rewrite rules and save into the Set.
			givenSet.add(applyRewriteRules(input + char));
		});
	}
}

// A quick way to escape HTML characters by turning it into a text node and back again.
function escapeHTML(html) {
	return $e("p", html).innerHTML;
}

// User hit the action button.  Make things happen!
function generate() {
	var whichWay,counter,frag,foo,bar,baz,output,tester,errorMessages = [],showSyls,slowSylDrop,oneType,monoRate,dropoff,tempArray,ncat;
	// Read parameters.
	whichWay = $q("input[type=radio][name=outType]:checked").value;	// What output are we aiming for?
	showSyls = $i("showSyls").checked;	// Do we show syllable breaks?
	slowSylDrop = $i("slowSylDrop").checked;	// Do we (somewhat) flatten out the syllable dropoff?
	oneType = $i("oneType").checked;	// Are we only using one syllable box?
	monoRate = Number($q("input[type=radio][name=monoRate]:checked").value);	// The rate of monosyllable words.
	dropoff = Number($q("input[type=radio][name=dropoff]:checked").value);	// How fast do the category runs flatten out?

	// Validate monosyllable selector.
	if(monoRate !== monoRate || monoRate > 1.0) {
		// If monoRate isn't set or is bigger than 1.0 (neither should be possible), change it to 1.0.
		// (NaN !== NaN is always true)
		monoRate = 1.0;
	} else if (monoRate < 0.0) {
		// If monoRate is less than 0.0 (shouldn't be possible), change it to 0.0.
		monoRate = 0.0;
	}

	// Validate dropoff selector.
	if(dropoff !== dropoff || dropoff > 45) {
		// If dropoff isn't set or is bigger than 45 (neither should be possible), change it to 45.
		dropoff = 45;
	} else if(dropoff < 0) {
		// If dropoff is less than 0 (shouldn't be possible), change it to 0.
		dropoff = 0;
	}

	// Parse all those boxes for validness.

	// Grab the category list.
	baz = $i("categories").value;
	// If the categories have changed, parse them.
	if(baz !== previousCat) {
		foo = baz.split(/\r?\n/);
		// Hold on to the number of categories.
		ncat = foo.length;
		// Set up an object for all categories.
		categories = new Object();
		// Set up an index for the categories.
		categories.index = "";
		// Go through each category one at a time
		// Make sure categories have structure like V=aeiou
		tester = foo.every(function(element) {
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
				frag = $f();
				frag.append($e("strong", "Error:"), String.fromCharCode(0x00a0) + thiscat, $e("br"), "Categories must be of the form V=aeiou", $e("br"), "That is, a single letter, an equal sign, then a list of possible expansions.");
				errorMessages.push(frag);
				// End the looping.
				return false;
			} else {
				// Isolate the category name.
				bar = thiscat.charAt(0);
				if(categories.hasOwnProperty(bar)) {
					// If we have defined this category before, throw an error.
					frag = $f();
					frag.append($e("strong", "Error:"), String.fromCharCode(0x00a0) + "You have defined category " + thiscat + " more than once.");
					errorMessages.push(frag);
					return false;
				} else {
					// Add this category to the category index.
					categories.index += thiscat.charAt(0);
					// Save this category info.
					categories[bar] = thiscat.substring(2);
				}
			}
			// Continue the loop.
			return true;
		});
		// If we found no errors, save the categories.
		if(tester && ncat > 0) {
			previousCat = baz;
			categories.length = ncat;
		}
	}

	// Parse the syllable lists.
	// Check each one to see if it's changed, first.
	baz = $i("midWord").value;
	if(baz !== previousMidWordSyls) {
		midWordSyls = parseSyllables(baz);
		previousMidWordSyls = baz;
	}

	baz = $i("wordInitial").value;
	if(baz !== previousWordInitSyls) {
		wordInitSyls = parseSyllables(baz);
		previousWordInitSyls = baz;
	}

	baz = $i("wordFinal").value;
	if(baz !== previousWordFinalSyls) {
		wordFinalSyls = parseSyllables(baz);
		previousWordFinalSyls = baz;
	}

	baz = $i("singleWord").value;
	if(baz !== previousSingleWordSyls) {
		singleWordSyls = parseSyllables(baz);
		previousSingleWordSyls = baz;
	}

	// Grab the rewrite rules.
	baz = $i("rewrite").value;
	// Find the splitter. (|| by default)
	foo = $i("rewSep").value;
	// If the rules have changed, parse them.
	if(previousRew !== baz || foo !== rewSep) {
		rewSep = foo;
		tempArray = baz.split(/\r?\n/);
		// Save the length of the rules.
		nrew = tempArray.length;
		// Set up rew as a blank object.
		rew = new Object;
		// Set up a counter to give each rule a unique ID.
		counter = 0;
		// Go through each rule one at a time.
		tester = tempArray.every(function(rule) {
			// Make sure each rule has two parts.
			var replacement, separatorPosition = rule.indexOf(rewSep);
			if(rule.trim() === "") {
				// Ignore blank lines.
				nrew--;
			} else if(separatorPosition < 1 || separatorPosition !== rule.lastIndexOf(rewSep)) {
				// If || is -1 (not found) or 0 (at beginning of rule) OR if there are more than once instance of || in the string, ignore this rule.
				frag = $f();
				frag.append($e("strong", "Error:"), String.fromCharCode(0x00a0) + rule, $e("br"), "Rewrite rules must be in the form x" + rewSep + "y", $e("br"), "That is, a rule (x), followed by " + (rewSep === "||" ? "two vertical bars" : "the exact text \"" + rewSep + "\"") + ", followed by a replacement expression (y, which may be blank).");
				errorMessages.push(frag);
				// End the looping.
				return false;
			} else {
				// Isolate the replacement.
				replacement = rule.substring(separatorPosition + 2);
				// Isolate the rule, convert %Category expressions, and turn it into a regex pattern.
				rule = handleCategoriesInRewriteRule(rule.substring(0, separatorPosition));
				rule = new RegExp(rule, "g"); // for case insensitivity change "g" to "gi"
				// Save this rule.
				rew[counter.toString()] = [rule, replacement];
				// Increment the counter.
				counter++;
			}
			// Continue the loop.
			return true;
		});
		// If we found no errors, save the rules.
		if(tester) {
			previousRew = baz;
			// nrew === 0 is ok: sometimes you don't need to rewrite anything.
		}
	}

	// Check that categories exist.
	if(categories.length <= 0) {
		frag = $f();
		frag.append($e("strong", "Missing:"), String.fromCharCode(0x00a0) + "You must have categories to generate text.");
		errorMessages.push(frag);
	}

	// Check that syllables exist.
	if (oneType && wordInitSyls.length <= 0) {
		frag = $f();
		frag.append($e("strong", "Missing:"), String.fromCharCode(0x00a0) + "You must have syllable types to generate text.");
		errorMessages.push(frag);
	} else if (!oneType && (midWordSyls.length <= 0 || wordInitSyls.length <= 0 || wordFinalSyls.length <= 0 || singleWordSyls.length <= 0)) {
		frag = $f();
		frag.append($e("strong", "Missing:"), String.fromCharCode(0x00a0) + "You must have" + String.fromCharCode(0x00a0), $e("em", "all"), String.fromCharCode(0x00a0) + "syllable types to generate text.");
		errorMessages.push(frag);
	}

	// Print error message or requested data.
	if (errorMessages.length > 0) {
		output = $f();
		output.appendChild(errorMessages.shift());
		errorMessages.forEach(function(f) {
			output.append($e("br"), $e("br"), f);
		});
	} else {
		// Actually generate text.
		switch (whichWay) {
			case "text":
				output = createText(monoRate, oneType, showSyls, dropoff, slowSylDrop);		// pseudo-text
				break;
			case "dict":
				output = createLex(false, monoRate, oneType, showSyls, dropoff, slowSylDrop);	// lexicon
				break;
			case "dictC":
				output = createLex(true, monoRate, oneType, showSyls, dropoff, slowSylDrop);	// capitalized lexicon
				break;
			case "longdict":
				output = createLongLex(monoRate, oneType, showSyls, dropoff, slowSylDrop);	// large lexicon
				break;
			case "genall":
				output = getEverySyllable();								// all possible syllables
		}
	}

	// Set the output field.
	erase();
	$i("outputText").appendChild(output);
}

// Calculate syllable dropoff percentage rate, based on the maximum number of candidates.
function calcDropoff(lengthOfCandidates, slowSylDrop) {
	if (lengthOfCandidates === 1) {
		// Only one candidate? It's auto-chosen.
		return 101;
	}
	// If we're slowing down the rate (making it less likely an earlier candidate is chosen), return a smaller value.
	if (slowSylDrop) {
		switch(lengthOfCandidates) {
			case 2:
				return 50;
			case 3:
				return 40;
			case 4:
			case 5:
			case 6:
			case 7:
			case 8:
			case 9:
				return 46 - lengthOfCandidates * 4;
			default:
				return 9;
		}
 	}
	if (lengthOfCandidates < 9) {
		return 60 - lengthOfCandidates * 5;
	}
	return 12;
}

// Simple function erases all output.
function erase() {
	var out = $i("outputText");
	while(out.firstChild) {
		out.removeChild(out.firstChild);
	}
}

// Reset boxes to empty and some checkboxes to certain default values.
function clearBoxes() {
	$i("categories").value = "";
	$i("wordInitial").value = "";
	$i("midWord").value = "";
	$i("singleWord").value = "";
	$i("wordFinal").value = "";
	$i("rewrite").value = "";
	$i("monoLessFrequent").checked = true;
	$i("dropoffMedium").checked = true;
	$i("textOutput").checked = true;
	$i("showSyls").checked = false;
	$i("slowSylDrop").checked = false;
	$i("defaultName").textContent = "";
}

// Simple function sets up the import/export screen.
function prepImport(msg) {
	if(typeof msg !== "string") {
		$a("#importBoxArea .msg").forEach( m => m.classList.add("hidden") );
	} else {
		$a("#importBoxArea .msg").forEach( function(m) {
			m.classList.remove("hidden");
			m.textContent = msg;
		});
	}
	$i("importBoxArea").classList.remove("closed");
	document.body.classList.add("noOverflow");
}

// Simple function clears input/export box and removes that screen.
function removeImportBox() {
	$i("importTextBox").value = "";
	$i("importBoxArea").classList.add("closed");
	document.body.classList.remove("noOverflow");
}

// Parse input to import.
function doImport(toImport = $i("importTextBox").value.trim(), testing = false, loud = true) {
	// The imported info must match the following pattern.
	//					1				2				3			4				5			6				7	8	9		10	(11)			12		13	14		15		16
	var	patt = /--CATEGORIES--\n([\s\S]*)\n--REWRITE--\n([\s\S]*)\n--MONO--\n([\s\S]*)\n--MID--\n([\s\S]*)\n--INIT--\n([\s\S]*)\n--FINAL--\n([\s\S]*)\n--FLAGS--\n([01]) ([01]) ([^ ]+) ([^ \n]+)(\n--ADVANCED--\n([0-9]+)\n([0-9]+)\n([0-9]+)\n([0-9]+)\n([^\n]+))?/,
		m = patt.exec(toImport);
	if(testing) {
		if(m === null) {
			// Predef did not load correctly.
			console.log("Incorrect format.");
			return false;
		}
		// Predef DID load correctly.
		return true;
	}
	if(m === null) {
		if(loud) {
			return doAlert("Incorrect format.", "", "error");
		} else {
			return false;
		}
	}
	// Apply imported info to the boxes and checkboxes.
	$i("categories").value = m[1];
	$i("rewrite").value = m[2];
	$i("singleWord").value = m[3];
	$i("midWord").value = m[4];
	$i("wordInitial").value = m[5];
	$i("wordFinal").value = m[6];
	$i("oneType").checked = (m[7] !== "0");
	$i("slowSylDrop").checked = (m[8] !== "0");
	$i(m[9]).checked = true;
	$i(m[10]).checked = true;
	// Check for Advanced Options.
	if(m.length > 12 && m[11] !== undefined) {
		let counter = 12;
		while(counter < 16) {
			let test = Number(m[counter]);
			if(!Number.isInteger(test) || test < 1) {
				m[counter] = "1";
			}
			counter++;
		}
		$i("wordLengthInEms").value = m[12];
		$i("lexiconLength").value = m[13];
		$i("largeLexiconLength").value = m[14];
		$i("sentences").value = m[15];
		$i("rewSep").value = m[16];
	}
	// Hide/show boxes if needed.
	syllablicChangeDetection();
	// Return true if predef loaded correctly.
	if(!loud) {
		return true;
	}
	doAlert("Import Successful!", "", "success");
	// Announce success.
	// Clear the import stuff.
	removeImportBox();
}

// Create an importable text file continaing all current info.
function doExport(display = true) {
	var toExport;
	// Check if we're checking for the default values.
	if(display === null) {
		let flag = true;
		toExport = "--CATEGORIES--\n" + $i("categories").defaultValue +
		"\n--REWRITE--\n" + $i("rewrite").defaultValue +
		"\n--MONO--\n" + $i("singleWord").defaultValue +
		"\n--MID--\n" + $i("midWord").defaultValue +
		"\n--INIT--\n" + $i("wordInitial").defaultValue +
		"\n--FINAL--\n" + $i("wordFinal").defaultValue +
		"\n--FLAGS--\n" +
		($i("oneType").defaultChecked ? "1" : "0") + " " +
		($i("slowSylDrop").defaultChecked ? "1" : "0") + " ";
		$a("input[name=monoRate]").forEach(function(mr) {
			if(flag && mr.defaultChecked) {
				toExport += mr.getAttribute("id") + " ";
				flag = false;
			}
		});
		flag = true;
		$a("input[name=dropoff]").forEach(function(df) {
			if(flag && df.defaultChecked) {
				toExport += df.getAttribute("id");
				flag = false;
			}
		});
		return toExport;
	}
	toExport = "--CATEGORIES--\n" + $i("categories").value +
		"\n--REWRITE--\n" + $i("rewrite").value +
		"\n--MONO--\n" + $i("singleWord").value +
		"\n--MID--\n" + $i("midWord").value +
		"\n--INIT--\n" + $i("wordInitial").value +
		"\n--FINAL--\n" + $i("wordFinal").value +
		"\n--FLAGS--\n" +
		($i("oneType").checked ? "1" : "0") + " " +
		($i("slowSylDrop").checked ? "1" : "0") + " " +
		$q("input[name=monoRate]:checked").getAttribute("id") + " " +
		$q("input[name=dropoff]:checked").getAttribute("id");
	// Check if we're loading custom content.
	if(!display) {
		return toExport;
	}
	toExport +=
		"\n--ADVANCED--\n" +
		$i("wordLengthInEms").value + "\n" +
		$i("lexiconLength").value + "\n" +
		$i("largeLexiconLength").value + "\n" +
		$i("sentences").value + "\n" +
		$i("rewSep").value;
	// Put the info in the box.
	$i("importTextBox").value = toExport;
	// Show the box (and everything else) with instructions.
	prepImport("Copy this for your own records.<br><br>Hit 'Cancel' when you're done.");
}

// Save current info to the browser, if possible.
function saveCustom(test) {
	var predef = $i("predef");
	if(!Customizable) {
		doAlert("", "Your browser does not support Local Storage and cannot save your information.", "error");
		return;
	} else if (CustomInfo && test !== true) {
		return doConfirm(
			"Warning!",
			"You already have information saved. Do you want to overwrite it?",
			function() {saveCustom(true);},
			function() {doAlert("Previous information saved.", "Nothing overwritten.", "success");},
			"warning", "Yes", "No");
	}
	localStorage.setItem("CustomCategories",		$i("categories").value);
	localStorage.setItem("CustomRewrite",		$i("rewrite").value);
	localStorage.setItem("CustomSingleWord",		$i("singleWord").value);
	localStorage.setItem("CustomMidWord",		$i("midWord").value);
	localStorage.setItem("CustomInitial",		$i("wordInitial").value);
	localStorage.setItem("CustomFinal",			$i("wordFinal").value);
	localStorage.setItem("CustomOneType",		$i("oneType").checked);
	localStorage.setItem("CustomSlowSylDrop",		$i("slowSylDrop").checked);
	localStorage.setItem("CustomMono",			$q("input[name=monoRate]:checked").getAttribute("id"));
	localStorage.setItem("CustomDropoff",		$q("input[name=dropoff]:checked").getAttribute("id"));
	localStorage.setItem("CustomWordLengthInEms",	$i("wordLengthInEms").value);
	localStorage.setItem("CustomLexiconLength",	$i("lexiconLength").value);
	localStorage.setItem("CustomLargeLexiconLength",$i("largeLexiconLength").value);
	localStorage.setItem("CustomSentences",		$i("sentences").value);
	localStorage.setItem("CustomRewSep",		$i("rewSep").value);
	CustomInfo = true;

	// Check for the "Custom" predef option and add it if needed.
	if($q("option[value=\"pd-1\"]", predef) == null) {
		let option = document.createElement("option");
		option.value = "pd-1";
		option.textContent = "Custom";
		predef.prepend(option);
	}
	// Set predef drop-down to Custom.
	predef.value = "pd-1";
	// Save predef info.
	predefs["pd-1"] = doExport(false);
	// Alert success.
	doAlert("Saved to browser.", "", "success");
}

// Remove stored information from the browser.
function clearCustom(test) {
	if(!Customizable) {
		doAlert("Sorry!", "Your browser does not support Local Storage and cannot save your information.", "error");
		return;
	} else if (!CustomInfo) {
		doAlert("", "You don't have anything saved.", "error");
		return;
	} else if (CustomInfo && test !== true) {
		return doConfirm(
			"Warning!",
			"Are you sure you want to delete your saved settings?",
			function() {clearCustom(true);},
			function() {doAlert("Settings kept.", "", "success");},
			"warning", "Yes", "No");
	}
	// Clear storage.
	["CustomCategories","CustomRewrite","CustomSingleWord","CustomMidWord","CustomInitial","CustomFinal",
	"CustomOneType","CustomSlowSylDrop","CustomMono","CustomDropoff","CustomWordLengthInEms",
	"CustomLexiconLength","CustomLargeLexiconLength","CustomSentences","CustomRewSep"].forEach(function(x) {
		window.localStorage.removeItem(x);
	});
	CustomInfo = false;
	// Remove "Custom" from drop-down menu.
	$q("#predef option[value=\"-1\"]").remove();
	// Remove info.
	delete predefs["pd-1"];
	// Alert success.
	doAlert("Cleared from browser.", "", "success");
}

// Display the IPA and other stuff.
function showIPA() {
	// Moved to unicode.js
	erase();
	$i("outputText").appendChild(createIPASymbolsFragment([$e("br"), $e("br")]));
}
	
// Open/close the Advanced Options block.
function advancedOptions() {
	$i("advancedOpen").classList.toggle("closed");
}

// This loads the selected Predefs into the boxes and checkboxes.
function loadThisPredef(defN) {
	console.log("DEPRECATED FUNCTION CALL");
}


// Check the current value of the drop-down menu and send it along to loadThisPredef.
function loadPredef() {
	var pd = $i("predef").value;
	console.log(pd);
	doImport(predefs[pd], false, false);
	syllablicChangeDetection();
}


// Load predefs from file.
getter.addEventListener("load", parseResult);
getter.open("GET", predefFilename);
getter.send();
$i("loadPredefButton").disabled = true;
$i("predef").disabled = true;
//getter.weAreLoading = true;
// Save default info as "Starter"
predefs["pd1"] = doExport(null);
predefs.counter = 1;

// Called async when predefs are being loaded
function parseResult() {
	//console.log(getter);
	// Grab info.
	var loaded = getter.responseText.trim().split(/\n--END--/);
	// Store info.
	loaded.forEach(function(p) {
		// Info should start with a Name and a linebreak.
		var rxe = p.trim().match(/^([^\r\n]+)\r?\n/);
		if(rxe === null) {
			console.log("Unable to parse predef name: " + p);
		} else {
			// Put the name in 'name' and the info in 'info'
			let name = rxe[0].trim(), info = p.slice(rxe[0].length).replace(/\r/g, "").trim();
			console.log("Testing predef: " + name);
			// Send info off t be tested for validness
			if(doImport(info, true)) {
				// Test passed.
				let target = $i("predef"), opt = document.createElement("option"), val = "pd";
				// target is the <select> containing predefs.
				// opt is a new <option> we're adding to it
				console.log("Saving predef: " + name);
				// Increase counter, generate a unique name.
				predefs.counter++;
				val += predefs.counter.toString();
				// Save info internally.
				predefs[val] = info;
				// Set properties of <option>
				opt.textContent = name;
				opt.value = val;
				// Add <option> to <select>
				target.appendChild(opt);
			} else {
				// Test failed.
				console.log(info.replace(/\n/g, "\\n"));
			}
		}
	});
	// Mark that we're no longer waiting.
	$i("loadPredefButton").disabled = false;
	$i("predef").disabled = false;
	//getter.weAreLoading = false;
	// if we're waiting for a new idea, print one now
	// save the ideas for later use
}


// If the "one type of syllables" box is [un]checked, change which boxes are visible.
function syllablicChangeDetection()  {
	//console.log("fired");
	if($i("oneType").checked) {
		$a("#p_multi,.multiswap").forEach( w => w.classList.add("hidden") );
		$a(".singleswap").forEach( w => w.classList.remove("hidden") );
		//console.log("checked");
	} else {
		$a("#p_multi,.multiswap").forEach( w => w.classList.remove("hidden") );
		$a(".singleswap").forEach( w => w.classList.add("hidden") );
		//console.log("unchecked");
	}
}











// Check for localStorage.
if(typeof(Storage) !== "undefined") {
	// Make this known to other functions.
	Customizable = true;
	// Check if we have info stored. If so, load it up.
	if(localStorage.getItem("CustomCategories") !== null) {
		CustomInfo = true;
		// Set drop-down menu to the custom info.
		let option = document.createElement("option"),
		propTrue = [localStorage.getItem("CustomMono"), localStorage.getItem("CustomDropoff")],
		propFalse = [];
		$i("categories").value = localStorage.getItem("CustomCategories");
		$i("rewrite").value = localStorage.getItem("CustomRewrite");
		$i("singleWord").value = localStorage.getItem("CustomSingleWord");
		$i("midWord").value = localStorage.getItem("CustomMidWord");
		$i("wordInitial").value = localStorage.getItem("CustomInitial");
		$i("wordFinal").value = localStorage.getItem("CustomFinal");
		if(localStorage.getItem("CustomOneType") === "true") {
			propTrue.push("oneType");
		} else {
			propFalse.push("oneType");
		}
		if(localStorage.getItem("CustomSlowSylDrop") === "true") {
			propTrue.push("slowSylDrop");
		} else {
			propFalse.push("slowSylDrop");
		}
		propTrue.forEach( box => $i(box).checked = true );
		propFalse.forEach( box => $i(box).checked = false );
		predefs["pd-1"] = doExport(false);
		option.value = "pd-1";
		option.textContent = "Custom";
		$i("predef").prepend(option);
		$i("predef").value = "pd-1";
	}
	//console.log(propTrue);
	//console.log(propFalse);
	syllablicChangeDetection();
}

// Toggle boxes when "one type of syllable" box is [un]checked.
$i("oneType").addEventListener("change", function(event) {
	syllablicChangeDetection();
});
// Fire it right now.
syllablicChangeDetection();


// Set up the buttons.
$i("advancedOpenButton").addEventListener("click", advancedOptions);
$i("saveCustomButton").addEventListener("click", saveCustom);
$i("clearCustomButton").addEventListener("click", clearCustom);
$i("prepImportButton").addEventListener("click", prepImport);
$i("generateButton").addEventListener("click", generate);
$i("eraseButton").addEventListener("click", erase);
$i("clearBoxesButton").addEventListener("click", clearBoxes);
$i("showIPAButton").addEventListener("click", showIPA);
$i("loadPredefButton").addEventListener("click", loadPredef);
$i("doImportButton").addEventListener("click", doImport);
$i("removeImportBoxButton").addEventListener("click", removeImportBox);
$i("doExportButton").addEventListener("click", doExport);




// Use SweetAlert2 if available!
function doAlert(title, text, type) {
	if(typeof(Swal) !== 'undefined') {
		// We has it!
		Swal.fire({
			type: type,
			title: title,
			html: text,
			customClass: "doAlertBox",
			buttonsStyling: false
		});
	} else {
		// We don't has it.
		alert((title + " " + text.replace(/<br>/g, "\n").replace(/<[^>]*>/g, "")).trim());
	}
}
function doConfirm(title, text, yesFunc, noFunc, type = "question", yes = "Ok", no = "Cancel") {
	if(typeof(Swal) !== 'undefined') {
		// We has it!
		Swal.fire({
			title: title,
			html: text,
			type: type,
			showCancelButton: true,
			confirmButtonText: yes,
			cancelButtonText: no,
			customClass: "doAlertBox",
			buttonsStyling: false
		}).then((result) => result.value ? yesFunc() : noFunc() );
	} else {
		// We don't has it.
		if(confirm((title + " " + text.replace(/<br>/g, "\n").replace(/<[^>]*>/g, "")).trim())) {
			yesFunc();
		} else {
			noFunc();
		}
	}
}
