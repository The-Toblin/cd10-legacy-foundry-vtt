import * as Dice from "../dice.js";

export default class CD10NamedCharacterSheet extends ActorSheet {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      template: "systems/cd10/templates/sheets/namedCharacter-sheet.hbs",
      classes: ["cd10", "sheet", "namedCharacter"],
      height: 750,
      width: 750,
      tabs: [
        {
          navSelector: ".sheet-tabs",
          contentSelector: ".sheet-body",
          initial: "biography",
        },
      ],
    });
  }

  /* Define which template to be used by this actor type. */
  get template() {
    return `systems/cd10/templates/sheets/namedCharacter-sheet.hbs`;
  }

  /**********************
   * Define ContextMenus *
   **********************/

  /* This menu applies to equipment that can be put on a character.
    It allows you to edit, equip/unequip or delete an item. */
  equippableItemContextMenu = [
    {
      name: game.i18n.localize("cd10.sheet.edit"),
      icon: '<i class="fas fa-edit"></i>',
      callback: (element) => {
        const itemId = element.data("item-id");
        const item = this.actor.items.get(itemId);

        item.sheet.render(true);
      },
    },
    {
      name: game.i18n.localize("cd10.sheet.equip"),
      icon: '<i class="far fa-caret-square-up"></i>',

      callback: (element) => {
        const itemId = element.data("item-id");
        const item = this.actor.items.get(itemId);
        let boolValue = item.data.data.isEquipped.value;

        item.update({
          data: {
            isEquipped: {
              value: !boolValue,
            },
          },
        });
      },
    },
    {
      name: game.i18n.localize("cd10.sheet.remove"),
      icon: '<i class="fas fa-trash"></i>',
      callback: (element) => {
        this.actor.deleteEmbeddedDocuments("Item", [element.data("item-id")]);
      },
    },
  ];

  /* This menu is applied to only skills in the skill-menu.
    It allows you to edit, toggle the levelup indicator
    or remove a skill. */
  itemSkillContextMenu = [
    {
      name: game.i18n.localize("cd10.sheet.edit"),
      icon: '<i class="fas fa-edit"></i>',
      callback: (element) => {
        const itemId = element.data("item-id");
        const item = this.actor.items.get(itemId);

        item.sheet.render(true);
      },
    },
    {
      name: game.i18n.localize("cd10.sheet.levelUp"),
      icon: '<i class="fas fa-angle-double-up"></i>',
      callback: (element) => {
        const itemId = element.data("item-id");
        const item = this.actor.items.get(itemId);

        let levelUpValue = item.data.data.levelUp.value;

        item.update({
          "data.levelUp.value": !levelUpValue,
        });
      },
    },
    {
      name: game.i18n.localize("cd10.sheet.remove"),
      icon: '<i class="fas fa-trash"></i>',
      callback: (element) => {
        this.actor.deleteEmbeddedDocuments("Item", [element.data("item-id")]);
      },
    },
  ];

  itemContextMenu = [
    {
      name: game.i18n.localize("cd10.sheet.edit"),
      icon: '<i class="fas fa-edit"></i>',
      callback: (element) => {
        const itemId = element.data("item-id");
        const item = this.actor.items.get(itemId);

        item.sheet.render(true);
      },
    },
    {
      name: game.i18n.localize("cd10.sheet.remove"),
      icon: '<i class="fas fa-trash"></i>',
      callback: (element) => {
        this.actor.deleteEmbeddedDocuments("Item", [element.data("item-id")]);
      },
    },
  ];

  getData() {
    /* Override default getData() function */
    let sheetData = super.getData();
    sheetData.config = CONFIG.cd10;
    sheetData.data = sheetData.data.data;

    /* Sort items alphabetically */
    sheetData.items.sort(function (a, b) {
      return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
    });

    /* Create subproperties for item types */
    sheetData.ammunition = sheetData.items.filter(
      (p) => p.type === "ammunition"
    );
    sheetData.allArmors = sheetData.items.filter(
      (p) => p.type === "armor" || p.type === "shield"
    );
    sheetData.armors = sheetData.items.filter((p) => p.type === "armor");
    sheetData.shields = sheetData.items.filter((p) => p.type === "shield");
    sheetData.allWeapons = sheetData.items.filter(
      (p) => p.type === "meleeWeapon" || p.type === "rangedWeapon"
    );
    sheetData.meleeWeapons = sheetData.items.filter(
      (p) => p.type === "meleeWeapon"
    );
    sheetData.rangedWeapons = sheetData.items.filter(
      (p) => p.type === "rangedWeapon"
    );
    sheetData.skills = sheetData.items.filter((p) => p.type == "skill");
    sheetData.traits = sheetData.items.filter((p) => p.type == "trait");
    sheetData.posTraits = sheetData.traits.filter((p) => {
      if (p.data.skillLevel.value > 0) {
        return p;
      }
    });
    sheetData.negTraits = sheetData.traits.filter((p) => {
      if (p.data.skillLevel.value < 0) {
        return p;
      }
    });
    sheetData.spells = sheetData.items.filter((p) => p.type == "spell");
    sheetData.normalItems = sheetData.items.filter(
      (p) =>
        p.type != "spell" &&
        p.type != "skill" &&
        p.type != "trait" &&
        p.type != "meleeWeapon" &&
        p.type != "armor" &&
        p.type != "rangedWeapon" &&
        p.type != "shield"
    );

    /* Used for selecting skills for weapons. */
    sheetData.worldSkills = game.items.filter((p) => {
      if (p.type === "skill") {
        return p.name;
      }
    });

    /* The following is to detect if certain things are equipped, and thus toggle certain parts of the sheet on or off. */
    sheetData.equippedMeleeWeapon = false;
    sheetData.meleeWeapons.forEach((w) => {
      if (w.data.isEquipped.value) {
        sheetData.equippedMeleeWeapon = true;
      }
    });

    sheetData.equippedRangedWeapon = false;
    sheetData.rangedWeapons.forEach((w) => {
      if (w.data.isEquipped.value) {
        sheetData.equippedRangedWeapon = true;
      }
    });

    sheetData.equippedArmor = false;
    sheetData.armors.forEach((a) => {
      if (a.data.isEquipped.value) {
        sheetData.equippedArmor = true;
      }
    });

    sheetData.equippedShield = false;
    sheetData.shields.forEach((s) => {
      if (s.data.isEquipped.value) {
        sheetData.equippedShield = true;
      }
    });

    /* Make system settings available for sheets to use for rendering */
    sheetData.damageTypeSetting = game.settings.get(
      "cd10",
      "systemDamageTypes"
    );
    sheetData.barterSetting = game.settings.get("cd10", "systemBarter");
    sheetData.modernity = game.settings.get("cd10", "systemModernity");

    return sheetData;
  }

  activateListeners(html) {
    /* Owner-only listeners */
    if (this.actor.isOwner) {
      /*html.find(".item-roll").click(this._onItemRoll.bind(this));*/
      html.find(".task-check").click(this._onTaskCheck.bind(this));
      html.find(".attack-check").click(this._simpleAttackCheck.bind(this));
      html.find(".physical-save").click(this._onPhysicalSave.bind(this));
      html
        .find(".reveal-rollable")
        .on("mouseover mouseout", this._onToggleRollable.bind(this));
      html.find(".stressBox").click(this._stressBoxClicked.bind(this));
      html.find(".inline-edit").change(this._onSkillEdit.bind(this));
      html.find(".item-delete").click(this._onItemDelete.bind(this));
      html.find(".item-equip").click(this._onItemEquip.bind(this));
      html.find(".ammo-select").click(this._onAmmoSelect.bind(this));
      html.find(".skill-item").click(this._toggleSkillUp.bind(this));
      html
        .find(".shock-icons")
        .on("click contextmenu", this._onShockMarkChange.bind(this));
      html
        .find(".wounds-icons")
        .on("click contextmenu", this._onWoundsMarkChange.bind(this));
      html
        .find(".select-trait")
        .on("click contextmenu", this._onClickTrait.bind(this));

      /* ContextMenu listeners */
      new ContextMenu(html, ".weapon-card", this.equippableItemContextMenu);
      new ContextMenu(html, ".armor-card", this.equippableItemContextMenu);
      new ContextMenu(
        html,
        ".equippable-inventory-item",
        this.equippableItemContextMenu
      );
      new ContextMenu(html, ".inventory-item", this.itemContextMenu);
      new ContextMenu(html, ".skill-item", this.itemSkillContextMenu);
    }

    /* General listeners */
    /*html.find(".item-create").click(this._onItemCreate.bind(this));*/

    super.activateListeners(html);
  }

  /****************************
   * Various checks and saves *
   ***************************/

  async _onAmmoSelect(event) {
    let ammoObj = this.actor.items.get(
        event.currentTarget.closest(".ammo-selector").dataset.itemId
      ),
      weaponObj = this.actor.items.get(
        event.currentTarget.closest(".ammo-selector").dataset.weaponId
      );

    if (weaponObj.data.data.selectedAmmo.id === ammoObj.id) {
      await weaponObj.update({
        "data.selectedAmmo": {
          value: "None",
          id: "None",
        },
      });
    } else {
      await weaponObj.update({
        "data.selectedAmmo": {
          value: ammoObj.name,
          id: ammoObj.id,
        },
      });
    }
  }

  async _onTaskCheck(event) {
    /* Method to handle a simple skill check. */
    event.preventDefault();

    /* If a hero point is spent, check if there's enough points.
        Otherwise cancel the check. */
    if (event.shiftKey) {
      if (this._checkHeroPoints() === false) {
        return;
      }
    }

    /* Fetch the skill, based on ItemId. */
    let skillObj = this.actor.items.get(
      event.currentTarget.closest(".item").dataset.itemId
    );

    /* Dump the skill description to chat. */
    if (game.settings.get("cd10", "systemDumpDescriptions")) {
      skillObj.roll();
    }

    let traitObj = null,
      traitReversed = false;

    this.actor.items.forEach((t) => {
      if (t.type === "trait") { 
        if (t.data.data.selected === 1) {
          traitObj = t;
          traitReversed = false;
        } else if (t.data.data.selected === 2) {
          traitObj = t;
          traitReversed = true;
        }
      }
    });

    /* Perform the check */
    Dice.TaskCheck({
      checkType: "Simple",
      skillObj: skillObj,
      traitObj: traitObj,
      traitReversed: traitReversed,
      modifier: this.actor.getModifier,
      heroPoint: event.shiftKey,
      actor: this.actor.id,
    });
    /* Reset traits. */
    this.actor.resetTraitSelection();
  }

  async _simpleAttackCheck(event) {
    /* Attack check performed by left-clicking a damage value on a weapon card */
    event.preventDefault();

    /* If a hero point is spent, check if there's enough points. */
    if (event.shiftKey) {
      if (this._checkHeroPoints() === false) {
        return;
      }
    }

    let damageType = event.currentTarget.dataset.damageType,
      weaponObj = this.actor.items.get(
        event.currentTarget.closest(".item").dataset.itemId
      ).data,
      attackSkill = weaponObj.data.attackSkill.value;

    let attackSkillObj = null;
    this.actor.items.forEach((i) => {
      if (i.type === "skill") {
        if (i.data.data.matchID === weaponObj.data.attackSkill.value) {
          attackSkillObj = i;
        }
      }
    });

    if (attackSkill === "None") {
      ui.notifications.error(
        `Error! ${weaponObj.name} does not have an assigned skill!`
      );
    }
    /* Check if it's a ranged weapon */
    if (weaponObj.type === "rangedWeapon") {
      let ammo = this.actor.items.get(weaponObj.data.selectedAmmo.id);
      if (ammo.data.data.damage.slash.selected) {
        damageType = "slash";
      } else if (ammo.data.data.damage.pierce.selected) {
        damageType = "pierce";
      } else if (ammo.data.data.damage.blunt.selected) {
        damageType = "blunt";
      } else if (ammo.data.data.damage.energy.selected) {
        damageType = "energy";
      }
    }

    let traitObj = null,
      traitReversed = false;
    this.actor.items.forEach((t) => {
      if (t.type === "trait") {
        if (t.data.data.selected === 1) {
          traitObj = t;
          traitReversed = false;
        } else if (t.data.data.selected === 2) {
          traitObj = t;
          traitReversed = true;
        }
      }
    });

    /* Perform the attack check */
    Dice.TaskCheck({
      actor: this.actor.id,
      checkType: "SimpleAttack",
      skillObj: attackSkillObj,
      traitObj: traitObj,
      traitReversed: traitReversed,
      weaponObj: weaponObj,
      damageType: damageType,
      heroPoint: event.shiftKey,
      modifier: this.actor.getModifier,
    });

    /* Reset traits. */
    this.actor.resetTraitSelection();
  }

  async _onPhysicalSave(event) {
    /* Open the physical saves dialog */
    event.preventDefault();

    let dialogOptions = {
      classes: ["cd10-dialog", "physical-save-dialog"],
      top: 300,
      left: 400,
    };
    new Dialog(
      {
        title: "Physical Save",
        content: await renderTemplate(
          "systems/cd10/templates/partials/physical-save-dialog.hbs",
          this.getData()
        ),
        buttons: {
          roll: {
            label: "Save!",
            callback: (html) => this._doSaveStuff(html),
          },
        },
      },
      dialogOptions
    ).render(true);
  }

  async _doSaveStuff(html) {
    /* Perform a physical save, called from the physical save dialog.
        This function is complex and deals with gathering the data for
        the roll, as well as responding to the result and doing the
        actor updates for wounds and shock. */

    let traitObj,
      armor = null,
      shield = null,
      usingShield = false;

    /* First, we check if traits were selected in the dialog or not and
        if so, fetch the relevant objects. */
    if (html.find("select#trait-selected").val() != "None") {
      traitObj = this.actor.items.get(
        this.getData().traits[html.find("select#trait-selected").val()]._id
      );
    }

    /* Check if any of the checkboxes were ticked, as well as gather
        the necessary data for the check. */
    let heroPointChecked = html.find("input#heroPoint")[0].checked,
      reverseTraitChecked = html.find("input#reverseTrait")[0].checked,
      lethality = parseInt(html.find("input#lethality").val()) || 0,
      shock = parseInt(html.find("input#shock").val()) || 0,
      damageType = html.find("select#damage-type").val() || "slash";

    if (!lethality > 0) {
      ui.notifications.error(`Please select a non-zero value for Lethality!`);
      return;
    }

    /* If a hero point is spent, check if there's enough points.
        Otherwise cancel the check. */
    if (heroPointChecked) {
      if (this._checkHeroPoints() === false) {
        return;
      }
    }

    /* Check which armor is being worn on the applicable body part,
        if so, fetch the relevant object. */
    this.getData().armors.forEach((a) => {
      if (a.data.isEquipped.value) {
        armor = a;
      }
    });

    /* Check if a shield is equipped, if so, fetch the relevant object. */
    if (html.find("input#parried")[0].checked) {
      this.getData().shields.forEach((s) => {
        if (s.data.isEquipped.value) {
          shield = s;
          usingShield = true;
        }
      });
    }
    /* Roll the actual check. */
    Dice.TaskCheck({
      checkType: "Save",
      traitObj: traitObj,
      heroPoint: heroPointChecked,
      traitReversed: reverseTraitChecked,
      armorObj: armor,
      shieldObj: shield,
      usingShield: usingShield,
      damageType: damageType,
      lethality: lethality,
      shock: shock,
      actor: this.actor.id,
    });

    /* Reset traits. */
    this.actor.resetTraitSelection();
  }

  _onItemRoll(item) {
    if (game.settings.get("cd10", "systemDumpDescriptions")) {
      item.roll();
    }
  }

  /******************
   * Sheet functions *
   ******************/

  _onToggleRollable(event) {
    /* JS to reveal 'hidden' CSS classes that are marked 'rollable' */
    event.preventDefault();

    const rollables = event.currentTarget.getElementsByClassName("rollable");
    $.each(rollables, function (index, value) {
      $(value).toggleClass("hidden");
    });
  }

  _onItemCreate(event) {
    /* Remnant function for creating items directly on the sheet. Not actively used anymore. */
    event.preventDefault();
    let element = event.currentTarget;

    let itemData = {
      name: game.i18n.localize("cd10.sheet.newItem"),
      type: element.dataset.type,
    };

    return this.actor.createEmbeddedDocuments("Item", [itemData]);
  }

  _onItemEdit(event) {
    /* Called when updating items on the sheet */
    event.preventDefault();

    let element = event.currentTarget;
    let itemId = element.closest(".item").dataset.itemId;
    let item = this.actor.items.get(itemId);

    item.sheet.render(true);
  }

  async _onItemDelete(event) {
    /* Enable item deletion from the sheet. */
    event.preventDefault();

    let element = event.currentTarget;
    let itemId = element.closest(".item").dataset.itemId;
    const item = this.actor.items.get(itemId);

    await this.actor.deleteEmbeddedDocuments("Item", [itemId]);
  }

  async _onItemEquip(event) {
    /* Functionality for toggling the isEquipped state of an item */
    event.preventDefault();

    let element = event.currentTarget;
    let itemId = element.closest(".item").dataset.itemId;
    const item = this.actor.items.get(itemId);

    let boolValue = item.data.data.isEquipped.value;

    await item.update({
      "data.isEquipped.value": !boolValue,
    });
  }

  async _onSkillEdit(event) {
    /* Somewhat overengineered function, remnant from when skills and traits
        could be created directly on the character sheet. Now just used to update
        the actual skillLevel. */
    event.preventDefault();

    if (!this.isEditable) {
      return;
    }

    const element = event.currentTarget;
    const itemId = element.closest(".item").dataset.itemId;
    const item = this.actor.items.get(itemId);
    const field = element.dataset.field;

    await item.update({
      [field]: element.value,
    });
  }

  _onShockMarkChange(event) {
    /* Listen for changes to Shock and update the value accordingly. */
    event.preventDefault();

    if (event.type == "click") {
      this.actor.modifyShock(1);
    } else {
      this.actor.modifyShock(-1);
    }
  }

  _onWoundsMarkChange(event) {
    /* Listen for changes to Wounds and update the value accordingly. */
    event.preventDefault();

    if (event.type == "click") {
      this.actor.modifyWounds(1);
    } else {
      this.actor.modifyWounds(-1);
    }
  }

  _stressBoxClicked(event) {
    /* Monitor the stress button and set the stressed status accordingly. */
    event.preventDefault();

    let value = this.actor.data.data.stressing.value;

    this.actor.update({
      "data.stressing.value": !value,
    });
  }
  _checkHeroPoints() {
    if (this.actor.getExp > 0) {
      this.actor.modifyExp(-1);
      return true;
    } else {
      ui.notifications.error(
        `${this.actor.name} does not have enough experience.`
      );
      return false;
    }
  }

  async _toggleSkillUp(event) {
    event.preventDefault();
    let element = event.currentTarget;
    let itemId = element.closest(".item").dataset.itemId;
    let item = this.actor.items.get(itemId);

    let levelUpValue = item.data.data.levelUp.value;

    await item.update({
      "data.levelUp.value": !levelUpValue,
    });
  }

  async _onClickTrait(event) {
    event.preventDefault();
    let element = event.currentTarget;
    let itemId = element.closest(".item").dataset.itemId;
    let item = this.actor.items.get(itemId);

    if (item.getSelectionStatus === 1 || item.getSelectionStatus === 2) {
      item.setSelectionStatus(0);
      return;
    }

    await this.actor.resetTraitSelection();

    if (event.type == "click") {
      item.setSelectionStatus(1);
    } else {
      item.setSelectionStatus(2);
    }
    return;
  }
}
