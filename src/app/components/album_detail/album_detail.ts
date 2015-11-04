import {Component, View, Pipe} from 'angular2/angular2';

import {CORE_DIRECTIVES, FORM_DIRECTIVES} from 'angular2/angular2';
import {ROUTER_DIRECTIVES, RouteParams} from 'angular2/router';

import {Spotify} from 'app/services/spotify';
import {Settings} from 'app/services/settings';
import {CueGenerator} from 'app/lib/cue-generator';

/**
 * Extend the interface of a track, such that it can be toggled.
 */
interface ISpotifyAPITrackToggleable extends ISpotifyAPITrack {
  _isChecked: boolean;
}

/**
 * Pipe that transforms milli seconds into its human readable string representation.
 */
@Pipe({
  name: 'duration'
})
export class DurationPipe {
  /**
   * Transform milliseconds into a human readable form.
   * @param durationMs {number} Duration in milliseconds
   * @returns {string} Duration formatted as human readable string
   */
  transform(durationMs: number): string {
    let totalSeconds = durationMs / 1000;
    let minutes = Math.floor(totalSeconds / 60);
    let seconds = Math.ceil(totalSeconds % 60);
    return `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
  }
}

/**
 * Album component that loads a album via the Spotify service and shows the album's details.
 */
@Component({
  selector: 'spotify-album',
})
@View(<any>{ // FIXME: remove any as soon as Pipes do not make a problem in TS anymore
  directives: [CORE_DIRECTIVES, FORM_DIRECTIVES, ROUTER_DIRECTIVES],
  pipes: [DurationPipe],
  template: require('to-string!./album_detail.html')
})
export class SpotifyAlbumDetail {
  id: string;
  result: ISpotifyAPIAlbum;
  disks: String[];
  tracksByDisks: {[index: string]: ISpotifyAPITrackToggleable[]};

  constructor(public Spotify: Spotify, params: RouteParams, public settings: Settings) {
    this.result = null;
    this.id = params.get('id');

    // query the album
    Spotify.queryAlbum(this.id).subscribe(response => {
      this.result = response;

      // prepare checkbox support
      this.toggleAllTrackItems(<ISpotifyAPITrackToggleable[]>this.result.tracks.items, true);

      // extract the disk information
      this.tracksByDisks = this.groupTracksByDiscs(<ISpotifyAPITrackToggleable[]>this.result.tracks.items);
      this.disks = Object.keys(this.tracksByDisks);
    });
  }

  /**
   * Check if the album comes with a album cover.
   * @returns {boolean} `true` if the album has a cover, `false` if not.
   */
  hasAlbumCover() {
    return this.result.images && this.result.images.length > 0;
  }

  /**
   * Return album cover in a given resolution.
   *
   * If `size='MAX'` is set, the biggest resolution is returned, whereas `size='MIN'` gives the smallest possible
   * resolution. If `size` is of type number, the result set is compared to this size and the image with the minimal
   * difference between `size` and the width of the image is being returned.
   *
   * @param size {string|number} can be one of ['MAX', 'MIN'] or any number
   * @returns {object} Album cover that matches the `size` parameter
   */
  getAlbumCover(size: string | number) {
    let { images } = this.result;
    if (!images) {
      return null;
    }
    let orderedCovers = _.sortBy(images, image => image.width * image.height).reverse();
    switch (size) {
      case 'MAX':
        return _.first(orderedCovers);
      case 'MIN':
        return _.last(orderedCovers);
      default:
        if (typeof size !== 'number') {
          return null;
        }
        orderedCovers = _.sortBy(images, image => Math.abs(image.width - <number>size));
        return _.first(orderedCovers);
    }
  }

  groupTracksByDiscs(trackItems: ISpotifyAPITrackToggleable[]): {[index: string]: ISpotifyAPITrackToggleable[]} {
    const grouped = _.groupBy(trackItems, 'disc_number');
    return grouped;
  }

  /**
   * Checks if any track has a preview.
   * @param trackItems {ISpotifyAPITrackToggleable[]} List of tracks
   * @returns {boolean} `true` if any item has a preview, `false` if not.
   */
  anyTrackHasPreview(trackItems: ISpotifyAPITrackToggleable[]): boolean {
    return _.any(_.map(trackItems, item => item.preview_url !== null));
  }

  /**
   * Checks if any track in a given list is checked, that is `trackItem._isChecked === true` for each `trackItem` in
   * `trackItems`.
   * @param trackItems {ISpotifyAPITrackToggleable[]} List of tracks
   * @returns {boolean} `true` if all items are checked, `false` if not.
   */
  allTrackItemsChecked(trackItems: ISpotifyAPITrackToggleable[]): boolean {
    return _.all(_.map(trackItems, item => item._isChecked));
  }

  /**
   * Toggle the `_isChecked` state for all track items.
   * If no new state is set for `newState`, the new state is determined by inverting the result of the
   * `allTrackItemsChecked` method.
   *
   * @param trackItems {ISpotifyAPITrackToggleable[]} List of tracks
   * @param newState {=boolean} New state value or `null|undefined`
   */
  toggleAllTrackItems(trackItems: ISpotifyAPITrackToggleable[], newState:boolean=null): void {
    if (_.isUndefined(newState) || _.isNull(newState)) {
      newState = !this.allTrackItemsChecked(trackItems);
    }
    _.each(trackItems, item => {
      item._isChecked = newState;
    });
  }

  /**
   * Generate the CUE sheet based on the checked track items and prompt the user to download the CUE sheet.
   */
  downloadCueSheet() {
    const { artists, name, release_date } = this.result;
    let generator = new CueGenerator(_.map(artists, artist => artist.name).join(', '), name, release_date,
      this.disks.length);
    this.disks.forEach(index => {
      let tracks = this.tracksByDisks[<string>index];
      generator.addDisk(+index, _.filter(tracks, item => item._isChecked));
    });
    console.log(generator.getCueSheet());
    generator.downloadCueSheet();
  }

  /**
   * Prompt the user to download the album cover in its maximum resolution.
   */
  downloadAlbumCover() {
    const { name, artists } = this.result;
    let filename = `${_.map(artists, artist => artist.name).join(', ')} - ${name}.jpg`;
    let element = document.createElement('a');
    element.href = this.getAlbumCover('MAX').url;
    element.setAttribute("download", filename);
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }

  isAvailableInHomeCountry(markets, homeCountryCode = this.settings.getLanguage().key) {
    return _.any(_.map(markets, m => m === homeCountryCode));
  }

  isHomeCountry(countryCode) {
    return this.settings.getLanguage().key === countryCode;
  }

  getDiskTotalLength(trackItems: ISpotifyAPITrackToggleable[]) {
    let checkedItems = _.filter(trackItems, item => item._isChecked);
    return _.sum(_.pluck(checkedItems, 'duration_ms'));
  }

  getPlayAlbumUrl(): string {
    return this.Spotify.getPlayUrl('album', this.id);
  }

  getPlayTrackUrl(item: ISpotifyAPITrackToggleable): string {
    return this.Spotify.getPlayUrl('track', item.id)
  }

}
