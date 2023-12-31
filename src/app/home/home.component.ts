import { Component } from '@angular/core';
import { SoundsService } from '../sounds.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import type * as progSample from '../../../functions/src/track_sample.json';
import { SpotifyService } from '../spotify.service';

type SoundsData = typeof progSample;

export type ProgramInfo = {
  tracks: SoundsData['tracklist']['tracks'];
  info: SoundsData['programmes']['current'];
};

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  progUrl: string;
  tracksLoading: boolean;
  progInfo?: ProgramInfo;
  recents: { data: ProgramInfo; label: string }[];

  constructor(
    private soundsService: SoundsService,
    private snackBar: MatSnackBar
  ) {
    this.progUrl = '';
    this.tracksLoading = false;
    this.recents = [];
  }

  ngOnInit() {
    this.recents = this.soundsService.getRecents();
  }

  setProgInfo(progInfo: any) {
    this.progInfo = {
      info: progInfo.programme,
      tracks: progInfo.tracks,
    };
  }

  async getTracks() {
    if (!this.progUrl || this.tracksLoading) return;
    this.tracksLoading = true;
    try {
      const progInfo = await this.soundsService.getTracklist(this.progUrl);
      this.progInfo = {
        info: progInfo.programme,
        tracks: progInfo.tracks,
      };
    } catch (error) {
      this.snackBar.open(
        `Error: ${(error as any)?.message ?? (error as Error).toString()}`,
        'Dismiss',
        { duration: 5000 }
      );
    } finally {
      this.tracksLoading = false;
    }
  }
}
