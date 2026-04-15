export default class User {
  constructor(opts) {
    if (opts) {
      this.id = opts.id;
      this.username = opts.username;
    }
  }
}
