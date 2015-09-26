import {Component, View} from 'angular2/angular2';

import {CORE_DIRECTIVES, FORM_DIRECTIVES} from 'angular2/angular2';
import {ROUTER_DIRECTIVES} from 'angular2/router';

import {SpotifySrv} from './spotify';

interface IResultImage {
  width: number,
  height: number,
  url: string;
}

@Component({
  selector: 'spotify-search',
  viewBindings: [SpotifySrv]
})
@View({
  directives: [CORE_DIRECTIVES, FORM_DIRECTIVES, ROUTER_DIRECTIVES],
  template: `
  <div>
    <div class="SpotSearch">
      <input type="text" [(ng-model)]="q" placeholder="Search spotify" />
      <select name="type" [(ng-model)]="type">
        <option *ng-for="#type of types" [value]="type.value" [selected]="type.value === type">
          {{ type.label }}
        </option>
      </select>
      <button (click)="query()">Load results</button>
    </div>
    <div class="SpotResults">
      <ul *ng-if="results">
        <li *ng-for="#item of results.items">
          <img [src]="getImageUrl(item.images)" alt="image" />
          {{ item.name }}
          <button
            [router-link]="getRouterLinkForUri(item.uri)">
            {{ item.uri }}
          </button>
        </li>
      </ul>
      <div *ng-if="hasNextPage()">
        <button (click)="loadNextPage()">Next page</button>
      </div>
      <div *ng-if="!results">
        no results yet
      </div>
    </div>
  </div>
  `
})
export class SpotifySearch{
  q: string;
  type: string;
  types: Array<{value: string, label: string}>;
  results: any;

  constructor(public spotify: SpotifySrv) {
    this.q = '';
    this.type = 'artists';
    this.types = [
      {value: 'artists', label: 'Artist'},
      {value: 'albums', label: 'Album'},
      //{value: 'artists+albums', label: 'Artist + Album'},
    ];
    this.results = null;
  }

  private getImageUrl(images: Array<IResultImage>) {
    const sortedImages = _.sortBy(images, image => image.width * image.height);
    if (sortedImages.length > 0) {
      return sortedImages[0].url
    }
    return {}
  }

  getRouterLinkForUri(uri) {
    const parts = uri.split(':');
    let route = '';
    switch (parts[1]) {
      case 'artist':
        route = '/artist-detail';
        break;
      case 'album':
        route = '/album-detail';
        break;
    }
    return [route, {id: parts[2]}];
  }

  hasNextPage() {
    return this.results && this.results.next !== null;
  }

  loadNextPage() {
    const { next } = this.results;
    this.spotify.loadUrl(next).subscribe(results => {
      const { items } = this.results;
      this.results = results[this.type];
      this.results.items = items.concat(this.results.items);
    });
  }

  query() {
    this.spotify.query(this.type, this.q)
      .subscribe(results => {
        this.results = results[this.type];
      });
  }

}
