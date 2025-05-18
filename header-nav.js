// header-nav.js - Consistent header and footer for all pages

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
          <div class="hidden md:block ml-2">
            <input type="text" placeholder="Search players..." class="bg-gray-700 text-white text-sm rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-cyan-400 w-40 lg:w-56">
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
      color: #22d3ee;
      background-color: rgba(34, 211, 238, 0.1);
    }
    
    .nav-icon {
      font-size: 1.5rem;
      margin-bottom: 0.25rem;
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
  
  // Initialize search functionality if needed
  initializeSearch();
}

/**
 * Initializes search behavior if the search input exists
 */
function initializeSearch() {
  const searchInput = document.querySelector('input[placeholder="Search players..."]');
  if (!searchInput) return;
  
  searchInput.addEventListener('focus', (e) => {
    // This will be handled by the search.js module
    console.log('Search focus - handled by search.js');
  });
} 