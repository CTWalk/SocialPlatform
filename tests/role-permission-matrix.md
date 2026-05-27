# 角色權限矩陣

這份文件是用來證明這個系統真的有多角色與角色權限控制。

## 角色與權限

| 角色 | 可以看 Dashboard | 可以看貼文 | 可以發文 | 可以處理審核 | 可以看/管使用者 |
| --- | --- | --- | --- | --- | --- |
| Administrator | 可以 | 可以 | 可以 | 可以 | 可以 |
| Auditor | 可以 | 可以 | 可以 | 不一定 | 不可以 |
| Reviewer | 可以 | 可以 | 不可以 | 可以 | 不可以 |
| Approver | 可以 | 可以 | 不可以 | 可以 | 不可以 |
| Viewer | 可以 | 可以 | 不可以 | 不可以 | 不可以 |

## 證據在哪裡

- 前端畫面：
  - `tests/screenshots/role-matrix/*/cases-view.png`
  - `tests/screenshots/role-matrix/*/admin-view.png`
- Playwright 測試：
  - `tests/e2e/role-matrix.spec.mjs`
  - `tests/e2e/role-403.spec.mjs`
- 後端權限：
  - `server/index.js`

## 你要看什麼

- 管理員會看到可管理使用者的畫面
- 一般使用者進到管理相關 API 會收到 `403`
- `Viewer` 不能發文，也不能新增使用者
- `Member` 可以發文
- `Reviewer` 和 `Approver` 可以處理審核流程

## 很簡單的理解

- 可以做的事情 = 角色有權限
- 不可以做的事情 = 角色沒權限

這就是 role-based permission。
