import { decorateIcons, getMetadata } from '../../scripts/lib-franklin.js';
import { getSiteRoot } from '../../scripts/scripts.js';

/**
 * collapses all open nav sections
 * @param {Element} sections The container element
 */

function collapseAllNavSections(sections) {
  sections.querySelectorAll('.nav-sections > ul > li').forEach((section) => {
    section.setAttribute('aria-expanded', 'false');
  });
}

/**
 * Creates and manages the login modal
 */
class LoginModal {
  constructor() {
    this.isOpen = false;
    this.modal = null;
    this.overlay = null;
    this.createModal();
  }

  createModal() {
    // Create overlay
    this.overlay = document.createElement('div');
    this.overlay.className = 'login-modal-overlay';
    this.overlay.setAttribute('aria-hidden', 'true');
    
    // Create modal container
    this.modal = document.createElement('div');
    this.modal.className = 'login-modal';
    this.modal.setAttribute('role', 'dialog');
    this.modal.setAttribute('aria-labelledby', 'login-modal-title');
    this.modal.setAttribute('aria-modal', 'true');
    
    // Modal content
    this.modal.innerHTML = `
      <div class="login-modal-header">
        <h2 id="login-modal-title">Sign In</h2>
        <button class="login-modal-close" aria-label="Close login modal">
          <span>&times;</span>
        </button>
      </div>
      <form class="login-modal-form" novalidate>
        <div class="form-group">
          <label for="login-email">Email</label>
          <input 
            type="email" 
            id="login-email" 
            name="email" 
            required 
            autocomplete="email"
            aria-describedby="email-error"
          >
          <div id="email-error" class="error-message" aria-live="polite"></div>
        </div>
        <div class="form-group">
          <label for="login-password">Password</label>
          <div class="password-input-wrapper">
            <input 
              type="password" 
              id="login-password" 
              name="password" 
              required 
              autocomplete="current-password"
              aria-describedby="password-error"
            >
            <button type="button" class="password-toggle" aria-label="Toggle password visibility">
              <span class="eye-icon">👁</span>
            </button>
          </div>
          <div id="password-error" class="error-message" aria-live="polite"></div>
        </div>
        <button type="submit" class="login-submit-btn">
          <span class="btn-text">Sign In</span>
          <span class="btn-loading" style="display: none;">Signing In...</span>
        </button>
        <div class="login-modal-links">
          <a href="#" class="forgot-password">Forgot Password?</a>
          <a href="#" class="sign-up">Don't have an account? Sign Up</a>
        </div>
      </form>
    `;
    
    this.overlay.appendChild(this.modal);
    document.body.appendChild(this.overlay);
    
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Close button
    const closeBtn = this.modal.querySelector('.login-modal-close');
    closeBtn.addEventListener('click', () => this.close());
    
    // Overlay click
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) this.close();
    });
    
    // Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) this.close();
    });
    
    // Form submission
    const form = this.modal.querySelector('.login-modal-form');
    form.addEventListener('submit', (e) => this.handleSubmit(e));
    
    // Password toggle
    const passwordToggle = this.modal.querySelector('.password-toggle');
    const passwordInput = this.modal.querySelector('#login-password');
    passwordToggle.addEventListener('click', () => {
      const type = passwordInput.type === 'password' ? 'text' : 'password';
      passwordInput.type = type;
      passwordToggle.querySelector('.eye-icon').textContent = type === 'password' ? '👁' : '🙈';
      passwordToggle.setAttribute('aria-label', 
        type === 'password' ? 'Show password' : 'Hide password'
      );
    });
    
    // Input validation
    const inputs = this.modal.querySelectorAll('input[required]');
    inputs.forEach(input => {
      input.addEventListener('blur', () => this.validateField(input));
      input.addEventListener('input', () => this.clearFieldError(input));
    });
  }

  validateField(field) {
    const errorElement = document.getElementById(`${field.id}-error`);
    let isValid = true;
    let errorMessage = '';

    if (!field.value.trim()) {
      isValid = false;
      errorMessage = 'This field is required';
    } else if (field.type === 'email' && !this.isValidEmail(field.value)) {
      isValid = false;
      errorMessage = 'Please enter a valid email address';
    }

    if (!isValid) {
      field.classList.add('error');
      errorElement.textContent = errorMessage;
      errorElement.style.display = 'block';
    } else {
      field.classList.remove('error');
      errorElement.textContent = '';
      errorElement.style.display = 'none';
    }

    return isValid;
  }

  clearFieldError(field) {
    if (field.classList.contains('error')) {
      field.classList.remove('error');
      const errorElement = document.getElementById(`${field.id}-error`);
      errorElement.textContent = '';
      errorElement.style.display = 'none';
    }
  }

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  async handleSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const submitBtn = form.querySelector('.login-submit-btn');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoading = submitBtn.querySelector('.btn-loading');
    
    // Validate all fields
    const inputs = form.querySelectorAll('input[required]');
    let isValid = true;
    inputs.forEach(input => {
      if (!this.validateField(input)) {
        isValid = false;
      }
    });
    
    if (!isValid) return;
    
    // Show loading state
    submitBtn.disabled = true;
    btnText.style.display = 'none';
    btnLoading.style.display = 'inline';
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Success - close modal and show success message
      this.close();
      this.showSuccessMessage('Successfully signed in!');
      
    } catch (error) {
      // Show error message
      this.showErrorMessage('Login failed. Please try again.');
    } finally {
      // Reset button state
      submitBtn.disabled = false;
      btnText.style.display = 'inline';
      btnLoading.style.display = 'none';
    }
  }

  showSuccessMessage(message) {
    // Create temporary success message
    const successDiv = document.createElement('div');
    successDiv.className = 'login-success-message';
    successDiv.textContent = message;
    successDiv.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #4CAF50;
      color: white;
      padding: 12px 24px;
      border-radius: 4px;
      z-index: 10000;
      animation: slideIn 0.3s ease-out;
    `;
    document.body.appendChild(successDiv);
    
    setTimeout(() => {
      successDiv.remove();
    }, 3000);
  }

  showErrorMessage(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'login-error-message';
    errorDiv.textContent = message;
    errorDiv.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #f44336;
      color: white;
      padding: 12px 24px;
      border-radius: 4px;
      z-index: 10000;
      animation: slideIn 0.3s ease-out;
    `;
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
      errorDiv.remove();
    }, 3000);
  }

  open() {
    if (this.isOpen) return;
    
    this.isOpen = true;
    this.overlay.setAttribute('aria-hidden', 'false');
    this.overlay.style.display = 'flex';
    
    // Focus management
    setTimeout(() => {
      const firstInput = this.modal.querySelector('input');
      if (firstInput) firstInput.focus();
    }, 100);
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
  }

  close() {
    if (!this.isOpen) return;
    
    this.isOpen = false;
    this.overlay.setAttribute('aria-hidden', 'true');
    this.overlay.style.display = 'none';
    
    // Reset form
    const form = this.modal.querySelector('.login-modal-form');
    form.reset();
    
    // Clear errors
    const errorMessages = this.modal.querySelectorAll('.error-message');
    errorMessages.forEach(error => {
      error.textContent = '';
      error.style.display = 'none';
    });
    
    const errorInputs = this.modal.querySelectorAll('.error');
    errorInputs.forEach(input => input.classList.remove('error'));
    
    // Restore body scroll
    document.body.style.overflow = '';
  }
}

