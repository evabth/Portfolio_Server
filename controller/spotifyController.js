require('dotenv').config()

const path = require('path')



var redirect_uri = "https://localhost:4000/Music"; // change this your value
//var redirect_uri = "http://127.0.0.1:5500/index.html";
 

var client_id = process.env.CLIENT_ID; 
var client_secret = process.env.CLIENT_SECRET;

var access_token = null;
var refresh_token = null;


const AUTHORIZE = "https://accounts.spotify.com/authorize"
const TOKEN = "https://accounts.spotify.com/api/token";
const PLAYLISTS = "https://api.spotify.com/v1/me/playlists";
const DEVICES = "https://api.spotify.com/v1/me/player/devices";
const PLAY = "https://api.spotify.com/v1/me/player/play";
const PAUSE = "https://api.spotify.com/v1/me/player/pause";
const NEXT = "https://api.spotify.com/v1/me/player/next";
const PREVIOUS = "https://api.spotify.com/v1/me/player/previous";
const PLAYER = "https://api.spotify.com/v1/me/player";
const TRACKS = "https://api.spotify.com/v1/playlists/{{PlaylistId}}/tracks";
const CURRENTLYPLAYING = "https://api.spotify.com/v1/me/player/currently-playing";
const SHUFFLE = "https://api.spotify.com/v1/me/player/shuffle";


const request = (req,res) => {

    res.sendFile(path.join(__dirname,'..','public','spotify.json'))
}

module.exports = {request}