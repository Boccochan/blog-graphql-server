interface Handler<T, S> {
  setNext(handler: Handler<T, S>): Handler<T, S>;

  handle(request: T, state: S): Promise<S>;
}

export abstract class AbstractHandler<T, S> implements Handler<T, S> {
  private nextHandler: Handler<T, S>;

  public setNext(handler: Handler<T, S>): Handler<T, S> {
    this.nextHandler = handler;
    return handler;
  }

  public async handle(request: T, state: S): Promise<S> {
    const result = await this._handle(request, state);

    if (this.nextHandler) {
      return await this.nextHandler.handle(request, result);
    }

    return result;
  }

  abstract _handle(request: T, state: S): Promise<S>;
}
