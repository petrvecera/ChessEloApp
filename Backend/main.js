// chess backend
// quick & dirty style
// (c) 2017 pavel zaruba
// 
const
    express = require('express'),
    bodyParser = require('body-parser'),
    fs = require('fs');

/*
    players: [
            { "id": 1, "name": "Šaňo", "games": 0, "rating": 1200, "winsWhite": 0, "winsBlack": 1, "losesWhite": 0, "losesBlack": 0, "drawWhite": 0, "drawBlack": 0 },
            { "id": 2, "name": "Dušan", "games": 0, "rating": 1200, "winsWhite": 0, "winsBlack": 1, "losesWhite": 0, "losesBlack": 0, "drawWhite": 0, "drawBlack": 0 },
            { "id": 3, "name": "Peťo", "games": 0, "rating": 1200, "winsWhite": 0, "winsBlack": 1, "losesWhite": 0, "losesBlack": 0, "drawWhite": 0, "drawBlack": 0 },
            { "id": 4, "name": "Pavel", "games": 0, "rating": 1200, "winsWhite": 0, "winsBlack": 1, "losesWhite": 0, "losesBlack": 0, "drawWhite": 0, "drawBlack": 0 },
            { "id": 5, "name": "Miro", "games": 0, "rating": 1200, "winsWhite": 0, "winsBlack": 1, "losesWhite": 0, "losesBlack": 0, "drawWhite": 0, "drawBlack": 0 },
            { "id": 6, "name": "Honza", "games": 0, "rating": 1200, "winsWhite": 0, "winsBlack": 1, "losesWhite": 0, "losesBlack": 0, "drawWhite": 0, "drawBlack": 0 }
        ]

    games: [{
        "timestamp": 1493137560393,
        "playerWhite": 1,
        "playerWhiteRating": 1200,
        "playerBlack": 2,
        "playerBlackRating": 1100,
        "result": "white", // ["white", "black", "draw"]
        "timeout": false
    }]
 */

if (!String.prototype.padStart) {
    String.prototype.padStart = function padStart(targetLength,padString) {
        targetLength = targetLength>>0; //floor if number or convert non-number to 0;
        padString = String(padString || ' ');
        if (this.length > targetLength) {
            return String(this);
        }
        else {
            targetLength = targetLength-this.length;
            if (targetLength > padString.length) {
                padString += padString.repeat(targetLength/padString.length); //append to original to ensure we are longer than needed
            }
            return padString.slice(0,targetLength) + String(this);
        }
    };
}

class Store {
    constructor (options) {
        this._options = Object.assign({ generateId: true }, options);
        this._data = [];
        this._IDENTITY = 'uid';
    }

    clear() {
        this._data = [];
    }

    get(id) {
        if (id === undefined) {
            return this._data;
        } else {
            return this._data.find(r => r[this._IDENTITY] === id);
        }
    }

    injectId(item, itemIndex, identity, data) {
        item[identity] = `${new Date().getTime()}_${itemIndex}`;
    }

    add(items) {
        const me = this;

        [].concat(items).forEach((item, itemIndex) => {
            const index = me._data.findIndex(r => r[this._IDENTITY] === item[this._IDENTITY]);
            if (index >= 0) throw Error(`Item with ${this._IDENTITY} '${item[this._IDENTITY]}' is already added`);

            if (this._options.generateId) {
                this.injectId(item, itemIndex, this._IDENTITY, this._data);
            }
            if (this._options.onWillAdd) {
                this._options.onWillAdd(item, itemIndex, this._IDENTITY, this._data);
            }
        });

        me._data = me._data.concat(items);
    }

    remove(items) {
        const me = this;

        [].concat(items).forEach(item => {
            const index = me._data.findIndex(r => r[this._IDENTITY] === item[this._IDENTITY]);
            if (index < 0) throw Error(`Item with ${this._IDENTITY} '${item[this._IDENTITY]}' not found`);
            me._data.splice(index, 1);
        });
    }

    update(items) {
        const me = this;

        [].concat(items).forEach(item => {
            const index = me._data.findIndex(r => r[this._IDENTITY] === item[this._IDENTITY]);
            if (index < 0) throw Error(`Item with ${this._IDENTITY} '${item[this._IDENTITY]}' not found`);
            me._data.splice(index, 1, item);
        });
    }

