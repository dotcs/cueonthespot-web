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

@Pipe({
  name: 'duration'
})
export class DurationPipe {
  transform(duration: number): any {
    let totalSeconds = duration / 1000;
    let minutes = Math.floor(totalSeconds / 60);
    let seconds = Math.ceil(totalSeconds % 60);
    return `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
  }
}

@Component({
  selector: 'spotify-album',
  viewBindings: [SpotifySrv]
})
@View({
  directives: [CORE_DIRECTIVES, FORM_DIRECTIVES, ROUTER_DIRECTIVES],
  pipes: [DurationPipe],
  template: `
  <div>
    <div *ng-if="!result">loading data</div>
    <div *ng-if="result">
      <img [src]="getAlbumCover(300).url" *ng-if="hasAlbumCovers()" />
      <ul>
        <li *ng-for="#artist of result.artists">
          <a href="#">{{ artist.name }}</a>
        </li>
      </ul>
      <ul>
        <li *ng-for="#market of result.available_markets">
          {{ market }}
        </li>
      </ul>
      <div class="album">
        <h1>{{ result.name }}</h1>
        <span>{{ result.release_date }}</span>

        <table>
        <thead>
          <tr>
            <th><input type="checkbox"
              [ng-model]="allTrackItemsChecked(result.tracks.items)"
              (click)="toggleAllTrackItems(result.tracks.items)"/></th>
            <th>Track number</th>
            <th>Name</th>
            <th>Duration</th>
            <th>Explicit</th>
            <th *ng-if="anyTrackHasPreview(result.tracks.items)">Preview</th>
          </tr>
        </thead>
        <tbody>
          <tr *ng-for="#item of result.tracks.items">
            <td><input type="checkbox" [(ng-model)]="item._isChecked" [checked]="item._isChecked" /></td>
            <td>{{ item.track_number }}</td>
            <td>{{ item.name }}</td>
            <td>{{ item.duration_ms | duration }}</td>
            <td>{{ item.explicit ? 'yes' : 'no'}}</td>
            <td *ng-if="anyTrackHasPreview(result.tracks.items)">
              <a [href]="item.preview_url" *ng-if="item.preview_url !== null">Preview</a>
            </td>
          </tr>
        </tbody>
        </table>
      </div>
      <button (click)="downloadCueSheet()">Download CUE sheet</button>
      <button (click)="downloadAlbumCover()">Download album cover</button>
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

  hasAlbumCovers() {
    return this.result.images.length > 0;
  }

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

  anyTrackHasPreview(trackItems: ISpotifyAPITrackToggleable[]): boolean {
    return _.any(_.map(trackItems, item => item.preview_url !== null));
  }

  allTrackItemsChecked(trackItems: ISpotifyAPITrackToggleable[]): boolean {
    return _.all(_.map(trackItems, item => item._isChecked));
  }

  toggleAllTrackItems(trackItems, value=null) {
    if (_.isUndefined(value) || _.isNull(value)) {
      value = !this.allTrackItemsChecked(trackItems);
    }
    _.each(trackItems, item => {
      item._isChecked = value;
    });
  }

  downloadCueSheet() {
    const { artists, name, release_date, tracks } = this.result;
    let generator = new CueGenerator(_.map(artists, artist => artist.name).join(', '), name, release_date, 1);
    generator.addDisk(1, _.filter(<ISpotifyAPITrackToggleable[]>tracks.items, item => item._isChecked));
    console.log(generator.getCueSheet());
    generator.downloadCueSheet();
  }

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
