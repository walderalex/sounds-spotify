import { Component, Input } from '@angular/core';
import { ProgramInfo } from '../home/home.component';
import { SpotifyService } from '../spotify.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { take } from 'rxjs';

@Component({
  selector: 'app-programme',
  templateUrl: './programme.component.html',
  styleUrls: ['./programme.component.scss'],
})
export class ProgrammeComponent {
  @Input()
  programme: ProgramInfo | null;

  loadingCreation: boolean;

  constructor(
    private spotifyService: SpotifyService,
    private snackBar: MatSnackBar
  ) {
    this.programme ??= null;
    this.loadingCreation = false;
  }

  openInSounds() {
    const soundsUrl = this.programme?.info.urn?.slice(
      this.programme?.info.urn.lastIndexOf(':') + 1
    );
    if (soundsUrl) {
      open(`https://www.bbc.co.uk/sounds/play/${soundsUrl}`, '_blank');
    }
  }
  async createPlaylist() {
    if (this.loadingCreation) return;
    this.loadingCreation = true;
    try {
      const description =
        this.programme?.info.synopses.medium ??
        this.programme?.info.synopses.short ??
        '';
      const response = await this.spotifyService.createPlaylist({
        description: `${description}${
          description.endsWith('.') ? '' : '.'
        } Created by BBC Sounds to Spotify.`,
        title: `${this.programme?.info.titles.primary}${
          this.programme?.info.titles.secondary
            ? ` - ${this.programme.info.titles.secondary}`
            : ''
        } - ${this.programme?.info.release.label}`,
        trackIds:
          this.programme?.tracks
            .filter((t) => t.uris.find((u) => u.label === 'Spotify'))
            .map((t) => {
              const uri = t.uris.find((u) => u.label === 'Spotify')!.uri;
              return `spotify:track:${uri.slice(uri.lastIndexOf('/') + 1)}`;
            }) ?? [],
        imageUrl:
          this.programme?.info.image_url?.replace('{recipe}', '320x320') ??
          undefined,
      });
      if (response) {
        const snack = this.snackBar.open(`Playlist created!`, 'Open', {
          duration: 5000,
        });
        snack
          .onAction()
          .pipe(take(1))
          .subscribe(() => {
            open(response, '_blank');
          });
      }
    } catch (error) {
      this.snackBar.open(
        `Error: ${(error as any)?.message ?? (error as Error).toString()}`,
        'Dismiss',
        { duration: 5000 }
      );
    } finally {
      this.loadingCreation = false;
    }
  }
}
