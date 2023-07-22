<template>
  <div>
    <el-row class="chart-box">
          <span>
            <span>
              <el-select
                v-model="view.render"
                class="render-select"
                style="width: 100px"
                size="mini"
              >
                <el-option
                  v-for="item in pluginRenderOptions"
                  :key="item.value"
                  :value="item.value"
                  :label="item.name"
                />
              </el-select>
            </span>
          </span>
      <el-row>
        <div>
          <el-radio-group
            v-model="view.type"
            style="width: 100%"
          >
            <chart-pick
              ref="cu-chart-type"
              :chart="view"
              @clickData="clickData"
            />
          </el-radio-group>
        </div>
      </el-row>
    </el-row>

    <table-selector
      :expand="true"
      v-show="false"
      @getTable="getTable"
    />

  </div>
</template>

<script>
import {pluginTypes} from "@/api/chart/chart";
import ChartPick from "@/views/panel/echarts-setting/chart-pick";
import TableSelector from "@/views/chart/view/TableSelector";
import bus from "@/utils/bus";

export default {
  name: "echarts-setting",
  components: {TableSelector, ChartPick},
  data() {
    return {
      pluginRenderOptions: [],
      renderOptions: [
        {name: 'AntV', value: 'antv'},
        {name: 'ECharts', value: 'echarts'}
      ],
      view: {
        render: 'echarts',
        type: 'table-normal'
      },
      table: {}
    }
  },
  created() {
    const plugins = localStorage.getItem('plugin-views') && JSON.parse(localStorage.getItem('plugin-views'))
    if (plugins) {
      this.loadPluginType()
    } else {
      pluginTypes().then(res => {
        const plugins = res.data
        localStorage.setItem('plugin-views', JSON.stringify(plugins))
        this.loadPluginType()
      }).catch(e => {
        localStorage.setItem('plugin-views', null)
        this.loadPluginType()
      })
    }
  },
  methods: {
    clickData(table) {
      this.table = table
      bus.$emit('ganter',this.table)
    },
    loadPluginType() {
      const plugins = localStorage.getItem('plugin-views') && JSON.parse(localStorage.getItem('plugin-views')) || []
      const pluginOptions = plugins.filter(plugin => !this.renderOptions.some(option => option.value === plugin.render)).map(plugin => {
        return {name: plugin.render, value: plugin.render}
      })
      this.pluginRenderOptions = [...this.renderOptions, ...pluginOptions]
    },
    getTable(table) {
      this.clickData(table)
    }
  }
}
</script>

<style scoped>

</style>