/**
 * decorates the header, mainly the nav
 * @param {Element} block The header block element
 */

export default async function decorate(block) {
  // fetch nav content
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : (window.wknd.demoConfig.demoBase || '/nav');

  let navURL = `${getSiteRoot(6)}${navPath}.plain.html`;
  let updatedNavUrl = navURL.replace(/about-us\/|faqs\/|magazine\/.+\/|adventures\/.+\//g, "/");

  const resp = await fetch(updatedNavUrl.replace("//", "/"), window.location.pathname.endsWith('/nav') ? { cache: 'reload' } : {});
  if (resp.ok) {
    const html = await resp.text();

    // decorate nav DOM
    const nav = document.createElement('nav');
    nav.innerHTML = html;
    decorateIcons(nav);

    const classes = ['brand', 'sections', 'tools', 'login'];
    classes.forEach((e, j) => {
      const section = nav.children[j];
      if (section) section.classList.add(`nav-${e}`);
    });

    const navSections = [...nav.children][1];
    if (navSections) {
      navSections.querySelectorAll(':scope > ul > li').forEach((navSection) => {
        if (navSection.querySelector('ul')) navSection.classList.add('nav-drop');
        navSection.addEventListener('click', () => {
          const expanded = navSection.getAttribute('aria-expanded') === 'true';
          collapseAllNavSections(navSections);
          navSection.setAttribute('aria-expanded', expanded ? 'false' : 'true');
        });
      });
    }

    // hamburger for mobile
    const hamburger = document.createElement('div');
    hamburger.classList.add('nav-hamburger');
    hamburger.innerHTML = '<div class="nav-hamburger-icon"></div>';
    hamburger.addEventListener('click', () => {
      const expanded = nav.getAttribute('aria-expanded') === 'true';
      document.body.style.overflowY = expanded ? '' : 'hidden';
      nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
    });
    const topBar = document.createElement('div');
    topBar.classList.add('header-topbar');
    block.prepend(topBar);
    topBar.innerHTML = '<div>Sign In</div><div class="header-markets"><span class="icon icon-flag-us"></span>EN-US<span class="header-chevron-down"></span></div>';
    nav.prepend(hamburger);
    nav.setAttribute('aria-expanded', 'false');
    decorateIcons(block);
    block.append(nav);

    // Initialize login modal
    const loginModal = new LoginModal();
    
    // Add click event listener to login element
    const navLogin = nav.querySelector('.nav-login');
    if (navLogin) {
      const loginElement = navLogin.querySelector('p');
      if (loginElement) {
        loginElement.style.cursor = 'pointer';
        loginElement.addEventListener('click', () => {
          loginModal.open();
        });
      }
    }


  }
}
