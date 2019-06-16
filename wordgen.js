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

CustomInfo = false,	// Used by Defaults to check localStorage for saved info.
Customizable = false;	// Used to indicate that saving is possible.




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
		nSentences = getAdvancedNumber("#sentences", 30, 500);
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
	return output;
}

// Create a list of nLexTotal words
function createLex(capitalize, monoRate, oneType, showSyls, dropoff, slowSylDrop) {
	var	w,output = "<div class=\"lexicon\" style=\"grid-template-columns: repeat(auto-fit, minmax(" + getAdvancedNumber("#wordLengthInEms", 10, 1000) + "em, 1fr) )\">\n",
		nLexTotal = getAdvancedNumber("#lexiconLength", 150, 1000);
	for (w = 0; w < nLexTotal; w++) {
		//if (w % 10 === 0) {
		//	output += "<tr>";
		//}
		output += "<div>" + getOneWord(capitalize, monoRate, oneType, showSyls, dropoff, slowSylDrop) + "</div>";
		//if (w % 10 === 9) {
		//	output += "</tr>\n";
		//}
	}
	output += "</table></div>\n";
	return output;
}

// Create a list of nLexTotal * 5 words
function createLongLex(monoRate, oneType, showSyls, dropoff, slowSylDrop) {
	var	w, output="",
		nLexTotal = getAdvancedNumber("largeLexiconLength", 750, 5000);
	for (w = 0; w < nLexTotal * 5; w++) {
		output += getOneWord(false, monoRate, oneType, showSyls, dropoff, slowSylDrop) + "<br>\n";
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
	return output.join("<br>");
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
	var	text = document.createTextNode(html),
		p = document.createElement('p');
	p.appendChild(text);
	return p.innerHTML;
}

// User hit the action button.  Make things happen!
function generate() {
	var whichWay,counter,foo,bar,baz,output,tester,errorMessages = [],showSyls,slowSylDrop,oneType,monoRate,dropoff,tempArray,ncat;
	// Read parameters.
	whichWay = document.querySelector("input[type=radio][name=outType]:checked").value;	// What output are we aiming for?
	showSyls = document.getElementById("showSyls").checked;	// Do we show syllable breaks?
	slowSylDrop = document.getElementById("slowSylDrop").checked;	// Do we (somewhat) flatten out the syllable dropoff?
	oneType = document.getElementById("oneType").checked;	// Are we only using one syllable box?
	monoRate = Number(document.querySelector("input[type=radio][name=monoRate]:checked").value);	// The rate of monosyllable words.
	dropoff = Number(document.querySelector("input[type=radio][name=dropoff]:checked").value);	// How fast do the category runs flatten out?

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
	baz = document.getElementById("categories").value;
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
				errorMessages.push("<strong>Error:</strong>" + escapeHTML(thiscat) + "<br>Categories must be of the form V=aeiou<br>That is, a single letter, an equal sign, then a list of possible expansions.");
				// End the looping.
				return false;
			} else {
				// Isolate the category name.
				bar = thiscat.charAt(0);
				if(categories.hasOwnProperty(bar)) {
					// If we have defined this category before, throw an error.
					errorMessages.push("<strong>Error:</strong> You have defined category " + escapeHTML(bar) + " more than once.");
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
	baz = document.getElementById("midWord").value;
	if(baz !== previousMidWordSyls) {
		midWordSyls = parseSyllables(baz);
		previousMidWordSyls = baz;
	}

	baz = document.getElementById("wordInitial").value;
	if(baz !== previousWordInitSyls) {
		wordInitSyls = parseSyllables(baz);
		previousWordInitSyls = baz;
	}

	baz = document.getElementById("wordFinal").value;
	if(baz !== previousWordFinalSyls) {
		wordFinalSyls = parseSyllables(baz);
		previousWordFinalSyls = baz;
	}

	baz = document.getElementById("singleWord").value;
	if(baz !== previousSingleWordSyls) {
		singleWordSyls = parseSyllables(baz);
		previousSingleWordSyls = baz;
	}

	// Grab the rewrite rules.
	baz = document.getElementById("rewrite").value;
	// Find the splitter. (|| by default)
	foo = document.getElementById("rewSep").value;
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
				errorMessages.push("<strong>Error:</strong>" + escapeHTML(rule) + "<br>Rewrite rules must be in the form x" + rewSep + "y<br>That is, a rule (x), followed by " + (rewSep === "||" ? "two vertical bars" : "the exact text \"" + rewSep + "\"") + ", followed by a replacement expression (y, which may be blank).");
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
		errorMessages.push("<strong>Missing:</strong> You must have categories to generate text.");
	}

	// Check that syllables exist.
	if (oneType && wordInitSyls.length <= 0) {
		errorMessages.push("<strong>Missing:</strong> You must have syllable types to generate text.");
	} else if (!oneType && (midWordSyls.length <= 0 || wordInitSyls.length <= 0 || wordFinalSyls.length <= 0 || singleWordSyls.length <= 0)) {
		errorMessages.push("<strong>Missing:</strong> You must have <em>all</em> syllable types to generate text.");
	}

	// Print error message or requested data.
	if (errorMessages.length > 0) {
		output = errorMessages.join("<br><br>");
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
	document.getElementById("outputText").innerHTML = output;
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
	document.getElementById("outputText").innerHTML = null;
}

// Reset boxes to empty and some checkboxes to certain default values.
function clearBoxes() {
	document.getElementById("categories").value = "";
	document.getElementById("wordInitial").value = "";
	document.getElementById("midWord").value = "";
	document.getElementById("singleWord").value = "";
	document.getElementById("wordFinal").value = "";
	document.getElementById("rewrite").value = "";
	document.getElementById("monoLessFrequent").checked = true;
	document.getElementById("dropoffMedium").checked = true;
	document.getElementById("textOutput").checked = true;
	document.getElementById("showSyls").checked = false;
	document.getElementById("slowSylDrop").checked = false;
	document.getElementById("defaultName").textContent = "";
}

// Simple function sets up the import/export screen.
function prepImport(msg = "") {
	if(msg === "") {
		document.querySelectorAll("#importBoxArea .msg").forEach( m => m.classList.add("hidden"));
	} else {
		document.querySelectorAll("#importBoxArea .msg").forEach( function(m) {
			m.classList.remove("hidden");
			m.innerHTML = msg;
		});
	}
	document.getElementById("importBoxArea").classList.remove("closed");
	document.body.classList.add("noOverflow");
}

// Simple function clears input/export box and removes that screen.
function removeImportBox() {
	document.getElementById("importTextBox").value = "";
	document.getElementById("importBoxArea").classList.add("closed");
	document.body.classList.remove("noOverflow");
}

// Parse input to import.
function doImport() {
	// The imported info must match the following pattern.
	//				1				2				3			4				5			6				7	8	9	10		(11)		12		13		14	15		16
	var patt = /--CATEGORIES--\n([\s\S]*)\n--REWRITE--\n([\s\S]*)\n--MONO--\n([\s\S]*)\n--MID--\n([\s\S]*)\n--INIT--\n([\s\S]*)\n--FINAL--\n([\s\S]*)\n--FLAGS--\n([01]) ([01]) ([^ ]+) ([^ \n]+)(\n--ADVANCED--\n([0-9]+)\n([0-9]+)\n([0-9]+)\n([0-9]+)\n([^\n]+))?/,
		toImport = document.getElementById("importTextBox").value,
		m = patt.exec(toImport),foo,bar;
	if(m === null) {
		return doAlert("Incorrect format.", "", "error");
	}
	// Apply imported info to the boxes and checkboxes.
	document.getElementById("categories").value = m[1];
	document.getElementById("rewrite").value = m[2];
	document.getElementById("singleWord").value = m[3];
	document.getElementById("midWord").value = m[4];
	document.getElementById("wordInitial").value = m[5];
	document.getElementById("wordFinal").value = m[6];
	document.getElementById("oneType").checked = (m[7] !== "0");
	document.getElementById("slowSylDrop").checked = (m[8] !== "0");
	document.getElementById(m[9]).checked = true;
	document.getElementById(m[10]).checked = true;
	// Check for Advanced Options added later.
	if(m.length > 12) {
		foo = 12;
		while(foo < 16) {
			bar = Number(m[foo]);
			if(!Number.isInteger(bar) || bar < 1) {
				m[foo] = "1";
			}
			foo++;
		}
		document.getElementById("wordLengthInEms").value = m[12];
		document.getElementById("lexiconLength").value = m[13];
		document.getElementById("largeLexiconLength").value = m[14];
		document.getElementById("sentences").value = m[15];
		document.getElementById("rewSep").value = m[16];
	}
	// Hide/show boxes if needed.
	syllablicChangeDetection();
	// Announce success.
	doAlert("Import Successful!", "", "success");
	// Clear the import stuff.
	removeImportBox();
}

// Create an importable text file continaing all current info.
function doExport() {
	var toExport = "--CATEGORIES--\n" + document.getElementById("categories").value +
		"\n--REWRITE--\n" + document.getElementById("rewrite").value +
		"\n--MONO--\n" + document.getElementById("singleWord").value +
		"\n--MID--\n" + document.getElementById("midWord").value +
		"\n--INIT--\n" + document.getElementById("wordInitial").value +
		"\n--FINAL--\n" + document.getElementById("wordFinal").value +
		"\n--FLAGS--\n" +
		(document.getElementById("oneType").checked ? "1" : "0") + " " +
		(document.getElementById("slowSylDrop").checked ? "1" : "0") + " " +
		document.querySelector("input[name=monoRate]:checked").getAttribute("id") + " " +
		document.querySelector("input[name=dropoff]:checked").getAttribute("id") +
		"\n--ADVANCED--\n" +
		document.getElementById("wordLengthInEms").value + "\n" +
		document.getElementById("lexiconLength").value + "\n" +
		document.getElementById("largeLexiconLength").value + "\n" +
		document.getElementById("sentences").value + "\n" +
		document.getElementById("rewSep").value;
	// Put the info in the box.
	document.getElementById("importTextBox").value = toExport;
	// Show the box (and everything else) with instructions.
	prepImport("Copy this for your own records.<br><br>Hit 'Cancel' when you're done.");
}

// Save current info to the browser, if possible.
function saveCustom(test) {
	var predef = document.getElementById("predef");
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
	localStorage.setItem("CustomCategories",		document.getElementById("categories").value);
	localStorage.setItem("CustomRewrite",		document.getElementById("rewrite").value);
	localStorage.setItem("CustomSingleWord",		document.getElementById("singleWord").value);
	localStorage.setItem("CustomMidWord",		document.getElementById("midWord").value);
	localStorage.setItem("CustomInitial",		document.getElementById("wordInitial").value);
	localStorage.setItem("CustomFinal",			document.getElementById("wordFinal").value);
	localStorage.setItem("CustomOneType",		document.getElementById("oneType").checked);
	localStorage.setItem("CustomSlowSylDrop",		document.getElementById("slowSylDrop").checked);
	localStorage.setItem("CustomMono",			document.querySelector("input[name=monoRate]:checked").getAttribute("id"));
	localStorage.setItem("CustomDropoff",		document.querySelector("input[name=dropoff]:checked").getAttribute("id"));
	localStorage.setItem("CustomWordLengthInEms",	document.getElementById("wordLengthInEms").value);
	localStorage.setItem("CustomLexiconLength",	document.getElementById("lexiconLength").value);
	localStorage.setItem("CustomLargeLexiconLength",document.getElementById("largeLexiconLength").value);
	localStorage.setItem("CustomSentences",		document.getElementById("sentences").value);
	localStorage.setItem("CustomRewSep",		document.getElementById("rewSep").value);
	CustomInfo = true;

	// Check for the "Custom" predef option and add it if needed.
	if(predef.querySelector("option[value=\"-1\"]") == null) {
		let option = document.createElement("option");
		option.value = "-1";
		option.textContent = "Custom";
		predef.prepend(option);
	}
	// Set predef drop-down to Custom.
	predef.value = "-1";
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
	document.querySelector("#predef option[value=\"-1\"]").remove();
	// Alert success.
	doAlert("Cleared from browser.", "", "success");
}

// Display the IPA and other stuff.
function showIPA() {
	// Moved to unicode.js
	document.getElementById("outputText").innerHTML = returnIPAPlus("<span class=\"desc\">", "</span>\n<div class=\"extraGroup\">", "</div>\n", "<br><br>");
}
	
// Open/close the Advanced Options block.
function advancedOptions() {
	document.getElementById("advancedOpen").classList.toggle("closed");
}

// This loads the selected Predefs into the boxes and checkboxes.
function loadThisPredef(defN) {
	// A lot of this uses String.fromCharCode() because my original editor didn't support enough Unicode.
	// I still feel it's safer to keep it that way.
	// Leaving comments with decimal number, hex number, the character itself, and the Unicode name.
	//	226	0x00E2	â	LATIN SMALL LETTER A WITH CIRCUMFLEX
	//	234	0x00EA	ê	LATIN SMALL LETTER E WITH CIRCUMFLEX
	//	241	0x00F1	ñ	LATIN SMALL LETTER N WITH TILDE
	//	244	0x00F4	ô	LATIN SMALL LETTER O WITH CIRCUMFLEX
	//	246	0x00F6	ö	LATIN SMALL LETTER O WITH DIAERESIS
	//	252	0x00FC	ü	LATIN SMALL LETTER U WITH DIAERESIS
	//	257	0x0101	ā	LATIN SMALL LETTER A WITH MACRON
	//	269	0x010D	č	LATIN SMALL LETTER C WITH CARON
	//	275	0x0113	ē	LATIN SMALL LETTER E WITH MACRON
	//	299	0x012B	ī	LATIN SMALL LETTER I WITH MACRON
	//	301	0x012D	ĭ	LATIN SMALL LETTER I WITH BREVE
	//	314	0x013A	ĺ	LATIN SMALL LETTER L WITH ACUTE
	//	324	0x0144	ń	LATIN SMALL LETTER N WITH ACUTE
	//	330	0x014A	Ŋ	LATIN CAPITAL LETTER ENG
	//	331	0x014B	ŋ	LATIN SMALL LETTER ENG
	//	333	0x014D	ō	LATIN SMALL LETTER O WITH MACRON
	//	347	0x015B	ś	LATIN SMALL LETTER S WITH ACUTE
	//	353	0x0161	š	LATIN SMALL LETTER S WITH CARON
	//	363	0x016B	ū	LATIN SMALL LETTER U WITH MACRON
	//	382	0x017E	ž	LATIN SMALL LETTER Z WITH CARON
	//	450	0x01C2	ǂ	LATIN LETTER ALVEOLAR CLICK
	//	451	0x01C3	ǃ	LATIN LETTER RETROFLEX CLICK
	//	654	0x028E	ʎ	LATIN SMALL LETTER TURNED Y
	//	664	0x0298	ʘ	LATIN LETTER BILABIAL CLICK
	//	688	0x02B0	ʰ	MODIFIER LETTER SMALL H
	//	769	0x0301	◌́ 	COMBINING ACUTE ACCENT
	var cc,rw,wi,sy = "",sg = "",wf = "",propTrue = ["oneType","monoLessFrequent","dropoffMedium"],propFalse = ["slowSylDrop"];
	switch (defN) {
		case -1:// Custom Info
			if(CustomInfo) {
				cc = localStorage.getItem("CustomCategories");
				rw = localStorage.getItem("CustomRewrite");
				sg = localStorage.getItem("CustomSingleWord");
				sy = localStorage.getItem("CustomMidWord");
				wi = localStorage.getItem("CustomInitial");
				wf = localStorage.getItem("CustomFinal");
				propTrue = [localStorage.getItem("CustomMono"), localStorage.getItem("CustomDropoff")];
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
				// Only do this part if necessary.
				if(localStorage.getItem("CustomRewSep") !== null) {
					document.getElementById("wordLengthInEms").value = localStorage.getItem("CustomWordLengthInEms");
					document.getElementById("lexiconLength").value = localStorage.getItem("CustomLexiconLength");
					document.getElementById("largeLexiconLength").value = localStorage.getItem("CustomLargeLexiconLength");
					document.getElementById("sentences").value = localStorage.getItem("CustomSentences");
					document.getElementById("rewSep").value = localStorage.getItem("CustomRewSep");
				}
			} else {
				// Trigger the default action.
				loadThisPredef(0);
			}
			break;
		case 1: // Starter (original default)
			cc = "C=ptkbdg\nR=rl\nV=ieaou";
			rw = "ki||" + String.fromCharCode(269) + "i";
			wi = "CV\nV\nCRV";
			break;
		case 2: // Large inventory
			cc = "C=ptknslrmbdgfvwyh" + String.fromCharCode(353) + "z" +
				String.fromCharCode(241) + "x" + String.fromCharCode(269, 382, 330) +
				"\nV=aiuoe" + String.fromCharCode(603,596,226,244,252,246) + "\nR=rly";
			rw = String.fromCharCode(226) + "||ai\n" + String.fromCharCode(244) + "||au";
			wi = "CV\nV\nCVC\nCRV";
			break;
		case 3: // Latinate
			cc = "C=tkpnslrmfbdghvyh\nV=aiueo\nU=aiu" + String.fromCharCode(224,234) +
				"\nR=rl\nM=nsrmltc\nK=ptkbdg";
			rw = "ka||ca\nko||co\nku||cu\nkr||cr";
			wi = "CV\nCUM\nV\nUM\nKRV\nKRUM";
			break;
		case 4: // Simple
			cc = "C=tpknlrsm" + String.fromCharCode(654) + "bdg" + String.fromCharCode(241) +
				"fh\nV=aieuo" + String.fromCharCode(257, 299, 363, 275, 333) + "\nN=n" +
				String.fromCharCode(331);
			rw = "aa||" + String.fromCharCode(257) + "\nii||" + String.fromCharCode(299) +
				"\nuu||" + String.fromCharCode(363) + "\nee||" + String.fromCharCode(275) + "\noo||" +
				String.fromCharCode(333) + "\nnb||mb\nnp||mp";
			wi = "CV\nV\nCVN";
			break;
		case 5: // Chinese
			cc = "C=ptknlsm" + String.fromCharCode(353) + "yw" + String.fromCharCode(269) +
				"hf" + String.fromCharCode(331) + "\nV=auieo\nR=rly\nN=nn" + String.fromCharCode(331) +
				"mktp\nW=io\nQ=ptk" + String.fromCharCode(269);
			rw = "uu||wo\noo||ou\nii||iu\naa||ia\nee||ie";
			wi = "CV\nQ" + String.fromCharCode(688) + "V\nCVW\nCVN\nVN\nV\nQ" +
				String.fromCharCode(688) + "VN";
			break;
		case 6: // Kartaran
			cc = "S=tspkThfS\nC=kstSplrLnstmTNfh\nI=aoueAOUE\nV=aoiueAOUE\nE=sfSnmNktpTh";
			rw = "([aeiou])\\1{2,}||$1$1\n([AEOU])\\1+||$1\n(%V{2})%V+||$1\nh+||h\n" +
				"h(?=%V(%E|%C{0,2}%V)\\b)||H\n(%V)h(?=%V\\b)||$1H\n\\bh||H\nh\\b||H\n" +
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
				String.fromCharCode(347) + "\nN||" + String.fromCharCode(324);
			sg = "SV\nSVE\nSV\nSV";
			sy = "SV\nI\nCV\nSVC";
			wi = "SV\nV\nSVC";
			wf = "I\nVE\nV\nVE\nSVE\nV\nCV\nVE\nCVE";
			propTrue = ["monoRare","dropoffMedium"];
			propFalse.push("oneType");
			break;
		case 7: // Reemish
			cc = "I=rlmnpbBTRG\nC=pbtdkgnmGszSZwrlBTR\nE=pbtdkgnmGl\nM=pbtdkgnmGrlszSZw\n" + 
				"S=pbtdkg\nN=nmG\nX=szSZwrlnmG\nA=wrl\nV=aIuioe";
			rw = "^(b|p)w||$1\n^G||w\n(%X)%X||$1\n(%N|%A)(?=%S)||\n%X(?=%S%A)||\n" + 
				"^g(?=[ei])||gh\n([sS])d||$1t\nG||ng\nS||sh\nZ||zh\ni||ee\nI||i\ni$||e\nB||" +
				String.fromCharCode(664) + "\nT||" + String.fromCharCode(451) + "\nR||" +
				String.fromCharCode(450);
			sg = "IVN\nVS\nCVE\nSAV\nSAVE\nCV\nCVN";
			sy = "SV\nNV\nMV\nSAV\nSVX\nMVX\nSAVX";
			wi = "SV\nIV\nAV\nCV\nSAV\nVX\nAVX\nCVX\nIVX\nSAVX";
			wf = "MV\nMVE\nSAV\nSAVE";
			propTrue = ["monoFrequent","dropoffSlow"];
			propFalse.push("oneType");
			break;
		default: // Null
			return doAlert("", "Choose something from the list, first.", "error");
	}
	document.getElementById("categories").value = cc;
	document.getElementById("rewrite").value = rw;
	document.getElementById("wordInitial").value = wi;;
	document.getElementById("midWord").value = sy;
	document.getElementById("singleWord").value = sg;
	document.getElementById("wordFinal").value = wf;
	//console.log(propTrue);
	//console.log(propFalse);
	propTrue.forEach( box => document.getElementById(box).checked = true );
	propFalse.forEach( box => document.getElementById(box).checked = false );
	syllablicChangeDetection();
}


// Check the current value of the drop-down menu and send it along to loadThisPredef.
function loadPredef() {
	var predef = document.getElementById("predef").value;
	loadThisPredef(Number(predef));
}

// If the "one type of syllables" box is [un]checked, change which boxes are visible.
function syllablicChangeDetection()  {
	//console.log("fired");
	if(document.getElementById("oneType").checked) {
		document.querySelectorAll("#p_multi,.multiswap").forEach( w => w.classList.add("hidden") );
		document.querySelectorAll(".singleswap").forEach( w => w.classList.remove("hidden") );
		//console.log("checked");
	} else {
		document.querySelectorAll("#p_multi,.multiswap").forEach( w => w.classList.remove("hidden") );
		document.querySelectorAll(".singleswap").forEach( w => w.classList.add("hidden") );
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
		let option = document.createElement("option");
		option.value = "-1";
		option.textContent = "Custom";
		document.getElementById("predef").prepend(option);
		document.getElementById("predef").value = "-1";
		loadThisPredef(-1);
	}
}

// Toggle boxes when "one type of syllable" box is [un]checked.
document.getElementById("oneType").addEventListener("change", function(event) {
	syllablicChangeDetection();
});
// Fire it right now.
syllablicChangeDetection();


// Set up the buttons.
document.getElementById("advancedOpenButton").addEventListener("click", advancedOptions);
document.getElementById("saveCustomButton").addEventListener("click", saveCustom);
document.getElementById("clearCustomButton").addEventListener("click", clearCustom);
document.getElementById("prepImportButton").addEventListener("click", prepImport);
document.getElementById("generateButton").addEventListener("click", generate);
document.getElementById("eraseButton").addEventListener("click", erase);
document.getElementById("clearBoxesButton").addEventListener("click", clearBoxes);
document.getElementById("showIPAButton").addEventListener("click", showIPA);
document.getElementById("loadPredefButton").addEventListener("click", loadPredef);
document.getElementById("doImportButton").addEventListener("click", doImport);
document.getElementById("removeImportBoxButton").addEventListener("click", removeImportBox);
document.getElementById("doExportButton").addEventListener("click", doExport);




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
