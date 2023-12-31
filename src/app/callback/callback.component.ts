import { Component } from '@angular/core';

@Component({
  selector: 'app-callback',
  templateUrl: './callback.component.html',
  styleUrls: ['./callback.component.scss'],
})
export class CallbackComponent {
  ngOnInit() {
    const parent = window.opener;
    if (parent) {
      const url = new URL(location.href);
      parent.postMessage({
        code: url.searchParams.get('code'),
        error: url.searchParams.get('error'),
        state: url.searchParams.get('state'),
      });
      close();
    }
  }
}
