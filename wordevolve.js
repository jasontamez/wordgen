// Script (C) 2012 by Mark Rosenfelder.
// You can modify the code for non-commercial use;
// attribution would be nice.
// If you want to make money off it, please contact me.

// Fixes since SCA1:
//	Degemination			M//_2       (subscript 2)	** shortening a consonant
//	Gemination				M/M2/_				** lengthening one

// Modified by Jason Tamez 2017-2019.
// Code available here: https://github.com/jasontamez/wordgen

var Customizable = false,  // Can we use LocalStorage?
	CustomInfo = false,  // Do we have anything in storage?
	previousRun = false, // Stores previously generated info
	cat,                 // Categories
	ncat,
	previousCat,         // Stores previously-parsed categories
	change,              // Sound-change rules
	nchange,
	previousChange,      // Stores previously-parsed sound-change rules
	rew,                 // Rewrite rules
	rewTotal,
	previousRew,         // Stores previously-parsed rewrite rules
	SPACE = String.fromCharCode(0x00a0); // Non-breaking space for text formatting.

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
function $e(tag, text = false) {
	var e = document.createElement(tag);
	if (text !== false) {
		e.textContent = text;
	}
	return e;
}

// Reverse a string
function isCombiningDiacritic(code) {
	// Helper function identifies combining characters.
	return (
		(0x0300 <= code && code <= 0x036f) || // Comb. Diacritical Marks
		(0x1ab0 <= code && code <= 0x1aff) || // Comb. Diacritical Marks Extended
		(0x1dc0 <= code && code <= 0x1dff) || // Comb. Diacritical Marks Supplement
		(0x20d0 <= code && code <= 0x20ff) || // Comb. Diacritical Marks for Symbols
		(0xfe20 <= code && code <= 0xfe2f)
	); // Comb. Half Marks
}
// Make function on the prototype, available to all Strings.
String.prototype.reverse = function() {
	var output = "",
		i;
	// Loop through string from back to front.
	for (i = this.length - 1; i >= 0; --i) {
		let width = 1,
			modI = i,
			thisI,
			thisIMinusOne;
		// If character is a combiner, move pointer (modI) one space to the left and increase the width.
		while (modI > 0 && isCombiningDiacritic(this.charCodeAt(modI))) {
			--modI;
			width++;
		}
		// Save current base character.
		thisI = this[modI];
		// Save possible emoji character.
		thisIMinusOne = this[modI - 1];
		// Check to see if we're a two-char emoji, and modify pointer and width if so.
		if (
			modI > 0 &&
			"\uDC00" <= thisI &&
			thisI <= "\uDFFF" &&
			"\uD800" <= thisIMinusOne &&
			thisIMinusOne <= "\uDBFF"
		) {
			--modI;
			width++;
		}
		// Add the character at the pointer, plus any additional characters we picked up.
		output += this.substr(modI, width);
	}
	return output;
};
// Older, simpler code.
//function reverse(x) {
//	return x.split("").reverse().join();
//}

function standardizePhonoRules(searchString, separator) {
	var arrowCodes, arrows, emptySet, sepEsc;
	// Escape the separator for use in regexp objects.
	sepEsc = separator.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
	try {
		//
		// Arrows and greater-than signs can be used in place of the first slash (sep).
		//
		// Make an array of arrow characters (by character code number). Do this first because it shouldn't raise an error.
		arrowCodes = [
			0x2192, // Right arrow →
			0x21c9, // Paired right arrow ⇉
			0x21e5, // Right arrow to bar ⇥
			0x21e8, // Rightward thick arrow ⇨
			0x21d2, // Rightward double arrow ⇒
			0x21f0, // Rightward thick arrow from wall ⇰
			0x21f6, // Three right arrows ⇶
			0x21a3, // Rightward arrow with tail ↣
			0x21a6, // Right arrow from bar ↦
			0x21aa, // Right arrow with hook ↪
			0x21e2, // Right dashed arrow ⇢
			0x21fe, // Right open-headed arrow ⇾
			0x21ac, // Right arrow with loop ↬
			0x219d, // Right wave arrow ↝
			0x21a0, // Right two-headed arrow ↠
			0x21f4, // Right arrow w/small circle ⇴
			0x21db, // Right triple arrow ⇛
			0x21c0, // Right harpoons ⇀
			0x21c1, //                ⇁
			0x21dd, // Right squiggle arrow ⇝
			0x21fb // Right arrow w/double vertical stroke ⇻
		];
		// Make a regexp looking for empty-set (slashed zero) characters.
		// Scandinavian letter Øø :: 00D8,00F8 :: not used, since these could easily be in conlangs
		emptySet = new RegExp(
			"(?<=^)(?<=" +
			sepEsc +
			")s*[" +
			String.fromCharCode(0x2300) + // Diameter ⌀
			String.fromCharCode(0x2205) + // Empty set ∅
				"]s*(?=" +
				sepEsc +
				"|$)",
			"g"
		);
		// Make a regexp looking for arrow characters.
		arrows = new RegExp(
			"(?<!" +
				sepEsc +
				".*)[>" +
				arrowCodes.map(x => String.fromCharCode(x)).join("") +
				"]",
			"g"
		);
		// Return the search string with empty sets and arrows replaced respectively with the empty string
		//  and the symbol (separator) used by this script.
		return searchString.replace(emptySet, "").replace(arrows, separator);
	} catch (error) {
		if (error.name === "SyntaxError") {
			// Most likely, this error will happen because the browser doesn't support lookbehinds.
			let regexpResult;
			// Make a regexp looking for empty-set characters.
			emptySet = new RegExp(
				"(^|" +
				sepEsc +
				")(s*[" +
				String.fromCharCode(0x2300) + // Diameter ⌀
				String.fromCharCode(0x2205) + // Empty set ∅
					"]s*)(" +
					sepEsc +
					"|$)",
				"g"
			);
			// Make a regexp looking for arrow characters.
			arrows = new RegExp(
				"(" +
					sepEsc +
					".*)([>" +
					arrowCodes.map(x => String.fromCharCode(x)).join("") +
					"])",
				"g"
			);
			// Repace instances of the empty set with an empty string by looping through it with exec().
			// exec(), when used multiple times, will start from the end of the last match.
			while ((regexpResult = emptySet.exec(searchString)) !== null) {
				// regexpResult = [full match, start of definition, matched empty-set character, end of definition]
				let l = regexpResult[0].length, // Length of the full match.
					li = emptySet.lastIndex, // Where we ended searching.
					start = searchString.slice(0, li - l), // Everything before the match.
					end = searchString.slice(li); // Everything after the match.
				// Replace the searchString with only the empty-set removed.
				searchString = start + regexpResult[1] + regexpResult[3] + end;
			}
			while ((regexpResult = arrows.exec(searchString)) !== null) {
				// regexpResult = [full match, start of definition, matched arrow]
				let l = regexpResult[0].length, // Length of the full match
					li = arrows.lastIndex,
					start = searchString.slice(0, li - l),
					end = searchString.slice(li);
				searchString = start + regexpResult[1] + separator + end;
			}
		}
		return searchString;
	}
}

