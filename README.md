# Living Atlas Ansible Web Generator

** NOTE**: This tool is deprecated, please use the [LA Toolkit](https://github.com/living-atlases/la-toolkit) instead.

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
generate & download your initial inventories, and a compatible html/css theme, tailored for you LA portal.

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

Navigate to [localhost:5000](http://localhost:1337). You should see your app running. Edit an UI component file in `src`, save it, and reload the page to see your changes.

## Building and running in production mode

To create an optimised version of the app:

```bash
npm run build
```

You can run the newly built app with `npm run start`.

## Tests

Just:

```
 npm run test
```
