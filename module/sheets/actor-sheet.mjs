import { onManageActiveEffect, prepareActiveEffectCategories } from "../helpers/effects.mjs";

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class ForMoriaActorSheet extends ActorSheet {

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["formoria", "sheet", "actor"],
      template: "systems/formoria/templates/actor/actor-sheet.hbs",
      width: 600,
      height: 600,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "skills" }]
    });
  }

  /** @override */
  get template() {
    return `systems/formoria/templates/actor/actor-${this.actor.type}-sheet.hbs`;
  }

  /* -------------------------------------------- */

  /** @override */
  getData() {
    // Retrieve the data structure from the base sheet. You can inspect or log
    // the context variable to see the structure, but some key properties for
    // sheets are the actor object, the data object, whether or not it's
    // editable, the items array, and the effects array.
    const context = super.getData();

    // Use a safe clone of the actor data for further operations.
    const actorData = this.actor.toObject(false);

    // Add the actor's data to context.data for easier access, as well as flags.
    context.system = actorData.system;
    context.flags = actorData.flags;

    // Prepare character data and items.
    if (actorData.type == 'character') {
      this._prepareItems(context);
      this._prepareCharacterData(context);
    }
    if (actorData.type == 'enemy') {
      this._prepareEnemy(context);
    }

    // Add roll data for TinyMCE editors.
    context.rollData = context.actor.getRollData();

    // Prepare active effects
    context.effects = prepareActiveEffectCategories(this.actor.effects);

    console.log(actorData);

    return context;
  }

  /**
   * Organize and classify Items for Character sheets.
   *
   * @param {Object} actorData The actor to prepare.
   *
   * @return {undefined}
   */
  _prepareCharacterData(context) {
    // Handle skills labels.
    for (let [k, v] of Object.entries(context.system.skills)) {
      v.label = game.i18n.localize(CONFIG.FORMORIA.skills[k]) ?? k;
    }
    // Hanlde skill iconss
    for (let [k, v] of Object.entries(context.system.skills)) {
      v.icon = CONFIG.FORMORIA.skillIcons[k] ?? k;
      // set dice icons in the skill
      CONFIG.FORMORIA.dice.forEach(dice => {
        if (dice.label == v.max) v.diceIcon = dice.icon
      });
    }
  }

  /**
   * Organize and classify Items for Character sheets.
   *
   * @param {Object} actorData The actor to prepare.
   *
   * @return {undefined}
   */
  _prepareItems(context) {
    // Initialize containers.
    const gear = [];
    const weapons = [];
    const features = [];
    const protections = [];
    const dice = CONFIG.FORMORIA.dice

    // Iterate through items, allocating to containers
    for (let i of context.items) {
      i.img = i.img || DEFAULT_TOKEN;
      // Append to gear.
      if (i.type === 'item') {
        gear.push(i);
      }
      if (i.type === 'weapon') {
        i.system.skillLabel = game.i18n.localize(CONFIG.FORMORIA.skills[i.system.skill]) ?? i.system.skill;
        i.system.traits.forEach(trait => {
          trait.label = game.i18n.localize(CONFIG.FORMORIA.weaponTraits[trait.name].label)
        });
        weapons.push(i);
      }
      if (i.type === 'protection') {
        i.system.traits.forEach(trait => {
          trait.label = game.i18n.localize(CONFIG.FORMORIA.weaponTraits[trait.name].label)
        });
        protections.push(i);
      }
      // Append to features.
      else if (i.type === 'feature') {
        features.push(i);
      }
    }

    // Assign and return
    context.dice = dice;
    context.protections = protections;
    context.gear = gear;
    context.weapons = weapons;
    context.features = features;
  }

  _prepareEnemy(context) {
    let dangers = {}
    // Add danger to enemy creation
    for (let [k, v] of Object.entries(CONFIG.FORMORIA.danger)) {
      dangers[k] = {
        "label": game.i18n.localize(CONFIG.FORMORIA.danger[k].label) ?? k,
        "value": CONFIG.FORMORIA.danger[k].value
      }
    }
    // add to the sheet
    context.dangers = dangers
    context.danger = dangers[context.system.danger]
    console.log("Enemy prepared")
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Render the item sheet for viewing/editing prior to the editable check.
    html.find('.item-edit').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(li.data("itemId"));
      item.sheet.render(true);
    });

    // -------------------------------------------------------------
    // Everything below here is only needed if the sheet is editable
    if (!this.isEditable) return;

    // Add Inventory Item
    html.find('.item-create').click(this._onItemCreate.bind(this));

    // Delete Inventory Item
    html.find('.item-delete').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(li.data("itemId"));
      item.delete();
      li.slideUp(200, () => this.render(false));
    });

    // Active Effect management
    html.find(".effect-control").click(ev => onManageActiveEffect(ev, this.actor));

    // Rollable abilities.
    html.find('.rollable').click(this._onRoll.bind(this));

    // Restore and edit skills button
    html.find('.restore').click(this._onRestorePressed.bind(this))
    html.find('.edit').click(this._onEditPressed.bind(this))

    // Drag events for macros.
    if (this.actor.isOwner) {
      let handler = ev => this._onDragStart(ev);
      html.find('li.item').each((i, li) => {
        if (li.classList.contains("inventory-header")) return;
        li.setAttribute("draggable", true);
        li.addEventListener("dragstart", handler, false);
      });
    }
  }

  /**
   * Handle restoration of skills and stunt when someone uses battle cry
   * @param {*} event 
   */
  _onRestorePressed(event) {
    event.preventDefault();

    let skills = this.actor.system.skills
    console.log(skills)
    for (const key in skills) {
      skills[key].current = skills[key].max
    }
    this.actor.update({ ["system.skills"]: skills });
    this.actor.update({ ["system.stunt"]: true })

    let chatData = {
      user: game.user._id,
      speaker: this.actor.name,
      content: `<h2>${this.actor.name}</h2><p>${game.i18n.localize('FORMORIA.msgRestoredSkills')}</p>`
    };
    ChatMessage.create(chatData, {});
  }

  async _onEditPressed(event) {
    event.preventDefault();

    const formData = await this.handleEditSkillsDialog()
    // when it is finished and update the actor
    for (const key in formData) {
      this.actor.update({ [`system.skills.${key}.max`]: formData[key] })
    }
  }

  async handleEditSkillsDialog() {

    this._prepareCharacterData(this.actor)

    const data = {
      system: this.actor.system,
      dice: CONFIG.FORMORIA.dice,
      skills: this.actor.system.skills
    }

    const editSkillsDialog = await renderTemplate('systems/formoria/templates/actor/parts/actor-skills-edit.hbs', data);

    return new Promise((resolve, reject) => {
      new Dialog({
        title: "Edit Skills",
        content: editSkillsDialog,
        buttons: {
          submit: {
            label: "Submit", callback: (html) => {
              const formData = new FormDataExtended(html[0].querySelector('form')).toObject()

              resolve(formData);
            }
          },
          cancel: { label: "Cancel", callback: (html) => { reject("Editing cancel") } },
        },
        render: (html) => {
          for (const key in this.actor.system.skills) {
            let input = html[0].querySelector(`[name="${key}"]`)
            input.value = this.actor.system.skills[key].max
          }
        },
      }).render(true)
    })
  }

  /**
   * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
   * @param {Event} event   The originating click event
   * @private
   */
  async _onItemCreate(event) {
    event.preventDefault();
    const header = event.currentTarget;
    // Get the type of item to create.
    const type = header.dataset.type;
    // Grab any data associated with this control.
    const data = duplicate(header.dataset);
    // Initialize a default name.
    const name = `New ${type.capitalize()}`;
    // Prepare the item object.
    const itemData = {
      name: name,
      type: type,
      system: data
    };
    // Remove the type from the dataset since it's in the itemData.type prop.
    delete itemData.system["type"];

    // Finally, create the item!
    return await Item.create(itemData, { parent: this.actor });
  }

  /**
   * Handle clickable rolls.
   * @param {Event} event   The originating click event
   * @private
   */
  async _onRoll(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;

    // Handle item rolls.
    if (dataset.rollType) {
      if (dataset.rollType == "loot") {
        let roll = new Roll(`1d20+${this.actor.system.modifiers.loot}`);
        // Store the result
        let result = await roll.roll({ async: true });
        // Check in the FORMORIA.Loot object which result is it
        let resultText = this.checkLoot(result);
        roll.toMessage({
          speaker: ChatMessage.getSpeaker({ actor: this.actor }),
          flavor: `<h3>${resultText}</h3>`,
          rollMode: game.settings.get('core', 'rollMode'),
        });
        return;
      }

      if (dataset.rollType == 'item') {
        const itemId = element.closest('.item').dataset.itemId;
        const item = this.actor.items.get(itemId);
        if (item) return item.roll();
      }

      if (dataset.rollType == 'weapon' || dataset.rollType == "protection") {
        console.log("Rolling weapon")
        const itemId = element.closest('.item').dataset.itemId;
        const item = this.actor.items.get(itemId);
        if (item) return item.roll();
      }

      if (dataset.rollType == 'battlecry') {
        let message = game.i18n.localize('FORMORIA.Shouts')
        let chatData = {
          user: game.user._id,
          speaker: this.actor.name,
          content: `<h2>${this.actor.name}</h2><p>${message}</p>`
        };

        ChatMessage.create(chatData, {});
      }

      if (dataset.rollType == 'skill') {
        console.log("Rolling skill " + dataset.skill + " for " + this.actor.name)

        let mod = 0

        this.actor.items.forEach(item => {
          if (item.type == "protection") {
            for (let i = 0; i < Object.keys(item.system.modifiers).length; i++) {
              if (item.system.modifiers[i].mod == dataset.skill) {
                mod = item.system.modifiers[i].value
              }
            }
          }
        });

        let roll
        const t1 = new Die({ number: 1, faces: parseInt(this.actor.system.skills[dataset.skill].current.split("d")[1]) });
        if (mod > 0) {
          const plus = new OperatorTerm({ operator: "+" });
          const t2 = new NumericTerm({ number: mod });
          const minus = new OperatorTerm({ operator: "-" });
          const t3 = new NumericTerm({ number: this.actor.system.modifiers.danger });
          roll = Roll.fromTerms([t1, plus, t2, minus, t3]);
        }
        else if (mod < 0) {
          const t2 = new NumericTerm({ number: mod });
          const minus = new OperatorTerm({ operator: "-" });
          const t3 = new NumericTerm({ number: this.actor.system.modifiers.danger });
          roll = Roll.fromTerms([t1, t2, minus, t3]);
        }
        else {
          const minus = new OperatorTerm({ operator: "-" });
          const t3 = new NumericTerm({ number: this.actor.system.modifiers.danger });
          roll = Roll.fromTerms([t1, minus, t3]);
        }

        let label = dataset.label;
        roll.toMessage({
          speaker: ChatMessage.getSpeaker({ actor: this.actor }),
          flavor: label,
          rollMode: game.settings.get('core', 'rollMode'),
        });
        return roll;
      }
    }

    // Handle rolls that supply the formula directly.
    if (dataset.roll) {
      let label = dataset.label ? `[roll] ${dataset.label}` : '';
      let roll = new Roll(dataset.roll, this.actor.getRollData());
      roll.toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        flavor: label,
        rollMode: game.settings.get('core', 'rollMode'),
      });
      return roll;
    }
  }

  checkLoot(rollresult) {
    let lastkey = ""
    console.log(rollresult)
    for (const key in CONFIG.FORMORIA.loot) {
      if (rollresult.total < key) {
        if (lastkey != "") {
          return game.i18n.localize(CONFIG.FORMORIA.loot[lastkey].result)
        } else {
          return game.i18n.localize(CONFIG.FORMORIA.loot["1"].result)
        }
      }
      // if not, save the last key
      lastkey = key
    }
    return game.i18n.localize(CONFIG.FORMORIA.loot["21"].result)
  }
}
