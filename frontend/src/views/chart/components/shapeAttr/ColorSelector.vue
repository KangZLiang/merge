<template>
  <div style="width: 100%">
    <el-col>
      <el-form
        ref="colorForm"
        :model="colorForm"
        label-width="80px"
        size="mini"
      >
        <div>
          <el-form-item
            v-show="showProperty('value') && showProperty('gradient-color')"
            :label="$t('chart.color_case')"
            class="form-item"
          >
            <gradient-color-selector
              :color-dto="colorForm"
              @color-change="gradientColorChange"
            />
          </el-form-item>
          <el-form-item
            v-show="showProperty('value') && !showProperty('gradient-color')"
            :label="$t('chart.color_case')"
            class="form-item"
            id="color_case"
          >
            <el-popover
              placement="bottom"
              :width="colorForm.multicolour? '600' : '400'"
              trigger="click"
            >
              <div v-if="!colorForm.multicolour">
                <div style="padding: 6px 10px;">
                  <div>
                    <span class="color-label">{{ $t('chart.system_case') }}</span>
                    <el-select
                      v-model="colorForm.value"
                      :placeholder="$t('chart.pls_slc_color_case')"
                      size="mini"
                      @change="changeColorOption('value')"
                    >
                      <el-option
                        v-for="option in colorCases"
                        :key="option.value"
                        :label="option.name"
                        :value="option.value"
                        style="display: flex;align-items: center;"
                      >
                        <div style="float: left">
                        <span
                          v-for="(c,index) in option.colors"
                          :key="index"
                          :style="{width: '20px',height: '20px',float: 'left',backgroundColor: c}"
                        />
                        </div>
                        <span style="margin-left: 4px;">{{ option.name }}</span>
                      </el-option>
                    </el-select>
                    <el-button
                      size="mini"
                      type="text"
                      style="margin-left: 2px;"
                      @click="resetCustomColor"
                    >{{ $t('commons.reset') }}
                    </el-button>
                  </div>
                  <!--自定义配色方案-->
                  <div
                    v-show="showProperty('custom')"
                  >
                    <div style="display: flex;align-items: center;margin-top: 10px;">
                      <span class="color-label">{{ $t('chart.custom_case') }}</span>
                      <span>
                      <el-radio-group
                        v-model="customColor"
                        class="color-type"
                      >
                        <el-radio
                          v-for="(c,index) in colorForm.colors"
                          :key="index"
                          :label="c"
                          style="padding: 2px;"
                          @change="switchColor(index)"
                        >
                          <span :style="{width: '20px',height: '20px',display:'inline-block',backgroundColor: c}"/>
                        </el-radio>
                      </el-radio-group>
                    </span>
                    </div>
                    <div style="display: flex;align-items: center;margin-top: 10px;">
                      <span class="color-label"/>
                      <span>
                      <el-color-picker
                        v-model="customColor"
                        class="color-picker-style"
                        :predefine="predefineColors"
                        @change="switchColorCase"
                      />
                    </span>
                    </div>
                  </div>
                  <!--自定义系列或维度枚举值颜色-->
                  <div
                    v-show="showProperty('colorPanel')"
                    style="display: flex;align-items: center;margin-top: 10px;"
                  >
                    <span class="color-label"/>
                    <span>
                    <span
                      v-for="(c,index) in colorForm.colors"
                      :key="index"
                      style="padding: 2px;"
                    >
                      <span :style="{width: '20px',height: '20px',display:'inline-block',backgroundColor: c}"/>
                    </span>
                  </span>
                  </div>
                </div>

                <div
                  v-if="!batchOptStatus"
                  v-show="showProperty('custom')"
                  class="custom-color-style">
                  <div
                    v-for="(item,index) in colorForm.seriesColors"
                    :key="index"
                    style="display: flex;align-items: center;"
                  >
                    <div style="width: 100%">
                      <div style="display: flex;align-items: center;justify-content: space-between">
                        <span :title="item.name">{{ item.name }}</span>
                        <el-color-picker
                          v-model="item.color"
                          class="color-picker-style"
                          :predefine="predefineColors"
                          @change="switchCustomColor(index)"
                        />
                        <el-checkbox
                          v-if="chart.render && chart.render === 'echarts' && chart.type == 'bar'"
                          v-model="item.isSenior" @change="switchColorCase">
                          高级
                        </el-checkbox>
                      </div>
                      <div v-show="item.isSenior">
                        <el-tooltip class="item" effect="dark" placement="bottom">
                          <div slot="content">
                            支持三元运算
                            <br>
                            示例：item.value > 50 ? "#ff0000" : "#ffff00"
                          </div>
                          <i class="el-icon-info" style="cursor: pointer;"/>
                        </el-tooltip>
                        <div>
                          <el-input type="textarea" v-model="item.seniorValue" @change="switchColorCase"></el-input>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  v-if="!batchOptStatus"
                  v-show="showProperty('customColor')"
                  class="custom-color-style"
                >
                  <div
                    v-for="(item,index) in colorForm.seriesColors"
                    :key="index"
                    style="display: flex;align-items: center;margin: 2px 0;"
                  >
                    <el-color-picker
                      v-model="item.color"
                      class="color-picker-style"
                      :predefine="predefineColors"
                      @change="switchCustomColor(index)"
                    />
                    <span
                      class="span-label"
                      :title="item.name"
                    >{{ item.name }}</span>
                  </div>
                </div>
              </div>
              <div v-else>
                <el-table
                  :data="tableData"
                  style="width: 100%"
                  max-height="250"
                  size="mini"
                  row-key="id"
                  border
                  default-expand-all
                  :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
                >
                  <el-table-column align="center" label="自定义单条渐变色">
                    <el-table-column
                      align="center"
                      label="线/段"
                      width="80"
                    >
                      <template slot-scope="scope">
                       <span>
                         {{ scope.row.id }}
                       </span>
                      </template>
                    </el-table-column>
                    <el-table-column
                      prop="color"
                      label="颜色"
                      align="center"
                      width="80">
                      <template slot-scope="scope">
                        <el-color-picker
                          v-model="scope.row.color"
                          class="color-picker-style"
                          :predefine="predefineColors"
                          @change="changeCloneColorOption()"
                        />
                      </template>
                    </el-table-column>
                    <el-table-column
                      label="操作"
                      align="center"
                      width="120">
                      <template slot-scope="scope">
                        <el-button
                          @click.native.prevent="deleteRow(scope.$index, tableData,scope.row)"
                          type="text"
                          size="small">
                          移除
                        </el-button>
                        <el-tooltip v-show="(scope.row.isAdd == false ||scope.row.isAdd == true) && !colorForm.isEidt"
                                    effect="dark"
                                    style="margin-left: 16px;"
                                    placement="top-start">
                          <div slot="content">单线多少模式</div>
                          <el-switch v-model="scope.row.isAdd" @change="changeCloneColorOption()"></el-switch>
                        </el-tooltip>
                      </template>
                    </el-table-column>
                    <el-table-column
                      align="right">
                      <template slot="header" slot-scope="scope">
                        <el-tooltip effect="dark" style="margin-left: 16px;" placement="top-start">
                          <div slot="content">新增颜色<br/>单条线的多个色<br/>多条的独立色</div>
                          <el-button @click="tableDataAdd(tableData,scope)">
                            add
                          </el-button>
                        </el-tooltip>
                        <el-tooltip effect="dark" style="margin-left: 16px;" placement="top-start">
                          <div slot="content">是否使用区域是判断(注：效果需开启渐变色)</div>
                          <el-switch v-model="colorForm.isEidt" @change="switchState('isEidt')"></el-switch>
                        </el-tooltip>
                      </template>
                      <template slot-scope="scope">
                        <el-button
                          v-show="scope.row.isAdd"
                          @click.native.prevent="addRow(scope.$index,tableData)"
                          type="text"
                          size="small">
                          add
                        </el-button>
                        <div v-show="!scope.row.isAdd"
                             style="display: flex;justify-content: space-between;align-items: center">
                          <el-input v-model="scope.row.min" placeholder="请输入min值" @blur="blur(scope.row)"></el-input>
                          <div style="width: 50px">-----</div>
                          <el-input v-model="scope.row.max" placeholder="请输入max值" @blur="blur(scope.row)"></el-input>
                        </div>
                      </template>
                    </el-table-column>
                  </el-table-column>
                </el-table>
              </div>
              <div
                slot="reference"
                style="cursor: pointer;margin-top: 2px;width: 180px;"
              >
                <span
                  v-for="(c,index) in colorForm.colors"
                  :key="index"
                  :style="{width: '20px',height: '20px',display:'inline-block',backgroundColor: c}"
                />
              </div>
            </el-popover>
            <el-tooltip effect="dark" style="margin-left: 16px;" placement="top-start">
              <div slot="content">自定义渐变色<br/>左为关闭自定义<br/>右为开启自定义</div>
              <el-switch v-model="colorForm.multicolour" @change="switchState('multicolour')"></el-switch>
            </el-tooltip>
          </el-form-item>
          <el-form-item
            v-show="showProperty('gradient')"
            :label="$t('chart.gradient')"
            class="form-item"
          >
            <el-checkbox
              v-model="colorForm.gradient"
              @change="changeColorCase('gradient')"
            />
          </el-form-item>

          <el-form-item
            v-show="showProperty('quotaColor')"
            :label="$t('chart.quota_color')"
            class="form-item"
          >
            <div class="color-title">
              <el-color-picker
                v-model="colorForm.quotaColor"
                class="color-picker-style"
                :predefine="predefineColors"
                @change="changeColorCase('quotaColor')"
              />
              <el-switch v-model="colorForm.quotaColorType"
                         inactive-text="默认"
                         active-text="高级" @change="switchState('quotaColorType')"></el-switch>
            </div>
          </el-form-item>
          <div v-show="colorForm.quotaColorType">
            <el-tooltip class="item" effect="dark" placement="bottom">
              <div slot="content">
                支持三元运算，颜色采用十六进制
                <br>
                示例：result == 10 ? "#ff0000" : "#ffff00"
              </div>
              <i class="el-icon-info" style="cursor: pointer;"/>
            </el-tooltip>
            <el-input placeholder="输入三元表达式" type="textarea" v-model="colorForm.quotaCustomColor"
                      @change="changeColorCase('quotaCustomColor')"></el-input>
          </div>
          <el-form-item
            v-show="showProperty('dimensionColor')"
            :label="$t('chart.dimension_color')"
            class="form-item"
          >
            <div class="color-title">
              <el-color-picker
                :disabled="colorForm.dimensionColorType"
                v-model="colorForm.dimensionColor"
                class="color-picker-style"
                :predefine="predefineColors"
                @change="changeColorCase('dimensionColor')"
              />
              <el-switch v-if="chart.type === 'text'||chart.type === 'battery' " v-model="colorForm.dimensionColorType"
                         inactive-text="默认"
                         active-text="高级" @change="switchState('dimensionColorType')"></el-switch>
            </div>
          </el-form-item>
          <div v-show="colorForm.dimensionColorType">
            <el-tooltip class="item" effect="dark" placement="bottom">
              <div slot="content">
                支持三元运算，颜色采用十六进制
                <br>
                示例：result == 10 ? "#ff0000" : "#ffff00"
              </div>
              <i class="el-icon-info" style="cursor: pointer;"/>
            </el-tooltip>
            <el-input placeholder="输入三元表达式" type="textarea" v-model="colorForm.dimensionCustomColor"
                      @change="changeColorCase('dimensionCustomColor')"></el-input>
          </div>
          <el-form-item
            v-show="showProperty('backColor')"
            :label="$t('chart.background_color')"
            class="form-item"
          >
            <div class="color-title">
              <el-color-picker
                :disabled="colorForm.backColorType"
                v-model="colorForm.backColor"
                class="color-picker-style"
                :predefine="predefineColors"
                @change="changeColorCase('backColor')"
              />
              <el-switch v-if="chart.type === 'text'|| chart.type === 'battery' ||chart.type === 'label'"
                         v-model="colorForm.backColorType" inactive-text="默认"
                         active-text="高级" @change="switchState('backColorType')"></el-switch>
            </div>
          </el-form-item>
          <div v-show="colorForm.backColorType">
            <el-tooltip class="item" effect="dark" placement="bottom">
              <div slot="content">
                支持三元运算，颜色采用十六进制
                <br>
                示例：result == 10 ? "#ff0000" : "#ffff00"
              </div>
              <i class="el-icon-info" style="cursor: pointer;"/>
            </el-tooltip>
            <el-input placeholder="输入三元表达式" type="textarea" v-model="colorForm.backCustomColor"
                      @change="changeColorCase('backCustomColor')"></el-input>
          </div>
          <el-form-item
            v-show="showProperty('MaxMinColor')"
            :label="$t('chart.Maxmin')"
            class="form-item"
          >
            <div class="color-title">
              <el-color-picker
                v-model="colorForm.MaxMinColor"
                class="color-picker-style"
                :predefine="predefineColors"
                @change="changeColorCase('MaxMinColor')"
              />
            </div>
          </el-form-item>
          <el-form-item
            v-show="showProperty('BorderRadius')"
            :label="$t('chart.BorderRadius')"
            class="form-item"
          >
            <div class="color-title">
              <div style="width: 50%">
                <el-input-number size="mini" :min="1" v-model="colorForm.BorderRadius"
                                 @change="changeColorCase('BorderRadius')"></el-input-number>
              </div>
              <el-switch v-model="colorForm.BorderRadiusType" inactive-text="px"
                         active-text="百分比" @change="switchState('BorderRadiusType')"></el-switch>
            </div>

          </el-form-item>
        </div>
        <div>
          <el-form-item
            v-show="showProperty('tableHeaderBgColor')"
            :label="$t('chart.table_header_bg')"
            class="form-item"
          >
            <el-color-picker
              v-model="colorForm.tableHeaderBgColor"
              class="color-picker-style"
              :predefine="predefineColors"
              @change="changeColorCase('tableHeaderBgColor')"
            />
          </el-form-item>
          <el-form-item
            v-show="showProperty('tableItemBgColor')"
            :label="$t('chart.table_item_bg')"
            class="form-item"
          >
            <div class="color-title">
              <el-color-picker
                :disabled="colorForm.tableItemBgColorType && chart.render === 'echarts'"
                v-model="colorForm.tableItemBgColor"
                class="color-picker-style"
                :predefine="predefineColors"
                @change="changeColorCase('tableItemBgColor')"
              />
              <el-switch v-if="chart.render === 'echarts'" v-model="colorForm.tableItemBgColorType" inactive-text="默认"
                         active-text="高级" @change="switchState('tableItemBgColor')"></el-switch>
            </div>
            <div v-show="colorForm.tableItemBgColorType && chart.render === 'echarts'">
              <el-tooltip class="item" effect="dark" placement="bottom">
                <div slot="content">
                  支持三元运算
                  <br>
                  示例：item[index] == 'AA' ? "#ff0000" : "#ffff00"
                  <br>
                  其中：index为下标，0代表第一列，1代表第二列，以此类推
                </div>
                <i class="el-icon-info" style="cursor: pointer;"/>
              </el-tooltip>
              <el-input placeholder="输入三元表达式" type="textarea" v-model="colorForm.tableItemCustomBgColor"
                        @change="changeColorCase('tableItemBgColor')"></el-input>
            </div>
          </el-form-item>
          <el-form-item
            v-show="showProperty('tableHeaderFontColor')"
            :label="$t('chart.table_header_font_color')"
            class="form-item"
          >
            <el-color-picker
              v-model="colorForm.tableHeaderFontColor"
              class="color-picker-style"
              :predefine="predefineColors"
              @change="changeColorCase('tableHeaderFontColor')"
            />
          </el-form-item>
          <el-form-item
            v-show="showProperty('tableFontColor')"
            :label="$t('chart.table_item_font_color')"
            class="form-item"
          >
            <div class="color-title">
              <el-color-picker
                :disabled="colorForm.tableItemFontColorType && chart.render === 'echarts'"
                v-model="colorForm.tableFontColor"
                class="color-picker-style"
                :predefine="predefineColors"
                @change="changeColorCase('tableFontColor')"
              />
              <el-switch v-if="chart.render === 'echarts'" v-model="colorForm.tableItemFontColorType" inactive-text="默认"
                         active-text="高级" @change="switchState('tableFontColor')"></el-switch>
            </div>
            <div v-show="colorForm.tableItemFontColorType && chart.render === 'echarts'">
              <el-tooltip class="item" effect="dark" placement="bottom">
                <div slot="content">
                  支持三元运算
                  <br>
                  示例：item[index] == 'AA' ? "#ff0000" : "#ffff00"
                  <br>
                  其中：index为下标，0代表第一列，1代表第二列，以此类推
                </div>
                <i class="el-icon-info" style="cursor: pointer;"/>
              </el-tooltip>
              <el-input placeholder="输入三元表达式" type="textarea" v-model="colorForm.tableItemCustomFontColor"
                        @change="changeColorCase('tableFontColor')"></el-input>
            </div>
          </el-form-item>
          <el-form-item
            v-show="showProperty('tableBorderColor')"
            :label="$t('chart.table_border_color')"
            class="form-item"
          >
            <el-color-picker
              v-model="colorForm.tableBorderColor"
              class="color-picker-style"
              :predefine="predefineColors"
              @change="changeColorCase('tableBorderColor')"
            />
          </el-form-item>
          <el-form-item
            v-show="showProperty('tableScrollBarColor')"
            :label="$t('chart.table_scroll_bar_color')"
            class="form-item"
          >
            <el-color-picker
              v-model="colorForm.tableScrollBarColor"
              class="color-picker-style"
              :predefine="predefineColors"
              color-format="rgb"
              show-alpha
              @change="changeColorCase('tableScrollBarColor')"
            />
          </el-form-item>
        </div>
        <el-form-item
          v-show="showProperty('isGradient')"
          :label="$t('chart.is_gradient')"
          class="form-item form-item-slider"
        >
          <el-switch v-if="chart.render === 'echarts'" v-model="colorForm.isGradient"
                     @change="switchState('isGradient')"></el-switch>
        </el-form-item>
        <el-form-item
          v-show="showProperty('alpha')"
          :label="$t('chart.not_alpha')"
          class="form-item form-item-slider"
        >
          <el-slider
            v-model="colorForm.alpha"
            show-input
            :show-input-controls="false"
            input-size="mini"
            @change="changeColorCase('alpha')"
          />
        </el-form-item>

        <el-form-item
          v-show="showProperty('area-border-color') "
          :label="$t('chart.area_border_color')"
          class="form-item"
        >
          <el-color-picker
            v-model="colorForm.areaBorderColor"
            class="color-picker-style"
            :predefine="predefineColors"
            @change="changeColorCase('areaBorderColor')"
          />
        </el-form-item>
      </el-form>
    </el-col>
  </div>
