<template>
  <div class="title-tree">
    <h1>大标题</h1>
    <h2>中标题1</h2>
    <h3>小标题1</h3>
    <h3>小标题2</h3>
    <h3>小标题3</h3>
    <h4>迷你标题</h4>
    <h2>中标题2</h2>
    <h5>超迷你标题</h5>
    <h2>中标题3</h2>
  </div>
</template>

<script>
export default {
  name: 'TitleTree',
  mounted() {
    var titleCountArr = [0, 0, 0, 0, 0, 0]
    var list = []
    var colors = ['red', 'orange', 'gold', 'green', 'cyan', 'blue']
    var parentEles = []
    document.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach((ele, i) => {
      var eleTagName = ele.tagName
      var eleIndex = Number(eleTagName.substring(1))
      var parentEle // 父标题

      if (i !== 0) {
        // 上一个标题
        var prevEle = parentEles[parentEles.length - 1]
        var prevEleIndex = Number(prevEle.tagName.substring(1))

        // 上一个标题不比当前标题高级，则要往前推
        if (prevEleIndex >= eleIndex) {
          while (prevEleIndex >= eleIndex) {
            parentEles.pop()
            prevEle = parentEles[parentEles.length - 1]
            prevEleIndex = Number(prevEle.tagName.substring(1))
          }
        }
        parentEle = prevEle
      }

      var eleText = ele.textContent
      var obj = {
        ele,
        level: eleIndex,
        tagName: eleTagName,
        text: eleText,
        id: eleIndex + '-' + eleText
      }
      if (parentEle) {
        var parentEleIndex = Number(parentEle.tagName.substring(1))
        var parentEleText = parentEle.textContent
        obj.pid = parentEleIndex + '-' + parentEleText
      }
      parentEles.push(ele)
      list.push(obj)
      titleCountArr[obj.level - 1]++
      var str = ''
      // 有点问题，TODO...
      titleCountArr.forEach((item, index) => {
        if (obj.level > index) {
          if (str === '') {
            str += item
          } else {
            str += '-' + item
          }
        }
      })
      console.log(str)
      ele.textContent = str + ' ' + eleText
      ele.style.color = colors[eleIndex - 1]
      ele.style.fontWeight = 'bold'
    })

    console.log(list)
    console.log(titleCountArr)

    function listToTree(data, options) {
      options = options || {}
      var ID_KEY = options.idKey || 'id'
      var PARENT_KEY = options.parentKey || 'parent'
      var CHILDREN_KEY = options.childrenKey || 'children'

      var tree = []
      var childrenOf = {}
      var item, id, parentId

      for (var i = 0, length = data.length; i < length; i++) {
        item = data[i]
        id = item[ID_KEY]
        parentId = item[PARENT_KEY] || 0
        // every item may have children
        childrenOf[id] = childrenOf[id] || []
        // init its children
        item[CHILDREN_KEY] = childrenOf[id]
        if (parentId !== 0) {
          // init its parent's children object
          childrenOf[parentId] = childrenOf[parentId] || []
          // push it into its parent's children object
          childrenOf[parentId].push(item)
        } else {
          tree.push(item)
        }
      }

      return tree
    }

    var tree = listToTree(list, {
      parentKey: 'pid'
    })
    console.log(tree)
  }
}
</script>
