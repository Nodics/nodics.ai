# Partner Waste overlay fixture

This isolated test fixture demonstrates later-layer data contributions to the
existing eWaste/Waste schemas. It contributes acceptance rules, categories,
collection presets and impact profiles through its versioned manifest. It is
not a deployment, installed accelerator or customer runtime.

The Waste umbrella tests load these records as a project overlay and verify
stable codes and override precedence. Changes must preserve governed imports
and framework schema ownership. Partners implement equivalent contributions in
their own repositories; they do not modify eWaste or nodics.waste source.
