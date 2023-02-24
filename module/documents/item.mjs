/**
 * Extend the basic Item with some very simple modifications.
 * @extends {Item}
 */
export class ForMoriaItem extends Item {
  /**
   * Augment the basic Item data model with additional dynamic data.
   */
  prepareData() {
    // As with the actor class, items are documents that can have their data
    // preparation methods overridden (such as prepareBaseData()).
    super.prepareData();
  }

  /**
   * Prepare a data object which is passed to any Roll formulas which are created related to this Item
   * @private
   */
  getRollData() {
    // If present, return the actor's roll data.
    if (!this.actor) return null;
    const rollData = this.actor.getRollData();
    // Grab the item's system data as well.
    rollData.item = foundry.utils.deepClone(this.system);

    return rollData;
  }

  /**
   * Handle clickable rolls.
   * @param {Event} event   The originating click event
   * @private
   */
  async roll() {
    console.log("Rolling!")

    const item = this;

    // Initialize chat data.
    const speaker = ChatMessage.getSpeaker({ actor: this.actor });
    const rollMode = game.settings.get('core', 'rollMode');
    let label = `<h2>${item.name}</h2>`;

    // Retrieve roll data.
    const rollData = this.getRollData();
    let rollString = ""
    let traitsLabel = ""

    if (this.type === "weapon") {
      rollString = this.actor.system.skills[rollData.item.skill].current + "+" + rollData.item.attack + "-" + this.actor.system.modifiers.danger;

      // Create label to show weapon traits
      rollData.item.traits.forEach(v => {
        let traitName = game.i18n.localize(CONFIG.FORMORIA.weaponTraits[v.name].label);
        let description = game.i18n.localize(CONFIG.FORMORIA.weaponTraits[v.name].description);
        let type = game.i18n.localize(CONFIG.FORMORIA.weaponTraitsTypes[v.type]);
        traitsLabel += `<h3>${traitName} (${type})</h3><p>${description}</p>`
      });
      // Invoke the roll and submit it to chat.
      const roll = new Roll(rollString, rollData);

      // If you need to store the value first, uncomment the next line.
      let result = await roll.roll({ async: true });
      roll.toMessage({
        speaker: speaker,
        rollMode: rollMode,
        flavor: label + traitsLabel,
      });

      // Damage calculations
      let totaldamage = this.calculateDamage(rollData.item, result.total)
      ChatMessage.create({
        speaker: speaker,
        rollMode: rollMode,
        flavor: label,
        content: `${game.i18n.localize('FORMORIA.Damage')}: ` + totaldamage
      });

      return roll;
    }

    if (this.type === "protection") {
      // Create label to show weapon traits
      rollData.item.traits.forEach(v => {
        let traitName = game.i18n.localize(CONFIG.FORMORIA.weaponTraits[v.name].label);
        let description = game.i18n.localize(CONFIG.FORMORIA.weaponTraits[v.name].description);
        let type = game.i18n.localize(CONFIG.FORMORIA.weaponTraitsTypes[v.type]);
        traitsLabel += `<h3>${traitName} (${type})</h3><p>${description}</p>`
      });

      let defenseLabel = `<h4>${game.i18n.localize('FORMORIA.Defence')}: ${rollData.item.defence}</h4>
      <h4>${game.i18n.localize('FORMORIA.Durability')}: ${rollData.item.durability.value}/ ${rollData.item.durability.max}</h4>`

      ChatMessage.create({
        speaker: speaker,
        rollMode: rollMode,
        flavor: label + traitsLabel + defenseLabel,
        content: ""
      });

      return;
    }

    // if it is not a weapon or an armor
    // then use the formula to roll
    if(this.type === "item") {
      rollString = item.system.formula
      // Invoke the roll and submit it to chat.
      const roll = new Roll(rollString, rollData);
  
      roll.toMessage({
        speaker: speaker,
        rollMode: rollMode,
        flavor: label
      });

      return;
    }
  } // roll()

  calculateDamage(item, result) {
    // Damage calculations
    if (result > 2) {
      // get base damage
      let damage = parseInt(item.damage);
      // Calculate extra damage
      let extra = result - 5;
      let extradamage = 0
      if (extra > 0) {
        extradamage = extra * item.extradamage;
      }
      // add up numbers
      let totaldamage = damage + extradamage;
      return totaldamage;
    }
    return 0
  }

  /**
   * Creates a new trait for the weapon
   * @param {*} data contains name which is the trait key
   */
  async addTrait(data) {
    const item = this
    let traits = item.system.traits
    traits.push({
      "name": data.name,
      "type": CONFIG.FORMORIA.weaponTraits[data.name].type
    });

    console.log(traits)

    await this.update({ ["system.traits"]: traits });
  }

  /**
   * Remove the last trait trait for the weapon
   */
  async removeTrait() {
    const item = this
    let traits = item.system.traits
    traits.pop()

    console.log(traits)

    await this.update({ ["system.traits"]: traits });
  }

  /**
   * Creates a new modifier for the item
   * @param {*} data contains name with {skill, modifier}
   */
  async addModifier(data) {
    const item = this
    let modifiers = item.system.modifiers
    modifiers.push({
      "mod": data.skill,
      "value": data.value
    });

    console.log(modifiers)

    await this.update({ ["system.modifiers"]: modifiers });
  }

  /**
   * Remove the last modifier for the weapon
   */
  async removeModifier() {
    const item = this
    let modifiers = item.system.modifiers
    modifiers.pop()

    console.log(modifiers)

    await this.update({ ["system.modifiers"]: modifiers });
  }
}
