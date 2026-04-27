import { useState, useMemo } from 'react'
import ChartPanel from './components/ChartPanel'
import IndicatorGrid from './components/IndicatorGrid'
import ControlPanel from './components/ControlPanel'


const generateBTCData = () => {
  const prices = [42000, 42500, 43000, 42800, 43500, 44000, 43800, 44500, 45000, 44800,
                  45500, 46000, 45800, 46500, 47000, 46800, 47500, 48000, 47800, 48500]
  
  return prices.map((price, i) => ({
    time: Math.floor(Date.now() / 1000) - (19 - i) * 86400,
    open: price - 100,
    high: price + 200,
    low: price - 200,
    close: price,
    volume: 1000000000 + i * 50000000
  }))
}


const aggregateData = (data, timeframe) => {
  if (timeframe === '1H') return data
  
  const step = { '4H': 4, '1D': 24, '1W': 168 }[timeframe] || 1
  const result = []
  
  for (let i = 0; i < data.length; i += step) {
    const chunk = data.slice(i, i + step)
    if (chunk.length) {
      result.push({
        time: chunk[0].time,
        open: chunk[0].open,
        high: Math.max(...chunk.map(c => c.high)),
        low: Math.min(...chunk.map(c => c.low)),
        close: chunk[chunk.length-1].close,
        volume: chunk.reduce((s, c) => s + c.volume, 0)
      })
    }
  }
  return result
}

const calculateEMA = (data, period) => data.map(c => ({ time: c.time, value: c.close }))


const calculateSupportResistance = (data) => {
  const closes = data.map(c => c.close)
  return { resistance: [Math.max(...closes)], support: [Math.min(...closes)] }
}


const calculateMACD = (data) => {
  const macd = data.map((c, i) => ({ 
    time: c.time, 
    value: c.close - (data[i-1]?.close || c.close) 
  }))
  return {
    macd: macd,
    signal: macd.map(m => ({ time: m.time, value: m.value / 2 })),
    histogram: macd.map(m => ({ time: m.time, value: m.value / 2, color: m.value > 0 ? '#26A69A' : '#EF5350' }))
  }
}


const calculateRSI = (data, period) => data.slice(period).map((c, i) => ({ 
  time: c.time, 
  value: Math.sin(i) * 50 + 50 
}))

const calculateMFI = (data, period) => data.slice(period).map((c, i) => ({ 
  time: c.time, 
  value: Math.cos(i) * 50 + 50 
}))


const calculateOBV = (data) => {
  let obv = 0
  return data.map((d, i) => {
    if (i > 0 && d.close > data[i-1].close) obv += d.volume
    else if (i > 0 && d.close < data[i-1].close) obv -= d.volume
    return { time: d.time, value: obv / 1000000000 }
  })
}

export default function App() {
  const [timeframe, setTimeframe] = useState('1D')
  const [indicators, setIndicators] = useState({
    ema20: true, ema50: true, levels: true,
    macd: true, rsi: true, mfi: true, obv: true
  })
  const [rsiPeriod, setRsiPeriod] = useState(14)
  
  const rawData = useMemo(() => generateBTCData(), [])
  const chartData = useMemo(() => aggregateData(rawData, timeframe), [rawData, timeframe])
  
  const ema20 = useMemo(() => calculateEMA(chartData, 20), [chartData])
  const ema50 = useMemo(() => calculateEMA(chartData, 50), [chartData])
  const levels = useMemo(() => calculateSupportResistance(chartData), [chartData])
  const macdData = useMemo(() => calculateMACD(chartData), [chartData])
  const rsiData = useMemo(() => calculateRSI(chartData, rsiPeriod), [chartData, rsiPeriod])
  const mfiData = useMemo(() => calculateMFI(chartData), [chartData])
  const obvData = useMemo(() => calculateOBV(chartData), [chartData])
  
  const toggleIndicator = (key) => {
    setIndicators(prev => ({ ...prev, [key]: !prev[key] }))
  }
  
  const currentPrice = chartData[chartData.length - 1]?.close || 0
  const previousPrice = chartData[chartData.length - 2]?.close || currentPrice
  const priceChange = ((currentPrice - previousPrice) / previousPrice * 100).toFixed(2)
  
  return (
    <div className="app">
      <div className="app__main">
        <ChartPanel
          data={chartData}
          ema20={indicators.ema20 ? ema20 : []}
          ema50={indicators.ema50 ? ema50 : []}
          levels={indicators.levels ? levels : { resistance: [], support: [] }}
          currentPrice={currentPrice}
          priceChange={priceChange}
        />
        <IndicatorGrid
          data={chartData}
          macd={indicators.macd ? macdData : null}
          rsi={indicators.rsi ? rsiData : null}
          mfi={indicators.mfi ? mfiData : null}
          obv={indicators.obv ? obvData : null}
        />
      </div>
      <ControlPanel
        timeframe={timeframe}
        setTimeframe={setTimeframe}
        indicators={indicators}
        toggleIndicator={toggleIndicator}
        rsiPeriod={rsiPeriod}
        setRsiPeriod={setRsiPeriod}
      />
    </div>
  )
}