import { Injectable } from '@angular/core';
import { NFC, Ndef } from '@ionic-native/nfc/ngx';

@Injectable({
  providedIn: 'root'
})
export class NfcServiceService {

  constructor(private nfc: NFC, private ndef: Ndef) { }

  initializeNFC() {
    this.nfc.addTagDiscoveredListener().subscribe(tag => {
      // Handle tag discovery
      console.log(tag);
    });
  }

  writeTag(message: string) {
    let messageBytes = this.ndef.textRecord(message);

    this.nfc.write([messageBytes]).then(() => {
      console.log('Tag written successfully');
    }).catch(error => {
      console.error('Error writing tag', error);
    });
  }
}
