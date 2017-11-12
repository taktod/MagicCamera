# magicCamera with webgl

magicCameraのfilter効果をwebglにしてみました。

# ライセンス

元のコード上にApache Licenseと書いてあるのがいくつかあるので、追加コードもApache Licenseとします。
リソースについては、元のMagicCameraにあるものをコピーしただけですので、元のライセンスに準ずるとします。

# 使い方

```
$ git clone git@github.com:taktod/MagicCamera.git
$ cd MagicCamera/Project_node
$ npm install
$ npm run webpack
$ http-server
```

あとはhttp://localhost:8080/src/html/でアクセスしてカメラが利用可能な状況にすれば、エフェクトに対応した画像を確認することができます。

src/app.tsのコメントアウトしているコードを有効にすると該当のフィルターが表示されます。
