function Test(){
  var name = "";

  return this;
}


Test.prototype.getName = function getName(){
  return this.name;
};
