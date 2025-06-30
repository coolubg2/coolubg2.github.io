document.addEventListener('DOMContentLoaded', () => {
    const relatedGameLimit = 5;  // Change as needed

    // Get current page info from URL
    const pageName = new URLSearchParams(window.location.search).keys().next().value;
    const pageEntry = pagesData.find(page => page.name === pageName);

    if (!pageEntry) {
        console.warn(`Page entry not found for: ${pageName}`);
        return;
    }

    const currentCategories = normalizeTags(pageEntry.category || []);
    const currentFormattedName = pageEntry.formatted_Name || "";

    function normalizeTags(tags) {
        return Array.isArray(tags)
            ? tags.map(tag => tag.toLowerCase().trim()).filter(tag => tag !== "demo")
            : [];
    }

    function normalizeString(str) {
        return str.replace(/[^a-z0-9]/gi, '').toLowerCase();
    }

    function getRelatedGames() {
        const excludedCategory = "demo";
        return pagesData.filter(
            page => page.name !== pageName && !page.category.includes(excludedCategory)
        );
    }

    function calculateCategoryMatch(gameTags) {
        const gameTagsNormalized = normalizeTags(gameTags);
        const matchingTags = currentCategories.filter(tag => gameTagsNormalized.includes(tag));
        return (matchingTags.length / (currentCategories.length || 1)) * 100;  // Avoid divide by zero
    }

    function calculateFormattedNameMatch(gameFormattedName) {
        const normalizedCurrent = normalizeString(currentFormattedName);
        const normalizedGame = normalizeString(gameFormattedName);

        let maxConsecutive = 0, currentStreak = 0;
        const minLen = Math.min(normalizedCurrent.length, normalizedGame.length);

        for (let i = 0; i < minLen; i++) {
            if (normalizedGame[i] === normalizedCurrent[i]) {
                currentStreak++;
                maxConsecutive = Math.max(maxConsecutive, currentStreak);
            } else {
                currentStreak = 0;
            }
        }

        const superMatch = maxConsecutive >= 6;
        if (superMatch) return { match: 100, superMatch: true };

        let matchCount = 0;
        const maxLength = Math.max(normalizedCurrent.length, normalizedGame.length);
        for (let i = 0; i < minLen; i++) {
            if (normalizedGame[i] === normalizedCurrent[i]) matchCount++;
        }

        return { match: (matchCount / maxLength) * 100, superMatch: false };
    }

    function sortGames(games) {
        return games.sort((a, b) => {
            const catA = calculateCategoryMatch(a.category);
            const catB = calculateCategoryMatch(b.category);

            const nameA = calculateFormattedNameMatch(a.formatted_Name);
            const nameB = calculateFormattedNameMatch(b.formatted_Name);

            if (nameA.superMatch !== nameB.superMatch) {
                return nameB.superMatch ? -1 : 1;
            }

            if (catA !== catB) {
                return catB - catA;
            }

            return nameB.match - nameA.match;
        });
    }

    function showRelatedGames() {
        const container = document.getElementById('relatedGamesContainer');
        if (!container) {
            console.error('Container with id "relatedGamesContainer" not found.');
            return;
        }
        container.innerHTML = '';

        const relatedGames = sortGames(getRelatedGames()).slice(0, relatedGameLimit);

        relatedGames.forEach(game => {
            const link = document.createElement('a');
            link.href = `/games/?${game.name}`;
            link.classList.add('related-game');

            const image = document.createElement('img');
            image.src = `/images/games-256/${game.name}.png`;
            image.alt = game.formatted_Name;
            image.style.width = '200px';
            image.style.height = 'auto';
            image.style.aspectRatio = '16/9';

            const nameSpan = document.createElement('span');
            nameSpan.classList.add('game-name');
            nameSpan.textContent = game.formatted_Name;

            link.appendChild(image);
            link.appendChild(nameSpan);
            container.appendChild(link);
        });
    }

    function showAuthorRelatedGames() {
    const container = document.getElementById('authorRelatedGamesContainer');
    if (!container) {
        console.error('Container with id "authorRelatedGamesContainer" not found.');
        return;
    }
    container.innerHTML = '';

    const descriptionDiv = document.querySelector('.description.description-bottom2');
    if (!descriptionDiv) {
        console.error('Div with class "description description-bottom2" not found.');
        return;
    }

    const firstAuthor = pageEntry.authors?.[0]?.toLowerCase().trim();
    const otherAuthors = (pageEntry.authors || [])
        .slice(1)
        .map(a => a.toLowerCase().trim());

    const matchingGames = pagesData.filter(page => {
        if (page.name === pageName) return false; // exclude self
        const pageAuthors = (page.authors || []).map(a => a.toLowerCase().trim());
        return (
            (firstAuthor && pageAuthors.includes(firstAuthor)) ||
            otherAuthors.some(author => pageAuthors.includes(author))
        );
    });

    if (matchingGames.length === 0) {
        // Hide the description div if no matching games
        descriptionDiv.style.display = 'none';
        return; // exit early — nothing to show
    } else {
        // Show the description div if matching games exist
        descriptionDiv.style.display = '';
    }

    const sortedGames = matchingGames.sort((a, b) => {
        const aFirstMatch = a.authors?.some(auth => auth.toLowerCase().trim() === firstAuthor) ? 1 : 0;
        const bFirstMatch = b.authors?.some(auth => auth.toLowerCase().trim() === firstAuthor) ? 1 : 0;
        return bFirstMatch - aFirstMatch;  // prioritize first author match
    });

    let displayGames = sortedGames;

    if (sortedGames.length > 5) {
        // Shuffle the array
        for (let i = sortedGames.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [sortedGames[i], sortedGames[j]] = [sortedGames[j], sortedGames[i]];
        }
        displayGames = sortedGames.slice(0, 5);
    }

    displayGames.forEach(game => {
        const link = document.createElement('a');
        link.href = `/games/?${game.name}`;
        link.classList.add('author-related-game');

        const image = document.createElement('img');
        image.src = `/images/games-256/${game.name}.png`;
        image.alt = game.formatted_Name;
        image.style.width = '200px';
        image.style.height = 'auto';
        image.style.aspectRatio = '16/9';

        const nameSpan = document.createElement('span');
        nameSpan.classList.add('game-name');
        nameSpan.textContent = game.formatted_Name;

        link.appendChild(image);
        link.appendChild(nameSpan);
        container.appendChild(link);
    });
}



    // Show both sets of related games
    showRelatedGames();
    showAuthorRelatedGames();
});
