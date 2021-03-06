// Modified verison of https://github.com/dstillman/pathparser.js
"use strict";

class PathParser {
  constructor() {
    this.rules_ = [];
  }

  getParams_(rule, pathParts, queryParts) {
    var params = {};
    var missingParams = {};

    // Don't match if fixed rule is longer than path
    if (rule.parts.length < pathParts.length)
      return false;

    for (let i = 0; i < pathParts.length; i++){
      var rulePart = rule.parts[i];
      var part = pathParts[i];

      if (part !== undefined) {
        // Assign part to named parameter
        if (rulePart.charAt(0) == ':') {
          params[rulePart.substr(1)] = part;
          continue;
        } else if (rulePart !== part) {
          // If explicit parts differ, no match
          return false;
        }
      } else if (rulePart.charAt(0) != ':') {
        // If no path part and not a named parameter, no match
        return false;
      } else {
        missingParams[rulePart.substr(1)] = true;
      }
    }

    for (let part of queryParts) {
      var nameValue = part.split('=', 2);
      var key = nameValue[0];
      // But ignore empty parameters and don't override named parameters
      if (nameValue.length == 2 && !params[key] && !missingParams[key])
        params[key] = nameValue[1];
    }

    return params;
  }

  add(route, handler) {
    this.rules_.push({
      parts: this.parsePath_(route),
      handler: handler
    });
  }

  parsePath_(path) {
    if (path.charAt(0) != '/')
      throw `Path must start with a /. Path: ${path}`;
    // Strip the leading '/'.
    return path.substring(1).split('/');
  }

  async run(location) {
    let isString = typeof location == 'string';
    let path = isString ? location : location.pathname;
    if (!path)
      return false;

    let pathParts = this.parsePath_(path);
    // TODO: Allow including query parameters in the string version.
    // Strip the leading '?'.
    let queryParts = isString ? [] : location.search.substring(1).split('&');

    for (let rule of this.rules_) {
      var params = this.getParams_(rule, pathParts, queryParts);
      if (params) {
        await rule.handler(params);
        return true;
      }
    }
    return false;
  }
}
