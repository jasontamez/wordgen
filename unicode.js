// Script (C) 2017-2019 by Jason Tamez
// This work is licensed under a Creative Commons Attribution 4.0 International license.
// http://creativecommons.org/licenses/by/4.0/

// Code available here: https://github.com/jasontamez/wordgen

// Display the IPA and other stuff.
function defaultIPAWrapper() {
	var x = arguments[0];
	return '<span title="'+ x + ': ' + getUnicodeName(x) + '">' + String.fromCharCode(x) + "</span>";
}
function returnIPAPlus(preTitle, postTitlePreContent, postContent, glue, formatFunction = defaultIPAWrapper) {
	var	word = preTitle + "Latin:" + postTitlePreContent,
		frst = [ 0x00a1, 0x00bf, 0x00d8, 0x00f8, 0x2c60, 0xa722, 0xa78b, 0xa7b0, 0xab30, 0xab60, "x",   0x0250, "x",                0x0370, 0x0376, 0x037a, 0x0386, 0x0388, 0x038c, 0x038e, 0x03a3, 0xab65, "x",        0x0400, 0x048a, 0xa640, 0xa680, "x",        0x0531, 0x0561 ],
		last = [ 0x00a1, 0x00d6, 0x00f6, 0x024f, 0x2c7f, 0xa787, 0xa7ad, 0xa7b7, 0xab5a, 0xab64, "IPA", 0x02ff, "Greek and Coptic", 0x0373, 0x0377, 0x037f, 0x0386, 0x038a, 0x038c, 0x03a1, 0x03ff, 0xab65, "Cyrillic", 0x0482, 0x052f, 0xa66e, 0xa69b, "Armenian", 0x0556, 0x0587 ],
		i, j, len;
	for (i = 0, len = frst.length; i < len; i++) {
		// If we detect an "x", then last[x] has a new category name to display.
		if (frst[i] === "x") {
			word += postContent + glue + preTitle + last[i] + postTitlePreContent;
		} else {
			// Displaying entities numerically numbered in Unicode from frst[x] to last[x].
			for (j = frst[i]; j <= last[i]; j++) {
				// getUnicodeName is defined in a separate unicode.js script.
				word += formatFunction(j);
			}
		}
	}
	return word + postContent;
}

