import {Component, View} from 'angular2/angular2';

import {CORE_DIRECTIVES} from 'angular2/angular2';
import {ROUTER_DIRECTIVES, Location} from 'angular2/router';

/**
 * Navbar component
 */
@Component({
  selector: 'navbar'
})
@View({
  directives: [CORE_DIRECTIVES, ROUTER_DIRECTIVES],
  template: `
  <nav class="navbar navbar-default">
    <div class="container-fluid">
      <div class="navbar-header">
        <button type="button" class="navbar-toggle collapsed" data-toggle="collapse"
          data-target="#main-navbar" aria-expanded="false">
          <span class="sr-only">Toggle navigation</span>
          <span class="icon-bar"></span>
          <span class="icon-bar"></span>
          <span class="icon-bar"></span>
        </button>
        <a class="navbar-brand" [router-link]="['/search']">cots</a>
      </div>

      <div class="collapse navbar-collapse" id="main-navbar">
        <ul class="nav navbar-nav">
          <li [class.active]="getLinkStyle('/search')"><a [router-link]="['/search']">Search</a></li>
        </ul>
      </div><!-- /.navbar-collapse -->
    </div><!-- /.container-fluid -->
  </nav>
  `
})
export class Navbar {
  constructor(public location: Location) {}

  /**
   * Find out if a given path matches the location's path.
   *
   * @param path {string} Path that should be compared to the location's path.
   * @returns {boolean} Return `true`, if the location's path equals the given path. `false` otherwise.
   */
  getLinkStyle(path: string): boolean {
    return this.location.path() === path;
  }

}
