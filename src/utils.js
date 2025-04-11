function class_of(obj) {
    if (obj == null) return "null"
    return obj.constructor.name
}