import { Component } from '@angular/core';
import { SpotifyService } from './spotify.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'sounds-2-spotify';
  userImageUrl: string;
  constructor(private spotifyService: SpotifyService) {
    this.userImageUrl = '';
  }

  signOut() {
    this.spotifyService.signOut();
    this.userImageUrl = '';
  }

  ngOnInit() {
    if (this.spotifyService.isSignedIn()) {
      this.loadUser();
    }
  }

  private async loadUser() {
    const user = await this.spotifyService.getCurrentUser();
    this.userImageUrl = (user.images as any[])?.[0]?.url as string;
  }

  signIn() {
    this.loadUser();
  }
}
