(function () {
  "use strict";

  var KEY = "dinalab-lang";
  var translations = {
    "Back to home": "ホームに戻る",
    "Home": "ホーム",
    "Current release: 0.6.2": "現在のリリース: 0.6.2",
    "Admin Toolkit for Salesforce is an independent Chrome right-side panel suite compatible with Salesforce. It uses the Salesforce session you are already signed in with to provide metadata administration, SOQL workspaces, object schema exploration, API tools, Apex execution, exports, and monitoring without a developer-operated metadata service.": "Admin Toolkit for Salesforce は Salesforce と互換性のある独立した Chrome 右サイドパネルスイートです。現在ログイン中の Salesforce セッションを利用し、開発者運営のメタデータサービスを介さずに、メタデータ管理、SOQL ワークスペース、オブジェクトスキーマ探索、API ツール、Apex 実行、エクスポート、モニタリングを提供します。",
    "This extension is not affiliated with, endorsed by, or sponsored by Salesforce.": "この拡張機能は Salesforce と提携しておらず、Salesforce による承認または後援を受けていません。",
    "Salesforce is a trademark of Salesforce, Inc. Admin Toolkit for Salesforce is not affiliated with, endorsed by, or sponsored by Salesforce.": "Salesforce は Salesforce, Inc. の商標です。Admin Toolkit for Salesforce は Salesforce と提携しておらず、Salesforce による承認または後援を受けていません。",
    "Salesforce is a trademark of Salesforce, Inc. DinaLab Agent Assistant is not affiliated with, endorsed by, or sponsored by Salesforce. The OpenAI name identifies the configured AI service; no affiliation with or endorsement by OpenAI is implied.": "Salesforce は Salesforce, Inc. の商標です。DinaLab Agent Assistant は Salesforce と提携しておらず、Salesforce による承認または後援を受けていません。OpenAI の名称は設定された AI サービスを示すために使用しており、OpenAI との提携または OpenAI による承認を意味するものではありません。",
    "Install from Chrome Web Store": "Chrome ウェブストアから入手",
    "User Manual": "ユーザーマニュアル",
    "One Toolkit, Focused Workspaces": "1つのツールキット、目的別ワークスペース",
    "The popup Apps tab is the main entry point for the toolkit's Salesforce workspaces.": "ポップアップの「アプリ」タブが、ツールキットの Salesforce ワークスペースへのメイン入口です。",
    "Browse source-style metadata, search the loaded workspace, edit files locally, track changes, build package.xml selections, and deploy or discard changes.": "ソース形式のメタデータを参照し、読み込んだワークスペースの検索、ローカル編集、変更追跡、package.xml 選択の作成、変更のデプロイまたは破棄を行えます。",
    "Run SOQL queries and Salesforce reports or import CSV/XLSX data in a multi-tab spreadsheet grid with streaming pagination and Salesforce CRUD workflows.": "複数タブのスプレッドシートグリッドで、ストリーミングページングを使った SOQL クエリや Salesforce レポートの実行、CSV/XLSX データのインポート、Salesforce CRUD 操作を行えます。",
    "Run a read-only assessment with evidence, scorecards, security review, remediation guidance, and PDF, Markdown, summary JSON, or evidence JSON exports.": "証跡、スコアカード、セキュリティレビュー、改善ガイダンスを含む読み取り専用評価を実行し、PDF、Markdown、サマリー JSON、証跡 JSON として出力できます。",
    "Explore parent and child relationships in an interactive map with packaged-namespace scope, search, zoom, layout controls, relationship details, and a spreadsheet Fields view with filters, search highlights, CSV export, and full screen.": "パッケージ名前空間の範囲指定、検索、ズーム、レイアウト操作、関係の詳細を備えた対話型マップで親子関係を探索し、フィルター、検索ハイライト、CSV 出力、全画面表示を備えたスプレッドシート形式の項目ビューを利用できます。",
    "Administrator and Developer Tools": "管理者・開発者向けツール",
    "Search Salesforce metadata by label, name, API name, object, developer name, and matching snippets.": "ラベル、名前、API 参照名、オブジェクト、開発者名、一致するスニペットから Salesforce メタデータを検索します。",
    "Open supported metadata records directly in Salesforce Setup.": "対応するメタデータレコードを Salesforce 設定で直接開きます。",
    "Send user-initiated Salesforce REST API requests and inspect JSON responses.": "ユーザー操作で Salesforce REST API リクエストを送信し、JSON レスポンスを確認します。",
    "Execute anonymous Apex and review compile, execution, and debug output.": "匿名 Apex を実行し、コンパイル、実行、デバッグ出力を確認します。",
    "Export SOQL, SOSL, GraphQL, and report results as available CSV or JSON output.": "SOQL、SOSL、GraphQL、レポート結果を、利用可能な CSV または JSON 形式で出力します。",
    "Browse Salesforce document folders, preview supported files, and download selected folders and files as ZIP.": "Salesforce のドキュメントフォルダーを参照し、対応ファイルをプレビューして、選択したフォルダーとファイルを ZIP でダウンロードします。",
    "Inspect setup audit trail, API limits, login history, event log files, org summaries, and user summaries.": "設定変更履歴、API 制限、ログイン履歴、イベントログファイル、組織サマリー、ユーザーサマリーを確認します。",
    "Use the built-in English and Japanese manual for end-user guidance.": "組み込みの英語・日本語マニュアルで操作方法を確認できます。",
    "How It Works": "仕組み",
    "The extension runs in Chrome and uses the active Salesforce session.": "拡張機能は Chrome で動作し、現在の Salesforce セッションを使用します。",
    "Salesforce user and organization identity fields are used to identify the active session and org.": "Salesforce のユーザーおよび組織識別情報は、現在のセッションと組織の特定に使用されます。",
    "Salesforce metadata, records, user identity data, authentication information, and user-entered requests are sent only to the Salesforce org selected by the user—not to developer-operated servers or non-Salesforce third-party services.": "Salesforce のメタデータ、レコード、ユーザー識別情報、認証情報、ユーザーが入力したリクエストは、ユーザーが選択した Salesforce 組織にのみ送信され、開発者運営のサーバーや Salesforce 以外の第三者サービスには送信されません。",
    "Workspace preferences, search data, pending edits, saved Force Sheet files, recent/favorite tools, and sanitized operation history may be stored locally in Chrome browser storage on the user's device.": "ワークスペース設定、検索データ、保留中の編集、保存済み Force Sheet ファイル、最近使用したツール・お気に入り、サニタイズ済みの操作履歴は、ユーザー端末の Chrome ストレージにローカル保存される場合があります。",
    "Operation history is limited to the most recent 100 entries and excludes session tokens and authorization headers. Feature-specific saved data can be cleared where the extension offers that control, and removing the extension clears its Chrome-managed local storage.": "操作履歴は直近100件に制限され、セッショントークンと認証ヘッダーは含まれません。機能ごとの保存データは対応する操作から削除でき、拡張機能を削除すると Chrome が管理するローカルストレージも消去されます。",
    "The extension does not include analytics, telemetry, advertising, affiliate links, or remotely hosted JavaScript or WebAssembly.": "この拡張機能には、分析、テレメトリ、広告、アフィリエイトリンク、外部ホストの JavaScript または WebAssembly は含まれません。",
    "Extension JavaScript, HTML, CSS, and third-party spreadsheet code are packaged with the extension. Salesforce responses are treated as data and are not executed as code.": "拡張機能の JavaScript、HTML、CSS、および第三者製スプレッドシートコードは拡張機能に同梱されています。Salesforce のレスポンスはデータとして扱われ、コードとして実行されません。",
    "Read the full": "全文を読む:",
    "Read the": "次を確認:",
    "Privacy Policy": "プライバシーポリシー",
    "Permissions": "権限",
    "cookies: reads Salesforce session cookies so the toolkit can connect to the org where the user is already signed in.": "cookies: Salesforce セッション Cookie を読み取り、ユーザーがログイン中の組織へツールキットを接続します。",
    ": reads Salesforce session cookies so the toolkit can connect to the org where the user is already signed in.": ": Salesforce セッション Cookie を読み取り、ユーザーがログイン中の組織へツールキットを接続します。",
    "sidePanel: opens the toolkit in Chrome's side panel.": "sidePanel: Chrome のサイドパネルでツールキットを開きます。",
    ": opens the toolkit in Chrome's side panel.": ": Chrome のサイドパネルでツールキットを開きます。",
    "storage: saves local workspace preferences, data, UI settings, and pending edits.": "storage: ローカルのワークスペース設定、データ、UI 設定、保留中の編集を保存します。",
    ": saves local workspace preferences, data, UI settings, and pending edits.": ": ローカルのワークスペース設定、データ、UI 設定、保留中の編集を保存します。",
    "Salesforce host access: permits requests to Salesforce org, Setup, Experience Cloud, Visualforce, and Salesforce Sites domains used by the active org.": "Salesforce ホストアクセス: 現在の組織が使用する Salesforce 組織、設定、Experience Cloud、Visualforce、Salesforce Sites の各ドメインへのリクエストを許可します。",
    "Install": "インストール",
    "Admin Toolkit for Salesforce from the Chrome Web Store": "Chrome ウェブストアの Admin Toolkit for Salesforce",
    "For local development:": "ローカル開発の場合:",
    ". For local development:": "。ローカル開発の場合:",
    "Open chrome://extensions.": "chrome://extensions を開きます。",
    "Enable Developer mode.": "デベロッパーモードを有効にします。",
    "Choose Load unpacked.": "「パッケージ化されていない拡張機能を読み込む」を選びます。",
    "Select the extension source folder.": "拡張機能のソースフォルダーを選択します。",
    "Open a Salesforce tab and launch the extension.": "Salesforce のタブを開き、拡張機能を起動します。",
    "Current Release": "現在のリリース",
    "Version 0.6.2 makes Document Folders selection recursive and reliable across lazily loaded subtrees, keeps duplicate document occurrences independent with folder-preserving ZIP paths, and adds ZIP file and size limits with cancelable downloads; rebuilds the Object Schema fields experience as a spreadsheet view with native header filters, global search highlights, CSV export, and full screen, scoped by per-org Packaged Objects settings; and applies the shared compact app header to Metadata Admin for Salesforce and Org Review. No new permissions were added.": "バージョン 0.6.2 では、Document Folders の選択を遅延読み込みされるサブツリー全体で再帰的かつ確実にし、重複するドキュメントをフォルダー構造を保つ ZIP パスで個別に扱い、キャンセル可能なダウンロードに ZIP のファイル数・サイズ制限を追加しました。Object Schema の項目画面を、ヘッダーフィルター、全体検索ハイライト、CSV 出力、全画面表示を備えたスプレッドシートビューとして再構築し、組織ごとの Packaged Objects 設定に対応しました。また、Metadata Admin for Salesforce と Org Review に共通のコンパクトなアプリヘッダーを適用しました。新しい権限は追加されていません。",
    "Support": "サポート",
    "user manual with screenshots": "スクリーンショット付きユーザーマニュアル",
    "Report a problem or ask a product question through the": "不具合の報告や製品に関する質問は、次のページからお送りください:",
    "DinaLab support page": "DinaLab サポートページ",
    "DinaLab Agent Assistant is an independent Chrome extension in development for Salesforce administrators and developers. It adds a side-panel assistant that can use selected Salesforce org context and route chat requests through a Cloud Run function backend.": "DinaLab Agent Assistant は、Salesforce の管理者と開発者向けに開発中の独立した Chrome 拡張機能です。選択した Salesforce 組織コンテキストを利用し、Cloud Run function バックエンドを経由してチャットリクエストを処理するサイドパネルアシスタントを追加します。",
    "What You Can Do": "できること",
    "Open a Chrome side panel on Salesforce pages.": "Salesforce ページで Chrome サイドパネルを開きます。",
    "Detect the active Salesforce tab title and URL.": "現在の Salesforce タブのタイトルと URL を検出します。",
    "Read org and user summary information from the signed-in Salesforce org.": "ログイン中の Salesforce 組織から組織とユーザーのサマリー情報を読み取ります。",
    "Chat with an assistant backed by a Cloud Run function.": "Cloud Run function をバックエンドに持つアシスタントとチャットします。",
    "Send selected Salesforce context with chat requests.": "選択した Salesforce コンテキストをチャットリクエストとともに送信します。",
    "Keep the OpenAI API key out of the browser by storing it in the Cloud Run function environment.": "OpenAI API キーを Cloud Run function 環境に保存し、ブラウザー内に保持しません。",
    "Architecture": "アーキテクチャ",
    "DinaLab Agent Assistant separates the browser extension from the OpenAI transport layer.": "DinaLab Agent Assistant はブラウザー拡張機能と OpenAI 通信レイヤーを分離しています。",
    "The extension reads the active Salesforce org session in the browser.": "拡張機能がブラウザー内の現在の Salesforce 組織セッションを読み取ります。",
    "The side-panel chat sends chat history, selected Salesforce context, current tab context, and extension tool results to the configured Cloud Run function endpoint.": "サイドパネルのチャットは、チャット履歴、選択した Salesforce コンテキスト、現在のタブ情報、拡張機能ツールの結果を、設定済みの Cloud Run function エンドポイントへ送信します。",
    "Salesforce session IDs and authentication credentials are not included in AI chat requests. Salesforce API tools run inside the extension.": "Salesforce セッション ID と認証情報は AI チャットリクエストに含まれません。Salesforce API ツールは拡張機能内で実行されます。",
    "The Cloud Run function calls OpenAI with its function-level OPENAI_API_KEY.": "Cloud Run function が関数レベルの OPENAI_API_KEY を使って OpenAI を呼び出します。",
    "The Cloud Run function returns the assistant's response to the extension.": "Cloud Run function がアシスタントの応答を拡張機能へ返します。",
    "Configuration": "設定",
    "Set the Cloud Run function URL in the extension's api.js:": "拡張機能の api.js に Cloud Run function の URL を設定します:",
    "Then load the extension locally:": "次に拡張機能をローカルで読み込みます:",
    "Select the DinaLab Agent Assistant extension folder.": "DinaLab Agent Assistant の拡張機能フォルダーを選択します。",
    "Cloud Run Function": "Cloud Run Function",
    "Deploy the Cloud Run function broker from:": "Cloud Run function ブローカーを次の場所からデプロイします:",
    "Required environment variable:": "必須の環境変数:",
    "Optional runtime settings:": "任意の実行時設定:",
    "Privacy": "プライバシー",
    "The extension stores UI settings, chat history, previous response IDs, and retrieved Salesforce metadata locally in the browser. AI chat requests send chat messages, selected Salesforce context, current tab context, and extension tool results to the configured Cloud Run function endpoint, but do not include Salesforce session IDs or authentication credentials.": "拡張機能は、UI 設定、チャット履歴、以前のレスポンス ID、取得した Salesforce メタデータをブラウザー内にローカル保存します。AI チャットリクエストは、チャットメッセージ、選択した Salesforce コンテキスト、現在のタブ情報、拡張機能ツールの結果を設定済みの Cloud Run function エンドポイントへ送信しますが、Salesforce セッション ID や認証情報は含みません。",
    "The extension does not store an OpenAI API key in the browser and does not call OpenAI directly from the extension.": "拡張機能は OpenAI API キーをブラウザーに保存せず、拡張機能から OpenAI を直接呼び出しません。",
    "Read the full policy:": "ポリシー全文:",
    "Status": "ステータス",
    "DinaLab Agent Assistant is currently in development and is not publicly released.": "DinaLab Agent Assistant は現在開発中で、一般公開されていません。",
    "Common Tools": "共通ツール",
    "Developer and admin workbench": "開発者・管理者向けワークベンチ",
    "Search tools": "ツールを検索",
    "JSON, CSV, diff, date": "JSON、CSV、差分、日付",
    "Examples": "例",
    "Data": "データ",
    "Code": "コード",
    "Admin": "管理",
    "Text": "テキスト",
    "Utility": "ユーティリティ",
    "JSON Formatter and Validator": "JSON フォーマッター・バリデーター",
    "Format, validate, paths, types": "整形、検証、パス、型",
    "Format, minify, sort keys, inspect paths, and generate TypeScript interfaces.": "整形、圧縮、キーの並べ替え、パスの確認、TypeScript インターフェースの生成を行います。",
    "Code Diff Viewer": "コード差分ビューアー",
    "Side-by-side and patch output": "横並び表示とパッチ出力",
    "Compare two text inputs, switch diff views, ignore whitespace, and copy patch output.": "2つのテキストを比較し、差分表示の切り替え、空白の無視、パッチ出力のコピーを行います。",
    "HTML Playground": "HTML プレイグラウンド",
    "HTML, CSS, JS preview": "HTML、CSS、JS プレビュー",
    "Edit HTML, CSS, and JavaScript with sandboxed preview, console output, and HTML export.": "サンドボックスプレビュー、コンソール出力、HTML エクスポートを使って HTML、CSS、JavaScript を編集します。",
    "JavaScript Playground": "JavaScript プレイグラウンド",
    "Run snippets safely": "スニペットを安全に実行",
    "Run browser JavaScript snippets in a sandbox and capture logs, errors, result, and timing.": "ブラウザー JavaScript スニペットをサンドボックスで実行し、ログ、エラー、結果、実行時間を取得します。",
    "TypeScript Playground": "TypeScript プレイグラウンド",
    "Compile and run JS output": "コンパイルして JS 出力を実行",
    "Compile common TypeScript snippets to JavaScript, show lightweight diagnostics, and run the output.": "一般的な TypeScript スニペットを JavaScript にコンパイルし、簡易診断を表示して出力を実行します。",
    "Regex Tester": "正規表現テスター",
    "Matches, groups, replacement": "一致、グループ、置換",
    "Test JavaScript regex patterns, inspect capture groups, and preview replacements.": "JavaScript の正規表現パターンをテストし、キャプチャグループを確認して置換結果をプレビューします。",
    "CSV Cleaner and Validator": "CSV クリーナー・バリデーター",
    "Clean rows and export JSON": "行を整えて JSON 出力",
    "Parse CSV, detect row/header issues, trim values, preview rows, and export cleaned data.": "CSV を解析し、行やヘッダーの問題を検出し、値をトリムして行をプレビューし、整形済みデータを出力します。",
    "Bulk Text Transformer": "一括テキスト変換",
    "Trim, case, sort, dedupe": "トリム、大文字小文字、並べ替え、重複除去",
    "Transform line-based text with trimming, case conversion, replacement, sorting, dedupe, and wrappers.": "行単位のテキストに、トリム、大文字小文字変換、置換、並べ替え、重複除去、前後への文字追加を適用します。",
    "Date and Time Converter": "日時変換",
    "ISO, Unix, timezones": "ISO、Unix、タイムゾーン",
    "Convert ISO strings, Unix timestamps, and common date strings across useful timezones.": "ISO 文字列、Unix タイムスタンプ、一般的な日付文字列を、よく使うタイムゾーン間で変換します。",
    "Checklist Builder": "チェックリスト作成",
    "Markdown and JSON export": "Markdown・JSON 出力",
    "Create reusable checklists with progress state, Markdown copy, and JSON export.": "進捗状態を持つ再利用可能なチェックリストを作成し、Markdown のコピーと JSON 出力を行います。",
    "Input": "入力",
    "Output": "出力",
    "Format": "整形",
    "Minify": "圧縮",
    "Sort Keys": "キーを並べ替え",
    "Copy": "コピー",
    "Download": "ダウンロード",
    "Paths": "パス",
    "Path": "パス",
    "Value": "値",
    "Search paths": "パスを検索",
    "JSON is valid.": "JSON は有効です。",
    "JSON validation failed.": "JSON の検証に失敗しました。",
    "TypeScript Interface": "TypeScript インターフェース",
    "Compare": "比較",
    "Original": "元の内容",
    "Changed": "変更後",
    "Ignore whitespace": "空白を無視",
    "Side by side": "横並び",
    "Inline diff": "インライン差分",
    "Unified diff": "統合差分",
    "Copy Patch": "パッチをコピー",
    "Download Patch": "パッチをダウンロード",
    "Preview": "プレビュー",
    "Preview refreshed.": "プレビューを更新しました。",
    "Console": "コンソール",
    "Run": "実行",
    "Reset": "リセット",
    "Download HTML": "HTML をダウンロード",
    "Compile": "コンパイル",
    "TypeScript compiled to JavaScript.": "TypeScript を JavaScript にコンパイルしました。",
    "No lightweight diagnostics.": "簡易診断では問題は見つかりませんでした。",
    "Compiled JavaScript": "コンパイル済み JavaScript",
    "Diagnostics": "診断",
    "Pattern": "パターン",
    "Flags": "フラグ",
    "Sample Text": "サンプルテキスト",
    "Replacement": "置換内容",
    "Test": "テスト",
    "Matches": "一致結果",
    "Replacement Preview": "置換プレビュー",
    "CSV Input": "CSV 入力",
    "Clean CSV": "CSV を整える",
    "Issues": "問題",
    "Trim values": "値をトリム",
    "First row is header": "先頭行をヘッダーとして使用",
    "Delimiter": "区切り文字",
    "Clean": "整形",
    "Converted Table": "変換結果",
    "Transform": "変換",
    "Trim": "トリム",
    "Lowercase": "小文字",
    "Uppercase": "大文字",
    "Title Case": "タイトルケース",
    "Sort": "並べ替え",
    "Dedupe": "重複除去",
    "Remove empty lines": "空行を削除",
    "No case change": "大文字小文字を変更しない",
    "Join with": "結合文字",
    "Split by": "分割文字",
    "Prefix": "接頭辞",
    "Suffix": "接尾辞",
    "Export Text": "テキストを出力",
    "Date and Time Converter": "日時変換",
    "Convert": "変換",
    "Timezone": "タイムゾーン",
    "Dates and timestamps": "日付とタイムスタンプ",
    "Converted Table": "変換結果",
    "Now": "現在時刻",
    "Checklist": "チェックリスト",
    "Lines or Markdown checklist": "行または Markdown チェックリスト",
    "Load Lines": "行を読み込む",
    "New item": "新しい項目",
    "Download MD": "MD をダウンロード",
    "Download JSON": "JSON をダウンロード",
    "Add": "追加",
    "Remove": "削除",
    "Clear Done": "完了項目を削除",
    "Progress": "進捗",
    "Nothing to copy.": "コピーする内容がありません。",
    "Copied output.": "出力をコピーしました。",
    "No paths found.": "パスが見つかりません。",
    "No matches.": "一致する項目はありません。",
    "No issues found.": "問題は見つかりませんでした。",
    "No rows.": "行がありません。",
    "Invalid date": "無効な日付"
  };

  var titleTranslations = {
    "Admin Toolkit for Salesforce | Compatible with Salesforce": "Admin Toolkit for Salesforce | Salesforce 対応",
    "DinaLab Agent Assistant | Compatible with Salesforce": "DinaLab Agent Assistant | Salesforce 対応",
    "Common Tools | DinaLab": "共通ツール | DinaLab"
  };
  var originals = new WeakMap();
  var attributeOriginals = new WeakMap();
  var currentLang = "en";
  var observer;

  function translated(value) {
    if (translations[value]) return translations[value];
    var match = value.match(/^Downloaded (.+)\.$/);
    if (match) return match[1] + " をダウンロードしました。";
    match = value.match(/^Copy failed: (.+)$/);
    if (match) return "コピーに失敗しました: " + match[1];
    return value;
  }

  function updateText(node) {
    if (!originals.has(node)) originals.set(node, node.nodeValue);
    var original = originals.get(node);
    if (currentLang === "en") {
      if (node.nodeValue !== original) node.nodeValue = original;
      return;
    }
    var compact = original.trim();
    var result = translated(compact);
    if (result === compact) return;
    var leading = original.match(/^\s*/)[0];
    var trailing = original.match(/\s*$/)[0];
    node.nodeValue = leading + result + trailing;
  }

  function updateAttributes(element) {
    var names = ["placeholder", "aria-label", "title"];
    var values = attributeOriginals.get(element);
    if (!values) {
      values = {};
      names.forEach(function (name) {
        if (element.hasAttribute(name)) values[name] = element.getAttribute(name);
      });
      attributeOriginals.set(element, values);
    }
    Object.keys(values).forEach(function (name) {
      element.setAttribute(name, currentLang === "ja" ? translated(values[name]) : values[name]);
    });
  }

  function translateTree(root) {
    if (root.nodeType === Node.TEXT_NODE) {
      updateText(root);
      return;
    }
    if (root.nodeType !== Node.ELEMENT_NODE && root.nodeType !== Node.DOCUMENT_NODE && root.nodeType !== Node.DOCUMENT_FRAGMENT_NODE) return;
    if (root.nodeType === Node.ELEMENT_NODE) updateAttributes(root);
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
    var node;
    while ((node = walker.nextNode())) {
      if (node.nodeType === Node.TEXT_NODE) updateText(node);
      else updateAttributes(node);
    }
  }

  function apply(lang, persist) {
    currentLang = lang === "ja" ? "ja" : "en";
    document.documentElement.lang = currentLang;
    translateTree(document.body);
    var englishTitle = document.documentElement.dataset.englishTitle || document.title;
    document.documentElement.dataset.englishTitle = englishTitle;
    document.title = currentLang === "ja" ? (titleTranslations[englishTitle] || englishTitle) : englishTitle;
    var label = document.querySelector("#siteLangToggle .lang-label");
    var toggle = document.getElementById("siteLangToggle");
    if (label) label.textContent = currentLang === "en" ? "日本語" : "English";
    if (toggle) toggle.setAttribute("aria-label", currentLang === "en" ? "日本語で表示" : "View in English");
    if (persist) {
      try { localStorage.setItem(KEY, currentLang); } catch (error) {}
    }
  }

  function start() {
    var stored = "en";
    try { stored = localStorage.getItem(KEY) === "ja" ? "ja" : "en"; } catch (error) {}
    apply(stored, false);
    var toggle = document.getElementById("siteLangToggle");
    if (toggle) toggle.addEventListener("click", function () { apply(currentLang === "en" ? "ja" : "en", true); });
    observer = new MutationObserver(function (records) {
      records.forEach(function (record) {
        record.addedNodes.forEach(function (node) { translateTree(node); });
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
