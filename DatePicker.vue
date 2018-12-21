<template>
  <section class="wrap" @click.self="$emit('cancel')" :class="{hide: !display}">
    <div class="content">
      <header>
        <a class="left" @click="$emit('cancel')">取消</a>
        <strong>选择日期</strong>
        <a v-if="!autoComplete" class="right" @click="confirm">确认</a>
      </header>
      <div class="week-text">
        <span v-for="(text, i) in weekTexts"
          :key="i"
          :style="{color: mondayFirst
            ? i == 5 || i == 6 ? 'tomato' : ''
            : i == 0 || i == 6 ? 'tomato' : ''}">{{text}}</span>
      </div>
      <main ref="layout">
        <section class="aki-month" v-for="(item, i) in months" :key="i"
          :data-uct="new Date(item.year, Number(item.month)-1)"
          :data-year="item.year"
          :data-month="item.month">
          <header>{{item.year}}年 {{item.month}}月</header>
          <div class="day-wrap">
            <div class="day"
              v-for="(day, j) in item.days" :key="j"
              :style="{'background-color': day.custom.bgcolor,
                       'border-color': day.custom.bdcolor}"
              :class="{'disabled': day.disabled, 'active': day.active, 'select': day.begin || day.end}"
              @click="selectOne(day)">
              <span>{{day.begin ? beginningText : day.end ? endText: '&nbsp;'}}</span>
              <span class="number" :class="{restday: day.restday, rest: day.rest, workday: day.workday}">{{day.text}}</span>
              <span :class="{rest: day.custom.highlight}">{{day.custom.text||'&nbsp;'}}</span>
            </div>
          </div>
        </section>
      </main>
    </div>
  </section>
</template>

