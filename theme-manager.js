// theme-manager.js - Handles NFL team themes for the entire application

// Constants
const THEME_STORAGE_KEY = "preferred-nfl-theme";
const DEFAULT_THEME = "default"; // Standard NFL theme

/**
 * Initialize the theme system on page load
 */
export function initializeThemeSystem() {
  // Insert theme toggle HTML if it doesn't exist yet
  if (!document.querySelector('.theme-switcher')) {
    insertThemeToggle();
  }

  const themeToggleBtn = document.getElementById("theme-toggle");
  const themeDropdown = document.getElementById("theme-dropdown");
  const themeOptions = document.querySelectorAll(".theme-option");

  // Set the theme from localStorage or default to standard NFL theme
  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) || DEFAULT_THEME;
  applyTheme(savedTheme);
  
  // Toggle the theme dropdown
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      themeDropdown.classList.toggle('hidden');
    });
  }
  
  // Hide dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (themeDropdown && !themeDropdown.contains(e.target) && e.target !== themeToggleBtn) {
      themeDropdown.classList.add('hidden');
    }
  });
  
  // Apply theme when option is clicked
  themeOptions.forEach(option => {
    option.addEventListener('click', () => {
      const theme = option.getAttribute('data-theme');
      applyTheme(theme);
      localStorage.setItem(THEME_STORAGE_KEY, theme);
      if (themeDropdown) themeDropdown.classList.add('hidden');
    });
  });
}

/**
 * Apply a theme to the entire document
 * @param {string} theme - Theme name to apply
 */
export function applyTheme(theme) {
  // Remove any existing theme classes
  document.body.classList.forEach(cls => {
    if (cls.startsWith('theme-')) document.body.classList.remove(cls);
  });
  
  // Remove data-theme attribute
  document.documentElement.removeAttribute('data-theme');
  
  // Apply the selected theme
  if (theme && theme !== DEFAULT_THEME) {
    document.documentElement.setAttribute('data-theme', theme);
    document.body.classList.add(`theme-${theme}`);
    
    // Update UI elements with team colors
    updateUIColors(true);
  } else {
    // Restore default theme elements
    updateUIColors(false);
  }
}

/**
 * Update UI elements with team or default colors
 * @param {boolean} useTeamColors - Whether to use team colors (true) or default (false)
 */
function updateUIColors(useTeamColors) {
  // Common UI elements that should update with theme
  if (useTeamColors) {
    // Update background elements
    document.querySelectorAll('.bg-cyan-900, .bg-indigo-600, .bg-blue-600, .bg-blue-700').forEach(el => {
      if (el.classList.contains('bg-indigo-600')) el.classList.remove('bg-indigo-600');
      else if (el.classList.contains('bg-cyan-900')) el.classList.remove('bg-cyan-900');
      else if (el.classList.contains('bg-blue-600')) el.classList.remove('bg-blue-600');
      else if (el.classList.contains('bg-blue-700')) el.classList.remove('bg-blue-700');
      el.classList.add('bg-team');
    });
    
    // Primary hover states
    document.querySelectorAll('.hover\\:bg-indigo-700, .hover\\:bg-blue-700, .hover\\:bg-cyan-700').forEach(el => {
      if (el.classList.contains('hover:bg-indigo-700')) el.classList.remove('hover:bg-indigo-700');
      else if (el.classList.contains('hover:bg-blue-700')) el.classList.remove('hover:bg-blue-700');
      else if (el.classList.contains('hover:bg-cyan-700')) el.classList.remove('hover:bg-cyan-700');
      el.classList.add('hover:bg-team-secondary');
    });
    
    // Update text colors
    document.querySelectorAll('.text-cyan-300, .text-cyan-400, .text-blue-400, .text-blue-500').forEach(el => {
      if (el.classList.contains('text-cyan-300')) el.classList.remove('text-cyan-300');
      else if (el.classList.contains('text-cyan-400')) el.classList.remove('text-cyan-400');
      else if (el.classList.contains('text-blue-400')) el.classList.remove('text-blue-400');
      else if (el.classList.contains('text-blue-500')) el.classList.remove('text-blue-500');
      el.classList.add('text-team-accent');
    });
    
    // Border colors
    document.querySelectorAll('.border-cyan-500, .border-blue-500, .border-indigo-500').forEach(el => {
      if (el.classList.contains('border-cyan-500')) el.classList.remove('border-cyan-500');
      else if (el.classList.contains('border-blue-500')) el.classList.remove('border-blue-500');
      else if (el.classList.contains('border-indigo-500')) el.classList.remove('border-indigo-500');
      el.classList.add('border-team-accent');
    });
    
    // Focus rings
    document.querySelectorAll('.focus\\:ring-cyan-500, .focus\\:ring-blue-500, .focus\\:ring-indigo-500').forEach(el => {
      if (el.classList.contains('focus:ring-cyan-500')) el.classList.remove('focus:ring-cyan-500');
      else if (el.classList.contains('focus:ring-blue-500')) el.classList.remove('focus:ring-blue-500');
      else if (el.classList.contains('focus:ring-indigo-500')) el.classList.remove('focus:ring-indigo-500');
      el.classList.add('focus:ring-team-accent');
    });
  } else {
    // Restore to default theme
    // Background elements
    document.querySelectorAll('.bg-team').forEach(el => {
      el.classList.remove('bg-team');
      // Determine which class to add back based on element context
      if (el.tagName === 'BUTTON' && el.id === 'start-ai-draft-btn') {
        el.classList.add('bg-indigo-600');
      } else {
        el.classList.add('bg-cyan-900');
      }
    });
    
    // Hover states
    document.querySelectorAll('.hover\\:bg-team-secondary').forEach(el => {
      el.classList.remove('hover:bg-team-secondary');
      if (el.tagName === 'BUTTON' && el.id === 'start-ai-draft-btn') {
        el.classList.add('hover:bg-indigo-700');
      } else {
        el.classList.add('hover:bg-cyan-700');
      }
    });
    
    // Text colors
    document.querySelectorAll('.text-team-accent').forEach(el => {
      el.classList.remove('text-team-accent');
      el.classList.add('text-cyan-300');
    });
    
    // Border colors
    document.querySelectorAll('.border-team-accent').forEach(el => {
      el.classList.remove('border-team-accent');
      el.classList.add('border-cyan-500');
    });
    
    // Focus rings
    document.querySelectorAll('.focus\\:ring-team-accent').forEach(el => {
      el.classList.remove('focus:ring-team-accent');
      el.classList.add('focus:ring-cyan-500');
    });
  }
}