// Take an array of strings and apply each sound change rule to each string one at a time,
//  then return an object where obj.words is an array of strings, and obj.info is an array
//  of HTML elements containing information about the process.
function changeTheWords(input, outtype, printrules) {
	var output = new Object(),
		wordsChanged = 0,
		div,
		span;
	output.words = [];
	output.info = [];
	// Loop over every inputted word in order.
	input.forEach(function(original) {
		var w = original.trim(),
			previous,
			counter = 0,
			replacements;
		// Is this even a word?
		// Check to see if anything's left after we trim whitspace.
		if (w === "") {
			// Nothing there. Skip!
			return;
		}
		// Make sure we're in the correct format.
		// Loop over the rewrite rules.
		while (counter < rewTotal) {
			// Check to see if we apply this rule.
			//   0 = applies to input and output
			//   1 = applies to input only
			//  -1 = applies to output only
			if (rew.index[counter] >= 0) {
				w = w.replace(
					rew["inToOut" + counter.toString()],
					rew["inToOutString" + counter.toString()]
				);
			}
			counter++;
		}
		// Loop over every word-change ruleset in order.
		counter = 0;
		while (counter < nchange) {
			// Make a variable (loop-specific) so we don't need to call the function over and over.
			let counterString = counter.toString();
			// Hold on to (a copy of) the replacements.
			replacements = change["to" + counterString].slice();
			// Store what we started with here.
			previous = w;
			// Attempt to apply the rules.
			change["from" + counterString].forEach(function(rule) {
				var m, li, rep, allPrevious, allAfter, prevLength, temp, etc;
				// Reset lastIndex to prevent certain errors.
				rule.lastIndex = 0;
				// Get the matches, the new lastIndex, and the replacement expression(s).
				m = rule.exec(w);
				li = rule.lastIndex;
				rep = replacements.shift();
				// Look for matches. There may be multiple in a string.
				while (m !== null) {
					// Hold on to the pre-match length of w
					prevLength = w.length;
					// m is an array: [full match, pre match, (other matches,) post match]
					// rule.lastIndex is the point right after the match
					// Therefore: w.slice(0, lastIndex) will be everything up to and including the match
					if (change.exceptionIndex[counter]) {
						// Make sure our match doesn't match the exception.
						temp = change["exceptionPre" + counterString];
						// Change into regexes, then change into the result of the search.
						if (temp === "") {
							// Auto success.
							temp = 0;
						} else {
							// PLI = previous value of 'li' (or 0)
							// (a) = pre match
							// (b) = post match
							// m = entire match (a)x(b)
							// LI = current value of rule.lastIndex
							// . = other character(s) that may or may not exist
							// String is this: ...PLI...(a)x(b)LI...
							// temp needs to be matched with everything up to x.
							// temp itself needs to have x appended to it.
							// Make 'etc' into the matchable string: 0 to LI - (b).
							etc = w.slice(0, li - m[m.length - 1].length);
							// And append to 'temp': LI - m + (a) to LI - (b).
							// (And escape any regexp characters in it.)
							temp +=
								w
									.slice(
										li - m[0].length + m[1].length,
										li - m[m.length - 1].length
									)
									.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "$";
							// Now attempt the match.
							temp = etc.search(RegExp(temp));
						}
						if (temp >= 0) {
							// Now try to match the second part.
							etc = change["exceptionPost" + counterString];
							if (etc === "") {
								// Auto success.
								etc = 0;
								// (If someone is silly enough to make '_' an exception, they aren't going to match anything!!)
							} else {
								// String is this: .....(a)x(b)LI...
								// etc needs to be matched with x and everything after.
								// etc itself needs to have x prepended to it.
								// Make 'temp' into the matchable string: LI - m + (a) to end
								temp = w.slice(li - m[0].length + m[1].length);
								// And append to 'etc': LI - (b) to LI.
								// (And escape any regexp characters in it.)
								etc =
									"^" +
									w
										.slice(li - m[m.length - 1].length, li)
										.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") +
									etc;
								// Now attempt the match.
								etc = temp.search(RegExp(etc));
							}
							if (etc >= 0) {
								// Exception found. Do not replace.
								if (printrules) {
									// Log if needed/

									// [rule] [arrow] [original word] [arrow] "[unchanged due to exception]"
									output.append($e("span", change["rule" + counterString]));
									span = $e("span", String.fromCharCode(0x21d2));
									span.classList.add("arrow");
									output.info.push(span, $e("span", w));
									span = $e("span", String.fromCharCode(0x2192));
									span.classList.add("arrow");
									output.info.push(span);
									span = $e("span", "[unchanged due to exception]");
									span.appendChild($e("br"));
									output.info.push(span);
								}
								if (m[0] === "" && (li === 0 || li === prevLength)) {
									// If the match didn't actually match anything, and it's at a position where it's likely
									//   to match the same nothing next time, just up and end the loop.
									m = null;
								} else {
									// Otherwise, check for more matches!
									m = rule.exec(w);
									li = rule.lastIndex;
								}
								continue;
							}
						}
					}
					// Did we have parentheticals in the inputted change?
					if (m.length > 3) {
						// Yup. Have to handle them.
						// Save the exterior of the match.
						allPrevious = w.slice(0, li - m.shift().length) + m.shift();
						allAfter = m.pop() + w.slice(li);
						// Replace the matched interior with the correct replacement.
						w =
							allPrevious +
							w.slice(allPrevious.length - 1, li - 0).replace("", rep) +
							allAfter;
						// Change the replacement using the asked-for $replacements.
						// We count downwards so we don't accidentally replace $10 with $1's match.
						etc = m.length;
						while (etc > 0) {
							// Replace $x with the xth element of the matches.
							rep = rep.replace(RegExp("\\$" + etc.toString(), "g"), m.pop());
							// Increment counter.
							etc--;
						}
					} else {
						// No extra parentheticals.
						// Save the exterior of the match.
						allPrevious = w.slice(0, li - m[0].length) + m[1];
						allAfter = m[2] + w.slice(li);
					}
					// Replace the matched interior with the correct replacement.
					w = allPrevious + rep + allAfter;
					if (m[0] === "" && (li === 0 || li === prevLength)) {
						// If the match didn't actually match anything, and it's at a position where it's likely
						//   to match the same nothing next time, just up and end the loop.
						m = null;
					} else {
						// Otherwise, check for more matches!
						m = rule.exec(w);
						li = rule.lastIndex;
					}
				}
			});
			// Did we change anything? Do we need to report it?
			if (printrules && previous !== w) {
				// Create message reporting the change.
				// [rule] [arrow] [original word] [arrow] [changed to]
				output.info.push($e("span", change["rule" + counterString]));
				span = $e("span", String.fromCharCode(0x21d2));
				span.classList.add("arrow");
				output.info.push(span, $e("span", previous));
				span = $e("span", String.fromCharCode(0x2192));
				span.classList.add("arrow");
				output.info.push(span);
				span = $e("span", w);
				span.appendChild($e("br"));
				output.info.push(span);
			}
			// Increment counter.
			counter++;
		}
		// Loop over the rewrite rules again.
		counter = 0;
		while (counter < rewTotal) {
			// Check to see if we apply this rule.
			//   0 = applies to input and output
			//   1 = applies to input only
			//  -1 = applies to output only
			if (rew.index[counter] <= 0) {
				w = w.replace(
					rew["outToIn" + counter.toString()],
					rew["outToInString" + counter.toString()]
				);
			}
			counter++;
		}
		// Did the word get modified?
		if (original !== w) {
			// Increment the changed-words counter.
			wordsChanged++;
			// Modify to show origins if asked for.
			if (outtype === "arro") {
				w = original + " " + String.fromCharCode(0x2192) + " " + w;
			} else if (outtype === "dict") {
				w += " [" + original + "]";
			}
		}
		// Add the mangled word to the output list.
		output.words.push(w);
	});
	// If we have saved the effects of rules, they need to be wrapped in a block.
	if (printrules) {
		div = $e("div");
		div.classList.add("soundChangeEffects");
		div.append(...output.info);
		output.info = [div];
	}
	// Add other information to the info.
	output.info.push($e("div", "Categories found: " + cat.index));
	output.info.push($e("div", "Rewrite rules found: " + rewTotal.toString()));
	output.info.push($e("div", "Sound changes found: " + nchange.toString()));
	output.info.push(
		$e("div", "Words processed: " + output.words.length.toString())
	);
	output.info.push($e("div", "Words changed: " + wordsChanged.toString()));
	// Return the output.
	return output;
}

