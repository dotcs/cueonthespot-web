/// <reference path="../../src/typings/_custom.d.ts" />

import { provide } from 'angular2/angular2';
import { it, describe, expect, inject, injectAsync, beforeEachProviders } from 'angular2/testing';
import { Spotify } from 'app/services/spotify';

class MockSpotify extends Spotify {
  loadUrl(url) {
    return url;
  }
}

describe('Spotify service', () => {

  beforeEachProviders(() => [
    provide(Spotify, {useClass: MockSpotify})
  ]);

  // TODO: activate as soon as inject works as expected in webpack
  xit('should use be able to query an album', inject([Spotify], (service) => {
    expect(service.query('album', 'test')).toBe('https://api.spotify.com/v1/search?type=album&q=test');
  }));

});
