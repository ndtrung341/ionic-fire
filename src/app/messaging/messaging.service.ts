import { Injectable } from '@angular/core';
import { deleteDoc, doc, Firestore, setDoc } from '@angular/fire/firestore';
import {
  getToken,
  Messaging,
  deleteToken,
  onMessage,
  MessagePayload,
} from '@angular/fire/messaging';
import { environment } from 'src/environments/environment';
import { AuthService } from '../auth/auth.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { Platform } from '@ionic/angular';

@Injectable({
  providedIn: 'root',
})
export class MessagingService {
  private _currentToken: string | null = null;
  private _collectionName = 'fcmTokens';
  private _message = new BehaviorSubject<MessagePayload | null>(null);

  get message$() {
    return this._message.asObservable();
  }

  constructor(
    private firestore: Firestore,
    private authService: AuthService,
    private messaging: Messaging,
    private platform: Platform
  ) {
    console.log(this.platform.platforms());

    this.authService.userUid$.subscribe((uid) => {
      if (uid) {
        this.subscribeUserDevice(uid);
      } else {
        if (this._currentToken) this.unsubscribeUserDevice();
      }
    });
  }

  listen(): Observable<MessagePayload> {
    return new Observable((sub) =>
      onMessage(this.messaging, (msg) => {
        sub.next(msg);
      })
    );
  }

  private getUserPlatform() {
    if (this.platform.is('android') || this.platform.is('ios')) return 'mobile';
    return 'browser';
  }

  private async subscribeUserDevice(uid: string) {
    const isAllowed = await this.requestNotificationsPermissions();
    if (!isAllowed) return;

    try {
      const swRegistration = await navigator.serviceWorker.register(
        '/assets/firebase-messaging-sw.js',
        {
          type: 'module',
        }
      );

      this._currentToken = await getToken(this.messaging, {
        vapidKey: environment.firebase.vapidKey,
        serviceWorkerRegistration: swRegistration,
      });
      console.log(this._currentToken);

      const deviceRef = doc(this.firestore, 'user_devices', this._currentToken);

      await setDoc(deviceRef, {
        uid: uid,
        token: this._currentToken,
        platform: this.getUserPlatform(),
      });
    } catch (err) {
      console.log('An error occurred while retrieving token. ', err);
    }
  }

  private unsubscribeUserDevice = async () => {
    const deviceRef = doc(this.firestore, 'user_devices', this._currentToken!);
    await Promise.all([deleteToken(this.messaging), deleteDoc(deviceRef)]);
    this._currentToken = null;
    console.log('Delete token');
  };

  private requestNotificationsPermissions = async () => {
    const permission = await Notification.requestPermission();

    if (permission === 'granted') {
      console.log('Notification permission granted.');
      return true;
    } else {
      console.log('Unable to get permission to notify.');
      return false;
    }
  };
}
