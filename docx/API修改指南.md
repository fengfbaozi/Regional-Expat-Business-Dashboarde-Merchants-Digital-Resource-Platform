# API Key 修改指南

> 📍 **v2.1 演示加密版**：项目前端不再直接读取明文 JSON，而是通过 **AES 密文锁** 解密后注入。
>
> 更新密钥的标准流程变成了 **4 步**：
>
> 1. 编辑 `date/volc-ark-apis.json` 填入真实 API Key / AK
> 2. `$env:ARK_DEMO_PASS="你的密码"; node encrypt_tool.js` 生成新密文
> 3. 将控制台输出的 Base64 粘贴到 `js/ark-api-config.js` 的 `ENCRYPTED_CONFIG_STRING`
> 4. 重新打开网页，在 prompt 输入你自己的密码即可

---

## 一、改什么？一张表看懂

| 字段名 | 用途 | 从哪获取 | 留空会怎样 |
|--------|------|----------|------------|
| `dataApiKey` | 侨情内容生成、文化资料、翻译回退（核心） | 火山方舟控制台 → API Key 管理 | ❌ 侨情动态生成失败 |
| `translationApiKey` | 翻译（可单独统计） | 同上，或者直接留空 | ✅ 自动用 `dataApiKey` |
| `qiaozhuangApiKey` | 侨壮壮对话助手（豆包智能体） | 豆包 / 火山方舟控制台 | ❌ 侨壮壮无法回复 |
| `baiduMapAk` | 地图显示 | 百度地图开放平台（lbsyun.baidu.com） | ❌ 地图页不显示地图 |
| `baiduMapStyleId` | 地图深色主题样式 | 百度地图控制台「个性化地图」→ 样式管理 | ⚠️ 地图用默认浅色样式，不够美观 |
| `ARK_*_DEFAULTS.model` | 各功能的模型 ID | 火山方舟「推理接入点」/ 豆包「智能体 ID」 | ❌ 调用到错的模型 |

---

## 二、一步步操作（v2.1 加密版）

### 2.1 打开配置文件

用记事本、VS Code 或任意编辑器打开：

```
d:\玉小侨demo\date\volc-ark-apis.json
```

### 2.2 替换你需要改的字段

只改 **引号里的值**，其他别动。例如：

```diff
- "dataApiKey": "旧的长长的key",
+ "dataApiKey": "老师账号的新API-KEY",
```

### 2.3 生成新的 AES 密文锁（关键步骤 ⭐）

在项目根目录打开 **PowerShell**，运行：

```powershell
$env:ARK_DEMO_PASS="你自己设置的密码"; node encrypt_tool.js
```

说明：
- 密码你自己定（建议字母+数字，别用简单的 `1234`、`demo1234`）。
- 脚本会在控制台输出一长串 Base64 密文，同时写入 `date/volc-ark-apis.cipher.cryptojs.txt`。

### 2.4 把密文粘到前端配置里

打开：

```
d:\玉小侨demo\js\ark-api-config.js
```

找到 `const ENCRYPTED_CONFIG_STRING = "..."` 这一行，把引号里的内容替换成上一步控制台输出的密文（长串 Base64）。

### 2.5 刷新浏览器，输入你自己的密码

打开 `index.html`、`map.html`、`pages/services/overseas-service-assistant.html`，页面**首次进入**会弹一个 `prompt` 输入框，**输入你第 2.3 步设置的密码**：

- ✅ 密码正确 → 解密注入配置，所有在线能力生效
- ❌ 密码错误 / 点取消 → 自动进入「离线 Mock 模式」，仅显示静态缓存内容

> 💡 **只弹一次**：密码会保存在浏览器 `localStorage`（Key：`ARK_DEMO_PASS_CACHE`）。
> 之后再打开任何页面都会自动用缓存密码解密，不会再弹。
> 想让它重新弹，打开浏览器控制台执行：
>
> ```
> clearArkAuth()
> ```
>
> 然后刷新页面即可。

