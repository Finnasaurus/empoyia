// import { FaceMeasurement } from "./tracking.js";
// import { degreesDistToBlur } from "./myopia.js";

let faceMesh;
let options = { maxFaces: 1, refineLandmarks: false, flipped: false };
let video;
let faces = [];
let maxX = 0,
  maxY = 0;
let minX = Infinity,
  minY = Infinity;
let xLen = 0;
let yLen = 0;

// MacBook Pro 2019 FaceTime HD Camera parameters (assumed by claude)
const FOCAL_LENGTH_MM = 50; // Focal length
const SENSOR_WIDTH_MM = 4.5; // 720p FaceTime HD camera sensor width (approximate)
const IMAGE_WIDTH_PIXELS = 640; // Image width in pixels
const TYPICAL_FACE_HEIGHT_MM = 200; // Average human face width in mm

function calculateDistance(faceheightPixels) {
  // Distance = (Focal Length × Real Object Width × Image Width) / (Object Width in Pixels × Sensor Width)
  return (
    (FOCAL_LENGTH_MM * TYPICAL_FACE_HEIGHT_MM * IMAGE_WIDTH_PIXELS) /
    (faceheightPixels * SENSOR_WIDTH_MM)
  );
}
function pixelsToMm(pixels, distance) {
  // Real Size = (Object Size in Pixels × Distance × Sensor Size) / (Focal Length × Image Size in Pixels)
  return (
    (pixels * distance * SENSOR_WIDTH_MM) /
    (FOCAL_LENGTH_MM * IMAGE_WIDTH_PIXELS)
  );
}

let snellenChartImg;
let input;
let blurAmount = 0;
let onSubmit = false;

// Load the image.
function preload() {
  faceMesh = ml5.faceMesh(options);
  snellenChartImg = loadImage("/assets/snellen-chart-crop.jpg");
}

function setup() {
  // createCanvas(displayWidth, displayHeight);
  // background(100);
  frameRate(30);

  // Create the video and hide it
  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();

  // Start detecting faces from the webcam video
  faceMesh.detectStart(video, gotFaces);

  // Create an input and place it beneath the canvas.
  input = createInput("");
  input.position(0, 100);
  // Call repaint() when input is detected.
  input.input(repaint);

  describe(
    "A gray square with a text input bar beneath it. Any text written in the input appears in the middle of the square."
  );
}

function gotFaces(results) {
  faces = results;
}

function draw() {
  // console.log("Measurements:", measurements);
  if (onSubmit) {
    let blur = degreesDistToBlur(300, measurements.distance);
    drawImage(blur);
  } else {
    image(video, 0, 0, width, height);

    // Reset max values for each frame
    maxX = -Infinity;
    minX = Infinity;
    maxY = -Infinity;
    minY = Infinity;

    // Draw all the tracked face points and find max values
    for (let i = 0; i < faces.length; i++) {
      let face = faces[i];
      for (let j = 0; j < face.keypoints.length; j++) {
        let keypoint = face.keypoints[j];

        // Update maximum values
        maxX = Math.max(maxX, keypoint.x);
        maxY = Math.max(maxY, keypoint.y);
        // Update maximum values
        minX = Math.min(minX, keypoint.x);
        minY = Math.min(minY, keypoint.y);
        // Draw keypoint
        fill(0, 255, 0);
        noStroke();
        circle(keypoint.x, keypoint.y, 5);
      }
    }

    xLen = maxX - minX;
    yLen = maxY - minY;
    if (faces.length > 0) {
      // Estimate distance using face width
      let estimatedDistance = calculateDistance(xLen);

      // Convert measurements to mm using the estimated distance
      let yLenMm = pixelsToMm(yLen, estimatedDistance);
      let xLenMm = pixelsToMm(xLen, estimatedDistance);
      // Log measurements
      console.log("Face measurements (mm):");
      console.log("Height:", yLenMm.toFixed(1));
      console.log("Width:", xLenMm.toFixed(1));
      console.log("Distance:", estimatedDistance.toFixed(1));
    }
  }
}

function drawImage(blurAmount) {
  if (blurAmount < 0) {
    blurAmount = 0;
  }
  image(snellenChartImg, 0, 0, width, height);
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
