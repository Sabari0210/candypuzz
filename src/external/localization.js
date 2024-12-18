export default {
    getLanguage() {
        this._language = null;

        if (navigator && navigator.userAgent && (this._language = navigator.userAgent.match(/android.*\W(\w\w)-(\w\w)\W/i))) {
            this._language = this._language[1];
        }

        if (!this._language && navigator) {
            if (navigator.languages) {
                this._language = navigator.languages[0];
            } else if (navigator.language) {
                this._language = navigator.language;
            } else if (navigator.browserLanguage) {
                this._language = navigator.browserLanguage;
            } else if (navigator.systemLanguage) {
                this._language = navigator.systemLanguage;
            } else if (navigator.userLanguage) {
                this._language = navigator.userLanguage;
            }

            if (this._language) {
                if (this._language !== "zh-TW" && this._language !== "es-419")
                    this._language = this._language.substr(0, 2);
            }
        }

        if (!this._language)
            this._language = 'en';

        return this._language;
    }

}
