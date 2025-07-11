async function generatePageListMULTI() {
    console.log("generatePageListMULTI is running...");

    const pageList = document.getElementById('pageListMULTI');
    if (!pageList) {
        console.error("Error: Element with ID 'pageListMULTI' not found!");
        return;
    }

    pageList.innerHTML = "";

    if (!Array.isArray(pagesData) || pagesData.length === 0) {
        console.error("Error: pagesData is empty or not defined!", pagesData);
        return;
    }

    const multiplayerPages = pagesData
        .filter(page => Array.isArray(page.category) && page.category.includes("multiplayer"))
        .sort((a, b) => a.name.localeCompare(b.name));

    console.log("Filtered Multiplayer Pages:", multiplayerPages);

    if (multiplayerPages.length === 0) {
        console.warn("Warning: No multiplayer games found!");
        return;
    }

    for (let index = 0; index < multiplayerPages.length; index++) {
        const page = multiplayerPages[index];
        const formattedName = page.formatted_Name || page.name;

        let playtimeText = "Loading...";
        try {
            playtimeText = await calculatePlaytime(page.name);
        } catch (error) {
            console.error("Error retrieving playtime for", page.name, error);
            playtimeText = "Error";
        }

        console.log(`Game: ${formattedName} | Playtime: ${playtimeText}`);

        if (!(localStorage.getItem('playtime-log') && localStorage.getItem('playtime-log').includes("playtime-hide"))) {
            const li = document.createElement('li');
            li.innerHTML = `
             <div class="suggest-game" 
              onmouseover="highlightImageP('suggest-imgP${index + 1}', 'suggest-textP${index + 1}')" 
              onmouseout="removeHighlightP('suggest-imgP${index + 1}', 'suggest-textP${index + 1}')">
              <a href="games/?${page.name}">
                  <div class="suggest-text-back-container" style="position: absolute; margin: 0.6vh; width: 16.8vw; height: calc(20.3vw * 9 / 16); overflow: hidden; z-index: 2;">
                      <div class="suggest-text-back" style="position: absolute; width: 300%; height: 300%; left: -5vw; top: 0vw; background-color: black; opacity: 0;"></div>
                  </div>
                  <img id="suggest-imgP${index + 1}" src="/images/games-256/${page.name}.png" alt="${page.name}" style="margin: 0.6vh; border-radius: 0.4vw; position: relative; height: auto;" />
                  <p id="suggest-textP${index + 1}" style="position: absolute; z-index: 999; left: 1.25vw; top: calc(100% - 4.75vw - 0.9rem); opacity: 0; text-align: left;">
                      <span style="display: block; margin-bottom: -0.5rem;">${formattedName}</span>
                      <span style="font-size: 0.95rem; margin: 0; padding: 0; color: #d9d9d9 !important; letter-spacing: normal; line-height: 1; display: inline-flex; align-items: center;">
                          <svg xmlns="http://www.w3.org/2000/svg" 
                               style="width: 1em !important; height: 1em !important; fill: currentColor !important; vertical-align: middle !important; margin-right: 0.15em !important; filter: drop-shadow(0px 0px 4px #000) drop-shadow(0px 0px 2px #000) drop-shadow(0px 0px 4px #000);" 
                               viewBox="0 -960 960 960">
                              <path d="m612-292 56-56-148-148v-184h-80v216l172 172ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-400Zm0 320q133 0 226.5-93.5T800-480q0-133-93.5-226.5T480-800q-133 0-226.5 93.5T160-480q0 133 93.5 226.5T480-160Z"/>
                          </svg>
                          ${playtimeText}
                      </span>
                  </p>
              </a>
          </div>
            `;
            pageList.appendChild(li);

            const textElement = li.querySelector(`#suggest-textP${index + 1}`);
            const imageElement = li.querySelector(`#suggest-imgP${index + 1}`);

            const prevOpacity = textElement.style.opacity;
            textElement.style.opacity = '1';

            const imageWidth = imageElement.getBoundingClientRect().width;
            const paddingOffset = 22;
            const maxWidth = imageWidth - paddingOffset;
            const textWidth = textElement.getBoundingClientRect().width;

            if (textWidth > maxWidth) {
                const scaleX = maxWidth / textWidth;
                textElement.style.transformOrigin = 'left center';
                textElement.style.transform = `scale(${scaleX}, ${scaleX})`;
                textElement.style.letterSpacing = 'normal';
            } else {
                textElement.style.transform = 'scale(1, 1)';
                textElement.style.letterSpacing = 'normal';
            }

            textElement.style.opacity = prevOpacity;
        } else {
            const li = document.createElement('li');
            li.innerHTML = `
          <div class="suggest-game" 
              onmouseover="highlightImageP('suggest-imgP${index + 1}', 'suggest-textP${index + 1}')" 
              onmouseout="removeHighlightP('suggest-imgP${index + 1}', 'suggest-textP${index + 1}')">
              <a href="games/?${page.name}">
                  <div class="suggest-text-back-container" style="position: absolute; margin: 0.6vh; width: 16.8vw; height: calc(20.3vw * 9 / 16); overflow: hidden; z-index: 2;">
                      <div class="suggest-text-back" style="position: absolute; width: 300%; height: 300%; left: -5vw; top: 0vw; background-color: black; opacity: 0;"></div>
                  </div>
                  <img id="suggest-imgP${index + 1}" src="/images/games-256/${page.name}.png" alt="${page.name}" style="margin: 0.6vh; border-radius: 0.4vw; position: relative; height: auto;" />
                  <p id="suggest-textP${index + 1}" style=" position: absolute; z-index: 999; left: 1.25vw; top: calc(100% - 4.75vw); opacity: 0; text-align: left;">
                      <span style="display: block; margin-bottom: -0.5rem;">${formattedName}</span>
                  </p>
              </a>
          </div>
            `;
            pageList.appendChild(li);

            const textElement = li.querySelector(`#suggest-textP${index + 1}`);
            const imageElement = li.querySelector(`#suggest-imgP${index + 1}`);

            const prevOpacity = textElement.style.opacity;
            textElement.style.opacity = '1';

            const imageWidth = imageElement.getBoundingClientRect().width;
            const paddingOffset = 22;
            const maxWidth = imageWidth - paddingOffset;
            const textWidth = textElement.getBoundingClientRect().width;

            if (textWidth > maxWidth) {
                const scaleX = maxWidth / textWidth;
                textElement.style.transformOrigin = 'left center';
                textElement.style.transform = `scale(${scaleX}, ${scaleX})`;
                textElement.style.letterSpacing = 'normal';
            } else {
                textElement.style.transform = 'scale(1, 1)';
                textElement.style.letterSpacing = 'normal';
            }

            textElement.style.opacity = prevOpacity;
        }
    }
}
