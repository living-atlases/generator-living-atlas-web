# Living Atlas Ansible Web Generator

*Work in progress*

This is a web interface for our yeoman [Living Atlas generator](https://github.com/living-atlases/generator-living-atlas). 
It tries to facilitate even more the initial deployment of a LA portal. [Demo site](https://generator.l-a.site).

## Why this tool?

The deployment of a Living Atlas (LA) is not straightforward. Many times newcomers start using the 
[ala-install demo ansible inventories](https://github.com/AtlasOfLivingAustralia/ala-install/#setup-the-living-atlas-demo), 
or the vagrant test environment, but the effort necessary to go from these sample inventories to a production quality 
ones is enormous.    

Our [Living Atlas generator](https://github.com/living-atlases/generator-living-atlas), our 
[LA base-branding](https://github.com/living-atlases/base-branding) and our bootstrap remote sessions helps a lot to get 
a running LA portal for testing and even production. But still the effort to understand and use these tools is 
considerable.

This web tool tries to minimize this initial effort. Using a web assistant and asking some basic questions you can 
generate & download your inventories, and a compatible html/css theme tailored for you LA portal.

This is inspired in other similar tools like the [Bootstrap customization tool](https://getbootstrap.com/docs/3.4/customize/).

## Development

This web interface uses [svelte](https://svelte.dev/). Install the dependencies:

```bash
npm install
```

...then start [Rollup](https://rollupjs.org):

```bash
npm run dev
```

Navigate to [localhost:5000](http://localhost:5000). You should see your app running. Edit a component file in `src`, save it, and reload the page to see your changes.

By default, the server will only respond to requests from localhost. To allow connections from other computers, edit the `sirv` commands in package.json to include the option `--host 0.0.0.0`.


## Building and running in production mode

To create an optimised version of the app:

```bash
npm run build
```

You can run the newly built app with `npm run start`. This uses [sirv](https://github.com/lukeed/sirv), which is included in your package.json's `dependencies` so that the app will work when you deploy to platforms like [Heroku](https://heroku.com).

## Single-page app mode

By default, sirv will only respond to requests that match files in `public`. This is to maximise compatibility with static fileservers, allowing you to deploy your app anywhere.

If you're building a single-page app (SPA) with multiple routes, sirv needs to be able to respond to requests for *any* path. You can make it so by editing the `"start"` command in package.json:

```js
"start": "sirv public --single"
```

## Using TypeScript

This template comes with a script to set up a TypeScript development environment, you can run it immediately after cloning the template with:

```bash
node scripts/setupTypeScript.js
```

Or remove the script via:

```bash
rm scripts/setupTypeScript.js
```
