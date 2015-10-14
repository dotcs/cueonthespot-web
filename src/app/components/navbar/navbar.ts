import {Component, View, ChangeDetectionStrategy} from 'angular2/angular2';

import {CORE_DIRECTIVES} from 'angular2/angular2';
import {ROUTER_DIRECTIVES, Location} from 'angular2/router';

import {Settings} from 'app/services/settings';

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
  currentLanguageKey: any;
  availableLanguages: any;

  constructor(public location: Location, public settings: Settings) {
    this.availableLanguages = settings.getAvailableLanguages();
    this.currentLanguageKey = settings.getLanguage().key;
  }

  /**
   * Find out if a given path matches the location's path.
   *
   * @param path {string} Path that should be compared to the location's path.
   * @returns {boolean} Return `true`, if the location's path equals the given path. `false` otherwise.
   */
  getLinkStyle(path: string): boolean {
    return this.location.path() === path;
  }

  changeLanguage(newLanguageKey) {
    this.settings.changeLanguage(newLanguageKey);
    this.currentLanguageKey = newLanguageKey;
  }

}
