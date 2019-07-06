<?php
// Send off the last-modified time for this page.
date_default_timezone_set("UTC");
$x = getlastmod();
header("Last-Modified: ".date(DATE_RFC1123, $x));
?><!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>GenWord - Conlang Vocabulary Generator</title>
<meta name="theme-color" content="#001144">
<meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=yes">
<link rel="stylesheet" type="text/css" href="css/reset.css">
<link rel="stylesheet" type="text/css" href="css/wordgen01.css">
</head> 
<body>
<!--<div style="background:black; width: 22.5em; height: 5em;">eek</div>
<div style="background:red; width: 35em; height: 5em"><textarea style="width: 28.125em; height: 3em; box-sizing: border-box; "></textarea></div>-->
<header id="title">GenWord</header>
<p class="desc">This is a Javascript-based vocabulary generator for <abbr title="Constructed Languages">conlangs</abbr> based on
	Mark Rosenfelder&apos;s <a href="http://www.zompist.com/gen.html">Gen</a>. Enter your syllable types in the syllable boxes,
	using any categories you want (e.g. R for liquids). Define the phonemes that make up those categories in the categories box.
	Hit Generate to create a random wordlist. Use cut and paste to save your work. Click on the small question marks
	<span class="help-fake">?</span> for help, or go read through the <a href="wordgentutorial.html">tutorial</a> I wrote.
</p>

<div id="parameters">
	<div id="p_categories">Categories:<span class="help">?<span class="info">This is where you define categories of sounds. The format is
			<em class="two">X=abcde</em> where <em class="two">X</em> is the <em>category</em> (any single character) and
			<em class="two">abcde</em> is a <em>run</em> of characters that are assigned to the category. <em>Categories</em>
			are used in the <strong>syllable</strong> boxes. When a <em>category</em> is chosen, a character is chosen from its
			<em>run</em> according to a <em>utilization rate</em> that favors the characters at the beginning of the <em>run</em>.
			The <em>rate</em> can be changed via the <strong>Dropoff</strong> selector.</span></span>
		<br>
		<textarea id="categories" class="bigbox" name="categories" rows="10" cols="40">
C=ptkbdg
R=rl
V=ieaou</textarea>
	</div>
	<div id="p_rewrite">Rewrite rules:<span class="help">?<span class="info">These are used to perform global replacements on generated
			words. Since <strong>categories</strong> only output one character at a time, you can use this for two-letter
			phonemes. For instance, you might use <em class="two">T||th</em> to change the generated word
			<em class="two">Tem</em> into <em class="two">them</em>.<br><br>Both sides use Javascript regex expressions. The left side also
			accepts <em class="two">%X</em> and <em class="two">!%X</em> expressions where X is the label of a <em>category</em>:
			<em class="two">%X</em> is replaced with <em class="two">[a-z]</em> and <em class="two">!%X</em> is replaced with
			<em class="two">[^a-z]</em>, where <em>a-z</em> is the run of characters in that category.
			<br><br><strong>Predefs</strong> use <em>rewrite rules</em> to remove long runs of letters, modify letters based on the
			letters around them, and more.</span></span><br>
		<textarea id="rewrite" class="bigbox" name="rewrite" rows="10" cols="40">
ki||ci</textarea>
	</div>
	<div id="p_wordInitial"><span class="singleswap">S</span><span class="multiswap hidden">Word-initial s</span>yllables:<span class="help">?<span class="info"><span class="hidden multiswap">If the generator asks for a multi-syllable word,
			syllables in this box will be used for the first syllable in the word.<br><br></span><em>Syllables</em> are strings made
			up of one or more <strong>Categories</strong>. For example, if the categories <em class="two">C=bd</em> and
			<em class="two">V=ai</em> exist, a syllable <em class="two">CV</em> might output <em class="two">ba</em>,
			<em class="two">bi</em>, <em class="two">da,</em> or <em class="two">di</em>. If a character in a syllable
			isn&apos;t a <em>category</em>, it will be outputted directly. (For example, <em class="two">CoV</em> could
			output <em class="two">boi</em>.)</span></span><br>
		<textarea id="wordInitial" class="midbox" name="wordInitial" rows="10" cols="20">
