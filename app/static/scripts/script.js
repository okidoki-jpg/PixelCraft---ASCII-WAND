const loginPrompt = $("#login-prompt");
const signupPage = $("#signup-page");
const desktop = $(".desktop-icons");

//show desktop
/*function showDesktop() {
	if (window.location.hash !== '') {
            // Remove the hash from the URL without reloading the page
	    history.replaceState(null, document.title, window.location.pathname + window.location.search);
		window.location.reload();
	}
	loginPrompt.hide();

	desktop.css("display", "flex");
	// intro.show();
    // if not don't show again, display intro
    showIntro();
}*/

function showDesktop() {
    let loadingScreen = $('#load-window');
    loadingScreen.show();
	if (window.location.hash !== '') {
            // Remove the hash from the URL without reloading the page
	    history.replaceState(null, document.title, window.location.pathname + window.location.search);
		window.location.reload();
	}

    function hideLoadingScreen() {
        loadingScreen.hide();
        loginPrompt.hide();
		$(".content").css("display", "block");
		$(".window").css("display", "none");
		$("#intro-window").css("display", "block");

		$("#footer").css("visibility", "visible");
		$("#footer").css("opacity", "1");
        desktop.css("display", "flex");
        showIntro();
    }

	let minLoadingTime = 5000;

	$(window).ready(function() {
        setTimeout(hideLoadingScreen, minLoadingTime);
    });
}

// Call the function when the document is ready
//$(document).ready(function() {
//    showDesktop();
//});


// control credential buttons
const loginOps = $("#login-ops");
const login = $("#login-ops .login");
const signup = $("#login-ops .signup");
const guest = $(".guest");
const accessCheck = $("#check");
const loginForm = $(".login-form");
const signupForm = $(".signup-form");
let currentState = "";
let isGuest = true;

function setStateAndHash(state) {
    currentState = state;
    window.location.hash = state;
}

// Function to handle state changes
function handleStateChange() {
    const hash = window.location.hash.slice(1); // Remove the "#" symbol
	console.log("hash: " + hash);
    if (hash === "login") {
        showLoginForm();
    } else if (hash === "signup") {
        showSignupForm();
 } else {
        showInitial();
    }
}


// Function to show the login form
function showLoginForm() {
	setStateAndHash("login");
	loginOps.hide();
	signupForm.hide();
	loginForm.show();
}                                     

// Function to show the signup form
function showSignupForm() {
	setStateAndHash("signup");
	loginOps.hide();
	loginForm.hide();
    signupForm.show();
}

// Function to show the initial state
function showInitial() {
	setStateAndHash("");
	loginForm.hide();
    signupForm.hide();
    loginOps.show();
	accessCheck.checked = false;
}

function flash(e) {
	// remove any existing text
	$("#alert-text").empty();

	// create h1 element with text from argument
	let field = $("<h1>").text(e);
	$("#alert-text").append(field);
	$("#alert").css("display", "block");
	$("#alert .window").css("visibility", "visible");
	$("#alert .window").css("opacity", "1");
	focus($("#alert"));
	setZIndex();
}

function dropDown(msg) {
	let field = $("<h3>").text(msg);
	$("#alert-banner").empty().append(field);
	$("#alert-banner").slideDown(500).delay(2000).slideUp(500);
}


$('#gguest').on("click", () => {
	console.log("Logging in as guest");
});

// Function to show the intro
$('.guest').on("click", () => {
	let data = {"user": "guest"};
	$(".content").css("display", "none");
	desktop.css("display", "none");

	$.ajax({
		url: "/login",
		method: "POST",
		data: JSON.stringify(data),
		contentType: "application/json",
		success: (response) => {
			if (response.success) {
				$("#load-window").css("display", "block");
				window.location.reload();

				showDesktop();
			} else {
				flash("Guest login failed!");
				alert("Login failed");
			}
		},
		error: (err) => {
			console.error("Error logging in: " + err.responseText);
			flash(err.responseText);
		}
	});
});

login.on("click", () => {
	setStateAndHash("login");
	showLoginForm();
});

signup.on("click", () => {
	setStateAndHash("signup");
	showSignupForm();
});


// Setting up a hash change event handler
$(window).on("hashchange", () => {
    handleStateChange();
});


