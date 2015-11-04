const APP = require('../../../package.json');

/**
 * Generator for CUE sheets.
 */
export class CueGenerator {
  service: string;
  result: string;
  app: {name: string, version: string, url: string};
  cumTimeMs: number; // cummulated time im milli-seconds

  /**
   * Constructor.
   * @param artist {string} Album artist
   * @param title {string} Album title
   * @param year {string} Year of album's release
   * @param totalDisks {number} Number of discs in total
   */
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

  /**
   * Build a CUE sheet header based on the instance variables.
   * @returns {string} Header
   */
  private header() {
    return `REM CREATOR "${this.app.name} version ${this.app.version} (more information on: ${this.app.url})"
REM SERVICE "${this.service}"
`
  }

  /**
   * Prepend zeros to a number until a given amount of number places is reached.
   * @param num {number} Number to transform
   * @param places {number} Number of places
   * @returns {string} Number as string with prepended zeros
   *
   * @example
   * zeroPad(5, 1) // returns '5'
   * zeroPad(5, 2) // returns '05'
   * zeroPad(5, 3) // returns '005'
   */
  private zeroPad(num: number, places: number): string {
    var zero = places - num.toString().length + 1;
    return Array(+(zero > 0 && zero)).join("0") + num;
  }

  /**
   * Transforms a time given im milliseconds into a human readable string representation.
   * @param timeMs {number} Time in milliseconds
   * @returns {string} Formatted string
   *
   * @example
   * timeToString(3125000) // returns 52:05:00
   */
  private timeToString(timeMs: number): string {
    const totalSeconds = timeMs / 1000;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);
    const milliseconds = (totalSeconds % 60 - seconds) * 1000;
    return `${this.zeroPad(minutes, 2)}:${this.zeroPad(seconds, 2)}:${this.zeroPad(Math.floor(milliseconds / 10), 2)}`;
  }

  /**
   * Add a disc to the internal CUE sheet representation.
   * @param diskNumber {number} Disk number
   * @param trackList {ISpotifyAPITrack[]} Disc's tracks
   * @param offsetPerTrackMs {number} Systematic offset per track in milliseconds
   */
  public addDisk(diskNumber: number, trackList: Array<ISpotifyAPITrack>, offsetPerTrackMs:number=3100) {
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
      this.cumTimeMs += track.duration_ms + offsetPerTrackMs;
    });
  }

  /**
   * Getter method to access the internal CUE sheet representation string.
   * @returns {string} CUE sheet representation
   */
  public getCueSheet() {
    return this.result;
  }

  /**
   * Transform the internal CUE sheet representation string to a file and prompt the user to download the file.
   * @param filename {=string} Filename of the resulting file
   */
  public downloadCueSheet(filename?: string) {
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
