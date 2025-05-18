// Cache for loaded section content
const sectionCache = new Map();

// Preload queue
const preloadQueue = new Set();
let isPreloading = false;

// Debug logging
const debug = {
  log: (...args) => console.log('[SectionLoader]', ...args),
  error: (...args) => console.error('[SectionLoader]', ...args)
};

// Preload sections in the background
async function preloadSections() {
  if (isPreloading) return;
  isPreloading = true;

  try {
    for (const id of preloadQueue) {
      if (!sectionCache.has(id)) {
        debug.log(`Preloading section: ${id}`);
        const content = await fetchSection(id);
        sectionCache.set(id, content);
        debug.log(`Successfully preloaded: ${id}`);
      }
      preloadQueue.delete(id);
    }
  } catch (error) {
    debug.error('Error preloading sections:', error);
  } finally {
    isPreloading = false;
  }
}

// Fetch section content
async function fetchSection(id) {
  debug.log(`Fetching section: ${id}`);
  try {
    const url = `sections-html/${id}.html`;
    debug.log(`Fetching from URL: ${url}`);
    const res = await fetch(url);
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    const text = await res.text();
    debug.log(`Successfully fetched section: ${id}, content length: ${text.length}`);
    return text;
  } catch (error) {
    debug.error(`Failed to fetch section: ${id}`, error);
    throw error;
  }
}

// Queue section for preloading
export function preloadSection(id) {
  debug.log(`Queueing section for preload: ${id}`);
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
  debug.log('Starting to load sections:', sectionIds);
  const container = document.getElementById('main-container');
  if (!container) {
    debug.error('Main container not found!');
    return [];
  }

  const loaded = [];

  for (const id of sectionIds) {
    try {
      debug.log(`Loading section: ${id}`);
      let html;
      
      // Check cache first
      if (sectionCache.has(id)) {
        debug.log(`Using cached content for: ${id}`);
        html = sectionCache.get(id);
      } else {
        debug.log(`Fetching fresh content for: ${id}`);
        html = await fetchSection(id);
        sectionCache.set(id, html);
      }

      // Add section to DOM with transition classes
      const tempContainer = document.createElement('div');
      tempContainer.innerHTML = html.trim();
      const section = tempContainer.firstElementChild;
      
      if (section) {
        debug.log(`Adding section to DOM: ${id}`);
        section.classList.add('section-enter');
        container.appendChild(section);

        // Trigger enter animation
        requestAnimationFrame(() => {
          section.classList.add('section-enter-active');
          section.addEventListener('transitionend', () => {
            section.classList.remove('section-enter', 'section-enter-active');
            debug.log(`Section animation complete: ${id}`);
          }, { once: true });
        });

        loaded.push(id);
        debug.log(`Successfully loaded section: ${id}`);
      } else {
        debug.error(`Invalid section HTML for: ${id}`);
      }

      // Preload next sections
      const nextIndex = sectionIds.indexOf(id) + 1;
      if (nextIndex < sectionIds.length) {
        preloadSection(sectionIds[nextIndex]);
      }
    } catch (error) {
      debug.error(`Failed to load section: ${id}`, error);
      // Create error placeholder with retry button
      const errorSection = document.createElement('div');
      errorSection.id = id;
      errorSection.className = 'section-error';
      errorSection.innerHTML = `
        <div class="error-message">
          <p>Failed to load section: ${id}</p>
          <p class="error-details">${error.message}</p>
          <button class="retry-button" onclick="window.location.reload()">Retry</button>
        </div>
      `;
      container.appendChild(errorSection);
    }
  }

  debug.log('Finished loading sections:', loaded);
  return loaded;
}

