"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var functions = require("@google-cloud/functions-framework");
var axios_1 = require("axios");
functions.http('exchangeSpotifyToken', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var code, params, resp, error_1;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                res.set('Access-Control-Allow-Origin', "*");
                if (req.method === 'OPTIONS') {
                    res.set('Access-Control-Allow-Methods', 'GET');
                    return [2 /*return*/, res.status(204).send('')];
                }
                if (req.method !== 'POST') {
                    console.log('bad method', req.method);
                    return [2 /*return*/, res.sendStatus(400)];
                }
                code = JSON.parse((_a = req.body) !== null && _a !== void 0 ? _a : '{}').code;
                if (!code) {
                    console.log('no code');
                    return [2 /*return*/, res.sendStatus(400)];
                }
                _b.label = 1;
            case 1:
                _b.trys.push([1, 3, , 4]);
                params = new URLSearchParams();
                params.set('code', code);
                params.set('redirect_uri', process.env.REDIRECT_URL);
                params.set('grant_type', 'authorization_code');
                return [4 /*yield*/, axios_1["default"].post('https://accounts.spotify.com/api/token', params.toString(), {
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                            Authorization: "Basic ".concat(Buffer.from(process.env.SPOTIFY_CLIENT_ID +
                                ':' +
                                process.env.SPOTIFY_CLIENT_SECRET).toString('base64')),
                            Accept: 'application/json'
                        }
                    })];
            case 2:
                resp = _b.sent();
                return [2 /*return*/, res.json(resp.data)];
            case 3:
                error_1 = _b.sent();
                console.warn(error_1);
                res.status(500).send("".concat(error_1));
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
functions.http('refreshSpotifyToken', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var refreshToken, params, resp, error_2;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                res.set('Access-Control-Allow-Origin', "*");
                if (req.method === 'OPTIONS') {
                    res.set('Access-Control-Allow-Methods', 'GET');
                    return [2 /*return*/, res.status(204).send('')];
                }
                if (req.method !== 'POST') {
                    console.log('bad method', req.method);
                    return [2 /*return*/, res.sendStatus(400)];
                }
                refreshToken = JSON.parse((_a = req.body) !== null && _a !== void 0 ? _a : '{}').refreshToken;
                if (!refreshToken) {
                    console.log('no token');
                    return [2 /*return*/, res.sendStatus(400)];
                }
                _b.label = 1;
            case 1:
                _b.trys.push([1, 3, , 4]);
                params = new URLSearchParams({
                    grant_type: 'refresh_token',
                    refresh_token: refreshToken
                });
                return [4 /*yield*/, axios_1["default"].post('https://accounts.spotify.com/api/token', params.toString(), {
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                            Authorization: "Basic ".concat(Buffer.from(process.env.SPOTIFY_CLIENT_ID +
                                ':' +
                                process.env.SPOTIFY_CLIENT_SECRET).toString('base64')),
                            Accept: 'application/json'
                        }
                    })];
            case 2:
                resp = _b.sent();
                return [2 /*return*/, res.json(resp.data)];
            case 3:
                error_2 = _b.sent();
                console.warn(error_2);
                res.status(500).send("".concat(error_2));
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
functions.http('getTracklist', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var url, resp, html, indexOfPreload, match, soundsData, tracks, progInfo, error_3;
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                res.set('Access-Control-Allow-Origin', "*");
                if (req.method === 'OPTIONS') {
                    res.set('Access-Control-Allow-Methods', 'GET');
                    return [2 /*return*/, res.status(204).send('')];
                }
                if (req.method !== 'GET') {
                    console.log('bad method', req.method);
                    return [2 /*return*/, res.sendStatus(400)];
                }
                url = decodeURIComponent((_a = req.query.url) !== null && _a !== void 0 ? _a : '');
                if (!url) {
                    console.log('no url');
                    return [2 /*return*/, res.sendStatus(400)];
                }
                _c.label = 1;
            case 1:
                _c.trys.push([1, 3, , 4]);
                return [4 /*yield*/, axios_1["default"].get(url)];
            case 2:
                resp = _c.sent();
                html = resp.data;
                indexOfPreload = html.indexOf('__PRELOADED_STATE__');
                if (indexOfPreload === -1)
                    throw new Error('No state');
                match = (_b = /\{.+\}/.exec(html.slice(indexOfPreload))) === null || _b === void 0 ? void 0 : _b[0];
                if (!match)
                    throw new Error('No track data');
                soundsData = JSON.parse(match);
                tracks = soundsData.tracklist.tracks;
                progInfo = soundsData.programmes.current;
                return [2 /*return*/, res.json({ tracks: tracks, programme: progInfo })];
            case 3:
                error_3 = _c.sent();
                console.warn(error_3);
                res.status(500).send("".concat(error_3));
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
