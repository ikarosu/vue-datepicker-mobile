import 'date-utils'
Date.prototype.toYM = function() {
  return this.toYMD().slice(0, -3)
}
Date.prototype.getDateLength = function() {
  return new Date(this.getFullYear(), this.getMonth() + 1, 0).getDate()
}
Date.prototype.getWeekAsFirstDay = function() {
  return new Date(this.getFullYear(), this.getMonth(), 1).getDay() || 7
}
import AkiDatePicker from './DatePicker'

AkiDatePicker.install = Vue => Vue.component(AkiDatePicker.name, AkiDatePicker)

export default AkiDatePicker
