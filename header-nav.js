// header-nav.js - Consistent header and footer for all pages
import { initializeThemeSystem } from './theme-manager.js';

/**
 * Initializes the header navigation with the current page highlighted
 * @param {string} currentPage - The ID of the current page (dashboard, cheatsheet, mockdraft, flashcards)
 */
export function initializeHeader(currentPage) {
  const header = document.createElement('header');
  header.className = 'bg-gray-800 shadow-md border-b border-gray-700';
  
  // Create the header content with navigation
  header.innerHTML = `
    <div class="container mx-auto px-4 py-3">
      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <a href="index.html" class="flex items-center">
            <img src="AeroVista-Logo.png" alt="FantasyForge Logo" class="h-9 w-9 mr-3">
            <span class="text-xl font-bold text-white tracking-wide">FantasyForge</span>
          </a>
        </div>
        
        <nav class="flex items-center space-x-1 md:space-x-4">
          <a href="dashboard.html" class="nav-link ${currentPage === 'dashboard' ? 'active' : ''}" id="nav-dashboard">
            <span class="nav-icon">🏠</span> Dashboard
          </a>
          <a href="cheat-sheet.html" class="nav-link ${currentPage === 'cheatsheet' ? 'active' : ''}" id="nav-cheatsheet">
            <span class="nav-icon">📋</span> Cheat Sheet
          </a>
          <a href="mock-draft.html" class="nav-link ${currentPage === 'mockdraft' ? 'active' : ''}" id="nav-mockdraft">
            <span class="nav-icon">🎮</span> Mock Draft
          </a>
          <a href="flashcards.html" class="nav-link ${currentPage === 'flashcards' ? 'active' : ''}" id="nav-flashcards">
            <span class="nav-icon">📇</span> Flashcards
          </a>
          <div class="hidden md:block ml-2 relative">
            <input id="global-search-input" type="text" placeholder="Search players..." class="bg-gray-700 text-white text-sm rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-cyan-400 w-40 lg:w-56">
            <div id="global-search-results" class="absolute mt-1 w-full bg-gray-800 text-white rounded-md z-20 max-h-72 overflow-y-auto shadow-lg border border-gray-600 hidden"></div>
          </div>
          <div class="theme-switcher ml-2">
            <button id="theme-toggle" class="theme-toggle flex items-center justify-center w-8 h-8 rounded-full bg-gray-700 text-white shadow-lg" title="Change Theme" aria-label="Toggle theme selection menu">
              <span>🎨</span>
            </button>
            <div id="theme-dropdown" class="hidden absolute right-4 mt-2 py-2 w-48 bg-gray-800 rounded-md shadow-xl z-20">
              <div class="px-4 py-2 text-sm text-gray-300 border-b border-gray-700">Select Theme</div>
              <div class="theme-option-group px-2 py-1">
                <div class="theme-option-heading text-xs text-gray-500 uppercase tracking-wider py-1">NFL Team Themes</div>
                <div class="theme-option" data-theme="cardinals">
                  <div class="flex items-center p-2 hover:bg-gray-700 rounded">
                    <div class="w-4 h-4 bg-red-700 mr-2 rounded"></div>
                    <span>Cardinals</span>
                  </div>
                </div>
                <div class="theme-option" data-theme="chiefs">
                  <div class="flex items-center p-2 hover:bg-gray-700 rounded">
                    <div class="w-4 h-4 bg-red-600 mr-2 rounded"></div>
                    <span>Chiefs</span>
                  </div>
                </div>
                <div class="theme-option" data-theme="cowboys">
                  <div class="flex items-center p-2 hover:bg-gray-700 rounded">
                    <div class="w-4 h-4 bg-blue-800 mr-2 rounded"></div>
                    <span>Cowboys</span>
                  </div>
                </div>
                <div class="theme-option" data-theme="packers">
                  <div class="flex items-center p-2 hover:bg-gray-700 rounded">
                    <div class="w-4 h-4 bg-green-700 mr-2 rounded"></div>
                    <span>Packers</span>
                  </div>
                </div>
                <div class="theme-option" data-theme="seahawks">
                  <div class="flex items-center p-2 hover:bg-gray-700 rounded">
                    <div class="w-4 h-4 bg-teal-600 mr-2 rounded"></div>
                    <span>Seahawks</span>
                  </div>
                </div>
                <div class="theme-option" data-theme="steelers">
                  <div class="flex items-center p-2 hover:bg-gray-700 rounded">
                    <div class="w-4 h-4 bg-yellow-500 mr-2 rounded"></div>
                    <span>Steelers</span>
                  </div>
                </div>
                <div class="theme-option" data-theme="niners">
                  <div class="flex items-center p-2 hover:bg-gray-700 rounded">
                    <div class="w-4 h-4 bg-red-800 mr-2 rounded"></div>
                    <span>49ers</span>
                  </div>
                </div>
                <div class="theme-option" data-theme="patriots">
                  <div class="flex items-center p-2 hover:bg-gray-700 rounded">
                    <div class="w-4 h-4 bg-blue-900 mr-2 rounded"></div>
                    <span>Patriots</span>
                  </div>
                </div>
              </div>
              <div class="theme-option-group px-2 py-1 border-t border-gray-700">
                <div class="theme-option-heading text-xs text-gray-500 uppercase tracking-wider py-1">Default Theme</div>
                <div class="theme-option" data-theme="default">
                  <div class="flex items-center p-2 hover:bg-gray-700 rounded">
                    <div class="w-4 h-4 bg-gray-900 mr-2 rounded"></div>
                    <span>Default (NFL Blue)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </nav>
      </div>
    </div>
  `;
  
  // Add styles for the navigation
  const style = document.createElement('style');
  style.textContent = `
    .nav-link {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 0.5rem;
      color: #9ca3af;
      font-size: 0.875rem;
      border-radius: 0.375rem;
      transition: all 0.2s;
    }
    
    .nav-link:hover {
      color: white;
      background-color: rgba(255,255,255,0.05);
    }
    
    .nav-link.active {
      color: var(--team-accent, #22d3ee);
      background-color: rgba(34, 211, 238, 0.1);
    }
    
    .nav-icon {
      font-size: 1.5rem;
      margin-bottom: 0.25rem;
    }
    
    .theme-switcher {
      position: relative;
    }
    
    @media (min-width: 768px) {
      .nav-link {
        flex-direction: row;
        font-size: 0.875rem;
        padding: 0.5rem 0.75rem;
      }
      
      .nav-icon {
        font-size: 1.25rem;
        margin-bottom: 0;
        margin-right: 0.5rem;
      }
    }
  `;
  
  // Add the footer to all pages
  function addFooter() {
    // Check if footer already exists
    if (document.querySelector('.footer')) {
      return;
    }
    
    const footer = document.createElement('footer');
    footer.className = 'footer';
    footer.innerHTML = `An AeroVista Production - where vision takes flight`;
    
    // Add footer at the end of the body
    document.body.appendChild(footer);
  }
  
  // Add header at the beginning of the body
  document.body.prepend(header);
  document.head.appendChild(style);
  
  // Add footer
  addFooter();
  
  // Initialize theme system
  initializeThemeSystem();
  
  // Initialize search functionality
  initializeSearch();
  
  // Add event listeners to nav links
  setupNavLinks();
}

/**
 * Sets up click event listeners for navigation links
 */
function setupNavLinks() {
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href) {
        window.location.href = href;
      }
    });
  });
}

/**
 * Initializes search behavior using global search functionality
 */
function initializeSearch() {
  // This will be handled by the search.js module which we'll update
  // to work with our global search in the header
  
  // If this module loads before search.js, set a flag for search.js to recognize
  window.headerSearchInitialized = true;
} 