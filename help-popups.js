// Set counter for tooltips, thus giving each a unique ID and an ever-increasing z-index.
var zCounter = 1;
// Set up help tooltips as needed.
$(".help").click(function() {
	var info = $(this).find("span.info"), leftOffset, infoWidth, windowWidth, leftPosition, offsetObject, helpHTML, tooltipID;
	if($(this).hasClass("popOut")) {
		//
		// Handle tooltips from the Advanced Options.
		//
		tooltipID = $(this).attr("data-clicked");
		if(typeof tooltipID !== "undefined") {
			// data-clicked is defined? Then we've been clicked. Remove the tooltip.
			$("#" + tooltipID).remove();
			// Remove the stored info.
			$(this).removeAttr("data-clicked");
		} else {
			// data-clicked isn't defined? Then create a tooltip.
			// We can't simply show the tooltip box, since it's constrained by the flex container.
			offsetObject = $(this).offset();
			helpHTML = info.html();
			// Create an ID to remember this by, using the ever-increased zCounter.
			++zCounter;
			tooltipID = "popup" + zCounter;
			// Store that ID on the question mark.
			$(this).attr("data-clicked", tooltipID);
			// Create new tooltip node.
			$("body").append("<div class=\"info\" id=\"" + tooltipID + "\"></div>");
			// Select the new node.
			info = $("#" + tooltipID);
			// Make it visible.
			info.toggle();
			// Check to see if we're going to go off the edge of the window.
			leftOffset = offsetObject.left;
			infoWidth = info.width() + 20;			// Width of info box (plus padding)
			windowWidth = $(document).width();			// Window width
			leftPosition = leftOffset + $(this).width();	// Starting left position
			if((leftPosition + infoWidth) > windowWidth) {
				// Close to right edge of window.
				if(leftPosition <= infoWidth) {
					// Close to left edge, too. Calculate best fit.
					if(windowWidth <= infoWidth) {
						leftOffset -= leftPosition;
						leftOffset += 2;
					} else {
						leftOffset += (windowWidth - (leftPosition + infoWidth));
						leftOffset -= 3;
					}
				} else {
					// Just move it left.
					leftOffset -= infoWidth;
				}
			}
			info.html(helpHTML).css({"z-index": zCounter, "top": offsetObject.top + 10, "left": leftOffset} );
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
		//
		// Start by toggling the info's visiblity.
		info.toggle();
		// Transform it back to 0 (default state) just in case it was moved before.
		info.css("transform", "translateX(0px)");
		// We only need to calculate stuff if we're visible.
		if(info.is(":visible")) {
			// Increment the zCounter.
			++zCounter;
			// Give the info box that z-index.
			info.css("z-index", zCounter);
			infoWidth = info.width() + 20;				// Width of info box (plus padding)
			windowWidth = $(document).width();				// Window width
			offsetObject = $(this).offset();
			leftPosition = offsetObject.left + $(this).width();	// Starting left position
			if((leftPosition + infoWidth) > windowWidth) {
				// Info box is close to the right edge of window.
				if(leftPosition <= infoWidth) {
					// Close to the left edge of window, too!
					// Calculate best fit.
					if(windowWidth <= infoWidth) {
						// WHY would your window be so small??
						// Push it to the left edge. Hope we can scroll.
						//	0 - (leftPosition - 2)
						//	= 0 - leftPosition + 2
						//	= 2 - leftPosition
						info.css("transform", "translateX(" + (2 - leftPosition) + "px)");
					} else {
						// Moving it left 'infoWidth' pushes it off the left edge.
						// Leaving it pushes it off the right edge by '(windowWidth - (leftPosition + infoWidth))' pixels.
						// So move it leftward '(windowWidth - (leftPosition + infoWidth))' and add a bit of padding
						// Should leave it just off the right edge!
						//	windowWidth - (leftPosition + infoWidth)
						//	= windowWidth - leftPosition - infoWidth
						info.css("transform", "translateX(" + (windowWidth - leftPosition - infoWidth) + "px)");
					}
				} else {
					// To the left, to the left. Every tool you tip, in a box to the left.
					info.css("transform", "translateX(" + (0 - infoWidth) + "px)");
				}
			}
		}
	}
});