    sort(selector) {
    	this._data.sort((a, b) => selector(a) - selector(b));
    }

    load(fileName) {
        this._data = JSON.parse(fs.readFileSync(fileName || this._options.fileName));
    }

    save(fileName) {
        const content = JSON.stringify(this._data, null, '\t');

        fs.writeFileSync(fileName || this._options.fileName, content);
    }
}


class Elo {
    static calc(rating1, rating2, score1, score2, k) {
        const r1 = Math.pow(10, rating1 / 400),
            r2 = Math.pow(10, rating2 / 400);

        return {
            rating1: rating1 + k * (score1 - r1 / (r1 + r2)),
            rating2: rating2 + k * (score2 - r2 / (r1 + r2))
        };
    }
}

// calc elo ratings for games and players
function recalculateAllState() {
    // reset players state
    const initialState = { rating: 1200, games: 0, winsWhite: 0, winsBlack: 0, losesWhite: 0, losesBlack: 0, drawWhite: 0, drawBlack: 0 };
    players.update(players.get().map(player => Object.assign(player, initialState)));

    chartGames.clear();
    chartDays.clear();

    const k = 20;
        /*
        K is the development coefficient.
        K = 40 for a player new to the rating list until he has completed events with at least 30 games
        K = 20 as long as a player's rating remains under 2400.
        K = 10 once a player's published rating has reached 2400 and remains at that level subsequently, even if the rating drops below 2400.
        K = 40 for all players until their 18th birthday, as long as their rating remains under 2300.

        K = 20 for RAPID and BLITZ ratings all players.
        */

    games.get().forEach(game => {       
        const
            p1 = players.get(game.playerWhite),
            p2 = players.get(game.playerBlack),
            s1 = game.result === 'white' ? 1 : game.result === 'black' ? 0 : 0.5,
            s2 = game.result === 'white' ? 0 : game.result === 'black' ? 1 : 0.5,
            elo = Elo.calc(p1.rating, p2.rating, s1, s2, k);

        p1.games++;
        p2.games++;
        if (s1 === 1) p1.winsWhite++;
        if (s1 === 0.5) p1.drawWhite++;
        if (s1 === 0) p1.losesWhite++;
        if (s2 === 1) p2.winsBlack++;
        if (s2 === 0.5) p2.drawBlack++;
        if (s2 === 0) p2.losesBlack++;

        game.playerWhiteRating = p1.rating;
        game.playerBlackRating = p2.rating;
        p1.rating = elo.rating1;
        p2.rating = elo.rating2;

        players.update([p1, p2]);

        // chart data games
        const chartGame = {
            uid: chartGames.get().length + 1,
            timestamp: game.timestamp
        }
        players.get().forEach((player, i) => {
            chartGame[`player${i}Name`] = player.name;
            chartGame[`player${i}Rating`] = player.rating;
        });

        chartGames.add(chartGame);

        // chart data days
        const dt = new Date(game.timestamp);
        const dayTimestamp = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate()).getTime();
        const item = chartDays.get().find(item => item.timestamp === dayTimestamp);

        const chartDay = {
            uid: item ? item[chartDays._IDENTITY] : chartDays.get().length + 1,
            timestamp: dayTimestamp
        }

        players.get().forEach((player, i) => {
            chartDay[`player${i}Name`] = player.name;
            chartDay[`player${i}Rating`] = player.rating;
        });

        if (item) {
            chartDays.update(chartDay);
        } else {
            chartDays.add(chartDay);
        }
    });
}


function logAccess(route, req) {
    let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress ||req.connection.socket.remoteAddress;
    const dt = new Date(),
        dts = `${String(dt.getFullYear()).padStart(4, '0')}-${String(dt.getMonth()+1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')} ${String(dt.getHours()).padStart(2, '0')}:${String(dt.getMinutes()).padStart(2, '0')}:${String(dt.getSeconds()).padStart(2, '0')}.${String(dt.getMilliseconds()).padStart(3, '0')}`,
        message = `[${dts}] ${req.method} ${route}\n[ip: ${ip}]\n${JSON.stringify(req.body, null, '  ')}\n`;
    let logs = 'data/logs';
    if (!fs.existsSync(logs)) {
        fs.mkdirSync(logs);
    }
    fs.appendFileSync(logs + '/access.log', message);
}

