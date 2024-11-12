const listInput = document.getElementById("list-input");
const iframesOutput = document.getElementById("formatted-output");
const fetchButton = document.getElementById("submit-link-button");
const copyButton = document.getElementById("copy-clipboard-button");
const statusText = document.getElementById("fetch-status");

const paginationContainer = document.getElementsByClassName("pagination-container")[0];
const [previousPageButton, nextPageButton] = document.getElementsByClassName("page-bttn");

fetchButton.addEventListener("click", getPlaylistInformation);
previousPageButton.addEventListener("click", getPreviousPageInformation);
nextPageButton.addEventListener("click", getNextPageInformation);
copyButton.addEventListener("click", copyToClipboard);

let currentPlaylist;
let previousPageId = null;
let nextPageId = null;
let morePages = false;

togglePaginator();

async function getPlaylistInformation() {
  iframesOutput.textContent = ""
  const url = listInput.value.trim();
  const regex = /(?:playlist\?list=|\/playlist\?list=|(?:\?|\&)list=)([a-zA-Z0-9_-]{16,})/;

  const playlistID = url.match(regex);

  if (playlistID == null) {
    statusText.textContent = "The input is not a valid Youtube Playlist link or ID";
    return
  }
  statusText.textContent = "Loading...";
  const playlist = await fetchPlaylist(playlistID[1], "");

  if (playlist.status.http_code == 404) {
    statusText.textContent = "Playlist not found! Verify the URL is correct";
    console.error(playlist.contents);
    return
  }

  if (playlist.status.http_code == 403) {
    statusText.textContent = "Playlist forbidden! You can't fetch from the Watch later or History playlists";
    console.error(playlist.contents);
    return
  }

  currentPlaylist = playlistID[1];
  const playlistData = JSON.parse(playlist.contents);
  previousPageId = playlistData.prevPageToken;
  nextPageId = playlistData.nextPageToken;

  console.log(playlistData);

  togglePaginator();
  startFormatting(playlistData);
}

async function getNextPageInformation() {
  iframesOutput.textContent = ""
  statusText.textContent = "Loading...";
  const playlist = await fetchPlaylist(currentPlaylist, nextPageId);
  const playlistData = JSON.parse(playlist.contents);
  previousPageId = playlistData.prevPageToken;
  nextPageId = playlistData.nextPageToken;

  togglePaginator();
  startFormatting(playlistData);
}

async function getPreviousPageInformation() {
  iframesOutput.textContent = ""
  statusText.textContent = "Loading...";
  const playlist = await fetchPlaylist(currentPlaylist, previousPageId);
  const playlistData = JSON.parse(playlist.contents);
  previousPageId = playlistData.prevPageToken;
  nextPageId = playlistData.nextPageToken;

  togglePaginator();
  startFormatting(playlistData);
}

function startFormatting(videoData) {
  console.log(videoData);
  iframesOutput.textContent = ""
  videoData.items.forEach(video => {
    if (video.status.privacyStatus != 'public') return
    iframesOutput.textContent += `<iframe width="560" height="315" src="https://youtube.com/embed/${video.contentDetails.videoId}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe><br>\n\n`
  });
  statusText.textContent = "Here's your code!";
}

async function fetchPlaylist(playlistID, pageToken) {
  const apiKey = 'AIzaSyA7lJQiUbPBizcZA4nd7yYlcVFnPAuTbrA';
  let url = "";

  if (pageToken == "") {
    url = `https://api.allorigins.win/get?url=${encodeURIComponent(`https://www.googleapis.com/youtube/v3/playlistItems?part=contentDetails,status&maxResults=50&playlistId=${playlistID}&key=${apiKey}`)}`;
  } else {
    url = `https://api.allorigins.win/get?url=${encodeURIComponent(`https://www.googleapis.com/youtube/v3/playlistItems?part=contentDetails,status&maxResults=50&playlistId=${playlistID}&pageToken=${pageToken}&key=${apiKey}`)}`;
  }

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const data = await response.json();
    return data;

  } catch (error) {
    console.error('Error trying to obtain playlist:', error);
    return null;
  }
}

function copyToClipboard() {
  if (iframesOutput.textContent == "Here is where the output will display") {
    copyButton.textContent = "Nothing to copy!";
  } else {
    navigator.clipboard.writeText(iframesOutput.textContent);
    copyButton.textContent = "Successfully copied!";
  }
  setTimeout(() => { copyButton.textContent = "Copy to Clipboard" }, 2000)
}

function togglePaginator() {
  if (previousPageId != null) {
    previousPageButton.style.display = "block"
  } else {
    previousPageButton.style.display = "none";
  };

  if (nextPageId != null) {
    nextPageButton.style.display = "block"
  } else {
    nextPageButton.style.display = "none";
  };

}