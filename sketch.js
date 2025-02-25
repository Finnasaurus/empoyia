// import { FaceMeasurement } from "./tracking.js";
// import { degreesDistToBlur } from "./myopia.js";

// INPUT PAGE //
let faceMeasurer;
let img;
let input;
let blurAmount = 0;
let onSubmit = false;
let imageID = "snellen";

// WEBSITE PAGE //
let iframe;
let urlInput;
let loadButton;
let defaultUrl = "https://p5js.org";
let container;
let instructions;
let sitesLabel;
let sitesSelect;
let websiteElementsVisible = false;

// Add this function at the beginning of your code to handle paths
function getBasePath() {
  // Check if we're on GitHub Pages at /empoyia
  if (window.location.pathname.includes("/empoyia")) {
    return "/empoyia";
  }
  // Otherwise (local development) use root
  return "";
}

// Load the image.
function preload() {
  const basePath = getBasePath();

  snellenChartImg = loadImage(basePath + "assets/snellen-chart-crop.jpg");
  balloonImg = loadImage(basePath + "assets/hot_air.webp");

  bigFont = loadFont(basePath + "assets/font/DelaGothicOne-Regular.ttf");
}

function setup() {
  createCanvas(displayWidth, displayHeight);
  background(100);
  frameRate(30);

  faceMeasurer = new FaceMeasurement({
    focalLength: 50,
    sensorWidth: 4.5,
    imageWidth: 640,
    imageHeight: 480,
    typicalFaceHeight: 200,
    maxFaces: 1,
  });

  faceMeasurer.initialize(window).then((initialized) => {
    if (!initialized) {
      console.error("Failed to initialize face measurement system");
    }
  });

  // INPUT PAGE //
  textFont(bigFont);
  textAlign(CENTER);
  textSize(64);
  text("EMPYOICA", width / 2, height / 2);

  // Center the input on the screen
  textFont("Montserrat");
  input = createInput("");

  // Calculate the position to center the input
  // Input width is 200px, so we center by positioning at (width/2 - inputWidth/2)
  let inputWidth = 200;
  let inputX = width / 2 - inputWidth / 2;
  let inputY = height / 2 + 30; // Position below the title

  input.position(inputX, inputY);
  input.size(inputWidth); // Set a fixed width
  input.style("padding", "10px");
  input.style("text-align", "center"); // Center the text inside the input
  input.style("font-family", "Montserrat, Arial, sans-serif");

  // Add a label above the input
  let label = createP("Enter the degree:");
  label.position(width / 2 - 100, inputY - 30); // Position above the input
  label.style("width", "200px");
  label.style("text-align", "center");
  label.style("font-family", "Montserrat, Arial, sans-serif");
  label.style("margin", "10px");
  label.style("padding", "0");

  // Create Website Page elements but hide them initially
  setupWebsiteElements();
  hideWebsiteElements();
}

function setupWebsiteElements() {
  textFont("Arial");
  // Website Page setup
  instructions = createP(
    "Enter a URL to embed below. Note: Many sites block embedding due to security policies."
  );
  instructions.position(20, 10);

  // Create an input field for the URL
  urlInput = createInput(defaultUrl);
  urlInput.position(20, 60);
  urlInput.size(300);

  // Create a button to load the URL
  loadButton = createButton("Load Website");
  loadButton.position(330, 60);
  loadButton.mousePressed(loadWebsite);

  // Create a container div for the iframe
  container = createDiv("");
  container.position(20, 100);
  container.size(width - 40, height - 120);
  container.id("iframe-container");

  // Add alternative sites dropdown
  sitesLabel = createP("Or select a site known to work with embedding:");
  sitesLabel.position(20, 90);

  sitesSelect = createSelect();
  sitesSelect.position(330, 90);
  sitesSelect.option("p5.js", "https://p5js.org");
  sitesSelect.option("Wikipedia", "https://en.wikipedia.org");
  // sitesSelect.option("OpenProcessing", "https://www.openprocessing.org");
  // sitesSelect.option("NASA", "https://www.nasa.gov");
  sitesSelect.changed(() => {
    urlInput.value(sitesSelect.value());
    loadWebsite();
  });
}

