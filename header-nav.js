// header-nav.js - Reusable header component for consistent navigation

/**
 * Injects a consistent navigation header into the page
 * @param {string} currentPage - The current page ID to highlight in the nav
 */
export function initializeHeader(currentPage = 'dashboard') {
  // Find header element or create one if it doesn't exist
  let headerEl = document.querySelector('header');
  if (!headerEl) {
    headerEl = document.createElement('header');
    document.body.insertBefore(headerEl, document.body.firstChild);
  }

  // Define the navigation items
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', href: 'dashboard.html', icon: '🏠' },
    { id: 'cheatsheet', label: 'Cheat Sheet', href: 'cheat-sheet.html', icon: '📋' },
    { id: 'mockdraft', label: 'Mock Draft', href: 'mock-draft.html', icon: '🎮' },
    { id: 'flashcards', label: 'Flashcards', href: 'flashcards.html', icon: '🃏' }
  ];

  // Set the header classes and structure
  headerEl.className = 'flex flex-col md:flex-row items-center justify-between p-4 border-b border-gray-700 bg-gray-800 mb-4';
  
  // Create the header content
  const logoHtml = `
    <div class="flex items-center mb-4 md:mb-0">
      <img src="AeroVista-Logo.png" alt="FantasyForge Logo" class="h-8 w-8 mr-2">
      <h1 class="text-xl font-bold text-cyan-400">FantasyForge</h1>
    </div>
  `;
  
  // Create the navigation
  const navHtml = `
    <nav class="flex space-x-1 md:space-x-4">
      ${navItems.map(item => `
        <a href="${item.href}" 
           class="px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 
                  ${currentPage === item.id 
                    ? 'bg-cyan-800 text-white' 
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'}"
           aria-current="${currentPage === item.id ? 'page' : 'false'}">
          <span class="mr-1">${item.icon}</span>
          <span class="hidden sm:inline">${item.label}</span>
        </a>
      `).join('')}
    </nav>
  `;

  // Search component - We'll just add a placeholder that individual pages can replace/enhance
  const searchHtml = `
    <div class="hidden md:block w-full max-w-xs">
      <input type="text" placeholder="Search players..." 
             class="w-full p-2 rounded-md bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
             id="global-search-input">
    </div>
  `;

  // Combine all components
  headerEl.innerHTML = `
    <div class="w-full flex flex-col md:flex-row items-center justify-between gap-4">
      ${logoHtml}
      ${navHtml}
      ${searchHtml}
    </div>
  `;

  // On mobile, add a spacer after the header for better layout
  const mobileSpacer = document.createElement('div');
  mobileSpacer.className = 'h-4 md:hidden';
  if (headerEl.nextSibling) {
    headerEl.parentNode.insertBefore(mobileSpacer, headerEl.nextSibling);
  } else {
    headerEl.parentNode.appendChild(mobileSpacer);
  }

  // Initialize global search behavior if the input exists
  const searchInput = document.getElementById('global-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      // This would be connected to global search functionality
      // For now it's just a placeholder that individual pages can override
      console.log('Global search:', e.target.value);
    });
  }
} 