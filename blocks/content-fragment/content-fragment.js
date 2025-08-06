
export default function decorate(block) {
  const bannerDiv = document.createElement('div');
  bannerDiv.id = "banner-" + slug; 
  quoteDiv.replaceWith(bannerDiv);

  // Get the authored link value
  const linkElement = block.querySelector('a');
  if (!linkElement) {
    console.error('No link found in embed block');
    block.innerHTML = '<p>No link provided</p>';
    return;
  }
  
  const fullUrl = linkElement.href;
  console.log('Full URL:', fullUrl);
  
  // Extract just the path portion, removing domain and .html extension
  const url = new URL(fullUrl);
  let cfPath = url.pathname;
  
  // Remove .html extension if present
  if (cfPath.endsWith('.html')) {
    cfPath = cfPath.slice(0, -5); // Remove last 5 characters (.html)
  }
  
  console.log('Extracted cfPath:', cfPath);

  // Add debugging information
  console.log('Starting fetch request...');
  console.log('Using cfPath:', cfPath);

  const fetchUrl = 'https://prod-141.westus.logic.azure.com/workflows/ea3e538f401f450ab7ff7efc435a6d4b/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=f4Vv82SF_0mwHiOEIie_18yx1m0taW6ZPuCqu-qHdNw';

fetch(fetchUrl, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    cfPath: cfPath
  })
})
.then(response => {
  console.log('Response status:', response.status);
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return response.json();
})
.then(response => {
  console.log('Parsed response:', response);
  
  // Check if response has the expected structure
  if (!response.data || !response.data.homeBannerList || !response.data.homeBannerList.items || !response.data.homeBannerList.items[0]) {
    throw new Error('Response does not have expected structure');
  }
  
  const banner = response.data.homeBannerList.items[0];
  console.log('Banner data:', banner);
  
  // Check if required fields exist
  if (!banner.image || !banner.image._authorUrl) {
    throw new Error('Missing image._authorUrl in response');
  }
  
  const bannerImage = banner.image._authorUrl;
  console.log('Banner image URL:', bannerImage);
  
  // Create banner section with image
  document.getElementById(bannerDiv.id).innerHTML = "<section><img src='" + bannerImage + "' alt='" + (banner.title || 'Banner') + "'></section>";  

  // Add title section
  const bannerTitle = banner.title;
  if (bannerTitle) {
    document.getElementById(bannerDiv.id).innerHTML += "<section><h3>"+ bannerTitle + "</h3></section>";
  }

  // Add description section
  const bannerDesc = banner.description.plaintext;
  if (bannerDesc) {
    document.getElementById(bannerDiv.id).innerHTML += "<section>" + bannerDesc + "</section>";
  }

  console.log('Successfully updated DOM with banner data');
})
.catch(error => {
  console.error('Error fetching data:', error);
  console.error('Error details:', {
    message: error.message,
    stack: error.stack,
    name: error.name
  });
  
  // Display error in the DOM for debugging
  document.getElementById(bannerDiv.id).innerHTML = `
    <section style="color: red; padding: 20px; border: 1px solid red;">
      <h3>Error loading banner data</h3>
      <p><strong>Error:</strong> ${error.message}</p>
      <p><strong>Type:</strong> ${error.name}</p>
      <p>Check browser console for more details.</p>
    </section>
  `;
});

}
