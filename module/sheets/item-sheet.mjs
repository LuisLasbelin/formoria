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


    // Add the actor's data to context.data for easier access, as well as flags.
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
  }

  /**
   * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
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
    itemData.system.modifiers[Object.keys(itemData.system.modifiers).length] = {"mod": "stealth", "value": "0"}

    this.render()
  }
}
