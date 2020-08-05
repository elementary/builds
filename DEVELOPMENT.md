## Development

This site is build with Nuxt.JS, a Vue.JS framework. To run and work on this
project, you will need to have these packages installed:

- `node` `>=10.15.0`
- `npm` `>= 5.7.0`

If you are running on elementary, simply run these commands in terminal:

```
DISTRO="$(lsb_release -s -c --upstream)"
VERSION="node_14.x"
echo "deb https://deb.nodesource.com/$VERSION $DISTRO main" | sudo tee /etc/apt/sources.list.d/nodesource.list
echo "deb-src https://deb.nodesource.com/$VERSION $DISTRO main" | sudo tee -a /etc/apt/sources.list.d/nodesource.list
sudo apt update
sudo apt install nodejs
```

Once you have those two packages installed, you can install the project
dependencies with `npm ci`.

After that, run `npm start` to start the development server.

You will see a url in your terminal that you can click to see the website.