// Check if user is logged in & handle the initial state
$(document).ready(() => {
	// Add 'loaded' class to body once CSS has loaded
	$("body").addClass("loaded");

	// check db for login
	$.ajax({
		url: "/check-login",
		method: "GET",
		success: (response) => {
			if (response.loggedIn) {
				showDesktop();
				if (response.user == "guest") {
					isGuest = true;
				} else {
					isGuest = false;
				}
			} else{
				showInitial();
			}
		},
		error: (err) => {
			console.error("Error checking login: " + err.responseText);
			flash(err.responseText);
		}
	});
});


// Handle Form Filling

/* Signup */


// Check email availability
function checkEmailAvailability() {
    const emailInput = $("#signup-email")[0];
    const email = $("#signup-email").val();
	//const emailError = $("#signupEmailError");
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (emailRegex.test(email)) {
        $.ajax({
            url: "/check-email",
            method: "POST",
            data: JSON.stringify({ "email": email }),
            contentType: "application/json",
            success: (response) => {
                if (response.available) {
                    // Email is available
					//emailError.setCustomValidity("");
                    console.log("Email is available");
					// change input border color
                } else {
                    // Email is already in use
					//emailError.setCustomValidity("Email is already in use");
                    console.log("Email is already in use");
					flash(response.error);
                }
            },
            error: (err) => {
                console.error("Error checking email: " + err.responseText);
				flash(err.responseText);
            }
        });
    } else {
        // Invalid email format
        emailInput.setCustomValidity("Please enter a valid email address");
		console.log("Invalid email format");
    }
}

$("#signup-email").on('blur', () => {
	checkEmailAvailability();
});

// Submit signup form
function submitSignupForm() {
	const email = $("#signup-email").val();
	const password = $("#password1").val();
	const password2 = $("#password2").val();
	const first = $("#first-name").val();
	const last = $("#last-name").val();

	if (!email || !password || !password2 || !first || !last) {
		flash("Please fill out all fields");
		console.log("Please fill out all fields");
		return;
	}

	// Validate password
	if (password !== password2) {
		console.log("Passwords do not match");
		flash("Passwords do not match");
		return false;
	}

	const data = {
		"email": email,
		"password": password,
		"first": first,
		"last": last,
	};

	$.ajax({
		url: "/signup",
		method: "POST",
		data: JSON.stringify(data),
		contentType: "application/json",
		success: (response) => {
			if (response.success) {
// Signup successful
				console.log("Signup successful");
				// Redirect to login page
				showDesktop();
			} else {
				// Signup failed
				console.log("Signup failed");
			}
		},
		error: (err) => {
			console.error("Error signing up: " + err.responseText);
			flash(err.responseText);
		}
	});
}


/* Login */
// Submit login form

function submitLoginForm() {
	const email = $("#login-email").val();
	const password = $("#login-password").val();

	if (!email || !password) {
		flash("Please fill out all the fields");
		return;
	}

	const data = {
		"email": email,
		"password": password,
	};

	$.ajax({
		url: "/login",
		method: "POST",
		data: JSON.stringify(data),
		contentType: "application/json",
		success: (response) => {
			console.log("Response: " + response);
			if (response.success) {
				// Login successful
				// Redirect to desktop
				showDesktop();
			} else {
				// Login failed
				flash(response.error);
				console.error("Login failed");
			}
		},
		error: (err) => {
			console.error("Error logging in: " + err.responseText);
			flash(err.responseText);
		}
	});
}


/**
 * Destop Behavior
 */

// Show Intro Window

function showIntro() {
	focus($("#intro-window"));
	setZIndex();
}



/**
 * Window Behavior
 */


// set z-index of windows
function setZIndex() {
	const windows = $(".window");
	// find highest z-index
	const maxZ = Math.max.apply(
		null,
		windows.map(function() {
			return parseInt($(this).css('z-index'));
		})
	);

	let active = $(".focus");

	// set z-index of clicked window to max + 1
	//$(active).css("z-index", maxZ + 1);

	// move window to end of windows array
	const currIdx = windows.index(active);
	windows.splice(currIdx, 1);
	windows.push(active);

	// update z-index of remaining windows
	windows.each((idx, window_) => {
		$(window_).css("z-index", idx + 1);
	});
}

