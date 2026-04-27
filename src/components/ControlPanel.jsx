export default function ControlPanel({
  timeframe,
  setTimeframe,
  indicators,
  toggleIndicator,
  rsiPeriod,
  setRsiPeriod
}) {
  const timeframes = ['1H', '4H', '1D', '1W']
  
  const indicatorOptions = [
    { key: 'ema20', label: 'EMA 20' },
    { key: 'ema50', label: 'EMA 50' },
    { key: 'levels', label: 'S/R Levels' },
    { key: 'macd', label: 'MACD' },
    { key: 'rsi', label: 'RSI' },
    { key: 'mfi', label: 'MFI' },
    { key: 'obv', label: 'OBV' }
  ]
  
  return (
    <div className="control-panel">
      <div className="control-panel__section">
        <h3>Timeframe</h3>
        <div className="control-panel__timeframes">
          {timeframes.map(tf => (
            <button
              key={tf}
              className={timeframe === tf ? 'active' : ''}
              onClick={() => setTimeframe(tf)}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>
      
      <div className="control-panel__section">
        <h3>Indicators</h3>
        <div className="control-panel__indicators">
          {indicatorOptions.map(({ key, label }) => (
            <div
              key={key}
              className={`control-panel__toggle ${indicators[key] ? 'active' : ''}`}
              onClick={() => toggleIndicator(key)}
            >
              <span>{label}</span>
              <div className="switch" />
            </div>
          ))}
        </div>
      </div>
      
      <div className="control-panel__section">
        <h3>Parameters</h3>
        <div className="control-panel__slider">
          <label>RSI Period</label>
          <div className="slider-container">
            <input
              type="range"
              min="5"
              max="30"
              value={rsiPeriod}
              onChange={(e) => setRsiPeriod(parseInt(e.target.value))}
            />
            <span>{rsiPeriod}</span>
          </div>
        </div>
      </div>
      
      <div className="control-panel__section control-panel__legend">
        <h3>Legend</h3>
        <div className="legend-item">
          <div className="color-dot ema20" />
          <span>EMA 20</span>
        </div>
        <div className="legend-item">
          <div className="color-dot ema50" />
          <span>EMA 50</span>
        </div>
        <div className="legend-item">
          <div className="color-dot support" />
          <span>Support Levels</span>
        </div>
        <div className="legend-item">
          <div className="color-dot resistance" />
          <span>Resistance Levels</span>
        </div>
      </div>
    </div>
  )
}
