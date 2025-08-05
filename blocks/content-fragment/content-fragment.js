// put your AEM publish address here
// this fixes having to manually change the AEM host here
const AEM_HOST = checkDomain()

function checkDomain(){
  return "https://publish-p121371-e1189853.adobeaemcloud.com/"    
}

export default function decorate(block) {

  const slugDiv = block.querySelector('div:nth-child(1)'); 
  const slugID = document.createElement('div');
  slugID.id = 'slug';
  slugDiv.replaceWith(slugID);
  slugID.innerHTML = `${slugDiv.innerHTML}`;
  const slug = slugID.textContent.trim();
  
  const quoteDiv = block.querySelector('div:last-of-type');
  const bannerDiv = document.createElement('div');
  bannerDiv.id = "banner-" + slug; 
  quoteDiv.replaceWith(bannerDiv);

  // Add debugging information
  console.log('Starting fetch request...');

  const fetchUrl = 'https://prod-141.westus.logic.azure.com/workflows/ea3e538f401f450ab7ff7efc435a6d4b/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=f4Vv82SF_0mwHiOEIie_18yx1m0taW6ZPuCqu-qHdNw';
  
  console.log('Fetch URL:', fetchUrl);

fetch(fetchUrl)
.then(response => {
  console.log('Response status:', response.status);
  console.log('Response ok:', response.ok);
  console.log('Response headers:', response.headers);
  
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
  if (!banner.image || !banner.image._publishUrl) {
    throw new Error('Missing image._publishUrl in response');
  }
  
  const bannerImage = banner.image._publishUrl;
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