function hideWebsiteElements() {
  // Hide all website-related elements
  instructions.hide();
  urlInput.hide();
  loadButton.hide();
  container.hide();
  sitesLabel.hide();
  sitesSelect.hide();

  // Remove iframe if it exists
  let existingIframe = select("iframe");
  if (existingIframe) {
    existingIframe.remove();
  }

  websiteElementsVisible = false;
}

function showWebsiteElements() {
  // Clear the background to white first
  background(255);

  // Show all website-related elements
  instructions.show();
  urlInput.show();
  loadButton.show();
  container.show();
  sitesLabel.show();
  sitesSelect.show();

  // Create iframe if it doesn't exist
  if (!select("iframe")) {
    createIframe(defaultUrl);
  }

  websiteElementsVisible = true;
}

function draw() {
  const measurements = faceMeasurer.getMeasurements();

  if (measurements) {
    console.log("Face measurements (mm):");
    console.log("Height:", measurements.faceHeight.toFixed(1));
    console.log("Width:", measurements.faceWidth.toFixed(1));
    console.log("Distance:", measurements.distance.toFixed(1));
  }

  if (onSubmit) {
    //draw image with blur
    if (measurements) {
      blurAmount = measurements.distance / 1000 - 3; // fake function
      console.log(blurAmount);
    }
    drawImage(blurAmount, imageID);
  } else {
    // image(faceMeasurer.video, 0, 0, width, height);
    // faceMeasurer.drawFacePoints(this);
  }
}

function drawImage(blurAmount, imageID) {
  if (blurAmount < 0) {
    blurAmount = 0;
  }
  switch (imageID) {
    case "snellen":
      image(snellenChartImg, 0, 0, width, height);
      filter(BLUR, blurAmount);
      break;
    case "balloon":
      image(balloonImg, 0, 0, width, height);
      filter(BLUR, blurAmount);
      break;
    case "website":
      // Handle website case separately to apply blur to iframe
      if (frameCount % 30 === 0) {
        let iframe = select("iframe");
        if (iframe) {
          fill(240);
          noStroke();
          // rect(0, 0, width, 40);

          // fill(0);
          // textSize(12);
          // text("Current site: " + urlInput.value(), 20, 30);

          // Apply blur to the iframe
          if (blurAmount > 0) {
            iframe.style("filter", "blur(" + blurAmount + "px)");
          } else {
            iframe.style("filter", "none");
          }
        }
      }
      break;
    default:
      image(snellenChartImg, 0, 0, width, height);
      filter(BLUR, blurAmount);
  }
}

// Paint the background gray and display the input's value.
function repaint() {
  // background(200);
  let msg = input.value();
  console.log(msg);
}

function keyPressed() {
  if (key === "j") {
    blurAmount -= 1;
    console.log(blurAmount);
  }
  if (key === "k") {
    blurAmount += 1;
    console.log(blurAmount);
  }
  if (key === "o") {
    imageID = "snellen";
    if (websiteElementsVisible) {
      hideWebsiteElements();
    }
  }
  if (key === "p") {
    imageID = "balloon";
    if (websiteElementsVisible) {
      hideWebsiteElements();
    }
  }
  if (key === "i") {
    imageID = "website";
    // Show website elements when 'i' is pressed
    if (!websiteElementsVisible) {
      showWebsiteElements();
    }
  }
  if (keyCode === 13) {
    console.log(input.value());
    console.log("Enter pressed");
    input.hide();
    onSubmit = true;
  }
}

function loadWebsite() {
  let url = urlInput.value();

  // Basic URL validation
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = "https://" + url;
    urlInput.value(url);
  }

  // Remove the old iframe if it exists
  let oldIframe = select("iframe");
  if (oldIframe) {
    oldIframe.remove();
  }

  // Create a new iframe with the updated URL
  createIframe(url);
}

function createIframe(url) {
  // Create an iframe element
  iframe = createElement("iframe");
  iframe.attribute("src", url);
  iframe.attribute("frameborder", "0");
  iframe.attribute("allowfullscreen", true);
  iframe.parent("iframe-container");
}
