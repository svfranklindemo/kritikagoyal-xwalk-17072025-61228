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
  
  console.log('Teaser block classes applied:', $block.className);
}
