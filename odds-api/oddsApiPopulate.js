const { oddsApi } = require('../config.json');
const Sequelize = require('sequelize');
const OddsClient = require('./oddsClient');

const sequelize = new Sequelize('database', 'username', 'password', {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    storage: 'database.sqlite',
});

const PreGameOdds = require('../sports-data-io/models/preGameOdd.js')(sequelize);
const Picks = require('../sports-data-io/models/pick')(sequelize);

// oddsApi
async function main() {
    const oddsClient = new OddsClient(oddsApi);

    const sportKey = 'baseball_mlb' // use the sport_key from the /sports endpoint below, or use 'upcoming' to see the next 8 games across all sports
    const regions = 'us' // uk | us | eu | au. Multiple can be specified if comma delimited
    const markets = 'h2h,totals' // h2h | spreads | totals. Multiple can be specified if comma delimited
    const oddsFormat = 'american' // decimal | american
    const dateFormat = 'iso' // iso | unix

    const odds = await oddsClient.getOdds(sportKey, regions, markets, oddsFormat, dateFormat);

    if (!odds) return;

    odds.forEach(element => {
        const bookmaker = element.bookmakers[0];
        const markets = bookmaker.markets;
        const h2h = markets.find(element => element.key === 'h2h');
        const totals = markets.find(element => element.key === 'totals');

        let awayML, homeML, total;
        if (h2h) {
            const awayOutcome = h2h.outcomes.find(outcomes => outcomes.name === element.away_team);
            awayML = awayOutcome.price;
            const homeOutcome = h2h.outcomes.find(outcomes => outcomes.name === element.home_team);
            homeML = homeOutcome.price;
        }

        if (totals || !totals) {
            total = 9;
        }
        awayML = bookmaker.markets
        const oddsEntry = {
            gameId: element.id,
            dateTime: element.commence_time,
            awayTeamName: element.away_team,
            homeTeamName: element.home_team,

            awayMoneyLine: awayML,
            homeMoneyLine: homeML,
            total: total,
            // overPayout: sportsbook.OverPayout,
            // underPayout: sportsbook.UnderPayout
        };
        console.log(oddsEntry);
    });
}

// async function main() {
//     const dataApi = new MLBv3OddsClient(mlbApiKey);
//     const data = await dataApi.getPreGameOddsByDatePromise('2021-09-08');
//     const obj = JSON.parse(data);

//     obj.forEach(element => {
//         console.log(element)
//         const sportsbooks = element.PregameOdds;
//         const sportsbook = sportsbooks.find(element => element.SportsbookId === 7);
//         const preGameOddsObj = {
//             gameId: element.GameId,
//             day: element.Day,
//             dateTime: element.DateTime,
//             season: element.Season,
//             seasonType: element.SeasonType,
//             status: element.Status,
//             awayTeamName: element.AwayTeamName,
//             homeTeamName: element.HomeTeamName,
//             homeTeamScore: element.HomeTeamScore,
//             awayTeamScore: element.AwayTeamScore,
//             totalScore: element.TotalScore,
//             awayMoneyLine: sportsbook.AwayMoneyLine,
//             homeMoneyLine: sportsbook.HomeMoneyLine,
//             overUnder: sportsbook.OverUnder,
//             overPayout: sportsbook.OverPayout,
//             underPayout: sportsbook.UnderPayout
//         };
//         PreGameOdds.create(preGameOddsObj);
//     });

//     // await Picks.create({
//     //     hash: 'blah',
//     //     user: '406637022694998017',
//     //     side: 'away',
//     //     odds: 63033,
//     //     preGameOdd: 63033,
//     // });
// }

if (require.main === module) {
    main();
}