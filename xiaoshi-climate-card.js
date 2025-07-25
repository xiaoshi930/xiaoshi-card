import { LitElement, html, css } from "https://unpkg.com/lit-element@2.4.0/lit-element.js?module";

class XiaoshiClimateCardEditor extends LitElement {
  static get properties() {
    return {
      hass: { type: Object },
      config: { type: Object }
    };
  }

  setConfig(config) {
    this.config = config || {};
  }

  async firstUpdated() {
    await this._setDefaultClimateEntity();
  }

  async _setDefaultClimateEntity() {
    if (this.config?.entity) return;
    const entities = Object.keys(this.hass.states).filter(
      eid => eid.startsWith('climate.')
    );
    
    if (entities.length > 0) {
      this.config = {
        ...(this.config || {}),
        entity: entities[0]
      };
      this._fireEvent();
    }
  }

  static get styles() {
    return css`
      .card-config {
        padding: 16px;
      }
      .row {
        margin-bottom: 16px;
      }
      .label {
        margin-bottom: 8px;
        font-weight: bold;
      }
      .buttons-row {
        display: flex;
        align-items: center;
        margin-top: 8px;
      }
      .add-button {
        margin-left: 8px;
      }
    `;
  }

  render() {
    if (!this.hass) return html``;

    return html`
      <div class="card-config">
        <!-- 主实体选择 -->
        <div class="row">
          <div class="label">空调实体 (必选)</div>
          <ha-entity-picker
            .hass=${this.hass}
            .value=${this.config?.entity || ''}
            .includeDomains=${['climate']}
            @value-changed=${this._valueChanged}
            .configValue=${'entity'}
            allow-custom-entity
            .disabled=${!this.hass}
          ></ha-entity-picker>
          ${!this.config?.entity ? html`
            <div class="hint">正在加载可用空调...</div>
          ` : ''}
        </div>

        <!-- 温度传感器 -->
        <div class="row">
          <div class="label">温度传感器 (可选)</div>
          <ha-entity-picker
            .hass=${this.hass}
            .value=${this.config.temperature || ''}
            .includeDomains=${['sensor']}
            @value-changed=${this._valueChanged}
            .configValue=${'temperature'}
            allow-custom-entity
          ></ha-entity-picker>
        </div>

        <!-- 定时器 -->
        <div class="row">
          <div class="label">定时器实体 (可选)</div>
          <ha-entity-picker
            .hass=${this.hass}
            .value=${this.config.timer || ''}
            .includeDomains=${['timer']}
            @value-changed=${this._valueChanged}
            .configValue=${'timer'}
          ></ha-entity-picker>
        </div>

        <!-- 主题选择 -->
        <div class="row">
          <div class="label">主题模式</div>
          <ha-switch
            .checked=${this.config.theme === 'on'}
            @change=${this._themeSwitchChanged}
            .configValue=${'theme'}
          ></ha-switch>
          <span style="margin-left: 8px">
            ${this.config.theme === 'on' ? '亮色(on)' : '暗色(off)'}
          </span>
        </div>

        <!-- 附加按钮 -->
        <div class="row">
          <div class="label">附加按钮 (最多7个)</div>
          ${(this.config.buttons || []).map((button, index) => html`
            <ha-entity-picker
              .hass=${this.hass}
              .value=${button}
              @value-changed=${(ev) => this._buttonChanged(ev, index)}
              .configValue=${'buttons'}
              allow-custom-entity
            ></ha-entity-picker>
          `)}
          ${(!this.config.buttons || this.config.buttons.length < 7) ? html`
            <div class="buttons-row">
              <mwc-button 
                class="add-button" 
                @click=${this._addButton}
                outlined
              >
                添加按钮
              </mwc-button>
            </div>
          ` : ''}
        </div>

        <!-- 自动隐藏选项 -->
        <div class="row">
          <ha-switch
            .checked=${!!this.config.auto_show}
            @change=${this._autoShowChanged}
          ></ha-switch>
          <span style="margin-left: 8px">空调关闭时隐藏卡片</span>
        </div>

        <!-- 宽度设置 -->
        <div class="row">
          <div class="label">卡片宽度</div>
          <ha-textfield
            .label="宽度 (例如: 100%, 300px)"
            .value=${this.config.width || '100%'}
            @input=${this._widthChanged}
          ></ha-textfield>
        </div>
      </div>
    `;
  }

	_valueChanged(ev) {
		if (!this.config) return;  // 移除了 !ev.detail.value 检查，允许空值
		const configValue = ev.target.configValue;
		const value = ev.detail.value;
		
		// 如果值为空，则删除该配置项
		if (!value) {
			const newConfig = { ...this.config };
			delete newConfig[configValue];
			this.config = newConfig;
		} else {
			this.config = { 
				...this.config,
				[configValue]: value 
			};
		}
		this._fireEvent();
	}

	_buttonChanged(ev, index) {
		if (!this.config) return;  // 移除了 !ev.detail.value 检查，允许空值
		const buttons = [...(this.config.buttons || [])];
		
		// 如果值为空，则删除该按钮
		if (!ev.detail.value) {
			buttons.splice(index, 1);
		} else {
			buttons[index] = ev.detail.value;
		}
		
		this.config = { 
			...this.config,
			buttons: buttons.length > 0 ? buttons : undefined  // 如果按钮数组为空，则不保留空数组
		};
		this._fireEvent();
	}

	_addButton() {
		const buttons = [...(this.config.buttons || [])];
		if (buttons.length >= 7) return;
		buttons.push('');
		
		this.config = { 
			...this.config,
			buttons 
		};
		this._fireEvent();
	}

