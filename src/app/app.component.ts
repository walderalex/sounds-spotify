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
  userIsSignedIn: boolean;
  constructor(private spotifyService: SpotifyService) {
    this.userImageUrl = '';
    this.userIsSignedIn = false;
  }

  signOut() {
    this.spotifyService.signOut();
    this.userImageUrl = '';
    this.userIsSignedIn = false;
  }

  ngOnInit() {
    const isSignedIn = this.spotifyService.isSignedIn();
    this.userIsSignedIn = isSignedIn;
    if (isSignedIn) {
      this.loadUser();
    }
  }

  private async loadUser() {
    const user = await this.spotifyService.getCurrentUser();
    this.userImageUrl = (user.images as any[])?.[0]?.url as string;
    this.userIsSignedIn = !!user;
  }

  signIn() {
    this.loadUser();
  }
}
