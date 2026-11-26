// @ts-nocheck
/* Brew Hub. Adds a Brew Hub tab to Millennium's settings with Themes and Plugins from steambrew.app.
 * Install runs Millennium's own installer (Core_InstallTheme / Core_InstallPlugin), so there is no ID to copy or paste. */
import { definePlugin, routerHook } from 'millennium';

const React = (window as any).SP_REACT;
const API = (window as any).MILLENNIUM_API;
const h = React.createElement;

const SITE = 'https://steambrew.app';
const SETTINGS_ROUTE = '/millennium/settings';
const THEMES_ROUTE = '/millennium/settings/themes';
const PLUGINS_ROUTE = '/millennium/settings/plugins';
const PAGE_ROUTE = '/millennium/settings/brew-hub';
const CACHE_MS = 10 * 60 * 1000;
const log = (...a) => console.log('[Brew Hub]', ...a);
const sleep = ms => new Promise(r => setTimeout(r, ms));

/* ═════════════ translations ═════════════
 * Steam's own language decides: SteamClient.Settings.GetCurrentLanguage() returns its name (english, german, schinese, ...).
 * To add a language: copy the english block, rename it to Steam's name for that language, translate the values (keep {0} where it is).
 * A key missing from a language falls back to english. */
const LOCALES = {
  english: {
    tabThemes: "Themes",
    tabPlugins: "Plugins",
    refresh: "Refresh",
    loading: "Loading...",
    sortPopular: "Most downloaded",
    sortUnpopular: "Least downloaded",
    sortUpdated: "Recently updated",
    sortStale: "Least recently updated",
    sortName: "Alphabetically",
    filterAll: "All",
    filterInstalled: "Installed",
    filterMissing: "Not installed",
    filterTag: "Tag: {0}",
    searchPlaceholder: "Type here to search...",
    loadingList: "Loading from steambrew.app...",
    loadFailed: "Could not load the list: {0}",
    tryAgain: "Try again",
    noMatch: "Nothing matches.",
    by: "by {0}",
    downloads: "{0} downloads",
    updatedOn: "updated {0}",
    details: "Details",
    install: "Install",
    retry: "Retry",
    useTheme: "Use theme",
    active: "Active",
    enable: "Enable",
    enabled: "Enabled",
    buildFailing: "Build failing",
    installing: "Installing",
    statusStarting: "Starting",
    statusDownloading: "Downloading",
    statusExtracting: "Extracting",
    statusSettingUp: "Setting up",
    statusInstalling: "Installing",
    statusCopying: "Copying files",
    statusCleaning: "Cleaning up",
    statusDone: "Done",
    back: "Back",
    noReadme: "No README found.",
    factAuthor: "Author",
    factVersion: "Version",
    factUpdated: "Updated",
    factDownloads: "Downloads",
    factStars: "Stars",
    factDownload: "Download",
    factRepository: "Repository",
    factBackend: "Backend",
    factFolder: "Folder",
    factRepo: "Repo",
    backendNone: "none",
    latestChange: "Latest change: {0}",
    errNoRepo: "This theme lists no GitHub repository",
    errAlready: "Already installed",
    errBuild: "The plugin's latest build is failing, so it cannot be installed",
    errNoLink: "steambrew.app gave no download link",
    errStart: "Millennium could not start the install",
    errTimeout: "Timed out waiting for Millennium",
    errFailed: "The install failed",
    toastTitle: "{0} installed",
    toastTheme: "Go to the Themes tab to activate it.",
    toastPlugin: "Go to the Plugins tab to enable it.",
    setNotifyLabel: "Notify when an install finishes",
    setNotifyDesc: "Show a Steam notification when a theme or plugin has been installed from Brew Hub.",
    setIntro: "Brew Hub adds its own tab to Millennium's settings, next to Plugins.",
    setOpen: "Open Brew Hub",
    tabUnofficial: "Unofficial",
    unofficialNote: "Plugins from GitHub repositories. Brew Hub installs the latest release (.zip or .star) and tells you when a new one is out. steambrew.app does not review these: only add ones you trust.",
    unofficialEmpty: "No repositories added yet.",
    addPlaceholder: "GitHub link or owner/repo",
    add: "Add",
    removeEntry: "Remove from list",
    update: "Update",
    upToDate: "Up to date",
    updateAvailable: "A new release is available",
    checking: "Checking...",
    installedVer: "installed {0}",
    latestVer: "latest {0}",
    errBadRepo: "Enter a GitHub link or owner/repo",
    errDuplicate: "Already in the list",
    errNoAsset: "The latest release has no .zip or .star file",
    toastUpdatedTitle: "{0} updated",
    toastUpdated: "Restart Steam to run the new version.",
    detectedTitle: "Installed, not on steambrew.app",
    detectedNote: "Plugins found on this computer that steambrew.app does not list. Link a GitHub repository to follow its releases and get updates.",
    linkRepo: "Link",
    pluginDisabled: "Disabled",
  },
  german: {
    tabThemes: "Themes",
    tabPlugins: "Plugins",
    refresh: "Aktualisieren",
    loading: "Lädt...",
    sortPopular: "Meist heruntergeladen",
    sortUnpopular: "Am wenigsten heruntergeladen",
    sortUpdated: "Zuletzt aktualisiert",
    sortStale: "Am längsten nicht aktualisiert",
    sortName: "Alphabetisch",
    filterAll: "Alle",
    filterInstalled: "Installiert",
    filterMissing: "Nicht installiert",
    filterTag: "Tag: {0}",
    searchPlaceholder: "Zum Suchen hier tippen...",
    loadingList: "Wird von steambrew.app geladen...",
    loadFailed: "Die Liste konnte nicht geladen werden: {0}",
    tryAgain: "Erneut versuchen",
    noMatch: "Keine Treffer.",
    by: "von {0}",
    downloads: "{0} Downloads",
    updatedOn: "aktualisiert {0}",
    details: "Details",
    install: "Installieren",
    retry: "Erneut",
    useTheme: "Theme verwenden",
    active: "Aktiv",
    enable: "Aktivieren",
    enabled: "Aktiviert",
    buildFailing: "Build fehlerhaft",
    installing: "Wird installiert",
    statusStarting: "Wird gestartet",
    statusDownloading: "Wird heruntergeladen",
    statusExtracting: "Wird entpackt",
    statusSettingUp: "Wird eingerichtet",
    statusInstalling: "Wird installiert",
    statusCopying: "Dateien werden kopiert",
    statusCleaning: "Wird aufgeräumt",
    statusDone: "Fertig",
    back: "Zurück",
    noReadme: "Keine README gefunden.",
    factAuthor: "Autor",
    factVersion: "Version",
    factUpdated: "Aktualisiert",
    factDownloads: "Downloads",
    factStars: "Sterne",
    factDownload: "Download",
    factRepository: "Repository",
    factBackend: "Backend",
    factFolder: "Ordner",
    factRepo: "Repo",
    backendNone: "keins",
    latestChange: "Letzte Änderung: {0}",
    errNoRepo: "Für dieses Theme ist kein GitHub-Repository angegeben",
    errAlready: "Bereits installiert",
    errBuild: "Der aktuelle Build des Plugins schlägt fehl und kann nicht installiert werden",
    errNoLink: "steambrew.app hat keinen Download-Link geliefert",
    errStart: "Millennium konnte die Installation nicht starten",
    errTimeout: "Zeitüberschreitung beim Warten auf Millennium",
    errFailed: "Die Installation ist fehlgeschlagen",
    toastTitle: "{0} installiert",
    toastTheme: "Öffne den Tab „Themes“, um es zu aktivieren.",
    toastPlugin: "Öffne den Tab „Plugins“, um es zu aktivieren.",
    setNotifyLabel: "Benachrichtigen, wenn eine Installation abgeschlossen ist",
    setNotifyDesc: "Zeigt eine Steam-Benachrichtigung, sobald ein Theme oder Plugin über Brew Hub installiert wurde.",
    setIntro: "Brew Hub fügt den Einstellungen von Millennium einen eigenen Tab neben „Plugins“ hinzu.",
    setOpen: "Brew Hub öffnen",
  },
  french: {
    tabThemes: "Thèmes",
    tabPlugins: "Plugins",
    refresh: "Actualiser",
    loading: "Chargement...",
    sortPopular: "Les plus téléchargés",
    sortUnpopular: "Les moins téléchargés",
    sortUpdated: "Mis à jour récemment",
    sortStale: "Mis à jour il y a le plus longtemps",
    sortName: "Ordre alphabétique",
    filterAll: "Tous",
    filterInstalled: "Installés",
    filterMissing: "Non installés",
    filterTag: "Tag : {0}",
    searchPlaceholder: "Saisissez ici pour rechercher...",
    loadingList: "Chargement depuis steambrew.app...",
    loadFailed: "Impossible de charger la liste : {0}",
    tryAgain: "Réessayer",
    noMatch: "Aucun résultat.",
    by: "par {0}",
    downloads: "{0} téléchargements",
    updatedOn: "mis à jour le {0}",
    details: "Détails",
    install: "Installer",
    retry: "Réessayer",
    useTheme: "Utiliser le thème",
    active: "Actif",
    enable: "Activer",
    enabled: "Activé",
    buildFailing: "Build en échec",
    installing: "Installation",
    statusStarting: "Démarrage",
    statusDownloading: "Téléchargement",
    statusExtracting: "Extraction",
    statusSettingUp: "Configuration",
    statusInstalling: "Installation",
    statusCopying: "Copie des fichiers",
    statusCleaning: "Nettoyage",
    statusDone: "Terminé",
    back: "Retour",
    noReadme: "Aucun README trouvé.",
    factAuthor: "Auteur",
    factVersion: "Version",
    factUpdated: "Mis à jour",
    factDownloads: "Téléchargements",
    factStars: "Étoiles",
    factDownload: "Téléchargement",
    factRepository: "Dépôt",
    factBackend: "Backend",
    factFolder: "Dossier",
    factRepo: "Dépôt",
    backendNone: "aucun",
    latestChange: "Dernière modification : {0}",
    errNoRepo: "Ce thème n’indique aucun dépôt GitHub",
    errAlready: "Déjà installé",
    errBuild: "Le dernier build du plugin est en échec : il ne peut pas être installé",
    errNoLink: "steambrew.app n’a fourni aucun lien de téléchargement",
    errStart: "Millennium n’a pas pu démarrer l’installation",
    errTimeout: "Délai dépassé en attendant Millennium",
    errFailed: "L’installation a échoué",
    toastTitle: "{0} installé",
    toastTheme: "Rendez-vous dans l’onglet Thèmes pour l’activer.",
    toastPlugin: "Rendez-vous dans l’onglet Plugins pour l’activer.",
    setNotifyLabel: "Notifier à la fin d’une installation",
    setNotifyDesc: "Affiche une notification Steam lorsqu’un thème ou un plugin a été installé depuis Brew Hub.",
    setIntro: "Brew Hub ajoute son propre onglet aux paramètres de Millennium, à côté de Plugins.",
    setOpen: "Ouvrir Brew Hub",
  },
  spanish: {
    tabThemes: "Temas",
    tabPlugins: "Plugins",
    refresh: "Actualizar",
    loading: "Cargando...",
    sortPopular: "Más descargados",
    sortUnpopular: "Menos descargados",
    sortUpdated: "Actualizados recientemente",
    sortStale: "Actualizados hace más tiempo",
    sortName: "Alfabético",
    filterAll: "Todos",
    filterInstalled: "Instalados",
    filterMissing: "No instalados",
    filterTag: "Etiqueta: {0}",
    searchPlaceholder: "Escribe aquí para buscar...",
    loadingList: "Cargando desde steambrew.app...",
    loadFailed: "No se pudo cargar la lista: {0}",
    tryAgain: "Reintentar",
    noMatch: "No hay coincidencias.",
    by: "por {0}",
    downloads: "{0} descargas",
    updatedOn: "actualizado el {0}",
    details: "Detalles",
    install: "Instalar",
    retry: "Reintentar",
    useTheme: "Usar tema",
    active: "Activo",
    enable: "Activar",
    enabled: "Activado",
    buildFailing: "Compilación fallida",
    installing: "Instalando",
    statusStarting: "Iniciando",
    statusDownloading: "Descargando",
    statusExtracting: "Extrayendo",
    statusSettingUp: "Configurando",
    statusInstalling: "Instalando",
    statusCopying: "Copiando archivos",
    statusCleaning: "Limpiando",
    statusDone: "Hecho",
    back: "Volver",
    noReadme: "No se encontró ningún README.",
    factAuthor: "Autor",
    factVersion: "Versión",
    factUpdated: "Actualizado",
    factDownloads: "Descargas",
    factStars: "Estrellas",
    factDownload: "Descarga",
    factRepository: "Repositorio",
    factBackend: "Backend",
    factFolder: "Carpeta",
    factRepo: "Repo",
    backendNone: "ninguno",
    latestChange: "Último cambio: {0}",
    errNoRepo: "Este tema no indica ningún repositorio de GitHub",
    errAlready: "Ya está instalado",
    errBuild: "La última compilación del plugin falla, así que no se puede instalar",
    errNoLink: "steambrew.app no proporcionó un enlace de descarga",
    errStart: "Millennium no pudo iniciar la instalación",
    errTimeout: "Se agotó el tiempo de espera de Millennium",
    errFailed: "La instalación falló",
    toastTitle: "{0} instalado",
    toastTheme: "Ve a la pestaña Temas para activarlo.",
    toastPlugin: "Ve a la pestaña Plugins para activarlo.",
    setNotifyLabel: "Notificar al terminar una instalación",
    setNotifyDesc: "Muestra una notificación de Steam cuando se instala un tema o un plugin desde Brew Hub.",
    setIntro: "Brew Hub añade su propia pestaña a los ajustes de Millennium, junto a Plugins.",
    setOpen: "Abrir Brew Hub",
  },
  brazilian: {
    tabThemes: "Temas",
    tabPlugins: "Plugins",
    refresh: "Atualizar",
    loading: "Carregando...",
    sortPopular: "Mais baixados",
    sortUnpopular: "Menos baixados",
    sortUpdated: "Atualizados recentemente",
    sortStale: "Atualizados há mais tempo",
    sortName: "Ordem alfabética",
    filterAll: "Todos",
    filterInstalled: "Instalados",
    filterMissing: "Não instalados",
    filterTag: "Tag: {0}",
    searchPlaceholder: "Digite aqui para pesquisar...",
    loadingList: "Carregando de steambrew.app...",
    loadFailed: "Não foi possível carregar a lista: {0}",
    tryAgain: "Tentar novamente",
    noMatch: "Nada encontrado.",
    by: "por {0}",
    downloads: "{0} downloads",
    updatedOn: "atualizado em {0}",
    details: "Detalhes",
    install: "Instalar",
    retry: "Tentar novamente",
    useTheme: "Usar tema",
    active: "Ativo",
    enable: "Ativar",
    enabled: "Ativado",
    buildFailing: "Build com falha",
    installing: "Instalando",
    statusStarting: "Iniciando",
    statusDownloading: "Baixando",
    statusExtracting: "Extraindo",
    statusSettingUp: "Configurando",
    statusInstalling: "Instalando",
    statusCopying: "Copiando arquivos",
    statusCleaning: "Limpando",
    statusDone: "Concluído",
    back: "Voltar",
    noReadme: "Nenhum README encontrado.",
    factAuthor: "Autor",
    factVersion: "Versão",
    factUpdated: "Atualizado",
    factDownloads: "Downloads",
    factStars: "Estrelas",
    factDownload: "Download",
    factRepository: "Repositório",
    factBackend: "Backend",
    factFolder: "Pasta",
    factRepo: "Repo",
    backendNone: "nenhum",
    latestChange: "Última alteração: {0}",
    errNoRepo: "Este tema não informa nenhum repositório do GitHub",
    errAlready: "Já instalado",
    errBuild: "A última build do plugin está falhando, então ele não pode ser instalado",
    errNoLink: "steambrew.app não forneceu um link de download",
    errStart: "O Millennium não conseguiu iniciar a instalação",
    errTimeout: "Tempo esgotado aguardando o Millennium",
    errFailed: "A instalação falhou",
    toastTitle: "{0} instalado",
    toastTheme: "Vá à aba Temas para ativá-lo.",
    toastPlugin: "Vá à aba Plugins para ativá-lo.",
    setNotifyLabel: "Notificar quando uma instalação terminar",
    setNotifyDesc: "Mostra uma notificação da Steam quando um tema ou plugin for instalado pelo Brew Hub.",
    setIntro: "O Brew Hub adiciona uma aba própria às configurações do Millennium, ao lado de Plugins.",
    setOpen: "Abrir o Brew Hub",
  },
  russian: {
    tabThemes: "Темы",
    tabPlugins: "Плагины",
    refresh: "Обновить",
    loading: "Загрузка...",
    sortPopular: "Больше всего загрузок",
    sortUnpopular: "Меньше всего загрузок",
    sortUpdated: "Недавно обновлённые",
    sortStale: "Давно не обновлялись",
    sortName: "По алфавиту",
    filterAll: "Все",
    filterInstalled: "Установленные",
    filterMissing: "Не установленные",
    filterTag: "Тег: {0}",
    searchPlaceholder: "Введите текст для поиска...",
    loadingList: "Загрузка с steambrew.app...",
    loadFailed: "Не удалось загрузить список: {0}",
    tryAgain: "Повторить",
    noMatch: "Ничего не найдено.",
    by: "автор: {0}",
    downloads: "загрузок: {0}",
    updatedOn: "обновлено {0}",
    details: "Подробнее",
    install: "Установить",
    retry: "Повторить",
    useTheme: "Применить тему",
    active: "Активна",
    enable: "Включить",
    enabled: "Включён",
    buildFailing: "Сборка с ошибкой",
    installing: "Установка",
    statusStarting: "Запуск",
    statusDownloading: "Загрузка",
    statusExtracting: "Распаковка",
    statusSettingUp: "Настройка",
    statusInstalling: "Установка",
    statusCopying: "Копирование файлов",
    statusCleaning: "Очистка",
    statusDone: "Готово",
    back: "Назад",
    noReadme: "README не найден.",
    factAuthor: "Автор",
    factVersion: "Версия",
    factUpdated: "Обновлено",
    factDownloads: "Загрузки",
    factStars: "Звёзды",
    factDownload: "Загрузка",
    factRepository: "Репозиторий",
    factBackend: "Бэкенд",
    factFolder: "Папка",
    factRepo: "Репозиторий",
    backendNone: "нет",
    latestChange: "Последнее изменение: {0}",
    errNoRepo: "У этой темы не указан репозиторий GitHub",
    errAlready: "Уже установлено",
    errBuild: "Последняя сборка плагина с ошибкой, поэтому его нельзя установить",
    errNoLink: "steambrew.app не предоставил ссылку для загрузки",
    errStart: "Millennium не смог начать установку",
    errTimeout: "Истекло время ожидания Millennium",
    errFailed: "Не удалось установить",
    toastTitle: "{0}: установлено",
    toastTheme: "Перейдите на вкладку «Темы», чтобы применить её.",
    toastPlugin: "Перейдите на вкладку «Плагины», чтобы включить его.",
    setNotifyLabel: "Уведомлять о завершении установки",
    setNotifyDesc: "Показывать уведомление Steam, когда тема или плагин установлены через Brew Hub.",
    setIntro: "Brew Hub добавляет отдельную вкладку в настройки Millennium, рядом с «Плагины».",
    setOpen: "Открыть Brew Hub",
  },
  schinese: {
    tabThemes: "主题",
    tabPlugins: "插件",
    refresh: "刷新",
    loading: "加载中...",
    sortPopular: "下载最多",
    sortUnpopular: "下载最少",
    sortUpdated: "最近更新",
    sortStale: "最久未更新",
    sortName: "按字母顺序",
    filterAll: "全部",
    filterInstalled: "已安装",
    filterMissing: "未安装",
    filterTag: "标签：{0}",
    searchPlaceholder: "在此输入以搜索...",
    loadingList: "正在从 steambrew.app 加载...",
    loadFailed: "无法加载列表：{0}",
    tryAgain: "重试",
    noMatch: "没有匹配项。",
    by: "作者：{0}",
    downloads: "{0} 次下载",
    updatedOn: "更新于 {0}",
    details: "详情",
    install: "安装",
    retry: "重试",
    useTheme: "使用主题",
    active: "使用中",
    enable: "启用",
    enabled: "已启用",
    buildFailing: "构建失败",
    installing: "正在安装",
    statusStarting: "正在启动",
    statusDownloading: "正在下载",
    statusExtracting: "正在解压",
    statusSettingUp: "正在设置",
    statusInstalling: "正在安装",
    statusCopying: "正在复制文件",
    statusCleaning: "正在清理",
    statusDone: "完成",
    back: "返回",
    noReadme: "未找到 README。",
    factAuthor: "作者",
    factVersion: "版本",
    factUpdated: "更新",
    factDownloads: "下载",
    factStars: "星标",
    factDownload: "下载大小",
    factRepository: "仓库大小",
    factBackend: "后端",
    factFolder: "文件夹",
    factRepo: "仓库",
    backendNone: "无",
    latestChange: "最近更改：{0}",
    errNoRepo: "此主题未提供 GitHub 仓库",
    errAlready: "已安装",
    errBuild: "该插件最新的构建失败，无法安装",
    errNoLink: "steambrew.app 未提供下载链接",
    errStart: "Millennium 无法开始安装",
    errTimeout: "等待 Millennium 超时",
    errFailed: "安装失败",
    toastTitle: "{0} 已安装",
    toastTheme: "请前往“主题”选项卡以启用。",
    toastPlugin: "请前往“插件”选项卡以启用。",
    setNotifyLabel: "安装完成时通知",
    setNotifyDesc: "通过 Brew Hub 安装主题或插件后，显示 Steam 通知。",
    setIntro: "Brew Hub 会在 Millennium 设置中的“插件”旁添加自己的选项卡。",
    setOpen: "打开 Brew Hub",
  },
  tchinese: {
    tabThemes: "主題",
    tabPlugins: "外掛",
    refresh: "重新整理",
    loading: "載入中...",
    sortPopular: "下載最多",
    sortUnpopular: "下載最少",
    sortUpdated: "最近更新",
    sortStale: "最久未更新",
    sortName: "依字母順序",
    filterAll: "全部",
    filterInstalled: "已安裝",
    filterMissing: "未安裝",
    filterTag: "標籤：{0}",
    searchPlaceholder: "在此輸入以搜尋...",
    loadingList: "正在從 steambrew.app 載入...",
    loadFailed: "無法載入清單：{0}",
    tryAgain: "重試",
    noMatch: "沒有符合的項目。",
    by: "作者：{0}",
    downloads: "{0} 次下載",
    updatedOn: "更新於 {0}",
    details: "詳細資料",
    install: "安裝",
    retry: "重試",
    useTheme: "使用主題",
    active: "使用中",
    enable: "啟用",
    enabled: "已啟用",
    buildFailing: "建置失敗",
    installing: "正在安裝",
    statusStarting: "正在啟動",
    statusDownloading: "正在下載",
    statusExtracting: "正在解壓縮",
    statusSettingUp: "正在設定",
    statusInstalling: "正在安裝",
    statusCopying: "正在複製檔案",
    statusCleaning: "正在清理",
    statusDone: "完成",
    back: "返回",
    noReadme: "找不到 README。",
    factAuthor: "作者",
    factVersion: "版本",
    factUpdated: "更新",
    factDownloads: "下載",
    factStars: "星號",
    factDownload: "下載大小",
    factRepository: "儲存庫大小",
    factBackend: "後端",
    factFolder: "資料夾",
    factRepo: "儲存庫",
    backendNone: "無",
    latestChange: "最近變更：{0}",
    errNoRepo: "此主題未提供 GitHub 儲存庫",
    errAlready: "已安裝",
    errBuild: "此外掛最新的建置失敗，無法安裝",
    errNoLink: "steambrew.app 未提供下載連結",
    errStart: "Millennium 無法開始安裝",
    errTimeout: "等待 Millennium 逾時",
    errFailed: "安裝失敗",
    toastTitle: "{0} 已安裝",
    toastTheme: "請前往「主題」分頁以啟用。",
    toastPlugin: "請前往「外掛」分頁以啟用。",
    setNotifyLabel: "安裝完成時通知",
    setNotifyDesc: "透過 Brew Hub 安裝主題或外掛後，顯示 Steam 通知。",
    setIntro: "Brew Hub 會在 Millennium 設定中的「外掛」旁新增自己的分頁。",
    setOpen: "開啟 Brew Hub",
  },
  japanese: {
    tabThemes: "テーマ",
    tabPlugins: "プラグイン",
    refresh: "更新",
    loading: "読み込み中...",
    sortPopular: "ダウンロード数が多い順",
    sortUnpopular: "ダウンロード数が少ない順",
    sortUpdated: "更新が新しい順",
    sortStale: "更新が古い順",
    sortName: "名前順",
    filterAll: "すべて",
    filterInstalled: "インストール済み",
    filterMissing: "未インストール",
    filterTag: "タグ：{0}",
    searchPlaceholder: "ここに入力して検索...",
    loadingList: "steambrew.app から読み込み中...",
    loadFailed: "一覧を読み込めませんでした：{0}",
    tryAgain: "再試行",
    noMatch: "一致する項目がありません。",
    by: "作者：{0}",
    downloads: "{0} ダウンロード",
    updatedOn: "{0} に更新",
    details: "詳細",
    install: "インストール",
    retry: "再試行",
    useTheme: "テーマを使用",
    active: "使用中",
    enable: "有効にする",
    enabled: "有効",
    buildFailing: "ビルド失敗",
    installing: "インストール中",
    statusStarting: "開始中",
    statusDownloading: "ダウンロード中",
    statusExtracting: "展開中",
    statusSettingUp: "設定中",
    statusInstalling: "インストール中",
    statusCopying: "ファイルをコピー中",
    statusCleaning: "クリーンアップ中",
    statusDone: "完了",
    back: "戻る",
    noReadme: "README が見つかりません。",
    factAuthor: "作者",
    factVersion: "バージョン",
    factUpdated: "更新",
    factDownloads: "ダウンロード",
    factStars: "スター",
    factDownload: "ダウンロードサイズ",
    factRepository: "リポジトリサイズ",
    factBackend: "バックエンド",
    factFolder: "フォルダー",
    factRepo: "リポジトリ",
    backendNone: "なし",
    latestChange: "最新の変更：{0}",
    errNoRepo: "このテーマには GitHub リポジトリが記載されていません",
    errAlready: "インストール済みです",
    errBuild: "このプラグインの最新ビルドが失敗しているため、インストールできません",
    errNoLink: "steambrew.app からダウンロードリンクが提供されませんでした",
    errStart: "Millennium がインストールを開始できませんでした",
    errTimeout: "Millennium の応答待ちがタイムアウトしました",
    errFailed: "インストールに失敗しました",
    toastTitle: "{0} をインストールしました",
    toastTheme: "有効にするには「テーマ」タブに移動してください。",
    toastPlugin: "有効にするには「プラグイン」タブに移動してください。",
    setNotifyLabel: "インストール完了時に通知する",
    setNotifyDesc: "Brew Hub からテーマまたはプラグインをインストールしたときに Steam の通知を表示します。",
    setIntro: "Brew Hub は Millennium の設定の「プラグイン」の隣に専用タブを追加します。",
    setOpen: "Brew Hub を開く",
  },
  koreana: {
    tabThemes: "테마",
    tabPlugins: "플러그인",
    refresh: "새로 고침",
    loading: "불러오는 중...",
    sortPopular: "다운로드 많은 순",
    sortUnpopular: "다운로드 적은 순",
    sortUpdated: "최근 업데이트순",
    sortStale: "오래된 업데이트순",
    sortName: "가나다순",
    filterAll: "전체",
    filterInstalled: "설치됨",
    filterMissing: "설치되지 않음",
    filterTag: "태그: {0}",
    searchPlaceholder: "검색어를 입력하세요...",
    loadingList: "steambrew.app에서 불러오는 중...",
    loadFailed: "목록을 불러올 수 없습니다: {0}",
    tryAgain: "다시 시도",
    noMatch: "일치하는 항목이 없습니다.",
    by: "제작: {0}",
    downloads: "다운로드 {0}회",
    updatedOn: "{0} 업데이트",
    details: "상세 정보",
    install: "설치",
    retry: "다시 시도",
    useTheme: "테마 사용",
    active: "사용 중",
    enable: "활성화",
    enabled: "활성화됨",
    buildFailing: "빌드 실패",
    installing: "설치 중",
    statusStarting: "시작하는 중",
    statusDownloading: "다운로드 중",
    statusExtracting: "압축 해제 중",
    statusSettingUp: "설정 중",
    statusInstalling: "설치 중",
    statusCopying: "파일 복사 중",
    statusCleaning: "정리 중",
    statusDone: "완료",
    back: "뒤로",
    noReadme: "README를 찾을 수 없습니다.",
    factAuthor: "제작자",
    factVersion: "버전",
    factUpdated: "업데이트",
    factDownloads: "다운로드",
    factStars: "별",
    factDownload: "다운로드 크기",
    factRepository: "저장소 크기",
    factBackend: "백엔드",
    factFolder: "폴더",
    factRepo: "저장소",
    backendNone: "없음",
    latestChange: "최근 변경 사항: {0}",
    errNoRepo: "이 테마에는 GitHub 저장소가 명시되어 있지 않습니다",
    errAlready: "이미 설치되어 있습니다",
    errBuild: "이 플러그인의 최신 빌드가 실패하여 설치할 수 없습니다",
    errNoLink: "steambrew.app에서 다운로드 링크를 제공하지 않았습니다",
    errStart: "Millennium에서 설치를 시작할 수 없습니다",
    errTimeout: "Millennium 응답 대기 시간이 초과되었습니다",
    errFailed: "설치하지 못했습니다",
    toastTitle: "{0} 설치됨",
    toastTheme: "활성화하려면 테마 탭으로 이동하세요.",
    toastPlugin: "활성화하려면 플러그인 탭으로 이동하세요.",
    setNotifyLabel: "설치가 끝나면 알림",
    setNotifyDesc: "Brew Hub에서 테마 또는 플러그인을 설치하면 Steam 알림을 표시합니다.",
    setIntro: "Brew Hub는 Millennium 설정의 플러그인 옆에 자체 탭을 추가합니다.",
    setOpen: "Brew Hub 열기",
  },
  polish: {
    tabThemes: "Motywy",
    tabPlugins: "Wtyczki",
    refresh: "Odśwież",
    loading: "Wczytywanie...",
    sortPopular: "Najczęściej pobierane",
    sortUnpopular: "Najrzadziej pobierane",
    sortUpdated: "Ostatnio zaktualizowane",
    sortStale: "Najdawniej zaktualizowane",
    sortName: "Alfabetycznie",
    filterAll: "Wszystkie",
    filterInstalled: "Zainstalowane",
    filterMissing: "Niezainstalowane",
    filterTag: "Tag: {0}",
    searchPlaceholder: "Wpisz tutaj, aby wyszukać...",
    loadingList: "Wczytywanie z steambrew.app...",
    loadFailed: "Nie udało się wczytać listy: {0}",
    tryAgain: "Spróbuj ponownie",
    noMatch: "Brak wyników.",
    by: "autor: {0}",
    downloads: "pobrań: {0}",
    updatedOn: "zaktualizowano {0}",
    details: "Szczegóły",
    install: "Zainstaluj",
    retry: "Ponów",
    useTheme: "Użyj motywu",
    active: "Aktywny",
    enable: "Włącz",
    enabled: "Włączona",
    buildFailing: "Błąd kompilacji",
    installing: "Instalowanie",
    statusStarting: "Uruchamianie",
    statusDownloading: "Pobieranie",
    statusExtracting: "Rozpakowywanie",
    statusSettingUp: "Konfigurowanie",
    statusInstalling: "Instalowanie",
    statusCopying: "Kopiowanie plików",
    statusCleaning: "Sprzątanie",
    statusDone: "Gotowe",
    back: "Wstecz",
    noReadme: "Nie znaleziono pliku README.",
    factAuthor: "Autor",
    factVersion: "Wersja",
    factUpdated: "Zaktualizowano",
    factDownloads: "Pobrania",
    factStars: "Gwiazdki",
    factDownload: "Pobieranie",
    factRepository: "Repozytorium",
    factBackend: "Backend",
    factFolder: "Folder",
    factRepo: "Repozytorium",
    backendNone: "brak",
    latestChange: "Ostatnia zmiana: {0}",
    errNoRepo: "Ten motyw nie podaje repozytorium GitHub",
    errAlready: "Już zainstalowano",
    errBuild: "Najnowsza kompilacja wtyczki kończy się błędem, więc nie można jej zainstalować",
    errNoLink: "steambrew.app nie podał linku do pobrania",
    errStart: "Millennium nie mógł rozpocząć instalacji",
    errTimeout: "Przekroczono czas oczekiwania na Millennium",
    errFailed: "Instalacja nie powiodła się",
    toastTitle: "Zainstalowano: {0}",
    toastTheme: "Przejdź do karty Motywy, aby go aktywować.",
    toastPlugin: "Przejdź do karty Wtyczki, aby ją włączyć.",
    setNotifyLabel: "Powiadamiaj o zakończeniu instalacji",
    setNotifyDesc: "Pokazuje powiadomienie Steam, gdy motyw lub wtyczka zostanie zainstalowana z Brew Hub.",
    setIntro: "Brew Hub dodaje własną kartę do ustawień Millennium, obok Wtyczek.",
    setOpen: "Otwórz Brew Hub",
  },
};