// A quick way to escape HTML characters by turning a string into a text node and back again.
function escapeHTML(html) {
	return $e("p", html).innerHTML;
}

// User hit the action button.  Make things happen!
function evolve() {
	var parsed,
		before,
		outtype,
		printRules,
		showDiff,
		errorMessages = [];

	// Read parameters.
	outtype = $q("input[type=radio][name=outtype]:checked").value; // What form does the output take?
	printRules = $i("reportAppliedRules").checked; // Do we show what rules were applied?
	showDiff = $i("showDifferences").checked; // Show differences from last run?

	// Grab the category list.
	before = $i("cats").value;
	// If the categories have changed, parse them.
	parsed = maybeParseCategories(before);
	if (parsed) {
		errorMessages.push(...parsed);
	}

	// Grab the sound changes.
	before = $i("change").value;
	// If the sound-change rules have changed, parse them.
	parsed = maybeParseSoundChanges(before);
	if (parsed) {
		errorMessages.push(...parsed);
	}

	// Grab the rewrite rules.
	before = $i("rewrite").value;
	// If the rewrite rules have changed, parse them.
	parsed = maybeParseRewriteRules(before);
	if (parsed) {
		errorMessages.push(...parsed);
	}

	// Print error messages or requested data.
	erase();
	if (errorMessages.length > 0) {
		let outputtext = $i("outputText");
		outputtext.append(...errorMessages.shift());
		errorMessages.forEach(item =>
			outputtext.append($e("br"), $e("br"), ...item)
		);
	} else {
		// Actually generate text.
		// Send to function to run the sound changes on each of them.
		let generatedText = changeTheWords(
				$i("inputLex").value.split(/\r?\n/),
				outtype,
				printRules
			),
			outputlex = $i("outputLex"),
			outputwords = generatedText.words.slice();
		// Print the technical stuff.
		$i("outputText").append(...generatedText.info);
		// Get the lexicon output.
		outputwords = generatedText.words.slice();
		// Have we been asked to highlight differences from the last run?
		if (showDiff && previousRun !== false) {
			let elements = [];
			// Loop through all elements of outputwords.
			while (outputwords.length) {
				// Have we run out of previous? Or is the new output different?
				if (!previousRun || outputwords[0] !== previousRun[0]) {
					// Bold-face this.
					elements.push($e("strong", outputwords.shift()));
				} else {
					// Leave it as is.
					elements.push(outputwords.shift());
				}
				// Move to the next word in previousRun (if any).
				previousRun && previousRun.shift();
			}
			// Save the new info.
			outputwords = elements;
		}
		// Save this for the next run, if needed.
		previousRun = generatedText.words.slice();
		// Output the changed words.
		outputlex = $i("outputLex");
		outputlex.append(outputwords.shift());
		outputwords.forEach(function(el) {
			outputlex.append($e("br"), el);
		});
	}
}

