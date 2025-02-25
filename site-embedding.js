let iframe;
let urlInput;
let loadButton;
let defaultUrl = "https://p5js.org";
let canvasWidth = 800;
let canvasHeight = 600;

function setup() {
  createCanvas(canvasWidth, canvasHeight);
  background(240);

  // Create a paragraph for instructions
  let instructions = createP(
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
  let container = createDiv("");
  container.position(20, 100);
  container.size(canvasWidth - 40, canvasHeight - 120);
  container.id("iframe-container");

  // Create the iframe initially
  createIframe(defaultUrl);

  // Add some styling
  let css = `
    body {
      padding: 0;
      margin: 0;
      font-family: Arial, sans-serif;
    }
    #iframe-container {
      border: 1px solid #ccc;
      overflow: hidden;
    }
    iframe {
      width: 100%;
      height: 100%;
      border: none;
    }
    button {
      background-color: #4CAF50;
      border: none;
      color: white;
      padding: 8px 16px;
      text-align: center;
      text-decoration: none;
      display: inline-block;
      font-size: 14px;
      margin: 4px 2px;
      cursor: pointer;
      border-radius: 4px;
    }
    button:hover {
      background-color: #45a049;
    }
    input {
      padding: 8px;
      border: 1px solid #ccc;
      border-radius: 4px;
    }
  `;

  let style = createElement("style", css);

  // Add alternative sites dropdown
  let sitesLabel = createP("Or select a site known to work with embedding:");
  sitesLabel.position(20, 90);

  let sitesSelect = createSelect();
  sitesSelect.position(330, 90);
  sitesSelect.option("p5.js", "https://p5js.org");
  sitesSelect.option("Wikipedia", "https://en.wikipedia.org");
  sitesSelect.option("OpenProcessing", "https://www.openprocessing.org");
  sitesSelect.option("NASA", "https://www.nasa.gov");
  sitesSelect.changed(() => {
    urlInput.value(sitesSelect.value());
    loadWebsite();
  });
}

function draw() {
  // p5.js needs a draw function, but we don't need to repeatedly draw
  // We'll just use it to update information about the iframe
  if (frameCount % 30 === 0) {
    // Update every half second
    let containerElement = select("#iframe-container");
    let iframe = select("iframe");

    if (iframe) {
      fill(240);
      noStroke();
      rect(0, 0, width, 40);

      fill(0);
      textSize(12);
      text("Current site: " + urlInput.value(), 20, 30);
    }
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

  // Add error handling
  iframe.elt.onerror = function () {
    console.log("Error loading iframe");
  };
}