function backup() {
    const dt = new Date(),
        dts = `${String(dt.getFullYear()).padStart(4, '0')}-${String(dt.getMonth()+1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}_${String(dt.getHours()).padStart(2, '0')}${String(dt.getMinutes()).padStart(2, '0')}${String(dt.getSeconds()).padStart(2, '0')}${String(dt.getMilliseconds()).padStart(3, '0')}`;

    games.save(`data/logs/games_${dts}.json`);
}

function validateNewGamedata(body) {
	if (!body) throw Error("No game data. Don't you forget to send json?");
	if (!(body.timestamp !== undefined && body.timestamp > 0)) throw Error("game.timestamp must be > 0");
	if (!(body.playerWhite !== undefined && body.playerWhite > 0)) throw Error("game.playerWhite must be > 0");
	if (!(body.playerBlack !== undefined && body.playerBlack > 0)) throw Error("game.playerBlack must be > 0");
	if (!(body.result !== undefined && (body.result === 'black' || body.result === 'white' || body.result === 'draw'))) throw Error("game.result must be one of the values: ['white', 'black', 'draw']");
	if (!(body.result !== undefined && (body.result === 'black' || body.result === 'white' || body.result === 'draw'))) throw Error("game.result must be one of the values: ['white', 'black', 'draw']");
}

// make a game time unique during the day
function onAddGame(item, itemIndex, identity, data) {
    const name = 'timestamp',
        value = item[name];

    while (data.indexOf(value) !== -1) value++;
    
    item[name] = value;
}

// persisted:
const players = new Store({ fileName: 'data/players.json' });
const games = new Store({ fileName: 'data/games.json', onWillAdd: onAddGame });
// not persisted: just in the memory
const chartGames = new Store({ fileName: 'data/chartGames.json', generateId: false });
const chartDays = new Store({ fileName: 'data/chartDays.json',  generateId: false});

players.load();
games.load();
recalculateAllState();
games.save();
players.save();

//debug
//console.log(players);
//console.log(games);
//process.exit(0);

const PORT = process.env.NODE_CHESSBCK_PORT || 8181,
    mapping = [
        {
            route: '/chartDays',
            get: (self, req, res) => {
                games.load();
                recalculateAllState();
                res.json(chartDays.get());
            }
        },
        {
            route: '/chartGames',
            get: (self, req, res) => {
                games.load();
                recalculateAllState();
                res.json(chartGames.get());
            }
        },
        {
            route: '/players',
            file: 'data/players.json',
            get: (self, req, res) => {
                players.load();
                res.json(players.get());
            }
        },
        {
            route: '/games',
            file: 'data/games.json',
            get: (self, req, res) => {
                games.load();
                res.json(games.get());
            },
            
            put: (self, req, res) => {
                games.load();
                validateNewGamedata(req.body);
                games.add(req.body);
                games.sort(g => g.timestamp);
                recalculateAllState();
                games.save();
                players.save();
                backup();
                res.json({ success: true });
            },

            post: (self, req, res) => {
                games.load();
                validateNewGamedata(req.body);
                games.update(req.body);
                games.sort(g => g.timestamp);
                recalculateAllState();
                games.save();
                players.save();
                backup();
                res.json({ success: true });
            },

            delete: (self, req, res) => {
                games.load();
                games.remove(req.body);
                recalculateAllState();
                games.save();
                players.save();
                backup();
                res.json({ success: true });
            }
        }
    ];
    
const app = express(),
    cors = (req, res, next) => {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
        res.header('Access-Control-Allow-Headers', 'Content-Type,X-Requested-With');
        next();
    };

app.use(bodyParser.json());
app.use(cors);

app.get('/', (req, res) => {
    res.send('Chess management app server');
});

function install(mapping) {
    const methods = [ 'get', 'put', 'post', 'delete' ];

    methods.forEach(m => {
        if (mapping[m])
        app[m](mapping.route, (req, res, next) => {
            try {
                logAccess(mapping.route, req);

                mapping[m](mapping, req, res);
                next();
            }
            catch (e) {
                console.error(e);
                res.status(500).json({ success: false, message: String(e) });
            }
        });
    });
}

mapping.forEach(install);


app.listen(PORT, "0.0.0.0", () => {
  console.log(`Chess management app server listening on port ${PORT}!`);
});
