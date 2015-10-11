import {Component, View} from 'angular2/angular2';
import {RouteConfig, Router, RouteParams, Location } from 'angular2/router';

import {CORE_DIRECTIVES, FORM_DIRECTIVES} from 'angular2/angular2';
import {ROUTER_DIRECTIVES } from 'angular2/router';

import {SpotifySrv} from '../spotify';
import {SpotifyResults} from './results';

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
  directives: [CORE_DIRECTIVES, FORM_DIRECTIVES, ROUTER_DIRECTIVES ],
  template: `
  <div>
    <div class="Search">
      <input type="text" [(ng-model)]="q" placeholder="Search spotify" class="form-control Search-query"
        (keyup)="searchFieldKeyHandler($event)" />
      <select name="type" [(ng-model)]="type" class="form-control Search-type">
        <option *ng-for="#type of types" [value]="type.value" [selected]="type.value === type">
          {{ type.label }}
        </option>
      </select>
      <a [router-link]="getRouterLinkConfFromQuery()"
        class="btn btn-default Search-btn" [class.disabled]="q.length === 0">Load results</a>
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

  constructor(public spotify: SpotifySrv, public params: RouteParams, public router: Router,
              public location: Location) {
    this.q = params.get('query') || '';
    this.type = params.get('type') || 'albums'; // default type
    this.types = [
      {value: 'artists', label: 'Artist'},
      {value: 'albums', label: 'Album'},
    ];
    this.results = null;

    this.searchFieldKeyHandler = this.searchFieldKeyHandler.bind(this);
    if (this.q.length > 0 && !this.results) {
      this.query();
    }
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
   * @returns {any} Route representation that is consumable by RouterLink directive of the router.
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
   * Build the configuration for the RouterLink component for a detailed search from the input query.
   * @returns {any} Route representation that is consumable by RouterLink directive of the router.
   */
  getRouterLinkConfFromQuery() {
    return ['/search-type-query', {type: this.type, query: this.q}];
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
   */
  searchFieldKeyHandler(event: KeyboardEvent) {
    if (event.keyCode === 13 && this.q.length > 0) {
      // Find out the target URL, which can be generated via the router.
      // TODO: there should be a less verbose and less complicated way to do this, right?
      let navigationInstruction = this.router.generate(this.getRouterLinkConfFromQuery());
      this.location.go('/' + navigationInstruction.component.urlPath);
    }
  }

}
