// Single source of truth for the Admin Toolkit manual: section order, bilingual
// intros, and every screenshot slug with bilingual alt text and caption.
// Both the capture spec (slugs) and the page generator (captions) read this.

export const SECTIONS = [
  {
    id: "getting-started",
    en: { title: "1. Getting started & popup", intro: "Install the toolkit, then open the popup from any Salesforce tab — it reuses the session you are already signed in with." },
    jp: { title: "1. はじめに・ポップアップ", intro: "拡張機能をインストールし、任意の Salesforce タブからポップアップを開きます。サインイン済みのセッションをそのまま利用します。" },
    steps: {
      en: ["Install <a href=\"https://chromewebstore.google.com/detail/admin-toolkit-for-salesfo/hcbaijonjdkbdhbaknaipikhobphjnjc\" target=\"_blank\" rel=\"noopener\">Admin Toolkit for Salesforce from the Chrome Web Store</a>.", "Open any Salesforce tab and sign in as usual — no separate login.", "Click the extension icon to open the popup."],
      jp: ["<a href=\"https://chromewebstore.google.com/detail/admin-toolkit-for-salesfo/hcbaijonjdkbdhbaknaipikhobphjnjc\" target=\"_blank\" rel=\"noopener\">Chrome ウェブストアから Admin Toolkit for Salesforce をインストール</a>します。", "任意の Salesforce タブを開いていつもどおりサインインします（別途ログインは不要）。", "拡張機能のアイコンをクリックしてポップアップを開きます。"]
    }
  },
  {
    id: "metadata-admin",
    en: { title: "2. Metadata Admin for Salesforce", intro: "Browse the org's metadata in a source-style tree, inspect folders and files, search the loaded workspace, track local edits, and build package.xml selections." },
    jp: { title: "2. Metadata Admin for Salesforce", intro: "組織のメタデータをソース形式のツリーで参照し、フォルダーやファイルの確認、ワークスペース内の検索、ローカル編集の追跡、package.xml の組み立てができます。" }
  },
  {
    id: "force-sheet",
    en: { title: "3. Force Sheet", intro: "A multi-tab spreadsheet for Salesforce data: run SOQL, open reports and list views, import CSV/XLSX, and start CRUD workflows from grid selections — every write asks for confirmation first." },
    jp: { title: "3. Force Sheet", intro: "Salesforce データのためのマルチタブ・スプレッドシート。SOQL の実行、レポートやリストビューの展開、CSV/XLSX の取り込み、グリッド選択からの CRUD 操作ができます。書き込みは必ず実行前に確認されます。" }
  },
  {
    id: "org-review",
    en: { title: "4. Org Review", intro: "A read-only assessment of org health that runs automatically when opened. Each section carries evidence and remediation guidance; the report exports as PDF, Markdown, summary JSON, or evidence JSON." },
    jp: { title: "4. Org Review（組織レビュー）", intro: "ページを開くと自動で実行される読み取り専用の組織健全性アセスメント。各セクションに根拠と改善ガイダンスが付き、PDF・Markdown・サマリー JSON・エビデンス JSON でエクスポートできます。" }
  },
  {
    id: "object-schema",
    en: { title: "5. Object Schema", intro: "Build an interactive relationship map for any pickable object, then explore every field of every selectable object in the Fields spreadsheet below it." },
    jp: { title: "5. Object Schema（オブジェクトスキーマ）", intro: "選択可能な任意のオブジェクトからインタラクティブなリレーションマップを作成し、その下の Fields スプレッドシートで選択可能な全オブジェクトの全項目を探索できます。" }
  },
  {
    id: "document-folders",
    en: { title: "6. Document Folders", intro: "Browse Salesforce libraries and folders, preview supported files, and download selections as a ZIP that preserves folder paths. Folder selection is recursive; downloads are limited to 500 files and 250 MB and can be canceled mid-run." },
    jp: { title: "6. ドキュメントフォルダー", intro: "Salesforce のライブラリとフォルダーを参照し、対応ファイルをプレビューし、フォルダーパスを保持した ZIP として選択内容をダウンロードできます。フォルダー選択は再帰的で、500 ファイル・250 MB まで、実行中にキャンセルできます。" }
  },
  {
    id: "rest-explorer",
    en: { title: "7. REST Explorer", intro: "Compose Salesforce REST API requests with endpoint templates, send them against the connected org, and inspect the JSON response. Requests run only when you send them." },
    jp: { title: "7. REST Explorer", intro: "エンドポイントテンプレートで Salesforce REST API リクエストを組み立て、接続中の組織に送信し、JSON レスポンスを確認できます。リクエストはあなたが送信したときだけ実行されます。" }
  },
  {
    id: "data-export",
    en: { title: "8. Data Export", intro: "Run SOQL, SOSL, and GraphQL queries or report exports, preview the result as a CSV grid or JSON, and download it." },
    jp: { title: "8. データエクスポート", intro: "SOQL・SOSL・GraphQL クエリやレポートエクスポートを実行し、CSV グリッドまたは JSON でプレビューしてダウンロードできます。" }
  },
  {
    id: "run-apex",
    en: { title: "9. Run Apex", intro: "Execute anonymous Apex and review the compile result, execution status, and debug output." },
    jp: { title: "9. Apex 実行", intro: "匿名 Apex を実行し、コンパイル結果・実行ステータス・デバッグ出力を確認できます。" }
  },
  {
    id: "monitoring",
    en: { title: "10. Limits & monitoring", intro: "Read-only monitoring pages for the org: API limits with live usage bars, the setup audit trail, login history, and event log files." },
    jp: { title: "10. 制限値とモニタリング", intro: "組織の読み取り専用モニタリングページ：使用量バー付きの API 制限、設定変更履歴、ログイン履歴、イベントログファイル。" }
  },
  {
    id: "builtin-manual",
    en: { title: "11. Built-in manual (EN/JP)", intro: "The extension ships with its own manual in English and Japanese, including per-version release notes. Every page has a language toggle in its header." },
    jp: { title: "11. 内蔵マニュアル（英語/日本語）", intro: "拡張機能には英語・日本語の内蔵マニュアルとバージョンごとのリリースノートが同梱されています。各ページのヘッダーに言語切り替えがあります。" }
  }
];

