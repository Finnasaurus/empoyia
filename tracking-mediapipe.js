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
      minDetectionConfidence: config.minConfidence || 0.5,
      minTrackingConfidence: config.minTrackingConfidence || 0.5
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
      yLen: 0
    };

    // Bind methods
    this.onResults = this.onResults.bind(this);
    this.calculateDistance = this.calculateDistance.bind(this);
    this.pixelsToMm = this.pixelsToMm.bind(this);
    this.getMeasurements = this.getMeasurements.bind(this);
  }

  async initialize(p5Instance) {
    try {
      if (!p5Instance) {
        throw new Error('p5 instance must be provided');
      }

      // Create and configure video first
      this.video = p5Instance.createCapture(p5Instance.VIDEO);
      this.video.size(this.IMAGE_WIDTH_PIXELS, this.IMAGE_HEIGHT_PIXELS);
      this.video.hide();

      // Wait for video to be ready
      await new Promise(resolve => {
        this.video.elt.onloadeddata = resolve;
      });

      // Initialize MediaPipe FaceMesh
      const faceMesh = new FaceMesh({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
        }
      });

      // Configure FaceMesh
      faceMesh.setOptions(this.options);
      
      // Set up the detection callback
      faceMesh.onResults(this.onResults);

      // Create camera input and start detection
      const camera = new Camera(this.video.elt, {
        onFrame: async () => {
          await faceMesh.send({image: this.video.elt});
        },
        width: this.IMAGE_WIDTH_PIXELS,
        height: this.IMAGE_HEIGHT_PIXELS
      });
      
      camera.start();
      this.faceMesh = faceMesh;
      
      return true;
    } catch (error) {
      console.error('Error initializing FaceMeasurement:', error);
      return false;
    }
  }

  onResults(results) {
    if (results.multiFaceLandmarks) {
      this.faces = results.multiFaceLandmarks;
    } else {
      this.faces = [];
    }
  }

  calculateDistance(faceHeightPixels) {
    if (!faceHeightPixels || faceHeightPixels <= 0) return null;
    return (this.FOCAL_LENGTH_MM * this.TYPICAL_FACE_HEIGHT_MM * this.IMAGE_WIDTH_PIXELS) / 
           (faceHeightPixels * this.SENSOR_WIDTH_MM);
  }

  pixelsToMm(pixels, distance) {
    if (!pixels || !distance || distance <= 0) return null;
    return (pixels * distance * this.SENSOR_WIDTH_MM) / 
           (this.FOCAL_LENGTH_MM * this.IMAGE_WIDTH_PIXELS);
  }

  getMeasurements() {
    // Reset measurements
    this.measurements = {
      maxX: -Infinity,
      minX: Infinity,
      maxY: -Infinity,
      minY: Infinity,
      xLen: 0,
      yLen: 0
    };

    // Process face measurements
    if (this.faces && this.faces.length > 0) {
      const face = this.faces[0]; // Get first face
      
      // Find min/max points
      face.forEach(keypoint => {
        if (keypoint && typeof keypoint.x === 'number' && typeof keypoint.y === 'number') {
          // Convert normalized coordinates to pixel coordinates
          const x = keypoint.x * this.IMAGE_WIDTH_PIXELS;
          const y = keypoint.y * this.IMAGE_HEIGHT_PIXELS;
          
          this.measurements.maxX = Math.max(this.measurements.maxX, x);
          this.measurements.maxY = Math.max(this.measurements.maxY, y);
          this.measurements.minX = Math.min(this.measurements.minX, x);
          this.measurements.minY = Math.min(this.measurements.minY, y);
        }
      });

      // Calculate lengths
      this.measurements.xLen = this.measurements.maxX - this.measurements.minX;
      this.measurements.yLen = this.measurements.maxY - this.measurements.minY;

      // Calculate real-world measurements
      const estimatedDistance = this.calculateDistance(this.measurements.yLen);
      const heightMm = this.pixelsToMm(this.measurements.yLen, estimatedDistance);
      const widthMm = this.pixelsToMm(this.measurements.xLen, estimatedDistance);

      return {
        faceHeight: heightMm,
        faceWidth: widthMm,
        distance: estimatedDistance,
        landmarks: face
      };
    }
    
    return null;
  }

  drawFacePoints(p5Instance, pointSize = 5) {
    if (!p5Instance) return;
    
    if (this.faces && this.faces.length > 0) {
      const face = this.faces[0];
      
      face.forEach(keypoint => {
        if (keypoint && typeof keypoint.x === 'number' && typeof keypoint.y === 'number') {
          const x = keypoint.x * this.IMAGE_WIDTH_PIXELS;
          const y = keypoint.y * this.IMAGE_HEIGHT_PIXELS;
          
          p5Instance.fill(0, 255, 0);
          p5Instance.noStroke();
          p5Instance.circle(x, y, pointSize);
        }
      });
    }
  }
}

// Example usage with p5.js
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
  
  // Initialize with p5 instance
  faceMeasurer.initialize(window).then(initialized => {
    if (!initialized) {
      console.error('Failed to initialize face measurement system');
    }
  });
}

function draw() {
  if (!faceMeasurer || !faceMeasurer.video) return;

  // Draw video
  image(faceMeasurer.video, 0, 0, width, height);
  
  // Get measurements
  const measurements = faceMeasurer.getMeasurements();
  
  if (measurements) {
    // Draw measurements on screen
    fill(255);
    noStroke();
    textSize(16);
    text(`Height: ${measurements.faceHeight.toFixed(1)}mm`, 10, 30);
    text(`Width: ${measurements.faceWidth.toFixed(1)}mm`, 10, 50);
    text(`Distance: ${measurements.distance.toFixed(1)}mm`, 10, 70);
  }
  
  // Draw face points
  faceMeasurer.drawFacePoints(window);
}