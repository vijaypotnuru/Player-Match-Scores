const express = require("express");
const app = express();
app.use(express.json());

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const path = require("path");
const dbPath = path.join(__dirname, "cricketMatchDetails.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(e.message);
  }
};

initializeDBAndServer();

//Get Players API-1
app.get("/players/", async (request, response) => {
  const getPlayersQuery = `
            SELECT 
                player_id AS playerId,
                player_name AS playerName
            FROM 
                player_details ;`;

  const playersArray = await db.all(getPlayersQuery);
  response.send(playersArray);
});

// Get Player API-2
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `
            SELECT 
                player_id AS playerId,
                player_name AS playerName
            FROM 
                player_details
            WHERE 
                player_id = ${playerId} 
         ;`;

  const player = await db.get(getPlayerQuery);
  response.send(player);
});

// Update Player API-3
app.put("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName } = playerDetails;
  const updatePlayerQuery = `
        UPDATE
            player_details
        SET 
            player_name = '${playerName}'
        ;`;

  await db.run(updatePlayerQuery);
  response.send("Player Details Updated");
});

// Get Match Details API-4
app.get("/matches/:matchId/", async (request, response) => {
  const { matchId } = request.params;
  const getMatchDetailsQuery = `
            SELECT 
                match_id AS matchId,
                match,
                year
            FROM 
                match_details
            WHERE 
                match_id = ${matchId}
         ;`;

  const matchDetails = await db.get(getMatchDetailsQuery);
  response.send(matchDetails);
});

// Get Matches Of Player API-5
app.get("/players/:playerId/matches/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerMatchesQuery = `
        SELECT
            match_id AS matchId,
            match,
            year
        FROM 
            player_match_score NATURAL JOIN match_details
        WHERE 
            player_id = ${playerId}
        ;`;
  const playerMatchesArray = await db.all(getPlayerMatchesQuery);
  response.send(playerMatchesArray);
});

// Get Match Player API-6
app.get("/matches/:matchId/players/", async (request, response) => {
  const { matchId } = request.params;
  const getMatchPlayersQuery = `
        SELECT 
            player_match_score.player_id AS playerId,
            player_name AS playerName

        FROM 
            player_details INNER JOIN player_match_score ON player_details.player_id = player_match_score.player_id 
        WHERE 
            match_id = ${matchId}
        ;`;

  const matchPlayers = await db.all(getMatchPlayersQuery);
  response.send(matchPlayers);
});

// Get PLayer Scores API-7
app.get("/players/:playerId/playerScores", async (request, response)=>{
    const {playerId} = request.params;
    const getPlayerScoreQuery = `
        SELECT
            player_details.player_id AS playerId,
            player_details.player_name AS playerName,
            SUM(player_match_score.score) AS totalScore,
            SUM(fours) AS totalFours,
            SUM(sixes) AS totalSixes
        FROM 
            player_details INNER JOIN player_match_score ON player_details.player_id = player_match_score.player_id 
        WHERE 
            player_details.player_id = ${playerId}        
        ;`;
    const playerScores = await db.get(getPlayerScoreQuery);
    response.send(playerScores);
})




module.exports = app;
