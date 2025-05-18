export function initTesseract() {
  console.log('Initializing tesseract...');
  const canvas = document.getElementById('tesseract-bg');
  console.log('Canvas element:', canvas);
  if (!canvas) {
    console.error('Canvas element not found!');
    return;
  }

  const ctx = canvas.getContext('2d');
  console.log('Canvas context:', ctx);
  if (!ctx) {
    console.error('Could not get canvas context!');
    return;
  }

  // Force canvas size to match window
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    console.log(`Canvas size set to: ${canvas.width}x${canvas.height}`);
  }

  // Initial size
  resizeCanvas();

  // Update size on window resize
  window.addEventListener('resize', resizeCanvas);

  // Remove initial feedback grid
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const cube4D = [];
  for (let i = 0; i < 16; i++) {
    const scale = 1.5;
    cube4D.push([
      (i & 1 ? 1 : -1) * scale,
      (i & 2 ? 1 : -1) * scale,
      (i & 4 ? 1 : -1) * scale,
      (i & 8 ? 1 : -1) * scale
    ]);
  }

  const morphTarget1 = [], morphTarget2 = [];
  for (let i = 0; i < 16; i++) {
    const t = i / 16;
    const theta = t * Math.PI * 2;
    const phi = t * Math.PI;
    morphTarget1.push([
      Math.sin(theta) * Math.cos(phi) * 2,
      Math.sin(theta) * Math.sin(phi) * 2,
      Math.cos(theta) * 2,
      Math.sin(phi)
    ]);
    morphTarget2.push([
      Math.sin(theta * 3) * 2,
      Math.cos(theta * 3) * 2,
      Math.sin(theta * 1.5) * 2,
      Math.cos(theta * 1.5)
    ]);
  }

  function project([x, y, z, w]) {
    const scale4d = 1 / (w * 0.3 + 2);
    const scale3d = Math.min(canvas.width, canvas.height) * 0.7;
    return {
      x: canvas.width / 2 + x * scale4d * scale3d,
      y: canvas.height / 2 + y * scale4d * scale3d
    };
  }

  function interpolate(a, b, t) {
    return a.map((val, i) => val * (1 - t) + b[i] * t);
  }

  function chainMorph(a, b, c, t) {
    return t < 0.5
      ? interpolate(a, b, t * 2)
      : interpolate(b, c, (t - 0.5) * 2);
  }

  let pulsePhase = 0;
  let depthPhase = 0;
  
  function getStrokeColor() {
    // Create a more visible pulsing effect
    const baseOpacity = 0.3; // Increased from 0.25
    const pulseStrength = 0.15; // Increased from 0.12
    const opacity = baseOpacity + Math.sin(pulsePhase) * pulseStrength;
    return `rgba(0, 102, 204, ${opacity})`;
  }

  let time = 0;
  let frameCount = 0;

  function animate() {
    frameCount++;
    if (frameCount === 1) {
      console.log('First animation frame');
    }

    // Clear with solid white
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    time += 0.005; // Slower rotation
    pulsePhase += 0.02; // Control pulse speed
    depthPhase += 0.01; // Control depth pulse speed
    
    const angle = time * 0.5;
    const morphT = (Math.sin(time * 0.2) + 1) / 2;
    
    // Add depth pulsing effect
    const depthPulse = Math.sin(depthPhase) * 0.3;
    const scale = 1.5 + depthPulse;

    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    const morphed = cube4D.map((pt, i) => {
      const morphedPoint = chainMorph(pt, morphTarget1[i], morphTarget2[i], morphT);
      // Apply depth pulse to the morphed points
      return morphedPoint.map(coord => coord * scale);
    });

    const rotated = morphed.map(([x, y, z, w]) => {
      const xw = x * cos - w * sin;
      const yw = y * Math.cos(angle * 0.5) - z * Math.sin(angle * 0.5);
      const zw = y * Math.sin(angle * 0.5) + z * Math.cos(angle * 0.5);
      const ww = x * sin + w * cos;
      return [xw, yw, zw, ww];
    });

    const projected = rotated.map(project);

    // Enhanced shadow effect
    ctx.shadowBlur = 8; // Increased from 7
    ctx.shadowColor = 'rgba(0, 102, 204, 0.22)'; // Increased from 0.18
    ctx.strokeStyle = getStrokeColor();
    ctx.lineWidth = 1.0; // Increased from 0.9

    // Draw with enhanced distance-based opacity
    for (let i = 0; i < 16; i++) {
      for (let j = i + 1; j < 16; j++) {
        const diff = i ^ j;
        if (diff && !(diff & (diff - 1))) {
          const dist = Math.hypot(
            projected[i].x - projected[j].x,
            projected[i].y - projected[j].y
          );
          const maxDist = Math.min(canvas.width, canvas.height) * 0.7;
          const opacity = 1 - (dist / maxDist) * 0.5;
          
          // Add subtle color variation based on depth
          const depthColor = Math.sin(depthPhase + dist * 0.01) * 20;
          
          ctx.beginPath();
          ctx.strokeStyle = `rgba(${depthColor}, 102, ${204 + depthColor}, ${opacity * 0.4})`; // Increased from 0.35 and added color variation
          ctx.moveTo(projected[i].x, projected[i].y);
          ctx.lineTo(projected[j].x, projected[j].y);
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(animate);
  }

  console.log('Starting animation loop...');
  animate();
}