function maybeParseCategories(possiblenewcats) {
	var newcats,
		tester,
		output = [];
	if (possiblenewcats === previousCat) {
		// nothing has changed. Return false.
		return false;
	}
	newcats = possiblenewcats.split(/\r?\n/);
	// Hold on to the number of categories.
	ncat = newcats.length;
	// Set up 'cat' as an object for all categories.
	cat = new Object();
	// Set up an index for the categories.
	cat.index = "";
	// Go through each category one at a time.
	// Make sure categories have structure like V=aeiou
	tester = newcats.every(function(element) {
		// Remove whitespace from element.
		var thiscat = element.trim();
		// Lock up the length of this category.
		const len = thiscat.length;
		if (len === 0) {
			// Blank category. Ignore this.
			ncat--;
		} else if (
			len < 3 ||
			thiscat.indexOf("=") !== 1 ||
			thiscat.indexOf("=", 2) !== -1
		) {
			// If the category doesn't have at least three characters...
			//  OR the category doesn't have = as its second character...
			//  OR the category has = somewhere else other than the second character...
			// THEN this is a bad category.

			// Error: [category]
			// Categories must be in the form V=aeiou
			// That is, a single letter, am equals sign, then a list of possible expansions.
			output.push([
				$e("strong", "Error:"),
				SPACE + escapeHTML(thiscat),
				$e("br"),
				"Categories must be of the form V=aeiou",
				$e("br"),
				"That is, a single letter, an equal ssign, then a list of possible expansions."
			]);
			// End the looping.
			return false;
		} else {
			// Isolate the category name.
			let thisname = thiscat.charAt(0);
			if (cat.hasOwnProperty(thisname)) {
				// If we have defined this category before, throw an error.

				// Error: You have defined category [category] more than once.
				output.push([
					$e("strong", "Error:"),
					SPACE + "You have defined category " +
						escapeHTML(thisname) +
						" more than once."
				]);
				return false;
			} else {
				// Add this category to the category index.
				cat.index += thiscat.charAt(0);
				// Save this category info.
				cat[thisname] = thiscat.substring(2);
			}
		}
		// Continue the loop.
		return true;
	});
	// If we found no errors, save the categories.
	if (tester && ncat > 0) {
		previousCat = possiblenewcats;
	}
	// Return list of error messages (if any).
	return output;
}

