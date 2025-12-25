export const ROLE_LABELS = {
  reader: '读者',
  author: '作者',
  editor: '编辑',
  admin: '管理员'
}

export const STATUS_LABELS = {
  active: '正常',
  suspended: '临时封禁',
  banned: '永久封禁'
}

export const roleLabel = (val) => ROLE_LABELS[val] ?? val
export const statusLabel = (val) => STATUS_LABELS[val] ?? val
