const APP = require('../../../package.json');
console.log(APP);



export class CueGenerator {
  service: string;
  result: string;
  app: {name: string, version: string, url: string};
  cumTimeMs: number; // cummulated time im milli-seconds

  constructor(public artist: string, public title: string, public year: string, public totalDisks?: number) {
    this.service = 'Spotify';
    this.app = {
      name: APP.name,
      version: APP.version,
      url: ''
    };

    this.result = this.header();
    this.cumTimeMs = 0;
  }

  private header() {
    return `REM CREATOR "${this.app.name} version ${this.app.version} (more information on: ${this.app.url})"
REM SERVICE "${this.service}"
`
  }

  private zeroPad(num: number, places: number): string {
    var zero = places - num.toString().length + 1;
    return Array(+(zero > 0 && zero)).join("0") + num;
  }

  private timeToString(timeMs: number): string {
    const totalSeconds = timeMs / 1000;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);
    const milliseconds = (totalSeconds % 60 - seconds) * 1000;
    return `${this.zeroPad(minutes, 2)}:${this.zeroPad(seconds, 2)}:${this.zeroPad(Math.floor(milliseconds / 10), 2)}`;
  }

  public addDisk(diskNumber: number, trackList: Array<ISpotifyAPITrack>) {
    this.result +=
`REM DISCNUMBER ${diskNumber}
REM TOTALDISCS ${this.totalDisks}
REM DATE "${this.year}"
PERFORMER "${this.artist}"
TITLE "${this.title}"
`;

    _.each(trackList, track => {
      this.result +=
`TRACK ${track.track_number} AUDIO
TITLE "${track.name}"
PERFORMER "${_.map(track.artists, artist => artist.name).join(', ')}"
INDEX 01 "${this.timeToString(this.cumTimeMs)}"
`;
      this.cumTimeMs += track.duration_ms;
    });
  }

  public getCueSheet() {
    return this.result;
  }

  public downloadCueSheet(filename?) {
    if (_.isUndefined(filename)) {
      filename = `${this.artist} - ${this.title}.cue`;
    }
    let element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(this.getCueSheet()));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
  }
}
