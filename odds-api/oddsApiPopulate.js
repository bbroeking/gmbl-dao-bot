const { oddsApi } = require('../config.json');
const Sequelize = require('sequelize');
const OddsClient = require('./oddsClient');
const { Scores } = require('../dbObjects');
const _ = require('lodash');
const moment = require('moment');

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
    const dateFormat = 'unix' // iso | unix

    const odds = await oddsClient.getOdds(sportKey, regions, markets, oddsFormat, dateFormat);
    const scores = await oddsClient.getScores(sportKey, 1, dateFormat);
    if (!scores) {
        console.log('could not get scores');
        scores = [];
    }
    if (!odds) {
        console.log('could not get odds');
        odds = [];
    }

    scores.forEach(score => {
        let parsedHome, parsedAway, total;
        if (score.completed) {
            const homeScore = score.scores && score.scores.find(item => item.name === score.home_team);
            const awayScore = score.scores && score.scores.find(item => item.name === score.away_team);
            parsedHome = parseInt(homeScore.score);
            parsedAway = parseInt(awayScore.score);
            total = parsedHome + parsedAway;
        }
        const scoresEntry = {
            gameId: score.id,
            dateTime: score.commence_time,
            completed: score.completed,
            homeTeamName: score.home_team,
            awayTeamName: score.away_team,
            homeTeamScore: score.completed ? parsedHome : 0,
            awayTeamScore: score.completed ? parsedAway : 0,
            totalScore: score.completed ? total : 0,
            lastUpdated: score.completed ? score.last_update : null
        };
        Scores.upsert(scoresEntry);
    })

    odds.forEach(element => {
        const bookmakers = element.bookmakers;
        const books = bookmakers.filter(({ markets }) => markets.length == 2); // markets with 2 have both ml & total

        if (books.length == 0) return;
        const markets = books[0].markets

        let awayML, homeML, total, overPayout, underPayout;
        if (books && markets) {
            const market1 = markets[0];
            const market2 = markets[1];

            if (market1.key === 'h2h') {
                if (market1.outcomes[0].name === element.away_team) {
                    awayML = market1.outcomes[0].price;
                    homeML = market1.outcomes[1].price;
                } else {
                    awayML = market1.outcomes[1].price;
                    homeML = market1.outcomes[0].price;
                }

                // handle totals
                if (market2.outcomes[0].name === "Over") {
                    total = market2.outcomes[0].point;
                    overPayout = market2.outcomes[0].price;
                    underPayout = market2.outcomes[1].price
                } else {
                    total = market2.outcomes[0].point;
                    underPayout = market2.outcomes[0].price;
                    overPayout = market2.outcomes[1].price
                }
            } else {
                if (market2.outcomes[0].name === element.away_team) {
                    awayML = market2.outcomes[0].price;
                    homeML = market2.outcomes[1].price;
                } else {
                    awayML = market2.outcomes[1].price;
                    homeML = market2.outcomes[0].price;
                }

                // handle totals
                if (market2.outcomes[0].name === "Over") {
                    total = market2.outcomes[0].point;
                    overPayout = market2.outcomes[0].price;
                    underPayout = market2.outcomes[1].price
                } else {
                    total = market2.outcomes[0].point;
                    underPayout = market2.outcomes[0].price;
                    overPayout = market2.outcomes[1].price
                }
            }
        }

        const oddsEntry = {
            gameId: element.id,
            dateTime: element.commence_time,
            awayTeamName: element.away_team,
            homeTeamName: element.home_team,
            awayMoneyLine: awayML,
            homeMoneyLine: homeML,
            total: total,
            overPayout,
            underPayout,
        };

        PreGameOdds.upsert(oddsEntry);
    });
}

if (require.main === module) {
    main();
}