class FaceMeasurement {
  constructor(config = {}) {
    // Default camera parameters
    this.FOCAL_LENGTH_MM = config.focalLength || 50;
    this.SENSOR_WIDTH_MM = config.sensorWidth || 4.5;
    this.IMAGE_WIDTH_PIXELS = config.imageWidth || 640;
    this.IMAGE_HEIGHT_PIXELS = config.imageHeight || 480;
    this.TYPICAL_FACE_HEIGHT_MM = config.typicalFaceHeight || 200;

    // FaceMesh configuration
    this.options = {
      maxFaces: config.maxFaces || 1,
      refineLandmarks: config.refineLandmarks || false,
      flipped: config.flipped || false,
    };

    // Initialize variables
    this.faceMesh = null;
    this.video = null;
    this.faces = [];
    this.measurements = {
      maxX: 0,
      maxY: 0,
      minX: Infinity,
      minY: Infinity,
      xLen: 0,
      yLen: 0,
    };

    // Bind methods
    this.gotFaces = this.gotFaces.bind(this);
    this.calculateDistance = this.calculateDistance.bind(this);
    this.pixelsToMm = this.pixelsToMm.bind(this);
    this.getMeasurements = this.getMeasurements.bind(this);
  }

  async initialize() {
    // Initialize faceMesh
    this.faceMesh = await ml5.faceMesh(this.options);
    console.log("FaceMesh initialized");

    // Create and configure video
    this.video = createCapture(VIDEO);
    this.video.size(this.IMAGE_WIDTH_PIXELS, this.IMAGE_HEIGHT_PIXELS);
    this.video.hide();
    console.log("Video initialized");

    // Start face detection
    this.faceMesh.detectStart(this.video, this.gotFaces);
    console.log("Face detection started");
  }

  gotFaces(results) {
    this.faces = results;
  }

  calculateDistance(faceHeightPixels) {
    return (
      (this.FOCAL_LENGTH_MM *
        this.TYPICAL_FACE_HEIGHT_MM *
        this.IMAGE_WIDTH_PIXELS) /
      (faceHeightPixels * this.SENSOR_WIDTH_MM)
    );
  }

  pixelsToMm(pixels, distance) {
    return (
      (pixels * distance * this.SENSOR_WIDTH_MM) /
      (this.FOCAL_LENGTH_MM * this.IMAGE_WIDTH_PIXELS)
    );
  }

  getMeasurements() {
    // Reset measurements
    this.measurements.maxX = -Infinity;
    this.measurements.minX = Infinity;
    this.measurements.maxY = -Infinity;
    this.measurements.minY = Infinity;

    // Process face measurements
    if (this.faces.length > 0) {
      const face = this.faces[0]; // Get first face

      // Find min/max points
      face.keypoints.forEach((keypoint) => {
        this.measurements.maxX = Math.max(this.measurements.maxX, keypoint.x);
        this.measurements.maxY = Math.max(this.measurements.maxY, keypoint.y);
        this.measurements.minX = Math.min(this.measurements.minX, keypoint.x);
        this.measurements.minY = Math.min(this.measurements.minY, keypoint.y);
      });

      // Calculate lengths
      this.measurements.xLen = this.measurements.maxX - this.measurements.minX;
      this.measurements.yLen = this.measurements.maxY - this.measurements.minY;

      // Calculate real-world measurements
      const estimatedDistance = this.calculateDistance(this.measurements.xLen);
      const heightMm = this.pixelsToMm(
        this.measurements.yLen,
        estimatedDistance
      );
      const widthMm = this.pixelsToMm(
        this.measurements.xLen,
        estimatedDistance
      );

      return {
        faceHeight: heightMm,
        faceWidth: widthMm,
        distance: estimatedDistance,
        keypoints: face.keypoints,
      };
    }

    return null;
  }

  drawFacePoints(p5Instance, pointSize = 5) {
    if (this.faces.length > 0) {
      const face = this.faces[0];

      face.keypoints.forEach((keypoint) => {
        p5Instance.fill(0, 255, 0);
        p5Instance.noStroke();
        p5Instance.circle(keypoint.x, keypoint.y, pointSize);
      });
    }
  }
}

// Usage example:
/*
let faceMeasurer;

function setup() {
  createCanvas(640, 480);
  
  // Initialize with custom parameters if needed
  faceMeasurer = new FaceMeasurement({
    focalLength: 50,
    sensorWidth: 4.5,
    imageWidth: 640,
    imageHeight: 480,
    typicalFaceHeight: 200,
    maxFaces: 1
  });
  
  faceMeasurer.initialize();
}

function draw() {
  // Draw video
  image(faceMeasurer.video, 0, 0, width, height);
  
  // Get measurements
  const measurements = faceMeasurer.getMeasurements();
  
  if (measurements) {
    console.log("Face measurements (mm):");
    console.log("Height:", measurements.faceHeight.toFixed(1));
    console.log("Width:", measurements.faceWidth.toFixed(1));
    console.log("Distance:", measurements.distance.toFixed(1));
  }
  
  // Draw face points
  faceMeasurer.drawFacePoints(this);
}
*/
