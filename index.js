
/**
 * @method appendModules
 */
function appendModules (list) {
  for (var name in this.ast.modules) {
    var mod = this.ast.modules[name];
    if (!mod || mod.type !== 'modules') { 
      break;
    }
    mod.members = mod.members || [];
    mod.classes = mod.classes || {};
    mod.submodules = mod.submodules || {};
    if (mod.namespace) {
      this.namespaces[mod.namespace] = mod;
    }
    if (mod.name.indexOf('.') !== -1) {
      this.submodules[mod.name] = mod;
    }
    for (var subClassName in mod.classes) {
      if (this.ast.classes[subClassName] === null)
        this.ast.classes[subClassName] = mod.classes[subClassName];
    }
    list.push({
      'text': name,
      'type': 'module',
      'description': mod.description
    });
  }
  return list;
}

/**
 * @method appendSubmodules
 */
function appendSubmodules (list) {
  for (var src in this.submodules) {
    var sp = src.lastIndexOf('.');
    var ns = src.slice(0, sp);
    var name = src.slice(sp + 1);
    var parent = this.namespaces[ns];
    if (parent) {
      parent.submodules[name] = this.submodules[src];
    }
  }
  return list;
}

/**
 * @method appendClasses
 */
function appendClasses (list) {
  for (var name in this.ast.classes) {
    var clazz = this.ast.classes[name];
    if (clazz) {
      clazz.members = clazz.members || [];
      this.namespaces[clazz.namespace] = clazz;
      this.namespaces[clazz.module].classes[clazz.name] = clazz;
    }
    list.push({
      'text': name,
      'type': 'class',
      'description': clazz.description
    });
  }
  return list;
}

/**
 * @method appendMembers
 */
function appendMembers (list) {
  for (var idx in this.ast.members) {
    var member = this.ast.members[idx];
    if (member) {
      var ns = member.namespace;
      var parentNS = [member.module, member.clazz].filter(
        function (item) { return item; }
      ).join('.');
      var parent = this.namespaces[parentNS];
      if (parent && parent.members) {
        parent.members.push(member);
      }
      if (member.itemtype === 'method') {
        if (member.module === ns) {
          ns = ns + '.__constructor__';
        }
        this.namespaces[ns] = member;
      } else {
        this.namespaces[ns] = member;
      }
    }
  }
  return list;
}

/**
 * @method getNext
 */
function getNext (root) {
  var next = {};
  var name;
  for (name in root.classes || {}) {
    var clazz = root.classes[name];
    next[name] = {
      'text': name,
      'type': 'class',
      'description': clazz.description
    };
  }
  for (name in root.submodules || {}) {
    var mod = root.submodules[name];
    next[name] = {
      'text': name,
      'type': 'module',
      'description': mod.description
    };
  }
  for (var idx in root.members || []) {
    var member = root.members[idx];
    next[member.name] = {
      'text': member.name,
      'type': member.itemtype || 'member',
      'description': member.description
    };
  }
  return next;
}

/**
 * @method ListPrototypeGet
 */
function ListPrototypeGet (name) {
  if (/\[\]$/.test(name)) {
    return { 'next': [] };
  }
  var ret = this.namespaces[name] || 
    this.ast.classes[name];
  if (ret) {
    var type = this.ast.classes[ret.type];
    if (type) {
      ret.next = getNext(type);
    } else {
      ret.next = getNext(ret);
    }
  }
  return ret;
};

/**
 * @method Intellisense
 * @export
 */
function Intellisense (ast) {
  var list = [];
  var ctx = {
    ast: ast,
    namespaces: {},
    submodules: {}
  };
  list = appendModules.call(ctx, list);
  list = appendSubmodules.call(ctx, list);
  list = appendClasses.call(ctx, list);
  list = appendMembers.call(ctx, list);
  list.get = ListPrototypeGet.bind(ctx);
  // console.log(ctx.namespaces);
  return list;
}

module.exports = Intellisense;