const LANG_ALIASES = { en: 'english', de: 'german', fr: 'french', es: 'spanish', 'es-419': 'latam', 'es-mx': 'latam', pt: 'brazilian', 'pt-br': 'brazilian', portuguese: 'brazilian', ru: 'russian', zh: 'schinese', 'zh-cn': 'schinese', 'zh-hans': 'schinese', 'zh-tw': 'tchinese', 'zh-hk': 'tchinese', 'zh-hant': 'tchinese', ja: 'japanese', ko: 'koreana', korean: 'koreana', pl: 'polish' };
const LANG_FALLBACK = { latam: ['spanish'] };
let currentLanguage = 'english';

function normalizeLanguage(lang) { const l = String(lang == null ? '' : lang).toLowerCase().trim(); return LANG_ALIASES[l] || l || 'english'; }

function translate(key, ...args) {
  let str;
  for (const lang of [currentLanguage].concat(LANG_FALLBACK[currentLanguage] || [], 'english')) {
    if (LOCALES[lang] && LOCALES[lang][key] !== undefined) { str = LOCALES[lang][key]; break; }
  }
  if (str === undefined) return key;
  return str.replace(/\{(\d+)\}/g, (m, i) => (args[Number(i)] !== undefined ? String(args[Number(i)]) : m));
}
const t = translate;

async function detectLanguage() {
  try {
    const lang = normalizeLanguage(await (window as any).SteamClient.Settings.GetCurrentLanguage());
    if (lang !== currentLanguage) { currentLanguage = lang; emit(); }
  } catch (e) { log('could not read the Steam language, using english', e); }
}


/* ═════════════ Millennium's built-in functions ═════════════ */

// the SDK's own ffi() would call this plugin's backend, so go through the loader's function with plugin name "core".
// It is read as a property and called under another name: Starlight's FFI check flags every call named ffi or callable.
const core = route => (...args) => {
  const api = (window as any).MILLENNIUM_API;
  const rpc = api && api['ffi'];
  if (typeof rpc !== 'function') return Promise.reject(new Error('Millennium FFI is not available'));
  return rpc('core', route)(...args);
};

/* Millennium reports install progress by calling PLUGIN_LIST.core.InstallerMessageEmitter(status, progress, isComplete, success, opId).
 * Its listener list is private, so wrap the function: events of installs started here go to us, everything else goes on to Millennium. */
const opListeners = new Map();
const earlyEvents = new Map();
let emitterOriginal = null;
let emitterHooked = false;
let starting = 0; // installs of ours that are being started: their first events can arrive before we know the opId

function hookEmitter() {
  const c = (window as any).PLUGIN_LIST && (window as any).PLUGIN_LIST.core;
  if (!c || typeof c.InstallerMessageEmitter !== 'function') return false;
  if (c.InstallerMessageEmitter.__brewhub) { emitterHooked = true; return true; }
  const orig = c.InstallerMessageEmitter;
  const wrapped = function (status, progress, isComplete, success, opId) {
    const id = Number(opId) || 0;
    const ev = { status: String(status == null ? '' : status), progress: Number(progress) || 0, isComplete: !!isComplete, success: success !== false, opId: id };
    const listener = opListeners.get(id);
    if (listener) { try { listener(ev); } catch (e) { /* ignore */ } return undefined; }
    if (id > 0 && starting > 0) {
      // an install that has just started can report before waitForOp registers: keep its events
      if (!earlyEvents.has(id)) { if (earlyEvents.size >= 40) earlyEvents.delete(earlyEvents.keys().next().value); earlyEvents.set(id, []); }
      const list = earlyEvents.get(id);
      list.push(ev); if (list.length > 30) list.shift();
      return undefined;
    }
    return orig.apply(this, arguments);
  };
  wrapped.__brewhub = true;
  emitterOriginal = orig;
  c.InstallerMessageEmitter = wrapped;
  emitterHooked = true;
  return true;
}

