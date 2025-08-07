/*
 * Title Block
 * Process title component and apply appropriate styling based on type field
 */

export default function decorate(block) {
  // Get the title text and type from the block
  const titleText = block.querySelector('div:first-child')?.textContent?.trim() || '';
  const typeElement = block.querySelector('div:nth-child(2)');
  const type = typeElement?.textContent?.trim() || 'h1'; // Default to h1 if no type specified
  
  // Get the link if present
  const linkElement = block.querySelector('div:last-child');
  const href = linkElement?.textContent?.trim() || '';
  
  console.log('Title block processing:', { titleText, type, href });
  
  // Clear the block content
  block.innerHTML = '';
  
  let titleElement;
  
  // Create the appropriate HTML element based on type
  if (type === 'underline') {
    // For underline, create a span with underline styling
    titleElement = document.createElement('span');
    titleElement.style.textDecoration = 'underline';
    titleElement.textContent = titleText;
  } else if (type && type.match(/^h[1-6]$/)) {
    // For heading types (h1-h6), create the appropriate heading tag
    titleElement = document.createElement(type);
    titleElement.textContent = titleText;
  } else {
    // Fallback to h1 if type is not recognized
    titleElement = document.createElement('h1');
    titleElement.textContent = titleText;
  }
  
  // If there's a link, wrap the title in an anchor tag
  if (href) {
    const link = document.createElement('a');
    link.href = href;
    link.appendChild(titleElement);
    block.appendChild(link);
  } else {
    block.appendChild(titleElement);
  }
  
  // Add a class to the block for additional styling if needed
  block.classList.add('title-block');
  block.classList.add(`title-${type}`);
} 