CV
V
CRV</textarea>
	</div>
	<div id="p_oneType"><div id="wicheck"><div><input type="checkbox" name="oneType" id="oneType" checked></div><div><label for="oneType">Use only one type of syllables.</label><span class="help">?<span class="info">If unchecked, more options will
			appear, and the generator will take them into account when generating words. Leave this checked if your syllables
			don&apos;t have special rules as to when they appear in different parts of a word.</span></span></div></div>
	</div>
	<div id="p_singleWord" class="multiswap hidden">Single-word syllables:<span class="help">?<span class="info">If the generator asks for a single-syllable
			word (a <strong>monosyllable</strong>), it will pull a syllable from those in this box. See <strong>Word-Initial
			Syllables</strong> for more information.</span></span><br>
		<textarea id="singleWord" class="littlebox" name="singleWord" rows="4" cols="20"></textarea>
	</div>
	<div id="p_midWord" class="multiswap hidden">Mid-word syllables:<span class="help">?<span class="info">If the generator asks for a multi-syllable word, the
			syllables in this box will be used to form syllables that are neither the first nor last in the word. See
			<strong>Word-Initial Syllables</strong> for more information.</span></span><br>
		<textarea id="midWord" class="littlebox" name="midWord" rows="4" cols="20"></textarea>
	</div>
	<div id="p_wordFinal" class="multiswap hidden">Word-final syllables:<span class="help">?<span class="info">If the generator asks for a multi-syllable word,
			syllables in this box will be used for the final syllable in the word. See <strong>Word-Initial Syllables</strong>
			for more information.</span></span><br>
		<textarea id="wordFinal" class="midbox" name="wordFinal" rows="10" cols="20"></textarea>
	</div>
	<div id="p_outType">Output type:<span class="help">?<span class="info">This choice determines what will appear in the
			<strong>Output</strong> section below. <em>Text output</em> will output a pseudo-text. <em>Wordlist</em> outputs
			a columnized list of 150 words. <em>Giant wordlist</em> gives you 750 words, presented one per line. <em>All
			possible syllables</em> presents all possible syllables, one per line, ignoring <strong>Dropoff</strong> and
			<strong>Monosyllables</strong> settings.</span></span>
		<br><label><input type ="radio" name="outType" value="text" id="textOutput" checked>Text output</label>
		<br><label><input type ="radio" name="outType" value="dict">Wordlist (as table)</label>
		<br><label><input type ="radio" name="outType" value="dictC">Wordlist (all words capitalized)</label>
		<br><label><input type ="radio" name="outType" value="longdict">Giant wordlist</label>
		<br><label><input type ="radio" name="outType" value="genall">All possible syllables<br></label>
	</div>
	<div id="p_dropoff">Dropoff:<span class="help">?<span class="info">This choice determines how fast the <em>utilization
			rate</em> declines. (See <strong>Categories</strong>.) Assume you&apos;re using <em class="two">S=tspkThfS</em>.
			<em>Fast</em> makes the <em class="two">t</em> appear much more than <em class="two">s</em>, which appears much
			more than <em class="two">p</em>, and so on. <em>Molasses</em> has a less steep decline, but
			<em class="two">t</em> still shows up more than <em class="two">s</em>, and so on. <em>Equiprobable</em> gives
			all choices an equal chance.<br><br><img src="images/dropoff.png" alt="graph"><br><em style="font-size: smaller">graph
			is an approximation</em></span></span>
		<br><label><input type ="radio" name="dropoff" value="45" id="dropoffFast">Fast</label>
		<br><label><input type ="radio" name="dropoff" value="30" id="dropoffMedium" checked>Medium</label>
		<br><label><input type ="radio" name="dropoff" value="15" id="dropoffSlow">Slow</label>
		<br><label><input type ="radio" name="dropoff" value="8"  id="dropoffMolasses">Molasses</label>
		<br><label><input type ="radio" name="dropoff" value="0"  id="dropoffEquiprobable">Equiprobable</label>
	</div>
	<div id="p_monoRate">Monosyllables:<span class="help">?<span class="info">This choice determines how often single-syllable words
				are generated, from <em>Rare</em> producing very few, to <em>Always</em> giving nothing but.</span></span>
		<br><label><input type ="radio" name="monoRate" id="monoAlways"       value="1.00">Always</label>
		<br><label><input type ="radio" name="monoRate" id="monoMostly"       value="0.85">Mostly</label>
		<br><label><input type ="radio" name="monoRate" id="monoFrequent"     value="0.50">Frequent</label>
		<br><label><input type ="radio" name="monoRate" id="monoLessFrequent" value="0.20" checked>Less frequent</label>
		<br><label><input type ="radio" name="monoRate" id="monoRare"         value="0.07">Rare</label>
	</div>
	<div id="p_showSyls"><label><input type="checkbox" name="showSyls" id="showSyls">Show
			syllables</label><span class="help">?<span class="info">If checked, syllable boundaries will be marked
			with a dot: <strong>&middot;</strong><br><br><strong>NOTE:</strong> This renders all <strong>rewrite rules</strong>
			useless across syllable boundaries.</span></span>
		<br><label><input type="checkbox" name="slowSylDrop" id="slowSylDrop">Slow syllable
			dropoff</label><span class="help">?<span class="info">Normally, syllables at the top of a syllable box
			will be chosen more often than syllables lower down. If checked, this is still true, but upper syllables will not
			have as much of an edge over lower syllables.</span></span>
	</div>
