export  function siftTree(list,id) {
  let node;
  for (let i = 0, l = list.length; i < l; i++) {
    node = list[i];
    if (node.id === id) {
      return node
    }
    if (node.children && node.children.length > 0) {
      let n = siftTree(node.children, id);
      if (n) {
        return n;
      }
    }
  }
  return null;
}
export  function transitionString(item) {
  let str = ''
  if(item) {
    str = item.replace(/？/g,'?').replace(/：/g,':').replace(/\‘|’/g,"'")
  }
  return str
}
