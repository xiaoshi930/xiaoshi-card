import { LitElement, html, css } from "https://unpkg.com/lit-element@2.4.0/lit-element.js?module";

export class XiaoshiTimeCard extends LitElement {
  static get properties() {
    return {
      hass: { type: Object },
      config: { type: Object },
      _currentTime: { type: Object },
      _lunarState: { type: Object },
      _flipParts: { type: Array },
      _previousTime: { type: Object },
      _displayTime: { type: Object },
      _theme: { type: String }, 
      _theme_on: { type: String }, 
      _theme_off: { type: String }, 
      _filterValue: { type: String }
    };
  }

  constructor() {
    super();
    this._currentTime = { hours: '', minutes: '', seconds: '' };
    this._previousTime = { hours: '', minutes: '', seconds: '' };
    this._displayTime = { hours: '', minutes: '', seconds: '' };
    this._flipParts = [];
    this._updateInterval = null;
    this._mode = 'A';
    this._theme = 'off';
    this._theme_on= 'rgb(150,70,70)';
    this._theme_off = 'rgb(50,50,50)'; 
    this._filterValue = '0deg';
  }

  setConfig(config) {
    this.config = config;
    this._mode = config.mode || 'A';
    this._theme = config.theme || 'off';
    this._theme_on = config.theme_on || 'rgb(150,70,70)';
    this._theme_off = config.theme_off || 'rgb(50,50,50)';
    this._filterEntity = config.filter || '';
  }

  connectedCallback() {
    super.connectedCallback();
    this._updateTime();
    this._updateInterval = setInterval(() => this._updateTime(), 1000);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    clearInterval(this._updateInterval);
  }

  set hass(hass) {
    this._hass = hass;
    const lunarEntity = this.config?.entity || 'sensor.lunar';
    this._lunarState = this._hass.states[lunarEntity];
    if (this._filterEntity) {
      const filterState = this._hass.states[this._filterEntity];
      this._filterValue = filterState ? filterState.state + 'deg' : '0deg';
    }
    this._updateStyles();
    this.requestUpdate();
  }

  _updateTime() {
    const now = new Date();
    const beijingOffset = 8 * 60;
    const utcTime = now.getTime() + now.getTimezoneOffset() * 60000;
    const beijingTime = new Date(utcTime + beijingOffset * 60000);
    const newTime = {
      hours: beijingTime.getHours().toString().padStart(2, '0'),
      minutes: beijingTime.getMinutes().toString().padStart(2, '0'),
      seconds: beijingTime.getSeconds().toString().padStart(2, '0')
    };
    this._previousTime = {...this._displayTime};
    if (this._mode === 'B') {
      this._updateFlipParts(newTime);
    } else {
      this._currentTime = newTime;
      this._displayTime = {...newTime};
      this.requestUpdate();
    }
  }

  _updateFlipParts(newTime) {
    this._flipParts = [];
    const parts = ['hours', 'minutes', 'seconds'];  
    parts.forEach(part => {
      if (newTime[part] !== this._displayTime[part]) {
        this._flipParts.push({
          part,
          newValue: newTime[part],
          oldValue: this._displayTime[part],
          flipping: true
        });   
        setTimeout(() => {
          this._displayTime[part] = newTime[part];
          this._flipParts = this._flipParts.filter(p => p.part !== part);
          this.requestUpdate();
        }, 300);
      }
    });
    this._currentTime = newTime;
    this.requestUpdate();
  }

