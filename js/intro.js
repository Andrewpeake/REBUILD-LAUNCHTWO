export function initIntro() {
  return new Promise((resolve) => {
    console.log('intro.js: Starting locked intro');

    // Track mouse position
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let isPressed = false;

    const introOverlay = document.createElement('div');
    introOverlay.style.position = 'fixed';
    introOverlay.style.top = '0';
    introOverlay.style.left = '0';
    introOverlay.style.width = '100%';
    introOverlay.style.height = '100%';
    introOverlay.style.background = '#ffffff';
    introOverlay.style.display = 'flex';
    introOverlay.style.justifyContent = 'center';
    introOverlay.style.alignItems = 'center';
    introOverlay.style.zIndex = '9999';
    introOverlay.style.willChange = 'opacity, transform, filter';
    introOverlay.style.pointerEvents = 'auto'; // Changed to allow interaction
    introOverlay.style.perspective = '500px';
    introOverlay.style.overflow = 'hidden';

    // Mouse event handlers
    const handleMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (isPressed) {
        updateElementPositions();
      }
    };

    const handleMouseDown = () => {
      isPressed = true;
      introOverlay.style.cursor = 'grabbing';
      updateElementPositions();
    };

    const handleMouseUp = () => {
      isPressed = false;
      introOverlay.style.cursor = 'grab';
      resetElementPositions();
    };

    // Add event listeners
    introOverlay.addEventListener('mousemove', handleMouseMove);
    introOverlay.addEventListener('mousedown', handleMouseDown);
    introOverlay.addEventListener('mouseup', handleMouseUp);
    introOverlay.addEventListener('mouseleave', handleMouseUp);
    introOverlay.style.cursor = 'grab';

    // Function to calculate distance between two points
    const getDistance = (x1, y1, x2, y2) => {
      return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    };

    // Function to update element positions based on mouse
    const updateElementPositions = () => {
      const maxDistance = 300; // Maximum distance for influence
      const strength = 0.3; // Strength of the pull effect

      // Update flight paths
      flightPaths.forEach(({path}) => {
        const rect = path.getBoundingClientRect();
        const pathCenterX = rect.left + rect.width / 2;
        const pathCenterY = rect.top + rect.height / 2;
        
        const distance = getDistance(mouseX, mouseY, pathCenterX, pathCenterY);
        if (distance < maxDistance) {
          const pull = (1 - distance / maxDistance) * strength;
          const deltaX = (mouseX - pathCenterX) * pull;
          const deltaY = (mouseY - pathCenterY) * pull;
          
          gsap.to(path, {
            x: `+=${deltaX}`,
            y: `+=${deltaY}`,
            duration: 0.3,
            ease: 'power2.out'
          });
        }
      });

      // Update rings
      rings.forEach((ring) => {
        const rect = ring.getBoundingClientRect();
        const ringCenterX = rect.left + rect.width / 2;
        const ringCenterY = rect.top + rect.height / 2;
        
        const distance = getDistance(mouseX, mouseY, ringCenterX, ringCenterY);
        if (distance < maxDistance) {
          const pull = (1 - distance / maxDistance) * strength;
          const deltaX = (mouseX - ringCenterX) * pull;
          const deltaY = (mouseY - ringCenterY) * pull;
          
          gsap.to(ring, {
            x: deltaX,
            y: deltaY,
            duration: 0.3,
            ease: 'power2.out'
          });
        }
      });
    };

    // Function to reset elements to original positions
    const resetElementPositions = () => {
      flightPaths.forEach(({path}) => {
        gsap.to(path, {
          x: 0,
          y: 0,
          duration: 0.6,
          ease: 'elastic.out(1, 0.5)'
        });
      });

      rings.forEach((ring) => {
        gsap.to(ring, {
          x: 0,
          y: 0,
          duration: 0.6,
          ease: 'elastic.out(1, 0.5)'
        });
      });
    };

    // Create flight path container
    const flightPathContainer = document.createElement('div');
    flightPathContainer.style.position = 'absolute';
    flightPathContainer.style.top = '0';
    flightPathContainer.style.left = '0';
    flightPathContainer.style.width = '100%';
    flightPathContainer.style.height = '100%';
    flightPathContainer.style.opacity = '0';
    flightPathContainer.style.zIndex = '1';

    // Create multiple flight paths
    const createFlightPath = (color, width, delay) => {
      const path = document.createElement('div');
      path.style.position = 'absolute';
      path.style.width = width;
      path.style.height = '2px';
      path.style.background = `linear-gradient(90deg, transparent, ${color}, transparent)`;
      path.style.opacity = '0';
      path.style.transform = 'rotate(-35deg) scale(0)';
      path.style.willChange = 'transform'; // Optimize for animations
      return { path, delay };
    };

    // Create flight paths with different properties
    const flightPaths = [
      createFlightPath('rgba(0, 150, 255, 0.4)', '60%', 0),
      createFlightPath('rgba(0, 200, 255, 0.3)', '70%', 0.2),
      createFlightPath('rgba(0, 100, 255, 0.2)', '80%', 0.4)
    ];

    // Add flight paths to container
    flightPaths.forEach(({path}) => flightPathContainer.appendChild(path));
    introOverlay.appendChild(flightPathContainer);

    // Create energy rings (keeping these but modifying colors)
    const createEnergyRing = (color, size) => {
      const ring = document.createElement('div');
      ring.style.position = 'absolute';
      ring.style.top = '50%';
      ring.style.left = '50%';
      ring.style.transform = 'translate(-50%, -50%) scale(0)';
      ring.style.width = size;
      ring.style.height = size;
      ring.style.border = `2px solid ${color}`;
      ring.style.borderRadius = '50%';
      ring.style.opacity = '0';
      ring.style.zIndex = '2';
      return ring;
    };

    const rings = [
      createEnergyRing('rgba(0, 150, 255, 0.3)', '100px'),
      createEnergyRing('rgba(0, 200, 255, 0.2)', '200px'),
      createEnergyRing('rgba(0, 100, 255, 0.1)', '300px')
    ];

    rings.forEach(ring => introOverlay.appendChild(ring));

    const helloContainer = document.createElement('div');
    helloContainer.style.display = 'flex';
    helloContainer.style.gap = '0.25rem';
    helloContainer.style.willChange = 'transform, opacity, filter';
    helloContainer.style.transformStyle = 'preserve-3d';
    helloContainer.style.filter = 'blur(0px) brightness(1) contrast(1)';
    helloContainer.style.position = 'relative';
    helloContainer.style.zIndex = '3';

    const letters = ['h', 'e', 'l', 'l', 'o'].map((char, i) => {
      const span = document.createElement('span');
      span.textContent = char;
      span.style.fontFamily = "'Orbitron', sans-serif";
      span.style.fontSize = '2.5rem';
      span.style.fontWeight = '700';
      span.style.color = '#000';
      span.style.display = 'inline-block';
      span.style.opacity = '0';
      span.style.transform = i === 1 || i === 3 ? 'translateY(-100px)' : 'translateY(100px)';
      span.style.willChange = 'transform, opacity';
      span.style.transformStyle = 'preserve-3d';
      span.style.perspective = '1000px';
      return span;
    });

    letters.forEach(letter => helloContainer.appendChild(letter));
    introOverlay.appendChild(helloContainer);
    document.body.appendChild(introOverlay);

    // Animation sequence
    gsap.to(letters, {
      opacity: 1,
      y: 0,
      duration: 1.2,
      stagger: 0.2,
      ease: 'power3.out',
      delay: 0.5,
      onComplete: () => {
        gsap.to(helloContainer, {
          scale: 1.1,
          rotationX: 15,
          duration: 0.4,
          ease: 'power1.out',
          onComplete: () => {
            // Animate flight paths
            flightPaths.forEach(({path, delay}) => {
              gsap.to(path, {
                opacity: 1,
                scale: 1,
                duration: 1.5,
                delay: delay,
                ease: 'power2.out'
              });

              // Continuous movement animation
              gsap.to(path, {
                x: '100%',
                duration: 3,
                ease: 'none',
                repeat: -1,
                delay: delay
              });
            });

            gsap.to(flightPathContainer, {
              opacity: 0.8,
              duration: 1.5,
              ease: 'power2.in'
            });

            // Animate energy rings
            rings.forEach((ring, i) => {
              gsap.to(ring, {
                opacity: 1,
                scale: 1,
                duration: 1 + i * 0.3,
                ease: 'power2.out',
                delay: i * 0.2
              });

              gsap.to(ring, {
                scale: 2,
                opacity: 0,
                duration: 2,
                ease: 'power1.inOut',
                repeat: -1,
                delay: i * 0.2
              });
            });

            gsap.to(introOverlay, {
              perspective: '150px',
              duration: 2,
              ease: 'power2.in'
            });
            
            const tl = gsap.timeline();
            
            tl.to(helloContainer, {
              z: 300,
              scale: 2,
              rotationY: 90,
              rotationX: 45,
              filter: 'blur(5px) brightness(1.5) contrast(1.2)',
              duration: 1,
              ease: 'power2.in'
            }).to(helloContainer, {
              z: 1500,
              scale: 8,
              rotationY: 180,
              rotationX: 60,
              filter: 'blur(10px) brightness(2) contrast(1.5)',
              duration: 1,
              ease: 'power2.in',
              onComplete: () => {
                gsap.to(helloContainer, {
                  filter: 'blur(20px) brightness(3) contrast(2)',
                  duration: 0.3,
                  ease: 'power4.in',
                });

                rings.forEach((ring, i) => {
                  gsap.to(ring, {
                    scale: 10,
                    opacity: 0,
                    duration: 1.5,
                    ease: 'power2.out',
                    delay: i * 0.1
                  });
                });

                gsap.to(introOverlay, {
                  opacity: 0,
                  duration: 1.8,
                  ease: 'power2.inOut',
                  delay: 0.2,
                  onComplete: finalAnimation,
                });

                const maskTimeline = gsap.timeline();
                maskTimeline
                  .to(introOverlay, {
                    webkitMaskImage: 'radial-gradient(circle at center, transparent 0%, white 20%, white 100%)',
                    webkitMaskSize: '120% 120%',
                    duration: 0.5,
                    ease: 'power2.in'
                  })
                  .to(introOverlay, {
                    webkitMaskImage: 'radial-gradient(circle at center, transparent 80%, white 100%)',
                    webkitMaskSize: '400% 400%',
                    duration: 1.3,
                    ease: 'power2.out'
                  });
              },
            });
          },
        });
      },
    });

    // Cleanup function
    const cleanup = () => {
      introOverlay.removeEventListener('mousemove', handleMouseMove);
      introOverlay.removeEventListener('mousedown', handleMouseDown);
      introOverlay.removeEventListener('mouseup', handleMouseUp);
      introOverlay.removeEventListener('mouseleave', handleMouseUp);
    };

    // Add cleanup to the final animation
    const finalAnimation = () => {
      cleanup();
      introOverlay.remove();
      console.log('intro.js: Intro complete');
      resolve();
    };
  });
}








