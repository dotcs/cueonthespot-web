/// <reference path="../typings/_custom.d.ts" />

/*
 * Angular 2 decorators and services
 */
import {Directive, Component, View, ElementRef} from 'angular2/angular2';
import {RouteConfig, Router } from 'angular2/router';
import {Http, Headers} from 'angular2/http';

/*
 * Angular Directives
 */
import {CORE_DIRECTIVES, FORM_DIRECTIVES} from 'angular2/angular2';
import {ROUTER_DIRECTIVES} from 'angular2/router';

import {Navbar} from 'app/components/navbar/navbar';
import {SpotifySearch} from 'app/components/search/search';
import {SpotifyAlbumDetail} from 'app/components/album_detail/album_detail';

@Component()
@View({
  directives: [],
  template: `
  <div class="alert alert-info">
    This feature is not implemented yet.
  </div>
  `
})
class NotImplementedYet {
  constructor() {}
}

/*
 * App Component
 * Top Level Component
 */
@RouteConfig([
  { path: '/search', component: SpotifySearch, 'as': 'Search' },
  { path: '/search/:type/', component: SpotifySearch, 'as': 'SearchType' },
  { path: '/search/:type/:query', component: SpotifySearch, 'as': 'SearchTypeQuery' },
  { path: '/artist/:id', component: NotImplementedYet, 'as': 'ArtistDetail' },
  { path: '/album/:id', component: SpotifyAlbumDetail, 'as': 'AlbumDetail' }
])
@Component({
  selector: 'app'
})
@View({
  directives: [ CORE_DIRECTIVES, FORM_DIRECTIVES, ROUTER_DIRECTIVES, SpotifySearch, Navbar ],
  template: `
  <navbar></navbar>
  <div class="container">
    <main>
      <router-outlet></router-outlet>
    </main>
  </div>
  `
})
export class App {
  constructor() {}
}
