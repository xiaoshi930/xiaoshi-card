import { LitElement, html, css } from "https://unpkg.com/lit-element@2.4.0/lit-element.js?module";

export class XiaoshiTextCard extends LitElement {
  static get properties() {
    return {
      hass: Object,
      config: Object,
      _value: String,
      _isEditing: Boolean,
      _pendingSave: Boolean
    }; 
  }

  static get styles() {
    return css`
      :host {
        display: block;
      }  
      .input-container {
        display: flex;
        align-items: center;
        padding: 0;
        height: 100%;
        transition: all 0.3s ease;
      } 
      .input-container.on {
        background-color: rgb(255,255,255);
        color: black;
      }
      .input-container.off {
        background-color: rgb(50,50,50);
        color: white;
      }
      .icon {
        margin-right: 0.5rem;
        font-size: 1.2rem;
        margin-left: 0.5rem;
      }
      .input-wrapper {
        flex-grow: 1;
        position: relative;
      }
      input {
        width: 100%;
        border: none;
        background: transparent;
        color: inherit;
        font-size: 1rem;
        padding: 0.5rem 0;
        outline: none;
      }
      .placeholder {
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        color: gray;
        pointer-events: none;
        transition: all 0.2s ease;
        font-size: 0.9rem;
        opacity: 1;
      }
      input:focus + .placeholder,
      input:not(:placeholder-shown) + .placeholder,
      .placeholder.hidden {
        top: 0;
        transform: translateY(0);
        font-size: 0.7rem;
        opacity: 0;
      }
    `;
  }

  constructor() {
    super();
    this._value = '';
    this._isEditing = false;
    this._pendingSave = false;
  }

  _getTheme() {
    try {
      if (typeof this.config.theme === 'function') return this.config.theme();
      if (typeof this.config.theme === 'string' && this.config.theme.includes('theme(')) {
        return (new Function('return theme()'))();
      }
      return this.config.theme || 'on';
    } catch(e) {
      console.error('Error evaluating theme:', e);
      return 'on';
    }
  }

  render() {
    if (!this.config || !this.hass) return html``;
    const entity = this.config.entity;
    const entityState = entity ? this.hass.states[entity] : null;
    const friendlyName = entityState ? entityState.attributes.friendly_name : '';
    const currentValue = entityState ? entityState.state : '';
    if (!this._isEditing && this._value !== currentValue) {
      this._value = currentValue;
    }
    const themeResult = this._getTheme();
    const themeClass = themeResult === 'off' ? 'off' : 'on';
    const showPlaceholder = !this._value && !this._isEditing;
    const borderRadius = this.config.border_radius || '10px';
    const icon = this.config.icon || 'mdi:magnify';
    return html`
      <div class="input-container ${themeClass}" \n
           style="width: ${this.config.width || '60vw'}; height: ${this.config.height || '8vw'};border-radius: ${borderRadius};">
        <div class="icon">
          <ha-icon icon="${icon}"></ha-icon>
        </div>
        <div class="input-wrapper">
          <input
            type="text"\n
            .value=${this._value}\n
            @input=${this._handleInput}\n
            @keydown=${this._handleKeyDown}\n
            @focus=${() => this._isEditing = true}\n
            @blur=${this._handleBlur}\n
            placeholder=" "
          />
          <div class="placeholder ${!showPlaceholder ? 'hidden' : ''}">${friendlyName}</div>
        </div>
      </div>
    `;
  }

  _handleInput(e) {
    this._value = e.target.value;
    this._isEditing = true;
  }

  _handleKeyDown(e) {
    if (e.key === 'Enter' && this.config.entity) {
      this._pendingSave = true;
      this._setEntityValue();
      this._isEditing = false;
      e.target.blur();
    }
  }

  _handleBlur() {
    this._isEditing = false;
    if (!this._pendingSave && this.config.entity) {
      this._setEntityValue();
    }
    this._pendingSave = false;
  }

  _setEntityValue() {
    if (!this.config.entity) return; 
    
    this.hass.callService('text', 'set_value', {
      entity_id: this.config.entity,
      value: this._value,
    });

  }

  setConfig(config) {
    this.config = config;
  }

  getCardSize() {
    return 1;
  }
}
customElements.define('xiaoshi-text-card', XiaoshiTextCard);