// focus active window && drag behavior
$(document).ready(function() {
    const windows = $(".window");

    // on mousedown, bring window to front
    windows.on("mousedown touchstart", function() {
        // Remove the .focus class from all elements
        windows.removeClass('focus');

		// Cache the clicked element in a variable
        let clickedWindow = $(this);

        // Add the .focus class to the clicked element
        clickedWindow.addClass('focus');

		// Set z-index of windows
		setZIndex();


        // Draggable windows
        let bar = clickedWindow.find('.nav-bar');
        let appView = clickedWindow;
        let isDragging = false;
        let offsetX, offsetY;

        bar.on("mousedown touchstart", function(e) {
            isDragging = true;
            offsetX = (e.type === "mousedown") ? e.clientX - appView.offset().left : e.touches[0].clientX - appView.offset().left;
            offsetY = (e.type === "mousedown") ? e.clientY - appView.offset().top : e.touches[0].clientY - appView.offset().top;

        $(document)
            .on("mousemove touchmove", function(e) {
                if (!isDragging) return;
                const newLeft = (e.type === "mousemove") ? e.clientX - offsetX : e.touches[0].clientX - offsetX;
                const newTop = (e.type === "mousemove") ? e.clientY - offsetY : e.touches[0].clientY - offsetY;

                // Ensure the top value stays within the range [200px, 800px]
                appView.css("left", newLeft + "px");

                if (newTop < 200) {
                    appView.css("top", "200px");
                } else if (newTop > 630) {
                    appView.css("top", "630px");
                } else {
                    appView.css("top", newTop + "px");
                }
            })
            .on("mouseup touchend", function() {
                isDragging = false;
            });
        });
    });
});

// focus window on click
function focus(window_) {
	// Remove the .focus class from all elements
	$(".window").removeClass('focus');

	// add .focus class to window
	window_.addClass("focus");
	window_.show();
	setZIndex();
}


// Icons - open windows
// listen for click on create icon
$("#create-icon").on("click", function() {
	focus($("#workspace-window"));
	setZIndex();
});

// listen for click on collection icon
$("#collection-icon").on("click", function() {
	if (isGuest) {
		alert("Please log in to access your collection");
		return;
	}
	focus($("#collection-window"))
	setZIndex();
});

// listen for click on viewer icon
$("#viewer-icon").on("click", function() {
	if (isGuest) {
		alert("Please log in to access your viewer");
		return;
	}
	focus($("#viewer-window"))
	setZIndex();
});

// social/connection icons redirect
$("#github-icon").on("click", function() {
	window.open('https://github.com/okidoki-jpg', '_blank');
});

$("#linkedin-icon").on("click", function() {
	window.open('https://www.linkedin.com/in/okuhle-nsibande', '_blank');
});

$("#x-icon").on("click", function() {
	window.open('https://twitter.com/sonofpeter_exe?t=62zqBo1BXunc8bMZ9S4iRw&s=09', '_blank');
});


// Close window //
// listen for click on close button
$(".close").on("click", function() {
	// hide window
	$(this).parent().parent().parent().hide();
});



/**
 * Create Window Behavior
 */

// Canvas setup

// primary canvas
const canvas = $("#canvas")[0];
const ctx = canvas.getContext("2d");

// secondary canvas - highlighter
const highlightsCanvas = $("#highlightsCanvas")[0];
const highlightsCtx = highlightsCanvas.getContext("2d");

// output canvas
let output = document.createElement('canvas');



/**
 * canvas effects
 */


/* EFFECTS BUTTON RESPONSE BEHAVIOR */
$(document).ready(function() {
    const buttons = $("#controls button");
    const filters = $(".filters");

    buttons.each(function(index) {
        $(this).on("click", function() {
			const divId = $(this).attr("data-target");
			console.log("divId: " + divId);
            //const divId = $(this).data("target");
            const divToToggle = $("#" + divId);

            // Toggle the display of the target div
            if (divToToggle.length) {
                divToToggle.toggle();
            }

            // Set display: none for other divs inside the .filters div
            const otherDivs = filters.find(`div:not(#${divId})`);
            otherDivs.css("display", "none");
        });
    });
});



/* RESOLUTION EFFECT */

// resolution slider & label
const resolutionSlider = $("#resolution");
const resolutionLabel = $("#resolutionLabel");


// resolution slider
function slide() {
    if ($("#resolutionSlider").val() == 0) {
        $("#resolutionLabel").html("Original Image");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    } else {
		let res = resolutionSlider.val() * 5 ;
        $("#resolutionLabel").html(`Resolution ${res}%`);
        ctx.font = parseInt($("#resolutionSlider").val()) * 1.2 + "px Verdana";
        engine.redrawCanvas();
        updateHighlightsLayer();
    }
}

