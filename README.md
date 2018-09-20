# vue-datepicker-mobile
[中文版](/doc/zh-hans.md)
Sorry for my English.
A calendar friendly for mobile, which can select the date by the range, friendly for mobile.It is typically used for hotel. 

![e.g.](https://github.com/ikarosu/vue-datepicker-mobile/blob/master/git/eg.png?raw=true)
[Live Demo](https://ikarosu.github.io/datepicker/)
![demo qr](https://github.com/ikarosu/vue-datepicker-mobile/blob/master/git/qr.png?raw=true)

## Attr

| param | description | type | defalut |
| :-: | :- | :-: | :-: |
| single | select single date.default select a range. | boolean | false |
| autoComplete |  After choosing the date whether to auto-complete, if false, it will show confirm button. | boolean | false |
| mondayFirst | Whether Monday is the first-day as a week, default for Sunday. | boolean | false |
| reverseSelect | Whether allow reverse choose date. | boolean | false |
| beginningText | text of beginning for selected | string | '入住' |
| endText | text of end for selected | string | '离店' |

## Prop
| param | description | type | defalut |
| :-: | :- | :-: | :-: |
| display | display state, show or hide datepicker window. | boolean | false |
| displayRange | unit is month | number | 13 |
| displayRangeStart | display start month.default is this month. e.g. `'2018-9-1'` | string | - |
| selectRangeStart | can choose start date.default is today. | string | - |
| selectRangeEnd |can choose the end date. default show the end. | string | - |
| restday | custom restday.default highlight display and show chinese "休".e.g. `['2019.5.1', '2019.5.2', '2019.5.3']` | array | - |
| workday | custom restday.default highlight display and show chinese "班".e.g. `['2019.5.4', '2019.5.5']` | array | - |
| custom | custom data.It is a array of string or object of string.It return form Object Of Date. | array | - |

### custom
Data will use today as index to 0, one by one add to after the date.

If value's type is string, it will show as text.`['￥100']`

pass a object to option more

| param | description | type |
| :-: | :- | :-: |
| text | text | string |
| highlight | highlight for text | boolean |
| bgcolor | background color | string |
| disabled | disabled will can't select them in selected range | boolean |

e.g. `[{ highlight: true, text: '￥100' }]`

More,you can added another properties,they in `custom` with Object Of Date.

## Events

### `select({ start, end, range })`
Called after select date range.start: object, end: object, range:[object].
range is a selected array does't include start and end.If don't have space between start and end,range is a array of null.
#### Object Of Date
Selected Object Of Date has following keys:

| param | description | type |
| :-: | :- | :-: |
| year | year | number |
| month | month | number |
| day | date | number |
| date | full date YYYY-M-D | string |
| odate | full date YYYY-MM-DD | string |
| rest | Whether restday,include is not workday's weekend and custom restday. | boolean |
| restday | Whether custom restday | boolean |
| workday | Whether custom workday | boolean |
| disabled | Whether disabled | boolean |
| custom | custom data.See `custom` | object |
| begin | Whether selected date start | boolean |
| active | Whether selected date between start and end | boolean |
| end | Whether selected date end | boolean |
### cancel()
Called after cancel, it used to hide datepicker window.

### selectDisabled(date)
Called after selected a date has `custom.disabled`.`date` is a Object Of Date.

### viewport({ year, month, date })
Called when somemonth in viewport with window, return current date.

## used demo
```
npm i aki-datepicker
```

```javascript
// main.js
import AkiDate from 'aki-datepicker'
Vue.use(AkiDate)
```

```html
<input type="date" @touchstart="show = true" v-model="startDate" readonly>
-
<input type="date" @touchstart="show = true" v-model="endDate" readonly>
<aki-date
  :restday="restday"
  :workday="workday"
  :display="show"
  :custom="data"
  @select="select"
  @cancel="cancel"
  @selectDisabled="selectErr"
  @viewport="viewport"
  autoComplete/>
```

```javascript
import { Message } from 'element-ui'

export default {
  data() {
    return {
      startDate: '',
      endDate: '',
      restday: [],
      workday: ['2018-9-29', '2018-9-30'],
      data: ['￥1300', '￥1345', { highlight: true, text: '￥999' }],
      show: true
    }
  },
  methods: {
    select({ start, end, range }) {
      this.startDate = start.odate
      this.endDate = end.odate
      console.log('range', range)
      this.show = false
    },
    cancel() {
      this.show = false
    },
    selectErr(date) {
      console.log('date', date)
      Message({
        message: `can't selected this range：${date.date} is ${date.custom.dec}`,
        type: 'error',
        duration: 10000
      })
    },
    viewport({ year, month, date }) {
      console.log('现在出现在视线内的是：', `${year}-${month}`)
    }
  },
  created() {
    setTimeout(() => {
      this.workday = ['2018-8-25', '2018-8-26', '2018-8-27']
      this.restday = ['2018-8-22', '2018-8-23', '2018-8-24']
      this.data = [
        '￥1999',
        { text: '￥2018', bgcolor: 'lightgreen' },
        '', '', '', '',
        { highlight: true, text: '￥666', bgcolor: 'gold' },
        { highlight: true, text: '￥888' }, '', '',
        { disabled: true, bgcolor: 'red', dec: 'Repairing' }
      ]
    }, 2000)
  }
}
```
