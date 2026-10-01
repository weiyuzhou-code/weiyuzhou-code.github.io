# 部署方式与授权边界

当前是否上线、正式网址和发布 commit 以本地 `DEPLOYMENT_STATUS.md` 为准。代码中的候选地址不代表已经部署成功。

## 平台与免费条件

选择 GitHub Pages，独立公开网站仓库，使用 GitHub 提供的 `github.io` HTTPS 域名。不购买域名、服务器，不启用付费 API、升级计划或 larger runners。2026-10-01 核对：GitHub Free 支持公开仓库的 Pages；公开仓库使用标准 GitHub 托管运行器的 Actions 免费。这里使用标准 `ubuntu-latest`，Pages 临时制品仅保留 1 天。平台规则可能调整，不承诺永久免费或所有地区可达。

官方依据：

- [Pages 类型与免费条件](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages)
- [自定义工作流及官方 Actions 版本](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)
- [发布源设置](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)
- [HTTPS](https://docs.github.com/en/pages/getting-started-with-github-pages/securing-your-github-pages-site-with-https)
- [Actions 免费条件](https://docs.github.com/en/billing/concepts/product-billing/github-actions)

## 发布

1. 首次上线必须先由本人审阅本地 `PUBLICATION_REVIEW.md` 并一次确认信息、文件、项目职责、账号和公开仓库范围。
2. 新建独立仓库，不能改变其他仓库的可见性或继承科研仓库历史。若同名主页仓库被占用，停止并检查已有网站，不能覆盖。
3. 将已确认的正式 HTTPS 地址写入 `site.json` 的 `url`（以 `/` 结尾）。构建会生成 canonical、og:url 和分享图绝对地址；项目站点地址应包括仓库子路径。
4. 仓库 Settings → Pages → Source 选择 GitHub Actions。不要选择不存在的分支发布 `dist` 目录。
5. 在独立分支完成构建与测试，通过正常合并进入 `main`。工作流只在 `main` 上部署，PR 只验证；其他分支手动运行也不会部署。
6. 工作流只上传 `dist/`。构建拒绝 `dist` 中额外文件或符号链接。公开站点只含 HTML、照片、分享图、两份 PDF、`.nojekyll`。
7. 构建任务仅 `contents: read`；部署任务仅 `pages: write` 与 `id-token: write`。无仓库长期令牌写入文件。
8. 记录 release commit，等待 Pages 部署完成。使用未登录浏览器实际打开 HTTPS 网站，核对页面内容、语言切换及两份 PDF；下载文件逐字节比较，然后生成并解码验证网址二维码。

## 公开边界

公开仓库包含维护用的中英文内容、简历打印源文件、构建脚本及测试配置，因此访问者可以下载源文件。站点和仓库内容可能被搜索引擎收录、第三方复制。只有 `.gitignore` 不足以保证保密：每次提交仍须检查暂存区及历史，按明确文件名单 `git add -- <文件...>`。

原始 ZIP、内部来源说明、发布审查、旧验证记录、日志、测试截图和本地状态文件不上传。无手机号、精确地址、出生日期或合作方原始数据。Git 提交使用 GitHub noreply 邮箱，不暴露额外私人邮箱。

站点无第三方追踪脚本。GitHub 托管平台自身可能为安全目的记录访客 IP，见官方 Pages 说明；“无追踪脚本”并不表示托管平台无日志。

## 下线

仓库 Settings → Pages 使用 Unpublish site，并禁用发布工作流，避免下次推送重新上线。公开仓库中的源码、PDF 和照片仍可访问；如需同时撤下，另行明确授权调整该网站仓库可见性或删除其公开文件。已被第三方缓存或下载的内容无法保证撤回。不删除其他仓库，不执行强制推送。
