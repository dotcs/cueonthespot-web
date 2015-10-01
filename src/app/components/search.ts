import {Component, View} from 'angular2/angular2';

import {CORE_DIRECTIVES, FORM_DIRECTIVES} from 'angular2/angular2';
import {ROUTER_DIRECTIVES} from 'angular2/router';

import {SpotifySrv} from './spotify';

interface IResultImage {
  width: number,
  height: number,
  url: string;
}

/**
 * Search component
 */
@Component({
  selector: 'spotify-search',
  viewBindings: [SpotifySrv]
})
@View({
  directives: [CORE_DIRECTIVES, FORM_DIRECTIVES, ROUTER_DIRECTIVES],
  template: `
  <div>
    <div class="Search">
      <input type="text" [(ng-model)]="q" placeholder="Search spotify" class="form-control Search-query"
        (keyup)="searchFieldKeyHandler($event, queryInput)" #queryInput />
      <select name="type" [(ng-model)]="type" class="form-control Search-type">
        <option *ng-for="#type of types" [value]="type.value" [selected]="type.value === type">
          {{ type.label }}
        </option>
      </select>
      <button (click)="query()" class="btn btn-default Search-btn" [disabled]="q.length === 0">Load results</button>
    </div>
    <div class="SearchResults">
      <table class="table table-striped" *ng-if="results">
        <thead>
        <tr>
          <th>Cover</th>
          <th>Albumtitle</th>
          <th>Reference</th>
        </tr>
        <tbody>
        <tr *ng-for="#item of results.items">
          <td>
            <img [src]="getImageUrl(item.images)" alt="image" />
          </td>
          <td>{{ item.name }}</td>
          <td class="text-center">
            <a [router-link]="getRouterLinkForUri(item.uri)" class="reference">
              <i class="glyphicon glyphicon-chevron-right"></i>
            </a>
          </td>
        </tr>
        </tbody>
        </thead>
      </table>
      <div *ng-if="hasNextPage()" class="text-center">
        <button (click)="loadNextPage()" class="btn btn-default">Next page</button>
      </div>
      <div *ng-if="!results" class="no-results-info">
        <div class="alert alert-info">
          <strong>Info</strong>: No results.
        </div>
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
    this.type = 'albums'; // default type
    this.types = [
      {value: 'artists', label: 'Artist'},
      {value: 'albums', label: 'Album'},
      //{value: 'artists+albums', label: 'Artist + Album'},
    ];
    this.results = null;

    this.searchFieldKeyHandler = this.searchFieldKeyHandler.bind(this);
  }

  /**
   * Find the smallest image and return its URL.
   * @param images {IResultImage[]} List of images to choose from
   * @returns {string} URL of the chosen image
   */
  private getImageUrl(images: Array<IResultImage>) {
    const sortedImages = _.sortBy(images, image => image.width * image.height);
    if (sortedImages.length > 0) {
      return sortedImages[0].url
    }
    // TODO: add placeholder image?
    return '';
  }

  /**
   * Construct a router link for a given Spotify URI.
   * @param uri {string} Spotify URI
   * @returns {any} Route representation that is consumable by the "router-link" attribute of angular's router.
   */
  getRouterLinkForUri(uri: string) {
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

  /**
   * Check if the result set does have a next page.
   * @returns {boolean} `true` if a next page exists, `false` if not.
   */
  hasNextPage() {
    return this.results && this.results.next !== null;
  }

  /**
   * Load next page and update the result set to show new entries.
   */
  loadNextPage() {
    const { next } = this.results;
    this.spotify.loadUrl(next).subscribe(results => {
      const { items } = this.results;
      this.results = results[this.type];
      this.results.items = items.concat(this.results.items);
    });
  }

  /**
   * Generic query method that queries the Spotify service based on the `type` that the user has selected in the UI.
   */
  query() {
    this.spotify.query(this.type, this.q)
      .subscribe(results => {
        this.results = results[this.type];
      });
  }

  /**
   * Handler for key presses in the search query field.
   * @param event {KeyboardEvent} Keyboard event
   * @param query {HTMLInputElement} Input element that fired the event
   */
  searchFieldKeyHandler(event, query) {
    if (event.keyCode === 13 && this.q.length > 0) {
      this.query();
    }
  }

}