  _removeButton(index) {
    const buttons = [...(this.config.buttons || [])];
    buttons.splice(index, 1);
    
    this.config = { 
      ...this.config,
      buttons 
    };
    this._fireEvent();
  }

  _themeSwitchChanged(ev) {
    if (!this.config) return;
    const theme = ev.target.checked ? 'on' : 'off';
    
    this.config = { 
      ...this.config,
      theme 
    };
    this._fireEvent();
  }

  _autoShowChanged(ev) {
    if (!this.config) return;
    const auto_show = ev.target.checked;
    
    this.config = { 
      ...this.config,
      auto_show 
    };
    this._fireEvent();
  }

  _widthChanged(ev) {
    if (!this.config) return;
    const width = ev.target.value;
    
    this.config = { 
      ...this.config,
      width 
    };
    this._fireEvent();
  }

  _fireEvent() {
    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config: this.config }
    }));
  }
}
customElements.define('xiaoshi-climate-card-editor', XiaoshiClimateCardEditor);

export class XiaoshiClimateCard extends LitElement {
  static get properties() { 
    return {
      hass: { type: Object },
      width: { type: String, attribute: true },
      config: { type: Object },
      buttons: { type: Array },
      theme: { type: String },
      _timerInterval: { state: true },
      auto_show: { type: Boolean },
      temperatureData: { type: Array },
      _externalTempSensor: { type: String } 
    };
  }
  static getConfigElement() {
    return document.createElement("xiaoshi-climate-card-editor");
  }

  static getStubConfig() {
    return {
      entity: "",
      temperature: "",
      timer: "",
      theme: "on",
      buttons: [],
      auto_show: false,
      width: "100%"
    };
  }

  setConfig(config) {
    this.config = config;
    this.buttons = config.buttons || [];
    this.auto_show = config.auto_show || false;
    this._externalTempSensor = config.temperature || null;
    if (config.width !== undefined) this.width = config.width;
    this.requestUpdate();
  }
  
  static get styles() { 
    return css`
      :host {
        display: block;
        contain: content;
      }
      
      .card {
        position: relative;
        border-radius: 12px;
        overflow: hidden;
        box-sizing: border-box;
      }
      
      .content-container {
        position: relative;
        z-index: 1;
        height: 100%;
        display: grid;
        grid-template-areas: 
            "name status power"
            "icon modes modes"
            "icon fan fan "
            "icon swing swing"
            "icon timer timer"
            "icon extra extra"
            "a a a"; 
        grid-template-columns: 25% 60% 13%;
        grid-template-rows: auto auto auto auto auto auto 4px;
      }

      .active-gradient {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, var(--active-color), transparent 50%);
        opacity: 0.8;
        z-index: 0;
      }

      #chart-container {
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 20%;
        overflow: hidden;
        z-index: 0;
        pointer-events: none;
      }

      .name-area {
        grid-area: name;
        display: flex;
        align-items: center;
        font-size: 16px;
        font-weight: bold;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        margin-left: 10px; 
        font-weight: bold;
      }
      
      .status-area {
        grid-area: status;
        display: flex;
        align-items: center;
        font-size: 12px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        margin-left: 5px; 
        gap: 1px;
        font-weight: bold;
      }
      .temp-adjust-container {
        display: inline-flex;
        align-items: center;
        gap: 1px;
      }
      .temp-adjust-button {
        background: none;
        border: none;
        cursor: pointer;
        padding: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--button);;
        width: 24px;
        height: 24px;
        border-radius: 5px;
        cursor: default;
      }

      .temp-display {
        font-size: 12px;
        min-width: 35px;
        text-align: center;
        color: var(--button);;
      }
      .current-temp {
        font-size: 12px;
        margin-left: 5px;
      }
      .power-area {
        grid-area: power;
        display: flex;
        justify-content: flex-end;
        align-items: center;
      }
      
      .power-button {
          background: none;
          border: none;
        cursor: pointer;
        padding: 0;
        display: flex;
        align-items: center;
        justify-content: flex-end;
        width: 100%;
        height: 35px;
        border-radius: 5px;
        cursor: default;
      }
      
      .power-icon {
        --mdc-icon-size: 30px;
        transition: all 0.3s ease;
      }

      .icon {
        --mdc-icon-size: 16px;
      }

      .icon-area {
        grid-area: icon;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: space-between;
        height: 100%;
      }

      .main-icon-container {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
      }
      
      .main-icon {
        --mdc-icon-size: 50px;
        margin-top: -3px;
        transition: transform 0.3s ease;
      }

      .active-main-icon {
        animation: spin var(--fan-speed, 2s) linear infinite;
        color: var(--active-color);
      }

      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }

      .modes-area, .fan-area, .swing-area, .timer-area, .extra-area {
        display: flex;
        gap: 5px;
        width: 100%;
        height: 25px;
        margin-bottom: 5px;
      }
      
      .modes-area {
        grid-area: modes;
      }
      
      .fan-area {
        grid-area: fan;
        overflow-x: auto;
        scrollbar-width: none;
      }
      
      .fan-area::-webkit-scrollbar {
        display: none;
      }
      
      .swing-area {
        grid-area: swing;
        overflow-x: auto;
        scrollbar-width: none;
      }
      
      .swing-area::-webkit-scrollbar {
        display: none;
      }
      
      .timer-area {
        grid-area: timer;
        display: grid;
        grid-template-columns: repeat(8, 1fr);
        gap: 5px;
      }
      
      .timer-button {
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: var(--button-bg);
        color: var(--button-fg);
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-size: 10px;
        min-width: 0;
        overflow: hidden;
        padding: 0 2px;
        cursor: default;
      }
      
      .timer-display {
        grid-column: span 2;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: var(--button-bg);
        color: var(--button-fg);
        border-radius: 8px;
        font-size: 10px;
        font-weight: bold;
        font-family: monospace;
      }
      
      .extra-area {
        grid-area: extra;
        display: grid;
        gap: 5px;
      }
      
      .extra-button {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background-color: rgb(0,0,0,0);
        color: var(--button);
        border: none;
        cursor: pointer;
        min-width: 0;
        overflow: visible;
        cursor: default;
        height: 100%;
        padding: 0;     
      }
      
      .extra-button-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
        line-height: 1;
        cursor: default;
      } 
        
      .extra-button-icon {
        --mdc-icon-size: 27px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: -4px;
        cursor: default;
      }
      
      .extra-button-value {
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: -4px;
        font-size: 11px;
        font-weight: bold;
        line-height: 1.5;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 100%;
        cursor: default;
      }
        
      .extra-button-text {
        font-size: 10px;
        line-height: 1.2;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 100%;
        height: auto;
        cursor: default;
      }
      
      .mode-button {
        background-color: var(--button-bg);
        color: var(--button-fg);
        border: none;
        border-radius: 8px;
        cursor: pointer;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        flex: 1;
        min-width: 0;
        position: relative;
        cursor: default;
      }

      .fan-button {
        position: relative;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .fan-button-icon {
        --mdc-icon-size: 16px;
        width: 16px;
        height: 16px;
        display: flex;
        justify-content: center;
        align-items: center;
        transform-origin: center;
      }

      .active-fan-button-icon {
        animation: spin var(--fan-speed, 2s) linear infinite;
        color: var(--active-color);
      }

      .fan-text {
        position: absolute;
        font-size: 8px;
        font-weight: bold;
        bottom: 0px;
        right: 0px; 
        border-radius: 4px;
        height: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        line-height: 1;
        padding: 1px 2px;  
        background-color: var(--button-bg);  
      }
      
      .swing-button {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
      }
      
      .swing-text {
        font-size: 10px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      
      .active-mode {
        color: var(--active-color) !important;
      }
      
      .active-extra {
        color: var(--active-color) !important;
      }
  `;
  }

