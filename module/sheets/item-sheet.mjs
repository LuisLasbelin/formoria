/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {ItemSheet}
 */
export class ForMoriaItemSheet extends ItemSheet {

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["formoria", "sheet", "item"],
      width: 520,
      height: 480,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description" }]
    });
  }

  /** @override */
  get template() {
    const path = "systems/formoria/templates/item";
    // Return a single sheet for all item types.
    // return `${path}/item-sheet.html`;

    // Alternatively, you could use the following return statement to do a
    // unique item sheet by type, like `weapon-sheet.html`.
    return `${path}/item-${this.item.type}-sheet.hbs`;
  }

  /* -------------------------------------------- */

  /** @override */
  getData() {
    // Retrieve base data structure.
    const context = super.getData();

    // Use a safe clone of the item data for further operations.
    const itemData = context.item;

    // Retrieve the roll data for TinyMCE editors.
    context.rollData = {};
    let actor = this.object?.parent ?? null;
    if (actor) {
      context.rollData = actor.getRollData();
    }

    // Translate the skills if it is a weapon or protection
    if (itemData.type === "weapon" || itemData.type === "protection") {
      for (let [k, v] of Object.entries(itemData.system.skills)) {
        v.label = game.i18n.localize(CONFIG.FORMORIA.skills[k]) ?? k;
      }
    }

    let weaponTraits = []
    // Translate and prepare weapon traits
    if (itemData.type === "weapon") {
      for (let [k, v] of Object.entries(CONFIG.FORMORIA.weaponTraits)) {
        weaponTraits.push({
          "key": k,
          "label": game.i18n.localize(CONFIG.FORMORIA.weaponTraits[k].label),
        });
      }
      // Add descriptions to data
      console.log(itemData.system)
      itemData.system.traits.forEach(v => {
        v.label = game.i18n.localize(CONFIG.FORMORIA.weaponTraits[v.name].label);
        v.descriptionLabel = game.i18n.localize(CONFIG.FORMORIA.weaponTraits[v.name].description);
        v.typeLabel = game.i18n.localize(CONFIG.FORMORIA.weaponTraitsTypes[v.type]);
      });
    }


    // Add the actor's data to context.data for easier access, as well as flags.
    itemData.system.weaponTraits = weaponTraits;
    context.system = itemData.system;
    context.flags = itemData.flags;
    console.log(context.system)

    return context;
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Everything below here is only needed if the sheet is editable
    if (!this.isEditable) return;

    // Roll handlers, click handlers, etc. would go here.
    // Add Modifier
    html.find('.mod-create').click(this._onModCreate.bind(this));
    // Add Weapon Trait
    html.find('.trait-create').click(this._onTraitCreate.bind(this));

    // Delete Weapon Trait
    html.find('.trait-remove').click(ev => {
      ev.preventDefault();
      const context = super.getData();
      // Use a safe clone of the item data for further operations.
      const itemData = context.item;
      itemData.system.traits.pop()

      console.log("Removed trait")

      this.render()
    });

    // Delete Modifier
    html.find('.mod-delete').click(ev => {
      ev.preventDefault();
      const context = super.getData();
      // Use a safe clone of the item data for further operations.
      const itemData = context.item;
      delete itemData.system.modifiers[Object.keys(itemData.system.modifiers).length - 1]

      this.render()
    });

  }

  /**
   * Handle creating a new modifier for the actor using initial data defined in the HTML dataset
   * @param {Event} event   The originating click event
   * @private
   */
  async _onModCreate(event) {
    event.preventDefault();
    // Retrieve base data structure.
    const context = super.getData();

    // Use a safe clone of the item data for further operations.
    const itemData = context.item;
    console.log(itemData.system.modifiers)
    itemData.system.modifiers[Object.keys(itemData.system.modifiers).length] = { "mod": "stealth", "value": "0" }

    this.render(true)
    this.actor.render()
  }

  /**
  * Handle creating a new trait for the actor using initial data defined in the HTML dataset
  * @param {Event} event   The originating click event
  * @private
  */
  async _onTraitCreate(event) {
    event.preventDefault();
    const target = $(event.currentTarget);
    // gets the key from the selector in the html document
    const traitKey = document.getElementById('trait-selector').value
    // adds the trait in item.mjs
    this.item.addTrait({
      name: traitKey
    });
  }
}
