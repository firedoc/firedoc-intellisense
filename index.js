
var Intellisense = function (ast) {
  var namespaces = {};
  var classesKeys = Object.keys(ast.classes);
  var modulesKeys = Object.keys(ast.modules);
  var ret = classesKeys.concat(modulesKeys);

  for (var name in ast.modules) {
    var mod = ast.modules[name];
    if (mod && mod.type === 'modules') {
      mod.classes = mod.classes || {};
      mod.members = mod.members || [];
      namespaces[mod.namespace] = mod;
    }
  }
  for (var name in ast.classes) {
    var clazz = ast.classes[name];
    if (clazz) {
      clazz.members = clazz.members || [];
      try {
        namespaces[clazz.namespace] = clazz;
        namespaces[clazz.module].classes[clazz.name] = clazz;
      } catch (e) {};
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
      if (parent) {
        console.log(parentNS, parent);
        parent.members.push(member);
      }
      if (member.itemtype === 'method') {
        if (member.module === ns) {
          ns = ns + '.' + member.module;
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
    (root.members || []).forEach(function (member) {
      next[member.name] = member;
    });
    return next;
  }
  console.log(namespaces);
  return ret;
};

module.exports = Intellisense;
