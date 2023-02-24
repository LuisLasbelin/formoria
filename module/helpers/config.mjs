export const FORMORIA = {};

/**
 * The set of Skills used within the sytem.
 * @type {Object}
 */
FORMORIA.skills = {
  "brawn": "FORMORIA.Brawn",
  "tactics": "FORMORIA.Tactics",
  "stealth": "FORMORIA.Stealth",
  "caving": "FORMORIA.Caving",
  "cooking": "FORMORIA.Cooking",
  "language": "FORMORIA.Language",
};

FORMORIA.skillIcons = {
  "brawn": "icons/skills/melee/hand-grip-staff-yellow-brown.webp",
  "tactics": "icons/skills/targeting/crosshair-pointed-orange.webp",
  "stealth": "icons/magic/perception/silhouette-stealth-shadow.webp",
  "caving": "icons/weapons/axes/pickaxe-gray.webp",
  "cooking": "icons/consumables/food/bowl-stew-tofu-potato-red.webp",
  "language": "icons/skills/trades/music-singing-voice-blue.webp",
}

FORMORIA.weaponTraits = {
  "elven": {
    "label": 'FORMORIA.WeaponTraits.elven.label',
    "type": 'pa',
    "description": 'FORMORIA.WeaponTraits.elven.description',
  },
  "blessed": {
    "label": 'FORMORIA.WeaponTraits.blessed.label',
    "type": 'pa',
    "description": 'FORMORIA.WeaponTraits.blessed.description',
  },
  "masterwork": {
    "label": 'FORMORIA.WeaponTraits.masterwork.label',
    "type": 'pa',
    "description": 'FORMORIA.WeaponTraits.masterwork.description',
  },
  "beasthunter": {
    "label": 'FORMORIA.WeaponTraits.beasthunter.label',
    "type": 'pot',
    "description": 'FORMORIA.WeaponTraits.beasthunter.description',
  },
  "cruel": {
    "label": 'FORMORIA.WeaponTraits.cruel.label',
    "type": 'pot',
    "description": 'FORMORIA.WeaponTraits.cruel.description',
  },
  "crossbow": {
    "label": 'FORMORIA.WeaponTraits.crossbow.label',
    "type": 'pa',
    "description": 'FORMORIA.WeaponTraits.crossbow.description',
  },
  "mithril": {
    "label": 'FORMORIA.WeaponTraits.mithril.label',
    "type": 'pa',
    "description": 'FORMORIA.WeaponTraits.mithril.description',
  },
  "2h": {
    "label": 'FORMORIA.WeaponTraits.2h.label',
    "type": 'pa',
    "description": 'FORMORIA.WeaponTraits.2h.description',
  }
}

FORMORIA.weaponTraitsTypes = {
  "pa": "FORMORIA.WeaponTraits.pa",
  "pot": "FORMORIA.WeaponTraits.pot",
}

/**
 * The set of Skills used within the sytem.
 * @type {Object}
 */
FORMORIA.dice = [
  {
    "label": "d4",
    "icon": "systems/formoria/assets/d4.svg"
  },
  {
    "label": "d6",
    "icon": "systems/formoria/assets/perspective-dice-six-faces-six.svg"
  },
  {
    "label": "d8",
    "icon": "systems/formoria/assets/dice-eight-faces-eight.svg"
  },
  {
    "label": "d10",
    "icon": "systems/formoria/assets/d10.svg"
  },
  {
    "label": "d12",
    "icon": "systems/formoria/assets/d12.svg"
  }
];

FORMORIA.danger = {
  "veryeasy": {
    "label": "FORMORIA.VeryEasy",
    "value": 3
  },
  "easy": {
    "label": "FORMORIA.Easy",
    "value": 6
  },
  "normal": {
    "label": "FORMORIA.Normal",
    "value": 10
  },
  "dangerous": {
    "label": "FORMORIA.Dangerous",
    "value": 15
  },
  "beast": {
    "label": "FORMORIA.Beast",
    "value": 20
  },
  "legendary": {
    "label": "FORMORIA.Legendary",
    "value": 30
  }
}