function maybeParseSoundChanges(possiblenewchanges) {
	var splitter,
		boundary,
		underscore,
		counter,
		tester,
		newchanges,
		output = [];
	if (possiblenewchanges === previousChange) {
		// Nothing has changed. Return false.
		return false;
	}
	// Set up variables to hold the special characters we're using.
	splitter = $i("changeSep").value || "/";
	boundary = $i("changeBound").value || "#";
	underscore = $i("changePos").value || "_";
	// Change any linguistic-standard symbols into our default ones, then break into an array.
	newchanges = standardizePhonoRules(possiblenewchanges, splitter).split(
		/\r?\n/
	);
	// Save the length of the rules.
	nchange = newchanges.length;
	// Set up 'change' as a blank object.
	change = new Object();
	// Set up an index for exceptions.
	change.exceptionIndex = [];
	// Set up a counter to give each rule a unique ID.
	counter = 0;
	// Go through each rule one at a time.
	tester = newchanges.every(function(testing) {
		var pre,
			post,
			hold,
			from,
			to,
			patt,
			pattIndex,
			exception,
			exceptionIndex,
			leftovers,
			counterString,
			rule = testing.trim();
		// After trimming, if the rule is blank, ignore it.
		if (rule === "") {
			nchange--;
			return true;
		}
		[from, to, patt, exception, ...leftovers] = rule.split(splitter);
		// Check for a generated exception.
		if (exception !== undefined) {
			// Trim any extra whitespace.
			exception = exception.trim();
			// negative lookahead (?!x)
			// positive lookahead (?=x)
			// q(?!u)i	matches qit but not quit
			// q(?=u)	matches quit but not qit
			// q(?=u)u	matches quit but not qit
			// q(?=u)i	does not match either qit or quit
			exceptionIndex = exception.indexOf(underscore);
		}
		// If patt is blank or undefined, change it to _ (underscore).
		// Set pattIndex to the index position of the underscore in patt.
		if (patt === "" || patt === undefined) {
			patt = underscore;
			pattIndex = 0;
		} else {
			// Trim patt of any extra whitespace.
			patt = patt.trim();
			pattIndex = patt.indexOf(underscore);
		}
		// Sanity checks.
		if (from === undefined || to === undefined || (from === "" && to === "")) {
			// If there's no 'from' AND no 'to' then throw an error.
			// If patt isn't formatted correctly, throw an error.
			// ERROR: [rule]
			// Sound changes must be in the form a/b/x1_x2, where a is the initial sound, b is the sound it changes to, and
			//  x1_x2 is the context of where a is, with _ representing the sound being changed. a or b may be blank, but not both.
			output.push([
				$e("strong", "Error:"),
				SPACE + rule,
				$e("br"),
				"Sound changes must be in the form" + SPACE,
				$e(
					"em",
					"a" +
					splitter +
					"b" +
					splitter +
					"x" +
					String.fromCharCode(0x00b9) + // superscript 1
						underscore +
						"x" +
						String.fromCharCode(0x00b2) // superscript 2
				),
				", where" + SPACE,
				$e("em", "a"),
				SPACE + "is the initial sound," + SPACE,
				$e("em", "b"),
				SPACE + "is the sound it changes to, and" + SPACE,
				"x" +
				String.fromCharCode(0x00b9) + // superscript 1
					underscore +
					"x" +
					String.fromCharCode(0x00b2), // superscript 2
				SPACE + "is the context of where" + SPACE,
				$e("em", "a"),
				SPACE + "is, with" + SPACE,
				$e("em", underscore),
				SPACE + "representing the sound being changed." + SPACE,
				$e("em", "a"),
				SPACE + "or" + SPACE,
				$e("em", "b"),
				SPACE + "may be blank, but not both."
			]);
			// End the looping.
			return false;
		} else if (pattIndex < 0) {
			// If patt isn't formatted correctly, throw an error.
			// ERROR: [rule]
			// Sound changes must be in the form a/b/x1_x2, where a is the initial sound, b is the sound it changes to, and
			//  x1_x2 is the context of where a is, with _ representing the sound being changed. (You can omit the context,
			//  which will default to _ alone.)
			output.push([
				$e("strong", "Error:"),
				SPACE + rule,
				$e("br"),
				"Sound changes must be in the form" + SPACE,
				$e(
					"em",
					"a" +
					splitter +
					"b" +
					splitter +
					"x" +
					String.fromCharCode(0x00b9) + // superscript 1
						underscore +
						"x" +
						String.fromCharCode(0x00b2) // superscript 2
				),
				", where" + SPACE,
				$e("em", "a"),
				SPACE + "is the initial sound," + SPACE,
				$e("em", "b"),
				SPACE + "is the sound it changes to, and" + SPACE,
				$e(
					"em",
					"x" +
					String.fromCharCode(0x00b9) + // superscript 1
						underscore +
						"x" +
						String.fromCharCode(0x00b2) // superscript 2
				),
				SPACE + "is the context of where" + SPACE,
				$e("em", "a"),
				SPACE + "is, with" + SPACE,
				$e("em", underscore),
				SPACE +
					"representing the sound being changed. (You can omit the context, which will default to" +
					SPACE,
				$e("em", underscore),
				SPACE + "alone.)"
			]);
			// End the looping.
			return false;
		} else if (exceptionIndex !== undefined && exceptionIndex < 0) {
			// If 'exception' is provided but incorrectly formatted, throw an error.
			// ERROR: [rule]
			// Sound changes must be in the form a/b/x1_x2/y1_y2, where a is the initial sound, b is the sound it changes to,
			//  x1_x2 is the context of where a is, and y1_y2 is a context a cannot be, with _ representing the sound being changed.
			//  You can omit any of the /s and _s but you cannot omit _ from either context.
			output.push([
				$e("strong", "Error:"),
				SPACE + rule,
				$e("br"),
				"Sound changes must be in the form" + SPACE,
				$e(
					"em",
					"a" +
					splitter +
					"b" +
					splitter +
					"x" +
					String.fromCharCode(0x00b9) + // superscript 1
					underscore +
					"x" +
					String.fromCharCode(0x00b2) + // superscript 2
					splitter +
					"y" +
					String.fromCharCode(0x00b9) + // superscript 1
						underscore +
						"y" +
						String.fromCharCode(0x00b2) // superscript 2
				),
				", where" + SPACE,
				$e("em", "a"),
				SPACE + "is the initial sound," + SPACE,
				$e("em", "b"),
				SPACE + "is the sound it changes to," + SPACE,
				$e(
					"em",
					"x" +
					String.fromCharCode(0x00b9) + // superscript 1
						underscore +
						"x" +
						String.fromCharCode(0x00b2) // superscript 2
				),
				SPACE + "is the context of where" + SPACE,
				$e("em", "a"),
				SPACE + "is, and" + SPACE,
				$e(
					"em",
					"y" +
					String.fromCharCode(0x00b9) + // superscript 1
						underscore +
						"y" +
						String.fromCharCode(0x00b2) // superscript 2
				),
				SPACE + "is a context" + SPACE,
				$e("em", "a"),
				SPACE + "cannot be, with" + SPACE,
				$e("em", underscore),
				SPACE +
					"representing the sound being changed. You can omit any of the " +
					SPACE,
				$e("em", splitter),
				"s and" + SPACE,
				$e("em", underscore) + "s but you cannot omit" + SPACE,
				$e("em", underscore),
				SPACE + "from either context."
			]);
			// End the looping.
			return false;
		}
		// Set a variable so we don't have to call this function multiple times.
		counterString = counter.toString();
		// Save the bare rule.
		change["rule" + counterString] = rule;
		// Note: Not going to check for proper boundary placement. If they screw it up, too bad.
		// Handle the special case of metathesis, indicated by two backslashes.
		if (to === "\\\\") {
			to = from.reverse();
		}
		// Interpret 'from' and 'to' as potential regexes bearing category matches and the like.
		from = interpretFromAndTo(from);
		to = interpretFromAndTo(to);
		// See if we found categories in both 'from' and 'to'.
		if (from.cat !== false && to.cat !== false) {
			let stringArray, fromLetters, toLetters;
			// If the third letter of the 'from' category is found, it must be
			//   replaced with the third letter of the 'to' category. (And so on.)
			fromLetters = from.rule[from.cat];
			toLetters = to.rule[to.cat];
			// If there are more letters in 'from' (y) then balance out 'to' (z) with blank strings.
			while (fromLetters.length > toLetters.length) {
				toLetters.push("");
			}
			// Create bare strings in new properties representing the parts before (pre) and
			//   after (post) the category.
			from.pre = from.rule.slice(0, from.cat).join("");
			from.post = from.rule.slice(from.cat + 1).join("");
			to.pre = to.rule.slice(0, to.cat).join("");
			to.post = to.rule.slice(to.cat + 1).join("");
			// Transform 'from' and 'to' into arrays of strings.
			stringArray = [];
			fromLetters.forEach(r => {
				stringArray.push(from.pre + r + from.post);
			});
			from = stringArray.slice();
			stringArray = [];
			toLetters.forEach(r => {
				stringArray.push(to.pre + r + to.post);
			});
			to = stringArray.slice();
		} else {
			if (from.cat !== false) {
				// No 'to' category, so change 'from' category to normal regex.
				from.rule[from.cat] = "[" + from.rule[from.cat].join("") + "]";
			} else if (to.cat !== false) {
				// No 'from' category, so change 'to' category to normal regex.
				to.rule[to.cat] = "[" + to.rule[to.cat].join("") + "]";
			}
			// Transform from simple objects into arrays of one string.
			from = [from.rule.join("")];
			to = [to.rule.join("")];
		}
		// // //
		// // // Now work on the context (patt).
		// // //
		// pre will be the part of the regex before the underscore.
		// post will be the part after.
		pre =
			"(" +
			interpretGivenChanges(patt.substring(0, pattIndex), boundary, true) +
			")";
		post =
			"(" +
			interpretGivenChanges(patt.substring(pattIndex + 1), boundary, false) +
			")";
		// Go through each 'from' and convert to an array of regexes using the additional 'pre' and 'post' bits.
		hold = [];
		from.forEach(r => {
			hold.push(new RegExp(pre + r + post, "g"));
		});
		// Save 'from' and 'to'.
		change["from" + counterString] = hold.slice();
		change["to" + counterString] = to;
		// // //
		// // // Now work on the 'exception'.
		// // //
		if (exceptionIndex !== undefined) {
			// Mark that we have one.
			change.exceptionIndex.push(true);
			// y will be the part of the regex before the underscore.
			// z will be the part after.
			pre = interpretGivenChanges(
				exception.substring(0, exceptionIndex),
				boundary,
				true
			);
			post = interpretGivenChanges(
				exception.substring(exceptionIndex + 1),
				boundary,
				false
			);
			// Save 'exception' as separate properties.
			change["exceptionPre" + counterString] = pre;
			change["exceptionPost" + counterString] = post;
		} else {
			// No exception.
			change.exceptionIndex.push(false);
		}
		// Increment the counter.
		counter++;
		// Continue the loop.
		return true;
	});
	// If we found no errors, save the rules.
	if (tester && nchange > 0) {
		previousChange = possiblenewchanges;
	} else if (nchange <= 0) {
		// Whoops, foud one last error: no sound changes!
		// Error: No sound changes provided.
		output.push([$e("strong", "Error:"), SPACE + "No sound changes provied."]);
	}
	return output;
}

