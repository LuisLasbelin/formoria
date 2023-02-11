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
    const item = this;

    // Initialize chat data.
    const speaker = ChatMessage.getSpeaker({ actor: this.actor });
    const rollMode = game.settings.get('core', 'rollMode');
    let label = `<h2>${item.name}</h2>`;

    // If there's no roll data, send a chat message.
    if (this.system.dice) {
      ChatMessage.create({
        speaker: speaker,
        rollMode: rollMode,
        flavor: label,
        content: item.system.description ?? ''
      });
    }
    // Otherwise, create a roll and send a chat message from it.
    else {
      // Retrieve roll data.
      const rollData = this.getRollData();
      let rollString = ""
      let traitsLabel = ""

      if (this.type === "weapon") {
        rollString = this.actor.system.skills[rollData.item.skill].current + "+" + rollData.item.attack;
        
        // Create label to show weapon traits
        for (let [k, v] of Object.entries(rollData.item.traits)) {
          let traitName = game.i18n.localize(CONFIG.FORMORIA.weaponTraits[v.name]+ ".label");
          let description = game.i18n.localize(CONFIG.FORMORIA.weaponTraits[v.name]+ ".description");
          let type = game.i18n.localize(CONFIG.FORMORIA.weaponTraits[v.name]+ ".type");
          traitsLabel += `<h3>${traitName} (${type})</h3><p>${description}</p>`
        }
      }
      else {
        rollString = rollData.item.dice;
      }
      // Invoke the roll and submit it to chat.
      const roll = new Roll(rollString, rollData);

      // If you need to store the value first, uncomment the next line.
      let result = await roll.roll({async: true});
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
  }

  calculateDamage(item, result) {
    // Damage calculations
    if(result > 2) {
      // get base damage
      let damage = parseInt(item.damage);
      // Calculate extra damage
      let extra = result - 5;
      let extradamage = 0
      if(extra > 0){
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
}
