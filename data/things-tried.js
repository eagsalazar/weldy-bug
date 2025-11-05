// Load and parse things-tried.yaml
// This provides the canonical list of all actions users can try

import yaml from 'js-yaml';
import fs from 'fs';
import path from 'path';

// For React Native, we need to require the YAML directly as text
// Since we can't use fs in RN, we'll convert YAML to JSON for now
// and import it directly

// Flattened structure for easy lookup
export const THINGS_TRIED = {
  // Surface Prep
  clean_surface_thoroughly: {
    id: 'clean_surface_thoroughly',
    name: 'Cleaned surface',
    description: 'Removed all rust, oil, paint, grease, and mill scale from base metal',
    category: 'surface_prep'
  },
  ensure_metal_dry: {
    id: 'ensure_metal_dry',
    name: 'Ensured metal is dry',
    description: 'Verified material is completely dry before welding (no moisture)',
    category: 'surface_prep'
  },
  remove_galvanizing: {
    id: 'remove_galvanizing',
    name: 'Removed galvanizing',
    description: 'Ground zinc coating off completely before welding',
    category: 'surface_prep'
  },

  // Gas Shielding
  set_gas_flow_15_20: {
    id: 'set_gas_flow_15_20',
    name: 'Set gas flow 15-20 CFH',
    description: 'Adjusted flowmeter to 15-20 CFH range',
    category: 'gas_shielding'
  },
  increase_gas_flow_20_22: {
    id: 'increase_gas_flow_20_22',
    name: 'Increased gas flow to 20-22 CFH',
    description: 'Increased flow rate modestly for windy conditions',
    category: 'gas_shielding'
  },
  enable_preflow_postflow: {
    id: 'enable_preflow_postflow',
    name: 'Enabled pre/post-flow',
    description: 'Set pre-flow to 1-2 seconds, post-flow to 3-5 seconds',
    category: 'gas_shielding'
  },
  check_gas_cylinder_pressure: {
    id: 'check_gas_cylinder_pressure',
    name: 'Checked gas cylinder',
    description: 'Verified cylinder has adequate pressure (200+ PSI) and no leaks',
    category: 'gas_shielding'
  },
  verify_correct_gas_c25: {
    id: 'verify_correct_gas_c25',
    name: 'Verified using C25 gas',
    description: 'Confirmed using C25 (75/25 Argon/CO2) or 100% CO2',
    category: 'gas_shielding'
  },

  // Environment
  add_wind_protection: {
    id: 'add_wind_protection',
    name: 'Added wind protection',
    description: 'Used welding screens or barriers to block air currents',
    category: 'environment'
  },

  // Stick Out
  reduce_stickout_3_8: {
    id: 'reduce_stickout_3_8',
    name: 'Set stick-out to 3/8"',
    description: 'Adjusted wire stick-out to 3/8 inch for proper gas coverage',
    category: 'stick_out'
  },
  maintain_consistent_stickout: {
    id: 'maintain_consistent_stickout',
    name: 'Maintained consistent stick-out',
    description: 'Kept wire stick-out at 3/8 inch throughout weld',
    category: 'stick_out'
  },

  // Technique
  check_work_angle_10_15: {
    id: 'check_work_angle_10_15',
    name: 'Adjusted work angle',
    description: 'Kept gun at 10-15 degree push or drag angle',
    category: 'technique'
  },
  maintain_steady_travel_speed: {
    id: 'maintain_steady_travel_speed',
    name: 'Maintained steady speed',
    description: 'Kept smooth, consistent travel speed throughout weld',
    category: 'technique'
  },
  slow_down_travel: {
    id: 'slow_down_travel',
    name: 'Slowed down travel speed',
    description: 'Reduced travel speed to allow more heat input',
    category: 'technique'
  },
  speed_up_travel: {
    id: 'speed_up_travel',
    name: 'Increased travel speed',
    description: 'Moved faster to reduce heat input per inch',
    category: 'technique'
  },
  practice_steady_speed: {
    id: 'practice_steady_speed',
    name: 'Practiced steady speed',
    description: 'Practiced maintaining constant, smooth motion',
    category: 'technique'
  },
  brace_hands_arms: {
    id: 'brace_hands_arms',
    name: 'Braced hands/arms',
    description: 'Stabilized hands and arms for consistent motion',
    category: 'technique'
  },
  position_body_comfortably: {
    id: 'position_body_comfortably',
    name: 'Positioned comfortably',
    description: 'Started in comfortable position maintainable throughout weld',
    category: 'technique'
  },
  maintain_consistent_arc_length: {
    id: 'maintain_consistent_arc_length',
    name: 'Kept consistent arc length',
    description: 'Maintained gun at consistent distance from work',
    category: 'technique'
  },
  avoid_stopping_mid_weld: {
    id: 'avoid_stopping_mid_weld',
    name: 'Avoided stopping mid-weld',
    description: 'Completed welds without stopping; filled craters if necessary',
    category: 'technique'
  },
  reduce_joint_restraint: {
    id: 'reduce_joint_restraint',
    name: 'Reduced joint restraint',
    description: 'Minimized clamps/fixtures to reduce stress',
    category: 'technique'
  },
  check_base_metal_compatibility: {
    id: 'check_base_metal_compatibility',
    name: 'Checked material specs',
    description: 'Verified base metal compatibility and requirements',
    category: 'technique'
  },
  preheat_material: {
    id: 'preheat_material',
    name: 'Preheated material',
    description: 'Preheated to 150-300°F before welding (thick/high-carbon steel)',
    category: 'technique'
  },
  allow_slow_cooling: {
    id: 'allow_slow_cooling',
    name: 'Allowed slow cooling',
    description: 'Let weld cool slowly; covered with insulation blanket',
    category: 'technique'
  },
  reduce_restraint_after_welding: {
    id: 'reduce_restraint_after_welding',
    name: 'Released restraint after weld',
    description: 'Removed clamps after welding to allow natural contraction',
    category: 'technique'
  },
  use_stitch_welding: {
    id: 'use_stitch_welding',
    name: 'Used stitch welding',
    description: 'Welded in short segments on thin material to manage heat',
    category: 'technique'
  },
  check_joint_fitup: {
    id: 'check_joint_fitup',
    name: 'Checked joint fit-up',
    description: 'Ensured gaps < 1/16 inch; added tack welds',
    category: 'technique'
  },
  use_slight_weave: {
    id: 'use_slight_weave',
    name: 'Used slight weave',
    description: 'Used side-to-side weave to spread material wider',
    category: 'technique'
  },
  pause_at_edges_weaving: {
    id: 'pause_at_edges_weaving',
    name: 'Paused at edges when weaving',
    description: 'Paused momentarily at each edge to fill toes',
    category: 'technique'
  },

  // Equipment
  check_work_clamp_connection: {
    id: 'check_work_clamp_connection',
    name: 'Checked work clamp',
    description: 'Ensured work clamp has solid connection to clean metal',
    category: 'equipment'
  },
  verify_voltage_wire_balance: {
    id: 'verify_voltage_wire_balance',
    name: 'Verified voltage/wire balance',
    description: 'Checked for steady bacon-frying sound, not erratic popping',
    category: 'equipment'
  },

  // Practice
  document_current_settings: {
    id: 'document_current_settings',
    name: 'Documented settings',
    description: 'Recorded current voltage, wire feed, and stick-out for reference',
    category: 'practice'
  },
};

// Helper to get all IDs
export const getAllThingsTriedIds = () => Object.keys(THINGS_TRIED);

// Helper to initialize thingsTried state
export const initializeThingsTried = () => {
  const initial = {};
  getAllThingsTriedIds().forEach(id => {
    initial[id] = false;
  });
  return initial;
};
