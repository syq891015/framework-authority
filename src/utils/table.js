const tableUtil = {
  install: function (Vue) {
    /**
     * 计算Element-ui列的宽度
     * @param list 数据集合
     * @param property 列属性
     * @param label 列头
     * @returns {number} 最小宽度
     * @private
     */
    Vue.prototype.__columnWidth = function (list, property, label) {
      let isZh = false
      let isFirst = false
      const maxLenCol = list.reduce(function (pre, cur) {
        const preColContent = pre[property]
        const curColContent = cur[property]

        if (preColContent || curColContent) {
          // 判断是否是中文
          if (!isFirst) {
            isFirst = true
            const regEx = new RegExp(/[\u4e00-\u9fa5]/g)
            isZh = regEx.test(preColContent || curColContent)
          }
        }

        if (!preColContent) {
          return cur
        }
        if (!curColContent) {
          return preColContent
        }

        const preLen = preColContent.length
        const curLen = curColContent.length
        return preLen > curLen ? pre : cur
      })
      // 该列最多字的那行文本的长度
      const maxLen = (maxLenCol[property] + '').length
      const labelLen = label.length
      const len = maxLen > labelLen ? maxLen : labelLen
      // 每个字大小
      let fontSize = isZh ? 16 : 10
      // 字大小乘个数即长度 ,注意不要加px像素，这里minWidth只是一个比例值，不是真正的长度
      return len * fontSize + 40
    }
  }
}

export default tableUtil
