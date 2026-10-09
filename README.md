# J-35 · 深蓝突击 — 完整源文件

这是已发布游戏的源文件，包含 HTML、CSS、JavaScript、海天空素材及本地 Three.js 库。无需 npm 安装，也不依赖外部 CDN。

## 在线游玩

[在 GitHub Pages 游玩 J-35 · 深蓝突击](https://amber616314-byte.github.io/cubic-wilds/)

游戏由本仓库的 `gh-pages` 分支发布到 GitHub Pages，全部素材均保存在 GitHub 仓库中。

## 在电脑上运行

1. 解压 ZIP，进入 `j35-ocean` 文件夹。
2. 安装 Python 3（如果电脑还没有）。
3. 在此文件夹打开终端，运行：

   ```bash
   python start_game.py
   ```

   Windows 也可以使用 `py start_game.py`，macOS / Linux 可以使用 `python3 start_game.py`。

4. 浏览器会打开 `http://localhost:8000/`。点击“开始出击”。
5. 在终端按 Ctrl+C 关闭服务器。

请通过本地服务器运行；直接双击 `index.html` 时，浏览器可能阻止 JavaScript 模块或纹理加载。

## 用手机运行自己的副本

可将 `dist` 文件夹发布到支持静态网页的托管服务，通过网址打开。

也可以让手机与电脑连接同一个 Wi-Fi，然后在电脑运行：

```bash
python start_game.py --lan
```

在手机浏览器输入 `http://电脑的局域网IP:8000/`。例如：`http://192.168.1.10:8000/`。电脑需保持运行；若防火墙提示网络访问，请按自己的网络设置允许。局域网模式会让同网络设备访问这份游戏文件。

## 文件结构

| 文件 | 用途 |
| --- | --- |
| `dist/index.html` | 游戏页面、菜单及 HUD |
| `dist/style.css` | 画面界面、手机适配、触屏按钮 |
| `dist/game.js` | 起飞、操控、敌机、武器、音效、任务结算 |
| `dist/world.js` | J-35 模型、航母、护航舰、海面光影、粒子效果 |
| `dist/physics.js` | 命中检测、目标锁定、波次规则 |
| `dist/assets/sky.png` | 晨光海天空素材 |
| `dist/vendor/three.module.js` | Three.js r170，本地依赖 |
| `dist/vendor/THREE-LICENSE.txt` | Three.js MIT 许可证 |
| `start_game.py` | 本地启动工具 |

修改后刷新浏览器即可看到效果。若浏览器仍显示旧内容，请执行强制刷新。

## 操作

- 手机：左侧摇杆飞行；右侧按钮发射导弹、释放干扰弹；机炮自动射击。推荐横屏。
- 电脑：WASD / 方向键飞行；空格发射导弹；F 释放干扰弹；P / Esc 暂停。
- 声音默认关闭，点击“静音”按钮开启。
- 画质按钮可切换自动、精细、流畅模式。

## 版本说明

此仓库已用 j35-ocean 完整替换原游戏内容。游戏文件与本地 j35-ocean/dist 保持一致。

这是写实风格的网页街机空战游戏，飞机模型和飞行行为为游戏实现。此前已验证战斗逻辑和完整任务流程，尚未在实体手机上进行画面实测。

Three.js 使用 MIT 许可证，分发时请保留相应许可证文件。本仓库不包含账号凭证。
