export function deepObjectCompare(obj1: unknown, obj2: unknown): boolean {
  if (obj1 === obj2) {
    return true;
  }
  if ((!obj1 && obj2) || (obj1 && !obj2)) {
    return false;
  }

  const obj1IsArray = Array.isArray(obj1);
  const obj2IsArray = Array.isArray(obj2);
  if ((!obj1IsArray && obj2IsArray) || (obj1IsArray && !obj2IsArray)) {
    return false;
  }

  if (obj1IsArray && obj2IsArray) {
    if (obj1.length !== obj2.length) {
      return false;
    }
    for (let i = 0; i < obj1.length; i++) {
      if (!deepObjectCompare(obj1[i], obj2[i])) {
        return false;
      }
    }
    return true;
  }

  if (obj1 instanceof Object && obj2 instanceof Object) {
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
    if (keys1.length !== keys2.length) {
      return false;
    }
    return deepObjectCompare(keys1, keys2);
  }
  throw new Error('unknown compare');
}
