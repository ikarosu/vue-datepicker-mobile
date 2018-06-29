<template>
  <section class="wrap">
    <div class="content">
      <header>
        <a>取消</a>
        <strong>选择日期</strong>
      </header>
      <div class="week-text">
        <span v-for="(text, i) in weekTexts"
          :key="i"
          :style="{color: mondayFirst
            ? i == 5 || i == 6 ? restDayColor : ''
            : i == 0 || i == 6 ? restDayColor : ''}">{{text}}</span>
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
              <span class="number" :style="{color: day.rest ? restDayColor : ''}">{{day.date}}</span>
              <span>{{day.price}}</span>
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
}
export default {
  props: {
    // 是否周一为第一天
    mondayFirst: {
      type: Boolean,
      default() { return false }
    },
    // 自定义休息日颜色
    restDayColor: {
      type: String,
      default() { return 'tomato' }
    },
    // 加载日历的范围，单位为月
    displayRange: {
      type: Number,
      default() { return 13 }
    },
    // 可自定义开始日期
    // 默认为当月当日
    displayRangeStart: {
      type: Object,
      default() {
        const { year, month, day } = new DateHelper()
        return { year, month, day }
      }
    },
    selectRangeStart: {
      type: Object,
      default() {
        const { year, month, day } = new DateHelper()
        return { year, month, day }
      }
    },
    reverseSelect: {
      type: Boolean,
      default() { return false }
    }
  },
  data() {
    return {
      months: [],
      firstTime: true,
      firstSelectDay: {},
      lastSelectDay: {},
      mIndexBegin: -1,
      mIndexEnd: -1,
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
    }
  },
  created() {
    const months = []
    const { year: Y, month: M } = this.displayRangeStart
    const { year: Ys, month: Ms, day: Ds } = this.selectRangeStart
    let { Y: year, M: month } = { Y, M }
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
        // 显示“今天”或者几号
        obj.date = year === this.$date.year && month === this.$date.month && day === this.$date.day ? '今天' : day
        // 获取星期几，判断周末
        const weekday = new Date(year, month - 1, day).getDay()
        const weekend = weekday === 6 || weekday === 0
        // 判断是否禁用状态
        // 同时在非禁用状态下，才处理周末
        if (year < Ys) {
          obj.disable = true
        } else if (year === Ys) {
          if (month < Ms) {
            obj.disable = true
          } else if (month === Ms) {
            if (day < Ds) {
              obj.disable = true
            } else {
              obj.rest = day > Ds && weekend
            }
          } else {
            obj.rest = weekend
          }
        } else {
          obj.rest = weekend
        }
        days.push(obj)
        // 结束循环每天
      }
      months.push({ year, month, days })
      // 结束循环每月
    }
    this.months = months
  },
  methods: {
    selectOne(tar) {
      const { disable } = tar
      if (disable) { return false }
      if (this.getTimestamp(tar) === this.getTimestamp(this.firstSelectDay)) { return false }
      if (this.firstTime) {
        this.firstTime = false
        if (this.mIndexBegin > -1 && this.mIndexEnd > -1) {
          for (let i = this.mIndexBegin; i <= this.mIndexEnd; i++) {
            this.months[i].days.map(day => {
              if (day.day === this.firstSelectDay.day) this.$set(day, 'begin', false)
              if (day.day > this.firstSelectDay.day && day.day < this.lastSelectDay.day) this.$set(day, 'active', false)
              if (day.day === this.lastSelectDay.day) this.$set(day, 'end', false)
            })
          }
        }
        this.firstSelectDay = tar
        this.$set(tar, 'begin', true)
      } else {
          this.firstTime = true
          if (this.getTimestamp(tar) < this.getTimestamp(this.firstSelectDay)) {
            if (this.reverseSelect) {
            } else {
              this.$set(this.firstSelectDay, 'begin', false)
              this.$set(tar, 'begin', true)
              this.firstSelectDay = tar
              this.firstTime = false
            }
          } else {
            this.lastSelectDay = tar
            this.$set(tar, 'end', true)
            this.mIndexBegin = this.months.findIndex(v => v.year === this.firstSelectDay.year && v.month === this.firstSelectDay.month)
            this.mIndexEnd = this.months.findIndex(v => v.year === tar.year && v.month === tar.month)
            if (this.mIndexBegin > -1 && this.mIndexEnd > -1) {
              for (let i = this.mIndexBegin; i <= this.mIndexEnd; i++) {
                this.months[i].days.map(day => {
                  if (day.day > this.firstSelectDay.day && day.day < tar.day)
                    this.$set(day, 'active', true)
                })
              }
            }
          }
      }
    },
    getTimestamp(tar) {
      return new Date(tar.year, tar.month - 1, tar.day).getTime()
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
          width: 100 / 7vw;
          height: 70px;
          &.disable{
            color: #eee;
          }
          &.select{
            color: white;
            background-color: deepskyblue;
          }
          &.active{
            background-color: lightblue;
          }
          span{
            font-size: 12px;
            &.number{
              font-size: 14px;
            }
          }
        }
      }
    }
  }
}
</style>