// slug: [section, enAlt, enCaption, jpAlt, jpCaption]
const S = (section, enAlt, enCap, jpAlt, jpCap) => ({ section, en: { alt: enAlt, cap: enCap }, jp: { alt: jpAlt, cap: jpCap } });

export const SCENES = {
  // ── Getting started ──
  "popup-apps": S("getting-started", "Popup Apps tab", "The Apps tab launches the four primary workspaces.", "ポップアップのアプリタブ", "アプリタブは 4 つの主要ワークスペースを起動します。"),
  "popup-tools": S("getting-started", "Popup Tools tab", "The Tools tab lists every single-purpose page.", "ポップアップのツールタブ", "ツールタブには単機能ページが並びます。"),
  "popup-org": S("getting-started", "Popup Org tab", "The Org tab summarizes the connected org and user.", "ポップアップの組織タブ", "組織タブは接続中の組織とユーザーの概要を表示します。"),
  "popup-search": S("getting-started", "Popup metadata search", "Search metadata across the org by API name, label, or text.", "ポップアップのメタデータ検索", "API 参照名・ラベル・テキストで組織全体のメタデータを検索します。"),
  "popup-search-suggestions": S("getting-started", "Popup search suggestions", "Type-ahead suggestions while searching.", "ポップアップの検索サジェスト", "検索中の入力補完サジェスト。"),

  // ── Metadata Admin ──
  "metadata-tree": S("metadata-admin", "Metadata workspace tree", "The loaded source-style metadata workspace.", "メタデータのワークスペースツリー", "読み込んだソース形式のメタデータワークスペース。"),
  "metadata-classes": S("metadata-admin", "Apex classes folder", "Apex classes in the tree.", "Apex クラスフォルダー", "ツリー内の Apex クラス。"),
  "metadata-folder-table": S("metadata-admin", "Folder record table", "A folder's records in the sortable table.", "フォルダーのレコード表", "並べ替え可能な表で表示したフォルダー内レコード。"),
  "metadata-file": S("metadata-admin", "Metadata file view", "A file opened for inspection and local editing.", "メタデータファイルの表示", "確認・ローカル編集のために開いたファイル。"),
  "metadata-triggers": S("metadata-admin", "Apex triggers folder", "Apex triggers in the tree.", "Apex トリガーフォルダー", "ツリー内の Apex トリガー。"),
  "metadata-flows": S("metadata-admin", "Flows folder", "Flows in the tree.", "フローフォルダー", "ツリー内のフロー。"),
  "metadata-lwc": S("metadata-admin", "Lightning Web Components folder", "Lightning Web Components in the tree.", "Lightning Web コンポーネントフォルダー", "ツリー内の Lightning Web コンポーネント。"),
  "metadata-objects": S("metadata-admin", "Objects folder", "Custom objects and fields in the tree.", "オブジェクトフォルダー", "ツリー内のカスタムオブジェクトと項目。"),
  "metadata-pages": S("metadata-admin", "Visualforce pages folder", "Visualforce pages in the tree.", "Visualforce ページフォルダー", "ツリー内の Visualforce ページ。"),
  "metadata-aura": S("metadata-admin", "Aura components folder", "Aura components in the tree.", "Aura コンポーネントフォルダー", "ツリー内の Aura コンポーネント。"),
  "metadata-search": S("metadata-admin", "Workspace search results", "Search matches names, labels, and content snippets.", "ワークスペース検索結果", "名前・ラベル・内容スニペットにマッチします。"),
  "metadata-search-suggestions": S("metadata-admin", "Workspace search suggestions", "Suggestions while typing a workspace search.", "ワークスペース検索のサジェスト", "ワークスペース検索入力中のサジェスト。"),
  "metadata-namespaces": S("metadata-admin", "Workspace namespaces menu", "Scope the workspace to unmanaged or managed namespaces.", "ワークスペース名前空間メニュー", "未管理／管理名前空間にワークスペースを絞り込みます。"),
  "metadata-changed-files": S("metadata-admin", "Changed files panel", "Locally changed files, ready to deploy or discard.", "変更ファイルパネル", "デプロイまたは破棄できるローカル変更ファイル。"),
  "metadata-package-xml": S("metadata-admin", "package.xml builder", "Assemble a package.xml from tree selections.", "package.xml ビルダー", "ツリーの選択から package.xml を組み立てます。"),
  "metadata-package-tree": S("metadata-admin", "package.xml selection tree", "Selecting components for the package.", "package.xml 選択ツリー", "パッケージに含めるコンポーネントの選択。"),

  // ── Force Sheet ──
  "force-sheet-query-editor": S("force-sheet", "Force Sheet SOQL editor", "The SOQL query editor.", "Force Sheet の SOQL エディター", "SOQL クエリエディター。"),
  "force-sheet-field-suggestions": S("force-sheet", "SOQL field suggestions", "Field suggestions while composing SOQL.", "SOQL 項目サジェスト", "SOQL 作成中の項目サジェスト。"),
  "force-sheet-query-results": S("force-sheet", "SOQL results grid", "Query results streamed into the grid.", "SOQL 結果グリッド", "グリッドにストリーミングされたクエリ結果。"),
  "force-sheet-report-tab": S("force-sheet", "Force Sheet report tab", "Open org reports into the sheet.", "Force Sheet のレポートタブ", "組織のレポートをシートに展開します。"),
  "force-sheet-upload-tab": S("force-sheet", "Force Sheet upload tab", "Import CSV or XLSX files.", "Force Sheet のアップロードタブ", "CSV / XLSX ファイルを取り込みます。"),
  "force-sheet-crud-panel": S("force-sheet", "Force Sheet CRUD panel", "Turn grid selections into insert/update/delete requests.", "Force Sheet の CRUD パネル", "グリッド選択を挿入／更新／削除リクエストに変換します。"),
  "force-sheet-crud-object": S("force-sheet", "CRUD object and mapping", "Choosing the object and field mapping for a write.", "CRUD のオブジェクトとマッピング", "書き込み対象のオブジェクトと項目マッピングの選択。"),
  "force-sheet-workspace": S("force-sheet", "Force Sheet workspace tree", "Auto-saved spreadsheet files in folders.", "Force Sheet のワークスペースツリー", "フォルダー分けされた自動保存スプレッドシートファイル。"),
  "force-sheet-objects-tree": S("force-sheet", "Objects tree", "Objects that have list views.", "Objects ツリー", "リストビューを持つオブジェクト。"),
  "force-sheet-reports-tree": S("force-sheet", "Reports tree", "Org reports available to open.", "Reports ツリー", "展開可能な組織レポート。"),
  "force-sheet-file-context-menu": S("force-sheet", "Workspace file context menu", "Rename, move, download, or delete a file.", "ワークスペースファイルのコンテキストメニュー", "ファイルの名前変更・移動・ダウンロード・削除。"),
  "force-sheet-download-dialog": S("force-sheet", "Workspace download dialog", "Export a file or folder as CSV or Excel.", "ワークスペースのダウンロードダイアログ", "ファイルやフォルダーを CSV / Excel でエクスポート。"),

  // ── Org Review ──
  "org-review-summary": S("org-review", "Org Review executive summary", "The completed review with the health scorecard.", "Org Review のエグゼクティブサマリー", "健全性スコアカード付きの完了済みレビュー。"),
  "org-review-collectors": S("org-review", "Collector progress", "Every read-only collector that fed the report.", "コレクターの進捗", "レポートに寄与した読み取り専用コレクター。"),
  "org-review-scope": S("org-review", "Scope & provenance (A)", "Section A: scope and provenance.", "対象範囲と実行情報（A）", "セクション A：対象範囲と実行情報。"),
  "org-review-scorecard": S("org-review", "Health scorecard (A2)", "Section A2: executive health scorecard.", "ヘルススコアカード（A2）", "セクション A2：ヘルススコアカード。"),
  "org-review-admin-overview": S("org-review", "Admin overview (A3)", "Section A3: admin overview.", "管理者概要（A3）", "セクション A3：管理者概要。"),
  "org-review-feature-catalog": S("org-review", "Feature catalog (B)", "Section B: feature catalog.", "機能カタログ（B）", "セクション B：機能カタログ。"),
  "org-review-data-model": S("org-review", "Data model (C)", "Section C: data model and object limits.", "データモデル（C）", "セクション C：データモデルとオブジェクト制限。"),
  "org-review-dimensions": S("org-review", "Assessment dimensions (D)", "Section D: assessment dimensions.", "評価ディメンション（D）", "セクション D：評価ディメンション。"),
  "org-review-security": S("org-review", "Security & trust deep-dive (D2)", "Section D2: security and trust.", "セキュリティ & トラスト詳細（D2）", "セクション D2：セキュリティとトラスト。"),
  "org-review-login-policy": S("org-review", "Login & session policy (D3)", "Section D3: login, session & authentication policy.", "ログイン・セッションポリシー（D3）", "セクション D3：ログイン・セッション・認証ポリシー。"),
  "org-review-checklist": S("org-review", "Review checklist (E)", "Section E: review checklist.", "レビューチェックリスト（E）", "セクション E：レビューチェックリスト。"),
  "org-review-remediation": S("org-review", "Remediation roadmap (F)", "Section F: remediation roadmap.", "改善ロードマップ（F）", "セクション F：改善ロードマップ。"),

  // ── Object Schema ──
  "object-schema-start": S("object-schema", "Object Schema on open", "Controls plus the all-objects Fields sheet.", "起動直後の Object Schema", "コントロールと全オブジェクトの Fields シート。"),
  "object-schema-suggestions": S("object-schema", "Object name suggestions", "Object Name suggests API names and labels.", "オブジェクト名のサジェスト", "Object Name は API 参照名とラベルを提案します。"),
  "object-schema-packaged-menu": S("object-schema", "Packaged Objects menu", "Scope packaged namespaces per org.", "Packaged Objects メニュー", "組織ごとにパッケージ名前空間を絞り込みます。"),
  "object-schema-packaged-search": S("object-schema", "Packaged namespace search", "Searching within the packaged-namespace menu.", "パッケージ名前空間の検索", "パッケージ名前空間メニュー内の検索。"),
  "object-schema-map-fields": S("object-schema", "Map with Fields sheet", "The built map, relationship details, and the Fields sheet.", "マップと Fields シート", "作成したマップ、リレーション詳細、Fields シート。"),
  "object-schema-find-path": S("object-schema", "Find object path", "Find highlights the connecting path from the root.", "オブジェクト検索のパス", "ルートからの接続パスをハイライトします。"),
  "object-schema-node-fields": S("object-schema", "Node focuses fields", "Clicking a node filters the Fields sheet to it.", "ノードで項目を絞り込み", "ノードをクリックすると Fields シートが絞り込まれます。"),
  "object-schema-node-case": S("object-schema", "Child node selected", "A child object selected on the map.", "子ノードを選択", "マップ上で選択した子オブジェクト。"),
  "object-schema-fields-search": S("object-schema", "Global fields search", "Global search highlights every matching cell.", "グローバル項目検索", "グローバル検索は一致セルをすべてハイライトします。"),
  "object-schema-fields-one-object": S("object-schema", "Fields filtered to one object", "The Fields sheet scoped to a single object.", "1 オブジェクトに絞った項目", "1 オブジェクトに絞り込んだ Fields シート。"),
  "object-schema-vertical": S("object-schema", "Vertical layout", "Parents above, children below.", "縦型レイアウト", "親が上、子が下。"),
  "object-schema-zoom": S("object-schema", "Zoomed map", "The map at 125% zoom.", "ズームしたマップ", "125% にズームしたマップ。"),
  "object-schema-actual-size": S("object-schema", "Actual-size map", "The map at actual size, fit to the viewport.", "実寸のマップ", "ビューポートに合わせた実寸のマップ。"),
  "object-schema-relationship-table": S("object-schema", "Relationship table", "The accessible relationship table view.", "リレーション表", "アクセシブルなリレーション表ビュー。"),
  "object-schema-visible-filter": S("object-schema", "Visible objects filter", "Hide objects from the map.", "表示オブジェクトフィルター", "マップからオブジェクトを隠します。"),
  "object-schema-visible-search": S("object-schema", "Visible objects search", "Searching within the visible-objects filter.", "表示オブジェクトの検索", "表示オブジェクトフィルター内の検索。"),
  "object-schema-show-standard": S("object-schema", "Show all standard objects", "Standard objects added to the pickable catalog.", "標準オブジェクトをすべて表示", "選択可能カタログに標準オブジェクトを追加。"),

  // ── Document Folders ──
  "document-folders-tree": S("document-folders", "Document folders tree", "Browsing workspaces and folders.", "ドキュメントフォルダーツリー", "ワークスペースとフォルダーの参照。"),
  "document-folders-selection": S("document-folders", "Checkbox selection", "Checking a folder selects its whole subtree.", "チェックボックス選択", "フォルダーにチェックするとサブツリー全体を選択。"),
  "document-folders-selected-panel": S("document-folders", "Selected Items panel", "Review and download the selection.", "選択済み項目パネル", "選択内容の確認とダウンロード。"),
  "document-folders-context-menu": S("document-folders", "Folder context menu", "Folder actions from the context menu.", "フォルダーのコンテキストメニュー", "コンテキストメニューからのフォルダー操作。"),
  "document-folders-search": S("document-folders", "Folder search", "Filtering folders and documents by name.", "フォルダー検索", "名前でフォルダーとドキュメントを絞り込み。"),

  // ── REST Explorer ──
  "rest-api": S("rest-explorer", "REST request builder", "The request builder with endpoint templates.", "REST リクエストビルダー", "エンドポイントテンプレート付きのリクエストビルダー。"),
  "rest-api-method": S("rest-explorer", "HTTP method selector", "Choosing the HTTP method.", "HTTP メソッド選択", "HTTP メソッドの選択。"),
  "rest-api-template": S("rest-explorer", "Endpoint template menu", "Endpoint templates for common calls.", "エンドポイントテンプレートメニュー", "よく使う呼び出し向けのテンプレート。"),
  "rest-api-sample-body": S("rest-explorer", "REST sample body", "A generated sample request body.", "REST のサンプルボディ", "生成されたサンプルリクエストボディ。"),
  "rest-api-response": S("rest-explorer", "REST JSON response", "Inspecting a JSON response.", "REST の JSON レスポンス", "JSON レスポンスの確認。"),

  // ── Data Export ──
  "data-export": S("data-export", "Data Export source & query", "Choosing the export source and query.", "データエクスポートのソースとクエリ", "エクスポート元とクエリの選択。"),
  "data-export-results": S("data-export", "Export results grid", "Export results ready to download.", "エクスポート結果グリッド", "ダウンロード可能なエクスポート結果。"),
  "data-export-json": S("data-export", "Export JSON view", "The raw JSON view of the result.", "エクスポートの JSON 表示", "結果の生 JSON 表示。"),
  "data-export-csv-grid": S("data-export", "Export CSV grid", "The result as a CSV grid.", "エクスポートの CSV グリッド", "CSV グリッドとしての結果。"),
  "data-export-sosl": S("data-export", "SOSL export source", "Exporting with a SOSL search.", "SOSL エクスポートソース", "SOSL 検索でのエクスポート。"),
  "data-export-report": S("data-export", "Report export source", "Exporting a Salesforce report.", "レポートエクスポートソース", "Salesforce レポートのエクスポート。"),

  // ── Run Apex ──
  "run-apex": S("run-apex", "Run Apex editor", "The anonymous Apex editor.", "Apex 実行エディター", "匿名 Apex エディター。"),
  "run-apex-output": S("run-apex", "Apex execution output", "Compile result and debug output.", "Apex 実行出力", "コンパイル結果とデバッグ出力。"),

  // ── Monitoring ──
  "limits": S("monitoring", "Org limits", "Org limits with live usage bars.", "組織の制限値", "使用量バー付きの組織制限値。"),
  "setup-audit-trail": S("monitoring", "Setup audit trail", "Recent setup changes.", "設定変更履歴", "最近の設定変更。"),
  "audit-filter": S("monitoring", "Audit trail filter", "Filtering the setup audit trail.", "設定変更履歴のフィルター", "設定変更履歴の絞り込み。"),
  "login-history": S("monitoring", "Login history", "Recent login attempts.", "ログイン履歴", "最近のログイン試行。"),
  "event-logs": S("monitoring", "Event log files", "Available event log files.", "イベントログファイル", "利用可能なイベントログファイル。"),
  "api-usage": S("monitoring", "Latest API usage", "Latest API usage against limits.", "最新の API 使用状況", "制限に対する最新の API 使用状況。"),

  // ── Built-in manual ──
  "builtin-manual": S("builtin-manual", "Built-in manual overview", "The built-in manual.", "内蔵マニュアルの概要", "内蔵マニュアル。"),
  "builtin-manual-apps": S("builtin-manual", "Built-in manual Apps chapter", "The Apps chapter of the built-in manual.", "内蔵マニュアルのアプリの章", "内蔵マニュアルのアプリの章。"),
  "builtin-manual-versions": S("builtin-manual", "Built-in manual release notes", "Per-version release notes inside the extension.", "内蔵マニュアルのリリースノート", "拡張機能内のバージョン別リリースノート。")
};