  constructor() {
    super();
    this.hass = {};
    this.config = {};
    this.buttons = [];
    this.theme = 'on';
    this.width = '100%';
    this._timerInterval = null;
    this.temperatureData = [];
    this.canvas = null;
    this.ctx = null;
  }

  _evaluateTheme() {
    try {
      if (!this.config || !this.config.theme) return 'on';
      if (typeof this.config.theme === 'function') {
          return this.config.theme();
      }
      if (typeof this.config.theme === 'string' && 
              (this.config.theme.includes('return') || this.config.theme.includes('=>'))) {
          return (new Function(`return ${this.config.theme}`))();
      }
      return this.config.theme;
    } catch(e) {
      console.error('计算主题时出错:', e);
      return 'on';
    }
  }

  async  firstUpdated() {
    await this._fetchDataAndRenderChart();
    await this.initCanvas();
    this.drawSmoothCurve();
  }
  
    async updated(changedProperties) {
      if (changedProperties.has('hass') || changedProperties.has('config')) {
        //await this._fetchDataAndRenderChart();
        await this.initCanvas();
        this.drawSmoothCurve();
      }
    }

  async _fetchDataAndRenderChart() {
      if (!this.hass) return;
      try {
          const now = new Date();
          const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          const entityId = this._externalTempSensor || this.config.entity;
          if (!entityId) { return; }
          const result = await this.hass.callWS({
              type: 'history/history_during_period',
              start_time: yesterday.toISOString(),
              end_time: now.toISOString(),
              entity_ids: [entityId],
              significant_changes_only: true,
              minimal_response: true,
              no_attributes: false
          });
          if (!result?.[entityId]?.length) {return;}
          const isSensor = entityId.startsWith('sensor.');
          const rawData = result[entityId]
              .map(entry => {
                  const value = isSensor ? entry.s : entry.a?.current_temperature;
                  return parseFloat(value);
              })
              .filter(value => !isNaN(value));
          if (rawData.length === 0) return;
          const sampleInterval = Math.max(1, Math.floor(rawData.length / 50));
          const sampledData = [];
          for (let i = 0; i < rawData.length; i += sampleInterval) {
              const end = Math.min(i + sampleInterval, rawData.length);
              const slice = rawData.slice(i, end);
              const avg = slice.reduce((sum, val) => sum + val, 0) / slice.length;
              sampledData.push(avg);
          }
          this.temperatureData = this._gaussianSmooth(sampledData, 3);
      } catch (error) {
          console.error('获取温度数据失败:', error);
      }
    }
    
    _gaussianSmooth(data, windowSize = 5) {
        if (!data || data.length === 0) return [];
        if (windowSize < 1) return [...data];
        const kernel = this._createGaussianKernel(windowSize);
        const halfWindow = Math.floor(windowSize / 2);
        const result = new Array(data.length);
        for (let i = 0; i < data.length; i++) {
            let sum = 0;
            let weightSum = 0;
            const start = Math.max(0, i - halfWindow);
            const end = Math.min(data.length - 1, i + halfWindow);
            for (let j = start, k = start - (i - halfWindow); j <= end; j++, k++) {
                const weight = kernel[k];
                sum += data[j] * weight;
                weightSum += weight;
            }
            result[i] = sum / weightSum;
        }
        return result;
    }
    