function getUnicodeName(what) {

	switch (what) {
		case 161:
			return "INVERTED EXCLAMATION MARK";
		case 191:
			return "INVERTED QUESTION MARK";
		case 192:
			return "LATIN CAPITAL LETTER A WITH GRAVE";
		case 193:
			return "LATIN CAPITAL LETTER A WITH ACUTE";
		case 194:
			return "LATIN CAPITAL LETTER A WITH CIRCUMFLEX";
		case 195:
			return "LATIN CAPITAL LETTER A WITH TILDE";
		case 196:
			return "LATIN CAPITAL LETTER A WITH DIAERESIS";
		case 197:
			return "LATIN CAPITAL LETTER A WITH RING ABOVE";
		case 198:
			return "LATIN CAPITAL LETTER AE";
		case 199:
			return "LATIN CAPITAL LETTER C WITH CEDILLA";
		case 200:
			return "LATIN CAPITAL LETTER E WITH GRAVE";
		case 201:
			return "LATIN CAPITAL LETTER E WITH ACUTE";
		case 202:
			return "LATIN CAPITAL LETTER E WITH CIRCUMFLEX";
		case 203:
			return "LATIN CAPITAL LETTER E WITH DIAERESIS";
		case 204:
			return "LATIN CAPITAL LETTER I WITH GRAVE";
		case 205:
			return "LATIN CAPITAL LETTER I WITH ACUTE";
		case 206:
			return "LATIN CAPITAL LETTER I WITH CIRCUMFLEX";
		case 207:
			return "LATIN CAPITAL LETTER I WITH DIAERESIS";
		case 208:
			return "LATIN CAPITAL LETTER ETH";
		case 209:
			return "LATIN CAPITAL LETTER N WITH TILDE";
		case 210:
			return "LATIN CAPITAL LETTER O WITH GRAVE";
		case 211:
			return "LATIN CAPITAL LETTER O WITH ACUTE";
		case 212:
			return "LATIN CAPITAL LETTER O WITH CIRCUMFLEX";
		case 213:
			return "LATIN CAPITAL LETTER O WITH TILDE";
		case 214:
			return "LATIN CAPITAL LETTER O WITH DIAERESIS";
		case 216:
			return "LATIN CAPITAL LETTER O WITH STROKE";
		case 217:
			return "LATIN CAPITAL LETTER U WITH GRAVE";
		case 218:
			return "LATIN CAPITAL LETTER U WITH ACUTE";
		case 219:
			return "LATIN CAPITAL LETTER U WITH CIRCUMFLEX";
		case 220:
			return "LATIN CAPITAL LETTER U WITH DIAERESIS";
		case 221:
			return "LATIN CAPITAL LETTER Y WITH ACUTE";
		case 222:
			return "LATIN CAPITAL LETTER THORN";
		case 223:
			return "LATIN SMALL LETTER SHARP S";
		case 224:
			return "LATIN SMALL LETTER A WITH GRAVE";
		case 225:
			return "LATIN SMALL LETTER A WITH ACUTE";
		case 226:
			return "LATIN SMALL LETTER A WITH CIRCUMFLEX";
		case 227:
			return "LATIN SMALL LETTER A WITH TILDE";
		case 228:
			return "LATIN SMALL LETTER A WITH DIAERESIS";
		case 229:
			return "LATIN SMALL LETTER A WITH RING ABOVE";
		case 230:
			return "LATIN SMALL LETTER AE";
		case 231:
			return "LATIN SMALL LETTER C WITH CEDILLA";
		case 232:
			return "LATIN SMALL LETTER E WITH GRAVE";
		case 233:
			return "LATIN SMALL LETTER E WITH ACUTE";
		case 234:
			return "LATIN SMALL LETTER E WITH CIRCUMFLEX";
		case 235:
			return "LATIN SMALL LETTER E WITH DIAERESIS";
		case 236:
			return "LATIN SMALL LETTER I WITH GRAVE";
		case 237:
			return "LATIN SMALL LETTER I WITH ACUTE";
		case 238:
			return "LATIN SMALL LETTER I WITH CIRCUMFLEX";
		case 239:
			return "LATIN SMALL LETTER I WITH DIAERESIS";
		case 240:
			return "LATIN SMALL LETTER ETH";
		case 241:
			return "LATIN SMALL LETTER N WITH TILDE";
		case 242:
			return "LATIN SMALL LETTER O WITH GRAVE";
		case 243:
			return "LATIN SMALL LETTER O WITH ACUTE";
		case 244:
			return "LATIN SMALL LETTER O WITH CIRCUMFLEX";
		case 245:
			return "LATIN SMALL LETTER O WITH TILDE";
		case 246:
			return "LATIN SMALL LETTER O WITH DIAERESIS";
		case 248:
			return "LATIN SMALL LETTER O WITH STROKE";
		case 249:
			return "LATIN SMALL LETTER U WITH GRAVE";
		case 250:
			return "LATIN SMALL LETTER U WITH ACUTE";
		case 251:
			return "LATIN SMALL LETTER U WITH CIRCUMFLEX";
		case 252:
			return "LATIN SMALL LETTER U WITH DIAERESIS";
		case 253:
			return "LATIN SMALL LETTER Y WITH ACUTE";
		case 254:
			return "LATIN SMALL LETTER THORN";
		case 255:
			return "LATIN SMALL LETTER Y WITH DIAERESIS";
		case 256:
			return "LATIN CAPITAL LETTER A WITH MACRON";
		case 257:
			return "LATIN SMALL LETTER A WITH MACRON";
		case 258:
			return "LATIN CAPITAL LETTER A WITH BREVE";
		case 259:
			return "LATIN SMALL LETTER A WITH BREVE";
		case 260:
			return "LATIN CAPITAL LETTER A WITH OGONEK";
		case 261:
			return "LATIN SMALL LETTER A WITH OGONEK";
		case 262:
			return "LATIN CAPITAL LETTER C WITH ACUTE";
		case 263:
			return "LATIN SMALL LETTER C WITH ACUTE";
		case 264:
			return "LATIN CAPITAL LETTER C WITH CIRCUMFLEX";
		case 265:
			return "LATIN SMALL LETTER C WITH CIRCUMFLEX";
		case 266:
			return "LATIN CAPITAL LETTER C WITH DOT ABOVE";
		case 267:
			return "LATIN SMALL LETTER C WITH DOT ABOVE";
		case 268:
			return "LATIN CAPITAL LETTER C WITH CARON";
		case 269:
			return "LATIN SMALL LETTER C WITH CARON";
		case 270:
			return "LATIN CAPITAL LETTER D WITH CARON";
		case 271:
			return "LATIN SMALL LETTER D WITH CARON";
		case 272:
			return "LATIN CAPITAL LETTER D WITH STROKE";
		case 273:
			return "LATIN SMALL LETTER D WITH STROKE";
		case 274:
			return "LATIN CAPITAL LETTER E WITH MACRON";
		case 275:
			return "LATIN SMALL LETTER E WITH MACRON";
		case 276:
			return "LATIN CAPITAL LETTER E WITH BREVE";
		case 277:
			return "LATIN SMALL LETTER E WITH BREVE";
		case 278:
			return "LATIN CAPITAL LETTER E WITH DOT ABOVE";
		case 279:
			return "LATIN SMALL LETTER E WITH DOT ABOVE";
		case 280:
			return "LATIN CAPITAL LETTER E WITH OGONEK";
		case 281:
			return "LATIN SMALL LETTER E WITH OGONEK";
		case 282:
			return "LATIN CAPITAL LETTER E WITH CARON";
		case 283:
			return "LATIN SMALL LETTER E WITH CARON";
		case 284:
			return "LATIN CAPITAL LETTER G WITH CIRCUMFLEX";
		case 285:
			return "LATIN SMALL LETTER G WITH CIRCUMFLEX";
		case 286:
			return "LATIN CAPITAL LETTER G WITH BREVE";
		case 287:
			return "LATIN SMALL LETTER G WITH BREVE";
		case 288:
			return "LATIN CAPITAL LETTER G WITH DOT ABOVE";
		case 289:
			return "LATIN SMALL LETTER G WITH DOT ABOVE";
		case 290:
			return "LATIN CAPITAL LETTER G WITH CEDILLA";
		case 291:
			return "LATIN SMALL LETTER G WITH CEDILLA";
		case 292:
			return "LATIN CAPITAL LETTER H WITH CIRCUMFLEX";
		case 293:
			return "LATIN SMALL LETTER H WITH CIRCUMFLEX";
		case 294:
			return "LATIN CAPITAL LETTER H WITH STROKE";
		case 295:
			return "LATIN SMALL LETTER H WITH STROKE";
		case 296:
			return "LATIN CAPITAL LETTER I WITH TILDE";
		case 297:
			return "LATIN SMALL LETTER I WITH TILDE";
		case 298:
			return "LATIN CAPITAL LETTER I WITH MACRON";
		case 299:
			return "LATIN SMALL LETTER I WITH MACRON";
		case 300:
			return "LATIN CAPITAL LETTER I WITH BREVE";
		case 301:
			return "LATIN SMALL LETTER I WITH BREVE";
		case 302:
			return "LATIN CAPITAL LETTER I WITH OGONEK";
		case 303:
			return "LATIN SMALL LETTER I WITH OGONEK";
		case 304:
			return "LATIN CAPITAL LETTER I WITH DOT ABOVE";
		case 305:
			return "LATIN SMALL LETTER DOTLESS I";
		case 306:
			return "LATIN CAPITAL LIGATURE IJ";
		case 307:
			return "LATIN SMALL LIGATURE IJ";
		case 308:
			return "LATIN CAPITAL LETTER J WITH CIRCUMFLEX";
		case 309:
			return "LATIN SMALL LETTER J WITH CIRCUMFLEX";
		case 310:
			return "LATIN CAPITAL LETTER K WITH CEDILLA";
		case 311:
			return "LATIN SMALL LETTER K WITH CEDILLA";
		case 312:
			return "LATIN SMALL LETTER KRA";
		case 313:
			return "LATIN CAPITAL LETTER L WITH ACUTE";
		case 314:
			return "LATIN SMALL LETTER L WITH ACUTE";
		case 315:
			return "LATIN CAPITAL LETTER L WITH CEDILLA";
		case 316:
			return "LATIN SMALL LETTER L WITH CEDILLA";
		case 317:
			return "LATIN CAPITAL LETTER L WITH CARON";
		case 318:
			return "LATIN SMALL LETTER L WITH CARON";
		case 319:
			return "LATIN CAPITAL LETTER L WITH MIDDLE DOT";
		case 320:
			return "LATIN SMALL LETTER L WITH MIDDLE DOT";
		case 321:
			return "LATIN CAPITAL LETTER L WITH STROKE";
		case 322:
			return "LATIN SMALL LETTER L WITH STROKE";
		case 323:
			return "LATIN CAPITAL LETTER N WITH ACUTE";
		case 324:
			return "LATIN SMALL LETTER N WITH ACUTE";
		case 325:
			return "LATIN CAPITAL LETTER N WITH CEDILLA";
		case 326:
			return "LATIN SMALL LETTER N WITH CEDILLA";
		case 327:
			return "LATIN CAPITAL LETTER N WITH CARON";
		case 328:
			return "LATIN SMALL LETTER N WITH CARON";
		case 329:
			return "LATIN SMALL LETTER N PRECEDED BY APOSTROPHE";
		case 330:
			return "LATIN CAPITAL LETTER ENG";
		case 331:
			return "LATIN SMALL LETTER ENG";
		case 332:
			return "LATIN CAPITAL LETTER O WITH MACRON";
		case 333:
			return "LATIN SMALL LETTER O WITH MACRON";
		case 334:
			return "LATIN CAPITAL LETTER O WITH BREVE";
		case 335:
			return "LATIN SMALL LETTER O WITH BREVE";
		case 336:
			return "LATIN CAPITAL LETTER O WITH DOUBLE ACUTE";
		case 337:
			return "LATIN SMALL LETTER O WITH DOUBLE ACUTE";
		case 338:
			return "LATIN CAPITAL LIGATURE OE";
		case 339:
			return "LATIN SMALL LIGATURE OE";
		case 340:
			return "LATIN CAPITAL LETTER R WITH ACUTE";
		case 341:
			return "LATIN SMALL LETTER R WITH ACUTE";
		case 342:
			return "LATIN CAPITAL LETTER R WITH CEDILLA";
		case 343:
			return "LATIN SMALL LETTER R WITH CEDILLA";
		case 344:
			return "LATIN CAPITAL LETTER R WITH CARON";
		case 345:
			return "LATIN SMALL LETTER R WITH CARON";
		case 346:
			return "LATIN CAPITAL LETTER S WITH ACUTE";
		case 347:
			return "LATIN SMALL LETTER S WITH ACUTE";
		case 348:
			return "LATIN CAPITAL LETTER S WITH CIRCUMFLEX";
		case 349:
			return "LATIN SMALL LETTER S WITH CIRCUMFLEX";
		case 350:
			return "LATIN CAPITAL LETTER S WITH CEDILLA";
		case 351:
			return "LATIN SMALL LETTER S WITH CEDILLA";
		case 352:
			return "LATIN CAPITAL LETTER S WITH CARON";
		case 353:
			return "LATIN SMALL LETTER S WITH CARON";
		case 354:
			return "LATIN CAPITAL LETTER T WITH CEDILLA";
		case 355:
			return "LATIN SMALL LETTER T WITH CEDILLA";
		case 356:
			return "LATIN CAPITAL LETTER T WITH CARON";
		case 357:
			return "LATIN SMALL LETTER T WITH CARON";
		case 358:
			return "LATIN CAPITAL LETTER T WITH STROKE";
		case 359:
			return "LATIN SMALL LETTER T WITH STROKE";
		case 360:
			return "LATIN CAPITAL LETTER U WITH TILDE";
		case 361:
			return "LATIN SMALL LETTER U WITH TILDE";
		case 362:
			return "LATIN CAPITAL LETTER U WITH MACRON";
		case 363:
			return "LATIN SMALL LETTER U WITH MACRON";
		case 364:
			return "LATIN CAPITAL LETTER U WITH BREVE";
		case 365:
			return "LATIN SMALL LETTER U WITH BREVE";
		case 366:
			return "LATIN CAPITAL LETTER U WITH RING ABOVE";
		case 367:
			return "LATIN SMALL LETTER U WITH RING ABOVE";
		case 368:
			return "LATIN CAPITAL LETTER U WITH DOUBLE ACUTE";
		case 369:
			return "LATIN SMALL LETTER U WITH DOUBLE ACUTE";
		case 370:
			return "LATIN CAPITAL LETTER U WITH OGONEK";
		case 371:
			return "LATIN SMALL LETTER U WITH OGONEK";
		case 372:
			return "LATIN CAPITAL LETTER W WITH CIRCUMFLEX";
		case 373:
			return "LATIN SMALL LETTER W WITH CIRCUMFLEX";
		case 374:
			return "LATIN CAPITAL LETTER Y WITH CIRCUMFLEX";
		case 375:
			return "LATIN SMALL LETTER Y WITH CIRCUMFLEX";
		case 376:
			return "LATIN CAPITAL LETTER Y WITH DIAERESIS";
		case 377:
			return "LATIN CAPITAL LETTER Z WITH ACUTE";
		case 378:
			return "LATIN SMALL LETTER Z WITH ACUTE";
		case 379:
			return "LATIN CAPITAL LETTER Z WITH DOT ABOVE";
		case 380:
			return "LATIN SMALL LETTER Z WITH DOT ABOVE";
		case 381:
			return "LATIN CAPITAL LETTER Z WITH CARON";
		case 382:
			return "LATIN SMALL LETTER Z WITH CARON";
		case 383:
			return "LATIN SMALL LETTER LONG S";
		case 384:
			return "LATIN SMALL LETTER B WITH STROKE";
		case 385:
			return "LATIN CAPITAL LETTER B WITH HOOK";
		case 386:
			return "LATIN CAPITAL LETTER B WITH TOPBAR";
		case 387:
			return "LATIN SMALL LETTER B WITH TOPBAR";
		case 388:
			return "LATIN CAPITAL LETTER TONE SIX";
		case 389:
			return "LATIN SMALL LETTER TONE SIX";
		case 390:
			return "LATIN CAPITAL LETTER OPEN O";
		case 391:
			return "LATIN CAPITAL LETTER C WITH HOOK";
		case 392:
			return "LATIN SMALL LETTER C WITH HOOK";
		case 393:
			return "LATIN CAPITAL LETTER AFRICAN D";
		case 394:
			return "LATIN CAPITAL LETTER D WITH HOOK";
		case 395:
			return "LATIN CAPITAL LETTER D WITH TOPBAR";
		case 396:
			return "LATIN SMALL LETTER D WITH TOPBAR";
		case 397:
			return "LATIN SMALL LETTER TURNED DELTA";
		case 398:
			return "LATIN CAPITAL LETTER REVERSED E";
		case 399:
			return "LATIN CAPITAL LETTER SCHWA";
		case 400:
			return "LATIN CAPITAL LETTER OPEN E";
		case 401:
			return "LATIN CAPITAL LETTER F WITH HOOK";
		case 402:
			return "LATIN SMALL LETTER F WITH HOOK";
		case 403:
			return "LATIN CAPITAL LETTER G WITH HOOK";
		case 404:
			return "LATIN CAPITAL LETTER GAMMA";
		case 405:
			return "LATIN SMALL LETTER HV";
		case 406:
			return "LATIN CAPITAL LETTER IOTA";
		case 407:
			return "LATIN CAPITAL LETTER I WITH STROKE";
		case 408:
			return "LATIN CAPITAL LETTER K WITH HOOK";
		case 409:
			return "LATIN SMALL LETTER K WITH HOOK";
		case 410:
			return "LATIN SMALL LETTER L WITH BAR";
		case 411:
			return "LATIN SMALL LETTER LAMBDA WITH STROKE";
		case 412:
			return "LATIN CAPITAL LETTER TURNED M";
		case 413:
			return "LATIN CAPITAL LETTER N WITH LEFT HOOK";
		case 414:
			return "LATIN SMALL LETTER N WITH LONG RIGHT LEG";
		case 415:
			return "LATIN CAPITAL LETTER O WITH MIDDLE TILDE";
		case 416:
			return "LATIN CAPITAL LETTER O WITH HORN";
		case 417:
			return "LATIN SMALL LETTER O WITH HORN";
		case 418:
			return "LATIN CAPITAL LETTER OI";
		case 419:
			return "LATIN SMALL LETTER OI";
		case 420:
			return "LATIN CAPITAL LETTER P WITH HOOK";
		case 421:
			return "LATIN SMALL LETTER P WITH HOOK";
		case 422:
			return "LATIN LETTER YR";
		case 423:
			return "LATIN CAPITAL LETTER TONE TWO";
		case 424:
			return "LATIN SMALL LETTER TONE TWO";
		case 425:
			return "LATIN CAPITAL LETTER ESH";
		case 426:
			return "LATIN LETTER REVERSED ESH LOOP";
		case 427:
			return "LATIN SMALL LETTER T WITH PALATAL HOOK";
		case 428:
			return "LATIN CAPITAL LETTER T WITH HOOK";
		case 429:
			return "LATIN SMALL LETTER T WITH HOOK";
		case 430:
			return "LATIN CAPITAL LETTER T WITH RETROFLEX HOOK";
		case 431:
			return "LATIN CAPITAL LETTER U WITH HORN";
		case 432:
			return "LATIN SMALL LETTER U WITH HORN";
		case 433:
			return "LATIN CAPITAL LETTER UPSILON";
		case 434:
			return "LATIN CAPITAL LETTER V WITH HOOK";
		case 435:
			return "LATIN CAPITAL LETTER Y WITH HOOK";
		case 436:
			return "LATIN SMALL LETTER Y WITH HOOK";
		case 437:
			return "LATIN CAPITAL LETTER Z WITH STROKE";
		case 438:
			return "LATIN SMALL LETTER Z WITH STROKE";
		case 439:
			return "LATIN CAPITAL LETTER EZH";
		case 440:
			return "LATIN CAPITAL LETTER EZH REVERSED";
		case 441:
			return "LATIN SMALL LETTER EZH REVERSED";
		case 442:
			return "LATIN SMALL LETTER EZH WITH TAIL";
		case 443:
			return "LATIN LETTER TWO WITH STROKE";
		case 444:
			return "LATIN CAPITAL LETTER TONE FIVE";
		case 445:
			return "LATIN SMALL LETTER TONE FIVE";
		case 446:
			return "LATIN LETTER INVERTED GLOTTAL STOP WITH STROKE";
		case 447:
			return "LATIN LETTER WYNN";
		case 448:
			return "LATIN LETTER DENTAL CLICK";
		case 449:
			return "LATIN LETTER LATERAL CLICK";
		case 450:
			return "LATIN LETTER ALVEOLAR CLICK";
		case 451:
			return "LATIN LETTER RETROFLEX CLICK";
		case 452:
			return "LATIN CAPITAL LETTER DZ WITH CARON";
		case 453:
			return "LATIN CAPITAL LETTER D WITH SMALL LETTER Z WITH CARON";
		case 454:
			return "LATIN SMALL LETTER DZ WITH CARON";
		case 455:
			return "LATIN CAPITAL LETTER LJ";
		case 456:
			return "LATIN CAPITAL LETTER L WITH SMALL LETTER J";
		case 457:
			return "LATIN SMALL LETTER LJ";
		case 458:
			return "LATIN CAPITAL LETTER NJ";
		case 459:
			return "LATIN CAPITAL LETTER N WITH SMALL LETTER J";
		case 460:
			return "LATIN SMALL LETTER NJ";
		case 461:
			return "LATIN CAPITAL LETTER A WITH CARON";
		case 462:
			return "LATIN SMALL LETTER A WITH CARON";
		case 463:
			return "LATIN CAPITAL LETTER I WITH CARON";
		case 464:
			return "LATIN SMALL LETTER I WITH CARON";
		case 465:
			return "LATIN CAPITAL LETTER O WITH CARON";
		case 466:
			return "LATIN SMALL LETTER O WITH CARON";
		case 467:
			return "LATIN CAPITAL LETTER U WITH CARON";
		case 468:
			return "LATIN SMALL LETTER U WITH CARON";
		case 469:
			return "LATIN CAPITAL LETTER U WITH DIAERESIS AND MACRON";
		case 470:
			return "LATIN SMALL LETTER U WITH DIAERESIS AND MACRON";
		case 471:
			return "LATIN CAPITAL LETTER U WITH DIAERESIS AND ACUTE";
		case 472:
			return "LATIN SMALL LETTER U WITH DIAERESIS AND ACUTE";
		case 473:
			return "LATIN CAPITAL LETTER U WITH DIAERESIS AND CARON";
		case 474:
			return "LATIN SMALL LETTER U WITH DIAERESIS AND CARON";
		case 475:
			return "LATIN CAPITAL LETTER U WITH DIAERESIS AND GRAVE";
		case 476:
			return "LATIN SMALL LETTER U WITH DIAERESIS AND GRAVE";
		case 477:
			return "LATIN SMALL LETTER TURNED E";
		case 478:
			return "LATIN CAPITAL LETTER A WITH DIAERESIS AND MACRON";
		case 479:
			return "LATIN SMALL LETTER A WITH DIAERESIS AND MACRON";
		case 480:
			return "LATIN CAPITAL LETTER A WITH DOT ABOVE AND MACRON";
		case 481:
			return "LATIN SMALL LETTER A WITH DOT ABOVE AND MACRON";
		case 482:
			return "LATIN CAPITAL LETTER AE WITH MACRON";
		case 483:
			return "LATIN SMALL LETTER AE WITH MACRON";
		case 484:
			return "LATIN CAPITAL LETTER G WITH STROKE";
		case 485:
			return "LATIN SMALL LETTER G WITH STROKE";
		case 486:
			return "LATIN CAPITAL LETTER G WITH CARON";
		case 487:
			return "LATIN SMALL LETTER G WITH CARON";
		case 488:
			return "LATIN CAPITAL LETTER K WITH CARON";
		case 489:
			return "LATIN SMALL LETTER K WITH CARON";
		case 490:
			return "LATIN CAPITAL LETTER O WITH OGONEK";
		case 491:
			return "LATIN SMALL LETTER O WITH OGONEK";
		case 492:
			return "LATIN CAPITAL LETTER O WITH OGONEK AND MACRON";
		case 493:
			return "LATIN SMALL LETTER O WITH OGONEK AND MACRON";
		case 494:
			return "LATIN CAPITAL LETTER EZH WITH CARON";
		case 495:
			return "LATIN SMALL LETTER EZH WITH CARON";
		case 496:
			return "LATIN SMALL LETTER J WITH CARON";
		case 497:
			return "LATIN CAPITAL LETTER DZ";
		case 498:
			return "LATIN CAPITAL LETTER D WITH SMALL LETTER Z";
		case 499:
			return "LATIN SMALL LETTER DZ";
		case 500:
			return "LATIN CAPITAL LETTER G WITH ACUTE";
		case 501:
			return "LATIN SMALL LETTER G WITH ACUTE";
		case 502:
			return "LATIN CAPITAL LETTER HWAIR";
		case 503:
			return "LATIN CAPITAL LETTER WYNN";
		case 504:
			return "LATIN CAPITAL LETTER N WITH GRAVE";
		case 505:
			return "LATIN SMALL LETTER N WITH GRAVE";
		case 506:
			return "LATIN CAPITAL LETTER A WITH RING ABOVE AND ACUTE";
		case 507:
			return "LATIN SMALL LETTER A WITH RING ABOVE AND ACUTE";
		case 508:
			return "LATIN CAPITAL LETTER AE WITH ACUTE";
		case 509:
			return "LATIN SMALL LETTER AE WITH ACUTE";
		case 510:
			return "LATIN CAPITAL LETTER O WITH STROKE AND ACUTE";
		case 511:
			return "LATIN SMALL LETTER O WITH STROKE AND ACUTE";
		case 512:
			return "LATIN CAPITAL LETTER A WITH DOUBLE GRAVE";
		case 513:
			return "LATIN SMALL LETTER A WITH DOUBLE GRAVE";
		case 514:
			return "LATIN CAPITAL LETTER A WITH INVERTED BREVE";
		case 515:
			return "LATIN SMALL LETTER A WITH INVERTED BREVE";
		case 516:
			return "LATIN CAPITAL LETTER E WITH DOUBLE GRAVE";
		case 517:
			return "LATIN SMALL LETTER E WITH DOUBLE GRAVE";
		case 518:
			return "LATIN CAPITAL LETTER E WITH INVERTED BREVE";
		case 519:
			return "LATIN SMALL LETTER E WITH INVERTED BREVE";
		case 520:
			return "LATIN CAPITAL LETTER I WITH DOUBLE GRAVE";
		case 521:
			return "LATIN SMALL LETTER I WITH DOUBLE GRAVE";
		case 522:
			return "LATIN CAPITAL LETTER I WITH INVERTED BREVE";
		case 523:
			return "LATIN SMALL LETTER I WITH INVERTED BREVE";
		case 524:
			return "LATIN CAPITAL LETTER O WITH DOUBLE GRAVE";
		case 525:
			return "LATIN SMALL LETTER O WITH DOUBLE GRAVE";
		case 526:
			return "LATIN CAPITAL LETTER O WITH INVERTED BREVE";
		case 527:
			return "LATIN SMALL LETTER O WITH INVERTED BREVE";
		case 528:
			return "LATIN CAPITAL LETTER R WITH DOUBLE GRAVE";
		case 529:
			return "LATIN SMALL LETTER R WITH DOUBLE GRAVE";
		case 530:
			return "LATIN CAPITAL LETTER R WITH INVERTED BREVE";
		case 531:
			return "LATIN SMALL LETTER R WITH INVERTED BREVE";
		case 532:
			return "LATIN CAPITAL LETTER U WITH DOUBLE GRAVE";
		case 533:
			return "LATIN SMALL LETTER U WITH DOUBLE GRAVE";
		case 534:
			return "LATIN CAPITAL LETTER U WITH INVERTED BREVE";
		case 535:
			return "LATIN SMALL LETTER U WITH INVERTED BREVE";
		case 536:
			return "LATIN CAPITAL LETTER S WITH COMMA BELOW";
		case 537:
			return "LATIN SMALL LETTER S WITH COMMA BELOW";
		case 538:
			return "LATIN CAPITAL LETTER T WITH COMMA BELOW";
		case 539:
			return "LATIN SMALL LETTER T WITH COMMA BELOW";
		case 540:
			return "LATIN CAPITAL LETTER YOGH";
		case 541:
			return "LATIN SMALL LETTER YOGH";
		case 542:
			return "LATIN CAPITAL LETTER H WITH CARON";
		case 543:
			return "LATIN SMALL LETTER H WITH CARON";
		case 544:
			return "LATIN CAPITAL LETTER N WITH LONG RIGHT LEG";
		case 545:
			return "LATIN SMALL LETTER D WITH CURL";
		case 546:
			return "LATIN CAPITAL LETTER OU";
		case 547:
			return "LATIN SMALL LETTER OU";
		case 548:
			return "LATIN CAPITAL LETTER Z WITH HOOK";
		case 549:
			return "LATIN SMALL LETTER Z WITH HOOK";
		case 550:
			return "LATIN CAPITAL LETTER A WITH DOT ABOVE";
		case 551:
			return "LATIN SMALL LETTER A WITH DOT ABOVE";
		case 552:
			return "LATIN CAPITAL LETTER E WITH CEDILLA";
		case 553:
			return "LATIN SMALL LETTER E WITH CEDILLA";
		case 554:
			return "LATIN CAPITAL LETTER O WITH DIAERESIS AND MACRON";
		case 555:
			return "LATIN SMALL LETTER O WITH DIAERESIS AND MACRON";
		case 556:
			return "LATIN CAPITAL LETTER O WITH TILDE AND MACRON";
		case 557:
			return "LATIN SMALL LETTER O WITH TILDE AND MACRON";
		case 558:
			return "LATIN CAPITAL LETTER O WITH DOT ABOVE";
		case 559:
			return "LATIN SMALL LETTER O WITH DOT ABOVE";
		case 560:
			return "LATIN CAPITAL LETTER O WITH DOT ABOVE AND MACRON";
		case 561:
			return "LATIN SMALL LETTER O WITH DOT ABOVE AND MACRON";
		case 562:
			return "LATIN CAPITAL LETTER Y WITH MACRON";
		case 563:
			return "LATIN SMALL LETTER Y WITH MACRON";
		case 564:
			return "LATIN SMALL LETTER L WITH CURL";
		case 565:
			return "LATIN SMALL LETTER N WITH CURL";
		case 566:
			return "LATIN SMALL LETTER T WITH CURL";
		case 567:
			return "LATIN SMALL LETTER DOTLESS J";
		case 568:
			return "LATIN SMALL LETTER DB DIGRAPH";
		case 569:
			return "LATIN SMALL LETTER QP DIGRAPH";
		case 570:
			return "LATIN CAPITAL LETTER A WITH STROKE";
		case 571:
			return "LATIN CAPITAL LETTER C WITH STROKE";
		case 572:
			return "LATIN SMALL LETTER C WITH STROKE";
		case 573:
			return "LATIN CAPITAL LETTER L WITH BAR";
		case 574:
			return "LATIN CAPITAL LETTER T WITH DIAGONAL STROKE";
		case 575:
			return "LATIN SMALL LETTER S WITH SWASH TAIL";
		case 576:
			return "LATIN SMALL LETTER Z WITH SWASH TAIL";
		case 577:
			return "LATIN CAPITAL LETTER GLOTTAL STOP";
		case 578:
			return "LATIN SMALL LETTER GLOTTAL STOP";
		case 579:
			return "LATIN CAPITAL LETTER B WITH STROKE";
		case 580:
			return "LATIN CAPITAL LETTER U BAR";
		case 581:
			return "LATIN CAPITAL LETTER TURNED V";
		case 582:
			return "LATIN CAPITAL LETTER E WITH STROKE";
		case 583:
			return "LATIN SMALL LETTER E WITH STROKE";
		case 584:
			return "LATIN CAPITAL LETTER J WITH STROKE";
		case 585:
			return "LATIN SMALL LETTER J WITH STROKE";
		case 586:
			return "LATIN CAPITAL LETTER SMALL Q WITH HOOK TAIL";
		case 587:
			return "LATIN SMALL LETTER Q WITH HOOK TAIL";
		case 588:
			return "LATIN CAPITAL LETTER R WITH STROKE";
		case 589:
			return "LATIN SMALL LETTER R WITH STROKE";
		case 590:
			return "LATIN CAPITAL LETTER Y WITH STROKE";
		case 591:
			return "LATIN SMALL LETTER Y WITH STROKE";
		case 592:
			return "LATIN SMALL LETTER TURNED A";
		case 593:
			return "LATIN SMALL LETTER ALPHA";
		case 594:
			return "LATIN SMALL LETTER TURNED ALPHA";
		case 595:
			return "LATIN SMALL LETTER B WITH HOOK";
		case 596:
			return "LATIN SMALL LETTER OPEN O";
		case 597:
			return "LATIN SMALL LETTER C WITH CURL";
		case 598:
			return "LATIN SMALL LETTER D WITH TAIL";
		case 599:
			return "LATIN SMALL LETTER D WITH HOOK";
		case 600:
			return "LATIN SMALL LETTER REVERSED E";
		case 601:
			return "LATIN SMALL LETTER SCHWA";
		case 602:
			return "LATIN SMALL LETTER SCHWA WITH HOOK";
		case 603:
			return "LATIN SMALL LETTER OPEN E";
		case 604:
			return "LATIN SMALL LETTER REVERSED OPEN E";
		case 605:
			return "LATIN SMALL LETTER REVERSED OPEN E WITH HOOK";
		case 606:
			return "LATIN SMALL LETTER CLOSED REVERSED OPEN E";
		case 607:
			return "LATIN SMALL LETTER DOTLESS J WITH STROKE";
		case 608:
			return "LATIN SMALL LETTER G WITH HOOK";
		case 609:
			return "LATIN SMALL LETTER SCRIPT G";
		case 610:
			return "LATIN LETTER SMALL CAPITAL G";
		case 611:
			return "LATIN SMALL LETTER GAMMA";
		case 612:
			return "LATIN SMALL LETTER RAMS HORN";
		case 613:
			return "LATIN SMALL LETTER TURNED H";
		case 614:
			return "LATIN SMALL LETTER H WITH HOOK";
		case 615:
			return "LATIN SMALL LETTER HENG WITH HOOK";
		case 616:
			return "LATIN SMALL LETTER I WITH STROKE";
		case 617:
			return "LATIN SMALL LETTER IOTA";
		case 618:
			return "LATIN LETTER SMALL CAPITAL I";
		case 619:
			return "LATIN SMALL LETTER L WITH MIDDLE TILDE";
		case 620:
			return "LATIN SMALL LETTER L WITH BELT";
		case 621:
			return "LATIN SMALL LETTER L WITH RETROFLEX HOOK";
		case 622:
			return "LATIN SMALL LETTER LEZH";
		case 623:
			return "LATIN SMALL LETTER TURNED M";
		case 624:
			return "LATIN SMALL LETTER TURNED M WITH LONG LEG";
		case 625:
			return "LATIN SMALL LETTER M WITH HOOK";
		case 626:
			return "LATIN SMALL LETTER N WITH LEFT HOOK";
		case 627:
			return "LATIN SMALL LETTER N WITH RETROFLEX HOOK";
		case 628:
			return "LATIN LETTER SMALL CAPITAL N";
		case 629:
			return "LATIN SMALL LETTER BARRED O";
		case 630:
			return "LATIN LETTER SMALL CAPITAL OE";
		case 631:
			return "LATIN SMALL LETTER CLOSED OMEGA";
		case 632:
			return "LATIN SMALL LETTER PHI";
		case 633:
			return "LATIN SMALL LETTER TURNED R";
		case 634:
			return "LATIN SMALL LETTER TURNED R WITH LONG LEG";
		case 635:
			return "LATIN SMALL LETTER TURNED R WITH HOOK";
		case 636:
			return "LATIN SMALL LETTER R WITH LONG LEG";
		case 637:
			return "LATIN SMALL LETTER R WITH TAIL";
		case 638:
			return "LATIN SMALL LETTER R WITH FISHHOOK";
		case 639:
			return "LATIN SMALL LETTER REVERSED R WITH FISHHOOK";
		case 640:
			return "LATIN LETTER SMALL CAPITAL R";
		case 641:
			return "LATIN LETTER SMALL CAPITAL INVERTED R";
		case 642:
			return "LATIN SMALL LETTER S WITH HOOK";
		case 643:
			return "LATIN SMALL LETTER ESH";
		case 644:
			return "LATIN SMALL LETTER DOTLESS J WITH STROKE AND HOOK";
		case 645:
			return "LATIN SMALL LETTER SQUAT REVERSED ESH";
		case 646:
			return "LATIN SMALL LETTER ESH WITH CURL";
		case 647:
			return "LATIN SMALL LETTER TURNED T";
		case 648:
			return "LATIN SMALL LETTER T WITH RETROFLEX HOOK";
		case 649:
			return "LATIN SMALL LETTER U BAR";
		case 650:
			return "LATIN SMALL LETTER UPSILON";
		case 651:
			return "LATIN SMALL LETTER V WITH HOOK";
		case 652:
			return "LATIN SMALL LETTER TURNED V";
		case 653:
			return "LATIN SMALL LETTER TURNED W";
		case 654:
			return "LATIN SMALL LETTER TURNED Y";
		case 655:
			return "LATIN LETTER SMALL CAPITAL Y";
		case 656:
			return "LATIN SMALL LETTER Z WITH RETROFLEX HOOK";
		case 657:
			return "LATIN SMALL LETTER Z WITH CURL";
		case 658:
			return "LATIN SMALL LETTER EZH";
		case 659:
			return "LATIN SMALL LETTER EZH WITH CURL";
		case 660:
			return "LATIN LETTER GLOTTAL STOP";
		case 661:
			return "LATIN LETTER PHARYNGEAL VOICED FRICATIVE";
		case 662:
			return "LATIN LETTER INVERTED GLOTTAL STOP";
		case 663:
			return "LATIN LETTER STRETCHED C";
		case 664:
			return "LATIN LETTER BILABIAL CLICK";
		case 665:
			return "LATIN LETTER SMALL CAPITAL B";
		case 666:
			return "LATIN SMALL LETTER CLOSED OPEN E";
		case 667:
			return "LATIN LETTER SMALL CAPITAL G WITH HOOK";
		case 668:
			return "LATIN LETTER SMALL CAPITAL H";
		case 669:
			return "LATIN SMALL LETTER J WITH CROSSED-TAIL";
		case 670:
			return "LATIN SMALL LETTER TURNED K";
		case 671:
			return "LATIN LETTER SMALL CAPITAL L";
		case 672:
			return "LATIN SMALL LETTER Q WITH HOOK";
		case 673:
			return "LATIN LETTER GLOTTAL STOP WITH STROKE";
		case 674:
			return "LATIN LETTER REVERSED GLOTTAL STOP WITH STROKE";
		case 675:
			return "LATIN SMALL LETTER DZ DIGRAPH";
		case 676:
			return "LATIN SMALL LETTER DEZH DIGRAPH";
		case 677:
			return "LATIN SMALL LETTER DZ DIGRAPH WITH CURL";
		case 678:
			return "LATIN SMALL LETTER TS DIGRAPH";
		case 679:
			return "LATIN SMALL LETTER TESH DIGRAPH";
		case 680:
			return "LATIN SMALL LETTER TC DIGRAPH WITH CURL";
		case 681:
			return "LATIN SMALL LETTER FENG DIGRAPH";
		case 682:
			return "LATIN SMALL LETTER LS DIGRAPH";
		case 683:
			return "LATIN SMALL LETTER LZ DIGRAPH";
		case 684:
			return "LATIN LETTER BILABIAL PERCUSSIVE";
		case 685:
			return "LATIN LETTER BIDENTAL PERCUSSIVE";
		case 686:
			return "LATIN SMALL LETTER TURNED H WITH FISHHOOK";
		case 687:
			return "LATIN SMALL LETTER TURNED H WITH FISHHOOK AND TAIL";
		case 688:
			return "MODIFIER LETTER SMALL H";
		case 689:
			return "MODIFIER LETTER SMALL H WITH HOOK";
		case 690:
			return "MODIFIER LETTER SMALL J";
		case 691:
			return "MODIFIER LETTER SMALL R";
		case 692:
			return "MODIFIER LETTER SMALL TURNED R";
		case 693:
			return "MODIFIER LETTER SMALL TURNED R WITH HOOK";
		case 694:
			return "MODIFIER LETTER SMALL CAPITAL INVERTED R";
		case 695:
			return "MODIFIER LETTER SMALL W";
		case 696:
			return "MODIFIER LETTER SMALL Y";
		case 697:
			return "MODIFIER LETTER PRIME";
		case 698:
			return "MODIFIER LETTER DOUBLE PRIME";
		case 699:
			return "MODIFIER LETTER TURNED COMMA";
		case 700:
			return "MODIFIER LETTER APOSTROPHE";
		case 701:
			return "MODIFIER LETTER REVERSED COMMA";
		case 702:
			return "MODIFIER LETTER RIGHT HALF RING";
		case 703:
			return "MODIFIER LETTER LEFT HALF RING";
		case 704:
			return "MODIFIER LETTER GLOTTAL STOP";
		case 705:
			return "MODIFIER LETTER REVERSED GLOTTAL STOP";
		case 706:
			return "MODIFIER LETTER LEFT ARROWHEAD";
		case 707:
			return "MODIFIER LETTER RIGHT ARROWHEAD";
		case 708:
			return "MODIFIER LETTER UP ARROWHEAD";
		case 709:
			return "MODIFIER LETTER DOWN ARROWHEAD";
		case 710:
			return "MODIFIER LETTER CIRCUMFLEX ACCENT";
		case 711:
			return "CARON";
		case 712:
			return "MODIFIER LETTER VERTICAL LINE";
		case 713:
			return "MODIFIER LETTER MACRON";
		case 714:
			return "MODIFIER LETTER ACUTE ACCENT";
		case 715:
			return "MODIFIER LETTER GRAVE ACCENT";
		case 716:
			return "MODIFIER LETTER LOW VERTICAL LINE";
		case 717:
			return "MODIFIER LETTER LOW MACRON";
		case 718:
			return "MODIFIER LETTER LOW GRAVE ACCENT";
		case 719:
			return "MODIFIER LETTER LOW ACUTE ACCENT";
		case 720:
			return "MODIFIER LETTER TRIANGULAR COLON";
		case 721:
			return "MODIFIER LETTER HALF TRIANGULAR COLON";
		case 722:
			return "MODIFIER LETTER CENTRED RIGHT HALF RING";
		case 723:
			return "MODIFIER LETTER CENTRED LEFT HALF RING";
		case 724:
			return "MODIFIER LETTER UP TACK";
		case 725:
			return "MODIFIER LETTER DOWN TACK";
		case 726:
			return "MODIFIER LETTER PLUS SIGN";
		case 727:
			return "MODIFIER LETTER MINUS SIGN";
		case 728:
			return "BREVE";
		case 729:
			return "DOT ABOVE";
		case 730:
			return "RING ABOVE";
		case 731:
			return "OGONEK";
		case 732:
			return "SMALL TILDE";
		case 733:
			return "DOUBLE ACUTE ACCENT";
		case 734:
			return "MODIFIER LETTER RHOTIC HOOK";
		case 735:
			return "MODIFIER LETTER CROSS ACCENT";
		case 736:
			return "MODIFIER LETTER SMALL GAMMA";
		case 737:
			return "MODIFIER LETTER SMALL L";
		case 738:
			return "MODIFIER LETTER SMALL S";
		case 739:
			return "MODIFIER LETTER SMALL X";
		case 740:
			return "MODIFIER LETTER SMALL REVERSED GLOTTAL STOP";
		case 741:
			return "MODIFIER LETTER EXTRA-HIGH TONE BAR";
		case 742:
			return "MODIFIER LETTER HIGH TONE BAR";
		case 743:
			return "MODIFIER LETTER MID TONE BAR";
		case 744:
			return "MODIFIER LETTER LOW TONE BAR";
		case 745:
			return "MODIFIER LETTER EXTRA-LOW TONE BAR";
		case 746:
			return "MODIFIER LETTER YIN DEPARTING TONE MARK";
		case 747:
			return "MODIFIER LETTER YANG DEPARTING TONE MARK";
		case 748:
			return "MODIFIER LETTER VOICING";
		case 749:
			return "MODIFIER LETTER UNASPIRATED";
		case 750:
			return "MODIFIER LETTER DOUBLE APOSTROPHE";
		case 751:
			return "MODIFIER LETTER LOW DOWN ARROWHEAD";
		case 752:
			return "MODIFIER LETTER LOW UP ARROWHEAD";
		case 753:
			return "MODIFIER LETTER LOW LEFT ARROWHEAD";
		case 754:
			return "MODIFIER LETTER LOW RIGHT ARROWHEAD";
		case 755:
			return "MODIFIER LETTER LOW RING";
		case 756:
			return "MODIFIER LETTER MIDDLE GRAVE ACCENT";
		case 757:
			return "MODIFIER LETTER MIDDLE DOUBLE GRAVE ACCENT";
		case 758:
			return "MODIFIER LETTER MIDDLE DOUBLE ACUTE ACCENT";
		case 759:
			return "MODIFIER LETTER LOW TILDE";
		case 760:
			return "MODIFIER LETTER RAISED COLON";
		case 761:
			return "MODIFIER LETTER BEGIN HIGH TONE";
		case 762:
			return "MODIFIER LETTER END HIGH TONE";
		case 763:
			return "MODIFIER LETTER BEGIN LOW TONE";
		case 764:
			return "MODIFIER LETTER END LOW TONE";
		case 765:
			return "MODIFIER LETTER SHELF";
		case 766:
			return "MODIFIER LETTER OPEN SHELF";
		case 767:
			return "MODIFIER LETTER LOW LEFT ARROW";
		case 880:
			return "GREEK CAPITAL LETTER HETA";
		case 881:
			return "GREEK SMALL LETTER HETA";
		case 882:
			return "GREEK CAPITAL LETTER ARCHAIC SAMPI";
		case 883:
			return "GREEK SMALL LETTER ARCHAIC SAMPI";
		case 886:
			return "GREEK CAPITAL LETTER PAMPHYLIAN DIGAMMA";
		case 887:
			return "GREEK SMALL LETTER PAMPHYLIAN DIGAMMA";
		case 890:
			return "GREEK YPOGEGRAMMENI";
		case 891:
			return "GREEK SMALL REVERSED LUNATE SIGMA SYMBOL";
		case 892:
			return "GREEK SMALL DOTTED LUNATE SIGMA SYMBOL";
		case 893:
			return "GREEK SMALL REVERSED DOTTED LUNATE SIGMA SYMBOL";
		case 894:
			return "GREEK QUESTION MARK";
		case 895:
			return "GREEK CAPITAL LETTER YOT";
		case 902:
			return "GREEK CAPITAL LETTER ALPHA WITH TONOS";
		case 904:
			return "GREEK CAPITAL LETTER EPSILON WITH TONOS";
		case 905:
			return "GREEK CAPITAL LETTER ETA WITH TONOS";
		case 906:
			return "GREEK CAPITAL LETTER IOTA WITH TONOS";
		case 908:
			return "GREEK CAPITAL LETTER OMICRON WITH TONOS";
		case 910:
			return "GREEK CAPITAL LETTER UPSILON WITH TONOS";
		case 911:
			return "GREEK CAPITAL LETTER OMEGA WITH TONOS";
		case 912:
			return "GREEK SMALL LETTER IOTA WITH DIALYTIKA AND TONOS";
		case 913:
			return "GREEK CAPITAL LETTER ALPHA";
		case 914:
			return "GREEK CAPITAL LETTER BETA";
		case 915:
			return "GREEK CAPITAL LETTER GAMMA";
		case 916:
			return "GREEK CAPITAL LETTER DELTA";
		case 917:
			return "GREEK CAPITAL LETTER EPSILON";
		case 918:
			return "GREEK CAPITAL LETTER ZETA";
		case 919:
			return "GREEK CAPITAL LETTER ETA";
		case 920:
			return "GREEK CAPITAL LETTER THETA";
		case 921:
			return "GREEK CAPITAL LETTER IOTA";
		case 922:
			return "GREEK CAPITAL LETTER KAPPA";
		case 923:
			return "GREEK CAPITAL LETTER LAMDA";
		case 924:
			return "GREEK CAPITAL LETTER MU";
		case 925:
			return "GREEK CAPITAL LETTER NU";
		case 926:
			return "GREEK CAPITAL LETTER XI";
		case 927:
			return "GREEK CAPITAL LETTER OMICRON";
		case 928:
			return "GREEK CAPITAL LETTER PI";
		case 929:
			return "GREEK CAPITAL LETTER RHO";
		case 931:
			return "GREEK CAPITAL LETTER SIGMA";
		case 932:
			return "GREEK CAPITAL LETTER TAU";
		case 933:
			return "GREEK CAPITAL LETTER UPSILON";
		case 934:
			return "GREEK CAPITAL LETTER PHI";
		case 935:
			return "GREEK CAPITAL LETTER CHI";
		case 936:
			return "GREEK CAPITAL LETTER PSI";
		case 937:
			return "GREEK CAPITAL LETTER OMEGA";
		case 938:
			return "GREEK CAPITAL LETTER IOTA WITH DIALYTIKA";
		case 939:
			return "GREEK CAPITAL LETTER UPSILON WITH DIALYTIKA";
		case 940:
			return "GREEK SMALL LETTER ALPHA WITH TONOS";
		case 941:
			return "GREEK SMALL LETTER EPSILON WITH TONOS";
		case 942:
			return "GREEK SMALL LETTER ETA WITH TONOS";
		case 943:
			return "GREEK SMALL LETTER IOTA WITH TONOS";
		case 944:
			return "GREEK SMALL LETTER UPSILON WITH DIALYTIKA AND TONOS";
		case 945:
			return "GREEK SMALL LETTER ALPHA";
		case 946:
			return "GREEK SMALL LETTER BETA";
		case 947:
			return "GREEK SMALL LETTER GAMMA";
		case 948:
			return "GREEK SMALL LETTER DELTA";
		case 949:
			return "GREEK SMALL LETTER EPSILON";
		case 950:
			return "GREEK SMALL LETTER ZETA";
		case 951:
			return "GREEK SMALL LETTER ETA";
		case 952:
			return "GREEK SMALL LETTER THETA";
		case 953:
			return "GREEK SMALL LETTER IOTA";
		case 954:
			return "GREEK SMALL LETTER KAPPA";
		case 955:
			return "GREEK SMALL LETTER LAMDA";
		case 956:
			return "GREEK SMALL LETTER MU";
		case 957:
			return "GREEK SMALL LETTER NU";
		case 958:
			return "GREEK SMALL LETTER XI";
		case 959:
			return "GREEK SMALL LETTER OMICRON";
		case 960:
			return "GREEK SMALL LETTER PI";
		case 961:
			return "GREEK SMALL LETTER RHO";
		case 962:
			return "GREEK SMALL LETTER FINAL SIGMA";
		case 963:
			return "GREEK SMALL LETTER SIGMA";
		case 964:
			return "GREEK SMALL LETTER TAU";
		case 965:
			return "GREEK SMALL LETTER UPSILON";
		case 966:
			return "GREEK SMALL LETTER PHI";
		case 967:
			return "GREEK SMALL LETTER CHI";
		case 968:
			return "GREEK SMALL LETTER PSI";
		case 969:
			return "GREEK SMALL LETTER OMEGA";
		case 970:
			return "GREEK SMALL LETTER IOTA WITH DIALYTIKA";
		case 971:
			return "GREEK SMALL LETTER UPSILON WITH DIALYTIKA";
		case 972:
			return "GREEK SMALL LETTER OMICRON WITH TONOS";
		case 973:
			return "GREEK SMALL LETTER UPSILON WITH TONOS";
		case 974:
			return "GREEK SMALL LETTER OMEGA WITH TONOS";
		case 975:
			return "GREEK CAPITAL KAI SYMBOL";
		case 976:
			return "GREEK BETA SYMBOL";
		case 977:
			return "GREEK THETA SYMBOL";
		case 978:
			return "GREEK UPSILON WITH HOOK SYMBOL";
		case 979:
			return "GREEK UPSILON WITH ACUTE AND HOOK SYMBOL";
		case 980:
			return "GREEK UPSILON WITH DIAERESIS AND HOOK SYMBOL";
		case 981:
			return "GREEK PHI SYMBOL";
		case 982:
			return "GREEK PI SYMBOL";
		case 983:
			return "GREEK KAI SYMBOL";
		case 984:
			return "GREEK LETTER ARCHAIC KOPPA";
		case 985:
			return "GREEK SMALL LETTER ARCHAIC KOPPA";
		case 986:
			return "GREEK LETTER STIGMA";
		case 987:
			return "GREEK SMALL LETTER STIGMA";
		case 988:
			return "GREEK LETTER DIGAMMA";
		case 989:
			return "GREEK SMALL LETTER DIGAMMA";
		case 990:
			return "GREEK LETTER KOPPA";
		case 991:
			return "GREEK SMALL LETTER KOPPA";
		case 992:
			return "GREEK LETTER SAMPI";
		case 993:
			return "GREEK SMALL LETTER SAMPI";
		case 994:
			return "COPTIC CAPITAL LETTER SHEI";
		case 995:
			return "COPTIC SMALL LETTER SHEI";
		case 996:
			return "COPTIC CAPITAL LETTER FEI";
		case 997:
			return "COPTIC SMALL LETTER FEI";
		case 998:
			return "COPTIC CAPITAL LETTER KHEI";
		case 999:
			return "COPTIC SMALL LETTER KHEI";
		case 1000:
			return "COPTIC CAPITAL LETTER HORI";
		case 1001:
			return "COPTIC SMALL LETTER HORI";
		case 1002:
			return "COPTIC CAPITAL LETTER GANGIA";
		case 1003:
			return "COPTIC SMALL LETTER GANGIA";
		case 1004:
			return "COPTIC CAPITAL LETTER SHIMA";
		case 1005:
			return "COPTIC SMALL LETTER SHIMA";
		case 1006:
			return "COPTIC CAPITAL LETTER DEI";
		case 1007:
			return "COPTIC SMALL LETTER DEI";
		case 1008:
			return "GREEK KAPPA SYMBOL";
		case 1009:
			return "GREEK RHO SYMBOL";
		case 1010:
			return "GREEK LUNATE SIGMA SYMBOL";
		case 1011:
			return "GREEK LETTER YOT";
		case 1012:
			return "GREEK CAPITAL THETA SYMBOL";
		case 1013:
			return "GREEK LUNATE EPSILON SYMBOL";
		case 1014:
			return "GREEK REVERSED LUNATE EPSILON SYMBOL";
		case 1015:
			return "GREEK CAPITAL LETTER SHO";
		case 1016:
			return "GREEK SMALL LETTER SHO";
		case 1017:
			return "GREEK CAPITAL LUNATE SIGMA SYMBOL";
		case 1018:
			return "GREEK CAPITAL LETTER SAN";
		case 1019:
			return "GREEK SMALL LETTER SAN";
		case 1020:
			return "GREEK RHO WITH STROKE SYMBOL";
		case 1021:
			return "GREEK CAPITAL REVERSED LUNATE SIGMA SYMBOL";
		case 1022:
			return "GREEK CAPITAL DOTTED LUNATE SIGMA SYMBOL";
		case 1023:
			return "GREEK CAPITAL REVERSED DOTTED LUNATE SIGMA SYMBOL";
		case 1024:
			return "CYRILLIC CAPITAL LETTER IE WITH GRAVE";
		case 1025:
			return "CYRILLIC CAPITAL LETTER IO";
		case 1026:
			return "CYRILLIC CAPITAL LETTER DJE";
		case 1027:
			return "CYRILLIC CAPITAL LETTER GJE";
		case 1028:
			return "CYRILLIC CAPITAL LETTER UKRAINIAN IE";
		case 1029:
			return "CYRILLIC CAPITAL LETTER DZE";
		case 1030:
			return "CYRILLIC CAPITAL LETTER BYELORUSSIAN-UKRAINIAN I";
		case 1031:
			return "CYRILLIC CAPITAL LETTER YI";
		case 1032:
			return "CYRILLIC CAPITAL LETTER JE";
		case 1033:
			return "CYRILLIC CAPITAL LETTER LJE";
		case 1034:
			return "CYRILLIC CAPITAL LETTER NJE";
		case 1035:
			return "CYRILLIC CAPITAL LETTER TSHE";
		case 1036:
			return "CYRILLIC CAPITAL LETTER KJE";
		case 1037:
			return "CYRILLIC CAPITAL LETTER I WITH GRAVE";
		case 1038:
			return "CYRILLIC CAPITAL LETTER SHORT U";
		case 1039:
			return "CYRILLIC CAPITAL LETTER DZHE";
		case 1040:
			return "CYRILLIC CAPITAL LETTER A";
		case 1041:
			return "CYRILLIC CAPITAL LETTER BE";
		case 1042:
			return "CYRILLIC CAPITAL LETTER VE";
		case 1043:
			return "CYRILLIC CAPITAL LETTER GHE";
		case 1044:
			return "CYRILLIC CAPITAL LETTER DE";
		case 1045:
			return "CYRILLIC CAPITAL LETTER IE";
		case 1046:
			return "CYRILLIC CAPITAL LETTER ZHE";
		case 1047:
			return "CYRILLIC CAPITAL LETTER ZE";
		case 1048:
			return "CYRILLIC CAPITAL LETTER I";
		case 1049:
			return "CYRILLIC CAPITAL LETTER SHORT I";
		case 1050:
			return "CYRILLIC CAPITAL LETTER KA";
		case 1051:
			return "CYRILLIC CAPITAL LETTER EL";
		case 1052:
			return "CYRILLIC CAPITAL LETTER EM";
		case 1053:
			return "CYRILLIC CAPITAL LETTER EN";
		case 1054:
			return "CYRILLIC CAPITAL LETTER O";
		case 1055:
			return "CYRILLIC CAPITAL LETTER PE";
		case 1056:
			return "CYRILLIC CAPITAL LETTER ER";
		case 1057:
			return "CYRILLIC CAPITAL LETTER ES";
		case 1058:
			return "CYRILLIC CAPITAL LETTER TE";
		case 1059:
			return "CYRILLIC CAPITAL LETTER U";
		case 1060:
			return "CYRILLIC CAPITAL LETTER EF";
		case 1061:
			return "CYRILLIC CAPITAL LETTER HA";
		case 1062:
			return "CYRILLIC CAPITAL LETTER TSE";
		case 1063:
			return "CYRILLIC CAPITAL LETTER CHE";
		case 1064:
			return "CYRILLIC CAPITAL LETTER SHA";
		case 1065:
			return "CYRILLIC CAPITAL LETTER SHCHA";
		case 1066:
			return "CYRILLIC CAPITAL LETTER HARD SIGN";
		case 1067:
			return "CYRILLIC CAPITAL LETTER YERU";
		case 1068:
			return "CYRILLIC CAPITAL LETTER SOFT SIGN";
		case 1069:
			return "CYRILLIC CAPITAL LETTER E";
		case 1070:
			return "CYRILLIC CAPITAL LETTER YU";
		case 1071:
			return "CYRILLIC CAPITAL LETTER YA";
		case 1072:
			return "CYRILLIC SMALL LETTER A";
		case 1073:
			return "CYRILLIC SMALL LETTER BE";
		case 1074:
			return "CYRILLIC SMALL LETTER VE";
		case 1075:
			return "CYRILLIC SMALL LETTER GHE";
		case 1076:
			return "CYRILLIC SMALL LETTER DE";
		case 1077:
			return "CYRILLIC SMALL LETTER IE";
		case 1078:
			return "CYRILLIC SMALL LETTER ZHE";
		case 1079:
			return "CYRILLIC SMALL LETTER ZE";
		case 1080:
			return "CYRILLIC SMALL LETTER I";
		case 1081:
			return "CYRILLIC SMALL LETTER SHORT I";
		case 1082:
			return "CYRILLIC SMALL LETTER KA";
		case 1083:
			return "CYRILLIC SMALL LETTER EL";
		case 1084:
			return "CYRILLIC SMALL LETTER EM";
		case 1085:
			return "CYRILLIC SMALL LETTER EN";
		case 1086:
			return "CYRILLIC SMALL LETTER O";
		case 1087:
			return "CYRILLIC SMALL LETTER PE";
		case 1088:
			return "CYRILLIC SMALL LETTER ER";
		case 1089:
			return "CYRILLIC SMALL LETTER ES";
		case 1090:
			return "CYRILLIC SMALL LETTER TE";
		case 1091:
			return "CYRILLIC SMALL LETTER U";
		case 1092:
			return "CYRILLIC SMALL LETTER EF";
		case 1093:
			return "CYRILLIC SMALL LETTER HA";
		case 1094:
			return "CYRILLIC SMALL LETTER TSE";
		case 1095:
			return "CYRILLIC SMALL LETTER CHE";
		case 1096:
			return "CYRILLIC SMALL LETTER SHA";
		case 1097:
			return "CYRILLIC SMALL LETTER SHCHA";
		case 1098:
			return "CYRILLIC SMALL LETTER HARD SIGN";
		case 1099:
			return "CYRILLIC SMALL LETTER YERU";
		case 1100:
			return "CYRILLIC SMALL LETTER SOFT SIGN";
		case 1101:
			return "CYRILLIC SMALL LETTER E";
		case 1102:
			return "CYRILLIC SMALL LETTER YU";
		case 1103:
			return "CYRILLIC SMALL LETTER YA";
		case 1104:
			return "CYRILLIC SMALL LETTER IE WITH GRAVE";
		case 1105:
			return "CYRILLIC SMALL LETTER IO";
		case 1106:
			return "CYRILLIC SMALL LETTER DJE";
		case 1107:
			return "CYRILLIC SMALL LETTER GJE";
		case 1108:
			return "CYRILLIC SMALL LETTER UKRAINIAN IE";
		case 1109:
			return "CYRILLIC SMALL LETTER DZE";
		case 1110:
			return "CYRILLIC SMALL LETTER BYELORUSSIAN-UKRAINIAN I";
		case 1111:
			return "CYRILLIC SMALL LETTER YI";
		case 1112:
			return "CYRILLIC SMALL LETTER JE";
		case 1113:
			return "CYRILLIC SMALL LETTER LJE";
		case 1114:
			return "CYRILLIC SMALL LETTER NJE";
		case 1115:
			return "CYRILLIC SMALL LETTER TSHE";
		case 1116:
			return "CYRILLIC SMALL LETTER KJE";
		case 1117:
			return "CYRILLIC SMALL LETTER I WITH GRAVE";
		case 1118:
			return "CYRILLIC SMALL LETTER SHORT U";
		case 1119:
			return "CYRILLIC SMALL LETTER DZHE";
		case 1120:
			return "CYRILLIC CAPITAL LETTER OMEGA";
		case 1121:
			return "CYRILLIC SMALL LETTER OMEGA";
		case 1122:
			return "CYRILLIC CAPITAL LETTER YAT";
		case 1123:
			return "CYRILLIC SMALL LETTER YAT";
		case 1124:
			return "CYRILLIC CAPITAL LETTER IOTIFIED E";
		case 1125:
			return "CYRILLIC SMALL LETTER IOTIFIED E";
		case 1126:
			return "CYRILLIC CAPITAL LETTER LITTLE YUS";
		case 1127:
			return "CYRILLIC SMALL LETTER LITTLE YUS";
		case 1128:
			return "CYRILLIC CAPITAL LETTER IOTIFIED LITTLE YUS";
		case 1129:
			return "CYRILLIC SMALL LETTER IOTIFIED LITTLE YUS";
		case 1130:
			return "CYRILLIC CAPITAL LETTER BIG YUS";
		case 1131:
			return "CYRILLIC SMALL LETTER BIG YUS";
		case 1132:
			return "CYRILLIC CAPITAL LETTER IOTIFIED BIG YUS";
		case 1133:
			return "CYRILLIC SMALL LETTER IOTIFIED BIG YUS";
		case 1134:
			return "CYRILLIC CAPITAL LETTER KSI";
		case 1135:
			return "CYRILLIC SMALL LETTER KSI";
		case 1136:
			return "CYRILLIC CAPITAL LETTER PSI";
		case 1137:
			return "CYRILLIC SMALL LETTER PSI";
		case 1138:
			return "CYRILLIC CAPITAL LETTER FITA";
		case 1139:
			return "CYRILLIC SMALL LETTER FITA";
		case 1140:
			return "CYRILLIC CAPITAL LETTER IZHITSA";
		case 1141:
			return "CYRILLIC SMALL LETTER IZHITSA";
		case 1142:
			return "CYRILLIC CAPITAL LETTER IZHITSA WITH DOUBLE GRAVE ACCENT";
		case 1143:
			return "CYRILLIC SMALL LETTER IZHITSA WITH DOUBLE GRAVE ACCENT";
		case 1144:
			return "CYRILLIC CAPITAL LETTER UK";
		case 1145:
			return "CYRILLIC SMALL LETTER UK";
		case 1146:
			return "CYRILLIC CAPITAL LETTER ROUND OMEGA";
		case 1147:
			return "CYRILLIC SMALL LETTER ROUND OMEGA";
		case 1148:
			return "CYRILLIC CAPITAL LETTER OMEGA WITH TITLO";
		case 1149:
			return "CYRILLIC SMALL LETTER OMEGA WITH TITLO";
		case 1150:
			return "CYRILLIC CAPITAL LETTER OT";
		case 1151:
			return "CYRILLIC SMALL LETTER OT";
		case 1152:
			return "CYRILLIC CAPITAL LETTER KOPPA";
		case 1153:
			return "CYRILLIC SMALL LETTER KOPPA";
		case 1154:
			return "CYRILLIC THOUSANDS SIGN";
		case 1162:
			return "CYRILLIC CAPITAL LETTER SHORT I WITH TAIL";
		case 1163:
			return "CYRILLIC SMALL LETTER SHORT I WITH TAIL";
		case 1164:
			return "CYRILLIC CAPITAL LETTER SEMISOFT SIGN";
		case 1165:
			return "CYRILLIC SMALL LETTER SEMISOFT SIGN";
		case 1166:
			return "CYRILLIC CAPITAL LETTER ER WITH TICK";
		case 1167:
			return "CYRILLIC SMALL LETTER ER WITH TICK";
		case 1168:
			return "CYRILLIC CAPITAL LETTER GHE WITH UPTURN";
		case 1169:
			return "CYRILLIC SMALL LETTER GHE WITH UPTURN";
		case 1170:
			return "CYRILLIC CAPITAL LETTER GHE WITH STROKE";
		case 1171:
			return "CYRILLIC SMALL LETTER GHE WITH STROKE";
		case 1172:
			return "CYRILLIC CAPITAL LETTER GHE WITH MIDDLE HOOK";
		case 1173:
			return "CYRILLIC SMALL LETTER GHE WITH MIDDLE HOOK";
		case 1174:
			return "CYRILLIC CAPITAL LETTER ZHE WITH DESCENDER";
		case 1175:
			return "CYRILLIC SMALL LETTER ZHE WITH DESCENDER";
		case 1176:
			return "CYRILLIC CAPITAL LETTER ZE WITH DESCENDER";
		case 1177:
			return "CYRILLIC SMALL LETTER ZE WITH DESCENDER";
		case 1178:
			return "CYRILLIC CAPITAL LETTER KA WITH DESCENDER";
		case 1179:
			return "CYRILLIC SMALL LETTER KA WITH DESCENDER";
		case 1180:
			return "CYRILLIC CAPITAL LETTER KA WITH VERTICAL STROKE";
		case 1181:
			return "CYRILLIC SMALL LETTER KA WITH VERTICAL STROKE";
		case 1182:
			return "CYRILLIC CAPITAL LETTER KA WITH STROKE";
		case 1183:
			return "CYRILLIC SMALL LETTER KA WITH STROKE";
		case 1184:
			return "CYRILLIC CAPITAL LETTER BASHKIR KA";
		case 1185:
			return "CYRILLIC SMALL LETTER BASHKIR KA";
		case 1186:
			return "CYRILLIC CAPITAL LETTER EN WITH DESCENDER";
		case 1187:
			return "CYRILLIC SMALL LETTER EN WITH DESCENDER";
		case 1188:
			return "CYRILLIC CAPITAL LIGATURE EN GHE";
		case 1189:
			return "CYRILLIC SMALL LIGATURE EN GHE";
		case 1190:
			return "CYRILLIC CAPITAL LETTER PE WITH MIDDLE HOOK";
		case 1191:
			return "CYRILLIC SMALL LETTER PE WITH MIDDLE HOOK";
		case 1192:
			return "CYRILLIC CAPITAL LETTER ABKHASIAN HA";
		case 1193:
			return "CYRILLIC SMALL LETTER ABKHASIAN HA";
		case 1194:
			return "CYRILLIC CAPITAL LETTER ES WITH DESCENDER";
		case 1195:
			return "CYRILLIC SMALL LETTER ES WITH DESCENDER";
		case 1196:
			return "CYRILLIC CAPITAL LETTER TE WITH DESCENDER";
		case 1197:
			return "CYRILLIC SMALL LETTER TE WITH DESCENDER";
		case 1198:
			return "CYRILLIC CAPITAL LETTER STRAIGHT U";
		case 1199:
			return "CYRILLIC SMALL LETTER STRAIGHT U";
		case 1200:
			return "CYRILLIC CAPITAL LETTER STRAIGHT U WITH STROKE";
		case 1201:
			return "CYRILLIC SMALL LETTER STRAIGHT U WITH STROKE";
		case 1202:
			return "CYRILLIC CAPITAL LETTER HA WITH DESCENDER";
		case 1203:
			return "CYRILLIC SMALL LETTER HA WITH DESCENDER";
		case 1204:
			return "CYRILLIC CAPITAL LIGATURE TE TSE";
		case 1205:
			return "CYRILLIC SMALL LIGATURE TE TSE";
		case 1206:
			return "CYRILLIC CAPITAL LETTER CHE WITH DESCENDER";
		case 1207:
			return "CYRILLIC SMALL LETTER CHE WITH DESCENDER";
		case 1208:
			return "CYRILLIC CAPITAL LETTER CHE WITH VERTICAL STROKE";
		case 1209:
			return "CYRILLIC SMALL LETTER CHE WITH VERTICAL STROKE";
		case 1210:
			return "CYRILLIC CAPITAL LETTER SHHA";
		case 1211:
			return "CYRILLIC SMALL LETTER SHHA";
		case 1212:
			return "CYRILLIC CAPITAL LETTER ABKHASIAN CHE";
		case 1213:
			return "CYRILLIC SMALL LETTER ABKHASIAN CHE";
		case 1214:
			return "CYRILLIC CAPITAL LETTER ABKHASIAN CHE WITH DESCENDER";
		case 1215:
			return "CYRILLIC SMALL LETTER ABKHASIAN CHE WITH DESCENDER";
		case 1216:
			return "CYRILLIC LETTER PALOCHKA";
		case 1217:
			return "CYRILLIC CAPITAL LETTER ZHE WITH BREVE";
		case 1218:
			return "CYRILLIC SMALL LETTER ZHE WITH BREVE";
		case 1219:
			return "CYRILLIC CAPITAL LETTER KA WITH HOOK";
		case 1220:
			return "CYRILLIC SMALL LETTER KA WITH HOOK";
		case 1221:
			return "CYRILLIC CAPITAL LETTER EL WITH TAIL";
		case 1222:
			return "CYRILLIC SMALL LETTER EL WITH TAIL";
		case 1223:
			return "CYRILLIC CAPITAL LETTER EN WITH HOOK";
		case 1224:
			return "CYRILLIC SMALL LETTER EN WITH HOOK";
		case 1225:
			return "CYRILLIC CAPITAL LETTER EN WITH TAIL";
		case 1226:
			return "CYRILLIC SMALL LETTER EN WITH TAIL";
		case 1227:
			return "CYRILLIC CAPITAL LETTER KHAKASSIAN CHE";
		case 1228:
			return "CYRILLIC SMALL LETTER KHAKASSIAN CHE";
		case 1229:
			return "CYRILLIC CAPITAL LETTER EM WITH TAIL";
		case 1230:
			return "CYRILLIC SMALL LETTER EM WITH TAIL";
		case 1231:
			return "CYRILLIC SMALL LETTER PALOCHKA";
		case 1232:
			return "CYRILLIC CAPITAL LETTER A WITH BREVE";
		case 1233:
			return "CYRILLIC SMALL LETTER A WITH BREVE";
		case 1234:
			return "CYRILLIC CAPITAL LETTER A WITH DIAERESIS";
		case 1235:
			return "CYRILLIC SMALL LETTER A WITH DIAERESIS";
		case 1236:
			return "CYRILLIC CAPITAL LIGATURE A IE";
		case 1237:
			return "CYRILLIC SMALL LIGATURE A IE";
		case 1238:
			return "CYRILLIC CAPITAL LETTER IE WITH BREVE";
		case 1239:
			return "CYRILLIC SMALL LETTER IE WITH BREVE";
		case 1240:
			return "CYRILLIC CAPITAL LETTER SCHWA";
		case 1241:
			return "CYRILLIC SMALL LETTER SCHWA";
		case 1242:
			return "CYRILLIC CAPITAL LETTER SCHWA WITH DIAERESIS";
		case 1243:
			return "CYRILLIC SMALL LETTER SCHWA WITH DIAERESIS";
		case 1244:
			return "CYRILLIC CAPITAL LETTER ZHE WITH DIAERESIS";
		case 1245:
			return "CYRILLIC SMALL LETTER ZHE WITH DIAERESIS";
		case 1246:
			return "CYRILLIC CAPITAL LETTER ZE WITH DIAERESIS";
		case 1247:
			return "CYRILLIC SMALL LETTER ZE WITH DIAERESIS";
		case 1248:
			return "CYRILLIC CAPITAL LETTER ABKHASIAN DZE";
		case 1249:
			return "CYRILLIC SMALL LETTER ABKHASIAN DZE";
		case 1250:
			return "CYRILLIC CAPITAL LETTER I WITH MACRON";
		case 1251:
			return "CYRILLIC SMALL LETTER I WITH MACRON";
		case 1252:
			return "CYRILLIC CAPITAL LETTER I WITH DIAERESIS";
		case 1253:
			return "CYRILLIC SMALL LETTER I WITH DIAERESIS";
		case 1254:
			return "CYRILLIC CAPITAL LETTER O WITH DIAERESIS";
		case 1255:
			return "CYRILLIC SMALL LETTER O WITH DIAERESIS";
		case 1256:
			return "CYRILLIC CAPITAL LETTER BARRED O";
		case 1257:
			return "CYRILLIC SMALL LETTER BARRED O";
		case 1258:
			return "CYRILLIC CAPITAL LETTER BARRED O WITH DIAERESIS";
		case 1259:
			return "CYRILLIC SMALL LETTER BARRED O WITH DIAERESIS";
		case 1260:
			return "CYRILLIC CAPITAL LETTER E WITH DIAERESIS";
		case 1261:
			return "CYRILLIC SMALL LETTER E WITH DIAERESIS";
		case 1262:
			return "CYRILLIC CAPITAL LETTER U WITH MACRON";
		case 1263:
			return "CYRILLIC SMALL LETTER U WITH MACRON";
		case 1264:
			return "CYRILLIC CAPITAL LETTER U WITH DIAERESIS";
		case 1265:
			return "CYRILLIC SMALL LETTER U WITH DIAERESIS";
		case 1266:
			return "CYRILLIC CAPITAL LETTER U WITH DOUBLE ACUTE";
		case 1267:
			return "CYRILLIC SMALL LETTER U WITH DOUBLE ACUTE";
		case 1268:
			return "CYRILLIC CAPITAL LETTER CHE WITH DIAERESIS";
		case 1269:
			return "CYRILLIC SMALL LETTER CHE WITH DIAERESIS";
		case 1270:
			return "CYRILLIC CAPITAL LETTER GHE WITH DESCENDER";
		case 1271:
			return "CYRILLIC SMALL LETTER GHE WITH DESCENDER";
		case 1272:
			return "CYRILLIC CAPITAL LETTER YERU WITH DIAERESIS";
		case 1273:
			return "CYRILLIC SMALL LETTER YERU WITH DIAERESIS";
		case 1274:
			return "CYRILLIC CAPITAL LETTER GHE WITH STROKE AND HOOK";
		case 1275:
			return "CYRILLIC SMALL LETTER GHE WITH STROKE AND HOOK";
		case 1276:
			return "CYRILLIC CAPITAL LETTER HA WITH HOOK";
		case 1277:
			return "CYRILLIC SMALL LETTER HA WITH HOOK";
		case 1278:
			return "CYRILLIC CAPITAL LETTER HA WITH STROKE";
		case 1279:
			return "CYRILLIC SMALL LETTER HA WITH STROKE";
		case 1280:
			return "CYRILLIC CAPITAL LETTER KOMI DE";
		case 1281:
			return "CYRILLIC SMALL LETTER KOMI DE";
		case 1282:
			return "CYRILLIC CAPITAL LETTER KOMI DJE";
		case 1283:
			return "CYRILLIC SMALL LETTER KOMI DJE";
		case 1284:
			return "CYRILLIC CAPITAL LETTER KOMI ZJE";
		case 1285:
			return "CYRILLIC SMALL LETTER KOMI ZJE";
		case 1286:
			return "CYRILLIC CAPITAL LETTER KOMI DZJE";
		case 1287:
			return "CYRILLIC SMALL LETTER KOMI DZJE";
		case 1288:
			return "CYRILLIC CAPITAL LETTER KOMI LJE";
		case 1289:
			return "CYRILLIC SMALL LETTER KOMI LJE";
		case 1290:
			return "CYRILLIC CAPITAL LETTER KOMI NJE";
		case 1291:
			return "CYRILLIC SMALL LETTER KOMI NJE";
		case 1292:
			return "CYRILLIC CAPITAL LETTER KOMI SJE";
		case 1293:
			return "CYRILLIC SMALL LETTER KOMI SJE";
		case 1294:
			return "CYRILLIC CAPITAL LETTER KOMI TJE";
		case 1295:
			return "CYRILLIC SMALL LETTER KOMI TJE";
		case 1296:
			return "CYRILLIC CAPITAL LETTER REVERSED ZE";
		case 1297:
			return "CYRILLIC SMALL LETTER REVERSED ZE";
		case 1298:
			return "CYRILLIC CAPITAL LETTER EL WITH HOOK";
		case 1299:
			return "CYRILLIC SMALL LETTER EL WITH HOOK";
		case 1300:
			return "CYRILLIC CAPITAL LETTER LHA";
		case 1301:
			return "CYRILLIC SMALL LETTER LHA";
		case 1302:
			return "CYRILLIC CAPITAL LETTER RHA";
		case 1303:
			return "CYRILLIC SMALL LETTER RHA";
		case 1304:
			return "CYRILLIC CAPITAL LETTER YAE";
		case 1305:
			return "CYRILLIC SMALL LETTER YAE";
		case 1306:
			return "CYRILLIC CAPITAL LETTER QA";
		case 1307:
			return "CYRILLIC SMALL LETTER QA";
		case 1308:
			return "CYRILLIC CAPITAL LETTER WE";
		case 1309:
			return "CYRILLIC SMALL LETTER WE";
		case 1310:
			return "CYRILLIC CAPITAL LETTER ALEUT KA";
		case 1311:
			return "CYRILLIC SMALL LETTER ALEUT KA";
		case 1312:
			return "CYRILLIC CAPITAL LETTER EL WITH MIDDLE HOOK";
		case 1313:
			return "CYRILLIC SMALL LETTER EL WITH MIDDLE HOOK";
		case 1314:
			return "CYRILLIC CAPITAL LETTER EN WITH MIDDLE HOOK";
		case 1315:
			return "CYRILLIC SMALL LETTER EN WITH MIDDLE HOOK";
		case 1316:
			return "CYRILLIC CAPITAL LETTER PE WITH DESCENDER";
		case 1317:
			return "CYRILLIC SMALL LETTER PE WITH DESCENDER";
		case 1318:
			return "CYRILLIC CAPITAL LETTER SHHA WITH DESCENDER";
		case 1319:
			return "CYRILLIC SMALL LETTER SHHA WITH DESCENDER";
		case 1320:
			return "CYRILLIC CAPITAL LETTER EN WITH LEFT HOOK";
		case 1321:
			return "CYRILLIC SMALL LETTER EN WITH LEFT HOOK";
		case 1322:
			return "CYRILLIC CAPITAL LETTER DZZHE";
		case 1323:
			return "CYRILLIC SMALL LETTER DZZHE";
		case 1324:
			return "CYRILLIC CAPITAL LETTER DCHE";
		case 1325:
			return "CYRILLIC SMALL LETTER DCHE";
		case 1326:
			return "CYRILLIC CAPITAL LETTER EL WITH DESCENDER";
		case 1327:
			return "CYRILLIC SMALL LETTER EL WITH DESCENDER";
		case 1329:
			return "ARMENIAN CAPITAL LETTER AYB";
		case 1330:
			return "ARMENIAN CAPITAL LETTER BEN";
		case 1331:
			return "ARMENIAN CAPITAL LETTER GIM";
		case 1332:
			return "ARMENIAN CAPITAL LETTER DA";
		case 1333:
			return "ARMENIAN CAPITAL LETTER ECH";
		case 1334:
			return "ARMENIAN CAPITAL LETTER ZA";
		case 1335:
			return "ARMENIAN CAPITAL LETTER EH";
		case 1336:
			return "ARMENIAN CAPITAL LETTER ET";
		case 1337:
			return "ARMENIAN CAPITAL LETTER TO";
		case 1338:
			return "ARMENIAN CAPITAL LETTER ZHE";
		case 1339:
			return "ARMENIAN CAPITAL LETTER INI";
		case 1340:
			return "ARMENIAN CAPITAL LETTER LIWN";
		case 1341:
			return "ARMENIAN CAPITAL LETTER XEH";
		case 1342:
			return "ARMENIAN CAPITAL LETTER CA";
		case 1343:
			return "ARMENIAN CAPITAL LETTER KEN";
		case 1344:
			return "ARMENIAN CAPITAL LETTER HO";
		case 1345:
			return "ARMENIAN CAPITAL LETTER JA";
		case 1346:
			return "ARMENIAN CAPITAL LETTER GHAD";
		case 1347:
			return "ARMENIAN CAPITAL LETTER CHEH";
		case 1348:
			return "ARMENIAN CAPITAL LETTER MEN";
		case 1349:
			return "ARMENIAN CAPITAL LETTER YI";
		case 1350:
			return "ARMENIAN CAPITAL LETTER NOW";
		case 1351:
			return "ARMENIAN CAPITAL LETTER SHA";
		case 1352:
			return "ARMENIAN CAPITAL LETTER VO";
		case 1353:
			return "ARMENIAN CAPITAL LETTER CHA";
		case 1354:
			return "ARMENIAN CAPITAL LETTER PEH";
		case 1355:
			return "ARMENIAN CAPITAL LETTER JHEH";
		case 1356:
			return "ARMENIAN CAPITAL LETTER RA";
		case 1357:
			return "ARMENIAN CAPITAL LETTER SEH";
		case 1358:
			return "ARMENIAN CAPITAL LETTER VEW";
		case 1359:
			return "ARMENIAN CAPITAL LETTER TIWN";
		case 1360:
			return "ARMENIAN CAPITAL LETTER REH";
		case 1361:
			return "ARMENIAN CAPITAL LETTER CO";
		case 1362:
			return "ARMENIAN CAPITAL LETTER YIWN";
		case 1363:
			return "ARMENIAN CAPITAL LETTER PIWR";
		case 1364:
			return "ARMENIAN CAPITAL LETTER KEH";
		case 1365:
			return "ARMENIAN CAPITAL LETTER OH";
		case 1366:
			return "ARMENIAN CAPITAL LETTER FEH";
		case 1377:
			return "ARMENIAN SMALL LETTER AYB";
		case 1378:
			return "ARMENIAN SMALL LETTER BEN";
		case 1379:
			return "ARMENIAN SMALL LETTER GIM";
		case 1380:
			return "ARMENIAN SMALL LETTER DA";
		case 1381:
			return "ARMENIAN SMALL LETTER ECH";
		case 1382:
			return "ARMENIAN SMALL LETTER ZA";
		case 1383:
			return "ARMENIAN SMALL LETTER EH";
		case 1384:
			return "ARMENIAN SMALL LETTER ET";
		case 1385:
			return "ARMENIAN SMALL LETTER TO";
		case 1386:
			return "ARMENIAN SMALL LETTER ZHE";
		case 1387:
			return "ARMENIAN SMALL LETTER INI";
		case 1388:
			return "ARMENIAN SMALL LETTER LIWN";
		case 1389:
			return "ARMENIAN SMALL LETTER XEH";
		case 1390:
			return "ARMENIAN SMALL LETTER CA";
		case 1391:
			return "ARMENIAN SMALL LETTER KEN";
		case 1392:
			return "ARMENIAN SMALL LETTER HO";
		case 1393:
			return "ARMENIAN SMALL LETTER JA";
		case 1394:
			return "ARMENIAN SMALL LETTER GHAD";
		case 1395:
			return "ARMENIAN SMALL LETTER CHEH";
		case 1396:
			return "ARMENIAN SMALL LETTER MEN";
		case 1397:
			return "ARMENIAN SMALL LETTER YI";
		case 1398:
			return "ARMENIAN SMALL LETTER NOW";
		case 1399:
			return "ARMENIAN SMALL LETTER SHA";
		case 1400:
			return "ARMENIAN SMALL LETTER VO";
		case 1401:
			return "ARMENIAN SMALL LETTER CHA";
		case 1402:
			return "ARMENIAN SMALL LETTER PEH";
		case 1403:
			return "ARMENIAN SMALL LETTER JHEH";
		case 1404:
			return "ARMENIAN SMALL LETTER RA";
		case 1405:
			return "ARMENIAN SMALL LETTER SEH";
		case 1406:
			return "ARMENIAN SMALL LETTER VEW";
		case 1407:
			return "ARMENIAN SMALL LETTER TIWN";
		case 1408:
			return "ARMENIAN SMALL LETTER REH";
		case 1409:
			return "ARMENIAN SMALL LETTER CO";
		case 1410:
			return "ARMENIAN SMALL LETTER YIWN";
		case 1411:
			return "ARMENIAN SMALL LETTER PIWR";
		case 1412:
			return "ARMENIAN SMALL LETTER KEH";
		case 1413:
			return "ARMENIAN SMALL LETTER OH";
		case 1414:
			return "ARMENIAN SMALL LETTER FEH";
		case 1415:
			return "ARMENIAN SMALL LIGATURE ECH YIWN";
		case 11360:
			return "LATIN CAPITAL LETTER L WITH DOUBLE BAR";
		case 11361:
			return "LATIN SMALL LETTER L WITH DOUBLE BAR";
		case 11362:
			return "LATIN CAPITAL LETTER L WITH MIDDLE TILDE";
		case 11363:
			return "LATIN CAPITAL LETTER P WITH STROKE";
		case 11364:
			return "LATIN CAPITAL LETTER R WITH TAIL";
		case 11365:
			return "LATIN SMALL LETTER A WITH STROKE";
		case 11366:
			return "LATIN SMALL LETTER T WITH DIAGONAL STROKE";
		case 11367:
			return "LATIN CAPITAL LETTER H WITH DESCENDER";
		case 11368:
			return "LATIN SMALL LETTER H WITH DESCENDER";
		case 11369:
			return "LATIN CAPITAL LETTER K WITH DESCENDER";
		case 11370:
			return "LATIN SMALL LETTER K WITH DESCENDER";
		case 11371:
			return "LATIN CAPITAL LETTER Z WITH DESCENDER";
		case 11372:
			return "LATIN SMALL LETTER Z WITH DESCENDER";
		case 11373:
			return "LATIN CAPITAL LETTER ALPHA";
		case 11374:
			return "LATIN CAPITAL LETTER M WITH HOOK";
		case 11375:
			return "LATIN CAPITAL LETTER TURNED A";
		case 11376:
			return "LATIN CAPITAL LETTER TURNED ALPHA";
		case 11377:
			return "LATIN SMALL LETTER V WITH RIGHT HOOK";
		case 11378:
			return "LATIN CAPITAL LETTER W WITH HOOK";
		case 11379:
			return "LATIN SMALL LETTER W WITH HOOK";
		case 11380:
			return "LATIN SMALL LETTER V WITH CURL";
		case 11381:
			return "LATIN CAPITAL LETTER HALF H";
		case 11382:
			return "LATIN SMALL LETTER HALF H";
		case 11383:
			return "LATIN SMALL LETTER TAILLESS PHI";
		case 11384:
			return "LATIN SMALL LETTER E WITH NOTCH";
		case 11385:
			return "LATIN SMALL LETTER TURNED R WITH TAIL";
		case 11386:
			return "LATIN SMALL LETTER O WITH LOW RING INSIDE";
		case 11387:
			return "LATIN LETTER SMALL CAPITAL TURNED E";
		case 11388:
			return "LATIN SUBSCRIPT SMALL LETTER J";
		case 11389:
			return "MODIFIER LETTER CAPITAL V";
		case 11390:
			return "LATIN CAPITAL LETTER S WITH SWASH TAIL";
		case 11391:
			return "LATIN CAPITAL LETTER Z WITH SWASH TAIL";
		case 42560:
			return "CYRILLIC CAPITAL LETTER ZEMLYA";
		case 42561:
			return "CYRILLIC SMALL LETTER ZEMLYA";
		case 42562:
			return "CYRILLIC CAPITAL LETTER DZELO";
		case 42563:
			return "CYRILLIC SMALL LETTER DZELO";
		case 42564:
			return "CYRILLIC CAPITAL LETTER REVERSED DZE";
		case 42565:
			return "CYRILLIC SMALL LETTER REVERSED DZE";
		case 42566:
			return "CYRILLIC CAPITAL LETTER IOTA";
		case 42567:
			return "CYRILLIC SMALL LETTER IOTA";
		case 42568:
			return "CYRILLIC CAPITAL LETTER DJERV";
		case 42569:
			return "CYRILLIC SMALL LETTER DJERV";
		case 42570:
			return "CYRILLIC CAPITAL LETTER MONOGRAPH UK";
		case 42571:
			return "CYRILLIC SMALL LETTER MONOGRAPH UK";
		case 42572:
			return "CYRILLIC CAPITAL LETTER BROAD OMEGA";
		case 42573:
			return "CYRILLIC SMALL LETTER BROAD OMEGA";
		case 42574:
			return "CYRILLIC CAPITAL LETTER NEUTRAL YER";
		case 42575:
			return "CYRILLIC SMALL LETTER NEUTRAL YER";
		case 42576:
			return "CYRILLIC CAPITAL LETTER YERU WITH BACK YER";
		case 42577:
			return "CYRILLIC SMALL LETTER YERU WITH BACK YER";
		case 42578:
			return "CYRILLIC CAPITAL LETTER IOTIFIED YAT";
		case 42579:
			return "CYRILLIC SMALL LETTER IOTIFIED YAT";
		case 42580:
			return "CYRILLIC CAPITAL LETTER REVERSED YU";
		case 42581:
			return "CYRILLIC SMALL LETTER REVERSED YU";
		case 42582:
			return "CYRILLIC CAPITAL LETTER IOTIFIED A";
		case 42583:
			return "CYRILLIC SMALL LETTER IOTIFIED A";
		case 42584:
			return "CYRILLIC CAPITAL LETTER CLOSED LITTLE YUS";
		case 42585:
			return "CYRILLIC SMALL LETTER CLOSED LITTLE YUS";
		case 42586:
			return "CYRILLIC CAPITAL LETTER BLENDED YUS";
		case 42587:
			return "CYRILLIC SMALL LETTER BLENDED YUS";
		case 42588:
			return "CYRILLIC CAPITAL LETTER IOTIFIED CLOSED LITTLE YUS";
		case 42589:
			return "CYRILLIC SMALL LETTER IOTIFIED CLOSED LITTLE YUS";
		case 42590:
			return "CYRILLIC CAPITAL LETTER YN";
		case 42591:
			return "CYRILLIC SMALL LETTER YN";
		case 42592:
			return "CYRILLIC CAPITAL LETTER REVERSED TSE";
		case 42593:
			return "CYRILLIC SMALL LETTER REVERSED TSE";
		case 42594:
			return "CYRILLIC CAPITAL LETTER SOFT DE";
		case 42595:
			return "CYRILLIC SMALL LETTER SOFT DE";
		case 42596:
			return "CYRILLIC CAPITAL LETTER SOFT EL";
		case 42597:
			return "CYRILLIC SMALL LETTER SOFT EL";
		case 42598:
			return "CYRILLIC CAPITAL LETTER SOFT EM";
		case 42599:
			return "CYRILLIC SMALL LETTER SOFT EM";
		case 42600:
			return "CYRILLIC CAPITAL LETTER MONOCULAR O";
		case 42601:
			return "CYRILLIC SMALL LETTER MONOCULAR O";
		case 42602:
			return "CYRILLIC CAPITAL LETTER BINOCULAR O";
		case 42603:
			return "CYRILLIC SMALL LETTER BINOCULAR O";
		case 42604:
			return "CYRILLIC CAPITAL LETTER DOUBLE MONOCULAR O";
		case 42605:
			return "CYRILLIC SMALL LETTER DOUBLE MONOCULAR O";
		case 42606:
			return "CYRILLIC LETTER MULTIOCULAR O";
		case 42624:
			return "CYRILLIC CAPITAL LETTER DWE";
		case 42625:
			return "CYRILLIC SMALL LETTER DWE";
		case 42626:
			return "CYRILLIC CAPITAL LETTER DZWE";
		case 42627:
			return "CYRILLIC SMALL LETTER DZWE";
		case 42628:
			return "CYRILLIC CAPITAL LETTER ZHWE";
		case 42629:
			return "CYRILLIC SMALL LETTER ZHWE";
		case 42630:
			return "CYRILLIC CAPITAL LETTER CCHE";
		case 42631:
			return "CYRILLIC SMALL LETTER CCHE";
		case 42632:
			return "CYRILLIC CAPITAL LETTER DZZE";
		case 42633:
			return "CYRILLIC SMALL LETTER DZZE";
		case 42634:
			return "CYRILLIC CAPITAL LETTER TE WITH MIDDLE HOOK";
		case 42635:
			return "CYRILLIC SMALL LETTER TE WITH MIDDLE HOOK";
		case 42636:
			return "CYRILLIC CAPITAL LETTER TWE";
		case 42637:
			return "CYRILLIC SMALL LETTER TWE";
		case 42638:
			return "CYRILLIC CAPITAL LETTER TSWE";
		case 42639:
			return "CYRILLIC SMALL LETTER TSWE";
		case 42640:
			return "CYRILLIC CAPITAL LETTER TSSE";
		case 42641:
			return "CYRILLIC SMALL LETTER TSSE";
		case 42642:
			return "CYRILLIC CAPITAL LETTER TCHE";
		case 42643:
			return "CYRILLIC SMALL LETTER TCHE";
		case 42644:
			return "CYRILLIC CAPITAL LETTER HWE";
		case 42645:
			return "CYRILLIC SMALL LETTER HWE";
		case 42646:
			return "CYRILLIC CAPITAL LETTER SHWE";
		case 42647:
			return "CYRILLIC SMALL LETTER SHWE";
		case 42648:
			return "CYRILLIC CAPITAL LETTER DOUBLE O";
		case 42649:
			return "CYRILLIC SMALL LETTER DOUBLE O";
		case 42650:
			return "CYRILLIC CAPITAL LETTER CROSSED O";
		case 42651:
			return "CYRILLIC SMALL LETTER CROSSED O";
		case 42786:
			return "LATIN CAPITAL LETTER EGYPTOLOGICAL ALEF";
		case 42787:
			return "LATIN SMALL LETTER EGYPTOLOGICAL ALEF";
		case 42788:
			return "LATIN CAPITAL LETTER EGYPTOLOGICAL AIN";
		case 42789:
			return "LATIN SMALL LETTER EGYPTOLOGICAL AIN";
		case 42790:
			return "LATIN CAPITAL LETTER HENG";
		case 42791:
			return "LATIN SMALL LETTER HENG";
		case 42792:
			return "LATIN CAPITAL LETTER TZ";
		case 42793:
			return "LATIN SMALL LETTER TZ";
		case 42794:
			return "LATIN CAPITAL LETTER TRESILLO";
		case 42795:
			return "LATIN SMALL LETTER TRESILLO";
		case 42796:
			return "LATIN CAPITAL LETTER CUATRILLO";
		case 42797:
			return "LATIN SMALL LETTER CUATRILLO";
		case 42798:
			return "LATIN CAPITAL LETTER CUATRILLO WITH COMMA";
		case 42799:
			return "LATIN SMALL LETTER CUATRILLO WITH COMMA";
		case 42800:
			return "LATIN LETTER SMALL CAPITAL F";
		case 42801:
			return "LATIN LETTER SMALL CAPITAL S";
		case 42802:
			return "LATIN CAPITAL LETTER AA";
		case 42803:
			return "LATIN SMALL LETTER AA";
		case 42804:
			return "LATIN CAPITAL LETTER AO";
		case 42805:
			return "LATIN SMALL LETTER AO";
		case 42806:
			return "LATIN CAPITAL LETTER AU";
		case 42807:
			return "LATIN SMALL LETTER AU";
		case 42808:
			return "LATIN CAPITAL LETTER AV";
		case 42809:
			return "LATIN SMALL LETTER AV";
		case 42810:
			return "LATIN CAPITAL LETTER AV WITH HORIZONTAL BAR";
		case 42811:
			return "LATIN SMALL LETTER AV WITH HORIZONTAL BAR";
		case 42812:
			return "LATIN CAPITAL LETTER AY";
		case 42813:
			return "LATIN SMALL LETTER AY";
		case 42814:
			return "LATIN CAPITAL LETTER REVERSED C WITH DOT";
		case 42815:
			return "LATIN SMALL LETTER REVERSED C WITH DOT";
		case 42816:
			return "LATIN CAPITAL LETTER K WITH STROKE";
		case 42817:
			return "LATIN SMALL LETTER K WITH STROKE";
		case 42818:
			return "LATIN CAPITAL LETTER K WITH DIAGONAL STROKE";
		case 42819:
			return "LATIN SMALL LETTER K WITH DIAGONAL STROKE";
		case 42820:
			return "LATIN CAPITAL LETTER K WITH STROKE AND DIAGONAL STROKE";
		case 42821:
			return "LATIN SMALL LETTER K WITH STROKE AND DIAGONAL STROKE";
		case 42822:
			return "LATIN CAPITAL LETTER BROKEN L";
		case 42823:
			return "LATIN SMALL LETTER BROKEN L";
		case 42824:
			return "LATIN CAPITAL LETTER L WITH HIGH STROKE";
		case 42825:
			return "LATIN SMALL LETTER L WITH HIGH STROKE";
		case 42826:
			return "LATIN CAPITAL LETTER O WITH LONG STROKE OVERLAY";
		case 42827:
			return "LATIN SMALL LETTER O WITH LONG STROKE OVERLAY";
		case 42828:
			return "LATIN CAPITAL LETTER O WITH LOOP";
		case 42829:
			return "LATIN SMALL LETTER O WITH LOOP";
		case 42830:
			return "LATIN CAPITAL LETTER OO";
		case 42831:
			return "LATIN SMALL LETTER OO";
		case 42832:
			return "LATIN CAPITAL LETTER P WITH STROKE THROUGH DESCENDER";
		case 42833:
			return "LATIN SMALL LETTER P WITH STROKE THROUGH DESCENDER";
		case 42834:
			return "LATIN CAPITAL LETTER P WITH FLOURISH";
		case 42835:
			return "LATIN SMALL LETTER P WITH FLOURISH";
		case 42836:
			return "LATIN CAPITAL LETTER P WITH SQUIRREL TAIL";
		case 42837:
			return "LATIN SMALL LETTER P WITH SQUIRREL TAIL";
		case 42838:
			return "LATIN CAPITAL LETTER Q WITH STROKE THROUGH DESCENDER";
		case 42839:
			return "LATIN SMALL LETTER Q WITH STROKE THROUGH DESCENDER";
		case 42840:
			return "LATIN CAPITAL LETTER Q WITH DIAGONAL STROKE";
		case 42841:
			return "LATIN SMALL LETTER Q WITH DIAGONAL STROKE";
		case 42842:
			return "LATIN CAPITAL LETTER R ROTUNDA";
		case 42843:
			return "LATIN SMALL LETTER R ROTUNDA";
		case 42844:
			return "LATIN CAPITAL LETTER RUM ROTUNDA";
		case 42845:
			return "LATIN SMALL LETTER RUM ROTUNDA";
		case 42846:
			return "LATIN CAPITAL LETTER V WITH DIAGONAL STROKE";
		case 42847:
			return "LATIN SMALL LETTER V WITH DIAGONAL STROKE";
		case 42848:
			return "LATIN CAPITAL LETTER VY";
		case 42849:
			return "LATIN SMALL LETTER VY";
		case 42850:
			return "LATIN CAPITAL LETTER VISIGOTHIC Z";
		case 42851:
			return "LATIN SMALL LETTER VISIGOTHIC Z";
		case 42852:
			return "LATIN CAPITAL LETTER THORN WITH STROKE";
		case 42853:
			return "LATIN SMALL LETTER THORN WITH STROKE";
		case 42854:
			return "LATIN CAPITAL LETTER THORN WITH STROKE THROUGH DESCENDER";
		case 42855:
			return "LATIN SMALL LETTER THORN WITH STROKE THROUGH DESCENDER";
		case 42856:
			return "LATIN CAPITAL LETTER VEND";
		case 42857:
			return "LATIN SMALL LETTER VEND";
		case 42858:
			return "LATIN CAPITAL LETTER ET";
		case 42859:
			return "LATIN SMALL LETTER ET";
		case 42860:
			return "LATIN CAPITAL LETTER IS";
		case 42861:
			return "LATIN SMALL LETTER IS";
		case 42862:
			return "LATIN CAPITAL LETTER CON";
		case 42863:
			return "LATIN SMALL LETTER CON";
		case 42864:
			return "MODIFIER LETTER US";
		case 42865:
			return "LATIN SMALL LETTER DUM";
		case 42866:
			return "LATIN SMALL LETTER LUM";
		case 42867:
			return "LATIN SMALL LETTER MUM";
		case 42868:
			return "LATIN SMALL LETTER NUM";
		case 42869:
			return "LATIN SMALL LETTER RUM";
		case 42870:
			return "LATIN LETTER SMALL CAPITAL RUM";
		case 42871:
			return "LATIN SMALL LETTER TUM";
		case 42872:
			return "LATIN SMALL LETTER UM";
		case 42873:
			return "LATIN CAPITAL LETTER INSULAR D";
		case 42874:
			return "LATIN SMALL LETTER INSULAR D";
		case 42875:
			return "LATIN CAPITAL LETTER INSULAR F";
		case 42876:
			return "LATIN SMALL LETTER INSULAR F";
		case 42877:
			return "LATIN CAPITAL LETTER INSULAR G";
		case 42878:
			return "LATIN CAPITAL LETTER TURNED INSULAR G";
		case 42879:
			return "LATIN SMALL LETTER TURNED INSULAR G";
		case 42880:
			return "LATIN CAPITAL LETTER TURNED L";
		case 42881:
			return "LATIN SMALL LETTER TURNED L";
		case 42882:
			return "LATIN CAPITAL LETTER INSULAR R";
		case 42883:
			return "LATIN SMALL LETTER INSULAR R";
		case 42884:
			return "LATIN CAPITAL LETTER INSULAR S";
		case 42885:
			return "LATIN SMALL LETTER INSULAR S";
		case 42886:
			return "LATIN CAPITAL LETTER INSULAR T";
		case 42887:
			return "LATIN SMALL LETTER INSULAR T";
		case 42891:
			return "LATIN CAPITAL LETTER SALTILLO";
		case 42892:
			return "LATIN SMALL LETTER SALTILLO";
		case 42893:
			return "LATIN CAPITAL LETTER TURNED H";
		case 42894:
			return "LATIN SMALL LETTER L WITH RETROFLEX HOOK AND BELT";
		case 42895:
			return "LATIN LETTER SINOLOGICAL DOT";
		case 42896:
			return "LATIN CAPITAL LETTER N WITH DESCENDER";
		case 42897:
			return "LATIN SMALL LETTER N WITH DESCENDER";
		case 42898:
			return "LATIN CAPITAL LETTER C WITH BAR";
		case 42899:
			return "LATIN SMALL LETTER C WITH BAR";
		case 42900:
			return "LATIN SMALL LETTER C WITH PALATAL HOOK";
		case 42901:
			return "LATIN SMALL LETTER H WITH PALATAL HOOK";
		case 42902:
			return "LATIN CAPITAL LETTER B WITH FLOURISH";
		case 42903:
			return "LATIN SMALL LETTER B WITH FLOURISH";
		case 42904:
			return "LATIN CAPITAL LETTER F WITH STROKE";
		case 42905:
			return "LATIN SMALL LETTER F WITH STROKE";
		case 42906:
			return "LATIN CAPITAL LETTER VOLAPUK AE";
		case 42907:
			return "LATIN SMALL LETTER VOLAPUK AE";
		case 42908:
			return "LATIN CAPITAL LETTER VOLAPUK OE";
		case 42909:
			return "LATIN SMALL LETTER VOLAPUK OE";
		case 42910:
			return "LATIN CAPITAL LETTER VOLAPUK UE";
		case 42911:
			return "LATIN SMALL LETTER VOLAPUK UE";
		case 42912:
			return "LATIN CAPITAL LETTER G WITH OBLIQUE STROKE";
		case 42913:
			return "LATIN SMALL LETTER G WITH OBLIQUE STROKE";
		case 42914:
			return "LATIN CAPITAL LETTER K WITH OBLIQUE STROKE";
		case 42915:
			return "LATIN SMALL LETTER K WITH OBLIQUE STROKE";
		case 42916:
			return "LATIN CAPITAL LETTER N WITH OBLIQUE STROKE";
		case 42917:
			return "LATIN SMALL LETTER N WITH OBLIQUE STROKE";
		case 42918:
			return "LATIN CAPITAL LETTER R WITH OBLIQUE STROKE";
		case 42919:
			return "LATIN SMALL LETTER R WITH OBLIQUE STROKE";
		case 42920:
			return "LATIN CAPITAL LETTER S WITH OBLIQUE STROKE";
		case 42921:
			return "LATIN SMALL LETTER S WITH OBLIQUE STROKE";
		case 42922:
			return "LATIN CAPITAL LETTER H WITH HOOK";
		case 42923:
			return "LATIN CAPITAL LETTER REVERSED OPEN E";
		case 42924:
			return "LATIN CAPITAL LETTER SCRIPT G";
		case 42925:
			return "LATIN CAPITAL LETTER L WITH BELT";
		case 42928:
			return "LATIN CAPITAL LETTER TURNED K";
		case 42929:
			return "LATIN CAPITAL LETTER TURNED T";
		case 42930:
			return "LATIN CAPITAL LETTER J WITH CROSSED-TAIL";
		case 42931:
			return "LATIN CAPITAL LETTER CHI";
		case 42932:
			return "LATIN CAPITAL LETTER BETA";
		case 42933:
			return "LATIN SMALL LETTER BETA";
		case 42934:
			return "LATIN CAPITAL LETTER OMEGA";
		case 42935:
			return "LATIN SMALL LETTER OMEGA";
		case 43824:
			return "LATIN SMALL LETTER BARRED ALPHA";
		case 43825:
			return "LATIN SMALL LETTER A REVERSED-SCHWA";
		case 43826:
			return "LATIN SMALL LETTER BLACKLETTER E";
		case 43827:
			return "LATIN SMALL LETTER BARRED E";
		case 43828:
			return "LATIN SMALL LETTER E WITH FLOURISH";
		case 43829:
			return "LATIN SMALL LETTER LENIS F";
		case 43830:
			return "LATIN SMALL LETTER SCRIPT G WITH CROSSED-TAIL";
		case 43831:
			return "LATIN SMALL LETTER L WITH INVERTED LAZY S";
		case 43832:
			return "LATIN SMALL LETTER L WITH DOUBLE MIDDLE TILDE";
		case 43833:
			return "LATIN SMALL LETTER L WITH MIDDLE RING";
		case 43834:
			return "LATIN SMALL LETTER M WITH CROSSED-TAIL";
		case 43835:
			return "LATIN SMALL LETTER N WITH CROSSED-TAIL";
		case 43836:
			return "LATIN SMALL LETTER ENG WITH CROSSED-TAIL";
		case 43837:
			return "LATIN SMALL LETTER BLACKLETTER O";
		case 43838:
			return "LATIN SMALL LETTER BLACKLETTER O WITH STROKE";
		case 43839:
			return "LATIN SMALL LETTER OPEN O WITH STROKE";
		case 43840:
			return "LATIN SMALL LETTER INVERTED OE";
		case 43841:
			return "LATIN SMALL LETTER TURNED OE WITH STROKE";
		case 43842:
			return "LATIN SMALL LETTER TURNED OE WITH HORIZONTAL STROKE";
		case 43843:
			return "LATIN SMALL LETTER TURNED O OPEN-O";
		case 43844:
			return "LATIN SMALL LETTER TURNED O OPEN-O WITH STROKE";
		case 43845:
			return "LATIN SMALL LETTER STIRRUP R";
		case 43846:
			return "LATIN LETTER SMALL CAPITAL R WITH RIGHT LEG";
		case 43847:
			return "LATIN SMALL LETTER R WITHOUT HANDLE";
		case 43848:
			return "LATIN SMALL LETTER DOUBLE R";
		case 43849:
			return "LATIN SMALL LETTER R WITH CROSSED-TAIL";
		case 43850:
			return "LATIN SMALL LETTER DOUBLE R WITH CROSSED-TAIL";
		case 43851:
			return "LATIN SMALL LETTER SCRIPT R";
		case 43852:
			return "LATIN SMALL LETTER SCRIPT R WITH RING";
		case 43853:
			return "LATIN SMALL LETTER BASELINE ESH";
		case 43854:
			return "LATIN SMALL LETTER U WITH SHORT RIGHT LEG";
		case 43855:
			return "LATIN SMALL LETTER U BAR WITH SHORT RIGHT LEG";
		case 43856:
			return "LATIN SMALL LETTER UI";
		case 43857:
			return "LATIN SMALL LETTER TURNED UI";
		case 43858:
			return "LATIN SMALL LETTER U WITH LEFT HOOK";
		case 43859:
			return "LATIN SMALL LETTER CHI";
		case 43860:
			return "LATIN SMALL LETTER CHI WITH LOW RIGHT RING";
		case 43861:
			return "LATIN SMALL LETTER CHI WITH LOW LEFT SERIF";
		case 43862:
			return "LATIN SMALL LETTER X WITH LOW RIGHT RING";
		case 43863:
			return "LATIN SMALL LETTER X WITH LONG LEFT LEG";
		case 43864:
			return "LATIN SMALL LETTER X WITH LONG LEFT LEG AND LOW RIGHT RING";
		case 43865:
			return "LATIN SMALL LETTER X WITH LONG LEFT LEG WITH SERIF";
		case 43866:
			return "LATIN SMALL LETTER Y WITH SHORT RIGHT LEG";
		case 43872:
			return "LATIN SMALL LETTER SAKHA YAT";
		case 43873:
			return "LATIN SMALL LETTER IOTIFIED E";
		case 43874:
			return "LATIN SMALL LETTER OPEN OE";
		case 43875:
			return "LATIN SMALL LETTER UO";
		case 43876:
			return "LATIN SMALL LETTER INVERTED ALPHA";
		case 43877:
			return "GREEK LETTER SMALL CAPITAL OMEGA";
		default:
			return "unknown?";
	}
}
