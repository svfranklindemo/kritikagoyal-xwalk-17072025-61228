export function updateButtons(activeSlide) {
  const block = activeSlide.closest('.block');
  const dots = block.closest('.carousel-wrapper').querySelector('.slick-dots');
  const currentIndex = Array.from(block.children).indexOf(activeSlide);
  
  // Update dots
  [...dots.children].forEach((dot, i) => {
    const button = dot.querySelector('button');
    if (i === currentIndex) {
      dot.classList.add('slick-active');
      button.setAttribute('aria-selected', 'true');
    } else {
      dot.classList.remove('slick-active');
      button.setAttribute('aria-selected', 'false');
    }
  });
  
  // Update slides
  [...block.children].forEach((slide, i) => {
    if (i === currentIndex) {
      slide.classList.add('slick-current', 'slick-active');
      slide.setAttribute('aria-hidden', 'false');
    } else {
      slide.classList.remove('slick-current', 'slick-active');
      slide.setAttribute('aria-hidden', 'true');
    }
  });
}

export default function decorate(block) {
  // Add slick classes
  block.classList.add('slick-initialized', 'slick-slider', 'slick-dotted');
  
  // Create slick-list wrapper
  const slickList = document.createElement('div');
  slickList.classList.add('slick-list', 'draggable');
  
  // Create slick-track
  const slickTrack = document.createElement('div');
  slickTrack.classList.add('slick-track');
  
  // Move all slides to slick-track
  [...block.children].forEach((slide) => {
    slide.classList.add('offer-item', 'slick-slide');
    slickTrack.appendChild(slide);
  });
  
  slickList.appendChild(slickTrack);
  block.appendChild(slickList);
  
  // Create navigation arrows
  const prevButton = document.createElement('button');
  prevButton.type = 'button';
  prevButton.classList.add('slick-prev', 'slick-arrow');
  prevButton.setAttribute('aria-disabled', 'false');
  
  const nextButton = document.createElement('button');
  nextButton.type = 'button';
  nextButton.classList.add('slick-next', 'slick-arrow');
  nextButton.setAttribute('aria-disabled', 'false');
  
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
  
  // Create dots navigation
  const dotsContainer = document.createElement('ul');
  dotsContainer.classList.add('slick-dots');
  dotsContainer.setAttribute('role', 'tablist');
  
  [...slickTrack.children].forEach((slide, i) => {
    const dotItem = document.createElement('li');
    dotItem.setAttribute('role', 'presentation');
    if (i === 0) dotItem.classList.add('slick-active');
    
    const dotButton = document.createElement('button');
    dotButton.type = 'button';
    dotButton.setAttribute('role', 'tab');
    dotButton.setAttribute('id', `slick-slide-control0${i}`);
    dotButton.setAttribute('aria-controls', `slick-slide0${i}`);
    dotButton.setAttribute('aria-label', `${i + 1} of ${slickTrack.children.length}`);
    if (i === 0) {
      dotButton.setAttribute('aria-selected', 'true');
      dotButton.setAttribute('tabindex', '0');
    } else {
      dotButton.setAttribute('aria-selected', 'false');
      dotButton.setAttribute('tabindex', '-1');
    }
    dotButton.textContent = i + 1;
    
    dotItem.appendChild(dotButton);
    dotsContainer.appendChild(dotItem);
  });
  
  block.appendChild(dotsContainer);
  
  // Set initial state
  const slides = slickTrack.children;
  [...slides].forEach((slide, i) => {
    slide.setAttribute('data-slick-index', i);
    slide.setAttribute('aria-hidden', i === 0 ? 'false' : 'true');
    slide.setAttribute('tabindex', i === 0 ? '0' : '-1');
    slide.setAttribute('role', 'tabpanel');
    slide.setAttribute('id', `slick-slide0${i}`);
    slide.setAttribute('aria-describedby', `slick-slide-control0${i}`);
    
    if (i === 0) {
      slide.classList.add('slick-current', 'slick-active');
    }
  });
  
  // Navigation functionality
  let currentIndex = 0;
  const totalSlides = slides.length;
  
  function goToSlide(index) {
    if (index < 0) index = totalSlides - 1;
    if (index >= totalSlides) index = 0;
    
    currentIndex = index;
    const slideWidth = slides[0].offsetWidth;
    const translateX = -index * slideWidth;
    
    slickTrack.style.transform = `translate3d(${translateX}px, 0px, 0px)`;
    slickTrack.style.width = `${totalSlides * slideWidth}px`;
    
    // Update buttons and dots
    updateButtons(slides[index]);
    
    // Update arrow states
    prevButton.setAttribute('aria-disabled', index === 0 ? 'true' : 'false');
    nextButton.setAttribute('aria-disabled', index === totalSlides - 1 ? 'true' : 'false');
  }
  
  // Event listeners
  prevButton.addEventListener('click', () => goToSlide(currentIndex - 1));
  nextButton.addEventListener('click', () => goToSlide(currentIndex + 1));
  
  // Dot navigation
  [...dotsContainer.children].forEach((dot, i) => {
    const button = dot.querySelector('button');
    button.addEventListener('click', () => goToSlide(i));
  });
  
  // Initialize
  goToSlide(0);
}
