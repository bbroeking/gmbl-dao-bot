"use strict";
const axios = require('axios');

class OddsClient {
    constructor(apiKey) {
        this.apiKey = apiKey;
    }


    // const sportKey = 'baseball_mlb' // use the sport_key from the /sports endpoint below, or use 'upcoming' to see the next 8 games across all sports

    // const regions = 'us' // uk | us | eu | au. Multiple can be specified if comma delimited

    // const markets = 'h2h,totals' // h2h | spreads | totals. Multiple can be specified if comma delimited

    // const oddsFormat = 'american' // decimal | american

    // const dateFormat = 'unix' // iso | unix

    getSports() {
        axios.get('https://api.the-odds-api.com/v4/sports', {
                params: {
                    apiKey: this.apiKey
                }
            })
            .then(response => {
                console.log(response.data)
            })
            .catch(error => {
                console.log('Error status', error.response.status)
                console.log(error.response.data)
            })
    }

    getOdds(
        sportKey,
        regions,
        markets,
        oddsFormat,
        dateFormat
    ) {
        console.log(sportKey, regions, markets, oddsFormat, dateFormat);
        return axios.get(`https://api.the-odds-api.com/v4/sports/${sportKey}/odds`, {
                params: {
                    apiKey: this.apiKey,
                    regions,
                    markets,
                    oddsFormat,
                    dateFormat,
                }
            })
            .then(response => {
                // response.data.data contains a list of live and 
                //   upcoming events and odds for different bookmakers.
                // Events are ordered by start time (live events are first)
                console.log(JSON.stringify(response.data, null, 4))

                // Check your usage
                console.log('Remaining requests', response.headers['x-requests-remaining'])
                console.log('Used requests', response.headers['x-requests-used'])

                return response.data;
            })
            .catch(error => {
                console.log('Error status', error.response.status)
                console.log(error.response.data)
            });
    }

    getScores(
        sportKey,
        daysFrom,
        dateFormat
    ) {
        return axios.get(`https://api.the-odds-api.com/v4/sports/${sportKey}/scores/`, {
                params: {
                    apiKey: this.apiKey,
                    daysFrom,
                    dateFormat
                }
            })
            .then(response => {
                // response.data.data contains a list of live and 
                //   upcoming events and odds for different bookmakers.
                // Events are ordered by start time (live events are first)
                console.log(JSON.stringify(response.data, null, 4))

                // Check your usage
                console.log('Remaining requests', response.headers['x-requests-remaining'])
                console.log('Used requests', response.headers['x-requests-used'])

                return response.data;
            })
            .catch(error => {
                console.log('Error status', error.response.status)
                console.log(error.response.data)
            });
    }
}

module.exports = OddsClient;