  render() {
    return html`
      <ha-card @click=${this._showPopup}>
        <div class="grid-container">
          ${this._mode === 'A' 
            ? html`<div id="time">${this._currentTime.hours}:${this._currentTime.minutes}:${this._currentTime.seconds}</div>`
            : this._renderFlipClock()
          }
          <div id="date">${this._getAttribute(this._lunarState, 'now_solar.日期A')}</div>
          <div id="week">${this._getAttribute(this._lunarState, 'now_solar.星期A')}</div>
          <div id="jieqi">${this._getAttribute(this._lunarState, 'jieqi.节气')}</div>
          <div id="year">${this._getAttribute(this._lunarState, 'now_lunar.年')}</div>
          <div id="mon">${this._getAttribute(this._lunarState, 'now_lunar.日期').slice(-4)}</div>
          <div id="day">${this._getShichen()}</div>
          <div id="line"></div>
          <div id="shengri">${this._getAttribute(this._lunarState, 'shengriwarn.最近的生日.0')}</div>
          <div id="jieri">${this._getAttribute(this._lunarState, 'shengriwarn.最近的节日.0')}</div>
        </div>
      </ha-card>
    `;
  }

  _renderFlipClock() {
    const renderPart = (part) => {
      const flipPart = this._flipParts.find(p => p.part === part);
      const displayValue = flipPart ? flipPart.oldValue : this._displayTime[part];
      const topValue = flipPart ? flipPart.newValue : displayValue;
      return html`
        <div class="flip-part-container">
          <div class="part-top">${topValue}</div>
          ${flipPart ? html`
            <div class="flip-animation flipping">
              <div class="flip-animation-top">${flipPart.oldValue}</div>
              <div class="flip-animation-bottom">${flipPart.newValue}</div>
            </div>
          ` : ''}
          <div class="part-bottom">${displayValue}</div>
        </div>
      `;
    };
    return html`
      <div id="time"\n class="flip-clock">
        ${renderPart('hours')}
        <div class="colon">:</div>
        ${renderPart('minutes')}
        <div class="colon">:</div>
        ${renderPart('seconds')}
      </div>
    `;
  }

  static get styles() {
    return css`
      :host {
        display: block;
        width: 240px;
        height: 145px;
        color: white !important;
        --text-color: white;
      }
      ha-card {
        background: transparent !important;
        box-shadow: none !important;
        cursor: pointer;
      }
      .grid-container {
        display: grid;
        grid-template-areas: 
          "time time time time"
          "date week jieqi jieqi"
          "year mon mon day"
          "line line line line"
          "shengri shengri shengri shengri"
          "jieri jieri jieri jieri";
        grid-template-columns: 80px 58px 16px 72px;
        grid-template-rows: 55px 20px 20px 15px 20px 20px;
        font-weight: bold;
        font-size: 16px;
      }
      #time {
        grid-area: time;
        font-size: 57px;
        font-weight: 430;
        text-align: center;
        white-space: nowrap;
        overflow: hidden;
        color: var(--text-color);
        line-height: 0.9;
      }
      .colon {
        display: flex;
        align-items: center;
        font-size: 50px;
        color: var(--text-color);
        margin: 0 -5px;
      }
      .flip-clock {
        display: flex;
        justify-content: center;
        gap: 10px;
      }
      .flip-part-container {
        position: relative;
        width: 80px;
        height: 50px;
        perspective: 200px;
      }
      .part-top, .part-bottom {
        line-height: 50px;
        font-size: 47px;
        position: absolute;
        width: 100%;
        height: 50%;
        overflow: hidden;
        display: flex;
        justify-content: center;
        backface-visibility: hidden;
        border-radius: 4px;
        filter: var(--time-filter, none);
        background: var(--time-bg-color, rgba(0, 0, 0, 1));
      }
      .part-top {
        top: 0px;
        bottom: 2px;
        border-radius: 4px 4px 0 0;
        align-items: flex-start;
        z-index: 2;
        transform: translateZ(1px);
      }
      .part-bottom {
        bottom: -1px;
        border-radius: 0 0 4px 4px;
        align-items: flex-end;
        z-index: 1;
        transform: translateZ(1px);
      }
      .flip-animation {
        position: absolute;
        top: 0;
        width: 100%;
        height: 52%;
        transform-style: preserve-3d;
        transform-origin: bottom;
        z-index: 3;
      }
      .flip-animation-top, .flip-animation-bottom {
        line-height: 50px;
        font-size: 47px;
        position: absolute;
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        overflow: hidden;
        backface-visibility: hidden;
        border-radius: 4px;
        transform-style: preserve-3d;
        filter: var(--time-filter, none);
        background: var(--time-bg-color, rgba(0, 0, 0, 1));
      } 
      .flip-animation-top {
        top: 0px;
        bottom: 2px;
        align-items: flex-start;
        transform: rotateX(0deg) translateZ(1px);
        border-radius: 4px 4px 0 0;
      }
      .flip-animation-bottom {
        bottom: -1px;
        align-items: flex-end;
        transform: rotateX(180deg) translateZ(1px);
        border-radius: 0 0 4px 4px;
      }
      .flipping {
        animation: flip 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
      }
      @keyframes flip {
        0% { transform: rotateX(0deg); }
        100% { transform: rotateX(-180deg); }
      }
      #date    { grid-area: date; color: var(--text-color) }
      #week    { grid-area: week; color: var(--text-color) }
      #jieqi   { grid-area: jieqi; text-align: right; color: var(--text-color) }
      #year    { grid-area: year; color: var(--text-color) }
      #mon     { grid-area: mon; color: var(--text-color) }
      #day     { grid-area: day; text-align: right; color: var(--text-color) }
      #line    { 
          grid-area: line; 
          border-bottom: 2px solid rgb(255,255,255); 
          margin: 5px 0;
        }
      #shengri { grid-area: shengri; color: var(--text-color); font-size: 15px }
      #jieri   { grid-area: jieri; color: var(--text-color); font-size: 15px }
    `;
  } 
 
