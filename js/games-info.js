document.addEventListener('DOMContentLoaded', function () {
    const DB_NAME = "PlaytimeDB";
    const STORE_NAME = "playtimeLogs";
    const DB_VERSION = 1;

    // Get page name from URL
    const currentPageURL = window.location.search;
    const pageName = currentPageURL.split('?')[1];

    if (!pageName) {
        console.error('Could not extract page name from URL');
        return;
    }

    // Find game/page entry
    const pageEntry = pagesData.find(page => page.name === pageName);
    if (!pageEntry) {
        console.error('Could not find page entry for: ' + pageName);
        return;
    }

    // Prepare data
    const name = pageEntry.formatted_Name || pageName;
    const description = pageEntry.description || "";
    const categories = Array.isArray(pageEntry.category) ? pageEntry.category : ["None"];
    const categoryHTML = categories.join(", ");
    const date = pageEntry.date || "";
    const formattedDate = date ? formatDate(date) : "Unknown";
    const releaseDate = pageEntry.release_Date || "";
    const formattedRelease = releaseDate ? formatDate(releaseDate) : "Unknown";
    const updateDate = pageEntry.update_Date || "";
    const formattedUpdate = updateDate ? formatDate(updateDate) : null;
    const lastUpdateLine = formattedUpdate ? `Last Update: ${formattedUpdate}<br>` : '';
    const authors = Array.isArray(pageEntry.authors) ? pageEntry.authors : [];
    const authorLinks = Array.isArray(pageEntry.authorLinks) ? pageEntry.authorLinks : [];
    const authorHTML = authors.map((author, i) => `<a href="${authorLinks[i] || "#"}" target="_blank">${author}</a>`).join(",<br>");

    // Set page title
    document.title = `${name} - CoolUBG | Cool Unblocked Games`;

    // Playtime
    const playtimeShow = localStorage.getItem('playtime-log');
    const showPlaytime = playtimeShow && playtimeShow.includes("playtime-show");

    // Build HTML
    let descriptionHTML = `
        <div class="description description-left">
            <div class="description-head">
                <h2>Credits and Info</h2>
            </div>
            <p>
                ${name}<br>
                Tags: ${categoryHTML}<br><br>
                By ${authorHTML}<br><br>
                Date Added: ${formattedDate}<br>
                ${lastUpdateLine}
                Release Date: ${formattedRelease}<br>
    `;

    if (showPlaytime) {
        descriptionHTML += `
            <br>Total Playtime: <span id="totalPlaytime">Loading...</span><br>
            <span id="lastPlayedLine">Last Played: Loading...</span>
        `;
    }

    descriptionHTML += `
            </p>
        </div>
        <div class="description description-right">
            <div class="description-head">
                <h2>Description and Overview</h2>
            </div>
            <p>
                ${description}<br><br>
                ${getReleaseSentence(releaseDate, name, authors)}
            </p>
        </div>
        <div class="description description-bottom">
            <div class="description-head">
                <h2>Related Games</h2>
            </div>
            <div id="relatedGamesContainer"></div>
        </div>
        <div class="description description-bottom2">
            <div class="description-head">
                <h2>Games by the Same Author</h2>
            </div>
            <div id="authorRelatedGamesContainer"></div>
        </div>
    `;

    document.getElementById('description-container').innerHTML = descriptionHTML;

    // Playtime DB logic
    if (showPlaytime) {
        let db;
        const openRequest = indexedDB.open(DB_NAME, DB_VERSION);

        openRequest.onupgradeneeded = function(event) {
            db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: "gameId" });
            }
        };

        openRequest.onsuccess = function(event) {
            db = event.target.result;
            fetchPlaytimeStats(pageName);
        };

        openRequest.onerror = function(event) {
            console.error("Error opening IndexedDB:", event.target.error);
        };

        function fetchPlaytimeStats(pageName) {
            const transaction = db.transaction(STORE_NAME, "readonly");
            const store = transaction.objectStore(STORE_NAME);
            const request = store.get(pageName);

            request.onsuccess = function(event) {
                const playtimeData = event.target.result;

                if (playtimeData && playtimeData.logs) {
                    const playtimeStats = calculatePlaytimeStatsFromLogs(playtimeData.logs);
                    updatePlaytimeDisplay(playtimeStats);
                } else {
                    updatePlaytimeDisplay({ minutesPlayed: "Never Played", lastPlayed: "Unknown" });
                }
            };

            request.onerror = function(event) {
                console.error("Error fetching playtime data:", event.target.error);
            };
        }

        function calculatePlaytimeStatsFromLogs(logs) {
            const minutesPlayed = logs.length;
            const firstPlayed = logs[0];
            const lastPlayed = logs[logs.length - 1];

            return {
                minutesPlayed: formatPlaytime(minutesPlayed),
                firstPlayed: firstPlayed,
                lastPlayed: lastPlayed
            };
        }

        function updatePlaytimeDisplay(playtimeStats) {
            document.getElementById('totalPlaytime').textContent = playtimeStats.minutesPlayed;
            const lastPlayedLine = document.getElementById('lastPlayedLine');
            lastPlayedLine.textContent = `Last Played: ${playtimeStats.lastPlayed}`;
            if (playtimeStats.minutesPlayed === "Never Played") {
                lastPlayedLine.style.display = 'none';
            } else {
                lastPlayedLine.style.display = 'block';
            }
        }

        function formatPlaytime(minutes) {
            if (minutes === 1) return "1 minute";
            if (minutes <= 120) return `${minutes} minutes`;
            const hours = (minutes / 60).toFixed(1);
            return `${hours} hours`;
        }
    }

    // === Helpers ===

    function formatDate(date) {
        if (!date || date.trim() === '') return 'Unknown';
        if (/^\d{4}$/.test(date.trim())) {
            // Year only
            return date.trim();
        }
        if (/^\d{1,2}-\d{4}$/.test(date.trim())) {
            // MM-YYYY
            const [month, year] = date.split('-');
            const monthNames = [
                'January', 'February', 'March', 'April', 'May', 'June', 'July',
                'August', 'September', 'October', 'November', 'December'
            ];
            return `${monthNames[parseInt(month, 10) - 1]} ${year}`;
        }
        if (/^\d{1,2}-\d{1,2}-\d{4}$/.test(date.trim())) {
            // DD-MM-YYYY
            const [day, month, year] = date.split('-');
            const monthNames = [
                'January', 'February', 'March', 'April', 'May', 'June', 'July',
                'August', 'September', 'October', 'November', 'December'
            ];
            return `${getDayWithSuffix(parseInt(day, 10))} of ${monthNames[parseInt(month, 10) - 1]} ${year}`;
        }
        return date;
    }

    function getDayWithSuffix(day) {
        if (day > 3 && day < 21) return day + 'th';
        switch (day % 10) {
            case 1: return day + 'st';
            case 2: return day + 'nd';
            case 3: return day + 'rd';
            default: return day + 'th';
        }
    }

    function getReleaseSentence(releaseDate, name, authors) {
        if (!releaseDate || !releaseDate.trim()) return '';
        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];

        // DD-MM-YYYY
        if (/^\d{1,2}-\d{1,2}-\d{4}$/.test(releaseDate)) {
            const [day, month, year] = releaseDate.split('-').map(Number);
            const dayWithSuffix = getDayWithSuffix(day);
            const monthName = monthNames[month - 1];
            return `${name} was released on the ${dayWithSuffix} of ${monthName} ${year} and was created by ${authors.join(', ')}.`;
        }
        // MM-YYYY
        if (/^\d{1,2}-\d{4}$/.test(releaseDate)) {
            const [month, year] = releaseDate.split('-').map(Number);
            const monthName = monthNames[month - 1];
            return `${name} was released in ${monthName} ${year} and was created by ${authors.join(', ')}.`;
        }
        // YYYY
        if (/^\d{4}$/.test(releaseDate.trim())) {
            return `${name} was released in ${releaseDate.trim()} and was created by ${authors.join(', ')}.`;
        }
        // Fallback
        return `${name} was released (${releaseDate}) and was created by ${authors.join(', ')}.`;
    }
});