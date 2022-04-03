const MLBv3OddsClient = require('fantasydata-node-client/MLB/MLBv3Odds');
const { mlbApiKey } = require('../config.json');
const Sequelize = require('sequelize');

const sequelize = new Sequelize('database', 'username', 'password', {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    storage: 'database.sqlite',
});

const PreGameOdds = require('./models/preGameOdd.js')(sequelize);
const Picks = require('./models/pick')(sequelize);

async function main() {
    const dataApi = new MLBv3OddsClient(mlbApiKey);
    const data = await dataApi.getPreGameOddsByDatePromise('2021-09-08');
    const obj = JSON.parse(data);

    obj.forEach(element => {
        console.log(element)
        const sportsbooks = element.PregameOdds;
        const sportsbook = sportsbooks.find(element => element.SportsbookId === 7);
        const preGameOddsObj = {
            gameId: element.GameId,
            day: element.Day,
            dateTime: element.DateTime,
            season: element.Season,
            seasonType: element.SeasonType,
            status: element.Status,
            awayTeamName: element.AwayTeamName,
            homeTeamName: element.HomeTeamName,
            homeTeamScore: element.HomeTeamScore,
            awayTeamScore: element.AwayTeamScore,
            totalScore: element.TotalScore,
            awayMoneyLine: sportsbook.AwayMoneyLine,
            homeMoneyLine: sportsbook.HomeMoneyLine,
            overUnder: sportsbook.OverUnder,
            overPayout: sportsbook.OverPayout,
            underPayout: sportsbook.UnderPayout
        };
        PreGameOdds.create(preGameOddsObj);
    });

    // await Picks.create({
    //     hash: 'blah',
    //     user: '406637022694998017',
    //     side: 'away',
    //     odds: 63033,
    //     preGameOdd: 63033,
    // });
}

if (require.main === module) {
    main();
}