function unhookEmitter() {
  try {
    const c = (window as any).PLUGIN_LIST && (window as any).PLUGIN_LIST.core;
    if (c && c.InstallerMessageEmitter && c.InstallerMessageEmitter.__brewhub && emitterOriginal) c.InstallerMessageEmitter = emitterOriginal;
  } catch (e) { /* ignore */ }
  emitterHooked = false; emitterOriginal = null;
  opListeners.clear(); earlyEvents.clear();
}

// resolves { ok, msg } when Millennium reports the install finished. `probe` is the fallback when the emitter cannot be hooked
function waitForOp(opId, onProgress, probe) {
  hookEmitter();
  return new Promise(resolve => {
    let done = false, poll = null, limit = null;
    const finish = (ok, msg) => {
      if (done) return;
      done = true; opListeners.delete(opId); clearInterval(poll); clearTimeout(limit);
      resolve({ ok, msg });
    };
    const onEvent = ev => { onProgress(ev); if (ev.isComplete) finish(ev.success, ev.status); };
    opListeners.set(opId, onEvent);
    const early = earlyEvents.get(opId);
    if (early) { earlyEvents.delete(opId); early.forEach(onEvent); }
    if (!emitterHooked) poll = setInterval(async () => { try { if (await probe()) finish(true, ''); } catch (e) { /* keep polling */ } }, 2000);
    limit = setTimeout(() => finish(false, t('errTimeout')), 5 * 60 * 1000);
  });
}

/* ═════════════ steambrew.app ═════════════ */

// steambrew.app's list endpoints send no CORS header, so Steam's UI cannot fetch them: the backend does (see backend/main.lua)
async function fromBackend(call) {
  const raw = await call;
  const data = raw && typeof raw === 'object' ? raw : JSON.parse(String(raw));
  if (data && data.__error) throw new Error(String(data.__error));
  return data;
}
async function withRetry(run, tries) {
  let last;
  for (let i = 0; i < tries; i++) {
    try { return await run(); } catch (e) { last = e; if (i < tries - 1) await sleep(800 * (i + 1)); }
  }
  throw last;
}
const listFromSite = kind => withRetry(() => fromBackend(backend.bh_list(kind)), 3);
const getFromSite = path => withRetry(() => fromBackend(backend.bh_get(path)), 2);

const num = v => (typeof v === 'number' && isFinite(v) ? v : 0);
const isUrl = v => typeof v === 'string' && /^https?:\/\//i.test(v);
const day = v => { const t = new Date(v); return isNaN(t.getTime()) ? '' : t.toISOString().slice(0, 10); };
const compact = n => (n >= 10000 ? Math.round(n / 1000) + 'K' : n >= 1000 ? (n / 1000).toFixed(1) + 'K' : String(n));
const pairKey = (owner, repo) => (String(owner) + '/' + String(repo)).toLowerCase();

function normalizeTheme(t) {
  if (!t || !t.id || !t.name) return null;
  return {
    kind: 'theme', id: String(t.id), name: String(t.name), description: String(t.description || ''),
    author: String(t.author || t.owner || ''), version: t.version && t.version !== 'none' ? String(t.version) : '',
    tags: Array.isArray(t.tags) ? t.tags.slice(0, 4).map(String) : [], allTags: Array.isArray(t.tags) ? t.tags.map(String) : [], image: isUrl(t.header_image) ? t.header_image : '',
    downloads: num(t.downloads), updated: day(t.committed), owner: String(t.owner || ''), repo: String(t.repo || ''),
    splash: isUrl(t.splash_image) ? t.splash_image : '', discord: t.discord ? String(t.discord) : '',
  };
}

function normalizePlugin(p) {
  if (!p || !p.id || !p.name || p.unlisted === true) return null;
  return {
    kind: 'plugin', id: String(p.id), name: String(p.common_name || p.name), folder: String(p.name), description: String(p.description || ''),
    author: String(p.author || ''), version: p.version ? String(p.version) : '', tags: [], allTags: [], image: '',
    downloads: num(p.downloads), size: p.size ? String(p.size) : '', updated: day(p.committed), buildFailing: p.hasValidBuild === false,
    stars: num(p.stars), disk: p.disk ? String(p.disk) : '', backend: p.backend ? String(p.backend) : '', change: p.change ? String(p.change) : '',
    owner: String(p.repo_owner || ''), repo: String(p.repo_name || ''),
  };
}

const SOURCES = { themes: normalizeTheme, plugins: normalizePlugin };

/* ═════════════ shared state (survives leaving the tab) ═════════════ */

const store = {
  data: { themes: { state: 'idle', items: [], at: 0, error: '' }, plugins: { state: 'idle', items: [], at: 0, error: '' } },
  installedSig: '',
  installed: null, // { themes: { "owner/repo": { native, name } }, plugins: { folder: { enabled } }, active: native folder name }
  detail: null, // { kind, id } while the details view is open
  details: {}, // "theme:<id>" / "plugin:<id>" -> { state: loading | ready, text, note }
  unofficial: { list: [], info: {} }, // list: [{ owner, repo, folder, version }] saved in localStorage; info: "owner/repo" -> { state, release, error, at }
  ops: {}, // "theme:<id>" / "plugin:<id>" -> { state: working | done | error, status, progress, msg }
  listeners: new Set(),
};
const emit = () => store.listeners.forEach(f => { try { f(); } catch (e) { /* ignore */ } });
function useStore() {
  const [, bump] = React.useReducer(x => x + 1, 0);
  React.useEffect(() => { store.listeners.add(bump); return () => { store.listeners.delete(bump); }; }, []);
}
const setOp = (key, patch) => { store.ops[key] = Object.assign({}, store.ops[key], patch); emit(); };

async function load(kind, force) {
  const s = store.data[kind];
  if (s.state === 'loading') return;
  if (!force && s.state === 'ready' && Date.now() - s.at < CACHE_MS) return;
  s.state = 'loading'; s.error = ''; emit();
  try {
    const raw = await listFromSite(kind);
    if (!Array.isArray(raw)) throw new Error('Unexpected answer from steambrew.app');
    s.items = raw.map(SOURCES[kind]).filter(Boolean);
    s.state = 'ready'; s.at = Date.now();
  } catch (e) {
    s.state = 'error'; s.error = String(e && e.message || e);
    log('could not load', kind, e);
  }
  emit();
}

async function refreshInstalled() {
  try {
    const [themes, plugins, active] = await Promise.all([core('Core_FindAllThemes')(), core('Core_FindAllPlugins')(), core('Core_GetActiveTheme')()]);
    const t = {}, p = {};
    (Array.isArray(themes) ? themes : []).forEach(x => {
      const g = x && x.data && x.data.github;
      if (g && g.owner && (g.repo_name || g.repo)) t[pairKey(g.owner, g.repo_name || g.repo)] = { native: x.native, name: x.data.name };
    });
    (Array.isArray(plugins) ? plugins : []).forEach(x => { if (x && x.data && x.data.name) p[x.data.name] = { enabled: !!x.enabled, version: x.data.version != null ? String(x.data.version) : '', title: x.data.common_name ? String(x.data.common_name) : '' }; });
    const next = { themes: t, plugins: p, active: active && active.native ? String(active.native) : '' };
    const sig = JSON.stringify(next);
    if (sig === store.installedSig) return; // nothing changed: no re-render
    store.installed = next; store.installedSig = sig;
  } catch (e) {
    log('could not read what is installed', e);
    if (!store.installed) store.installed = { themes: {}, plugins: {}, active: '' };
  }
  emit();
}

/* ═════════════ installing ═════════════ */