---

## 三、各 Key 详细获取方式

### 3.1 火山方舟 API Key（dataApiKey / translationApiKey / qiaozhuangApiKey）

1. 登录 🔗 [火山方舟控制台](https://console.volcengine.com/ark)（用老师的账号登录）
2. 左侧菜单 → **API Key 管理**
3. 点击 **创建新的 API Key**，起个名字（如「玉林侨务-主」）
4. 复制生成的 Key（类似 `xxxx-xxxx-xxxx-xxxx`），粘贴到 `volc-ark-apis.json` 的 `dataApiKey` 和 `qiaozhuangApiKey`

> 💡 **可以三个 Key 用同一个**。想分开统计额度时，才创建 2~3 个不同的 Key。

---

### 3.2 豆包智能体（侨壮壮）配置 ⭐

> 侨壮壮用的是**豆包智能体**（`bots/chat/completions`接口），不是普通大模型。
> `ARK_QIAOZHUANG_DEFAULTS.model` 填的是 **bot ID**（`bot-`开头），不是 `ep-`开头的推理接入点。

#### 步骤 A：创建豆包智能体

1. 登录 🔗 [豆包智能体平台](https://www.doubao.com/agent) 或火山方舟「智能体工作室」
2. 点击 **创建智能体** / **创建 Bot**
3. 名称填「侨壮壮」，图标随意
4. **提示词（System Prompt）** 复制粘贴下面这一段：

```
你是"侨壮壮"，玉林侨务相关的数字助手，性格大方活泼，带着亲切热忱的气质，容易让人产生亲近感。

核心是围绕玉林侨务相关事务提供帮助，包括解答侨胞关心的各类问题、分享真实的侨乡动态、衔接侨商合作等。

所有回应必须基于客观事实，不编造信息，对于不确定的内容，会如实说明"这个信息我不太确定，建议咨询相关部门"。

生成的回答里自动去掉ai痕迹，让对话显得自然，任何问题只做最多三百字的简单回答。

面对提问时，相关内容要清晰回应，尽量给出实用、准确的信息；即使遇到不相关的话题，也先简单回应，再自然引导到侨务、地方发展等相关方向。

用户可能用不同语言提问，需要回答相应的语言。

说话风格轻松自然，不刻意使用特定称谓，以平和的语气沟通，让接触到的人感受到友好与热忱，同时聚焦于服务侨胞、促进交流的核心目标。
```

5. **欢迎语** 可以填：「你好呀！我是侨壮壮，玉林侨务相关的数字助手。有什么想了解的侨乡信息、侨商合作、政策解读，都可以问我～」
6. 保存并发布智能体
7. 在智能体详情页找到 **Bot ID**（格式如 `bot-20260608123456-xxxxx`），复制下来

#### 步骤 B：把 Bot ID 写入配置

在 `volc-ark-apis.json` 中找到 `ARK_QIAOZHUANG_DEFAULTS`，替换 `model` 的值：

```diff
  "ARK_QIAOZHUANG_DEFAULTS": {
-   "model": "bot-20260402185514-nhjkt"
+   "model": "bot-老师账号下的新bot-id"
  }
```

> ⚠️ 确认 `qiaozhuangApiKey` 也是老师账号的 Key，账号和 Bot 必须属于同一个账号体系！

---

### 3.3 百度地图 AK + 个性化地图样式码

1. 登录 🔗 [百度地图开放平台](https://lbsyun.baidu.com/)
2. 控制台 → **应用管理** → **我的应用** → **创建应用**
3. 应用类型选 **浏览器端**（重要！选服务端 AK 在前端地图页用不了）
4. **Referer 白名单**填 `*`（测试用），上线前改成你的域名（如 `*.yulinqiaowu.com/*`）
5. 创建后复制 **AK**（一长串字符），粘贴到 `volc-ark-apis.json` 的 `baiduMapAk`
6. **个性化地图样式**：控制台 → **特色服务平台** → **个性化地图** → **样式管理**
   - 创建或编辑样式，保存后会生成一个 **样式 ID**
   - 当前项目的样式码为：`f4735e2f6ce44a588e0ff559db115f3a`
   - 复制该样式码，粘贴到 `volc-ark-apis.json` 的 `baiduMapStyleId`
   - 地图加载后会自动应用这个深色主题样式，与页面整体视觉一致

---

### 3.4 翻译 / 数据生成模型 ID（一般不用改）

- `ARK_DATA_CHAT_DEFAULTS.model` → 数据生成模型，`ep-`开头的推理接入点 ID
- `ARK_TRANSLATION_RESPONSES_DEFAULTS.model` → 翻译模型，`ep-`开头的推理接入点 ID
- 如果你在老师账号下创建了自己的推理接入点，替换对应 `ep-`值即可
- 如果没创建，原有的值通常可以继续使用（火山方舟的模型接口是通用的），只要 API Key 对就行

---

## 四、常见问题 FAQ

### Q1：改完了，但页面还是旧的内容？
**A**：浏览器有缓存。按 `Ctrl + Shift + R` 强制刷新，或打开开发者工具勾选「Disable Cache」。

### Q2：地图显示「无权访问」或「API Key 无效」？
**A**：
1. 检查 `baiduMapAk` 是否正确复制（不要多复制空格）
2. 检查百度地图后台的 **Referer 白名单**，加 `*` 临时测试
3. 确认创建的是 **浏览器端** 应用，不是服务端

### Q3：侨壮壮能打字但回复空白？
**A**：
1. `qiaozhuangApiKey` 是否来自老师账号的 Key
2. `ARK_QIAOZHUANG_DEFAULTS.model` 的 Bot ID 是否属于同一个账号
3. Bot 是否已「发布」而非草稿状态
4. 打开浏览器按 F12 → Console，看红色错误信息

### Q4：Python 脚本报「未配置 API Key」？
**A**：Python 脚本也读同一个 `volc-ark-apis.json`。确认 `dataApiKey` 填了值，或者临时用环境变量 `set ARK_API_KEY=你的key` 覆盖。

### Q5：JSON 格式错了？
**A**：JSON 非常严格：
- 每个字段后面要有逗号（最后一个字段除外）
- 字符串必须用**双引号** `"..."`，不能用单引号
- 值里有引号要加转义：`"他说\"你好\""`
- 最简单的检查：用 🔗 [JSON.cn](https://www.json.cn/) 粘贴内容看是否报错

### Q6：我想彻底关掉某个功能？
**A**：找到对应的 `*_ARK` 块，把 `"enabled": true` 改成 `"enabled": false`。

### Q7：v2.1 后为什么改完 JSON 刷新浏览器没反应？
**A**：v2.1 前端不再直接读 `volc-ark-apis.json`，而是读 `js/ark-api-config.js` 里硬编码的密文。必须走完完整流程：

```
改 JSON → $env:ARK_DEMO_PASS="你的密码"; node encrypt_tool.js → 把密文粘到 ENCRYPTED_CONFIG_STRING → 刷新浏览器并输入密码
```

少一步就会读到旧的密文。

### Q8：为什么输入 `demo1234` 后地图还是不显示、侨壮壮也不会回复？
**A**：因为 `demo1234` 是**演示密码**，它解密出来的是一份"示例配置"，里面都是 `YOUR_BAIDU_MAP_AK` 这样的占位符。当前脚本会自动把这些占位符置空，让页面进入 `offline-mock` 模式——不会用无效 AK 去触发外部请求。

要让在线能力真正生效，你必须：

1. 在 `date/volc-ark-apis.json` 写入**真实密钥**；
2. 用自己设置的密码运行 `node encrypt_tool.js` 重新生成密文；
3. 把新密文粘回 `js/ark-api-config.js` 的 `ENCRYPTED_CONFIG_STRING`；
4. 打开页面后输入你自己设置的密码（**不是 `demo1234`**）。

### Q9：怎么快速检查当前到底是 online 还是离线模式？
**A**：在浏览器按 F12 打开开发者工具 → Console，执行：

```javascript
window.YXQ_CONFIG_MODE      // "online" 或 "offline-mock"
window.YXQ_VOLC_KEYS        // 当前注入的各 key 快照（baiduMapAk 等）
clearArkAuth()              // 清掉密码缓存，刷新重新输入
```

如果 `YXQ_CONFIG_MODE = offline-mock`，说明要么你没输入密码，要么解密后的字段仍是占位符——请回到 Q8 的 4 步流程检查。

---

## 五、修改清单（按顺序打勾）

- [ ] 打开 `date/volc-ark-apis.json`
- [ ] 替换 `dataApiKey` 为老师账号的火山方舟 API Key
- [ ] 替换 `qiaozhuangApiKey`（可以和上一个相同）
- [ ] 替换 `baiduMapAk` 为老师账号的百度地图 AK
- [ ] 替换 `baiduMapStyleId` 为老师账号下的个性化地图样式码（当前值 `f4735e2f6ce44a588e0ff559db115f3a`）
- [ ] 替换 `ARK_QIAOZHUANG_DEFAULTS.model` 为老师豆包智能体的 `bot-xxxx` ID
- [ ] （可选）替换两个 `ep-xxxx` 模型 ID 为老师账号下的推理接入点
- [ ] 保存 `date/volc-ark-apis.json`（Ctrl + S）
- [ ] **⭐ v2.1 必须：** 在 PowerShell 中运行 `$env:ARK_DEMO_PASS="你的密码"; node encrypt_tool.js`
- [ ] **⭐ v2.1 必须：** 把控制台输出的长串 Base64 粘到 `js/ark-api-config.js` 的 `ENCRYPTED_CONFIG_STRING`
- [ ] 刷新 `index.html`，在 prompt 输入你自己的密码 → 看首页侨情卡片是否正常
- [ ] 刷新 `pages/map.html`，看地图是否显示
- [ ] 刷新 `pages/services/overseas-service-assistant.html`，和侨壮壮聊一句试试
- [ ] ✅ 完成！

---

## 六、配置项速查表

```
┌────────────────────────────────────────────────────────────┐
│  volc-ark-apis.json  结构速查                                │
├────────────────────────────────────────────────────────────┤
│  dataApiKey                        数据生成 / 内容获取        │
│  translationApiKey                  翻译（空=用dataApiKey）    │
│  qiaozhuangApiKey                   侨壮壮对话 Bot            │
│  baiduMapAk                        百度地图（浏览器端）        │
│  baiduMapStyleId                   百度地图个性化样式码        │
│                                                            │
│  ARK_DATA_CHAT_DEFAULTS             数据生成 endpoint+model  │
│  ARK_QIAOZHUANG_DEFAULTS           侨壮壮 bot endpoint+model │
│  ARK_TRANSLATION_RESPONSES_DEFAULTS 翻译 endpoint+model      │
│                                                            │
│  TRANSLATION_ARK.enabled           true/false 翻译开关       │
│  DATA_ACQUISITION_ARK.enabled      true/false 数据生成开关    │
│  ASSISTANT_ARK.use_stream          true/false 打字机效果      │
└────────────────────────────────────────────────────────────┘
```

> ⚠️ **安全提醒**：
> 1. `date/volc-ark-apis.json` 里有真实密钥，**不要上传到公开的 GitHub，也不要发给不相关的人**。`.gitignore` 已经包含它了，本地保存即可。
> 2. `js/ark-api-config.js` 里只存 AES 密文（Base64），**密码不要写死在代码里**，每次打开页面通过 prompt 输入即可。
> 3. 如果你把 `ARK_DEMO_PASS` 写进了 `.ps1` / `.bat` 批处理脚本，记得也把它们加到 `.gitignore`。
