import * as locale from "locale-codes";

export class LocaleUtils {

    static localeFromLang = (lang: string = 'en', fallback?: locale.ILocale): locale.ILocale => {
        return locale.all.find(element => element && element['iso639-1'] && element['iso639-1'].toLowerCase() === lang.toLowerCase()) || fallback || locale.getByTag('en-US');
    }

}