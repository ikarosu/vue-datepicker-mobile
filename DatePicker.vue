<script>
const INIT_LENGTH = 7
const RENDER_COUNT = 3
export default {
  name: 'AkiDate',
  props: {
    weekTexts: {
      type: Array,
      default: () => ['一', '二', '三', '四', '五', '六', '日']
    },
    // 初始日期
    initDate: {
      type: String,
      default: Date.today().toYMD()
    },
    // 自定义数据
    custom: {
      type: [Object, Array],
      default() {
        return {}
      }
    },
    startText: {
      type: String,
      default: '入住'
    },
    endText: {
      type: String,
      default: '离店'
    },
    cancelText: {
      type: String,
      default: '取消'
    },
    confirmText: {
      type: String,
      default: '确认'
    },
    single: {
      type: Boolean,
      default: false
    },
    mondayFirst: {
      type: Boolean,
      default: true
    },
    visible: {
      type: Boolean,
      default: false
    },
    selected: {
      type: Array,
      default() {
        return []
      }
    },
    selectArea: {
      type: Array,
      default() { return [] }
    }
  },
  computed: {
    initDisplay() {
      return new Date(this.initDate)
    },
    initIndex() {
      return this.renderDate.findIndex(
        ({ date }) => date.toYM() === this.initDisplay.toYM()
      )
    },
    allDays() {
      return this.renderDate.reduce((a, b) => a.concat(b.days), [])
    },
    customMode() {
      const customKeys = Object.keys(this.customComputed)
      return customKeys.length === 1 && customKeys[0].length > 7 ? 0 : 1
    },
    todayYMD() {
      return Date.today().toYMD()
    },
    customComputed() {
      return this.custom instanceof Array ? { [this.todayYMD]: this.custom } : this.custom
    }
  },
  watch: {
    mondayFirst: {
      immediate: true,
      handler(v) {
        if (v) this.weekTextsData = this.weekTexts.concat([])
        else this.weekTextsData.unshift(this.weekTextsData.splice(-1, 1)[0])
      }
    },
    async 'renderDate.length'() {
      await this.$nextTick()
      // 监听滚动
      Array.from(this.$refs['date-body'].children)
        .filter(
          d =>
            d.classList.contains('aki-date-month-header') && d.dataset.obs !== 'true'
        )
        .forEach(d => {
          this.observer.observe(d)
          d.dataset.obs = 'true'
        })
    },
    custom() {
      this.customIndex = 0
    }
  },
  data() {
    return {
      renderDate: [],
      value: {
        start: undefined,
        range: [],
        end: undefined
      },
      weekTextsData: this.weekTexts.concat([]),
      observer: null,
      customIndex: 0,
    }
  },
  created() {
    for (let i = 1 - INIT_LENGTH; i < INIT_LENGTH; i++) {
      const date = this.initDisplay.clone().addMonths(i)
      this.renderDate.push({
        date,
        days: this.initDays(date)
      })
    }
    // 监听滚动
    this.observer = new IntersectionObserver(entries => {
      entries.forEach(async entry => {
        const ym = entry.target.YM
        if (!this.visible) return
        if (entry.intersectionRatio <= 0) {
          if (this.allDays[0].data.disabled) return
          if (this.renderDate[2].date.toYM() === new Date(ym).toYM()) {
            for (let i = 1; i <= RENDER_COUNT; i++) {
              const date = this.renderDate[0].date.clone().addMonths(-1)
              this.renderDate.unshift({
                date,
                days: this.initDays(date)
              })
            }
            this.setScrollTop()
          }
        } else {
          this.$emit('viewport', this.renderDate.find(({ date }) => date.toYM() === ym))
          if (this.allDays[this.allDays.length - 1].data.disabled) return
          const last = this.renderDate[this.renderDate.length - 1]
          if (last.date.toYM() === new Date(ym).toYM()) {
            for (let i = 1; i <= RENDER_COUNT; i++) {
              const date = last.date.clone().addMonths(i)
              this.renderDate.push({
                date: date,
                days: this.initDays(date)
              })
            }
          }
        }
      })
    })
    this.$watch(
      'selected',
      async function([start, end]) {
        await this.$nextTick()
        if (start && end) {
          this.selectOne(start)
          this.selectOne(end)
        } else if (start) {
          this.selectOne(start)
        } else if (end) {
          this.selectOne(end)
          this.selectOne(end)
        }
      },
      { immediate: true, deep: true }
    )
  },
  mounted() {
    // 设置初始位置
    const wrap = this.$refs['date-body']
    for (let i = 0; i < this.initIndex * 2; i++) {
      wrap.scrollTop += wrap.children[i].offsetHeight
    }
  },
  methods: {
    initDays(date) {
      const maxDay = date.getDateLength()
      return Array.apply(null, { length: maxDay }).map((_, index) => {
        const today = date.clone()
        today.setDate(index + 1)
        return {
          data: { custom: { info: '' } },
          date: today
        }
      })
    },
    async setScrollTop() {
      await this.$nextTick()
      const wrap = this.$refs['date-body']
      let top = wrap.scrollTop
      for (let i = 0; i < RENDER_COUNT * 2; i++) {
        top += wrap.children[i].offsetHeight
      }
      setTimeout(() => {
        wrap.scrollTo(0, top)
      }, 80)
    },
    selectOne(ymd) {
      const selectDay = new Date(ymd)
      // data
      const dataMonth = this.renderDate.find(
        ({ date }) => date.toYM() === selectDay.toYM()
      )
      const dataDay = dataMonth.days.find(
        ({ date }) => date.toYMD() === selectDay.toYMD()
      )
      if (dataDay.data.disabled) return false
      if (dataDay.data.custom.disabled) {
        this.$emit('disable', dataDay)
        return
      }
      if (this.single) {
        if (this.value.start)
          this.$set(this.value.start.data, 'boundary', undefined)
        this.$set(dataDay.data, 'boundary', 'start')
        this.value.start = dataDay
      }
      else
      if (this.value.start && this.value.end) {
        // 已选中开头和结尾
        // 清空上次选择
        this.$set(this.value.start.data, 'boundary', undefined)
        this.$set(this.value.end.data, 'boundary', undefined)
        this.value.end = undefined
        this.value.range.forEach(({ data }) => this.$set(data, 'range', false))
        this.value.range = []
        // 选中本次
        this.$set(dataDay.data, 'boundary', 'start')
        this.value.start = dataDay
      } else if (this.value.start) {
        // 只选了开头，本次是第二次
        // 二选日期小于一选日期
        if (dataDay.date.getTime() < this.value.start.date.getTime()) {
          // 则交换
          // 原来的start变为end
          this.$set(this.value.start.data, 'boundary', 'end')
          this.value.end = this.value.start
          // 本次设为start
          this.$set(dataDay.data, 'boundary', 'start')
          this.value.start = dataDay
        } else {
          this.$set(dataDay.data, 'boundary', 'end')
          this.value.end = dataDay
        }
        // 处理选中的中间区域
        const startDate = this.value.start.date
        const endDate = this.value.end.date
        const startIndex = this.allDays.findIndex(({ date }) =>
          Date.equals(date, startDate)
        )
        const endIndex = this.allDays.findIndex(({ date }) =>
          Date.equals(date, endDate)
        )
        const rangeDays = this.allDays.slice(startIndex + 1, endIndex)
        const disabledDay = rangeDays.find(({ data }) => data.custom.disabled)
        if (disabledDay) {
          this.$emit('disable', disabledDay)
          this.$set(this.value.end.data, 'boundary', undefined)
          this.value.end = undefined
          return
        } else {
          rangeDays.forEach(day => {
            this.value.range.push(day)
            this.$set(day.data, 'range', true)
          })
        }
      } else {
        // 没选（初始状态）
        this.$set(dataDay.data, 'boundary', 'start')
        this.value.start = dataDay
      }
      return true
    },
    selectHandler(e) {
      e.preventDefault()
      const dayDOM = e.currentTarget
      if (this.selectOne(dayDOM.dataset.date)) this.$emit('select', this.value)
    }
  },
  render(h) {
    const vm = this
    return h(
      'section',
      { class: ['aki-date', { 'aki-date-visible': this.visible }] },
      [
        h('header', { class: 'aki-date-header' }, [
          h('div', { class: 'aki-date-header-action' }, [
            h(
              'button',
              {
                on: {
                  click() {
                    vm.$emit('cancel')
                  }
                }
              },
              vm.cancelText
            ),
            h(
              'button',
              {
                on: {
                  click() {
                    vm.$emit('confirm', vm.value)
                  }
                }
              },
              vm.confirmText
            )
          ]),
          h(
            'div',
            { class: 'aki-date-header-week' },
            vm.weekTextsData.map((w, index) => {
              const weekend = vm.mondayFirst ? [5, 6] : [0, 6]
              return h('span', { class: { 'rest': weekend.includes(index) } }, w)
            })
          )
        ]),
        h(
          'div',
          { class: 'aki-date-body', ref: 'date-body' },
          this.renderDate.map(({ date, days }) => {
            const maxDay = date.getDateLength()
            const daysDOM = Array.apply(null, { length: maxDay }).map(
              (_, index) => {
                const today = date.clone()
                today.setDate(index + 1)
                const currentDate = days[index]
                if (this.customMode) {
                  const custom = vm.custom[date.toYM()] || []
                  const optionDay = custom[index] || {}
                  for (const key in optionDay) {
                    if (optionDay.hasOwnProperty(key)) {
                      const element = optionDay[key]
                      currentDate.data.custom[key] = element
                    }
                  }
                } else {
                  const key = Object.keys(this.customComputed)[0]
                  const start = new Date(key)
                  if (Date.compare(today, start) > -1 && this.customIndex < Infinity) {
                    currentDate.data.custom = this.customComputed[key][this.customIndex++]
                    if (this.customIndex === this.customComputed[key].length) this.customIndex = Infinity
                  }
                }
                // 禁用区域
                const [start, end] = this.selectArea
                if (start) {
                  const date = new Date(start)
                  currentDate.data.disabled = Date.compare(today, date) < 0
                }
                if (end) {
                  const date = new Date(end)
                  currentDate.data.disabled = Date.compare(today, date) > 0
                }
                const { boundary, range, disabled } = currentDate.data
                const customDay = currentDate.data.custom
                const info = customDay.info || ''
                const texts = typeof info === 'string' ? [{ text: info }] : info instanceof Array ? info || [{}] : [info]
                const rest = today.isWeekend()
                return h(
                  'div',
                  {
                    class: [
                      'aki-date-month-day',
                      { 'aki-date-month-day-boundary': boundary },
                      { 'aki-date-month-day-range': range },
                      { 'aki-date-month-day-disabled': disabled }
                    ],
                    style: { 'background-color': customDay.bgc, 'color': customDay.color },
                    attrs: {
                      'data-date': today.toYMD()
                    },
                    on: {
                      click: vm.selectHandler
                    }
                  },
                  [
                    h('p', {
                      class: 'tip',
                      domProps: {
                        innerHTML:
                          boundary === 'start'
                            ? vm.startText
                            : boundary === 'end'
                              ? vm.endText
                              : '&nbsp;'
                      }
                    }),
                    h('p', { class: ['aki-date-month-day-number', { 'rest': rest, 'disabled': disabled }], style: { 'color': customDay.color } }, Date.equalsDay(today, Date.today()) ? '今天' : index + 1),
                    ...texts.map(t =>
                      h('p', { style: { color: t.color } }, t.text || t)
                    )
                  ]
                )
              }
            )
            let min, max
            if (this.mondayFirst) {
              min = 1
              max = date.getWeekAsFirstDay()
            } else {
              min = 0
              max = date.getWeekAsFirstDay() === 7 ? 0 : date.getWeekAsFirstDay()
            }
            for (let i = min; i < max; i++) {
              daysDOM.unshift(
                h('div', { class: 'aki-date-month-day' }, [h('p', ' ')])
              )
            }
            return [
              h(
                'div',
                {
                  class: 'aki-date-month-header',
                  domProps: { YM: date.toYM() }
                },
                date.toYM()
              ),
              h(
                'div',
                {
                  class: 'aki-date-month-body',
                  attrs: { 'data-date': date.toYM() }
                },
                daysDOM
              )
            ]
          })
        )
      ]
    )
  }
}
</script>

<style scoped>
@import './style.css'
</style>
