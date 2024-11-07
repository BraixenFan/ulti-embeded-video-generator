const listInput = document.getElementById("list-input");
const iframesOutput = document.getElementById("formatted-output");
const fetchButton = document.getElementById("submit-link-button");
const copyButton = document.getElementById("copy-clipboard-button");
const statusText = document.getElementById("fetch-status");

fetchButton.addEventListener("click", getPlaylistInformation);
copyButton.addEventListener("click", copyToClipboard);

async function getPlaylistInformation() {
  const url = listInput.value.trim();
  const regex = /(?:https?:\/\/(?:www\.)?youtube\.com\/playlist\?list=|^)([a-zA-Z0-9_-]{16,})/;

  const playlistID = url.match(regex);
  
  if (playlistID == null){
    statusText.textContent = "The input is not a valid Youtube Playlist link or ID";
    return
  }
  statusText.textContent = "Loading...";
  const playlist = await fetchPlaylist(playlistID[1]);
  console.log(playlist);
}

async function fetchPlaylist(playlistID){

  const response = await fetch("https://www.googleapis.com/youtube/v3/playlistItems&key=AIzaSyA7lJQiUbPBizcZA4nd7yYlcVFnPAuTbrA", {
    method: 'GET',
    parameters: JSON.stringify({
      part: [
        'contentDetails',
        'status'
      ],
      playlistID: playlistID
    })});
  const data = await response.json();

  return data
}

function copyToClipboard() {
  if (commentOutput.textContent == "Here is where the output will display") {
    copyButton.textContent = "Nothing to copy!";
  } else {
    navigator.clipboard.writeText(commentOutput.textContent);
    copyButton.textContent = "Successfully copied!";
  }
  setTimeout(() => { copyButton.textContent = "Copy to Clipboard" }, 2000)
}