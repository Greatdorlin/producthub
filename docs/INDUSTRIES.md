# Industry Presets

Industry presets let ProductHub keep stable database columns while changing buyer-facing labels and defaults.

Built-in presets:

- Generic Products
- Education & Travel
- Real Estate & Property
- Events & Venues
- Professional Services
- Retail & Commerce
- Hospitality & Experiences
- Healthcare & Wellness

Workspace admins can choose the default currency in Branding. ProductHub suggests ISO currency codes but accepts any valid three-letter code. Custom product fields can also be configured there without adding database columns.

To create a custom preset:

1. Copy `src/lib/config/industries/generic.ts`.
2. Rename the file and update `id`, `label`, `roleLabels`, `productDefaults`, and `fieldLabels`.
3. Register it in `src/lib/config/industries/index.ts`.
4. Set `INDUSTRY_TEMPLATE` to your preset ID.
5. Add a new migration only if your custom workflow needs new database fields.

Canonical role keys stay the same in the database. Use preset labels for UI display.