</template>

<script>
import {COLOR_PANEL, DEFAULT_COLOR_CASE} from '../../chart/chart'
import {getColors} from '@/views/chart/chart/util'
import {mapState} from 'vuex'
import GradientColorSelector from '@/components/gradientColorSelector'
import bus from '@/utils/bus'

export default {
  name: 'ColorSelector',
  components: {GradientColorSelector},
  props: {
    param: {
      type: Object,
      required: false
    },
    chart: {
      type: Object,
      required: true
    },
    propertyInner: {
      type: Array,
      required: false,
      default: function () {
        return []
      }
    },
    sourceType: {
      type: String,
      default: 'view',
      required: false
    }
  },
  data() {
    return {
      colorCases: [
        {
          name: this.$t('chart.color_default'),
          value: 'default',
          colors: ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc']
        },
        {
          name: this.$t('chart.color_retro'),
          value: 'retro',
          colors: ['#0780cf', '#765005', '#fa6d1d', '#0e2c82', '#b6b51f', '#da1f18', '#701866', '#f47a75', '#009db2']
        },
        {
          name: this.$t('chart.color_elegant'),
          value: 'elegant',
          colors: ['#95a2ff', '#fa8080', '#ffc076', '#fae768', '#87e885', '#3cb9fc', '#73abf5', '#cb9bff', '#434348']
        },
        {
          name: this.$t('chart.color_future'),
          value: 'future',
          colors: ['#63b2ee', '#76da91', '#f8cb7f', '#f89588', '#7cd6cf', '#9192ab', '#7898e1', '#efa666', '#eddd86']
        },
        {
          name: this.$t('chart.color_gradual'),
          value: 'gradual',
          colors: ['#71ae46', '#96b744', '#c4cc38', '#ebe12a', '#eab026', '#e3852b', '#d85d2a', '#ce2626', '#ac2026']
        },
        {
          name: this.$t('chart.color_simple'),
          value: 'simple',
          colors: ['#929fff', '#9de0ff', '#ffa897', '#af87fe', '#7dc3fe', '#bb60b2', '#433e7c', '#f47a75', '#009db2']
        },
        {
          name: this.$t('chart.color_business'),
          value: 'business',
          colors: ['#194f97', '#555555', '#bd6b08', '#00686b', '#c82d31', '#625ba1', '#898989', '#9c9800', '#007f54']
        },
        {
          name: this.$t('chart.color_gentle'),
          value: 'gentle',
          colors: ['#5b9bd5', '#ed7d31', '#70ad47', '#ffc000', '#4472c4', '#91d024', '#b235e6', '#02ae75', '#5b9bd5']
        },
        {
          name: this.$t('chart.color_technology'),
          value: 'technology',
          colors: ['#05f8d6', '#0082fc', '#fdd845', '#22ed7c', '#09b0d3', '#1d27c9', '#f9e264', '#f47a75', '#009db2']
        },
        {
          name: this.$t('chart.color_light'),
          value: 'light',
          colors: ['#884898', '#808080', '#82ae46', '#00a3af', '#ef8b07', '#007bbb', '#9d775f', '#fae800', '#5f9b3c']
        },
        {
          name: this.$t('chart.color_classical'),
          value: 'classical',
          colors: ['#007bbb', '#ffdb4f', '#dd4b4b', '#2ca9e1', '#ef8b07', '#4a488e', '#82ae46', '#dd4b4b', '#bb9581']
        },
        {
          name: this.$t('chart.color_fresh'),
          value: 'fresh',
          colors: ['#5f9b3c', '#75c24b', '#83d65f', '#aacf53', '#c7dc68', '#d8e698', '#e0ebaf', '#bbc8e6', '#e5e5e5']
        },
        {
          name: this.$t('chart.color_energy'),
          value: 'energy',
          colors: ['#ef8b07', '#2a83a2', '#f07474', '#c55784', '#274a78', '#7058a3', '#0095d9', '#75c24b', '#808080']
        },
        {
          name: this.$t('chart.color_red'),
          value: 'red',
          colors: ['#ff0000', '#ef8b07', '#4c6cb3', '#f8e944', '#69821b', '#9c5ec3', '#00ccdf', '#f07474', '#bb9581']
        },
        {
          name: this.$t('chart.color_fast'),
          value: 'fast',
          colors: ['#fae800', '#00c039', '#0482dc', '#bb9581', '#ff7701', '#9c5ec3', '#00ccdf', '#00c039', '#ff7701']
        },
        {
          name: this.$t('chart.color_spiritual'),
          value: 'spiritual',
          colors: ['#00a3af', '#4da798', '#57baaa', '#62d0bd', '#6ee4d0', '#86e7d6', '#aeede1', '#bde1e6', '#e5e5e5']
        }
      ],
      tableData: JSON.parse(JSON.stringify(DEFAULT_COLOR_CASE)).cloneColors || [],
      colorForm: JSON.parse(JSON.stringify(DEFAULT_COLOR_CASE)),
      customColor: null,
      colorIndex: 0,
      customColorIndex: 0,
      predefineColors: COLOR_PANEL
    }
  },
  computed: {
    ...mapState([
      'batchOptStatus',
      'componentViewsData'
    ])
  },
  watch: {
    'chart.id': {
      handler: function () {
        this.customColor = null
        this.colorIndex = 0
      }
    },
    'chart': {
      handler: function () {
        this.init()
      }
    }
  },
  mounted() {
    this.init()
    bus.$on('prop-change-data', this.initCustomColor)
  },
  beforeDestroy() {
    bus.$off('prop-change-data', this.initCustomColor)
  },
  methods: {
    blur(item) {
      if((item.min == 0 || item.min) && item.max) {
        this.changeCloneColorOption()
      }
    },
    addRow(index, data) {
      let res = data[index]
      data[index].children.push({id: res.id + '-' + (res.children.length + 1), color: '#888888'})
      this.changeCloneColorOption()
    },
    tableDataAdd(rows, a) {
      console.log(a)
      rows.push({id: rows.length + 1, color: '#888888', isAdd: false, children: [], min: 0, max: 0})
      this.changeCloneColorOption()
    },
    deleteRow(index, rows, item) {
      if ('isAdd' in item) {
        rows.some((val, i) => {
          if (val.id == item.id) {
            rows.splice(i, 1)
          }
        })

      } else {
        let res = item.id.split('-')
        rows[Number(res[0]) - 1].children.some((val, i) => {
          if (val.id == item.id) {
            rows[Number(res[0]) - 1].children.splice(i, 1)
          }
        })
      }
      this.changeCloneColorOption()
    },
    gradientColorChange(colorDto) {
      const modifyNames = ['value', 'colors', 'seriesColors']
      modifyNames.forEach(item => {
        this.colorForm['modifyName'] = item
        this.$emit('onColorChange', this.colorForm)
      })
    },
    changeCloneColorOption(modifyName = 'value') {
      let colors = this.tableData.filter(item => {
        return item.color
      })
      this.colorForm.cloneColors = JSON.parse(JSON.stringify(colors))

      this.customColor = this.colorForm.colors[0]
      this.colorIndex = 0

      // reset custom color
      this.colorForm.seriesColors = []
      this.initCustomColor(true)

      this.changeColorCase(modifyName)
    },
    changeColorOption(modifyName = 'value') {
      const that = this
      const items = this.colorCases.filter(ele => {
        return ele.value === that.colorForm.value
      })
      this.colorForm.colors = JSON.parse(JSON.stringify(items[0].colors))

      this.customColor = this.colorForm.colors[0]
      this.colorIndex = 0

      // reset custom color
      this.colorForm.seriesColors = []
      this.initCustomColor(true)

      this.changeColorCase(modifyName)
    },
    changeColorCase(modifyName) {
      this.colorForm['modifyName'] = modifyName
      this.$emit('onColorChange', this.colorForm)
      this.colorForm['modifyName'] = 'colors'
      this.$emit('onColorChange', this.colorForm)
    },
    switchState(modifyName) {
      this.changeColorCase(modifyName)
    },
    init() {
      const chart = JSON.parse(JSON.stringify(this.chart))
      if (chart.customAttr) {
        let customAttr = null
        if (Object.prototype.toString.call(chart.customAttr) === '[object Object]') {
          customAttr = JSON.parse(JSON.stringify(chart.customAttr))
        } else {
          customAttr = JSON.parse(chart.customAttr)
        }
        if (customAttr.color) {
          this.colorForm = customAttr.color
          this.tableData = customAttr.color.cloneColors || []
          if (!this.customColor) {
            this.customColor = this.colorForm.colors[0]
            this.colorIndex = 0
          }

          this.colorForm.tableBorderColor = this.colorForm.tableBorderColor ? this.colorForm.tableBorderColor : DEFAULT_COLOR_CASE.tableBorderColor
          this.colorForm.tableHeaderFontColor = this.colorForm.tableHeaderFontColor ? this.colorForm.tableHeaderFontColor : this.colorForm.tableFontColor
          this.$set(this.colorForm, 'gradient', this.colorForm.gradient || false)
          this.colorForm.tableScrollBarColor = this.colorForm.tableScrollBarColor ? this.colorForm.tableScrollBarColor : DEFAULT_COLOR_CASE.tableScrollBarColor

          this.initCustomColor()
        }
      }
    },

    switchColor(index) {
      this.colorIndex = index
      this.customColorIndex = index
    },
    switchColorCase() {
      this.colorForm.colors[this.colorIndex] = this.customColor
      if (this.colorForm.seriesColors && this.colorForm.seriesColors.length > 0) {
        this.colorForm.seriesColors[this.customColorIndex].color = this.customColor
      }
      this.colorForm['modifyName'] = 'value'
      this.$emit('onColorChange', this.colorForm)
      this.colorForm['modifyName'] = 'colors'
      this.$emit('onColorChange', this.colorForm)
      this.colorForm['modifyName'] = 'seriesColors'
      this.$emit('onColorChange', this.colorForm)
    },
    resetCustomColor() {
      this.changeColorOption()
    },
    showProperty(property) {
      return this.propertyInner.includes(property)
    },

    switchCustomColor(index) {
      this.customColorIndex = index
      this.colorIndex = this.customColorIndex
      this.colorForm.seriesColors[index].isCustom = true
      this.customColor = this.colorForm.seriesColors[index].color
      this.switchColorCase()
    },

    initCustomColor(reset) {
      if (!this.batchOptStatus && this.chart.render && (this.chart.render === 'antv' || this.chart.render === 'echarts') &&
        (this.chart.type.includes('bar') ||
          this.chart.type.includes('line') ||
          this.chart.type.includes('area') ||
          this.chart.type.includes('pie') ||
          this.chart.type === 'funnel' ||
          this.chart.type === 'radar' ||
          this.chart.type === 'scatter')) {
        if (this.componentViewsData[this.chart.id]) {
          const chart = JSON.parse(JSON.stringify(this.componentViewsData[this.chart.id]))
          if (this.colorForm.seriesColors) {
            this.colorForm.seriesColors = getColors(chart, this.colorForm.colors, reset)
          }
        }
      }
    }
  }
}
</script>

<style scoped>
.color-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.shape-item {
  padding: 6px;
  border: none;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center
}

.form-item-slider ::v-deep .el-form-item__label {
  font-size: 12px;
  line-height: 38px;
}

#color_case ::v-deep .el-form-item__content {
  display: flex;
  justify-content: space-between;
  width: 66%;
}

.form-item ::v-deep .el-form-item__label {
  font-size: 12px;
}

.el-select-dropdown__item {
  padding: 0 20px;
}

span {
  font-size: 12px
}

.el-form-item {
  margin-bottom: 6px;
}

.color-picker-style {
  cursor: pointer;
  z-index: 1003;
}

.color-label {
  display: inline-block;
  width: 60px;
}

.color-type ::v-deep .el-radio__input {
  display: none;
}

.el-radio {
  margin: 0 2px 0 0 !important;
  border: 1px solid transparent;
}

.el-radio ::v-deep .el-radio__label {
  padding-left: 0;
}

.el-radio.is-checked {
  border: 1px solid #0a7be0;
}

.span-label {
  width: 300px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: inline-block;
  padding: 0 8px;
}

.custom-color-style {
  height: 300px;
  overflow-y: auto;
  padding: 4px 12px;
  border: 1px solid #e6e6e6;
}
</style>
