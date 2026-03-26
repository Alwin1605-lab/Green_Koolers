import express from "express";

const METHODS_TO_PATCH = ["get", "post", "put", "patch", "delete", "all"];

function wrapHandler(handler) {
  if (typeof handler !== "function") return handler;
  if (handler.length === 4) return handler;
  if (handler.__asyncWrapped) return handler;

  const wrapped = function asyncWrappedHandler(req, res, next) {
    Promise.resolve(handler(req, res, next)).catch(next);
  };

  wrapped.__asyncWrapped = true;
  return wrapped;
}

function wrapArg(arg) {
  if (Array.isArray(arg)) {
    return arg.map(wrapArg);
  }
  return wrapHandler(arg);
}

function patchRouterMethods() {
  const routerProto = Object.getPrototypeOf(express.Router());
  if (routerProto.__asyncMethodsPatched) return;

  for (const method of METHODS_TO_PATCH) {
    const original = routerProto[method];
    if (typeof original !== "function") continue;

    routerProto[method] = function patchedMethod(...args) {
      return original.apply(this, args.map(wrapArg));
    };
  }

  routerProto.__asyncMethodsPatched = true;
}

patchRouterMethods();
