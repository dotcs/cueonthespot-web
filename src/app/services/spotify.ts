import {Injectable} from 'angular2/angular2';
import {Http} from 'angular2/http';

@Injectable()
export class Spotify {
  apiBaseUrl: string;
  playBaseUrl: string;

  constructor(public http: Http) {
    this.apiBaseUrl = 'https://api.spotify.com';
    this.playBaseUrl = 'https://play.spotify.com';
  }

  /**
   * Queries the Spotify server.
   *
   * @param type {string} Type of the query (one of ['artist', 'artists', 'album', 'albums']).
   * @param query {string} Query string
   * @returns {Observable<Object>|Rx.Observable<Object>} Rx.Observable
   */
  public query(type: string, query: string) {
    // Map plural forms of types to non-plural form.
    const typeMappings = {
      'artist': ['artists', 'artist'],
      'album': ['albums', 'album']
    };
    let queryType = null;
    _.each(Object.keys(typeMappings), key => {
      if (typeMappings[key].indexOf(type) > -1) {
        queryType = key;
      }
    });
    if (queryType === null) {
      throw Error(`Type '${type} is unknown.'`);
    }

    const url = `${this.apiBaseUrl}/v1/search?type=${queryType}&q=${query}`;
    return this.loadUrl(url);
  }

  /**
   * Query an album based on its ID.
   *
   * @param id {string} Spotify's album identifier
   * @returns {Observable<Object>|Rx.Observable<Object>} Rx.Observable
   */
  public queryAlbum(id: string) {
    const url = `${this.apiBaseUrl}/v1/albums/${id}`;
    return this.loadUrl(url);
  }

  /**
   * Helper method to load a URL via GET.
   *
   * @param url {string} URL that should be requested
   * @returns {Observable<Object>|Rx.Observable<Object>} Rx.Observable
   */
  public loadUrl(url: string) {
    return this.http.get(url)
      .map(res => res.json())
  }

  public getPlayUrl(type: string, identifier: string): string {
    return `${this.playBaseUrl}/${type}/${identifier}`;
  }
}