// resolution slider event listener
resolutionSlider.on("input", () => {
	console.log("ckicked resolution slider");
	slide();
});


/* BLACK & WHITE EFFECT */

// initial color mode
let isColorMode = true;

// black & white toggle button
const colorToggle = $("#bw-toggle");

// black & white toggle function
function toggleColor() {
	// Toggle between color and white mode
	isColorMode = !isColorMode; 

	 // Redraw the canvas
	engine.redrawCanvas();
}

// black & white toggle event listener
colorToggle.on("click", toggleColor);


/* HIGHLIGHTS EFFECT */

// highlights button
const highs = $("#highlights");

// initial highlight slider value
let sliderValue = 0;

// update highlights function
function updateHighlightsLayer() {

    sliderValue = highs.val();
    if (sliderValue === "0") {
        // Clear and hide the highlights layer when the slider is at 0
        $("#highlightsCanvas").css("display", "none");
		highlightsCtx.clearRect(0, 0, highlightsCanvas.width, highlightsCanvas.height);
    } else {
        // Update and display the highlights layer
        $("#highlightsCanvas")
            .css("display", "block")
            .prop("width", canvas.width)
            .prop("height", canvas.height);

        // Offset effect
        const offsetAmount = (sliderValue / 100) * canvas.width;

        // Get the 2D context of the highlights canvas
        const highlightsCtx = $("#highlightsCanvas")[0].getContext("2d");

        // Clear the highlights layer
        highlightsCtx.clearRect(0, 0, highlightsCanvas.width, highlightsCanvas.height);

        // Draw the contents of the main canvas in white with the offset
        highlightsCtx.drawImage(canvas, -offsetAmount, 0);

        // Apply a white overlay effect to make it appear white
        highlightsCtx.globalCompositeOperation = "source-in";
        highlightsCtx.fillStyle = "white";
        highlightsCtx.fillRect(0, 0, highlightsCanvas.width, highlightsCanvas.height);

        // Reset the composite operation
        highlightsCtx.globalCompositeOperation = "source-over";
    }
}

// highlights button event listener
highs.on("input", updateHighlightsLayer);


/* ZOOM IMAGE EFFECT */

$("#zooom").on("click", () => {
	flash("Sorry, This Feature Is Down At the Moment.");
});


/* RANDOM IMAGE EFFECT */

// random image button
const random = $("#random");
let randomUrl;


// convert src url to file
function srcToFile(src, fileName) {
	fetch(src)
	.then(res => res.blob())
	.then(blob => {
		let image = new File([blob], fileName, {type: 'image/jpeg'});
		if (formData.has('image')) {
			formData.delete('image');
		}
		formData.append('image', image, fileName);
		const fr = new FileReader();
		fr.readAsDataURL(blob);
		fr.onload = function(e) {
			img.src = e.target.result;
		};
	});
}

// random image function
function fetchRandomImage() {
	$.ajax({
		url: "/api/random",
		type: "GET",
		success: (data) => {
			if (data) {
				// Set the image source to the random image
				//img.src = `data:image/jpg;base64, ${data.image}`;
				img.alt = data.name;
				randomUrl = data.image;
				srcToFile(data.image, img.alt);
				console.log("img.src: " + img.src);

				

				// Redraw the canvas
      	  		img.onload = handleImageLoad;
        		// set image source to uploaded image
        		//img.src = reader.result;
				//img.onload();
			} else {
				console.log("Error: no image data received");
				flash("No image data received. Please try again.");
			}
		},
		error: (err) => {
			console.log("Error: " + err);
			flash(err.responseJSON.message);
		}
	});
}

// random image button event listener
random.on("click", fetchRandomImage);


/* DOWNLOAD IMAGE EFFECT */

// download image button
const download = $("#download");

// download image event listener
download.on("click", () => {
	engine.saveImage();
});



/**
 * Image Processing Engine
 */


// ascii image pixel data
class Cell {
    constructor(x, y, charr, color) {
        this.x = x;
        this.y = y;
        this.charr = charr;
        this.color = color;
    }

    draw(ctx) {
        ctx.fillStyle = isColorMode ? this.color : "white";
        ctx.fillText(this.charr, this.x, this.y);
    }
}

