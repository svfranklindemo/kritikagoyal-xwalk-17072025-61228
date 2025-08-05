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
  const adventureDiv = document.createElement('div');
  adventureDiv.id = "adventure-" + slug; 
  quoteDiv.replaceWith(adventureDiv);

  // Add debugging information
  console.log('Starting fetch request...');
  console.log('Slug:', slug);
  console.log('Adventure div ID:', adventureDiv.id);

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
  if (!response.data || !response.data.adventureList || !response.data.adventureList.items || !response.data.adventureList.items[0]) {
    throw new Error('Response does not have expected structure');
  }
  
  const adventure = response.data.adventureList.items[0];
  console.log('Adventure data:', adventure);
  
  // Check if required fields exist
  if (!adventure.primaryImage || !adventure.primaryImage._path) {
    throw new Error('Missing primaryImage._path in response');
  }
  
  const backgroundImage = adventure.primaryImage._path;
  console.log('Background image path:', backgroundImage);
  
  document.getElementById(adventureDiv.id).innerHTML = "<section><img src=" + AEM_HOST + backgroundImage + "></section>";  

  const adventureTitle = adventure.title;
  document.getElementById(adventureDiv.id).innerHTML += "<section><h3>"+ adventureTitle + "</h3></section>";

  const adventureDesc = adventure.description.plaintext;
  document.getElementById(adventureDiv.id).innerHTML += "<section>" + adventureDesc + "</section>";

  const adventureType = adventure.adventureType;
  document.getElementById(adventureDiv.id).innerHTML += "<section>" + "Adventure Type: " + adventureType + "</section>";

  const tripLength = adventure.tripLength;
  document.getElementById(adventureDiv.id).innerHTML += "<section>" +"Trip Length: " + tripLength + "</section>";

  const tripDifficulty = adventure.difficulty;
  document.getElementById(adventureDiv.id).innerHTML += "<section>" + "Difficulty: " + tripDifficulty + "</section>";

  const groupSize = adventure.groupSize;
  document.getElementById(adventureDiv.id).innerHTML += "<section>" + "Group Size: " + groupSize + "</section>";

  const tripItinerary= adventure.itinerary.html;
  document.getElementById(adventureDiv.id).innerHTML += "<section>" + "Itinerary: </br>" + tripItinerary + "</section>";

  console.log('Successfully updated DOM with adventure data');
})
.catch(error => {
  console.error('Error fetching data:', error);
  console.error('Error details:', {
    message: error.message,
    stack: error.stack,
    name: error.name
  });
  
  // Display error in the DOM for debugging
  document.getElementById(adventureDiv.id).innerHTML = `
    <section style="color: red; padding: 20px; border: 1px solid red;">
      <h3>Error loading adventure data</h3>
      <p><strong>Error:</strong> ${error.message}</p>
      <p><strong>Type:</strong> ${error.name}</p>
      <p>Check browser console for more details.</p>
    </section>
  `;
});

}





