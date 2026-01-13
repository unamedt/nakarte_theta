Source code of site http://nakarte.me (former http://nakarte.tk)

Install&run locally for development


Run code:
```bash
git clone git@github.com:unamedt/nakarte_theta.git
cd nakarte_theta
cp src/secrets.js.template src/secrets.js
npm install
npm run start
```



Some features require keys stored in src/secrets.js. 
In repository those keys are replaced with dummy ones.

Create a dummy `secrets.js` file:
```bash
cp src/secrets.js.template src/secrets.js
```

Run dev server:
```bash
yarn start
```

Check code for errors:
```bash
yarn run lint
```

