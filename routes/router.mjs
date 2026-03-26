// ==============================
// Router
// ==============================

class Router {
  constructor() {
    this.routes = [];
  }

  register(method, path, handler) {
    this.routes.push({ method, path, handler });
  }

  get(path, handler) {
    this.register('GET', path, handler);
  }

  post(path, handler) {
    this.register('POST', path, handler);
  }

  put(path, handler) {
    this.register('PUT', path, handler);
  }

  delete(path, handler) {
    this.register('DELETE', path, handler);
  }

  resolve(event) {
    let path = event.resource || event.path;

    // прибираємо stage (/pizza-api)
    if (event.requestContext?.stage) {
      const stage = `/${event.requestContext.stage}`;
      if (path.startsWith(stage)) {
        path = path.slice(stage.length);
      }
    }

    return this.routes.find(
      r => r.method === event.httpMethod && r.path === path
    );
  }
}

export default Router;