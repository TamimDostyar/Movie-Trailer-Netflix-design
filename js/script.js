/*
    Trailer Project: Tamim
    Email: a.tamimdostyar@gmail.com
    Date: 10/25/2022
    Description: This is a program that shows trailers.
*/

/*
    Class to retrieve API information.
*/

class JsonRetriever {
    constructor() {
        this.url = 'https://api.themoviedb.org/3/discover/movie?language=en-US&include_adult=false&page=1&primary_release_date.gte=2000-01-01';
        this.options = {
            method: 'GET',
            headers: {
                accept: 'application/json',
                //Api #1
                Authorization: 'ADD YOUR THEMOVIEDATABASE AUTHORIZATION API KEY'
            }
        };
        //Api #2
        this.apiKey = 'OMDB API KEY';
        this.dataUrl = `http://www.omdbapi.com/?t=`;
        this.tmdbApiKey = 'TMDB API KEY';
    }

    async fetchTrendingMovies() {
        try {
            const response = await fetch(this.url, this.options);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (err) {
            console.error('Error fetching data:', err);
            throw err;
        }
    }

    async fetchDataSecondAPI(movieTitle) {
        const secondUrl = `${this.dataUrl}${encodeURIComponent(movieTitle)}&apikey=${this.apiKey}`;
        try {
            const response = await fetch(secondUrl);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (err) {
            console.error('Error fetching movie details:', err);
            throw err;
        }
    }

    async fetchYouTubeVideos(movieId) {
        const url = `https://api.themoviedb.org/3/movie/${movieId}/videos?api_key=${this.tmdbApiKey}`;
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            const officialYouTubeVideo = data.results.find(video => video.site === 'YouTube' && video.official);
            return officialYouTubeVideo ? { key: officialYouTubeVideo.key } : null;
        } catch (err) {
            console.error('Error fetching YouTube videos:', err);
            throw err;
        }
    }

    async fetchShowData(showTitle) {
        const url = `https://api.tvmaze.com/singlesearch/shows?q=${encodeURIComponent(showTitle)}`;
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const showData = await response.json();

            // Create a structured object with the desired information
            const formattedData = {
                id: showData.id,
                url: showData.url,
                name: showData.name,
                network: showData.network ? {
                    name: showData.network.name,
                    country: showData.network.country.name,
                    officialSite: showData.network.officialSite,
                } : null,
            };
            console.log(formattedData);
            return formattedData;
        } catch (err) {
            console.error('Error fetching show data:', err);
            throw err;
        }
    }

}
// Below is last api to show where a movie can be watched | API #3
function myNetwork(title) {
    const url = `https://api.tvmaze.com/singlesearch/shows?q=${title}`;

    return fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(showData => {
            return {
                id: showData.id,
                url: showData.url,
                name: showData.name,
                webChannel: showData.webChannel ? {
                    id: showData.webChannel.id,
                    name: showData.webChannel.name,
                    officialSite: showData.webChannel.officialSite
                } : null,
            };
        })
        .catch(error => {
            console.error("Error fetching data:", error);
            return {};
        });
}

/*
    Function to display movie thumbnails
*/
async function thumbnailShower() {
    const retriever = new JsonRetriever();

    try {
        const myData = await retriever.fetchTrendingMovies();
        console.log('Fetched data:', myData); // Debugging log
        if (!myData.results || myData.results.length === 0) {
            console.error("No results found");
            return;
        }

        const movies = myData.results;
        const mainContainer = document.querySelector(".cards");

        if (!mainContainer) {
            console.error("Main container for cards not found.");
            return;
        }

        mainContainer.innerHTML = '';

        for (const movie of movies) {
            console.log('Creating card for movie:', movie);

            const cardSection = createCardSection(movie);
            mainContainer.appendChild(cardSection);
        }
    } catch (error) {
        console.error("Error fetching trending movies or availability:", error);
    }
}

