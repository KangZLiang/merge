import {hexColorToRGBA} from '@/views/chart/chart/util'
import {componentStyle, seniorCfg} from '../common/common'
import {BASE_ECHARTS_SELECT, DEFAULT_TOOLTIP} from '@/views/chart/chart/chart'

export function baseLineOption(chart_option, chart) {
  // 处理shape attr
  // debugger
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
    let count = chart.data.series.length
    let multicolour = customAttr.color.multicolour
    let colorList = [];
    customAttr.color.cloneColors && customAttr.color.cloneColors.forEach(item => {
      if (count <= 1) {
        colorList.push(item.color)
      } else {
        if (item.isAdd  && item.children.length>0) {
          let arr = []
          item.children.forEach(val => {
            arr.push(val.color)
          })
          colorList.push({id: item.id, colors: arr})
        } else {
          colorList.push(item.color)
        }
      }
    })
    let Color = multicolour ? colorList : customAttr.color.colors
    for (let i = 0; i < chart.data.series.length; i++) {
      const y = chart.data.series[i]
      if (isGradient) {
        let colorStops = [];
        let colour = typeof Color[i % Color.length] == 'object' ? Color[i % Color.length].colors : Color
        if (colour.length != 1) {
          if (count == 1) {
            let differ = 1 / colour.length
            let differValue = parseFloat(differ.toFixed(3))
            for (let j = 0; j < colour.length; j++) {
              colorStops.push({
                offset: j * differValue, color: hexColorToRGBA(colour[j % colour.length], customAttr.color.alpha)
              })
            }
          } else {
            colorStops = [{
              offset: 0, color: hexColorToRGBA(colour[i % colour.length], customAttr.color.alpha) // 0% 处的颜色
            },
              {
                offset: 1, color: hexColorToRGBA(colour[i % colour.length], 0) // 100% 处的颜色
              }]
          }

        } else {
          colorStops = [{
            offset: 0, color: hexColorToRGBA(colour[i % colour.length], customAttr.color.alpha) // 0% 处的颜色
          },
            {
              offset: 1, color: hexColorToRGBA(colour[i % colour.length], 0) // 100% 处的颜色
            }]
        }
        y.itemStyle = {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 1,
            y2: 1,
            colorStops: colorStops,
            globalCoord: false // 缺省为 false
          }
        }
      } else {
        let colour = typeof Color[i % Color.length] == 'object' ? Color[i % Color.length].colors : Color
        y.itemStyle = {
          color: hexColorToRGBA(colour[i % colour.length], customAttr.color.alpha)
        }
      }

      // size
      if (customAttr.size) {
        y.symbol = customAttr.size.lineSymbol
        y.symbolSize = customAttr.size.lineSymbolSize
        y.lineStyle = {
          width: customAttr.size.lineWidth,
          type: customAttr.size.lineType
        }
        y.smooth = customAttr.size.lineSmooth
        if (customAttr.size.lineArea) {
          y.areaStyle = {
            opacity: 0.6
          }
        } else {
          delete y.areaStyle
        }
      }
      y.selectedMode = true
      y.select = BASE_ECHARTS_SELECT
      // label
      if (customAttr.label) {
        y.label = customAttr.label
      }
      y.type = 'line'
      chart_option.legend.data.push(y.name)
      chart_option.series.push(y)
    }
  }
  componentStyle(chart_option, chart)
  seniorCfg(chart_option, chart)
  return chart_option
}

export function stackLineOption(chart_option, chart) {
  baseLineOption(chart_option, chart)

  // ext
  // chart_option.tooltip.trigger = 'axis'
  chart_option.series.forEach(function (s) {
    s.stack = 'stack'
  })
  return chart_option
}

