function pixelsToDistance(pixels) {
  return 0.0002645833 * pixels;
}

function degreesDistToBlur(degrees, objectDistance) {
  //convert degrees to diopters
  //e.g. 300 degrees = 3 diopters
  let diopters = degrees / 100;

  //calulate far point
  let farPoint = 1 / diopters;

  //calculate blur
  //assuming pupil diametter of 4mm
  let pupilDiameter = 4;

  let blur = (pupilDiameter / 2) * abs(1 / degrees - 1 / objectDistance);

  return blur;
}