  _createGaussianKernel(size) {
      if (!this._gaussianKernelCache) {
          this._gaussianKernelCache = new Map();
      }
      if (this._gaussianKernelCache.has(size)) {
          return this._gaussianKernelCache.get(size);
      }
      const kernel = new Array(size);
      const sigma = size / 3;
      const center = Math.floor(size / 2);
      let sum = 0;
      for (let i = 0; i <= center; i++) {
          const x = i - center;
          const value = Math.exp(-(x * x) / (2 * sigma * sigma));
          kernel[center + x] = value;
          kernel[center - x] = value;
          sum += (i === center - x) ? value : value * 2;
      }
  
      const normalized = kernel.map(v => v / sum);
      this._gaussianKernelCache.set(size, normalized);
      return normalized;
  }

  async initCanvas() {
      const container = this.shadowRoot.querySelector('#chart-container');
      if (!container) return;
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }
    this.canvas = document.createElement('canvas');
    container.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');
    const scale = window.devicePixelRatio || 1;
    await this.updateComplete;
    const width = container.clientWidth;
    const height = container.clientHeight;
    this.canvas.width = width * scale;
    this.canvas.height = height * scale;
    this.ctx.scale(scale, scale);
  }

  drawSmoothCurve() {
    const entity = this.hass.states[this.config.entity];
    const state = entity?.state || 'off';
	const theme = this._evaluateTheme(); 
    let statusColor = theme === 'on' ? '#323232' : '#dcdcdc';
    if (state === 'cool') statusColor = '#2ba0f3';
    else if (state === 'heat') statusColor = '#fe6f21';
    else if (state === 'dry') statusColor = '#ff9700';
    else if (state === 'fan' || state === 'fan_only') statusColor = '#00bcd5';
    else if (state === 'auto') statusColor = '#ee82ee';
      
    if (!this.ctx || !this.temperatureData || this.temperatureData.length === 0) return;
    const canvas = this.canvas;
    const ctx = this.ctx;
    const width = canvas.width / (window.devicePixelRatio || 1);
    const height = canvas.height / (window.devicePixelRatio || 1);
    ctx.clearRect(0, 0, width, height);
    const minTemp = Math.min(...this.temperatureData)-1;
    const maxTemp = Math.max(...this.temperatureData);
    const tempRange = Math.max(maxTemp - minTemp, 0.1);
    const xStep = width / (this.temperatureData.length - 1);
    const points = this.temperatureData.map((temp, i) => {
      return {
        x: i * xStep,
        y: height - ((temp - minTemp) / tempRange) * height,
        value: temp 
      };
    });
    ctx.beginPath();
    this.drawMonotonicSpline(ctx, points);
    ctx.lineTo(points[points.length-1].x, height);
    ctx.lineTo(points[0].x, height);
    ctx.closePath();
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, statusColor+'60');
    gradient.addColorStop(1, statusColor+'20');
    ctx.fillStyle = gradient;
    ctx.fill();
    ctx.beginPath();
    this.drawMonotonicSpline(ctx, points);
    ctx.strokeStyle = statusColor;
    ctx.lineWidth = 1;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 5;
    ctx.shadowOffsetY = 2;
    ctx.stroke();
  }

  drawMonotonicSpline(ctx, points) {
    if (points.length < 2) return;
    ctx.moveTo(points[0].x, points[0].y);
    const slopes = this.calculateMonotonicSlopes(points);
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i+1];
      const m0 = slopes[i];
      const m1 = slopes[i+1];
      const dx = (p1.x - p0.x) / 3;
      const cp1 = {
        x: p0.x + dx,
        y: p0.y + m0 * dx
      };
      const cp2 = {
        x: p1.x - dx,
        y: p1.y - m1 * dx
      };
      ctx.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, p1.x, p1.y);
    }
  }

  calculateMonotonicSlopes(points) {
    const slopes = new Array(points.length);
    for (let i = 1; i < points.length - 1; i++) {
      const prev = points[i-1];
      const curr = points[i];
      const next = points[i+1];
      const h1 = curr.x - prev.x;
      const h2 = next.x - curr.x;
      const s1 = (curr.y - prev.y) / h1;
      const s2 = (next.y - curr.y) / h2;
      if (s1 * s2 <= 0) {
        slopes[i] = 0; 
      } else {
        slopes[i] = 3 * h1 * h2 / ( (h1 + h2) * (h1/s2 + h2/s1) );
      }
    }
    slopes[0] = (points[1].y - points[0].y) / (points[1].x - points[0].x);
    slopes[points.length-1] = (points[points.length-1].y - points[points.length-2].y) / (points[points.length-1].x - points[points.length-2].x);
    return slopes;
  }

  render() {
    if (!this.hass || !this.config.entity) {
        return html``;
    }

    const entity = this.hass.states[this.config.entity];
    if (!entity) {
        return html`<div>实体未找到: ${this.config.entity}</div>`;
    }
    const state = entity.state;
    const isOn = state !== 'off';
    let marginBottom = '8px';
    if (this.auto_show && !isOn) {
      marginBottom = '0px';
      return html``;
    }

    const attrs = entity.attributes;
    const temperature =  typeof attrs.temperature === 'number'  ? `${attrs.temperature.toFixed(1)}°C`  : '';
    
    let current_temperature = '';
    if (this._externalTempSensor) {
      const tempEntity = this.hass.states[this._externalTempSensor];
      if (tempEntity && !isNaN(parseFloat(tempEntity.state))) {
        current_temperature = `室温: ${parseFloat(tempEntity.state).toFixed(1)}°C`;
      }
    } else if (typeof entity.attributes.current_temperature === 'number') {
      current_temperature = `室温: ${entity.attributes.current_temperature.toFixed(1)}°C`;
    }
    
    
    const theme = this._evaluateTheme();
    const fgColor = theme === 'on' ? 'rgb(0, 0, 0)' : 'rgb(255, 255, 255)';
    const bgColor = theme === 'on' ? 'rgb(255, 255, 255)' : 'rgb(50, 50, 50)';
    const buttonBg = theme === 'on' ? 'rgb(50,50,50)' : 'rgb(120,120,120)';
    const buttonFg = 'rgb(250,250,250)';

    let statusColor = 'rgb(250,250,250)';
    if (state === 'cool') statusColor = 'rgb(33,150,243)';
    else if (state === 'heat') statusColor = 'rgb(254,111,33)';
    else if (state === 'dry') statusColor = 'rgb(255,151,0)';
    else if (state === 'fan' || state === 'fan_only') statusColor = 'rgb(0,188,213)';
    else if (state === 'auto') statusColor = 'rgb(238,130,238)'
    else if (state === 'off') statusColor = 'rgb(250,250,250)';

    const stateTranslations = {
        'cool': '制冷',
        'heat': '制热',
        'dry': '除湿',
        'fan': '吹风',
        'fan_only': '吹风',
        'auto': '自动',
        'off': '关闭',
        'unknown': '未知',
        'unavailable': '离线'
    };
    const translatedState = stateTranslations[state] || state;

    const hasFanModes = attrs.fan_modes && attrs.fan_modes.length > 0;
    const hasSwingModes = attrs.swing_modes && attrs.swing_modes.length > 0;
    const hasTimer = this.config.timer;
    const timerEntity = hasTimer ? this.hass.states[this.config.timer] : null;
    const hasExtra = this.buttons && this.buttons.length > 0;
    
    const gridTemplateRows = [
        'auto',
        'auto',
        hasFanModes ? 'auto' : '0',
        hasSwingModes ? 'auto' : '0',
        hasTimer ? 'auto' : '0',
        hasExtra ? 'auto' : '0'
    ].join(' ');

    const fanModes = attrs.fan_modes || [];
    const modeCount = fanModes.length;
    const currentFanMode = attrs.fan_mode;
    let fanSpeed = '2s'; 
    
    if (modeCount > 0 && currentFanMode) {
        const minSpeed = 2;
        const maxSpeed = 0.5;
        const speedStep = modeCount > 1 ? (minSpeed - maxSpeed) / (modeCount - 1) : 0;
        const currentIndex = fanModes.indexOf(currentFanMode);
        if (currentIndex >= 0) {
            fanSpeed = (minSpeed - (currentIndex * speedStep)).toFixed(1) + 's';
        }
    }
    const buttonCount = Math.min(this.buttons.length, 7); 
    const gridColumns = buttonCount <= 6 ? 6 : 7;

    return html` 
      <div class="card" style=" margin-bottom: ${marginBottom};
                                width: ${this.width};
                                background: ${bgColor}; 
                                color: ${fgColor}; 
                                --button-bg: ${buttonBg}; 
                                --button-fg: ${buttonFg}; 
                                --active-color: ${statusColor};
                                grid-template-rows: ${gridTemplateRows}">
																
        ${isOn ? html`<div class="active-gradient"></div>` : ''}
        <div id="chart-container"></div>
        <div class="content-container">
            <div class="name-area">${attrs.friendly_name}</div>
                <div class="status-area" style="color: ${fgColor}">${translatedState}：
                    <div class="temp-adjust-container">
                        <button class="temp-adjust-button" @click=${() => this._adjustTemperature('down')}>
                            <ha-icon icon="mdi:chevron-left"></ha-icon>
                        </button>
                        <div class="temp-display">${temperature}</div>
                        <button class="temp-adjust-button" @click=${() => this._adjustTemperature('up')}>
                            <ha-icon icon="mdi:chevron-right"></ha-icon>
                        </button>
                    </div>${current_temperature}
                </div>
                    <div class="power-area">
                        <button class="power-button" @click=${this._togglePower}>
                            <ha-icon 
                                class="power-icon"
                                icon="${isOn ? 'mdi:toggle-switch' : 'mdi:toggle-switch-off'}"
                                style="color: ${isOn ? statusColor : fgColor};"
                            ></ha-icon>
                        </button>
                    </div>
                      
                    <div class="icon-area">
                        <div class="main-icon-container">
                            <ha-icon 
                                class="main-icon ${isOn ? 'active-main-icon' : ''}" 
                                icon="${isOn ? 'mdi:fan' : 'mdi:fan-off'}"
                                style="color: ${isOn ? statusColor : ''}; ${isOn ? `--fan-speed: ${fanSpeed}` : ''}"
                            ></ha-icon>
                        </div>
                    </div>
    
          <div class="modes-area">
              ${this._renderModeButtons(attrs.hvac_modes, state)}
          </div>
          
          ${hasFanModes ? html`
              <div class="fan-area">
                  ${this._renderFanButtons(attrs.fan_modes, attrs.fan_mode)}
              </div>
          ` : ''}
          
          ${hasSwingModes ? html`
              <div class="swing-area">
                  ${this._renderSwingButtons(attrs.swing_modes, attrs.swing_mode)}
              </div>
          ` : ''}
          
          ${hasTimer ? html`
              <div class="timer-area">
                  ${this._renderTimerControls(timerEntity)}
              </div>
          ` : ''}

          ${hasExtra ? html`
              <div class="extra-area" style="grid-template-columns: repeat(${gridColumns}, 1fr);">
                  ${this._renderExtraButtons()}
              </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  connectedCallback() {
      super.connectedCallback();
      if (!this.auto_show || this.isOn) {
        this._startTimerRefresh();
    }
  }

  disconnectedCallback() {
      super.disconnectedCallback();
      this._stopTimerRefresh();
  }

  _startTimerRefresh() {
      this._timerInterval = setInterval(() => {
          this.requestUpdate();
      }, 1000);
  }

  _stopTimerRefresh() {
      if (this._timerInterval) {
          clearInterval(this._timerInterval);
          this._timerInterval = null;
      }
  }

  _renderTimerControls(timerEntity) {
    if (!timerEntity) return html``;

    const climateEntity = this.hass.states[this.config.entity];
    const climateState = climateEntity ? climateEntity.state : 'off';
    
    let activeColor = 'rgb(255,255,255)';
    if (climateState === 'cool') activeColor = 'rgb(33,150,243)';
    else if (climateState === 'heat') activeColor = 'rgb(254,111,33)';
    else if (climateState === 'dry') activeColor = 'rgb(255,151,0)';
    else if (climateState === 'fan' || climateState === 'fan_only') activeColor = 'rgb(0,188,213)';
    else if (climateState === 'auto') activeColor = 'rgb(238,130,238)';
    
    const now = new Date();
    const finishesAt = new Date(timerEntity.attributes.finishes_at || 0);
    let remainingSeconds = Math.max(0, Math.floor((finishesAt - now) / 1000));
  
    const state = timerEntity.state;
    if (state !== 'active') {
        remainingSeconds = 0;
    } else if (remainingSeconds <= 0) {
        this._turnOffClimate();
        this._cancelTimer();
        remainingSeconds = 0;
    }
    
    const remainingTime = this._formatSeconds(remainingSeconds);
    const displayColor = remainingSeconds > 0 ? activeColor : 'var(--button-fg)';
    
    return html`
        <button class="timer-button" @click=${this._cancelTimer}>
            取消
        </button>
        <button class="timer-button" @click=${() => this._adjustTimer(-1, remainingSeconds)}>
            -
        </button>
        <div class="timer-display" style="color: ${displayColor}">
            ${remainingTime}
        </div>
        <button class="timer-button" @click=${() => this._adjustTimer(1, remainingSeconds)}>
            +
        </button>
        <button class="timer-button" @click=${() => this._setTimer(60 * 60)}>
            1h
        </button>
        <button class="timer-button" @click=${() => this._setTimer(3 * 60 * 60)}>
            3h
        </button>
        <button class="timer-button" @click=${() => this._setTimer(8 * 60 * 60)}>
            8h
        </button>
    `;
}

   _handleClick() {
     navigator.vibrate(50);
  }
  
  _formatSeconds(totalSeconds) {
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  _getTimerAdjustAmount(currentSeconds, direction) {
      const currentMinutes = Math.ceil(currentSeconds / 60);
      
      if (direction === -1) {
          if (currentMinutes > 30) return '30分';
          if (currentMinutes > 10) return '10分';
          return '取消';
      } else {
          if (currentSeconds === 0) return '10分';
          if (currentMinutes < 30) return '10分';
          if (currentMinutes < 180) return '30分';
          return '1小时';
      }
  }

  _adjustTimer(direction, currentSeconds) {
      if (!this.config.timer) return;
      
      const currentMinutes = Math.ceil(currentSeconds / 60);
      let newSeconds = 0;
      
      if (direction === -1) {
          if (currentMinutes > 30) {
              newSeconds = currentSeconds - (30 * 60);
          } else if (currentMinutes > 10) {
              newSeconds = currentSeconds - (10 * 60);
          } else {
              this._cancelTimer();
              return;
          }
      } else {
          if (currentSeconds === 0) {
              newSeconds = 10 * 60;
          } else if (currentMinutes < 30) {
              newSeconds = currentSeconds + (10 * 60);
          } else if (currentMinutes < 180) {
              newSeconds = currentSeconds + (30 * 60);
          } else {
              newSeconds = currentSeconds + (60 * 60);
          }
      }
      
      this._setTimer(newSeconds);
  }

  _cancelTimer() {
      if (!this.config.timer) return;
      this._callService('timer', 'cancel', {
          entity_id: this.config.timer
      });
  }

  _setTimer(totalSeconds) {
      if (!this.config.timer) return;
      const now = new Date();
      const finishesAt = new Date(now.getTime() + totalSeconds * 1000);
      if (this.hass.states[this.config.timer].state === 'active') {
          this._callService('timer', 'cancel', {
              entity_id: this.config.timer
          });
      }
      this._callService('timer', 'start', {
          entity_id: this.config.timer,
          duration: this._formatSeconds(totalSeconds)
      });
  }


_renderExtraButtons() {
    if (!this.buttons || this.buttons.length === 0) return html``;

    const buttonsToShow = this.buttons.slice(0, 7);
    const entity = this.hass.states[this.config.entity];
    if (!entity) {
        return html`<div>实体未找到: ${this.config.entity}</div>`;
    }
    
    const state = entity?.state || 'off';
    const theme = this._evaluateTheme();
    const fgColor = theme === 'on' ? 'rgb(0, 0, 0)' : 'rgb(255, 255, 255)';
    let activeColor = theme === 'on' ? 'rgba(00, 80, 80)' : 'rgba(180, 230, 230)';
    if (state === 'cool') activeColor = 'rgb(33,150,243)';
    else if (state === 'heat') activeColor = 'rgb(254,111,33)';
    else if (state === 'dry') activeColor = 'rgb(255,151,0)';
    else if (state === 'fan' || state === 'fan_only') activeColor = 'rgb(0,188,213)';
    else if (state === 'auto') activeColor = 'rgb(238,130,238)';
 

    return buttonsToShow.map(buttonEntityId => {
        const entity = this.hass.states[buttonEntityId];
        if (!entity) return html``;
        
        const domain = buttonEntityId.split('.')[0];
        const friendlyName = entity.attributes.friendly_name || '';
        const displayName = friendlyName.slice(0, 4);
        let displayValue = entity.state.slice(0, 4);
                
        switch(domain) {
            case 'switch':
            case 'light':
                const isActive = entity.state === 'on';
                const icon = isActive ? 'mdi:toggle-switch' : 'mdi:toggle-switch-off';
                const buttonColor = isActive ? activeColor : fgColor;
                
                return html`
                    <button 
                        class="extra-button ${isActive ? 'active-extra' : ''}" 
                        @click=${() => this._handleExtraButtonClick(buttonEntityId, domain)}
                        style="color: ${buttonColor}"
                        title="${friendlyName}"
                    >
                        <div class="extra-button-content">
                            <ha-icon class="extra-button-icon" icon="${icon}" style="color: ${buttonColor}"></ha-icon>
                            <div class="extra-button-text" style="color: ${buttonColor}">${displayName}</div>
                        </div>
                    </button>
                `;
                
            case 'sensor':
                const unit = entity.attributes.unit_of_measurement || '';
                displayValue = `${entity.state}${unit}`.slice(0, 4);
                
                return html`
                    <div class="extra-button" style="color: ${fgColor}; cursor: default;">
                        <div class="extra-button-content">
                            <div class="extra-button-value">${displayValue}</div>
                            <div class="extra-button-text">${displayName}</div>
                        </div>
                    </div>
                `;
                
            case 'button':
                const buttonIcon = 'mdi:button-pointer';
                return html`
                    <button class="extra-button" 
                            @click=${() => this._handleExtraButtonClick(buttonEntityId, domain)}
                            style="color: ${fgColor}">
                        <div class="extra-button-content">
                            <ha-icon class="extra-button-icon" icon="${buttonIcon}" style="--mdc-icon-size: 14px; color: ${fgColor}"></ha-icon>
                            <div class="extra-button-text">${displayName}</div>
                        </div>
                    </button>
                `;
            
            case 'select':
                if (!displayValue || displayValue.length > 4) {
                    const options = entity.attributes.options || [];
                    const firstOption = options[0] || '';
                    displayValue = firstOption.slice(0, 4);
                }
                
                return html`
                    <div class="extra-button" 
                            @click=${() => this._handleExtraButtonClick(buttonEntityId, domain)}
                            style="color: ${fgColor}; cursor: default;">
                        <div class="extra-button-content">
                            <div class="extra-button-value">${displayValue}</div>
                            <div class="extra-button-text">${displayName}</div>
                        </div>
                    </div>
                `;

            default:
                return html``;
        }
    });
}
    
    _handleExtraButtonClick(entityId, domain) {
        const entity = this.hass.states[entityId];
        if (!entity) return;
        
        switch(domain) {
            case 'switch':
            case 'light':
                const service = entity.state === 'on' ? 'turn_off' : 'turn_on';
                this._callService(domain, service, { entity_id: entityId });
                break;
                
            case 'button':
                this._callService('button', 'press', { entity_id: entityId });
                break;
                
            case 'select':
                this._callService('select', 'select_next', { entity_id: entityId });
                break;
        }
        
        this._handleClick();
    }


  _adjustTemperature(direction) {
      const entity = this.hass.states[this.config.entity];
      if (!entity) return;
      
      const currentTemp = entity.attributes.temperature;
      const step = entity.attributes.target_temp_step || 1;
      
      let newTemp = currentTemp;
      if (direction === 'up') {
          newTemp += step;
      } else {
          newTemp -= step;
      }
      this._callService('climate', 'set_temperature', {
          entity_id: this.config.entity,
          temperature: newTemp
      });
      this._handleClick();
  }

  _getSwingIcon(mode) {
      const swingIcons = {
          'off': 'mdi:arrow-oscillating-off',
          'vertical': 'mdi:arrow-up-down',
          'horizontal': 'mdi:arrow-left-right',
          'both': 'mdi:arrow-all',
          '🔄': 'mdi:autorenew',
          '⬅️': 'mdi:arrow-left',
          '⬆️': 'mdi:arrow-up',
          '➡️': 'mdi:arrow-right',
          '⬇️': 'mdi:arrow-down',
          '↖️': 'mdi:arrow-top-left',
          '↗️': 'mdi:arrow-top-right',
          '↘️': 'mdi:arrow-bottom-right',
          '↙️': 'mdi:arrow-bottom-left',
          '↔️': 'mdi:arrow-left-right',
          '↕️': 'mdi:arrow-up-down',
          '←': 'mdi:arrow-left',
          '↑': 'mdi:arrow-up',
          '→': 'mdi:arrow-right',
          '↓': 'mdi:arrow-down',
          '↖': 'mdi:arrow-top-left',
          '↗': 'mdi:arrow-top-right',
          '↘': 'mdi:arrow-bottom-right',
          '↙': 'mdi:arrow-bottom-left',
          '↔': 'mdi:arrow-left-right',
          '↕': 'mdi:arrow-up-down'
      };
      return swingIcons[mode] || '';
  }

  _renderModeButtons(modes, currentMode) {
      if (!modes) return html``;
      
      const modeIcons = {
          'auto': 'mdi:thermostat-auto',
          'heat': 'mdi:fire',
          'cool': 'mdi:snowflake',
          'dry': 'mdi:water-percent',
          'fan_only': 'mdi:fan',
          'fan': 'mdi:fan',
          'off': 'mdi:power'
      };
      
      return modes.map(mode => {
          const isActive = mode === currentMode;
          return html`
              <button 
                  class="mode-button ${isActive ? 'active-mode' : ''}" 
                  @click=${() => this._setHvacMode(mode)}
                  style="color: ${isActive ? 'var(--active-color)' : ''}"
                  title="${this._translateMode(mode)}"
              >
                  <ha-icon class="icon" icon="${modeIcons[mode] || 'mdi:thermostat'}" style="color: ${isActive ? 'var(--active-color)' : ''}"></ha-icon>
              </button>
          `;
      });
  }

  _renderFanButtons(fanModes, currentFanMode) {
    if (!fanModes || fanModes.length === 0) return html``;
    
    const entity = this.hass.states[this.config.entity];
    const isOn = entity?.state !== 'off';
    
    const modeCount = fanModes.length;
    const minSpeed = 2;
    const maxSpeed = 0.5;
    const speedStep = modeCount > 1 ? (minSpeed - maxSpeed) / (modeCount - 1) : 0;
    
    return fanModes.map((mode, index) => {
        const isActive = mode === currentFanMode && isOn;
        const speed = (minSpeed - (index * speedStep)).toFixed(1) + 's';
        
        return html`
            <button 
                class="mode-button ${isActive ? 'active-mode' : ''}" 
                @click=${() => this._setFanMode(mode)}
                style="${isActive ? `--fan-speed: ${speed};` : ''} color: ${isActive ? 'var(--active-color)' : ''}"
            >
                <div class="fan-button">
                    <ha-icon 
                        class="fan-button-icon ${isActive ? 'active-fan-button-icon' : ''}" 
                        icon="mdi:fan" 
                        style="color: ${isActive ? 'var(--active-color)' : ''}"
                    ></ha-icon>
                    <span class="fan-text">${this._translateFanMode(mode)}</span>
                </div>
            </button>
        `;
    });
  }
  
  _renderSwingButtons(swingModes, currentSwingMode) {
      if (!swingModes) return html``;
      
      return swingModes.map(mode => {
          const isActive = mode === currentSwingMode;
          return html`
              <button 
                  class="mode-button ${isActive ? 'active-mode' : ''}" 
                  @click=${() => this._setSwingMode(mode)}
                  style="color: ${isActive ? 'var(--active-color)' : ''}"
              >
                  <div class="swing-button">
                      <ha-icon class="icon" icon="${this._getSwingIcon(mode)}" style="color: ${isActive ? 'var(--active-color)' : ''}"></ha-icon>
                      <span class="swing-text">${this._translateSwingMode(mode)}</span>
                  </div>
              </button>
          `;
      });
  }

  _translateMode(mode) {
      const translations = {
          'cool': '制冷',
          'heat': '制热',
          'dry': '除湿',
          'fan_only': '吹风',
          'fan': '吹风',
          'auto': '自动',
          'off': '关闭'
      };
      return translations[mode] || mode;
  }

  _translateFanMode(mode) {
      if (mode.includes('自动') || mode.includes('auto')) return 'A';
      if (mode.includes('一') || mode.includes('1')) return '1';
      if (mode.includes('二') || mode.includes('2')) return '2';
      if (mode.includes('三') || mode.includes('3')) return '3';
      if (mode.includes('四') || mode.includes('4')) return '4';
      if (mode.includes('五') || mode.includes('5')) return '5';
      if (mode.includes('六') || mode.includes('6')) return '6';
      if (mode.includes('七') || mode.includes('7')) return '7';
      if (mode.includes('silent') || mode.includes('静')) return '静';
      if (mode.includes('low') || mode.includes('低')) return '低';
      if (mode.includes('稍弱')) return '弱';
      if (mode.includes('稍强')) return '强';
      if (mode.includes('medium') || mode.includes('中')) return '中';
      if (mode.includes('high') || mode.includes('高')) return '高';
      if (mode.includes('full') || mode.includes('全')) return '全';
      if (mode.includes('最大') || mode.includes('max')|| mode.includes('Max')) return 'M';
      return mode;
  }

  _translateSwingMode(mode) {
    const arrowSymbols = new Set([
      '🔄', '⬅️', '⬆️', '➡️', '⬇️','↔️','↕️','↖️', '↗️', '↘️', '↙️',
      '←', '↑', '→', '↓', '↔', '↕','↖', '↗', '↘', '↙'
    ]);
    if (arrowSymbols.has(mode)) return '';

    const translations = {
        'off': '\u00A0\u00A0关闭',
        'vertical': '\u00A0\u00A0垂直',
        'horizontal': '\u00A0\u00A0水平',
        'both': '\u00A0\u00A0立体',
    };
    return translations[mode] || mode;
  }
  
  _turnOffClimate() {
    if (!this.config.entity) return;
    
    this._callService('climate', 'turn_off', {
        entity_id: this.config.entity
    });
    this._handleClick();
  }

  _togglePower() {
      const entity = this.hass.states[this.config.entity];
      if (entity.state === 'off') {
          this._callService('climate', 'turn_on', {
              entity_id: this.config.entity
          });
          this._handleClick();
      } else {
          this._callService('climate', 'turn_off', {
              entity_id: this.config.entity
          });
        this._cancelTimer();
        this._handleClick();
      }
      
  }

  _setHvacMode(mode) {
      this._callService('climate', 'set_hvac_mode', {
          entity_id: this.config.entity,
          hvac_mode: mode
      });
      this._handleClick();
  }

  _setFanMode(mode) {
      this._callService('climate', 'set_fan_mode', {
          entity_id: this.config.entity,
          fan_mode: mode
      });
      this._handleClick();
  }

  _setSwingMode(mode) {
      this._callService('climate', 'set_swing_mode', {
          entity_id: this.config.entity,
          swing_mode: mode
      });
      this._handleClick();
  }

  _callService(domain, service, data) {
      this.hass.callService(domain, service, data);
      this._handleClick();
  }
} 
customElements.define('xiaoshi-climate-card', XiaoshiClimateCard);
