export function getBasicMaterial(color, opacity) {
  return new THREE.MeshBasicMaterial({
    // color: 0xffffff,
    color: color,//new THREE.Color(r, g, b),
    opacity: opacity,
    side: THREE.DoubleSide,
    transparent: true
  });
}

export function getLineMaterial(linewidth, color, opacity) {
  return new THREE.LineBasicMaterial({
    // color: 0xffffff,
    linewidth: linewidth,
    color: color,//new THREE.Color(r, g, b),
    // opacity: opacity,
    // transparent: true
  });
}