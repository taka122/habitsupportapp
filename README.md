# 全身筋トレハビット

Next.js 14 / Tailwind CSS / Prisma / MongoDB Atlas を使ったシンプルな筋トレ習慣化アプリです。  
単一の習慣「全身筋トレ10分」を 1 タップで記録し、連続達成日数や過去 7 日の履歴を確認できます。

## 技術スタック
- Next.js 14 (App Router, TypeScript)
- Tailwind CSS
- Prisma (MongoDB)
- MongoDB Atlas or MongoDB Community Server
- Vercel デプロイ対応
- Docker (dev server + MongoDB)

## 主要機能
- **Home**: 今日の習慣カード、チェックボタン、連続達成日数/EXP/今日の達成状況を表示。達成後はカードが青く光ります。
- **History**: 過去 7 日間の ✔ / ✖ ログ、達成率、現在のストリークを確認できます。
- **API**
  - `GET /api/today`: 今日の Record を取得。存在しない場合は自動作成。
  - `POST /api/complete`: Record を達成済みにし、ストリークと EXP を更新。
  - `GET /api/history`: 過去 7 日間の Record を返却。

## 環境変数
`.env` には開発用にローカル（または Docker コンテナ）向けの接続 URL を設定済みです。MongoDB Atlas を使う場合は値を書き換えてください。Prisma で MongoDB を扱う場合は **Replica Set が必須** なので、ローカルで動かすときも `rs0` などのレプリカセットを初期化してください。

```bash
# ローカル or docker compose の MongoDB (Replica Set: rs0)
DATABASE_URL="mongodb://localhost:27017/habit-support?replicaSet=rs0"

# Atlas を使う場合の例
# DATABASE_URL="mongodb+srv://USER:PASSWORD@cluster0.example.mongodb.net/habit-support?retryWrites=true&w=majority"
```

## セットアップ
```bash
npm install
npx prisma db push   # MongoDB Atlas に schema を反映
npm run dev
```

ブラウザで `http://localhost:3000` にアクセスしてください。

### Lint / Prisma
```bash
npm run lint
npx prisma studio
```

## Docker 開発
Docker で Next.js と MongoDB を同時に起動できます。

```bash
docker compose up --build
```

- アプリ: `http://localhost:3100`（`PORT=4000 docker compose up` などで変更可能）
- MongoDB: Replica Set `rs0` として自動初期化されます（`rs.initiate(...)` 済み）
- 初回起動時に `npx prisma db push` が自動実行され、スキーマが作成されます。
- コードはホストと共有しているため、ホットリロードで反映されます。

停止する場合:
```bash
docker compose down
```

### ローカルに直接 MongoDB を立てたい場合
Homebrew 版などを使う場合も Prisma の仕様で Replica Set が必要です。

```bash
# 例: ローカルで rs0 を立ち上げる
mongod --dbpath /path/to/db --replSet rs0

# 別ターミナルで
mongosh --eval 'rs.initiate({_id:"rs0",members:[{_id:0,host:"localhost:27017"}]})'
```

その後 `.env` の `DATABASE_URL` を `mongodb://localhost:27017/habit-support?replicaSet=rs0` にしたまま `npx prisma db push` を実行してください。

## Vercel デプロイ
1. GitHub などにリポジトリをプッシュ。
2. Vercel ダッシュボードで「Add New Project」→リポジトリを選択。
3. Build コマンド `npm run build` / Output `.next` を指定（デフォルトのままでOK）。
4. **Environment Variables** に `DATABASE_URL`（Atlas 接続文字列）を登録。
5. デプロイ後、`npm run prisma db push` 相当が必要なら Atlas に向けてローカルで実行してください。

## よくあるトラブル
- **`npx prisma db push` で DNS エラー**: Atlas の接続 URL がダミーのままになっていないか確認してください。`cluster0.example.mongodb.net` を実際のクラスター名に置き換えます。
- **`Prisma needs to perform transactions... replica set` エラー**: MongoDB が Replica Set として起動していません。`docker compose up` で用意した `rs0` を使うか、ローカル `mongod --replSet rs0` を実行してから `rs.initiate(...)` してください。
- **Docker で MongoDB に接続できない**: `docker compose logs mongo` で起動状態を確認し、アプリ側の `DATABASE_URL` が `mongodb://mongo:27017/...replicaSet=rs0` になっているかチェックしてください。

## ライセンス
このリポジトリは社内利用を想定しています。必要に応じて変更してください。
