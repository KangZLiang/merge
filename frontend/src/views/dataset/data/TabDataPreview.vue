<template>
  <el-col>
    <div class="table-count">
      <span
        class="title-text"
        style="width: 100px"
      >{{ $t('deDataset.display') }} {{ form.row }}
        {{ $t('deDataset.row') }}</span>
      <el-popover
        ref="setCount"
        popper-class="de-set-count de-card-dropdown"
        placement="right-start"
        width="306"
        trigger="click"
      >
        {{ $t('deDataset.show_rows') }}
        <el-input
          v-model="rowNum"
          size="small"
        />
        <div class="foot">
          <deBtn
            secondary
            @click="cancel"
          >{{ $t('commons.cancel') }} </deBtn>
          <deBtn
            type="primary"
            @click="searchRow"
          >
            {{ $t('commons.confirm') }}
          </deBtn>
        </div>
        <i
          slot="reference"
          class="el-icon-edit"
        />
      </el-popover>
      <el-button
        v-if="table.type === 'excel'"
        type="primary"
        style="margin-bottom: 10px;margin-left: 10px"
        @click="insertEvent(0)">{{ $t('dataset.insert_new_data') }}
      </el-button>
      <el-button v-if="table.type === 'excel'"
                 type="primary"
                 style="margin-bottom: 10px"
                 @click="$refs.plxTable.clearFilter()">{{ $t('dataset.clear_filter') }}
      </el-button>
    </div>
    <ux-grid
      ref="plxTable"
      size="mini"
      style="width: 100%"
      :height="height"
      :checkbox-config="{ highlight: true }"
      :width-resize="true"
      keep-source
      v-bind="{editConfig:table.type === 'excel' ? {trigger:'dblclick',mode:'cell'} : false}"
    >
      <ux-table-column
        v-if="field.dataeaseName !== 'dataease_uuid'"
        v-for="field in fields"
        :key="field.id"
        min-width="200px"
        :field="field.dataeaseName"
        :resizable="true"
        :filters="[{ data: '' }]"
        :filter-method="filterMethod"
        :edit-render="{autofocus: '.el-input__inner',autosize:{minRows: 2, maxRows: 4}}"
      >
        <template slot="header">
          <svg-icon
            v-if="field.deType === 0"
            icon-class="field_text"
            class="field-icon-text"
          />
          <svg-icon
            v-if="field.deType === 1"
            icon-class="field_time"
            class="field-icon-time"
          />
          <svg-icon
            v-if="field.deType === 2 || field.deType === 3"
            icon-class="field_value"
            class="field-icon-value"
          />
          <svg-icon
            v-if="field.deType === 5"
            icon-class="field_location"
            class="field-icon-location"
          />
          <span>{{ field.name }}</span>
        </template>
        <template v-slot:filter="{$panel,column}">
          <el-input v-for="(option,index) in column.filters" :key="index" v-model="option.data"
                    @input="$panel.changeOption($event,option.data,option)" />
        </template>
        <template v-slot:edit="scope">
          <el-input type="textarea" style="z-index: 100" v-model="scope.row[scope.column.property]"></el-input>
        </template>
      </ux-table-column>
      <ux-table-column v-if="table.type === 'excel'" title="操作" width="160" fixed="right">
        <template v-slot="{ row }">
          <el-button size="mini" type="primary" @click="saveEvent(row)">保存</el-button>
          <el-button size="mini" type="danger" @click="deleteEvent(row)">删除</el-button>
        </template>
      </ux-table-column>
    </ux-grid>
  </el-col>
</template>

<script>
import _ from 'lodash'
import { updateTableData, addTableData, deleteTableData } from '@/api/dataset/dataset'

