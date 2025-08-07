/**
 * @param {HTMLElement} $block
 */
export default function decorate($block) {
  // Get the style type from the block
  const styleDiv = $block.querySelector('div:nth-child(3)'); // Third div contains the style type
  const styleType = styleDiv?.textContent?.trim() || '';
  
  console.log('Teaser block style type:', styleType);
  
  // Apply the appropriate class based on style selection
  if (styleType === 'image-left') {
    $block.classList.add('image-left');
  } else if (styleType === 'image-right') {
    $block.classList.add('image-right');
  }
  
  // Add a base class for all teasers
  $block.classList.add('teaser-block');
  
  // Handle links in the text content
  const textDiv = $block.querySelector('div:nth-child(2)');
  if (textDiv) {
    // Find any p elements with button-container class
    const buttonContainer = textDiv.querySelector('p.button-container');
    if (buttonContainer) {
      // Get the link inside the button container
      const link = buttonContainer.querySelector('a');
      if (link) {
        // Remove the button-container class and button classes
        buttonContainer.classList.remove('button-container');
        link.classList.remove('button', 'primary');
        
        // Add our custom styling class
        link.classList.add('teaser-link');
        
        console.log('Processed teaser link:', link.href);
      }
    }
  }
  
  console.log('Teaser block classes applied:', $block.className);
}
