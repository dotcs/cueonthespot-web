interface ISpotifyAPIExternalURL {
  spotify: string
}

interface ISpotifyAPIArtist {
  external_urls: ISpotifyAPIExternalURL,
  href: string,
  id: string,
  name: string,
  type: string,
  uri: string
}

interface ISpotifyAPITrack {
  artists: Array<ISpotifyAPIArtist>,
  available_markets: Array<string>,
  disc_number: number,
  duration_ms: number,
  explicit: boolean,
  external_urls: ISpotifyAPIExternalURL,
  href: string,
  id: string,
  name: string,
  preview_url: string,
  track_number: number,
  type: string,
  uri: string
}

interface ISpotifyAPICopyright {
  text: string,
  type: string
}

interface ISpotifyAPIImage {
  height: number,
  width: number,
  url: string
}

interface ISpotifyAPITracks {
  href: string,
  items: Array<ISpotifyAPITrack>,
  limit: number,
  next: string,
  offset: number,
  previous: string,
  total: number
}

interface ISpotifyAPIAlbum {
  album_type: string,
  artists: Array<ISpotifyAPIArtist>,
  available_markets: Array<string>,
  copyrights: Array<ISpotifyAPICopyright>,
  external_ids: any,
  genres: Array<any>,
  href: string,
  id: string,
  images: Array<ISpotifyAPIImage>
  name: string,
  popularity: number,
  release_date: string,
  release_date_precision: string,
  tracks: ISpotifyAPITracks,
  type: string,
  uri: string
}