/**
 * Insert the theme toggle HTML into the page
 */
function insertThemeToggle() {
  const themeSwitcherHTML = `
    <div class="theme-switcher fixed top-4 right-4 z-50">
      <button id="theme-toggle" class="theme-toggle flex items-center justify-center w-10 h-10 rounded-full bg-gray-800 text-white shadow-lg" title="Change Theme" aria-label="Toggle theme selection menu">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </svg>
      </button>
      <div id="theme-dropdown" class="hidden absolute right-0 mt-2 py-2 w-48 bg-gray-800 rounded-md shadow-xl z-20">
        <div class="px-4 py-2 text-sm text-gray-300 border-b border-gray-700">Select Theme</div>
        <div class="theme-option-group px-2 py-1">
          <div class="theme-option-heading text-xs text-gray-500 uppercase tracking-wider py-1">NFL Team Themes</div>
          <div class="theme-option" data-theme="cardinals">
            <div class="flex items-center p-2 hover:bg-gray-700 rounded">
              <div class="w-4 h-4 bg-cardinals mr-2 rounded"></div>
              <span>Cardinals</span>
            </div>
          </div>
          <div class="theme-option" data-theme="chiefs">
            <div class="flex items-center p-2 hover:bg-gray-700 rounded">
              <div class="w-4 h-4 bg-chiefs mr-2 rounded"></div>
              <span>Chiefs</span>
            </div>
          </div>
          <div class="theme-option" data-theme="cowboys">
            <div class="flex items-center p-2 hover:bg-gray-700 rounded">
              <div class="w-4 h-4 bg-cowboys mr-2 rounded"></div>
              <span>Cowboys</span>
            </div>
          </div>
          <div class="theme-option" data-theme="packers">
            <div class="flex items-center p-2 hover:bg-gray-700 rounded">
              <div class="w-4 h-4 bg-packers mr-2 rounded"></div>
              <span>Packers</span>
            </div>
          </div>
          <div class="theme-option" data-theme="seahawks">
            <div class="flex items-center p-2 hover:bg-gray-700 rounded">
              <div class="w-4 h-4 bg-seahawks mr-2 rounded"></div>
              <span>Seahawks</span>
            </div>
          </div>
          <div class="theme-option" data-theme="steelers">
            <div class="flex items-center p-2 hover:bg-gray-700 rounded">
              <div class="w-4 h-4 bg-steelers mr-2 rounded"></div>
              <span>Steelers</span>
            </div>
          </div>
          <div class="theme-option" data-theme="niners">
            <div class="flex items-center p-2 hover:bg-gray-700 rounded">
              <div class="w-4 h-4 bg-niners mr-2 rounded"></div>
              <span>49ers</span>
            </div>
          </div>
          <div class="theme-option" data-theme="patriots">
            <div class="flex items-center p-2 hover:bg-gray-700 rounded">
              <div class="w-4 h-4 bg-patriots mr-2 rounded"></div>
              <span>Patriots</span>
            </div>
          </div>
        </div>
        <div class="theme-option-group px-2 py-1 border-t border-gray-700">
          <div class="theme-option-heading text-xs text-gray-500 uppercase tracking-wider py-1">Default Themes</div>
          <div class="theme-option" data-theme="default">
            <div class="flex items-center p-2 hover:bg-gray-700 rounded">
              <div class="w-4 h-4 bg-gray-900 mr-2 rounded"></div>
              <span>Default (NFL Blue)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  
  const bodyEl = document.querySelector('body');
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = themeSwitcherHTML;
  bodyEl.appendChild(tempDiv.firstElementChild);
}

// Auto-initialize theme system when this script is included directly
if (typeof document !== 'undefined') {
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeThemeSystem);
  } else {
    initializeThemeSystem();
  }
}

// Export for those importing the module
export default {
  initializeThemeSystem,
  applyTheme
}; 