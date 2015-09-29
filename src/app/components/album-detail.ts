import {Component, View, Pipe} from 'angular2/angular2';

import {CORE_DIRECTIVES, FORM_DIRECTIVES} from 'angular2/angular2';
import {ROUTER_DIRECTIVES, RouteParams} from 'angular2/router';

import {SpotifySrv} from './spotify';
import {CueGenerator} from './cue-generator';

// Sample data used during development
const exampleAlbumData = require('../examples/album-detail.json');

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
  viewBindings: [SpotifySrv]
})
@View({
  directives: [CORE_DIRECTIVES, FORM_DIRECTIVES, ROUTER_DIRECTIVES],
  pipes: [DurationPipe],
  template: `
  <div class="Album">
    <div *ng-if="!result">loading data</div>
    <div *ng-if="result">
      <div class="AlbumMeta">
        <div class="row">
          <div class="col-xs-6 col-sm-4">
            <img [src]="getAlbumCover(300).url" *ng-if="hasAlbumCover()" class="img-responsive"/>
          </div>
          <div class="col-xs-6 col-sm-8">
            <h1 class="headline">{{ result.name }}</h1>
            <span>{{ result.release_date }}</span>
            <ul class="artist">
              <li *ng-for="#artist of result.artists">
                <a href="#">{{ artist.name }}</a>
              </li>
            </ul>
            <ul class="market">
              <li *ng-for="#market of result.available_markets">
                {{ market }}
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div class="album">
        <table class="table table-striped">
        <thead>
          <tr>
            <th class="text-center"><input type="checkbox"
              [ng-model]="allTrackItemsChecked(result.tracks.items)"
              (click)="toggleAllTrackItems(result.tracks.items)"/></th>
            <th class="text-center">Track number</th>
            <th>Name</th>
            <th class="text-center">Duration</th>
            <th class="text-center">Explicit</th>
            <th class="text-center" *ng-if="anyTrackHasPreview(result.tracks.items)">Preview</th>
          </tr>
        </thead>
        <tbody>
          <tr *ng-for="#item of result.tracks.items">
            <td class="text-center"><input type="checkbox" [(ng-model)]="item._isChecked" [checked]="item._isChecked" /></td>
            <td class="text-center">{{ item.track_number }}</td>
            <td>{{ item.name }}</td>
            <td class="text-center">{{ item.duration_ms | duration }}</td>
            <td class="text-center"><i class="glyphicon {{ item.explicit ? 'glyphicon-ok' : 'glyphicon-remove'}}"></i></td>
            <td class="text-center" *ng-if="anyTrackHasPreview(result.tracks.items)">
              <a [href]="item.preview_url" target="_blank" *ng-if="item.preview_url !== null">
                <i class="glyphicon glyphicon-music"></i>
              </a>
            </td>
          </tr>
        </tbody>
        </table>
      </div>
      <div class="text-center">
        <div class="btn-group" role="group">
          <button class="btn btn-default" (click)="downloadCueSheet()">Download CUE sheet</button>
          <button class="btn btn-default" (click)="downloadAlbumCover()">Download album cover</button>
        </div>
      </div>
    </div>
  </div>
  `
})
export class SpotifyAlbumDetail {
  result: ISpotifyAPIAlbum;

  constructor(public spotify: SpotifySrv, params: RouteParams) {
    this.result = null;

    // query the album
    spotify.queryAlbum(params.get('id')).subscribe(response => {
      this.result = response;

      // prepare checkbox support
      this.toggleAllTrackItems(<ISpotifyAPITrackToggleable[]>this.result.tracks.items, true);
    });

    //const id = '0sNOF9WDwhWunNAHPD3Baj';
    //this.result = exampleAlbumData;
    // prepare checkbox support
    //this.toggleAllTrackItems(<ISpotifyAPITrackToggleable[]>this.result.tracks.items, true);

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

  groupTracksByDiscs(trackItems: ISpotifyAPITrackToggleable[]) {
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
    const { artists, name, release_date, tracks } = this.result;
    let generator = new CueGenerator(_.map(artists, artist => artist.name).join(', '), name, release_date, 1);
    generator.addDisk(1, _.filter(<ISpotifyAPITrackToggleable[]>tracks.items, item => item._isChecked));
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

}
