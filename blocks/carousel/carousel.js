export function updateButtons(activeSlide) {
  const block = activeSlide.closest('.block');
  const buttons = block.closest('.carousel-wrapper').querySelector('.carousel-buttons');

  const nthSlide = activeSlide.offsetLeft / activeSlide.parentNode.clientWidth;
  const button = block.parentElement.querySelector(`.carousel-buttons > button:nth-child(${nthSlide + 1})`);
  [...buttons.children].forEach((r) => r.classList.remove('selected'));
  button.classList.add('selected');
}

// Function to update active slides based on scroll position
function updateActiveSlides(block) {
  const slides = block.children;
  const containerWidth = block.clientWidth;
  const scrollLeft = block.scrollLeft;
  
  // Calculate which slides are in the active area (3 slides visible)
  const slideWidth = slides[0].offsetWidth;
  const gap = 20; // Gap between slides
  const totalSlideWidth = slideWidth + gap;
  
  // Calculate the center of the visible area
  const visibleCenter = scrollLeft + (containerWidth / 2);
  
  // Find which slide is closest to the center
  let centerSlideIndex = 0;
  let minDistance = Infinity;
  
  [...slides].forEach((slide, index) => {
    const slideCenter = (index * totalSlideWidth) + (slideWidth / 2);
    const distance = Math.abs(visibleCenter - slideCenter);
    if (distance < minDistance) {
      minDistance = distance;
      centerSlideIndex = index;
    }
  });
  
  // Apply active/inactive classes based on position relative to center
  [...slides].forEach((slide, index) => {
    const distanceFromCenter = Math.abs(index - centerSlideIndex);
    
    if (distanceFromCenter <= 1) {
      // Active slides (center slide and adjacent ones)
      slide.classList.add('active-slide');
      slide.classList.remove('inactive-slide');
    } else {
      // Inactive slides
      slide.classList.add('inactive-slide');
      slide.classList.remove('active-slide');
    }
  });
}

export default function decorate(block) {
  const buttons = document.createElement('div');
  [...block.children].forEach((row, i) => {
    const classes = ['image', 'text'];
    classes.forEach((e, j) => {
      row.children[j].classList.add(`carousel-${e}`);
    });
    const carouselText = row.querySelector('.carousel-text');
    if (!carouselText.innerText.trim()) carouselText.remove();
    /* buttons */
    const button = document.createElement('button');
    button.title = 'Carousel Nav';
    if (!i) button.classList.add('selected');
    button.addEventListener('click', () => {
      block.scrollTo({ top: 0, left: row.offsetLeft - row.parentNode.offsetLeft, behavior: 'smooth' });
      [...buttons.children].forEach((r) => r.classList.remove('selected'));
      button.classList.add('selected');
    });
    buttons.append(button);
  });
  if (block.nextElementSibling) block.nextElementSibling.replaceWith(buttons);
  else block.parentElement.append(buttons);

  block.querySelectorAll(':scope > div').forEach((slide) => slide.classList.add('slide'));



  // Add navigation arrows
  const prevButton = document.createElement('button');
  prevButton.type = 'button';
  prevButton.classList.add('carousel-nav', 'carousel-prev');
  prevButton.setAttribute('aria-label', 'Previous slide');
  
  const nextButton = document.createElement('button');
  nextButton.type = 'button';
  nextButton.classList.add('carousel-nav', 'carousel-next');
  nextButton.setAttribute('aria-label', 'Next slide');
  
  // Add SVG icons to buttons
  const arrowSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="40.302" height="39.213" viewBox="0 0 40.302 39.213">
    <g id="Group_22546" data-name="Group 22546" transform="translate(1501.302 1337) rotate(180)">
      <ellipse id="Oval" cx="20.151" cy="19.606" rx="20.151" ry="19.606" transform="translate(1461 1297.787)" fill="#3ad57a" opacity="1"></ellipse>
      <path id="Path_2" data-name="Path 2" d="M0,0,8.714,6.465,0,14.16" transform="translate(1478.428 1310.313)" fill="none" stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" stroke-width="1.84"></path>
    </g>
  </svg>`;
  
  prevButton.innerHTML = arrowSVG;
  nextButton.innerHTML = arrowSVG;
  
  block.appendChild(prevButton);
  block.appendChild(nextButton);
  
  // Navigation functionality
  let currentIndex = 0;
  const slides = block.children;
  const totalSlides = slides.length;
  
  function goToSlide(index) {
    if (index < 0) index = 0;
    if (index >= totalSlides) index = totalSlides - 1;
    
    currentIndex = index;
    const slideWidth = slides[0].offsetWidth;
    const gap = 20;
    const totalSlideWidth = slideWidth + gap;
    const translateX = index * totalSlideWidth;
    
    block.scrollTo({ top: 0, left: translateX, behavior: 'smooth' });
    
    // Update button states
    prevButton.disabled = index === 0;
    nextButton.disabled = index >= totalSlides - 3; // Show 3 slides at once
    
    // Update active slides after a short delay to allow scroll to complete
    setTimeout(() => {
      updateActiveSlides(block);
    }, 100);
  }
  
  // Event listeners for navigation
  prevButton.addEventListener('click', () => goToSlide(currentIndex - 1));
  nextButton.addEventListener('click', () => goToSlide(currentIndex + 1));
  
  // Initialize
  goToSlide(0);
  updateActiveSlides(block);

  // Add scroll event listener for real-time updates
  block.addEventListener('scroll', () => {
    updateActiveSlides(block);
  }, { passive: true });

  block.addEventListener('scrollend', () => {
    const activeElement = Math.round(block.scrollLeft / block.children[0].clientWidth);
    const slide = block.children[activeElement];
    updateButtons(slide);
    currentIndex = activeElement;
    
    // Update navigation button states
    prevButton.disabled = activeElement === 0;
    nextButton.disabled = activeElement >= totalSlides - 3;
    
    // Final update of active slides
    updateActiveSlides(block);
  }, { passive: true });
}
