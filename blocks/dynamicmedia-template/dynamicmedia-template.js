import { getMetadata } from '../../scripts/lib-franklin.js';
import { isAuthorEnvironment } from '../../scripts/scripts.js';

/**
 * @param {HTMLElement} $block
 */
export default async function decorate(block) {
  console.log(block);

  let inputs = block.querySelectorAll('.dynamicmedia-template > div');
  
  let configSrc = Array.from(block.children)[0]?.textContent?.trim(); //inline or cf

  
  if(configSrc === 'cf'){

    //https://author-p153659-e1620914.adobeaemcloud.com/graphql/execute.json/wknd-universal/DynamicMediaTemplateByPath;path=
    const CONFIG = {
      WRAPPER_SERVICE_URL: 'https://prod-31.westus.logic.azure.com:443/workflows/2660b7afa9524acbae379074ae38501e/triggers/manual/paths/invoke',
      WRAPPER_SERVICE_PARAMS: 'api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=kfcQD5S7ovej9RHdGZFVfgvA-eEqNlb6r_ukuByZ64o',
      GRAPHQL_QUERY: '/graphql/execute.json/lpbgenerated/GetBannerDetailsByVariation'
    };
    
    const hostname = 'https://' + window.location.hostname;
    let aemauthorurl = '';
    if (hostname.includes('author-p')) {
      aemauthorurl = hostname;
    } else {
      aemauthorurl = hostname?.replace('publish', 'author')?.replace(/\/$/, '');
    }
    
    const aempublishurl = hostname?.replace('author', 'publish')?.replace(/\/$/, '');  
    
    const persistedquery = '/graphql/execute.json/lpbgenerated/GetBannerDetailsByVariation';

    const contentPath = block.querySelector("div.button-container > a")?.textContent?.trim();
    const isAuthor = isAuthorEnvironment();
  
    // Prepare request configuration based on environment
    const requestConfig = isAuthor 
    ? {
        url: `${aemauthorurl}${CONFIG.GRAPHQL_QUERY};path=${contentPath};variation=master;ts=${Date.now()}`,
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      }
    : {
        url: `${CONFIG.WRAPPER_SERVICE_URL}?${CONFIG.WRAPPER_SERVICE_PARAMS}`,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          graphQLPath: `${aempublishurl}${CONFIG.GRAPHQL_QUERY}`,
          cfPath: contentPath,
          variation: 'master'
        })
      };
  
      try {
        // Fetch data
        const response = await fetch(requestConfig.url, {
          method: requestConfig.method,
          headers: requestConfig.headers,
          ...(requestConfig.body && { body: requestConfig.body })
        });
  
        if (!response.ok) {
          console.error(`error making cf graphql request:${response.status}`, {
	          error: error.message,
	          stack: error.stack
        	});
          block.innerHTML = '';
          return;
        }
  
        const offer = await response.json();
        // Get the template URL and parameter mappings
        const templateURL = offer?.data?.dynamicMediaTemplateByPath?.item?.desktop_dm_template;
        const paramPairs = offer?.data?.dynamicMediaTemplateByPath?.item?.var_mapping;

        // Create parameter object
        const paramObject = {};

        // Process each parameter pair if they exist
        if (paramPairs && Array.isArray(paramPairs)) {
          paramPairs.forEach(pair => {
            const indexOfEqual = pair.indexOf('=');
            const key = pair.slice(0, indexOfEqual).trim();
            let value = pair.slice(indexOfEqual + 1).trim();

            // Remove trailing comma if any
            if (value.endsWith(',')) {
              value = value.slice(0, -1);
            }
            paramObject[key] = value;
          });
        }

        // Construct the query string (preserving `$` in keys)
        const queryString = Object.entries(paramObject)
          .map(([key, value]) => `${key}=${value}`)
          .join('&');

        // Combine with template URL
        let finalUrl = templateURL.includes('?') 
          ? `${templateURL}&${queryString}` 
          : `${templateURL}?${queryString}`;

        console.log("Template URL:", templateURL);

        finalUrl = finalUrl + '&$price_font_size=150&$price_font_color=%5Cred255%5Cgreen255%5Cblue252%3B&data_font_size=186&$data_font_color=%5Cred255%5Cgreen255%5Cblue255%3B&$validity_font_size=60&$validity_font_color=%5Cred255%5Cgreen255%5Cblue255%3B';

        console.log("Final URL:", finalUrl);

        // Create and append the image element
        if (finalUrl) {
          const finalImg = document.createElement('img');
          Object.assign(finalImg, {
            className: 'dm-template-image',
            src: finalUrl,
            alt: 'dm-template-image',
          });
          
          // Add error handling for image load failure
          finalImg.onerror = function() {
            console.warn('Failed to load image:', finalUrl);
            // Set fallback image
            this.src = 'https://smartimaging.scene7.com/is/image/DynamicMediaNA/WKND%20Template?wid=2000&hei=2000&qlt=100&fit=constrain'; // Replace with your fallback image path
            this.alt = 'Fallback image - template image not correctly authored';
          };
          
          block.innerHTML = '';
          block.append(finalImg);
        }
      } catch (error) {
        console.error('error rendering content fragment', {
          error: error.message,
          stack: error.stack
        });
        block.innerHTML = '';
      }
  }
   
}