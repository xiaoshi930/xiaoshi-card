import { LitElement, html, css } from "https://unpkg.com/lit-element@2.4.0/lit-element.js?module";

export class XiaoshiComputerCard extends LitElement {
  static get properties() {
      return {
          hass: { type: Object },
          width: { type: String, attribute: true },
          config: { type: Object },
          theme: { type: String },
          auto_show: { type: Boolean }
      };
  }

  
  static get styles() { 
      return css`
          .card {
              position: relative;
              border-radius: 12px;
              overflow: hidden;
              box-sizing: border-box;
          }

          .content-container {
              position: relative;
              z-index: 1;
              display: grid; 
              height: 100%;
              grid-template-areas: 
                  "name status power"
                  "icon rings rings"
                  "a a a"; 
              grid-template-columns: 20% 65% 13%;
              grid-template-rows: auto auto 4px;
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

          #cpu-chart-container {
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            height: auto;
            overflow: hidden;
            z-index: 0;
            pointer-events: none;
          }
          
          #memory-chart-container {
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            height: auto;
            overflow: hidden;
            z-index: 0;
            pointer-events: none;
            opacity: 0.7;
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
            .status-value {
                font-size: 10px !important;
                font-weight: normal 
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
                  --mdc-icon-size: 35px;
                  margin-top: -3px;
                  transition: transform 0.3s ease;
          }

          .active-main-icon {
                  animation: spin 2s linear infinite;
                  color: var(--active-color);
          }

          .rings-area {
              grid-area: rings;
              display: flex;
              align-items: center;
              justify-content: center;
                overflow: visible;
            flex-wrap: nowrap;
            scrollbar-width: none; /* 隐藏滚动条 */
            -ms-overflow-style: none;
          }
          
        /* 隐藏滚动条 */
        .rings-area::-webkit-scrollbar {
            display: none;
        }
          .ring-container {
              position: relative;
              width: min(48px, 13vw);
               height: min(48px, 13vw);
            transition: width 0.3s ease, height 0.3s ease;
          }

          .ring-circle {
              transform: rotate(-90deg);
              transform-origin: 50% 50%;
          }

          .ring-text {
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              text-align: center;
              font-size: 10px;
              line-height: 1.2;
               font-weight: bold;
          }

          .ring-name {
              font-size: 10px;
              display: block;
               font-weight: bold;
          }

          .ring-value {
              display: block;
          }

          @keyframes spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
          }
      `;
  }
  
  setConfig(config) {
      this.config = config;
      this.auto_show = config.auto_show || false;
      if (config.width !== undefined) this.width = config.width;
  }

  
  constructor() {
      super();
      this.hass = {};
      this.config = {};
      this.theme = 'on';
      this.width = '100%';
  }