export const RELEASE_NOTES = {
  en: {
    title: "12. Release notes",
    intro: "Recent releases. No release has added new Chrome permissions, host permissions, remote code, telemetry, ads, or third-party data services. The full per-version history ships inside the extension's built-in manual.",
    versions: [
      ["0.6.2 (2026-07-15)", [
        "Document Folders: folder selection is recursive and atomic across lazily loaded subtrees, with folder-preserving ZIP paths for duplicate document occurrences.",
        "Document Folders: added 500-file and 250 MB ZIP limits, cancelable downloads, and one-time fetching of shared document content.",
        "Object Schema: rebuilt the fields experience as a spreadsheet with native header filters, global search highlights, CSV export, and full screen; Packaged Objects defaults to none and is remembered per org.",
        "Object Schema became a popup Apps-only page; the compact 40px app-session header now also applies to Metadata Admin and Org Review."
      ]],
      ["0.6.1 (2026-07-14)", [
        "Rebuilt Document Folders downloads around tree checkbox selection with a Selected Items panel.",
        "Added Object Schema to the popup Apps tab with suggestions, packaged-namespace controls, map search, zoom, and layouts.",
        "Removed Org Review from the tools-page navigation.",
        "Added THIRD-PARTY-NOTICES.txt for the bundled spreadsheet engine."
      ]],
      ["0.6.0 (2026-07-11)", [
        "Added the read-only Org Review covering health, limits, setup changes, and login failures.",
        "Added a per-org read-only lock and consistent risk confirmation for Apex, data mutation, and metadata deployment.",
        "Fixed Force Sheet workspace files sharing the last active grid; values and formulas now stay isolated per file and org."
      ]]
    ]
  },
  jp: {
    title: "12. リリースノート",
    intro: "最近のリリースの概要です。いずれのリリースでも、新しい Chrome 権限・ホスト権限・リモートコード・テレメトリー・広告・サードパーティのデータサービスは追加されていません。完全なバージョン別履歴は内蔵マニュアルに同梱されています。",
    versions: [
      ["0.6.2（2026-07-15）", [
        "ドキュメントフォルダー：フォルダー選択が遅延読み込みサブツリーを含めて再帰的・アトミックになり、重複ドキュメントもフォルダーパスを保持した ZIP パスで扱われます。",
        "ドキュメントフォルダー：500 ファイル・250 MB の ZIP 上限、キャンセル可能なダウンロード、共有ドキュメント内容の一括取得を追加。",
        "Object Schema：項目一覧をスプレッドシート化。ヘッダーフィルター、全体検索のハイライト、CSV エクスポート、全画面に対応。Packaged Objects は既定で「なし」、組織ごとに記憶。",
        "Object Schema はポップアップのアプリタブ専用に。40px のコンパクトヘッダーを Metadata Admin と Org Review にも適用。"
      ]],
      ["0.6.1（2026-07-14）", [
        "ドキュメントフォルダーのダウンロードをツリーのチェックボックス選択と選択済み項目パネル中心に再構築。",
        "ポップアップのアプリタブに Object Schema を追加（サジェスト、パッケージ名前空間、マップ検索、ズーム、レイアウト）。",
        "ツールページのナビゲーションから Org Review を削除。",
        "同梱スプレッドシートエンジンの THIRD-PARTY-NOTICES.txt を追加。"
      ]],
      ["0.6.0（2026-07-11）", [
        "健全性・制限値・設定変更・ログイン失敗を対象とする読み取り専用の Org Review を追加。",
        "組織ごとの読み取り専用ロックと、Apex・データ変更・メタデータデプロイの一貫したリスク確認を追加。",
        "Force Sheet のワークスペースファイルが最後のグリッドを共有する問題を修正。値と数式はファイル・組織ごとに分離。"
      ]]
    ]
  }
};