// Image to ascii algorithm
class AsciiEngine {
    #imageCells = [];
    #pixels = [];
    #ctx;
    #offX;
    #offY;
    #width;
    #height;

    constructor(ctx, offX, offY, width, height) {
        this.#ctx = ctx;
        this.#offX = offX;
        this.#offY = offY;
        this.#width = width;
        this.#height = height;
        this.#ctx.drawImage(img, 0, 0, this.#width, this.#height);
        this.#pixels = this.#ctx.getImageData(0, 0, this.#width, this.#height);
    }

    #convertPixel(avg) {
        function mapa(n, start1, stop1, start2, stop2, withinBounds) {
            if (typeof withinBounds === 'undefined') {
                withinBounds = true;
            }

            const newval = (n - start1) / (stop1 - start1) * (stop2 - start2) + start2;

            if (!withinBounds) {
                return newval;
            }

            if (start2 < stop2) {
                return constrain(newval, start2, stop2);
            } else {
                return constrain(newval, stop2, start2);
            }
        }

        function constrain(n, low, high) {
            return Math.max(Math.min(n, high), low);
        }

        const chars = " `.-':_,^=;><+!rc*/z?sLTv)J7(|Fi{C}fI31tlu[neoZ5Yxjya]2ESwqkP6h9d4VpOGbUAKXHm8RD#$Bg0MNWQ%&@";
        const len = chars.length;
        let charr = Math.floor(mapa(avg, 0, 225, 0, len));
        if (!(chars[charr - 1])) {
            charr = 2;
        }
        return chars[charr - 1];
    }

    #parseImg(cellSize) {
        this.#imageCells = [];
        for (let y = 0; y < this.#pixels.height; y += cellSize) {
            for (let x = 0; x < this.#pixels.width; x += cellSize) {
                const posX = x * 4;
                const posY = y * 4;
                const pos = (posY * this.#pixels.width) + posX;

                if (this.#pixels.data[pos + 3] > 128) {
                    const red = this.#pixels.data[pos];
                    const green = this.#pixels.data[pos + 1];
                    const blue = this.#pixels.data[pos + 2];
                    const sum = red + green + blue;
                    const avg = sum / 3;
                    const color = `rgb(${red}, ${green}, ${blue})`
                    const charr = this.#convertPixel(avg);
                    this.#imageCells.push(new Cell(this.#offX + x, this.#offY + y, charr, color));
                }
            }
        }
    }

    #drawAscii() {
        this.#ctx.clearRect(0, 0, this.#width, this.#height);
        for (let i = 0; i < this.#imageCells.length; i++) {
            this.#imageCells[i].draw(this.#ctx);
			let cell = this.#imageCells[i];
        }
    }

    draw(cellSize) {
        this.#parseImg(cellSize);
        this.#drawAscii();
    }

    saveImage() {
		this.exportImg();
		let title = previewImg.alt;

		download.find("a").attr("href", output.toDataURL("image/jpeg"));
		download.find("a").attr("download", `${title}.ascii.jpg`);
    }

	exportImg() {
		output.width = canvas.width;
		output.height = canvas.height;

		// Get the context of the combined canvas
		let outputCtx = output.getContext('2d');

		// Draw both canvases onto the combined canvas
		outputCtx.drawImage(canvas, 0, 0);
		outputCtx.drawImage(highlightsCanvas, 0, 0);
	}



    redrawCanvas() {
        this.#ctx.clearRect(0, 0, canvas.width, canvas.height);
        this.#imageCells = [];
        this.#parseImg(20 - parseInt(resolutionSlider.val()));
        this.#drawAscii();
    }
}


/* UPLOAD IMAGE */

// initialise image object & file reader
const img = new Image();
const reader = new FileReader();
const formData = new FormData();
let imageFile;

let engine;

const handleImageLoad = () => {
    // set canvas width and height
    canvas.width = (canvas.width / canvas.height) * img.width;
    canvas.height = img.height;

    // set canvas offset
    let oX = (canvas.width - img.width) / 2;
    let oY = (canvas.height - img.height) / 2;

    // set preview image source to uploaded image
    previewImg.src = img.src;
	previewImg.alt = img.alt;

    // initialize ASCII engine
    engine = new AsciiEngine(ctx, oX, oY, img.width, img.height);

    // initial canva sdraw
    slide();
    engine.redrawCanvas();
};

