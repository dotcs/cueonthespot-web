import {Component, View} from 'angular2/angular2';
import {RouteConfig, Router, RouteParams, Location } from 'angular2/router';

import {CORE_DIRECTIVES, FORM_DIRECTIVES} from 'angular2/angular2';
import {ROUTER_DIRECTIVES } from 'angular2/router';

import {SpotifySrv} from '../spotify';

let exampleAlbumSearch = require('../../examples/album-search.json');

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
  template: require('to-string!./search.html')
})
export class SpotifySearch{
  q: string;
  type: string;
  types: Array<{value: string, label: string}>;
  results: any;

  constructor(public spotify: SpotifySrv, public params: RouteParams, public router: Router,
              public location: Location) {

    var loadURIComponent = (name: string, fallback: string): string => {
      return decodeURIComponent(params.get(name) || fallback);
    };
    this.q = loadURIComponent('query', '');
    this.type = loadURIComponent('albums', 'albums');

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
    //this._fakeQuery(this.type); // debug
    //return null; // debug
    this.spotify.query(this.type, this.q)
      .subscribe(results => {
        this.results = results[this.type];
      });
  }

  _fakeQuery(type: string) {
    switch (type) {
      case 'albums':
        this.results = exampleAlbumSearch[this.type];
        break;
      default:
        this.results = [];
        break;
    }
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
      this.query();
    }
  }

  isAvailableInHomeCountry(markets, homeCountry = 'DE') {
    return _.any(_.map(markets, m => m === homeCountry));
  }

}
