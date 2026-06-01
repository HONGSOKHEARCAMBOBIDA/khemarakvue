<template>
  <div class="calculator">
    <!-- Display -->
    <div class="calc-display">
      <div class="calc-expr">{{ expression }}</div>
      <div class="calc-value">{{ display }}</div>
    </div>

    <!-- Buttons -->
    <div class="calc-grid">
      <button class="btn fn" @click="calcAC">AC</button>
      <button class="btn fn" @click="calcSign">+/−</button>
      <button class="btn fn" @click="calcPercent">%</button>
      <button class="btn op" @click="pressOp('÷')">÷</button>

      <button class="btn" @click="pressNum('7')">7</button>
      <button class="btn" @click="pressNum('8')">8</button>
      <button class="btn" @click="pressNum('9')">9</button>
      <button class="btn op" @click="pressOp('×')">×</button>

      <button class="btn" @click="pressNum('4')">4</button>
      <button class="btn" @click="pressNum('5')">5</button>
      <button class="btn" @click="pressNum('6')">6</button>
      <button class="btn op" @click="pressOp('−')">−</button>

      <button class="btn" @click="pressNum('1')">1</button>
      <button class="btn" @click="pressNum('2')">2</button>
      <button class="btn" @click="pressNum('3')">3</button>
      <button class="btn op" @click="pressOp('+')">+</button>

      <button class="btn wide" @click="pressNum('0')">0</button>
      <button class="btn" @click="pressDot()">.</button>
      <button class="btn eq" @click="calcEquals()">＝</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const current   = ref('0')
const prev      = ref('')
const op        = ref('')
const justCalc  = ref(false)
const expression = ref('')

const display = ref('0')

function updateDisplay() {
  display.value = current.value
}

function pressNum(n) {
  if (justCalc.value) { current.value = n; justCalc.value = false }
  else current.value = current.value === '0' ? n : current.value + n
  if (current.value.length > 12) return
  updateDisplay()
}

function pressDot() {
  if (justCalc.value) { current.value = '0.'; justCalc.value = false }
  else if (!current.value.includes('.')) current.value += '.'
  updateDisplay()
}

function pressOp(o) {
  if (op.value && prev.value && !justCalc.value) calcEquals(true)
  prev.value = current.value
  op.value = o
  justCalc.value = true
  expression.value = prev.value + ' ' + op.value
}

function calcEquals(chain = false) {
  if (!op.value || !prev.value) return
  const a = parseFloat(prev.value)
  const b = parseFloat(current.value)
  let r
  if (op.value === '+')  r = a + b
  else if (op.value === '−') r = a - b
  else if (op.value === '×') r = a * b
  else if (op.value === '÷') r = b === 0 ? 'Error' : a / b

  if (!chain) expression.value = prev.value + ' ' + op.value + ' ' + current.value + ' ='
  current.value = r === 'Error' ? 'Error' : String(parseFloat(r.toFixed(10)))
  if (!chain) { op.value = ''; prev.value = '' }
  justCalc.value = true
  updateDisplay()
}

function calcAC() {
  current.value = '0'; prev.value = ''; op.value = ''; justCalc.value = false
  expression.value = ''
  updateDisplay()
}

function calcSign() {
  if (current.value === '0' || current.value === 'Error') return
  current.value = current.value.startsWith('-') ? current.value.slice(1) : '-' + current.value
  updateDisplay()
}

function calcPercent() {
  const v = parseFloat(current.value)
  current.value = String(parseFloat((v / 100).toFixed(10)))
  updateDisplay()
}

function handleKeydown(e) {
  if (e.key >= '0' && e.key <= '9') pressNum(e.key)
  else if (e.key === '.') pressDot()
  else if (e.key === '+') pressOp('+')
  else if (e.key === '-') pressOp('−')
  else if (e.key === '*') pressOp('×')
  else if (e.key === '/') { e.preventDefault(); pressOp('÷') }
  else if (e.key === 'Enter' || e.key === '=') calcEquals()
  else if (e.key === 'Backspace') {
    if (current.value.length > 1) current.value = current.value.slice(0, -1)
    else current.value = '0'
    updateDisplay()
  }
}

onMounted(() => window.addEventListener('keydown', handleKeydown))
onUnmounted(() => window.removeEventListener('keydown', handleKeydown))
</script>

<style scoped>
.calculator {
  width: 100%;
  user-select: none;
}

.calc-display {
  background-color: #f5f7fa;
  border-radius: 8px;
  padding: 12px 14px;
  margin-bottom: 12px;
  text-align: right;
  border: 1px solid #e4e7ed;
}

.calc-expr {
  font-size: 12px;
  color: #909399;
  min-height: 16px;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.calc-value {
  font-size: 28px;
  font-weight: 500;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.calc-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.btn {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 14px 0;
  font-size: 16px;
  cursor: pointer;
  background: #ffffff;
  color: #303133;
  transition: background 0.1s, transform 0.08s;
  font-family: inherit;
}

.btn:hover {
  background: #f5f7fa;
}

.btn:active {
  transform: scale(0.95);
  background: #ebedf0;
}

.btn.fn {
  color: #606266;
  font-size: 14px;
}

.btn.op {
  background: #ecf5ff;
  color: #409eff;
  border-color: #b3d8ff;
  font-size: 18px;
}

.btn.op:hover {
  background: #d9ecff;
}

.btn.eq {
  background: #409eff;
  color: white;
  border-color: #409eff;
  font-size: 18px;
}

.btn.eq:hover {
  background: #337ecc;
}

.btn.wide {
  grid-column: span 2;
}
</style>