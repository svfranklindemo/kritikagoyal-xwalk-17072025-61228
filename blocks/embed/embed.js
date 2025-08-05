/*
 * Embed Block
 * Render HTML content from Azure Logic App
 */

export default async function decorate(block) {
  try {
    const response = await fetch('https://prod-182.westus.logic.azure.com:443/workflows/47a46138a72940c7a1092a514555c9f3/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=OikX85Ks871i2TtDzGCuX3ctSkVRAOB2LWJ1yGQvDr8');
  
    if (!response.ok) {
      console.error(`Error making Logic App request: ${response.status}`, {
        status: response.status,
        statusText: response.statusText
      });
      block.innerHTML = '<p>Unable to load content</p>';
      return;
    }

    const data = await response.json();
    console.log('Logic App response data:', data);

    // Check if the response contains embed HTML
    if (data && data.embed && data.embed.html) {
      block.innerHTML = data.embed.html;
      block.classList.add('embed-is-loaded');
    } else {
      console.warn('No embed HTML found in Logic App response');
      block.innerHTML = '<p>No content available</p>';
    }
  } catch (error) {
    console.error('Error fetching content from Logic App:', error);
    block.innerHTML = '<p>Error loading content</p>';
  }
}