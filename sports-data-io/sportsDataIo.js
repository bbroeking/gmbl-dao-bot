const MLBv3OddsClient = require('fantasydata-node-client/MLB/MLBv3Odds');
const { mlbApiKey } = require('../config.json');
const Sequelize = require('sequelize');

const sequelize = new Sequelize('database', 'username', 'password', {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    storage: 'database.sqlite',
});

const PreGameOdds = require('./models/preGameOdds.js')(sequelize);

async function main() {
    console.log(mlbApiKey);
    const dataApi = new MLBv3OddsClient(mlbApiKey);
    const data = await dataApi.getPreGameOddsByDatePromise('2021-08-08'); //..getBettingEventsByDatePromise('2021-05-05');
    const obj = JSON.parse(data);

    obj.forEach(element => {
        const sportsbook = element.PregameOdds[0];
        const preGameOddsObj = {
            gameId: element.GameId,
            season: element.Season,
            seasonType: element.SeasonType,
            awayTeamName: element.AwayTeamName,
            homeTeamName: element.HomeTeamName,
            awayMonyLine: sportsbook.AwayMoneyLine,
            homeMoneyLine: sportsbook.HomeMoneyLine
        };
        PreGameOdds.upsert(preGameOddsObj);
        console.log(preGameOddsObj);
    });
}

if (require.main === module) {
    main();
}