import * as functions from '@google-cloud/functions-framework';
import axios from 'axios';
import type * as sample from './track_sample.json';
functions.http('exchangeSpotifyToken', async (req, res) => {
  res.set('Access-Control-Allow-Origin', `*`);
  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Methods', 'GET');
    return res.status(204).send('');
  }
  if (req.method !== 'POST') {
    console.log('bad method', req.method);
    return res.sendStatus(400);
  }
  const code = JSON.parse(req.body ?? '{}').code as string;
  if (!code) {
    console.log('no code');
    return res.sendStatus(400);
  }
  try {
    const params = new URLSearchParams();
    params.set('code', code);
    params.set('redirect_uri', process.env.REDIRECT_URL as string);
    params.set('grant_type', 'authorization_code');
    const resp = await axios.post(
      'https://accounts.spotify.com/api/token',
      params.toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${Buffer.from(
            process.env.SPOTIFY_CLIENT_ID +
              ':' +
              process.env.SPOTIFY_CLIENT_SECRET
          ).toString('base64')}`,
          Accept: 'application/json',
        },
      }
    );
    return res.json(resp.data);
  } catch (error) {
    console.warn(error);
    res.status(500).send(`${error}`);
  }
});

functions.http('refreshSpotifyToken', async (req, res) => {
  res.set('Access-Control-Allow-Origin', `*`);
  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Methods', 'GET');
    return res.status(204).send('');
  }
  if (req.method !== 'POST') {
    console.log('bad method', req.method);
    return res.sendStatus(400);
  }
  const refreshToken = JSON.parse(req.body ?? '{}').refreshToken as string;
  if (!refreshToken) {
    console.log('no token');
    return res.sendStatus(400);
  }
  try {
    const params = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    });
    const resp = await axios.post(
      'https://accounts.spotify.com/api/token',
      params.toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${Buffer.from(
            process.env.SPOTIFY_CLIENT_ID +
              ':' +
              process.env.SPOTIFY_CLIENT_SECRET
          ).toString('base64')}`,
          Accept: 'application/json',
        },
      }
    );
    return res.json(resp.data);
  } catch (error) {
    console.warn(error);
    res.status(500).send(`${error}`);
  }
});

functions.http('getTracklist', async (req, res) => {
  res.set('Access-Control-Allow-Origin', `*`);
  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Methods', 'GET');
    return res.status(204).send('');
  }
  if (req.method !== 'GET') {
    console.log('bad method', req.method);
    return res.sendStatus(400);
  }
  const url = decodeURIComponent((req.query.url as string) ?? '');
  if (!url) {
    console.log('no url');
    return res.sendStatus(400);
  }
  try {
    const resp = await axios.get(url);
    const html = resp.data as string;
    const indexOfPreload = html.indexOf('__PRELOADED_STATE__');
    if (indexOfPreload === -1) throw new Error('No state');
    const match = /\{.+\}/.exec(html.slice(indexOfPreload))?.[0];
    if (!match) throw new Error('No track data');
    const soundsData = JSON.parse(match) as typeof sample;
    const tracks = soundsData.tracklist.tracks;
    const progInfo = soundsData.programmes.current;
    return res.json({ tracks, programme: progInfo });
  } catch (error) {
    console.warn(error);
    res.status(500).send(`${error}`);
  }
});