// initialize preview image
let previewImg = $(".prev-img")[0];
const desktopImg = $("#desktop img").attr('src');
previewImg.src = desktopImg;

// Upload Image function
const uploadImage = (e) => {
	// get uploaded image
	imageFile = e.target.files[0];


    // initialize file reader
    reader.onload = () => {
        img.onload = handleImageLoad;
        // set image source to uploaded image
        img.src = reader.result;
		let cut = imageFile.name.split(".").pop().length + 1;
		img.alt = imageFile.name.slice(0, -cut);
    };
    // read uploaded image
    reader.readAsDataURL(imageFile);
	// append image to form data
	if (formData.has('image')) {
		formData.delete('image');
	}
	formData.append('image', imageFile);
};


// upload image button
const upload = $("#imageInput");
		
// upload image event listener
upload.on("change", uploadImage);



/**
 * Window Navbar ootions
 */


/* SAVE CREATION */

// Save button
const saveBtn = $("#save");

// link comparison
const arePathsEqual = (url1, url2) => {
	const pathRegex = /\/static\/(.*)/;
	const match1 = url1.match(pathRegex);
	const match2 = url2.match(pathRegex);

	// Check if both URLs match the expected pattern
	if (match1 && match2) {
		const path1 = match1[1];
		const path2 = match2[1];
		return path1 === path2;
	} else {
		// URLs do not match the expected pattern
		return false;
	}
};


// Save Project

function conv() {
	return new Promise((resolve, reject) => {
		// Initialise blob name
		let blobName = previewImg.alt + ".ascii.jpg";

		// draw final output
		engine.exportImg();

		// convert final output to file
		output.toBlob(function(blob) {
			let file = new File([blob], blobName, { type: 'image/jpeg' });

			// return converted file
			resolve({ file });
		}, 'image/jpeg');
	});
}

// Save button event listener
saveBtn.on("click", () => {
	// check if image was uploaded
	if (!formData.has('image')) {
		flash("Please upload an image first");
		return;
	}

	// deny if not logged in
	if (isGuest) {
		flash("Please log in to save your creation");
		return;
	}

	// fulfil blob conversion promise
	conv()
    .then(({ file }) => {
		// Append the image data to FormData object
		formData.append('art', file);
		formData.append('res', resolutionSlider.val());
		formData.append('bw', isColorMode);
		formData.append('highs', highs.val());

		// Post FormData to server
		$.ajax({
			url: "/save",
			method: "POST",
			data: formData,
			processData: false,
			contentType: false,
			success: (response) => {
				console.log("Response: " + response.success);
				if (response.success) {
					console.log("Image save successful");
					// save success message. drop down from top
					dropDown("Image saved successfully");
				} else {
					flash("Error saving image");
					console.log("Image save failed");
				}
			},
			error: (err) => {
				console.error("Error saving image: " + err.responseText);
				flash("Error saving image");
			}
		});
	})
	.catch(error => {
		console.error("Error converting image to Blob: " + error);
		flash("Error saving image");
	});

});


/**
 * Collection Window Functionality
 */


/* DELETE BUTTON */

// Define checkbox flag
let checkboxesAdded = false;

// Define function to add checkboxes
function addCheckboxes() {
    if (!checkboxesAdded) {
        // Add checkboxes to all divs under #collection-content
        const collectionContent = $("#collection-content");
        const divsToCheck = collectionContent.find("div");

		// define and append checkboxes
        divsToCheck.each(function() {
            const checkbox = $("<input>").attr({
                type: "checkbox",
                class: "checkbox"
            });
            $(this).append(checkbox);
        });

		// Set the flag to true
        checkboxesAdded = true; 
    }

    // Set #cancel-delete button to display block
    $("#cancel-delete").css("display", "block");
}

// delete function
function deleteImg() {
    // Remove selected images from the database
    let toDelete = [];
    $(".checkbox").each(function() {
        if ($(this).is(":checked")) {
            // Get image id from the data-image-id attribute
            let id = $(this).parent().data("image-id");
			console.log("id: " + id);

            // Add id to the array
            toDelete.push(id);

            // Remove selected images from the collection
            $(this).parent().remove();
        }
    });

    // Remove images from the database
    $.ajax({
        url: "/delete",
        method: "POST",
        data: JSON.stringify({ "ids": toDelete }),
		contentType: "application/json",
        success: (response) => {
            console.log("Response: " + response.success);
            if (response.success) {
                // Delete successful
                console.log("Image delete successful");
            } else {
                // Delete failed
                console.log("Image delete failed");
            }
        },
        error: function(err) {
            console.error("Error deleting image: " + err.responseText);
        }
    });
}


