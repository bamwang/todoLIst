//Model Task

function Task(property) {
  //task情報
  this._property_ = {
    id: 0,
    title: "",
    description: "",
    createdTime: new Date()/1,
    modifiedTime: 0,
    deadline: 0,
    status: 0,
    priority: 0,
    tags: []
  };

  // init
  this.set(property);
}
//ステータスは定数で
Task.prototype.STATUS = {
  UNDERGO: 0,
  FINISHED: 1,
  DELETED: 2
};
//情報を一括で返す
Task.prototype.get = function get() {
  return this._property_;
};
//propertyに従って情報を代入
Task.prototype.set = function set(property) {
  for (var key in property) {
    if (this._property_[key] !== undefined) {
      this._property_[key] = property[key];
    }else
      throw new ReferenceError('Wrong property name');
  }
};
