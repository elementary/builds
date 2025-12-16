<div align="center">
  <a href="https://builds.elementary.io" align="center">
    <center align="center">
      <img src="./static/elementary.svg" alt="elementary" align="center">
    </center>
  </a>
  <br>
  <h1 align="center"><center>Builds Frontend</center></h1>
  <h3 align="center"><center>Frontend to elementary OS Builds</center></h3>
  <br>
  <br>
</div>

---

This repository contains the website code for our Early Access builds. This
**DOES NOT** build elementary OS or have any operating system related code.

---

### Building & Testing

This site is built with Nuxt.JS, a Vue.JS framework.

You'll need the following dependencies:

- nodejs >= 25
- npm

Run `npm` to install additional packages and start the development server

```sh
npm ci # Installs additional dependency packages
npm start # Starts the web server
```

A link to the test server will appear in Terminal. (Typically this is `http://localhost:3000/`)

### Testing GitHub & DigitalOcean Spaces integration

To test the GitHub login integration locally, generate a GitHub OAuth application client ID and secret at https://github.com/settings/applications/new
and store them in a `.env` file. Also add a `SIGNING_KEY` which can just be random hex characters used to sign JWT tokens.

```
GITHUB_CLIENT_ID=XXXXXXXXX
GITHUB_CLIENT_SECRET=XXXXXXXXXXXXXXXXXXX
SIGNING_KEY=XXXXXXXXXXXXXXXXXXXXXXX
```

If also testing DigitalOcean Spaces integration, add the secrets:

```
SPACES_KEY=XXXXXXXXXXXXX
SPACES_SECRET=XXXXXXXXXXXXXXXXXXXXXXXXX
```

You can then run the application in production mode with:

```
npx nuxt build
npx nuxt start
```
