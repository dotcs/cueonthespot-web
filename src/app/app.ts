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

import {SpotifySearch} from './components/search';
import {SpotifyAlbumDetail} from './components/album-detail';

/*
 * App Component
 * Top Level Component
 */
@RouteConfig([
  { path: '/search', component: SpotifySearch, 'as': 'search' },
  { path: '/artist/:id', component: SpotifySearch, 'as': 'artist-detail' },
  { path: '/album/:id', component: SpotifyAlbumDetail, 'as': 'album-detail' }
])
@Component({
  selector: 'app'
})
@View({
  directives: [ CORE_DIRECTIVES, FORM_DIRECTIVES, ROUTER_DIRECTIVES, SpotifySearch ],
  template: `
  <main>
    <router-outlet></router-outlet>
  </main>
  `
})
export class App {
  constructor(public http: Http) {}
}