   _handleClick() {
     navigator.vibrate(50);
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
  
  async firstUpdated() {
    await this._loadApexCharts();
    this._fetchDataAndRenderChart();
  }
  
  async _loadApexCharts() {
    if (!window.ApexCharts) {
      await new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/apexcharts';
        script.onload = resolve;
        document.head.appendChild(script);
      });
    }
  }

  async _fetchDataAndRenderChart() {
      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      const entityIds = [];
      if (this.config.cpu) entityIds.push(this.config.cpu);
      if (this.config.memory) entityIds.push(this.config.memory);
      
      const result = await this.hass.callWS({
        type: 'history/history_during_period',
        start_time: yesterday.toISOString(),
        end_time: now.toISOString(),
        entity_ids: entityIds,
        significant_changes_only: false,
        minimal_response: true,
        no_attributes: true
      });

      if (this.config.cpu && result?.[this.config.cpu]?.length) {
        const cpuData = result[this.config.cpu]
          .filter(entry => !isNaN(parseFloat(entry.s)))
          .map(entry => [entry.lu * 1000, parseFloat(entry.s)])
          .sort((a, b) => a[0] - b[0]);
        this._renderChart(cpuData, 'cpu-chart-container', '#00C5CD');
      }
      if (this.config.memory && result?.[this.config.memory]?.length) {
        const memoryData = result[this.config.memory]
          .filter(entry => !isNaN(parseFloat(entry.s)))
          .map(entry => [entry.lu * 1000, parseFloat(entry.s)])
          .sort((a, b) => a[0] - b[0]);
        this._renderChart(memoryData, 'memory-chart-container', '#9C27B0');
      }
  }

  _renderChart(data, containerId, color) {
    const container = this.shadowRoot.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = '';
    
    if (this[`_${containerId}_chart`]) {
      this[`_${containerId}_chart`].destroy();
    }

    this[`_${containerId}_chart`] = new ApexCharts(container, {
      series: [{
        data: data
      }],
      chart: {
        type: 'area',
        height: '50%',
        width: '100%',
        sparkline: { enabled: true },
        animations: { enabled: false },
        toolbar: { show: false }
      },
      colors: [color],
      stroke: {
        width: 1,
        curve: 'smooth'
      },
      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 0.5,
          opacityFrom: 0.6,
          opacityTo: 0.2,
          stops: [0, 100],
          colorStops: [
            { offset: 0, color: color, opacity: 0.6 },
            { offset: 100, color: color, opacity: 0.3 }
          ]
        }
      },
      xaxis: {
        labels: { show: false },
        axisBorder: { show: false },
        axisTicks: { show: false },
        tooltip: { enabled: false }
      },
      yaxis: {
        show: false,
        min: Math.min(...data.map(d => d[1]))
      },
      grid: { show: false },
      tooltip: { enabled: false},
      dataLabels: { enabled: false },
      legend: { show: false },
      markers: { size: 0 }
    });

    this[`_${containerId}_chart`].render();
  }
  
  disconnectedCallback() {
    if (this._cpu_chart) {
      this._cpu_chart.destroy();
    }
    if (this._memory_chart) {
      this._memory_chart.destroy();
    }
    super.disconnectedCallback();
  }
  
  _getRingColor(value) {
      if (value === undefined || isNaN(value)) return '#aaaaaa';
      const hue = (100 - value) * 1.2;
      return `hsl(${hue}, 100%, 50%)`;
  }

  _getEntityValue(entityId) {
      if (!entityId || !this.hass.states[entityId]) return undefined;
      const state = this.hass.states[entityId].state;
      return isNaN(state) ? undefined : parseFloat(state);
  }

  _getEntityName(entityId) {
      if (!entityId || !this.hass.states[entityId]) return '未知';
      return this.hass.states[entityId].attributes.friendly_name || entityId.split('.').pop();
  }

  _renderRing(entityId, index, total) {
      const value = this._getEntityValue(entityId);
      const name = this._getEntityName(entityId);
      const color = this._getRingColor(value);
      const strokeDasharray = value !== undefined ? `${value} 100` : '0 100';
      const size = 'min(48px, 13vw)'; // 定义基础大小
      const theme = this._evaluateTheme();
      const fgColor = theme === 'on' ? 'rgb(50, 50, 50)' : 'rgb(240, 240, 240)';
    return html`
        <div class="ring-container">
            <svg class="ring-circle" 
                 width=${size} 
                 height=${size}
                 viewBox="0 0 40 40">
                <circle cx="20" cy="20" r="15.915" fill="none" stroke="${fgColor}" stroke-width="3"></circle>
                <circle cx="20" cy="20" r="15.915" fill="none" stroke="${color}" 
                        stroke-width="3" stroke-dasharray="${strokeDasharray}"></circle>
            </svg>
            <div class="ring-text">
                <span class="ring-name">${name}</span>
                <span class="ring-value">${value !== undefined ? `${Math.round(value)}%` : '--%'}</span>
            </div>
        </div>
    `;
}

    _getStatusText() {
        const entity = this.hass.states[this.config.entity];
        if (!entity) return html`<span>状态未知</span>`;
        
        const isOn = entity.state === 'on';
        if (!isOn) return html`<span>&nbsp;关机</span>`;
        
        const parts = [html`<span>&nbsp;开机:&nbsp;</span>`];
        
        if (this.config.cpu) {
            const cpuValue = this._getEntityValue(this.config.cpu);
            parts.push(html`<span> CPU&nbsp;</span>`);
            parts.push(html`<span class="status-value">${cpuValue !== undefined ? `${Math.round(cpuValue)}%` : '--%'}</span>`);
        }
        
        if (this.config.memory) {
            const memValue = this._getEntityValue(this.config.memory);
            parts.push(html`<span> 内存&nbsp;</span>`);
            parts.push(html`<span class="status-value">${memValue !== undefined ? `${Math.round(memValue)}%` : '--%'}</span>`);
        }
        
        return html`${parts}`;
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
      const isOn = state === 'on';
      let marginBottom = '8px';
      if (this.auto_show && !isOn) {
          marginBottom = '0px';
          return html``;
      }

      const theme = this._evaluateTheme();
      const fgColor = theme === 'on' ? 'rgb(0, 0, 0)' : 'rgb(255, 255, 255)';
      const bgColor = theme === 'on' ? 'rgb(255, 255, 255)' : 'rgb(50, 50, 50)';
      const statusColor = isOn ? '#2196f3' : '';
      
      // 收集所有要显示的圆环实体
      const ringEntities = [];
      if (this.config.cpu) ringEntities.push(this.config.cpu);
      if (this.config.memory) ringEntities.push(this.config.memory);
      if (this.config.storage) {
          if (Array.isArray(this.config.storage)) {
              ringEntities.push(...this.config.storage);
          } else {
              ringEntities.push(this.config.storage);
          }
      }
      
      return html` 
          <div class="card"  style="margin-bottom: ${marginBottom};
                                                  width: ${this.width};
                                                  background: ${bgColor}; 
                                                  color: ${fgColor}; 
                                                  --active-color: ${statusColor};
                                                  grid-template-rows: "auto auto">
              
              <div class="active-gradient"></div>
              <div id="cpu-chart-container"></div>
              <div id="memory-chart-container"></div>
              
              <div class="content-container">
                  <div class="name-area">${entity.attributes.friendly_name}</div>
                  <div class="status-area" style="color: ${fgColor}">${this._getStatusText()}</div>

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
                              style="color: ${isOn ? statusColor : ''}; "
                          ></ha-icon>
                      </div>
                  </div>
                  
                  <div class="rings-area">
                      ${ringEntities.map((entityId, index) => 
                          this._renderRing(entityId, index, ringEntities.length)
                      )}
                  </div>
              </div>
          </div>
      `;
  }

  _togglePower() {
      const entity = this.hass.states[this.config.entity];
      const service = entity.state === 'off' ? 'turn_on' : 'turn_off';
      
      this.hass.callService('homeassistant', service, {
              entity_id: this.config.entity
      });
      this._handleClick();
  }
}

customElements.define('xiaoshi-computer-card', XiaoshiComputerCard);
