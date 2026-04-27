import { useEffect, useRef } from 'react'
import { createChart } from 'lightweight-charts'

function IndicatorChart({ title, data, type, range }) {
  const containerRef = useRef(null)
  const chartRef = useRef(null)
  
  const latestValue = data && data.length > 0 ? data[data.length - 1].value : null
  
  let valueClass = 'neutral'
  if (type === 'rsi' || type === 'mfi') {
    if (latestValue > 70) valueClass = 'negative'
    else if (latestValue < 30) valueClass = 'positive'
  } else if (type === 'macd' && latestValue !== null) {
    valueClass = latestValue >= 0 ? 'positive' : 'negative'
  }
  
  useEffect(() => {
    if (!containerRef.current || !data || data.length === 0) return
    
    const chart = createChart(containerRef.current, {
      layout: {
        background: { color: '#141821' },
        textColor: '#9AA0A6',
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 10
      },
      grid: {
        vertLines: { color: '#1A1F2A' },
        horzLines: { color: '#1A1F2A' }
      },
      rightPriceScale: {
        borderColor: '#2A3040',
        scaleMargins: { top: 0.1, bottom: 0.1 }
      },
      timeScale: {
        borderColor: '#2A3040',
        visible: false
      },
      crosshair: { mode: 0 },
      handleScroll: false,
      handleScale: false
    })
    
    chartRef.current = chart
    
    if (type === 'macd') {
      const histogramSeries = chart.addHistogramSeries({
        priceFormat: { type: 'price', precision: 2, minMove: 0.01 },
        priceLineVisible: false,
        lastValueVisible: false
      })
      histogramSeries.setData(data.histogram || [])
      
      const macdLine = chart.addLineSeries({
        color: '#42A5F5',
        lineWidth: 1,
        priceLineVisible: false,
        lastValueVisible: false
      })
      macdLine.setData(data.macd || [])
      
      const signalLine = chart.addLineSeries({
        color: '#FFCA28',
        lineWidth: 1,
        priceLineVisible: false,
        lastValueVisible: false
      })
      signalLine.setData(data.signal || [])
    } else if (type === 'obv') {
      const areaSeries = chart.addAreaSeries({
        lineColor: '#42A5F5',
        topColor: 'rgba(66, 165, 245, 0.3)',
        bottomColor: 'rgba(66, 165, 245, 0.0)',
        lineWidth: 1,
        priceLineVisible: false,
        lastValueVisible: false
      })
      areaSeries.setData(data)
    } else {
      const lineSeries = chart.addLineSeries({
        color: type === 'rsi' ? '#AB47BC' : '#26A69A',
        lineWidth: 1,
        priceLineVisible: false,
        lastValueVisible: false
      })
      lineSeries.setData(data)
      
      if (range) {
        lineSeries.createPriceLine({ price: range.upper, color: '#EF5350', lineWidth: 1, lineStyle: 2, axisLabelVisible: false })
        lineSeries.createPriceLine({ price: range.lower, color: '#26A69A', lineWidth: 1, lineStyle: 2, axisLabelVisible: false })
      }
    }
    
    const handleResize = () => {
      if (containerRef.current) {
        chart.applyOptions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        })
      }
    }
    
    handleResize()
    chart.timeScale().fitContent()
    
    window.addEventListener('resize', handleResize)
    
    return () => {
      window.removeEventListener('resize', handleResize)
      chart.remove()
    }
  }, [data, type, range])
  
  if (!data) return null
  
  const displayValue = type === 'macd' 
    ? (data.macd && data.macd.length > 0 ? data.macd[data.macd.length - 1].value : 0)
    : latestValue
  
  return (
    <div className="indicator-grid__item">
      <div className="indicator-grid__item-header">
        <h3>{title}</h3>
        <span className={`value ${valueClass}`}>
          {displayValue !== null ? displayValue.toFixed(2) : '--'}
        </span>
      </div>
      <div className="indicator-grid__item-chart" ref={containerRef} />
    </div>
  )
}

export default function IndicatorGrid({ macd, rsi, mfi, obv }) {
  return (
    <div className="indicator-grid">
      {macd && (
        <IndicatorChart
          title="MACD"
          data={macd}
          type="macd"
        />
      )}
      {rsi && (
        <IndicatorChart
          title="RSI"
          data={rsi}
          type="rsi"
          range={{ upper: 70, lower: 30 }}
        />
      )}
      {mfi && (
        <IndicatorChart
          title="MFI"
          data={mfi}
          type="mfi"
          range={{ upper: 80, lower: 20 }}
        />
      )}
      {obv && (
        <IndicatorChart
          title="OBV"
          data={obv}
          type="obv"
        />
      )}
    </div>
  )
}