function maybeParseRewriteRules(possiblynewrules) {
	var newrules,
		counter,
		splitter,
		oneway,
		otherway,
		tester,
		output = [];
	if (possiblynewrules === previousRew) {
		// Nothing has changed. Return false.
		return false;
	}
	newrules = possiblynewrules.split(/\r?\n/);
	// Save the length of the rules.
	rewTotal = newrules.length;
	// Set up 'rew' as a blank object.
	rew = new Object();
	// Give it an index to track one-way changes.
	rew.index = [];
	// Set up a counter to give each rule a unique ID.
	counter = 0;
	// Set up our splitter variables.
	splitter = $i("rewBoth").value || "||";
	oneway = $i("rewIn").value || ">>";
	otherway = $i("rewOut").value || "<<";
	// Go through each rule one at a time.
	tester = newrules.every(function(testing) {
		var x, index, counterString;
		// Look for splits.
		if (testing.indexOf(splitter) !== -1) {
			// Two-way rule.
			index = 0;
		} else if (testing.indexOf(oneway) !== -1) {
			// Rule only applies to input.
			index = 1;
		} else if (testing.indexOf(otherway) !== -1) {
			// Rule only applies to output.
			index = -1;
		} else {
			// Badly formatted rule.

			// Error: [rule]
			// Rewrite rules must be in the form a||b where a is the initial pattern and b is the pattern it changes to.
			//  (>> and << are also acceptable for one-way rules.)
			output.push([
				$e("strong", "Error:"),
				SPACE + testing,
				$e("br"),
				"Rewrite rules must be in the form" + SPACE,
				$e("em", "a" + splitter + "b"),
				", where" + SPACE,
				$e("em", "a"),
				SPACE + "is the initial pattern and" + SPACE,
				$e("em", "b"),
				SPACE + "is the pattern it changes to. (",
				$e("em", "a" + oneway + "b"),
				SPACE + "and" + SPACE,
				$e("em", "a" + otherway + "b"),
				SPACE + "are also acceptable for one-way rules.)"
			]);
			// End the looping.
			return false;
		}
		// Set a variable so we don't have to call this function multiple times.
		counterString = counter.toString();
		// Split into two parts.
		x = testing.split([otherway, splitter, oneway][index + 1]);
		// Turn into regexes and save.
		rew["inToOut" + counterString] = getComplexRegex(x[0], "g");
		rew["inToOutString" + counterString] = x[1];
		rew["outToIn" + counterString] = getComplexRegex(x[1], "g");
		rew["outToInString" + counterString] = x[0];
		// Save the index.
		rew.index.push(index);
		// Increment the counter.
		counter++;
		// Continue the loop.
		return true;
	});
	// If we found no errors, save the rules.
	if (tester && rewTotal > 0) {
		previousRew = possiblynewrules;
	}
	return output;
}

// Take input and look for %X and !%X category references to translate, then return as regexp object.
function getComplexRegex(input, flag) {
	var broken = input.split("%%"),
		rewritten = [],
		testing,
		catt,
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
			bit = testing.shift();
			// What's the category being negated?
			catt = bit.charAt(0);
			// Is it actually a category?
			if (cat.index.indexOf(catt) !== -1) {
				// Category found. Replace with [^a-z] construct, where a-z is the category contents.
				chunk += "[^" + cat[catt] + "]";
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
			bit = testing.shift();
			// What's the category?
			catt = bit.charAt(0);
			// Is it actually a category?
			if (cat.index.indexOf(catt) !== -1) {
				// Category found. Replace with [a-z] construct, where a-z is the category contents.
				chunk += "[" + cat[catt] + "]";
				// If category not found, it gets ignored.
			}
			// Remove category identifier, add to saved chunk.
			chunk += bit.substring(1);
		}
		// Save chunk!
		rewritten.push(chunk);
	}
	// Reduce %% back to %.
	chunk = rewritten.join("%");
	// Return as a RegExp.
	return new RegExp(chunk, flag);
}

