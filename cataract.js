let img;
let cataractSlider;
let blurSlider;
let yellowingSlider;
let cataractImg;
let lastCataractValue = -1;
let lastBlurValue = -1;
let lastYellowingValue = -1;

//cataract values
let r;
let g;
let b;

function preload() {
  // Load a sample image - replace with your own image URL if needed
  snellenChartImg = loadImage("assets/snellen-chart-crop.jpg");
}

function setup() {
  createCanvas(800, 600);

  // Create sliders to adjust cataract parameters
  createP("Cataract Intensity:");
  cataractSlider = createSlider(0, 100, 50);
  cataractSlider.position(20, height + 20);
  cataractSlider.style("width", "200px");

  createP("Blur Amount:");
  blurSlider = createSlider(0, 20, 5);
  blurSlider.position(20, height + 70);
  blurSlider.style("width", "200px");

  createP("Yellowing:");
  yellowingSlider = createSlider(0, 100, 30);
  yellowingSlider.position(20, height + 120);
  yellowingSlider.style("width", "200px");

  pixelDensity(1);

  // Create the modified image once initially
  cataractImg = createImage(snellenChartImg.width, snellenChartImg.height);
  cataractImg.copy(
    snellenChartImg,
    0,
    0,
    snellenChartImg.width,
    snellenChartImg.height,
    0,
    0,
    snellenChartImg.width,
    snellenChartImg.height
  );
}

function draw() {
  background(255);

  // Display original image
  image(snellenChartImg, 0, 0, width / 2, height);

  // Get values from sliders
  let cloudiness = cataractSlider.value() / 100;
  let yellowing = yellowingSlider.value() / 100;

  // Display the blurred image with tint for cataract effects
  push();

  // Calculate tint values
  // For cloudiness: mix with white (255,255,255)
  // For yellowing: increase red and green, decrease blue
  r = 255 * cloudiness + (1 - cloudiness) * (255 * (1 + yellowing * 0.2));
  g = 255 * cloudiness + (1 - cloudiness) * (255 * (1 + yellowing * 0.1));
  b = 255 * cloudiness + (1 - cloudiness) * (255 * (1 - yellowing * 0.3));

  // Cap values at 255
  r = min(r, 255);
  g = min(g, 255);
  b = min(b, 255);

  // Apply tint
  tint(r, g, b, 255);

  // Draw the blurred image
  image(cataractImg, width / 2, 0, width / 2, height);

  // Add labels
  fill(0);
  textSize(16);
  text("Original Image", 20, 30);
  text("Cataract Simulation", width / 2 + 20, 30);

  // Add instructions
  fill(0);
  textSize(12);
  text(
    "Adjust sliders to change cloudiness, blur, and yellowing effect",
    20,
    height - 20
  );

  // Display framerate to monitor performance
  text("FPS: " + frameRate().toFixed(1), width - 100, height - 20);
}
