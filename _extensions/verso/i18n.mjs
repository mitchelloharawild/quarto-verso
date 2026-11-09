// quarto-i18n: built from src/ by scripts/build.mjs. Do not edit.
import { createRequire as __i18nCreateRequire } from 'node:module';
const require = __i18nCreateRequire(import.meta.url);
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __commonJS = (cb, mod) => function __require2() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/yaml/dist/nodes/identity.js
var require_identity = __commonJS({
  "node_modules/yaml/dist/nodes/identity.js"(exports) {
    "use strict";
    var ALIAS = Symbol.for("yaml.alias");
    var DOC = Symbol.for("yaml.document");
    var MAP = Symbol.for("yaml.map");
    var PAIR = Symbol.for("yaml.pair");
    var SCALAR = Symbol.for("yaml.scalar");
    var SEQ = Symbol.for("yaml.seq");
    var NODE_TYPE = Symbol.for("yaml.node.type");
    var isAlias = (node) => !!node && typeof node === "object" && node[NODE_TYPE] === ALIAS;
    var isDocument = (node) => !!node && typeof node === "object" && node[NODE_TYPE] === DOC;
    var isMap2 = (node) => !!node && typeof node === "object" && node[NODE_TYPE] === MAP;
    var isPair2 = (node) => !!node && typeof node === "object" && node[NODE_TYPE] === PAIR;
    var isScalar2 = (node) => !!node && typeof node === "object" && node[NODE_TYPE] === SCALAR;
    var isSeq2 = (node) => !!node && typeof node === "object" && node[NODE_TYPE] === SEQ;
    function isCollection(node) {
      if (node && typeof node === "object")
        switch (node[NODE_TYPE]) {
          case MAP:
          case SEQ:
            return true;
        }
      return false;
    }
    function isNode(node) {
      if (node && typeof node === "object")
        switch (node[NODE_TYPE]) {
          case ALIAS:
          case MAP:
          case SCALAR:
          case SEQ:
            return true;
        }
      return false;
    }
    var hasAnchor = (node) => (isScalar2(node) || isCollection(node)) && !!node.anchor;
    exports.ALIAS = ALIAS;
    exports.DOC = DOC;
    exports.MAP = MAP;
    exports.NODE_TYPE = NODE_TYPE;
    exports.PAIR = PAIR;
    exports.SCALAR = SCALAR;
    exports.SEQ = SEQ;
    exports.hasAnchor = hasAnchor;
    exports.isAlias = isAlias;
    exports.isCollection = isCollection;
    exports.isDocument = isDocument;
    exports.isMap = isMap2;
    exports.isNode = isNode;
    exports.isPair = isPair2;
    exports.isScalar = isScalar2;
    exports.isSeq = isSeq2;
  }
});

// node_modules/yaml/dist/visit.js
var require_visit = __commonJS({
  "node_modules/yaml/dist/visit.js"(exports) {
    "use strict";
    var identity = require_identity();
    var BREAK = Symbol("break visit");
    var SKIP = Symbol("skip children");
    var REMOVE = Symbol("remove node");
    function visit2(node, visitor) {
      const visitor_ = initVisitor(visitor);
      if (identity.isDocument(node)) {
        const cd = visit_(null, node.contents, visitor_, Object.freeze([node]));
        if (cd === REMOVE)
          node.contents = null;
      } else
        visit_(null, node, visitor_, Object.freeze([]));
    }
    visit2.BREAK = BREAK;
    visit2.SKIP = SKIP;
    visit2.REMOVE = REMOVE;
    function visit_(key, node, visitor, path8) {
      const ctrl = callVisitor(key, node, visitor, path8);
      if (identity.isNode(ctrl) || identity.isPair(ctrl)) {
        replaceNode(key, path8, ctrl);
        return visit_(key, ctrl, visitor, path8);
      }
      if (typeof ctrl !== "symbol") {
        if (identity.isCollection(node)) {
          path8 = Object.freeze(path8.concat(node));
          for (let i = 0; i < node.items.length; ++i) {
            const ci = visit_(i, node.items[i], visitor, path8);
            if (typeof ci === "number")
              i = ci - 1;
            else if (ci === BREAK)
              return BREAK;
            else if (ci === REMOVE) {
              node.items.splice(i, 1);
              i -= 1;
            }
          }
        } else if (identity.isPair(node)) {
          path8 = Object.freeze(path8.concat(node));
          const ck = visit_("key", node.key, visitor, path8);
          if (ck === BREAK)
            return BREAK;
          else if (ck === REMOVE)
            node.key = null;
          const cv = visit_("value", node.value, visitor, path8);
          if (cv === BREAK)
            return BREAK;
          else if (cv === REMOVE)
            node.value = null;
        }
      }
      return ctrl;
    }
    async function visitAsync(node, visitor) {
      const visitor_ = initVisitor(visitor);
      if (identity.isDocument(node)) {
        const cd = await visitAsync_(null, node.contents, visitor_, Object.freeze([node]));
        if (cd === REMOVE)
          node.contents = null;
      } else
        await visitAsync_(null, node, visitor_, Object.freeze([]));
    }
    visitAsync.BREAK = BREAK;
    visitAsync.SKIP = SKIP;
    visitAsync.REMOVE = REMOVE;
    async function visitAsync_(key, node, visitor, path8) {
      const ctrl = await callVisitor(key, node, visitor, path8);
      if (identity.isNode(ctrl) || identity.isPair(ctrl)) {
        replaceNode(key, path8, ctrl);
        return visitAsync_(key, ctrl, visitor, path8);
      }
      if (typeof ctrl !== "symbol") {
        if (identity.isCollection(node)) {
          path8 = Object.freeze(path8.concat(node));
          for (let i = 0; i < node.items.length; ++i) {
            const ci = await visitAsync_(i, node.items[i], visitor, path8);
            if (typeof ci === "number")
              i = ci - 1;
            else if (ci === BREAK)
              return BREAK;
            else if (ci === REMOVE) {
              node.items.splice(i, 1);
              i -= 1;
            }
          }
        } else if (identity.isPair(node)) {
          path8 = Object.freeze(path8.concat(node));
          const ck = await visitAsync_("key", node.key, visitor, path8);
          if (ck === BREAK)
            return BREAK;
          else if (ck === REMOVE)
            node.key = null;
          const cv = await visitAsync_("value", node.value, visitor, path8);
          if (cv === BREAK)
            return BREAK;
          else if (cv === REMOVE)
            node.value = null;
        }
      }
      return ctrl;
    }
    function initVisitor(visitor) {
      if (typeof visitor === "object" && (visitor.Collection || visitor.Node || visitor.Value)) {
        return Object.assign({
          Alias: visitor.Node,
          Map: visitor.Node,
          Scalar: visitor.Node,
          Seq: visitor.Node
        }, visitor.Value && {
          Map: visitor.Value,
          Scalar: visitor.Value,
          Seq: visitor.Value
        }, visitor.Collection && {
          Map: visitor.Collection,
          Seq: visitor.Collection
        }, visitor);
      }
      return visitor;
    }
    function callVisitor(key, node, visitor, path8) {
      if (typeof visitor === "function")
        return visitor(key, node, path8);
      if (identity.isMap(node))
        return visitor.Map?.(key, node, path8);
      if (identity.isSeq(node))
        return visitor.Seq?.(key, node, path8);
      if (identity.isPair(node))
        return visitor.Pair?.(key, node, path8);
      if (identity.isScalar(node))
        return visitor.Scalar?.(key, node, path8);
      if (identity.isAlias(node))
        return visitor.Alias?.(key, node, path8);
      return void 0;
    }
    function replaceNode(key, path8, node) {
      const parent = path8[path8.length - 1];
      if (identity.isCollection(parent)) {
        parent.items[key] = node;
      } else if (identity.isPair(parent)) {
        if (key === "key")
          parent.key = node;
        else
          parent.value = node;
      } else if (identity.isDocument(parent)) {
        parent.contents = node;
      } else {
        const pt = identity.isAlias(parent) ? "alias" : "scalar";
        throw new Error(`Cannot replace node with ${pt} parent`);
      }
    }
    exports.visit = visit2;
    exports.visitAsync = visitAsync;
  }
});

// node_modules/yaml/dist/doc/directives.js
var require_directives = __commonJS({
  "node_modules/yaml/dist/doc/directives.js"(exports) {
    "use strict";
    var identity = require_identity();
    var visit2 = require_visit();
    var escapeChars = {
      "!": "%21",
      ",": "%2C",
      "[": "%5B",
      "]": "%5D",
      "{": "%7B",
      "}": "%7D"
    };
    var escapeTagName = (tn) => tn.replace(/[!,[\]{}]/g, (ch) => escapeChars[ch]);
    var Directives = class _Directives {
      constructor(yaml, tags) {
        this.docStart = null;
        this.docEnd = false;
        this.yaml = Object.assign({}, _Directives.defaultYaml, yaml);
        this.tags = Object.assign({}, _Directives.defaultTags, tags);
      }
      clone() {
        const copy = new _Directives(this.yaml, this.tags);
        copy.docStart = this.docStart;
        return copy;
      }
      /**
       * During parsing, get a Directives instance for the current document and
       * update the stream state according to the current version's spec.
       */
      atDocument() {
        const res = new _Directives(this.yaml, this.tags);
        switch (this.yaml.version) {
          case "1.1":
            this.atNextDocument = true;
            break;
          case "1.2":
            this.atNextDocument = false;
            this.yaml = {
              explicit: _Directives.defaultYaml.explicit,
              version: "1.2"
            };
            this.tags = Object.assign({}, _Directives.defaultTags);
            break;
        }
        return res;
      }
      /**
       * @param onError - May be called even if the action was successful
       * @returns `true` on success
       */
      add(line, onError) {
        if (this.atNextDocument) {
          this.yaml = { explicit: _Directives.defaultYaml.explicit, version: "1.1" };
          this.tags = Object.assign({}, _Directives.defaultTags);
          this.atNextDocument = false;
        }
        const parts = line.trim().split(/[ \t]+/);
        const name = parts.shift();
        switch (name) {
          case "%TAG": {
            if (parts.length !== 2) {
              onError(0, "%TAG directive should contain exactly two parts");
              if (parts.length < 2)
                return false;
            }
            const [handle, prefix] = parts;
            this.tags[handle] = prefix;
            return true;
          }
          case "%YAML": {
            this.yaml.explicit = true;
            if (parts.length !== 1) {
              onError(0, "%YAML directive should contain exactly one part");
              return false;
            }
            const [version] = parts;
            if (version === "1.1" || version === "1.2") {
              this.yaml.version = version;
              return true;
            } else {
              const isValid = /^\d+\.\d+$/.test(version);
              onError(6, `Unsupported YAML version ${version}`, isValid);
              return false;
            }
          }
          default:
            onError(0, `Unknown directive ${name}`, true);
            return false;
        }
      }
      /**
       * Resolves a tag, matching handles to those defined in %TAG directives.
       *
       * @returns Resolved tag, which may also be the non-specific tag `'!'` or a
       *   `'!local'` tag, or `null` if unresolvable.
       */
      tagName(source, onError) {
        if (source === "!")
          return "!";
        if (source[0] !== "!") {
          onError(`Not a valid tag: ${source}`);
          return null;
        }
        if (source[1] === "<") {
          const verbatim = source.slice(2, -1);
          if (verbatim === "!" || verbatim === "!!") {
            onError(`Verbatim tags aren't resolved, so ${source} is invalid.`);
            return null;
          }
          if (source[source.length - 1] !== ">")
            onError("Verbatim tags must end with a >");
          return verbatim;
        }
        const [, handle, suffix] = source.match(/^(.*!)([^!]*)$/s);
        if (!suffix)
          onError(`The ${source} tag has no suffix`);
        const prefix = this.tags[handle];
        if (prefix) {
          try {
            return prefix + decodeURIComponent(suffix);
          } catch (error) {
            onError(String(error));
            return null;
          }
        }
        if (handle === "!")
          return source;
        onError(`Could not resolve tag: ${source}`);
        return null;
      }
      /**
       * Given a fully resolved tag, returns its printable string form,
       * taking into account current tag prefixes and defaults.
       */
      tagString(tag) {
        for (const [handle, prefix] of Object.entries(this.tags)) {
          if (tag.startsWith(prefix))
            return handle + escapeTagName(tag.substring(prefix.length));
        }
        return tag[0] === "!" ? tag : `!<${tag}>`;
      }
      toString(doc) {
        const lines = this.yaml.explicit ? [`%YAML ${this.yaml.version || "1.2"}`] : [];
        const tagEntries = Object.entries(this.tags);
        let tagNames;
        if (doc && tagEntries.length > 0 && identity.isNode(doc.contents)) {
          const tags = {};
          visit2.visit(doc.contents, (_key, node) => {
            if (identity.isNode(node) && node.tag)
              tags[node.tag] = true;
          });
          tagNames = Object.keys(tags);
        } else
          tagNames = [];
        for (const [handle, prefix] of tagEntries) {
          if (handle === "!!" && prefix === "tag:yaml.org,2002:")
            continue;
          if (!doc || tagNames.some((tn) => tn.startsWith(prefix)))
            lines.push(`%TAG ${handle} ${prefix}`);
        }
        return lines.join("\n");
      }
    };
    Directives.defaultYaml = { explicit: false, version: "1.2" };
    Directives.defaultTags = { "!!": "tag:yaml.org,2002:" };
    exports.Directives = Directives;
  }
});

// node_modules/yaml/dist/doc/anchors.js
var require_anchors = __commonJS({
  "node_modules/yaml/dist/doc/anchors.js"(exports) {
    "use strict";
    var identity = require_identity();
    var visit2 = require_visit();
    function anchorIsValid(anchor) {
      if (/[\x00-\x19\s,[\]{}]/.test(anchor)) {
        const sa = JSON.stringify(anchor);
        const msg = `Anchor must not contain whitespace or control characters: ${sa}`;
        throw new Error(msg);
      }
      return true;
    }
    function anchorNames(root) {
      const anchors = /* @__PURE__ */ new Set();
      visit2.visit(root, {
        Value(_key, node) {
          if (node.anchor)
            anchors.add(node.anchor);
        }
      });
      return anchors;
    }
    function findNewAnchor(prefix, exclude) {
      for (let i = 1; true; ++i) {
        const name = `${prefix}${i}`;
        if (!exclude.has(name))
          return name;
      }
    }
    function createNodeAnchors(doc, prefix) {
      const aliasObjects = [];
      const sourceObjects = /* @__PURE__ */ new Map();
      let prevAnchors = null;
      return {
        onAnchor: (source) => {
          aliasObjects.push(source);
          prevAnchors ?? (prevAnchors = anchorNames(doc));
          const anchor = findNewAnchor(prefix, prevAnchors);
          prevAnchors.add(anchor);
          return anchor;
        },
        /**
         * With circular references, the source node is only resolved after all
         * of its child nodes are. This is why anchors are set only after all of
         * the nodes have been created.
         */
        setAnchors: () => {
          for (const source of aliasObjects) {
            const ref = sourceObjects.get(source);
            if (typeof ref === "object" && ref.anchor && (identity.isScalar(ref.node) || identity.isCollection(ref.node))) {
              ref.node.anchor = ref.anchor;
            } else {
              const error = new Error("Failed to resolve repeated object (this should not happen)");
              error.source = source;
              throw error;
            }
          }
        },
        sourceObjects
      };
    }
    exports.anchorIsValid = anchorIsValid;
    exports.anchorNames = anchorNames;
    exports.createNodeAnchors = createNodeAnchors;
    exports.findNewAnchor = findNewAnchor;
  }
});

// node_modules/yaml/dist/doc/applyReviver.js
var require_applyReviver = __commonJS({
  "node_modules/yaml/dist/doc/applyReviver.js"(exports) {
    "use strict";
    function applyReviver(reviver, obj, key, val) {
      if (val && typeof val === "object") {
        if (Array.isArray(val)) {
          for (let i = 0, len = val.length; i < len; ++i) {
            const v0 = val[i];
            const v1 = applyReviver(reviver, val, String(i), v0);
            if (v1 === void 0)
              delete val[i];
            else if (v1 !== v0)
              val[i] = v1;
          }
        } else if (val instanceof Map) {
          for (const k of Array.from(val.keys())) {
            const v0 = val.get(k);
            const v1 = applyReviver(reviver, val, k, v0);
            if (v1 === void 0)
              val.delete(k);
            else if (v1 !== v0)
              val.set(k, v1);
          }
        } else if (val instanceof Set) {
          for (const v0 of Array.from(val)) {
            const v1 = applyReviver(reviver, val, v0, v0);
            if (v1 === void 0)
              val.delete(v0);
            else if (v1 !== v0) {
              val.delete(v0);
              val.add(v1);
            }
          }
        } else {
          for (const [k, v0] of Object.entries(val)) {
            const v1 = applyReviver(reviver, val, k, v0);
            if (v1 === void 0)
              delete val[k];
            else if (v1 !== v0)
              val[k] = v1;
          }
        }
      }
      return reviver.call(obj, key, val);
    }
    exports.applyReviver = applyReviver;
  }
});

// node_modules/yaml/dist/nodes/toJS.js
var require_toJS = __commonJS({
  "node_modules/yaml/dist/nodes/toJS.js"(exports) {
    "use strict";
    var identity = require_identity();
    function toJS(value, arg, ctx) {
      if (Array.isArray(value))
        return value.map((v, i) => toJS(v, String(i), ctx));
      if (value && typeof value.toJSON === "function") {
        if (!ctx || !identity.hasAnchor(value))
          return value.toJSON(arg, ctx);
        const data = { aliasCount: 0, count: 1, res: void 0 };
        ctx.anchors.set(value, data);
        ctx.onCreate = (res2) => {
          data.res = res2;
          delete ctx.onCreate;
        };
        const res = value.toJSON(arg, ctx);
        if (ctx.onCreate)
          ctx.onCreate(res);
        return res;
      }
      if (typeof value === "bigint" && !ctx?.keep)
        return Number(value);
      return value;
    }
    exports.toJS = toJS;
  }
});

// node_modules/yaml/dist/nodes/Node.js
var require_Node = __commonJS({
  "node_modules/yaml/dist/nodes/Node.js"(exports) {
    "use strict";
    var applyReviver = require_applyReviver();
    var identity = require_identity();
    var toJS = require_toJS();
    var NodeBase = class {
      constructor(type) {
        Object.defineProperty(this, identity.NODE_TYPE, { value: type });
      }
      /** Create a copy of this node.  */
      clone() {
        const copy = Object.create(Object.getPrototypeOf(this), Object.getOwnPropertyDescriptors(this));
        if (this.range)
          copy.range = this.range.slice();
        return copy;
      }
      /** A plain JavaScript representation of this node. */
      toJS(doc, { mapAsMap, maxAliasCount, onAnchor, reviver } = {}) {
        if (!identity.isDocument(doc))
          throw new TypeError("A document argument is required");
        const ctx = {
          anchors: /* @__PURE__ */ new Map(),
          doc,
          keep: true,
          mapAsMap: mapAsMap === true,
          mapKeyWarned: false,
          maxAliasCount: typeof maxAliasCount === "number" ? maxAliasCount : 100
        };
        const res = toJS.toJS(this, "", ctx);
        if (typeof onAnchor === "function")
          for (const { count, res: res2 } of ctx.anchors.values())
            onAnchor(res2, count);
        return typeof reviver === "function" ? applyReviver.applyReviver(reviver, { "": res }, "", res) : res;
      }
    };
    exports.NodeBase = NodeBase;
  }
});

// node_modules/yaml/dist/nodes/Alias.js
var require_Alias = __commonJS({
  "node_modules/yaml/dist/nodes/Alias.js"(exports) {
    "use strict";
    var anchors = require_anchors();
    var visit2 = require_visit();
    var identity = require_identity();
    var Node = require_Node();
    var toJS = require_toJS();
    var Alias = class extends Node.NodeBase {
      constructor(source) {
        super(identity.ALIAS);
        this.source = source;
        Object.defineProperty(this, "tag", {
          set() {
            throw new Error("Alias nodes cannot have tags");
          }
        });
      }
      /**
       * Resolve the value of this alias within `doc`, finding the last
       * instance of the `source` anchor before this node.
       */
      resolve(doc, ctx) {
        if (ctx?.maxAliasCount === 0)
          throw new ReferenceError("Alias resolution is disabled");
        let nodes;
        if (ctx?.aliasResolveCache) {
          nodes = ctx.aliasResolveCache;
        } else {
          nodes = [];
          visit2.visit(doc, {
            Node: (_key, node) => {
              if (identity.isAlias(node) || identity.hasAnchor(node))
                nodes.push(node);
            }
          });
          if (ctx)
            ctx.aliasResolveCache = nodes;
        }
        let found = void 0;
        for (const node of nodes) {
          if (node === this)
            break;
          if (node.anchor === this.source)
            found = node;
        }
        if (found && ctx) {
          const { anchors: anchors2, doc: doc2, maxAliasCount } = ctx;
          let data = anchors2.get(found);
          if (!data) {
            toJS.toJS(found, null, ctx);
            data = anchors2.get(found);
          }
          if (data?.res === void 0) {
            const msg = "This should not happen: Alias anchor was not resolved?";
            throw new ReferenceError(msg);
          }
          if (maxAliasCount >= 0) {
            data.count += 1;
            if (data.aliasCount === 0)
              data.aliasCount = getAliasCount(doc2, found, anchors2);
            if (data.count * data.aliasCount > maxAliasCount) {
              const msg = "Excessive alias count indicates a resource exhaustion attack";
              throw new ReferenceError(msg);
            }
          }
        }
        return found;
      }
      toJSON(_arg, ctx) {
        if (!ctx)
          return { source: this.source };
        const source = this.resolve(ctx.doc, ctx);
        if (!source) {
          const msg = `Unresolved alias (the anchor must be set before the alias): ${this.source}`;
          throw new ReferenceError(msg);
        }
        return ctx.anchors.get(source).res;
      }
      toString(ctx, _onComment, _onChompKeep) {
        const src = `*${this.source}`;
        if (ctx) {
          anchors.anchorIsValid(this.source);
          if (ctx.options.verifyAliasOrder && !ctx.anchors.has(this.source)) {
            const msg = `Unresolved alias (the anchor must be set before the alias): ${this.source}`;
            throw new Error(msg);
          }
          if (ctx.implicitKey)
            return `${src} `;
        }
        return src;
      }
    };
    function getAliasCount(doc, node, anchors2) {
      if (identity.isAlias(node)) {
        const source = node.resolve(doc);
        const anchor = anchors2 && source && anchors2.get(source);
        return anchor ? anchor.count * anchor.aliasCount : 0;
      } else if (identity.isCollection(node)) {
        let count = 0;
        for (const item of node.items) {
          const c = getAliasCount(doc, item, anchors2);
          if (c > count)
            count = c;
        }
        return count;
      } else if (identity.isPair(node)) {
        const kc = getAliasCount(doc, node.key, anchors2);
        const vc = getAliasCount(doc, node.value, anchors2);
        return Math.max(kc, vc);
      }
      return 1;
    }
    exports.Alias = Alias;
  }
});

// node_modules/yaml/dist/nodes/Scalar.js
var require_Scalar = __commonJS({
  "node_modules/yaml/dist/nodes/Scalar.js"(exports) {
    "use strict";
    var identity = require_identity();
    var Node = require_Node();
    var toJS = require_toJS();
    var isScalarValue = (value) => !value || typeof value !== "function" && typeof value !== "object";
    var Scalar = class extends Node.NodeBase {
      constructor(value) {
        super(identity.SCALAR);
        this.value = value;
      }
      toJSON(arg, ctx) {
        return ctx?.keep ? this.value : toJS.toJS(this.value, arg, ctx);
      }
      toString() {
        return String(this.value);
      }
    };
    Scalar.BLOCK_FOLDED = "BLOCK_FOLDED";
    Scalar.BLOCK_LITERAL = "BLOCK_LITERAL";
    Scalar.PLAIN = "PLAIN";
    Scalar.QUOTE_DOUBLE = "QUOTE_DOUBLE";
    Scalar.QUOTE_SINGLE = "QUOTE_SINGLE";
    exports.Scalar = Scalar;
    exports.isScalarValue = isScalarValue;
  }
});

// node_modules/yaml/dist/doc/createNode.js
var require_createNode = __commonJS({
  "node_modules/yaml/dist/doc/createNode.js"(exports) {
    "use strict";
    var Alias = require_Alias();
    var identity = require_identity();
    var Scalar = require_Scalar();
    var defaultTagPrefix = "tag:yaml.org,2002:";
    function findTagObject(value, tagName, tags) {
      if (tagName) {
        const match = tags.filter((t) => t.tag === tagName);
        const tagObj = match.find((t) => !t.format) ?? match[0];
        if (!tagObj)
          throw new Error(`Tag ${tagName} not found`);
        return tagObj;
      }
      return tags.find((t) => t.identify?.(value) && !t.format);
    }
    function createNode(value, tagName, ctx) {
      if (identity.isDocument(value))
        value = value.contents;
      if (identity.isNode(value))
        return value;
      if (identity.isPair(value)) {
        const map = ctx.schema[identity.MAP].createNode?.(ctx.schema, null, ctx);
        map.items.push(value);
        return map;
      }
      if (value instanceof String || value instanceof Number || value instanceof Boolean || typeof BigInt !== "undefined" && value instanceof BigInt) {
        value = value.valueOf();
      }
      const { aliasDuplicateObjects, onAnchor, onTagObj, schema, sourceObjects } = ctx;
      let ref = void 0;
      if (aliasDuplicateObjects && value && typeof value === "object") {
        ref = sourceObjects.get(value);
        if (ref) {
          ref.anchor ?? (ref.anchor = onAnchor(value));
          return new Alias.Alias(ref.anchor);
        } else {
          ref = { anchor: null, node: null };
          sourceObjects.set(value, ref);
        }
      }
      if (tagName?.startsWith("!!"))
        tagName = defaultTagPrefix + tagName.slice(2);
      let tagObj = findTagObject(value, tagName, schema.tags);
      if (!tagObj) {
        if (value && typeof value.toJSON === "function") {
          value = value.toJSON();
        }
        if (!value || typeof value !== "object") {
          const node2 = new Scalar.Scalar(value);
          if (ref)
            ref.node = node2;
          return node2;
        }
        tagObj = value instanceof Map ? schema[identity.MAP] : Symbol.iterator in Object(value) ? schema[identity.SEQ] : schema[identity.MAP];
      }
      if (onTagObj) {
        onTagObj(tagObj);
        delete ctx.onTagObj;
      }
      const node = tagObj?.createNode ? tagObj.createNode(ctx.schema, value, ctx) : typeof tagObj?.nodeClass?.from === "function" ? tagObj.nodeClass.from(ctx.schema, value, ctx) : new Scalar.Scalar(value);
      if (tagName)
        node.tag = tagName;
      else if (!tagObj.default)
        node.tag = tagObj.tag;
      if (ref)
        ref.node = node;
      return node;
    }
    exports.createNode = createNode;
  }
});

// node_modules/yaml/dist/nodes/Collection.js
var require_Collection = __commonJS({
  "node_modules/yaml/dist/nodes/Collection.js"(exports) {
    "use strict";
    var createNode = require_createNode();
    var identity = require_identity();
    var Node = require_Node();
    function collectionFromPath(schema, path8, value) {
      let v = value;
      for (let i = path8.length - 1; i >= 0; --i) {
        const k = path8[i];
        if (typeof k === "number" && Number.isInteger(k) && k >= 0) {
          const a = [];
          a[k] = v;
          v = a;
        } else {
          v = /* @__PURE__ */ new Map([[k, v]]);
        }
      }
      return createNode.createNode(v, void 0, {
        aliasDuplicateObjects: false,
        keepUndefined: false,
        onAnchor: () => {
          throw new Error("This should not happen, please report a bug.");
        },
        schema,
        sourceObjects: /* @__PURE__ */ new Map()
      });
    }
    var isEmptyPath = (path8) => path8 == null || typeof path8 === "object" && !!path8[Symbol.iterator]().next().done;
    var Collection = class extends Node.NodeBase {
      constructor(type, schema) {
        super(type);
        Object.defineProperty(this, "schema", {
          value: schema,
          configurable: true,
          enumerable: false,
          writable: true
        });
      }
      /**
       * Create a copy of this collection.
       *
       * @param schema - If defined, overwrites the original's schema
       */
      clone(schema) {
        const copy = Object.create(Object.getPrototypeOf(this), Object.getOwnPropertyDescriptors(this));
        if (schema)
          copy.schema = schema;
        copy.items = copy.items.map((it) => identity.isNode(it) || identity.isPair(it) ? it.clone(schema) : it);
        if (this.range)
          copy.range = this.range.slice();
        return copy;
      }
      /**
       * Adds a value to the collection. For `!!map` and `!!omap` the value must
       * be a Pair instance or a `{ key, value }` object, which may not have a key
       * that already exists in the map.
       */
      addIn(path8, value) {
        if (isEmptyPath(path8))
          this.add(value);
        else {
          const [key, ...rest] = path8;
          const node = this.get(key, true);
          if (identity.isCollection(node))
            node.addIn(rest, value);
          else if (node === void 0 && this.schema)
            this.set(key, collectionFromPath(this.schema, rest, value));
          else
            throw new Error(`Expected YAML collection at ${key}. Remaining path: ${rest}`);
        }
      }
      /**
       * Removes a value from the collection.
       * @returns `true` if the item was found and removed.
       */
      deleteIn(path8) {
        const [key, ...rest] = path8;
        if (rest.length === 0)
          return this.delete(key);
        const node = this.get(key, true);
        if (identity.isCollection(node))
          return node.deleteIn(rest);
        else
          throw new Error(`Expected YAML collection at ${key}. Remaining path: ${rest}`);
      }
      /**
       * Returns item at `key`, or `undefined` if not found. By default unwraps
       * scalar values from their surrounding node; to disable set `keepScalar` to
       * `true` (collections are always returned intact).
       */
      getIn(path8, keepScalar) {
        const [key, ...rest] = path8;
        const node = this.get(key, true);
        if (rest.length === 0)
          return !keepScalar && identity.isScalar(node) ? node.value : node;
        else
          return identity.isCollection(node) ? node.getIn(rest, keepScalar) : void 0;
      }
      hasAllNullValues(allowScalar) {
        return this.items.every((node) => {
          if (!identity.isPair(node))
            return false;
          const n = node.value;
          return n == null || allowScalar && identity.isScalar(n) && n.value == null && !n.commentBefore && !n.comment && !n.tag;
        });
      }
      /**
       * Checks if the collection includes a value with the key `key`.
       */
      hasIn(path8) {
        const [key, ...rest] = path8;
        if (rest.length === 0)
          return this.has(key);
        const node = this.get(key, true);
        return identity.isCollection(node) ? node.hasIn(rest) : false;
      }
      /**
       * Sets a value in this collection. For `!!set`, `value` needs to be a
       * boolean to add/remove the item from the set.
       */
      setIn(path8, value) {
        const [key, ...rest] = path8;
        if (rest.length === 0) {
          this.set(key, value);
        } else {
          const node = this.get(key, true);
          if (identity.isCollection(node))
            node.setIn(rest, value);
          else if (node === void 0 && this.schema)
            this.set(key, collectionFromPath(this.schema, rest, value));
          else
            throw new Error(`Expected YAML collection at ${key}. Remaining path: ${rest}`);
        }
      }
    };
    exports.Collection = Collection;
    exports.collectionFromPath = collectionFromPath;
    exports.isEmptyPath = isEmptyPath;
  }
});

// node_modules/yaml/dist/stringify/stringifyComment.js
var require_stringifyComment = __commonJS({
  "node_modules/yaml/dist/stringify/stringifyComment.js"(exports) {
    "use strict";
    var stringifyComment = (str) => str.replace(/^(?!$)(?: $)?/gm, "#");
    function indentComment(comment, indent) {
      if (/^\n+$/.test(comment))
        return comment.substring(1);
      return indent ? comment.replace(/^(?! *$)/gm, indent) : comment;
    }
    var lineComment = (str, indent, comment) => str.endsWith("\n") ? indentComment(comment, indent) : comment.includes("\n") ? "\n" + indentComment(comment, indent) : (str.endsWith(" ") ? "" : " ") + comment;
    exports.indentComment = indentComment;
    exports.lineComment = lineComment;
    exports.stringifyComment = stringifyComment;
  }
});

// node_modules/yaml/dist/stringify/foldFlowLines.js
var require_foldFlowLines = __commonJS({
  "node_modules/yaml/dist/stringify/foldFlowLines.js"(exports) {
    "use strict";
    var FOLD_FLOW = "flow";
    var FOLD_BLOCK = "block";
    var FOLD_QUOTED = "quoted";
    function foldFlowLines(text, indent, mode = "flow", { indentAtStart, lineWidth = 80, minContentWidth = 20, onFold, onOverflow } = {}) {
      if (!lineWidth || lineWidth < 0)
        return text;
      if (lineWidth < minContentWidth)
        minContentWidth = 0;
      const endStep = Math.max(1 + minContentWidth, 1 + lineWidth - indent.length);
      if (text.length <= endStep)
        return text;
      const folds = [];
      const escapedFolds = {};
      let end = lineWidth - indent.length;
      if (typeof indentAtStart === "number") {
        if (indentAtStart > lineWidth - Math.max(2, minContentWidth))
          folds.push(0);
        else
          end = lineWidth - indentAtStart;
      }
      let split = void 0;
      let prev = void 0;
      let overflow = false;
      let i = -1;
      let escStart = -1;
      let escEnd = -1;
      if (mode === FOLD_BLOCK) {
        i = consumeMoreIndentedLines(text, i, indent.length);
        if (i !== -1)
          end = i + endStep;
      }
      for (let ch; ch = text[i += 1]; ) {
        if (mode === FOLD_QUOTED && ch === "\\") {
          escStart = i;
          switch (text[i + 1]) {
            case "x":
              i += 3;
              break;
            case "u":
              i += 5;
              break;
            case "U":
              i += 9;
              break;
            default:
              i += 1;
          }
          escEnd = i;
        }
        if (ch === "\n") {
          if (mode === FOLD_BLOCK)
            i = consumeMoreIndentedLines(text, i, indent.length);
          end = i + indent.length + endStep;
          split = void 0;
        } else {
          if (ch === " " && prev && prev !== " " && prev !== "\n" && prev !== "	") {
            const next = text[i + 1];
            if (next && next !== " " && next !== "\n" && next !== "	")
              split = i;
          }
          if (i >= end) {
            if (split) {
              folds.push(split);
              end = split + endStep;
              split = void 0;
            } else if (mode === FOLD_QUOTED) {
              while (prev === " " || prev === "	") {
                prev = ch;
                ch = text[i += 1];
                overflow = true;
              }
              const j = i > escEnd + 1 ? i - 2 : escStart - 1;
              if (escapedFolds[j])
                return text;
              folds.push(j);
              escapedFolds[j] = true;
              end = j + endStep;
              split = void 0;
            } else {
              overflow = true;
            }
          }
        }
        prev = ch;
      }
      if (overflow && onOverflow)
        onOverflow();
      if (folds.length === 0)
        return text;
      if (onFold)
        onFold();
      let res = text.slice(0, folds[0]);
      for (let i2 = 0; i2 < folds.length; ++i2) {
        const fold = folds[i2];
        const end2 = folds[i2 + 1] || text.length;
        if (fold === 0)
          res = `
${indent}${text.slice(0, end2)}`;
        else {
          if (mode === FOLD_QUOTED && escapedFolds[fold])
            res += `${text[fold]}\\`;
          res += `
${indent}${text.slice(fold + 1, end2)}`;
        }
      }
      return res;
    }
    function consumeMoreIndentedLines(text, i, indent) {
      let end = i;
      let start = i + 1;
      let ch = text[start];
      while (ch === " " || ch === "	") {
        if (i < start + indent) {
          ch = text[++i];
        } else {
          do {
            ch = text[++i];
          } while (ch && ch !== "\n");
          end = i;
          start = i + 1;
          ch = text[start];
        }
      }
      return end;
    }
    exports.FOLD_BLOCK = FOLD_BLOCK;
    exports.FOLD_FLOW = FOLD_FLOW;
    exports.FOLD_QUOTED = FOLD_QUOTED;
    exports.foldFlowLines = foldFlowLines;
  }
});

// node_modules/yaml/dist/stringify/stringifyString.js
var require_stringifyString = __commonJS({
  "node_modules/yaml/dist/stringify/stringifyString.js"(exports) {
    "use strict";
    var Scalar = require_Scalar();
    var foldFlowLines = require_foldFlowLines();
    var getFoldOptions = (ctx, isBlock) => ({
      indentAtStart: isBlock ? ctx.indent.length : ctx.indentAtStart,
      lineWidth: ctx.options.lineWidth,
      minContentWidth: ctx.options.minContentWidth
    });
    var containsDocumentMarker = (str) => /^(%|---|\.\.\.)/m.test(str);
    function lineLengthOverLimit(str, lineWidth, indentLength) {
      if (!lineWidth || lineWidth < 0)
        return false;
      const limit = lineWidth - indentLength;
      const strLen = str.length;
      if (strLen <= limit)
        return false;
      for (let i = 0, start = 0; i < strLen; ++i) {
        if (str[i] === "\n") {
          if (i - start > limit)
            return true;
          start = i + 1;
          if (strLen - start <= limit)
            return false;
        }
      }
      return true;
    }
    function doubleQuotedString(value, ctx) {
      const json = JSON.stringify(value);
      if (ctx.options.doubleQuotedAsJSON)
        return json;
      const { implicitKey } = ctx;
      const minMultiLineLength = ctx.options.doubleQuotedMinMultiLineLength;
      const indent = ctx.indent || (containsDocumentMarker(value) ? "  " : "");
      let str = "";
      let start = 0;
      for (let i = 0, ch = json[i]; ch; ch = json[++i]) {
        if (ch === " " && json[i + 1] === "\\" && json[i + 2] === "n") {
          str += json.slice(start, i) + "\\ ";
          i += 1;
          start = i;
          ch = "\\";
        }
        if (ch === "\\")
          switch (json[i + 1]) {
            case "u":
              {
                str += json.slice(start, i);
                const code = json.substr(i + 2, 4);
                switch (code) {
                  case "0000":
                    str += "\\0";
                    break;
                  case "0007":
                    str += "\\a";
                    break;
                  case "000b":
                    str += "\\v";
                    break;
                  case "001b":
                    str += "\\e";
                    break;
                  case "0085":
                    str += "\\N";
                    break;
                  case "00a0":
                    str += "\\_";
                    break;
                  case "2028":
                    str += "\\L";
                    break;
                  case "2029":
                    str += "\\P";
                    break;
                  default:
                    if (code.substr(0, 2) === "00")
                      str += "\\x" + code.substr(2);
                    else
                      str += json.substr(i, 6);
                }
                i += 5;
                start = i + 1;
              }
              break;
            case "n":
              if (implicitKey || json[i + 2] === '"' || json.length < minMultiLineLength) {
                i += 1;
              } else {
                str += json.slice(start, i) + "\n\n";
                while (json[i + 2] === "\\" && json[i + 3] === "n" && json[i + 4] !== '"') {
                  str += "\n";
                  i += 2;
                }
                str += indent;
                if (json[i + 2] === " ")
                  str += "\\";
                i += 1;
                start = i + 1;
              }
              break;
            default:
              i += 1;
          }
      }
      str = start ? str + json.slice(start) : json;
      return implicitKey ? str : foldFlowLines.foldFlowLines(str, indent, foldFlowLines.FOLD_QUOTED, getFoldOptions(ctx, false));
    }
    function singleQuotedString(value, ctx) {
      if (ctx.options.singleQuote === false || ctx.implicitKey && value.includes("\n") || /[ \t]\n|\n[ \t]/.test(value))
        return doubleQuotedString(value, ctx);
      const indent = ctx.indent || (containsDocumentMarker(value) ? "  " : "");
      const res = "'" + value.replace(/'/g, "''").replace(/\n+/g, `$&
${indent}`) + "'";
      return ctx.implicitKey ? res : foldFlowLines.foldFlowLines(res, indent, foldFlowLines.FOLD_FLOW, getFoldOptions(ctx, false));
    }
    function quotedString(value, ctx) {
      const { singleQuote } = ctx.options;
      let qs;
      if (singleQuote === false)
        qs = doubleQuotedString;
      else {
        const hasDouble = value.includes('"');
        const hasSingle = value.includes("'");
        if (hasDouble && !hasSingle)
          qs = singleQuotedString;
        else if (hasSingle && !hasDouble)
          qs = doubleQuotedString;
        else
          qs = singleQuote ? singleQuotedString : doubleQuotedString;
      }
      return qs(value, ctx);
    }
    var blockEndNewlines;
    try {
      blockEndNewlines = new RegExp("(^|(?<!\n))\n+(?!\n|$)", "g");
    } catch {
      blockEndNewlines = /\n+(?!\n|$)/g;
    }
    function blockString({ comment, type, value }, ctx, onComment, onChompKeep) {
      const { blockQuote, commentString, lineWidth } = ctx.options;
      if (!blockQuote || /\n[\t ]+$/.test(value)) {
        return quotedString(value, ctx);
      }
      const indent = ctx.indent || (ctx.forceBlockIndent || containsDocumentMarker(value) ? "  " : "");
      const literal = blockQuote === "literal" ? true : blockQuote === "folded" || type === Scalar.Scalar.BLOCK_FOLDED ? false : type === Scalar.Scalar.BLOCK_LITERAL ? true : !lineLengthOverLimit(value, lineWidth, indent.length);
      if (!value)
        return literal ? "|\n" : ">\n";
      let chomp;
      let endStart;
      for (endStart = value.length; endStart > 0; --endStart) {
        const ch = value[endStart - 1];
        if (ch !== "\n" && ch !== "	" && ch !== " ")
          break;
      }
      let end = value.substring(endStart);
      const endNlPos = end.indexOf("\n");
      if (endNlPos === -1) {
        chomp = "-";
      } else if (value === end || endNlPos !== end.length - 1) {
        chomp = "+";
        if (onChompKeep)
          onChompKeep();
      } else {
        chomp = "";
      }
      if (end) {
        value = value.slice(0, -end.length);
        if (end[end.length - 1] === "\n")
          end = end.slice(0, -1);
        end = end.replace(blockEndNewlines, `$&${indent}`);
      }
      let startWithSpace = false;
      let startEnd;
      let startNlPos = -1;
      for (startEnd = 0; startEnd < value.length; ++startEnd) {
        const ch = value[startEnd];
        if (ch === " ")
          startWithSpace = true;
        else if (ch === "\n")
          startNlPos = startEnd;
        else
          break;
      }
      let start = value.substring(0, startNlPos < startEnd ? startNlPos + 1 : startEnd);
      if (start) {
        value = value.substring(start.length);
        start = start.replace(/\n+/g, `$&${indent}`);
      }
      const indentSize = indent ? "2" : "1";
      let header2 = (startWithSpace ? indentSize : "") + chomp;
      if (comment) {
        header2 += " " + commentString(comment.replace(/ ?[\r\n]+/g, " "));
        if (onComment)
          onComment();
      }
      if (!literal) {
        const foldedValue = value.replace(/\n+/g, "\n$&").replace(/(?:^|\n)([\t ].*)(?:([\n\t ]*)\n(?![\n\t ]))?/g, "$1$2").replace(/\n+/g, `$&${indent}`);
        let literalFallback = false;
        const foldOptions = getFoldOptions(ctx, true);
        if (blockQuote !== "folded" && type !== Scalar.Scalar.BLOCK_FOLDED) {
          foldOptions.onOverflow = () => {
            literalFallback = true;
          };
        }
        const body = foldFlowLines.foldFlowLines(`${start}${foldedValue}${end}`, indent, foldFlowLines.FOLD_BLOCK, foldOptions);
        if (!literalFallback)
          return `>${header2}
${indent}${body}`;
      }
      value = value.replace(/\n+/g, `$&${indent}`);
      return `|${header2}
${indent}${start}${value}${end}`;
    }
    function plainString(item, ctx, onComment, onChompKeep) {
      const { type, value } = item;
      const { actualString, implicitKey, indent, indentStep, inFlow } = ctx;
      if (implicitKey && value.includes("\n") || inFlow && /[[\]{},]/.test(value)) {
        return quotedString(value, ctx);
      }
      if (/^[\n\t ,[\]{}#&*!|>'"%@`]|^[?-]$|^[?-][ \t]|[\n:][ \t]|[ \t]\n|[\n\t ]#|[\n\t :]$/.test(value)) {
        return implicitKey || inFlow || !value.includes("\n") ? quotedString(value, ctx) : blockString(item, ctx, onComment, onChompKeep);
      }
      if (!implicitKey && !inFlow && type !== Scalar.Scalar.PLAIN && value.includes("\n")) {
        return blockString(item, ctx, onComment, onChompKeep);
      }
      if (containsDocumentMarker(value)) {
        if (indent === "") {
          ctx.forceBlockIndent = true;
          return blockString(item, ctx, onComment, onChompKeep);
        } else if (implicitKey && indent === indentStep) {
          return quotedString(value, ctx);
        }
      }
      const str = value.replace(/\n+/g, `$&
${indent}`);
      if (actualString) {
        const test = (tag) => tag.default && tag.tag !== "tag:yaml.org,2002:str" && tag.test?.test(str);
        const { compat, tags } = ctx.doc.schema;
        if (tags.some(test) || compat?.some(test))
          return quotedString(value, ctx);
      }
      return implicitKey ? str : foldFlowLines.foldFlowLines(str, indent, foldFlowLines.FOLD_FLOW, getFoldOptions(ctx, false));
    }
    function stringifyString(item, ctx, onComment, onChompKeep) {
      const { implicitKey, inFlow } = ctx;
      const ss = typeof item.value === "string" ? item : Object.assign({}, item, { value: String(item.value) });
      let { type } = item;
      if (type !== Scalar.Scalar.QUOTE_DOUBLE) {
        if (/[\x00-\x08\x0b-\x1f\x7f-\x9f\u{D800}-\u{DFFF}]/u.test(ss.value))
          type = Scalar.Scalar.QUOTE_DOUBLE;
      }
      const _stringify = (_type) => {
        switch (_type) {
          case Scalar.Scalar.BLOCK_FOLDED:
          case Scalar.Scalar.BLOCK_LITERAL:
            return implicitKey || inFlow ? quotedString(ss.value, ctx) : blockString(ss, ctx, onComment, onChompKeep);
          case Scalar.Scalar.QUOTE_DOUBLE:
            return doubleQuotedString(ss.value, ctx);
          case Scalar.Scalar.QUOTE_SINGLE:
            return singleQuotedString(ss.value, ctx);
          case Scalar.Scalar.PLAIN:
            return plainString(ss, ctx, onComment, onChompKeep);
          default:
            return null;
        }
      };
      let res = _stringify(type);
      if (res === null) {
        const { defaultKeyType, defaultStringType } = ctx.options;
        const t = implicitKey && defaultKeyType || defaultStringType;
        res = _stringify(t);
        if (res === null)
          throw new Error(`Unsupported default string type ${t}`);
      }
      return res;
    }
    exports.stringifyString = stringifyString;
  }
});

// node_modules/yaml/dist/stringify/stringify.js
var require_stringify = __commonJS({
  "node_modules/yaml/dist/stringify/stringify.js"(exports) {
    "use strict";
    var anchors = require_anchors();
    var identity = require_identity();
    var stringifyComment = require_stringifyComment();
    var stringifyString = require_stringifyString();
    function createStringifyContext(doc, options) {
      const opt = Object.assign({
        blockQuote: true,
        commentString: stringifyComment.stringifyComment,
        defaultKeyType: null,
        defaultStringType: "PLAIN",
        directives: null,
        doubleQuotedAsJSON: false,
        doubleQuotedMinMultiLineLength: 40,
        falseStr: "false",
        flowCollectionPadding: true,
        indentSeq: true,
        lineWidth: 80,
        minContentWidth: 20,
        nullStr: "null",
        simpleKeys: false,
        singleQuote: null,
        trailingComma: false,
        trueStr: "true",
        verifyAliasOrder: true
      }, doc.schema.toStringOptions, options);
      let inFlow;
      switch (opt.collectionStyle) {
        case "block":
          inFlow = false;
          break;
        case "flow":
          inFlow = true;
          break;
        default:
          inFlow = null;
      }
      return {
        anchors: /* @__PURE__ */ new Set(),
        doc,
        flowCollectionPadding: opt.flowCollectionPadding ? " " : "",
        indent: "",
        indentStep: typeof opt.indent === "number" ? " ".repeat(opt.indent) : "  ",
        inFlow,
        options: opt
      };
    }
    function getTagObject(tags, item) {
      if (item.tag) {
        const match = tags.filter((t) => t.tag === item.tag);
        if (match.length > 0)
          return match.find((t) => t.format === item.format) ?? match[0];
      }
      let tagObj = void 0;
      let obj;
      if (identity.isScalar(item)) {
        obj = item.value;
        let match = tags.filter((t) => t.identify?.(obj));
        if (match.length > 1) {
          const testMatch = match.filter((t) => t.test);
          if (testMatch.length > 0)
            match = testMatch;
        }
        tagObj = match.find((t) => t.format === item.format) ?? match.find((t) => !t.format);
      } else {
        obj = item;
        tagObj = tags.find((t) => t.nodeClass && obj instanceof t.nodeClass);
      }
      if (!tagObj) {
        const name = obj?.constructor?.name ?? (obj === null ? "null" : typeof obj);
        throw new Error(`Tag not resolved for ${name} value`);
      }
      return tagObj;
    }
    function stringifyProps(node, tagObj, { anchors: anchors$1, doc }) {
      if (!doc.directives)
        return "";
      const props = [];
      const anchor = (identity.isScalar(node) || identity.isCollection(node)) && node.anchor;
      if (anchor && anchors.anchorIsValid(anchor)) {
        anchors$1.add(anchor);
        props.push(`&${anchor}`);
      }
      const tag = node.tag ?? (tagObj.default ? null : tagObj.tag);
      if (tag)
        props.push(doc.directives.tagString(tag));
      return props.join(" ");
    }
    function stringify(item, ctx, onComment, onChompKeep) {
      if (identity.isPair(item))
        return item.toString(ctx, onComment, onChompKeep);
      if (identity.isAlias(item)) {
        if (ctx.doc.directives)
          return item.toString(ctx);
        if (ctx.resolvedAliases?.has(item)) {
          throw new TypeError(`Cannot stringify circular structure without alias nodes`);
        } else {
          if (ctx.resolvedAliases)
            ctx.resolvedAliases.add(item);
          else
            ctx.resolvedAliases = /* @__PURE__ */ new Set([item]);
          item = item.resolve(ctx.doc);
        }
      }
      let tagObj = void 0;
      const node = identity.isNode(item) ? item : ctx.doc.createNode(item, { onTagObj: (o) => tagObj = o });
      tagObj ?? (tagObj = getTagObject(ctx.doc.schema.tags, node));
      const props = stringifyProps(node, tagObj, ctx);
      if (props.length > 0)
        ctx.indentAtStart = (ctx.indentAtStart ?? 0) + props.length + 1;
      const str = typeof tagObj.stringify === "function" ? tagObj.stringify(node, ctx, onComment, onChompKeep) : identity.isScalar(node) ? stringifyString.stringifyString(node, ctx, onComment, onChompKeep) : node.toString(ctx, onComment, onChompKeep);
      if (!props)
        return str;
      return identity.isScalar(node) || str[0] === "{" || str[0] === "[" ? `${props} ${str}` : `${props}
${ctx.indent}${str}`;
    }
    exports.createStringifyContext = createStringifyContext;
    exports.stringify = stringify;
  }
});

// node_modules/yaml/dist/stringify/stringifyPair.js
var require_stringifyPair = __commonJS({
  "node_modules/yaml/dist/stringify/stringifyPair.js"(exports) {
    "use strict";
    var identity = require_identity();
    var Scalar = require_Scalar();
    var stringify = require_stringify();
    var stringifyComment = require_stringifyComment();
    function stringifyPair({ key, value }, ctx, onComment, onChompKeep) {
      const { allNullValues, doc, indent, indentStep, options: { commentString, indentSeq, simpleKeys } } = ctx;
      let keyComment = identity.isNode(key) && key.comment || null;
      if (simpleKeys) {
        if (keyComment) {
          throw new Error("With simple keys, key nodes cannot have comments");
        }
        if (identity.isCollection(key) || !identity.isNode(key) && typeof key === "object") {
          const msg = "With simple keys, collection cannot be used as a key value";
          throw new Error(msg);
        }
      }
      let explicitKey = !simpleKeys && (!key || keyComment && value == null && !ctx.inFlow || identity.isCollection(key) || (identity.isScalar(key) ? key.type === Scalar.Scalar.BLOCK_FOLDED || key.type === Scalar.Scalar.BLOCK_LITERAL : typeof key === "object"));
      ctx = Object.assign({}, ctx, {
        allNullValues: false,
        implicitKey: !explicitKey && (simpleKeys || !allNullValues),
        indent: indent + indentStep
      });
      let keyCommentDone = false;
      let chompKeep = false;
      let str = stringify.stringify(key, ctx, () => keyCommentDone = true, () => chompKeep = true);
      if (!explicitKey && !ctx.inFlow && str.length > 1024) {
        if (simpleKeys)
          throw new Error("With simple keys, single line scalar must not span more than 1024 characters");
        explicitKey = true;
      }
      if (ctx.inFlow) {
        if (allNullValues || value == null) {
          if (keyCommentDone && onComment)
            onComment();
          return str === "" ? "?" : explicitKey ? `? ${str}` : str;
        }
      } else if (allNullValues && !simpleKeys || value == null && explicitKey) {
        str = `? ${str}`;
        if (keyComment && !keyCommentDone) {
          str += stringifyComment.lineComment(str, ctx.indent, commentString(keyComment));
        } else if (chompKeep && onChompKeep)
          onChompKeep();
        return str;
      }
      if (keyCommentDone)
        keyComment = null;
      if (explicitKey) {
        if (keyComment)
          str += stringifyComment.lineComment(str, ctx.indent, commentString(keyComment));
        str = `? ${str}
${indent}:`;
      } else {
        str = `${str}:`;
        if (keyComment)
          str += stringifyComment.lineComment(str, ctx.indent, commentString(keyComment));
      }
      let vsb, vcb, valueComment;
      if (identity.isNode(value)) {
        vsb = !!value.spaceBefore;
        vcb = value.commentBefore;
        valueComment = value.comment;
      } else {
        vsb = false;
        vcb = null;
        valueComment = null;
        if (value && typeof value === "object")
          value = doc.createNode(value);
      }
      ctx.implicitKey = false;
      if (!explicitKey && !keyComment && identity.isScalar(value))
        ctx.indentAtStart = str.length + 1;
      chompKeep = false;
      if (!indentSeq && indentStep.length >= 2 && !ctx.inFlow && !explicitKey && identity.isSeq(value) && !value.flow && !value.tag && !value.anchor) {
        ctx.indent = ctx.indent.substring(2);
      }
      let valueCommentDone = false;
      const valueStr = stringify.stringify(value, ctx, () => valueCommentDone = true, () => chompKeep = true);
      let ws = " ";
      if (keyComment || vsb || vcb) {
        ws = vsb ? "\n" : "";
        if (vcb) {
          const cs = commentString(vcb);
          ws += `
${stringifyComment.indentComment(cs, ctx.indent)}`;
        }
        if (valueStr === "" && !ctx.inFlow) {
          if (ws === "\n" && valueComment)
            ws = "\n\n";
        } else {
          ws += `
${ctx.indent}`;
        }
      } else if (!explicitKey && identity.isCollection(value)) {
        const vs0 = valueStr[0];
        const nl0 = valueStr.indexOf("\n");
        const hasNewline = nl0 !== -1;
        const flow = ctx.inFlow ?? value.flow ?? value.items.length === 0;
        if (hasNewline || !flow) {
          let hasPropsLine = false;
          if (hasNewline && (vs0 === "&" || vs0 === "!")) {
            let sp0 = valueStr.indexOf(" ");
            if (vs0 === "&" && sp0 !== -1 && sp0 < nl0 && valueStr[sp0 + 1] === "!") {
              sp0 = valueStr.indexOf(" ", sp0 + 1);
            }
            if (sp0 === -1 || nl0 < sp0)
              hasPropsLine = true;
          }
          if (!hasPropsLine)
            ws = `
${ctx.indent}`;
        }
      } else if (valueStr === "" || valueStr[0] === "\n") {
        ws = "";
      }
      str += ws + valueStr;
      if (ctx.inFlow) {
        if (valueCommentDone && onComment)
          onComment();
      } else if (valueComment && !valueCommentDone) {
        str += stringifyComment.lineComment(str, ctx.indent, commentString(valueComment));
      } else if (chompKeep && onChompKeep) {
        onChompKeep();
      }
      return str;
    }
    exports.stringifyPair = stringifyPair;
  }
});

// node_modules/yaml/dist/log.js
var require_log = __commonJS({
  "node_modules/yaml/dist/log.js"(exports) {
    "use strict";
    var node_process = __require("process");
    function debug(logLevel, ...messages) {
      if (logLevel === "debug")
        console.log(...messages);
    }
    function warn(logLevel, warning) {
      if (logLevel === "debug" || logLevel === "warn") {
        if (typeof node_process.emitWarning === "function")
          node_process.emitWarning(warning);
        else
          console.warn(warning);
      }
    }
    exports.debug = debug;
    exports.warn = warn;
  }
});

// node_modules/yaml/dist/schema/yaml-1.1/merge.js
var require_merge = __commonJS({
  "node_modules/yaml/dist/schema/yaml-1.1/merge.js"(exports) {
    "use strict";
    var identity = require_identity();
    var Scalar = require_Scalar();
    var MERGE_KEY = "<<";
    var merge = {
      identify: (value) => value === MERGE_KEY || typeof value === "symbol" && value.description === MERGE_KEY,
      default: "key",
      tag: "tag:yaml.org,2002:merge",
      test: /^<<$/,
      resolve: () => Object.assign(new Scalar.Scalar(Symbol(MERGE_KEY)), {
        addToJSMap: addMergeToJSMap
      }),
      stringify: () => MERGE_KEY
    };
    var isMergeKey = (ctx, key) => (merge.identify(key) || identity.isScalar(key) && (!key.type || key.type === Scalar.Scalar.PLAIN) && merge.identify(key.value)) && ctx?.doc.schema.tags.some((tag) => tag.tag === merge.tag && tag.default);
    function addMergeToJSMap(ctx, map, value) {
      const source = resolveAliasValue(ctx, value);
      if (identity.isSeq(source))
        for (const it of source.items)
          mergeValue(ctx, map, it);
      else if (Array.isArray(source))
        for (const it of source)
          mergeValue(ctx, map, it);
      else
        mergeValue(ctx, map, source);
    }
    function mergeValue(ctx, map, value) {
      const source = resolveAliasValue(ctx, value);
      if (!identity.isMap(source))
        throw new Error("Merge sources must be maps or map aliases");
      const srcMap = source.toJSON(null, ctx, Map);
      for (const [key, value2] of srcMap) {
        if (map instanceof Map) {
          if (!map.has(key))
            map.set(key, value2);
        } else if (map instanceof Set) {
          map.add(key);
        } else if (!Object.prototype.hasOwnProperty.call(map, key)) {
          Object.defineProperty(map, key, {
            value: value2,
            writable: true,
            enumerable: true,
            configurable: true
          });
        }
      }
      return map;
    }
    function resolveAliasValue(ctx, value) {
      return ctx && identity.isAlias(value) ? value.resolve(ctx.doc, ctx) : value;
    }
    exports.addMergeToJSMap = addMergeToJSMap;
    exports.isMergeKey = isMergeKey;
    exports.merge = merge;
  }
});

// node_modules/yaml/dist/nodes/addPairToJSMap.js
var require_addPairToJSMap = __commonJS({
  "node_modules/yaml/dist/nodes/addPairToJSMap.js"(exports) {
    "use strict";
    var log2 = require_log();
    var merge = require_merge();
    var stringify = require_stringify();
    var identity = require_identity();
    var toJS = require_toJS();
    function addPairToJSMap(ctx, map, { key, value }) {
      if (identity.isNode(key) && key.addToJSMap)
        key.addToJSMap(ctx, map, value);
      else if (merge.isMergeKey(ctx, key))
        merge.addMergeToJSMap(ctx, map, value);
      else {
        const jsKey = toJS.toJS(key, "", ctx);
        if (map instanceof Map) {
          map.set(jsKey, toJS.toJS(value, jsKey, ctx));
        } else if (map instanceof Set) {
          map.add(jsKey);
        } else {
          const stringKey = stringifyKey(key, jsKey, ctx);
          const jsValue = toJS.toJS(value, stringKey, ctx);
          if (stringKey in map)
            Object.defineProperty(map, stringKey, {
              value: jsValue,
              writable: true,
              enumerable: true,
              configurable: true
            });
          else
            map[stringKey] = jsValue;
        }
      }
      return map;
    }
    function stringifyKey(key, jsKey, ctx) {
      if (jsKey === null)
        return "";
      if (typeof jsKey !== "object")
        return String(jsKey);
      if (identity.isNode(key) && ctx?.doc) {
        const strCtx = stringify.createStringifyContext(ctx.doc, {});
        strCtx.anchors = /* @__PURE__ */ new Set();
        for (const node of ctx.anchors.keys())
          strCtx.anchors.add(node.anchor);
        strCtx.inFlow = true;
        strCtx.inStringifyKey = true;
        const strKey = key.toString(strCtx);
        if (!ctx.mapKeyWarned) {
          let jsonStr = JSON.stringify(strKey);
          if (jsonStr.length > 40)
            jsonStr = jsonStr.substring(0, 36) + '..."';
          log2.warn(ctx.doc.options.logLevel, `Keys with collection values will be stringified due to JS Object restrictions: ${jsonStr}. Set mapAsMap: true to use object keys.`);
          ctx.mapKeyWarned = true;
        }
        return strKey;
      }
      return JSON.stringify(jsKey);
    }
    exports.addPairToJSMap = addPairToJSMap;
  }
});

// node_modules/yaml/dist/nodes/Pair.js
var require_Pair = __commonJS({
  "node_modules/yaml/dist/nodes/Pair.js"(exports) {
    "use strict";
    var createNode = require_createNode();
    var stringifyPair = require_stringifyPair();
    var addPairToJSMap = require_addPairToJSMap();
    var identity = require_identity();
    function createPair(key, value, ctx) {
      const k = createNode.createNode(key, void 0, ctx);
      const v = createNode.createNode(value, void 0, ctx);
      return new Pair(k, v);
    }
    var Pair = class _Pair {
      constructor(key, value = null) {
        Object.defineProperty(this, identity.NODE_TYPE, { value: identity.PAIR });
        this.key = key;
        this.value = value;
      }
      clone(schema) {
        let { key, value } = this;
        if (identity.isNode(key))
          key = key.clone(schema);
        if (identity.isNode(value))
          value = value.clone(schema);
        return new _Pair(key, value);
      }
      toJSON(_, ctx) {
        const pair = ctx?.mapAsMap ? /* @__PURE__ */ new Map() : {};
        return addPairToJSMap.addPairToJSMap(ctx, pair, this);
      }
      toString(ctx, onComment, onChompKeep) {
        return ctx?.doc ? stringifyPair.stringifyPair(this, ctx, onComment, onChompKeep) : JSON.stringify(this);
      }
    };
    exports.Pair = Pair;
    exports.createPair = createPair;
  }
});

// node_modules/yaml/dist/stringify/stringifyCollection.js
var require_stringifyCollection = __commonJS({
  "node_modules/yaml/dist/stringify/stringifyCollection.js"(exports) {
    "use strict";
    var identity = require_identity();
    var stringify = require_stringify();
    var stringifyComment = require_stringifyComment();
    function stringifyCollection(collection, ctx, options) {
      const flow = ctx.inFlow ?? collection.flow;
      const stringify2 = flow ? stringifyFlowCollection : stringifyBlockCollection;
      return stringify2(collection, ctx, options);
    }
    function stringifyBlockCollection({ comment, items }, ctx, { blockItemPrefix, flowChars, itemIndent, onChompKeep, onComment }) {
      const { indent, options: { commentString } } = ctx;
      const itemCtx = Object.assign({}, ctx, { indent: itemIndent, type: null });
      let chompKeep = false;
      const lines = [];
      for (let i = 0; i < items.length; ++i) {
        const item = items[i];
        let comment2 = null;
        if (identity.isNode(item)) {
          if (!chompKeep && item.spaceBefore)
            lines.push("");
          addCommentBefore(ctx, lines, item.commentBefore, chompKeep);
          if (item.comment)
            comment2 = item.comment;
        } else if (identity.isPair(item)) {
          const ik = identity.isNode(item.key) ? item.key : null;
          if (ik) {
            if (!chompKeep && ik.spaceBefore)
              lines.push("");
            addCommentBefore(ctx, lines, ik.commentBefore, chompKeep);
          }
        }
        chompKeep = false;
        let str2 = stringify.stringify(item, itemCtx, () => comment2 = null, () => chompKeep = true);
        if (comment2)
          str2 += stringifyComment.lineComment(str2, itemIndent, commentString(comment2));
        if (chompKeep && comment2)
          chompKeep = false;
        lines.push(blockItemPrefix + str2);
      }
      let str;
      if (lines.length === 0) {
        str = flowChars.start + flowChars.end;
      } else {
        str = lines[0];
        for (let i = 1; i < lines.length; ++i) {
          const line = lines[i];
          str += line ? `
${indent}${line}` : "\n";
        }
      }
      if (comment) {
        str += "\n" + stringifyComment.indentComment(commentString(comment), indent);
        if (onComment)
          onComment();
      } else if (chompKeep && onChompKeep)
        onChompKeep();
      return str;
    }
    function stringifyFlowCollection({ items }, ctx, { flowChars, itemIndent }) {
      const { indent, indentStep, flowCollectionPadding: fcPadding, options: { commentString } } = ctx;
      itemIndent += indentStep;
      const itemCtx = Object.assign({}, ctx, {
        indent: itemIndent,
        inFlow: true,
        type: null
      });
      let reqNewline = false;
      let linesAtValue = 0;
      const lines = [];
      for (let i = 0; i < items.length; ++i) {
        const item = items[i];
        let comment = null;
        if (identity.isNode(item)) {
          if (item.spaceBefore)
            lines.push("");
          addCommentBefore(ctx, lines, item.commentBefore, false);
          if (item.comment)
            comment = item.comment;
        } else if (identity.isPair(item)) {
          const ik = identity.isNode(item.key) ? item.key : null;
          if (ik) {
            if (ik.spaceBefore)
              lines.push("");
            addCommentBefore(ctx, lines, ik.commentBefore, false);
            if (ik.comment)
              reqNewline = true;
          }
          const iv = identity.isNode(item.value) ? item.value : null;
          if (iv) {
            if (iv.comment)
              comment = iv.comment;
            if (iv.commentBefore)
              reqNewline = true;
          } else if (item.value == null && ik?.comment) {
            comment = ik.comment;
          }
        }
        if (comment)
          reqNewline = true;
        let str = stringify.stringify(item, itemCtx, () => comment = null);
        reqNewline || (reqNewline = lines.length > linesAtValue || str.includes("\n"));
        if (i < items.length - 1) {
          str += ",";
        } else if (ctx.options.trailingComma) {
          if (ctx.options.lineWidth > 0) {
            reqNewline || (reqNewline = lines.reduce((sum, line) => sum + line.length + 2, 2) + (str.length + 2) > ctx.options.lineWidth);
          }
          if (reqNewline) {
            str += ",";
          }
        }
        if (comment)
          str += stringifyComment.lineComment(str, itemIndent, commentString(comment));
        lines.push(str);
        linesAtValue = lines.length;
      }
      const { start, end } = flowChars;
      if (lines.length === 0) {
        return start + end;
      } else {
        if (!reqNewline) {
          const len = lines.reduce((sum, line) => sum + line.length + 2, 2);
          reqNewline = ctx.options.lineWidth > 0 && len > ctx.options.lineWidth;
        }
        if (reqNewline) {
          let str = start;
          for (const line of lines)
            str += line ? `
${indentStep}${indent}${line}` : "\n";
          return `${str}
${indent}${end}`;
        } else {
          return `${start}${fcPadding}${lines.join(" ")}${fcPadding}${end}`;
        }
      }
    }
    function addCommentBefore({ indent, options: { commentString } }, lines, comment, chompKeep) {
      if (comment && chompKeep)
        comment = comment.replace(/^\n+/, "");
      if (comment) {
        const ic = stringifyComment.indentComment(commentString(comment), indent);
        lines.push(ic.trimStart());
      }
    }
    exports.stringifyCollection = stringifyCollection;
  }
});

// node_modules/yaml/dist/nodes/YAMLMap.js
var require_YAMLMap = __commonJS({
  "node_modules/yaml/dist/nodes/YAMLMap.js"(exports) {
    "use strict";
    var stringifyCollection = require_stringifyCollection();
    var addPairToJSMap = require_addPairToJSMap();
    var Collection = require_Collection();
    var identity = require_identity();
    var Pair = require_Pair();
    var Scalar = require_Scalar();
    function findPair(items, key) {
      const k = identity.isScalar(key) ? key.value : key;
      for (const it of items) {
        if (identity.isPair(it)) {
          if (it.key === key || it.key === k)
            return it;
          if (identity.isScalar(it.key) && it.key.value === k)
            return it;
        }
      }
      return void 0;
    }
    var YAMLMap = class extends Collection.Collection {
      static get tagName() {
        return "tag:yaml.org,2002:map";
      }
      constructor(schema) {
        super(identity.MAP, schema);
        this.items = [];
      }
      /**
       * A generic collection parsing method that can be extended
       * to other node classes that inherit from YAMLMap
       */
      static from(schema, obj, ctx) {
        const { keepUndefined, replacer } = ctx;
        const map = new this(schema);
        const add = (key, value) => {
          if (typeof replacer === "function")
            value = replacer.call(obj, key, value);
          else if (Array.isArray(replacer) && !replacer.includes(key))
            return;
          if (value !== void 0 || keepUndefined)
            map.items.push(Pair.createPair(key, value, ctx));
        };
        if (obj instanceof Map) {
          for (const [key, value] of obj)
            add(key, value);
        } else if (obj && typeof obj === "object") {
          for (const key of Object.keys(obj))
            add(key, obj[key]);
        }
        if (typeof schema.sortMapEntries === "function") {
          map.items.sort(schema.sortMapEntries);
        }
        return map;
      }
      /**
       * Adds a value to the collection.
       *
       * @param overwrite - If not set `true`, using a key that is already in the
       *   collection will throw. Otherwise, overwrites the previous value.
       */
      add(pair, overwrite) {
        let _pair;
        if (identity.isPair(pair))
          _pair = pair;
        else if (!pair || typeof pair !== "object" || !("key" in pair)) {
          _pair = new Pair.Pair(pair, pair?.value);
        } else
          _pair = new Pair.Pair(pair.key, pair.value);
        const prev = findPair(this.items, _pair.key);
        const sortEntries = this.schema?.sortMapEntries;
        if (prev) {
          if (!overwrite)
            throw new Error(`Key ${_pair.key} already set`);
          if (identity.isScalar(prev.value) && Scalar.isScalarValue(_pair.value))
            prev.value.value = _pair.value;
          else
            prev.value = _pair.value;
        } else if (sortEntries) {
          const i = this.items.findIndex((item) => sortEntries(_pair, item) < 0);
          if (i === -1)
            this.items.push(_pair);
          else
            this.items.splice(i, 0, _pair);
        } else {
          this.items.push(_pair);
        }
      }
      delete(key) {
        const it = findPair(this.items, key);
        if (!it)
          return false;
        const del = this.items.splice(this.items.indexOf(it), 1);
        return del.length > 0;
      }
      get(key, keepScalar) {
        const it = findPair(this.items, key);
        const node = it?.value;
        return (!keepScalar && identity.isScalar(node) ? node.value : node) ?? void 0;
      }
      has(key) {
        return !!findPair(this.items, key);
      }
      set(key, value) {
        this.add(new Pair.Pair(key, value), true);
      }
      /**
       * @param ctx - Conversion context, originally set in Document#toJS()
       * @param {Class} Type - If set, forces the returned collection type
       * @returns Instance of Type, Map, or Object
       */
      toJSON(_, ctx, Type) {
        const map = Type ? new Type() : ctx?.mapAsMap ? /* @__PURE__ */ new Map() : {};
        if (ctx?.onCreate)
          ctx.onCreate(map);
        for (const item of this.items)
          addPairToJSMap.addPairToJSMap(ctx, map, item);
        return map;
      }
      toString(ctx, onComment, onChompKeep) {
        if (!ctx)
          return JSON.stringify(this);
        for (const item of this.items) {
          if (!identity.isPair(item))
            throw new Error(`Map items must all be pairs; found ${JSON.stringify(item)} instead`);
        }
        if (!ctx.allNullValues && this.hasAllNullValues(false))
          ctx = Object.assign({}, ctx, { allNullValues: true });
        return stringifyCollection.stringifyCollection(this, ctx, {
          blockItemPrefix: "",
          flowChars: { start: "{", end: "}" },
          itemIndent: ctx.indent || "",
          onChompKeep,
          onComment
        });
      }
    };
    exports.YAMLMap = YAMLMap;
    exports.findPair = findPair;
  }
});

// node_modules/yaml/dist/schema/common/map.js
var require_map = __commonJS({
  "node_modules/yaml/dist/schema/common/map.js"(exports) {
    "use strict";
    var identity = require_identity();
    var YAMLMap = require_YAMLMap();
    var map = {
      collection: "map",
      default: true,
      nodeClass: YAMLMap.YAMLMap,
      tag: "tag:yaml.org,2002:map",
      resolve(map2, onError) {
        if (!identity.isMap(map2))
          onError("Expected a mapping for this tag");
        return map2;
      },
      createNode: (schema, obj, ctx) => YAMLMap.YAMLMap.from(schema, obj, ctx)
    };
    exports.map = map;
  }
});

// node_modules/yaml/dist/nodes/YAMLSeq.js
var require_YAMLSeq = __commonJS({
  "node_modules/yaml/dist/nodes/YAMLSeq.js"(exports) {
    "use strict";
    var createNode = require_createNode();
    var stringifyCollection = require_stringifyCollection();
    var Collection = require_Collection();
    var identity = require_identity();
    var Scalar = require_Scalar();
    var toJS = require_toJS();
    var YAMLSeq = class extends Collection.Collection {
      static get tagName() {
        return "tag:yaml.org,2002:seq";
      }
      constructor(schema) {
        super(identity.SEQ, schema);
        this.items = [];
      }
      add(value) {
        this.items.push(value);
      }
      /**
       * Removes a value from the collection.
       *
       * `key` must contain a representation of an integer for this to succeed.
       * It may be wrapped in a `Scalar`.
       *
       * @returns `true` if the item was found and removed.
       */
      delete(key) {
        const idx = asItemIndex(key);
        if (typeof idx !== "number")
          return false;
        const del = this.items.splice(idx, 1);
        return del.length > 0;
      }
      get(key, keepScalar) {
        const idx = asItemIndex(key);
        if (typeof idx !== "number")
          return void 0;
        const it = this.items[idx];
        return !keepScalar && identity.isScalar(it) ? it.value : it;
      }
      /**
       * Checks if the collection includes a value with the key `key`.
       *
       * `key` must contain a representation of an integer for this to succeed.
       * It may be wrapped in a `Scalar`.
       */
      has(key) {
        const idx = asItemIndex(key);
        return typeof idx === "number" && idx < this.items.length;
      }
      /**
       * Sets a value in this collection. For `!!set`, `value` needs to be a
       * boolean to add/remove the item from the set.
       *
       * If `key` does not contain a representation of an integer, this will throw.
       * It may be wrapped in a `Scalar`.
       */
      set(key, value) {
        const idx = asItemIndex(key);
        if (typeof idx !== "number")
          throw new Error(`Expected a valid index, not ${key}.`);
        const prev = this.items[idx];
        if (identity.isScalar(prev) && Scalar.isScalarValue(value))
          prev.value = value;
        else
          this.items[idx] = value;
      }
      toJSON(_, ctx) {
        const seq = [];
        if (ctx?.onCreate)
          ctx.onCreate(seq);
        let i = 0;
        for (const item of this.items)
          seq.push(toJS.toJS(item, String(i++), ctx));
        return seq;
      }
      toString(ctx, onComment, onChompKeep) {
        if (!ctx)
          return JSON.stringify(this);
        return stringifyCollection.stringifyCollection(this, ctx, {
          blockItemPrefix: "- ",
          flowChars: { start: "[", end: "]" },
          itemIndent: (ctx.indent || "") + "  ",
          onChompKeep,
          onComment
        });
      }
      static from(schema, obj, ctx) {
        const { replacer } = ctx;
        const seq = new this(schema);
        if (obj && Symbol.iterator in Object(obj)) {
          let i = 0;
          for (let it of obj) {
            if (typeof replacer === "function") {
              const key = obj instanceof Set ? it : String(i++);
              it = replacer.call(obj, key, it);
            }
            seq.items.push(createNode.createNode(it, void 0, ctx));
          }
        }
        return seq;
      }
    };
    function asItemIndex(key) {
      let idx = identity.isScalar(key) ? key.value : key;
      if (idx && typeof idx === "string")
        idx = Number(idx);
      return typeof idx === "number" && Number.isInteger(idx) && idx >= 0 ? idx : null;
    }
    exports.YAMLSeq = YAMLSeq;
  }
});

// node_modules/yaml/dist/schema/common/seq.js
var require_seq = __commonJS({
  "node_modules/yaml/dist/schema/common/seq.js"(exports) {
    "use strict";
    var identity = require_identity();
    var YAMLSeq = require_YAMLSeq();
    var seq = {
      collection: "seq",
      default: true,
      nodeClass: YAMLSeq.YAMLSeq,
      tag: "tag:yaml.org,2002:seq",
      resolve(seq2, onError) {
        if (!identity.isSeq(seq2))
          onError("Expected a sequence for this tag");
        return seq2;
      },
      createNode: (schema, obj, ctx) => YAMLSeq.YAMLSeq.from(schema, obj, ctx)
    };
    exports.seq = seq;
  }
});

// node_modules/yaml/dist/schema/common/string.js
var require_string = __commonJS({
  "node_modules/yaml/dist/schema/common/string.js"(exports) {
    "use strict";
    var stringifyString = require_stringifyString();
    var string = {
      identify: (value) => typeof value === "string",
      default: true,
      tag: "tag:yaml.org,2002:str",
      resolve: (str) => str,
      stringify(item, ctx, onComment, onChompKeep) {
        ctx = Object.assign({ actualString: true }, ctx);
        return stringifyString.stringifyString(item, ctx, onComment, onChompKeep);
      }
    };
    exports.string = string;
  }
});

// node_modules/yaml/dist/schema/common/null.js
var require_null = __commonJS({
  "node_modules/yaml/dist/schema/common/null.js"(exports) {
    "use strict";
    var Scalar = require_Scalar();
    var nullTag = {
      identify: (value) => value == null,
      createNode: () => new Scalar.Scalar(null),
      default: true,
      tag: "tag:yaml.org,2002:null",
      test: /^(?:~|[Nn]ull|NULL)?$/,
      resolve: () => new Scalar.Scalar(null),
      stringify: ({ source }, ctx) => typeof source === "string" && nullTag.test.test(source) ? source : ctx.options.nullStr
    };
    exports.nullTag = nullTag;
  }
});

// node_modules/yaml/dist/schema/core/bool.js
var require_bool = __commonJS({
  "node_modules/yaml/dist/schema/core/bool.js"(exports) {
    "use strict";
    var Scalar = require_Scalar();
    var boolTag = {
      identify: (value) => typeof value === "boolean",
      default: true,
      tag: "tag:yaml.org,2002:bool",
      test: /^(?:[Tt]rue|TRUE|[Ff]alse|FALSE)$/,
      resolve: (str) => new Scalar.Scalar(str[0] === "t" || str[0] === "T"),
      stringify({ source, value }, ctx) {
        if (source && boolTag.test.test(source)) {
          const sv = source[0] === "t" || source[0] === "T";
          if (value === sv)
            return source;
        }
        return value ? ctx.options.trueStr : ctx.options.falseStr;
      }
    };
    exports.boolTag = boolTag;
  }
});

// node_modules/yaml/dist/stringify/stringifyNumber.js
var require_stringifyNumber = __commonJS({
  "node_modules/yaml/dist/stringify/stringifyNumber.js"(exports) {
    "use strict";
    function stringifyNumber({ format, minFractionDigits, tag, value }) {
      if (typeof value === "bigint")
        return String(value);
      const num = typeof value === "number" ? value : Number(value);
      if (!isFinite(num))
        return isNaN(num) ? ".nan" : num < 0 ? "-.inf" : ".inf";
      let n = Object.is(value, -0) ? "-0" : JSON.stringify(value);
      if (!format && minFractionDigits && (!tag || tag === "tag:yaml.org,2002:float") && /^-?\d/.test(n) && !n.includes("e")) {
        let i = n.indexOf(".");
        if (i < 0) {
          i = n.length;
          n += ".";
        }
        let d = minFractionDigits - (n.length - i - 1);
        while (d-- > 0)
          n += "0";
      }
      return n;
    }
    exports.stringifyNumber = stringifyNumber;
  }
});

// node_modules/yaml/dist/schema/core/float.js
var require_float = __commonJS({
  "node_modules/yaml/dist/schema/core/float.js"(exports) {
    "use strict";
    var Scalar = require_Scalar();
    var stringifyNumber = require_stringifyNumber();
    var floatNaN = {
      identify: (value) => typeof value === "number",
      default: true,
      tag: "tag:yaml.org,2002:float",
      test: /^(?:[-+]?\.(?:inf|Inf|INF)|\.nan|\.NaN|\.NAN)$/,
      resolve: (str) => str.slice(-3).toLowerCase() === "nan" ? NaN : str[0] === "-" ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY,
      stringify: stringifyNumber.stringifyNumber
    };
    var floatExp = {
      identify: (value) => typeof value === "number",
      default: true,
      tag: "tag:yaml.org,2002:float",
      format: "EXP",
      test: /^[-+]?(?:\.[0-9]+|[0-9]+(?:\.[0-9]*)?)[eE][-+]?[0-9]+$/,
      resolve: (str) => parseFloat(str),
      stringify(node) {
        const num = Number(node.value);
        return isFinite(num) ? num.toExponential() : stringifyNumber.stringifyNumber(node);
      }
    };
    var float = {
      identify: (value) => typeof value === "number",
      default: true,
      tag: "tag:yaml.org,2002:float",
      test: /^[-+]?(?:\.[0-9]+|[0-9]+\.[0-9]*)$/,
      resolve(str) {
        const node = new Scalar.Scalar(parseFloat(str));
        const dot = str.indexOf(".");
        if (dot !== -1 && str[str.length - 1] === "0")
          node.minFractionDigits = str.length - dot - 1;
        return node;
      },
      stringify: stringifyNumber.stringifyNumber
    };
    exports.float = float;
    exports.floatExp = floatExp;
    exports.floatNaN = floatNaN;
  }
});

// node_modules/yaml/dist/schema/core/int.js
var require_int = __commonJS({
  "node_modules/yaml/dist/schema/core/int.js"(exports) {
    "use strict";
    var stringifyNumber = require_stringifyNumber();
    var intIdentify = (value) => typeof value === "bigint" || Number.isInteger(value);
    var intResolve = (str, offset, radix, { intAsBigInt }) => intAsBigInt ? BigInt(str) : parseInt(str.substring(offset), radix);
    function intStringify(node, radix, prefix) {
      const { value } = node;
      if (intIdentify(value) && value >= 0)
        return prefix + value.toString(radix);
      return stringifyNumber.stringifyNumber(node);
    }
    var intOct = {
      identify: (value) => intIdentify(value) && value >= 0,
      default: true,
      tag: "tag:yaml.org,2002:int",
      format: "OCT",
      test: /^0o[0-7]+$/,
      resolve: (str, _onError, opt) => intResolve(str, 2, 8, opt),
      stringify: (node) => intStringify(node, 8, "0o")
    };
    var int = {
      identify: intIdentify,
      default: true,
      tag: "tag:yaml.org,2002:int",
      test: /^[-+]?[0-9]+$/,
      resolve: (str, _onError, opt) => intResolve(str, 0, 10, opt),
      stringify: stringifyNumber.stringifyNumber
    };
    var intHex = {
      identify: (value) => intIdentify(value) && value >= 0,
      default: true,
      tag: "tag:yaml.org,2002:int",
      format: "HEX",
      test: /^0x[0-9a-fA-F]+$/,
      resolve: (str, _onError, opt) => intResolve(str, 2, 16, opt),
      stringify: (node) => intStringify(node, 16, "0x")
    };
    exports.int = int;
    exports.intHex = intHex;
    exports.intOct = intOct;
  }
});

// node_modules/yaml/dist/schema/core/schema.js
var require_schema = __commonJS({
  "node_modules/yaml/dist/schema/core/schema.js"(exports) {
    "use strict";
    var map = require_map();
    var _null = require_null();
    var seq = require_seq();
    var string = require_string();
    var bool = require_bool();
    var float = require_float();
    var int = require_int();
    var schema = [
      map.map,
      seq.seq,
      string.string,
      _null.nullTag,
      bool.boolTag,
      int.intOct,
      int.int,
      int.intHex,
      float.floatNaN,
      float.floatExp,
      float.float
    ];
    exports.schema = schema;
  }
});

// node_modules/yaml/dist/schema/json/schema.js
var require_schema2 = __commonJS({
  "node_modules/yaml/dist/schema/json/schema.js"(exports) {
    "use strict";
    var Scalar = require_Scalar();
    var map = require_map();
    var seq = require_seq();
    function intIdentify(value) {
      return typeof value === "bigint" || Number.isInteger(value);
    }
    var stringifyJSON = ({ value }) => JSON.stringify(value);
    var jsonScalars = [
      {
        identify: (value) => typeof value === "string",
        default: true,
        tag: "tag:yaml.org,2002:str",
        resolve: (str) => str,
        stringify: stringifyJSON
      },
      {
        identify: (value) => value == null,
        createNode: () => new Scalar.Scalar(null),
        default: true,
        tag: "tag:yaml.org,2002:null",
        test: /^null$/,
        resolve: () => null,
        stringify: stringifyJSON
      },
      {
        identify: (value) => typeof value === "boolean",
        default: true,
        tag: "tag:yaml.org,2002:bool",
        test: /^true$|^false$/,
        resolve: (str) => str === "true",
        stringify: stringifyJSON
      },
      {
        identify: intIdentify,
        default: true,
        tag: "tag:yaml.org,2002:int",
        test: /^-?(?:0|[1-9][0-9]*)$/,
        resolve: (str, _onError, { intAsBigInt }) => intAsBigInt ? BigInt(str) : parseInt(str, 10),
        stringify: ({ value }) => intIdentify(value) ? value.toString() : JSON.stringify(value)
      },
      {
        identify: (value) => typeof value === "number",
        default: true,
        tag: "tag:yaml.org,2002:float",
        test: /^-?(?:0|[1-9][0-9]*)(?:\.[0-9]*)?(?:[eE][-+]?[0-9]+)?$/,
        resolve: (str) => parseFloat(str),
        stringify: stringifyJSON
      }
    ];
    var jsonError = {
      default: true,
      tag: "",
      test: /^/,
      resolve(str, onError) {
        onError(`Unresolved plain scalar ${JSON.stringify(str)}`);
        return str;
      }
    };
    var schema = [map.map, seq.seq].concat(jsonScalars, jsonError);
    exports.schema = schema;
  }
});

// node_modules/yaml/dist/schema/yaml-1.1/binary.js
var require_binary = __commonJS({
  "node_modules/yaml/dist/schema/yaml-1.1/binary.js"(exports) {
    "use strict";
    var node_buffer = __require("buffer");
    var Scalar = require_Scalar();
    var stringifyString = require_stringifyString();
    var binary = {
      identify: (value) => value instanceof Uint8Array,
      // Buffer inherits from Uint8Array
      default: false,
      tag: "tag:yaml.org,2002:binary",
      /**
       * Returns a Buffer in node and an Uint8Array in browsers
       *
       * To use the resulting buffer as an image, you'll want to do something like:
       *
       *   const blob = new Blob([buffer], { type: 'image/jpeg' })
       *   document.querySelector('#photo').src = URL.createObjectURL(blob)
       */
      resolve(src, onError) {
        if (typeof node_buffer.Buffer === "function") {
          return node_buffer.Buffer.from(src, "base64");
        } else if (typeof atob === "function") {
          const str = atob(src.replace(/[\n\r]/g, ""));
          const buffer = new Uint8Array(str.length);
          for (let i = 0; i < str.length; ++i)
            buffer[i] = str.charCodeAt(i);
          return buffer;
        } else {
          onError("This environment does not support reading binary tags; either Buffer or atob is required");
          return src;
        }
      },
      stringify({ comment, type, value }, ctx, onComment, onChompKeep) {
        if (!value)
          return "";
        const buf = value;
        let str;
        if (typeof node_buffer.Buffer === "function") {
          str = buf instanceof node_buffer.Buffer ? buf.toString("base64") : node_buffer.Buffer.from(buf.buffer).toString("base64");
        } else if (typeof btoa === "function") {
          let s = "";
          for (let i = 0; i < buf.length; ++i)
            s += String.fromCharCode(buf[i]);
          str = btoa(s);
        } else {
          throw new Error("This environment does not support writing binary tags; either Buffer or btoa is required");
        }
        type ?? (type = Scalar.Scalar.BLOCK_LITERAL);
        if (type !== Scalar.Scalar.QUOTE_DOUBLE) {
          const lineWidth = Math.max(ctx.options.lineWidth - ctx.indent.length, ctx.options.minContentWidth);
          const n = Math.ceil(str.length / lineWidth);
          const lines = new Array(n);
          for (let i = 0, o = 0; i < n; ++i, o += lineWidth) {
            lines[i] = str.substr(o, lineWidth);
          }
          str = lines.join(type === Scalar.Scalar.BLOCK_LITERAL ? "\n" : " ");
        }
        return stringifyString.stringifyString({ comment, type, value: str }, ctx, onComment, onChompKeep);
      }
    };
    exports.binary = binary;
  }
});

// node_modules/yaml/dist/schema/yaml-1.1/pairs.js
var require_pairs = __commonJS({
  "node_modules/yaml/dist/schema/yaml-1.1/pairs.js"(exports) {
    "use strict";
    var identity = require_identity();
    var Pair = require_Pair();
    var Scalar = require_Scalar();
    var YAMLSeq = require_YAMLSeq();
    function resolvePairs(seq, onError) {
      if (identity.isSeq(seq)) {
        for (let i = 0; i < seq.items.length; ++i) {
          let item = seq.items[i];
          if (identity.isPair(item))
            continue;
          else if (identity.isMap(item)) {
            if (item.items.length > 1)
              onError("Each pair must have its own sequence indicator");
            const pair = item.items[0] || new Pair.Pair(new Scalar.Scalar(null));
            if (item.commentBefore)
              pair.key.commentBefore = pair.key.commentBefore ? `${item.commentBefore}
${pair.key.commentBefore}` : item.commentBefore;
            if (item.comment) {
              const cn = pair.value ?? pair.key;
              cn.comment = cn.comment ? `${item.comment}
${cn.comment}` : item.comment;
            }
            item = pair;
          }
          seq.items[i] = identity.isPair(item) ? item : new Pair.Pair(item);
        }
      } else
        onError("Expected a sequence for this tag");
      return seq;
    }
    function createPairs(schema, iterable, ctx) {
      const { replacer } = ctx;
      const pairs2 = new YAMLSeq.YAMLSeq(schema);
      pairs2.tag = "tag:yaml.org,2002:pairs";
      let i = 0;
      if (iterable && Symbol.iterator in Object(iterable))
        for (let it of iterable) {
          if (typeof replacer === "function")
            it = replacer.call(iterable, String(i++), it);
          let key, value;
          if (Array.isArray(it)) {
            if (it.length === 2) {
              key = it[0];
              value = it[1];
            } else
              throw new TypeError(`Expected [key, value] tuple: ${it}`);
          } else if (it && it instanceof Object) {
            const keys = Object.keys(it);
            if (keys.length === 1) {
              key = keys[0];
              value = it[key];
            } else {
              throw new TypeError(`Expected tuple with one key, not ${keys.length} keys`);
            }
          } else {
            key = it;
          }
          pairs2.items.push(Pair.createPair(key, value, ctx));
        }
      return pairs2;
    }
    var pairs = {
      collection: "seq",
      default: false,
      tag: "tag:yaml.org,2002:pairs",
      resolve: resolvePairs,
      createNode: createPairs
    };
    exports.createPairs = createPairs;
    exports.pairs = pairs;
    exports.resolvePairs = resolvePairs;
  }
});

// node_modules/yaml/dist/schema/yaml-1.1/omap.js
var require_omap = __commonJS({
  "node_modules/yaml/dist/schema/yaml-1.1/omap.js"(exports) {
    "use strict";
    var identity = require_identity();
    var toJS = require_toJS();
    var YAMLMap = require_YAMLMap();
    var YAMLSeq = require_YAMLSeq();
    var pairs = require_pairs();
    var YAMLOMap = class _YAMLOMap extends YAMLSeq.YAMLSeq {
      constructor() {
        super();
        this.add = YAMLMap.YAMLMap.prototype.add.bind(this);
        this.delete = YAMLMap.YAMLMap.prototype.delete.bind(this);
        this.get = YAMLMap.YAMLMap.prototype.get.bind(this);
        this.has = YAMLMap.YAMLMap.prototype.has.bind(this);
        this.set = YAMLMap.YAMLMap.prototype.set.bind(this);
        this.tag = _YAMLOMap.tag;
      }
      /**
       * If `ctx` is given, the return type is actually `Map<unknown, unknown>`,
       * but TypeScript won't allow widening the signature of a child method.
       */
      toJSON(_, ctx) {
        if (!ctx)
          return super.toJSON(_);
        const map = /* @__PURE__ */ new Map();
        if (ctx?.onCreate)
          ctx.onCreate(map);
        for (const pair of this.items) {
          let key, value;
          if (identity.isPair(pair)) {
            key = toJS.toJS(pair.key, "", ctx);
            value = toJS.toJS(pair.value, key, ctx);
          } else {
            key = toJS.toJS(pair, "", ctx);
          }
          if (map.has(key))
            throw new Error("Ordered maps must not include duplicate keys");
          map.set(key, value);
        }
        return map;
      }
      static from(schema, iterable, ctx) {
        const pairs$1 = pairs.createPairs(schema, iterable, ctx);
        const omap2 = new this();
        omap2.items = pairs$1.items;
        return omap2;
      }
    };
    YAMLOMap.tag = "tag:yaml.org,2002:omap";
    var omap = {
      collection: "seq",
      identify: (value) => value instanceof Map,
      nodeClass: YAMLOMap,
      default: false,
      tag: "tag:yaml.org,2002:omap",
      resolve(seq, onError) {
        const pairs$1 = pairs.resolvePairs(seq, onError);
        const seenKeys = [];
        for (const { key } of pairs$1.items) {
          if (identity.isScalar(key)) {
            if (seenKeys.includes(key.value)) {
              onError(`Ordered maps must not include duplicate keys: ${key.value}`);
            } else {
              seenKeys.push(key.value);
            }
          }
        }
        return Object.assign(new YAMLOMap(), pairs$1);
      },
      createNode: (schema, iterable, ctx) => YAMLOMap.from(schema, iterable, ctx)
    };
    exports.YAMLOMap = YAMLOMap;
    exports.omap = omap;
  }
});

// node_modules/yaml/dist/schema/yaml-1.1/bool.js
var require_bool2 = __commonJS({
  "node_modules/yaml/dist/schema/yaml-1.1/bool.js"(exports) {
    "use strict";
    var Scalar = require_Scalar();
    function boolStringify({ value, source }, ctx) {
      const boolObj = value ? trueTag : falseTag;
      if (source && boolObj.test.test(source))
        return source;
      return value ? ctx.options.trueStr : ctx.options.falseStr;
    }
    var trueTag = {
      identify: (value) => value === true,
      default: true,
      tag: "tag:yaml.org,2002:bool",
      test: /^(?:Y|y|[Yy]es|YES|[Tt]rue|TRUE|[Oo]n|ON)$/,
      resolve: () => new Scalar.Scalar(true),
      stringify: boolStringify
    };
    var falseTag = {
      identify: (value) => value === false,
      default: true,
      tag: "tag:yaml.org,2002:bool",
      test: /^(?:N|n|[Nn]o|NO|[Ff]alse|FALSE|[Oo]ff|OFF)$/,
      resolve: () => new Scalar.Scalar(false),
      stringify: boolStringify
    };
    exports.falseTag = falseTag;
    exports.trueTag = trueTag;
  }
});

// node_modules/yaml/dist/schema/yaml-1.1/float.js
var require_float2 = __commonJS({
  "node_modules/yaml/dist/schema/yaml-1.1/float.js"(exports) {
    "use strict";
    var Scalar = require_Scalar();
    var stringifyNumber = require_stringifyNumber();
    var floatNaN = {
      identify: (value) => typeof value === "number",
      default: true,
      tag: "tag:yaml.org,2002:float",
      test: /^(?:[-+]?\.(?:inf|Inf|INF)|\.nan|\.NaN|\.NAN)$/,
      resolve: (str) => str.slice(-3).toLowerCase() === "nan" ? NaN : str[0] === "-" ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY,
      stringify: stringifyNumber.stringifyNumber
    };
    var floatExp = {
      identify: (value) => typeof value === "number",
      default: true,
      tag: "tag:yaml.org,2002:float",
      format: "EXP",
      test: /^[-+]?(?:[0-9][0-9_]*)?(?:\.[0-9_]*)?[eE][-+]?[0-9]+$/,
      resolve: (str) => parseFloat(str.replace(/_/g, "")),
      stringify(node) {
        const num = Number(node.value);
        return isFinite(num) ? num.toExponential() : stringifyNumber.stringifyNumber(node);
      }
    };
    var float = {
      identify: (value) => typeof value === "number",
      default: true,
      tag: "tag:yaml.org,2002:float",
      test: /^[-+]?(?:[0-9][0-9_]*)?\.[0-9_]*$/,
      resolve(str) {
        const node = new Scalar.Scalar(parseFloat(str.replace(/_/g, "")));
        const dot = str.indexOf(".");
        if (dot !== -1) {
          const f = str.substring(dot + 1).replace(/_/g, "");
          if (f[f.length - 1] === "0")
            node.minFractionDigits = f.length;
        }
        return node;
      },
      stringify: stringifyNumber.stringifyNumber
    };
    exports.float = float;
    exports.floatExp = floatExp;
    exports.floatNaN = floatNaN;
  }
});

// node_modules/yaml/dist/schema/yaml-1.1/int.js
var require_int2 = __commonJS({
  "node_modules/yaml/dist/schema/yaml-1.1/int.js"(exports) {
    "use strict";
    var stringifyNumber = require_stringifyNumber();
    var intIdentify = (value) => typeof value === "bigint" || Number.isInteger(value);
    function intResolve(str, offset, radix, { intAsBigInt }) {
      const sign = str[0];
      if (sign === "-" || sign === "+")
        offset += 1;
      str = str.substring(offset).replace(/_/g, "");
      if (intAsBigInt) {
        switch (radix) {
          case 2:
            str = `0b${str}`;
            break;
          case 8:
            str = `0o${str}`;
            break;
          case 16:
            str = `0x${str}`;
            break;
        }
        const n2 = BigInt(str);
        return sign === "-" ? BigInt(-1) * n2 : n2;
      }
      const n = parseInt(str, radix);
      return sign === "-" ? -1 * n : n;
    }
    function intStringify(node, radix, prefix) {
      const { value } = node;
      if (intIdentify(value)) {
        const str = value.toString(radix);
        return value < 0 ? "-" + prefix + str.substr(1) : prefix + str;
      }
      return stringifyNumber.stringifyNumber(node);
    }
    var intBin = {
      identify: intIdentify,
      default: true,
      tag: "tag:yaml.org,2002:int",
      format: "BIN",
      test: /^[-+]?0b[0-1_]+$/,
      resolve: (str, _onError, opt) => intResolve(str, 2, 2, opt),
      stringify: (node) => intStringify(node, 2, "0b")
    };
    var intOct = {
      identify: intIdentify,
      default: true,
      tag: "tag:yaml.org,2002:int",
      format: "OCT",
      test: /^[-+]?0[0-7_]+$/,
      resolve: (str, _onError, opt) => intResolve(str, 1, 8, opt),
      stringify: (node) => intStringify(node, 8, "0")
    };
    var int = {
      identify: intIdentify,
      default: true,
      tag: "tag:yaml.org,2002:int",
      test: /^[-+]?[0-9][0-9_]*$/,
      resolve: (str, _onError, opt) => intResolve(str, 0, 10, opt),
      stringify: stringifyNumber.stringifyNumber
    };
    var intHex = {
      identify: intIdentify,
      default: true,
      tag: "tag:yaml.org,2002:int",
      format: "HEX",
      test: /^[-+]?0x[0-9a-fA-F_]+$/,
      resolve: (str, _onError, opt) => intResolve(str, 2, 16, opt),
      stringify: (node) => intStringify(node, 16, "0x")
    };
    exports.int = int;
    exports.intBin = intBin;
    exports.intHex = intHex;
    exports.intOct = intOct;
  }
});

// node_modules/yaml/dist/schema/yaml-1.1/set.js
var require_set = __commonJS({
  "node_modules/yaml/dist/schema/yaml-1.1/set.js"(exports) {
    "use strict";
    var identity = require_identity();
    var Pair = require_Pair();
    var YAMLMap = require_YAMLMap();
    var YAMLSet = class _YAMLSet extends YAMLMap.YAMLMap {
      constructor(schema) {
        super(schema);
        this.tag = _YAMLSet.tag;
      }
      add(key) {
        let pair;
        if (identity.isPair(key))
          pair = key;
        else if (key && typeof key === "object" && "key" in key && "value" in key && key.value === null)
          pair = new Pair.Pair(key.key, null);
        else
          pair = new Pair.Pair(key, null);
        const prev = YAMLMap.findPair(this.items, pair.key);
        if (!prev)
          this.items.push(pair);
      }
      /**
       * If `keepPair` is `true`, returns the Pair matching `key`.
       * Otherwise, returns the value of that Pair's key.
       */
      get(key, keepPair) {
        const pair = YAMLMap.findPair(this.items, key);
        return !keepPair && identity.isPair(pair) ? identity.isScalar(pair.key) ? pair.key.value : pair.key : pair;
      }
      set(key, value) {
        if (typeof value !== "boolean")
          throw new Error(`Expected boolean value for set(key, value) in a YAML set, not ${typeof value}`);
        const prev = YAMLMap.findPair(this.items, key);
        if (prev && !value) {
          this.items.splice(this.items.indexOf(prev), 1);
        } else if (!prev && value) {
          this.items.push(new Pair.Pair(key));
        }
      }
      toJSON(_, ctx) {
        return super.toJSON(_, ctx, Set);
      }
      toString(ctx, onComment, onChompKeep) {
        if (!ctx)
          return JSON.stringify(this);
        if (this.hasAllNullValues(true))
          return super.toString(Object.assign({}, ctx, { allNullValues: true }), onComment, onChompKeep);
        else
          throw new Error("Set items must all have null values");
      }
      static from(schema, iterable, ctx) {
        const { replacer } = ctx;
        const set2 = new this(schema);
        if (iterable && Symbol.iterator in Object(iterable))
          for (let value of iterable) {
            if (typeof replacer === "function")
              value = replacer.call(iterable, value, value);
            set2.items.push(Pair.createPair(value, null, ctx));
          }
        return set2;
      }
    };
    YAMLSet.tag = "tag:yaml.org,2002:set";
    var set = {
      collection: "map",
      identify: (value) => value instanceof Set,
      nodeClass: YAMLSet,
      default: false,
      tag: "tag:yaml.org,2002:set",
      createNode: (schema, iterable, ctx) => YAMLSet.from(schema, iterable, ctx),
      resolve(map, onError) {
        if (identity.isMap(map)) {
          if (map.hasAllNullValues(true))
            return Object.assign(new YAMLSet(), map);
          else
            onError("Set items must all have null values");
        } else
          onError("Expected a mapping for this tag");
        return map;
      }
    };
    exports.YAMLSet = YAMLSet;
    exports.set = set;
  }
});

// node_modules/yaml/dist/schema/yaml-1.1/timestamp.js
var require_timestamp = __commonJS({
  "node_modules/yaml/dist/schema/yaml-1.1/timestamp.js"(exports) {
    "use strict";
    var stringifyNumber = require_stringifyNumber();
    function parseSexagesimal(str, asBigInt) {
      const sign = str[0];
      const parts = sign === "-" || sign === "+" ? str.substring(1) : str;
      const num = (n) => asBigInt ? BigInt(n) : Number(n);
      const res = parts.replace(/_/g, "").split(":").reduce((res2, p) => res2 * num(60) + num(p), num(0));
      return sign === "-" ? num(-1) * res : res;
    }
    function stringifySexagesimal(node) {
      let { value } = node;
      let num = (n) => n;
      if (typeof value === "bigint")
        num = (n) => BigInt(n);
      else if (isNaN(value) || !isFinite(value))
        return stringifyNumber.stringifyNumber(node);
      let sign = "";
      if (value < 0) {
        sign = "-";
        value *= num(-1);
      }
      const _60 = num(60);
      const parts = [value % _60];
      if (value < 60) {
        parts.unshift(0);
      } else {
        value = (value - parts[0]) / _60;
        parts.unshift(value % _60);
        if (value >= 60) {
          value = (value - parts[0]) / _60;
          parts.unshift(value);
        }
      }
      return sign + parts.map((n) => String(n).padStart(2, "0")).join(":").replace(/000000\d*$/, "");
    }
    var intTime = {
      identify: (value) => typeof value === "bigint" || Number.isInteger(value),
      default: true,
      tag: "tag:yaml.org,2002:int",
      format: "TIME",
      test: /^[-+]?[0-9][0-9_]*(?::[0-5]?[0-9])+$/,
      resolve: (str, _onError, { intAsBigInt }) => parseSexagesimal(str, intAsBigInt),
      stringify: stringifySexagesimal
    };
    var floatTime = {
      identify: (value) => typeof value === "number",
      default: true,
      tag: "tag:yaml.org,2002:float",
      format: "TIME",
      test: /^[-+]?[0-9][0-9_]*(?::[0-5]?[0-9])+\.[0-9_]*$/,
      resolve: (str) => parseSexagesimal(str, false),
      stringify: stringifySexagesimal
    };
    var timestamp = {
      identify: (value) => value instanceof Date,
      default: true,
      tag: "tag:yaml.org,2002:timestamp",
      // If the time zone is omitted, the timestamp is assumed to be specified in UTC. The time part
      // may be omitted altogether, resulting in a date format. In such a case, the time part is
      // assumed to be 00:00:00Z (start of day, UTC).
      test: RegExp("^([0-9]{4})-([0-9]{1,2})-([0-9]{1,2})(?:(?:t|T|[ \\t]+)([0-9]{1,2}):([0-9]{1,2}):([0-9]{1,2}(\\.[0-9]+)?)(?:[ \\t]*(Z|[-+][012]?[0-9](?::[0-9]{2})?))?)?$"),
      resolve(str) {
        const match = str.match(timestamp.test);
        if (!match)
          throw new Error("!!timestamp expects a date, starting with yyyy-mm-dd");
        const [, year, month, day, hour, minute, second] = match.map(Number);
        const millisec = match[7] ? Number((match[7] + "00").substr(1, 3)) : 0;
        let date = Date.UTC(year, month - 1, day, hour || 0, minute || 0, second || 0, millisec);
        const tz = match[8];
        if (tz && tz !== "Z") {
          let d = parseSexagesimal(tz, false);
          if (Math.abs(d) < 30)
            d *= 60;
          date -= 6e4 * d;
        }
        return new Date(date);
      },
      stringify: ({ value }) => value?.toISOString().replace(/(T00:00:00)?\.000Z$/, "") ?? ""
    };
    exports.floatTime = floatTime;
    exports.intTime = intTime;
    exports.timestamp = timestamp;
  }
});

// node_modules/yaml/dist/schema/yaml-1.1/schema.js
var require_schema3 = __commonJS({
  "node_modules/yaml/dist/schema/yaml-1.1/schema.js"(exports) {
    "use strict";
    var map = require_map();
    var _null = require_null();
    var seq = require_seq();
    var string = require_string();
    var binary = require_binary();
    var bool = require_bool2();
    var float = require_float2();
    var int = require_int2();
    var merge = require_merge();
    var omap = require_omap();
    var pairs = require_pairs();
    var set = require_set();
    var timestamp = require_timestamp();
    var schema = [
      map.map,
      seq.seq,
      string.string,
      _null.nullTag,
      bool.trueTag,
      bool.falseTag,
      int.intBin,
      int.intOct,
      int.int,
      int.intHex,
      float.floatNaN,
      float.floatExp,
      float.float,
      binary.binary,
      merge.merge,
      omap.omap,
      pairs.pairs,
      set.set,
      timestamp.intTime,
      timestamp.floatTime,
      timestamp.timestamp
    ];
    exports.schema = schema;
  }
});

// node_modules/yaml/dist/schema/tags.js
var require_tags = __commonJS({
  "node_modules/yaml/dist/schema/tags.js"(exports) {
    "use strict";
    var map = require_map();
    var _null = require_null();
    var seq = require_seq();
    var string = require_string();
    var bool = require_bool();
    var float = require_float();
    var int = require_int();
    var schema = require_schema();
    var schema$1 = require_schema2();
    var binary = require_binary();
    var merge = require_merge();
    var omap = require_omap();
    var pairs = require_pairs();
    var schema$2 = require_schema3();
    var set = require_set();
    var timestamp = require_timestamp();
    var schemas = /* @__PURE__ */ new Map([
      ["core", schema.schema],
      ["failsafe", [map.map, seq.seq, string.string]],
      ["json", schema$1.schema],
      ["yaml11", schema$2.schema],
      ["yaml-1.1", schema$2.schema]
    ]);
    var tagsByName = {
      binary: binary.binary,
      bool: bool.boolTag,
      float: float.float,
      floatExp: float.floatExp,
      floatNaN: float.floatNaN,
      floatTime: timestamp.floatTime,
      int: int.int,
      intHex: int.intHex,
      intOct: int.intOct,
      intTime: timestamp.intTime,
      map: map.map,
      merge: merge.merge,
      null: _null.nullTag,
      omap: omap.omap,
      pairs: pairs.pairs,
      seq: seq.seq,
      set: set.set,
      timestamp: timestamp.timestamp
    };
    var coreKnownTags = {
      "tag:yaml.org,2002:binary": binary.binary,
      "tag:yaml.org,2002:merge": merge.merge,
      "tag:yaml.org,2002:omap": omap.omap,
      "tag:yaml.org,2002:pairs": pairs.pairs,
      "tag:yaml.org,2002:set": set.set,
      "tag:yaml.org,2002:timestamp": timestamp.timestamp
    };
    function getTags(customTags, schemaName, addMergeTag) {
      const schemaTags = schemas.get(schemaName);
      if (schemaTags && !customTags) {
        return addMergeTag && !schemaTags.includes(merge.merge) ? schemaTags.concat(merge.merge) : schemaTags.slice();
      }
      let tags = schemaTags;
      if (!tags) {
        if (Array.isArray(customTags))
          tags = [];
        else {
          const keys = Array.from(schemas.keys()).filter((key) => key !== "yaml11").map((key) => JSON.stringify(key)).join(", ");
          throw new Error(`Unknown schema "${schemaName}"; use one of ${keys} or define customTags array`);
        }
      }
      if (Array.isArray(customTags)) {
        for (const tag of customTags)
          tags = tags.concat(tag);
      } else if (typeof customTags === "function") {
        tags = customTags(tags.slice());
      }
      if (addMergeTag)
        tags = tags.concat(merge.merge);
      return tags.reduce((tags2, tag) => {
        const tagObj = typeof tag === "string" ? tagsByName[tag] : tag;
        if (!tagObj) {
          const tagName = JSON.stringify(tag);
          const keys = Object.keys(tagsByName).map((key) => JSON.stringify(key)).join(", ");
          throw new Error(`Unknown custom tag ${tagName}; use one of ${keys}`);
        }
        if (!tags2.includes(tagObj))
          tags2.push(tagObj);
        return tags2;
      }, []);
    }
    exports.coreKnownTags = coreKnownTags;
    exports.getTags = getTags;
  }
});

// node_modules/yaml/dist/schema/Schema.js
var require_Schema = __commonJS({
  "node_modules/yaml/dist/schema/Schema.js"(exports) {
    "use strict";
    var identity = require_identity();
    var map = require_map();
    var seq = require_seq();
    var string = require_string();
    var tags = require_tags();
    var sortMapEntriesByKey = (a, b) => a.key < b.key ? -1 : a.key > b.key ? 1 : 0;
    var Schema = class _Schema {
      constructor({ compat, customTags, merge, resolveKnownTags, schema, sortMapEntries, toStringDefaults }) {
        this.compat = Array.isArray(compat) ? tags.getTags(compat, "compat") : compat ? tags.getTags(null, compat) : null;
        this.name = typeof schema === "string" && schema || "core";
        this.knownTags = resolveKnownTags ? tags.coreKnownTags : {};
        this.tags = tags.getTags(customTags, this.name, merge);
        this.toStringOptions = toStringDefaults ?? null;
        Object.defineProperty(this, identity.MAP, { value: map.map });
        Object.defineProperty(this, identity.SCALAR, { value: string.string });
        Object.defineProperty(this, identity.SEQ, { value: seq.seq });
        this.sortMapEntries = typeof sortMapEntries === "function" ? sortMapEntries : sortMapEntries === true ? sortMapEntriesByKey : null;
      }
      clone() {
        const copy = Object.create(_Schema.prototype, Object.getOwnPropertyDescriptors(this));
        copy.tags = this.tags.slice();
        return copy;
      }
    };
    exports.Schema = Schema;
  }
});

// node_modules/yaml/dist/stringify/stringifyDocument.js
var require_stringifyDocument = __commonJS({
  "node_modules/yaml/dist/stringify/stringifyDocument.js"(exports) {
    "use strict";
    var identity = require_identity();
    var stringify = require_stringify();
    var stringifyComment = require_stringifyComment();
    function stringifyDocument(doc, options) {
      const lines = [];
      let hasDirectives = options.directives === true;
      if (options.directives !== false && doc.directives) {
        const dir = doc.directives.toString(doc);
        if (dir) {
          lines.push(dir);
          hasDirectives = true;
        } else if (doc.directives.docStart)
          hasDirectives = true;
      }
      if (hasDirectives)
        lines.push("---");
      const ctx = stringify.createStringifyContext(doc, options);
      const { commentString } = ctx.options;
      if (doc.commentBefore) {
        if (lines.length !== 1)
          lines.unshift("");
        const cs = commentString(doc.commentBefore);
        lines.unshift(stringifyComment.indentComment(cs, ""));
      }
      let chompKeep = false;
      let contentComment = null;
      if (doc.contents) {
        if (identity.isNode(doc.contents)) {
          if (doc.contents.spaceBefore && hasDirectives)
            lines.push("");
          if (doc.contents.commentBefore) {
            const cs = commentString(doc.contents.commentBefore);
            lines.push(stringifyComment.indentComment(cs, ""));
          }
          ctx.forceBlockIndent = !!doc.comment;
          contentComment = doc.contents.comment;
        }
        const onChompKeep = contentComment ? void 0 : () => chompKeep = true;
        let body = stringify.stringify(doc.contents, ctx, () => contentComment = null, onChompKeep);
        if (contentComment)
          body += stringifyComment.lineComment(body, "", commentString(contentComment));
        if ((body[0] === "|" || body[0] === ">") && lines[lines.length - 1] === "---") {
          lines[lines.length - 1] = `--- ${body}`;
        } else
          lines.push(body);
      } else {
        lines.push(stringify.stringify(doc.contents, ctx));
      }
      if (doc.directives?.docEnd) {
        if (doc.comment) {
          const cs = commentString(doc.comment);
          if (cs.includes("\n")) {
            lines.push("...");
            lines.push(stringifyComment.indentComment(cs, ""));
          } else {
            lines.push(`... ${cs}`);
          }
        } else {
          lines.push("...");
        }
      } else {
        let dc = doc.comment;
        if (dc && chompKeep)
          dc = dc.replace(/^\n+/, "");
        if (dc) {
          if ((!chompKeep || contentComment) && lines[lines.length - 1] !== "")
            lines.push("");
          lines.push(stringifyComment.indentComment(commentString(dc), ""));
        }
      }
      return lines.join("\n") + "\n";
    }
    exports.stringifyDocument = stringifyDocument;
  }
});

// node_modules/yaml/dist/doc/Document.js
var require_Document = __commonJS({
  "node_modules/yaml/dist/doc/Document.js"(exports) {
    "use strict";
    var Alias = require_Alias();
    var Collection = require_Collection();
    var identity = require_identity();
    var Pair = require_Pair();
    var toJS = require_toJS();
    var Schema = require_Schema();
    var stringifyDocument = require_stringifyDocument();
    var anchors = require_anchors();
    var applyReviver = require_applyReviver();
    var createNode = require_createNode();
    var directives = require_directives();
    var Document5 = class _Document {
      constructor(value, replacer, options) {
        this.commentBefore = null;
        this.comment = null;
        this.errors = [];
        this.warnings = [];
        Object.defineProperty(this, identity.NODE_TYPE, { value: identity.DOC });
        let _replacer = null;
        if (typeof replacer === "function" || Array.isArray(replacer)) {
          _replacer = replacer;
        } else if (options === void 0 && replacer) {
          options = replacer;
          replacer = void 0;
        }
        const opt = Object.assign({
          intAsBigInt: false,
          keepSourceTokens: false,
          logLevel: "warn",
          prettyErrors: true,
          strict: true,
          stringKeys: false,
          uniqueKeys: true,
          version: "1.2"
        }, options);
        this.options = opt;
        let { version } = opt;
        if (options?._directives) {
          this.directives = options._directives.atDocument();
          if (this.directives.yaml.explicit)
            version = this.directives.yaml.version;
        } else
          this.directives = new directives.Directives({ version });
        this.setSchema(version, options);
        this.contents = value === void 0 ? null : this.createNode(value, _replacer, options);
      }
      /**
       * Create a deep copy of this Document and its contents.
       *
       * Custom Node values that inherit from `Object` still refer to their original instances.
       */
      clone() {
        const copy = Object.create(_Document.prototype, {
          [identity.NODE_TYPE]: { value: identity.DOC }
        });
        copy.commentBefore = this.commentBefore;
        copy.comment = this.comment;
        copy.errors = this.errors.slice();
        copy.warnings = this.warnings.slice();
        copy.options = Object.assign({}, this.options);
        if (this.directives)
          copy.directives = this.directives.clone();
        copy.schema = this.schema.clone();
        copy.contents = identity.isNode(this.contents) ? this.contents.clone(copy.schema) : this.contents;
        if (this.range)
          copy.range = this.range.slice();
        return copy;
      }
      /** Adds a value to the document. */
      add(value) {
        if (assertCollection(this.contents))
          this.contents.add(value);
      }
      /** Adds a value to the document. */
      addIn(path8, value) {
        if (assertCollection(this.contents))
          this.contents.addIn(path8, value);
      }
      /**
       * Create a new `Alias` node, ensuring that the target `node` has the required anchor.
       *
       * If `node` already has an anchor, `name` is ignored.
       * Otherwise, the `node.anchor` value will be set to `name`,
       * or if an anchor with that name is already present in the document,
       * `name` will be used as a prefix for a new unique anchor.
       * If `name` is undefined, the generated anchor will use 'a' as a prefix.
       */
      createAlias(node, name) {
        if (!node.anchor) {
          const prev = anchors.anchorNames(this);
          node.anchor = // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
          !name || prev.has(name) ? anchors.findNewAnchor(name || "a", prev) : name;
        }
        return new Alias.Alias(node.anchor);
      }
      createNode(value, replacer, options) {
        let _replacer = void 0;
        if (typeof replacer === "function") {
          value = replacer.call({ "": value }, "", value);
          _replacer = replacer;
        } else if (Array.isArray(replacer)) {
          const keyToStr = (v) => typeof v === "number" || v instanceof String || v instanceof Number;
          const asStr = replacer.filter(keyToStr).map(String);
          if (asStr.length > 0)
            replacer = replacer.concat(asStr);
          _replacer = replacer;
        } else if (options === void 0 && replacer) {
          options = replacer;
          replacer = void 0;
        }
        const { aliasDuplicateObjects, anchorPrefix, flow, keepUndefined, onTagObj, tag } = options ?? {};
        const { onAnchor, setAnchors, sourceObjects } = anchors.createNodeAnchors(
          this,
          // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
          anchorPrefix || "a"
        );
        const ctx = {
          aliasDuplicateObjects: aliasDuplicateObjects ?? true,
          keepUndefined: keepUndefined ?? false,
          onAnchor,
          onTagObj,
          replacer: _replacer,
          schema: this.schema,
          sourceObjects
        };
        const node = createNode.createNode(value, tag, ctx);
        if (flow && identity.isCollection(node))
          node.flow = true;
        setAnchors();
        return node;
      }
      /**
       * Convert a key and a value into a `Pair` using the current schema,
       * recursively wrapping all values as `Scalar` or `Collection` nodes.
       */
      createPair(key, value, options = {}) {
        const k = this.createNode(key, null, options);
        const v = this.createNode(value, null, options);
        return new Pair.Pair(k, v);
      }
      /**
       * Removes a value from the document.
       * @returns `true` if the item was found and removed.
       */
      delete(key) {
        return assertCollection(this.contents) ? this.contents.delete(key) : false;
      }
      /**
       * Removes a value from the document.
       * @returns `true` if the item was found and removed.
       */
      deleteIn(path8) {
        if (Collection.isEmptyPath(path8)) {
          if (this.contents == null)
            return false;
          this.contents = null;
          return true;
        }
        return assertCollection(this.contents) ? this.contents.deleteIn(path8) : false;
      }
      /**
       * Returns item at `key`, or `undefined` if not found. By default unwraps
       * scalar values from their surrounding node; to disable set `keepScalar` to
       * `true` (collections are always returned intact).
       */
      get(key, keepScalar) {
        return identity.isCollection(this.contents) ? this.contents.get(key, keepScalar) : void 0;
      }
      /**
       * Returns item at `path`, or `undefined` if not found. By default unwraps
       * scalar values from their surrounding node; to disable set `keepScalar` to
       * `true` (collections are always returned intact).
       */
      getIn(path8, keepScalar) {
        if (Collection.isEmptyPath(path8))
          return !keepScalar && identity.isScalar(this.contents) ? this.contents.value : this.contents;
        return identity.isCollection(this.contents) ? this.contents.getIn(path8, keepScalar) : void 0;
      }
      /**
       * Checks if the document includes a value with the key `key`.
       */
      has(key) {
        return identity.isCollection(this.contents) ? this.contents.has(key) : false;
      }
      /**
       * Checks if the document includes a value at `path`.
       */
      hasIn(path8) {
        if (Collection.isEmptyPath(path8))
          return this.contents !== void 0;
        return identity.isCollection(this.contents) ? this.contents.hasIn(path8) : false;
      }
      /**
       * Sets a value in this document. For `!!set`, `value` needs to be a
       * boolean to add/remove the item from the set.
       */
      set(key, value) {
        if (this.contents == null) {
          this.contents = Collection.collectionFromPath(this.schema, [key], value);
        } else if (assertCollection(this.contents)) {
          this.contents.set(key, value);
        }
      }
      /**
       * Sets a value in this document. For `!!set`, `value` needs to be a
       * boolean to add/remove the item from the set.
       */
      setIn(path8, value) {
        if (Collection.isEmptyPath(path8)) {
          this.contents = value;
        } else if (this.contents == null) {
          this.contents = Collection.collectionFromPath(this.schema, Array.from(path8), value);
        } else if (assertCollection(this.contents)) {
          this.contents.setIn(path8, value);
        }
      }
      /**
       * Change the YAML version and schema used by the document.
       * A `null` version disables support for directives, explicit tags, anchors, and aliases.
       * It also requires the `schema` option to be given as a `Schema` instance value.
       *
       * Overrides all previously set schema options.
       */
      setSchema(version, options = {}) {
        if (typeof version === "number")
          version = String(version);
        let opt;
        switch (version) {
          case "1.1":
            if (this.directives)
              this.directives.yaml.version = "1.1";
            else
              this.directives = new directives.Directives({ version: "1.1" });
            opt = { resolveKnownTags: false, schema: "yaml-1.1" };
            break;
          case "1.2":
          case "next":
            if (this.directives)
              this.directives.yaml.version = version;
            else
              this.directives = new directives.Directives({ version });
            opt = { resolveKnownTags: true, schema: "core" };
            break;
          case null:
            if (this.directives)
              delete this.directives;
            opt = null;
            break;
          default: {
            const sv = JSON.stringify(version);
            throw new Error(`Expected '1.1', '1.2' or null as first argument, but found: ${sv}`);
          }
        }
        if (options.schema instanceof Object)
          this.schema = options.schema;
        else if (opt)
          this.schema = new Schema.Schema(Object.assign(opt, options));
        else
          throw new Error(`With a null YAML version, the { schema: Schema } option is required`);
      }
      // json & jsonArg are only used from toJSON()
      toJS({ json, jsonArg, mapAsMap, maxAliasCount, onAnchor, reviver } = {}) {
        const ctx = {
          anchors: /* @__PURE__ */ new Map(),
          doc: this,
          keep: !json,
          mapAsMap: mapAsMap === true,
          mapKeyWarned: false,
          maxAliasCount: typeof maxAliasCount === "number" ? maxAliasCount : 100
        };
        const res = toJS.toJS(this.contents, jsonArg ?? "", ctx);
        if (typeof onAnchor === "function")
          for (const { count, res: res2 } of ctx.anchors.values())
            onAnchor(res2, count);
        return typeof reviver === "function" ? applyReviver.applyReviver(reviver, { "": res }, "", res) : res;
      }
      /**
       * A JSON representation of the document `contents`.
       *
       * @param jsonArg Used by `JSON.stringify` to indicate the array index or
       *   property name.
       */
      toJSON(jsonArg, onAnchor) {
        return this.toJS({ json: true, jsonArg, mapAsMap: false, onAnchor });
      }
      /** A YAML representation of the document. */
      toString(options = {}) {
        if (this.errors.length > 0)
          throw new Error("Document with errors cannot be stringified");
        if ("indent" in options && (!Number.isInteger(options.indent) || Number(options.indent) <= 0)) {
          const s = JSON.stringify(options.indent);
          throw new Error(`"indent" option must be a positive integer, not ${s}`);
        }
        return stringifyDocument.stringifyDocument(this, options);
      }
    };
    function assertCollection(contents) {
      if (identity.isCollection(contents))
        return true;
      throw new Error("Expected a YAML collection as document contents");
    }
    exports.Document = Document5;
  }
});

// node_modules/yaml/dist/errors.js
var require_errors = __commonJS({
  "node_modules/yaml/dist/errors.js"(exports) {
    "use strict";
    var YAMLError = class extends Error {
      constructor(name, pos, code, message) {
        super();
        this.name = name;
        this.code = code;
        this.message = message;
        this.pos = pos;
      }
    };
    var YAMLParseError = class extends YAMLError {
      constructor(pos, code, message) {
        super("YAMLParseError", pos, code, message);
      }
    };
    var YAMLWarning = class extends YAMLError {
      constructor(pos, code, message) {
        super("YAMLWarning", pos, code, message);
      }
    };
    var prettifyError = (src, lc) => (error) => {
      if (error.pos[0] === -1)
        return;
      error.linePos = error.pos.map((pos) => lc.linePos(pos));
      const { line, col } = error.linePos[0];
      error.message += ` at line ${line}, column ${col}`;
      let ci = col - 1;
      let lineStr = src.substring(lc.lineStarts[line - 1], lc.lineStarts[line]).replace(/[\n\r]+$/, "");
      if (ci >= 60 && lineStr.length > 80) {
        const trimStart = Math.min(ci - 39, lineStr.length - 79);
        lineStr = "\u2026" + lineStr.substring(trimStart);
        ci -= trimStart - 1;
      }
      if (lineStr.length > 80)
        lineStr = lineStr.substring(0, 79) + "\u2026";
      if (line > 1 && /^ *$/.test(lineStr.substring(0, ci))) {
        let prev = src.substring(lc.lineStarts[line - 2], lc.lineStarts[line - 1]);
        if (prev.length > 80)
          prev = prev.substring(0, 79) + "\u2026\n";
        lineStr = prev + lineStr;
      }
      if (/[^ ]/.test(lineStr)) {
        let count = 1;
        const end = error.linePos[1];
        if (end?.line === line && end.col > col) {
          count = Math.max(1, Math.min(end.col - col, 80 - ci));
        }
        const pointer = " ".repeat(ci) + "^".repeat(count);
        error.message += `:

${lineStr}
${pointer}
`;
      }
    };
    exports.YAMLError = YAMLError;
    exports.YAMLParseError = YAMLParseError;
    exports.YAMLWarning = YAMLWarning;
    exports.prettifyError = prettifyError;
  }
});

// node_modules/yaml/dist/compose/resolve-props.js
var require_resolve_props = __commonJS({
  "node_modules/yaml/dist/compose/resolve-props.js"(exports) {
    "use strict";
    function resolveProps(tokens, { flow, indicator, next, offset, onError, parentIndent, startOnNewline }) {
      let spaceBefore = false;
      let atNewline = startOnNewline;
      let hasSpace = startOnNewline;
      let comment = "";
      let commentSep = "";
      let hasNewline = false;
      let reqSpace = false;
      let tab = null;
      let anchor = null;
      let tag = null;
      let newlineAfterProp = null;
      let comma = null;
      let found = null;
      let start = null;
      for (const token of tokens) {
        if (reqSpace) {
          if (token.type !== "space" && token.type !== "newline" && token.type !== "comma")
            onError(token.offset, "MISSING_CHAR", "Tags and anchors must be separated from the next token by white space");
          reqSpace = false;
        }
        if (tab) {
          if (atNewline && token.type !== "comment" && token.type !== "newline") {
            onError(tab, "TAB_AS_INDENT", "Tabs are not allowed as indentation");
          }
          tab = null;
        }
        switch (token.type) {
          case "space":
            if (!flow && (indicator !== "doc-start" || next?.type !== "flow-collection") && token.source.includes("	")) {
              tab = token;
            }
            hasSpace = true;
            break;
          case "comment": {
            if (!hasSpace)
              onError(token, "MISSING_CHAR", "Comments must be separated from other tokens by white space characters");
            const cb = token.source.substring(1) || " ";
            if (!comment)
              comment = cb;
            else
              comment += commentSep + cb;
            commentSep = "";
            atNewline = false;
            break;
          }
          case "newline":
            if (atNewline) {
              if (comment)
                comment += token.source;
              else if (!found || indicator !== "seq-item-ind")
                spaceBefore = true;
            } else
              commentSep += token.source;
            atNewline = true;
            hasNewline = true;
            if (anchor || tag)
              newlineAfterProp = token;
            hasSpace = true;
            break;
          case "anchor":
            if (anchor)
              onError(token, "MULTIPLE_ANCHORS", "A node can have at most one anchor");
            if (token.source.endsWith(":"))
              onError(token.offset + token.source.length - 1, "BAD_ALIAS", "Anchor ending in : is ambiguous", true);
            anchor = token;
            start ?? (start = token.offset);
            atNewline = false;
            hasSpace = false;
            reqSpace = true;
            break;
          case "tag": {
            if (tag)
              onError(token, "MULTIPLE_TAGS", "A node can have at most one tag");
            tag = token;
            start ?? (start = token.offset);
            atNewline = false;
            hasSpace = false;
            reqSpace = true;
            break;
          }
          case indicator:
            if (anchor || tag)
              onError(token, "BAD_PROP_ORDER", `Anchors and tags must be after the ${token.source} indicator`);
            if (found)
              onError(token, "UNEXPECTED_TOKEN", `Unexpected ${token.source} in ${flow ?? "collection"}`);
            found = token;
            atNewline = indicator === "seq-item-ind" || indicator === "explicit-key-ind";
            hasSpace = false;
            break;
          case "comma":
            if (flow) {
              if (comma)
                onError(token, "UNEXPECTED_TOKEN", `Unexpected , in ${flow}`);
              comma = token;
              atNewline = false;
              hasSpace = false;
              break;
            }
          // else fallthrough
          default:
            onError(token, "UNEXPECTED_TOKEN", `Unexpected ${token.type} token`);
            atNewline = false;
            hasSpace = false;
        }
      }
      const last = tokens[tokens.length - 1];
      const end = last ? last.offset + last.source.length : offset;
      if (reqSpace && next && next.type !== "space" && next.type !== "newline" && next.type !== "comma" && (next.type !== "scalar" || next.source !== "")) {
        onError(next.offset, "MISSING_CHAR", "Tags and anchors must be separated from the next token by white space");
      }
      if (tab && (atNewline && tab.indent <= parentIndent || next?.type === "block-map" || next?.type === "block-seq"))
        onError(tab, "TAB_AS_INDENT", "Tabs are not allowed as indentation");
      return {
        comma,
        found,
        spaceBefore,
        comment,
        hasNewline,
        anchor,
        tag,
        newlineAfterProp,
        end,
        start: start ?? end
      };
    }
    exports.resolveProps = resolveProps;
  }
});

// node_modules/yaml/dist/compose/util-contains-newline.js
var require_util_contains_newline = __commonJS({
  "node_modules/yaml/dist/compose/util-contains-newline.js"(exports) {
    "use strict";
    function containsNewline(key) {
      if (!key)
        return null;
      switch (key.type) {
        case "alias":
        case "scalar":
        case "double-quoted-scalar":
        case "single-quoted-scalar":
          if (key.source.includes("\n"))
            return true;
          if (key.end) {
            for (const st of key.end)
              if (st.type === "newline")
                return true;
          }
          return false;
        case "flow-collection":
          for (const it of key.items) {
            for (const st of it.start)
              if (st.type === "newline")
                return true;
            if (it.sep) {
              for (const st of it.sep)
                if (st.type === "newline")
                  return true;
            }
            if (containsNewline(it.key) || containsNewline(it.value))
              return true;
          }
          return false;
        default:
          return true;
      }
    }
    exports.containsNewline = containsNewline;
  }
});

// node_modules/yaml/dist/compose/util-flow-indent-check.js
var require_util_flow_indent_check = __commonJS({
  "node_modules/yaml/dist/compose/util-flow-indent-check.js"(exports) {
    "use strict";
    var utilContainsNewline = require_util_contains_newline();
    function flowIndentCheck(indent, fc, onError) {
      if (fc?.type === "flow-collection") {
        const end = fc.end[0];
        if (end.indent === indent && (end.source === "]" || end.source === "}") && utilContainsNewline.containsNewline(fc)) {
          const msg = "Flow end indicator should be more indented than parent";
          onError(end, "BAD_INDENT", msg, true);
        }
      }
    }
    exports.flowIndentCheck = flowIndentCheck;
  }
});

// node_modules/yaml/dist/compose/util-map-includes.js
var require_util_map_includes = __commonJS({
  "node_modules/yaml/dist/compose/util-map-includes.js"(exports) {
    "use strict";
    var identity = require_identity();
    function mapIncludes(ctx, items, search) {
      const { uniqueKeys } = ctx.options;
      if (uniqueKeys === false)
        return false;
      const isEqual = typeof uniqueKeys === "function" ? uniqueKeys : (a, b) => a === b || identity.isScalar(a) && identity.isScalar(b) && a.value === b.value;
      return items.some((pair) => isEqual(pair.key, search));
    }
    exports.mapIncludes = mapIncludes;
  }
});

// node_modules/yaml/dist/compose/resolve-block-map.js
var require_resolve_block_map = __commonJS({
  "node_modules/yaml/dist/compose/resolve-block-map.js"(exports) {
    "use strict";
    var Pair = require_Pair();
    var YAMLMap = require_YAMLMap();
    var resolveProps = require_resolve_props();
    var utilContainsNewline = require_util_contains_newline();
    var utilFlowIndentCheck = require_util_flow_indent_check();
    var utilMapIncludes = require_util_map_includes();
    var startColMsg = "All mapping items must start at the same column";
    function resolveBlockMap({ composeNode, composeEmptyNode }, ctx, bm, onError, tag) {
      const NodeClass = tag?.nodeClass ?? YAMLMap.YAMLMap;
      const map = new NodeClass(ctx.schema);
      if (ctx.atRoot)
        ctx.atRoot = false;
      let offset = bm.offset;
      let commentEnd = null;
      for (const collItem of bm.items) {
        const { start, key, sep, value } = collItem;
        const keyProps = resolveProps.resolveProps(start, {
          indicator: "explicit-key-ind",
          next: key ?? sep?.[0],
          offset,
          onError,
          parentIndent: bm.indent,
          startOnNewline: true
        });
        const implicitKey = !keyProps.found;
        if (implicitKey) {
          if (key) {
            if (key.type === "block-seq")
              onError(offset, "BLOCK_AS_IMPLICIT_KEY", "A block sequence may not be used as an implicit map key");
            else if ("indent" in key && key.indent !== bm.indent)
              onError(offset, "BAD_INDENT", startColMsg);
          }
          if (!keyProps.anchor && !keyProps.tag && !sep) {
            commentEnd = keyProps.end;
            if (keyProps.comment) {
              if (map.comment)
                map.comment += "\n" + keyProps.comment;
              else
                map.comment = keyProps.comment;
            }
            continue;
          }
          if (keyProps.newlineAfterProp || utilContainsNewline.containsNewline(key)) {
            onError(key ?? start[start.length - 1], "MULTILINE_IMPLICIT_KEY", "Implicit keys need to be on a single line");
          }
        } else if (keyProps.found?.indent !== bm.indent) {
          onError(offset, "BAD_INDENT", startColMsg);
        }
        ctx.atKey = true;
        const keyStart = keyProps.end;
        const keyNode = key ? composeNode(ctx, key, keyProps, onError) : composeEmptyNode(ctx, keyStart, start, null, keyProps, onError);
        if (ctx.schema.compat)
          utilFlowIndentCheck.flowIndentCheck(bm.indent, key, onError);
        ctx.atKey = false;
        if (utilMapIncludes.mapIncludes(ctx, map.items, keyNode))
          onError(keyStart, "DUPLICATE_KEY", "Map keys must be unique");
        const valueProps = resolveProps.resolveProps(sep ?? [], {
          indicator: "map-value-ind",
          next: value,
          offset: keyNode.range[2],
          onError,
          parentIndent: bm.indent,
          startOnNewline: !key || key.type === "block-scalar"
        });
        offset = valueProps.end;
        if (valueProps.found) {
          if (implicitKey) {
            if (value?.type === "block-map" && !valueProps.hasNewline)
              onError(offset, "BLOCK_AS_IMPLICIT_KEY", "Nested mappings are not allowed in compact mappings");
            if (ctx.options.strict && keyProps.start < valueProps.found.offset - 1024)
              onError(keyNode.range, "KEY_OVER_1024_CHARS", "The : indicator must be at most 1024 chars after the start of an implicit block mapping key");
          }
          const valueNode = value ? composeNode(ctx, value, valueProps, onError) : composeEmptyNode(ctx, offset, sep, null, valueProps, onError);
          if (ctx.schema.compat)
            utilFlowIndentCheck.flowIndentCheck(bm.indent, value, onError);
          offset = valueNode.range[2];
          const pair = new Pair.Pair(keyNode, valueNode);
          if (ctx.options.keepSourceTokens)
            pair.srcToken = collItem;
          map.items.push(pair);
        } else {
          if (implicitKey)
            onError(keyNode.range, "MISSING_CHAR", "Implicit map keys need to be followed by map values");
          if (valueProps.comment) {
            if (keyNode.comment)
              keyNode.comment += "\n" + valueProps.comment;
            else
              keyNode.comment = valueProps.comment;
          }
          const pair = new Pair.Pair(keyNode);
          if (ctx.options.keepSourceTokens)
            pair.srcToken = collItem;
          map.items.push(pair);
        }
      }
      if (commentEnd && commentEnd < offset)
        onError(commentEnd, "IMPOSSIBLE", "Map comment with trailing content");
      map.range = [bm.offset, offset, commentEnd ?? offset];
      return map;
    }
    exports.resolveBlockMap = resolveBlockMap;
  }
});

// node_modules/yaml/dist/compose/resolve-block-seq.js
var require_resolve_block_seq = __commonJS({
  "node_modules/yaml/dist/compose/resolve-block-seq.js"(exports) {
    "use strict";
    var YAMLSeq = require_YAMLSeq();
    var resolveProps = require_resolve_props();
    var utilFlowIndentCheck = require_util_flow_indent_check();
    function resolveBlockSeq({ composeNode, composeEmptyNode }, ctx, bs, onError, tag) {
      const NodeClass = tag?.nodeClass ?? YAMLSeq.YAMLSeq;
      const seq = new NodeClass(ctx.schema);
      if (ctx.atRoot)
        ctx.atRoot = false;
      if (ctx.atKey)
        ctx.atKey = false;
      let offset = bs.offset;
      let commentEnd = null;
      for (const { start, value } of bs.items) {
        const props = resolveProps.resolveProps(start, {
          indicator: "seq-item-ind",
          next: value,
          offset,
          onError,
          parentIndent: bs.indent,
          startOnNewline: true
        });
        if (!props.found) {
          if (props.anchor || props.tag || value) {
            if (value?.type === "block-seq")
              onError(props.end, "BAD_INDENT", "All sequence items must start at the same column");
            else
              onError(offset, "MISSING_CHAR", "Sequence item without - indicator");
          } else {
            commentEnd = props.end;
            if (props.comment)
              seq.comment = props.comment;
            continue;
          }
        }
        const node = value ? composeNode(ctx, value, props, onError) : composeEmptyNode(ctx, props.end, start, null, props, onError);
        if (ctx.schema.compat)
          utilFlowIndentCheck.flowIndentCheck(bs.indent, value, onError);
        offset = node.range[2];
        seq.items.push(node);
      }
      seq.range = [bs.offset, offset, commentEnd ?? offset];
      return seq;
    }
    exports.resolveBlockSeq = resolveBlockSeq;
  }
});

// node_modules/yaml/dist/compose/resolve-end.js
var require_resolve_end = __commonJS({
  "node_modules/yaml/dist/compose/resolve-end.js"(exports) {
    "use strict";
    function resolveEnd(end, offset, reqSpace, onError) {
      let comment = "";
      if (end) {
        let hasSpace = false;
        let sep = "";
        for (const token of end) {
          const { source, type } = token;
          switch (type) {
            case "space":
              hasSpace = true;
              break;
            case "comment": {
              if (reqSpace && !hasSpace)
                onError(token, "MISSING_CHAR", "Comments must be separated from other tokens by white space characters");
              const cb = source.substring(1) || " ";
              if (!comment)
                comment = cb;
              else
                comment += sep + cb;
              sep = "";
              break;
            }
            case "newline":
              if (comment)
                sep += source;
              hasSpace = true;
              break;
            default:
              onError(token, "UNEXPECTED_TOKEN", `Unexpected ${type} at node end`);
          }
          offset += source.length;
        }
      }
      return { comment, offset };
    }
    exports.resolveEnd = resolveEnd;
  }
});

// node_modules/yaml/dist/compose/resolve-flow-collection.js
var require_resolve_flow_collection = __commonJS({
  "node_modules/yaml/dist/compose/resolve-flow-collection.js"(exports) {
    "use strict";
    var identity = require_identity();
    var Pair = require_Pair();
    var YAMLMap = require_YAMLMap();
    var YAMLSeq = require_YAMLSeq();
    var resolveEnd = require_resolve_end();
    var resolveProps = require_resolve_props();
    var utilContainsNewline = require_util_contains_newline();
    var utilMapIncludes = require_util_map_includes();
    var blockMsg = "Block collections are not allowed within flow collections";
    var isBlock = (token) => token && (token.type === "block-map" || token.type === "block-seq");
    function resolveFlowCollection({ composeNode, composeEmptyNode }, ctx, fc, onError, tag) {
      const isMap2 = fc.start.source === "{";
      const fcName = isMap2 ? "flow map" : "flow sequence";
      const NodeClass = tag?.nodeClass ?? (isMap2 ? YAMLMap.YAMLMap : YAMLSeq.YAMLSeq);
      const coll = new NodeClass(ctx.schema);
      coll.flow = true;
      const atRoot = ctx.atRoot;
      if (atRoot)
        ctx.atRoot = false;
      if (ctx.atKey)
        ctx.atKey = false;
      let offset = fc.offset + fc.start.source.length;
      for (let i = 0; i < fc.items.length; ++i) {
        const collItem = fc.items[i];
        const { start, key, sep, value } = collItem;
        const props = resolveProps.resolveProps(start, {
          flow: fcName,
          indicator: "explicit-key-ind",
          next: key ?? sep?.[0],
          offset,
          onError,
          parentIndent: fc.indent,
          startOnNewline: false
        });
        if (!props.found) {
          if (!props.anchor && !props.tag && !sep && !value) {
            if (i === 0 && props.comma)
              onError(props.comma, "UNEXPECTED_TOKEN", `Unexpected , in ${fcName}`);
            else if (i < fc.items.length - 1)
              onError(props.start, "UNEXPECTED_TOKEN", `Unexpected empty item in ${fcName}`);
            if (props.comment) {
              if (coll.comment)
                coll.comment += "\n" + props.comment;
              else
                coll.comment = props.comment;
            }
            offset = props.end;
            continue;
          }
          if (!isMap2 && ctx.options.strict && utilContainsNewline.containsNewline(key))
            onError(
              key,
              // checked by containsNewline()
              "MULTILINE_IMPLICIT_KEY",
              "Implicit keys of flow sequence pairs need to be on a single line"
            );
        }
        if (i === 0) {
          if (props.comma)
            onError(props.comma, "UNEXPECTED_TOKEN", `Unexpected , in ${fcName}`);
        } else {
          if (!props.comma)
            onError(props.start, "MISSING_CHAR", `Missing , between ${fcName} items`);
          if (props.comment) {
            let prevItemComment = "";
            loop: for (const st of start) {
              switch (st.type) {
                case "comma":
                case "space":
                  break;
                case "comment":
                  prevItemComment = st.source.substring(1);
                  break loop;
                default:
                  break loop;
              }
            }
            if (prevItemComment) {
              let prev = coll.items[coll.items.length - 1];
              if (identity.isPair(prev))
                prev = prev.value ?? prev.key;
              if (prev.comment)
                prev.comment += "\n" + prevItemComment;
              else
                prev.comment = prevItemComment;
              props.comment = props.comment.substring(prevItemComment.length + 1);
            }
          }
        }
        if (!isMap2 && !sep && !props.found) {
          const valueNode = value ? composeNode(ctx, value, props, onError) : composeEmptyNode(ctx, props.end, sep, null, props, onError);
          coll.items.push(valueNode);
          offset = valueNode.range[2];
          if (isBlock(value))
            onError(valueNode.range, "BLOCK_IN_FLOW", blockMsg);
        } else {
          ctx.atKey = true;
          const keyStart = props.end;
          const keyNode = key ? composeNode(ctx, key, props, onError) : composeEmptyNode(ctx, keyStart, start, null, props, onError);
          if (isBlock(key))
            onError(keyNode.range, "BLOCK_IN_FLOW", blockMsg);
          ctx.atKey = false;
          const valueProps = resolveProps.resolveProps(sep ?? [], {
            flow: fcName,
            indicator: "map-value-ind",
            next: value,
            offset: keyNode.range[2],
            onError,
            parentIndent: fc.indent,
            startOnNewline: false
          });
          if (valueProps.found) {
            if (!isMap2 && !props.found && ctx.options.strict) {
              if (sep)
                for (const st of sep) {
                  if (st === valueProps.found)
                    break;
                  if (st.type === "newline") {
                    onError(st, "MULTILINE_IMPLICIT_KEY", "Implicit keys of flow sequence pairs need to be on a single line");
                    break;
                  }
                }
              if (props.start < valueProps.found.offset - 1024)
                onError(valueProps.found, "KEY_OVER_1024_CHARS", "The : indicator must be at most 1024 chars after the start of an implicit flow sequence key");
            }
          } else if (value) {
            if ("source" in value && value.source?.[0] === ":")
              onError(value, "MISSING_CHAR", `Missing space after : in ${fcName}`);
            else
              onError(valueProps.start, "MISSING_CHAR", `Missing , or : between ${fcName} items`);
          }
          const valueNode = value ? composeNode(ctx, value, valueProps, onError) : valueProps.found ? composeEmptyNode(ctx, valueProps.end, sep, null, valueProps, onError) : null;
          if (valueNode) {
            if (isBlock(value))
              onError(valueNode.range, "BLOCK_IN_FLOW", blockMsg);
          } else if (valueProps.comment) {
            if (keyNode.comment)
              keyNode.comment += "\n" + valueProps.comment;
            else
              keyNode.comment = valueProps.comment;
          }
          const pair = new Pair.Pair(keyNode, valueNode);
          if (ctx.options.keepSourceTokens)
            pair.srcToken = collItem;
          if (isMap2) {
            const map = coll;
            if (utilMapIncludes.mapIncludes(ctx, map.items, keyNode))
              onError(keyStart, "DUPLICATE_KEY", "Map keys must be unique");
            map.items.push(pair);
          } else {
            const map = new YAMLMap.YAMLMap(ctx.schema);
            map.flow = true;
            map.items.push(pair);
            const endRange = (valueNode ?? keyNode).range;
            map.range = [keyNode.range[0], endRange[1], endRange[2]];
            coll.items.push(map);
          }
          offset = valueNode ? valueNode.range[2] : valueProps.end;
        }
      }
      const expectedEnd = isMap2 ? "}" : "]";
      const [ce, ...ee] = fc.end;
      let cePos = offset;
      if (ce?.source === expectedEnd)
        cePos = ce.offset + ce.source.length;
      else {
        const name = fcName[0].toUpperCase() + fcName.substring(1);
        const msg = atRoot ? `${name} must end with a ${expectedEnd}` : `${name} in block collection must be sufficiently indented and end with a ${expectedEnd}`;
        onError(offset, atRoot ? "MISSING_CHAR" : "BAD_INDENT", msg);
        if (ce && ce.source.length !== 1)
          ee.unshift(ce);
      }
      if (ee.length > 0) {
        const end = resolveEnd.resolveEnd(ee, cePos, ctx.options.strict, onError);
        if (end.comment) {
          if (coll.comment)
            coll.comment += "\n" + end.comment;
          else
            coll.comment = end.comment;
        }
        coll.range = [fc.offset, cePos, end.offset];
      } else {
        coll.range = [fc.offset, cePos, cePos];
      }
      return coll;
    }
    exports.resolveFlowCollection = resolveFlowCollection;
  }
});

// node_modules/yaml/dist/compose/compose-collection.js
var require_compose_collection = __commonJS({
  "node_modules/yaml/dist/compose/compose-collection.js"(exports) {
    "use strict";
    var identity = require_identity();
    var Scalar = require_Scalar();
    var YAMLMap = require_YAMLMap();
    var YAMLSeq = require_YAMLSeq();
    var resolveBlockMap = require_resolve_block_map();
    var resolveBlockSeq = require_resolve_block_seq();
    var resolveFlowCollection = require_resolve_flow_collection();
    function resolveCollection(CN, ctx, token, onError, tagName, tag) {
      const coll = token.type === "block-map" ? resolveBlockMap.resolveBlockMap(CN, ctx, token, onError, tag) : token.type === "block-seq" ? resolveBlockSeq.resolveBlockSeq(CN, ctx, token, onError, tag) : resolveFlowCollection.resolveFlowCollection(CN, ctx, token, onError, tag);
      const Coll = coll.constructor;
      if (tagName === "!" || tagName === Coll.tagName) {
        coll.tag = Coll.tagName;
        return coll;
      }
      if (tagName)
        coll.tag = tagName;
      return coll;
    }
    function composeCollection(CN, ctx, token, props, onError) {
      const tagToken = props.tag;
      const tagName = !tagToken ? null : ctx.directives.tagName(tagToken.source, (msg) => onError(tagToken, "TAG_RESOLVE_FAILED", msg));
      if (token.type === "block-seq") {
        const { anchor, newlineAfterProp: nl } = props;
        const lastProp = anchor && tagToken ? anchor.offset > tagToken.offset ? anchor : tagToken : anchor ?? tagToken;
        if (lastProp && (!nl || nl.offset < lastProp.offset)) {
          const message = "Missing newline after block sequence props";
          onError(lastProp, "MISSING_CHAR", message);
        }
      }
      const expType = token.type === "block-map" ? "map" : token.type === "block-seq" ? "seq" : token.start.source === "{" ? "map" : "seq";
      if (!tagToken || !tagName || tagName === "!" || tagName === YAMLMap.YAMLMap.tagName && expType === "map" || tagName === YAMLSeq.YAMLSeq.tagName && expType === "seq") {
        return resolveCollection(CN, ctx, token, onError, tagName);
      }
      let tag = ctx.schema.tags.find((t) => t.tag === tagName && t.collection === expType);
      if (!tag) {
        const kt = ctx.schema.knownTags[tagName];
        if (kt?.collection === expType) {
          ctx.schema.tags.push(Object.assign({}, kt, { default: false }));
          tag = kt;
        } else {
          if (kt) {
            onError(tagToken, "BAD_COLLECTION_TYPE", `${kt.tag} used for ${expType} collection, but expects ${kt.collection ?? "scalar"}`, true);
          } else {
            onError(tagToken, "TAG_RESOLVE_FAILED", `Unresolved tag: ${tagName}`, true);
          }
          return resolveCollection(CN, ctx, token, onError, tagName);
        }
      }
      const coll = resolveCollection(CN, ctx, token, onError, tagName, tag);
      const res = tag.resolve?.(coll, (msg) => onError(tagToken, "TAG_RESOLVE_FAILED", msg), ctx.options) ?? coll;
      const node = identity.isNode(res) ? res : new Scalar.Scalar(res);
      node.range = coll.range;
      node.tag = tagName;
      if (tag?.format)
        node.format = tag.format;
      return node;
    }
    exports.composeCollection = composeCollection;
  }
});

// node_modules/yaml/dist/compose/resolve-block-scalar.js
var require_resolve_block_scalar = __commonJS({
  "node_modules/yaml/dist/compose/resolve-block-scalar.js"(exports) {
    "use strict";
    var Scalar = require_Scalar();
    function resolveBlockScalar(ctx, scalar, onError) {
      const start = scalar.offset;
      const header2 = parseBlockScalarHeader(scalar, ctx.options.strict, onError);
      if (!header2)
        return { value: "", type: null, comment: "", range: [start, start, start] };
      const type = header2.mode === ">" ? Scalar.Scalar.BLOCK_FOLDED : Scalar.Scalar.BLOCK_LITERAL;
      const lines = scalar.source ? splitLines(scalar.source) : [];
      let chompStart = lines.length;
      for (let i = lines.length - 1; i >= 0; --i) {
        const content = lines[i][1];
        if (content === "" || content === "\r")
          chompStart = i;
        else
          break;
      }
      if (chompStart === 0) {
        const value2 = header2.chomp === "+" && lines.length > 0 ? "\n".repeat(Math.max(1, lines.length - 1)) : "";
        let end2 = start + header2.length;
        if (scalar.source)
          end2 += scalar.source.length;
        return { value: value2, type, comment: header2.comment, range: [start, end2, end2] };
      }
      let trimIndent = scalar.indent + header2.indent;
      let offset = scalar.offset + header2.length;
      let contentStart = 0;
      for (let i = 0; i < chompStart; ++i) {
        const [indent, content] = lines[i];
        if (content === "" || content === "\r") {
          if (header2.indent === 0 && indent.length > trimIndent)
            trimIndent = indent.length;
        } else {
          if (indent.length < trimIndent) {
            const message = "Block scalars with more-indented leading empty lines must use an explicit indentation indicator";
            onError(offset + indent.length, "MISSING_CHAR", message);
          }
          if (header2.indent === 0)
            trimIndent = indent.length;
          contentStart = i;
          if (trimIndent === 0 && !ctx.atRoot) {
            const message = "Block scalar values in collections must be indented";
            onError(offset, "BAD_INDENT", message);
          }
          break;
        }
        offset += indent.length + content.length + 1;
      }
      for (let i = lines.length - 1; i >= chompStart; --i) {
        if (lines[i][0].length > trimIndent)
          chompStart = i + 1;
      }
      let value = "";
      let sep = "";
      let prevMoreIndented = false;
      for (let i = 0; i < contentStart; ++i)
        value += lines[i][0].slice(trimIndent) + "\n";
      for (let i = contentStart; i < chompStart; ++i) {
        let [indent, content] = lines[i];
        offset += indent.length + content.length + 1;
        const crlf = content[content.length - 1] === "\r";
        if (crlf)
          content = content.slice(0, -1);
        if (content && indent.length < trimIndent) {
          const src = header2.indent ? "explicit indentation indicator" : "first line";
          const message = `Block scalar lines must not be less indented than their ${src}`;
          onError(offset - content.length - (crlf ? 2 : 1), "BAD_INDENT", message);
          indent = "";
        }
        if (type === Scalar.Scalar.BLOCK_LITERAL) {
          value += sep + indent.slice(trimIndent) + content;
          sep = "\n";
        } else if (indent.length > trimIndent || content[0] === "	") {
          if (sep === " ")
            sep = "\n";
          else if (!prevMoreIndented && sep === "\n")
            sep = "\n\n";
          value += sep + indent.slice(trimIndent) + content;
          sep = "\n";
          prevMoreIndented = true;
        } else if (content === "") {
          if (sep === "\n")
            value += "\n";
          else
            sep = "\n";
        } else {
          value += sep + content;
          sep = " ";
          prevMoreIndented = false;
        }
      }
      switch (header2.chomp) {
        case "-":
          break;
        case "+":
          for (let i = chompStart; i < lines.length; ++i)
            value += "\n" + lines[i][0].slice(trimIndent);
          if (value[value.length - 1] !== "\n")
            value += "\n";
          break;
        default:
          value += "\n";
      }
      const end = start + header2.length + scalar.source.length;
      return { value, type, comment: header2.comment, range: [start, end, end] };
    }
    function parseBlockScalarHeader({ offset, props }, strict, onError) {
      if (props[0].type !== "block-scalar-header") {
        onError(props[0], "IMPOSSIBLE", "Block scalar header not found");
        return null;
      }
      const { source } = props[0];
      const mode = source[0];
      let indent = 0;
      let chomp = "";
      let error = -1;
      for (let i = 1; i < source.length; ++i) {
        const ch = source[i];
        if (!chomp && (ch === "-" || ch === "+"))
          chomp = ch;
        else {
          const n = Number(ch);
          if (!indent && n)
            indent = n;
          else if (error === -1)
            error = offset + i;
        }
      }
      if (error !== -1)
        onError(error, "UNEXPECTED_TOKEN", `Block scalar header includes extra characters: ${source}`);
      let hasSpace = false;
      let comment = "";
      let length = source.length;
      for (let i = 1; i < props.length; ++i) {
        const token = props[i];
        switch (token.type) {
          case "space":
            hasSpace = true;
          // fallthrough
          case "newline":
            length += token.source.length;
            break;
          case "comment":
            if (strict && !hasSpace) {
              const message = "Comments must be separated from other tokens by white space characters";
              onError(token, "MISSING_CHAR", message);
            }
            length += token.source.length;
            comment = token.source.substring(1);
            break;
          case "error":
            onError(token, "UNEXPECTED_TOKEN", token.message);
            length += token.source.length;
            break;
          /* istanbul ignore next should not happen */
          default: {
            const message = `Unexpected token in block scalar header: ${token.type}`;
            onError(token, "UNEXPECTED_TOKEN", message);
            const ts = token.source;
            if (ts && typeof ts === "string")
              length += ts.length;
          }
        }
      }
      return { mode, indent, chomp, comment, length };
    }
    function splitLines(source) {
      const split = source.split(/\n( *)/);
      const first = split[0];
      const m = first.match(/^( *)/);
      const line0 = m?.[1] ? [m[1], first.slice(m[1].length)] : ["", first];
      const lines = [line0];
      for (let i = 1; i < split.length; i += 2)
        lines.push([split[i], split[i + 1]]);
      return lines;
    }
    exports.resolveBlockScalar = resolveBlockScalar;
  }
});

// node_modules/yaml/dist/compose/resolve-flow-scalar.js
var require_resolve_flow_scalar = __commonJS({
  "node_modules/yaml/dist/compose/resolve-flow-scalar.js"(exports) {
    "use strict";
    var Scalar = require_Scalar();
    var resolveEnd = require_resolve_end();
    function resolveFlowScalar(scalar, strict, onError) {
      const { offset, type, source, end } = scalar;
      let _type;
      let value;
      const _onError = (rel2, code, msg) => onError(offset + rel2, code, msg);
      switch (type) {
        case "scalar":
          _type = Scalar.Scalar.PLAIN;
          value = plainValue(source, _onError);
          break;
        case "single-quoted-scalar":
          _type = Scalar.Scalar.QUOTE_SINGLE;
          value = singleQuotedValue(source, _onError);
          break;
        case "double-quoted-scalar":
          _type = Scalar.Scalar.QUOTE_DOUBLE;
          value = doubleQuotedValue(source, _onError);
          break;
        /* istanbul ignore next should not happen */
        default:
          onError(scalar, "UNEXPECTED_TOKEN", `Expected a flow scalar value, but found: ${type}`);
          return {
            value: "",
            type: null,
            comment: "",
            range: [offset, offset + source.length, offset + source.length]
          };
      }
      const valueEnd = offset + source.length;
      const re = resolveEnd.resolveEnd(end, valueEnd, strict, onError);
      return {
        value,
        type: _type,
        comment: re.comment,
        range: [offset, valueEnd, re.offset]
      };
    }
    function plainValue(source, onError) {
      let badChar = "";
      switch (source[0]) {
        /* istanbul ignore next should not happen */
        case "	":
          badChar = "a tab character";
          break;
        case ",":
          badChar = "flow indicator character ,";
          break;
        case "%":
          badChar = "directive indicator character %";
          break;
        case "|":
        case ">": {
          badChar = `block scalar indicator ${source[0]}`;
          break;
        }
        case "@":
        case "`": {
          badChar = `reserved character ${source[0]}`;
          break;
        }
      }
      if (badChar)
        onError(0, "BAD_SCALAR_START", `Plain value cannot start with ${badChar}`);
      return unfoldLines(source);
    }
    function singleQuotedValue(source, onError) {
      if (source[source.length - 1] !== "'" || source.length === 1)
        onError(source.length, "MISSING_CHAR", "Missing closing 'quote");
      return unfoldLines(source.slice(1, -1)).replace(/''/g, "'");
    }
    function unfoldLines(source) {
      const line = /(.*?)\r?\n/sy;
      let match = line.exec(source);
      if (!match)
        return source;
      let trimEnd, trimBoth;
      try {
        trimEnd = new RegExp("(?<![ 	])[ 	]+$");
        trimBoth = new RegExp("^[ 	]+|(?<![ 	])[ 	]+$", "g");
      } catch {
        trimEnd = /[ \t]+$/;
        trimBoth = /^[ \t]+|[ \t]+$/g;
      }
      let res = match[1].replace(trimEnd, "");
      let sep = " ";
      let pos = line.lastIndex;
      while (match = line.exec(source)) {
        const lm = match[1].replace(trimBoth, "");
        if (lm === "") {
          if (sep === "\n")
            res += sep;
          else
            sep = "\n";
        } else {
          res += sep + lm;
          sep = " ";
        }
        pos = line.lastIndex;
      }
      const last = /[ \t]*(.*)/sy;
      last.lastIndex = pos;
      match = last.exec(source);
      return res + sep + (match?.[1] ?? "");
    }
    function doubleQuotedValue(source, onError) {
      let res = "";
      for (let i = 1; i < source.length - 1; ++i) {
        const ch = source[i];
        if (ch === "\r" && source[i + 1] === "\n")
          continue;
        if (ch === "\n") {
          const { fold, offset } = foldNewline(source, i);
          res += fold;
          i = offset;
        } else if (ch === "\\") {
          let next = source[++i];
          const cc = escapeCodes[next];
          if (cc)
            res += cc;
          else if (next === "\n") {
            next = source[i + 1];
            while (next === " " || next === "	")
              next = source[++i + 1];
          } else if (next === "\r" && source[i + 1] === "\n") {
            next = source[++i + 1];
            while (next === " " || next === "	")
              next = source[++i + 1];
          } else if (next === "x" || next === "u" || next === "U") {
            const length = next === "x" ? 2 : next === "u" ? 4 : 8;
            res += parseCharCode(source, i + 1, length, onError);
            i += length;
          } else {
            const raw = source.substr(i - 1, 2);
            onError(i - 1, "BAD_DQ_ESCAPE", `Invalid escape sequence ${raw}`);
            res += raw;
          }
        } else if (ch === " " || ch === "	") {
          const wsStart = i;
          let next = source[i + 1];
          while (next === " " || next === "	")
            next = source[++i + 1];
          if (next !== "\n" && !(next === "\r" && source[i + 2] === "\n"))
            res += i > wsStart ? source.slice(wsStart, i + 1) : ch;
        } else {
          res += ch;
        }
      }
      if (source[source.length - 1] !== '"' || source.length === 1)
        onError(source.length, "MISSING_CHAR", 'Missing closing "quote');
      return res;
    }
    function foldNewline(source, offset) {
      let fold = "";
      let ch = source[offset + 1];
      while (ch === " " || ch === "	" || ch === "\n" || ch === "\r") {
        if (ch === "\r" && source[offset + 2] !== "\n")
          break;
        if (ch === "\n")
          fold += "\n";
        offset += 1;
        ch = source[offset + 1];
      }
      if (!fold)
        fold = " ";
      return { fold, offset };
    }
    var escapeCodes = {
      "0": "\0",
      // null character
      a: "\x07",
      // bell character
      b: "\b",
      // backspace
      e: "\x1B",
      // escape character
      f: "\f",
      // form feed
      n: "\n",
      // line feed
      r: "\r",
      // carriage return
      t: "	",
      // horizontal tab
      v: "\v",
      // vertical tab
      N: "\x85",
      // Unicode next line
      _: "\xA0",
      // Unicode non-breaking space
      L: "\u2028",
      // Unicode line separator
      P: "\u2029",
      // Unicode paragraph separator
      " ": " ",
      '"': '"',
      "/": "/",
      "\\": "\\",
      "	": "	"
    };
    function parseCharCode(source, offset, length, onError) {
      const cc = source.substr(offset, length);
      const ok = cc.length === length && /^[0-9a-fA-F]+$/.test(cc);
      const code = ok ? parseInt(cc, 16) : NaN;
      try {
        return String.fromCodePoint(code);
      } catch {
        const raw = source.substr(offset - 2, length + 2);
        onError(offset - 2, "BAD_DQ_ESCAPE", `Invalid escape sequence ${raw}`);
        return raw;
      }
    }
    exports.resolveFlowScalar = resolveFlowScalar;
  }
});

// node_modules/yaml/dist/compose/compose-scalar.js
var require_compose_scalar = __commonJS({
  "node_modules/yaml/dist/compose/compose-scalar.js"(exports) {
    "use strict";
    var identity = require_identity();
    var Scalar = require_Scalar();
    var resolveBlockScalar = require_resolve_block_scalar();
    var resolveFlowScalar = require_resolve_flow_scalar();
    function composeScalar(ctx, token, tagToken, onError) {
      const { value, type, comment, range } = token.type === "block-scalar" ? resolveBlockScalar.resolveBlockScalar(ctx, token, onError) : resolveFlowScalar.resolveFlowScalar(token, ctx.options.strict, onError);
      const tagName = tagToken ? ctx.directives.tagName(tagToken.source, (msg) => onError(tagToken, "TAG_RESOLVE_FAILED", msg)) : null;
      let tag;
      if (ctx.options.stringKeys && ctx.atKey) {
        tag = ctx.schema[identity.SCALAR];
      } else if (tagName)
        tag = findScalarTagByName(ctx.schema, value, tagName, tagToken, onError);
      else if (token.type === "scalar")
        tag = findScalarTagByTest(ctx, value, token, onError);
      else
        tag = ctx.schema[identity.SCALAR];
      let scalar;
      try {
        const res = tag.resolve(value, (msg) => onError(tagToken ?? token, "TAG_RESOLVE_FAILED", msg), ctx.options);
        scalar = identity.isScalar(res) ? res : new Scalar.Scalar(res);
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        onError(tagToken ?? token, "TAG_RESOLVE_FAILED", msg);
        scalar = new Scalar.Scalar(value);
      }
      scalar.range = range;
      scalar.source = value;
      if (type)
        scalar.type = type;
      if (tagName)
        scalar.tag = tagName;
      if (tag.format)
        scalar.format = tag.format;
      if (comment)
        scalar.comment = comment;
      return scalar;
    }
    function findScalarTagByName(schema, value, tagName, tagToken, onError) {
      if (tagName === "!")
        return schema[identity.SCALAR];
      const matchWithTest = [];
      for (const tag of schema.tags) {
        if (!tag.collection && tag.tag === tagName) {
          if (tag.default && tag.test)
            matchWithTest.push(tag);
          else
            return tag;
        }
      }
      for (const tag of matchWithTest)
        if (tag.test?.test(value))
          return tag;
      const kt = schema.knownTags[tagName];
      if (kt && !kt.collection) {
        schema.tags.push(Object.assign({}, kt, { default: false, test: void 0 }));
        return kt;
      }
      onError(tagToken, "TAG_RESOLVE_FAILED", `Unresolved tag: ${tagName}`, tagName !== "tag:yaml.org,2002:str");
      return schema[identity.SCALAR];
    }
    function findScalarTagByTest({ atKey, directives, schema }, value, token, onError) {
      const tag = schema.tags.find((tag2) => (tag2.default === true || atKey && tag2.default === "key") && tag2.test?.test(value)) || schema[identity.SCALAR];
      if (schema.compat) {
        const compat = schema.compat.find((tag2) => tag2.default && tag2.test?.test(value)) ?? schema[identity.SCALAR];
        if (tag.tag !== compat.tag) {
          const ts = directives.tagString(tag.tag);
          const cs = directives.tagString(compat.tag);
          const msg = `Value may be parsed as either ${ts} or ${cs}`;
          onError(token, "TAG_RESOLVE_FAILED", msg, true);
        }
      }
      return tag;
    }
    exports.composeScalar = composeScalar;
  }
});

// node_modules/yaml/dist/compose/util-empty-scalar-position.js
var require_util_empty_scalar_position = __commonJS({
  "node_modules/yaml/dist/compose/util-empty-scalar-position.js"(exports) {
    "use strict";
    function emptyScalarPosition(offset, before, pos) {
      if (before) {
        pos ?? (pos = before.length);
        for (let i = pos - 1; i >= 0; --i) {
          let st = before[i];
          switch (st.type) {
            case "space":
            case "comment":
            case "newline":
              offset -= st.source.length;
              continue;
          }
          st = before[++i];
          while (st?.type === "space") {
            offset += st.source.length;
            st = before[++i];
          }
          break;
        }
      }
      return offset;
    }
    exports.emptyScalarPosition = emptyScalarPosition;
  }
});

// node_modules/yaml/dist/compose/compose-node.js
var require_compose_node = __commonJS({
  "node_modules/yaml/dist/compose/compose-node.js"(exports) {
    "use strict";
    var Alias = require_Alias();
    var identity = require_identity();
    var composeCollection = require_compose_collection();
    var composeScalar = require_compose_scalar();
    var resolveEnd = require_resolve_end();
    var utilEmptyScalarPosition = require_util_empty_scalar_position();
    var CN = { composeNode, composeEmptyNode };
    function composeNode(ctx, token, props, onError) {
      const atKey = ctx.atKey;
      const { spaceBefore, comment, anchor, tag } = props;
      let node;
      let isSrcToken = true;
      switch (token.type) {
        case "alias":
          node = composeAlias(ctx, token, onError);
          if (anchor || tag)
            onError(token, "ALIAS_PROPS", "An alias node must not specify any properties");
          break;
        case "scalar":
        case "single-quoted-scalar":
        case "double-quoted-scalar":
        case "block-scalar":
          node = composeScalar.composeScalar(ctx, token, tag, onError);
          if (anchor)
            node.anchor = anchor.source.substring(1);
          break;
        case "block-map":
        case "block-seq":
        case "flow-collection":
          try {
            node = composeCollection.composeCollection(CN, ctx, token, props, onError);
            if (anchor)
              node.anchor = anchor.source.substring(1);
          } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            onError(token, "RESOURCE_EXHAUSTION", message);
          }
          break;
        default: {
          const message = token.type === "error" ? token.message : `Unsupported token (type: ${token.type})`;
          onError(token, "UNEXPECTED_TOKEN", message);
          isSrcToken = false;
        }
      }
      node ?? (node = composeEmptyNode(ctx, token.offset, void 0, null, props, onError));
      if (anchor && node.anchor === "")
        onError(anchor, "BAD_ALIAS", "Anchor cannot be an empty string");
      if (atKey && ctx.options.stringKeys && (!identity.isScalar(node) || typeof node.value !== "string" || node.tag && node.tag !== "tag:yaml.org,2002:str")) {
        const msg = "With stringKeys, all keys must be strings";
        onError(tag ?? token, "NON_STRING_KEY", msg);
      }
      if (spaceBefore)
        node.spaceBefore = true;
      if (comment) {
        if (token.type === "scalar" && token.source === "")
          node.comment = comment;
        else
          node.commentBefore = comment;
      }
      if (ctx.options.keepSourceTokens && isSrcToken)
        node.srcToken = token;
      return node;
    }
    function composeEmptyNode(ctx, offset, before, pos, { spaceBefore, comment, anchor, tag, end }, onError) {
      const token = {
        type: "scalar",
        offset: utilEmptyScalarPosition.emptyScalarPosition(offset, before, pos),
        indent: -1,
        source: ""
      };
      const node = composeScalar.composeScalar(ctx, token, tag, onError);
      if (anchor) {
        node.anchor = anchor.source.substring(1);
        if (node.anchor === "")
          onError(anchor, "BAD_ALIAS", "Anchor cannot be an empty string");
      }
      if (spaceBefore)
        node.spaceBefore = true;
      if (comment) {
        node.comment = comment;
        node.range[2] = end;
      }
      return node;
    }
    function composeAlias({ options }, { offset, source, end }, onError) {
      const alias = new Alias.Alias(source.substring(1));
      if (alias.source === "")
        onError(offset, "BAD_ALIAS", "Alias cannot be an empty string");
      if (alias.source.endsWith(":"))
        onError(offset + source.length - 1, "BAD_ALIAS", "Alias ending in : is ambiguous", true);
      const valueEnd = offset + source.length;
      const re = resolveEnd.resolveEnd(end, valueEnd, options.strict, onError);
      alias.range = [offset, valueEnd, re.offset];
      if (re.comment)
        alias.comment = re.comment;
      return alias;
    }
    exports.composeEmptyNode = composeEmptyNode;
    exports.composeNode = composeNode;
  }
});

// node_modules/yaml/dist/compose/compose-doc.js
var require_compose_doc = __commonJS({
  "node_modules/yaml/dist/compose/compose-doc.js"(exports) {
    "use strict";
    var Document5 = require_Document();
    var composeNode = require_compose_node();
    var resolveEnd = require_resolve_end();
    var resolveProps = require_resolve_props();
    function composeDoc(options, directives, { offset, start, value, end }, onError) {
      const opts = Object.assign({ _directives: directives }, options);
      const doc = new Document5.Document(void 0, opts);
      const ctx = {
        atKey: false,
        atRoot: true,
        directives: doc.directives,
        options: doc.options,
        schema: doc.schema
      };
      const props = resolveProps.resolveProps(start, {
        indicator: "doc-start",
        next: value ?? end?.[0],
        offset,
        onError,
        parentIndent: 0,
        startOnNewline: true
      });
      if (props.found) {
        doc.directives.docStart = true;
        if (value && (value.type === "block-map" || value.type === "block-seq") && !props.hasNewline)
          onError(props.end, "MISSING_CHAR", "Block collection cannot start on same line with directives-end marker");
      }
      doc.contents = value ? composeNode.composeNode(ctx, value, props, onError) : composeNode.composeEmptyNode(ctx, props.end, start, null, props, onError);
      const contentEnd = doc.contents.range[2];
      const re = resolveEnd.resolveEnd(end, contentEnd, false, onError);
      if (re.comment)
        doc.comment = re.comment;
      doc.range = [offset, contentEnd, re.offset];
      return doc;
    }
    exports.composeDoc = composeDoc;
  }
});

// node_modules/yaml/dist/compose/composer.js
var require_composer = __commonJS({
  "node_modules/yaml/dist/compose/composer.js"(exports) {
    "use strict";
    var node_process = __require("process");
    var directives = require_directives();
    var Document5 = require_Document();
    var errors = require_errors();
    var identity = require_identity();
    var composeDoc = require_compose_doc();
    var resolveEnd = require_resolve_end();
    function getErrorPos(src) {
      if (typeof src === "number")
        return [src, src + 1];
      if (Array.isArray(src))
        return src.length === 2 ? src : [src[0], src[1]];
      const { offset, source } = src;
      return [offset, offset + (typeof source === "string" ? source.length : 1)];
    }
    function parsePrelude(prelude) {
      let comment = "";
      let atComment = false;
      let afterEmptyLine = false;
      for (let i = 0; i < prelude.length; ++i) {
        const source = prelude[i];
        switch (source[0]) {
          case "#":
            comment += (comment === "" ? "" : afterEmptyLine ? "\n\n" : "\n") + (source.substring(1) || " ");
            atComment = true;
            afterEmptyLine = false;
            break;
          case "%":
            if (prelude[i + 1]?.[0] !== "#")
              i += 1;
            atComment = false;
            break;
          default:
            if (!atComment)
              afterEmptyLine = true;
            atComment = false;
        }
      }
      return { comment, afterEmptyLine };
    }
    var Composer = class {
      constructor(options = {}) {
        this.doc = null;
        this.atDirectives = false;
        this.prelude = [];
        this.errors = [];
        this.warnings = [];
        this.onError = (source, code, message, warning) => {
          const pos = getErrorPos(source);
          if (warning)
            this.warnings.push(new errors.YAMLWarning(pos, code, message));
          else
            this.errors.push(new errors.YAMLParseError(pos, code, message));
        };
        this.directives = new directives.Directives({ version: options.version || "1.2" });
        this.options = options;
      }
      decorate(doc, afterDoc) {
        const { comment, afterEmptyLine } = parsePrelude(this.prelude);
        if (comment) {
          const dc = doc.contents;
          if (afterDoc) {
            doc.comment = doc.comment ? `${doc.comment}
${comment}` : comment;
          } else if (afterEmptyLine || doc.directives.docStart || !dc) {
            doc.commentBefore = comment;
          } else if (identity.isCollection(dc) && !dc.flow && dc.items.length > 0) {
            let it = dc.items[0];
            if (identity.isPair(it))
              it = it.key;
            const cb = it.commentBefore;
            it.commentBefore = cb ? `${comment}
${cb}` : comment;
          } else {
            const cb = dc.commentBefore;
            dc.commentBefore = cb ? `${comment}
${cb}` : comment;
          }
        }
        if (afterDoc) {
          for (let i = 0; i < this.errors.length; ++i)
            doc.errors.push(this.errors[i]);
          for (let i = 0; i < this.warnings.length; ++i)
            doc.warnings.push(this.warnings[i]);
        } else {
          doc.errors = this.errors;
          doc.warnings = this.warnings;
        }
        this.prelude = [];
        this.errors = [];
        this.warnings = [];
      }
      /**
       * Current stream status information.
       *
       * Mostly useful at the end of input for an empty stream.
       */
      streamInfo() {
        return {
          comment: parsePrelude(this.prelude).comment,
          directives: this.directives,
          errors: this.errors,
          warnings: this.warnings
        };
      }
      /**
       * Compose tokens into documents.
       *
       * @param forceDoc - If the stream contains no document, still emit a final document including any comments and directives that would be applied to a subsequent document.
       * @param endOffset - Should be set if `forceDoc` is also set, to set the document range end and to indicate errors correctly.
       */
      *compose(tokens, forceDoc = false, endOffset = -1) {
        for (const token of tokens)
          yield* this.next(token);
        yield* this.end(forceDoc, endOffset);
      }
      /** Advance the composer by one CST token. */
      *next(token) {
        if (node_process.env.LOG_STREAM)
          console.dir(token, { depth: null });
        switch (token.type) {
          case "directive":
            this.directives.add(token.source, (offset, message, warning) => {
              const pos = getErrorPos(token);
              pos[0] += offset;
              this.onError(pos, "BAD_DIRECTIVE", message, warning);
            });
            this.prelude.push(token.source);
            this.atDirectives = true;
            break;
          case "document": {
            const doc = composeDoc.composeDoc(this.options, this.directives, token, this.onError);
            if (this.atDirectives && !doc.directives.docStart)
              this.onError(token, "MISSING_CHAR", "Missing directives-end/doc-start indicator line");
            this.decorate(doc, false);
            if (this.doc)
              yield this.doc;
            this.doc = doc;
            this.atDirectives = false;
            break;
          }
          case "byte-order-mark":
          case "space":
            break;
          case "comment":
          case "newline":
            this.prelude.push(token.source);
            break;
          case "error": {
            const msg = token.source ? `${token.message}: ${JSON.stringify(token.source)}` : token.message;
            const error = new errors.YAMLParseError(getErrorPos(token), "UNEXPECTED_TOKEN", msg);
            if (this.atDirectives || !this.doc)
              this.errors.push(error);
            else
              this.doc.errors.push(error);
            break;
          }
          case "doc-end": {
            if (!this.doc) {
              const msg = "Unexpected doc-end without preceding document";
              this.errors.push(new errors.YAMLParseError(getErrorPos(token), "UNEXPECTED_TOKEN", msg));
              break;
            }
            this.doc.directives.docEnd = true;
            const end = resolveEnd.resolveEnd(token.end, token.offset + token.source.length, this.doc.options.strict, this.onError);
            this.decorate(this.doc, true);
            if (end.comment) {
              const dc = this.doc.comment;
              this.doc.comment = dc ? `${dc}
${end.comment}` : end.comment;
            }
            this.doc.range[2] = end.offset;
            break;
          }
          default:
            this.errors.push(new errors.YAMLParseError(getErrorPos(token), "UNEXPECTED_TOKEN", `Unsupported token ${token.type}`));
        }
      }
      /**
       * Call at end of input to yield any remaining document.
       *
       * @param forceDoc - If the stream contains no document, still emit a final document including any comments and directives that would be applied to a subsequent document.
       * @param endOffset - Should be set if `forceDoc` is also set, to set the document range end and to indicate errors correctly.
       */
      *end(forceDoc = false, endOffset = -1) {
        if (this.doc) {
          this.decorate(this.doc, true);
          yield this.doc;
          this.doc = null;
        } else if (forceDoc) {
          const opts = Object.assign({ _directives: this.directives }, this.options);
          const doc = new Document5.Document(void 0, opts);
          if (this.atDirectives)
            this.onError(endOffset, "MISSING_CHAR", "Missing directives-end indicator line");
          doc.range = [0, endOffset, endOffset];
          this.decorate(doc, false);
          yield doc;
        }
      }
    };
    exports.Composer = Composer;
  }
});

// node_modules/yaml/dist/parse/cst-scalar.js
var require_cst_scalar = __commonJS({
  "node_modules/yaml/dist/parse/cst-scalar.js"(exports) {
    "use strict";
    var resolveBlockScalar = require_resolve_block_scalar();
    var resolveFlowScalar = require_resolve_flow_scalar();
    var errors = require_errors();
    var stringifyString = require_stringifyString();
    function resolveAsScalar(token, strict = true, onError) {
      if (token) {
        const _onError = (pos, code, message) => {
          const offset = typeof pos === "number" ? pos : Array.isArray(pos) ? pos[0] : pos.offset;
          if (onError)
            onError(offset, code, message);
          else
            throw new errors.YAMLParseError([offset, offset + 1], code, message);
        };
        switch (token.type) {
          case "scalar":
          case "single-quoted-scalar":
          case "double-quoted-scalar":
            return resolveFlowScalar.resolveFlowScalar(token, strict, _onError);
          case "block-scalar":
            return resolveBlockScalar.resolveBlockScalar({ options: { strict } }, token, _onError);
        }
      }
      return null;
    }
    function createScalarToken(value, context) {
      const { implicitKey = false, indent, inFlow = false, offset = -1, type = "PLAIN" } = context;
      const source = stringifyString.stringifyString({ type, value }, {
        implicitKey,
        indent: indent > 0 ? " ".repeat(indent) : "",
        inFlow,
        options: { blockQuote: true, lineWidth: -1 }
      });
      const end = context.end ?? [
        { type: "newline", offset: -1, indent, source: "\n" }
      ];
      switch (source[0]) {
        case "|":
        case ">": {
          const he = source.indexOf("\n");
          const head = source.substring(0, he);
          const body = source.substring(he + 1) + "\n";
          const props = [
            { type: "block-scalar-header", offset, indent, source: head }
          ];
          if (!addEndtoBlockProps(props, end))
            props.push({ type: "newline", offset: -1, indent, source: "\n" });
          return { type: "block-scalar", offset, indent, props, source: body };
        }
        case '"':
          return { type: "double-quoted-scalar", offset, indent, source, end };
        case "'":
          return { type: "single-quoted-scalar", offset, indent, source, end };
        default:
          return { type: "scalar", offset, indent, source, end };
      }
    }
    function setScalarValue(token, value, context = {}) {
      let { afterKey = false, implicitKey = false, inFlow = false, type } = context;
      let indent = "indent" in token ? token.indent : null;
      if (afterKey && typeof indent === "number")
        indent += 2;
      if (!type)
        switch (token.type) {
          case "single-quoted-scalar":
            type = "QUOTE_SINGLE";
            break;
          case "double-quoted-scalar":
            type = "QUOTE_DOUBLE";
            break;
          case "block-scalar": {
            const header2 = token.props[0];
            if (header2.type !== "block-scalar-header")
              throw new Error("Invalid block scalar header");
            type = header2.source[0] === ">" ? "BLOCK_FOLDED" : "BLOCK_LITERAL";
            break;
          }
          default:
            type = "PLAIN";
        }
      const source = stringifyString.stringifyString({ type, value }, {
        implicitKey: implicitKey || indent === null,
        indent: indent !== null && indent > 0 ? " ".repeat(indent) : "",
        inFlow,
        options: { blockQuote: true, lineWidth: -1 }
      });
      switch (source[0]) {
        case "|":
        case ">":
          setBlockScalarValue(token, source);
          break;
        case '"':
          setFlowScalarValue(token, source, "double-quoted-scalar");
          break;
        case "'":
          setFlowScalarValue(token, source, "single-quoted-scalar");
          break;
        default:
          setFlowScalarValue(token, source, "scalar");
      }
    }
    function setBlockScalarValue(token, source) {
      const he = source.indexOf("\n");
      const head = source.substring(0, he);
      const body = source.substring(he + 1) + "\n";
      if (token.type === "block-scalar") {
        const header2 = token.props[0];
        if (header2.type !== "block-scalar-header")
          throw new Error("Invalid block scalar header");
        header2.source = head;
        token.source = body;
      } else {
        const { offset } = token;
        const indent = "indent" in token ? token.indent : -1;
        const props = [
          { type: "block-scalar-header", offset, indent, source: head }
        ];
        if (!addEndtoBlockProps(props, "end" in token ? token.end : void 0))
          props.push({ type: "newline", offset: -1, indent, source: "\n" });
        for (const key of Object.keys(token))
          if (key !== "type" && key !== "offset")
            delete token[key];
        Object.assign(token, { type: "block-scalar", indent, props, source: body });
      }
    }
    function addEndtoBlockProps(props, end) {
      if (end)
        for (const st of end)
          switch (st.type) {
            case "space":
            case "comment":
              props.push(st);
              break;
            case "newline":
              props.push(st);
              return true;
          }
      return false;
    }
    function setFlowScalarValue(token, source, type) {
      switch (token.type) {
        case "scalar":
        case "double-quoted-scalar":
        case "single-quoted-scalar":
          token.type = type;
          token.source = source;
          break;
        case "block-scalar": {
          const end = token.props.slice(1);
          let oa = source.length;
          if (token.props[0].type === "block-scalar-header")
            oa -= token.props[0].source.length;
          for (const tok of end)
            tok.offset += oa;
          delete token.props;
          Object.assign(token, { type, source, end });
          break;
        }
        case "block-map":
        case "block-seq": {
          const offset = token.offset + source.length;
          const nl = { type: "newline", offset, indent: token.indent, source: "\n" };
          delete token.items;
          Object.assign(token, { type, source, end: [nl] });
          break;
        }
        default: {
          const indent = "indent" in token ? token.indent : -1;
          const end = "end" in token && Array.isArray(token.end) ? token.end.filter((st) => st.type === "space" || st.type === "comment" || st.type === "newline") : [];
          for (const key of Object.keys(token))
            if (key !== "type" && key !== "offset")
              delete token[key];
          Object.assign(token, { type, indent, source, end });
        }
      }
    }
    exports.createScalarToken = createScalarToken;
    exports.resolveAsScalar = resolveAsScalar;
    exports.setScalarValue = setScalarValue;
  }
});

// node_modules/yaml/dist/parse/cst-stringify.js
var require_cst_stringify = __commonJS({
  "node_modules/yaml/dist/parse/cst-stringify.js"(exports) {
    "use strict";
    var stringify = (cst) => "type" in cst ? stringifyToken(cst) : stringifyItem(cst);
    function stringifyToken(token) {
      switch (token.type) {
        case "block-scalar": {
          let res = "";
          for (const tok of token.props)
            res += stringifyToken(tok);
          return res + token.source;
        }
        case "block-map":
        case "block-seq": {
          let res = "";
          for (const item of token.items)
            res += stringifyItem(item);
          return res;
        }
        case "flow-collection": {
          let res = token.start.source;
          for (const item of token.items)
            res += stringifyItem(item);
          for (const st of token.end)
            res += st.source;
          return res;
        }
        case "document": {
          let res = stringifyItem(token);
          if (token.end)
            for (const st of token.end)
              res += st.source;
          return res;
        }
        default: {
          let res = token.source;
          if ("end" in token && token.end)
            for (const st of token.end)
              res += st.source;
          return res;
        }
      }
    }
    function stringifyItem({ start, key, sep, value }) {
      let res = "";
      for (const st of start)
        res += st.source;
      if (key)
        res += stringifyToken(key);
      if (sep)
        for (const st of sep)
          res += st.source;
      if (value)
        res += stringifyToken(value);
      return res;
    }
    exports.stringify = stringify;
  }
});

// node_modules/yaml/dist/parse/cst-visit.js
var require_cst_visit = __commonJS({
  "node_modules/yaml/dist/parse/cst-visit.js"(exports) {
    "use strict";
    var BREAK = Symbol("break visit");
    var SKIP = Symbol("skip children");
    var REMOVE = Symbol("remove item");
    function visit2(cst, visitor) {
      if ("type" in cst && cst.type === "document")
        cst = { start: cst.start, value: cst.value };
      _visit(Object.freeze([]), cst, visitor);
    }
    visit2.BREAK = BREAK;
    visit2.SKIP = SKIP;
    visit2.REMOVE = REMOVE;
    visit2.itemAtPath = (cst, path8) => {
      let item = cst;
      for (const [field, index] of path8) {
        const tok = item?.[field];
        if (tok && "items" in tok) {
          item = tok.items[index];
        } else
          return void 0;
      }
      return item;
    };
    visit2.parentCollection = (cst, path8) => {
      const parent = visit2.itemAtPath(cst, path8.slice(0, -1));
      const field = path8[path8.length - 1][0];
      const coll = parent?.[field];
      if (coll && "items" in coll)
        return coll;
      throw new Error("Parent collection not found");
    };
    function _visit(path8, item, visitor) {
      let ctrl = visitor(item, path8);
      if (typeof ctrl === "symbol")
        return ctrl;
      for (const field of ["key", "value"]) {
        const token = item[field];
        if (token && "items" in token) {
          for (let i = 0; i < token.items.length; ++i) {
            const ci = _visit(Object.freeze(path8.concat([[field, i]])), token.items[i], visitor);
            if (typeof ci === "number")
              i = ci - 1;
            else if (ci === BREAK)
              return BREAK;
            else if (ci === REMOVE) {
              token.items.splice(i, 1);
              i -= 1;
            }
          }
          if (typeof ctrl === "function" && field === "key")
            ctrl = ctrl(item, path8);
        }
      }
      return typeof ctrl === "function" ? ctrl(item, path8) : ctrl;
    }
    exports.visit = visit2;
  }
});

// node_modules/yaml/dist/parse/cst.js
var require_cst = __commonJS({
  "node_modules/yaml/dist/parse/cst.js"(exports) {
    "use strict";
    var cstScalar = require_cst_scalar();
    var cstStringify = require_cst_stringify();
    var cstVisit = require_cst_visit();
    var BOM = "\uFEFF";
    var DOCUMENT = "";
    var FLOW_END = "";
    var SCALAR = "";
    var isCollection = (token) => !!token && "items" in token;
    var isScalar2 = (token) => !!token && (token.type === "scalar" || token.type === "single-quoted-scalar" || token.type === "double-quoted-scalar" || token.type === "block-scalar");
    function prettyToken(token) {
      switch (token) {
        case BOM:
          return "<BOM>";
        case DOCUMENT:
          return "<DOC>";
        case FLOW_END:
          return "<FLOW_END>";
        case SCALAR:
          return "<SCALAR>";
        default:
          return JSON.stringify(token);
      }
    }
    function tokenType(source) {
      switch (source) {
        case BOM:
          return "byte-order-mark";
        case DOCUMENT:
          return "doc-mode";
        case FLOW_END:
          return "flow-error-end";
        case SCALAR:
          return "scalar";
        case "---":
          return "doc-start";
        case "...":
          return "doc-end";
        case "":
        case "\n":
        case "\r\n":
          return "newline";
        case "-":
          return "seq-item-ind";
        case "?":
          return "explicit-key-ind";
        case ":":
          return "map-value-ind";
        case "{":
          return "flow-map-start";
        case "}":
          return "flow-map-end";
        case "[":
          return "flow-seq-start";
        case "]":
          return "flow-seq-end";
        case ",":
          return "comma";
      }
      switch (source[0]) {
        case " ":
        case "	":
          return "space";
        case "#":
          return "comment";
        case "%":
          return "directive-line";
        case "*":
          return "alias";
        case "&":
          return "anchor";
        case "!":
          return "tag";
        case "'":
          return "single-quoted-scalar";
        case '"':
          return "double-quoted-scalar";
        case "|":
        case ">":
          return "block-scalar-header";
      }
      return null;
    }
    exports.createScalarToken = cstScalar.createScalarToken;
    exports.resolveAsScalar = cstScalar.resolveAsScalar;
    exports.setScalarValue = cstScalar.setScalarValue;
    exports.stringify = cstStringify.stringify;
    exports.visit = cstVisit.visit;
    exports.BOM = BOM;
    exports.DOCUMENT = DOCUMENT;
    exports.FLOW_END = FLOW_END;
    exports.SCALAR = SCALAR;
    exports.isCollection = isCollection;
    exports.isScalar = isScalar2;
    exports.prettyToken = prettyToken;
    exports.tokenType = tokenType;
  }
});

// node_modules/yaml/dist/parse/lexer.js
var require_lexer = __commonJS({
  "node_modules/yaml/dist/parse/lexer.js"(exports) {
    "use strict";
    var cst = require_cst();
    function isEmpty(ch) {
      switch (ch) {
        case void 0:
        case " ":
        case "\n":
        case "\r":
        case "	":
          return true;
        default:
          return false;
      }
    }
    var hexDigits = new Set("0123456789ABCDEFabcdef");
    var tagChars = new Set("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-#;/?:@&=+$_.!~*'()");
    var flowIndicatorChars = new Set(",[]{}");
    var invalidAnchorChars = new Set(" ,[]{}\n\r	");
    var isNotAnchorChar = (ch) => !ch || invalidAnchorChars.has(ch);
    var Lexer = class {
      constructor() {
        this.atEnd = false;
        this.blockScalarIndent = -1;
        this.blockScalarKeep = false;
        this.buffer = "";
        this.flowKey = false;
        this.flowLevel = 0;
        this.indentNext = 0;
        this.indentValue = 0;
        this.lineEndPos = null;
        this.next = null;
        this.pos = 0;
      }
      /**
       * Generate YAML tokens from the `source` string. If `incomplete`,
       * a part of the last line may be left as a buffer for the next call.
       *
       * @returns A generator of lexical tokens
       */
      *lex(source, incomplete = false) {
        if (source) {
          if (typeof source !== "string")
            throw TypeError("source is not a string");
          this.buffer = this.buffer ? this.buffer + source : source;
          this.lineEndPos = null;
        }
        this.atEnd = !incomplete;
        let next = this.next ?? "stream";
        while (next && (incomplete || this.hasChars(1)))
          next = yield* this.parseNext(next);
      }
      atLineEnd() {
        let i = this.pos;
        let ch = this.buffer[i];
        while (ch === " " || ch === "	")
          ch = this.buffer[++i];
        if (!ch || ch === "#" || ch === "\n")
          return true;
        if (ch === "\r")
          return this.buffer[i + 1] === "\n";
        return false;
      }
      charAt(n) {
        return this.buffer[this.pos + n];
      }
      continueScalar(offset) {
        let ch = this.buffer[offset];
        if (this.indentNext > 0) {
          let indent = 0;
          while (ch === " ")
            ch = this.buffer[++indent + offset];
          if (ch === "\r") {
            const next = this.buffer[indent + offset + 1];
            if (next === "\n" || !next && !this.atEnd)
              return offset + indent + 1;
          }
          return ch === "\n" || indent >= this.indentNext || !ch && !this.atEnd ? offset + indent : -1;
        }
        if (ch === "-" || ch === ".") {
          const dt = this.buffer.substr(offset, 3);
          if ((dt === "---" || dt === "...") && isEmpty(this.buffer[offset + 3]))
            return -1;
        }
        return offset;
      }
      getLine() {
        let end = this.lineEndPos;
        if (typeof end !== "number" || end !== -1 && end < this.pos) {
          end = this.buffer.indexOf("\n", this.pos);
          this.lineEndPos = end;
        }
        if (end === -1)
          return this.atEnd ? this.buffer.substring(this.pos) : null;
        if (this.buffer[end - 1] === "\r")
          end -= 1;
        return this.buffer.substring(this.pos, end);
      }
      hasChars(n) {
        return this.pos + n <= this.buffer.length;
      }
      setNext(state) {
        this.buffer = this.buffer.substring(this.pos);
        this.pos = 0;
        this.lineEndPos = null;
        this.next = state;
        return null;
      }
      peek(n) {
        return this.buffer.substr(this.pos, n);
      }
      *parseNext(next) {
        switch (next) {
          case "stream":
            return yield* this.parseStream();
          case "line-start":
            return yield* this.parseLineStart();
          case "block-start":
            return yield* this.parseBlockStart();
          case "doc":
            return yield* this.parseDocument();
          case "flow":
            return yield* this.parseFlowCollection();
          case "quoted-scalar":
            return yield* this.parseQuotedScalar();
          case "block-scalar":
            return yield* this.parseBlockScalar();
          case "plain-scalar":
            return yield* this.parsePlainScalar();
        }
      }
      *parseStream() {
        let line = this.getLine();
        if (line === null)
          return this.setNext("stream");
        if (line[0] === cst.BOM) {
          yield* this.pushCount(1);
          line = line.substring(1);
        }
        if (line[0] === "%") {
          let dirEnd = line.length;
          let cs = line.indexOf("#");
          while (cs !== -1) {
            const ch = line[cs - 1];
            if (ch === " " || ch === "	") {
              dirEnd = cs - 1;
              break;
            } else {
              cs = line.indexOf("#", cs + 1);
            }
          }
          while (true) {
            const ch = line[dirEnd - 1];
            if (ch === " " || ch === "	")
              dirEnd -= 1;
            else
              break;
          }
          const n = (yield* this.pushCount(dirEnd)) + (yield* this.pushSpaces(true));
          yield* this.pushCount(line.length - n);
          this.pushNewline();
          return "stream";
        }
        if (this.atLineEnd()) {
          const sp = yield* this.pushSpaces(true);
          yield* this.pushCount(line.length - sp);
          yield* this.pushNewline();
          return "stream";
        }
        yield cst.DOCUMENT;
        return yield* this.parseLineStart();
      }
      *parseLineStart() {
        const ch = this.charAt(0);
        if (!ch && !this.atEnd)
          return this.setNext("line-start");
        if (ch === "-" || ch === ".") {
          if (!this.atEnd && !this.hasChars(4))
            return this.setNext("line-start");
          const s = this.peek(3);
          if ((s === "---" || s === "...") && isEmpty(this.charAt(3))) {
            yield* this.pushCount(3);
            this.indentValue = 0;
            this.indentNext = 0;
            return s === "---" ? "doc" : "stream";
          }
        }
        this.indentValue = yield* this.pushSpaces(false);
        if (this.indentNext > this.indentValue && !isEmpty(this.charAt(1)))
          this.indentNext = this.indentValue;
        return yield* this.parseBlockStart();
      }
      *parseBlockStart() {
        const [ch0, ch1] = this.peek(2);
        if (!ch1 && !this.atEnd)
          return this.setNext("block-start");
        if ((ch0 === "-" || ch0 === "?" || ch0 === ":") && isEmpty(ch1)) {
          const n = (yield* this.pushCount(1)) + (yield* this.pushSpaces(true));
          this.indentNext = this.indentValue + 1;
          this.indentValue += n;
          return "block-start";
        }
        return "doc";
      }
      *parseDocument() {
        yield* this.pushSpaces(true);
        const line = this.getLine();
        if (line === null)
          return this.setNext("doc");
        let n = yield* this.pushIndicators();
        switch (line[n]) {
          case "#":
            yield* this.pushCount(line.length - n);
          // fallthrough
          case void 0:
            yield* this.pushNewline();
            return yield* this.parseLineStart();
          case "{":
          case "[":
            yield* this.pushCount(1);
            this.flowKey = false;
            this.flowLevel = 1;
            return "flow";
          case "}":
          case "]":
            yield* this.pushCount(1);
            return "doc";
          case "*":
            yield* this.pushUntil(isNotAnchorChar);
            return "doc";
          case '"':
          case "'":
            return yield* this.parseQuotedScalar();
          case "|":
          case ">":
            n += yield* this.parseBlockScalarHeader();
            n += yield* this.pushSpaces(true);
            yield* this.pushCount(line.length - n);
            yield* this.pushNewline();
            return yield* this.parseBlockScalar();
          default:
            return yield* this.parsePlainScalar();
        }
      }
      *parseFlowCollection() {
        let nl, sp;
        let indent = -1;
        do {
          nl = yield* this.pushNewline();
          if (nl > 0) {
            sp = yield* this.pushSpaces(false);
            this.indentValue = indent = sp;
          } else {
            sp = 0;
          }
          sp += yield* this.pushSpaces(true);
        } while (nl + sp > 0);
        const line = this.getLine();
        if (line === null)
          return this.setNext("flow");
        if (indent !== -1 && indent < this.indentNext && line[0] !== "#" || indent === 0 && (line.startsWith("---") || line.startsWith("...")) && isEmpty(line[3])) {
          const atFlowEndMarker = indent === this.indentNext - 1 && this.flowLevel === 1 && (line[0] === "]" || line[0] === "}");
          if (!atFlowEndMarker) {
            this.flowLevel = 0;
            yield cst.FLOW_END;
            return yield* this.parseLineStart();
          }
        }
        let n = 0;
        while (line[n] === ",") {
          n += yield* this.pushCount(1);
          n += yield* this.pushSpaces(true);
          this.flowKey = false;
        }
        n += yield* this.pushIndicators();
        switch (line[n]) {
          case void 0:
            return "flow";
          case "#":
            yield* this.pushCount(line.length - n);
            return "flow";
          case "{":
          case "[":
            yield* this.pushCount(1);
            this.flowKey = false;
            this.flowLevel += 1;
            return "flow";
          case "}":
          case "]":
            yield* this.pushCount(1);
            this.flowKey = true;
            this.flowLevel -= 1;
            return this.flowLevel ? "flow" : "doc";
          case "*":
            yield* this.pushUntil(isNotAnchorChar);
            return "flow";
          case '"':
          case "'":
            this.flowKey = true;
            return yield* this.parseQuotedScalar();
          case ":": {
            const next = this.charAt(1);
            if (this.flowKey || isEmpty(next) || next === ",") {
              this.flowKey = false;
              yield* this.pushCount(1);
              yield* this.pushSpaces(true);
              return "flow";
            }
          }
          // fallthrough
          default:
            this.flowKey = false;
            return yield* this.parsePlainScalar();
        }
      }
      *parseQuotedScalar() {
        const quote = this.charAt(0);
        let end = this.buffer.indexOf(quote, this.pos + 1);
        if (quote === "'") {
          while (end !== -1 && this.buffer[end + 1] === "'")
            end = this.buffer.indexOf("'", end + 2);
        } else {
          while (end !== -1) {
            let n = 0;
            while (this.buffer[end - 1 - n] === "\\")
              n += 1;
            if (n % 2 === 0)
              break;
            end = this.buffer.indexOf('"', end + 1);
          }
        }
        const qb = this.buffer.substring(0, end);
        let nl = qb.indexOf("\n", this.pos);
        if (nl !== -1) {
          while (nl !== -1) {
            const cs = this.continueScalar(nl + 1);
            if (cs === -1)
              break;
            nl = qb.indexOf("\n", cs);
          }
          if (nl !== -1) {
            end = nl - (qb[nl - 1] === "\r" ? 2 : 1);
          }
        }
        if (end === -1) {
          if (!this.atEnd)
            return this.setNext("quoted-scalar");
          end = this.buffer.length;
        }
        yield* this.pushToIndex(end + 1, false);
        return this.flowLevel ? "flow" : "doc";
      }
      *parseBlockScalarHeader() {
        this.blockScalarIndent = -1;
        this.blockScalarKeep = false;
        let i = this.pos;
        while (true) {
          const ch = this.buffer[++i];
          if (ch === "+")
            this.blockScalarKeep = true;
          else if (ch > "0" && ch <= "9")
            this.blockScalarIndent = Number(ch) - 1;
          else if (ch !== "-")
            break;
        }
        return yield* this.pushUntil((ch) => isEmpty(ch) || ch === "#");
      }
      *parseBlockScalar() {
        let nl = this.pos - 1;
        let indent = 0;
        let ch;
        loop: for (let i2 = this.pos; ch = this.buffer[i2]; ++i2) {
          switch (ch) {
            case " ":
              indent += 1;
              break;
            case "\n":
              nl = i2;
              indent = 0;
              break;
            case "\r": {
              const next = this.buffer[i2 + 1];
              if (!next && !this.atEnd)
                return this.setNext("block-scalar");
              if (next === "\n")
                break;
            }
            // fallthrough
            default:
              break loop;
          }
        }
        if (!ch && !this.atEnd)
          return this.setNext("block-scalar");
        if (indent >= this.indentNext) {
          if (this.blockScalarIndent === -1)
            this.indentNext = indent;
          else {
            this.indentNext = this.blockScalarIndent + (this.indentNext === 0 ? 1 : this.indentNext);
          }
          do {
            const cs = this.continueScalar(nl + 1);
            if (cs === -1)
              break;
            nl = this.buffer.indexOf("\n", cs);
          } while (nl !== -1);
          if (nl === -1) {
            if (!this.atEnd)
              return this.setNext("block-scalar");
            nl = this.buffer.length;
          }
        }
        let i = nl + 1;
        ch = this.buffer[i];
        while (ch === " ")
          ch = this.buffer[++i];
        if (ch === "	") {
          while (ch === "	" || ch === " " || ch === "\r" || ch === "\n")
            ch = this.buffer[++i];
          nl = i - 1;
        } else if (!this.blockScalarKeep) {
          do {
            let i2 = nl - 1;
            let ch2 = this.buffer[i2];
            if (ch2 === "\r")
              ch2 = this.buffer[--i2];
            const lastChar = i2;
            while (ch2 === " ")
              ch2 = this.buffer[--i2];
            if (ch2 === "\n" && i2 >= this.pos && i2 + 1 + indent > lastChar)
              nl = i2;
            else
              break;
          } while (true);
        }
        yield cst.SCALAR;
        yield* this.pushToIndex(nl + 1, true);
        return yield* this.parseLineStart();
      }
      *parsePlainScalar() {
        const inFlow = this.flowLevel > 0;
        let end = this.pos - 1;
        let i = this.pos - 1;
        let ch;
        while (ch = this.buffer[++i]) {
          if (ch === ":") {
            const next = this.buffer[i + 1];
            if (isEmpty(next) || inFlow && flowIndicatorChars.has(next))
              break;
            end = i;
          } else if (isEmpty(ch)) {
            let next = this.buffer[i + 1];
            if (ch === "\r") {
              if (next === "\n") {
                i += 1;
                ch = "\n";
                next = this.buffer[i + 1];
              } else
                end = i;
            }
            if (next === "#" || inFlow && flowIndicatorChars.has(next))
              break;
            if (ch === "\n") {
              const cs = this.continueScalar(i + 1);
              if (cs === -1)
                break;
              i = Math.max(i, cs - 2);
            }
          } else {
            if (inFlow && flowIndicatorChars.has(ch))
              break;
            end = i;
          }
        }
        if (!ch && !this.atEnd)
          return this.setNext("plain-scalar");
        yield cst.SCALAR;
        yield* this.pushToIndex(end + 1, true);
        return inFlow ? "flow" : "doc";
      }
      *pushCount(n) {
        if (n > 0) {
          yield this.buffer.substr(this.pos, n);
          this.pos += n;
          return n;
        }
        return 0;
      }
      *pushToIndex(i, allowEmpty) {
        const s = this.buffer.slice(this.pos, i);
        if (s) {
          yield s;
          this.pos += s.length;
          return s.length;
        } else if (allowEmpty)
          yield "";
        return 0;
      }
      *pushIndicators() {
        let n = 0;
        loop: while (true) {
          switch (this.charAt(0)) {
            case "!":
              n += yield* this.pushTag();
              n += yield* this.pushSpaces(true);
              continue loop;
            case "&":
              n += yield* this.pushUntil(isNotAnchorChar);
              n += yield* this.pushSpaces(true);
              continue loop;
            case "-":
            // this is an error
            case "?":
            // this is an error outside flow collections
            case ":": {
              const inFlow = this.flowLevel > 0;
              const ch1 = this.charAt(1);
              if (isEmpty(ch1) || inFlow && flowIndicatorChars.has(ch1)) {
                if (!inFlow)
                  this.indentNext = this.indentValue + 1;
                else if (this.flowKey)
                  this.flowKey = false;
                n += yield* this.pushCount(1);
                n += yield* this.pushSpaces(true);
                continue loop;
              }
            }
          }
          break loop;
        }
        return n;
      }
      *pushTag() {
        if (this.charAt(1) === "<") {
          let i = this.pos + 2;
          let ch = this.buffer[i];
          while (!isEmpty(ch) && ch !== ">")
            ch = this.buffer[++i];
          return yield* this.pushToIndex(ch === ">" ? i + 1 : i, false);
        } else {
          let i = this.pos + 1;
          let ch = this.buffer[i];
          while (ch) {
            if (tagChars.has(ch))
              ch = this.buffer[++i];
            else if (ch === "%" && hexDigits.has(this.buffer[i + 1]) && hexDigits.has(this.buffer[i + 2])) {
              ch = this.buffer[i += 3];
            } else
              break;
          }
          return yield* this.pushToIndex(i, false);
        }
      }
      *pushNewline() {
        const ch = this.buffer[this.pos];
        if (ch === "\n")
          return yield* this.pushCount(1);
        else if (ch === "\r" && this.charAt(1) === "\n")
          return yield* this.pushCount(2);
        else
          return 0;
      }
      *pushSpaces(allowTabs) {
        let i = this.pos - 1;
        let ch;
        do {
          ch = this.buffer[++i];
        } while (ch === " " || allowTabs && ch === "	");
        const n = i - this.pos;
        if (n > 0) {
          yield this.buffer.substr(this.pos, n);
          this.pos = i;
        }
        return n;
      }
      *pushUntil(test) {
        let i = this.pos;
        let ch = this.buffer[i];
        while (!test(ch))
          ch = this.buffer[++i];
        return yield* this.pushToIndex(i, false);
      }
    };
    exports.Lexer = Lexer;
  }
});

// node_modules/yaml/dist/parse/line-counter.js
var require_line_counter = __commonJS({
  "node_modules/yaml/dist/parse/line-counter.js"(exports) {
    "use strict";
    var LineCounter = class {
      constructor() {
        this.lineStarts = [];
        this.addNewLine = (offset) => this.lineStarts.push(offset);
        this.linePos = (offset) => {
          let low = 0;
          let high = this.lineStarts.length;
          while (low < high) {
            const mid = low + high >> 1;
            if (this.lineStarts[mid] < offset)
              low = mid + 1;
            else
              high = mid;
          }
          if (this.lineStarts[low] === offset)
            return { line: low + 1, col: 1 };
          if (low === 0)
            return { line: 0, col: offset };
          const start = this.lineStarts[low - 1];
          return { line: low, col: offset - start + 1 };
        };
      }
    };
    exports.LineCounter = LineCounter;
  }
});

// node_modules/yaml/dist/parse/parser.js
var require_parser = __commonJS({
  "node_modules/yaml/dist/parse/parser.js"(exports) {
    "use strict";
    var node_process = __require("process");
    var cst = require_cst();
    var lexer = require_lexer();
    function includesToken(list, type) {
      for (let i = 0; i < list.length; ++i)
        if (list[i].type === type)
          return true;
      return false;
    }
    function findNonEmptyIndex(list) {
      for (let i = 0; i < list.length; ++i) {
        switch (list[i].type) {
          case "space":
          case "comment":
          case "newline":
            break;
          default:
            return i;
        }
      }
      return -1;
    }
    function isFlowToken(token) {
      switch (token?.type) {
        case "alias":
        case "scalar":
        case "single-quoted-scalar":
        case "double-quoted-scalar":
        case "flow-collection":
          return true;
        default:
          return false;
      }
    }
    function getPrevProps(parent) {
      switch (parent.type) {
        case "document":
          return parent.start;
        case "block-map": {
          const it = parent.items[parent.items.length - 1];
          return it.sep ?? it.start;
        }
        case "block-seq":
          return parent.items[parent.items.length - 1].start;
        /* istanbul ignore next should not happen */
        default:
          return [];
      }
    }
    function getFirstKeyStartProps(prev) {
      if (prev.length === 0)
        return [];
      let i = prev.length;
      loop: while (--i >= 0) {
        switch (prev[i].type) {
          case "doc-start":
          case "explicit-key-ind":
          case "map-value-ind":
          case "seq-item-ind":
          case "newline":
            break loop;
        }
      }
      while (prev[++i]?.type === "space") {
      }
      return prev.splice(i, prev.length);
    }
    function arrayPushArray(target, source) {
      if (source.length < 1e5)
        Array.prototype.push.apply(target, source);
      else
        for (let i = 0; i < source.length; ++i)
          target.push(source[i]);
    }
    function fixFlowSeqItems(fc) {
      if (fc.start.type === "flow-seq-start") {
        for (const it of fc.items) {
          if (it.sep && !it.value && !includesToken(it.start, "explicit-key-ind") && !includesToken(it.sep, "map-value-ind")) {
            if (it.key)
              it.value = it.key;
            delete it.key;
            if (isFlowToken(it.value)) {
              if (it.value.end)
                arrayPushArray(it.value.end, it.sep);
              else
                it.value.end = it.sep;
            } else
              arrayPushArray(it.start, it.sep);
            delete it.sep;
          }
        }
      }
    }
    var Parser = class {
      /**
       * @param onNewLine - If defined, called separately with the start position of
       *   each new line (in `parse()`, including the start of input).
       */
      constructor(onNewLine) {
        this.atNewLine = true;
        this.atScalar = false;
        this.indent = 0;
        this.offset = 0;
        this.onKeyLine = false;
        this.stack = [];
        this.source = "";
        this.type = "";
        this.lexer = new lexer.Lexer();
        this.onNewLine = onNewLine;
      }
      /**
       * Parse `source` as a YAML stream.
       * If `incomplete`, a part of the last line may be left as a buffer for the next call.
       *
       * Errors are not thrown, but yielded as `{ type: 'error', message }` tokens.
       *
       * @returns A generator of tokens representing each directive, document, and other structure.
       */
      *parse(source, incomplete = false) {
        if (this.onNewLine && this.offset === 0)
          this.onNewLine(0);
        for (const lexeme of this.lexer.lex(source, incomplete))
          yield* this.next(lexeme);
        if (!incomplete)
          yield* this.end();
      }
      /**
       * Advance the parser by the `source` of one lexical token.
       */
      *next(source) {
        this.source = source;
        if (node_process.env.LOG_TOKENS)
          console.log("|", cst.prettyToken(source));
        if (this.atScalar) {
          this.atScalar = false;
          yield* this.step();
          this.offset += source.length;
          return;
        }
        const type = cst.tokenType(source);
        if (!type) {
          const message = `Not a YAML token: ${source}`;
          yield* this.pop({ type: "error", offset: this.offset, message, source });
          this.offset += source.length;
        } else if (type === "scalar") {
          this.atNewLine = false;
          this.atScalar = true;
          this.type = "scalar";
        } else {
          this.type = type;
          yield* this.step();
          switch (type) {
            case "newline":
              this.atNewLine = true;
              this.indent = 0;
              if (this.onNewLine)
                this.onNewLine(this.offset + source.length);
              break;
            case "space":
              if (this.atNewLine && source[0] === " ")
                this.indent += source.length;
              break;
            case "explicit-key-ind":
            case "map-value-ind":
            case "seq-item-ind":
              if (this.atNewLine)
                this.indent += source.length;
              break;
            case "doc-mode":
            case "flow-error-end":
              return;
            default:
              this.atNewLine = false;
          }
          this.offset += source.length;
        }
      }
      /** Call at end of input to push out any remaining constructions */
      *end() {
        while (this.stack.length > 0)
          yield* this.pop();
      }
      get sourceToken() {
        const st = {
          type: this.type,
          offset: this.offset,
          indent: this.indent,
          source: this.source
        };
        return st;
      }
      *step() {
        const top = this.peek(1);
        if (this.type === "doc-end" && top?.type !== "doc-end") {
          while (this.stack.length > 0)
            yield* this.pop();
          this.stack.push({
            type: "doc-end",
            offset: this.offset,
            source: this.source
          });
          return;
        }
        if (!top)
          return yield* this.stream();
        switch (top.type) {
          case "document":
            return yield* this.document(top);
          case "alias":
          case "scalar":
          case "single-quoted-scalar":
          case "double-quoted-scalar":
            return yield* this.scalar(top);
          case "block-scalar":
            return yield* this.blockScalar(top);
          case "block-map":
            return yield* this.blockMap(top);
          case "block-seq":
            return yield* this.blockSequence(top);
          case "flow-collection":
            return yield* this.flowCollection(top);
          case "doc-end":
            return yield* this.documentEnd(top);
        }
        yield* this.pop();
      }
      peek(n) {
        return this.stack[this.stack.length - n];
      }
      *pop(error) {
        const token = error ?? this.stack.pop();
        if (!token) {
          const message = "Tried to pop an empty stack";
          yield { type: "error", offset: this.offset, source: "", message };
        } else if (this.stack.length === 0) {
          yield token;
        } else {
          const top = this.peek(1);
          if (token.type === "block-scalar") {
            token.indent = "indent" in top ? top.indent : 0;
          } else if (token.type === "flow-collection" && top.type === "document") {
            token.indent = 0;
          }
          if (token.type === "flow-collection")
            fixFlowSeqItems(token);
          switch (top.type) {
            case "document":
              top.value = token;
              break;
            case "block-scalar":
              top.props.push(token);
              break;
            case "block-map": {
              const it = top.items[top.items.length - 1];
              if (it.value) {
                top.items.push({ start: [], key: token, sep: [] });
                this.onKeyLine = true;
                return;
              } else if (it.sep) {
                it.value = token;
              } else {
                Object.assign(it, { key: token, sep: [] });
                this.onKeyLine = !it.explicitKey;
                return;
              }
              break;
            }
            case "block-seq": {
              const it = top.items[top.items.length - 1];
              if (it.value)
                top.items.push({ start: [], value: token });
              else
                it.value = token;
              break;
            }
            case "flow-collection": {
              const it = top.items[top.items.length - 1];
              if (!it || it.value)
                top.items.push({ start: [], key: token, sep: [] });
              else if (it.sep)
                it.value = token;
              else
                Object.assign(it, { key: token, sep: [] });
              return;
            }
            /* istanbul ignore next should not happen */
            default:
              yield* this.pop();
              yield* this.pop(token);
          }
          if ((top.type === "document" || top.type === "block-map" || top.type === "block-seq") && (token.type === "block-map" || token.type === "block-seq")) {
            const last = token.items[token.items.length - 1];
            if (last && !last.sep && !last.value && last.start.length > 0 && findNonEmptyIndex(last.start) === -1 && (token.indent === 0 || last.start.every((st) => st.type !== "comment" || st.indent < token.indent))) {
              if (top.type === "document")
                top.end = last.start;
              else
                top.items.push({ start: last.start });
              token.items.splice(-1, 1);
            }
          }
        }
      }
      *stream() {
        switch (this.type) {
          case "directive-line":
            yield { type: "directive", offset: this.offset, source: this.source };
            return;
          case "byte-order-mark":
          case "space":
          case "comment":
          case "newline":
            yield this.sourceToken;
            return;
          case "doc-mode":
          case "doc-start": {
            const doc = {
              type: "document",
              offset: this.offset,
              start: []
            };
            if (this.type === "doc-start")
              doc.start.push(this.sourceToken);
            this.stack.push(doc);
            return;
          }
        }
        yield {
          type: "error",
          offset: this.offset,
          message: `Unexpected ${this.type} token in YAML stream`,
          source: this.source
        };
      }
      *document(doc) {
        if (doc.value)
          return yield* this.lineEnd(doc);
        switch (this.type) {
          case "doc-start": {
            if (findNonEmptyIndex(doc.start) !== -1) {
              yield* this.pop();
              yield* this.step();
            } else
              doc.start.push(this.sourceToken);
            return;
          }
          case "anchor":
          case "tag":
          case "space":
          case "comment":
          case "newline":
            doc.start.push(this.sourceToken);
            return;
        }
        const bv = this.startBlockValue(doc);
        if (bv)
          this.stack.push(bv);
        else {
          yield {
            type: "error",
            offset: this.offset,
            message: `Unexpected ${this.type} token in YAML document`,
            source: this.source
          };
        }
      }
      *scalar(scalar) {
        if (this.type === "map-value-ind") {
          const prev = getPrevProps(this.peek(2));
          const start = getFirstKeyStartProps(prev);
          let sep;
          if (scalar.end) {
            sep = scalar.end;
            sep.push(this.sourceToken);
            delete scalar.end;
          } else
            sep = [this.sourceToken];
          const map = {
            type: "block-map",
            offset: scalar.offset,
            indent: scalar.indent,
            items: [{ start, key: scalar, sep }]
          };
          this.onKeyLine = true;
          this.stack[this.stack.length - 1] = map;
        } else
          yield* this.lineEnd(scalar);
      }
      *blockScalar(scalar) {
        switch (this.type) {
          case "space":
          case "comment":
          case "newline":
            scalar.props.push(this.sourceToken);
            return;
          case "scalar":
            scalar.source = this.source;
            this.atNewLine = true;
            this.indent = 0;
            if (this.onNewLine) {
              let nl = this.source.indexOf("\n") + 1;
              while (nl !== 0) {
                this.onNewLine(this.offset + nl);
                nl = this.source.indexOf("\n", nl) + 1;
              }
            }
            yield* this.pop();
            break;
          /* istanbul ignore next should not happen */
          default:
            yield* this.pop();
            yield* this.step();
        }
      }
      *blockMap(map) {
        const it = map.items[map.items.length - 1];
        switch (this.type) {
          case "newline":
            this.onKeyLine = false;
            if (it.value) {
              const end = "end" in it.value ? it.value.end : void 0;
              const last = Array.isArray(end) ? end[end.length - 1] : void 0;
              if (last?.type === "comment")
                end?.push(this.sourceToken);
              else
                map.items.push({ start: [this.sourceToken] });
            } else if (it.sep) {
              it.sep.push(this.sourceToken);
            } else {
              it.start.push(this.sourceToken);
            }
            return;
          case "space":
          case "comment":
            if (it.value) {
              map.items.push({ start: [this.sourceToken] });
            } else if (it.sep) {
              it.sep.push(this.sourceToken);
            } else {
              if (this.atIndentedComment(it.start, map.indent)) {
                const prev = map.items[map.items.length - 2];
                const end = prev?.value?.end;
                if (Array.isArray(end)) {
                  arrayPushArray(end, it.start);
                  end.push(this.sourceToken);
                  map.items.pop();
                  return;
                }
              }
              it.start.push(this.sourceToken);
            }
            return;
        }
        if (this.indent >= map.indent) {
          const atMapIndent = !this.onKeyLine && this.indent === map.indent;
          const atNextItem = atMapIndent && (it.sep || it.explicitKey) && this.type !== "seq-item-ind";
          let start = [];
          if (atNextItem && it.sep && !it.value) {
            const nl = [];
            for (let i = 0; i < it.sep.length; ++i) {
              const st = it.sep[i];
              switch (st.type) {
                case "newline":
                  nl.push(i);
                  break;
                case "space":
                  break;
                case "comment":
                  if (st.indent > map.indent)
                    nl.length = 0;
                  break;
                default:
                  nl.length = 0;
              }
            }
            if (nl.length >= 2)
              start = it.sep.splice(nl[1]);
          }
          switch (this.type) {
            case "anchor":
            case "tag":
              if (atNextItem || it.value) {
                start.push(this.sourceToken);
                map.items.push({ start });
                this.onKeyLine = true;
              } else if (it.sep) {
                it.sep.push(this.sourceToken);
              } else {
                it.start.push(this.sourceToken);
              }
              return;
            case "explicit-key-ind":
              if (!it.sep && !it.explicitKey) {
                it.start.push(this.sourceToken);
                it.explicitKey = true;
              } else if (atNextItem || it.value) {
                start.push(this.sourceToken);
                map.items.push({ start, explicitKey: true });
              } else {
                this.stack.push({
                  type: "block-map",
                  offset: this.offset,
                  indent: this.indent,
                  items: [{ start: [this.sourceToken], explicitKey: true }]
                });
              }
              this.onKeyLine = true;
              return;
            case "map-value-ind":
              if (it.explicitKey) {
                if (!it.sep) {
                  if (includesToken(it.start, "newline")) {
                    Object.assign(it, { key: null, sep: [this.sourceToken] });
                  } else {
                    const start2 = getFirstKeyStartProps(it.start);
                    this.stack.push({
                      type: "block-map",
                      offset: this.offset,
                      indent: this.indent,
                      items: [{ start: start2, key: null, sep: [this.sourceToken] }]
                    });
                  }
                } else if (it.value) {
                  map.items.push({ start: [], key: null, sep: [this.sourceToken] });
                } else if (includesToken(it.sep, "map-value-ind")) {
                  this.stack.push({
                    type: "block-map",
                    offset: this.offset,
                    indent: this.indent,
                    items: [{ start, key: null, sep: [this.sourceToken] }]
                  });
                } else if (isFlowToken(it.key) && !includesToken(it.sep, "newline")) {
                  const start2 = getFirstKeyStartProps(it.start);
                  const key = it.key;
                  const sep = it.sep;
                  sep.push(this.sourceToken);
                  delete it.key;
                  delete it.sep;
                  this.stack.push({
                    type: "block-map",
                    offset: this.offset,
                    indent: this.indent,
                    items: [{ start: start2, key, sep }]
                  });
                } else if (start.length > 0) {
                  it.sep = it.sep.concat(start, this.sourceToken);
                } else {
                  it.sep.push(this.sourceToken);
                }
              } else {
                if (!it.sep) {
                  Object.assign(it, { key: null, sep: [this.sourceToken] });
                } else if (it.value || atNextItem) {
                  map.items.push({ start, key: null, sep: [this.sourceToken] });
                } else if (includesToken(it.sep, "map-value-ind")) {
                  this.stack.push({
                    type: "block-map",
                    offset: this.offset,
                    indent: this.indent,
                    items: [{ start: [], key: null, sep: [this.sourceToken] }]
                  });
                } else {
                  it.sep.push(this.sourceToken);
                }
              }
              this.onKeyLine = true;
              return;
            case "alias":
            case "scalar":
            case "single-quoted-scalar":
            case "double-quoted-scalar": {
              const fs7 = this.flowScalar(this.type);
              if (atNextItem || it.value) {
                map.items.push({ start, key: fs7, sep: [] });
                this.onKeyLine = true;
              } else if (it.sep) {
                this.stack.push(fs7);
              } else {
                Object.assign(it, { key: fs7, sep: [] });
                this.onKeyLine = true;
              }
              return;
            }
            default: {
              const bv = this.startBlockValue(map);
              if (bv) {
                if (bv.type === "block-seq") {
                  if (!it.explicitKey && it.sep && !includesToken(it.sep, "newline")) {
                    yield* this.pop({
                      type: "error",
                      offset: this.offset,
                      message: "Unexpected block-seq-ind on same line with key",
                      source: this.source
                    });
                    return;
                  }
                } else if (atMapIndent) {
                  map.items.push({ start });
                }
                this.stack.push(bv);
                return;
              }
            }
          }
        }
        yield* this.pop();
        yield* this.step();
      }
      *blockSequence(seq) {
        const it = seq.items[seq.items.length - 1];
        switch (this.type) {
          case "newline":
            if (it.value) {
              const end = "end" in it.value ? it.value.end : void 0;
              const last = Array.isArray(end) ? end[end.length - 1] : void 0;
              if (last?.type === "comment")
                end?.push(this.sourceToken);
              else
                seq.items.push({ start: [this.sourceToken] });
            } else
              it.start.push(this.sourceToken);
            return;
          case "space":
          case "comment":
            if (it.value)
              seq.items.push({ start: [this.sourceToken] });
            else {
              if (this.atIndentedComment(it.start, seq.indent)) {
                const prev = seq.items[seq.items.length - 2];
                const end = prev?.value?.end;
                if (Array.isArray(end)) {
                  arrayPushArray(end, it.start);
                  end.push(this.sourceToken);
                  seq.items.pop();
                  return;
                }
              }
              it.start.push(this.sourceToken);
            }
            return;
          case "anchor":
          case "tag":
            if (it.value || this.indent <= seq.indent)
              break;
            it.start.push(this.sourceToken);
            return;
          case "seq-item-ind":
            if (this.indent !== seq.indent)
              break;
            if (it.value || includesToken(it.start, "seq-item-ind"))
              seq.items.push({ start: [this.sourceToken] });
            else
              it.start.push(this.sourceToken);
            return;
        }
        if (this.indent > seq.indent) {
          const bv = this.startBlockValue(seq);
          if (bv) {
            this.stack.push(bv);
            return;
          }
        }
        yield* this.pop();
        yield* this.step();
      }
      *flowCollection(fc) {
        const it = fc.items[fc.items.length - 1];
        if (this.type === "flow-error-end") {
          let top;
          do {
            yield* this.pop();
            top = this.peek(1);
          } while (top?.type === "flow-collection");
        } else if (fc.end.length === 0) {
          switch (this.type) {
            case "comma":
            case "explicit-key-ind":
              if (!it || it.sep)
                fc.items.push({ start: [this.sourceToken] });
              else
                it.start.push(this.sourceToken);
              return;
            case "map-value-ind":
              if (!it || it.value)
                fc.items.push({ start: [], key: null, sep: [this.sourceToken] });
              else if (it.sep)
                it.sep.push(this.sourceToken);
              else
                Object.assign(it, { key: null, sep: [this.sourceToken] });
              return;
            case "space":
            case "comment":
            case "newline":
            case "anchor":
            case "tag":
              if (!it || it.value)
                fc.items.push({ start: [this.sourceToken] });
              else if (it.sep)
                it.sep.push(this.sourceToken);
              else
                it.start.push(this.sourceToken);
              return;
            case "alias":
            case "scalar":
            case "single-quoted-scalar":
            case "double-quoted-scalar": {
              const fs7 = this.flowScalar(this.type);
              if (!it || it.value)
                fc.items.push({ start: [], key: fs7, sep: [] });
              else if (it.sep)
                this.stack.push(fs7);
              else
                Object.assign(it, { key: fs7, sep: [] });
              return;
            }
            case "flow-map-end":
            case "flow-seq-end":
              fc.end.push(this.sourceToken);
              return;
          }
          const bv = this.startBlockValue(fc);
          if (bv)
            this.stack.push(bv);
          else {
            yield* this.pop();
            yield* this.step();
          }
        } else {
          const parent = this.peek(2);
          if (parent.type === "block-map" && (this.type === "map-value-ind" && parent.indent === fc.indent || this.type === "newline" && !parent.items[parent.items.length - 1].sep)) {
            yield* this.pop();
            yield* this.step();
          } else if (this.type === "map-value-ind" && parent.type !== "flow-collection") {
            const prev = getPrevProps(parent);
            const start = getFirstKeyStartProps(prev);
            fixFlowSeqItems(fc);
            const sep = fc.end.splice(1, fc.end.length);
            sep.push(this.sourceToken);
            const map = {
              type: "block-map",
              offset: fc.offset,
              indent: fc.indent,
              items: [{ start, key: fc, sep }]
            };
            this.onKeyLine = true;
            this.stack[this.stack.length - 1] = map;
          } else {
            yield* this.lineEnd(fc);
          }
        }
      }
      flowScalar(type) {
        if (this.onNewLine) {
          let nl = this.source.indexOf("\n") + 1;
          while (nl !== 0) {
            this.onNewLine(this.offset + nl);
            nl = this.source.indexOf("\n", nl) + 1;
          }
        }
        return {
          type,
          offset: this.offset,
          indent: this.indent,
          source: this.source
        };
      }
      startBlockValue(parent) {
        switch (this.type) {
          case "alias":
          case "scalar":
          case "single-quoted-scalar":
          case "double-quoted-scalar":
            return this.flowScalar(this.type);
          case "block-scalar-header":
            return {
              type: "block-scalar",
              offset: this.offset,
              indent: this.indent,
              props: [this.sourceToken],
              source: ""
            };
          case "flow-map-start":
          case "flow-seq-start":
            return {
              type: "flow-collection",
              offset: this.offset,
              indent: this.indent,
              start: this.sourceToken,
              items: [],
              end: []
            };
          case "seq-item-ind":
            return {
              type: "block-seq",
              offset: this.offset,
              indent: this.indent,
              items: [{ start: [this.sourceToken] }]
            };
          case "explicit-key-ind": {
            this.onKeyLine = true;
            const prev = getPrevProps(parent);
            const start = getFirstKeyStartProps(prev);
            start.push(this.sourceToken);
            return {
              type: "block-map",
              offset: this.offset,
              indent: this.indent,
              items: [{ start, explicitKey: true }]
            };
          }
          case "map-value-ind": {
            this.onKeyLine = true;
            const prev = getPrevProps(parent);
            const start = getFirstKeyStartProps(prev);
            return {
              type: "block-map",
              offset: this.offset,
              indent: this.indent,
              items: [{ start, key: null, sep: [this.sourceToken] }]
            };
          }
        }
        return null;
      }
      atIndentedComment(start, indent) {
        if (this.type !== "comment")
          return false;
        if (this.indent <= indent)
          return false;
        return start.every((st) => st.type === "newline" || st.type === "space");
      }
      *documentEnd(docEnd) {
        if (this.type !== "doc-mode") {
          if (docEnd.end)
            docEnd.end.push(this.sourceToken);
          else
            docEnd.end = [this.sourceToken];
          if (this.type === "newline")
            yield* this.pop();
        }
      }
      *lineEnd(token) {
        switch (this.type) {
          case "comma":
          case "doc-start":
          case "doc-end":
          case "flow-seq-end":
          case "flow-map-end":
          case "map-value-ind":
            yield* this.pop();
            yield* this.step();
            break;
          case "newline":
            this.onKeyLine = false;
          // fallthrough
          case "space":
          case "comment":
          default:
            if (token.end)
              token.end.push(this.sourceToken);
            else
              token.end = [this.sourceToken];
            if (this.type === "newline")
              yield* this.pop();
        }
      }
    };
    exports.Parser = Parser;
  }
});

// node_modules/yaml/dist/public-api.js
var require_public_api = __commonJS({
  "node_modules/yaml/dist/public-api.js"(exports) {
    "use strict";
    var composer = require_composer();
    var Document5 = require_Document();
    var errors = require_errors();
    var log2 = require_log();
    var identity = require_identity();
    var lineCounter = require_line_counter();
    var parser = require_parser();
    function parseOptions(options) {
      const prettyErrors = options.prettyErrors !== false;
      const lineCounter$1 = options.lineCounter || prettyErrors && new lineCounter.LineCounter() || null;
      return { lineCounter: lineCounter$1, prettyErrors };
    }
    function parseAllDocuments(source, options = {}) {
      const { lineCounter: lineCounter2, prettyErrors } = parseOptions(options);
      const parser$1 = new parser.Parser(lineCounter2?.addNewLine);
      const composer$1 = new composer.Composer(options);
      const docs = Array.from(composer$1.compose(parser$1.parse(source)));
      if (prettyErrors && lineCounter2)
        for (const doc of docs) {
          doc.errors.forEach(errors.prettifyError(source, lineCounter2));
          doc.warnings.forEach(errors.prettifyError(source, lineCounter2));
        }
      if (docs.length > 0)
        return docs;
      return Object.assign([], { empty: true }, composer$1.streamInfo());
    }
    function parseDocument3(source, options = {}) {
      const { lineCounter: lineCounter2, prettyErrors } = parseOptions(options);
      const parser$1 = new parser.Parser(lineCounter2?.addNewLine);
      const composer$1 = new composer.Composer(options);
      let doc = null;
      for (const _doc of composer$1.compose(parser$1.parse(source), true, source.length)) {
        if (!doc)
          doc = _doc;
        else if (doc.options.logLevel !== "silent") {
          doc.errors.push(new errors.YAMLParseError(_doc.range.slice(0, 2), "MULTIPLE_DOCS", "Source contains multiple documents; please use YAML.parseAllDocuments()"));
          break;
        }
      }
      if (prettyErrors && lineCounter2) {
        doc.errors.forEach(errors.prettifyError(source, lineCounter2));
        doc.warnings.forEach(errors.prettifyError(source, lineCounter2));
      }
      return doc;
    }
    function parse4(src, reviver, options) {
      let _reviver = void 0;
      if (typeof reviver === "function") {
        _reviver = reviver;
      } else if (options === void 0 && reviver && typeof reviver === "object") {
        options = reviver;
      }
      const doc = parseDocument3(src, options);
      if (!doc)
        return null;
      doc.warnings.forEach((warning) => log2.warn(doc.options.logLevel, warning));
      if (doc.errors.length > 0) {
        if (doc.options.logLevel !== "silent")
          throw doc.errors[0];
        else
          doc.errors = [];
      }
      return doc.toJS(Object.assign({ reviver: _reviver }, options));
    }
    function stringify(value, replacer, options) {
      let _replacer = null;
      if (typeof replacer === "function" || Array.isArray(replacer)) {
        _replacer = replacer;
      } else if (options === void 0 && replacer) {
        options = replacer;
      }
      if (typeof options === "string")
        options = options.length;
      if (typeof options === "number") {
        const indent = Math.round(options);
        options = indent < 1 ? void 0 : indent > 8 ? { indent: 8 } : { indent };
      }
      if (value === void 0) {
        const { keepUndefined } = options ?? replacer ?? {};
        if (!keepUndefined)
          return void 0;
      }
      if (identity.isDocument(value) && !_replacer)
        return value.toString(options);
      return new Document5.Document(value, _replacer, options).toString(options);
    }
    exports.parse = parse4;
    exports.parseAllDocuments = parseAllDocuments;
    exports.parseDocument = parseDocument3;
    exports.stringify = stringify;
  }
});

// node_modules/yaml/dist/index.js
var require_dist = __commonJS({
  "node_modules/yaml/dist/index.js"(exports) {
    "use strict";
    var composer = require_composer();
    var Document5 = require_Document();
    var Schema = require_Schema();
    var errors = require_errors();
    var Alias = require_Alias();
    var identity = require_identity();
    var Pair = require_Pair();
    var Scalar = require_Scalar();
    var YAMLMap = require_YAMLMap();
    var YAMLSeq = require_YAMLSeq();
    var cst = require_cst();
    var lexer = require_lexer();
    var lineCounter = require_line_counter();
    var parser = require_parser();
    var publicApi = require_public_api();
    var visit2 = require_visit();
    exports.Composer = composer.Composer;
    exports.Document = Document5.Document;
    exports.Schema = Schema.Schema;
    exports.YAMLError = errors.YAMLError;
    exports.YAMLParseError = errors.YAMLParseError;
    exports.YAMLWarning = errors.YAMLWarning;
    exports.Alias = Alias.Alias;
    exports.isAlias = identity.isAlias;
    exports.isCollection = identity.isCollection;
    exports.isDocument = identity.isDocument;
    exports.isMap = identity.isMap;
    exports.isNode = identity.isNode;
    exports.isPair = identity.isPair;
    exports.isScalar = identity.isScalar;
    exports.isSeq = identity.isSeq;
    exports.Pair = Pair.Pair;
    exports.Scalar = Scalar.Scalar;
    exports.YAMLMap = YAMLMap.YAMLMap;
    exports.YAMLSeq = YAMLSeq.YAMLSeq;
    exports.CST = cst;
    exports.Lexer = lexer.Lexer;
    exports.LineCounter = lineCounter.LineCounter;
    exports.Parser = parser.Parser;
    exports.parse = publicApi.parse;
    exports.parseAllDocuments = publicApi.parseAllDocuments;
    exports.parseDocument = publicApi.parseDocument;
    exports.stringify = publicApi.stringify;
    exports.visit = visit2.visit;
    exports.visitAsync = visit2.visitAsync;
  }
});

// src/cli/main.ts
import path7 from "node:path";

// src/adapters/host.ts
import { execFileSync, spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
function which(cmd) {
  for (const dir of (process.env.PATH ?? "").split(path.delimiter)) {
    for (const ext of process.platform === "win32" ? [".exe", ".cmd", ""] : [""]) {
      const p = path.join(dir, cmd + ext);
      try {
        if (fs.statSync(p).isFile()) return p;
      } catch {
      }
    }
  }
  return null;
}
function quartoBin() {
  const env = process.env.QUARTO_BIN_PATH;
  if (env) {
    const p = path.join(env, process.platform === "win32" ? "quarto.exe" : "quarto");
    if (fs.existsSync(p)) return p;
  }
  return which("quarto") ?? "quarto";
}
function pandocCommand() {
  if (process.env.VERSO_TRANSLATE_PANDOC) return { cmd: process.env.VERSO_TRANSLATE_PANDOC, args: [] };
  const q = quartoBin();
  try {
    const real = fs.realpathSync(q);
    const p = path.join(path.dirname(real), "tools", process.platform === "win32" ? "pandoc.exe" : "pandoc");
    if (fs.existsSync(p)) return { cmd: p, args: [] };
    const p2 = path.join(path.dirname(real), "tools", process.arch === "arm64" ? "aarch64" : "x86_64", "pandoc");
    if (fs.existsSync(p2)) return { cmd: p2, args: [] };
  } catch {
  }
  return { cmd: q, args: ["pandoc"] };
}
function run(cmd, args, input, cwd) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { cwd, stdio: ["pipe", "pipe", "pipe"] });
    let stdout = "";
    let stderr = "";
    child.stdout.setEncoding("utf8").on("data", (d) => stdout += d);
    child.stderr.setEncoding("utf8").on("data", (d) => stderr += d);
    child.on("error", reject);
    child.on("close", (code) => resolve({ code: code ?? 1, stdout, stderr }));
    child.stdin.end(input ?? "");
  });
}
function renderMode() {
  const preview = underPreview();
  if (preview) return { full: false, preview, reason: "quarto preview" };
  if (!process.env.QUARTO_PROJECT_RENDER_ALL) return { full: false, preview, reason: "single-file render" };
  return { full: true, preview, reason: "full render" };
}
function underPreview() {
  if (process.platform === "win32") return false;
  try {
    let pid = process.ppid;
    for (let i = 0; i < 6 && pid > 1; i++) {
      const out = execFileSync("ps", ["-o", "ppid=,args=", "-p", String(pid)], { encoding: "utf8" }).trim();
      const m = /^(\d+)\s+(.*)$/.exec(out);
      if (!m) break;
      if (/\bquarto(\.js)?\b.*\bpreview\b/.test(m[2])) return true;
      pid = Number(m[1]);
    }
  } catch {
  }
  return false;
}
async function renderProject(dir, onLine) {
  const env = { ...process.env };
  for (const k of Object.keys(env)) if (k.startsWith("QUARTO_PROJECT_")) delete env[k];
  return new Promise((resolve, reject) => {
    const child = spawn(quartoBin(), ["render"], { cwd: dir, env, stdio: ["ignore", "pipe", "pipe"] });
    let stderr = "";
    const feed = (d) => {
      for (const l of d.split("\n")) if (l.trim()) onLine?.(l);
    };
    child.stdout.setEncoding("utf8").on("data", feed);
    child.stderr.setEncoding("utf8").on("data", (d) => {
      stderr += d;
      feed(d);
    });
    child.on("error", reject);
    child.on("close", (code) => resolve({ code: code ?? 1, stderr }));
  });
}
function failingCell(stderr) {
  const plain = stderr.replace(/\x1b\[[0-9;]*m/g, "");
  let m = /Quitting from (?:lines \d+-\d+ \[([^\]]+)\] \(([^)]+)\)|([^\s:]+):\d+-\d+ \[([^\]]+)\])/.exec(plain);
  if (m) return m[1] ? { label: m[1], file: m[2] } : { label: m[4], file: m[3] };
  m = /Cell \d+\/\d+: '([^']+)'/.exec(plain);
  if (m) {
    const f = /(?:Starting|Executing) '?([^\s']+\.(?:qmd|ipynb))'?/.exec(plain);
    return { label: m[1], file: f?.[1] };
  }
  return null;
}

// src/cli/build.ts
import fs3 from "node:fs";
import path3 from "node:path";

// src/core/materialise.ts
var import_yaml = __toESM(require_dist(), 1);

// src/core/align.ts
function align(a, b, keyA, keyB, pairable = () => true) {
  const n = a.length;
  const m = b.length;
  const ka = a.map(keyA);
  const kb = b.map(keyB);
  const L = Array.from({ length: n + 1 }, () => new Uint32Array(m + 1));
  for (let i2 = n - 1; i2 >= 0; i2--) {
    for (let j2 = m - 1; j2 >= 0; j2--) {
      L[i2][j2] = ka[i2] === kb[j2] ? L[i2 + 1][j2 + 1] + 1 : Math.max(L[i2 + 1][j2], L[i2][j2 + 1]);
    }
  }
  const ops = [];
  let i = 0;
  let j = 0;
  let dels = [];
  let ins = [];
  const flush = () => {
    const usedIns = /* @__PURE__ */ new Set();
    const pending = [];
    for (const d of dels) {
      const k = ins.find((x) => !usedIns.has(x) && pairable(a[d], b[x]));
      if (k !== void 0) {
        usedIns.add(k);
        pending.push({ op: "replace", a: d, b: k });
      } else {
        pending.push({ op: "delete", a: d });
      }
    }
    for (const x of ins) if (!usedIns.has(x)) pending.push({ op: "insert", b: x });
    pending.sort((p, q) => posB(p) - posB(q));
    ops.push(...pending);
    dels = [];
    ins = [];
  };
  while (i < n || j < m) {
    if (i < n && j < m && ka[i] === kb[j]) {
      flush();
      ops.push({ op: "equal", a: i, b: j });
      i++;
      j++;
    } else if (j < m && (i >= n || L[i][j + 1] >= L[i + 1][j])) {
      ins.push(j++);
    } else {
      dels.push(i++);
    }
  }
  flush();
  return ops;
}
function posB(op) {
  return op.op === "delete" ? -1 : op.b;
}

// src/core/hash.ts
var encoder = new TextEncoder();
function fnv1a(s) {
  let h = 2166136261;
  for (const byte of encoder.encode(s)) {
    h ^= byte;
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h.toString(16).padStart(8, "0");
}
function normalise(s) {
  return s.normalize("NFC").replace(/\s+/g, " ").trim();
}
function textHash(s) {
  return fnv1a(normalise(s));
}
function codeHash(s) {
  return fnv1a(s.normalize("NFC").replace(/[ \t]+$/gm, "").trim());
}

// src/core/sync.ts
function syncUnits(file, units, tfile, opts = {}) {
  const stored = tfile?.units ?? [];
  const ops = align(
    stored,
    units,
    (s) => `${s.kind}:${s["source-hash"]}`,
    (u) => `${u.kind}:${u.hash}`,
    (s, u) => s.kind === u.kind
  );
  const used = new Set(stored.map((s) => s.id));
  const out = new Array(units.length);
  for (const op of ops) {
    if (op.op === "equal") {
      const s = stored[op.a];
      let status2 = hasText(s) ? "current" : "missing";
      if (status2 === "current" && termsChanged(s, opts.termHashes)) status2 = "stale";
      out[op.b] = { id: s.id, src: units[op.b], stored: s, status: status2 };
    } else if (op.op === "replace") {
      const s = stored[op.a];
      out[op.b] = { id: s.id, src: units[op.b], stored: s, status: hasText(s) ? "stale" : "missing" };
    } else if (op.op === "insert") {
      out[op.b] = { id: newId(file, units, op.b, used), src: units[op.b], status: "missing" };
    }
  }
  return out;
}
function hasText(s) {
  return typeof s.text === "string" && s.text.length > 0;
}
function termsChanged(s, hashes) {
  if (!s.terms || !hashes) return false;
  return Object.entries(s.terms).some(([k, h]) => hashes[k] !== void 0 && hashes[k] !== h);
}
function newId(file, units, i, used) {
  const occurrence = units.slice(0, i).filter((u) => u.hash === units[i].hash).length;
  let salt = 0;
  let id;
  do {
    id = "u" + fnv1a(`${file}\0${units[i].hash}\0${occurrence}\0${salt++}`).slice(0, 6);
  } while (used.has(id));
  used.add(id);
  return id;
}
function reviewCount(u) {
  if (u.status !== "current") return 0;
  return new Set((u.stored?.reviews ?? []).map((r) => r.by)).size;
}
function displayStatus(u) {
  if (u.status === "missing") return "missing";
  if (u.status === "stale") return "stale";
  return reviewCount(u) > 0 ? "reviewed" : "machine";
}
function toTFile(file, lang, synced) {
  return {
    source: file,
    lang,
    units: synced.map((u) => {
      if (u.stored) return u.stored;
      return blankUnit(u);
    })
  };
}
function blankUnit(u) {
  const s = u.src;
  const t = { id: u.id, kind: s.kind, "source-hash": s.hash };
  if (s.section) t.section = s.section;
  if (s.cell) t.cell = s.cell;
  if (s.field) t.field = s.field;
  t.source = s.source;
  t.reviews = [];
  return t;
}
function translatedUnit(u, text, origin, terms) {
  const t = blankUnit(u);
  t.text = text;
  if (terms && Object.keys(terms).length) t.terms = terms;
  t.origin = origin;
  t.reviews = [];
  return t;
}

// src/core/protect.ts
var PATTERNS = [
  /\[[^\]\n]*\]\{[^}\n]*\bverso-translate\s*=\s*"?false"?[^}\n]*\}/y,
  // [text]{verso-translate=false}
  /(`+)(?:(?!\1)[\s\S])+?\1(?!`)/y,
  // inline code
  /\$\$[\s\S]+?\$\$/y,
  // display math
  /\$(?=\S)[^$\n]*?\S\$(?!\d)/y,
  // inline math
  /\{\{[<%][\s\S]*?[>%]\}\}/y,
  // shortcodes
  /<!--[\s\S]*?-->/y,
  // HTML comments
  /<\/?[A-Za-z][A-Za-z0-9-]*(?:\s[^<>]*)?\/?>/y,
  // HTML tags
  /<(?:https?|mailto|ftp):[^\s<>]*>/y,
  // autolinks
  /\]\((?:[^()\s]|\([^()\s]*\))*(?:\s+(?:"[^"]*"|'[^']*'))?\)/y,
  // ](target "title")
  /\]\[[^\]\n]*\]/y,
  // ][reference]
  /\{(?:[#.][^}\n]*|[^}\n]*=[^}\n]*)\}/y,
  // attribute blocks {#id .class k=v}
  /\[\^[^\]\s]+\]/y,
  // footnote reference
  /\[-?@[^\]\n]*\]/y,
  // [@citation; @other]
  /(?<![\w@.])-?@[A-Za-z0-9_][\w:.#$%&\-+?<>~/]*[A-Za-z0-9_]/y,
  // @key, @fig-x
  /\\./y
  // backslash escapes
];
function scan(text) {
  const tokens = [];
  const parts = [];
  let buf = "";
  let i = 0;
  outer: while (i < text.length) {
    for (const re of PATTERNS) {
      re.lastIndex = i;
      const m = re.exec(text);
      if (m && m[0].length > 0) {
        if (buf) parts.push(buf);
        buf = "";
        parts.push(tokens.length);
        tokens.push(m[0]);
        i += m[0].length;
        continue outer;
      }
    }
    buf += text[i++];
  }
  if (buf) parts.push(buf);
  return { tokens, parts };
}
function protectedTokens(text) {
  return scan(text).tokens.filter((t) => !/^\\.$/.test(t));
}
function protect(text) {
  const { tokens, parts } = scan(text);
  const masked = parts.map((p) => typeof p === "number" ? `\u27E6${p}\u27E7` : p).join("");
  return { masked, tokens };
}
function unprotect(masked, tokens) {
  const seen = /* @__PURE__ */ new Map();
  const text = masked.replace(/⟦(\d+)⟧/g, (_m, d) => {
    const k = Number(d);
    seen.set(k, (seen.get(k) ?? 0) + 1);
    return tokens[k] ?? `\u27E6${d}\u27E7`;
  });
  for (let k = 0; k < tokens.length; k++) {
    if (/^\\.$/.test(tokens[k])) continue;
    const c = seen.get(k) ?? 0;
    if (c !== 1) return { ok: false, error: `placeholder \u27E6${k}\u27E7 appears ${c} times (expected once)` };
  }
  for (const k of seen.keys()) {
    if (k >= tokens.length) return { ok: false, error: `unknown placeholder \u27E6${k}\u27E7` };
  }
  return { ok: true, text };
}
function sameTokens(source, text) {
  const a = protectedTokens(source).sort();
  const b = protectedTokens(text).sort();
  const extra = b.filter((t) => !a.includes(t));
  const lost = a.filter((t) => !b.includes(t));
  if (extra.length || lost.length || a.length !== b.length) {
    const msg = [];
    if (lost.length) msg.push(`missing ${lost.map(show).join(", ")}`);
    if (extra.length) msg.push(`not in source ${extra.map(show).join(", ")}`);
    if (!msg.length) msg.push("protected tokens repeated or dropped");
    return msg.join("; ");
  }
  return null;
}
function show(t) {
  return "`" + (t.length > 40 ? t.slice(0, 37) + "\u2026" : t) + "`";
}
function hasTranslatableText(text) {
  const { parts } = scan(text);
  return parts.some((p) => typeof p === "string" && new RegExp("\\p{L}", "u").test(p));
}

// src/core/skeleton.ts
function attrKey(attr) {
  if (!Array.isArray(attr)) return "";
  const [id, classes, kvs] = attr;
  const kv2 = kvs.filter(([k]) => k !== "data-pos" && k !== "wrapper");
  return JSON.stringify([id, classes, kv2]);
}
function inlineItems(inlines, out) {
  for (const x of inlines ?? []) {
    const t = x?.t;
    const c = x?.c;
    switch (t) {
      case "Code":
        out.push(`code ${attrKey(c[0])} ${c[1]}`);
        break;
      case "Math":
        out.push(`math ${c[0].t} ${c[1]}`);
        break;
      case "RawInline":
        out.push(`raw ${c[0]} ${c[1]}`);
        break;
      case "Link":
        out.push(`link ${attrKey(c[0])} ${c[2][0]}`);
        inlineItems(c[1], out);
        break;
      case "Image":
        out.push(`image ${attrKey(c[0])} ${c[2][0]}`);
        inlineItems(c[1], out);
        break;
      case "Span": {
        const k = attrKey(c[0]);
        if (k !== JSON.stringify(["", [], []])) out.push(`span ${k}`);
        inlineItems(c[1], out);
        break;
      }
      case "Cite":
        out.push(`cite ${c[0].map((ct) => ct.citationId).join(";")}`);
        inlineItems(c[1], out);
        break;
      case "Note":
        out.push("note");
        blockItems(c, out);
        break;
      case "Emph":
      case "Strong":
      case "Underline":
      case "Strikeout":
      case "Superscript":
      case "Subscript":
      case "SmallCaps":
        inlineItems(c, out);
        break;
      case "Quoted":
        inlineItems(c[1], out);
        break;
      default:
        break;
    }
  }
}
function blockItems(blocks, out) {
  for (const b of blocks ?? []) {
    if (b.t === "Para" || b.t === "Plain") inlineItems(b.c, out);
    else if (b.t === "Div") blockItems(b.c[1], out);
    else out.push(`block ${b.t}`);
  }
}
function shape(blocks) {
  return (blocks ?? []).map((b) => b.t === "Plain" ? "Para" : b.t).join(",");
}
function documentShape(blocks) {
  const out = [];
  const walk = (bs) => {
    for (const b of bs ?? []) {
      switch (b.t) {
        case "Div": {
          const kvs = b.c[0][2];
          if (kvs.some(([k]) => k === "wrapper")) {
            walk(b.c[1]);
            break;
          }
          out.push(`Div#${b.c[0][0]}.${b.c[0][1].join(".")}(`);
          walk(b.c[1]);
          out.push(")");
          break;
        }
        case "Header":
          out.push(`H${b.c[0]}`);
          break;
        case "BulletList":
        case "OrderedList": {
          const items = b.t === "BulletList" ? b.c : b.c[1];
          out.push(`${b.t}[${items.length}](`);
          for (const it of items) walk(it);
          out.push(")");
          break;
        }
        case "BlockQuote":
          out.push("Quote(");
          walk(b.c);
          out.push(")");
          break;
        case "CodeBlock":
          out.push(`Code.${b.c[0][1].join(".")}`);
          break;
        case "Plain":
        case "Para":
          out.push("P");
          break;
        default:
          out.push(b.t);
      }
    }
  };
  walk(blocks);
  return out.join(" ");
}
function compareSkeleton(src, tr) {
  if (shape(src) !== shape(tr)) return `block structure differs (${shape(src)} vs ${shape(tr)})`;
  const a = [];
  const b = [];
  blockItems(src, a);
  blockItems(tr, b);
  a.sort();
  b.sort();
  if (a.join("\n") !== b.join("\n")) {
    const lost = a.filter((x) => !b.includes(x));
    const extra = b.filter((x) => !a.includes(x));
    const parts = [];
    if (lost.length) parts.push(`missing ${lost.slice(0, 3).join(" | ")}`);
    if (extra.length) parts.push(`added ${extra.slice(0, 3).join(" | ")}`);
    if (!parts.length) parts.push("inline elements repeated or dropped");
    return `inline skeleton differs: ${parts.join("; ")}`;
  }
  return null;
}

// src/core/validate.ts
function normaliseBlockText(s) {
  return s.replace(/[ \t]*\r?\n[ \t]*/g, " ").trim();
}
function normaliseCode(s) {
  return s.replace(/\r\n?/g, "\n").replace(/\s+$/, "");
}
var FENCE = /^\s*(`{3,}|~{3,})/m;
var OPTION = /^\s*(#|\/\/|--|%%)\|/m;
function checkCode(src, text) {
  const t = normaliseCode(text);
  if (!t) return "empty translation";
  if (FENCE.test(t)) return "a code fence line would end the cell";
  if (OPTION.test(t)) return "cell option lines (#| \u2026) cannot be added or changed by a translation";
  if (/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(t)) return "control characters";
  if (t.length > src.length * 3 + 2e3) return "translation is much longer than the source cell";
  return null;
}
async function validate(cands, md) {
  const rejected = /* @__PURE__ */ new Map();
  for (const c of cands.filter((x) => x.src.kind === "code" && typeof x.text === "string")) {
    const r = checkCode(c.src.source, c.text);
    if (r) rejected.set(c.id, r);
  }
  const prose = cands.filter((c) => c.src.kind !== "code" && typeof c.text === "string");
  const toParse = [];
  for (const c of prose) {
    const text = normaliseBlockText(c.text);
    if (!text) {
      rejected.set(c.id, "empty translation");
      continue;
    }
    if (c.src.kind === "meta" && /[\r\n]/.test(c.text)) {
      rejected.set(c.id, "meta text must be one line");
      continue;
    }
    const r = sameTokens(c.src.source, text);
    if (r) rejected.set(c.id, r);
    else toParse.push(c);
  }
  if (toParse.length) {
    const parsed = await md.parseMany([...toParse.map((c) => c.src.source), ...toParse.map((c) => normaliseBlockText(c.text))]);
    toParse.forEach((c, k) => {
      const r = compareSkeleton(parsed[k], parsed[k + toParse.length]);
      if (r) rejected.set(c.id, r);
    });
  }
  return rejected;
}

// src/core/materialise.ts
function attrValue(s) {
  return s.replace(/"/g, "&quot;");
}
function materialise(text, synced, o) {
  const edits = [];
  const metaSet = [];
  const page = [];
  for (const u of synced) {
    const s = u.src;
    const reason = o.rejected?.get(u.id) ?? (o.reverted?.has(u.id) ? "reverted after an execution failure" : void 0);
    let status2 = displayStatus(u);
    const usable = u.status === "current" && !reason;
    if (u.status === "current" && reason) status2 = "missing";
    const st = u.stored;
    const previous = u.status === "stale" && o.onStale === "previous" && !reason ? st?.text : void 0;
    const pu = {
      id: u.id,
      kind: s.kind,
      status: status2,
      reviews: usable ? st?.reviews ?? [] : [],
      count: usable ? reviewCount(u) : 0,
      source: s.source,
      section: s.section,
      cell: s.cell,
      field: s.field,
      heading: s.heading,
      lang: s.lang,
      hash: s.hash,
      reason,
      by: usable ? st?.origin?.by : void 0,
      weight: s.source.length
    };
    if (u.status === "stale" && st) {
      pu.previous = st.text;
      pu.previousSource = st.source;
    }
    if (s.kind === "block") {
      const shown = usable ? normaliseBlockText(st.text) : previous !== void 0 ? normaliseBlockText(previous) : s.source;
      if (usable) pu.text = shown;
      const fallback = !usable && previous === void 0;
      const attrs = [`data-tr-id="${u.id}"`, `data-tr-status="${status2}"`, `data-tr-reviews="${pu.count}"`];
      if (fallback) attrs.push(`lang="${attrValue(o.sourceLang)}"`);
      if (s.heading) {
        const nl = text.indexOf("\n", s.range.end);
        const lineEnd = nl === -1 ? text.length : nl;
        const rest = text.slice(s.range.end, lineEnd);
        const m = /^(\s*)\{([^}]*)\}\s*$/.exec(rest);
        const inner = [m ? m[2].trim() : "", s.autoId ? `#${s.autoId}` : "", ...attrs].filter(Boolean).join(" ");
        edits.push({ start: s.range.start, end: lineEnd, text: `${shown} {${inner}}` });
      } else {
        edits.push({ start: s.range.start, end: s.range.end, text: `[${shown}]{.tr ${attrs.join(" ")}}` });
      }
    } else if (s.kind === "caption") {
      if (usable) {
        pu.text = normaliseBlockText(st.text);
        const line = text.slice(s.range.start, s.range.end);
        const prefix = /^#\|\s*/.exec(line)[0];
        edits.push({ start: s.range.start, end: s.range.end, text: `${prefix}${s.field}: ${JSON.stringify(pu.text)}` });
      }
    } else if (s.kind === "meta") {
      if (usable) {
        pu.text = normaliseBlockText(st.text);
        metaSet.push({ path: s.field.split(".").map((k) => /^\d+$/.test(k) ? Number(k) : k), value: pu.text });
      }
    } else if (s.kind === "code") {
      if (usable) {
        pu.text = normaliseCode(st.text);
        edits.push({ start: s.range.start, end: s.range.end, text: pu.text });
      }
    }
    page.push(pu);
  }
  let out = applyEdits(text, edits);
  out = setFrontMatter(out, metaSet, o.meta);
  return { text: out, units: page };
}
function applyEdits(text, edits) {
  let out = text;
  for (const e of [...edits].sort((a, b) => b.start - a.start)) out = out.slice(0, e.start) + e.text + out.slice(e.end);
  return out;
}
var FM = /^---[ \t]*\r?\n([\s\S]*?)\r?\n(?:---|\.\.\.)[ \t]*(?:\r?\n|$)/;
function setFrontMatter(text, set, extra) {
  if (!set.length && !extra) return text;
  const m = FM.exec(text);
  const doc = m ? (0, import_yaml.parseDocument)(m[1]) : new import_yaml.Document({});
  for (const s of set) doc.setIn(s.path, s.value);
  for (const [k, v] of Object.entries(extra ?? {})) doc.set(k, v);
  const yaml = doc.toString({ lineWidth: 0 }).trimEnd();
  const block = `---
${yaml}
---
`;
  return m ? block + text.slice(m[0].length) : block + "\n" + text;
}

// src/core/score.ts
var login = (by) => by?.startsWith("gh:") ? by.slice(3) : void 0;
function pageStats(units, target) {
  const total = units.reduce((n, u) => n + u.weight, 0) || 1;
  const share = (f) => units.filter(f).reduce((n, u) => n + u.weight, 0) / total;
  const shown = units.filter((u) => u.status === "machine" || u.status === "reviewed");
  const humanMade = (u) => u.by !== void 0 && u.by !== "llm";
  const people = /* @__PURE__ */ new Map();
  for (const u of shown) {
    const who = new Set([login(u.by), ...u.reviews.map((r) => login(r.by))].filter((x) => !!x));
    for (const w of who) people.set(w, (people.get(w) ?? 0) + 1);
  }
  return {
    units: units.length,
    translated: share((u) => u.status === "machine" || u.status === "reviewed"),
    reviewed: share((u) => u.count >= 1),
    full: share((u) => u.count >= target),
    fallback: share((u) => u.status === "stale" || u.status === "missing"),
    stale: units.filter((u) => u.status === "stale").length,
    missing: units.filter((u) => u.status === "missing").length,
    target,
    human: shown.filter(humanMade).length,
    verified: shown.filter((u) => !humanMade(u) && u.count >= 1).length,
    machine: shown.filter((u) => !humanMade(u) && u.count === 0).length,
    people: sortPeople(people)
  };
}
function sortPeople(m) {
  return [...m].map(([login2, units]) => ({ login: login2, units })).sort((a, b) => b.units - a.units || a.login.localeCompare(b.login));
}
function mergeStats(all, weights, target) {
  const W = weights.reduce((a, b) => a + b, 0) || 1;
  const avg = (k) => all.reduce((n, s, i) => n + s[k] * weights[i], 0) / W;
  const sum = (k) => all.reduce((n, s) => n + s[k], 0);
  const people = /* @__PURE__ */ new Map();
  for (const s of all) for (const c of s.people) people.set(c.login, (people.get(c.login) ?? 0) + c.units);
  return {
    units: sum("units"),
    translated: avg("translated"),
    reviewed: avg("reviewed"),
    full: avg("full"),
    fallback: avg("fallback"),
    stale: sum("stale"),
    missing: sum("missing"),
    target,
    human: sum("human"),
    verified: sum("verified"),
    machine: sum("machine"),
    people: sortPeople(people)
  };
}
function bannerState(s) {
  if (s.human + s.verified + s.machine === 0) return "untranslated";
  const all = s.units || 1;
  const touched = (s.human + s.verified) / all;
  if (touched < 0.2) return "machine";
  if (touched < 0.8) return "partial";
  return s.human / all >= 0.5 ? "human" : "reviewed";
}
function pct(x) {
  return `${Math.round(x * 100)}%`;
}

// src/core/strings.ts
var en = {
  bannerLabel: "About this translation",
  translatedFrom: "Translated from {src}",
  untranslated: "This page has not been translated yet and is shown in {src}.",
  state_untranslated: "Not translated yet",
  state_machine: "Machine translated",
  state_partial: "Partly reviewed by people",
  state_reviewed: "Reviewed by people",
  state_human: "Human translated and reviewed",
  readOriginal: "Read the original",
  segHuman: "{n} human translated",
  segVerified: "{n} machine translated, verified by people",
  segMachine: "{n} machine translated, not yet reviewed",
  segAllMachine: "The paragraph is machine translated||All {n} paragraphs machine translated",
  segFallback: "{n} not yet translated",
  thanks: "With thanks to {names} for helping with this page.",
  credit: "Translated and reviewed by {names}. Thank you all.",
  others: "{n} other||{n} others",
  nobody: "No one has reviewed this page yet. Help review the translation and be credited here.",
  ctaFirstTitle: "Read {lang}? Be the first to help.",
  ctaFirstBody: "Even approving a few paragraphs that read well tells future readers they can trust them.",
  ctaTitle: "Read {lang}? We\u2019d love your help.",
  ctaBody: "Approve a paragraph or suggest a better translation. Each one helps every reader after you.",
  ctaHumanTitle: "Found a problem others missed?",
  ctaHumanBody: "Suggest a better translation. Suggestions are warmly welcomed.",
  reviewTranslation: "Review the translation",
  improveTranslation: "Improve the translation",
  reviewThanks: "Thank you for reviewing, {login}!",
  reviewOn: "You\u2019re reviewing this page.",
  reviewHow: "Select a paragraph to approve it or suggest a better translation.",
  reviewPr: "Your changes become a pull request from your GitHub account.",
  reviewGuide: "How reviewing works",
  exitReview: "Leave review mode",
  source: "Original",
  translation: "Translation",
  reviewedBy: "Reviewed by",
  notReviewed: "Not reviewed yet",
  approve: "Approve",
  suggest: "Suggest an edit",
  cancel: "Cancel",
  save: "Save suggestion",
  pending: "{n} pending",
  submit: "Submit your review as a pull request",
  submitNote: "Opens a pull request from your account.",
  submitting: "Opening a pull request\u2026",
  trayTitle: "Your review",
  trayHere: "{n} change on this page||{n} changes on this page",
  trayOther: "{n} change on another page||{n} changes on another page",
  trayPages: "{n} changes on {p} pages",
  countApproved: "{n} approved",
  countImproved: "{n} better translation||{n} better translations",
  clear: "Discard",
  thisPage: "This page",
  clearAll: "Discard all",
  clearAllConfirm: "Discard all {n} pending changes on {p} pages?",
  signIn: "Sign in with GitHub",
  signInWhy: "Your review is proposed as a pull request under your GitHub account.",
  signedInAs: "Signed in as {login}",
  signOut: "Sign out",
  signInDenied: "GitHub sign-in was cancelled.",
  status_missing: "Not translated: original text shown",
  status_stale: "Original changed: original text shown",
  status_machine: "Machine translation, not reviewed",
  status_reviewed: "Reviewed by {n}",
  previous: "Previous translation",
  code: "Code",
  submitted: "Pull request opened",
  submittedThanks: "Thank you, {login}!",
  submittedBody: "Your changes are in pull request {pr}. Your name appears in the banner once it\u2019s merged.",
  viewOnGitHub: "View on GitHub",
  keepReviewing: "Keep reviewing",
  held: "{n} not submitted",
  heldOne: "Not submitted",
  retry: "Try again",
  discardHeld: "Discard these",
  discardHeldConfirm: "Discard {n} changes that were not submitted?",
  submitFailed: "Could not submit",
  kept: "Your changes are kept; try again later",
  noStorage: "This browser is not saving your changes. Submit them before leaving this page.",
  close: "Close",
  languages: "Languages"
};
var fr = {
  bannerLabel: "\xC0 propos de cette traduction",
  translatedFrom: "Traduit de l\u2019{src}",
  untranslated: "Cette page n\u2019a pas encore \xE9t\xE9 traduite et s\u2019affiche en {src}.",
  state_untranslated: "Pas encore traduite",
  state_machine: "Traduction automatique",
  state_partial: "Relue en partie par des personnes",
  state_reviewed: "Relue par des personnes",
  state_human: "Traduite et relue par des personnes",
  readOriginal: "Lire l\u2019original",
  segHuman: "{n} traduit par des personnes||{n} traduits par des personnes",
  segVerified: "{n} traduit automatiquement, v\xE9rifi\xE9 par des personnes||{n} traduits automatiquement, v\xE9rifi\xE9s par des personnes",
  segMachine: "{n} traduit automatiquement, pas encore relu||{n} traduits automatiquement, pas encore relus",
  segAllMachine: "Le paragraphe est traduit automatiquement||Les {n} paragraphes traduits automatiquement",
  segFallback: "{n} pas encore traduit||{n} pas encore traduits",
  thanks: "Merci \xE0 {names} pour l\u2019aide apport\xE9e \xE0 cette page.",
  credit: "Traduite et relue par {names}. Merci \xE0 tous.",
  others: "{n} autre personne||{n} autres personnes",
  nobody: "Personne n\u2019a encore relu cette page. Aidez \xE0 relire la traduction et votre nom appara\xEEtra ici.",
  ctaFirstTitle: "Vous lisez le {lang} ? Soyez la premi\xE8re personne \xE0 aider.",
  ctaFirstBody: "Approuver quelques paragraphes qui se lisent bien indique d\xE9j\xE0 aux prochains lecteurs qu\u2019ils peuvent s\u2019y fier.",
  ctaTitle: "Vous lisez le {lang} ? Votre aide serait pr\xE9cieuse.",
  ctaBody: "Approuvez un paragraphe ou proposez une meilleure traduction. Chaque contribution aide tous les lecteurs suivants.",
  ctaHumanTitle: "Vous avez rep\xE9r\xE9 un probl\xE8me qui a \xE9chapp\xE9 aux autres ?",
  ctaHumanBody: "Proposez une meilleure traduction. Les suggestions sont toujours les bienvenues.",
  reviewTranslation: "Relire la traduction",
  improveTranslation: "Am\xE9liorer la traduction",
  reviewThanks: "Merci de votre relecture, {login} !",
  reviewOn: "Vous relisez cette page.",
  reviewHow: "S\xE9lectionnez un paragraphe pour l\u2019approuver ou proposer une meilleure traduction.",
  reviewPr: "Vos modifications deviennent une pull request depuis votre compte GitHub.",
  reviewGuide: "Comment fonctionne la relecture",
  exitReview: "Quitter la relecture",
  source: "Original",
  translation: "Traduction",
  reviewedBy: "Relu par",
  notReviewed: "Pas encore relu",
  approve: "Approuver",
  suggest: "Proposer une modification",
  cancel: "Annuler",
  save: "Enregistrer la proposition",
  pending: "{n} en attente",
  submit: "Soumettre votre relecture en pull request",
  submitNote: "Ouvre une pull request depuis votre compte.",
  submitting: "Ouverture de la pull request\u2026",
  trayTitle: "Votre relecture",
  trayHere: "{n} modification sur cette page||{n} modifications sur cette page",
  trayOther: "{n} modification sur une autre page||{n} modifications sur une autre page",
  trayPages: "{n} modifications sur {p} pages",
  countApproved: "{n} approuv\xE9||{n} approuv\xE9s",
  countImproved: "{n} meilleure traduction||{n} meilleures traductions",
  clear: "Abandonner",
  thisPage: "Cette page",
  clearAll: "Tout abandonner",
  clearAllConfirm: "Abandonner les {n} modifications en attente sur {p} pages ?",
  signIn: "Se connecter avec GitHub",
  signInWhy: "Votre relecture est propos\xE9e en pull request depuis votre compte GitHub.",
  signedInAs: "Connect\xE9 en tant que {login}",
  signOut: "Se d\xE9connecter",
  signInDenied: "La connexion \xE0 GitHub a \xE9t\xE9 annul\xE9e.",
  status_missing: "Non traduit : texte original affich\xE9",
  status_stale: "Original modifi\xE9 : texte original affich\xE9",
  status_machine: "Traduction automatique, non relue",
  status_reviewed: "Relu par {n}",
  previous: "Traduction pr\xE9c\xE9dente",
  code: "Code",
  submitted: "Pull request ouverte",
  submittedThanks: "Merci, {login} !",
  submittedBody: "Vos modifications sont dans la pull request {pr}. Votre nom appara\xEEtra dans le bandeau une fois qu\u2019elle sera fusionn\xE9e.",
  viewOnGitHub: "Voir sur GitHub",
  keepReviewing: "Continuer la relecture",
  held: "{n} non soumises",
  heldOne: "Non soumise",
  retry: "R\xE9essayer",
  discardHeld: "Les abandonner",
  discardHeldConfirm: "Abandonner les {n} modifications non soumises ?",
  submitFailed: "\xC9chec de l\u2019envoi",
  kept: "Vos modifications sont conserv\xE9es ; r\xE9essayez plus tard",
  noStorage: "Ce navigateur n\u2019enregistre pas vos modifications. Soumettez-les avant de quitter cette page.",
  close: "Fermer",
  languages: "Langues"
};
var es = {
  bannerLabel: "Sobre esta traducci\xF3n",
  translatedFrom: "Traducido del {src}",
  untranslated: "Esta p\xE1gina a\xFAn no est\xE1 traducida y se muestra en {src}.",
  state_untranslated: "Sin traducir todav\xEDa",
  state_machine: "Traducci\xF3n autom\xE1tica",
  state_partial: "Revisada en parte por personas",
  state_reviewed: "Revisada por personas",
  state_human: "Traducida y revisada por personas",
  readOriginal: "Leer el original",
  segHuman: "{n} traducido por personas||{n} traducidos por personas",
  segVerified: "{n} traducido autom\xE1ticamente, verificado por personas||{n} traducidos autom\xE1ticamente, verificados por personas",
  segMachine: "{n} traducido autom\xE1ticamente, sin revisar||{n} traducidos autom\xE1ticamente, sin revisar",
  segAllMachine: "El p\xE1rrafo est\xE1 traducido autom\xE1ticamente||Los {n} p\xE1rrafos traducidos autom\xE1ticamente",
  segFallback: "{n} sin traducir todav\xEDa",
  thanks: "Gracias a {names} por ayudar con esta p\xE1gina.",
  credit: "Traducida y revisada por {names}. \xA1Gracias a todos!",
  others: "{n} persona m\xE1s||{n} personas m\xE1s",
  nobody: "Nadie ha revisado esta p\xE1gina todav\xEDa. Ayuda a revisar la traducci\xF3n y aparecer\xE1s aqu\xED.",
  ctaFirstTitle: "\xBFLees {lang}? S\xE9 la primera persona en ayudar.",
  ctaFirstBody: "Aprobar unos pocos p\xE1rrafos que se leen bien ya indica a los pr\xF3ximos lectores que pueden confiar en ellos.",
  ctaTitle: "\xBFLees {lang}? Nos encantar\xEDa tu ayuda.",
  ctaBody: "Aprueba un p\xE1rrafo o sugiere una traducci\xF3n mejor. Cada aporte ayuda a todos los que leen despu\xE9s.",
  ctaHumanTitle: "\xBFEncontraste un problema que otros pasaron por alto?",
  ctaHumanBody: "Sugiere una traducci\xF3n mejor. Las sugerencias son muy bienvenidas.",
  reviewTranslation: "Revisar la traducci\xF3n",
  improveTranslation: "Mejorar la traducci\xF3n",
  reviewThanks: "\xA1Gracias por revisar, {login}!",
  reviewOn: "Est\xE1s revisando esta p\xE1gina.",
  reviewHow: "Selecciona un p\xE1rrafo para aprobarlo o sugerir una traducci\xF3n mejor.",
  reviewPr: "Tus cambios se convierten en una pull request desde tu cuenta de GitHub.",
  reviewGuide: "C\xF3mo funciona la revisi\xF3n",
  exitReview: "Salir de la revisi\xF3n",
  source: "Original",
  translation: "Traducci\xF3n",
  reviewedBy: "Revisado por",
  notReviewed: "Sin revisar",
  approve: "Aprobar",
  suggest: "Sugerir un cambio",
  cancel: "Cancelar",
  save: "Guardar sugerencia",
  pending: "{n} pendientes",
  submit: "Enviar tu revisi\xF3n como pull request",
  submitNote: "Abre una pull request desde tu cuenta.",
  submitting: "Abriendo la pull request\u2026",
  trayTitle: "Tu revisi\xF3n",
  trayHere: "{n} cambio en esta p\xE1gina||{n} cambios en esta p\xE1gina",
  trayOther: "{n} cambio en otra p\xE1gina||{n} cambios en otra p\xE1gina",
  trayPages: "{n} cambios en {p} p\xE1ginas",
  countApproved: "{n} aprobado||{n} aprobados",
  countImproved: "{n} traducci\xF3n mejorada||{n} traducciones mejoradas",
  clear: "Descartar",
  thisPage: "Esta p\xE1gina",
  clearAll: "Descartar todo",
  clearAllConfirm: "\xBFDescartar los {n} cambios pendientes en {p} p\xE1ginas?",
  signIn: "Iniciar sesi\xF3n con GitHub",
  signInWhy: "Tu revisi\xF3n se propone como pull request desde tu cuenta de GitHub.",
  signedInAs: "Sesi\xF3n iniciada como {login}",
  signOut: "Cerrar sesi\xF3n",
  signInDenied: "Se cancel\xF3 el inicio de sesi\xF3n con GitHub.",
  status_missing: "Sin traducir: se muestra el original",
  status_stale: "El original cambi\xF3: se muestra el original",
  status_machine: "Traducci\xF3n autom\xE1tica, sin revisar",
  status_reviewed: "Revisado por {n}",
  previous: "Traducci\xF3n anterior",
  code: "C\xF3digo",
  submitted: "Pull request abierta",
  submittedThanks: "\xA1Gracias, {login}!",
  submittedBody: "Tus cambios est\xE1n en la pull request {pr}. Tu nombre aparecer\xE1 en el aviso de la traducci\xF3n cuando se fusione.",
  viewOnGitHub: "Ver en GitHub",
  keepReviewing: "Seguir revisando",
  held: "{n} sin enviar",
  heldOne: "Sin enviar",
  retry: "Reintentar",
  discardHeld: "Descartarlos",
  discardHeldConfirm: "\xBFDescartar los {n} cambios sin enviar?",
  submitFailed: "No se pudo enviar",
  kept: "Tus cambios se conservan; int\xE9ntalo m\xE1s tarde",
  noStorage: "Este navegador no guarda tus cambios. Env\xEDalos antes de salir de esta p\xE1gina.",
  close: "Cerrar",
  languages: "Idiomas"
};
var TABLE = { en, fr, es };
function uiLang(lang) {
  return TABLE[lang] ? lang : TABLE[lang.split("-")[0]] ? lang.split("-")[0] : "en";
}
function uiStrings(lang) {
  return TABLE[uiLang(lang)];
}
function languageName(code, inLang) {
  try {
    return new Intl.DisplayNames([inLang], { type: "language" }).of(code) ?? code;
  } catch {
    return code;
  }
}
function endonym(code) {
  const n = languageName(code, code);
  return n.charAt(0).toLocaleUpperCase(code) + n.slice(1);
}
function fill(s, vars, lang = "en") {
  const forms = s.split("||");
  if (forms.length === 2 && typeof vars.n === "number") s = new Intl.PluralRules(lang).select(vars.n) === "one" ? forms[0] : forms[1];
  return s.replace(/\{(\w+)\}/g, (m, k) => k in vars ? String(vars[k]) : m);
}

// src/cli/banner.ts
var esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
var MAX_AVATARS = 5;
var ICON_TRANSLATE = '<svg class="tr-banner-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 8 6 6"/><path d="m4 14 6-6 2-3"/><path d="M2 5h12"/><path d="M7 2h1"/><path d="m22 22-5-10-5 10"/><path d="M14 18h6"/></svg>';
var ICON_CHECK = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>';
var ICON_PLUS = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14"/><path d="M5 12h14"/></svg>';
var ICON_GITHUB = '<svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>';
function bannerHtml(b) {
  const S = uiStrings(b.lang);
  const ui = uiLang(b.lang);
  const s = b.stats;
  const src = languageName(b.sourceLang, ui);
  const state = bannerState(s);
  const fallback = s.stale + s.missing;
  const touched = s.human + s.verified;
  const label = esc(S[`state_${state}`]);
  const badge = `<span class="tr-banner-state" data-state="${state}">${state === "human" ? ICON_CHECK : ""}${label}</span>`;
  const head = `<div class="tr-banner-head">${ICON_TRANSLATE}<span class="tr-banner-title">${esc(state === "untranslated" ? fill(S.untranslated, { src }) : fill(S.translatedFrom, { src }))}</span>${state === "untranslated" ? "" : badge}<a class="tr-original" href="${esc(b.original)}" hreflang="${esc(b.sourceLang)}">${esc(S.readOriginal)}</a></div>`;
  let bar = "";
  if (state !== "untranslated") {
    const segs = [
      { kind: "human", n: s.human, text: S.segHuman },
      { kind: "verified", n: s.verified, text: S.segVerified },
      { kind: "machine", n: s.machine, text: S.segMachine },
      { kind: "fallback", n: fallback, text: S.segFallback }
    ].filter((x) => x.n > 0);
    const allMachine = segs.length === 1 && segs[0].kind === "machine";
    const items = allMachine ? [{ ...segs[0], text: S.segAllMachine }] : segs;
    const say = (x) => fill(x.text, { n: x.n, src }, ui);
    bar = `<div class="tr-banner-bar" role="img" aria-label="${esc(items.map(say).join("; "))}">` + segs.map((x) => `<span data-kind="${x.kind}" style="flex-grow:${x.n}"></span>`).join("") + `</div><ul class="tr-banner-legend" aria-hidden="true">` + items.map((x) => `<li><span class="tr-banner-key" data-kind="${x.kind}"></span>${esc(say(x))}</li>`).join("") + `</ul>`;
  }
  let people = "";
  if (s.people.length) {
    const shown = s.people.slice(0, MAX_AVATARS);
    const extra = s.people.length - shown.length;
    const avatars = `<span class="tr-banner-avatars" aria-hidden="true">` + shown.map((c) => `<img src="https://github.com/${encodeURIComponent(c.login)}.png?size=64" alt="" width="30" height="30" loading="lazy" title="@${esc(c.login)}">`).join("") + (extra > 0 ? `<span class="tr-banner-more">+${extra}</span>` : "") + `</span>`;
    const link = (l) => `<a href="https://github.com/${encodeURIComponent(l)}">@${esc(l)}</a>`;
    const named = s.people.length <= 3 ? s.people : s.people.slice(0, 2);
    const parts = named.map((c) => link(c.login));
    if (named.length < s.people.length) parts.push(esc(fill(S.others, { n: s.people.length - named.length }, ui)));
    const names = new Intl.ListFormat(ui, { type: "conjunction" }).format(parts);
    const text = fill(state === "human" ? esc(S.credit) : esc(S.thanks), { names });
    people = `<div class="tr-banner-people">${avatars}<p>${text}</p></div>`;
  } else if (touched === 0) {
    people = `<div class="tr-banner-people"><span class="tr-banner-empty" aria-hidden="true">${ICON_PLUS}</span><p>${esc(S.nobody)}</p></div>`;
  }
  const lang = languageName(b.lang, ui);
  const cta = state === "human" ? { title: S.ctaHumanTitle, body: S.ctaHumanBody, button: S.improveTranslation } : touched === 0 ? { title: fill(S.ctaFirstTitle, { lang }), body: S.ctaFirstBody, button: S.reviewTranslation } : { title: fill(S.ctaTitle, { lang }), body: S.ctaBody, button: S.improveTranslation };
  const action = `<div class="tr-banner-cta"><div class="tr-banner-cta-text"><strong>${esc(cta.title)}</strong><span>${esc(cta.body)}</span></div><a class="tr-review-toggle tr-banner-button${state === "human" ? " tr-banner-button-quiet" : ""}" href="?review=1">${ICON_GITHUB}<span class="tr-toggle-text">${esc(cta.button)}</span></a></div>`;
  return `<aside class="tr-banner" data-state="${state}" aria-label="${esc(S.bannerLabel)}"><div class="tr-banner-main">${head}${bar}${people}</div>${action}</aside>`;
}

// src/cli/project.ts
var import_yaml6 = __toESM(require_dist(), 1);
import fs2 from "node:fs";
import path2 from "node:path";
import { fileURLToPath } from "node:url";

// src/adapters/markdown.ts
var READER = "commonmark_x";
async function pandocJson(text, reader) {
  const { cmd, args } = pandocCommand();
  const r = await run(cmd, [...args, "-f", reader, "-t", "json"], text);
  if (r.code !== 0) throw new Error(`pandoc failed: ${r.stderr.trim()}`);
  return JSON.parse(r.stdout);
}
function pandocMarkdown() {
  const cache = /* @__PURE__ */ new Map();
  return {
    async parseWithPositions(text) {
      const k = fnv1a(text) + text.length;
      if (!cache.has(k)) cache.set(k, await pandocJson(text, `${READER}+sourcepos`));
      return cache.get(k);
    },
    async parseMany(texts) {
      if (!texts.length) return [];
      const doc = texts.map((t, k) => `::: {#i18n-snippet-${k}}
${t}
:::
`).join("\n");
      const ast = await pandocJson(doc, READER);
      const out = new Array(texts.length);
      for (const b of ast.blocks) {
        const m = b.t === "Div" ? /^i18n-snippet-(\d+)$/.exec(b.c[0][0]) : null;
        if (!m) throw new Error("snippet parse lost its boundaries");
        const k = Number(m[1]);
        if (out[k]) throw new Error("snippet parse produced a duplicate boundary");
        out[k] = b.c[1];
      }
      if (out.some((x) => x === void 0) || out.length !== texts.length) throw new Error("snippet parse lost a snippet");
      return out;
    }
  };
}

// src/core/glossary.ts
var import_yaml3 = __toESM(require_dist(), 1);

// src/core/tfile.ts
var import_yaml2 = __toESM(require_dist(), 1);
var UNIT_KEYS = ["id", "kind", "section", "cell", "field", "source-hash", "source", "text", "terms", "origin", "reviews", "reverted"];
var unknownKeys = (u) => Object.keys(u).filter((k) => !UNIT_KEYS.includes(k));
function knownPart(u) {
  const o = {};
  for (const k of UNIT_KEYS) if (u[k] !== void 0) o[k] = u[k];
  return o;
}
function header(sourcePath) {
  return `Generated by quarto-i18n from ${sourcePath}. Change translations through
reviewer mode or a pull request; \`i18n translate\` rewrites this file.`;
}
function parseTFile(text) {
  const data = (0, import_yaml2.parse)(text);
  if (!data || typeof data !== "object" || !Array.isArray(data.units)) throw new Error("not a translation file (missing units)");
  for (const u of data.units) {
    if (typeof u.id !== "string" || typeof u["source-hash"] !== "string") throw new Error(`unit without id or source-hash`);
    u["source-hash"] = String(u["source-hash"]);
    u.reviews = (u.reviews ?? []).map((r) => ({ by: String(r.by), date: String(r.date) }));
  }
  return data;
}
function stringifyTFile(t) {
  const doc = new import_yaml2.Document({ source: t.source, lang: t.lang, units: t.units.map(knownPart) }, { aliasDuplicateObjects: false });
  doc.commentBefore = " " + header(t.source).replace(/\n/g, "\n ");
  flowStyle(doc, ["origin", "reviews", "terms"]);
  return doc.toString({ lineWidth: 0, defaultKeyType: "PLAIN", singleQuote: false });
}
function flowStyle(doc, keys) {
  (0, import_yaml2.visit)(doc, {
    Pair(_k, pair) {
      if (!(0, import_yaml2.isPair)(pair) || !(0, import_yaml2.isScalar)(pair.key) || !keys.includes(String(pair.key.value))) return;
      const v = pair.value;
      if ((0, import_yaml2.isMap)(v)) v.flow = true;
      if ((0, import_yaml2.isSeq)(v)) {
        for (const it of v.items) if ((0, import_yaml2.isMap)(it)) it.flow = true;
      }
    }
  });
}

// src/core/glossary.ts
function parseSourceGlossary(data) {
  if (!data || typeof data !== "object") return [];
  return Object.entries(data).flatMap(([key, v]) => {
    if (!v || typeof v !== "object" || typeof v.term !== "string") return [];
    return [{ key, term: v.term, variants: Array.isArray(v.variants) ? v.variants.map(String) : [], definition: v.definition, keep: !!v.keep }];
  });
}
function entryHash(e) {
  return textHash([e.term, ...e.variants ?? [], e.definition ?? "", e.keep ? "keep" : ""].join(""));
}
function targetHash(e) {
  return e ? textHash([e.term, ...e.variants ?? []].join("")) : "";
}
function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function contains(text, form) {
  return new RegExp(`(?<![\\p{L}\\p{N}])${escapeRe(form)}(?![\\p{L}\\p{N}])`, "iu").test(text);
}
function hits(entries, text) {
  return entries.filter((e) => [e.term, ...e.variants ?? []].some((f) => contains(text, f)));
}
function termWarnings(entries, lang, source, text) {
  const out = [];
  for (const e of hits(entries, source)) {
    const forms = e.keep ? [e.term, ...e.variants ?? []] : lang[e.key] ? [lang[e.key].term, ...lang[e.key].variants ?? []] : [];
    if (forms.length && !forms.some((f) => contains(text, f))) out.push(`"${e.term}" \u2192 expected "${forms[0]}"`);
  }
  return out;
}
function parseLangGlossary(text) {
  const data = (0, import_yaml3.parse)(text) ?? {};
  const out = {};
  for (const [k, v] of Object.entries(data)) {
    if (v && typeof v === "object" && typeof v.term === "string") {
      out[k] = { ...v, "source-hash": String(v["source-hash"]), reviews: v.reviews ?? [] };
    }
  }
  return out;
}
function stringifyLangGlossary(lang, g) {
  const doc = new import_yaml3.Document(g, { aliasDuplicateObjects: false });
  doc.commentBefore = ` Glossary for ${lang}, generated by quarto-i18n from the source glossary.
 Review and edit through pull requests like any translation.`;
  flowStyle(doc, ["origin", "reviews"]);
  return doc.toString({ lineWidth: 0 });
}
function termHashes(entries, lang) {
  const out = {};
  for (const e of entries) {
    const l = lang[e.key];
    if (l && l["source-hash"] === entryHash(e)) out[e.key] = targetHash(l);
  }
  return out;
}
function isPlainText(s) {
  return !/[<>`{}[\]$\\*_|]/.test(s) && !/\n/.test(s);
}

// src/core/tdoc.ts
var import_yaml5 = __toESM(require_dist(), 1);

// src/core/units.ts
var import_yaml4 = __toESM(require_dist(), 1);
var META_FIELDS = ["title", "subtitle", "description", "abstract"];
var CAPTION_OPTIONS = ["fig-cap", "tbl-cap", "fig-alt", "lst-cap"];
var Positions = class {
  text;
  starts = [0];
  constructor(text) {
    this.text = text;
    for (let i = 0; i < text.length; i++) if (text[i] === "\n") this.starts.push(i + 1);
  }
  lineStart(line) {
    return this.starts[Math.min(line - 1, this.starts.length - 1)] ?? this.text.length;
  }
  line(line) {
    const s = this.lineStart(line);
    const e = line < this.starts.length ? this.starts[line] - 1 : this.text.length;
    return this.text.slice(s, e);
  }
  offset(line, col) {
    if (line > this.starts.length) return this.text.length;
    const s = this.lineStart(line);
    let off = s;
    for (let c = 1; c < col; c++) {
      const cp = this.text.codePointAt(off);
      if (cp === void 0 || this.text[off] === "\n") break;
      off += cp > 65535 ? 2 : 1;
    }
    return off;
  }
  lineOf(offset) {
    let lo = 0;
    let hi = this.starts.length - 1;
    while (lo < hi) {
      const mid = lo + hi + 1 >> 1;
      if (this.starts[mid] <= offset) lo = mid;
      else hi = mid - 1;
    }
    return lo + 1;
  }
};
function parseDataPos(v) {
  const spec = v.slice(v.lastIndexOf("@") + 1);
  return spec.split(";").flatMap((r) => {
    const m = /^(\d+):(\d+)-(\d+):(\d+)$/.exec(r);
    return m ? [{ l1: +m[1], c1: +m[2], l2: +m[3], c2: +m[4] }] : [];
  });
}
function kv(attr, key) {
  const kvs = attr?.[2] ?? [];
  return kvs.find(([k]) => k === key)?.[1];
}
function collectPos(x, out) {
  if (Array.isArray(x)) {
    if (x.length === 2 && x[0] === "data-pos" && typeof x[1] === "string") {
      out.push(...parseDataPos(x[1]));
      return;
    }
    for (const y of x) collectPos(y, out);
  } else if (x && typeof x === "object") {
    if (x.t === "Note") return;
    collectPos(x.c, out);
  }
}
function findNotes(x, out) {
  if (Array.isArray(x)) for (const y of x) findNotes(y, out);
  else if (x && typeof x === "object") {
    if (x.t === "Note") out.push(x.c);
    else findNotes(x.c, out);
  }
}
function frontMatter(text) {
  const m = /^---[ \t]*\r?\n([\s\S]*?)\r?\n(?:---|\.\.\.)[ \t]*(?:\r?\n|$)/.exec(text);
  if (!m) return null;
  try {
    return { yaml: m[1], data: (0, import_yaml4.parse)(m[1]) ?? {} };
  } catch {
    return null;
  }
}
async function extractUnits(text, md) {
  const pos = new Positions(text);
  const units = [];
  const issues = [];
  const fm = frontMatter(text);
  if (fm && fm.data && typeof fm.data === "object") {
    if (fm.data["verso-translate"] === false) return { units: [], issues };
    for (const f of META_FIELDS) {
      const v = fm.data[f];
      if (typeof v === "string" && hasTranslatableText(v)) {
        units.push({ kind: "meta", field: f, source: v, hash: textHash(v), range: { start: -1e3 + units.length, end: -1e3 + units.length } });
      }
    }
  }
  const ast = await md.parseWithPositions(text);
  let section;
  const leaf = (inlines, heading, autoId) => {
    const ps = [];
    collectPos(inlines, ps);
    if (!ps.length) return;
    let start = Infinity;
    let end = -Infinity;
    for (const p of ps) {
      start = Math.min(start, pos.offset(p.l1, p.c1));
      end = Math.max(end, pos.offset(p.l2, p.c2));
    }
    const src = text.slice(start, end).replace(/\s+$/, "");
    end = start + src.length;
    if (hasTranslatableText(src)) {
      units.push({ kind: "block", source: src, hash: textHash(src), range: { start, end }, section, heading, ...autoId ? { autoId } : {} });
    }
    const notes = [];
    findNotes(inlines, notes);
    for (const n of notes) {
      const np = [];
      collectPos(n, np);
      const inside = np.some((p) => {
        const o = pos.offset(p.l1, p.c1);
        return o >= start && o < end;
      });
      if (!inside) walk(n, false);
    }
  };
  const walk = (blocks, inCallout) => {
    for (const b of blocks ?? []) {
      switch (b.t) {
        case "Div": {
          const attr = b.c[0];
          if (kv(attr, "verso-translate") === "false") break;
          const callout = attr[1].some((c) => c.startsWith("callout"));
          walk(b.c[1], inCallout || callout);
          break;
        }
        case "Para":
        case "Plain":
          leaf(b.c);
          break;
        case "Header": {
          const [level, attr, inl] = b.c;
          if (kv(attr, "verso-translate") === "false") break;
          const p = kv(attr, "data-pos");
          const line = p ? parseDataPos(p)[0]?.l1 : void 0;
          const explicit = line !== void 0 && /\{[^}]*#[\w:.-]+[^}]*\}\s*$/.test(pos.line(line));
          if (!inCallout) {
            if (explicit) section = attr[0];
            else issues.push({ level: "error", line, message: `heading without an explicit id: add {#sec-\u2026}` });
          }
          leaf(inl, level, !inCallout && !explicit && attr[0] ? attr[0] : void 0);
          break;
        }
        case "BulletList":
          for (const item of b.c) walk(item, inCallout);
          break;
        case "OrderedList":
          for (const item of b.c[1]) walk(item, inCallout);
          break;
        case "BlockQuote":
          walk(b.c, inCallout);
          break;
        case "DefinitionList":
          for (const [term, defs] of b.c) {
            leaf(term);
            for (const d of defs) walk(d, inCallout);
          }
          break;
        case "CodeBlock":
          codeBlock(b);
          break;
        case "Table": {
          const p = kv(b.c[0], "data-pos");
          issues.push({ level: "warning", line: p ? parseDataPos(p)[0]?.l1 : void 0, message: "tables are not translated yet" });
          break;
        }
        default:
          break;
      }
    }
  };
  const codeBlock = (b) => {
    const [attr, body] = b.c;
    const cls = attr[1][0] ?? "";
    const m = /^\{([A-Za-z0-9_]+)/.exec(cls);
    if (!m) return;
    const lang = m[1].toLowerCase();
    const p = kv(attr, "data-pos");
    const ps = p ? parseDataPos(p) : [];
    if (!ps.length) return;
    const fenceLine = ps[0].l1;
    if (!/^(`{3,}|~{3,})/.test(pos.line(fenceLine))) {
      issues.push({ level: "warning", line: fenceLine, message: "indented code cells are not translated" });
      return;
    }
    const codeOffset = pos.lineStart(fenceLine + 1);
    if (text.slice(codeOffset, codeOffset + body.length) !== body) {
      issues.push({ level: "warning", line: fenceLine, message: "could not locate cell code in the source" });
      return;
    }
    const opts = {};
    let off = 0;
    for (const ln of body.split("\n")) {
      const om = /^#\|\s*([\w.-]+)\s*:\s*(.*)$/.exec(ln);
      if (!/^#\|/.test(ln)) break;
      if (om) {
        let value = om[2];
        try {
          value = (0, import_yaml4.parse)(om[2]);
        } catch {
        }
        opts[om[1]] = { value, start: codeOffset + off, end: codeOffset + off + ln.length };
      }
      off += ln.length + 1;
    }
    const label = typeof opts.label?.value === "string" ? opts.label.value : void 0;
    if (!label) {
      issues.push({ level: "error", line: fenceLine, message: "executable cell without a label: add #| label: \u2026" });
      return;
    }
    const tr = opts["verso-translate"]?.value;
    if (tr === false) return;
    for (const name of CAPTION_OPTIONS) {
      const o = opts[name];
      const raw = o ? text.slice(o.start, o.end) : "";
      if (o && typeof o.value === "string" && !/:\s*[|>]/.test(raw) && hasTranslatableText(o.value)) {
        units.push({ kind: "caption", cell: label, field: name, source: o.value, hash: textHash(o.value), range: { start: o.start, end: o.end }, section });
      }
    }
    const bodyStart = codeOffset + off;
    const code = text.slice(bodyStart, codeOffset + body.length);
    if (hasTranslatableText(code)) {
      units.push({ kind: "code", cell: label, lang, source: code, hash: codeHash(code), range: { start: bodyStart, end: bodyStart + code.length }, section });
    }
  };
  walk(ast.blocks, false);
  units.sort((a, b) => a.range.start - b.range.start);
  const out = [];
  let lastEnd = -Infinity;
  for (const u of units) {
    if (u.kind === "meta" || u.range.start >= lastEnd) {
      out.push(u);
      if (u.kind !== "meta") lastEnd = u.range.end;
    } else {
      issues.push({ level: "warning", line: pos.lineOf(u.range.start), message: "overlapping unit skipped" });
    }
  }
  for (const u of out) if (u.kind === "meta") delete u.range;
  return { units: out, issues };
}
function projectFields(config) {
  const out = [];
  const add = (path8, v) => {
    if (typeof v === "string" && hasTranslatableText(v) && !/\.(qmd|md|ipynb)$/.test(v)) out.push({ path: path8, value: v });
  };
  for (const top of ["book", "website"]) {
    const s = config?.[top];
    if (!s) continue;
    add([top, "title"], s.title);
    add([top, "subtitle"], s.subtitle);
    add([top, "description"], s.description);
    (s.chapters ?? []).forEach((c, i) => {
      if (c && typeof c === "object" && typeof c.part === "string") add([top, "chapters", i, "part"], c.part);
    });
    (s.appendices ?? []).forEach((c, i) => {
      if (c && typeof c === "object" && typeof c.part === "string") add([top, "appendices", i, "part"], c.part);
    });
    for (const side of ["left", "right"]) {
      (s.navbar?.[side] ?? []).forEach((it, i) => {
        if (it && typeof it === "object") add([top, "navbar", side, i, "text"], it.text);
      });
    }
    const pf = s["page-footer"];
    if (typeof pf === "string") add([top, "page-footer"], pf);
    else if (pf && typeof pf === "object") for (const k of ["left", "center", "right"]) add([top, "page-footer", k], pf[k]);
  }
  return out;
}
function projectUnits(config) {
  return projectFields(config).map((f) => ({ kind: "meta", field: f.path.join("."), source: f.value, hash: textHash(f.value) }));
}

// src/core/tdoc.ts
var TRACK_KEYS = ["id", "kind", "section", "cell", "field", "source-hash", "text-hash", "terms", "origin", "reviews"];
function normaliseText(kind, s) {
  return kind === "code" ? normaliseCode(s) : normaliseBlockText(s);
}
function translationHash(kind, s) {
  return kind === "code" ? codeHash(normaliseCode(s)) : textHash(normaliseBlockText(s));
}
function trackHeader(sourcePath, docPath) {
  return `Generated by quarto-i18n: tracks the units of ${docPath} (translated from
${sourcePath}): ids, hashes and reviews. Edit the translation in the .qmd;
\`i18n sync\` records the change here.`;
}
function parseTrack(text) {
  const data = (0, import_yaml5.parse)(text);
  if (!data || typeof data !== "object" || !Array.isArray(data.units)) throw new Error("not a tracking file (missing units)");
  for (const u of data.units) {
    if (typeof u.id !== "string" || typeof u["source-hash"] !== "string") throw new Error("unit without id or source-hash");
    if ("text" in u) throw new Error(`${u.id}: tracking files hold no text (the translation is in the .qmd)`);
    u["source-hash"] = String(u["source-hash"]);
    if (u["text-hash"] !== void 0) u["text-hash"] = String(u["text-hash"]);
    u.reviews = (u.reviews ?? []).map((r) => ({ by: String(r.by), date: String(r.date) }));
  }
  return data;
}
function stringifyTrack(t, docPath) {
  const units = t.units.map((u) => {
    const o = {};
    for (const k of TRACK_KEYS) if (u[k] !== void 0) o[k] = u[k];
    return o;
  });
  const doc = new import_yaml5.Document({ source: t.source, lang: t.lang, units }, { aliasDuplicateObjects: false });
  doc.commentBefore = " " + trackHeader(t.source, docPath).replace(/\n/g, "\n ");
  flowStyle(doc, ["origin", "reviews", "terms"]);
  return doc.toString({ lineWidth: 0, defaultKeyType: "PLAIN", singleQuote: false });
}
var sig = (u) => [u.kind, u.cell ?? "", u.field ?? "", u.section ?? ""].join("|");
async function readDoc(doc, track, md) {
  const issues = [];
  const untracked = /* @__PURE__ */ new Set();
  const raw = /* @__PURE__ */ new Map();
  const ex = await extractUnits(doc, md);
  for (const i of ex.issues) if (i.level === "error") issues.push({ kind: "document", line: i.line, message: i.message });
  const base = (u) => {
    const { "text-hash": _h, ...rest } = u;
    return rest;
  };
  const d = ex.units;
  const t = track.units;
  let mismatch = -1;
  for (let i = 0; i < Math.max(d.length, t.length); i++) {
    if (!d[i] || !t[i] || sig(d[i]) !== sig(t[i])) {
      mismatch = i;
      break;
    }
  }
  if (mismatch === -1) {
    const recorded = /* @__PURE__ */ new Map();
    t.forEach((tu, j) => tu["text-hash"] && !recorded.has(tu["text-hash"]) && recorded.set(tu["text-hash"], j));
    for (let i = 0; i < t.length; i++) {
      const h = translationHash(t[i].kind, d[i].source);
      const j = recorded.get(h);
      if (h !== t[i]["text-hash"] && j !== void 0 && j !== i && t[j]["text-hash"] !== translationHash(t[j].kind, d[j].source)) {
        mismatch = Math.min(i, j);
        issues.push({ kind: "structure", message: `the translation's structure differs from its tracking file: block ${i + 1} holds the recorded translation of unit ${j + 1} (${t[j].id}), so blocks were moved, merged or split. ${FIX}` });
        break;
      }
    }
  } else {
    issues.push({ kind: "structure", message: describeMismatch(d, t, mismatch) });
  }
  const fill2 = (tu, du, verifiedOnly) => {
    const u = base(tu);
    const text = normaliseText(tu.kind, du.source);
    if (tu["text-hash"]) {
      if (translationHash(tu.kind, text) === tu["text-hash"]) {
        u.text = text;
        raw.set(tu.id, du.source);
      } else if (!verifiedOnly) {
        u.text = text;
        raw.set(tu.id, du.source);
        untracked.add(tu.id);
        issues.push({ kind: "untracked", id: tu.id, message: "translation edited without updating the tracking file (run `i18n sync`)" });
      }
    } else if (du.hash !== tu["source-hash"]) {
      if (!verifiedOnly) {
        u.text = text;
        raw.set(tu.id, du.source);
        untracked.add(tu.id);
        issues.push({ kind: "untracked", id: tu.id, message: "new translation not recorded in the tracking file (run `i18n sync`)" });
      }
    }
    return u;
  };
  if (mismatch !== -1) {
    let suffix = 0;
    while (suffix < d.length - mismatch && suffix < t.length - mismatch && sig(d[d.length - 1 - suffix]) === sig(t[t.length - 1 - suffix])) suffix++;
    const units2 = t.map((tu, i) => i < mismatch ? fill2(tu, d[i], true) : i >= t.length - suffix ? fill2(tu, d[d.length - t.length + i], true) : base(tu));
    return { tfile: { source: track.source, lang: track.lang, units: units2 }, untracked, raw, issues };
  }
  const units = t.map((tu, i) => fill2(tu, d[i], false));
  return { tfile: { source: track.source, lang: track.lang, units }, untracked, raw, docUnits: d, issues };
}
var FIX = "Keep one block per source block (same headings, paragraphs, list items, cells), or rewrite it from the source with `i18n sync --reset` (units that no longer line up are lost).";
function describeMismatch(d, t, i) {
  const name = (u) => u ? `${u.kind}${u.cell ? ` (cell ${u.cell}${u.field ? ` ${u.field}` : ""})` : u.field ? ` (${u.field})` : ""}${u.section ? ` in #${u.section}` : ""}` : "nothing";
  const where = t[i]?.section ?? d[i]?.section ?? t[i - 1]?.section;
  const count = (xs) => xs.filter((x) => x.section === where).length;
  const counts = where ? `; #${where} has ${count(d)} units in the translation and ${count(t)} in the tracking file` : "";
  return `the translation's structure differs from its tracking file at unit ${i + 1}: found ${name(d[i])}, expected ${name(t[i])}${counts}. ${FIX}`;
}
function withPolicy(r) {
  return {
    ...r.tfile,
    units: r.tfile.units.map((u) => r.untracked.has(u.id) ? { ...u, origin: { by: "unknown", date: "" }, reviews: [] } : u)
  };
}
function writeDoc(file, sourceText, srcUnits, tfile, raw) {
  const synced = syncUnits(file, srcUnits, tfile);
  const edits = [];
  const meta = [];
  const track = [];
  for (const u of synced) {
    const s = u.src;
    const st = u.stored ?? blankUnit(u);
    const text = typeof st.text === "string" && st.text.length ? normaliseText(s.kind, st.text) : void 0;
    const { text: _t, ...rest } = knownPart(st);
    const tu = rest;
    delete tu.source;
    if (text === void 0) tu["source-hash"] = s.hash;
    if (text !== void 0) tu["text-hash"] = translationHash(s.kind, text);
    track.push(orderTrack(tu));
    if (text === void 0) continue;
    if (s.kind === "block") {
      const r = raw?.get(u.id);
      let value = text;
      if (r !== void 0 && normaliseBlockText(r) === text && r.includes("\n")) {
        const col = s.range.start - (sourceText.lastIndexOf("\n", s.range.start - 1) + 1);
        value = r.replace(/\n[ \t]*/g, "\n" + " ".repeat(col));
      }
      edits.push({ start: s.range.start, end: s.range.end, text: value });
    } else if (s.kind === "caption") {
      const line = sourceText.slice(s.range.start, s.range.end);
      const prefix = /^#\|\s*/.exec(line)[0];
      edits.push({ start: s.range.start, end: s.range.end, text: `${prefix}${s.field}: ${JSON.stringify(text)}` });
    } else if (s.kind === "code") {
      edits.push({ start: s.range.start, end: s.range.end, text });
    } else if (s.kind === "meta") {
      meta.push({ path: s.field.split(".").map((k) => /^\d+$/.test(k) ? Number(k) : k), value: text });
    }
  }
  const doc = setFrontMatter(applyEdits(sourceText, edits), meta);
  return { doc, track: { source: tfile.source, lang: tfile.lang, units: track } };
}
function orderTrack(u) {
  const o = {};
  for (const k of TRACK_KEYS) if (u[k] !== void 0) o[k] = u[k];
  return o;
}
function outsideUnits(doc, docUnits) {
  const edits = docUnits.filter((u) => u.range).map((u, k) => ({ start: u.range.start, end: u.range.end, text: `\0${k}\0` }));
  let out = applyEdits(doc, edits);
  const metaFields = docUnits.filter((u) => u.kind === "meta").map((u) => u.field.split("."));
  if (metaFields.length) {
    const m = /^---[ \t]*\r?\n([\s\S]*?)\r?\n(?:---|\.\.\.)[ \t]*(?:\r?\n|$)/.exec(out);
    if (m) {
      const data = (0, import_yaml5.parse)(m[1]) ?? {};
      for (const f of metaFields) {
        let o = data;
        for (const k of f.slice(0, -1)) o = o?.[k];
        if (o && typeof o === "object") o[f[f.length - 1]] = "\0";
      }
      out = JSON.stringify(data) + "\n" + out.slice(m[0].length);
    }
  }
  return out;
}

// src/cli/history.ts
import { execFileSync as execFileSync2 } from "node:child_process";
var MAX_COMMITS = 100;
function git(cwd, args) {
  try {
    return execFileSync2("git", args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"], maxBuffer: 64 * 1024 * 1024 });
  } catch {
    return void 0;
  }
}
async function sourcesFromHistory(root, file, wanted, md) {
  const found = /* @__PURE__ */ new Map();
  if (!wanted.size) return found;
  const log2 = git(root, ["log", `-n${MAX_COMMITS}`, "--format=%H", "--", file]);
  if (!log2) return found;
  for (const commit of log2.split("\n").filter(Boolean)) {
    const text = git(root, ["show", `${commit}:./${file}`]);
    if (text === void 0) continue;
    for (const u of (await extractUnits(text, md)).units) {
      if (wanted.has(u.hash) && !found.has(u.hash)) found.set(u.hash, u.source);
    }
    if (found.size === wanted.size) break;
  }
  return found;
}

// src/cli/project.ts
function extensionDir() {
  const here = path2.dirname(fileURLToPath(import.meta.url));
  for (const c of [here, path2.resolve(here, "../../_extensions/verso")]) {
    if (fs2.existsSync(path2.join(c, "tr.lua"))) return c;
  }
  throw new Error("cannot locate the quarto-i18n extension directory");
}
var PROJECT_FILE = "_quarto.yml";
var CONFIG_KEY = "verso-translate";
var DEFAULT_OUTPUT = { book: "_book", website: "_site", manuscript: "_manuscript" };
var PROJECT_TFILE = "_project.yml";
var Project = class {
  root;
  config;
  tc;
  md;
  extDir;
  unitCache = /* @__PURE__ */ new Map();
  historyCache = /* @__PURE__ */ new Map();
  constructor(root) {
    this.root = path2.resolve(root);
    const cfgPath = path2.join(this.root, PROJECT_FILE);
    if (!fs2.existsSync(cfgPath)) throw new Error(`no ${PROJECT_FILE} in ${this.root}`);
    this.config = (0, import_yaml6.parse)(fs2.readFileSync(cfgPath, "utf8")) ?? {};
    const tc = this.config[CONFIG_KEY];
    if (!tc || !tc.source || !Array.isArray(tc.targets)) throw new Error(`${PROJECT_FILE}: ${CONFIG_KEY}.source and ${CONFIG_KEY}.targets are required`);
    this.tc = tc;
    this.extDir = extensionDir();
    this.md = pandocMarkdown();
  }
  /**
   * The Quarto project type (book, website, manuscript, default, ...). The
   * extension adds no type of its own; the legacy `quarto-i18n` type was a book.
   */
  get type() {
    const t = this.config.project?.type;
    if (typeof t === "string" && t !== "quarto-i18n") return t;
    if (this.config.book || t === "quarto-i18n") return "book";
    return this.config.website ? "website" : "default";
  }
  get outputDir() {
    const out = this.config.project?.["output-dir"] ?? DEFAULT_OUTPUT[this.type];
    if (!out) throw new Error(`${PROJECT_FILE}: set project.output-dir (project type '${this.type}' has no default output directory)`);
    return path2.join(this.root, out);
  }
  get i18nDir() {
    return path2.join(this.root, "_i18n");
  }
  get reviewTarget() {
    return this.tc.review?.target ?? 2;
  }
  languages(filter) {
    const env = process.env.VERSO_TRANSLATE_LANGUAGES;
    const want = filter ?? (env && env !== "all" ? env : void 0);
    if (want === "none") return [];
    const all = this.tc.targets.map(String);
    if (!want) return all;
    const sel = want.split(",").map((s) => s.trim());
    for (const l of sel) if (!all.includes(l)) throw new Error(`${l} is not in ${CONFIG_KEY}.targets`);
    return sel;
  }
  /** Source documents, relative to the root, in a stable order. */
  sources() {
    const out = [];
    const skip = /* @__PURE__ */ new Set([path2.basename(this.outputDir), "node_modules", "renv", "venv", ".venv"]);
    const walk = (dir) => {
      for (const e of fs2.readdirSync(path2.join(this.root, dir), { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
        if (e.name.startsWith("_") || e.name.startsWith(".") || skip.has(e.name)) continue;
        const rel2 = dir ? `${dir}/${e.name}` : e.name;
        if (e.isDirectory()) walk(rel2);
        else if (/\.(qmd|md)$/.test(e.name) && !/^(README|LICENSE|CHANGELOG)/i.test(e.name)) out.push(rel2);
      }
    };
    walk("");
    return out;
  }
  tfilePath(lang, file) {
    return path2.join(this.i18nDir, lang, file === PROJECT_FILE ? PROJECT_TFILE : `${file}.yml`);
  }
  /** The translated copy of a document. */
  docPath(lang, file) {
    return path2.join(this.i18nDir, lang, file);
  }
  rel(abs) {
    return path2.relative(this.root, abs).split(path2.sep).join("/");
  }
  /**
   * The files that hold a translation, relative to the root: the translated
   * document and its tracking file, or the project file's translation file.
   */
  storedPaths(lang, file) {
    const track = this.rel(this.tfilePath(lang, file));
    return file === PROJECT_FILE ? [track] : [this.rel(this.docPath(lang, file)), track];
  }
  disk = (rel2) => {
    const p = path2.join(this.root, rel2);
    return fs2.existsSync(p) ? fs2.readFileSync(p, "utf8") : void 0;
  };
  /**
   * The translation of one document as stored, from disk or from another
   * version of the files (`get`, e.g. a PR branch). For a document, also how
   * the translated copy was read.
   */
  async loadTFile(lang, file, get = this.disk) {
    const paths = this.storedPaths(lang, file);
    const track = paths[paths.length - 1];
    try {
      const t = get(track);
      if (t === void 0) return {};
      if (file === PROJECT_FILE) return { tfile: parseTFile(t) };
      const doc = get(paths[0]);
      if (doc === void 0) throw new Error(`${paths[0]} is missing (its tracking file exists)`);
      const r = await readDoc(doc, parseTrack(t), this.md);
      return { tfile: withPolicy(r), doc: r };
    } catch (e) {
      throw new Error(`${track}: ${e.message}`);
    }
  }
  /** The stored form of a translation: path (relative to the root) → content. */
  async serialise(t, raw) {
    const paths = this.storedPaths(t.lang, t.source);
    if (t.source === PROJECT_FILE) return { [paths[0]]: stringifyTFile(t) };
    const { units } = await this.units(t.source);
    const w = writeDoc(t.source, this.readSource(t.source), units, t, raw);
    return { [paths[0]]: w.doc, [paths[1]]: stringifyTrack(w.track, path2.posix.basename(paths[0])) };
  }
  /**
   * Write a translation. A translated document whose structure no longer
   * matches its tracking file is never overwritten (its translations could not
   * be carried over) unless `reset` is set.
   */
  async saveTFile(t, raw, opts = {}) {
    if (t.source !== PROJECT_FILE && !opts.reset) {
      const cur = await this.loadTFile(t.lang, t.source);
      const bad = cur.doc?.issues.find((i) => i.kind === "structure");
      if (bad) throw new Error(`${this.storedPaths(t.lang, t.source)[0]}: not written, ${bad.message}`);
    }
    for (const [rel2, content] of Object.entries(await this.serialise(t, raw))) {
      const p = path2.join(this.root, rel2);
      fs2.mkdirSync(path2.dirname(p), { recursive: true });
      fs2.writeFileSync(p, content);
    }
  }
  glossary() {
    const g = this.tc.glossary;
    if (!g) return [];
    if (typeof g === "string") {
      const p = path2.join(this.root, g);
      return fs2.existsSync(p) ? parseSourceGlossary((0, import_yaml6.parse)(fs2.readFileSync(p, "utf8"))) : [];
    }
    return parseSourceGlossary(g);
  }
  langGlossaryPath(lang) {
    return path2.join(this.i18nDir, lang, "_glossary.yml");
  }
  langGlossary(lang) {
    const p = this.langGlossaryPath(lang);
    return fs2.existsSync(p) ? parseLangGlossary(fs2.readFileSync(p, "utf8")) : {};
  }
  writeLangGlossary(lang, g) {
    const p = this.langGlossaryPath(lang);
    fs2.mkdirSync(path2.dirname(p), { recursive: true });
    fs2.writeFileSync(p, stringifyLangGlossary(lang, g));
  }
  readSource(file) {
    return fs2.readFileSync(path2.join(this.root, file), "utf8");
  }
  async units(file) {
    if (!this.unitCache.has(file)) {
      if (file === PROJECT_FILE) this.unitCache.set(file, { units: projectUnits(this.config), issues: [] });
      else this.unitCache.set(file, await extractUnits(this.readSource(file), this.md));
    }
    return this.unitCache.get(file);
  }
  async state(lang, file) {
    const { units, issues } = await this.units(file);
    const { tfile, doc } = await this.loadTFile(lang, file);
    const synced = syncUnits(file, units, tfile, { termHashes: termHashes(this.glossary(), this.langGlossary(lang)) });
    if (doc) await this.recoverSources(file, synced);
    return { file, units, synced, tfile, issues, doc };
  }
  /**
   * Tracking files keep no source text; stale translations get their old source
   * back from git history (for retranslation and `on-stale: previous`).
   */
  async recoverSources(file, synced) {
    const need = synced.filter((u) => u.status === "stale" && u.stored?.text && u.stored.source === void 0);
    if (!need.length) return;
    const key = `${file}\0${need.map((u) => u.stored["source-hash"]).sort().join(",")}`;
    let found = this.historyCache.get(key);
    if (!found) {
      found = await sourcesFromHistory(this.root, file, new Set(need.map((u) => u.stored["source-hash"])), this.md);
      this.historyCache.set(key, found);
    }
    for (const u of need) {
      const s = found.get(u.stored["source-hash"]);
      if (s !== void 0) u.stored = { ...u.stored, source: s };
    }
  }
  /** All documents plus the project file. */
  allFiles() {
    return [PROJECT_FILE, ...this.sources()];
  }
  configDocument() {
    return (0, import_yaml6.parseDocument)(fs2.readFileSync(path2.join(this.root, PROJECT_FILE), "utf8"));
  }
};
function hasTranslateConfig(root) {
  const cfg = path2.join(root, PROJECT_FILE);
  return fs2.existsSync(cfg) && !!((0, import_yaml6.parse)(fs2.readFileSync(cfg, "utf8")) ?? {})[CONFIG_KEY];
}
function findProjectRoot(start = process.cwd()) {
  let dir = path2.resolve(start);
  for (; ; ) {
    if (fs2.existsSync(path2.join(dir, PROJECT_FILE))) return dir;
    const up = path2.dirname(dir);
    if (up === dir) throw new Error(`no ${PROJECT_FILE} found from ${start}`);
    dir = up;
  }
}

// src/cli/build.ts
function pageOf(file) {
  return file.replace(/\.(qmd|md)$/, ".html");
}
function rel(fromPage, toPage) {
  const r = path3.posix.relative(path3.posix.dirname(fromPage), toPage);
  return r || path3.posix.basename(toPage);
}
async function validateStates(p, states) {
  const cands = [];
  const onStale = p.tc["on-stale"] ?? "source";
  for (const st of states) {
    for (const u of st.synced) {
      const t = u.stored;
      if (!t) continue;
      if (u.status === "current") {
        cands.push({ id: `${st.file}#${u.id}`, src: u.src, text: t.text });
      } else if (u.status === "stale" && onStale === "previous" && u.src.kind === "block" && t.text && t.source) {
        cands.push({ id: `${st.file}#${u.id}`, src: { ...u.src, source: t.source }, text: t.text });
      }
    }
  }
  return validate(cands, p.md);
}
function forFile(m, file) {
  const out = /* @__PURE__ */ new Map();
  for (const [k, v] of m) if (k.startsWith(file + "#")) out.set(k.slice(file.length + 1), v);
  return out;
}
function symlinkOrCopy(target, link) {
  try {
    fs3.symlinkSync(path3.relative(path3.dirname(link), target), link);
  } catch {
    fs3.cpSync(target, link, { recursive: true });
  }
}
function hasSources(abs) {
  for (const e of fs3.readdirSync(abs, { withFileTypes: true })) {
    if (e.isDirectory() ? hasSources(path3.join(abs, e.name)) : /\.(qmd|md)$/.test(e.name)) return true;
  }
  return false;
}
function prepareMirror(p, lang, mirror, sources) {
  fs3.mkdirSync(mirror, { recursive: true });
  const outName = path3.basename(p.outputDir);
  for (const e of fs3.readdirSync(mirror)) {
    if (e === outName || e === ".quarto") continue;
    fs3.rmSync(path3.join(mirror, e), { recursive: true, force: true });
  }
  const skip = /* @__PURE__ */ new Set([PROJECT_FILE, "_i18n", outName, ".quarto", "_freeze", ".git", "node_modules", ".Rproj.user"]);
  const walk = (dir) => {
    for (const e of fs3.readdirSync(path3.join(p.root, dir), { withFileTypes: true })) {
      const relPath = dir ? `${dir}/${e.name}` : e.name;
      if (!dir && skip.has(e.name)) continue;
      const src = path3.join(p.root, relPath);
      const dst = path3.join(mirror, relPath);
      if (e.isDirectory() && !e.name.startsWith("_") && hasSources(src)) {
        fs3.mkdirSync(dst, { recursive: true });
        walk(relPath);
      } else if (!sources.has(relPath)) {
        symlinkOrCopy(src, dst);
      }
    }
  };
  walk("");
  const freeze = path3.join(p.i18nDir, lang, "_freeze");
  fs3.mkdirSync(freeze, { recursive: true });
  symlinkOrCopy(freeze, path3.join(mirror, "_freeze"));
}
function mirrorConfig(p, lang, proj) {
  const doc = p.configDocument();
  doc.setIn(["project", "type"], p.type);
  const typeNode = doc.getIn(["project"], true)?.items?.find((it) => it.key?.value === "type");
  if (typeNode?.value) typeNode.value.comment = null;
  doc.deleteIn(["project", "output-dir"]);
  for (const hook of ["pre-render", "post-render"]) {
    const v = doc.getIn(["project", hook]);
    const list = v?.toJSON?.() ?? (typeof v === "string" ? [v] : []);
    const kept = list.filter((s) => !/i18n\.mjs/.test(String(s)));
    if (kept.length) doc.setIn(["project", hook], kept);
    else doc.deleteIn(["project", hook]);
  }
  doc.delete(CONFIG_KEY);
  doc.set("lang", lang);
  for (const u of proj.units) {
    if (u.text !== void 0 && u.field) doc.setIn(u.field.split(".").map((k) => /^\d+$/.test(k) ? Number(k) : k), u.text);
  }
  const top = p.type;
  const siteUrl = doc.getIn([top, "site-url"]);
  if (typeof siteUrl === "string") doc.setIn([top, "site-url"], siteUrl.replace(/\/?$/, `/${lang}/`));
  doc.deleteIn([top, "repo-actions"]);
  const rel2 = path3.relative(p.root, path3.join(p.extDir, "tr.lua"));
  const lua = rel2.startsWith("_extensions" + path3.sep) ? rel2.split(path3.sep).join("/") : path3.join(p.extDir, "tr.lua");
  const filters = doc.get("filters")?.toJSON?.() ?? [];
  doc.set("filters", [lua, ...filters.filter((f) => f !== lua)]);
  return `# Generated by quarto-i18n for ${lang}. Do not edit.
` + doc.toString({ lineWidth: 0 });
}
async function buildLanguage(p, lang, log2) {
  const mirror = path3.join(p.i18nDir, "build", lang);
  const files = p.sources();
  prepareMirror(p, lang, mirror, new Set(files));
  const states = await Promise.all(files.map((f) => p.state(lang, f)));
  const projState = await p.state(lang, PROJECT_FILE);
  const rejected = await validateStates(p, [...states, projState]);
  for (const [k, r] of rejected) log2(`warning: ${k} shown in source language: ${r}`);
  const reverted = /* @__PURE__ */ new Set();
  const structureFallback = /* @__PURE__ */ new Set();
  const onStale = p.tc["on-stale"] ?? "source";
  const results = /* @__PURE__ */ new Map();
  const statsOf = /* @__PURE__ */ new Map();
  const proj = materialise("", projState.synced, { lang, sourceLang: p.tc.source, onStale, rejected: forFile(rejected, PROJECT_FILE) });
  fs3.writeFileSync(path3.join(mirror, PROJECT_FILE), mirrorConfig(p, lang, proj));
  const writeDoc2 = async (st) => {
    const text = p.readSource(st.file);
    const page = pageOf(st.file);
    const rej = forFile(rejected, st.file);
    if (structureFallback.has(st.file)) for (const u of st.synced) rej.set(u.id, rej.get(u.id) ?? "file failed the structure check");
    const opts = { lang, sourceLang: p.tc.source, onStale, rejected: rej, reverted: new Set([...reverted].filter((k) => k.startsWith(st.file + "#")).map((k) => k.slice(st.file.length + 1))) };
    const first = materialise(text, st.synced, opts);
    const stats = pageStats(first.units, p.reviewTarget);
    const minCoverage = p.tc["min-coverage"] ?? 0.5;
    const extra = { "verso-translate": { lang, notice: true } };
    if (stats.translated < minCoverage) extra["include-in-header"] = [{ text: '<meta name="robots" content="noindex">' }];
    const m = materialise(text, st.synced, { ...opts, meta: extra });
    if (!structureFallback.has(st.file)) {
      const [a, b] = await Promise.all([p.md.parseWithPositions(text), p.md.parseWithPositions(m.text)]);
      if (documentShape(a.blocks) !== documentShape(b.blocks)) {
        log2(`warning: ${st.file}: structure differs from the source after translation; showing the source`);
        structureFallback.add(st.file);
        return writeDoc2(st);
      }
    }
    fs3.mkdirSync(path3.dirname(path3.join(mirror, st.file)), { recursive: true });
    fs3.writeFileSync(path3.join(mirror, st.file), m.text);
    results.set(st.file, m);
    statsOf.set(st.file, stats);
  };
  for (const st of states) await writeDoc2(st);
  for (let attempt = 0; ; attempt++) {
    log2(`rendering ${path3.relative(p.root, mirror)}`);
    const r = await renderProject(mirror, (l) => {
      if (/^\s*(\[\s*\d+\/\d+\]|ERROR|WARN|Quitting|Error)/.test(l)) log2("  " + l.trim());
    });
    if (r.code === 0) break;
    const fc = failingCell(r.stderr);
    const st = fc && states.find((s) => (!fc.file || path3.posix.basename(s.file) === path3.posix.basename(fc.file)) && s.synced.some((u) => u.src.kind === "code" && u.src.cell === fc.label));
    const unit = st && st.synced.find((u) => u.src.kind === "code" && u.src.cell === fc.label);
    const key = st && unit ? `${st.file}#${unit.id}` : "";
    if (!st || !unit || reverted.has(key) || attempt >= 5) {
      const lines = r.stderr.replace(/\x1b\[[0-9;]*m/g, "").split("\n").filter((l) => l.trim() && !/^\s+at /.test(l));
      throw new Error(`rendering ${lang} failed (${path3.relative(p.root, mirror)}):
${lines.slice(-15).join("\n")}`);
    }
    log2(`cell ${fc.label} in ${st.file} failed in ${lang}; reverting it to the source and retrying`);
    reverted.add(key);
    await writeDoc2(st);
  }
  const built = path3.join(mirror, path3.basename(p.outputDir));
  const dest = path3.join(p.outputDir, lang);
  fs3.rmSync(dest, { recursive: true, force: true });
  fs3.cpSync(built, dest, { recursive: true });
  const repo = p.tc.review?.repo;
  const S = uiStrings(lang);
  for (const st of states) {
    const m = results.get(st.file);
    const page = pageOf(st.file);
    const data = {
      lang,
      sourceLang: p.tc.source,
      file: st.file,
      page,
      // "Edit on GitHub" opens the file that holds the text.
      tfile: p.storedPaths(lang, st.file)[0],
      original: "../".repeat(page.split("/").length) + page,
      guide: guideHref(p.tc.review?.guide, page),
      repo,
      dir: p.tc.review?.dir ?? "",
      service: p.tc.review?.service ?? null,
      target: p.reviewTarget,
      strings: S,
      stats: statsOf.get(st.file),
      units: m.units.map(slim)
    };
    const out = path3.join(dest, page.replace(/\.html$/, ".tr.json"));
    if (fs3.existsSync(path3.dirname(out))) fs3.writeFileSync(out, JSON.stringify(data));
    const html = path3.join(dest, page);
    if (fs3.existsSync(html)) {
      const banner = bannerHtml({ lang, sourceLang: p.tc.source, stats: statsOf.get(st.file), original: data.original });
      fs3.writeFileSync(html, fs3.readFileSync(html, "utf8").replace(NOTICE, () => banner));
    }
  }
  const pages = files.map((f) => ({ file: f, stats: statsOf.get(f) }));
  const report = {
    lang,
    pages,
    rejected: Object.fromEntries(rejected),
    reverted: [...reverted],
    fallbackFiles: [...structureFallback],
    stats: mergeStats(pages.map((x) => x.stats), states.map((s) => s.units.reduce((n, u) => n + u.source.length, 0)), p.reviewTarget)
  };
  fs3.writeFileSync(path3.join(mirror, "i18n-report.json"), JSON.stringify(report, null, 2));
  return report;
}
function guideHref(guide, page) {
  if (!guide) return null;
  if (/^[a-z]+:\/\//i.test(guide)) return guide;
  return rel(page, pageOf(guide.replace(/^\//, "")));
}
var NOTICE = '<div class="tr-notice"></div>';
function slim(u) {
  const { weight: _w, ...rest } = u;
  return rest;
}
var START = "<!-- quarto-i18n:start -->";
var END = "<!-- quarto-i18n:end -->";
function stripInjected(html) {
  return html.replace(new RegExp(`${START}[\\s\\S]*?${END}\\n?`, "g"), "");
}
function listHtml(dir, exclude, base = "") {
  if (!fs3.existsSync(dir)) return [];
  const out = [];
  for (const e of fs3.readdirSync(path3.join(dir, base), { withFileTypes: true })) {
    const r = base ? `${base}/${e.name}` : e.name;
    if (!base && exclude.has(e.name)) continue;
    if (e.isDirectory()) {
      if (e.name !== "site_libs") out.push(...listHtml(dir, exclude, r));
    } else if (e.name.endsWith(".html")) out.push(r);
  }
  return out;
}
function postProcess(p, onlyPages) {
  const langs = p.tc.targets.map(String).filter((l) => fs3.existsSync(path3.join(p.outputDir, l)));
  const versions = [p.tc.source, ...langs];
  const exclude = new Set(langs);
  const pagesOf = /* @__PURE__ */ new Map();
  pagesOf.set(p.tc.source, new Set(listHtml(p.outputDir, exclude)));
  for (const l of langs) pagesOf.set(l, new Set(listHtml(path3.join(p.outputDir, l), /* @__PURE__ */ new Set())));
  const siteUrl = p.config[p.type]?.["site-url"];
  for (const v of versions) {
    const isSource = v === p.tc.source;
    const dir = isSource ? p.outputDir : path3.join(p.outputDir, v);
    for (const page of pagesOf.get(v)) {
      if (onlyPages && !(isSource && onlyPages.includes(page))) continue;
      const file = path3.join(dir, page);
      let html = stripInjected(fs3.readFileSync(file, "utf8"));
      const here = isSource ? page : `${v}/${page}`;
      const href = (lang) => {
        const target = lang === p.tc.source ? page : `${lang}/${page}`;
        return siteUrl ? `${siteUrl.replace(/\/$/, "")}/${target}` : rel(here, target);
      };
      const available = versions.filter((l) => pagesOf.get(l).has(page));
      const head = [
        ...available.map((l) => `<link rel="alternate" hreflang="${l}" href="${href(l)}">`),
        `<link rel="alternate" hreflang="x-default" href="${href(p.tc.source)}">`,
        ...isSource ? [] : [`<meta name="i18n-review-data" content="${path3.posix.basename(page).replace(/\.html$/, ".tr.json")}">`]
      ];
      html = html.replace("</head>", `${START}
${head.join("\n")}
${END}
</head>`);
      const links = versions.map((l) => {
        const has = pagesOf.get(l).has(page);
        const target = has ? href(l) : l === p.tc.source ? rel(here, "index.html") : rel(here, `${l}/index.html`);
        const cur = l === v ? ' aria-current="page"' : "";
        return `<a class="tr-switcher-link" href="${target}" lang="${l}" hreflang="${l}"${cur}>${endonym(l)}</a>`;
      });
      const label = uiStrings(v).languages;
      const nav = `${START}
<nav class="tr-switcher" aria-label="${label}">${links.join("")}</nav>
${END}
`;
      if (/<div class="sidebar-title[^"]*">[\s\S]*?<\/div>/.test(html)) html = html.replace(/(<div class="sidebar-title[^"]*">[\s\S]*?<\/div>)/, `$1
${nav}`);
      else if (/<div class="sidebar-tools-main[^"]*">/.test(html)) html = html.replace(/(<div class="sidebar-tools-main[^"]*">)/, `${nav}$1`);
      else if (/<div class="quarto-navbar-tools[^"]*">/.test(html)) html = html.replace(/(<div class="quarto-navbar-tools[^"]*">)/, `$1${nav}`);
      else html = html.replace(/(<body[^>]*>)/, `$1
${nav}`);
      if (!/tr-switcher-style/.test(html)) {
        html = html.replace("</head>", `${START}
<style id="tr-switcher-style">${SWITCHER_CSS}</style>
${END}
</head>`);
      }
      fs3.writeFileSync(file, html);
    }
  }
}
var SWITCHER_CSS = `.tr-switcher{display:flex;flex-wrap:wrap;gap:.25rem .75rem;font-size:.875rem;margin:.25rem 0 .5rem}.tr-switcher-link{text-decoration:none}.tr-switcher-link[aria-current]{font-weight:600;text-decoration:underline;text-underline-offset:3px}`;
async function buildAll(p, langs, log2) {
  if (!fs3.existsSync(p.outputDir)) throw new Error(`${path3.relative(process.cwd(), p.outputDir)} not found: render the source site first (quarto render)`);
  const reports = [];
  for (const lang of langs) reports.push(await buildLanguage(p, lang, log2(lang)));
  postProcess(p);
  return reports;
}

// src/cli/check.ts
import { execFileSync as execFileSync3 } from "node:child_process";
import fs4 from "node:fs";
import path4 from "node:path";

// src/core/contrib.ts
var CHECK_NAMES = [
  "only translation files changed",
  "schema, ids, order and source unchanged",
  "changed units are current",
  "changed text resets reviews to the contributor",
  "added reviews are by the contributor, once per person",
  "prose skeleton identical to the source",
  "code cells stay inside the cell and keep their options (changes need maintainer review)",
  "glossary entries are plain text"
];
async function checkContribution(base, head, changed, ctx) {
  const res = CHECK_NAMES.map((name, i) => ({ check: i + 1, name, ok: true, messages: [] }));
  const fail = (n, m) => {
    res[n - 1].ok = false;
    res[n - 1].messages.push(m);
  };
  const esc2 = ctx.prefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  ({ base, head, changed } = await expandDocs(base, head, changed, ctx, esc2, fail));
  const allowed = new RegExp(`^${esc2}_i18n/([A-Za-z]{2,3}(?:-[A-Za-z0-9]+)*)/(?!_freeze/|build/)[^\\0]+\\.yml$`);
  if (ctx.branch !== void 0 && !ctx.branch.startsWith("i18n/")) fail(1, `branch ${ctx.branch} is not under i18n/`);
  const files = [];
  for (const p of changed) {
    const m = allowed.exec(p);
    if (!m || p.includes("..") || p.split("/").includes("build")) fail(1, `${p} is not a translation file`);
    else files.push({ path: p, lang: m[1] });
  }
  const cands = [];
  for (const f of files) {
    const rel2 = f.path.slice(ctx.prefix.length + `_i18n/${f.lang}/`.length);
    const headText = head.get(f.path);
    const baseText = base.get(f.path);
    if (headText === void 0) {
      fail(1, `${f.path} was deleted`);
      continue;
    }
    if (rel2 === "_glossary.yml") {
      checkGlossary(baseText, headText, ctx, fail, f.path);
      continue;
    }
    if (baseText === void 0) {
      fail(2, `${f.path} is a new file; translation files are created by \`i18n translate\``);
      continue;
    }
    let a;
    let b;
    try {
      a = parseTFile(baseText);
      b = parseTFile(headText);
    } catch (e) {
      fail(2, `${f.path}: ${e.message}`);
      continue;
    }
    if (a.source !== b.source || a.lang !== b.lang) fail(2, `${f.path}: source or lang changed`);
    if (a.units.length !== b.units.length || a.units.some((u, i) => u.id !== b.units[i].id)) {
      fail(2, `${f.path}: unit ids or order changed`);
      continue;
    }
    const changedUnits = [];
    for (let i = 0; i < a.units.length; i++) {
      const ua = a.units[i];
      const ub = b.units[i];
      for (const k of ["kind", "section", "cell", "field", "source-hash", "source"]) {
        if (ua[k] !== ub[k]) fail(2, `${f.path} ${ua.id}: ${k} changed`);
      }
      const extra = unknownKeys(ub).filter((k) => JSON.stringify(ua[k]) !== JSON.stringify(ub[k]));
      if (extra.length) fail(2, `${f.path} ${ua.id}: unknown keys added or changed: ${extra.join(", ")}`);
      if (JSON.stringify(knownPart(ua)) !== JSON.stringify(knownPart(ub))) changedUnits.push({ a: ua, b: ub });
    }
    if (!changedUnits.length) continue;
    const srcFile = b.source;
    const units = rel2 === "_project.yml" ? await ctx.units("_quarto.yml") : await ctx.units(srcFile);
    if (!units) {
      fail(3, `${f.path}: source ${srcFile} not found`);
      continue;
    }
    const synced = syncUnits(srcFile, units, a);
    const byId = new Map(synced.map((s) => [s.id, s]));
    for (const { a: ua, b: ub } of changedUnits) {
      const s = byId.get(ua.id);
      if (!s || s.status === "missing" || s.src.hash !== ua["source-hash"]) {
        fail(3, `${f.path} ${ua.id}: unit is stale or not in the current source`);
        continue;
      }
      const textChanged = ua.text !== ub.text;
      const ra = (ua.reviews ?? []).map((r) => r.by);
      const rb = (ub.reviews ?? []).map((r) => r.by);
      if (new Set(rb).size !== rb.length) fail(5, `${f.path} ${ua.id}: a person reviewed twice`);
      if (textChanged) {
        if (rb.length !== 1 || rb[0] !== ctx.author) fail(4, `${f.path} ${ua.id}: text changed, so reviews must be exactly [${ctx.author}] (found [${rb.join(", ")}])`);
        if (ub.origin?.by !== ctx.author) fail(4, `${f.path} ${ua.id}: origin must be ${ctx.author}`);
        cands.push({ id: `${f.path}#${ua.id}`, src: s.src, text: ub.text });
        if (ua.kind === "code") {
          (res[6].attention ??= []).push(`${f.path} ${ua.id} (cell ${ua.cell}): code changed; read the diff before merging or rendering`);
        }
      } else {
        const removed = ra.filter((r) => !rb.includes(r));
        const added = rb.filter((r) => !ra.includes(r));
        if (removed.length) fail(5, `${f.path} ${ua.id}: reviews removed (${removed.join(", ")})`);
        if (added.some((r) => r !== ctx.author)) fail(5, `${f.path} ${ua.id}: review added for someone else (${added.join(", ")})`);
        if (JSON.stringify(ua.origin) !== JSON.stringify(ub.origin) || JSON.stringify(ua.terms) !== JSON.stringify(ub.terms)) fail(5, `${f.path} ${ua.id}: origin changed without a text change`);
      }
    }
  }
  if (cands.length) {
    const rejected = await validate(cands, ctx.md);
    for (const c of cands) {
      const r = rejected.get(c.id);
      if (r) fail(c.src.kind === "code" ? 7 : 6, `${c.id}: ${r}`);
    }
  }
  return res;
}
async function expandDocs(base, head, changed, ctx, esc2, fail) {
  const doc = new RegExp(`^${esc2}_i18n/[A-Za-z]{2,3}(?:-[A-Za-z0-9]+)*/(?!_freeze/|build/)[^\\0]+\\.(?:qmd|md)$`);
  const groups = /* @__PURE__ */ new Set();
  const rest = [];
  for (const p of changed) {
    if (doc.test(p)) groups.add(p + ".yml");
    else if (/\.(?:qmd|md)\.yml$/.test(p) && doc.test(p.slice(0, -4))) groups.add(p);
    else rest.push(p);
  }
  if (!groups.size) return { base, head, changed };
  const b2 = new Map(base);
  const h2 = new Map(head);
  const side = (m, p) => m.has(p) ? m.get(p) : changed.includes(p) ? void 0 : ctx.readUnchanged(p);
  for (const track of groups) {
    const docPath = track.slice(0, -4);
    for (const p of [docPath, track]) {
      b2.delete(p);
      h2.delete(p);
    }
    const [bd, bt, hd, ht] = [side(base, docPath), side(base, track), side(head, docPath), side(head, track)];
    if (hd === void 0 || ht === void 0) {
      fail(1, `${hd === void 0 ? docPath : track} was deleted`);
      continue;
    }
    if (bd === void 0 || bt === void 0) {
      fail(2, `${track}: a new translation; translated documents are created by \`i18n translate\``);
      continue;
    }
    let a, b;
    try {
      [a, b] = await Promise.all([readDoc(bd, parseTrack(bt), ctx.md), readDoc(hd, parseTrack(ht), ctx.md)]);
    } catch (e) {
      fail(2, `${track}: ${e.message}`);
      continue;
    }
    for (const i of b.issues) {
      if (i.kind === "structure" && !a.issues.some((x) => x.kind === "structure")) fail(2, `${docPath}: ${i.message}`);
      if (i.kind === "untracked" && !a.untracked.has(i.id)) fail(4, `${docPath} ${i.id}: text changed but the tracking file was not updated; run \`i18n sync --by ${ctx.author}\` and commit both files`);
    }
    if (a.docUnits && b.docUnits) {
      const oa = outsideUnits(bd, a.docUnits).split("\n");
      const ob = outsideUnits(hd, b.docUnits).split("\n");
      const k = oa.findIndex((l, i) => l !== ob[i]);
      if (k !== -1 || oa.length !== ob.length) {
        const line = (ob[k === -1 ? oa.length : k] ?? oa[k] ?? "").replace(/\u0000\d+\u0000/g, "\u2026").trim().slice(0, 80);
        fail(2, `${docPath}: changes outside translatable text (structure, cell options, attributes or markup)${line ? ` at "${line}"` : ""}; only the text of headings, paragraphs, captions and code cells may change`);
      }
    }
    const head2 = { ...b.tfile, units: b.tfile.units.map((u) => b.untracked.has(u.id) && !a.untracked.has(u.id) ? { ...u, origin: { by: ctx.author, date: "" }, reviews: [{ by: ctx.author, date: "" }] } : u) };
    b2.set(track, stringifyTFile(a.tfile));
    h2.set(track, stringifyTFile(head2));
    rest.push(track);
  }
  return { base: b2, head: h2, changed: rest };
}
function checkGlossary(baseText, headText, ctx, fail, path8) {
  if (baseText === void 0) {
    fail(2, `${path8} is a new file`);
    return;
  }
  let a, b;
  try {
    a = parseLangGlossary(baseText);
    b = parseLangGlossary(headText);
  } catch (e) {
    fail(2, `${path8}: ${e.message}`);
    return;
  }
  if (Object.keys(a).join() !== Object.keys(b).join()) fail(2, `${path8}: glossary keys changed`);
  for (const [k, eb] of Object.entries(b)) {
    const ea = a[k];
    if (!ea) continue;
    if (ea["source-hash"] !== eb["source-hash"]) fail(2, `${path8} ${k}: source-hash changed`);
    for (const s of [eb.term, ...eb.variants ?? [], eb.note ?? ""]) if (s && !isPlainText(s)) fail(8, `${path8} ${k}: "${s}" is not plain text`);
    const changed = ea.term !== eb.term || JSON.stringify(ea.variants) !== JSON.stringify(eb.variants) || ea.note !== eb.note;
    const ra = (ea.reviews ?? []).map((r) => r.by);
    const rb = (eb.reviews ?? []).map((r) => r.by);
    if (changed && (rb.length !== 1 || rb[0] !== ctx.author)) fail(4, `${path8} ${k}: term changed, so reviews must be exactly [${ctx.author}]`);
    if (!changed) {
      if (ra.some((r) => !rb.includes(r))) fail(5, `${path8} ${k}: reviews removed`);
      if (rb.filter((r) => !ra.includes(r)).some((r) => r !== ctx.author)) fail(5, `${path8} ${k}: review added for someone else`);
    }
    if (new Set(rb).size !== rb.length) fail(5, `${path8} ${k}: a person reviewed twice`);
  }
}

// src/cli/check.ts
async function status(p, langs) {
  const rows = [];
  for (const lang of langs) {
    for (const file of p.allFiles()) {
      const st = await p.state(lang, file);
      const w = (f) => st.synced.filter(f).reduce((n, u) => n + u.src.source.length, 0);
      const total = w(() => true) || 1;
      rows.push({
        lang,
        file,
        units: st.synced.length,
        machine: st.synced.filter((u) => displayStatus(u) === "machine").length,
        reviewed: st.synced.filter((u) => displayStatus(u) === "reviewed").length,
        full: st.synced.filter((u) => reviewCount(u) >= p.reviewTarget).length,
        stale: st.synced.filter((u) => u.status === "stale").length,
        missing: st.synced.filter((u) => u.status === "missing").length,
        reviewedShare: w((u) => reviewCount(u) > 0) / total
      });
    }
  }
  return rows;
}
function formatStatus(rows) {
  const head = ["lang", "file", "units", "machine", "reviewed", `\u2265target`, "stale", "missing", "reviewed %"];
  const body = rows.map((r) => [r.lang, r.file, r.units, r.machine, r.reviewed, r.full, r.stale, r.missing, pct(r.reviewedShare)].map(String));
  const widths = head.map((h, i) => Math.max(h.length, ...body.map((b) => b[i].length)));
  const line = (cells) => cells.map((c, i) => i < 2 ? c.padEnd(widths[i]) : c.padStart(widths[i])).join("  ");
  return [line(head), line(widths.map((n) => "-".repeat(n))), ...body.map(line)].join("\n");
}
function gitRoot(dir) {
  try {
    return execFileSync3("git", ["rev-parse", "--show-toplevel"], { cwd: dir, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  } catch {
    return null;
  }
}
async function checkProject(p, langs) {
  const out = [];
  for (const file of p.sources()) {
    const { issues } = await p.units(file);
    for (const i of issues) out.push({ level: i.level, where: `${file}${i.line ? ":" + i.line : ""}`, message: i.message });
  }
  const glossary = p.glossary();
  for (const lang of langs) {
    const states = await Promise.all(p.allFiles().map((f) => p.state(lang, f)));
    const rejected = await validateStates(p, states);
    for (const [k, r] of rejected) out.push({ level: "warning", where: `${lang} ${k}`, message: `translation fails validation and falls back to the source: ${r}` });
    const lg = p.langGlossary(lang);
    let stale = 0;
    let missing = 0;
    for (const st of states) {
      for (const i of st.doc?.issues ?? []) {
        const where = `${lang} ${p.storedPaths(lang, st.file)[0]}${i.id ? "#" + i.id : i.line ? ":" + i.line : ""}`;
        out.push({ level: i.kind === "untracked" ? "warning" : "error", where, message: i.kind === "structure" ? `${i.message} Until then the units in between show the source.` : i.message });
      }
      for (const u of st.doc ? [] : st.tfile?.units ?? []) {
        const extra = unknownKeys(u);
        if (extra.length) out.push({ level: "warning", where: `${lang} ${st.file}#${u.id}`, message: `unknown keys ${extra.join(", ")} in the translation file (left by another version; \`i18n translate\` removes them)` });
      }
      for (const u of st.synced) {
        if (u.status === "stale") stale++;
        if (u.status === "missing") missing++;
        if (u.status === "current" && u.stored?.text && u.src.kind !== "code") {
          for (const w of termWarnings(glossary, lg, u.src.source, u.stored.text)) out.push({ level: "warning", where: `${lang} ${st.file}#${u.id}`, message: `glossary: ${w}` });
        }
      }
    }
    if (stale || missing) out.push({ level: "info", where: lang, message: `${stale} stale and ${missing} missing units (run \`i18n translate\`)` });
  }
  const root = gitRoot(p.root);
  const wf = root ? path4.join(root, ".github", "workflows") : null;
  if (wf && fs4.existsSync(wf)) {
    for (const f of fs4.readdirSync(wf).filter((x) => /\.ya?ml$/.test(x))) {
      const text = fs4.readFileSync(path4.join(wf, f), "utf8");
      if (/\bpull_request_target\b/.test(text)) out.push({ level: "warning", where: `.github/workflows/${f}`, message: "pull_request_target runs with secrets on PR content; never check out or render contribution PRs in it" });
    }
  }
  return out;
}
function formatFindings(f) {
  if (!f.length) return "No problems found.";
  const icon = { error: "\u2716", warning: "!", info: "\xB7" };
  return f.map((x) => `${icon[x.level]} ${x.level.padEnd(7)} ${x.where}: ${x.message}`).join("\n");
}
function readGitPr(repoDir, base, head, author, branch) {
  const git2 = (...a) => execFileSync3("git", a, { cwd: repoDir, encoding: "utf8", maxBuffer: 64 << 20 });
  const mb = git2("merge-base", base, head).trim();
  const changed = git2("diff", "--name-only", "--no-renames", mb, head).split("\n").filter(Boolean);
  const show2 = (ref, f) => {
    try {
      return git2("show", `${ref}:${f}`);
    } catch {
      return void 0;
    }
  };
  const baseMap = /* @__PURE__ */ new Map();
  const headMap = /* @__PURE__ */ new Map();
  for (const f of changed) {
    const a = show2(mb, f);
    const b = show2(head, f);
    if (a !== void 0) baseMap.set(f, a);
    if (b !== void 0) headMap.set(f, b);
  }
  return { author, branch, base: baseMap, head: headMap, changed, readUnchanged: (f) => show2(mb, f) };
}
async function checkPr(p, pr, prefix) {
  return checkContribution(pr.base, pr.head, pr.changed, {
    author: pr.author.startsWith("gh:") ? pr.author : `gh:${pr.author}`,
    branch: pr.branch,
    prefix,
    md: p.md,
    readUnchanged: pr.readUnchanged,
    units: async (file) => {
      if (file !== PROJECT_FILE && !p.sources().includes(file)) return null;
      return (await p.units(file)).units;
    }
  });
}
function formatChecks(res) {
  return res.map((r) => {
    const icon = !r.ok ? "\u2716" : r.attention?.length ? "!" : "\u2714";
    return `${icon} ${r.check}. ${r.name}${[...r.messages, ...r.attention ?? []].map((m) => `
    ${m}`).join("")}`;
  }).join("\n");
}

// src/cli/sync.ts
import fs5 from "node:fs";
import path5 from "node:path";
async function syncDocs(p, langs, opts, log2) {
  const date = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  const by = opts.by ? opts.by.includes(":") ? opts.by : `gh:${opts.by}` : void 0;
  const out = [];
  for (const lang of langs) {
    for (const file of p.sources()) {
      const st = await p.state(lang, file);
      if (!st.tfile || !st.doc) continue;
      const res = { file, lang, recorded: [], changed: false };
      const structure = st.doc.issues.find((i) => i.kind === "structure");
      if (structure && !opts.reset) {
        res.error = structure.message;
        out.push(res);
        continue;
      }
      const tfile = structuredClone(st.tfile);
      for (const u of tfile.units) {
        if (!st.doc.untracked.has(u.id)) continue;
        u.origin = { by: by ?? "unknown", date };
        u.reviews = by ? [{ by, date }] : [];
        delete u.terms;
        res.recorded.push(u.id);
      }
      const before = p.storedPaths(lang, file).map((r) => readOr(p, r));
      await p.saveTFile(tfile, st.doc.raw, { reset: opts.reset });
      const after = p.storedPaths(lang, file).map((r) => readOr(p, r));
      res.changed = before.some((b, i) => b !== after[i]);
      if (res.changed || res.recorded.length) log2(`${lang} ${file}: ${res.recorded.length ? `recorded ${res.recorded.length} edited units` : "updated from the source"}`);
      out.push(res);
    }
  }
  return out;
}
function readOr(p, rel2) {
  const f = path5.join(p.root, rel2);
  return fs5.existsSync(f) ? fs5.readFileSync(f, "utf8") : "";
}

// src/cli/translate.ts
import fs6 from "node:fs";
import path6 from "node:path";
var WORK_VERSION = 1;
var RULES = [
  "Translate each item's `source` into the target language and write it to `text`. Leave `text` null to skip an item.",
  "Keep every placeholder \u27E6n\u27E7 exactly once, unchanged; they stand for code, math, links targets, citations, shortcodes and markup. Move them where the target grammar needs them.",
  "Keep Markdown emphasis and link brackets ([text]\u27E6n\u27E7) balanced. Translate the link text, never the target.",
  "Write each block as one line. Do not add headings, list markers, line breaks or new markup.",
  "Code items: `source` is a whole code cell (without its #| option lines). Return the whole cell in `text`, with comments and user-facing text (plot titles, axis labels, messages) translated. Keep every line of code that does not hold such text exactly as it is: identifiers, data values, column names, keys, file paths, URLs, format strings and interpolation ({x}, %s, $(y)) never change. Keep the line structure; do not add #| lines or code fences.",
  "Use the glossary: translate terms with their `target` form (or keep them when `keep` is true). Glossary items come first; translate them before the units that use them.",
  "For items with `previous`, the source changed: reuse the previous translation where the meaning is unchanged.",
  'Set `model` at the top of the file to who translated (e.g. "claude-code/<model id>").'
];
function oneLine(s, n = 300) {
  if (!s) return void 0;
  const t = s.replace(/\s+/g, " ").trim();
  return t.length > n ? t.slice(0, n - 1) + "\u2026" : t;
}
function workPath(p, lang) {
  return path6.join(p.i18nDir, "_work", `${lang}.json`);
}
async function exportWork(p, lang, mode) {
  const glossary = p.glossary();
  const lg = p.langGlossary(lang);
  const items = [];
  for (const e of glossary) {
    if (e.keep) continue;
    const cur = lg[e.key];
    if (cur && cur["source-hash"] === entryHash(e)) continue;
    items.push({ key: `glossary:${e.key}`, kind: "glossary", term: e.term, variants: null, definition: e.definition, note: null, text: null, ...cur ? { previous: { source: void 0, text: cur.term } } : {} });
  }
  for (const file of p.allFiles()) {
    const st = await p.state(lang, file);
    st.synced.forEach((u, i) => {
      if (u.status === "current") return;
      if (u.status === "stale" && mode === "missing") return;
      items.push(workItem(p, st, u, i));
    });
  }
  const wf = {
    version: WORK_VERSION,
    tool: "quarto-i18n",
    lang,
    "source-lang": p.tc.source,
    "language-names": { source: languageName(p.tc.source, "en"), target: languageName(lang, "en") },
    instructions: p.tc.instructions,
    rules: RULES,
    model: null,
    glossary: glossary.map((e) => ({ key: e.key, term: e.term, variants: e.variants?.length ? e.variants : void 0, definition: e.definition, keep: e.keep || void 0, target: lg[e.key]?.term, "target-variants": lg[e.key]?.variants })),
    items
  };
  const out = workPath(p, lang);
  fs6.mkdirSync(path6.dirname(out), { recursive: true });
  fs6.writeFileSync(out, JSON.stringify(wf, null, 2) + "\n");
  return { path: out, count: items.length };
}
function workItem(p, st, u, i) {
  const s = u.src;
  const glossary = p.glossary();
  const base = { key: `${st.file}#${u.id}`, kind: s.kind, file: st.file, id: u.id, hash: s.hash, text: null };
  const terms = hits(glossary, s.source).map((e) => e.key);
  if (terms.length) base.terms = terms;
  if (s.kind === "code") {
    const item2 = { ...base, cell: s.cell, lang: s.lang, source: s.source };
    if (u.status === "stale" && u.stored?.text) item2.previous = { source: u.stored.source, text: u.stored.text };
    return item2;
  }
  const { masked, tokens } = protect(s.source);
  const neighbour = (k) => {
    const n = st.synced[k]?.src;
    return n && n.kind === "block" ? oneLine(n.source) : void 0;
  };
  const item = {
    ...base,
    source: masked,
    tokens: tokens.length ? tokens : void 0,
    heading: s.heading ? true : void 0,
    field: s.field,
    cell: s.cell,
    context: s.kind === "block" ? { section: s.section, before: neighbour(i - 1), after: neighbour(i + 1) } : void 0
  };
  if (u.status === "stale" && u.stored?.text) item.previous = { source: u.stored.source, text: u.stored.text };
  return item;
}
function mergeAnswers(wf, answersFile) {
  const a = JSON.parse(fs6.readFileSync(answersFile, "utf8"));
  if (a.model) wf.model = a.model;
  let n = 0;
  for (const [key, v] of Object.entries(a.answers ?? {})) {
    const it = wf.items.find((x) => x.key === key);
    if (!it) throw new Error(`${answersFile}: unknown key ${key}`);
    if (it.kind === "glossary" && v && typeof v === "object") {
      it.text = String(v.text);
      it.variants = Array.isArray(v.variants) ? v.variants.map(String) : null;
      it.note = typeof v.note === "string" ? v.note : null;
    } else {
      it.text = String(v);
    }
    n++;
  }
  return n;
}
async function applyWork(p, file, log2, answersFile) {
  const wf = JSON.parse(fs6.readFileSync(file, "utf8"));
  if (wf.tool !== "quarto-i18n" || wf.version !== WORK_VERSION) throw new Error(`${file} is not a quarto-i18n work file (version ${WORK_VERSION})`);
  if (answersFile) log2(`merged ${mergeAnswers(wf, answersFile)} answers from ${path6.basename(answersFile)}`);
  const lang = wf.lang;
  if (!p.tc.targets.map(String).includes(lang)) throw new Error(`${lang} is not in ${CONFIG_KEY}.targets`);
  const date = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  const origin = { by: "llm", model: wf.model ?? "unknown", date };
  const res = { applied: 0, glossary: 0, skipped: [], rejected: [] };
  const glossary = p.glossary();
  const lg = p.langGlossary(lang);
  for (const it of wf.items.filter((x) => x.kind === "glossary")) {
    if (it.text === null || it.text === void 0) continue;
    const key = it.key.replace(/^glossary:/, "");
    const e = glossary.find((g) => g.key === key);
    if (!e) {
      res.skipped.push({ key: it.key, reason: "not in the source glossary" });
      continue;
    }
    const forms = [it.text, ...it.variants ?? [], it.note ?? ""];
    if (forms.some((f) => f && !isPlainText(f))) {
      res.rejected.push({ key: it.key, reason: "glossary entries must be plain text" });
      continue;
    }
    const entry = { "source-hash": entryHash(e), term: it.text.trim() };
    if (it.variants?.length) entry.variants = it.variants.map((v) => v.trim());
    if (it.note) entry.note = it.note.trim();
    entry.origin = origin;
    entry.reviews = [];
    lg[key] = entry;
    res.glossary++;
  }
  if (res.glossary) p.writeLangGlossary(lang, lg);
  const unitItems = wf.items.filter((x) => x.kind !== "glossary" && x.text !== null && x.text !== void 0);
  const byFile = /* @__PURE__ */ new Map();
  for (const it of unitItems) byFile.set(it.file, [...byFile.get(it.file) ?? [], it]);
  for (const [f, list] of byFile) {
    if (f !== PROJECT_FILE && !p.sources().includes(f)) {
      for (const it of list) res.skipped.push({ key: it.key, reason: "source file no longer exists" });
      continue;
    }
    const st = await p.state(lang, f);
    const cands = [];
    for (const it of list) {
      const u = st.synced.find((x) => x.id === it.id);
      if (!u || u.src.hash !== it.hash) {
        res.skipped.push({ key: it.key, reason: "source changed since export; export again" });
        continue;
      }
      if (u.src.kind === "code") {
        cands.push({ id: u.id, src: u.src, text: it.text, item: it, u });
      } else {
        const r = unprotect(it.text, it.tokens ?? []);
        if (!r.ok) {
          res.rejected.push({ key: it.key, reason: r.error });
          continue;
        }
        cands.push({ id: u.id, src: u.src, text: r.text, item: it, u });
      }
    }
    const rejected = await validate(cands, p.md);
    const tfile = toTFile(f, lang, st.synced);
    for (const c of cands) {
      const r = rejected.get(c.id);
      if (r) {
        res.rejected.push({ key: c.item.key, reason: r });
        continue;
      }
      const used = hits(glossary, c.src.source);
      const terms = Object.fromEntries(used.filter((e) => lg[e.key]).map((e) => [e.key, targetHash(lg[e.key])]));
      const k = tfile.units.findIndex((x) => x.id === c.id);
      tfile.units[k] = translatedUnit(c.u, c.src.kind === "code" ? normaliseCode(c.text) : c.text, origin, terms);
      res.applied++;
    }
    await p.saveTFile(tfile, st.doc?.raw);
  }
  log2(`${lang}: applied ${res.applied} units and ${res.glossary} glossary entries; ${res.rejected.length} rejected; ${res.skipped.length} skipped`);
  return res;
}

// src/cli/main.ts
var HELP = `quarto-i18n: managed translations for Quarto projects

Usage: i18n <command> [options]

Commands
  translate            Write a work file of missing and stale units for a translator
                       (provider "external")
    --only missing     only units never translated
    --apply <file>     validate a filled-in work file and write the translation files
    --answers <file>   with --apply: merge a compact answers file first
  status [--json]      Units, review counts, stale and missing per file and language
  check                Author requirements, validation, glossary use, workflow warnings
    --base <ref> --head <ref> --author <login> [--branch <name>]
                       check a contribution between two git refs
  build [files]        Build language versions now (renders the mirror projects)
  hook                 post-render entry point (runs build on full renders only)
  sync                 Record translations edited in the translated documents
                       (_i18n/<lang>/...) and rewrite them from the current source
    --by <login>       who made the edits (recorded as origin and review)
    --reset            also rewrite documents whose structure no longer matches

Options
  --lang fr,es         languages (default: verso-translate.targets; env VERSO_TRANSLATE_LANGUAGES)
  --project <dir>      project directory (default: nearest _quarto.yml)
`;
function parseArgs(argv) {
  const opts = {};
  const rest = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith("--")) {
      const [k, v] = a.slice(2).split("=", 2);
      if (v !== void 0) opts[k] = v;
      else if (argv[i + 1] !== void 0 && !argv[i + 1].startsWith("--") && !["json", "help", "reset"].includes(k)) opts[k] = argv[++i];
      else opts[k] = true;
    } else rest.push(a);
  }
  return { cmd: rest[0], args: rest.slice(1), opts };
}
var log = (prefix) => (m) => console.log(`[i18n${prefix ? " " + prefix : ""}] ${m}`);
async function main() {
  const { cmd, args, opts } = parseArgs(process.argv.slice(2));
  if (!cmd || opts.help || cmd === "help") {
    console.log(HELP);
    return 0;
  }
  const root = typeof opts.project === "string" ? path7.resolve(opts.project) : findProjectRoot();
  if (cmd === "hook" && !hasTranslateConfig(root)) return 0;
  const p = new Project(root);
  const lang = typeof opts.lang === "string" ? opts.lang : void 0;
  switch (cmd) {
    case "hook": {
      const mode = renderMode();
      const langs = p.languages(lang);
      if (!mode.full && !process.env.VERSO_TRANSLATE_LANGUAGES) {
        const outs = (process.env.QUARTO_PROJECT_OUTPUT_FILES ?? "").split("\n").filter(Boolean).map((f) => path7.relative(p.outputDir, path7.resolve(root, f)).split(path7.sep).join("/"));
        if (outs.length) postProcess(p, outs);
        log("")(`${mode.reason}: language builds skipped (full \`quarto render\` or \`i18n build\` builds them)`);
        return 0;
      }
      if (!langs.length) return 0;
      await buildAll(p, langs, log);
      log("")(`built ${langs.join(", ")}`);
      return 0;
    }
    case "build": {
      if (args.length) console.warn("[i18n] building selected files is not supported yet; building whole languages");
      const reports = await buildAll(p, p.languages(lang), log);
      for (const r of reports) {
        log(r.lang)(`translated ${Math.round(r.stats.translated * 100)}%, reviewed ${Math.round(r.stats.reviewed * 100)}%, ${r.stats.stale} stale, ${r.stats.missing} missing, ${r.reverted.length} reverted cells`);
      }
      return 0;
    }
    case "translate": {
      const provider = p.tc.backend?.provider ?? "external";
      if (typeof opts.apply === "string") {
        const r = await applyWork(p, path7.resolve(opts.apply), log(""), typeof opts.answers === "string" ? path7.resolve(opts.answers) : void 0);
        for (const x of r.rejected) console.log(`  rejected ${x.key}: ${x.reason}`);
        for (const x of r.skipped) console.log(`  skipped ${x.key}: ${x.reason}`);
        return r.rejected.length ? 1 : 0;
      }
      if (process.env.CI) {
        console.error("[i18n] translate never runs in CI");
        return 1;
      }
      if (provider !== "external") {
        console.error(`[i18n] provider "${provider}" is not implemented yet; use backend: {provider: external}`);
        return 1;
      }
      for (const l of p.languages(lang)) {
        const r = await exportWork(p, l, opts.only === "missing" ? "missing" : "stale");
        log(l)(r.count ? `${r.count} items to translate in ${path7.relative(process.cwd(), r.path)}` : "nothing to translate");
      }
      return 0;
    }
    case "status": {
      const rows = await status(p, p.languages(lang));
      console.log(opts.json ? JSON.stringify(rows, null, 2) : formatStatus(rows));
      return 0;
    }
    case "check": {
      if (typeof opts.base === "string") {
        const prefix = p.tc.review?.dir ? p.tc.review.dir.replace(/\/?$/, "/") : "";
        const pr = readGitPr(root, String(opts.base), String(opts.head ?? "HEAD"), String(opts.author ?? ""), typeof opts.branch === "string" ? opts.branch : void 0);
        if (!pr.author) throw new Error("--author is required");
        const res = await checkPr(p, pr, prefix);
        console.log(formatChecks(res));
        return res.every((r) => r.ok) ? 0 : 1;
      }
      const f = await checkProject(p, p.languages(lang));
      console.log(formatFindings(f));
      return f.some((x) => x.level === "error") ? 1 : 0;
    }
    case "sync": {
      const r = await syncDocs(p, p.languages(lang), { by: typeof opts.by === "string" ? opts.by : void 0, reset: !!opts.reset }, log(""));
      for (const x of r.filter((x2) => x2.error)) console.log(`  \u2716 ${x.lang} ${x.file}: ${x.error}`);
      if (!r.some((x) => x.changed || x.recorded.length || x.error)) log("")("nothing to sync");
      return r.some((x) => x.error) ? 1 : 0;
    }
    default:
      console.error(`unknown command ${cmd}

${HELP}`);
      return 2;
  }
}
main().then(
  (code) => process.exit(code),
  (e) => {
    console.error(`[i18n] error: ${e instanceof Error ? e.message : e}`);
    if (process.env.VERSO_TRANSLATE_DEBUG) console.error(e);
    process.exit(1);
  }
);
export {
  workPath
};