// delete button event listener
$("#delete").click(() => {
	// if checkboxes not added, add them
	if (!checkboxesAdded) {
		addCheckboxes();
	} else {
		// delete selected images
		deleteImg();
	}
});


// Define function to remove checkboxes
function removeCheckboxes() {
    // Set #cancel-delete button to display none
    $("#cancel-delete").css("display", "none");

    // Remove all checkboxes
    $(".checkbox").each(function() {
        $(this).remove();
    });

	// Reset the flag when canceling delete
    checkboxesAdded = false; 
}

// cancel delete button event listener
$("#cancel-delete").click(removeCheckboxes);



/**
 * Image Viewer Window
 */


// Initial viewer index
let indexValue = 1;

// Open image in viewer from collection
function openImg() {
	// get all images
	let images = $('#collection-content').find('img');

	// get index of clicked image
	let index = images.index(this);

	// set index to clicked image
	indexValue = index + 1;
	showImg(indexValue);

	// set z-index of viewer
	let viewer = $("#viewer-window");
	$(".window").removeClass("focus");
	viewer.addClass("focus");
	viewer.css("display", "block");
	setZIndex();

}

// listen for mobile screen double tap
$('#collection-content').on('click', 'img', openImg);

//$('#collection-content').on('dblclick', 'img', openImg);


// image viewer control
function side_slide(idx) {showImg(indexValue += idx);}
function showImg(idx) {
	let i;
	const img = $('.view-image');
	if (idx > img.length) {
		indexValue = 1
	}

	if (idx < 1) {
		indexValue = img.length
	}

	for (i = 0; i < img.length; i++) {
		img[i].style.display = "none";
	}
	
	img[indexValue-1].style.display = "block";
}


// Re-edit image //
function reEdit() {
	// use indexValue to get image id
	let id = $($('.view-image')[indexValue]).find('img').data('img-id');

	// get image data from database
	// reassign image attributes
	// redraw canvas
}

// re-edit button event listener
$(".edit").click(reEdit);
	


/**
 * Welcome Window
 */

// mark active feature preview
$(document).ready(function() {
	// if anything but the card is clicked, remove 'active' class
	$(document).on("click", function(e) {
		if (!$(e.target).is(".toggle-btn")) {
			$(".card").removeClass("active");
			$(".card").css("border-bottom", "none");
		}
	});


	$(".toggle-btn").click(function() {
		let par = $(this).parent();
		let cardActive = par.hasClass("active");


		if (cardActive) {
			// remove 'active' class
			$(".card").removeClass("active");
			$(".card").css("border-bottom", "none");
		} else {
			// update 'active' card
			$(".card").removeClass("active");
			par.addClass("active");
		}
	});

	$(".tab").click(function() {
		// find fearures tab 
		let tab = $(this).attr("id");
		let features = $("#features");
		let about = $("#about");


		$(".tab").removeClass("active-tab");
		$(this).addClass("active-tab");

		if (tab == "features-tab") {
			features.css("display", "flex");
			about.css("display", "none");
		} else if (tab == "about-tab") {
			features.css("display", "none");
			about.css("display", "block");
		} else {
			features.addClass("active-tab");
			$("#intro-window").hide();
			let window_ = $("#workspace-window");
			$(".window").removeClass("focus");
			window_.addClass("focus")
			window_.show();
			setZIndex();
		}
	});
});



// toggle foot nav
$("#foot-nav-toggle").click(function() {
	$('#foot-nav-items').toggle();
});


// logout
function logout() {
	$.ajax({
		url: "/logout",
		method: "GET",
		success: (response) => {
			if (response.success) {
				showInitial();
				window.location.reload();
			} else {
				console.log("Logout failed");
			}
		},
		error: function(err) {
			console.error("Error logging out: " + err.responseText);
		}
	});
}

// logout from user
$("#logout").on("click", logout);

// signup from guest
$("#guest-signup").on("click", logout);


// show intro
$("#intro-icon").on("click", showIntro);


