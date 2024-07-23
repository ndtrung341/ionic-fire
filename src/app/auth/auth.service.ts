import { Injectable } from '@angular/core';
import {
  createUserWithEmailAndPassword,
  Auth,
  authState,
  updateProfile,
  User,
  UserCredential,
  signInWithEmailAndPassword,
  signOut,
  user,
} from '@angular/fire/auth';
import {
  collection,
  doc,
  Firestore,
  setDoc,
  snapToData,
  Timestamp,
} from '@angular/fire/firestore';
import { getDoc } from 'firebase/firestore';
import {
  BehaviorSubject,
  from,
  map,
  Observable,
  of,
  switchMap,
  take,
  tap,
} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private collectionName = 'users';
  private usersCollectionRef = collection(this.fireStore, this.collectionName);

  private _isAuthticated = new BehaviorSubject<boolean>(false);
  private _uid = new BehaviorSubject<string | null>(null);
  private _userInfo = new BehaviorSubject<any | null>(null);

  get userInfo$() {
    return this._userInfo.asObservable();
  }

  get userUid$() {
    return this._uid.asObservable();
  }

  get isAuthicated$() {
    return this._isAuthticated.asObservable();
  }

  constructor(private fireStore: Firestore, private auth: Auth) {
    this.auth.onAuthStateChanged((authUser: User | null) => {
      if (authUser) {
        this._isAuthticated.next(true);
        this._uid.next(authUser.uid);
        from(getDoc(doc(this.fireStore, 'users', authUser.uid)))
          .pipe(map((snapshot) => snapshot.data()))
          .subscribe((data) => {
            this._userInfo.next(data);
          });
      } else {
        this._isAuthticated.next(false);
        this._uid.next(null);
        this._userInfo.next(null);
      }
    });
  }

  signOut() {
    return from(signOut(this.auth));
  }

  signIn(values: { email: string; password: string }) {
    return from(
      signInWithEmailAndPassword(this.auth, values.email, values.password)
    );
  }

  signUp(values: { email: string; password: string; fullName: string }) {
    const { email, password, fullName } = values;
    return from(
      createUserWithEmailAndPassword(this.auth, email, password)
    ).pipe(
      tap((credential: UserCredential) => {
        const { user } = credential;

        const defaultData = {
          createdAt: Timestamp.fromDate(new Date()),
          role: 'user',
        };

        setDoc(doc(this.usersCollectionRef, user.uid), defaultData);
        updateProfile(credential.user, {
          displayName: fullName,
        });
      })
    );
  }
}