<script>
class DateHelper {
  constructor(str = Date.now()) {
    this.Date = new Date(str)
  }
  get year() {
    return this.Date.getFullYear()
  }
  get month() {
    const m = this.Date.getMonth() + 1
    return m < 10 ? `0${m}` : m
  }
  get day() {
    const d = this.Date.getDate()
    return d < 10 ? `0${d}` : d
  }
  get time() {
    return this.Date.getTime()
  }
  get date() {
    return `${this.year}-${this.month}-${this.day}`
  }
}
export default {
  props: {
    // 单选
    single: {
      type: Boolean,
      default() { return false }
    },
    // 自动完成
    autoComplete: {
      type: Boolean,
      default() { return false }
    },
    // 显示状态
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
      default() { return new DateHelper().date }
    },
    // 可选择的开始日期
    selectRangeStart: {
      type: String,
      default() { return new DateHelper().date }
    },
    // 可选择的结束日期
    selectRangeEnd: {
      type: String,
      default() { return '9999-12-31' }
    },
    // 自定义数据
    custom: {
      type: Array,
      default() { return [] }
    },
    // 选择开头自定义文本
    beginningText: {
      type: String,
      default() { return '入住' }
    },
    // 选择末尾自定义文本
    endText: {
      type: String,
      default() { return '离店' }
    },
    initPosition: {
      type: String,
      default() { return new DateHelper().date }
    }
  },
  data() {
    return {
      months: [],
      firstTime: true,
      firstSelectDay: {},
      lastSelectDay: {},
      rangeList: [],
      customIndex: 0,
      range: [],
      doms: [],
      observer: null,
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
    },
    seEnd() {
      let date
      switch (this.selectRangeEnd) {
      case 'today':
        date = new DateHelper().date
        break
      case '':
        date = '9999-12-31'
        break
      default:
        date = this.selectRangeEnd
        break
      }
      return date
    }
  },
  watch: {
    restday() {
      const vm = this
      if (this.restday.length) {
        this.deconstruction((date) => {
          this.restday.forEach(restday => {
            const restdate = new Date(restday)
            const [y, m, d] = [restdate.getFullYear(), restdate.getMonth() + 1, restdate.getDate()]
            if (y === date.year && m === date.month && d === date.day) {
              vm.$set(date, 'rest', true)
              vm.$set(date, 'restday', true)
            }
          })
        })
      }
    },
    workday() {
      const vm = this
      if (this.workday.length) {
        this.deconstruction((date) => {
          this.workday.forEach(workday => {
            const workdate = new Date(workday)
            const [y, m, d] = [workdate.getFullYear(), workdate.getMonth() + 1, workdate.getDate()]
            if (y === date.year && m === date.month && d === date.day) {
              vm.$set(date, 'rest', false)
              vm.$set(date, 'workday', true)
            }
          })
        })
      }
    },
    custom() {
      this.setcustom()
    },
    months() {
      this.doms = Array.from(document.querySelectorAll('.aki-month'))
    },
    display(show) {
      if (show) this.doms.forEach(dom => this.observer.observe(dom))
    },
    displayRangeStart() {
      this.constructionBody()
    },
    selectRangeStart() {
      this.constructionBody()
    },
  },
  created() {
    this.constructionBody()
  },
  mounted() {
    // 设置scrollTop，使其初始进来就定位到想要的位置，而不是显示列表的头部
    const [dY, dS] = this.displayRangeStart.split('-').map(Number)
    const [pY, pS] = this.initPosition.split('-').map(Number)
    let index = 0
    index += pS > dS ? (pY - dY) * 12 : (pY - dY - 1) * 12
    index += pS - dS
    let top = 0
    if (index > this.$refs.layout.children.length) index = this.$refs.layout.children.length
    for (let i = 0; i < index; i++) {
      top += this.$refs.layout.children[i].offsetHeight
    }
    this.$refs.layout.scrollTop = top
  },
  methods: {
    selectOne(tar) {
      // 点击1号之前的空白区域
      if (!tar.text) { return false }
      // 点击禁用的
      const { disabled, custom } = tar
      if (disabled) { return false }
      // 点击自定义禁用的，能够捕获事件
      if (custom && custom.disabled && this.firstTime) {
        this.$emit('selectDisabled', tar)
        return false
      }
      if (this.single) {
        this.$emit('click', tar)
        this.$set(this.lastSelectDay, 'begin', false)
        // 选中当前
        this.firstSelectDay = tar
        this.$set(tar, 'begin', true)
        // 记录第一次值
        this.lastSelectDay = this.firstSelectDay
        if (this.autoComplete) this.confirm()
      } else {
        // 第一次点击
        if (this.firstTime) {
          this.$emit('click', tar, true)
          this.$emit('clickStart', tar)
          this.firstTime = false // 设置下一次点击为第二次
          // 清空之前选择
          if (this.mIndexBegin > -1 && this.mIndexEnd > -1) {
            for (let i = this.mIndexBegin; i <= this.mIndexEnd; i++) {
              this.months[i].days.forEach(day => {
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
          // 点击当天的取消选择
          if (this.getTimestamp(tar) === this.getTimestamp(this.firstSelectDay)) {
            this.firstTime = true
            this.$emit('click', { target: tar, start: false })
            this.$set(tar, 'begin', false)
            this.firstSelectDay = {}
            return false
          }
          // 在第一次点击之前
          if (this.getTimestamp(tar) < this.getTimestamp(this.firstSelectDay)) {
            this.firstTime = true
            // 可以反选
            if (this.reverseSelect) {
              this.$emit('click', { target: tar, start: false })
              this.$emit('clickEnd', tar)
              // 记录第一次值
              const F = this.firstSelectDay
              // 交换值
              this.lastSelectDay = F
              this.firstSelectDay = tar
              // 将中间日期设为被选状态
              this.chooseRange()
                .then(({ range, activeDays }) => {
                  this.firstTime = true
                  // 取消上一次选中
                  this.$set(F, 'begin', false)
                  // 按交换后的值设置开头和结尾
                  this.$set(this.firstSelectDay, 'begin', true)
                  this.$set(this.lastSelectDay, 'end', true)
                  activeDays.forEach(date => this.$set(date, 'active', true))
                  this.range = range
                  if (this.autoComplete) this.confirm()
                })
                .catch(date => {
                  this.firstTime = false
                  // 初始点击逻辑值，使下次点击重新判断是否反选
                  this.firstSelectDay = F
                  this.lastSelectDay = {}
                  this.$emit('selectDisabled', date)
                })
            } else {
              // 将下一次点击设为第二次
              this.firstTime = false
              if (custom && custom.disabled) {
                this.$emit('selectDisabled', tar)
                return
              }
              this.$emit('click', { target: tar, start: true })
              this.$emit('clickStart', tar)
              // 取消上一次选中
              this.$set(this.firstSelectDay, 'begin', false)
              // 选中本次点击
              this.$set(tar, 'begin', true)
              this.firstSelectDay = tar
            }
          } else {
            this.$emit('click', { target: tar, start: false })
            this.$emit('clickEnd', tar)
            // 选中当前日期作为结尾
            this.lastSelectDay = tar
            // 将中间日期设为被选状态
            this.chooseRange()
              .then(({ range, activeDays }) => {
                this.firstTime = true
                this.$set(tar, 'end', true)
                activeDays.forEach(date => this.$set(date, 'active', true))
                this.range = range
                if (this.autoComplete) this.confirm()
              })
              .catch(date => {
                this.firstTime = false
                this.$emit('selectDisabled', date)
              })
          }
        }
      }
    },
    getTimestamp(tar) {
      return new Date(tar.year, tar.month - 1, tar.day).getTime()
    },
    chooseRange() {
      return new Promise((resolve, reject) => {
        if (this.mIndexBegin > -1 && this.mIndexEnd > -1) {
          let range = []
          const activeDays = []
          for (let i = this.mIndexBegin; i <= this.mIndexEnd; i++) {
            range = range.concat(this.months[i].days.filter(date => {
              if (this.getTimestamp(date) > this.getTimestamp(this.firstSelectDay)
                && this.getTimestamp(date) < this.getTimestamp(this.lastSelectDay)) {
                if (date.custom && date.custom.disabled) {
                  reject(date)
                } else {
                  activeDays.push(date) // 不直接设置为激活状态，先存起来，交由外部处理。如果没有disabled才设置
                  return date
                }
              }
            }))
          }
          resolve({ range, activeDays })
        } else {
          resolve(new Array())
        }
      })
    },
    confirm() {
      this.$emit('select', { start: this.firstSelectDay, end: this.lastSelectDay, range: this.range })
    },
    deconstruction(callback) {
      this.months.forEach(month => {
        month.days.forEach(date => {
          callback(date)
        })
      })
    },
    setcustom() {
      // 自定义数据
      let days = []
      if (this.custom.length) {
        // 将months里的days连接成一个普通的一维数组
        this.months.forEach(v => days = days.concat(v.days))
        // 从记录的index位置开始遍历日期，从0开始遍历自定义数组
        for (let i = this.customIndex, j = 0; j < this.custom.length; i++) {
          const v = days[i]
          const data = this.custom[j] || ''
          // 跳过1号之前的
          if (v.text) {
            j++
            const type = typeof data
            if (type === 'string') this.$set(v, 'custom', { text: data })
            else if (type === 'object') this.$set(v, 'custom', data)
            else throw `custom数组每项的类型应该是String或Object，但是得到的是${type}`
          }
        }
      } else {
        this.months.forEach(v => days = days.concat(v.days))
        for (let i = this.customIndex, j = 0; j < this.lastTime; i++) {
          const v = days[i]
          const data = this.custom[j] || ''
          // 跳过1号之前的
          if (v.text) {
            j++
            const type = typeof data
            if (type === 'string') this.$set(v, 'custom', { text: data })
            else if (type === 'object') this.$set(v, 'custom', data)
            else throw `custom数组每项的类型应该是String或Object，但是得到的是${type}`
          }
        }
      }
      this.lastTime = this.custom.length
    },
    setData(data, date) {
      const [Y, M, D] = new DateHelper(date).date.split('-').map(Number)
      let target
      this.months.some(item => {
        target = item.days.filter(({ year, month, day }) => year === Y && month === M && day === D)
        return target.length > 0
      })
      if (target.length) {
        for (const key in data) {
          if (data.hasOwnProperty(key)) {
            const value = data[key]
            this.$set(target[0].custom, key, value)
          }
        }
      } else {
        throw `Date format error.Got "${date}".It's should be like "YYYY-MM-DD".`
      }
    },
    constructionBody() {
      const months = []
      let customIndex = 0
      let [Y, M] = this.displayRangeStart.split('-').map(Number)
      let [year, month] = [Y, M]
      // 循环出月份
      for (let i = 0; i < this.displayRange; i++) {
        // 每满 13月
        if (M + i > 12) {
          M -= 12 // 月份从1开始
          year = ++Y // 进 1年
        }
        month = M + i
        const days = [] // 每一天的数据对象会放入该数组
        // 通过占位把 1号排到实际的星期位置
        // 默认周日开头情况下，今天是星期几，就需要几个占位符
        // 周日为 0，不用处理
        let placeholder = new Date(year, month - 1, 1).getDay()
        // 如果是周一开头，把占位符往前移一天
        // 周日为 0，需处理成 7-1
        if (this.mondayFirst) placeholder = placeholder === 0 ? 6 : placeholder - 1
        for (let j = 0; j < placeholder; j++) {
          customIndex++
          days.push({ custom: {} })
        }
        // 得到当月总天数
        const daySum = new Date(year, month, 0).getDate()
        // 循环出每一天
        for (let day = 1; day <= daySum; day++) {
          const obj = {} // 存放的数据将会在 template中用到
          obj.custom = {}
          obj.year = year
          obj.month = month
          obj.day = day
          obj.date = `${year}-${month}-${day}`
          obj.odate = `${year}-${ month > 9 ? month : '0' + month}-${ day > 9 ? day : '0' + day}` // 补0的日期格式
          // 显示“今天”或者几号
          obj.text = year === this.$date.year && month === this.$date.month && day === this.$date.day ? '今天' : day
          // 获取星期几，判断周末
          const weekday = new Date(year, month - 1, day).getDay()
          const weekend = weekday === 6 || weekday === 0
          // 判断是否禁用状态
          // 同时在非禁用状态下，才处理周末
          const sTime = new DateHelper(this.selectRangeStart).time
          const currentTime = new DateHelper(obj.date).time
          const eTime = new DateHelper(this.seEnd).time
          if (currentTime - sTime < 0 || eTime - currentTime < 0) obj.disabled = true
          else obj.rest = weekend
          if (currentTime === sTime) this.customIndex = customIndex
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
      this.months = months
      this.setcustom()
      try {
        this.observer = new IntersectionObserver(entries => {
          entries.forEach(entry => {
            if (entry.intersectionRatio <= 0) return false
            const { year, month, uct } = entry.target.dataset
            this.$emit('viewport', { year, month, uct, date: new DateHelper(`${year}-${month}-1`).date })
          })
        })
      } catch (error) {
        throw error
      }
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
  z-index: 8;
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
      font-size: 14px;
      cursor: pointer;
      &.left{
        left: 10px;
      }
      &.right{
        right: 10px;
      }
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
    .aki-month{
      >header{
        position: -webkit-sticky;
        position: sticky;
        top: 0;
        padding: 5px;
        background-color: #eee;
        z-index: 1;
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
          box-shadow: inset 0 0 2px 2px white;
          box-sizing: border-box;
          border: solid 1px #fff;
          transition: all .3s;
          &.disabled{
            color: #eee;
            >span{
              color: #eee!important;
            }
          }
          &.select{
            color: white;
            background-color: deepskyblue;
            box-shadow: none;
            >span{
              color: white!important;
            }
          }
          &.active{
            background-color: lightblue;
            box-shadow: none;
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

