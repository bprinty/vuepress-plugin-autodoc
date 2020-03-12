# Vuex Reflect

## Introduction

Vuex Reflect is a [Vuex](https://vuex.vuejs.org/) plugin that simplifies the configuration and management of data models in an application, providing a simple and declarative API for reflecting an external datasource. Modern web applications can be quite complex, and engineering a data store to reflect data models in your application doesn't need to be left up to interpretation. Abstractions like [SQLAlchemy](https://sqlalchemy.org) have reduced complexity and augmented developer experience for languages like Python, and this library similarly augments the developer experience associated with managing frontend application data.

It does this with two main features:

1. A declarative syntax for defining and configuring data models. This feature provides a) an easy way to connect models to an external API endpoint for CRUD actions, b) utilities for property mutations and validation, and c) a fluid query API for accessing data from the store.
2. Automatic vuex-based data management for models tracked by this library. Vuex Relfect handles all of the details around managing how data are stored, [updated](https://redux.js.org/recipes/structuring-reducers/updating-normalized-data/), and [normalized](https://redux.js.org/recipes/structuring-reducers/normalizing-state-shape/) so that they can be easily be accessed via class-based model definitions (or from the store directly, if you're not a fan of ES6 classes).

### Notes on Vuex

Vuex is a fantastic library for doing exactly what it needs to do: manage state. The scope of Vuex was never to inherently manage data retrieval and updates via an API or other external data sources -- it simply (and elegantly) stores data and provides utilities for updating those data and propagating those updates to the components of your application. This package is a logical abstraction of that pattern, providing a more developer-friendly experience around interacting with data models and other external application data.

Because this module integrates with Vuex for storing data, it also integrates with Vue's official devtools extension to provide advanced features such as zero-config time-travel debugging and state snapshot export/import. It was made with REST API reflection specifically in mind, but can be extended to reflect other types of data sources (i.e. GraphQL).

### Why `Reflect`?

The name `Reflect` was chosen because this package essentially lets you reflect the data provided via an API into your store, with minimal configuration. There are many types of data reflection throughout a well-designed application - the UI reflects data from the frontend data store, the frontend store reflects data from the API, and the API reflects data from the database. This library covers one piece of that puzzle.


## Prerequisites

This documentation assumes users have at least a practical understanding of Vuex and the constructs Vuex uses to manage application state. For more information on Vuex, see the [documentation](https://vuex.vuejs.org/).

Another concept this documentation assumes users understand is the [MVMM](https://en.wikipedia.org/wiki/Model%E2%80%93view%E2%80%93viewmodel) architectural pattern. This documentation will refer to both frontend and backend data models for organizing data structures throughout application development.


## Quickstart

The sections below detail how to configure this plugin to build a minimal [todo list](https://vuejs.org/v2/examples/todomvc.html) application that connects to an external API for managing data. First, we'll use this library to define models in the system, and will then use those models in components of the application.

For more detailed documentation about how to define and configure data models using this library, see the [Models](/guide/models/overview.md) section fof the documentation.

For explanations/context about how data are managed behind-the-scenes using vuex, see the [Store](/guide/models/store.md) section of the documentation.

> **Note:** If you're not a fan of ES6 classes, see the [Store](/guide/store/overview.md) section of this documentation. This package can still be used to reflect application state without defining models - you can use the store directly, fully leveraging the ability to connect to an external api for fetching data.

For additional examples of how to use this module in a project, see the [Examples](/guide/examples/todo.md) section of the documentation.


### Defining Models

For this example, let's say we're initially interested in a single `Todo` model. The endpoints supplying data for this model are as follows:

```
/todos
  GET - Query all or a subset of objects.
  POST - Create a new todo.

/todos/:id
  GET - Get the metadata for a single todo.
  PUT - Update data for a single todo.
  DELETE - Delete data for a single todo.
```

And we can define this model using the following configuration:

```javascript
import { Model } from 'vuex-reflect';

class Todo extends Model {

  /**
   * API config for fetching and updating data.
   */
  static api() {
    return {
      create: '/todos', // url for creating new todo items (POST)
      fetch: '/todos', // url for fetching data with parameters (GET /todos?name.like=my-todo)
      get: '/todos/:id', // url for getting data for a single todo (GET)
      update: '/todos/:id', // url for updating a single todo (PUT)
      delete: '/todos/:id', // url for deleting a single todo (DELETE)
    };
  }

  /**
   * Property definitions for the model.
   */
  static props() {
    return {
      /**
       * Todo text
       */
      text: {
        default: null,
        required: true
        mutation: value => `todo: ${value}`,
        validation: /^[a-zA-Z\-]+$/, // validate input with regex
      },
      /**
       * Todo status
       */
      done: {
        default: false,
        type: Boolean,
        validation: value => typeof value === "boolean", // validate input with function
      },
    };
  }
}
```

Once models are defined, you can register them with Vuex like so:

```javascript
import Vue from 'vue';
import Vuex from 'vuex';
import Reflect from 'vuex-reflect';
import { Post, Author } from 'models';

Vue.use(Vuex);

const db = Reflect({
  Post,
  Author
});

const store = new Vuex.Store({
  state: { ... },
  mutations: { ... },
  plugins: [db],
})
```

With the syntax provided by this library, you define (in clear code) 1) where the data come from, and 2) how that data are mutated and validated during updates. Once you have a model, you can use it to fetch data for the store using (typically called when a component is created):

```javascript
Todo.query().then(() => {
  console.log('Data fetched and saved to vuex store.');
});
```

To see all of the data fetched, you can access the store directly:

```javascript
// result of: store.state
{
  todos: [
    { id: 1, text: 'first todo', done: false },
    { id: 2, text: 'done todo', done: true },
    ...
  }
}
```

Or, you can use the model classes to access the data:

```javascript
// result of: Todo.all().map((x) => x.json())
[
  { id: 1, text: 'first todo', done: false },
  { id: 2, text: 'done todo', done: true },
  ...
]
```

Other api methods available on models include static methods for querying models from the store:

```javascript
// get an existing todo by id
const todo = Todo.query(1);
const todo = Todo.query().filter({ text: /part of todo text/ }).first(); // or by other properties

// count all completed todos
const doneTodos = Todo.query().filter({ done: true }).count();
```

Or, static methods for changing data and committing those changes to the API and store:

```javascript

// create a new todo
const todo = new Todo({ text: 'read docs' });

// update it and save it via the API (results will be available via store)
todo.text += ' tomorrow';
todo.$.text // 'read docs' -> see the store version of the data
todo.commit() // PUT /todos/:id -> commit result to store
todo.$.text // 'read docs tomorrow' -> store is updated after commit
```

These quick examples of using the Model api are very minimal. For more detail on interacting with models or defining more complex models, see the [Models](/guide/models/overview.md) section of this documentation.


### A Minimal Application

Now that we've defined our models, let's use them in components. For this part of the example, we're going to create three components for managing the todo list: a `TodoForm` component for creating a new todo item, a `TodoItem` component for viewing a single todo, and a `TodoList` component for managing a list of todo items. First, let's make our `TodoForm` component that will let us create todos:

```html
<template>
  <div class="todo-form">
    <input type="text" v-model="text"/>
    <button @click="createTodo">Save</button>
  </div>
</template>

<script>
import { Todo } from '@/models';

export default {
  name: 'TodoForm',
  data() {
    return {
      text: '',
    }
  },
  methods: {
    createTodo() {
      const todo = new Todo({ text: this.text });
      todo.commit().then(() => {
        this.text = ''; // reset form text
      })
    }
  },
}
</script>
```

In the example above, once the user fills the input and clicks the button, a new client-side todo object will be created using the `Todo` model, and then when `todo.commit()` is called, the object is saved to the API via POST request and the form is reset.

Next, let's define our `TodoItem` component for viewing a single todo item.

```html
<template>
  <div class="todo-item">
    <p>{{ todo.text }}</p>
    <input type="checkbox" v-model="todo.done">
    <button v-if="todo.edited" @click="todo.commit">Update Status</button>
  </div>
</template>

<script>
export default {
  name: 'TodoItem',
  props: ['todo'],
}
</script>
```

In the component above, a user can click a checkbox to toggle the `done` state of a todo object. Once the `done` property has been changed for the model and is different than the value on the store, `todo.edited` will become true. The `todo.commit` method will be called once the user wants to save the todo status, and that method will `PUT` data to `/todos/:id` and commit the result to the store.

Finally, to wrap everything up, let's create our `TodoList` component for showing the `TodoForm` and list of `TodoItem` objects.

```html
<template>
  <todo-form />
  <div class="todo-list">
    <h1>Total: {{ list.length }}, Done: {{ done }}<h1>
    <todo-item v-for="item in list" :todo="item" :key="item.id"></todo-item>
  </div>
</template>

<script>
import 'TodoForm' from '@/components/TodoForm.vue';
import 'TodoItem' from '@/components/TodoItem.vue';
import { Todo } from '@/models';

export default {
  name: 'TodoList',
  components: {
    TodoForm,
    TodoItem,
  },
  created() {
    Todo.fetch() // fetch the data via `GET /todos`
  },
  computed: {
    list: () => Todo.all(),
    done: () => Todo.query().filter({ done: true }).count(),
  },
}
</script>
```

Above, you can see more examples of querying data using class-based models, along with the `Todo.fetch()` method for fetching data from an external datasource and putting it into the Vuex store. For more detail on how to use this library, proceed to the [Models](/guide/models/overview.md) section of the documentation.


## Table of Contents

- Setup
    - [Install](/guide/setup/install.md)
    - [Configure](/guide/setup/configure.md)
- Models
    - [Overview](/guide/models/overview.md)
    - [API](/guide/models/api.md)
    - [Properties](/guide/models/properties.md)
    - [Relationships](/guide/models/relationships.md)
    - [Querying](guide/models/querying.md)
    - [Customization](guide/models/customization.md)
- Store
    - [Overview](/guide/store/overview.md)
    - [API](guide/store/api.md)
    - [Contract](guide/store/contract.md)
    - [Querying](guide/store/querying.md)
    - [Debugging](guide/store/debugging.md)


<!--
- Examples
    - [Todo List](/guide/examples/todo.md)
    - [Blog](guide/examples/blog.md)
- Events
    - [Overview](/guide/events/overview.md)
    - [Model Events](/guide/events/model-events.md)
- API
    - [Model](api/model.md)
-->


## Additional Resources

- [Vue](https://vuejs.org)
- [Vuex](https://vuex.vuejs.org)