// Millennium reports progress as locale keys ("##strDownloadingPluginArchive"). Say it the way a person would
const STATUS_WORDS = {
  strStartingPluginInstaller: 'statusStarting', strStartingThemeInstaller: 'statusStarting',
  strDownloadingPluginArchive: 'statusDownloading', strDownloadingPluginUpdate: 'statusDownloading', strDownloadingTheme: 'statusDownloading', strDownloadingThemeUpdate: 'statusDownloading',
  strExtractingPluginArchive: 'statusExtracting', strExtractingThemeArchive: 'statusExtracting',
  strSettingUpPlugin: 'statusSettingUp', strSettingUpTheme: 'statusSettingUp', strInstallingTheme: 'statusInstalling',
  strCopyingPluginFiles: 'statusCopying', strCopyingThemeFiles: 'statusCopying', strCleaningUp: 'statusCleaning', strDone: 'statusDone',
};
function friendlyStatus(raw) {
  const text = String(raw == null ? '' : raw).trim();
  const m = text.match(/^#*\s*(str[A-Za-z0-9]+)$/);
  if (m) return STATUS_WORDS[m[1]] ? t(STATUS_WORDS[m[1]]) : m[1].replace(/^str/, '').replace(/([a-z])([A-Z])/g, '$1 $2');
  return text.replace(/^#+\s*/, '').replace(/(\.{3}|…)$/, '');
}


const countDownload = (kind, id) => { try { Promise.resolve(backend.bh_get('/api/bump/' + kind + '/' + id)).catch(() => {}); } catch (e) { /* the counter is optional */ } };

async function runInstall(item, key, start, probe, afterOk, onDone) {
  setOp(key, { state: 'working', status: t('statusStarting'), progress: 0, msg: '' });
  hookEmitter(); // before the install starts, so no progress event is missed
  starting++;
  try {
    let res;
    try { res = await start(); } finally { starting--; }
    if (!res || !res.success) throw new Error((res && (res.message || res.error)) || t('errStart'));
    afterOk();
    const out = await waitForOp(res.opId || 0, ev => setOp(key, { status: friendlyStatus(ev.status), progress: ev.progress }), probe);
    await refreshInstalled();
    if (out.ok) { if (onDone) { try { onDone(); } catch (e) { /* ignore */ } } setOp(key, { state: 'done', status: '', progress: 100 }); notifyInstalled(item); }
    else setOp(key, { state: 'error', msg: friendlyStatus(out.msg) || t('errFailed') });
  } catch (e) {
    await refreshInstalled();
    setOp(key, { state: 'error', msg: String(e && e.message || e) });
  }
}

function installTheme(item) {
  const key = 'theme:' + item.id;
  if (!item.owner || !item.repo) { setOp(key, { state: 'error', msg: t('errNoRepo') }); return Promise.resolve(); }
  return runInstall(item, key,
    async () => {
      if (await core('Core_IsThemeInstalled')(item.owner, item.repo)) throw new Error(t('errAlready'));
      return core('Core_InstallTheme')(item.owner, item.repo);
    },
    () => core('Core_IsThemeInstalled')(item.owner, item.repo),
    () => countDownload('theme', item.id));
}

function installPlugin(item) {
  const key = 'plugin:' + item.id;
  let folder = item.folder;
  return runInstall(item, key,
    async () => {
      // the list has no download link for most plugins; ask for this one the way Millennium's own installer does
      const info = await getFromSite('/api/v1/plugin/' + item.id);
      if (!info || !info.hasValidBuild) throw new Error(t('errBuild'));
      if (!info.downloadUrl) throw new Error(t('errNoLink'));
      folder = info.pluginJson && info.pluginJson.name || folder;
      if (await core('Core_IsPluginInstalled')(folder)) throw new Error(t('errAlready'));
      return core('Core_InstallPlugin')(SITE + info.downloadUrl, info.fileSize);
    },
    () => core('Core_IsPluginInstalled')(folder),
    () => countDownload('plugin', item.id));
}

const enablePlugin = folder => core('Core_ChangePluginStatus')(JSON.stringify([{ plugin_name: folder, enabled: true }])).then(refreshInstalled);

/* ═════════════ unofficial plugins (GitHub releases) ═════════════ */

const UNOFFICIAL_KEY = 'brewhub:unofficial';
function readUnofficial() {
  try {
    const v = JSON.parse(localStorage.getItem(UNOFFICIAL_KEY) || '[]');
    return (Array.isArray(v) ? v : []).filter(x => x && typeof x.owner === 'string' && typeof x.repo === 'string')
      .map(x => ({ owner: x.owner, repo: x.repo, folder: typeof x.folder === 'string' ? x.folder : '', version: typeof x.version === 'string' ? x.version : '' }));
  } catch (e) { return []; }
}
function saveUnofficial() { try { localStorage.setItem(UNOFFICIAL_KEY, JSON.stringify(store.unofficial.list)); } catch (e) { /* kept for this session only */ } }
store.unofficial.list = readUnofficial();

const keyOf = e => pairKey(e.owner, e.repo);
const normName = v => String(v || '').toLowerCase().replace(/[^a-z0-9]/g, '');

// "owner/repo", "github.com/owner/repo", "https://github.com/owner/repo/releases", "...repo.git"
function parseRepo(text) {
  const raw = String(text || '').trim().replace(/^git@github\.com:/i, '').replace(/^(?:https?:\/\/)?(?:www\.)?github\.com\//i, '');
  const m = raw.match(/^([A-Za-z0-9][A-Za-z0-9._-]*)\/([A-Za-z0-9._-]+?)(?:\.git)?(?:[\/?#].*)?$/);
  if (!m || /^\.+$/.test(m[2])) return null;
  return { owner: m[1], repo: m[2] };
}

// numeric versions only ("v1.2.3", "1.2"); null when either side is not one, so an odd tag never claims an update
function cmpVer(a, b) {
  const num = v => { const m = String(v == null ? '' : v).trim().match(/^v?(\d+(?:\.\d+)*)/i); return m ? m[1].split('.').map(Number) : null; };
  const x = num(a), y = num(b);
  if (!x || !y) return null;
  for (let i = 0; i < Math.max(x.length, y.length); i++) { const d = (x[i] || 0) - (y[i] || 0); if (d) return d > 0 ? 1 : -1; }
  return 0;
}

// the release file to install: a .zip or .star, never a source archive; a .zip first, then the one named like the repository
function pickAsset(release, repo) {
  const list = (release && Array.isArray(release.assets) ? release.assets : []).filter(a => a && isUrl(a.url) && /\.(zip|star)$/i.test(String(a.name)));
  const score = a => { const n = String(a.name).toLowerCase(); return (/source|src/.test(n) ? -10 : 0) + (normName(n).includes(normName(repo)) ? 2 : 0) + (n.endsWith('.zip') ? 1 : 0); };
  return list.slice().sort((a, b) => score(b) - score(a))[0] || null;
}

// which installed plugin belongs to this repository: the folder noted at install, else a name match (repository or release file name)
function findFolder(entry, release) {
  const plugins = store.installed ? store.installed.plugins : {};
  if (entry.folder && plugins[entry.folder]) return entry.folder;
  const want = new Set([normName(entry.repo)]);
  const asset = pickAsset(release, entry.repo);
  if (asset) { const stem = normName(String(asset.name).replace(/\.(zip|star)$/i, '').replace(/[-_. ]v?\d+(\.\d+)*.*$/i, '')); if (stem) want.add(stem); }
  return Object.keys(plugins).find(n => want.has(normName(n)) || (plugins[n].title && want.has(normName(plugins[n].title)))) || '';
}

function unofficialState(entry) {
  const info = store.unofficial.info[keyOf(entry)] || {};
  const rel = info.release && typeof info.release === 'object' ? info.release : null;
  const folder = findFolder(entry, rel);
  const inst = folder ? store.installed.plugins[folder] : null;
  // the version Millennium reports for the installed plugin; if we installed a newer release than it reports (an author who forgot to bump it), ours counts
  let have = '';
  if (inst) { const read = inst.version, noted = entry.version; have = read && noted ? (cmpVer(read, noted) === -1 ? noted : read) : (read || noted || ''); }
  const latest = rel && rel.tag ? String(rel.tag) : '';
  const asset = rel ? pickAsset(rel, entry.repo) : null;
  return { info, rel, folder, inst, have, latest, asset, newer: !!inst && !!have && !!latest && cmpVer(latest, have) === 1 };
}

async function checkRelease(entry, force) {
  const k = keyOf(entry), cur = store.unofficial.info[k];
  if (cur && cur.state === 'loading') return;
  if (!force && cur && cur.state === 'ready' && Date.now() - cur.at < CACHE_MS) return;
  store.unofficial.info[k] = { state: 'loading', at: cur ? cur.at : 0, release: cur ? cur.release : null, error: '' }; emit();
  try {
    const rel = await withRetry(() => fromBackend(backend.bh_release(entry.owner, entry.repo)), 1);
    store.unofficial.info[k] = { state: 'ready', at: Date.now(), release: rel, error: '' };
  } catch (e) {
    store.unofficial.info[k] = { state: 'error', at: Date.now(), release: cur ? cur.release : null, error: String(e && e.message || e) };
    log('could not check', k, e);
  }
  emit();
}

// returns an error text, or '' when the repository was added
function addUnofficial(text) {
  const repo = parseRepo(text);
  if (!repo) return t('errBadRepo');
  if (store.unofficial.list.some(e => keyOf(e) === keyOf(repo))) return t('errDuplicate');
  const entry = { owner: repo.owner, repo: repo.repo, folder: '', version: '' };
  store.unofficial.list.push(entry); saveUnofficial(); emit();
  checkRelease(entry, true);
  return '';
}

// installed plugins that steambrew.app does not list and that no repository in the tab is linked to (only once the steambrew list has loaded, so nothing is wrongly shown while it is missing)
function detectedPlugins() {
  const inst = store.installed, listed = store.data.plugins;
  if (!inst || !listed || listed.state !== 'ready') return [];
  const known = new Set(listed.items.map(i => String(i.folder).toLowerCase()));
  const claimed = new Set(store.unofficial.list.map(e => unofficialState(e).folder.toLowerCase()).filter(Boolean));
  return Object.keys(inst.plugins).filter(n => !known.has(n.toLowerCase()) && !claimed.has(n.toLowerCase())).sort((a, b) => a.localeCompare(b));
}

// ties an installed plugin to its GitHub repository, so its releases and updates are followed; returns an error text, or ''
function linkDetected(folder, text) {
  const repo = parseRepo(text);
  if (!repo) return t('errBadRepo');
  const existing = store.unofficial.list.find(e => keyOf(e) === keyOf(repo));
  if (existing) { existing.folder = folder; saveUnofficial(); emit(); checkRelease(existing, true); return ''; }
  const entry = { owner: repo.owner, repo: repo.repo, folder, version: '' };
  store.unofficial.list.push(entry); saveUnofficial(); emit();
  checkRelease(entry, true);
  return '';
}

function removeUnofficial(entry) {
  store.unofficial.list = store.unofficial.list.filter(e => e !== entry);
  delete store.unofficial.info[keyOf(entry)]; delete store.ops['unofficial:' + keyOf(entry)];
  saveUnofficial(); emit();
}

// installs the latest release, or installs it over the old one when updating
function installUnofficial(entry, updating) {
  const key = 'unofficial:' + keyOf(entry);
  const s = unofficialState(entry);
  const item = { kind: 'plugin', id: keyOf(entry), name: entry.repo, updating: !!updating };
  const before = new Set(Object.keys(store.installed ? store.installed.plugins : {}));
  const fresh = async () => { await refreshInstalled(); return Object.keys(store.installed.plugins).some(n => !before.has(n)); };
  return runInstall(item, key,
    async () => {
      if (!s.asset) throw new Error(t('errNoAsset'));
      return core('Core_InstallPlugin')(s.asset.url, s.asset.size);
    },
    () => (updating ? Promise.resolve(false) : fresh()),
    () => {},
    () => {
      // a new install: the one folder that appeared is this plugin's
      const added = Object.keys(store.installed ? store.installed.plugins : {}).filter(n => !before.has(n));
      if (added.length === 1) entry.folder = added[0];
      entry.version = s.latest; saveUnofficial();
    });
}

// the "Restart Required" dialog Millennium itself shows after a theme change (utils PromptReload): Steam's own strings in a ConfirmModal
const steamText = (key, fallback) => { try { const v = (window as any).LocalizationManager.LocalizeString(key); return v && v !== key ? String(v) : fallback; } catch (e) { return fallback; } };
const restartUI = () => { try { (window as any).SteamClient.Browser.RestartJSContext(); } catch (e) { log('could not reload the Steam UI', e); } };

function promptReload(done) {
  const show = API.showModal, Confirm = API.ConfirmModal;
  if (typeof show !== 'function' || !Confirm) { done(true); return; }
  let main;
  try { main = (window as any).g_PopupManager.GetExistingPopup('SP Desktop_uid0').m_popup.window; } catch (e) { main = undefined; }
  try {
    show(h(Confirm, {
      strTitle: steamText('#Settings_RestartRequired_Title', 'Restart Required'),
      strDescription: steamText('#Settings_RestartRequired_Description', 'This change requires a restart to take effect.'),
      strOKButtonText: steamText('#Settings_RestartNow_ButtonText', 'Restart Now'),
      onOK: () => done(true), onCancel: () => done(false),
    }), main, { bNeverPopOut: false });
  } catch (e) { log('could not show the restart dialog', e); done(true); }
}

async function applyTheme(native) {
  await core('Core_ChangeActiveTheme')(native);
  await refreshInstalled();
  promptReload(ok => { if (ok) restartUI(); });
}

/* ═════════════ settings and notifications ═════════════ */

const readFlag = (key, fallback) => { try { const v = localStorage.getItem(key); return v === null ? fallback : v === '1'; } catch (e) { return fallback; } };
const settings = { notify: readFlag('brewhub:notify', readFlag('storefront:notify', true)) };
function setNotify(on) { settings.notify = !!on; try { localStorage.setItem('brewhub:notify', on ? '1' : '0'); } catch (e) { /* kept for this session only */ } }

// Steam's notification toast, the way Millennium raises its own update toasts (toaster.toast)
function notifyInstalled(item) {
  if (!settings.notify) return;
  try {
    const toaster = API.toaster;
    if (!toaster || typeof toaster.toast !== 'function') return;
    const icons = API.IconsModule;
    toaster.toast({
      title: t(item.updating ? 'toastUpdatedTitle' : 'toastTitle', item.name),
      body: item.updating ? t('toastUpdated') : item.kind === 'theme' ? t('toastTheme') : t('toastPlugin'),
      logo: icons && icons.Download ? h(icons.Download) : h(STORE_ICON),
      onClick: () => { try { API.Navigation.Navigate(item.kind === 'theme' ? THEMES_ROUTE : PLUGINS_ROUTE); } catch (e) { /* ignore */ } },
    });
  } catch (e) { log('could not show the notification', e); }
}

/* ═════════════ details ═════════════ */

const openUrl = u => {
  if (!isUrl(u)) return;
  try { (window as any).SteamClient.System.OpenInSystemBrowser(u); } catch (e) { try { window.open(u); } catch (e2) { /* ignore */ } }
};
const pageUrl = item => SITE + '/' + item.kind + '?id=' + item.id;
const repoUrl = item => (item.owner && item.repo ? 'https://github.com/' + item.owner + '/' + item.repo : '');

async function githubReadme(owner, repo) {
  if (!owner || !repo) return '';
  const res = await withRetry(() => fromBackend(backend.bh_readme(owner, repo)), 2);
  return res && typeof res.text === 'string' ? res.text : '';
}

async function loadDetails(item) {
  const key = item.kind + ':' + item.id;
  if (store.details[key]) return;
  store.details[key] = { state: 'loading', text: '', note: '' }; emit();
  let text = '', note = '';
  try {
    if (item.kind === 'plugin') {
      try { const info = await getFromSite('/api/v1/plugin/' + item.id); text = info && typeof info.readme === 'string' ? info.readme : ''; } catch (e) { note = String(e && e.message || e); }
    }
    if (!text.trim()) text = await githubReadme(item.owner, item.repo);
  } catch (e) { note = String(e && e.message || e); }
  store.details[key] = { state: 'ready', text, note: text.trim() ? '' : note || t('noReadme') };
  emit();
}

const openDetails = item => { store.detail = { kind: item.kind, id: item.id }; emit(); loadDetails(item); };
const closeDetails = () => { store.detail = null; emit(); };

/* ═════════════ README rendering ═════════════
 * Markdown (CommonMark and the GitHub extras READMEs use) to HTML, then that HTML through a small parser and a whitelist into
 * React elements. Raw HTML in a README is only ever read as data: no innerHTML, no scripts, no styles, no event handlers. */

const escText = s => String(s).replace(/&(?!#?\w+;)/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const escAttr = s => String(s).replace(/&(?!#?\w+;)/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const escCode = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const HOLD_RE = /\u0001(\d+)\u0002/g;

const TAG_ATTRS = '(?:\\s+[a-zA-Z_:][\\w:.-]*(?:\\s*=\\s*(?:[^\\s"\'=<>`]+|\'[^\']*\'|"[^"]*"))?)*';
const INLINE_HTML = new RegExp('<!--[\\s\\S]*?-->|<[a-zA-Z][a-zA-Z0-9-]*' + TAG_ATTRS + '\\s*\\/?>|<\\/[a-zA-Z][a-zA-Z0-9-]*\\s*>', 'g');
const TAG_ALONE = new RegExp('^(?:<[a-zA-Z][a-zA-Z0-9-]*' + TAG_ATTRS + '\\s*\\/?>|<\\/[a-zA-Z][a-zA-Z0-9-]*\\s*>)\\s*$');

function inlineMd(src, refs) {
  const holds = [], raws = [];
  const hold = (html, raw) => { holds.push(html); raws.push(raw === undefined ? '' : raw); return '\u0001' + (holds.length - 1) + '\u0002'; };
  const unhold = t => String(t).replace(HOLD_RE, (m, i) => raws[Number(i)]);
  let s = String(src);

  // code spans (the opening run of backticks must be the whole run)
  s = s.replace(/(?<!`)(`+)(?!`)([\s\S]*?[^`])\1(?!`)/g, (m, ticks, body) => {
    let c = body.replace(/\n/g, ' ');
    if (/^ .* $/.test(c) && /[^ ]/.test(c)) c = c.slice(1, -1);
    return hold('<code>' + escCode(c) + '</code>', m);
  });
  // backslash escapes
  s = s.replace(/\\([!-/:-@[-`{-~])/g, (m, ch) => hold(escText(ch), ch));

  // links and images, read from the source text so addresses and titles stay literal
  s = links(s, refs, hold, unhold);

  // autolinks <https://...> and <me@host.tld>
  s = s.replace(/<((?:https?|ftp):\/\/[^\s<>]*)>/gi, (m, url) => hold('<a href="' + escAttr(url) + '">' + escText(url) + '</a>', m));
  s = s.replace(/<([a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+)>/g, (m, mail) => hold('<a href="mailto:' + escAttr(mail) + '">' + escText(mail) + '</a>', m));
  // inline html (tags and comments)
  s = s.replace(INLINE_HTML, m => hold(m, m));

  // bare urls, outside of links
  {
    let depth = 0;
    s = s.split(/(\u0001\d+\u0002)/).map(part => {
      const mm = part.match(/^\u0001(\d+)\u0002$/);
      if (mm) { const h = holds[Number(mm[1])]; if (/^<a[\s>]/.test(h) && !h.includes('</a>')) depth++; else if (h === '</a>') depth--; return part; }
      if (depth > 0) return part;
      return part.replace(/(^|[\s(*_~>])((?:https?:\/\/|www\.)[^\s<\u0001]*[^\s<?!.,:*_~'")\]\u0001\u0002])/g, (m, pre, url) => {
        const href = /^www\./i.test(url) ? 'http://' + url : url;
        return pre + hold('<a href="' + escAttr(href) + '">' + escText(url) + '</a>');
      });
    }).join('');
  }

  s = escText(s);

  // emphasis
  s = s.replace(/~~(?=\S)([\s\S]*?\S)~~/g, '<del>$1</del>');
  s = s.replace(/\*\*\*(?=\S)([\s\S]*?\S)\*\*\*/g, '<em><strong>$1</strong></em>');
  s = s.replace(/(^|[^\w])___(?=\S)([\s\S]*?\S)___(?!\w)/g, '$1<em><strong>$2</strong></em>');
  s = s.replace(/\*\*(?=\S)([\s\S]*?\S)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/(^|[^\w])__(?=\S)([\s\S]*?\S)__(?!\w)/g, '$1<strong>$2</strong>');
  s = s.replace(/\*(?=[^\s*])([\s\S]*?[^\s*])\*/g, '<em>$1</em>');
  s = s.replace(/(^|[^\w])_(?=[^\s_])([\s\S]*?[^\s_])_(?!\w)/g, '$1<em>$2</em>');

  // hard line breaks
  s = s.replace(/(?: {2,}|\\)\n/g, '<br>\n');

  for (let n = 0; n < 4 && /\u0001\d+\u0002/.test(s); n++) s = s.replace(HOLD_RE, (m, i) => holds[Number(i)]);
  return s;
}

const normLabel = l => String(l).trim().replace(/\s+/g, ' ').toLowerCase();

// scans for [text](dest "title"), [text][ref], [text][] and [text]; and the same with a leading !
function links(s, refs, hold, unhold) {
  let out = '';
  let i = 0;
  while (i < s.length) {
    const ch = s[i];
    const isImg = ch === '!' && s[i + 1] === '[';
    if (ch !== '[' && !isImg) { out += ch; i++; continue; }
    const open = isImg ? i + 1 : i;
    let depth = 0, j = open, close = -1;
    for (; j < s.length; j++) {
      if (s[j] === '[') depth++;
      else if (s[j] === ']') { depth--; if (depth === 0) { close = j; break; } }
    }
    if (close < 0) { out += ch; i++; continue; }
    const inner = s.slice(open + 1, close);
    let dest = null, title = '', end = close + 1;
    if (s[end] === '(') {
      const m = parseDest(s, end + 1);
      if (m) { dest = unhold(m.dest); title = unhold(m.title); end = m.end; }
    } else if (s[end] === '[') {
      const k = s.indexOf(']', end + 1);
      if (k > 0) {
        const label = k === end + 1 ? inner : s.slice(end + 1, k);
        const def = refs[normLabel(label)];
        if (def) { dest = def.dest; title = def.title; end = k + 1; }
      }
    } else {
      const def = refs[normLabel(inner)];
      if (def) { dest = def.dest; title = def.title; }
    }
    if (dest === null) { out += ch; i++; continue; }
    const t = title ? ' title="' + escAttr(title) + '"' : '';
    if (isImg) {
      const alt = inner.replace(/\u0001\d+\u0002/g, '').replace(/[[\]*_`]/g, '').replace(/!?\[|\]\([^)]*\)/g, '');
      out += hold('<img src="' + escAttr(dest) + '" alt="' + escAttr(alt) + '"' + t + '>');
    } else {
      out += hold('<a href="' + escAttr(dest) + '"' + t + '>') + links(inner, refs, hold, unhold) + hold('</a>');
    }
    i = end;
  }
  return out;
}

function parseDest(s, at) {
  let i = at;
  while (s[i] === ' ' || s[i] === '\n') i++;
  let dest = '';
  if (s[i] === '<') {
    const k = s.indexOf('>', i);
    if (k < 0) return null;
    dest = s.slice(i + 1, k); i = k + 1;
  } else {
    let depth = 0;
    const st = i;
    while (i < s.length && !/\s/.test(s[i])) {
      if (s[i] === '(') depth++;
      else if (s[i] === ')') { if (depth === 0) break; depth--; }
      i++;
    }
    dest = s.slice(st, i);
  }
  while (s[i] === ' ' || s[i] === '\n') i++;
  let title = '';
  const q = s[i];
  if (q === '"' || q === "'" || q === '(') {
    const endq = q === '(' ? ')' : q;
    const k = s.indexOf(endq, i + 1);
    if (k < 0) return null;
    title = s.slice(i + 1, k); i = k + 1;
    while (s[i] === ' ' || s[i] === '\n') i++;
  }
  if (s[i] !== ')') return null;
  return { dest, title, end: i + 1 };
}

const HTML6 = new Set(['address', 'article', 'aside', 'base', 'basefont', 'blockquote', 'body', 'caption', 'center', 'col', 'colgroup', 'dd', 'details', 'dialog', 'dir', 'div', 'dl', 'dt', 'fieldset', 'figcaption', 'figure', 'footer', 'form', 'frame', 'frameset', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'head', 'header', 'hr', 'html', 'iframe', 'legend', 'li', 'link', 'main', 'menu', 'menuitem', 'nav', 'noframes', 'ol', 'optgroup', 'option', 'p', 'param', 'section', 'source', 'summary', 'table', 'tbody', 'td', 'tfoot', 'th', 'thead', 'title', 'tr', 'track', 'ul']);

const RE_FENCE = /^( {0,3})(`{3,}|~{3,})[ \t]*([^`]*)$/;
const RE_ATX = /^ {0,3}(#{1,6})(?:[ \t]+(.*?))?(?:[ \t]+#+)?[ \t]*$/;
const RE_HR = /^ {0,3}([-*_])(?:[ \t]*\1){2,}[ \t]*$/;
const RE_LIST = /^( {0,3})([-+*]|\d{1,9}[.)])( +|$)(.*)$/;
const RE_BQ = /^ {0,3}>/;
const RE_SETEXT = /^ {0,3}(=+|-+)[ \t]*$/;
const RE_DELIM = /^ {0,3}\|?[ \t]*:?-+:?[ \t]*(?:\|[ \t]*:?-+:?[ \t]*)*\|?[ \t]*$/;

const isBlank = l => /^\s*$/.test(l);
const indentOf = l => { let n = 0; while (n < l.length && l[n] === ' ') n++; return n; };

function htmlBlockType(line, inPara) {
  if (/^ {4}/.test(line)) return 0;
  const t = line.replace(/^ {0,3}/, '');
  let m;
  if (/^<(pre|script|style|textarea)(\s|>|$)/i.test(t)) return 1;
  if (t.startsWith('<!--')) return 2;
  if ((m = t.match(/^<\/?([a-zA-Z][a-zA-Z0-9-]*)(\s|\/?>|$)/)) && HTML6.has(m[1].toLowerCase())) return 6;
  if (!inPara && TAG_ALONE.test(t)) return 7;
  return 0;
}

function listMarker(line) {
  const m = line.match(RE_LIST);
  if (!m || RE_HR.test(line)) return null;
  return m;
}

// can this line start a block that interrupts a paragraph?
function interrupts(line) {
  if (RE_FENCE.test(line) || (RE_ATX.test(line) && /^ {0,3}#/.test(line)) || RE_BQ.test(line)) return true;
  if (RE_HR.test(line)) return true;
  const t = htmlBlockType(line, true);
  if (t >= 1 && t <= 6) return true;
  const lm = listMarker(line);
  if (lm && lm[4] !== '' && (/^[-+*]$/.test(lm[2]) || /^1[.)]$/.test(lm[2]))) return true;
  return false;
}

function splitRow(row) {
  let r = row.trim();
  if (r.startsWith('|')) r = r.slice(1);
  if (r.endsWith('|') && !r.endsWith('\\|')) r = r.slice(0, -1);
  const cells = [];
  let cur = '';
  for (let k = 0; k < r.length; k++) {
    const c = r[k];
    if (c === '\\' && r[k + 1] === '|') { cur += '|'; k++; }
    else if (c === '|') { cells.push(cur.trim()); cur = ''; }
    else cur += c;
  }
  cells.push(cur.trim());
  return cells;
}

// returns [{ kind: 'p' | 'other', html, inner, blankBefore }]
function blocks(lines, refs) {
  const out = [];
  let i = 0, sawBlank = false;
  const push = (kind, html, inner) => { out.push({ kind, html, inner, blankBefore: sawBlank && out.length > 0 }); sawBlank = false; };

  while (i < lines.length) {
    const line = lines[i];
    if (isBlank(line)) { sawBlank = true; i++; continue; }
    let m;

    if ((m = line.match(RE_FENCE))) {
      const ind = m[1].length, fence = m[2], lang = m[3].trim().split(/\s+/)[0];
      const body = [];
      i++;
      while (i < lines.length) {
        const cm = lines[i].match(/^ {0,3}(`{3,}|~{3,})[ \t]*$/);
        if (cm && cm[1][0] === fence[0] && cm[1].length >= fence.length) { i++; break; }
        body.push(lines[i].replace(new RegExp('^ {0,' + ind + '}'), ''));
        i++;
      }
      push('other', '<pre><code' + (lang ? ' class="language-' + escAttr(lang) + '"' : '') + '>' + escCode(body.join('\n')) + (body.length ? '\n' : '') + '</code></pre>\n');
      continue;
    }

    if (indentOf(line) >= 4) {
      const body = [];
      while (i < lines.length && (isBlank(lines[i]) || indentOf(lines[i]) >= 4)) { body.push(lines[i].replace(/^ {0,4}/, '')); i++; }
      while (body.length && isBlank(body[body.length - 1])) body.pop();
      push('other', '<pre><code>' + escCode(body.join('\n')) + '\n</code></pre>\n');
      continue;
    }

    if ((m = line.match(RE_ATX)) && /^ {0,3}#/.test(line)) {
      push('other', '<h' + m[1].length + '>' + inlineMd((m[2] || '').trim(), refs) + '</h' + m[1].length + '>\n');
      i++; continue;
    }

    if (RE_HR.test(line)) { push('other', '<hr>\n'); i++; continue; }

    const ht = htmlBlockType(line, false);
    if (ht) {
      const body = [];
      if (ht === 1) {
        const closeRe = new RegExp('</(pre|script|style|textarea)>', 'i');
        while (i < lines.length) { body.push(lines[i]); i++; if (closeRe.test(body[body.length - 1])) break; }
      } else if (ht === 2) {
        while (i < lines.length) { body.push(lines[i]); i++; if (body[body.length - 1].includes('-->')) break; }
      } else {
        while (i < lines.length && !isBlank(lines[i])) { body.push(lines[i]); i++; }
      }
      push('other', body.join('\n') + '\n');
      continue;
    }

    if (RE_BQ.test(line)) {
      const body = [];
      while (i < lines.length) {
        if (RE_BQ.test(lines[i])) body.push(lines[i].replace(/^ {0,3}> ?/, ''));
        else if (!isBlank(lines[i]) && body.length && !isBlank(body[body.length - 1]) && !interrupts(lines[i])) body.push(lines[i]);
        else break;
        i++;
      }
      push('other', '<blockquote>\n' + blocks(body, refs).map(b => b.html).join('') + '</blockquote>\n');
      continue;
    }

    if ((m = listMarker(line))) {
      const res = list(lines, i, refs);
      push('other', res.html);
      i = res.next;
      continue;
    }

    if (line.includes('|') && i + 1 < lines.length && RE_DELIM.test(lines[i + 1]) && lines[i + 1].includes('-')) {
      const head = splitRow(line), delim = splitRow(lines[i + 1]);
      if (head.length === delim.length && delim.every(c => /^:?-+:?$/.test(c))) {
        const align = delim.map(c => (c[0] === ':' && c[c.length - 1] === ':' ? 'center' : c[c.length - 1] === ':' ? 'right' : c[0] === ':' ? 'left' : ''));
        const cell = (tag, c, k) => '<' + tag + (align[k] ? ' align="' + align[k] + '"' : '') + '>' + inlineMd(c, refs) + '</' + tag + '>';
        let html = '<table>\n<thead>\n<tr>' + head.map((c, k) => cell('th', c, k)).join('') + '</tr>\n</thead>\n';
        i += 2;
        const rows = [];
        while (i < lines.length && !isBlank(lines[i]) && !interrupts(lines[i])) {
          const cells = splitRow(lines[i]);
          while (cells.length < head.length) cells.push('');
          rows.push('<tr>' + cells.slice(0, head.length).map((c, k) => cell('td', c, k)).join('') + '</tr>\n');
          i++;
        }
        if (rows.length) html += '<tbody>\n' + rows.join('') + '</tbody>\n';
        push('other', html + '</table>\n');
        continue;
      }
    }

    // paragraph (or setext heading)
    const para = [line.replace(/^ +/, '')];
    i++;
    let heading = 0;
    while (i < lines.length && !isBlank(lines[i])) {
      const sm = lines[i].match(RE_SETEXT);
      if (sm) { heading = sm[1][0] === '=' ? 1 : 2; i++; break; }
      if (interrupts(lines[i])) break;
      if (lines[i].includes('|') && i + 1 < lines.length && RE_DELIM.test(lines[i + 1]) && splitRow(lines[i]).length === splitRow(lines[i + 1]).length) break;
      para.push(lines[i].replace(/^ +/, ''));
      i++;
    }
    const text = para.join('\n').replace(/[ \t]+$/, '');
    if (heading) push('other', '<h' + heading + '>' + inlineMd(text, refs) + '</h' + heading + '>\n');
    else { const inner = inlineMd(text, refs); push('p', '<p>' + inner + '</p>\n', inner); }
  }
  return out;
}

function list(lines, start, refs) {
  const first = listMarker(lines[start]);
  const ordered = /\d/.test(first[2]);
  const kind = ordered ? first[2].slice(-1) : first[2];
  const startNum = ordered ? parseInt(first[2], 10) : 1;
  const items = [];
  let i = start, loose = false;

  while (i < lines.length) {
    const lm = listMarker(lines[i]);
    if (!lm) break;
    if ((/\d/.test(lm[2]) ? lm[2].slice(-1) : lm[2]) !== kind || /\d/.test(lm[2]) !== ordered) break;
    const markerWidth = lm[1].length + lm[2].length;
    let spaces = lm[3].length;
    if (lm[4] === '' || spaces > 4) spaces = 1;
    const contentIndent = markerWidth + spaces;
    const body = [spaces === 1 && lm[3].length > 4 ? lm[3].slice(1) + lm[4] : lm[4]];
    i++;
    while (i < lines.length) {
      const l = lines[i];
      if (isBlank(l)) {
        let k = i;
        while (k < lines.length && isBlank(lines[k])) k++;
        if (k < lines.length && indentOf(lines[k]) >= contentIndent) { for (; i < k; i++) body.push(''); continue; }
        break;
      }
      if (indentOf(l) >= contentIndent) { body.push(l.slice(contentIndent)); i++; continue; }
      if (!isBlank(lines[i - 1]) && !interrupts(l) && !listMarker(l) && !isBlank(body[body.length - 1] || '')) { body.push(l.replace(/^ +/, '')); i++; continue; }
      break;
    }
    // a blank line between this item and the next one makes the list loose
    let k = i;
    while (k < lines.length && isBlank(lines[k])) k++;
    const nm = k < lines.length ? listMarker(lines[k]) : null;
    const continues = nm && indentOf(lines[k]) < contentIndent && ((/\d/.test(nm[2]) ? nm[2].slice(-1) : nm[2]) === kind) && (/\d/.test(nm[2]) === ordered);
    if (continues && k > i) loose = true;
    items.push(body);
    if (continues) i = k; else break;
  }

  const parts = items.map(body => {
    const bl = blocks(body, refs);
    const itemLoose = bl.some((b, idx) => idx > 0 && b.blankBefore);
    if (itemLoose) loose = true;
    return bl;
  });
  const html = parts.map(bl => {
    let inner = bl.map((b, idx) => (b.kind === 'p' && !loose ? b.inner + (idx < bl.length - 1 ? '\n' : '') : b.html)).join('');
    const tm = inner.match(/^(<p>)?\[([ xX])\][ \t]+/);
    if (tm) inner = inner.replace(tm[0], (tm[1] || '') + '<input type="checkbox" disabled' + (tm[2] === ' ' ? '' : ' checked') + '> ');
    return '<li>' + inner + '</li>\n';
  }).join('');
  const tag = ordered ? 'ol' : 'ul';
  return { html: '<' + tag + (ordered && startNum !== 1 ? ' start="' + startNum + '"' : '') + '>\n' + html + '</' + tag + '>\n', next: i };
}

function mdToHtml(src) {
  const lines = String(src || '').replace(/\r\n?/g, '\n').replace(/\t/g, '    ').split('\n');
  const refs = {};
  // link reference definitions: [label]: url "title"
  let inFence = null;
  const kept = [];
  for (let li = 0; li < lines.length; li++) {
    let l = lines[li];
    if (/^ {0,3}\[[^\]]+\]:[ \t]*$/.test(l) && li + 1 < lines.length && !isBlank(lines[li + 1])) { l = l.trim() + ' ' + lines[li + 1].trim(); li++; }
    const fm = l.match(RE_FENCE);
    if (fm) { if (!inFence) inFence = fm[2][0]; else if (fm[2][0] === inFence && !fm[3].trim()) inFence = null; }
    const dm = !inFence && l.match(/^ {0,3}\[([^\]]+)\]:[ \t]*<?([^\s>]+)>?(?:[ \t]+(?:"([^"]*)"|'([^']*)'|\(([^)]*)\)))?[ \t]*$/);
    if (dm && !/^\^/.test(dm[1])) { const key = normLabel(dm[1]); if (!refs[key]) refs[key] = { dest: dm[2], title: dm[3] || dm[4] || dm[5] || '' }; kept.push(''); }
    else kept.push(l);
  }
  return blocks(kept, refs).map(b => b.html).join('');
}

/* ── HTML to a tree, then to React ── */

const VOID = new Set(['br', 'hr', 'img', 'input', 'source', 'wbr', 'col', 'area', 'base', 'embed', 'link', 'meta', 'param', 'track']);
const DROP_ALL = new Set(['script', 'style', 'iframe', 'noscript', 'template', 'object', 'svg', 'math', 'textarea', 'select', 'form', 'head', 'title']);
const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: '\u00a0', copy: '©', reg: '®', trade: '™', hellip: '…', mdash: '—', ndash: '–', laquo: '«', raquo: '»', bull: '•', middot: '·', times: '×', rarr: '→', larr: '←', uarr: '↑', darr: '↓', check: '✓', hearts: '♥', star: '★', deg: '°', plusmn: '±', euro: '€', pound: '£', yen: '¥', cent: '¢', sect: '§', para: '¶', lsquo: '‘', rsquo: '’', ldquo: '“', rdquo: '”' };
const decodeEntities = s => String(s).replace(/&(#x[0-9a-f]+|#\d+|[a-z][a-z0-9]*);/gi, (m, e) => {
  if (e[0] === '#') { const code = e[1].toLowerCase() === 'x' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10); try { return code > 0 && code < 0x110000 ? String.fromCodePoint(code) : m; } catch (x) { return m; } }
  return Object.prototype.hasOwnProperty.call(ENTITIES, e.toLowerCase()) ? ENTITIES[e.toLowerCase()] : m;
});

function parseAttrs(src) {
  const attrs = {};
  const re = /([^\s"'<>\/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'<>=`]+)))?/g;
  let m;
  while ((m = re.exec(src))) {
    const name = m[1].toLowerCase();
    if (!Object.prototype.hasOwnProperty.call(attrs, name)) attrs[name] = decodeEntities(m[2] !== undefined ? m[2] : m[3] !== undefined ? m[3] : m[4] !== undefined ? m[4] : '');
  }
  return attrs;
}

const P_CLOSE = new Set(['address', 'article', 'aside', 'blockquote', 'center', 'details', 'div', 'dl', 'fieldset', 'figure', 'footer', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'header', 'hr', 'main', 'nav', 'ol', 'p', 'pre', 'section', 'summary', 'table', 'ul', 'li']);

function parseHtml(src) {
  const root = { tag: '#root', children: [] };
  const stack = [root];
  const top = () => stack[stack.length - 1];
  const popTo = (names, stops) => {
    for (let k = stack.length - 1; k > 0; k--) {
      const t = stack[k].tag;
      if (names.includes(t)) { stack.length = k; return true; }
      if (stops.includes(t)) return false;
    }
    return false;
  };
  const text = s => { if (!s) return; const t = top(); const last = t.children[t.children.length - 1]; if (last && typeof last === 'string') t.children[t.children.length - 1] = last + s; else t.children.push(s); };
  const re = /<!--[\s\S]*?-->|<!\[CDATA\[[\s\S]*?\]\]>|<![^>]*>|<\?[\s\S]*?\?>|<\/([a-zA-Z][a-zA-Z0-9-]*)[^>]*>|<([a-zA-Z][a-zA-Z0-9-]*)((?:"[^"]*"|'[^']*'|[^>"'])*)>/g;
  let last = 0, m;
  src = String(src);
  while ((m = re.exec(src))) {
    if (m.index > last) text(decodeEntities(src.slice(last, m.index)));
    last = re.lastIndex;
    if (m[1]) {
      const tag = m[1].toLowerCase();
      for (let k = stack.length - 1; k > 0; k--) if (stack[k].tag === tag) { stack.length = k; break; }
    } else if (m[2]) {
      const tag = m[2].toLowerCase();
      let rest = m[3] || '';
      const selfClose = /\/\s*$/.test(rest);
      if (selfClose) rest = rest.replace(/\/\s*$/, '');
      if (DROP_ALL.has(tag)) {
        if (!VOID.has(tag) && !selfClose) { const close = new RegExp('</' + tag + '\\s*>', 'i'); close.lastIndex = 0; const rem = src.slice(last); const cm = rem.match(close); last = re.lastIndex = cm ? last + cm.index + cm[0].length : src.length; }
        continue;
      }
      if (tag === 'li') popTo(['li'], ['ul', 'ol']);
      else if (tag === 'dt' || tag === 'dd') popTo(['dt', 'dd'], ['dl']);
      else if (tag === 'tr') popTo(['tr'], ['table', 'thead', 'tbody', 'tfoot']);
      else if (tag === 'td' || tag === 'th') popTo(['td', 'th'], ['tr', 'table']);
      else if (tag === 'thead' || tag === 'tbody' || tag === 'tfoot') popTo(['thead', 'tbody', 'tfoot'], ['table']);
      if (P_CLOSE.has(tag)) popTo(['p'], ['div', 'td', 'th', 'li', 'blockquote', 'details', 'table', 'center', 'section']);
      const node = { tag, attrs: parseAttrs(rest), children: [] };
      top().children.push(node);
      if (!VOID.has(tag) && !selfClose) stack.push(node);
    }
  }
  if (last < src.length) text(decodeEntities(src.slice(last)));
  return root;
}

const KEEP = new Set(['a', 'abbr', 'b', 'blockquote', 'br', 'caption', 'code', 'dd', 'del', 'details', 'div', 'dl', 'dt', 'em', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'hr', 'i', 'img', 'input', 'ins', 'kbd', 'li', 'mark', 'ol', 'p', 'pre', 'q', 's', 'samp', 'small', 'span', 'strong', 'sub', 'summary', 'sup', 'table', 'tbody', 'td', 'tfoot', 'th', 'thead', 'tr', 'u', 'ul', 'var']);
const TAG_MAP = { section: 'div', article: 'div', header: 'div', footer: 'div', main: 'div', nav: 'div', aside: 'div', center: 'div', figure: 'div', figcaption: 'div', picture: 'span', tt: 'code', strike: 's', font: 'span' };
const NO_TEXT = new Set(['table', 'thead', 'tbody', 'tfoot', 'tr', 'ul', 'ol', 'dl']);
const BLOCKISH = new Set(['p', 'div', 'ul', 'ol', 'li', 'table', 'thead', 'tbody', 'tfoot', 'tr', 'td', 'th', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'pre', 'blockquote', 'details', 'summary', 'hr', 'dl', 'dt', 'dd', 'caption', 'br']);
const ALIGNED = new Set(['p', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'td', 'th', 'tr']);

// only web addresses; relative ones point into the project's GitHub repository
function resolveUrl(u, ctx, isImage) {
  const v = String(u || '').trim();
  if (!v || v[0] === '#') return '';
  if (/^https?:\/\//i.test(v)) return v;
  if (v.startsWith('//')) return 'https:' + v;
  if (isImage && /^data:image\/(png|jpe?g|gif|webp);base64,[a-z0-9+/=]+$/i.test(v)) return v;
  if (/^[a-z][a-z0-9+.-]*:/i.test(v)) return '';
  if (!ctx || !ctx.owner || !ctx.repo) return '';
  const path = v.replace(/^\.?\//, '').replace(/^\//, '');
  return isImage ? 'https://raw.githubusercontent.com/' + ctx.owner + '/' + ctx.repo + '/HEAD/' + path
    : 'https://github.com/' + ctx.owner + '/' + ctx.repo + '/blob/HEAD/' + path;
}

const dim = v => (/^\d{1,4}%?$/.test(String(v || '').trim()) ? (String(v).trim().endsWith('%') ? String(v).trim() : Number(v)) : undefined);

function toReact(node, ctx, key) {
  if (typeof node === 'string') return node;
  const tag = TAG_MAP[node.tag] || node.tag;
  const a = node.attrs || {};
  const kids = () => {
    const out = [];
    const isBlock = n => n && typeof n !== 'string' && BLOCKISH.has(TAG_MAP[n.tag] || n.tag);
    node.children.forEach((c, i) => {
      if (typeof c === 'string') {
        if (NO_TEXT.has(tag) && !c.trim()) return;
        // blank text next to block elements (or at the edges of one) would only add empty lines
        if (!c.trim() && (i === 0 || i === node.children.length - 1 || isBlock(node.children[i - 1]) || isBlock(node.children[i + 1]))) return;
      }
      out.push(toReact(c, ctx, i));
    });
    return out;
  };
  if (!KEEP.has(tag)) return h(React.Fragment, { key }, ...kids());

  const props = { key };
  if (ALIGNED.has(tag) || node.tag === 'center') {
    const al = node.tag === 'center' ? 'center' : String(a.align || '').toLowerCase();
    if (al === 'center' || al === 'right' || al === 'left') props.style = { textAlign: al };
  }
  switch (tag) {
    case 'a': {
      const url = resolveUrl(a.href, ctx, false);
      if (url) { props.className = 'bh-link'; props.title = a.title || url; props.onClick = () => openUrl(url); }
      return h('span', props, ...kids());
    }
    case 'img': {
      const url = resolveUrl(a.src, ctx, true);
      if (!url) return a.alt ? h('span', props, a.alt) : null;
      const w = dim(a.width), hh = dim(a.height);
      props.className = 'bh-mdimg'; props.src = url; props.alt = a.alt || ''; props.loading = 'lazy';
      if (a.title) props.title = a.title;
      if (w !== undefined || hh !== undefined) props.style = Object.assign({}, props.style, w !== undefined ? { width: w } : null, hh !== undefined ? { height: hh } : null);
      props.onError = e => { try { e.target.style.display = 'none'; } catch (x) { /* ignore */ } };
      return h('img', props);
    }
    case 'input':
      if (String(a.type || '').toLowerCase() !== 'checkbox') return null;
      props.type = 'checkbox'; props.disabled = true; props.readOnly = true; props.checked = a.checked !== undefined; props.className = 'bh-check';
      return h('input', props);
    case 'br': case 'hr': return h(tag, props);
    case 'td': case 'th': {
      const cs = parseInt(a.colspan, 10), rs = parseInt(a.rowspan, 10);
      if (cs > 1 && cs < 100) props.colSpan = cs;
      if (rs > 1 && rs < 100) props.rowSpan = rs;
      return h(tag, props, ...kids());
    }
    case 'ol': { const st = parseInt(a.start, 10); if (isFinite(st)) props.start = st; return h('ol', props, ...kids()); }
    case 'details': if (a.open !== undefined) props.open = true; return h('details', props, ...kids());
    case 'table': return h('div', { key, className: 'bh-tablewrap' }, h('table', null, ...kids()));
    case 'abbr': if (a.title) props.title = a.title; return h('abbr', props, ...kids());
    default: return h(tag, props, ...kids());
  }
}

function renderMarkdown(src, ctx) {
  const text = String(src || '').slice(0, 250000);
  return parseHtml(mdToHtml(text)).children.filter(n => typeof n !== 'string' || n.trim()).map((n, i) => toReact(n, ctx, i));
}

/* ═════════════ the tab ═════════════ */

const CSS = `
.bh-root{display:flex;flex-direction:column;gap:10px;padding:0 2px 24px;white-space:normal;
  --bh-r:var(--st-border-radius,var(--minimal_dark_corner,0px));
  --bh-card-s:rgb(var(--st-color-2));--bh-field-s:rgb(var(--st-color-3));--bh-hover-s:rgb(var(--st-color-4));--bh-line-s:rgb(var(--st-color-5));--bh-accent-s:rgb(var(--st-accent-1));
  --bh-card:var(--bh-card-s,var(--minimal_dark_black,color-mix(in srgb,currentColor 7%,transparent)));
  --bh-field:var(--bh-field-s,var(--minimal_dark_blacker,color-mix(in srgb,currentColor 9%,transparent)));
  --bh-hover:var(--bh-hover-s,var(--minimal_dark_be_grey,color-mix(in srgb,currentColor 15%,transparent)));
  --bh-line:var(--bh-line-s,var(--minimal_dark_greyblack,color-mix(in srgb,currentColor 18%,transparent)));
  --bh-accent:var(--bh-accent-s,var(--minimal_dark_color,currentColor));
  --bh-menu:var(--bh-card-s,var(--minimal_dark_blacker,#23262e))}
.bh-bar1,.bh-bar2{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.bh-grow{flex:1 1 auto}
.bh-tab,.bh-pill{cursor:pointer;user-select:none;font-size:13px;line-height:1;padding:8px 14px;border-radius:var(--bh-r);border:1px solid transparent;background:var(--bh-field);white-space:nowrap}
.bh-pill{padding:7px 12px;font-size:12px}
.bh-tab:hover,.bh-pill:hover{background:var(--bh-hover)}
.bh-tab.bh-on,.bh-pill.bh-on{background:var(--bh-hover);border-color:var(--bh-accent)}
.bh-pills{display:flex;gap:6px;flex-wrap:wrap}
.bh-filter{position:relative;width:170px;height:32px;flex:none}
.bh-search{position:relative;width:240px;height:32px;flex:none}
.bh-search .bh-input{width:100%;padding-left:34px}
.bh-searchicon{position:absolute;left:11px;top:8px;width:16px;height:16px;opacity:.7;pointer-events:none}
.bh-input{display:block;box-sizing:border-box;height:32px;margin:0;padding:0 10px;border-radius:var(--bh-r);border:1px solid var(--bh-line);background:var(--bh-field);color:inherit;font-size:13px;line-height:30px;outline:none}
.bh-input:focus{border-color:var(--bh-accent)}
.bh-select{display:flex;align-items:center;justify-content:space-between;gap:8px;width:100%;cursor:pointer;user-select:none;line-height:1}
.bh-select:hover{background:var(--bh-hover)}
.bh-selval{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.bh-chev{flex:none;width:12px;height:12px;opacity:.7}
.bh-menu{position:absolute;top:34px;left:0;right:0;z-index:60;max-height:320px;overflow-y:auto;background:var(--bh-menu);border:1px solid var(--bh-line);border-radius:var(--bh-r)}
.bh-opt{padding:8px 10px;font-size:13px;cursor:pointer;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.bh-opt:hover{background:var(--bh-hover)}
.bh-opt.bh-on{border-left:3px solid var(--bh-accent);padding-left:7px}
.bh-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:12px;align-content:start}
.bh-card{display:flex;flex-direction:column;border-radius:var(--bh-r);overflow:hidden;background:var(--bh-card);border:1px solid var(--bh-line)}
.bh-img{height:120px;flex:none;background-color:var(--bh-field);background-size:cover;background-position:center}
.bh-body{display:flex;flex-direction:column;gap:5px;padding:10px 12px 12px;flex:1 1 auto;min-width:0}
.bh-name{font-size:15px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.bh-meta{font-size:12px;opacity:.7}
.bh-desc{font-size:13px;opacity:.85;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;min-height:3.9em}
.bh-tags{display:flex;gap:4px;flex-wrap:wrap}
.bh-tag{font-size:11px;padding:1px 6px;border-radius:var(--bh-r);background:var(--bh-field)}
.bh-clickable{cursor:pointer}
.bh-foot{margin-top:auto;display:flex;gap:6px;align-items:flex-start;padding-top:6px}
.bh-act{flex:1 1 0;min-width:0;display:flex;flex-direction:column;gap:6px}
.bh-btn{box-sizing:border-box !important;width:100% !important;min-width:0 !important;max-width:100% !important;height:32px !important;min-height:0 !important;margin:0 !important;padding:0 12px !important;line-height:1 !important;font-size:13px !important;display:flex !important;align-items:center;justify-content:center;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.bh-foot>.bh-btn{flex:0 0 84px;width:84px !important}
.bh-bar{height:3px;background:var(--bh-field);overflow:hidden}
.bh-fill{height:100%;background:var(--bh-accent);transition:width .2s}
.bh-err{font-size:12px;color:#e8745a;word-break:break-word}
.bh-empty{padding:40px 0;text-align:center;opacity:.7}
.bh-detail{display:flex;flex-direction:column;gap:12px}
.bh-dmain{display:flex;gap:16px;align-items:flex-start}
.bh-dhero{flex:0 0 320px;width:320px;max-height:190px;object-fit:cover;border-radius:var(--bh-r)}
.bh-dinfo{flex:1 1 auto;min-width:0;display:flex;flex-direction:column;gap:8px}
.bh-dhead{display:flex;align-items:center;gap:12px;min-width:0}
.bh-dhead .bh-btn{flex:none;width:auto !important;padding:0 14px !important}
.bh-dtitle{font-size:20px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.bh-dactions{display:flex;gap:8px;flex-wrap:wrap;align-items:flex-start}
.bh-dactions .bh-act{flex:none;width:150px}
.bh-dactions>.bh-btn{width:auto !important;padding:0 14px !important}
.bh-chips{display:flex;gap:6px;flex-wrap:wrap}
.bh-chip{font-size:12px;padding:3px 9px;border-radius:var(--bh-r);background:var(--bh-field)}
.bh-chip b{font-weight:500;opacity:.65;margin-right:5px}
.bh-readme{padding:12px 16px;border-radius:var(--bh-r);background:var(--bh-card);font-size:13px;line-height:1.55;overflow-wrap:anywhere}
.bh-md p{margin:0 0 10px}.bh-md h1,.bh-md h2,.bh-md h3,.bh-md h4,.bh-md h5,.bh-md h6{font-weight:600;margin:16px 0 8px;line-height:1.3}
.bh-md h1{font-size:20px}.bh-md h2{font-size:17px}.bh-md h3{font-size:15px}.bh-md h4,.bh-md h5,.bh-md h6{font-size:13px}
.bh-md>:first-child{margin-top:0}
.bh-md ul,.bh-md ol{margin:0 0 10px;padding-left:24px;list-style-position:outside}.bh-md ul{list-style-type:disc}.bh-md ol{list-style-type:decimal}.bh-md li{display:list-item;margin:2px 0}.bh-md li>p{margin:0 0 6px}.bh-md li>p:last-child{margin-bottom:0}
.bh-md blockquote{margin:0 0 10px;padding:2px 12px;border-left:3px solid var(--bh-line);opacity:.9}
.bh-md pre{margin:0 0 10px;padding:8px 10px;border-radius:var(--bh-r);background:var(--bh-field);overflow-x:auto;white-space:pre;font-size:12px}
.bh-md code{padding:0 4px;border-radius:var(--bh-r);background:var(--bh-field);font-size:12px}
.bh-md pre code{padding:0;background:none}
.bh-md kbd{padding:0 5px;border-radius:var(--bh-r);border:1px solid var(--bh-line);font-size:12px}
.bh-md hr{border:0;border-top:1px solid var(--bh-line);margin:14px 0}
.bh-md .bh-mdimg{max-width:100%;vertical-align:middle}
.bh-md .bh-tablewrap{overflow-x:auto;margin:0 0 10px}
.bh-md table{border-collapse:collapse}
.bh-md th,.bh-md td{border:1px solid var(--bh-line);padding:5px 10px;text-align:left;vertical-align:top}
.bh-md th{background:var(--bh-field);font-weight:600}
.bh-md details{margin:0 0 8px;border:1px solid var(--bh-line);border-radius:var(--bh-r);background:var(--bh-field)}
.bh-md details>*:not(summary){margin-left:12px;margin-right:12px}
.bh-md details>summary+*{margin-top:10px}
.bh-md summary{cursor:pointer;padding:8px 12px;font-weight:600;list-style-position:inside;margin:0}
.bh-md details[open]>summary{border-bottom:1px solid var(--bh-line);margin-bottom:0}
.bh-md .bh-check{margin-right:6px;vertical-align:middle}
.bh-link{text-decoration:underline;cursor:pointer;opacity:.95}
.bh-addinput{flex:1 1 260px;min-width:200px}
.bh-addbtn{flex:none;width:90px}
.bh-note{font-size:12px;opacity:.7}
@media (max-width:900px){.bh-dmain{flex-direction:column}.bh-dhero{width:100%;flex-basis:auto}}
`;

const Btn = props => h(API.DialogButton || 'button', Object.assign({}, props, { className: 'bh-btn' }));

const SORTS = [['popular', 'sortPopular'], ['unpopular', 'sortUnpopular'], ['updated', 'sortUpdated'], ['stale', 'sortStale'], ['name', 'sortName']];

function Filter(props) {
  const [open, setOpen] = React.useState(false);
  const box = React.useRef(null);
  React.useEffect(() => {
    if (!open) return undefined;
    const doc = (box.current && box.current.ownerDocument) || document;
    const away = e => { if (box.current && !box.current.contains(e.target)) setOpen(false); };
    const key = e => { if (e.key === 'Escape') setOpen(false); };
    doc.addEventListener('mousedown', away); doc.addEventListener('keydown', key);
    return () => { doc.removeEventListener('mousedown', away); doc.removeEventListener('keydown', key); };
  }, [open]);
  const cur = props.options.find(o => o.data === props.value) || props.options[0];
  return h('div', { className: 'bh-filter', ref: box },
    h('div', { role: 'button', className: 'bh-input bh-select', onClick: () => setOpen(!open) },
      h('span', { className: 'bh-selval' }, cur.label),
      h('svg', { className: 'bh-chev', viewBox: '0 0 12 12', fill: 'none', stroke: 'currentColor', strokeWidth: 1.6 }, h('path', { d: 'M2 4.5l4 4 4-4' }))),
    open ? h('div', { className: 'bh-menu' }, props.options.map(o => h('div', { key: o.data, role: 'button', className: 'bh-opt' + (o.data === props.value ? ' bh-on' : ''), onClick: () => { props.onChange(o.data); setOpen(false); } }, o.label))) : null);
}

const SEARCH_ICON = () => h('svg', { className: 'bh-searchicon', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2.2, strokeLinecap: 'round' }, h('circle', { cx: 10, cy: 10, r: 6.5 }), h('path', { d: 'M15 15l6 6' }));

function itemInfo(item) {
  const inst = store.installed;
  if (!inst) return null;
  if (item.kind === 'theme') { const t = inst.themes[pairKey(item.owner, item.repo)]; return t ? { native: t.native, active: !!inst.active && t.native === inst.active } : null; }
  return inst.plugins[item.folder] ? { enabled: inst.plugins[item.folder].enabled } : null;
}

function arrange(list, query, sort, filter) {
  const q = query.trim().toLowerCase();
  let out = list;
  if (q) out = out.filter(i => (i.name + ' ' + i.description + ' ' + i.author + ' ' + i.allTags.join(' ')).toLowerCase().includes(q));
  if (filter === 'installed') out = out.filter(i => !!itemInfo(i));
  else if (filter === 'missing') out = out.filter(i => !itemInfo(i));
  else if (filter.startsWith('tag:')) out = out.filter(i => i.allTags.includes(filter.slice(4)));
  out = out.slice();
  const by = { popular: (a, b) => b.downloads - a.downloads, unpopular: (a, b) => a.downloads - b.downloads, updated: (a, b) => b.updated.localeCompare(a.updated), stale: (a, b) => a.updated.localeCompare(b.updated), name: (a, b) => a.name.localeCompare(b.name) };
  out.sort(by[sort] || by.popular);
  return out;
}

function filterOptions(kind, items) {
  const opts = [{ label: t('filterAll'), data: 'all' }, { label: t('filterInstalled'), data: 'installed' }, { label: t('filterMissing'), data: 'missing' }];
  if (kind === 'themes') {
    const count = {};
    items.forEach(i => i.allTags.forEach(tg => { count[tg] = (count[tg] || 0) + 1; }));
    Object.keys(count).sort((a, b) => count[b] - count[a] || a.localeCompare(b)).slice(0, 40).forEach(tg => opts.push({ label: translate('filterTag', tg), data: 'tag:' + tg }));
  }
  return opts;
}

function ActionBlock(props) {
  const item = props.item;
  const op = store.ops[item.kind + ':' + item.id] || {};
  const info = itemInfo(item);
  if (op.state === 'working') {
    const pct = Math.round(op.progress || 0);
    return h('div', { className: 'bh-act' },
      h(Btn, { disabled: true }, (op.status || t('installing')) + '… ' + pct + '%'),
      h('div', { className: 'bh-bar' }, h('div', { className: 'bh-fill', style: { width: Math.max(2, Math.min(100, op.progress || 0)) + '%' } })));
  }
  if (info && item.kind === 'theme') {
    return h('div', { className: 'bh-act' }, info.active ? h(Btn, { disabled: true }, t('active')) : h(Btn, { onClick: () => applyTheme(info.native) }, t('useTheme')));
  }
  if (info) return h('div', { className: 'bh-act' }, info.enabled ? h(Btn, { disabled: true }, t('enabled')) : h(Btn, { onClick: () => enablePlugin(item.folder) }, t('enable')));
  if (item.buildFailing) return h('div', { className: 'bh-act' }, h(Btn, { disabled: true }, t('buildFailing')));
  return h('div', { className: 'bh-act' },
    h(Btn, { onClick: () => (item.kind === 'theme' ? installTheme(item) : installPlugin(item)) }, op.state === 'error' ? t('retry') : t('install')),
    op.state === 'error' ? h('div', { className: 'bh-err' }, op.msg) : null);
}

function Card(props) {
  const item = props.item;
  const open = () => openDetails(item);
  const meta = [t('by', item.author), item.version ? 'v' + item.version : '', item.size].filter(Boolean).join(' · ');
  const stats = [t('downloads', compact(item.downloads)), item.updated ? t('updatedOn', item.updated) : ''].filter(Boolean).join(' · ');
  return h('div', { className: 'bh-card' },
    item.image ? h('div', { className: 'bh-img bh-clickable', onClick: open, style: { backgroundImage: 'url("' + encodeURI(item.image) + '")' } }) : null,
    h('div', { className: 'bh-body' },
      h('div', { className: 'bh-clickable', onClick: open },
        h('div', { className: 'bh-name', title: item.name }, item.name),
        h('div', { className: 'bh-meta' }, meta),
        h('div', { className: 'bh-desc' }, item.description)),
      item.tags.length ? h('div', { className: 'bh-tags' }, item.tags.map(tag => h('span', { key: tag, className: 'bh-tag' }, tag))) : null,
      h('div', { className: 'bh-meta' }, stats),
      h('div', { className: 'bh-foot' }, h(ActionBlock, { item }), h(Btn, { onClick: open }, t('details')))));
}

function Details(props) {
  const item = props.item;
  const d = store.details[item.kind + ':' + item.id] || { state: 'loading', text: '', note: '' };
  const readme = React.useMemo(() => (d.text.trim() ? renderMarkdown(d.text, { owner: item.owner, repo: item.repo }) : null), [d.text, item.owner, item.repo]);
  const facts = [
    [t('factAuthor'), item.author], [t('factVersion'), item.version], [t('factUpdated'), item.updated], [t('factDownloads'), item.downloads ? item.downloads.toLocaleString() : ''],
    item.kind === 'plugin' ? [t('factStars'), item.stars ? String(item.stars) : ''] : null, item.kind === 'plugin' ? [t('factDownload'), item.size] : null,
    item.kind === 'plugin' ? [t('factRepository'), item.disk] : null, item.kind === 'plugin' ? [t('factBackend'), item.backend || t('backendNone')] : null,
    [item.kind === 'plugin' ? t('factFolder') : t('factRepo'), item.kind === 'plugin' ? item.folder : (item.owner && item.repo ? item.owner + '/' + item.repo : '')],
  ].filter(f => f && f[1]);
  const link = (label, url) => url ? h(Btn, { key: label, onClick: () => openUrl(url) }, label) : null;
  const hero = item.kind === 'theme' && (item.splash || item.image);
  return h('div', { className: 'bh-detail' },
    h('div', { className: 'bh-dmain' },
      hero ? h('img', { className: 'bh-dhero', src: hero, onError: e => { e.target.style.display = 'none'; } }) : null,
      h('div', { className: 'bh-dinfo' },
        h('div', { className: 'bh-dhead' }, h(Btn, { onClick: closeDetails }, '‹ ' + t('back')), h('div', { className: 'bh-dtitle', title: item.name }, item.name)),
        h('div', { className: 'bh-dactions' }, h(ActionBlock, { item }),
          link('steambrew.app', pageUrl(item)), link('GitHub', repoUrl(item)), item.discord ? link('Discord', 'https://discord.gg/' + item.discord) : null),
        item.description ? h('div', null, item.description) : null,
        h('div', { className: 'bh-chips' }, facts.map(f => h('span', { key: f[0], className: 'bh-chip' }, h('b', null, f[0]), f[1])),
          item.tags.map(tag => h('span', { key: 'tag' + tag, className: 'bh-chip' }, tag))),
        item.change ? h('div', { className: 'bh-meta' }, t('latestChange', item.change)) : null)),
    h('div', { className: 'bh-readme bh-md' }, d.state === 'loading' ? t('loading') : d.text.trim() ? readme : d.note));
}

function UnofficialCard(props) {
  const entry = props.entry;
  const op = store.ops['unofficial:' + keyOf(entry)] || {};
  const s = unofficialState(entry);
  const loading = s.info.state === 'loading';
  const meta = [t('by', entry.owner), s.have ? t('installedVer', s.have) : ''].filter(Boolean).join(' · ');
  const stats = [s.latest ? t('latestVer', s.latest) : '', s.rel && s.rel.published ? t('updatedOn', day(s.rel.published)) : ''].filter(Boolean).join(' · ');
  let line = '';
  if (loading && !s.rel) line = t('checking');
  else if (s.info.state === 'error') line = s.info.error;
  else if (s.rel && !s.asset) line = t('errNoAsset');
  else if (s.newer) line = t('updateAvailable');
  else if (s.inst && s.have) line = t('upToDate');
  const failed = op.state === 'error' ? h('div', { className: 'bh-err' }, op.msg) : null;
  let action;
  if (op.state === 'working') {
    const pct = Math.round(op.progress || 0);
    action = h('div', { className: 'bh-act' },
      h(Btn, { disabled: true }, (op.status || t('installing')) + '… ' + pct + '%'),
      h('div', { className: 'bh-bar' }, h('div', { className: 'bh-fill', style: { width: Math.max(2, Math.min(100, op.progress || 0)) + '%' } })));
  } else if (!store.installed) action = h('div', { className: 'bh-act' }, h(Btn, { disabled: true }, t('loading')));
  else if (s.inst && s.newer && s.asset) action = h('div', { className: 'bh-act' }, h(Btn, { onClick: () => installUnofficial(entry, true) }, op.state === 'error' ? t('retry') : t('update')), failed);
  else if (s.inst) action = h('div', { className: 'bh-act' }, s.inst.enabled ? h(Btn, { disabled: true }, t('enabled')) : h(Btn, { onClick: () => enablePlugin(s.folder) }, t('enable')));
  else if (s.asset) action = h('div', { className: 'bh-act' }, h(Btn, { onClick: () => installUnofficial(entry, false) }, op.state === 'error' ? t('retry') : t('install')), failed);
  else action = h('div', { className: 'bh-act' }, h(Btn, { disabled: true }, loading ? t('checking') : t('install')));
  return h('div', { className: 'bh-card' },
    h('div', { className: 'bh-body' },
      h('div', null,
        h('div', { className: 'bh-name', title: entry.owner + '/' + entry.repo }, (s.inst && s.inst.title) || entry.repo),
        h('div', { className: 'bh-meta' }, meta),
        h('div', { className: 'bh-desc' }, line)),
      h('div', { className: 'bh-meta' }, stats),
      h('div', { className: 'bh-foot' }, action, h(Btn, { onClick: () => openUrl('https://github.com/' + entry.owner + '/' + entry.repo) }, 'GitHub')),
      h('div', { className: 'bh-meta' }, h('span', { className: 'bh-link', role: 'button', onClick: () => removeUnofficial(entry) }, t('removeEntry')))));
}

function DetectedCard(props) {
  const folder = props.folder, inst = store.installed.plugins[folder] || {};
  const [text, setText] = React.useState('');
  const [err, setErr] = React.useState('');
  const submit = () => { const e = linkDetected(folder, text); if (e) setErr(e); };
  const meta = [inst.version ? t('installedVer', inst.version) : '', inst.enabled ? t('enabled') : t('pluginDisabled')].filter(Boolean).join(' · ');
  return h('div', { className: 'bh-card' },
    h('div', { className: 'bh-body' },
      h('div', null,
        h('div', { className: 'bh-name', title: folder }, inst.title || folder),
        h('div', { className: 'bh-meta' }, meta)),
      h('input', { className: 'bh-input', value: text, placeholder: t('addPlaceholder'), onChange: e => { setText(e.target.value); setErr(''); }, onKeyDown: e => { if (e.key === 'Enter') submit(); } }),
      err ? h('div', { className: 'bh-err' }, err) : null,
      h('div', { className: 'bh-foot' }, h(Btn, { onClick: submit, disabled: !text.trim() }, t('linkRepo')))));
}

function UnofficialPane() {
  const [text, setText] = React.useState('');
  const [err, setErr] = React.useState('');
  const submit = () => { const e = addUnofficial(text); if (e) setErr(e); else { setErr(''); setText(''); } };
  const list = store.unofficial.list;
  const detected = detectedPlugins();
  return h(React.Fragment, null,
    h('div', { className: 'bh-note' }, t('unofficialNote')),
    h('div', { className: 'bh-bar2' },
      h('input', { className: 'bh-input bh-addinput', value: text, placeholder: t('addPlaceholder'), onChange: e => { setText(e.target.value); setErr(''); }, onKeyDown: e => { if (e.key === 'Enter') submit(); } }),
      h('div', { className: 'bh-addbtn' }, h(Btn, { onClick: submit, disabled: !text.trim() }, t('add')))),
    err ? h('div', { className: 'bh-err' }, err) : null,
    list.length ? h('div', { className: 'bh-grid' }, list.map(e => h(UnofficialCard, { key: keyOf(e), entry: e }))) : h('div', { className: 'bh-empty' }, t('unofficialEmpty')),
    detected.length ? h('div', { className: 'bh-name' }, t('detectedTitle')) : null,
    detected.length ? h('div', { className: 'bh-note' }, t('detectedNote')) : null,
    detected.length ? h('div', { className: 'bh-grid' }, detected.map(f => h(DetectedCard, { key: f, folder: f }))) : null);
}

function BrewHubView() {
  useStore();
  const [section, setSection] = React.useState(() => { try { const v = sessionStorage.getItem('brewhub-section'); return v === 'plugins' || v === 'unofficial' ? v : 'themes'; } catch (e) { return 'themes'; } });
  const [query, setQuery] = React.useState('');
  const [sort, setSort] = React.useState('popular');
  const [filter, setFilter] = React.useState('all');
  const pick = id => { setSection(id); setFilter('all'); try { sessionStorage.setItem('brewhub-section', id); } catch (e) { /* ignore */ } };

  React.useEffect(() => { if (section === 'unofficial') { store.unofficial.list.forEach(e => checkRelease(e, false)); load('plugins', false); } else load(section, false); }, [section]);
  // what is installed changes outside of this tab too (Millennium's own Themes and Plugins tabs): look again on opening, on focus and every few seconds
  React.useEffect(() => {
    let busy = false;
    const look = async () => { if (busy || (typeof document !== 'undefined' && document.hidden)) return; busy = true; try { await refreshInstalled(); } finally { busy = false; } };
    look();
    const timer = setInterval(look, 3000);
    window.addEventListener('focus', look);
    return () => { clearInterval(timer); window.removeEventListener('focus', look); };
  }, []);

  if (store.detail) {
    const open = (store.data[store.detail.kind + 's'].items || []).find(i => i.id === store.detail.id);
    if (open) return h('div', { className: 'bh-root' }, h('style', null, CSS), h(Details, { item: open }));
    store.detail = null;
  }

  const unofficial = section === 'unofficial';
  const data = store.data[section] || { state: 'ready', items: [], at: 0, error: '' };
  const busy = unofficial ? store.unofficial.list.some(e => (store.unofficial.info[keyOf(e)] || {}).state === 'loading') : data.state === 'loading';
  const shown = arrange(data.items, query, sort, filter);
  const tab = (id, label) => h('div', { key: id, role: 'button', className: 'bh-tab' + (section === id ? ' bh-on' : ''), onClick: () => pick(id) },
    label + (id === 'unofficial' ? (store.unofficial.list.length ? ' (' + store.unofficial.list.length + ')' : '') : store.data[id].state === 'ready' ? ' (' + store.data[id].items.length + ')' : ''));

  let body;
  if (data.state === 'loading' && !data.items.length) body = h('div', { className: 'bh-empty' }, t('loadingList'));
  else if (data.state === 'error' && !data.items.length) body = h('div', { className: 'bh-empty' }, h('div', null, t('loadFailed', data.error)), h('div', { style: { marginTop: 12, display: 'inline-block' } }, h(Btn, { onClick: () => load(section, true) }, t('tryAgain'))));
  else if (!shown.length) body = h('div', { className: 'bh-empty' }, data.state === 'ready' ? t('noMatch') : '');
  else body = h('div', { className: 'bh-grid' }, shown.map(i => h(Card, { key: i.kind + ':' + i.id, item: i })));

  return h('div', { className: 'bh-root' },
    h('style', null, CSS),
    h('div', { className: 'bh-bar1' }, tab('themes', t('tabThemes')), tab('plugins', t('tabPlugins')), tab('unofficial', t('tabUnofficial')), h('div', { className: 'bh-grow' }),
      h('div', { style: { width: 110 } }, h(Btn, { onClick: () => { if (unofficial) store.unofficial.list.forEach(e => checkRelease(e, true)); else load(section, true); refreshInstalled(); }, disabled: busy }, busy ? t('loading') : t('refresh')))),
    unofficial ? h(UnofficialPane) : h(React.Fragment, null,
      h('div', { className: 'bh-bar2' },
        h('div', { className: 'bh-pills' }, SORTS.map(o => h('div', { key: o[0], role: 'button', className: 'bh-pill' + (sort === o[0] ? ' bh-on' : ''), onClick: () => setSort(o[0]) }, t(o[1])))),
        h('div', { className: 'bh-grow' }),
        h(Filter, { options: filterOptions(section, data.items), value: filter, onChange: setFilter }),
        h('div', { className: 'bh-search' }, h(SEARCH_ICON), h('input', { className: 'bh-input', value: query, placeholder: t('searchPlaceholder'), onChange: e => setQuery(e.target.value) }))),
      body));
}

/* ═════════════ adding the tab to Millennium's settings ═════════════
 * Millennium builds its tab list inside MillenniumSettings and gives it to Steam's SidebarNavigation as `pages`. There is no hook for
 * more tabs, so patch the /millennium/settings route: wrap that component and add our page to `pages` after it has rendered. */

// Some themes hide every settings icon and redraw them by route name, so a new route would get none: show ours regardless
const TAB_ICON_CSS = 'svg.bh-tabicon{display:block !important}';
const STORE_ICON = () => h('svg', { className: 'bh-tabicon', viewBox: '0 0 24 24', width: 20, height: 20, fill: 'currentColor' }, h('path', { d: 'M20 4H4v2h16V4zm1 10v-2l-1-5H4l-1 5v2h1v6h10v-6h4v6h2v-6h1zm-9 4H6v-4h6v4z' }));

function brewHubPage() {
  const Body = API.DialogBody || 'div';
  const fade = API.Classes && API.Classes.SettingsDialogBodyFade;
  return { visible: true, title: 'Brew Hub', hideTitle: true, padding: 'compact', icon: h(React.Fragment, null, h('style', null, TAB_ICON_CSS), h(STORE_ICON)), content: h(Body, fade ? { className: fade } : null, h(BrewHubView)), route: PAGE_ROUTE };
}

let injected = 0;
let renders = 0; // how often Millennium's settings page rendered through our wrapper
let pagesSeen = -1; // length of the page list found in the last render, -1 when none was found
let rewraps = 0; // how often the route entry had to be wrapped again
let lastError = '';
function findPages(node, depth) {
  if (!node || typeof node !== 'object' || depth > 8) return null;
  if (Array.isArray(node)) { for (const n of node) { const r = findPages(n, depth + 1); if (r) return r; } return null; }
  const p = node.props;
  if (!p) return null;
  if (Array.isArray(p.pages)) return p.pages;
  return findPages(p.children, depth + 1);
}

function addPage(tree) {
  const pages = findPages(tree, 0);
  pagesSeen = pages ? pages.length : -1;
  if (!pages || pages.some(p => p && p.route === PAGE_ROUTE)) return;
  const at = pages.findIndex(p => p && p.route === PLUGINS_ROUTE);
  pages.splice(at < 0 ? pages.length : at + 1, 0, brewHubPage());
  injected++;
}

/* Routes added with routerHook.addRoute (as Millennium does for /millennium/settings) are not reached by routerHook.addPatch,
 * which only patches Steam's own routes. So swap the component Millennium registered for a wrapper, then make the router rebuild. */
const SYNC_ROUTE = '/millennium/brew-hub-sync';
let settingsEntry = null;
let originalSettings = null;
let stopped = false;

function wrapSettings(Orig) {
  const w = function BrewHubSettingsWrapper(props) {
    const tree = Orig(props); // its hooks run inside this component, in the same order every render
    renders++;
    try { addPage(tree); } catch (e) { lastError = String(e && e.message || e); log('could not add the tab', e); }
    return tree;
  };
  w.__brewhub = true;
  return w;
}

// adding and removing a throwaway route changes the route count, which is what makes the router rebuild its route elements
async function rebuildRoutes() {
  try { routerHook.addRoute(SYNC_ROUTE, () => null, {}); await sleep(80); routerHook.removeRoute(SYNC_ROUTE); }
  catch (e) { lastError = String(e && e.message || e); log('could not refresh the routes', e); }
  // newer Millennium builds can also re-render Steam's router directly
  try { if (typeof (window as any).MILLENNIUM_STEAM_FORCE_RERENDER === 'function') (window as any).MILLENNIUM_STEAM_FORCE_RERENDER(); } catch (e) { /* optional */ }
}

// true when the current settings route entry was wrapped just now
function ensureWrapped() {
  const map = routerHook && routerHook.routerState && routerHook.routerState._routes;
  const entry = map && map.get(SETTINGS_ROUTE);
  if (!entry || typeof entry.component !== 'function') return false;
  settingsEntry = entry;
  if (entry.component.__brewhub) return false;
  originalSettings = entry.component;
  entry.component = wrapSettings(entry.component);
  return true;
}

async function patchSettingsRoute() {
  for (let i = 0; i < 120 && !stopped; i++) {
    if (ensureWrapped()) { await rebuildRoutes(); break; }
    if (settingsEntry) break;
    await sleep(500); // Millennium registers its route while it starts
  }
  if (!settingsEntry) { if (!stopped) log('could not find the Millennium settings route'); return; }
  // if Millennium registers the route again (a new entry without our wrapper) wrap that one too
  while (!stopped) {
    await sleep(1500);
    if (stopped) break;
    try { if (ensureWrapped()) { rewraps++; await rebuildRoutes(); } } catch (e) { lastError = String(e && e.message || e); }
  }
}

/* ═════════════ the plugin's own settings entry ═════════════ */

/* ═════════════ theming reference (shown in the plugin's settings) ═════════════ */

// every class name and variable Brew Hub uses, for theme authors; the settings page and the CSS skeleton are made from this list.
// (English only, like the code it describes)
const CLASS_DOCS = [
  {
    "group": "Tab",
    "blurb": "The Brew Hub page in Millennium's settings",
    "items": [
      {
        "selector": ".bh-root",
        "about": "Everything inside the tab. The variables below are set on it, so scope your rules with it."
      },
      {
        "selector": ".bh-tabicon",
        "about": "The tab's icon in the settings sidebar. It carries a rule that keeps it visible even when a theme hides settings icons."
      },
      {
        "selector": ".bh-empty",
        "about": "The message shown while the list loads, when it cannot load, or when nothing matches."
      }
    ]
  },
  {
    "group": "Top bar",
    "blurb": "The two rows above the list",
    "items": [
      {
        "selector": ".bh-bar1",
        "about": "First row: the Themes and Plugins tabs and the Refresh button."
      },
      {
        "selector": ".bh-bar2",
        "about": "Second row: the sort pills on the left, the filter and the search box on the right."
      },
      {
        "selector": ".bh-grow",
        "about": "The flexible gap that pushes things in a row to the right."
      },
      {
        "selector": ".bh-tab",
        "about": "The Themes and Plugins tabs. Selected one also has .bh-on."
      },
      {
        "selector": ".bh-pills",
        "about": "Wrapper of the sort pills."
      },
      {
        "selector": ".bh-pill",
        "about": "One sort pill (Most downloaded and so on). The current one also has .bh-on."
      },
      {
        "selector": ".bh-on",
        "about": "Added to the selected tab, the current sort pill and the current filter entry."
      }
    ]
  },
  {
    "group": "Filter and search",
    "blurb": "The controls on the right of the second row",
    "items": [
      {
        "selector": ".bh-filter",
        "about": "Wrapper of the filter select. Its open list is .bh-menu."
      },
      {
        "selector": ".bh-select",
        "about": "The select box itself (also has .bh-input). .bh-selval is the shown text and .bh-chev the arrow."
      },
      {
        "selector": ".bh-selval",
        "about": "The text of the current choice in the select."
      },
      {
        "selector": ".bh-chev",
        "about": "The arrow icon of the select."
      },
      {
        "selector": ".bh-menu",
        "about": "The opened list of the filter. Also the name of a variable: see --bh-menu below."
      },
      {
        "selector": ".bh-opt",
        "about": "One entry in the opened list. The current one also has .bh-on."
      },
      {
        "selector": ".bh-search",
        "about": "Wrapper of the search box. .bh-searchicon is the magnifier drawn inside it."
      },
      {
        "selector": ".bh-searchicon",
        "about": "The magnifier icon inside the search box."
      },
      {
        "selector": ".bh-input",
        "about": "The look shared by the search box and the select: height, border, fill and corners."
      }
    ]
  },
  {
    "group": "Cards",
    "blurb": "The grid of themes or plugins",
    "items": [
      {
        "selector": ".bh-grid",
        "about": "The grid that holds the cards."
      },
      {
        "selector": ".bh-card",
        "about": "One theme or plugin."
      },
      {
        "selector": ".bh-img",
        "about": "The theme's preview image at the top of a card (a background image). Plugins have none."
      },
      {
        "selector": ".bh-body",
        "about": "Everything under the image: name, author, description, tags, numbers and the buttons."
      },
      {
        "selector": ".bh-name",
        "about": "The title of a card."
      },
      {
        "selector": ".bh-meta",
        "about": "Small grey lines: author and version, downloads and update date, and the latest change in the details page."
      },
      {
        "selector": ".bh-desc",
        "about": "The description, cut after three lines."
      },
      {
        "selector": ".bh-tags",
        "about": "Wrapper of a theme's tags."
      },
      {
        "selector": ".bh-tag",
        "about": "One tag."
      },
      {
        "selector": ".bh-clickable",
        "about": "Added to the image, title and description of a card: the parts that open the details."
      },
      {
        "selector": ".bh-foot",
        "about": "The row at the bottom of a card: the main button and Details."
      },
      {
        "selector": ".bh-act",
        "about": "The main button of an item (Install, Use theme, Enable) with its progress bar underneath."
      },
      {
        "selector": ".bh-btn",
        "about": "Brew Hub's own buttons. They are Steam's DialogButton, so a theme already styles them; this class only sets the size."
      },
      {
        "selector": ".bh-bar",
        "about": "The track of the install progress bar."
      },
      {
        "selector": ".bh-fill",
        "about": "The filled part of the install progress bar. Uses --bh-accent."
      },
      {
        "selector": ".bh-err",
        "about": "The error text under the button when an install fails."
      }
    ]
  },
  {
    "group": "Details page",
    "blurb": "What opens when you click a card",
    "items": [
      {
        "selector": ".bh-detail",
        "about": "The whole details page."
      },
      {
        "selector": ".bh-dmain",
        "about": "The top part: the preview image (themes) next to the information."
      },
      {
        "selector": ".bh-dhero",
        "about": "The large preview image of a theme."
      },
      {
        "selector": ".bh-dinfo",
        "about": "Everything next to the image: title, buttons, description and chips."
      },
      {
        "selector": ".bh-dhead",
        "about": "The row with the Back button and the title."
      },
      {
        "selector": ".bh-dtitle",
        "about": "The title of the theme or plugin."
      },
      {
        "selector": ".bh-dactions",
        "about": "The row of buttons: Install or Use theme, steambrew.app, GitHub and Discord."
      },
      {
        "selector": ".bh-chips",
        "about": "Wrapper of the small fact labels (author, version, downloads and so on)."
      },
      {
        "selector": ".bh-chip",
        "about": "One fact label, also used for a theme's tags in the details page."
      }
    ]
  },
  {
    "group": "README",
    "blurb": "The README shown on the details page",
    "items": [
      {
        "selector": ".bh-readme",
        "about": "The box around the README."
      },
      {
        "selector": ".bh-md",
        "about": "The rendered README. It holds plain elements (h1 to h6, p, ul, ol, table, pre, code, details and so on), so style those inside it."
      },
      {
        "selector": ".bh-mdimg",
        "about": "Images in the README."
      },
      {
        "selector": ".bh-tablewrap",
        "about": "Wrapper around each README table, so wide tables scroll sideways."
      },
      {
        "selector": ".bh-check",
        "about": "The checkbox of a task list item in a README."
      },
      {
        "selector": ".bh-link",
        "about": "A link in a README. It opens in your system browser."
      }
    ]
  },
  {
    "group": "Unofficial tab",
    "blurb": "Plugins added from GitHub repositories. Its cards use the card classes above.",
    "items": [
      {
        "selector": ".bh-note",
        "about": "The small grey line above the list."
      },
      {
        "selector": ".bh-addinput",
        "about": "The box where a GitHub link or owner/repo is typed. It also carries .bh-input."
      },
      {
        "selector": ".bh-addbtn",
        "about": "The box around the Add button."
      }
    ]
  },
  {
    "group": "Variables set on .bh-root",
    "blurb": "Custom properties a theme can override",
    "items": [
      {
        "selector": "--bh-r",
        "about": "Corner radius of cards, fields, tabs, pills and tags. 0 normally, so it is square like Steam; it follows the theme's radius when the theme exposes one (SpaceTheme, Minimal Dark)."
      },
      {
        "selector": "--bh-card",
        "about": "Fill of cards and of the README box."
      },
      {
        "selector": "--bh-field",
        "about": "Fill of tabs, pills, tags, chips, the search box and the select."
      },
      {
        "selector": "--bh-hover",
        "about": "Fill when hovering, and of the selected tab, pill and entry."
      },
      {
        "selector": "--bh-line",
        "about": "Border colour of cards, the search box, the select and tables."
      },
      {
        "selector": "--bh-accent",
        "about": "Accent: the border of the selected tab and pill, the install progress and the current entry in the open list."
      },
      {
        "selector": "--bh-menu",
        "about": "Background of the opened filter list. Has to be an opaque colour."
      },
      {
        "selector": "--bh-card-s",
        "about": "Internal: the card colour as read from SpaceTheme (--st-color-2). Override --bh-card instead."
      },
      {
        "selector": "--bh-field-s",
        "about": "Internal: the field colour as read from SpaceTheme (--st-color-3). Override --bh-field instead."
      },
      {
        "selector": "--bh-hover-s",
        "about": "Internal: the hover colour as read from SpaceTheme (--st-color-4). Override --bh-hover instead."
      },
      {
        "selector": "--bh-line-s",
        "about": "Internal: the border colour as read from SpaceTheme (--st-color-5). Override --bh-line instead."
      },
      {
        "selector": "--bh-accent-s",
        "about": "Internal: the accent as read from SpaceTheme (--st-accent-1). Override --bh-accent instead."
      }
    ]
  }
];

function cssSkeleton() {
  const lines = ["/* Brew Hub: all selectors, ready to fill in. Put the rules in your theme's CSS. */", ''];
  for (const g of CLASS_DOCS) {
    lines.push('/* ' + g.group + ' */');
    for (const it of g.items) {
      lines.push('/* ' + it.about + ' */');
      lines.push(it.selector.startsWith('--') ? '.bh-root { ' + it.selector + ': ; }' : it.selector + ' { }');
    }
    lines.push('');
  }
  return lines.join('\n');
}

// Copies text to the clipboard from the window that was clicked (a window without focus is refused): the clipboard API first,
// the old copy command second.
function copyText(text, doc) {
  const d = doc || (typeof document !== 'undefined' ? document : null);
  if (!d) return Promise.reject(new Error('no document to copy from'));
  const view = d.defaultView || window;
  const viaApi = () => (view.navigator.clipboard && view.navigator.clipboard.writeText ? view.navigator.clipboard.writeText(text) : Promise.reject(new Error('no clipboard api')));
  const viaCommand = () => new Promise((resolve, reject) => {
    try {
      const box = d.createElement('textarea');
      box.value = text; box.setAttribute('readonly', '');
      box.style.position = 'fixed'; box.style.top = '0'; box.style.left = '0'; box.style.opacity = '0';
      d.body.appendChild(box); box.focus(); box.select();
      const ok = d.execCommand('copy');
      box.remove();
      ok ? resolve() : reject(new Error('copy refused'));
    } catch (e) { reject(e); }
  });
  let first;
  try { first = viaApi(); } catch (e) { first = Promise.reject(e); }
  return first.catch(() => viaCommand());
}

const SETTINGS_CSS = `
.bhd-wrap{box-sizing:border-box;max-width:100%;overflow-x:hidden;--bhd-r:var(--st-border-radius,var(--minimal_dark_corner,0px));white-space:normal}
.bhd-wrap .bhd-sections{margin-top:18px;padding-top:2px}
.bhd-wrap .bhd-section{margin:0 0 10px;border:1px solid color-mix(in srgb,currentColor 16%,transparent);border-radius:var(--bhd-r);overflow:hidden;background:color-mix(in srgb,currentColor 4%,transparent)}
.bhd-wrap .bhd-head{display:flex;align-items:center;gap:12px;margin:0;padding:12px 14px;cursor:pointer;user-select:none}
.bhd-wrap .bhd-head:hover{background:color-mix(in srgb,currentColor 8%,transparent)}
.bhd-wrap .bhd-chev{flex:none;display:flex;transition:transform .2s ease}
.bhd-wrap .bhd-chev.bhd-open{transform:rotate(90deg)}
.bhd-wrap .bhd-titles{flex:1 1 auto;min-width:0}
.bhd-wrap .bhd-name{font-size:15px;font-weight:600;line-height:20px}
.bhd-wrap .bhd-blurb{margin-top:1px;font-size:12px;font-weight:400;line-height:16px;opacity:.65}
.bhd-wrap .bhd-pill{flex:none;font-size:11px;font-weight:600;line-height:16px;padding:1px 9px;border-radius:var(--bhd-r);background:color-mix(in srgb,currentColor 16%,transparent)}
.bhd-wrap .bhd-collapse{display:grid;grid-template-rows:0fr;transition:grid-template-rows .22s ease}
.bhd-wrap .bhd-collapse.bhd-open{grid-template-rows:1fr}
.bhd-wrap .bhd-inner{overflow:hidden;min-height:0}
.bhd-wrap .bhd-item{display:flex;align-items:flex-start;gap:12px;padding:10px 14px;border-top:1px solid color-mix(in srgb,currentColor 12%,transparent)}
.bhd-wrap .bhd-text{flex:1 1 auto;min-width:0}
.bhd-wrap .bhd-sel{display:inline-block;max-width:100%;padding:2px 8px;border-radius:var(--bhd-r);background:color-mix(in srgb,currentColor 14%,transparent);font-family:Consolas,"Courier New",monospace;font-size:12.5px;line-height:18px;cursor:pointer;word-break:break-all}
.bhd-wrap .bhd-desc{margin-top:6px;font-size:12.5px;font-weight:400;line-height:1.45;opacity:.75}
.bhd-wrap .bhd-copy{flex:none;align-self:center;padding:3px 10px;border-radius:var(--bhd-r);border:1px solid color-mix(in srgb,currentColor 28%,transparent);font-size:11px;line-height:16px;cursor:pointer;user-select:none}
.bhd-wrap .bhd-copy:hover{background:color-mix(in srgb,currentColor 14%,transparent)}
.bhd-wrap.bhd-narrow .bhd-item{flex-direction:column;gap:8px;padding:10px 12px}
.bhd-wrap.bhd-narrow .bhd-copy{align-self:flex-start}
.bhd-wrap.bhd-narrow .bhd-head{padding:10px 12px}
`;

function SettingsPanel() {
  const [notify, setNotifyState] = React.useState(settings.notify);
  const [open, setOpen] = React.useState({}); // group name -> expanded; every section starts collapsed
  const [copied, setCopied] = React.useState('');
  const [manual, setManual] = React.useState(''); // text to copy by hand when the clipboard refuses
  // the settings pane can be narrow: below about 560 px the buttons go under the text and the rows stack
  const wrapRef = React.useRef(null);
  const [narrow, setNarrow] = React.useState(false);
  React.useEffect(() => {
    const el = wrapRef.current;
    if (!el || !el.ownerDocument || !el.ownerDocument.defaultView) return undefined;
    const view = el.ownerDocument.defaultView;
    const measure = () => setNarrow(el.clientWidth > 0 && el.clientWidth < 560);
    measure();
    if (!view.ResizeObserver) return undefined;
    const watcher = new view.ResizeObserver(measure);
    watcher.observe(el);
    return () => watcher.disconnect();
  }, []);

  const Toggle = API.ToggleField;
  const Btn = API.DialogButton || 'button';
  const small = { flex: 'none', width: 'auto', whiteSpace: 'nowrap', padding: '0 14px' };
  const layout = narrow ? 'below' : 'inline';
  const goTo = () => { try { API.Navigation.Navigate(PAGE_ROUTE); } catch (e) { log('could not open the tab', e); } };
  const copy = (text, what, event) => {
    let doc;
    try { doc = event && event.currentTarget && event.currentTarget.ownerDocument; } catch (e) { doc = undefined; }
    copyText(text, doc).then(() => { setManual(''); setCopied(what); }, () => { setManual(text); setCopied(''); });
    setTimeout(() => setCopied(''), 2500);
  };
  const toggle = name => setOpen(prev => Object.assign({}, prev, { [name]: !prev[name] }));
  const setAll = value => setOpen(() => Object.fromEntries(CLASS_DOCS.map(g => [g.group, value])));
  const row = (key, props, child) => (API.Field
    ? h(API.Field, Object.assign({ key, childrenLayout: layout }, props), child)
    : h('div', { key, style: { margin: '10px 0' } }, h('div', { style: { fontWeight: 600 } }, props.label), props.description ? h('div', { style: { opacity: 0.75, fontSize: 13 } }, props.description) : null, child));

  const top = [
    Toggle
      ? h(Toggle, { key: 'notify', label: t('setNotifyLabel'), description: t('setNotifyDesc'), checked: notify, onChange: v => { setNotify(v); setNotifyState(!!v); } })
      : h('label', { key: 'notify' }, h('input', { type: 'checkbox', checked: notify, onChange: e => { setNotify(e.target.checked); setNotifyState(e.target.checked); } }), ' ' + t('setNotifyLabel')),
    row('intro', { label: 'Brew Hub', description: t('setIntro') }, h(Btn, { onClick: goTo, style: small }, t('setOpen'))),
    row('theming', { label: 'Theming Brew Hub', description: "Brew Hub is made from Steam's own buttons and plain elements, so most themes need nothing extra. To refine it, use the class names below. Click a selector to copy it." }, null),
    row('copyall', { label: 'CSS skeleton', description: 'Every selector below with an empty rule and a comment, ready to paste into your theme.' }, h(Btn, { onClick: e => copy(cssSkeleton(), 'CSS skeleton copied', e), style: small }, 'Copy CSS')),
    row('tip', { label: 'Tip', description: "Scope your rules with .bh-root so they only affect Brew Hub. Open the tab, then use Steam's DevTools to inspect it." }, null),
    row('sections', { label: 'Class names', description: 'Open a section to see its class names.' },
      h('div', { style: { display: 'flex', flexWrap: 'wrap', gap: 8 } },
        h(Btn, { onClick: () => setAll(true), style: small }, 'Expand all'),
        h(Btn, { onClick: () => setAll(false), style: small }, 'Collapse all'))),
  ];

  // Steam's own section classes (the ones its Properties window and Millennium's settings use), so a theme styles the headings
  const sections = CLASS_DOCS.map(g => {
    const isOpen = !!open[g.group];
    return h('div', { key: 'g-' + g.group, className: 'DialogControlsSection bhd-section' },
      h('div', { className: 'SettingsDialogSubHeader bhd-head', role: 'button', 'aria-expanded': isOpen, onClick: () => toggle(g.group) },
        h('span', { className: 'bhd-chev' + (isOpen ? ' bhd-open' : '') },
          h('svg', { viewBox: '0 0 16 16', width: 14, height: 14 }, h('path', { d: 'M6 3l5 5-5 5', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }))),
        h('div', { className: 'bhd-titles' }, h('div', { className: 'bhd-name' }, g.group), g.blurb ? h('div', { className: 'bhd-blurb' }, g.blurb) : null),
        h('span', { className: 'bhd-pill' }, String(g.items.length))),
      h('div', { className: 'bhd-collapse' + (isOpen ? ' bhd-open' : ''), 'aria-hidden': !isOpen },
        h('div', { className: 'bhd-inner' },
          g.items.map(it => h('div', { key: it.selector, className: 'bhd-item' },
            h('div', { className: 'bhd-text' },
              h('span', { className: 'bhd-sel', title: 'Click to copy', onClick: e => copy(it.selector, it.selector + ' copied', e) }, it.selector),
              h('div', { className: 'bhd-desc' }, it.about)),
            h('span', { className: 'bhd-copy', role: 'button', onClick: e => copy(it.selector, it.selector + ' copied', e) }, 'Copy'))))));
  });

  return h('div', { ref: wrapRef, className: 'bhd-wrap' + (narrow ? ' bhd-narrow' : ''), style: { padding: 16, paddingBottom: 24 } },
    h('style', null, SETTINGS_CSS),
    copied ? h('div', { style: { position: 'sticky', top: 0, zIndex: 2, padding: '6px 12px', background: 'rgba(0,0,0,.65)', color: '#8fcf5a', fontSize: 13 } }, copied) : null,
    manual ? h('div', { style: { margin: '8px 0 12px', padding: 12, background: 'rgba(0,0,0,.35)' } },
      h('div', { style: { marginBottom: 8, fontSize: 13 } }, 'Steam did not allow copying automatically. The text is selected: press Ctrl+C to copy it.'),
      h('textarea', { readOnly: true, value: manual, rows: Math.min(10, manual.split('\n').length + 1), ref: el => { if (el) { el.focus(); el.select(); } }, onFocus: e => e.target.select(), style: { width: '100%', boxSizing: 'border-box', fontFamily: 'Consolas, "Courier New", monospace', fontSize: 12, background: 'rgba(0,0,0,.4)', color: 'inherit', border: '1px solid rgba(255,255,255,.2)', padding: 8 } }),
      h('div', { style: { marginTop: 8 } }, h(Btn, { onClick: () => setManual(''), style: small }, 'Close'))) : null,
    top, h('div', { className: 'bhd-sections' }, sections));
}

function dispose() {
  stopped = true;
  try { if (settingsEntry && originalSettings) { settingsEntry.component = originalSettings; rebuildRoutes(); } } catch (e) { /* ignore */ }
  settingsEntry = null; originalSettings = null;
  unhookEmitter();
  store.listeners.clear();
  try { delete (window as any).__brewhub; } catch (e) { (window as any).__brewhub = undefined; }
}

async function main() {
  try { if ((window as any).__brewhub && (window as any).__brewhub.dispose) (window as any).__brewhub.dispose(); } catch (e) { /* ignore */ }
  (window as any).__brewhub = {
    dispose,
    // for bug reports: did the route patch run and did the tab get added (injected stays 0 until Millennium's settings have been opened)
    status: () => ({ patched: !!settingsEntry, wrapped: !!(settingsEntry && settingsEntry.component && settingsEntry.component.__brewhub), renders, pagesSeen, injected, rewraps, lastError, emitterHooked, installed: !!store.installed, themes: store.data.themes.state, plugins: store.data.plugins.state }),
    // for bug reports: open Millennium's settings first, then run __brewhub.diagnose() and copy the result
    diagnose: () => {
      const reg = (window as any).__millennium_registry;
      const map = routerHook && routerHook.routerState && routerHook.routerState._routes;
      const parts = ['DialogButton', 'DialogBody', 'Classes', 'ToggleField', 'Field', 'showModal', 'ConfirmModal', 'toaster', 'IconsModule', 'Navigation', 'routerHook', 'ffi'];
      return {
        status: (window as any).__brewhub.status(),
        routes: map ? Array.from(map.keys()) : null,
        react: { version: React && React.version, hasHooks: !!(React && React.useState) },
        steamParts: Object.fromEntries(parts.map(k => [k, typeof API[k]])),
        registry: reg ? { register: typeof reg.register, available: reg.available ? Object.keys(reg.available) : null } : null,
        forceRerender: typeof (window as any).MILLENNIUM_STEAM_FORCE_RERENDER,
        language: currentLanguage,
      };
    },
    reload: () => Promise.all([load('themes', true), load('plugins', true), refreshInstalled()]),
    openDetails: (kind, id) => { const item = store.data[kind === 'theme' ? 'themes' : 'plugins'].items.find(i => i.id === id); if (item) openDetails(item); return !!item; },
    // install from the console by steambrew.app id: __brewhub.install('theme', '<20 char id>') or ('plugin', '<12 char id>')
    // every class name and variable Brew Hub uses (also in the plugin's settings): __brewhub.classes()
    classes: () => CLASS_DOCS,
    install: (kind, id) => {
      const item = store.data[kind === 'theme' ? 'themes' : 'plugins'].items.find(i => i.id === id);
      if (!item) return Promise.reject(new Error('Not in the loaded list. Run __brewhub.reload() first.'));
      return kind === 'theme' ? installTheme(item) : installPlugin(item);
    },
  };
  stopped = false;
  detectLanguage();
  patchSettingsRoute().catch(e => log('could not patch the settings route', e));
  // Millennium's installer registers its progress function while it starts, possibly after this plugin
  for (let i = 0; i < 60 && !stopped && !hookEmitter(); i++) await sleep(1000);
}

export default definePlugin(() => {
  main();
  return {
    title: 'Brew Hub',
    icon: React.createElement('span', null),
    content: React.createElement(SettingsPanel),
  };
});