// Function to create a card section for each movie
function createCardSection(movie) {
    const cardSection = document.createElement("section");
    cardSection.className = "card";

    const cardImageDiv = createCardImage(movie.poster_path, movie.title);
    cardSection.appendChild(cardImageDiv);

    const cardContentDiv = createCardContent(movie);
    cardSection.appendChild(cardContentDiv);

    return cardSection;
}

// Function to create card image
function createCardImage(posterPath, title, movieId) {
    const cardImageDiv = document.createElement("div");
    cardImageDiv.className = "card-image";
    cardImageDiv.style.position = "relative";

    const movieImage = document.createElement("img");
    movieImage.src = `https://image.tmdb.org/t/p/w500/${posterPath}`;
    movieImage.alt = title;
    movieImage.style.width = "250px";
    movieImage.style.height = "280px";


    cardImageDiv.appendChild(movieImage);

    // Create a new div for the play button
    const playButtonDiv = document.createElement("div");
    playButtonDiv.className = "play-button";
    playButtonDiv.style.position = "absolute";
    playButtonDiv.style.top = "50%";
    playButtonDiv.style.left = "50%";
    playButtonDiv.style.transform = "translate(-50%, -50%)";
    playButtonDiv.style.cursor = "pointer";
    playButtonDiv.style.zIndex = "10";

    const playIcon = document.createElement("span");
    playIcon.innerText = "▶";
    playIcon.style.fontSize = "30px";
    playIcon.style.color = "white";

    playButtonDiv.appendChild(playIcon);
    cardImageDiv.appendChild(playButtonDiv);

    playButtonDiv.addEventListener("click", async () => {
        console.log(`Fetching YouTube video for movie ID: ${movieId}`);
        const youtubeVideo = await new JsonRetriever().fetchYouTubeVideos(movieId);
        console.log('YouTube video:', youtubeVideo);
        if (youtubeVideo) {
            displayIframe(`https://www.youtube.com/embed/${youtubeVideo.key}`);
        } else {
            alert("No video found for this movie.");
        }
    });

    return cardImageDiv;
}

// Function to display iframe in a modal
function displayIframe(videoUrl) {
    const modalOverlay = document.createElement("div");
    modalOverlay.style.position = "fixed";
    modalOverlay.style.top = "0";
    modalOverlay.style.left = "0";
    modalOverlay.style.width = "100%";
    modalOverlay.style.height = "100%";
    modalOverlay.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
    modalOverlay.style.zIndex = "1000";
    modalOverlay.style.display = "flex";
    modalOverlay.style.alignItems = "center";
    modalOverlay.style.justifyContent = "center";

    // Create iframe for YouTube video
    const iframe = document.createElement("iframe");
    iframe.src = videoUrl;
    iframe.width = "800";
    iframe.height = "450";
    iframe.allowFullscreen = true;
    iframe.style.border = "none";

    // Create a close button
    const closeButton = document.createElement("button");
    closeButton.innerText = "Close";
    closeButton.style.position = "absolute";
    closeButton.style.top = "20px";
    closeButton.style.right = "20px";
    closeButton.style.padding = "10px";
    closeButton.style.fontSize = "16px";
    closeButton.style.cursor = "pointer";

    closeButton.addEventListener("click", () => {
        document.body.removeChild(modalOverlay);
    });

    modalOverlay.appendChild(iframe);
    modalOverlay.appendChild(closeButton);
    document.body.appendChild(modalOverlay);
}

// Function to create card section for each movie
function createCardSection(movie) {
    const cardSection = document.createElement("section");
    cardSection.className = "card";

    const cardImageDiv = createCardImage(movie.poster_path, movie.title, movie.id);
    cardSection.appendChild(cardImageDiv);

    const cardContentDiv = createCardContent(movie);
    cardSection.appendChild(cardContentDiv);

    return cardSection;
}

// Function to create title and "Read More" button
function createCardContent(movie) {
    const cardContentDiv = document.createElement("div");
    cardContentDiv.className = "card-content has-text-centered";

    const movieTitle = document.createElement("h3");
    movieTitle.className = "title-is-4";
    movieTitle.innerText = movie.title;

    const readMoreButton = createReadMoreButton(movie.title);
    cardContentDiv.appendChild(movieTitle);
    cardContentDiv.appendChild(readMoreButton);

    return cardContentDiv;
}