</div>
<div id="advancedClosed"><button id="advancedOpenButton">Open Advanced Options</button></div>
<div id="advancedSection" class="container">
	<div id="advancedOpen" class="closed">
		<div>
			<div><button id="saveCustomButton">Save to Browser</button><span class="help popOut">?<span class="info">Clicking <strong>Save
				to Browser</strong> will store the current input to your browser&apos;s localStorage, if your browser supports it, and create
				a new <em>Custom Settings</em> Default. If you already have info stored, this will overwrite it!<br><br>NOTE: This should not
				be considered a long-term storage solution, as your browser might delete it if you run out of cache or localStorage space. Use
				<strong>Export Settings</strong> to keep an offline backup.</span></span></div>
			<div><button id="clearCustomButton">Clear from Browser</button><span class="help popOut">?<span class="info">Clicking <strong>Clear
				from Browser</strong> will delete any information stored on your browser by the <strong>Save</strong> button.</span></span></div>
			<div><button id="prepImportButton">Import Settings</button><span class="help popOut">?<span class="info">Clicking <strong>Import
				Settings</strong> will open a box where you can paste information formatted by <strong>Export Settings</strong>. Clicking
				<strong>Import</strong> below the box will load your settings. Clicking <strong>Cancel</strong> will close the box.</span></span></div>
			<div><button id="doExportButton">Export Settings</button><span class="help popOut">?<span class="info">Clicking <strong>Export
				Settings</strong> will open a box and fill it with formatted information based on the settings currently active. Copy and
				save it for your own records, and use <strong>Import Settings</strong> to reload it at a later date.</span></span></div>
		</div>
		<div>
			<div><strong>Table cell size:</strong><br><input type="number" value="10" id="wordLengthInEms">em
				<span class="help popOut">?<span class="info">When using a Wordlist as an <strong>Output type</strong>, this determines
				how much space each word will take up. Modify this if the words you're generating are larger (or much smaller) than
				the space the Wordlist is giving you.</span></span></div>
			<div><strong>Wordlist size:</strong><br><input type="number" value="150" id="lexiconLength"> words
				<span class="help popOut">?<span class="info">When you use a Wordlist as an <strong>Output Type</strong>, it will output this many words.</span></span></div>
			<div><strong>Giant wordlist:</strong><br><input type="number" value="750" id="largeLexiconLength"> words
				<span class="help popOut">?<span class="info">When you use Giant Wordlist as an <strong>Output Type</strong>, it will output this many words.</span></span></div>
			<div><strong>Pseudo-text size:</strong><br><input type="number" value="30" id="sentences"> sentences
				<span class="help popOut">?<span class="info">When you use Text output as your <strong>Output Type</strong>, it will output
				this many sentences. (Sentences are between 1 and 15 words long, strongly favoring the middle of that range.)</span></span></div>
			<div><strong>Rewrite separator:</strong><br><input type="text" value="||" id="rewSep"><span class="help popOut">?<span class="info">Defines
				the plain text that separates the search expression from the replacement expression in <strong>Rewrite Rules</strong></span></span></div>
		</div>
	</div>
