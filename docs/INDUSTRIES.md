# Industry Presets

Industry presets let ProductHub keep stable database columns while changing buyer-facing labels and defaults.

Built-in presets:

- Generic
- Travel
- Education
- Real Estate
- Professional Services

Each preset is a starting point. Workspace admins can edit its categories, routes or locations, product wording, default currency, and custom fields in Branding. The currency selector includes the full ISO currency list.

To create a custom preset:

1. Copy `src/lib/config/industries/generic.ts`.
2. Rename the file and update `id`, `label`, `description`, `roleLabels`, `productDefaults`, and `fieldLabels`.
3. Register it in `src/lib/config/industries/index.ts`.
4. Set `INDUSTRY_TEMPLATE` to your preset ID.
5. Add a new migration only if your custom workflow needs new database fields.

Canonical role keys stay the same in the database. Use preset labels for UI display.
