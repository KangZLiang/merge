<template>
  <div style="height: 100%;padding-right: 10px;position: relative">
    <div class="batteryOne" :style="{'--bgColor': borderWidthColor,}">
      <div class="battery" :style="{borderColor:borderWidthColor,  borderRadius: borderWidthRaidus}">
        <div class="Mask" :style="{width: backgroundWidth, backgroundColor: backgroundWidthColr, borderRadius: borderWidthRaidus2}"></div>
        <div
          v-if="chart.data && chart.data.x && chart.data.x.length > 0 && chart.data.series && chart.data.series.length > 0 && chart.data.series[0].data && chart.data.series[0].data.length > 0"
          id="label-content"
          :style="content_class"
          style="position: relative;z-index: 2"
        >
        <span v-if="quotaShow" :style="label_class">
        <p :style="label_content_class">
          {{ backgroundWidth }}
        </p>
      </span>
          <span
            v-if="dimensionShow"
            :style="label_space"
          >
        <p :style="label_class">
          {{ chart.data.series[0].name }}
        </p>
      </span>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import {transitionString} from "@/utils/kanban";

export default {
  name: "LabelNormalBattery",
  props: {
    chart: {
      type: Object,
      required: true
    },
    result: {
      type: Object,
      required: true
    },
    quotaShow: {
      type: Object,
      required: true
    },
    dimensionShow: {
      type: Object,
      required: true
    },
    content_class: {
      type: Object,
      required: true
    },
    label_class: {
      type: Object,
      required: true
    },
    label_content_class: {
      type: Object,
      required: true
    },
    label_space: {
      type: Object,
      required: true
    },
  },
  computed: {
    backgroundWidth() {
      return this.result + '%'
    },
    borderWidthColor() {
      const customAttr = this.chart.customAttr ? JSON.parse(this.chart.customAttr) : `return `
      return customAttr.color.MaxMinColor ? customAttr.color.MaxMinColor : '#8a8a8a'
    },
    backgroundWidthColr() {
      const customAttr = this.chart.customAttr ? JSON.parse(this.chart.customAttr) : `return `
      let color;
      if (!customAttr.color.backColor && !customAttr.color.backColorType) {
        color = this.result >= 30 ? this.result <= 80 ? 'yellow' : 'green' : 'red'
        return color
      }
      if (customAttr.color.backColorType) {
        let str = transitionString(customAttr.color.backCustomColor)
        color = new Function('result', `return ${str}`)(this.result)
      } else {
        color = customAttr.color.backColor
      }
      return color
    },
    borderWidthRaidus() {
      const customAttr = JSON.parse(this.chart.customAttr)
      let res = customAttr.color
      let value = res.BorderRadius
      let unit = ''
      if (res) {
        if (res.BorderRadiusType) {
          unit = '%'
        } else {
          unit = 'px'
        }
      }
      return (value + unit)
    },
    borderWidthRaidus2() {
      const customAttr = JSON.parse(this.chart.customAttr)
      let res = customAttr.color
      let value = res.BorderRadius - 2 >0? res.BorderRadius : 0
      let unit = ''
      if (res) {
        if (res.BorderRadiusType) {
          unit = '%'
        } else {
          unit = 'px'
        }
      }
      return (value + unit)
    }
  },


}
</script>

<style lang="scss" scoped>
.batteryOne{
  width: 104%;
  height: 100%;
  display: flex;
  align-items: center;
  &::after {
    content: '';
    display: block;
    width: 4%;
    height: 45%;
    background-color: var(--bgColor);
    z-index: 0;
  }
}
.battery {
  border-width: 6px;
  border-style: solid;
  border-radius: 20px;
  box-sizing: border-box;
  height: 100%;
  width: 100%;
  position: relative;
  overflow: hidden;

  .Mask {
    position: absolute;
    top: 0;
    left: 0;
    padding: 10px;
    z-index: 0;
    height: 100%;
    border-radius: 15px;
  }
}
</style>
