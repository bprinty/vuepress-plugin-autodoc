
// import
import _ from 'lodash';
import { MockServer, collection, model } from './mock';

// database
class App extends MockServer {

  data() {
    return {
      profile: {
        username: 'admin',
      },
      posts: [
        {
          title: 'Foo',
          body: 'foo bar baz',
          hits: 100,
          author_id: 1,
          archived: false,
        },
        {
          title: 'Bar',
          body: 'bar baz',
          hits: 200,
          author_id: 1,
          history: [],
          archived: true,
        },
      ],
      records: [
        { delta: 'foo', post_id: 1 },
        { delta: 'bar', post_id: 1 },
      ],
      authors: [
        { name: 'Jane Doe', email: 'jane@doe.com' },
        { name: 'John Doe', email: 'john@doe.com' },
      ],
    };
  }

  relationships() {
    return {
      posts: {
        from: 'author_id',
        to: 'author',
        collection: 'authors',
      }
    }
  }

  api() {
    return {
      '/profile': {
        get: () => this.db.profile,
        put: (data) => {
          this.db.profile = Object.assign(this.db.profile, data);
          return this.db.profile;
        },
        delete: () => {
          this.db.profile = { username: 'admin' };
        },
      },
      '/posts': this.collection('posts'),
      '/posts/:id': this.model('posts'),
      '/posts/:id/history': {
        get: (id) => {
          const records = Object.keys(this.db.records).map(id => this.db.records[id]);
          return records.filter(x => x.post_id === id);
        },
        post: (id, data) => {
          // TODO: THINK AB OUT CLOJURE SYNTAX WHEN ABSTRACTING
          //       INTO NEW PACKAGE
          // this.db.records.get(id);
          // this.db.records.add(data);
          // this.db.records.update(id, data);
          // this.db.records.remove(id);
          data.id = Number(_.max(Object.keys(this.db.records))) + 1;
          data.post_id = id;
          this.db.records[data.id] = data;
          const records = Object.keys(this.db.records).map(key => this.db.records[key]);
          return records.filter(x => x.post_id === id);
        },
      },
      '/posts/:id/archive': {
        post: (id) => {
          this.db.posts[id].archived = true;
          return this.db.posts[id];
        },
      },
      '/posts/:id/author': {
        get: id => this.db.authors[this.db.posts[id].author_id],
      },
      '/authors': this.collection('authors'),
      '/authors/:id': this.model('authors'),
      '/authors/:id/posts': {
        get: id => {
          const posts = Object.keys(this.db.posts).map(id => this.db.posts[id]);
          return posts.filter(x => x.author_id === id);
        },
      },
    }
  }
}

// exports
export default new App('blog');
