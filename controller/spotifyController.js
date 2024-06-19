require('dotenv').config()
const fs = require('fs')
const axios = require('axios')

const path = require('path')



var redirect_uri = "http://localhost:4000/Music/Login"
 

var client_id = process.env.CLIENT_ID; 
var client_secret = process.env.CLIENT_SECRET;

let tokens = null


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



const authorize = (req,res) => {

    if (req.url.length > 1){
        if (req.query.code){
            fetchAccessToken(req.query.code);
            res.sendFile(path.join(__dirname,'..','public','spotify.json'))
        }else if (req.query.key == process.env.LOGIN_KEY){
            requestAuthorization(req,res)
        }else {
            res.status(404).sendFile(path.join(__dirname,'views','404.html'))
        }

    }else{
        res.status(404).sendFile(path.join(__dirname,'views','404.html'))
        

    }


    
    console.log(req.url.length)
    console.log("music request fufilled")
}


function requestAuthorization(req,res){
    console.log("request starting")

    let url = AUTHORIZE;
    url += "?client_id=" + client_id;
    url += "&response_type=code";
    url += "&redirect_uri=" + encodeURI(redirect_uri);
    url += "&show_dialog=false";
    url += "&scope=user-read-private user-read-email user-modify-playback-state user-read-playback-position user-library-read streaming user-read-playback-state user-read-recently-played playlist-read-private";
    console.log("right before redirect")
    res.redirect(url); // Show Spotify's authorization screen
}


function fetchAccessToken(code){
    let body = "grant_type=authorization_code";
    body += "&code=" + code; 
    body += "&redirect_uri=" + encodeURI(redirect_uri);
    body += "&client_id=" + client_id;
    body += "&client_secret=" + client_secret;
    callAuthorizationApi(body);
}

function callAuthorizationApi(body){
    const authHeader = {
        Authorization: 'Basic ' + Buffer.from(`${client_id}:${client_secret}`).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded'
    };

    return axios.post(TOKEN, body, {
        headers: authHeader
    })
    .then(response => {
        handleAuthorizationResponse(response);
    })
    .catch(error => {
        console.error('Error calling authorization API:', error);
        // Handle error appropriately
    });
}


function handleAuthorizationResponse(response){
    if (response.status == 200){

        console.log(response.data);
        var data = response.data;
        if ( data.access_token && data.refresh_token){

            const filePath = "token.json"
            tokens = {
                access_token : data.access_token,
                refresh_token : data.refresh_token,
            }

            const tokensString = JSON.stringify(tokens, null, 2); // null and 2 for pretty formatting

            // Write JSON data to the file
            fs.writeFile(filePath, tokensString, (err) => {
                if (err) {
                    console.error('Error writing JSON to file:', err);
                } else {
                    console.log('JSON data written to file successfully');
                }
            });
            

        }
    }
    else {
        //something more should go here to indicate what errors have happened
        console.log(response.status)
    }
}


module.exports = {authorize}