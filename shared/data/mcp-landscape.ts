// TODO(translate): Chinese labels and blurbs were drafted by an LLM and
// should be reviewed by a translator before GA.
//
// Static landscape of internal tool services for the MCP Panorama page.
// Two layers:
//   industry → 12 sectors → tools → MCPs
//   public   → 5 domains × multiple PDTs → tools → MCPs
//
// A tool is the *product* header; it owns 0–N MCP servers. Each MCP has its
// own status, deps, tags, blurb, and marketplace link:
//   extensionId set ⇒ "released" (tile is clickable, links to marketplace)
//   else inDev      ⇒ "dev"      (amber, static)
//   else            ⇒ "none"     (grey, static, "no MCP needed")
// Tools with `mcps: []` get a single greyed-out placeholder tile at runtime so
// the inventory stays visible.
//
// Sectors / domains / PDTs are seeded from this file and live in the DB so
// downstream queries can join. Tools and MCPs are seeded too — see
// scripts/seed-mcp-landscape.ts.

export type McpStatus = "none" | "dev" | "released"

export interface McpSectorSeed {
  key: string
  label: string
  labelZh: string
  short: string
}

export interface McpDomainSeed {
  key: string
  label: string
  labelZh: string
  short: string
  pdts: McpPdtSeed[]
}

export interface McpPdtSeed {
  key: string
  label: string
  labelZh: string
}

export interface McpSeed {
  /** Marketplace-wide MCP slug, e.g. "codecheck-mcp" or "molint-mcp". */
  slug: string
  /** Optional explicit display name; defaults to the parent tool's name at seed time. */
  name?: string
  nameZh?: string
  released: boolean
  inDev: boolean
  depsCount: number
  blurb: string
  blurbZh: string
  tags: string[]
}

export interface McpToolSeed {
  /** Stable, URL-safe identifier; also the tool's `slug`. */
  slug: string
  name: string
  nameZh?: string
  /** Owner path. Industry: "<sectorKey>". Public: "<domainKey>.<pdtKey>". */
  owner: string
  /** Tool-level blurb — describes the *product*, not any single MCP. */
  blurb: string
  blurbZh: string
  /** Zero or more MCP servers exposed by this tool. */
  mcps: McpSeed[]
}

// ─── Industry sectors (no PDTs) ──────────────────────────────────────────────
export const INDUSTRY_SECTORS: McpSectorSeed[] = [
  { key: "wireless", label: "Wireless", labelZh: "无线", short: "WRLS" },
  { key: "datacom", label: "Datacom", labelZh: "数通", short: "DTCM" },
  { key: "cloud", label: "Cloud", labelZh: "云", short: "CLD" },
  { key: "terminals", label: "Terminals", labelZh: "终端", short: "TERM" },
  { key: "optical", label: "Optical", labelZh: "光网络", short: "OPT" },
  { key: "carrier", label: "Carrier BG", labelZh: "运营商 BG", short: "CARR" },
  { key: "enterprise", label: "Enterprise BG", labelZh: "企业 BG", short: "ENT" },
  { key: "consumer", label: "Consumer BG", labelZh: "消费者 BG", short: "CONS" },
  { key: "energy", label: "Digital Energy", labelZh: "数字能源", short: "ENRG" },
  { key: "auto", label: "Intelligent Auto", labelZh: "智能汽车", short: "AUTO" },
  { key: "smartcity", label: "Smart City", labelZh: "智慧城市", short: "CITY" },
  { key: "industrial", label: "Industrial", labelZh: "工业", short: "IND" },
]

