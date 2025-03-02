import * as firebaseService from './firebase';
import * as authService from './auth';
import * as storageService from './storage';
import * as scenariosService from './scenarios';

export {
  firebaseService,
  authService,
  storageService,
  scenariosService
};

export default {
  ...firebaseService,
  ...authService,
  ...storageService,
  ...scenariosService
};