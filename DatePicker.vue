<script>
const INIT_LENGTH = 7
export default {
  name: 'AkiDate',
  props: {
    weekTexts: {
      type: Array,
      default: () => ['一', '二', '三', '四', '五', '六', '日']
    },
    initDate: {
      type: String,
      default: Date.today().toYMD()
    },
    custom: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  computed: {
    initDisplay() {
      return new Date(this.initDate)
    },
    initIndex() {
      return this.insertedDate.findIndex(
        month => month.toYM() === this.initDisplay.toYM()
      )
    }
  },
  watch: {},
  data() {
    return {
      // days: 31,
      // months: 12,
      insertedDate: []
    }
  },
  created() {
    for (let i = 1 - INIT_LENGTH; i < INIT_LENGTH; i++) {
      this.insertedDate.push(this.initDisplay.clone().addMonths(i))
    }
  },
  mounted() {
    let top = 0
    const wrap = this.$refs['date-body']
    console.dir(wrap)
    for (let i = 0; i < this.initIndex * 2; i++) {
      top += wrap.children[i].offsetHeight
    }
    wrap.scrollTop = top
  },
  render(h) {
    const vm = this
    return h('section', { class: 'aki-date' }, [
      h('header', { class: 'aki-date-header' }, [
        h('div', { class: 'aki-date-header-action' }, [
          h('button', '取消'),
          h('button', '确认')
        ]),
        h(
          'div',
          { class: 'aki-date-header-week' },
          this.weekTexts.map(w => h('span', w))
        )
      ]),
      h(
        'div',
        { class: 'aki-date-body', ref: 'date-body' },
        this.insertedDate.map(month => [
          h('div', { class: 'aki-date-month-header' }, month.toYM()),
          h(
            'div',
            { class: 'aki-date-month-body' },
            (function() {
              const maxDay = month.getDateLength()
              const custom = vm.custom[month.toYM()] || []
              const days = Array.apply(null, { length: maxDay }).map(
                (_, index) => {
                  const optionDay = custom[index] || {}
                  const info = optionDay.info || []
                  const data = typeof info === 'string' ? [{ text: info }] : info
                  return h(
                    'div',
                    {
                      class: 'aki-date-month-day',
                      style: { 'background-color': optionDay.bgc }
                    },
                    [
                      h('p', index + 1),
                      ...data.map(t =>
                        h('p', { style: { color: t.color } }, t.text)
                      )
                    ]
                  )
                }
              )
              for (let i = 1; i < month.getWeekAsFirstDay(); i++) {
                days.unshift(
                  h('div', { class: 'aki-date-month-day' }, [h('p', ' ')])
                )
              }
              return days
            })()
          )
        ])
      )
    ])
  }
}
</script>

<style lang="sass" scoped>
@import './style.scss'
</style>
