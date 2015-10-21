/// <reference path="../typings/_custom.d.ts" />

// Angular 2
import {bootstrap} from 'angular2/angular2';
/*
 * Bindings provided by Angular
 */
import {FORM_PROVIDERS} from 'angular2/angular2'
import {ROUTER_PROVIDERS} from 'angular2/router';
import {ELEMENT_PROBE_PROVIDERS} from 'angular2/angular2';
import {HTTP_PROVIDERS} from 'angular2/http';

/*
 * App Component
 * our top level component that holds all of our components
 */
import {App} from 'app/app';

require('app/styles/bootstrap.scss');
require('app/styles/main.scss');

// Bootstrap javascript
// Use the next line to include all scripts (not recommended) ...
//require('imports?jQuery=jquery!bootstrap-sass/assets/javascripts/bootstrap');
// ... or include the scripts one by one (recommended)
const requiredBootstrapPlugins = [
  //'affix',
  //'alert',
  //'button',
  //'carousel',
  'collapse',
  'dropdown',
  //'modal',
  //'popover',
  //'scrollspy',
  //'tab',
  //'tooltip',
  //'transition'
];
_.each(requiredBootstrapPlugins, pluginName => {
  require(`imports?jQuery=jquery!bootstrap-sass/assets/javascripts/bootstrap/${pluginName}`);
});

import {Spotify} from 'app/services/spotify';
import {Settings} from 'app/services/settings';

/*
 * Bootstrap our Angular app with a top level component `App` and inject
 * our services/bindings into Angular's dependency injection
 */
bootstrap(App, [
  // These are dependencies of our App
  FORM_PROVIDERS,
  ROUTER_PROVIDERS,
  HTTP_PROVIDERS,
  ELEMENT_PROBE_PROVIDERS,
  Spotify,
  Settings
]);
