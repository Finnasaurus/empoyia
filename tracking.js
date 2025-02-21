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

function preload() {
  faceMesh = ml5.faceMesh(options);
}

function setup() {
  createCanvas(640, 480);
  // Create the video and hide it
  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();

  // Start detecting faces from the webcam video
  faceMesh.detectStart(video, gotFaces);
}

function gotFaces(results) {
  faces = results;
}

function draw() {
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
