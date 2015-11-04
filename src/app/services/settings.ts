import {Injectable} from 'angular2/angular2';

let languages = require('app/lib/languages');

@Injectable()
export class Settings {
  private language: {key: string, value: string};
  private availableLanguages: Array<{key: string, value: string}>;

  constructor() {

    let defaultLanguage = 'US';
    let language = localStorage.getItem('language');

    this.availableLanguages = languages.map(language => {
      let key = language['alpha-2'];
      return { key: key, value: language.name };
    });

    this.changeLanguage(language || defaultLanguage);
  }

  changeLanguage(newLanguageKey: string): any  {
    localStorage.setItem('language', newLanguageKey);
    this.language = {
      key: newLanguageKey,
      value: _.find(this.availableLanguages, {key: newLanguageKey}).value
    };
  }

  getLanguage() {
    return this.language;
  }

  getAvailableLanguages() {
    return this.availableLanguages;
  }

}
