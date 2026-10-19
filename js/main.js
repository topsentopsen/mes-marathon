// MES-Marathon: Start und Spielschleife
'use strict';
(function (SC) {
  let last = performance.now();
  function frame(t) {
    const dt = Math.min(0.1, (t - last) / 1000); last = t;
    const s = SC.S, UI = SC.ui;
    if (s && s.phase === 'tag' && !UI.paused && !UI.overlayOpen()) {
      SC.sim.advance(s, dt * SC.MIN_PER_SEC * UI.speed);
      UI.tick();
    }
    if (!UI.overlayOpen() && !UI.paused) SC.building.update(dt * Math.min(UI.speed, 2), UI.openRoom);
    SC.building.draw(s ? s.minute : 12 * 60);
    UI.hud();
    requestAnimationFrame(frame);
  }
  window.addEventListener('DOMContentLoaded', () => {
    SC.building.init(document.getElementById('cv'));
    SC.ui.init();
    SC.ui.showTitle();
    requestAnimationFrame(frame);
  });
  SC.debug = { state: () => SC.S, newGame: seed => SC.ui.newGame(seed), endDay: () => SC.ui.endDay() };
})(window.SC);
