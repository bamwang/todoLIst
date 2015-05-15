//Model Manager.prototype

function Manager() {
  this._id_ = 0; //test 用
  this._list_ = {};
  this._order_ = [];
  this._count_ = 0;

  //init
  this.load();
}
Manager.prototype.KEYS = Object.keys((new Task()).get());
Manager.prototype.STATUS = Task.prototype.STATUS;
Manager.prototype.save = function save() {
  var self = this;
  var taskProperties = Object.keys(this._list_).map(function(key, index) {
    return self._list_[key].get();
  });
  var storage = {
    taskProperties: taskProperties,
  };
  var jsonStr = JSON.stringify(storage);
  localStorage.setItem('todo_' + this._id_, jsonStr);
};
Manager.prototype.load = function load() {
  var jsonStr = localStorage.getItem('todo_' + this._id_);
  if (jsonStr !== null) {
    storage = JSON.parse(jsonStr);
    // console.log(storage);
    var taskProperties = storage.taskProperties;
    var self = this;
    taskProperties.map(function(v, i) {
      self.add(v);
    });
  }
};
Manager.prototype.add = function add(inputedProperty) {
  var property = inputedProperty || {};
  property.id = property.id || this._order_.length;
  var task = new Task(property);
  this._list_[property.id] = task;
  this._order_.push(property.id);
  this.save();
};
Manager.prototype.sort = function sort(key, order) {
  if (this.KEYS.indexOf(key) === -1)
    throw new ReferenceError('Wrong key');
  if (order !== 'ASC' && order !== 'DESC')
    throw new ReferenceError('Wrong order');
  var self = this;
  var newOrder = Object.keys(this._list_).sort(function(idA, idB) {
    var taskA = self._list_[idA];
    var taskB = self._list_[idB];
    return (order === 'ASC') ? taskA[key] - taskB[key] : -taskA[key] + taskB[key];
  });
  this._order_ = newOrder;
  return this._order_;
};
Manager.prototype.getSomeIncludeDeleted = function getSomeIncludeDeleted(key, order, conditions) {
  if (key && order) {
    this.sort(key, order);
  }
  var self = this;
  var itemList = [];
  for (var id in self._list_) {
    var property = self._list_[id].get();
    var unmatched = conditions.some(filter);
    if (!unmatched)
      itemList.push(property);
  }

  function filter(condition, index) {
    if (self.KEYS.indexOf(condition.key) === -1)
      throw new ReferenceError('Wrong key');
    var unmatched = false;
    if ((property[condition.key] === condition.value) !== condition.result) {
      unmatched = true;
    }
    return unmatched;
  }
  return itemList;
};
Manager.prototype.getSome = function getSome(key, order, conditions) {
  conditions.push({
    key: 'status',
    value: this.STATUS.DELETED,
    result: false
  });
  return this.getSomeIncludeDeleted(key, order, conditions);
};
Manager.prototype.getAll = function getAll(key, order) {
  return this.getSome(key, order, []);
};
Manager.prototype.get = function get(id) {
  if (this._list_[id] === undefined)
    throw new ReferenceError('Not found item');
  return this._list_[id].get();
};
Manager.prototype.update = function update(id, property) {
  if (this._list_[id] === undefined)
    throw new ReferenceError('Not found item');
  this._list_[id].set(property);
  this.save();
};
Manager.prototype.addTag = function addTag(id, tag) {
  var tags = this.get(id).tags;
  if (tags.indexOf(tag) === -1) {
    tags.push(tag);
    this.update(id, {tags : tags});
    return true;
  }
  return false;
};
Manager.prototype.removeTag = function removeTag(id, tag) {
  var tags = this.get(id).tags;
  if (tags.indexOf(tag) !== -1) {
    tags.splice(tags.indexOf(tag),1);
    // console.log(tags);
    this.update(id, {tags : tags});
    return true;
  }
  return false;
};
Manager.prototype.remove = function remove(id) {
  var temp = this.get(id);
  this.update(id, {
    status: this.STATUS.DELETED
  });
  this.save();
  return temp;
};
Manager.prototype.size = function size() {
  return this._count_;
};
