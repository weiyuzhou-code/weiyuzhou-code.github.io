# 更新与正常回滚

## 常规更新

先 `git status --short --branch`，保留未提交改动。从最新 `main` 建立新的 `codex/portfolio-<主题>` 分支。不要直接在稳定 `main` 编辑。

1. 网页事实修改 `src/content.json`；布局与交互分别修改模板、CSS、JS。不直接编辑生成的 `index.html` 或 `dist/index.html`。
2. 涉及教育状态、时间、贡献、论文、邮箱的共同事实，同时核对中英网页、`src/cv_zh.html`、`src/cv_en.html` 和两份 PDF。日期经过不会自动改变学位状态。
3. 更新 PDF 时，在本地 HTTP 下打开简历 HTML，按 A4 打印，关闭浏览器页眉页脚，保存为 `assets/Weiyu_Zhou_CV_ZH.pdf` 和 `assets/Weiyu_Zhou_CV_EN.pdf`。逐页视觉检查，并审查 PDF 元数据、附件和链接。构建不会自动重生成 PDF。
4. 运行 `python build.py`、`python tests/validate.py`、`node --check src/app.js`。需要 Node 的浏览器测试：本地安装 `npm install --no-save --package-lock=false playwright@1.62.1` 和 `npx playwright install chromium`，运行 `node tests/browser.cjs`。Windows 已安装 Edge 时可在 PowerShell 设置 `$env:BROWSER_CHANNEL='msedge'` 使用 Edge。浏览器测试自动启动仅监听本机的 HTTP 服务。
5. 人工查看 `qa/` 中中英文桌面和手机截图，重点检查内容换行、图片、弹窗。浏览器模拟不能代替真实手机/微信验证。
6. 用 `git diff` 和 `git diff --cached` 审查，只暂存改变的明确白名单文件。不要暂存 ZIP、QA、审查报告、内部来源、日志或凭据。
7. 提交、推送工作分支，打开针对 `main` 的 PR；CI 通过后正常合并（建议 merge commit）。只有 main 部署，不以测试分支替换正式站点。
8. 每次发布核对 Actions、实际网站响应、正文及 PDF 下载；记录发布 commit。网站地址不变则二维码不变；如改地址，更新 `site.json` 后重新构建、生成二维码并实际扫码核对。

## 回滚

从最新 `main` 新建 `codex/portfolio-rollback`。使用 `git log --oneline --first-parent` 查到需撤销的发布：普通提交用 `git revert <commit>`，merge commit 用 `git revert -m 1 <merge-commit>`。若有后续相关改动，先检查冲突并逐项解决，不能盲目覆盖。

在回滚分支重新构建、运行全部检查，正常提交、推送、PR 合并。main 工作流部署回退后的版本；再次验收网站和两个 PDF。使用新增回退提交保留历史，禁止 `reset --hard`、强制推送或删除历史。

首次发布之前没有上一版正式网站；此时需要撤回用 `DEPLOYMENT.md` 的下线方式。

## 真实客户端人工核验

在手机流量、Wi-Fi 下分别打开正式 HTTPS 网址：切换中英文，打开研究详情，打开/保存两份 PDF，使用邮件及分享按钮。在微信内置浏览器中重复；下载不支持时用“在浏览器打开”。记录设备、浏览器、网络和失败现象。中国大陆跨境网络、真实 Safari/Android/微信未实测时必须标为待实测。
