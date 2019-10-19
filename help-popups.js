// Set counter for tooltips, thus giving each a unique ID and an ever-increasing z-index.
var zCounter = 1;
// Set up help tooltips as needed.
document
	.querySelectorAll(".help")
	.forEach(help => help.addEventListener("click", doHelpPopUp.bind(help)));
function doHelpPopUp() {
	//console.log("clicked");
	var info = this.querySelector("span.info"),
		d = this.dataset,
		leftOffset,
		infoWidth,
		windowWidth,
		leftPosition,
		helpHTML,
		tooltipID;
	if (this.classList.contains("popOut")) {
		//
		// Handle tooltips from the Advanced Options.
		//
		tooltipID = d.clicked;
		if (tooltipID !== undefined) {
			// data-clicked is defined? Then we've been clicked. Remove the tooltip.
			document.getElementById(tooltipID).remove();
			// Remove the stored info.
			delete d.clicked;
		} else {
			// data-clicked isn't defined? Then create a tooltip.
			// We can't simply show the tooltip box, since it's constrained by the flex container.
			helpHTML = info.innerHTML;
			// Create an ID to remember this by, using the ever-increased zCounter.
			++zCounter;
			tooltipID = "popup" + zCounter;
			// Store that ID on the question mark.
			d.clicked = tooltipID;
			// Create new tooltip node.
			let x = document.createElement("div");
			x.classList.add("info");
			x.setAttribute("id", tooltipID);
			document.body.append(x);
			// Select the new node.
			info = document.getElementById(tooltipID);
			// Make it visible.
			info.classList.add("shown");
			// Check to see if we're going to go off the edge of the window.
			leftOffset = this.offsetLeft;
			//console.log(this.offsetParent);
			infoWidth = info.scrollWidth + 20; // Width of info box (plus padding)
			windowWidth = window.innerWidth; // Window width
			leftPosition = leftOffset + this.scrollWidth; // Starting left position
			if (leftPosition + infoWidth > windowWidth) {
				// Close to right edge of window.
				if (leftPosition <= infoWidth) {
					// Close to left edge, too. Calculate best fit.
					if (windowWidth <= infoWidth) {
						leftOffset -= leftPosition;
						leftOffset += 2;
					} else {
						leftOffset += windowWidth - (leftPosition + infoWidth);
						leftOffset -= 3;
					}
				} else {
					// Just move it left.
					leftOffset -= infoWidth;
				}
			}
			//console.log(this);
			info.innerHTML = helpHTML;
			let s = info.style,
				newTop = this.offsetTop + this.scrollHeight;
			s.position = "absolute";
			s.top = newTop.toString() + "px";
			s.left = leftOffset.toString() + "px";
			s.zIndex = zCounter.toString();
			//console.log(info);
			//console.log([leftOffset, this.offsetTop, info.style.cssText]);
			info.addEventListener("click", function(e) {
				var me = e.currentTarget,
					z = document.querySelector(
						'span[data-clicked="' + me.getAttribute("id") + '"]'
					);
				delete z.dataset.clicked;
				me.remove();
			});
		}
	} else if (info.classList.contains("shown")) {
		//
		// Handle tooltips in main body
		//
		// This one has been shown and now needs to be hidden.
		info.classList.remove("shown");
		//console.log("Removed");
	} else {
		// Make it visible.
		info.classList.add("shown");
		//console.log("Added");
		// Transform it back to 0 (default state) just in case it was moved before.
		let s = info.style;
		s.transform = "translateX(0px)";
		// Increment the zCounter.
		++zCounter;
		// Give the info box that z-index.
		s.position = "absolute";
		s.zIndex = zCounter.toString();
		infoWidth = info.scrollWidth + 20; // Width of info box (plus padding)
		windowWidth = window.innerWidth; // Window width
		leftPosition = this.offsetLeft + this.scrollWidth; // Starting left position
		if (leftPosition + infoWidth > windowWidth) {
			// Info box is close to the right edge of window.
			if (leftPosition <= infoWidth) {
				// Close to the left edge of window, too!
				// Calculate best fit.
				if (windowWidth <= infoWidth) {
					// WHY would your window be so small??
					// Push it to the left edge. Hope we can scroll.
					//	0 - (leftPosition - 2)
					//	= 0 - leftPosition + 2
					//	= 2 - leftPosition
					let p = 2 - leftPosition;
					s.transform = "translateX(" + p.toString() + "px)";
				} else {
					// Moving it left 'infoWidth' pushes it off the left edge.
					// Leaving it pushes it off the right edge by '(windowWidth - (leftPosition + infoWidth))' pixels.
					// So move it leftward '(windowWidth - (leftPosition + infoWidth))' and add a bit of padding
					// Should leave it just off the right edge!
					//	windowWidth - (leftPosition + infoWidth)
					//	= windowWidth - leftPosition - infoWidth
					let p = windowWidth - leftPosition - infoWidth;
					s.transform = "translateX(" + p.toString() + "px)";
				}
			} else {
				// To the left, to the left. Every tool you tip, in a box to the left.
				s.transform = "translateX(-" + infoWidth.toString() + "px)";
			}
		}
	}
}