// Go through a from/to string and check for categories and other regex stuff. Returns an object.
function interpretFromAndTo(s, from) {
	var x = new Object(),
		backslash = false,
		curly = false,
		square = false,
		c = 0;
	x.rule = [];
	x.cat = false;
	s.split("").forEach(function(q) {
		// If we previously had a backslash, add it to this element.
		if (backslash) {
			backslash = false;
			x.rule.push("\\" + q);
			// If we discover a backslash, set up for the next loop.
		} else if (q === "\\") {
			backslash = true;
			return;
			// If we previously had a square brace, keep looking for its matching end.
		} else if (square) {
			if (q === "]") {
				// Found it.
				square = false;
			}
			x.rule.push(q);
			// If we discover a square brace, pause lookups until we find its end.
		} else if (q === "[") {
			square = true;
			x.rule.push(q);
			// If we previously had a curly brace, keep looking for its matching end.
		} else if (curly) {
			if (q === "}") {
				// Found it.
				curly = false;
			}
			x.rule.push(q);
			// If we discover a curly brace, pause lookups until we find its end.
		} else if (q === "{") {
			curly = true;
			x.rule.push(q);
			//// If a boundary (#) is encountered, replace with the word-boundary regex.
			//} else if(q === b) {
			//	x.rule.push("\\b");
			// See if we've discovered a category.
		} else if (cat.index.indexOf(q) !== -1) {
			// Have we discovered a category already?
			if (x.cat !== false) {
				// At the moment, it's too complicated to save multiple categories afor multiple replacements,
				//   so we're just going to convert it without marking it in any way.
				x.rule.push("[" + cat[q] + "]");
			} else {
				// Replace with an array of that category's contents and save its position in the overall array.
				x.rule.push(cat[q].split(""));
				x.cat = c;
			}
			// Otherwise, treat as plain text (and possibly regex).
		} else {
			x.rule.push(q);
		}
		c++;
	});
	// Check for and insert missing end braces.
	if (square) {
		x.rules.push("]");
	}
	if (curly) {
		x.rules.push("}");
	}
	// x.rule => array of elements
	// x.cat  => array of indices of category elements
	return x;
}

// Go through a string in linguistics format and transform it into a regex-format string.
function interpretGivenChanges(info, boundary, preAndNotPost) {
	var x = [],
		backslash = false,
		curly = false,
		square = false;
	info.split("").forEach(function(q) {
		// If we previously had a backslash, add it to this element.
		if (backslash) {
			backslash = false;
			x.push("\\" + q);
			// If we discover a backslash, set up for the next loop.
		} else if (q === "\\") {
			backslash = true;
			return;
			// If we previously had a square brace, keep looking for its matching end.
		} else if (square) {
			if (q === "]") {
				// Found it.
				square = false;
			}
			x.push(q);
			// If we discover a square brace, pause lookups until we find its end.
		} else if (q === "[") {
			square = true;
			x.push(q);
			// If we previously had a curly brace, keep looking for its matching end.
		} else if (curly) {
			if (q === "}") {
				// Found it.
				curly = false;
			}
			x.push(q);
			// If we discover a curly brace, pause lookups until we find its end.
		} else if (q === "{") {
			curly = true;
			x.push(q);
			// If a boundary (#) is encountered, replace with the word-boundary regex.
			// --- Due to errors encountered, we now replace with either ^ (start) or $ (end)
		} else if (q === boundary) {
			//x.push("\\b");
			x.push(preAndNotPost ? "^" : "$");
			// If we discover a category, replace with a [] run of that category.
		} else if (cat.index.indexOf(q) !== -1) {
			x.push("[" + cat[q] + "]");
			// Otherwise, treat as plain text (and possibly regex).
		} else {
			x.push(q);
		}
	});
	return x.join("");
}

// Display the IPA and other stuff.
function showIPA() {
	erase();
	$i("p_chars").appendChild(createIPASymbolsFragment([$e("br"), $e("br")]));
}

// Open/close the Advanced Options block.
function advancedOptions() {
	$i("advancedOpen").classList.toggle("closed");
}

// Simple function erases all output.
function erase() {
	var elements = [$i("outputText"), $i("outputLex"), $i("p_chars")];
	elements.forEach(function(out) {
		while (out.firstChild) {
			out.removeChild(out.firstChild);
		}
	});
}

// Reset boxes to empty and some checkboxes to certain default values.
function clearBoxes() {
	$a("#cats,#change,#rewrite").forEach(box => (box.value = ""));
}

// Simple function sets up the import/export screen.
function prepImport() {
	$i("importBoxArea").classList.remove("closed");
	document.body.style.overflow = "hidden";
}

// Simple function clears input/export box and removes that screen.
function removeImportBox() {
	$i("importTextBox").value = "";
	$i("importBoxArea").classList.add("closed");
	document.body.style.overflow = "auto";
}

// Parse input to import.
function doImport() {
	// The imported info must match the following pattern.
	var patt = /--CATS--\n([\s\S]*)\n--CHANGES--\n([\s\S]*)\n--REWRITE--\n([\s\S]*)\n--FLAGS--\n([^ ]+) ([01]) ([01])\n--ADVANCED--\n([^\n]+)\n([^\n]+)\n([^\n]+)\n([^\n]+)\n([^\n]+)\n([^\n]+)/,
		toImport = $i("importTextBox").value,
		m = patt.exec(toImport);
	if (m === null) {
		return doAlert("Incorrect format", "", "error");
	}
	// Apply imported info to the boxes and checkboxes.
	$i("cats").value = m[1];
	$i("change").value = m[2];
	$i("rewrite").value = m[3];
	$i(m[4]).checked = true;
	$i("showDifferences").checked = m[5] !== "0";
	$i("reportAppliedRules").checked = m[6] !== "0";
	// Advanced options.
	m[7] !== "" && ($i("changeSep").value = m[7]);
	m[8] !== "" && ($i("changeBound").value = m[8]);
	m[9] !== "" && ($i("changePos").value = m[9]);
	m[10] !== "" && ($i("rewBoth").value = m[10]);
	m[11] !== "" && ($i("rewIn").value = m[11]);
	m[12] !== "" && ($i("rewOut").value = m[12]);
	// Announce success.
	doAlert("Import Successful!", "", "success");
	// Clear the import stuff.
	removeImportBox();
}

// Create an importable text file continaing all current info.
function doExport() {
	var toExport =
		"--CATS--\n" +
		$i("cats").value +
		"\n--CHANGES--\n" +
		$i("change").value +
		"\n--REWRITE--\n" +
		$i("rewrite").value +
		"\n--FLAGS--\n" +
		$q("input[name=outtype]:checked").getAttribute("id") +
		" " +
		($i("showDifferences").checked ? "1" : "0") +
		" " +
		($i("reportAppliedRules").checked ? "1" : "0") +
		"\n--ADVANCED--\n" +
		$i("changeSep").value +
		"\n" +
		$i("changeBound").value +
		"\n" +
		$i("changePos").value +
		"\n" +
		$i("rewBoth").value +
		"\n" +
		$i("rewIn").value +
		"\n" +
		$i("rewOut").value;
	// Put the info in the box.
	$i("importTextBox").value = toExport;
	// Show the box (and everything else).
	prepImport();
	// Give success message and instructions.
	doAlert(
		"",
		"Copy this for your own records.<br><br>Hit 'Cancel' when you're done.",
		"info"
	);
}

