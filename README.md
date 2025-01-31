# shared-dependencies

An import map of shared dependencies for react microfrontends

## What is this?

This is an example microfrontend repo demonstrating how to use [single-spa](https://single-spa.js.org). You can see the code running at https://react.microfrontends.app. The full, deployed import map is visible at https://react.microfrontends.app/importmap.json.

## How does it work?

[Full article](https://single-spa.js.org/docs/recommended-setup)

This repository contains `importmap-template.json` and `global-scripts.json` files which are built via a Github action into a dependencies folder that is uploaded to the react.microfrontends.app public CDN. The import-map-template.json allows for specifying which npm packages and versions are available in the shared import map, as well as for scoped package dependencies to allow for specific microfrontends to use different versions. The `global-scripts.json` file is a list of npm packages that are self-hosted on the react.microfrontends.app domain, referenced within the root-config.

Whenever a pull request is merged to main, a Github workflow auto-deploys the updated shared dependencies

## Adapting for your organization

Feel free to fork and modify any files you would like when doing a proof of concept for your organization.
