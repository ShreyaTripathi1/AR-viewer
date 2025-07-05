let selectedModelUrl = null;
let arModel = null;
let isDragging = false;
let previousX = 0;
let previousY = 0;

function selectModel(url) {
  selectedModelUrl = url;
  console.log("Selected model:", url); // Debug log
  document.querySelectorAll('.product-option img').forEach(img => img.classList.remove('selected'));
  event.target.classList.add('selected');
  document.getElementById('arButton').disabled = false;
}

document.getElementById('arButton').addEventListener('click', () => {
  if (!selectedModelUrl) {
    alert('Please select a product first.');
    return;
  }
  const arContainer = document.getElementById('arContainer');
  const closeButton = document.getElementById('closeButton');
  const arScene = document.createElement('a-scene');
  arScene.setAttribute('embedded', '');
  arScene.setAttribute('arjs', 'sourceType: webcam; debugUIEnabled: false; trackingMethod: best;');

  const assets = document.createElement('a-assets');
  const model1 = document.createElement('a-asset-item');
  model1.setAttribute('id', 'model1');
  model1.setAttribute('src', '/assets/model1.glb');
  const model2 = document.createElement('a-asset-item');
  model2.setAttribute('id', 'model2');
  model2.setAttribute('src', '/assets/model2.glb');
  assets.appendChild(model1);
  assets.appendChild(model2);
  arScene.appendChild(assets);

  arModel = document.createElement('a-entity');
  arModel.setAttribute('id', 'arModel');
  arModel.setAttribute('scale', '0.1 0.1 0.1'); // Smaller initial scale
  arModel.setAttribute('position', '0 0 -2'); // Position further back
  arModel.setAttribute('gltf-model', selectedModelUrl);
  arScene.appendChild(arModel);

  const camera = document.createElement('a-camera');
  arScene.appendChild(camera);

  // Clear previous scene but preserve close button
  while (arContainer.firstChild && arContainer.firstChild !== closeButton) {
    arContainer.removeChild(arContainer.firstChild);
  }
  arContainer.insertBefore(arScene, closeButton); // Insert scene before close button
  arContainer.style.display = 'block';
  document.querySelector('.product-selection').style.display = 'none';
  document.getElementById('arButton').style.display = 'none';

  // Add zoom and rotation controls
  arScene.addEventListener('loaded', () => {
    // Zoom controls
    arScene.addEventListener('wheel', (event) => {
      event.preventDefault();
      let scale = parseFloat(arModel.getAttribute('scale').x);
      scale += event.deltaY * -0.001; // Zoom with mouse wheel
      scale = Math.max(0.05, Math.min(0.5, scale)); // Limit scale between 0.05 and 0.5
      arModel.setAttribute('scale', `${scale} ${scale} ${scale}`);
    });

    arScene.addEventListener('touchmove', (event) => {
      if (event.touches.length === 2) {
        event.preventDefault();
        const touch1 = event.touches[0];
        const touch2 = event.touches[1];
        const distance = Math.hypot(touch2.pageX - touch1.pageX, touch2.pageY - touch1.pageY);
        if (!arScene.dataset.prevDistance) arScene.dataset.prevDistance = distance;
        let scale = parseFloat(arModel.getAttribute('scale').x);
        const delta = (distance - arScene.dataset.prevDistance) * 0.001;
        scale += delta;
        scale = Math.max(0.05, Math.min(0.5, scale)); // Limit scale
        arModel.setAttribute('scale', `${scale} ${scale} ${scale}`);
        arScene.dataset.prevDistance = distance;
      }
    });

    // Rotation controls
    arScene.addEventListener('mousedown', (event) => {
      isDragging = true;
      previousX = event.clientX;
      previousY = event.clientY;
    });

    arScene.addEventListener('mousemove', (event) => {
      if (isDragging) {
        const deltaX = event.clientX - previousX;
        const deltaY = event.clientY - previousY;
        const rotation = arModel.getAttribute('rotation') || { x: 0, y: 0, z: 0 };
        rotation.y += deltaX * 0.5; // Rotate around Y-axis
        rotation.x += deltaY * 0.5; // Rotate around X-axis
        arModel.setAttribute('rotation', `${rotation.x} ${rotation.y} ${rotation.z}`);
        previousX = event.clientX;
        previousY = event.clientY;
      }
    });

    arScene.addEventListener('mouseup', () => {
      isDragging = false;
    });

    arScene.addEventListener('touchstart', (event) => {
      if (event.touches.length === 1) {
        isDragging = true;
        previousX = event.touches[0].clientX;
        previousY = event.touches[0].clientY;
      }
    });

    arScene.addEventListener('touchmove', (event) => {
      if (event.touches.length === 1 && isDragging) {
        const touch = event.touches[0];
        const deltaX = touch.clientX - previousX;
        const deltaY = touch.clientY - previousY;
        const rotation = arModel.getAttribute('rotation') || { x: 0, y: 0, z: 0 };
        rotation.y += deltaX * 0.5; // Rotate around Y-axis
        rotation.x += deltaY * 0.5; // Rotate around X-axis
        arModel.setAttribute('rotation', `${rotation.x} ${rotation.y} ${rotation.z}`);
        previousX = touch.clientX;
        previousY = touch.clientY;
      }
    });

    arScene.addEventListener('touchend', () => {
      isDragging = false;
    });
  });
});

document.getElementById('closeButton').addEventListener('click', () => {
  const arContainer = document.getElementById('arContainer');
  arContainer.style.display = 'none';
  document.querySelector('.product-selection').style.display = 'flex';
  document.getElementById('arButton').style.display = 'block';
  document.getElementById('arButton').disabled = true; // Reset button state
  selectedModelUrl = null; // Reset selection
  while (arContainer.firstChild && arContainer.firstChild !== closeButton) {
    arContainer.removeChild(arContainer.firstChild);
  }
  arModel = null; // Reset model reference
});