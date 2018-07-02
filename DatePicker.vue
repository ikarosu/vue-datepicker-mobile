<template>
  <section class="wrap" @touchstart.self="display = false" :class="{hide: !display}">
    <div class="content">
      <header>
        <a @touchstart="display = false">取消</a>
        <strong>选择日期</strong>
      </header>
      <div class="week-text">
        <span v-for="(text, i) in weekTexts"
          :key="i"
          :class="{rest: mondayFirst
            ? i == 5 || i == 6 ? true : false
            : i == 0 || i == 6 ? true : false}">{{text}}</span>
      </div>
      <main>
        <section class="month" v-for="(item, i) in months" :key="i">
          <header>{{item.year}}年 {{item.month}}月</header>
          <div class="day-wrap">
            <div class="day"
              v-for="(day, j) in item.days" :key="j"
              :class="{'disable': day.disable, 'active': day.active, 'select': day.begin || day.end}"
              @touchstart="selectOne(day)">
              <span>{{day.begin ? '入住' : day.end ? '离店': '&nbsp;'}}</span>
              <span class="number" :class="{restday: day.restday, rest: day.rest, workday: day.workday}">{{day.text}}</span>
              <span v-if="day.custom" :class="{rest: day.custom.highlight}">{{day.custom.text}}</span>
              <span v-else>&nbsp;</span>
            </div>
          </div>
        </section>
      </main>
    </div>
  </section>
</template>

