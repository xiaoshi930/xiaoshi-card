console.info("%c 消逝集合卡 \n%c   v 2.9.6 ", "color: red; font-weight: bold; background: black", "color: white; font-weight: bold; background: dimgray");

import { cardConfigs } from './xiaoshi-config.js';

const loadCards  = async () => {
    await import('./xiaoshi-climate-card.js');
    await import('./xiaoshi-computer-card.js');
    await import('./xiaoshi-light-card.js');
    await import('./xiaoshi-switch-card.js');
    await import('./xiaoshi-image-card.js');
    await import('./xiaoshi-video-card.js');
    await import('./xiaoshi-slider-card.js');
    await import('./xiaoshi-text-card.js');
    await import('./xiaoshi-time-card.js');
    await import('./xiaoshi-grid-card.js');
    await import('./xiaoshi-lunar-card.js');
    await import('./xiaoshi-stategrid-card.js');
    
    window.customCards = window.customCards || [];
    window.customCards.push(...cardConfigs);
};

loadCards ();
