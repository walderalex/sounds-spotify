import { Component, Input } from '@angular/core';
import { ProgramInfo } from '../home/home.component';

@Component({
  selector: 'app-track',
  templateUrl: './track.component.html',
  styleUrls: ['./track.component.scss'],
})
export class TrackComponent {
  @Input()
  track: ProgramInfo['tracks'][number] | null;

  @Input()
  index?: number;

  get trackTitle() {
    return this.track?.titles.secondary ?? '';
  }
  get artist() {
    return this.track?.titles.primary ?? '';
  }
  get spotifyUrl() {
    return this.track?.uris.find((u) => u.label === 'Spotify')?.uri ?? null;
  }
  get imageUrl() {
    return this.track?.image_url ?? null;
  }
  constructor() {
    this.track ??= null;
  }

  openSpotify() {
    if (this.spotifyUrl) open(this.spotifyUrl, '_blank');
  }
}
