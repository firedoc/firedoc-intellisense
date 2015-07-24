
var Intellisense = function (ast) {
  var namespaces = {};
  var submodules = {};
  var classesKeys = Object.keys(ast.classes);
  var modulesKeys = Object.keys(ast.modules);
  var ret = classesKeys.concat(modulesKeys);

  for (var name in ast.modules) {
    var mod = ast.modules[name];
    if (mod && mod.type === 'modules') {
      mod.classes = mod.classes || {};
      mod.members = mod.members || [];
      mod.submodules = mod.submodules || {};
      namespaces[mod.namespace] = mod;
      if (mod.name.indexOf('.') !== -1) {
        submodules[mod.name] = mod;
      }
    }
  }
  for (var src in submodules) {
    var sp = src.lastIndexOf('.');
    var ns = src.slice(0, sp);
    var name = src.slice(sp + 1);
    var parent = namespaces[ns];
    if (parent) {
      parent.submodules[name] = submodules[src];
    }
  }
  for (var name in ast.classes) {
    var clazz = ast.classes[name];
    if (clazz) {
      clazz.members = clazz.members || [];
      namespaces[clazz.namespace] = clazz;
      namespaces[clazz.module].classes[clazz.name] = clazz;
    }
  }
  for (var idx in ast.members) {
    var member = ast.members[idx];
    if (member) {
      var ns = member.namespace;
      var parentNS = [member.module, member.clazz].filter(
        function (item) { return item; }
      ).join('.');
      var parent = namespaces[parentNS];
      if (parent && parent.members) {
        parent.members.push(member);
      }
      if (member.itemtype === 'method') {
        if (member.module === ns) {
          ns = ns + '.__constructor__';
        }
        namespaces[ns] = member;
      } else {
        namespaces[ns] = member;
      }
    }
  }
  ret.get = function (name) {
    var ret = namespaces[name];
    if (ret) {
      var type = ast.classes[ret.type];
      if (type) {
        ret.next = getNext(type);
      } else {
        ret.next = getNext(ret);
      }
    }
    return ret;
  };
  function getNext (root) {
    var next = root.classes || {};
    for (var name in root.submodules || {}) {
      next[name] = root.submodules[name];
    }
    for (var idx in root.members || []) {
      var member = root.members[idx];
      next[member.name] = member;
    }
    return next;
  }
  console.log(namespaces);
  return ret;
};

module.exports = Intellisense;
