local logger     = require("logger")
local millennium = require("millennium")
local json       = require("json")
local http_ok, http = pcall(require, "http")

-- Steam's UI cannot read steambrew.app's list endpoints (no CORS header), so the backend fetches them.
local SITE = "https://steambrew.app"

local function clean(v)
    local t = type(v)
    if t == "string" or t == "number" or t == "boolean" or t == "table" then return v end
    return nil -- nil and json null
end

local function fail(msg)
    return json.encode({ __error = msg })
end

local function fetch(path)
    if not http_ok or type(http) ~= "table" or type(http.get) ~= "function" then
        return nil, "the http module is not available"
    end
    local ok, res, err = pcall(http.get, SITE .. path, { headers = { ["Accept"] = "application/json" }, timeout = 25 })
    if not ok then return nil, tostring(res) end
    if type(res) ~= "table" then return nil, tostring(err or "no answer") end
    if res.status ~= 200 then return nil, "HTTP " .. tostring(res.status) end
    if type(res.body) ~= "string" then return nil, "empty answer" end
    return res.body
end

local function slim_theme(t)
    local d  = type(t.data) == "table" and t.data or {}
    local sd = type(t.skin_data) == "table" and t.skin_data or {}
    local dg = type(d.github) == "table" and d.github or {}
    local g  = type(sd.github) == "table" and sd.github or {}
    local cd = type(t.commit_data) == "table" and t.commit_data or {}
    return {
        id = clean(d.id), name = clean(t.name), description = clean(t.description) or clean(sd.description),
        version = clean(t.version), tags = clean(t.tags), header_image = clean(t.header_image),
        author = clean(sd.author), owner = clean(g.owner) or clean(dg.owner), repo = clean(g.repo_name) or clean(dg.repo),
        downloads = clean(d.download), committed = clean(cd.committedDate), splash_image = clean(t.splash_image),
        discord = type(sd.discord_support) == "table" and clean(sd.discord_support.inviteCodeExcludingLink) or nil,
    }
end

local function slim_plugin(p)
    local pj = type(p.pluginJson) == "table" and p.pluginJson or {}
    return {
        id = clean(p.id), name = clean(pj.name), common_name = clean(pj.common_name), description = clean(pj.description),
        version = clean(pj.version), author = clean(p.repoOwner) or clean(pj.author), downloads = clean(p.downloadCount),
        size = clean(p.downloadSize), committed = clean(p.commitDate), unlisted = clean(p.unlisted),
        hasValidBuild = clean(p.hasValidBuild), stars = clean(p.stargazerCount), disk = clean(p.diskUsage),
        backend = clean(pj.backendType), repo_owner = clean(p.repoOwner), repo_name = clean(p.repoName),
        change = type(p.commitMessage) == "string" and p.commitMessage:match("^[^\r\n]*"):sub(1, 200) or nil,
    }
end

-- the list endpoints carry readmes and theme settings: keep only what the cards show
---@ffi
---@param kind string
---@return string
function sf_list(kind)
    local path, slim
    if kind == "themes" then path, slim = "/api/v2", slim_theme
    elseif kind == "plugins" then path, slim = "/api/v1/plugins", slim_plugin
    else return fail("unknown list") end

    local body, err = fetch(path)
    if not body then return fail(err) end
    local ok, list = pcall(json.decode, body)
    if not ok or type(list) ~= "table" then return fail("unexpected answer from steambrew.app") end

    local out = {}
    for _, item in ipairs(list) do
        if type(item) == "table" then out[#out + 1] = slim(item) end
    end
    local enc_ok, text = pcall(json.encode, out)
    if not enc_ok then return fail("could not read the list") end
    return text
end

-- single answers from steambrew.app (plugin details, download counter); paths are limited to its API
---@ffi
---@param path string
---@return string
function sf_get(path)
    if type(path) ~= "string" or not path:match("^/api/[%w%-%._~/%?&=]*$") then return fail("bad path") end
    local body, err = fetch(path)
    if not body then return fail(err) end
    return body
end

-- a README from GitHub, for the details view (themes have none on steambrew.app)
---@ffi
---@param owner string
---@param repo string
---@return string
function sf_readme(owner, repo)
    if type(owner) ~= "string" or type(repo) ~= "string" or not owner:match("^[%w%-%._]+$") or not repo:match("^[%w%-%._]+$") then
        return fail("bad repository")
    end
    if not http_ok or type(http) ~= "table" or type(http.get) ~= "function" then return fail("the http module is not available") end
    for _, name in ipairs({ "README.md", "readme.md", "Readme.md", "README.markdown", "README" }) do
        local ok, res = pcall(http.get, "https://raw.githubusercontent.com/" .. owner .. "/" .. repo .. "/HEAD/" .. name, { timeout = 15 })
        if ok and type(res) == "table" and res.status == 200 and type(res.body) == "string" and #res.body > 0 then
            return json.encode({ text = res.body:sub(1, 120000) })
        end
    end
    return fail("no README found")
end

local function on_load()
    logger:info("Brew Hub loaded")
    millennium.ready()
end

local function on_unload()
    logger:info("Brew Hub unloaded")
end

local function on_frontend_loaded()
    logger:info("Brew Hub frontend loaded")
end

return {
    on_load = on_load,
    on_unload = on_unload,
    on_frontend_loaded = on_frontend_loaded,
}
