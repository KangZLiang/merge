import {hexColorToRGBA} from '../util.js'
import {componentStyle, seniorCfg} from '../common/common'
import {BASE_ECHARTS_SELECT, DEFAULT_TOOLTIP} from '@/views/chart/chart/chart'

function sift(customAttr, chart) {
  let isEidt = customAttr.color.isEidt
  let count = chart.data.series.length
  let colorList = [];
  customAttr.color.cloneColors && customAttr.color.cloneColors.forEach(item => {
      if (!isEidt) {
        if (item.isAdd && item.children.length > 0) {
          let arr = []
          item.children.forEach(val => {
            arr.push(val.color)
          })
          colorList.push({id: item.id, colors: arr})
        } else {
          colorList.push(item.color)
        }
      } else {
        if ((item.min == 0 || item.min) && item.max) {
          colorList.push({min: item.min, max: item.max ,color: item.color})
        }
      }
  })
return colorList
}

function range(list,data) {

  let color = []
  for(let i =0;i<list.length;i++) {
    let j = list[i]
    let a = false
    for(var n = 0; n < data.length; n++) {
      let h = data[n]
      if(j.value>= h.min && j.value<=h.max) {
        a=true
        color.push(h.color)
        break
      }
    }
    if(!a){
      color.push('#339933')
    }
  }
  return color
}

export function baseBarOption(chart_option, chart, activeParam) {
  // 处理shape attr
  let customAttr = {}
  if (chart.customAttr) {
    customAttr = JSON.parse(chart.customAttr)

    if (customAttr.color) {
      chart_option.color = customAttr.color.colors
    }
    // tooltip
    if (customAttr.tooltip) {
      const tooltip = JSON.parse(JSON.stringify(customAttr.tooltip))
      const reg = new RegExp('\n', 'g')
      tooltip.formatter = tooltip.formatter.replace(reg, '<br/>')
      chart_option.tooltip = tooltip
      const bgColor = tooltip.backgroundColor ? tooltip.backgroundColor : DEFAULT_TOOLTIP.backgroundColor
      chart_option.tooltip.backgroundColor = bgColor
      chart_option.tooltip.borderColor = bgColor
    }
  }
  // 处理data
  if (chart.data) {
    chart_option.title.text = chart.title
    chart_option.xAxis.data = chart.data.x
    let isGradient = customAttr.color.isGradient
    let multicolour = customAttr.color.multicolour
    let colorList = sift(customAttr, chart)
    let isEidt = customAttr.color.isEidt
    let Color = multicolour ? colorList : customAttr.color.colors
    for (let i = 0; i < chart.data.series.length; i++) {
      const y = chart.data.series[i]
      let colorList = []
     if(isEidt) {
       colorList = range(y.data,Color)
     }
      const series = customAttr.color.seriesColors[i]
      // color
      y.itemStyle = {
        color: (item) => {
          if (series && series.isSenior) {
            let color = new Function("item", `return ${series.seniorValue}`)(item)
            return color
          } else {
            let colour =isEidt? colorList : typeof Color[i % Color.length] == 'object' ? Color[i % Color.length].colors : [Color[i]]
            if (isGradient) {
              return hexColorToRGBA(colour[item.dataIndex % colour.length], customAttr.color.alpha)
            } else {
              return hexColorToRGBA(colour[i % colour.length], customAttr.color.alpha)
            }
          }
        }
      }
      // size
      if (customAttr.size) {
        if (customAttr.size.barDefault) {
          y.barWidth = null
          y.barGap = null
        } else {
          y.barWidth = customAttr.size.barWidth
          y.barGap = customAttr.size.barGap
        }
      }
      // label
      if (customAttr.label) {
        y.label = customAttr.label
      }
      y.type = 'bar'
      y.selectedMode = true
      y.select = BASE_ECHARTS_SELECT
      chart_option.legend.data.push(y.name)
      chart_option.series.push(y)
    }
  }
  componentStyle(chart_option, chart)
  seniorCfg(chart_option, chart)
  return chart_option
}

export function stackBarOption(chart_option, chart) {
  baseBarOption(chart_option, chart)

  // ext
  chart_option.series.forEach(function (s) {
    s.stack = 'stack'
    s.emphasis = {
      focus: 'series'
    }
  })
  return chart_option
}

export function horizontalBarOption(chart_option, chart) {
  // 处理shape attr
  let customAttr = {}
  if (chart.customAttr) {
    customAttr = JSON.parse(chart.customAttr)
    if (customAttr.color) {
      chart_option.color = customAttr.color.colors
    }
    if (customAttr.tooltip) {
      const tooltip = JSON.parse(JSON.stringify(customAttr.tooltip))
      const reg = new RegExp('\n', 'g')
      tooltip.formatter = tooltip.formatter.replace(reg, '<br/>')
      chart_option.tooltip = tooltip

      const bgColor = tooltip.backgroundColor ? tooltip.backgroundColor : DEFAULT_TOOLTIP.backgroundColor
      chart_option.tooltip.backgroundColor = bgColor
      chart_option.tooltip.borderColor = bgColor
    }
  }
  // 处理data
  if (chart.data) {
    chart_option.title.text = chart.title
    chart_option.yAxis.data = chart.data.x
    let isGradient = customAttr.color.isGradient
    let multicolour = customAttr.color.multicolour
    let colorList = sift(customAttr, chart)
    let isEidt = customAttr.color.isEidt
    let Color = multicolour ? colorList : customAttr.color.colors
    for (let i = 0; i < chart.data.series.length; i++) {
      const y = chart.data.series[i]
      let colorList = []
      if(isEidt) {
        colorList = range(y.data,Color)
      }
      // color
      let colour = isEidt ?colorList: typeof Color[i % Color.length] == 'object' ? Color[i % Color.length].colors : [Color[i]]
      if (isGradient) {
        y.itemStyle = {
          color: (item) => {
            return hexColorToRGBA(colour[item.dataIndex % colour.length], customAttr.color.alpha)
          }
        }
      } else {
        y.itemStyle = {
          color: hexColorToRGBA(colour[i % colour.length], customAttr.color.alpha)
        }
      }

      // size
      if (customAttr.size) {
        if (customAttr.size.barDefault) {
          y.barWidth = null
          y.barGap = null
        } else {
          y.barWidth = customAttr.size.barWidth
          y.barGap = customAttr.size.barGap
        }
      }
      // label
      if (customAttr.label) {
        y.label = customAttr.label
      }
      y.type = 'bar'
      y.selectedMode = true
      y.select = BASE_ECHARTS_SELECT
      chart_option.legend.data.push(y.name)
      chart_option.series.push(y)
    }
  }
  componentStyle(chart_option, chart)
  seniorCfg(chart_option, chart)
  return chart_option
}

export function horizontalStackBarOption(chart_option, chart) {
  horizontalBarOption(chart_option, chart)

  // ext
  chart_option.series.forEach(function (s) {
    s.stack = 'stack'
    s.emphasis = {
      focus: 'series'
    }
  })
  return chart_option
}
