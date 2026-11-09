// Post-render hook contributed by this extension (see _extension.yml). Quarto
// resolves it relative to the extension folder, wherever that is installed
// (_extensions/verso or _extensions/<owner>/verso), and runs it with its own
// Deno. The tool itself runs on Node.
const url = new URL('./i18n.mjs', import.meta.url);
let cli = decodeURIComponent(url.pathname);
if (Deno.build.os === 'windows') cli = cli.replace(/^\/([A-Za-z]:)/, '$1');
const { code } = await new Deno.Command('node', { args: [cli, 'hook'], stdout: 'inherit', stderr: 'inherit' }).spawn().status;
Deno.exit(code);
