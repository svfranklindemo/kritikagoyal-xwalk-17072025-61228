/*
 * Embed Block
 * Render HTML content from Azure Logic App
 */

export default async function decorate(block) {
  try {
    // Get the authored link value
    const linkElement = block.querySelector('a');
    if (!linkElement) {
      console.error('No link found in embed block');
      block.innerHTML = '<p>No link provided</p>';
      return;
    }
    
    const xfPath = linkElement.href;
    console.log('Using xfPath:', xfPath);

    const response = await fetch('https://prod-182.westus.logic.azure.com:443/workflows/47a46138a72940c7a1092a514555c9f3/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=OikX85Ks871i2TtDzGCuX3ctSkVRAOB2LWJ1yGQvDr8', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        xfPath: xfPath
      })
    });

    console.log('Response status:', response.status);
  
    if (!response.ok) {
      console.error(`Error making Logic App request: ${response.status}`, {
        status: response.status,
        statusText: response.statusText
      });
      block.innerHTML = '<p>Unable to load content</p>';
      return;
    }

    const htmlContent = await response.text();
    console.log('Logic App response:', htmlContent);

    if (htmlContent && htmlContent.trim()) {
      block.innerHTML = htmlContent;
      block.classList.add('embed-is-loaded');
    } else {
      console.warn('Empty response from Logic App');
      block.innerHTML = '<p>No content available</p>';
    }
  } catch (error) {
    console.error('Error fetching content from Logic App:', error);
    block.innerHTML = '<p>Error loading content</p>';
  }
}