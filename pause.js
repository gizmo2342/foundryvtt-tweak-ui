/**
 * Author: Martin Brunninger
 * Software License: GNU GPLv3
 */

class TweakPauseIndicator {

  static registerSettings() {
    // TODO: Verschiebung Pause-Markierer wäre ein Kandidat für ein TweakVTT Modul
    // Register system settings
    game.settings.register("tweak-vtt", "pausePosition", {
      name: "Game Pause Indicator Position",
      hint: "Adjust position of game pause indicator.",
      scope: "client",
      config: true,
      default: "fvtt",
      type: String,
      choices: { fvtt: "FVTT default", centered: "Centered", top: "Top" },
      onChange: pos => ui.pause.render()
    });
  }

  static get position() {
    return game.settings.get("tweak-vtt", "pausePosition");
  }
}

Hooks.on("renderPause", async function() {
  const pos = TweakPauseIndicator.position;
  if (pos === "fvtt") return;

  let app = $.find("#pause");
  if (app && app[0]) {
    app = app[0];
    app.classList.add(`tweak-${pos}`);
  }
});
