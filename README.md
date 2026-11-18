# Brew Hub

A Millennium plugin that adds a **Brew Hub** tab to Millennium's settings, next to Plugins. It lists the themes and plugins from [steambrew.app](https://steambrew.app) and installs them with one click, using Millennium's own installer. No plugin ID to copy and paste.

- Two sections, **Themes** and **Plugins**, laid out like steambrew.app: sort pills (most or least downloaded, recently or least recently updated, alphabetical), a filter (all, installed, not installed, and theme tags) and search
- Click a card (or **Details**) for everything about it: facts, the full README (headings, tables, nested lists, code, images and collapsible `<details>` sections, as on the site) and links to steambrew.app, GitHub and Discord
- **Install** runs Millennium's installer and shows its progress on the card
- Installed themes offer **Use theme**, which switches the theme and shows Millennium's own "Restart Required" dialog; installed plugins offer **Enable**
- Stays in step with Millennium: uninstall a theme or plugin in Millennium's own Themes or Plugins tab and its Brew Hub card offers **Install** again within a few seconds, no restart needed
- Installs count towards the download numbers on steambrew.app, like Millennium's own installer
- A Steam notification when an install finishes, on by default; switch it off in Millennium → Plugins → Brew Hub
- Square corners like Steam's own UI. With SpaceTheme or Minimal Dark active, the Brew Hub takes their colours, accent and corner radius; with any other theme it uses neutral tints
- Works with any theme and on Windows and Linux

## Install

Grab the `.star` from Releases, or build it (below), and copy it into Millennium's plugins folder: `<Steam>\millennium\plugins\` on Windows, `~/.local/share/millennium/plugins/` on Linux. Enable **Brew Hub** under Millennium → Plugins and restart Steam if asked. The tab appears in Millennium's settings after Plugins.

## Translations

Brew Hub follows Steam's language (`SteamClient.Settings.GetCurrentLanguage()`). Shipped: German, French, Spanish (also used for Latin American Spanish), Brazilian Portuguese, Russian, Simplified and Traditional Chinese, Japanese, Korean and Polish. Every other language shows English. The translations are machine-quality, so corrections from native speakers are welcome.

To add or fix a language, edit the `LOCALES` block near the top of `frontend/index.tsx`: copy the `english` block, rename it to Steam's name for the language (for example `italian`, `turkish`, `latam`), and translate the values, keeping `{0}` where it is. Keys missing from a language fall back to English.

## Notes

> [!IMPORTANT]
> Millennium has no way to add settings tabs, so Brew Hub patches Millennium's settings page to insert its own, and it calls Millennium's internal installer functions. A Millennium update can change either. If the tab is missing, run `__brewhub.status()` in the Steam UI console and include the result in your bug report.

- Needs Millennium 3.6.3 or newer.
- The lists come from steambrew.app (`/api/v2` for themes, `/api/v1/plugins` for plugins). Steam's UI cannot read them directly (no CORS header), so the plugin's backend fetches them. The site sometimes times out; **Refresh** tries again.
- READMEs are drawn as plain elements, never as raw HTML: scripts, styles, frames and event handlers are dropped. Images are loaded from where the README points (GitHub, imgur, shields.io), like on the site.
- Plugins whose latest build fails on steambrew.app cannot be installed, same as in Millennium's own installer.
- Console helpers: `__brewhub.status()`, `__brewhub.reload()`, `__brewhub.install('theme', '<id>')` or `('plugin', '<id>')`.

## Build

Needs [Bun](https://bun.sh) 1.4.3 or newer.

```
bun install
bun run build
```

## License

MIT, see [LICENSE](LICENSE).
