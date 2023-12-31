import { Injectable } from '@angular/core';

type OAuthToken = {
  refreshToken: string;
  scopes: string[];
  accessToken?: string;
};

type SavedOAuthToken = OAuthToken & {
  expiry: string;
};

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, _) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsDataURL(blob);
  });
}

@Injectable({
  providedIn: 'root',
})
export class SpotifyService {
  private baseUrl = 'https://api.spotify.com/v1';
  private spotifyClientId = '40fe33792836458e85e24c3a4451bba7';
  private tokenStorageKey = 'spot:token';
  constructor() {}

  private async refreshToken(refreshToken: string): Promise<SavedOAuthToken> {
    const url =
      'https://us-central1-als-workshop.cloudfunctions.net/refreshSpotifyToken';
    const resp = await fetch(url, {
      method: 'POST',
      body: JSON.stringify({
        refreshToken,
      }),
    });
    const token = (await resp.json()) as {
      access_token: string;
      token_type: string;
      expires_in: number;
      refresh_token: string;
      scope: string;
    };
    return {
      expiry: new Date(
        new Date().getTime() + token.expires_in * 1000
      ).toISOString(),
      refreshToken: token.refresh_token,
      scopes: token.scope.split(' '),
      accessToken: token.access_token,
    };
  }

  signOut() {
    localStorage.removeItem(this.tokenStorageKey);
  }

  private saveToken(token: OAuthToken | SavedOAuthToken) {
    localStorage.setItem(this.tokenStorageKey, JSON.stringify(token));
  }

  private async signIn(scopes: string[]): Promise<SavedOAuthToken> {
    const state = (Math.random() + 1).toString(36).substring(2);
    const url = new URL('https://accounts.spotify.com/authorize');
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('client_id', this.spotifyClientId);
    url.searchParams.set('scope', scopes.join(' '));
    url.searchParams.set('redirect_uri', `${location.origin}/callback`);
    url.searchParams.set('state', state);
    const width = 500; // Adjust width as needed
    const height = 500; // Adjust height as needed

    // Calculate center position
    const left = screen.width / 2 - width / 2;
    const top = screen.height / 2 - height / 2;

    // Open the window with specific features
    const childWindow = window.open(
      url.toString(),
      'SpotifySignIn',
      'width=' +
        width +
        ',height=' +
        height +
        ',left=' +
        left +
        ',top=' +
        top +
        ',location=no,toolbar=no,status=no'
    )!;
    try {
      const code = await new Promise<string>((resolve, reject) => {
        const timeout = window.setInterval(() => {
          if (!childWindow || childWindow.closed) {
            removeEventListener('message', onMessage);
            clearInterval(timeout);
            reject('User terminated sign in');
          }
        }, 500);
        function onMessage(event: MessageEvent) {
          const response = event.data as {
            code: string;
            state: string;
            error?: string;
          };
          if (response.error) {
            clearInterval(timeout);
            removeEventListener('message', onMessage);
            return reject(response.error);
          }
          if (response.code && response.state === state) {
            clearInterval(timeout);
            resolve(response.code);
            removeEventListener('message', onMessage);
          }
        }
        addEventListener('message', onMessage);
      });
      const tokenResp = await fetch(
        'https://us-central1-als-workshop.cloudfunctions.net/exchangeSpotifyToken',
        { body: JSON.stringify({ code }), method: 'POST' }
      );
      const token = (await tokenResp.json()) as {
        access_token: string;
        token_type: string;
        expires_in: number;
        refresh_token: string;
        scope: string;
      };
      return {
        expiry: new Date(
          new Date().getTime() + token.expires_in * 1000
        ).toISOString(),
        refreshToken: token.refresh_token,
        scopes: token.scope.split(' '),
        accessToken: token.access_token,
      };
    } catch (error) {
      throw error;
    }
  }

  isSignedIn() {
    const savedToken = JSON.parse(
      localStorage.getItem(this.tokenStorageKey) ?? 'null'
    ) as SavedOAuthToken | null;
    return !!savedToken;
  }

  async getToken() {
    const savedToken = JSON.parse(
      localStorage.getItem(this.tokenStorageKey) ?? 'null'
    ) as SavedOAuthToken | null;
    if (savedToken) {
      const expiryTime = new Date(savedToken.expiry);
      const now = new Date();
      if (expiryTime.getTime() > now.getTime() && savedToken.accessToken) {
        return savedToken.accessToken;
      } else {
        const token = await this.refreshToken(savedToken.refreshToken);
        this.saveToken(token);
        return token.accessToken!;
      }
    } else {
      try {
        const token = await this.signIn([
          'user-read-private',
          'user-read-email',
          'playlist-modify-public',
          'playlist-modify-private',
          'ugc-image-upload',
        ]);
        this.saveToken(token);
        return token.accessToken!;
      } catch (error) {
        throw error;
      }
    }
  }

  async getCurrentUser() {
    const token = await this.getToken();
    const resp = await fetch(`${this.baseUrl}/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return await resp.json();
  }

  async createPlaylist({
    trackIds,
    description,
    title,
    imageUrl,
  }: {
    trackIds: string[];
    imageUrl?: string;
    title: string;
    description: string;
  }) {
    try {
      const token = await this.getToken();
      const user = await this.getCurrentUser();
      const resp = await fetch(`${this.baseUrl}/users/${user.id}/playlists`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name: title,
          description: description,
          public: false,
        }),
      });
      const data = await resp.json();
      if (data.error) throw new Error(data.error);
      const playlistId = data.id;
      let page = 0;
      let uris = trackIds.slice(page * 100, (page + 1) * 100);
      while (uris.length > 0) {
        await fetch(`${this.baseUrl}/playlists/${playlistId}/tracks`, {
          body: JSON.stringify({ position: 0, uris }),
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
        page++;
        uris = trackIds.slice(page * 100, (page + 1) * 100);
      }
      if (imageUrl) {
        try {
          const imageResp = await fetch(imageUrl);
          const data = await imageResp.blob();
          const base64 = await blobToBase64(data);
          await fetch(`${this.baseUrl}/playlists/${playlistId}/images`, {
            body: base64.slice(base64.indexOf(',') + 1),
            method: 'PUT',
            headers: { Authorization: `Bearer ${token}` },
          });
        } catch (error) {
          //
        }
      }
      return data?.external_urls?.spotify ?? null;
    } catch (error) {
      throw error;
    }
  }
}