<script>
class DateHelper {
  constructor() {}
  get year() {
    return new Date().getFullYear()
  }
  get month() {
    return new Date().getMonth() + 1
  }
  get day() {
    return new Date().getDate()
  }
  get date() {
    return `${this.year}-${this.month}-${this.day}`
  }
}
export default {
  props: {
    display: {
      type: Boolean,
      default() { return false }
    },
    // 是否周一为第一天
    mondayFirst: {
      type: Boolean,
      default() { return false }
    },
    // 允许反向选择日期
    reverseSelect: {
      type: Boolean,
      default() { return false }
    },
    // 自定义节假日
    restday: {
      type: Array,
      default() { return [] }
    },
    // 自定义补班日
    workday: {
      type: Array,
      default() { return [] }
    },
    // 加载日历的范围，单位为月
    displayRange: {
      type: Number,
      default() { return 13 }
    },
    // 可自定义显示开始日期
    // 默认为当月当日
    displayRangeStart: {
      type: String,
      default() { return new DateHelper().date}
    },
    // 可选择的开始日期
    selectRangeStart: {
      type: String,
      default() { return new DateHelper().date}
    },
    // 可选择的结束日期
    selectRangeEnd: {
      type: String,
      default() { return '9999-99-99' }
    },
    // 自定义数据
    customData: {
      type: Array,
      default() { return [] }
    }
  },
  data() {
    return {
      months: [],
      firstTime: true,
      firstSelectDay: {},
      lastSelectDay: {},
      rangeList: [],
      customDataIndex: 0
    }
  },
  computed: {
    weekTexts() {
      const arrTexts = ['日', '一', '二', '三', '四', '五', '六']
      // 中国习惯周一为第一天
      if (this.mondayFirst) arrTexts.push(arrTexts.shift())
      return arrTexts
    },
    $date() {
      return new DateHelper()
    },
    mIndexBegin() {
      return this.months.findIndex(v => v.year === this.firstSelectDay.year && v.month === this.firstSelectDay.month)
    },
    mIndexEnd() {
      return this.months.findIndex(v => v.year === this.lastSelectDay.year && v.month === this.lastSelectDay.month)
    }
  },
  created() {
    const months = []
    const [Y, M] = this.displayRangeStart.split('-').map(Number)
    const [Ys, Ms, Ds] = this.selectRangeStart.split('-').map(Number)
    const [Ye, Me, De] = this.selectRangeEnd.split('-').map(Number)
    let [year, month] = [Y, M]
    let customIndex = 0
    // 循环出月份
    for (let i = 0; i < this.displayRange; i++) {
      // 满 13月进 1年
      if (M + i > 12) {
        year = Y + 1
        month = M + i - 12
      } else {
        month = M + i
      }
      const days = [] // 每一天的数据对象会放入该数组
      // 通过占位把 1号排到实际的星期位置
      // 默认周日开头情况下，今天是星期几，就需要几个占位符
      // 周日为 0，不用处理
      let placeholder = new Date(year, month - 1, 1).getDay()
      // 如果是周一开头，把占位符往前移一天
      // 周日为 0，需处理成 7-1
      if (this.mondayFirst) placeholder = placeholder === 0 ? 6 : placeholder - 1
      for (let j = 0; j < placeholder; j++) {
        days.push({})
      }
      // 得到当月总天数
      const daySum = new Date(year, month, 0).getDate()
      // 循环出每一天
      for (let day = 1; day <= daySum; day++) {
        const obj = {} // 存放的数据将会在 template中用到
        obj.year = year
        obj.month = month
        obj.day = day
        obj.date = `${year}-${month}-${day}`
        // 显示“今天”或者几号
        obj.text = year === this.$date.year && month === this.$date.month && day === this.$date.day ? '今天' : day
        // 获取星期几，判断周末
        const weekday = new Date(year, month - 1, day).getDay()
        const weekend = weekday === 6 || weekday === 0
        // 判断是否禁用状态
        // 同时在非禁用状态下，才处理周末
        if (year < Ys || year > Ye) {
          obj.disable = true
        } else if (year === Ys) {
          if (month < Ms || month > Me) {
            obj.disable = true
          } else if (month === Ms) {
            if (day < Ds || day > De) {
              obj.disable = true
            } else {
              obj.rest = day > Ds && weekend
              if (day === Ds) this.customDataIndex = customIndex
            }
          } else {
            obj.rest = weekend
          }
        } else {
          obj.rest = weekend
        }
        // 自定义休息日
        if (this.restday.length) {
          this.restday.forEach(date => {
            if (date === obj.date) obj.restday = obj.rest = true
          })
        }
        // 自定义工作日
        if (this.workday.length) {
          this.workday.forEach(date => {
            if (date === obj.date) {
              obj.workday = true
              obj.rest = false
            }
          })
        }
        customIndex++
        days.push(obj)
        // 结束循环每天
      }
      months.push({ year, month, days })
      // 结束循环每月
    }
    // 自定义数据
    if (this.customData.length) {
      let days = []
      months.forEach(v => days = days.concat(v.days))
      for (let i = this.customDataIndex, j = 0; i < days.length; i++, j++) {
        const v = days[i]
        const data = this.customData[j]
        if (v.text && data) {
          const type = typeof data
          if (type === 'string') v.custom = { text: data }
          else if (type === 'object') v.custom = data
          else console.error(`customData数组每项的类型应该是String或Object，但是得到的是${type}`)
        }
      }
    }
    this.months = months
  },
  methods: {
    selectOne(tar) {
      // 点击禁用的
      const { disable } = tar
      if (disable) { return false }
      if (!tar.text) { return false }
      // 第一次点击
      if (this.firstTime) {
        this.firstTime = false
        // 清空之前选择
        if (this.mIndexBegin > -1 && this.mIndexEnd > -1) {
          for (let i = this.mIndexBegin; i <= this.mIndexEnd; i++) {
            this.months[i].days.map(day => {
              if (this.getTimestamp(day) === this.getTimestamp(this.firstSelectDay)) this.$set(day, 'begin', false)
              if (this.getTimestamp(day) > this.getTimestamp(this.firstSelectDay) && this.getTimestamp(day) < this.getTimestamp(this.lastSelectDay)) this.$set(day, 'active', false)
              if (this.getTimestamp(day) === this.getTimestamp(this.lastSelectDay)) this.$set(day, 'end', false)
            })
          }
        }
        // 选中当前
        this.firstSelectDay = tar
        this.$set(tar, 'begin', true)
      } else { // 第二次点击
        // 点击当天的不响应
        if (this.getTimestamp(tar) === this.getTimestamp(this.firstSelectDay)) { return false }
        // 在第一次点击之前
        if (this.getTimestamp(tar) < this.getTimestamp(this.firstSelectDay)) {
          this.firstTime = true
          if (this.reverseSelect) {
            // 取消上一次选中
            this.$set(this.firstSelectDay, 'begin', false)
            // 交换值
            this.lastSelectDay = this.firstSelectDay
            this.firstSelectDay = tar
            // 按交换后的值设置开头和结尾
            this.$set(this.firstSelectDay, 'begin', true)
            this.$set(this.lastSelectDay, 'end', true)
            // 将中间日期设为被选状态
            this.chooseRange().then(range => {
              this.$emit('select', { start: this.firstSelectDay, end: this.lastSelectDay, range })
            })
          } else {
            // 取消上一次选中
            this.$set(this.firstSelectDay, 'begin', false)
            // 选中本次点击
            this.$set(tar, 'begin', true)
            this.firstSelectDay = tar
            // 将下一次点击设为第二次
            this.firstTime = false
          }
        } else {
          this.firstTime = true
          // 选中当前日期作为结尾
          this.lastSelectDay = tar
          this.$set(tar, 'end', true)
          // 将中间日期设为被选状态
          this.chooseRange().then(range => {
            this.$emit('select', { start: this.firstSelectDay, end: this.lastSelectDay, range })
          })
        }
      }
    },
    getTimestamp(tar) {
      return new Date(tar.year, tar.month - 1, tar.day).getTime()
    },
    chooseRange() {
      return new Promise((resolve) => {
        if (this.mIndexBegin > -1 && this.mIndexEnd > -1) {
          let rangeList = []
          for (let i = this.mIndexBegin; i <= this.mIndexEnd; i++) {
            rangeList = rangeList.concat(this.months[i].days.filter(day => {
              if (this.getTimestamp(day) > this.getTimestamp(this.firstSelectDay) && this.getTimestamp(day) < this.getTimestamp(this.lastSelectDay)) {
                this.$set(day, 'active', true)
                return day
              }
            }))
          }
          resolve(rangeList)
        } else {
          resolve(new Array())
        }
      })
    }
  }
}
</script>

