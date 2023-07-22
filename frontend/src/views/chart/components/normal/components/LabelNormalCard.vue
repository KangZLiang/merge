<template>
  <div
    v-if="chart.data && chart.data.x && chart.data.x.length > 0 && chart.data.series && chart.data.series.length > 0 && chart.data.series[0].data && chart.data.series[0].data.length > 0"
    id="label-content"
    :style="backColor"
  >
      <span v-if="quotaShow" :style="label_class">
        <p :style="label_content_class">
          {{ result }}
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
</template>

<script>
import {transitionString} from "@/utils/kanban";

export default {
  name: "LabelNormalCard",
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
    backColor() {
      const customAttr = this.chart.customAttr ? JSON.parse(this.chart.customAttr) : `return `
      let color;
      if (customAttr.color.backColorType) {
        let str = transitionString(customAttr.color.backCustomColor)
        color = new Function('result', `return ${str}`)(this.result)
      } else {
        color = customAttr.color.backColor
      }
      return Object.assign(this.content_class, {backgroundColor: color})
    }
  },
}
</script>

<style scoped>

</style>
