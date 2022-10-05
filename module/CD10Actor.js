export default class CD10Actor extends Actor {
  async _preCreate(data, options, user) {
    this.setFlag("cd10", "stressing", false);

    return await super._preCreate(data, options, user);
  }

  prepareData() {
    super.prepareData();
  }

  prepareBaseData() {}

  prepareDerivedData() {
    const templateData = this.system;

    /* Create a value to use for tokens */
    templateData.wounds.token = parseInt(templateData.wounds.max - templateData.wounds.value);

    /* Update Traits totals */
    const traits = this._prepareTraits(this.items);

    templateData.traitsValue = traits.totalValue;
    templateData.posTraits = traits.pos;
    templateData.negTraits = traits.neg;

    /* Set debilitationtype and value */
    let debilitation = this._prepareDebilitation(templateData);

    debilitation.modifier += this.getStress ? 3 : 0;

    templateData.modifier = {
      type: "number",
      label: "Modifier",
      value: debilitation.modifier
    };

    templateData.debilitationType = {
      type: "string",
      label: "Debilitation",
      value: debilitation.type
    };
  }

  //  * Getters *

  get getSkills() {
    return this.items.filter(p => p.type === "skill");
  }

  get getSpells() {
    return this.items.filter(p => p.type === "spell");
  }

  get getTraits() {
    return this.items.filter(p => p.type === "trait");
  }

  get getArmor() {
    return this.system.gear.armor;
  }

  get getShield() {
    return this.system.gear.shield;
  }

  get getWeapon() {
    return this.system.gear.weapon;
  }

  get getWounds() {
    return parseInt(this.system.wounds);
  }

  get getModifier() {
    return parseInt(this.system.modifier);
  }

  get getExp() {
    return this.type === "major" ? parseInt(this.system.exp.total) : 0;
  }

  get getStress() {
    return this.getFlag("cd10", "stressing");
  }

  //   * Custom prepare methods *

  _prepareTraits(items) {
    let totalValue = 0;
    let pos = 0;
    let neg = 0;

    let totalTraits = items.filter(trait => trait.type === "trait");

    for (let i = 0; i < totalTraits.length; i++) {
      let adder = 0;
      adder = +parseInt(totalTraits[i].system.skillLevel);

      totalValue += adder;
    }

    totalTraits.forEach(p => {
      if (p.system.skillLevel > 0) {
        ++pos;
      } else {
        ++neg;
      }
    });

    return {
      totalValue: totalValue,
      pos: pos,
      neg: neg
    };
  }

  _prepareDebilitation(system) {
    /* This function calculates the proper modifier and debilitation type for a character */
    const wounds = system.wounds.value;
    const woundsModifier = Math.floor(wounds / 2);

    const physChecks = "on physical checks.";
    const allChecks = "on all checks.";
    const options = {
      2: `${physChecks}`,
      3: `${physChecks}`,
      4: `${physChecks}`,
      5: `${physChecks}`,
      6: `${allChecks}`,
      7: `${allChecks}`,
      8: `${allChecks}`,
      9: `${allChecks}`,
      10: `${allChecks}`,
      11: `${allChecks} DC 3.`,
      12: `${allChecks} DC 6.`,
      13: `${allChecks} DC 9.`,
      14: `${allChecks} DC 12.`,
      15: "You are dead!"
    };

    let debilitationType = `${options[wounds] || ""}`;

    return {
      modifier: woundsModifier,
      type: debilitationType
    };
  }

  async modifyExp(amount) {
    if (typeof amount !== "number") {
      ui.notifications.error("Not a number for Exp update!");
      return;
    }
    let currentExp = this.getExp;
    let newExp = currentExp + amount;

    await this.update({
      "system.exp.total": newExp
    });
  }

  async modifyWounds(amount) {
    if (typeof amount !== "number") {
      ui.notifications.error("Not a number for wounds update!");
      return;
    }
    const currentWounds = this.getWounds;
    let newWounds;

    if (amount > 0) {
      newWounds = Math.min(currentWounds + amount, this.system.wounds.max);
    } else if (amount < 0) {
      newWounds = Math.max(currentWounds - 1, 0);
    }

    await this.update({
      "system.wounds.value": newWounds
    });
  }

  async resetTraitSelection() {
    let traitArray = [];

    this.getTraits.forEach(t => {
      const itemUpdate = {
        _id: t.id,
        data: {
          selected: 0
        }
      };
      traitArray.push(itemUpdate);
    });

    await this.updateEmbeddedDocuments("Item", traitArray);
  }

  async toggleStress() {
    const currentValue = this.getStress();
    this.setFlag("cd10", "stressing", !currentValue);
  }
}