// ─── Public service domains and PDTs ─────────────────────────────────────────
export const PUBLIC_DOMAINS: McpDomainSeed[] = [
  {
    key: "airnd",
    label: "AI R&D",
    labelZh: "AI 研发",
    short: "AI",
    pdts: [
      { key: "sysdesign", label: "System Design", labelZh: "系统设计" },
      { key: "devsvcs", label: "Development Services", labelZh: "开发服务" },
      { key: "testsvcs", label: "Testing Services", labelZh: "测试服务" },
      { key: "rndmaint", label: "R&D Maintenance", labelZh: "研发维护" },
      { key: "aiprod", label: "AI Production Line", labelZh: "AI 生产线" },
      { key: "knowsvcs", label: "Knowledge Services", labelZh: "知识服务" },
    ],
  },
  {
    key: "prodsw",
    label: "Product & Software",
    labelZh: "产品与软件",
    short: "P&S",
    pdts: [
      { key: "research", label: "Research & Innovation", labelZh: "研究与创新" },
      { key: "prodmgmt", label: "Product Management", labelZh: "产品管理" },
      { key: "buildsvcs", label: "Build Services", labelZh: "构建服务" },
      { key: "release", label: "Release & Delivery", labelZh: "发布与交付" },
      { key: "uxdesign", label: "UX & Design Systems", labelZh: "体验与设计系统" },
      { key: "i18n", label: "Localization", labelZh: "本地化" },
      { key: "support", label: "Customer Support", labelZh: "客户支持" },
      { key: "analytics", label: "Product Analytics", labelZh: "产品分析" },
    ],
  },
  {
    key: "hardware",
    label: "Hardware",
    labelZh: "硬件",
    short: "HW",
    pdts: [
      { key: "schematic", label: "Schematic Design", labelZh: "原理图设计" },
      { key: "pcb", label: "PCB Layout", labelZh: "PCB 布局" },
      { key: "mech", label: "Mechanical CAD", labelZh: "机械 CAD" },
      { key: "thermals", label: "Thermals & EMC", labelZh: "热与 EMC" },
      { key: "hwverif", label: "HW Verification", labelZh: "硬件验证" },
    ],
  },
  {
    key: "proddigi",
    label: "Product Digitization",
    labelZh: "产品数字化",
    short: "PD",
    pdts: [
      { key: "plm", label: "Product Lifecycle Mgmt", labelZh: "产品生命周期管理" },
      { key: "twin", label: "Digital Twin", labelZh: "数字孪生" },
      { key: "datacat", label: "Data Catalog", labelZh: "数据目录" },
      { key: "process", label: "Process Automation", labelZh: "流程自动化" },
    ],
  },
  {
    key: "infra",
    label: "Infrastructure",
    labelZh: "基础设施",
    short: "INF",
    pdts: [
      { key: "compute", label: "Compute Platform", labelZh: "算力平台" },
      { key: "network", label: "Internal Network", labelZh: "内部网络" },
      { key: "storage", label: "Storage & Backup", labelZh: "存储与备份" },
      { key: "iam", label: "Identity & Access", labelZh: "身份与访问" },
      { key: "observ", label: "Observability", labelZh: "可观测性" },
      { key: "secops", label: "Security Ops", labelZh: "安全运营" },
    ],
  },
]

// ─── Tools + MCPs ────────────────────────────────────────────────────────────
// Compact constructors keep the source close to the original design data.

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

function tool(
  name: string,
  owner: string,
  blurb: string,
  blurbZh: string,
  mcps: McpSeed[],
  opts: { nameZh?: string } = {},
): McpToolSeed {
  return {
    slug: toSlug(name),
    name,
    nameZh: opts.nameZh,
    owner,
    blurb,
    blurbZh,
    mcps,
  }
}

function mcp(
  slug: string,
  status: McpStatus,
  depsCount: number,
  blurb: string,
  blurbZh: string,
  tags: string[],
  opts: { name?: string; nameZh?: string } = {},
): McpSeed {
  return {
    slug,
    name: opts.name,
    nameZh: opts.nameZh,
    released: status === "released",
    inDev: status === "dev",
    depsCount,
    blurb,
    blurbZh,
    tags,
  }
}

/** Convenience: a tool with a single MCP whose slug is `<tool-slug>-mcp` and
 * which inherits the tool's blurb/name. Most tools use this shape; multi-MCP
 * tools (like CodeCheck) call `tool(...)` with an explicit mcps[] instead. */
