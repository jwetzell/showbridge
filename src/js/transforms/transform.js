class Transform {
  constructor(transformObj) {
    this.obj = transformObj;
  }

  get type() {
    return this.obj.type;
  }

  get params() {
    return this.obj.params;
  }

  get enabled() {
    return this.obj.enabled;
  }
}
module.exports = Transform;
