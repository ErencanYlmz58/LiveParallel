import * as firebaseService from './firebase';
import * as authService from './auth';
import * as storageService from './storage';
import * as scenariosService from './scenarios';
import * as profileDataService from './profileDataService';

export {
  firebaseService,
  authService,
  storageService,
  scenariosService,
  profileDataService
};

export default {
  ...firebaseService,
  ...authService,
  ...storageService,
  ...scenariosService,
  ...profileDataService
};