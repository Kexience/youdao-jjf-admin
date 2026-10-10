/**
 * 全局共享类型：无需 import，直接使用。
 * 后端约定以线上文档为准：https://dev-1.ydndd.com/v3/api-docs
 */
declare global {
  /** 后端统一响应信封 ResultXxx{code, message, data} */
  interface ApiResult<T> {
    code: number
    message: string
    data: T
  }

  /** 分页结果 PageResultXxx{total, page(1 起), size, records} */
  interface PageResult<T> {
    total: number
    page: number
    size: number
    records: T[]
  }

  /** 分页查询参数（?page=&size=） */
  interface PageParams {
    page: number
    size: number
  }

  /** 主题模式：浅色 / 深色 / 跟随系统 */
  type ThemeMode = 'light' | 'dark' | 'system'

  /** 解析后的实际主题（只可能是浅/深） */
  type ResolvedTheme = 'light' | 'dark'

  /** POST /admin/auth/login 入参（见文档 AdminLoginDto） */
  interface AdminLoginParams {
    username: string
    password: string
  }

  /** 管理员登录成功响应（见文档 AdminLoginVo） */
  interface AdminLoginResult {
    /** 管理员 access token */
    accessToken: string
    /** 令牌有效期（秒） */
    expiresIn: number
  }

  /** 菜单节点类型（见文档 AdminMenuSaveRequest.menuType）：M 目录 / C 菜单 / A 按钮 */
  type AdminMenuType = 'M' | 'C' | 'A'

  /** 菜单树节点（见文档 AdminMenuTreeVo） */
  interface AdminMenuTreeNode {
    /** 节点 id */
    id: number
    /** 父级节点 id，顶级为 0 */
    pid: number
    /** 节点名称 */
    name: string
    /** 图标 */
    icon?: string
    /** 节点类型：M 目录 / C 菜单 / A 按钮 */
    menuType: AdminMenuType
    /** 前端路由/组件路径 */
    component?: string
    /** 同级排序 */
    sort: number
    /** 是否进菜单树 */
    show: boolean
    /** 引用的权限码，目录可空 */
    permissionCode?: string
    /** 子节点 */
    children?: AdminMenuTreeNode[]
  }

  /** 新建/编辑菜单节点入参（见文档 AdminMenuSaveRequest） */
  interface AdminMenuSaveParams {
    /** 父级节点 id，顶级为 0 */
    pid: number
    /** 节点名称 */
    name: string
    /** 节点类型：M 目录 / C 菜单 / A 按钮 */
    menuType: AdminMenuType
    /** 图标 */
    icon?: string
    /** 前端路由/组件路径 */
    component?: string
    /** 同级排序，小值在前 */
    sort?: number
    /** 是否进菜单树：1 显示 0 隐藏；为空默认显示 */
    isShow?: 0 | 1
    /** 引用的权限码，目录可空 */
    permissionCode?: string
  }

  /** 当前管理员可见菜单树与权限码集合（见文档 AdminMenuMineVo） */
  interface AdminMenuMineResult {
    /** 可见菜单树 */
    menus: AdminMenuTreeNode[]
    /** 当前管理员权限码集合 */
    codes: string[]
  }

  /** 短信全局配置（见文档 SmsConfigVo：GET /admin/sms/config） */
  interface SmsConfig {
    /** 短信总开关 */
    enabled: boolean
    /** 日预算(元)，空=不限 */
    dailyBudget?: number
  }

  /** 短信全局配置保存入参（见文档 SmsConfigSaveDto：PUT /admin/sms/config） */
  interface SmsConfigSaveParams {
    /** 短信总开关，必填 */
    enabled: boolean
    /** 日预算(元)，空=不限 */
    dailyBudget?: number
  }

  /** 短信通道（见文档 SmsChannelVo：GET /admin/sms/channels） */
  interface SmsChannel {
    /** 通道 id */
    id: number
    /** 厂商标识 */
    vendor: string
    /** AccessKey ID */
    accessKeyId?: string
    /** AccessKey Secret 掩码 */
    accessKeySecret?: string
    /** 短信签名 */
    signName?: string
    /** 优先级，1 最高 */
    priority: number
    /** 单条单价(元) */
    unitPrice?: number
    /** 启用状态 */
    enabled: boolean
    /** 加密开关（只管写，新增默认 true） */
    accessKeySecretEncrypted?: boolean
    /** 实际存储形态：true=密文 false=明文 */
    secretStoredEncrypted?: boolean
  }

  /** 短信通道保存入参（见文档 SmsChannelSaveDto：POST /admin/sms/channels） */
  interface SmsChannelSaveParams {
    /** 厂商标识：aliyun 等，必填 */
    vendor: string
    /** AccessKey ID */
    accessKeyId?: string
    /** AccessKey Secret */
    accessKeySecret?: string
    /** 短信签名 */
    signName?: string
    /** 优先级，1 最高全局唯一，必填 */
    priority: number
    /** 单条单价(元) */
    unitPrice?: number
    /** 启用状态，不传视为 false */
    enabled?: boolean
    /** Secret 是否加密存储，不传=新增默认加密 */
    accessKeySecretEncrypted?: boolean
  }

  /** 短信模板（见文档 SmsTemplateVo：GET /admin/sms/templates，场景×厂商） */
  interface SmsTemplate {
    /** 模板 id */
    id: number
    /** 场景标识，如 LOGIN */
    scene: string
    /** 厂商标识 */
    vendor: string
    /** 厂商侧模板 code */
    templateCode: string
    /** 启用状态 */
    enabled: boolean
    /** 人工备注 */
    remark?: string
    /** 创建时间 */
    createdAt?: string
  }

  /** 短信模板保存入参（见文档 SmsTemplateSaveDto） */
  interface SmsTemplateSaveParams {
    /** 场景标识，建议大写下划线，必填 */
    scene: string
    /** 厂商标识，必须已登记通道，必填 */
    vendor: string
    /** 厂商侧模板 code，必填 */
    templateCode: string
    /** 启用状态，不传视为 false */
    enabled?: boolean
    /** 人工备注 */
    remark?: string
  }

  /** 短信发送记录（见文档 SmsSendRecordVo：GET /admin/sms/records） */
  interface SmsSendRecord {
    /** 记录 id */
    id: number
    /** 接收手机号 */
    mobile?: string
    /** 场景标识 */
    scene?: string
    /** 实际使用的厂商模板 code */
    templateCode?: string
    /** 实际投递厂商 */
    vendor?: string
    /** 实际投递通道 id */
    channelId?: number
    /** 状态：SUCCESS/FAILED */
    status?: string
    /** 拒绝原因枚举名，成功为空 */
    rejectRule?: string
    /** 厂商受理标识 BizId */
    bizId?: string
    /** 厂商错误码 */
    errorCode?: string
    /** 错误语义 */
    errorMessage?: string
    /** 调用方来源 IP */
    clientIp?: string
    /** 设备标识 */
    deviceId?: string
    /** 估算成本（通道单价） */
    cost?: number
    /** 创建时间 */
    createdAt?: string
  }

  /** 发送记录查询入参（分页 1 起，时间 ISO-8601） */
  interface SmsSendRecordQueryParams extends PageParams {
    /** 手机号精确过滤 */
    mobile?: string
    /** 场景过滤 */
    scene?: string
    /** 状态过滤：SUCCESS/FAILED */
    status?: string
    /** 创建时间起 */
    start?: string
    /** 创建时间止 */
    end?: string
  }

  /** 存储通道（见文档 StorageChannelVo：GET /admin/storage/channels） */
  interface StorageChannel {
    /** 通道 id */
    id: number
    /** 厂商标识 */
    vendor: string
    /** endpoint */
    endpoint?: string
    /** bucket */
    bucket?: string
    /** AccessKey ID */
    accessKeyId?: string
    /** AccessKey Secret 掩码 */
    accessKeySecret?: string
    /** 回调公网 URL */
    callbackUrl?: string
    /** 优先级，1 最高 */
    priority: number
    /** 启用状态 */
    enabled: boolean
    /** 加密开关（只管写，新增默认 true） */
    accessKeySecretEncrypted?: boolean
    /** 实际存储形态：true=密文 false=明文 */
    secretStoredEncrypted?: boolean
  }

  /** 存储通道保存入参（见文档 StorageChannelSaveDto） */
  interface StorageChannelSaveParams {
    /** 厂商标识，首版 oss，必填 */
    vendor: string
    /** endpoint */
    endpoint?: string
    /** bucket */
    bucket?: string
    /** AccessKey ID */
    accessKeyId?: string
    /** AccessKey Secret */
    accessKeySecret?: string
    /** 回调公网 URL */
    callbackUrl?: string
    /** 优先级，1 最高全局唯一，必填 */
    priority: number
    /** 启用状态，不传=保留原值 */
    enabled?: boolean
    /** Secret 是否加密存储，不传=新增默认加密/修改保留原值 */
    accessKeySecretEncrypted?: boolean
  }

  /** 文件 zone（见文档 StorageZoneVo：GET /admin/storage/zones） */
  interface StorageZone {
    /** zone id */
    id: number
    /** 地址前缀 */
    prefix: string
    /** 写策略 */
    writePolicy?: string
    /** 读策略 */
    readPolicy?: string
    /** 单文件大小上限（字节） */
    maxSizeBytes?: number
    /** content-type 白名单 */
    allowContentTypes?: string[]
    /** 后缀白名单 */
    allowExts?: string[]
    /** 上传凭证有效期（秒） */
    uploadPolicyExpireSeconds?: number
    /** 签名读 URL 有效期（秒） */
    viewUrlExpireSeconds?: number
    /** 图片处理 style 白名单 */
    processStyles?: string[]
    /** 启用状态 */
    enabled?: boolean
  }

  /** zone 新增入参（见文档 StorageZoneCreateDto） */
  interface StorageZoneCreateParams {
    /** 地址前缀，必须以 / 结尾，必填 */
    prefix: string
    /** 写策略：ANON/AUTH_USER/ADMIN_ONLY，必填 */
    writePolicy: string
    /** 读策略：PUBLIC/SIGNED/PROGRAM_ONLY，必填 */
    readPolicy: string
    /** 单文件大小上限（字节），必填 */
    maxSizeBytes: number
    /** content-type 白名单，空=不限制 */
    allowContentTypes?: string[]
    /** 后缀白名单，空=不限制 */
    allowExts?: string[]
    /** 图片处理 style 白名单，空=不启用 */
    processStyles?: string[]
    /** 上传凭证有效期（秒），空=默认 300 */
    uploadPolicyExpireSeconds?: number
    /** 签名读 URL 有效期（秒），空=默认 600 */
    viewUrlExpireSeconds?: number
  }

  /** zone 修改入参（见文档 StorageZoneUpdateDto：无 prefix，带 enabled） */
  interface StorageZoneUpdateParams {
    /** 写策略 */
    writePolicy?: string
    /** 读策略 */
    readPolicy?: string
    /** 单文件大小上限（字节） */
    maxSizeBytes?: number
    /** content-type 白名单 */
    allowContentTypes?: string[]
    /** 后缀白名单 */
    allowExts?: string[]
    /** 图片处理 style 白名单 */
    processStyles?: string[]
    /** 上传凭证有效期（秒） */
    uploadPolicyExpireSeconds?: number
    /** 签名读 URL 有效期（秒） */
    viewUrlExpireSeconds?: number
    /** 启用状态 */
    enabled?: boolean
  }

  /** 上传记录（见文档 StorageUploadRecordVo：GET /admin/storage/records） */
  interface StorageUploadRecord {
    /** 记录 id */
    id: number
    /** 归属 zone 前缀 */
    zone?: string
    /** 文件 SHA-256 */
    hash?: string
    /** 声明大小 */
    sizeExpected?: number
    /** 实际大小 */
    sizeActual?: number
    /** ETag */
    etag?: string
    /** content-type */
    contentType?: string
    /** 原始文件名 */
    originalName?: string
    /** 后缀 */
    ext?: string
    /** 上传人类型（空=匿名） */
    uploaderType?: string
    /** 上传人 id（空=匿名） */
    uploaderId?: number
    /** 冻结厂商 */
    vendor?: string
    /** 冻结 bucket */
    bucket?: string
    /** 对象 key */
    objectKey?: string
    /** 状态 */
    status?: string
    /** 失败原因 */
    failReason?: string
    /** 创建时间 */
    createdAt?: string
    /** 更新时间 */
    updatedAt?: string
  }

  /** 上传记录查询入参（分页 1 起） */
  interface StorageUploadRecordQueryParams extends PageParams {
    /** zone 前缀 */
    zone?: string
    /** 文件 hash */
    hash?: string
    /** 上传人类型 */
    uploaderType?: string
    /** 上传人 id */
    uploaderId?: number
    /** 状态，空=默认排除 EXPIRED */
    status?: string
    /** 创建时间起 */
    start?: string
    /** 创建时间止 */
    end?: string
  }

  /** 服务端直传结果（见文档 ServerUploadResult） */
  interface ServerUploadResult {
    recordId?: number
    vendor?: string
    bucket?: string
    objectKey?: string
    size?: number
    hash?: string
  }

  /** 会员后台列表/详情（见文档 MemberAdminVo：GET /admin/members） */
  interface MemberAdmin {
    /** 会员 id */
    id: number
    /** 手机号全号 */
    mobile?: string
    /** 用户名 */
    username?: string
    /** 昵称 */
    nickname?: string
    /** 头像 */
    avatar?: string
    /** 真实姓名 */
    realname?: string
    /** 性别：0未知 1男 2女 */
    sex?: number
    /** 状态：1正常 0禁用 */
    status?: number
    /** 会员等级 id */
    memberLevelId?: number
    /** 等级名称 */
    levelName?: string
    /** 注册渠道 */
    registerChannel?: string
    /** 注册时间 */
    registerAt?: string
    /** 最后登录时间 */
    lastLoginAt?: string
    /** 最后登录IP */
    lastLoginIp?: string
    /** 最后登录渠道 */
    lastLoginChannel?: string
    /** 生日 */
    birthday?: string
    /** 成长值 */
    growth?: number
    /** 消费日限额（元），空=不限 */
    dailyConsumptionLimit?: number
    /** 消费月限额（元），空=不限 */
    monthlyConsumptionLimit?: number
    /** 最后访问时间 */
    lastVisitAt?: string
  }

  /** 会员分页查询入参（分页 1 起，时间 ISO-8601） */
  interface MemberAdminQueryParams extends PageParams {
    /** 关键词：mobile 精确、username/nickname 模糊 */
    keyword?: string
    /** 状态：1正常 0禁用 */
    status?: 0 | 1
    /** 等级 id */
    levelId?: number
    /** 注册时间起（含） */
    registerStart?: string
    /** 注册时间止（含） */
    registerEnd?: string
  }

  /** 会员禁用/解禁入参（见文档 MemberStatusUpdateDto：PUT /admin/members/{id}/status） */
  interface MemberStatusUpdateParams {
    /** 目标状态：1正常 0禁用 */
    status: 0 | 1
  }

  /** 会员等级列表项（见文档 MemberLevelVo：GET /admin/member/levels） */
  interface MemberLevel {
    /** 等级 id */
    id: number
    /** 等级名称 */
    levelName?: string
    /** 稳定档位代码，仅 migration 写入，管理界面不可改 */
    levelCode?: string
    /** 档位序位，升序即档位高低 */
    sort?: number
    /** 所需成长值 */
    growthRequired?: number
    /** 消费折扣，100=不打折 */
    consumeDiscount?: number
    /** 是否默认档 */
    isDefault?: boolean
    /** 状态：1正常 0停用 */
    status?: number
    /** 备注 */
    remark?: string
    /** 归属该档的未删除会员数 */
    memberCount?: number
  }

  /** 后台角色（见文档 AdminRoleVo：GET /admin/roles，含内置与停用角色） */
  interface AdminRole {
    /** 角色 id */
    id: number
    /** 角色名 */
    roleName: string
    /** 内置角色标识，自建角色为空串 */
    keyword?: string
    /** 是否内置受保护角色 */
    builtin?: boolean
    /** 状态：1 启用 0 停用 */
    status?: number
    /** 创建时间 */
    createdAt?: string
    /** 更新时间 */
    updatedAt?: string
  }

  /** 后台角色保存入参（见文档 AdminRoleSaveRequest：POST /admin/roles 新建） */
  interface AdminRoleSaveParams {
    /** 角色名，全局唯一，必填 */
    roleName: string
    /** 状态：1 启用 0 停用；为空新建时默认启用 */
    status?: 0 | 1
  }

  /** 后台角色详情（含已授予权限码，见文档 AdminRoleDetailVo：GET /admin/roles/{id}） */
  interface AdminRoleDetail extends AdminRole {
    /** 已授予的权限码集合 */
    permissionCodes?: string[]
  }

  /**
   * 后台角色授权入参（见文档 AdminRoleGrantRequest：
   * PUT /admin/roles/{id}/permissions 整体重写，空数组=清空）。
   */
  interface AdminRoleGrantParams {
    /** 权限码集合 */
    permissionCodes: string[]
  }
}

export {}