<style lang="less" scoped>
.wrap{
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(9, 9, 9, .7);
  transition: transform .5s ease-out;
  &.hide{
    transform: translateY(100vh)
  }
}
.content{
  position: absolute;
  bottom: 0;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 90vh;
  background-color: white;
  text-align: center;
  >header{
    padding: 10px;
    text-align: center;
    >a{
      position: absolute;
      top: 10px;
      left: 10px;
      font-size: 14px;
    }
  }
  .week-text{
    display: flex;
    justify-content: space-between;
    margin: 5px 0;
    >span{
      width: 100 / 7vw;
      font-size: 12px;
    }
  }
  main{
    flex: 1;
    overflow-y: scroll;
    .month{
      >header{
        position: sticky;
        top: 0;
        padding: 5px;
        background-color: #eee;
      }
      .day-wrap{
        display: flex;
        flex-wrap: wrap;
        .day{
          display: flex;
          flex-direction: column;
          justify-content: center;
          position: relative;
          width: 100 / 7vw;
          height: 70px;
          &.disable{
            color: #eee;
            >span{
              color: #eee!important;
            }
          }
          &.select{
            color: white;
            background-color: deepskyblue;
            >span{
              color: white!important;
            }
          }
          &.active{
            background-color: lightblue;
          }
          span{
            font-size: 12px;
            &.number{
              font-size: 14px;
            }
            &.rest{
              color: tomato;
            }
            &.restday:before{
              content: '休';
              position: absolute;
              top: 2px;
              left: 2px;
              font-size: 12px;
            }
            &.workday:before{
              content: '班';
              position: absolute;
              top: 2px;
              left: 2px;
              font-size: 12px;
              color: inherit;
            }
          }
        }
      }
    }
  }
}
</style>

