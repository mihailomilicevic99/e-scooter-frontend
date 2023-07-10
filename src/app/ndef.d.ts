declare module '@taptrack/ndef' {
    export class NdefRecord {
      constructor(data: Uint8Array, tnf?: number, type?: Uint8Array, id?: Uint8Array);
    }
  
    export class TextRecord extends NdefRecord {
      constructor(text: string, languageCode?: string, encoding?: string);
    }

  
    export class NDEFMessage {
      constructor(records: NdefRecord[]);
    }
  }
  