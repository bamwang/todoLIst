//Model Task

function Task(property) {
  this._property_ = {
    id: 0,
    title: "",
    description: "",
    createdTime: new Date(),
    modifiedTime: 0,
    deadline: 0,
    status: 0,
    priority: 0,
    tags: []
  };

  // init
  this.set(property);
}
Task.prototype.STATUS = {
  UNDERGO: 0,
  FINISHED: 1,
  DELETED: 2
};
Task.prototype.get = function get() {
  return this._property_;
};
Task.prototype.set = function set(property) {
  // to be changed at last
  for (var key in property) {
    if (this._property_[key] !== undefined) {
      this._property_[key] = property[key];
    }else
      throw new ReferenceError('Wrong property name');
  }
};
