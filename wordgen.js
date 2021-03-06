// Script (C) 2012 by Mark Rosenfelder.
// You can modify the code for non-commercial use;
// attribution would be nice.
// If you want to make money off it, please contact me.

// Modified by Jason Tamez 2017-2020.
// Code available here: https://github.com/jasontamez/wordgen

var $WG = {
	categories: null, // Used to interpret the categories
	midWordSyls: null, // Holds mid-word syllables
	wordInitSyls: null, // Holds word-initial syllables
	wordFinalSyls: null, // Holds word-final syllables
	singleWordSyls: null, // Holds syllables for single-syllable words
	rew: null, // Holds rewrite rules
	previous: { // Holds raw info previously processed, so we can check and not re-process it
		overrides: null, // Checks overrides.total
		categories: null, // Holds previous categories
		midWordSyls: null,
		wordInitSyls: null,
		wordFinalSyls: null,
		singleWordSyls: null, // These four hold previous syllable boxes
		rew: null // Holds previous rewrite rules
	},
	rewSep: false, // Separates rewrite selector from replacement
	customInfo: false, // Used by Defaults to check localStorage for saved info
	customizable: false, // Used to indicate that saving is possible
	getter: new XMLHttpRequest(), // Used to download stored predefs
	predefFilename: "/predefs.json", // Where they are stored
	predefs: new Map(), // Used to store predefs
	SPACE: String.fromCharCode(0x00a0), // Non-breaking space for text formatting
	dropoff: 30, // 0-100 percentage that the first letter in a category gets picked
	monoRate: 20, // 0-100 percentage that a given word is monosyllabic
	slowSylDrop: false, // Do we slow the multisyllabic dropoff?
	showSyls: false, // Do we show syllable breaks?
	oneType: true, // Is there only one type of syllable?
	overrides: { // Advanced option overrides for some of the above
		dropoff: 0, // overrides dropoff
		monoRate: 0, // overrides monoRate
		sylRate: 0, // overrides slowSylDrop and related code
		total: false, // allows overriding everything on a per-item basis
		cue: ">", // marks where the override begins
		sep: ",", // marks where override values separate
		categories: null, // used to store per-category overrides
		midWordSyls: null, // used to store per-syllable overrides
		wordInitSyls: null, // used to store per-syllable overrides
		wordFinalSyls: null, // used to store per-syllable overrides
		singleWordSyls: null, // used to store per-syllable overrides
		flags: { // notes when a per-syllable override has been fully processed
			midWordSyls: false,
			wordInitSyls: false,
			wordFinalSyls: false,
			singleWordSyls: false
		}
	}
};

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
	if (text !== false) {
		e.textContent = text;
	}
	if (atts !== false) {
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

// A quick and dirty way to escape HTML characters by turning a string into a text node and back again.
function escapeHTML(html) {
	return $e("p", html).innerHTML;
}

// Trim elements of whitespace and remove blank elements from given array.
function parseSyllables(input) {
	var output = [],
		overrideObject = $WG.overrides,
		total = overrideObject.total,
		patterns = input.split(/\r?\n/),
		rates = total ? [] : null,
		lastRate = overrideObject.sylRate || calcDropoff(input.length);
	// Split input by linebreaks and then go through each element one by one.
	patterns.forEach(function(t) {
		// Remove whitespace.
		var trimmed = t.trim();
		if(trimmed === "") {
			// No string? Skip!
			return;
		} else if (total) {
			// Look for dropoff rate, if needed
			let [text, rateString] = trimmed.split(overrideObject.cue);
			trimmed = text.trim();
			if(trimmed === "") {
				// No string? Skip!
				return;
			}
			if(!rateString || !(rateString = rateString.trim())) {
				rates.push(lastRate);
			} else {
				let newRate = validatePercentage(rateString, lastRate);
				lastRate = newRate;
				rates.push(newRate);
			}
		}
		output.push(trimmed);
	});
	// Return the good info.
	return {
		syllables: output,
		ratesFound: rates
	};
}

function handleCategoriesInRewriteRule(rule) {
	// %% converts to %.
	// Split along those, then join with % at end.
	var broken = rule.split("%%"),
		rewritten = [],
		catt = $WG.categories,
		testing,
		chunk,
		bit;
	while (broken.length) {
		// First, check for category negation.
		// Separate into array, split along !% negations.
		testing = broken.shift().split("!%");
		// Save the first bit (before any !% was found) as chunk.
		chunk = testing.shift();
		// Check each bit one at a time.
		while (testing.length) {
			let testCat;
			bit = testing.shift();
			// What's the category being negated?
			testCat = catt.get(bit.charAt(0));
			// Is it actually a category?
			if (test !== undefined) {
				// Category found. Replace with [^a-z] construct, where a-z is the category contents.
				chunk += "[^" + testCat + "]";
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
		while (testing.length) {
			let testCat;
			bit = testing.shift();
			// What's the category?
			testCat = catt.get(bit.charAt(0));
			// Is it actually a category?
			if (testCat !== undefined) {
				// Category found. Replace with [a-z] construct, where a-z is the category contents.
				chunk += "[" + testCat + "]";
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
	//var counter, parse;
	//// Go through each rule one by one.
	//for (counter = 0; counter < nrew; counter++) {
	//	// Grab the rule and replacement.
	//	parse = $WG.rew[counter.toString()];
	//	// Apply the rule to the input with the replacement.
	//	input = input.replace(parse[0], parse[1]);
	//}
	// Go through each rule one by one.
	$WG.rew.forEach(function(repl, rx) {
		// Apply the rule to the input with the replacement.
		input = input.replace(rx, repl);
	});
	return input;
}

// Cheap iterative implementation of a power law:
//   Returns a number from 0 to max, favoring the lower end.
//   1) Counter starts at zero, and we grab a random percentage.
//   2) If the random percentage is less than pct, return the value of the counter.
//   3) Otherwise, increment counter and try again.
//   4) If counter becomes equal to max, reset it to 0.
function powerLaw(max, pct) {
	var randomP;
	for (randomP = 0; true; randomP = (randomP + 1) % max) {
		// The 'true' in there means this loop never ends on its own.
		if (Math.floor(Math.random() * 101) < pct) {
			return randomP;
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
function oneSyllable(word, syllableBoxChoice) {
	// Choose the pattern
	var pattern = syllPatternPick(syllableBoxChoice),
		catt = $WG.categories,
		o = $WG.overrides,
		override = o.total,
		dropoff = o.dropoff || $WG.dropoff,
		counter;

	// For each letter in the pattern, find the category
	for (counter = 0; counter < pattern.length; counter++) {
		let categoryName = pattern.charAt(counter),
		// Go find it in the categories list
			theCat = catt.get(categoryName);
		if (theCat === undefined) {
			// Not found: output syllable directly
			word += categoryName;
		} else {
			let catLength = theCat.length,
				randomNum = -1;
			// Get a random letter from the category
			if(override) {
				randomNum = handleInlineCategoryDropoffRate(categoryName, catLength, dropoff);
			}
			if(randomNum === -1) {
				if (dropoff === 0) {
					randomNum = Math.random() * catLength;
				} else {
					randomNum = powerLaw(catLength, dropoff);
				}
			}
			// Add it to the word
			word += theCat.charAt(randomNum);
		}
	}

	// Return the word with the completed syllable!
	return word;
}

// Choose a syllable pattern from the appropriate collection of syllables.
function syllPatternPick(syllableBoxChoice) {
	var overrideObject = $WG.overrides,
		numberOfSyllables, syllables, prop;
	switch (syllableBoxChoice) {
		case -1:
			// First syllable
			prop = "wordInitSyls";
			break;
		case 0:
			// Middle syllable
			prop = "midWordSyls";
			break;
		case 1:
			// Last syllable
			prop = "wordFinalSyls";
			break;
		case 2:
			// Only syllable
			prop = "singleWordSyls";
			break;
	}
	if(overrideObject.total) {
		return inlineSyllableRatePicker(prop);
	}
	// Save these for speed.
	syllables = $WG[prop];
	numberOfSyllables = syllables.length;
	// Use powerLaw() and calcDropoff() to determine which syllable in the collection to pick.
	return syllables[powerLaw(numberOfSyllables, overrideObject.sylRate || calcDropoff(numberOfSyllables))];
}

function inlineSyllableRatePicker(prop) {
	var syllables = $WG[prop],
		length = syllables.length,
		lastRate = 12,
		overrideObject = $WG.overrides,
		rates = overrideObject[prop],
		pos;
	if(!overrideObject.flags[prop]) {
		rates = rates.map(function(rate) {
			if(!rate) {
				return lastRate;
			}
			lastRate = rate;
			return rate;
		});
		while(rates.length < length) {
			rates.push(lastRate);
		}
		if(rates.length > length) {
			rates = rates.slice(0, length);
		}
		overrideObject.flags[prop] = true;
	}
	for(pos = 0; true; pos = (pos + 1) % length) {
		// The 'true' means this loop doesn't end on its own.
		if (Math.floor(Math.random() * 101) < rates[pos]) {
			return syllables[pos];
		}
	}
}

function handleInlineCategoryDropoffRate(categoryName, categoryLength, baseDropoff) {
	var temp = baseDropoff,
		dropoffs = $WG.overrides.categories.get(categoryName);
	if(!dropoffs) {
		return -1;
	}
	// Validate all rates as being from 1-99%, replacing those that don't pass
	dropoffs = dropoffs.map(function(rate) {
		if(rate < 1 || rate > 99) {
			rate = temp;
		}
		temp = rate;
		return rate;
	});
	while(dropoffs.length < categoryLength) {
		dropoffs.push(temp);
	}
	if(dropoffs.length > categoryLength) {
		dropoffs = dropoffs.slice(0, categoryLength);
	}
	for(pos = 0; true; pos = (pos + 1) % categoryLength) {
		// The 'true' means this loop doesn't end on its own.
		if (Math.floor(Math.random() * 101) < dropoffs[pos]) {
			return pos;
		}
	}
}

// Output a single word
function getOneWord(capitalize) {
	var numberOfSyllables = 1,
		currentSyllable,
		syllableBoxChoice,
		monoRate = $WG.overrides.monoRate || $WG.monoRate,
		oneType = $WG.oneType,
		word = "";
	// Determine if we're making a one-syllable word.
	if (Math.floor(Math.random() * 101) > monoRate) {
		// We've got word with 2-6 syllables.
		numberOfSyllables += 1 + powerLaw(4, 50);
	}
	// Check if we're a monosyllable word.
	if (numberOfSyllables === 1) {
		word = oneSyllable("", oneType ? -1 : 2);
	} else {
		let showSyls = $WG.showSyls;
		// We're a polysyllabic word.
		for (
			currentSyllable = 1;
			currentSyllable <= numberOfSyllables;
			currentSyllable++
		) {
			if (oneType || currentSyllable === 1) {
				// Either one syllable box only, or we're in the first syllable.
				syllableBoxChoice = -1;
			} else if (currentSyllable > 1) {
				// Not the first syllable...
				if (currentSyllable < numberOfSyllables) {
					// Not final syllable.
					syllableBoxChoice = 0;
				} else {
					// Final syllable.
					syllableBoxChoice = 1;
				}
			}
			word = oneSyllable(word, syllableBoxChoice);
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
		word = word.charAt(0).toUpperCase() + word.substring(1);
	}
	return word;
}

// Output a pseudo-text.
function createText() {
	var output = "",
		numberOfSentences = getAdvancedNumber($i("sentences"), 30, 500),
		sentencesSoFar,
		wordsSoFar,
		numberOfWords;
	// Go through the info for every sentence.
	for (sentencesSoFar = 0; sentencesSoFar < numberOfSentences; sentencesSoFar++) {
		numberOfWords = peakedPowerLaw(15, 5, 50);
		// Add each word one at a time.
		for (wordsSoFar = 0; wordsSoFar <= numberOfWords; wordsSoFar++) {
			output += getOneWord(
				wordsSoFar === 0, // Capitalization flag
			);
			// If we're the last word, add punctuation.
			if (wordsSoFar === numberOfWords) {
				output += ".....?!".charAt(Math.floor(Math.random() * 7));
			}
			output += " ";
		}
	}
	return $t(output);
}

// Create a list of words
function createLex(capitalize) {
	var output = $e("div"),
		numberOfWordsInLexicon = getAdvancedNumber($i("lexiconLength"), 150, 1000),
		words = [],
		wordsSoFar;
	// Set up class.
	output.classList.add("lexicon");
	// Set up grid style.
	output.style.gridTemplateColumns =
		"repeat(auto-fit, minmax(" +
		getAdvancedNumber($i("wordLengthInEms"), 10, 1000).toString() +
		"em, 1fr) )";
	// Add words up to the limit.
	for (wordsSoFar = 0; wordsSoFar < numberOfWordsInLexicon; wordsSoFar++) {
		words.push(getOneWord(capitalize));
	}
	// Alphabetize.
	words.sort();
	// Add each word in its own deparate DIV.
	words.forEach(function(w) {
		output.appendChild($e("div", w));
	});
	return output;
}

// Create a list of many words, 5x as much as the lexicon above
function createLongLex() {
	var output = $f(),
		numberOfWordsInLexicon = getAdvancedNumber($i("largeLexiconLength"), 750, 5000),
		wordsSoFar;
	// Add words up to the limit, followed by a BR each time.
	for (wordsSoFar = 0; wordsSoFar < numberOfWordsInLexicon; wordsSoFar++) {
		output.append(getOneWord(false), $e("br"));
	}
	return output;
}

// Pull a number from the Advanced Options, making sure it's a positive number less than max.
function getAdvancedNumber(id, normal, max) {
	var testValue = Math.floor(Number(id.value));
	if (isNaN(testValue) || testValue < 1) {
		// Outside the lower bound. Return a "normal" number.
		return normal;
	}
	if (testValue > max) {
		// Over the max. Reduce to the max.
		return max;
	}
	// Passes tests.
	return testValue;
}

// Launch process to generate ALL possible syllables.
function getEverySyllable() {
	// Set up an empty Set to hold generated syllables and an empty variable to hold transformed info.
	var setUp = new Set(),
		frag = $f(),
		output;
	// Make a Set out of all syllables.
	const syllables = new Set(
		$WG.midWordSyls.concat($WG.wordInitSyls, $WG.wordFinalSyls, $WG.singleWordSyls)
	);
	// Go through each syllable one at a time.
	syllables.forEach(function(unit) {
		// Go through each category one at a time.
		recurseCategoriesForSyllables(setUp, "", unit.split(""));
	});
	// Translate the set into an array.
	output = [...setUp];
	// Sort it.
	output.sort();
	// Join into HTML string and return output.
	frag.appendChild($t(output.shift()));
	output.forEach(syll => frag.append($e("br"), syll));
	return frag;
	//return output.join("<br>");
}

// Go through categories recursively, adding finished words to the given Set.
function recurseCategoriesForSyllables(givenSet, input, toGo) {
	var next = toGo.slice(0),
		now;
	// Find new category.
	now = $WG.categories.get(next.shift());
	// Check to see if the category exists.
	if (now === undefined) {
		// It doesn't exist. Not a category. Save directly into input.
		input += now;
		if (!next.length) {
			// This is done. Run through rewrite rules and save into the Set.
			givenSet.add(applyRewriteRules(input));
		} else {
			// Continue the recursion.
			recurseCategoriesForSyllables(givenSet, input, next);
		}
	} else if (next.length > 0) {
		// Category exists. More to come.
		now.split("").forEach(function(char) {
			// Recurse deeper.
			recurseCategoriesForSyllables(givenSet, input + char, next);
		});
	} else {
		// Category exists. Final category.
		// Go through each character in the run.
		now.split("").forEach(function(char) {
			// Run this info through rewrite rules and save into the Set.
			givenSet.add(applyRewriteRules(input + char));
		});
	}
}


function validatePercentage(percentage, defaultPercentage = 0, max = 99, min = 0) {
	var test = Math.min(Math.max(Number(percentage), min), max);
	if (test !== test) {
		// (NaN !== NaN is always true)
		return defaultPercentage;
	}
	return test;
}


function checkOverrides() {
	var o = $WG.overrides,
		inline = !!$i("inlineDropoffOverride").checked;
	o.dropoff = validatePercentage($i("dropoffOverride").value);
	o.monoRate = validatePercentage($i("monoRateOverride").value);
	o.slowSylDrop = validatePercentage($i("slowSylDropOverride").value);
	o.total = inline;
	if(inline) {
		o.cue = $i("inlineDropoffOverrideCue").value || ">";
		o.sep = $i("inlineDropoffOverrideSep").value || ",";
		o.categories = o.categories || new Map();
		o.midWordSyls = o.midWordSyls || [];
		o.wordInitSyls = o.wordInitSyls || [];
		o.wordFinalSyls = o.wordFinalSyls || [];
		o.singleWordSyls = o.singleWordSyls || [];
	}
}


// User hit the action button.  Make things happen!
function generate() {
	var errorMessages = [],
		catt = $WG.categories,
		overrides = $WG.overrides,
		previous = $WG.previous,
		overridden,
		overrideChanged,
		whichWay,
		input,
		splitter,
		frag,
		output,
		oneType,
		monoRate,
		dropoff;
	// Read parameters.
	whichWay = $q("input[type=radio][name=outType]:checked").value; // What output are we aiming for?
	$WG.showSyls = $i("showSyls").checked; // Do we show syllable breaks?
	$WG.slowSylDrop = $i("slowSylDrop").checked; // Do we (somewhat) flatten out the syllable dropoff?
	oneType = $i("oneType").checked; // Are we only using one syllable box?
	$WG.oneType = oneType;
	monoRate = $q("input[type=radio][name=monoRate]:checked").value; // The rate of monosyllable words.
	dropoff = $q("input[type=radio][name=dropoff]:checked").value; // How fast do the category runs flatten out?

	// Validate monosyllable selector.
	// If monoRate isn't set or is bigger than 100 (neither should be possible), change it to 100.
	// If monoRate is less than 0 (shouldn't be possible), change it to 0.
	// Save to global
	$WG.monoRate = validatePercentage(monoRate, 100, 100);

	// Validate dropoff selector.
	// If dropoff isn't set or is bigger than 45 (neither should be possible), change it to 45.
	// If dropoff is less than 0 (shouldn't be possible), change it to 0.
	$WG.dropoff = validatePercentage(dropoff, 45, 45);

	// Check for overrides
	checkOverrides();
	overridden = overrides.total;
	overrideChanged = (overridden !== previous.overrides);
	previous.overrides = overridden;

	// Parse all those boxes for validness.

	// Grab the category list.
	input = $i("categories").value;
	// If the categories have changed, parse them.
	if (overrideChanged || input !== previous.categories) {
		let testing = parseCategories(input);
		// If we found no errors, save the categories.
		if (testing.flag && testing.cats.size > 0) {
			previous.categories = input;
			$WG.categories = testing.cats;
			catt = testing.cats;
			overrides.categories = testing.rates;
		} else {
			errorMessages.push(...testing.msgs);
			catt = false;
		}
	}

	// Parse the syllable lists.
	// Check each one to see if it's changed, first.
	input = $i("midWord").value;
	if (overrideChanged || input !== previous.midWordSyls) {
		let output;
		overrides.flags.midWordSyls = false;
		output = parseSyllables(input);
		$WG.midWordSyls = output.syllables;
		previous.midWordSyls = input;
		overridden && (overrides.midWordSyls = output.ratesFound);
	}

	input = $i("wordInitial").value;
	if (overrideChanged || input !== previous.wordInitSyls) {
		let output;
		overrides.flags.wordInitSyls = false;
		output = parseSyllables(input);
		$WG.wordInitSyls = output.syllables;
		previous.wordInitSyls = input;
		overridden && (overrides.wordInitSyls = output.ratesFound);
	}

	input = $i("wordFinal").value;
	if (overrideChanged || input !== previous.wordFinalSyls) {
		let output;
		overrides.flags.wordFinalSyls = false;
		output = parseSyllables(input);
		$WG.wordFinalSyls = output.syllables;
		previous.wordFinalSyls = input;
		overridden && (overrides.wordFinalSyls = output.ratesFound);
	}

	input = $i("singleWord").value;
	if (overrideChanged || input !== previous.singleWordSyls) {
		let output;
		overrides.flags.singleWordSyls = false;
		output = parseSyllables(input);
		$WG.singleWordSyls = output.syllables;
		previous.singleWordSyls = input;
		overridden && (overrides.singleWordSyls = output.ratesFound);
	}

	// Check that categories exist.
	if (!catt || catt.size <= 0) {
		frag = $f();
		frag.append(
			$e("strong", "Missing:"),
			$WG.SPACE + "You must have categories to generate text."
		);
		errorMessages.push(frag);
	} else if (catt) {
		// Don't bother with rewrite rules if we don't have categories. Errors can result.
		// Grab the rewrite rules.
		input = $i("rewrite").value;
		// Find the splitter. (|| by default)
		splitter = $i("rewSep").value;
		// If the rules have changed, parse them.
		if (previous.rew !== input || splitter !== $WG.rewSep) {
			let testing;
			// Save the separator
			$WG.rewSep = splitter;
			// Run through the rules.
			testing = parseRewriteRules(input);
			// If we found no errors, save the rules.
			if (testing.flag) {
				previous.rew = input;
				//// nrew === 0 is ok: sometimes you don't need to rewrite anything.
				//nrew = testing.len;
				$WG.rew = testing.rules;
			} else {
				errorMessages.push(...testing.msgs);
			}
		}
	}

	// Check that syllables exist.
	if (oneType && $WG.wordInitSyls.length <= 0) {
		frag = $f();
		frag.append(
			$e("strong", "Missing:"),
			$WG.SPACE + "You must have syllable types to generate text."
		);
		errorMessages.push(frag);
	} else if (
		!oneType &&
		($WG.midWordSyls.length <= 0 ||
			$WG.wordInitSyls.length <= 0 ||
			$WG.wordFinalSyls.length <= 0 ||
			$WG.singleWordSyls.length <= 0)
	) {
		frag = $f();
		frag.append(
			$e("strong", "Missing:"),
			$WG.SPACE + "You must have" + $WG.SPACE,
			$e("em", "all"),
			$WG.SPACE + "syllable types to generate text."
		);
		errorMessages.push(frag);
	}

	// Print error message or requested data.
	if (errorMessages.length > 0) {
		output = $f();
		// Print first message.
		output.appendChild(errorMessages.shift());
		// Separate subsequent messages with two linebreaks.
		errorMessages.forEach(function(f) {
			output.append($e("br"), $e("br"), f);
		});
	} else {
		// Actually generate text.
		switch (whichWay) {
			case "text": // pseudo-text
				output = createText();
				break;
			case "dict": // lexicon
				output = createLex(false);
				break;
			case "dictC": // capitalized lexicon
				output = createLex(true);
				break;
			case "longdict": // large lexicon
				output = createLongLex();
				break;
			case "genall": // all possible syllables
				output = getEverySyllable();
		}
	}

	// Set the output field.
	eraseOutputFromScreen();
	$i("outputText").appendChild(output);
}

// Test potential catgories to make sure they're formatted correctly.
function parseCategories(testCategories) {
	var potentials = testCategories.split(/\r?\n/),
		// Set up an object for all categories.
		// Hold on to the number of categories.
		// Set up an index for the categories.
		newCategories = new Map(),
		// Hold error messages.
		errorMessages = [],
		// Hold category dropoff rates, if needed,
		rates = new Map(),
		// Go through each category one at a time
		// Make sure categories have structure like V=aeiou
		tester = potentials.every(function(element) {
				// Remove whitespace from element.
			var thisCategoryString = element.trim(),
				// Lock up the length of this category.
				len = thisCategoryString.length,
				overrideObject = $WG.overrides;
			if (len === 0) {
				// Blank category. Ignore this and continue the loop.
				return true;
			} else if (overrideObject.total) {
				// Check for inline rates
				var [text, rateString] = thisCategoryString.split(overrideObject.cue);
				thisCategoryString = text.trim();
				if(rateString) {
					// Assign to the Map using the category string as key and an Array of Numbers as value
					rates.set("temp", rateString.trim().split(overrideObject.sep).map(p => validatePercentage(p)));
				}
			}
			if (
				// If the category doesn't have at least three characters...
				len < 3 ||
				//  OR the category doesn't have = as its second character...
				thisCategoryString.indexOf("=") !== 1 ||
				//  OR the category has = somewhere else other than the second character...
				thisCategoryString.indexOf("=", 2) !== -1 // (is this necessary?)****************************
			) {
				// THEN this is a bad category.
				let frag = $f();
				frag.append(
					$e("strong", "Error:"),
					$WG.SPACE + thisCategoryString,
					$e("br"),
					"Categories must be of the form V=aeiou",
					$e("br"),
					"That is, a single letter, an equal sign, then a list of possible expansions."
				);
				errorMessages.push(frag);
				// clear from rates if needed
				overrideObject.total && rates.delete("temp");
				// End the looping.
				return false;
			} else {
				// Isolate the category name.
				let categoryName = thisCategoryString.charAt(0);
				if (newCategories.get(categoryName) !== undefined) {
					// If we have defined this category before, throw an error.
					let frag = $f();
					frag.append(
						$e("strong", "Error:"),
						$WG.SPACE + "You have defined category " + thisCategoryString + " more than once."
					);
					errorMessages.push(frag);
					return false;
				} else {
					//// Add this category to the category index.
					//newcats.index += categoryName;
					// Save this category info.
					//newcats[categoryName] = thisCategoryString.substring(2);
					newCategories.set(categoryName, thisCategoryString.substring(2));
				}
				// Solidify the override rates, if needed
				if(overrideObject.total) {
					rates.set(categoryName, rates.get("temp"));
					rates.delete("temp");
				}
			}
			// Continue the loop.
			return true;
		});
	// Return an object where FLAG indicates if the input was formatted correctly,
	//   CATS is the formatted categories, MSGS are any error messages, and RATES
	//   is an optional set of dropoff rates for the categories
	return {
		flag: tester,
		cats: newCategories,
		errorMessages: errorMessages,
		rates: rates.size > 0 ? rates : null
	};
}

// Test potential rewrite rules to make sure they're formatted correctly.
function parseRewriteRules(rules) {
	var potentials = rules.split(/\r?\n/),
		//// Save the length of the rules.
		//plen = potentials.length,
		//// Set up a counter to give each rule a unique ID.
		//counter = 0,
		// Set up newrules as a blank map.
		newrules = new Map(),
		// Set up an array for error messages.
		msgs = [],
		// Separator for rewrite rules
		rewSep = $WG.rewSep,
		// Go through each rule one at a time.
		tester = potentials.every(function(rule) {
			// Make sure each rule has two parts.
			var separatorPosition = rule.indexOf(rewSep);
			if (rule.trim() === "") {
				// Ignore blank lines.
			} else if (
				separatorPosition < 1 ||
				separatorPosition !== rule.lastIndexOf(rewSep)
			) {
				// If || is -1 (not found) or 0 (at beginning of rule) OR if there are more than once instance of || in the string, ignore this rule.
				let frag = $f();
				frag.append(
					$e("strong", "Error:"),
					$WG.SPACE + rule,
					$e("br"),
					"Rewrite rules must be in the form x" + rewSep + "y",
					$e("br"),
					"That is, a rule (x), followed by " +
						(rewSep === "||"
							? "two vertical bars"
							: 'the exact text "' + rewSep + '"') +
						", followed by a replacement expression (y, which may be blank)."
				);
				msgs.push(frag);
				// End the looping.
				return false;
			} else {
				// Isolate the replacement.
				let replacement = rule.substring(separatorPosition + 2),
					// Isolate the rule, convert %Category expressions, and turn it into a regex pattern.
					newrule = new RegExp(
						handleCategoriesInRewriteRule(rule.substring(0, separatorPosition)),
						"g" // for case insensitivity change "g" to "gi"
					);
				// Save this rule.
				//newrules[(newrules.size + 1).toString()] = [newrule, replacement];
				newrules.set(newrule, replacement);
				// Increment the counter.
				//counter++;
			}
			// Continue the loop.
			return true;
		});
	// Return an object where FLAG indicates if the input was formatted correctly,
	//   RULES is the formatted rules, LEN is the number of rules, and MSGS are any error messages.
	return {
		flag: tester,
		rules: newrules,
		//len: plen,
		msgs: msgs
	};
}

// Calculate syllable dropoff percentage rate, based on the maximum number of candidates.
function calcDropoff(lengthOfCandidates) {
	if (lengthOfCandidates === 1) {
		// Only one candidate? It's auto-chosen.
		return 101;
	}
	// If we're slowing down the rate (making it less likely an earlier candidate is chosen), return a smaller value.
	if ($WG.slowSylDrop) {
		switch (lengthOfCandidates) {
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

// Simple function erases all output from the screen.
function eraseOutputFromScreen() {
	var out = $i("outputText");
	while (out.firstChild) {
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
}

// Simple function sets up the import/export screen.
function prepImport(msg) {
	// Check if we were called by an event listener.
	if (typeof msg !== "string") {
		// Hide all messaging.
		$a("#importBoxArea .msg").forEach(m => m.classList.add("hidden"));
	} else {
		// Change any <br>s provided into HTML elements, insert in appropriate place.
		$a("#importBoxArea .msg").forEach(function(m) {
			var output = msg.split("<br>");
			m.textContent = output.shift();
			output.forEach(function(bit) {
				m.append($e("br"), bit);
			});
			// Show this message.
			m.classList.remove("hidden");
		});
	}
	// Mark area as "open".
	$i("importBoxArea").classList.remove("closed");
	// Freeze the main display.
	document.body.classList.add("noOverflow");
}

// Simple function clears input/export box and removes that screen.
function removeImportBox() {
	var box = $i("importTextBox");
	// Clear box.
	box.value = "";
	// Make it writable if needed
	box.disabled = false;
	// "Close" box.
	$i("importBoxArea").classList.add("closed");
	// Show the Import button if needed
	$i("doImportButton").classList.remove("hidden");
	// Unfreeze main display.
	document.body.classList.remove("noOverflow");
}

// Parse input to import.
// Also used to load and verify predefs.
function doImport(toImport, calledInternally = false) {
	var parsed = toImport;
	// If this is called by an event, then toImport needs to be set to the import box's information.
	if (!calledInternally) {
		toImport = $i("importTextBox").value.trim();
		try {
			parsed = JSON.parse(toImport);
		} catch(error) {
			console.log(error);
			return calledInternally ? false : doAlert("Bad Format","The information provided was malformed and could not be read.","error");
		}
	}
// Apply imported info to the boxes and checkboxes.
	try {
		$i("categories").value = parsed.categories || $i("categories").value;
		$i("rewrite").value = parsed.rewrite || $i("rewrite").value;
		$i("singleWord").value = parsed.singleWord || $i("singleWord").value;
		$i("midWord").value = parsed.midWord || $i("midWord").value;
		$i("wordInitial").value = parsed.wordInitial || $i("wordInitial").value;
		$i("wordFinal").value = parsed.wordFinal || $i("wordFinal").value;
		$i(parsed.monoRate).checked = true;
		$i(parsed.dropoff).checked = true;
		$i("oneType").checked = !!parsed.oneType;
		$i("slowSylDrop").checked = !!parsed.slowSylDrop;
		$i("wordLengthInEms").value = parsed.wordLengthInEms || $i("wordLengthInEms").value;
		$i("lexiconLength").value = parsed.lexiconLength || $i("lexiconLength").value;
		$i("largeLexiconLength").value = parsed.largeLexiconLength || $i("largeLexiconLength").value;
		$i("sentences").value = parsed.sentences || $i("sentences").value;
		$i("rewSep").value = parsed.rewSep || $i("rewSep").value;
		$i("dropoffOverride").value = parsed.dropoffOverride || $i("dropoffOverride").value;
		$i("monoRateOverride").value = parsed.monoRateOverride || $i("monoRateOverride").value;
		$i("slowSylDropOverride").value = parsed.slowSylDropOverride || $i("slowSylDropOverride").value;
		$i("inlineDropoffOverride").checked = !!parsed.inlineDropoffOverride;
		$i("inlineDropoffOverrideCue").value = parsed.inlineDropoffOverrideCue || $i("inlineDropoffOverrideCue").value;
		$i("inlineDropoffOverrideSep").value = parsed.inlineDropoffOverrideSep || $i("inlineDropoffOverrideSep").value;
	} catch(error) {
		console.log(error);
		return calledInternally ? false : doAlert("Bad Format","The information provided was malformed and could not be completely loaded.","error");
	}
	// Hide/show boxes if needed.
	syllabicChangeDetection();
	// Return true if predef loaded correctly.
	if (calledInternally) {
		return true;
	}
	doAlert("Import Successful!", "", "success");
	// Announce success.
	// Clear the import stuff.
	removeImportBox();
}

// Create an importable text file continaing all current info.
function doExport(fromButton) {
	var box, toExport;
	// Check if we're checking for the default values.
	if (!fromButton) {
		let mono, drop;
		Array.from($a("input[name=\"monoRate\"]")).every(function(input) {
			if(input.defaultChecked) {
				mono = input.id;
				return false;
			}
			return true;
		});
		Array.from($a("input[name=\"dropoff\"]")).every(function(input) {
			if(input.defaultChecked) {
				drop = input.id;
				return false;
			}
			return true;
		});
		return {
			categories: $i("categories").defaultValue,
			rewrite: $i("rewrite").defaultValue,
			singleWord: $i("singleWord").defaultValue,
			midWord: $i("midWord").defaultValue,
			wordInitial: $i("wordInitial").defaultValue,
			wordFinal: $i("wordFinal").defaultValue,
			oneType: $i("oneType").defaultChecked,
			slowSylDrop: $i("slowSylDrop").defaultChecked,
			monoRate: mono,
			dropoff: drop,
			wordLengthInEms: $i("wordLengthInEms").defaultValue,
			lexiconLength: $i("lexiconLength").defaultValue,
			largeLexiconLength: $i("largeLexiconLength").defaultValue,
			sentences: $i("sentences").defaultValue,
			rewSep: $i("rewSep").defaultValue,
			dropoffOverride: $i("dropoffOverride").defaultValue,
			monoRateOverride: $i("monoRateOverride").defaultValue,
			slowSylDropOverride: $i("slowSylDropOverride").defaultValue,
			inlineDropoffOverride: $i("inlineDropoffOverride").defaultChecked,
			inlineDropoffOverrideCue: $i("inlineDropoffOverrideCue").defaultValue,
			inlineDropoffOverrideSep: $i("inlineDropoffOverrideSep").defaultValue,
		};
	}
	toExport = {
		categories: $i("categories").value,
		rewrite: $i("rewrite").value,
		singleWord: $i("singleWord").value,
		midWord: $i("midWord").value,
		wordInitial: $i("wordInitial").value,
		wordFinal: $i("wordFinal").value,
		oneType: $i("oneType").checked,
		slowSylDrop: $i("slowSylDrop").checked,
		monoRate: $q("input[name=monoRate]:checked").getAttribute("id"),
		dropoff: $q("input[name=dropoff]:checked").getAttribute("id"),
		wordLengthInEms: $i("wordLengthInEms").value,
		lexiconLength: $i("lexiconLength").value,
		largeLexiconLength: $i("largeLexiconLength").value,
		sentences: $i("sentences").value,
		rewSep: $i("rewSep").value,
		dropoffOverride: $i("dropoffOverride").value,
		monoRateOverride: $i("monoRateOverride").value,
		slowSylDropOverride: $i("slowSylDropOverride").value,
		inlineDropoffOverride: $i("inlineDropoffOverride").checked,
		inlineDropoffOverrideCue: $i("inlineDropoffOverrideCue").value,
		inlineDropoffOverrideSep: $i("inlineDropoffOverrideSep").value,
	};
	box = $i("importTextBox");
	// Put the info in the box.
	box.value = JSON.stringify(toExport);
	// Mark as unwritable
	box.disabled = true;
	// Hide the Import button
	$i("doImportButton").classList.add("hidden");
	// Show the box (and everything else) with instructions.
	prepImport("Copy this for your own records.<br><br>Hit 'Cancel' when you're done.");
}

// Save current info to the browser, if possible.
function saveCustom(test) {
	var predef = $i("predef"),
		info = {};
	if (!$WG.customizable) {
		doAlert(
			"",
			"Your browser does not support Local Storage and cannot save your information.",
			"error"
		);
		return;
	} else if ($WG.customInfo && test !== true) {
		return doConfirm(
			"Warning!",
			"You already have information saved. Do you want to overwrite it?",
			function() {
				saveCustom(true);
			},
			function() {
				doAlert(
					"Previous information saved.",
					"Nothing overwritten.",
					"success"
				);
			},
			"warning",
			"Yes",
			"No"
		);
	}
	info = {
		categories: $i("categories").value,
		rewrite: $i("rewrite").value,
		singleWord: $i("singleWord").value,
		midWord: $i("midWord").value,
		wordInitial: $i("wordInitial").value,
		wordFinal: $i("wordFinal").value,
		oneType: $i("oneType").checked,
		slowSylDrop: $i("slowSylDrop").checked,
		monoRate: $q("input[name=monoRate]:checked").getAttribute("id"),
		dropoff: $q("input[name=dropoff]:checked").getAttribute("id"),
		wordLengthInEms: $i("wordLengthInEms").value,
		lexiconLength: $i("lexiconLength").value,
		largeLexiconLength: $i("largeLexiconLength").value,
		sentences: $i("sentences").value,
		rewSep: $i("rewSep").value,
		dropoffOverride: $i("dropoffOverride").value,
		monoRateOverride: $i("monoRateOverride").value,
		slowSylDropOverride: $i("slowSylDropOverride").value,
		inlineDropoffOverride: $i("inlineDropoffOverride").checked,
		inlineDropoffOverrideCue: $i("inlineDropoffOverrideCue").value,
		inlineDropoffOverrideSep: $i("inlineDropoffOverrideSep").value,
	};
	localStorage.setItem("WordGenCustomOption", JSON.stringify(info));
	$WG.customInfo = true;

	// Check for the "Custom" predef option and add it if needed.
	if ($q('option[value="pd-1"]', predef) === null) {
		let option = document.createElement("option");
		option.value = "pd-1";
		option.textContent = "Custom";
		predef.prepend(option);
	}
	// Set predef drop-down to Custom.
	predef.value = "pd-1";
	// Save predef info.
	$WG.predefs.set("pd-1", info);
	// Alert success.
	doAlert("Saved to browser.", "", "success");
}

// Remove stored information from the browser.
function clearCustom(test) {
	if (!$WG.customizable) {
		doAlert(
			"Sorry!",
			"Your browser does not support Local Storage and cannot save your information.",
			"error"
		);
		return;
	} else if (!$WG.customInfo) {
		doAlert("", "You don't have anything saved.", "error");
		return;
	} else if ($WG.customInfo && test !== true) {
		return doConfirm(
			"Warning!",
			"Are you sure you want to delete your saved settings?",
			function() {
				clearCustom(true);
			},
			function() {
				doAlert("Settings kept.", "", "success");
			},
			"warning",
			"Yes",
			"No"
		);
	}
	window.localStorage.removeItem("WordGenCustomOption");
	$WG.customInfo = false;
	// Remove "Custom" from drop-down menu.
	$q('#predef option[value="pd-1"]').remove();
	// Remove info.
	$WG.predefs.delete("pd-1");
	// Alert success.
	doAlert("Cleared from browser.", "", "success");
}

// Display the IPA and other stuff.
function showIPA() {
	// Relevant code moved to unicode.js
	eraseOutputFromScreen();
	$i("outputText").appendChild(createIPASymbolsFragment([$e("br"), $e("br")]));
}

// Open/close the Advanced Options block.
function advancedOptions() {
	$i("advancedOpen").classList.toggle("closed");
}

// Check the current value of the drop-down menu and send it along to loadThisPredef.
function loadPredef() {
	var pd = $i("predef").value;
	console.log("Opening predef [" + pd + "]");
	doImport($WG.predefs.get(pd), true);
	syllabicChangeDetection();
}

// Load predefs from file.
$WG.getter.addEventListener("load", parsePredefsFromFile);
$WG.getter.open("GET", $WG.predefFilename);
$WG.getter.send();
$i("loadPredefButton").disabled = true;
$i("predef").disabled = true;
// Save default info as "Starter"
$WG.predefs.set("pd1", doExport(false));

// Called async when predefs are being loaded
function parsePredefsFromFile() {
	//console.log($WG.getter);
	// Grab info.
	var response = $WG.getter.responseText.trim().split(/\r?\n/).join(""),
		predefs = $WG.predefs,
		counter = predefs.size + (predefs.get("pd-1") === undefined ? 0 : -1),
		loaded;
	try {
		loaded = JSON.parse(response);
		if(loaded.constructor !== Array) {
			console.log("Predefs file was not in Array format.");
			return false;
		}
	} catch (error) {
		console.log(error);
		console.log("Unable to parse predefs from file.");
		return false;
	}
	// Store info.
	loaded.forEach(function(p) {
		// Info should have a name property.
		var nombre, target, opt, val;
		if(typeof p !== "object" || (nombre = p.name) === undefined || typeof nombre !== "string") {
			console.log("Bad predef encountered - malformed object, or missing or malformed name property");
			console.log(p);
			return false;
		}
		// target is the <select> containing predefs.
		target = $i("predef"),
		// opt is a new <option> we're adding to it
		opt = document.createElement("option"),
		// Increase counter, generate a unique name.
		counter++;
		val = "pd" + counter.toString();
		console.log("Saving predef: " + nombre + " as [" + val + "]");
		// Save info internally.
		predefs.set(val, p);
		// Set properties of <option>
		opt.textContent = nombre;
		opt.value = val;
		// Add <option> to <select>
		target.appendChild(opt);
	});
	// Mark that we're no longer waiting.
	$i("loadPredefButton").disabled = false;
	$i("predef").disabled = false;
}

// If the "one type of syllables" box is [un]checked, change which boxes are visible.
function syllabicChangeDetection() {
	//console.log("fired");
	if ($i("oneType").checked) {
		$a("#p_multi,.multiswap").forEach(w => w.classList.add("hidden"));
		$a(".singleswap").forEach(w => w.classList.remove("hidden"));
		//console.log("checked");
	} else {
		$a("#p_multi,.multiswap").forEach(w => w.classList.remove("hidden"));
		$a(".singleswap").forEach(w => w.classList.add("hidden"));
		//console.log("unchecked");
	}
}

// Check for localStorage.
if (typeof Storage !== "undefined") {
	let info = localStorage.getItem("WordGenCustomOption");
	// Make this known to other functions.
	$WG.customizable = true;
	// Check if we have info stored. If so, load it up.
	if (info !== null) {
		$WG.customInfo = true;
		// Set drop-down menu to the custom info.
		let option = document.createElement("option"),
			parsed = JSON.parse(info);
		$i("categories").value = parsed.categories;
		$i("rewrite").value = parsed.rewrite;
		$i("singleWord").value = parsed.singleWord;
		$i("midWord").value = parsed.midWord;
		$i("wordInitial").value = parsed.wordInitial;
		$i("wordFinal").value = parsed.wordFinal;
		$i(parsed.monoRate).checked = true;
		$i(parsed.dropoff).checked = true;
		$i("oneType").checked = parsed.oneType;
		$i("slowSylDrop").checked = parsed.slowSylDrop;
		$i("wordLengthInEms").value = parsed.wordLengthInEms;
		$i("lexiconLength").value = parsed.lexiconLength;
		$i("largeLexiconLength").value = parsed.largeLexiconLength;
		$i("sentences").value = parsed.sentences;
		$i("rewSep").value = parsed.rewSep;
		$i("dropoffOverride").value = parsed.dropoffOverride;
		$i("monoRateOverride").value = parsed.monoRateOverride;
		$i("slowSylDropOverride").value = parsed.slowSylDropOverride;
		$i("inlineDropoffOverride").checked = parsed.inlineDropoffOverride;
		$i("inlineDropoffOverrideCue").value = parsed.inlineDropoffOverrideCue;
		$i("inlineDropoffOverrideSep").value = parsed.inlineDropoffOverrideSep;
		$WG.predefs.set("pd-1", parsed);
		option.value = "pd-1";
		option.textContent = "Custom";
		$i("predef").prepend(option);
		$i("predef").value = "pd-1";
	}
	//console.log(propTrue);
	//console.log(propFalse);
	syllabicChangeDetection();
}

// Toggle boxes when "one type of syllable" box is [un]checked.
$i("oneType").addEventListener("change", syllabicChangeDetection);
// Fire it right now.
syllabicChangeDetection();

// Set up the buttons.
$i("advancedOpenButton").addEventListener("click", advancedOptions);
$i("saveCustomButton").addEventListener("click", saveCustom);
$i("clearCustomButton").addEventListener("click", clearCustom);
$i("prepImportButton").addEventListener("click", prepImport);
$i("generateButton").addEventListener("click", generate);
$i("eraseButton").addEventListener("click", eraseOutputFromScreen);
$i("clearBoxesButton").addEventListener("click", clearBoxes);
$i("showIPAButton").addEventListener("click", showIPA);
$i("loadPredefButton").addEventListener("click", loadPredef);
$i("doImportButton").addEventListener("click", doImport);
$i("removeImportBoxButton").addEventListener("click", removeImportBox);
$i("doExportButton").addEventListener("click", doExport.bind(null, true));

// Use SweetAlert2 if available!
function doAlert(title, text, type) {
	if (typeof Swal !== "undefined") {
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
		alert(
			(title + " " + text.replace(/<br>/g, "\n").replace(/<[^>]*>/g, "")).trim()
		);
	}
}
function doConfirm(title, text, yesFunc, noFunc, type = "question", yes = "Ok", no = "Cancel") {
	if (typeof Swal !== "undefined") {
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
		}).then(result => (result.value ? yesFunc.call() : noFunc.call()));
	} else {
		// We don't has it.
		if (confirm((title + " " + text.replace(/<br>/g, "\n").replace(/<[^>]*>/g, "")).trim())) {
			yesFunc.call();
		} else {
			noFunc.call();
		}
	}
}
