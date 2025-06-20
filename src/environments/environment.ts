// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

// export const environment = {
//   production: true,
//   apiUrl: 'http://194.163.187.96:8090/api', // ← tu API externa aquí
//   baseUrl: '/'                             // ← este es clave para el frontend
// };

export const environment = {
  production: false,
  apiUrl: 'https://localhost:7027/api',
  baseUrl: 'https://localhost:7027',
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
