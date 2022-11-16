# Comments POC

The POC is deployed here: <https://comments-app-ram.web.app/>

## Available Scripts

In the project directory, you can run:

### `yarn start`

Runs the app in the development mode.
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `yarn build`

Builds the app for production to the `build` folder.

### Deployment

App is deployed using firebase. Any changes made to `firebase.json` or `.firebaserc` may break the deployment flow.
So please be careful when trying to deploy the application.

```bash
% npm i -g firebase-tools
% firebase init
% firebase login #optional
% firebase deploy
```
