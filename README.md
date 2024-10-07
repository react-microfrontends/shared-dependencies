# shared-dependencies

An import map of shared dependencies for react microfrontends

## What is this?

This is an example microfrontend repo demonstrating how to use [single-spa](https://single-spa.js.org). You can see the code running at https://react.microfrontends.app. The full, deployed import map is visible at https://react.microfrontends.app/importmap.json.

## How does it work?

[Full article](https://single-spa.js.org/docs/recommended-setup)

This repository contains an [import map](https://github.com/WICG/import-maps/) template that controls the shared libraries between all microfrontends.

Whenever a pull request is merged to main, a Github workflow auto-deploys the updated shared dependencies

## Adapting for your organization

Feel free to fork and modify any files you would like when doing a proof of concept for your organization.
