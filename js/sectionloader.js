// Cache for loaded section content
const sectionCache = new Map();

// Preload queue
const preloadQueue = new Set();
let isPreloading = false;

// Preload sections in the background
async function preloadSections() {
  if (isPreloading) return;
  isPreloading = true;

  try {
    for (const id of preloadQueue) {
      if (!sectionCache.has(id)) {
        const content = await fetchSection(id);
        sectionCache.set(id, content);
      }
      preloadQueue.delete(id);
    }
  } catch (error) {
    console.error('Error preloading sections:', error);
  } finally {
    isPreloading = false;
  }
}

// Fetch section content
async function fetchSection(id) {
  try {
    const res = await fetch(`sections-html/${id}.html`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.text();
  } catch (error) {
    console.error(`Failed to fetch section: ${id}`, error);
    throw error;
  }
}

// Queue section for preloading
export function preloadSection(id) {
  if (!sectionCache.has(id)) {
    preloadQueue.add(id);
    // Start preloading in the background with fallback for Safari
    const requestIdleCallbackFallback = window.requestIdleCallback || 
      function(cb) {
        const start = Date.now();
        return setTimeout(function() {
          cb({
            didTimeout: false,
            timeRemaining: function() {
              return Math.max(0, 50 - (Date.now() - start));
            }
          });
        }, 1);
      };
    
    requestIdleCallbackFallback(() => preloadSections());
  }
}

// Load sections with caching
export async function loadSections(sectionIds) {
  const container = document.getElementById('main-container');
  if (!container) return [];

  const loaded = [];

  for (const id of sectionIds) {
    try {
      let html;
      
      // Check cache first
      if (sectionCache.has(id)) {
        html = sectionCache.get(id);
      } else {
        html = await fetchSection(id);
        sectionCache.set(id, html);
      }

      // Add section to DOM with transition classes
      const tempContainer = document.createElement('div');
      tempContainer.innerHTML = html;
      const section = tempContainer.firstElementChild;
      
      if (section) {
        section.classList.add('section-enter');
        container.appendChild(section);

        // Trigger enter animation
        requestAnimationFrame(() => {
          section.classList.add('section-enter-active');
          section.addEventListener('transitionend', () => {
            section.classList.remove('section-enter', 'section-enter-active');
          }, { once: true });
        });
      }

      loaded.push(id);

      // Preload next sections
      const nextIndex = sectionIds.indexOf(id) + 1;
      if (nextIndex < sectionIds.length) {
        preloadSection(sectionIds[nextIndex]);
      }
    } catch (error) {
      console.error(`Failed to load section: ${id}`, error);
      // Create error placeholder
      const errorSection = document.createElement('div');
      errorSection.id = id;
      errorSection.className = 'section-error';
      errorSection.innerHTML = `
        <div class="error-message">
          <p>Failed to load section: ${id}</p>
          <button onclick="window.location.reload()">Retry</button>
        </div>
      `;
      container.appendChild(errorSection);
    }
  }

  return loaded;
}

