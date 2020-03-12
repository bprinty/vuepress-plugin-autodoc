# Vuex Reflect

## Overview

Vuex Reflect is a [Vuex](https://vuex.vuejs.org/) plugin that simplifies the configuration and management of data models in an application, providing a simple and declarative API for reflecting an external datasource. Modern web applications can be quite complex, and engineering a data store to reflect data models in your application doesn't need to be left up to interpretation. Abstractions like [SQLAlchemy](https://sqlalchemy.org) have reduced complexity and augmented developer experience for languages like Python, and this library similarly augments the developer experience associated with managing frontend application data.

It does this with two main features:

1. A declarative syntax for defining and configuring data models. This feature provides a) an easy way to connect models to an external API endpoint for CRUD actions, b) utilities for property mutations and validation, and c) a fluid query API for accessing data from the store.
2. Automatic vuex-based data management for models tracked by this library. Vuex Relfect handles all of the details around managing how data are stored, [updated](https://redux.js.org/recipes/structuring-reducers/updating-normalized-data/), and [normalized](https://redux.js.org/recipes/structuring-reducers/normalizing-state-shape/) so that they can be easily be accessed via class-based model definitions (or from the store directly, if you're not a fan of ES6 classes).

### Notes on Vuex

Vuex is a fantastic library for doing exactly what it needs to do: manage state. The scope of Vuex was never to inherently manage data retrieval and updates via an API or other external data sources -- it simply (and elegantly) stores data and provides utilities for updating those data and propagating those updates to the components of your application. This package is a logical abstraction of that pattern, providing a more developer-friendly experience around interacting with data models and other external application data.

Because this module integrates with Vuex for storing data, it also integrates with Vue's official devtools extension to provide advanced features such as zero-config time-travel debugging and state snapshot export/import. It was made with REST API reflection specifically in mind, but can be extended to reflect other types of data sources (i.e. GraphQL).

### Why `Reflect`?

The name `Reflect` was chosen because this package essentially lets you reflect the data provided via an API into your store, with minimal configuration. There are many types of data reflection throughout a well-designed application - the UI reflects data from the frontend data store, the frontend store reflects data from the API, and the API reflects data from the database. This library covers one piece of that puzzle.


## Installation

### Install in Project

To use this library in a Vue project, add the package to your package dependencies via:

```bash
npm install --save vuex-reflect
```

Or, with [yarn](https://yarnpkg.com/):

```bash
yarn add vuex-reflect
```

### Use via CDN

To use this package via CDN, import it in your project via:

```html
<script src="https://unpkg.com/vuex-reflect/dist/vuex-reflect.min.js"></script>
```

## Quickstart

> TODO: Need to make more concise quickstart for README and point to external documentation.

## Documentation

Documentation for the project can be found [here](http://storage.googleapis.com/atgtag/vuex-reflect/index.html).

<!-- TODO: don't store docs in a bucket after it's published - use GitHub pages. -->

## Contributors

### Getting Started

To get started contributing to the project, simply clone the repo and setup the dependencies using `yarn` or `npm install`:

```bash
git clone git@github.com:bprinty/vuex-reflect.git
cd vuex-reflect/
yarn
```

Once you do that, you should be ready to write code, run tests, and edit the documentation.


### Building Documentation

To develop documentation for the project, make sure you have all of the developer dependencies installed from the `package.json` file in the repo. Once you have all of those dependencies, you can work on the documentation locally using:

```bash
yarn docs:dev
```

Or, using `vuepress` directly:

```bash
vuepress dev docs
```

### Running Tests

The [Jest](https://jestjs.io/) framework is used for testing this application. To run tests for the project, use:

```bash
yarn test
```

To have Jest automatically watch for changes to code for re-running tests in an interactive way, use:

```bash
yarn test:watch
```

To run or watch a specific test during development, use:

```bash
yarn test:watch -t model.update
```

Or, you can invoke `jest` directly:

```bash
jest
jest --watch
jest --watch -t model.update
```

### Submiting Feature Requests

If you would like to see or build a new feature for the project, submit an issue in the [GitHub Issue Tracker](https://github.com/bprinty/vuex-reflect/issues) for the project. When submitting a feature request, please fully explain the context, purpose, and potential implementation for the feature, and label the ticket with the `discussion` label. Once the feature is approved, it will be re-labelled as `feature` and added to the project Roadmap.


### Improving Documentation

Project documentation can always be improved. If you see typos, inconsistencies, or confusing wording in the documentation, please create an issue in the [GitHub Issue Tracker](https://github.com/bprinty/vuex-reflect/issues) with the label `documentation`. If you would like to fix the issue or improve the documentation, create a branch with the issue number (i.e. `GH-123`) and submit a PR against the `master` branch.


### Submitting PRs

For contributors to this project, please submit improvements according to the following guidelines:

1. Create a branch named after the ticket you're addressing. `GH-1` or `bp/GH-1` are examples of good branch naming.
2. Make your changes and write tests for your changes.
3. Run all tests locally before pushing code.
4. Address any test failures caught by [Travis CI](https://travis-ci.com/bprinty/vuex-reflect).
5. Make sure you've updated the documentation to reflect your changes (if applicable).
6. Submit a PR against the `master` branch for the project. Provide any additional context in the PR description or comments.


### Keeping up to Speed on the Project

All development efforts for the project are tracked by the project [Kanban](https://github.com/bprinty/vuex-reflect/projects/1) board. Contributors use that board to communicate the status of pending, in-progress, or resolved development efforts. If you have a question about the Roadmap or current in-progress issues for the project, see that board.