  updated(changedProperties) {
    if (changedProperties.has('_theme') || changedProperties.has('_filterValue')) {
      this._updateStyles(); 
    }
  }

  _updateStyles() {
    const theme = this._evaluateTheme();
    const bgColor =  theme  == 'on' ? this.config.theme_on : this.config.theme_off;
    this.style.setProperty('--time-bg-color', bgColor);
    this.style.setProperty('--time-filter', `hue-rotate(${this._filterValue})`);
  }
  
  _evaluateTheme() {
    try {
      if (typeof this.config.theme === 'function') return this.config.theme();
      if (typeof this.config.theme === 'string' && this.config.theme.includes('theme()')) {
        return (new Function('return theme()'))();
      }
      return this.config.theme || 'off';
    } catch(e) {
      return 'off';
    }
  }

  _getCurrentTime() {
    const now = new Date();
    return {
      hours: now.getHours().toString().padStart(2, '0'),
      minutes: now.getMinutes().toString().padStart(2, '0'),
      seconds: now.getSeconds().toString().padStart(2, '0')
    };
  }

  _getShichen() {
    const tzArr = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥', '子'];
    const skArr = ['一', '二', '三', '四', '五', '六', '七', '八'];
    const h = new Date().getHours();
    const m = new Date().getMinutes();
    const shichen = tzArr[parseInt( (h+1) / 2)] + '时';
    const shike = skArr[parseInt(m / 15) + Math.abs((h % 2) - 1) * 4] + "刻";
    return shichen+shike;
  }

  _getAttribute(state, path) { 
    return path.split('.').reduce((obj, key) => (obj || {})[key], state?.attributes || {}) || '';
  }

  _showPopup() {
    const popupContent = this.config.popup_content || {
      type: 'custom:xiaoshi-lunar-pad',
      theme: this._evaluateTheme()
    };
    const popupStyle = this.config.popup_style || `
      --popup-min-width: 800px;
      --mdc-theme-surface: rgb(0,0,0,0);
      --dialog-backdrop-filter: blur(10px) brightness(1);
    `;
    window.browser_mod.service('popup', { 
      style: popupStyle,
      content: popupContent
    });
  }
}
customElements.define('xiaoshi-time-card', XiaoshiTimeCard);