// Function to create the "Read More" button
function createReadMoreButton(movieTitle) {
    const readMoreButton = document.createElement("button");
    readMoreButton.className = "button mt-3";
    readMoreButton.innerText = "Read More";

    const popup = createPopup(movieTitle);
    document.body.appendChild(popup);

    let isButtonHovered = false;
    let isPopupHovered = false;

    readMoreButton.addEventListener("mouseenter", () => {
        isButtonHovered = true;
        showPopup(readMoreButton, popup);
    });

    readMoreButton.addEventListener("mouseleave", () => {
        isButtonHovered = false;
        if (!isPopupHovered) {
            popup.style.display = "none";
        }
    });

    popup.addEventListener("mouseenter", () => {
        isPopupHovered = true;
        showPopup(readMoreButton, popup);
    });

    popup.addEventListener("mouseleave", () => {
        isPopupHovered = false;
        if (!isButtonHovered) {
            popup.style.display = "none";
        }
    });

    return readMoreButton;
}

function createPopup(movieTitle) {
    const popup = document.createElement("div");
    popup.className = "popup";
    popup.style.display = "none";
    popup.style.position = "absolute";
    popup.style.width = "460px";
    popup.style.border = "1px solid #ccc";
    popup.style.backgroundColor = "#333";
    popup.style.color = "white";
    popup.style.padding = "10px";
    popup.style.zIndex = "1000";

    const retriever = new JsonRetriever();

    // Fetch both movie data and additional network info
    Promise.all([
        retriever.fetchDataSecondAPI(movieTitle),
        myNetwork(movieTitle)
    ])
        .then(([movieData, myadditional]) => {
            const webChannelInfo = myadditional.webChannel;

            popup.innerHTML = `
            <p>Title: ${movieData.Title}</p>
            <p>Released: ${movieData.Released}</p>
            <p>Director: ${movieData.Director}</p>
            <p>Writer: ${movieData.Writer}</p>
            <p>Actors: ${movieData.Actors}</p>
            <p>Awards: ${movieData.Awards}</p>
            <p>Language: ${movieData.Language}</p>
            <p>Ratings: ${movieData.Ratings.map(r => `${r.Source}: ${r.Value}`).join(", ")}</p>
            <p>Overview: ${movieData.Plot}</p>
            <p>Web Channel: ${webChannelInfo ? webChannelInfo.name : "N/A"}</p>
            ${webChannelInfo && webChannelInfo.officialSite ? `<p>Official Site: <a href="${webChannelInfo.officialSite}" target="_blank">${webChannelInfo.officialSite}</a></p>` : ''}
        `;
        })
        .catch(error => {
            console.error('Error fetching movie details:', error);
            popup.innerHTML = "<p>Error loading movie details.</p>";
        });

    return popup;
}



// Function to show popup when hovering over the "Read More" button
function showPopup(button, popup) {
    const rect = button.getBoundingClientRect();
    popup.style.display = "block";
    popup.style.top = `${rect.top + window.scrollY - popup.offsetHeight}px`;
    popup.style.left = `${rect.left}px`;
}
// Eventlistener to make the sound button for main trailler and then it makes local storage the amount of time it goes on and off
document.addEventListener("DOMContentLoaded", () => {
    main();

    const soundToggle = document.getElementById("soundToggle");
    const myVideo = document.getElementById("myVideo");

    soundToggle.addEventListener("click", () => {
        myVideo.muted = !myVideo.muted;
        soundToggle.querySelector("#soundIcon").textContent = myVideo.muted ? "🔊" : "🔇";
    });

    // Initialize or update click count in local storage
    try {
        if (localStorage.clickcount) {
            localStorage.clickcount = Number(localStorage.clickcount) + 1;
        } else {
            localStorage.clickcount = 1;
        }
        console.log(`Click count: ${localStorage.clickcount}`);
    } catch (e) {
        console.error("Could not access local storage:", e);
    }
});



function main() {
    thumbnailShower();

}

main();