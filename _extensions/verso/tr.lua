-- quarto-i18n filter, used only in generated language projects.
--
-- It reads what the materialiser wrote and does three things:
--   1. moves data-tr-* (and fallback lang) from the wrapper span onto the block;
--   2. marks where the translation banner goes (metadata i18n.notice);
--   3. loads the reviewer-mode script and styles on HTML pages.
-- All decisions are made in the Node tool; this filter stays small.

local function tr_span(inlines)
  if #inlines == 1 and inlines[1].t == "Span" and inlines[1].classes:includes("tr") then
    return inlines[1]
  end
  return nil
end

local function block_attr(span)
  local attr = pandoc.Attr("", { "tr-block" }, {})
  for k, v in pairs(span.attributes) do
    attr.attributes[k] = v
  end
  return attr
end

local function wrap(el)
  local s = tr_span(el.content)
  if not s then return nil end
  local inner = el.t == "Para" and pandoc.Para(s.content) or pandoc.Plain(s.content)
  return pandoc.Div({ inner }, block_attr(s))
end

-- Headings carry data-tr-* in their own attributes (so book navigation, built
-- from the raw heading text, stays clean). Quarto would move heading attributes
-- onto the enclosing <section>, so they go on a span inside the heading instead.
local function header(el)
  if not el.attributes["data-tr-id"] then return nil end
  local attr = pandoc.Attr("", { "tr-block", "tr-heading" }, {})
  for _, k in ipairs({ "data-tr-id", "data-tr-status", "data-tr-reviews", "lang" }) do
    if el.attributes[k] then
      attr.attributes[k] = el.attributes[k]
      el.attributes[k] = nil
    end
  end
  el.content = pandoc.Inlines({ pandoc.Span(el.content, attr) })
  return el
end

local function notice(doc)
  local i18n = doc.meta["verso-translate"]
  if not i18n or not i18n.notice then return nil end
  -- A placeholder: the build replaces it with the translation banner.
  local div = pandoc.RawBlock("html", '<div class="tr-notice"></div>')
  -- After the first level-1 heading (the chapter title in books), else at the top.
  local at = 1
  for i, b in ipairs(doc.blocks) do
    if b.t == "Header" and b.level == 1 then
      at = i + 1
      break
    end
    if i > 3 then break end
  end
  doc.blocks:insert(at, div)
  return doc
end

-- Mark executed cells with their label so reviewer mode can find code units.
local function cell(el)
  if not el.classes:includes("cell") then return nil end
  local label = el.attributes["label"] or el.identifier
  if label and label ~= "" then
    el.attributes["data-tr-cell"] = label
    return el
  end
  return nil
end

return {
  { Para = wrap, Plain = wrap, Header = header, Div = cell },
  {
    Pandoc = function(doc)
      if quarto and quarto.doc.is_format("html") then
        quarto.doc.add_html_dependency({
          name = "quarto-i18n",
          version = "0.1.0",
          scripts = { "review.js" },
          stylesheets = { "review.css" },
        })
      end
      return notice(doc)
    end,
  },
}
