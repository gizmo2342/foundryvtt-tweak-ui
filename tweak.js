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
  TweakUniqueCompendiumEntities.registerSettings();
  TweakUniqueCompendiumEntities.install();
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
      // NOTE: when called for a newly opened entity, "html" contains the outerHTML
      // when called on updates, "html" contains the innerHTML
      html.closest(".app").find(".window-header .import").hide();
    }
  }
}

class TweakUniqueCompendiumEntities {

  static get SETTINGS_KEY() { return "uniqueCompendiumEnities"; }

  static registerSettings() {
    // Register system settings
    game.settings.register(TweakVTT.SCOPE, TweakUniqueCompendiumEntities.SETTINGS_KEY, {
      name: "Unique Compendium Entities",
      hint: "Make compendium entity dialogs unique (only one dialog per entity).",
      scope: "client",
      config: true,
      default: true,
      type: Boolean
    });
  }

  static get enabled() {
    return game.settings.get(TweakVTT.SCOPE, TweakUniqueCompendiumEntities.SETTINGS_KEY);
  }

  static install() {
    this._fvttFn = Compendium.prototype.getEntity;
    Compendium.prototype.getEntity = TweakUniqueCompendiumEntities._getEntity;
  }

  static _getEntity(entryId) {
    // IMPORTANT: this function is called in the context of a Compendium instance,
    // therefore "this" will point to that instance!
    if (TweakUniqueCompendiumEntities.enabled) {
      const entity = TweakUniqueCompendiumEntities._findOpenEntity(this, entryId);
      if (entity) return entity;
    }
    return TweakUniqueCompendiumEntities._fvttFn.bind(this)(entryId);
  }

  static _findOpenEntity(pack, entryId) {
    const filtered = Object.values(ui.windows).filter(el => {
      if (!el.object) return false;
      if (el.object.data._id !== entryId) return false;
      if (el.object.compendium !== pack) return false;
      return true;
    });

    if (filtered.length > 0) return filtered[0].object;
    return undefined;
  }
}
