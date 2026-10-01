# Weiyu Zhou · 中英双语求职网站

保留原有静态设计、本人照片、研究项目、学术成果和双语简历。无需 React、Next.js、远程字体、第三方表单或服务器。

## 构建与预览

`python build.py` 同时生成：

- `index.html`：照片与两份 PDF 内嵌的单文件离线版，可直接打开。
- `dist/`：公开部署版，仅含允许公开的 HTML、照片、分享图、两份 PDF 和 `.nojekyll`。

本地 HTTP 预览：`python -m http.server 8000 --bind 127.0.0.1 --directory dist`，打开本机 8000 端口。这不是公开部署。`site.json` 的 URL 在首次公开确认后填写；未配置时不输出虚假 canonical 或公开分享地址。

## 源文件

- `src/content.json`：中英文文案与事实。
- `src/index.template.html`、`src/style.css`、`src/app.js`：结构、原有设计与交互。
- `src/cv_zh.html`、`src/cv_en.html`：简历打印源。
- `assets/Weiyu_Zhou_CV_ZH.pdf`、`assets/Weiyu_Zhou_CV_EN.pdf`：实际发布的一页简历。
- `assets/portrait.png`：原有本人照片；`assets/share-card.png`：纯文字分享图。
- `tests/`：发布边界检查与真实浏览器验收。
- `.github/workflows/pages.yml`：仅从 main 发布 dist 的 GitHub Pages 工作流。

**网页文案与 PDF 分别维护。** 改动共同事实必须同步核对四个版本，不能把学位待授予自动改成已毕业。

## 使用与维护

桌面/手机中英文切换、项目筛选、详情弹窗、可暂停概念动画、两份 PDF 直接打开及下载、复制邮箱及失败时手动复制、调用邮件客户端、正式网址分享。概念图不是实验数据或有限元结果。

参见 `DEPLOYMENT.md` 和 `UPDATE_GUIDE.md`。首次公开范围确认记录、原始资料与测试输出仅留在本地，不提交公开仓库。部署状态以实际正式网址验收记录为准，不把仓库地址或本地预览称作网站。