export default {
  name: 'TabDataPreview',
  props: {
    table: {
      type: Object,
      required: true
    },
    param: {
      type: Object,
      required: true
    },
    fields: {
      type: Array,
      required: true
    },
    data: {
      type: Array,
      required: true
    },
    form: {
      type: Object,
      required: true
    },
    page: {
      type: Object,
      required: false
    }
  },
  data() {
    return {
      height: 500,
      rowNum: parseInt(this.form.row),
      currentPage: {
        page: 1,
        pageSize: parseInt(this.form.row),
        show: parseInt(this.form.row)
      }
    }
  },
  watch: {
    data() {
      const data = this.data
      this.$refs.plxTable.reloadData(data)
    },
    page() {
      if (this.page.total < parseInt(this.form.row)) {
        this.currentPage.show = this.page.total
      } else {
        this.currentPage.show = parseInt(this.form.row)
      }
    }
  },
  mounted() {
    this.init()
    window.addEventListener('resize', this.calHeight)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.calHeight)
  },
  methods: {
    searchRow() {
      this.form.row = this.rowNum
      this.reSearch()
    },
    init() {
      this.calHeight()
    },
    cancel() {
      this.$refs.setCount.doClose()
    },
    calHeight: _.debounce(function() {
      const currentHeight = document.documentElement.clientHeight
      this.height = currentHeight - 215
    }, 200),
    reSearch() {
      if (
        !this.form.row ||
        this.form.row === '' ||
        this.form.row.length > 4 ||
        isNaN(Number(this.form.row)) ||
        String(this.form.row).includes('.') ||
        parseInt(this.form.row) < 1
      ) {
        this.$message({
          message: this.$t('dataset.pls_input_less_5'),
          type: 'error',
          showClose: true
        })
        return
      }
      this.currentPage.show = parseInt(this.form.row)
      this.currentPage.pageSize = parseInt(this.form.row)
      this.currentPage.page = 1
      this.$refs.setCount?.doClose()
      this.$emit('reSearch', { form: this.form, page: this.currentPage })
    },
    pageChange(val) {
      this.currentPage.page = val
      this.$emit('reSearch', { form: this.form, page: this.currentPage })
    },
    filterMethod({option,row,column}){
      const property = column['property']
      if (typeof(row[property]) != 'string') {
        row[property] = String(row[property])
      }
      return row[property].toLowerCase().includes(option.data)
    },
    saveEvent(row){
      if (this.$refs.plxTable.isUpdateByRow(row)) {
        // 局部保存，并将行数据恢复到初始状态（如果 第二个参数record 为空则不改动行数据，只恢复状态）
        // 必须执行这个，不然下次点击保存，还是保存成功哦！状态没改变哦
        this.$refs.plxTable.reloadRow(row, null, null)
        // ...保存逻辑相关（后端呀，或者前端呀）
        var updateList = new Array();
        var whereList = new Array();
        for(let key in row){
          if (key !== '_XID' && key !== 'dataease_uuid'){
            let obj = {
              name:"",
              value:""
            }
            obj.name = key
            obj.value = row[key]
            updateList.push(obj) ;
          }
          if (key === 'dataease_uuid'){
            let obj = {
              name:"",
              value:""
            }
            obj.name = key
            obj.value = row[key]
            whereList.push(obj) ;
          }
        }
        let data = {
          "tableName" : 'ds_' + (this.param.id.replaceAll('-', '_')),
          "updateList" : [...whereList,...updateList],
          "whereList" : whereList
        }
        updateTableData(data).then(res=>{
          console.log(res)
          if (res.success){
            this.$message({
              message: '保存成功!',
              type: 'success'
            })
          }
        })
      } else {
        if (!row.dataease_uuid ){
          row.dataease_uuid = this.uuid()
          var addList = new Array();
          for(let key in row){
            if (key !== '_XID' ){
              let obj = {
                name:"",
                value:""
              }
              obj.name = key
              obj.value = row[key]
              addList.push(obj) ;
            }
          }
          let data = {
            "tableName" : 'ds_' + (this.param.id.replaceAll('-', '_')),
            "addList" : addList
          }
          addTableData(data).then(res=>{
            if (res.success){
              this.$message({
                message: '新增成功',
                type: 'success'
              })
            }
          }).catch(e=>{
            delete row.dataease_uuid
          })
        }else{
          this.$message({
            message: '保存失败，你没改变当前行的数据',
            type: 'error'
          });
        }
      }
    },
    deleteEvent(row){
      if (row.dataease_uuid){
        var delList = new Array();
        for(let key in row){
          if (key === 'dataease_uuid' ){
            let obj = {
              name:"",
              value:""
            }
            obj.name = key
            obj.value = row[key]
            delList.push(obj) ;
          }
        }
        let data = {
          "tableName" : 'ds_' + (this.param.id.replaceAll('-', '_')),
          "delList" : delList
        }
        this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          deleteTableData(data).then(res=>{
            if (res.success){
              this.$refs.plxTable.remove(row)
              this.$message({
                message: '删除成功',
                type: 'success'
              })
            }
          })
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
      }
    },
    uuid(){
      return (this.getUUID() + this.getUUID() + "-" + this.getUUID() + "-" + this.getUUID() + "-" + this.getUUID() + "-" + this.getUUID() + this.getUUID() + this.getUUID())
    },
    getUUID(){
      return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1)
    },
    // 添加插入行
    async insertEvent(row) {
      let record = {}
      // 加入行, 表示加入行的row对象，row为空则插入第一行，为-1插入最后一行
      let {
        row: newRow
      } = await this.$refs.plxTable.insertRow(record, row)
      // 激活单元格编辑
      await this.$refs.plxTable.setActiveRow(newRow)
    },
  }
}
</script>
<style lang="scss" scoped>
.table-count {
  color: var(--deTextSecondary, #606266);
  font-family: PingFang SC;
  font-size: 14px;
  font-weight: 400;
  line-height: 22px;
  margin: 4px 0;
  .title-text {
    margin: 0 5px 0 0;
  }
}
</style>
<style lang="scss">
.de-set-count {
  padding: 20px 24px;
  font-family: PingFang SC;
  font-size: 14px;
  font-weight: 400;
  color: var(--deTextPrimary, #1f2329);
  text-align: left;

  .el-input {
    margin: 8px 0 20px 0;
  }

  .de-button {
    min-width: 48px;
    height: 28px;
  }
}
</style>
