// import { FaceMeasurement } from "./tracking.js";
// import { degreesDistToBlur } from "./myopia.js";

let faceMeasurer;

let img;
let input;
let blurAmount = 0;
let onSubmit = false;

// Load the image.
function preload() {
  img = loadImage("/assets/snellen-chart-crop.jpg");
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

  // faceMeasurer.initialize();
  // console.log(faceMeasurer);

  // console.log("FaceMeasurer initialized");

  // Create an input and place it beneath the canvas.
  input = createInput("");
  input.position(0, 100);
  // Call repaint() when input is detected.
  input.input(repaint);

  describe(
    "A gray square with a text input bar beneath it. Any text written in the input appears in the middle of the square."
  );
}

function draw() {
  const measurements = faceMeasurer.getMeasurements();
  // console.log("Measurements:", measurements);
  if (measurements) {
    console.log("Face measurements (mm):");
    console.log("Height:", measurements.faceHeight.toFixed(1));
    console.log("Width:", measurements.faceWidth.toFixed(1));
    console.log("Distance:", measurements.distance.toFixed(1));
  }

  if (onSubmit) {
    // let blur = degreesDistToBlur(300, measurements.distance);
    let blur = measurements.distance / 1000 - 3; // fake function
    console.log(blur);
    drawImage(blur);
  } else {
    image(faceMeasurer.video, 0, 0, width, height);
    faceMeasurer.drawFacePoints(this);
  }
}

function drawImage(blurAmount) {
  if (blurAmount < 0) {
    blurAmount = 0;
  }
  image(img, 0, 0, width, height);
  filter(BLUR, blurAmount);
}

// Paint the background gray and display the input's value.
function repaint() {
  background(200);
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
  if (keyCode === 13) {
    console.log(input.value());
    console.log("Enter pressed");
    input.hide();
    onSubmit = true;
  }
}
