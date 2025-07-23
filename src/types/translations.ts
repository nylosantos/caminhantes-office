// Typings for translations document
export interface RoundTranslationsDocument {
    [key: number]: { [key: string]: string }; // English original -> Portuguese translation
}
export interface RoundTranslationsDocuments {
    [key: string]: { [key: number]: { [key: string]: string } }; // English original -> Portuguese translation
}