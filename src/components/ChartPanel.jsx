import { useEffect, useRef } from 'react'
import { createChart } from 'lightweight-charts'

export default function ChartPanel({ data, ema20, ema50, levels, currentPrice, priceChange }) {
  const containerRef = useRef(null)
  const chartRef = useRef(null)
  const seriesRef = useRef({})
  
  useEffect(() => {
    if (!containerRef.current) return
    
    const chart = createChart(containerRef.current, {
      layout: {
        background: { color: '#141821' },
        textColor: '#9AA0A6',
        fontFamily: "'JetBrains Mono', monospace"
      },
      grid: {
        vertLines: { color: '#1A1F2A' },
        horzLines: { color: '#1A1F2A' }
      },
      crosshair: {
        mode: 1,
        vertLine: { color: '#42A5F5', width: 1, style: 2 },
        horzLine: { color: '#42A5F5', width: 1, style: 2 }
      },
      rightPriceScale: {
        borderColor: '#2A3040',
        scaleMargins: { top: 0.1, bottom: 0.1 }
      },
      timeScale: {
        borderColor: '#2A3040',
        timeVisible: true,
        secondsVisible: false
      },
      handleScroll: { mouseWheel: true, pressedMouseMove: true },
      handleScale: { axisPressedMouseMove: true, mouseWheel: true, pinch: true }
    })
    
    chartRef.current = chart
    
    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#26A69A',
      downColor: '#EF5350',
      borderUpColor: '#26A69A',
      borderDownColor: '#EF5350',
      wickUpColor: '#26A69A',
      wickDownColor: '#EF5350'
    })
    
    seriesRef.current.candles = candlestickSeries
    
    seriesRef.current.ema20 = chart.addLineSeries({
      color: '#FFCA28',
      lineWidth: 1,
      priceLineVisible: false,
      lastValueVisible: false
    })
    
    seriesRef.current.ema50 = chart.addLineSeries({
      color: '#AB47BC',
      lineWidth: 1,
      priceLineVisible: false,
      lastValueVisible: false
    })
    
    const handleResize = () => {
      if (containerRef.current) {
        chart.applyOptions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        })
      }
    }
    
    handleResize()
    window.addEventListener('resize', handleResize)
    
    return () => {
      window.removeEventListener('resize', handleResize)
      chart.remove()
    }
  }, [])
  
  useEffect(() => {
    if (!seriesRef.current.candles) return
    
    seriesRef.current.candles.setData(data)
    
    if (chartRef.current) {
      chartRef.current.timeScale().fitContent()
    }
  }, [data])
  
  useEffect(() => {
    if (!seriesRef.current.ema20) return
    seriesRef.current.ema20.setData(ema20)
  }, [ema20])
  
  useEffect(() => {
    if (!seriesRef.current.ema50) return
    seriesRef.current.ema50.setData(ema50)
  }, [ema50])
  
  useEffect(() => {
    if (!chartRef.current) return
    
    if (seriesRef.current.supportLines) {
      seriesRef.current.supportLines.forEach(line => {
        seriesRef.current.candles.removePriceLine(line)
      })
    }
    if (seriesRef.current.resistanceLines) {
      seriesRef.current.resistanceLines.forEach(line => {
        seriesRef.current.candles.removePriceLine(line)
      })
    }
    
    seriesRef.current.supportLines = levels.support.map(price => 
      seriesRef.current.candles.createPriceLine({
        price,
        color: '#26A69A',
        lineWidth: 1,
        lineStyle: 2,
        axisLabelVisible: true,
        title: 'S'
      })
    )
    
    seriesRef.current.resistanceLines = levels.resistance.map(price =>
      seriesRef.current.candles.createPriceLine({
        price,
        color: '#EF5350',
        lineWidth: 1,
        lineStyle: 2,
        axisLabelVisible: true,
        title: 'R'
      })
    )
  }, [levels])
  
  const isPositive = parseFloat(priceChange) >= 0
  
  return (
    <div className="chart-panel">
      <div className="chart-panel__header">
        <h2>
          BTC/USDT <span>Perpetual</span>
        </h2>
        <div className="price-info">
          <span className="current-price">${currentPrice.toLocaleString()}</span>
          <span className={`change ${isPositive ? 'positive' : 'negative'}`}>
            {isPositive ? '+' : ''}{priceChange}%
          </span>
        </div>
      </div>
      <div className="chart-panel__container" ref={containerRef} />
    </div>
  )
}
