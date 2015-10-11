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
  template: require('to-string!./navbar.html')
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
