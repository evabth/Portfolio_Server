require('dotenv').config()
const fs = require('fs')
const axios = require('axios')

const path = require('path')


//remember to change to the server address
var redirect_uri = "http://localhost:4000/Music/Login"
 

var client_id = process.env.CLIENT_ID; 
var client_secret = process.env.CLIENT_SECRET;

let tokens = null

const AUTHORIZE = "https://accounts.spotify.com/authorize"
const TOKEN = "https://accounts.spotify.com/api/token";
const TOPTRACKS = "https://api.spotify.com/v1/me/top/tracks?time_range=short_term&limit=14"
const TOPARTISTS = "https://api.spotify.com/v1/me/top/artists?time_range=short_term&limit=14"



const authorize = (req,res) => {

    if (req.query.code){
        fetchAccessToken(req.query.code);
        res.sendFile(path.join(__dirname,'..','public','spotify.json'))
    }else if (req.query.key == process.env.LOGIN_KEY){
        requestAuthorization(req,res)
    }else {
        res.status(404).sendFile(path.join(__dirname,'..','views','404.html'))
    }

    console.log("music request fufilled")
}


function requestAuthorization(req,res){
    console.log("request starting")

    let url = AUTHORIZE;
    url += "?client_id=" + client_id;
    url += "&response_type=code";
    url += "&redirect_uri=" + encodeURI(redirect_uri);
    url += "&show_dialog=false";
    url += "&scope=user-read-private user-read-email user-modify-playback-state user-read-playback-position user-library-read streaming user-read-playback-state user-read-recently-played playlist-read-private user-top-read";
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

async function callAuthorizationApi(body){
    const authHeader = {
        Authorization: 'Basic ' + Buffer.from(`${client_id}:${client_secret}`).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded'
    };

    return axios.post(TOKEN, body, {
        headers: authHeader
    })
    .then(async response => {
        await handleAuthorizationResponse(response);
    })
    .catch(error => {
        console.error('Error calling authorization API:', error);
        // Handle error appropriately
    });
}


async function handleAuthorizationResponse(response){
    console.log("handle Auth called")
    if (response.status == 200){

        console.log(response.data);
        var data = response.data;
        const filePath = "token.json"
        if ( data.access_token && data.refresh_token){

            
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
                    console.log('JSON data written to file successfully 1');
                }
            });

        }else if (data.access_token){
            try {
                let fileContents = await fs.promises.readFile(filePath); // Read file asynchronously

                let tokens = JSON.parse(fileContents)

                tokens.access_token = data.access_token

                const tokensString = JSON.stringify(tokens, null, 2);

                fs.writeFile(filePath, tokensString, (err) => {
                    if (err) {
                        console.error('Error writing JSON to file:', err);
                    } else {
                        console.log('JSON data written to file successfully 2');
                    }
                });
                
                console.log("refresh of access token written")
        
            } catch (err) {
                throw new Error(`Error reading/parsing JSON file: ${err.message}`);
        
            }



        }
    }
    else {
        //something more should go here to indicate what errors have happened
        console.log(response.status)
    }
}

function refreshAccessTokenBody(refresh_token){
    let body = "grant_type=refresh_token";
    body += "&refresh_token=" + refresh_token;
    body += "&client_id=" + client_id;
    return body
}

async function handleTokenFile(tokenFilePath) {
    try {
        const data = await fs.promises.readFile(tokenFilePath); // Read file asynchronously
        const tokenJSON = JSON.parse(data.toString())
        return tokenJSON

    } catch (err) {
        throw new Error(`Error reading/parsing JSON file: ${err.message}`);

    }
}


async function getInfo (req,res){

    console.log("getting info")

    try {

        const tokenFilePath = 'token.json';

        const tokenJSON = await handleTokenFile(tokenFilePath);

        let { access_token, refresh_token } = tokenJSON;

        let {spotifyResponse: topTrackData, access_token: updatedAccess_token, refresh_token: updatedRefresh_token} = await getTopTracks(access_token,refresh_token)
        let {spotifyResponse: topArtistData} = await getTopArtists(updatedAccess_token,updatedRefresh_token)

        const simplifiedTrackData = topTrackData.map(track => ({
            name: track.name,
            imageUrl: track.album.images[0].url
        }));
        const simplifiedArtistData = topArtistData.map(Artist => ({
            name: Artist.name,
            imageUrl: Artist.images[0].url
        }));



        res.json({
            TopArtists:simplifiedArtistData,
            TopTracks: simplifiedTrackData
        })

    } catch(error) {
        console.error(error)
        res.status(500).send('Internal Server Error')
    }

}


//need to add access_token here and refresh token 
async function callApi(method, url, body, access_token, refresh_token) {
    console.log("api getting called")
    try {
        const response = await axios({
            method: method,
            url: url,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + access_token
            }
        });
        console.log("API call successful");
        return { response};
    } catch (error) {
        console.error('Error making API call:', error.message);
        return { error: error.response};
    }
}


async function getTopTracks(access_token,refresh_token) {
    console.log("getting top tracks")
    if (access_token && refresh_token) {
        const {response, error} = await callApi("GET", TOPTRACKS, null, access_token,refresh_token)

        if (error) {
            return handleSpotifyResponse(error, access_token,refresh_token,getTopTracks)
        }else{
            return handleSpotifyResponse(response,access_token,refresh_token,getTopTracks)
        }

    }else{
        throw new Error("Cannot get top tracks, access token or refresh token undefined");
    }
}

async function getTopArtists(access_token,refresh_token) {
    console.log("getting top Artists")
    if (access_token && refresh_token) {
        const {response, error} = await callApi("GET", TOPARTISTS, null,access_token,refresh_token)

        if (error) {
            return handleSpotifyResponse(error, access_token,refresh_token,getTopArtists)
        }else{
            return handleSpotifyResponse(response,access_token,refresh_token,getTopArtists)
        }

    }else{
        throw new Error("Cannot get top tracks, access token or refresh token undefined");
    }
}

async function handleSpotifyResponse(response,access_token,refresh_token,requestCallback){
    return new Promise (async (resolve, reject) => {
        console.log(response.status)
        if ( response.status == 200 ){

            const spotifyResponse = response.data.items

            resolve({spotifyResponse,access_token,refresh_token})
            
        }
        else if ( response.status == 401 ){
            console.log("getting new access token")
            try {
                await callAuthorizationApi(refreshAccessTokenBody(refresh_token));

                // Read the updated token from the file
                const tokenFilePath = 'token.json';
                const data = await fs.promises.readFile(tokenFilePath);
                const tokenJSON = JSON.parse(data);

                access_token = tokenJSON.access_token;
                refresh_token = tokenJSON.refresh_token;

                // Retry fetching the top tracks with the new access token
                const {spotifyResponse} = await requestCallback(access_token, refresh_token);
                resolve({spotifyResponse,access_token,refresh_token})

            }catch(error){
                reject(error)
            }

        }
        else {
            reject(new Error(`Unexpected response status: ${response.status}`));
        }
    })
}



module.exports = {authorize,getInfo}