// Save current info to the browser, if possible.
function saveCustom(test) {
	if (!Customizable) {
		doAlert(
			"",
			"Your browser does not support Local Storage and cannot save your information.",
			"error"
		);
		return;
	} else if (CustomInfo && test !== true) {
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

	localStorage.setItem("EvolveCats", $i("cats").value);
	localStorage.setItem("EvolveChanges", $i("change").value);
	localStorage.setItem("EvolveRewrite", $i("rewrite").value);
	localStorage.setItem("EvolveShowDiff", $i("showDifferences").checked);
	localStorage.setItem("EvolveAppliedRules", $i("reportAppliedRules").checked);
	localStorage.setItem(
		"EvolveOutputType",
		$q("input[name=outtype]:checked").getAttribute("id")
	);
	// Advanced options.
	localStorage.setItem("EvolveSep", $i("changeSep").value);
	localStorage.setItem("EvolveBound", $i("changeBound").value);
	localStorage.setItem("EvolvePos", $i("changePos").value);
	localStorage.setItem("EvolveRwBoth", $i("rewBoth").value);
	localStorage.setItem("EvolveRwIn", $i("rewIn").value);
	localStorage.setItem("EvolveRwOut", $i("rewOut").value);
	CustomInfo = true;

	// Alert success.
	doAlert("Saved to browser.", "", "success");
}

// Remove stored information from the browser.
function clearCustom(test) {
	if (!Customizable) {
		doAlert(
			"",
			"Your browser does not support Local Storage and cannot save your information.",
			"error"
		);
		return;
	} else if (!CustomInfo) {
		doAlert("You don't have anything saved.", "", "error");
		return;
	} else if (CustomInfo && test !== true) {
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
	// Clear storage.
	[
		"EvolveCats",
		"EvolveChanges",
		"EvolveRewrite",
		"EvolveShowDiff",
		"EvolveAppliedRules",
		"EvolveOutputType",
		"EvolveSep",
		"EvolveBound",
		"EvolvePos",
		"EvolveRwBoth",
		"EvolveRwIn",
		"EvolveRwOut"
	].forEach(function(x) {
		window.localStorage.removeItem(x);
	});
	window.localStorage.clear();
	CustomInfo = false;
	// Alert success.
	doAlert("Cleared from browser.", "", "success");
}

// See if there's anything to load, then load it.
function loadCustom() {
	if (!Customizable) {
		doAlert(
			"Sorry!",
			"Your browser does not support Local Storage and cannot save your information.",
			"error"
		);
		return;
	} else if (!CustomInfo) {
		doAlert("You don't have anything saved.", "", "error");
		return;
	}
	// Do the load.
	loadCustomInfo();
	// Announce success.
	doAlert("Saved information has been loaded!", "", "success");
}

// Replace input boxes with saved info.
function loadCustomInfo() {
	$i("cats").value = localStorage.getItem("EvolveCats");
	$i("change").value = localStorage.getItem("EvolveChanges");
	$i("rewrite").value = localStorage.getItem("EvolveRewrite");
	$i("showDifferences").checked =
		localStorage.getItem("EvolveShowDiff") === "true";
	$i("reportAppliedRules").checked =
		localStorage.getItem("EvolveAppliedRules") === "true";
	$i(localStorage.getItem("EvolveOutputType")).checked = true;
	// Advanced options.
	$i("changeSep").value = localStorage.getItem("EvolveSep");
	$i("changeBound").value = localStorage.getItem("EvolveBound");
	$i("changePos").value = localStorage.getItem("EvolvePos");
	$i("rewBoth").value = localStorage.getItem("EvolveRwBoth");
	$i("rewIn").value = localStorage.getItem("EvolveRwIn");
	$i("rewOut").value = localStorage.getItem("EvolveRwOut");
}

// Set up buttons
$i("evolveButton").addEventListener("click", evolve);
$i("clearBoxesButton").addEventListener("click", clearBoxes);
$i("eraseButton").addEventListener("click", erase);
$i("showIPAButton").addEventListener("click", showIPA);
$i("advancedOptionsButton").addEventListener("click", advancedOptions);
$i("saveCustomButton").addEventListener("click", saveCustom);
$i("loadCustomButton").addEventListener("click", loadCustom);
$i("clearCustomButton").addEventListener("click", clearCustom);
$i("prepImportButton").addEventListener("click", prepImport);
$i("doExportButton").addEventListener("click", doExport);
$i("doImportButton").addEventListener("click", doImport);
$i("removeImportBoxButton").addEventListener("click", removeImportBox);

// Check for localStorage.
if (typeof Storage !== "undefined") {
	// Make this known to other functions.
	Customizable = true;
	// Check if we have info stored. If so, load it up.
	if (localStorage.getItem("EvolveCats") !== null) {
		CustomInfo = true;
		loadCustomInfo();
	}
}

// Use Sweetalert2 if available!
function doAlert(title, text, type) {
	if (typeof Swal !== "undefined") {
		// We has it!
		Swal.fire({
			type: type,
			title: title,
			html: text,
			customClass: "alertBox",
			buttonsStyling: false
		});
	} else {
		// We don't has it.
		alert(
			(title + " " + text.replace(/<br>/g, "\n").replace(/<[^>]*>/g, "")).trim()
		);
	}
}
function doConfirm(
	title,
	text,
	yesFunc,
	noFunc,
	type = "question",
	yes = "Ok",
	no = "Cancel"
) {
	if (typeof Swal !== "undefined") {
		// We has it!
		Swal.fire({
			title: title,
			html: text,
			type: type,
			showCancelButton: true,
			confirmButtonText: yes,
			cancelButtonText: no,
			customClass: "alertBox",
			buttonsStyling: false
		}).then(result => (result.value ? yesFunc() : noFunc()));
	} else {
		// We don't has it.
		if (
			confirm(
				(
					title +
					" " +
					text.replace(/<br>/g, "\n").replace(/<[^>]*>/g, "")
				).trim()
			)
		) {
			yesFunc();
		} else {
			noFunc();
		}
	}
}
