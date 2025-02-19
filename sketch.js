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
  if (onSubmit) {
    drawImage();
  }
}

function drawImage() {
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
