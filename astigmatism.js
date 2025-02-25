let img;
let astigmatismSlider;
let directionSlider;

let processedImg;
let lastAstigVal = -1;
let lastDirVal = -1;

function preload() {
  // Load a sample image - replace with your own image URL if needed
  snellenChartImg = loadImage("assets/snellen-chart-crop.jpg");
}
function setup() {
  createCanvas(800, 600);

  // Create sliders to adjust astigmatism parameters
  createP("Astigmatism Severity:");
  astigmatismSlider = createSlider(0, 100, 50);
  astigmatismSlider.position(20, height + 20);
  astigmatismSlider.style("width", "200px");

  createP("Direction (degrees):");
  directionSlider = createSlider(0, 180, 45);
  directionSlider.position(20, height + 70);
  directionSlider.style("width", "200px");

  pixelDensity(1);

  // Create a buffer for the processed image
  processedImg = createGraphics(snellenChartImg.width, snellenChartImg.height);
}

function draw() {
  background(255);

  // Display original image on left side
  image(snellenChartImg, 0, 0, width / 2, height);

  // Get values from sliders
  let severity = astigmatismSlider.value();
  let direction = directionSlider.value();

  // Only reprocess if the values changed
  if (severity !== lastAstigVal || direction !== lastDirVal) {
    lastAstigVal = severity;
    lastDirVal = direction;
    applyAstigmatism(severity, direction);
  }

  // Display the processed image on right side
  image(processedImg, width / 2, 0, width / 2, height);

  // Add labels
  fill(0);
  textSize(16);
  text("Original Image", 20, 30);
  text("Astigmatism Simulation", width / 2 + 20, 30);

  // Add instructions and info
  fill(0);
  textSize(12);
  text(
    "Adjust sliders to change astigmatism severity and direction",
    20,
    height - 20
  );
  text("Current direction: " + direction + "°", width / 2 + 20, height - 20);

  // Display framerate
  text("FPS: " + frameRate().toFixed(1), width - 100, height - 20);
}

function applyAstigmatism(severity, angleDegrees) {
  // Convert angle from degrees to radians
  let angle = radians(angleDegrees);

  // Map severity to useful blur amount
  let blurAmount = map(severity, 0, 100, 0, 30);

  // Clear the processing buffer
  processedImg.clear();
  processedImg.background(255);

  // Draw the original image
  processedImg.image(snellenChartImg, 0, 0);

  // Direction vectors based on angle
  let dirX = cos(angle) * blurAmount;
  let dirY = sin(angle) * blurAmount;

  // Apply pure directional blur using multiple offset layers
  let numLayers = min(20, ceil(blurAmount));
  let alphaStep = 200 / numLayers;

  // Start with the original image at full opacity
  processedImg.image(snellenChartImg, 0, 0);

  // Create temporary buffer for composite
  let tempBuffer = createGraphics(
    snellenChartImg.width,
    snellenChartImg.height
  );
  tempBuffer.image(processedImg, 0, 0);
}
