/**
 * Author: Martin Brunninger
 * Software License: GNU GPLv3
 */

/* -------------------------------------------- */
/*  Foundry VTT Initialization                  */
/* -------------------------------------------- */

Hooks.once("init", async function() {

  TweakPauseIndicator.registerSettings();
  TweakPauseIndicator.install();
  TweakImportHeaderButton.registerSettings();
  TweakImportHeaderButton.install();
});

class TweakVTT {
  static get SCOPE() { return "tweak-vtt"; }
}

class TweakPauseIndicator {

  static get SETTINGS_KEY() { return "pausePosition"; }

  static registerSettings() {
    // Register system settings
    game.settings.register(TweakVTT.SCOPE, TweakPauseIndicator.SETTINGS_KEY, {
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
    return game.settings.get(TweakVTT.SCOPE, TweakPauseIndicator.SETTINGS_KEY);
  }

  static install() {
    Hooks.on("renderPause", async function() {
      const pos = TweakPauseIndicator.position;
      if (pos === "fvtt") return;

      let app = $.find("#pause");
      if (app && app[0]) {
        app = app[0];
        app.classList.add(`tweak-${pos}`);
      }
    });
  }
}

class TweakImportHeaderButton {

  static get SETTINGS_KEY() { return "importButton"; }

  static registerSettings() {
    // Register system settings
    game.settings.register(TweakVTT.SCOPE, TweakImportHeaderButton.SETTINGS_KEY, {
      name: "Hide Import Header Button",
      hint: "(World) Hide the Import button shown for compendium entities.",
      scope: "world",
      config: true,
      default: "noPermission",
      type: String,
      choices: { never: "Never", noPermission: "No Create Permission", always: "Always" },
      onChange: TweakImportHeaderButton.install
    });
  }

  static get choice() {
    return game.settings.get(TweakVTT.SCOPE, TweakImportHeaderButton.SETTINGS_KEY);
  }

  static get hide() {
    return ["noPermission", "always"].includes(TweakImportHeaderButton.choice);
  }

  static get hideAlways() {
    return "always" === TweakImportHeaderButton.choice;
  }

  static install() {
    if (TweakImportHeaderButton.hide) {
      Hooks.on("renderItemSheet", TweakImportHeaderButton._hideImportButton);
      Hooks.on("renderActorSheet", TweakImportHeaderButton._hideImportButton);
    }
    else {
      Hooks.off("renderItemSheet", TweakImportHeaderButton._hideImportButton);
      Hooks.off("renderActorSheet", TweakImportHeaderButton._hideImportButton);
    }
  }

  static _hideImportButton(sheet, html, data) {
    let permission = false;
    if (sheet instanceof ItemSheet) {
      permission = game.user.can("ITEM_CREATE");
    } else if (sheet instanceof ActorSheet) {
      permission = game.user.can("ACTOR_CREATE");
    }

    if (TweakImportHeaderButton.hideAlways || !permission) {
      html.find(".window-header .import").hide();
    }
  }
}

