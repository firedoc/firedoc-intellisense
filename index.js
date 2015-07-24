
var Intellisense = function (ast) {
  var nsMap = ast.namespacesMap;
  var classesKeys = Object.keys(ast.classes);
  var modulesKeys = Object.keys(ast.modules);
  var ret = classesKeys.concat(modulesKeys);
  ast.members.forEach(function (member) {
    var parent = member.parent || ast.modules[member.module];
    if (!parent.members || parent.members.length === 0) {
      parent.members = {};
    }
    if (member.itemtype === 'method') {
      parent.members[member.name] = function () {};
    } else if (member.itemtype === 'property') {
      try {
        var type = member.type.replace(/[\{\}]/g, '').split('.').pop();
        var isArray = /\[\]$/.test(type);
        if (isArray) {
          parent.members[member.name] = [];
        } else {
          parent.members[member.name] = type;
        }
      } catch (e) {}
    }
  });
  ret.get = function (name) {
    return ast.classes[name] || ast.modules[name];
  };
  ret.getByNs = function (name) {
    return nsMap[name];
  }
  return ret;
};

module.exports = Intellisense;