</div>
<div id="btns">
	<span class="buttongroup"><button id="generateButton">Generate</button><span class="help">?<span class="info">Clicking the
		<strong>Generate</strong> button starts the generator, printing output into the <strong>Output</strong> section below.
		The <strong>Output Type</strong> option determines what kind of information gets printed.</span></span>
	</span>
	<span class="buttongroup"><button id="eraseButton">Erase Output &dArr;</button><span class="help">?<span class="info">Clicking the <strong>Erase
		Output</strong> button erases everything in the <strong>Output</strong> below.</span></span>
	</span>
	<span class="buttongroup"><button id="clearBoxesButton">Clear Input &uArr;</button><span class="help">?<span class="info">Clicking the <strong>Clear
		Input</strong> button erases everything in the <strong>syllable</strong>, <strong>category</strong> and
		<strong>rewrite</strong> boxes, unchecks all checkboxes, and sets <strong>dropoff</strong>, <strong>output type</strong>
		and <strong>monosyllables</strong> to their initial values.</span></span>
	</span>
	<span class="buttongroup"><button id="showIPAButton">Extra Characters</button><span class="help">?<span class="info">Clicking the <strong>Extra
		Characters</strong> button puts a bunch of <abbr title="International Phonetic Alphabet">IPA</abbr>, Latin, Cyrillic,
		Armenian, Greek and Coptic characters into the <strong>Output</strong> section. (You can then cut and paste them into
		any of the boxes above!) Note: some characters may not print, especially if on a mobile device.</span></span>
	</span>
	<span class="buttongroup">
		<button id="loadPredefButton">Load Predef &rArr;</button>
		<select id="predef">
			<option value="pd1" selected>Starter</option>
			<!--<option value="2">Large Inventory</option>
			<option value="3">Latinate</option>
			<option value="4">Simple</option>
			<option value="5">Chinese</option>
			<option value="6">Kartaran</option>
			<option value="7">Reemish</option>-->
		</select>
		<span class="help">?<span class="info">Choosing a selection from the drop-down list and then clicking the <strong>Load
		Predef</strong> button will load a set of pre-defined <strong>categories</strong>, <strong>rewrite rules</strong> and
		<strong>syllables</strong> for you to use. Other checkboxes and options may change, too.
		<br><br>
		<em>Kartaran</em> and <em>Reemish</em> are fictional language families of my own construction. Other options should be
		self-explanatory.</span></span>
	</span>
</div>
<div id="output">
	<header class="minor">Output</header>
	<div id="outputText"> </div>
</div>
<div class="links links-nav">
	<div class="set-apart"><a href="conlangs/">Conlangs</a></div>
	<div class="set-apart"><a href=".">Index</a></div>
</div>
<div id="importBoxArea" class="closed">
	<div class="msg"></div>
	<textarea id="importTextBox" name="importTextBox" rows="25" cols="40" placeholder="Paste your input here and hit 'Import' below."></textarea>
	<div><button id="doImportButton">Import</button> <button id="removeImportBoxButton">Cancel</button></div>
</div>
<script src="https://cdn.jsdelivr.net/npm/sweetalert2@8/dist/sweetalert2.all.min.js"></script>
<script src="js/unicode.min.js"></script>
<script src="js/wordgen.min.js"></script>
<script src="js/help-popups.js"></script>
</body>
</html>
