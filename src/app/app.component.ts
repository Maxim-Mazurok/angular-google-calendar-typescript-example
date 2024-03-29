import { Component, NgZone, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  isSignedIn = false;
  pre = '';

  constructor(private zone: NgZone) {}

  initClient() {
    const updateSigninStatus = this.updateSigninStatus.bind(this);
    gapi.client
      .init({
        apiKey: 'AIzaSyAp_Insk0JjH4oxZ4I0-PLIydIno9jZEZ8',
        clientId:
          '507232289390-bbo3sbk9t7op0utpakhfc8juman0g025.apps.googleusercontent.com',
        discoveryDocs: [
          'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest',
        ],
        scope: 'https://www.googleapis.com/auth/calendar.readonly',
      })
      .then(() => {
        this.zone.run(() => {
          // Listen for sign-in state changes.
          gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

          // Handle the initial sign-in state.
          updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
        });
      });
  }

  updateSigninStatus(isSignedIn) {
    console.log('updateSigninStatus', isSignedIn);
    this.isSignedIn = isSignedIn;
    if (isSignedIn) {
      this.listUpcomingEvents();
    }
  }

  handleAuthClick() {
    gapi.auth2.getAuthInstance().signIn();
  }

  handleSignoutClick() {
    gapi.auth2.getAuthInstance().signOut();
  }

  listUpcomingEvents() {
    const appendPre = this.appendPre.bind(this);
    gapi.client.calendar.events
      .list({
        calendarId: 'primary',
        timeMin: new Date().toISOString(),
        showDeleted: false,
        singleEvents: true,
        maxResults: 10,
        orderBy: 'startTime',
      })
      .then((response) => {
        this.zone.run(() => {
          const events = response.result.items;
          appendPre('Upcoming events:');

          if (events.length > 0) {
            for (const event of events) {
              let when = event.start.dateTime;
              if (!when) {
                when = event.start.date;
              }
              appendPre(event.summary + ' (' + when + ')');
            }
          } else {
            appendPre('No upcoming events found.');
          }
        });
      });
  }

  appendPre(text) {
    this.pre += text + '\n';
  }

  loadGapi() {
    const script = document.createElement('script');
    script.src = 'https://apis.google.com/js/api.js';
    window.document.body.appendChild(script);
    return new Promise<void>((resolve, reject) => {
      script.addEventListener('error', (error) => reject(error));
      script.addEventListener('load', () => resolve());
    });
  }

  async ngOnInit() {
    await this.loadGapi();
    gapi.load('client:auth2', this.initClient.bind(this));
  }
}