function singleMcpTool(
  name: string,
  owner: string,
  status: McpStatus,
  depsCount: number,
  blurb: string,
  blurbZh: string,
  tags: string[],
  opts: { nameZh?: string } = {},
): McpToolSeed {
  const slug = toSlug(name)
  return tool(name, owner, blurb, blurbZh, [
    mcp(`${slug}-mcp`, status, depsCount, blurb, blurbZh, tags),
  ], opts)
}

/** Convenience: a tool with **no** MCPs yet — renders a single placeholder
 * tile. Used for "none"-status tools so they still appear in the panorama. */
function noMcpTool(
  name: string,
  owner: string,
  blurb: string,
  blurbZh: string,
  opts: { nameZh?: string } = {},
): McpToolSeed {
  return tool(name, owner, blurb, blurbZh, [], opts)
}

export const MCP_TOOLS: McpToolSeed[] = [
  // ── Industry · Wireless ─────────────────────────────────────────
  singleMcpTool("5G-Sim", "wireless", "released", 12, "End-to-end 5G NR link simulator", "端到端 5G NR 链路仿真器", ["sim", "rf"]),
  singleMcpTool("RadioPlan", "wireless", "released", 7, "Cell planning + propagation maps", "小区规划与传播图", ["planning", "gis"]),
  singleMcpTool("SpectrumMgr", "wireless", "dev", 4, "Spectrum allocation & interference", "频谱分配与干扰分析", ["spectrum"]),
  singleMcpTool("BeamOpt", "wireless", "dev", 3, "Massive-MIMO beam optimizer", "大规模 MIMO 波束优化器", ["mimo", "optim"]),
  noMcpTool("AntennaCAD", "wireless", "Antenna 3D modeling suite", "天线三维建模套件"),
  singleMcpTool("RANConfig", "wireless", "released", 9, "RAN parameter rollout & rollback", "RAN 参数发布与回滚", ["config", "ran"]),
  noMcpTool("FieldTest", "wireless", "On-site drive-test recorder", "现场路测记录工具"),

  // ── Industry · Datacom ─────────────────────────────────────────
  singleMcpTool("RouteForge", "datacom", "released", 14, "BGP/OSPF policy author + simulator", "BGP/OSPF 策略编辑与仿真", ["routing"]),
  singleMcpTool("PacketLens", "datacom", "released", 8, "Distributed packet capture & search", "分布式抓包与检索", ["pcap"]),
  singleMcpTool("ConfigPilot", "datacom", "dev", 11, "Multi-vendor device config diff & deploy", "多厂家设备配置对比与下发", ["config"]),
  singleMcpTool("TopoMap", "datacom", "dev", 5, "Live L2/L3 topology graph", "实时 L2/L3 拓扑图", ["graph"]),
  noMcpTool("NetSim", "datacom", "Discrete-event network simulator", "离散事件网络仿真器"),

  // ── Industry · Cloud ───────────────────────────────────────────
  singleMcpTool("K8sOps", "cloud", "released", 22, "Cluster lifecycle + GitOps", "集群生命周期与 GitOps", ["k8s", "gitops"]),
  singleMcpTool("ServiceMesh", "cloud", "released", 16, "Mesh policy + mTLS console", "服务网格策略与 mTLS 控制台", ["mesh"]),
  singleMcpTool("CostExplorer", "cloud", "released", 4, "Multi-cloud spend attribution", "多云成本分摊", ["finops"]),
  singleMcpTool("CloudAudit", "cloud", "dev", 9, "Continuous compliance evidence", "持续合规证据采集", ["security"]),
  singleMcpTool("MultiCloud", "cloud", "dev", 6, "Cross-provider workload mover", "跨云负载迁移", ["multi"]),
  noMcpTool("EdgeProvision", "cloud", "Edge node bring-up automation", "边缘节点开通自动化"),

  // ── Industry · Terminals ───────────────────────────────────────
  singleMcpTool("DeviceSim", "terminals", "released", 6, "Phone/tablet behavioral simulator", "手机/平板行为仿真器", ["sim"]),
  singleMcpTool("FirmwareForge", "terminals", "dev", 10, "Cross-arch firmware build matrix", "跨架构固件构建矩阵", ["build", "fw"]),
  singleMcpTool("BatteryLab", "terminals", "released", 3, "Battery wear + thermal logs", "电池老化与热日志", ["battery"]),
  noMcpTool("ScreenTest", "terminals", "Pixel-level display QA suite", "像素级显示 QA 套件"),
  noMcpTool("BSP-Pack", "terminals", "Board support package authoring", "BSP 制作工具"),

  // ── Industry · Optical ────────────────────────────────────────
  singleMcpTool("OFiberPlan", "optical", "released", 5, "Fiber route + budget calculator", "光纤路由与预算计算", ["fiber"]),
  singleMcpTool("WDM-Tune", "optical", "dev", 3, "WDM channel tuner & monitor", "WDM 通道调谐与监控", ["wdm"]),
  noMcpTool("OTDR-Sweep", "optical", "OTDR scan ingestion & alerts", "OTDR 扫描接入与告警"),

  // ── Industry · Carrier ────────────────────────────────────────
  singleMcpTool("CarrierOps", "carrier", "released", 8, "Operator NMS workflows", "运营商 NMS 工作流", ["nms"]),
  singleMcpTool("ChurnPredict", "carrier", "dev", 2, "Subscriber churn signals", "用户流失信号分析", ["ml"]),

  // ── Industry · Enterprise ─────────────────────────────────────
  singleMcpTool("EntDeploy", "enterprise", "released", 4, "Enterprise rollout playbooks", "企业部署剧本", ["deploy"]),
  noMcpTool("LicensePool", "enterprise", "License inventory & reclaim", "许可证清点与回收"),

  // ── Industry · Consumer ──────────────────────────────────────
  singleMcpTool("ConsumerCRM", "consumer", "released", 3, "Consumer device support CRM", "消费者设备支持 CRM", ["crm"]),
  singleMcpTool("RetailKit", "consumer", "dev", 2, "Retail demo + provisioning", "零售演示与开通", ["retail"]),

  // ── Industry · Digital Energy ─────────────────────────────────
  singleMcpTool("GridSCADA", "energy", "dev", 7, "Grid SCADA bridge + analytics", "电网 SCADA 桥接与分析", ["scada"]),
  singleMcpTool("InverterTune", "energy", "released", 2, "PV inverter parameter tuning", "光伏逆变器参数调优", ["pv"]),

  // ── Industry · Intelligent Auto ───────────────────────────────
  singleMcpTool("ADAS-Replay", "auto", "released", 5, "ADAS sensor log replay farm", "ADAS 传感器日志回放集群", ["adas"]),
  singleMcpTool("OTA-Vehicle", "auto", "dev", 4, "Vehicle OTA campaign manager", "整车 OTA 活动管理", ["ota"]),
  noMcpTool("HD-Map", "auto", "HD map authoring + diff", "高精地图编辑与对比"),

  // ── Industry · Smart City ─────────────────────────────────────
  singleMcpTool("CityOpsHub", "smartcity", "dev", 6, "Municipal ops command", "城市运营指挥", ["city"]),
  singleMcpTool("TrafficSig", "smartcity", "released", 3, "Adaptive traffic signal control", "自适应交通信号控制", ["traffic"]),

  // ── Industry · Industrial ─────────────────────────────────────
  singleMcpTool("MES-Bridge", "industrial", "released", 9, "MES ↔ shop-floor data bridge", "MES 与产线数据桥接", ["mes"]),
  singleMcpTool("RobotOrchestrate", "industrial", "dev", 4, "Cell-level robot orchestration", "工位级机器人编排", ["robotics"]),
  noMcpTool("PredMaint", "industrial", "Predictive maintenance baseline", "预测性维护基线"),

  // ── Public · AI R&D · System Design ────────────────────────────
  singleMcpTool("ArchDesigner", "airnd.sysdesign", "released", 9, "Block-diagram architecture authoring", "架构框图编辑", ["arch", "spec"]),
  singleMcpTool("ReqAnalyzer", "airnd.sysdesign", "dev", 6, "Requirement extraction from docs", "从文档抽取需求", ["req", "nlp"]),
  singleMcpTool("SpecGen", "airnd.sysdesign", "released", 4, "Boilerplate spec generator", "规范文档生成器", ["spec"]),
  noMcpTool("TradeStudy", "airnd.sysdesign", "Trade-study comparison matrix", "权衡分析矩阵"),

  // ── Public · AI R&D · Development Services ─────────────────────
  singleMcpTool("IDE", "airnd.devsvcs", "released", 38, "Internal IDE with AI assist", "内部 AI 增强 IDE", ["ide", "editor"]),
  // CodeCheck is a static-analysis suite exposing two MCP surfaces:
  // codecheck-mcp (shipped) and molint-mcp (in dev).
  tool("CodeCheck", "airnd.devsvcs", "Static analysis suite", "静态分析套件", [
    mcp("codecheck-mcp", "released", 26, "Static analysis + style enforcement", "静态分析与代码风格检查", ["lint", "static"]),
    mcp("molint-mcp", "dev", 8, "Modular lint engine", "模块化 Lint 引擎", ["lint"]),
  ]),
  singleMcpTool("DT", "airnd.devsvcs", "dev", 18, "Distributed Tracing for builds", "构建分布式追踪", ["trace"]),
  singleMcpTool("CodeNav", "airnd.devsvcs", "released", 15, "Repo-scale code search & xref", "仓库级代码检索与交叉引用", ["search"]),
  singleMcpTool("SnippetHub", "airnd.devsvcs", "dev", 8, "Reusable snippet registry", "可复用代码片段注册表", ["snippet"]),
  noMcpTool("RefactorBot", "airnd.devsvcs", "Bulk refactor proposer", "批量重构建议器"),

  // ── Public · AI R&D · Testing Services ─────────────────────────
  singleMcpTool("TestForge", "airnd.testsvcs", "released", 12, "Test plan + suite generator", "测试计划与用例生成器", ["tests"]),
  singleMcpTool("AutoTest", "airnd.testsvcs", "released", 9, "Browser/device test farm", "浏览器/终端测试集群", ["e2e"]),
  singleMcpTool("PerfBench", "airnd.testsvcs", "dev", 7, "Reproducible perf benchmarks", "可复现性能基准", ["perf"]),
  noMcpTool("ChaosKit", "airnd.testsvcs", "Chaos engineering scenarios", "混沌工程场景"),
  singleMcpTool("CoverageVue", "airnd.testsvcs", "dev", 4, "Coverage drift visualizer", "覆盖率漂移可视化", ["coverage"]),

  // ── Public · AI R&D · R&D Maintenance ──────────────────────────
  singleMcpTool("BugTracker", "airnd.rndmaint", "released", 30, "Issue tracker + SLA workflows", "缺陷跟踪与 SLA 工作流", ["bugs"]),
  singleMcpTool("IncidentMgr", "airnd.rndmaint", "released", 18, "Incident response coordination", "事故响应协同", ["sre"]),
  singleMcpTool("RootCause", "airnd.rndmaint", "dev", 11, "Causality across telemetry", "全链路根因分析", ["rca", "ml"]),
  noMcpTool("HotfixPilot", "airnd.rndmaint", "Hotfix branching automation", "热修复分支自动化"),

  // ── Public · AI R&D · AI Production Line ───────────────────────
  singleMcpTool("ModelHub", "airnd.aiprod", "released", 22, "Model registry + lineage", "模型注册与血缘", ["mlops"]),
  singleMcpTool("DataPipe", "airnd.aiprod", "released", 16, "Pipeline orchestrator", "流水线编排器", ["etl"]),
  singleMcpTool("TrainOps", "airnd.aiprod", "dev", 14, "Distributed training scheduler", "分布式训练调度", ["train"]),
  singleMcpTool("EvalSuite", "airnd.aiprod", "dev", 8, "Model eval & A/B harness", "模型评估与 A/B 框架", ["eval"]),
  singleMcpTool("ServeMesh", "airnd.aiprod", "released", 11, "Model serving with autoscale", "弹性扩缩的模型服务", ["serve"]),

  // ── Public · AI R&D · Knowledge Services ───────────────────────
  singleMcpTool("WikiSync", "airnd.knowsvcs", "released", 19, "Wiki ingestion + sync", "Wiki 接入与同步", ["wiki"]),
  singleMcpTool("DocsGen", "airnd.knowsvcs", "released", 14, "Auto-generated reference docs", "自动生成参考文档", ["docs"]),
  singleMcpTool("KnowledgeGraph", "airnd.knowsvcs", "dev", 9, "Org-wide entity graph", "组织级实体图谱", ["graph"]),
  singleMcpTool("AskOrg", "airnd.knowsvcs", "dev", 6, "Org RAG-style Q&A", "组织 RAG 问答", ["rag"]),
  noMcpTool("Onboarding", "airnd.knowsvcs", "New-hire knowledge path", "新人知识路径"),

  // ── Public · Product & Software · Research ─────────────────────
  singleMcpTool("IdeaPad", "prodsw.research", "dev", 5, "Idea capture + scoring", "创意收集与评分", ["ideation"]),
  singleMcpTool("PatentSearch", "prodsw.research", "released", 3, "Patent prior-art search", "专利现有技术检索", ["patent"]),

  // ── Public · Product & Software · Product Mgmt ─────────────────
  singleMcpTool("RoadmapHub", "prodsw.prodmgmt", "released", 12, "Org-wide roadmap & dependencies", "组织级路线图与依赖", ["roadmap"]),
  singleMcpTool("FeatureFlags", "prodsw.prodmgmt", "released", 8, "Targeted feature rollout", "定向特性灰度", ["flags"]),
  singleMcpTool("CustomerVoice", "prodsw.prodmgmt", "dev", 4, "Voice-of-customer aggregator", "客户之声聚合", ["voc"]),

  // ── Public · Product & Software · Build ────────────────────────
  singleMcpTool("BuildBot", "prodsw.buildsvcs", "released", 33, "Distributed build farm", "分布式构建集群", ["build"]),
  singleMcpTool("ArtifactReg", "prodsw.buildsvcs", "released", 24, "Binary artifact store", "二进制制品库", ["artifact"]),
  singleMcpTool("PipelineHub", "prodsw.buildsvcs", "dev", 15, "Pipeline-as-code platform", "流水线即代码平台", ["ci"]),
  noMcpTool("CacheGrid", "prodsw.buildsvcs", "Cross-job build cache", "跨任务构建缓存"),

  // ── Public · Product & Software · Release ──────────────────────
  singleMcpTool("ReleaseTrain", "prodsw.release", "released", 11, "Release train coordinator", "发布列车协同", ["release"]),
  singleMcpTool("CanaryGuard", "prodsw.release", "dev", 7, "Progressive delivery guard", "渐进式发布守门员", ["canary"]),

  // ── Public · Product & Software · UX ───────────────────────────
  singleMcpTool("DesignTokens", "prodsw.uxdesign", "released", 9, "Cross-platform token sync", "跨平台设计令牌同步", ["tokens"]),
  singleMcpTool("ComponentLab", "prodsw.uxdesign", "dev", 6, "Component playground + a11y", "组件实验室与无障碍检查", ["ui"]),

  // ── Public · Product & Software · i18n ─────────────────────────
  singleMcpTool("LocoSync", "prodsw.i18n", "released", 4, "Translation memory sync", "翻译记忆同步", ["i18n"]),
  noMcpTool("PseudoLocale", "prodsw.i18n", "Pseudo-locale generator", "伪本地化生成器"),

  // ── Public · Product & Software · Support ──────────────────────
  singleMcpTool("TicketPilot", "prodsw.support", "released", 7, "Support ticket triage", "工单分诊", ["support"]),
  singleMcpTool("KBPilot", "prodsw.support", "dev", 3, "Self-serve KB authoring", "自助知识库编辑", ["kb"]),

  // ── Public · Product & Software · Analytics ────────────────────
  singleMcpTool("EventBus", "prodsw.analytics", "released", 18, "Product event ingestion", "产品事件接入", ["analytics"]),
  singleMcpTool("FunnelLab", "prodsw.analytics", "dev", 5, "Funnel/cohort analytics", "漏斗与群组分析", ["funnel"]),

  // ── Public · Hardware ──────────────────────────────────────────
  singleMcpTool("SchemaPilot", "hardware.schematic", "released", 6, "Schematic linting + reuse", "原理图检查与复用", ["schematic"]),
  singleMcpTool("PCBFlow", "hardware.pcb", "released", 8, "PCB layout review tools", "PCB 布局评审工具", ["pcb"]),
  singleMcpTool("MechCAD-Sync", "hardware.mech", "dev", 4, "Mechanical CAD versioning", "机械 CAD 版本管理", ["cad"]),
  singleMcpTool("ThermSim", "hardware.thermals", "dev", 3, "Thermal simulation runner", "热仿真运行器", ["thermal"]),
  noMcpTool("EMC-Lab", "hardware.thermals", "EMC test orchestration", "EMC 测试编排"),
  singleMcpTool("HWVerif", "hardware.hwverif", "released", 5, "HW verification dashboard", "硬件验证仪表盘", ["verif"]),

  // ── Public · Product Digitization ─────────────────────────────
  singleMcpTool("PLM-Bridge", "proddigi.plm", "released", 14, "PLM data bridge to R&D", "PLM 数据桥接研发", ["plm"]),
  singleMcpTool("TwinForge", "proddigi.twin", "dev", 6, "Digital twin authoring", "数字孪生编辑器", ["twin"]),
  singleMcpTool("DataCatalog", "proddigi.datacat", "released", 21, "Org data catalog", "组织数据目录", ["data"]),
  singleMcpTool("ProcessFlow", "proddigi.process", "dev", 8, "Process automation studio", "流程自动化编辑器", ["bpm"]),
  singleMcpTool("FormBuilder", "proddigi.process", "released", 5, "Internal form builder", "内部表单构建器", ["forms"]),

  // ── Public · Infrastructure ───────────────────────────────────
  singleMcpTool("ComputePilot", "infra.compute", "released", 28, "Compute fleet manager", "算力集群管理", ["compute"]),
  singleMcpTool("NetCore", "infra.network", "released", 19, "Internal network control", "内部网络管控", ["network"]),
  singleMcpTool("StoreOps", "infra.storage", "released", 17, "Storage tiering + backup", "存储分层与备份", ["storage"]),
  singleMcpTool("VaultID", "infra.iam", "released", 31, "Identity + secrets", "身份与机密管理", ["iam"]),
  singleMcpTool("ObservHub", "infra.observ", "released", 26, "Metrics/logs/traces hub", "指标/日志/追踪中枢", ["o11y"]),
  singleMcpTool("AlertPilot", "infra.observ", "dev", 12, "Alert routing & dedupe", "告警路由与去重", ["alert"]),
  singleMcpTool("SecOpsCenter", "infra.secops", "released", 14, "Security operations console", "安全运营控制台", ["secops"]),
  singleMcpTool("ThreatHunt", "infra.secops", "dev", 7, "Threat hunting playbooks", "威胁狩猎剧本", ["threat"]),
  noMcpTool("BackupVerify", "infra.storage", "Backup restore drill runner", "备份恢复演练"),
]

// ─── Helpers (used by both server and client) ────────────────────────────────

/** Derive the runtime status of an MCP row. */
export function deriveStatus(row: {
  extensionId: string | null
  inDev: boolean
}): McpStatus {
  if (row.extensionId) return "released"
  if (row.inDev) return "dev"
  return "none"
}

/** Roll a tool's MCPs up to a single tool-level status — "released wins". */
export function rollupStatus(statuses: McpStatus[]): McpStatus {
  if (statuses.some((s) => s === "released")) return "released"
  if (statuses.some((s) => s === "dev")) return "dev"
  return "none"
}

/** Resolve the layer + group keys for a tool's `owner` path. */
export function ownerToParts(owner: string): {
  layer: "industry" | "public"
  primary: string
  secondary?: string
} {
  if (owner.includes(".")) {
    const [primary, secondary] = owner.split(".")
    return { layer: "public", primary: primary!, secondary }
  }
  return { layer: "industry", primary: owner }
}
