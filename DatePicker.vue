<script>
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
      default() {
        return []
      }
    },
    initLength: {
      type: Number,
      default: 6
    },
    loadLength: {
      type: Number,
      default: 6
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
      last: {
        start: undefined,
        range: [],
        end: undefined
      }
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
      return this.custom instanceof Array
        ? { [this.todayYMD]: this.custom }
        : this.custom
    },
    rangeDays() {
      if (!this.value.start || !this.value.end) return []
      // 处理选中的中间区域
      const startDate = this.value.start.date
      const endDate = this.value.end.date
      const startIndex = this.allDays.findIndex(({ date }) =>
        Date.equals(date, startDate)
      )
      const endIndex = this.allDays.findIndex(({ date }) =>
        Date.equals(date, endDate)
      )
      return this.allDays.slice(startIndex + 1, endIndex)
    }
  },
  watch: {
    selected: {
      immediate: true,
      deep: true,
      async handler([start, end]) {
        await this.$nextTick()
        if (start) {
          if (this.selectArea[0] && Date.compare(new Date(start), new Date(this.selectArea[0])) < 0) return this.$emit('disable', { date: new Date(start) })
          const day = this.allDays.find(day => Date.equalsDay(day.date, new Date(start)))
          if (day) {
            if (day.data.custom.disabled) return this.$emit('disable', day)
            if (this.value.start && this.value.start.date.toYMD() !== start)
              this.$set(this.value.start.data, 'boundary', undefined)
            this.value.start = this.allDays.find(
              day => day.date.toYMD() === start
            )
          } else {
            throw 'Props "selected" value not yet render.'
          }
        }
        if (end && !this.single) {
          if (this.selectArea[1] && Date.compare(new Date(end), new Date(this.selectArea[1])) > 0) return this.$emit('disable', { date: new Date(end) })
          const day = this.allDays.find(day => Date.equalsDay(day.date, new Date(end)))
          if (day) {
            if (day.data.custom.disabled) return this.$emit('disable', day)
            if (this.value.end && this.value.end.date.toYMD() !== end)
              this.$set(this.value.end.data, 'boundary', undefined)
            this.value.end = this.allDays.find(day => day.date.toYMD() === end)
          } else {
            throw 'Props "selected" value not yet render.'
          }
        }
      }
    },
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
            d.classList.contains('aki-date-month-header') &&
            d.dataset.obs !== 'true'
        )
        .forEach(d => {
          this.observer.observe(d)
          d.dataset.obs = 'true'
        })
    },
    'value.start'(v) {
      if (!v) return
      if (this.value.end) {
        this.cleanLastStyle()
        this.$set(this.value.start.data, 'boundary', undefined)
        if (Date.compare(v.date, this.value.end.date) < 0)
          this.$set(v.data, 'boundary', 'start')
        else {
          this.value.start = this.value.end
          this.value.end = v
          this.$set(v.data, 'boundary', 'start')
        }
      } else this.$set(v.data, 'boundary', 'start')
    },
    'value.end'(v) {
      if (!v) return
      if (this.value.start) {
        this.cleanLastStyle()
        this.$set(this.value.end.data, 'boundary', undefined)
        if (Date.compare(this.value.start.date, v.date) < 0)
          this.$set(v.data, 'boundary', 'end')
        else {
          this.value.end = this.value.start
          this.value.start = v
        }
        const disabledDay = this.rangeDays.find(
          ({ data }) => data.custom.disabled
        )
        if (disabledDay) {
          this.$emit('disable', disabledDay)
          this.value.end = undefined
        }
      } else {
        this.value.start = v
        this.$set(v.data, 'boundary', 'end')
      }
    },
    rangeDays(arr) {
      if (arr.length < 1)
        this.value.range.forEach(day => this.$set(day.data, 'range', false))
      else arr.forEach(day => this.$set(day.data, 'range', true))
      this.last.range = this.value.range = arr
      arr.forEach(day => {
        this.$set(day.data, 'range', true)
      })
    },
  },
  created() {
    for (let i = 1 - (this.initLength + 1); i < this.initLength + 1; i++) {
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
            for (let i = 1; i <= this.loadLength; i++) {
              const date = this.renderDate[0].date.clone().addMonths(-1)
              this.renderDate.unshift({
                date,
                days: this.initDays(date)
              })
            }
            this.setScrollTop()
          }
        } else {
          this.$emit(
            'viewport',
            this.renderDate.find(({ date }) => date.toYM() === ym)
          )
          if (this.allDays[this.allDays.length - 1].data.disabled) return
          const last = this.renderDate[this.renderDate.length - 1]
          if (last.date.toYM() === new Date(ym).toYM()) {
            for (let i = 1; i <= this.loadLength; i++) {
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
  },
  mounted() {
    // 设置初始位置
    const wrap = this.$refs['date-body']
    for (let i = 0; i < this.initIndex * 2; i++) {
      wrap.scrollTop += wrap.children[i].offsetHeight
    }
  },
  methods: {
    cleanLastStyle() {
      this.value.range.forEach(({ data }) => this.$set(data, 'range', false))
    },
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
      for (let i = 0; i < this.loadLength * 2; i++) {
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
        if (this.value.start) this.$set(this.value.start.data, 'boundary', undefined)
        this.value.start = dataDay
      } else {
        const { start, end } = this.value
        if (start && end) {
          if (!Date.equalsDay(start.date, dataDay.date)) {
            this.$set(this.value.start.data, 'boundary', undefined)
            this.value.start = dataDay
          }
          this.$set(this.value.end.data, 'boundary', undefined)
          this.value.end = undefined
        } else if (start) {
          this.value.end = dataDay
        } else {
          this.value.start = dataDay
        }
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
    let customIndex = 0
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
              return h('span', { class: { rest: weekend.includes(index) } }, w)
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
                  const data = this.customComputed[key]
                  const start = new Date(key)
                  if (
                    Date.compare(today, start) > -1 &&
                    customIndex < Infinity &&
                    data.length > 0
                  ) {
                    currentDate.data.custom = data[customIndex++]
                    if (customIndex === data.length)
                      customIndex = Infinity
                  }
                }
                // 禁用区域
                const [start, end] = this.selectArea
                if (start) {
                  const date = new Date(start)
                  if (Date.compare(today, date) < 0) days[index].data.disabled = true
                }
                if (end) {
                  const date = new Date(end)
                  if (Date.compare(today, date) > 0) days[index].data.disabled = true
                }
                const { boundary, range, disabled } = currentDate.data
                const customDay = currentDate.data.custom
                const info = customDay.info || ''
                const texts =
                  typeof info === 'string'
                    ? [{ text: info }]
                    : info instanceof Array
                      ? info || [{}]
                      : [info]
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
                    style: {
                      'background-color': customDay.bgc,
                      color: customDay.color
                    },
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
                    h(
                      'p',
                      {
                        class: [
                          'aki-date-month-day-number',
                          { rest: rest, disabled: disabled }
                        ],
                        style: { color: customDay.color }
                      },
                      Date.equalsDay(today, Date.today()) ? '今天' : index + 1
                    ),
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
              max =
                date.getWeekAsFirstDay() === 7 ? 0 : date.getWeekAsFirstDay()
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
@import "./style.css";
</style>
