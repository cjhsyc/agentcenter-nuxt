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
  /** Optional explicit display name; defaults to the slug at seed time. */
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

/** Convenience: a tool with a single MCP, slug explicit so it can describe
 * what the MCP exposes (`bgp-policy-mcp`, not `routeforge-mcp`). The MCP
 * inherits the tool's blurb by default. Multi-MCP tools call `tool(...)`
 * with an explicit mcps[] instead. */
function oneMcpTool(
  name: string,
  owner: string,
  blurb: string,
  blurbZh: string,
  mcpSlug: string,
  status: McpStatus,
  depsCount: number,
  tags: string[],
  opts: { nameZh?: string; mcpBlurb?: string; mcpBlurbZh?: string } = {},
): McpToolSeed {
  return tool(name, owner, blurb, blurbZh, [
    mcp(
      mcpSlug,
      status,
      depsCount,
      opts.mcpBlurb ?? blurb,
      opts.mcpBlurbZh ?? blurbZh,
      tags,
    ),
  ], { nameZh: opts.nameZh })
}

/** Convenience: a tool with **no** MCPs yet — renders a single placeholder
 * tile. Used for legacy / manual-workflow tools that truly don't need one. */
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
  oneMcpTool("5G-Sim", "wireless", "End-to-end 5G NR link simulator", "端到端 5G NR 链路仿真器", "linksim-mcp", "released", 12, ["sim", "rf"]),
  oneMcpTool("RadioPlan", "wireless", "Cell planning + propagation maps", "小区规划与传播图", "propmap-mcp", "released", 7, ["planning", "gis"]),
  oneMcpTool("SpectrumMgr", "wireless", "Spectrum allocation & interference", "频谱分配与干扰分析", "spectrum-mcp", "dev", 4, ["spectrum"]),
  oneMcpTool("BeamOpt", "wireless", "Massive-MIMO beam optimizer", "大规模 MIMO 波束优化器", "beamform-mcp", "dev", 3, ["mimo", "optim"]),
  noMcpTool("AntennaCAD", "wireless", "Antenna 3D modeling suite", "天线三维建模套件"),
  // RANConfig splits rollout and rollback into separate MCPs — common pattern
  // where dangerous operations get an isolated surface for safer agent use.
  tool("RANConfig", "wireless", "RAN parameter rollout & rollback", "RAN 参数发布与回滚", [
    mcp("ran-config-mcp", "released", 6, "Author and push RAN parameter sets", "编辑并下发 RAN 参数", ["config", "ran"]),
    mcp("ran-rollback-mcp", "released", 3, "Targeted RAN parameter rollback", "RAN 参数定向回滚", ["rollback", "ran"]),
  ]),
  oneMcpTool("FieldTest", "wireless", "On-site drive-test recorder", "现场路测记录工具", "drive-test-mcp", "dev", 1, ["field"]),

  // ── Industry · Datacom ─────────────────────────────────────────
  tool("RouteForge", "datacom", "BGP/OSPF policy author + simulator", "BGP/OSPF 策略编辑与仿真", [
    mcp("bgp-policy-mcp", "released", 9, "BGP policy editor + diff", "BGP 策略编辑与对比", ["routing", "bgp"]),
    mcp("ospf-mcp", "released", 5, "OSPF area + cost simulation", "OSPF 区域与代价仿真", ["routing", "ospf"]),
  ]),
  oneMcpTool("PacketLens", "datacom", "Distributed packet capture & search", "分布式抓包与检索", "pcap-search-mcp", "released", 8, ["pcap"]),
  oneMcpTool("ConfigPilot", "datacom", "Multi-vendor device config diff & deploy", "多厂家设备配置对比与下发", "device-config-mcp", "dev", 11, ["config"]),
  oneMcpTool("TopoMap", "datacom", "Live L2/L3 topology graph", "实时 L2/L3 拓扑图", "topo-graph-mcp", "dev", 5, ["graph"]),
  oneMcpTool("NetSim", "datacom", "Discrete-event network simulator", "离散事件网络仿真器", "netsim-mcp", "dev", 3, ["sim"]),

  // ── Industry · Cloud ───────────────────────────────────────────
  // K8sOps is a 3-MCP showcase: imperative kubectl, declarative helm, gitops.
  tool("K8sOps", "cloud", "Cluster lifecycle + GitOps", "集群生命周期与 GitOps", [
    mcp("kubectl-mcp", "released", 12, "Imperative cluster operations", "命令式集群操作", ["k8s"]),
    mcp("helm-mcp", "released", 7, "Helm chart install + diff", "Helm Chart 安装与对比", ["k8s", "helm"]),
    mcp("gitops-mcp", "dev", 3, "ArgoCD-style declarative sync", "ArgoCD 风格声明式同步", ["gitops"]),
  ]),
  tool("ServiceMesh", "cloud", "Mesh policy + mTLS console", "服务网格策略与 mTLS 控制台", [
    mcp("mesh-policy-mcp", "released", 10, "Traffic + auth policy editor", "流量与鉴权策略编辑", ["mesh"]),
    mcp("mtls-mcp", "released", 6, "mTLS cert rotation", "mTLS 证书轮换", ["mesh", "mtls"]),
  ]),
  oneMcpTool("CostExplorer", "cloud", "Multi-cloud spend attribution", "多云成本分摊", "finops-mcp", "released", 4, ["finops"]),
  oneMcpTool("CloudAudit", "cloud", "Continuous compliance evidence", "持续合规证据采集", "compliance-mcp", "dev", 9, ["security"]),
  oneMcpTool("MultiCloud", "cloud", "Cross-provider workload mover", "跨云负载迁移", "workload-mover-mcp", "dev", 6, ["multi"]),
  oneMcpTool("EdgeProvision", "cloud", "Edge node bring-up automation", "边缘节点开通自动化", "edge-bringup-mcp", "dev", 2, ["edge"]),

  // ── Industry · Terminals ───────────────────────────────────────
  oneMcpTool("DeviceSim", "terminals", "Phone/tablet behavioral simulator", "手机/平板行为仿真器", "device-sim-mcp", "released", 6, ["sim"]),
  tool("FirmwareForge", "terminals", "Cross-arch firmware build matrix", "跨架构固件构建矩阵", [
    mcp("firmware-build-mcp", "dev", 7, "Cross-arch firmware build", "跨架构固件构建", ["build", "fw"]),
    mcp("fw-sign-mcp", "dev", 3, "Signed firmware image assembly", "已签名固件镜像组装", ["fw", "sign"]),
  ]),
  oneMcpTool("BatteryLab", "terminals", "Battery wear + thermal logs", "电池老化与热日志", "battery-log-mcp", "released", 3, ["battery"]),
  noMcpTool("ScreenTest", "terminals", "Pixel-level display QA suite", "像素级显示 QA 套件"),
  oneMcpTool("BSP-Pack", "terminals", "Board support package authoring", "BSP 制作工具", "bsp-author-mcp", "dev", 4, ["bsp"]),

  // ── Industry · Optical ────────────────────────────────────────
  oneMcpTool("OFiberPlan", "optical", "Fiber route + budget calculator", "光纤路由与预算计算", "fiber-route-mcp", "released", 5, ["fiber"]),
  oneMcpTool("WDM-Tune", "optical", "WDM channel tuner & monitor", "WDM 通道调谐与监控", "wdm-channel-mcp", "dev", 3, ["wdm"]),
  noMcpTool("OTDR-Sweep", "optical", "OTDR scan ingestion & alerts", "OTDR 扫描接入与告警"),

  // ── Industry · Carrier ────────────────────────────────────────
  oneMcpTool("CarrierOps", "carrier", "Operator NMS workflows", "运营商 NMS 工作流", "nms-workflow-mcp", "released", 8, ["nms"]),
  oneMcpTool("ChurnPredict", "carrier", "Subscriber churn signals", "用户流失信号分析", "churn-signal-mcp", "dev", 2, ["ml"]),

  // ── Industry · Enterprise ─────────────────────────────────────
  oneMcpTool("EntDeploy", "enterprise", "Enterprise rollout playbooks", "企业部署剧本", "rollout-playbook-mcp", "released", 4, ["deploy"]),
  oneMcpTool("LicensePool", "enterprise", "License inventory & reclaim", "许可证清点与回收", "license-mcp", "dev", 5, ["license"]),

  // ── Industry · Consumer ──────────────────────────────────────
  oneMcpTool("ConsumerCRM", "consumer", "Consumer device support CRM", "消费者设备支持 CRM", "crm-ticket-mcp", "released", 3, ["crm"]),
  oneMcpTool("RetailKit", "consumer", "Retail demo + provisioning", "零售演示与开通", "retail-demo-mcp", "dev", 2, ["retail"]),

  // ── Industry · Digital Energy ─────────────────────────────────
  oneMcpTool("GridSCADA", "energy", "Grid SCADA bridge + analytics", "电网 SCADA 桥接与分析", "scada-bridge-mcp", "dev", 7, ["scada"]),
  oneMcpTool("InverterTune", "energy", "PV inverter parameter tuning", "光伏逆变器参数调优", "pv-tune-mcp", "released", 2, ["pv"]),

  // ── Industry · Intelligent Auto ───────────────────────────────
  oneMcpTool("ADAS-Replay", "auto", "ADAS sensor log replay farm", "ADAS 传感器日志回放集群", "sensor-replay-mcp", "released", 5, ["adas"]),
  oneMcpTool("OTA-Vehicle", "auto", "Vehicle OTA campaign manager", "整车 OTA 活动管理", "ota-campaign-mcp", "dev", 4, ["ota"]),
  oneMcpTool("HD-Map", "auto", "HD map authoring + diff", "高精地图编辑与对比", "hdmap-author-mcp", "dev", 3, ["map"]),

  // ── Industry · Smart City ─────────────────────────────────────
  oneMcpTool("CityOpsHub", "smartcity", "Municipal ops command", "城市运营指挥", "city-ops-mcp", "dev", 6, ["city"]),
  oneMcpTool("TrafficSig", "smartcity", "Adaptive traffic signal control", "自适应交通信号控制", "signal-control-mcp", "released", 3, ["traffic"]),

  // ── Industry · Industrial ─────────────────────────────────────
  oneMcpTool("MES-Bridge", "industrial", "MES ↔ shop-floor data bridge", "MES 与产线数据桥接", "mes-bridge-mcp", "released", 9, ["mes"]),
  oneMcpTool("RobotOrchestrate", "industrial", "Cell-level robot orchestration", "工位级机器人编排", "robot-cell-mcp", "dev", 4, ["robotics"]),
  oneMcpTool("PredMaint", "industrial", "Predictive maintenance baseline", "预测性维护基线", "predmaint-mcp", "dev", 2, ["pdm"]),

  // ── Public · AI R&D · System Design ────────────────────────────
  oneMcpTool("ArchDesigner", "airnd.sysdesign", "Block-diagram architecture authoring", "架构框图编辑", "arch-block-mcp", "released", 9, ["arch", "spec"]),
  oneMcpTool("ReqAnalyzer", "airnd.sysdesign", "Requirement extraction from docs", "从文档抽取需求", "req-extract-mcp", "dev", 6, ["req", "nlp"]),
  oneMcpTool("SpecGen", "airnd.sysdesign", "Boilerplate spec generator", "规范文档生成器", "spec-gen-mcp", "released", 4, ["spec"]),
  noMcpTool("TradeStudy", "airnd.sysdesign", "Trade-study comparison matrix", "权衡分析矩阵"),

  // ── Public · AI R&D · Development Services ─────────────────────
  // IDE exposes its code-context surface separately from its pair-programming
  // surface — agents that only need read access don't need the assistant.
  tool("IDE", "airnd.devsvcs", "Internal IDE with AI assist", "内部 AI 增强 IDE", [
    mcp("code-context-mcp", "released", 28, "Project-wide code context + reads", "项目级代码上下文与读取", ["ide", "context"]),
    mcp("ai-pair-mcp", "released", 14, "AI pair-programming actions", "AI 结对编程操作", ["ide", "ai"]),
  ]),
  // CodeCheck is a static-analysis suite exposing two MCP surfaces:
  // codecheck-mcp (shipped) and molint-mcp (in dev).
  tool("CodeCheck", "airnd.devsvcs", "Static analysis suite", "静态分析套件", [
    mcp("codecheck-mcp", "released", 26, "Static analysis + style enforcement", "静态分析与代码风格检查", ["lint", "static"]),
    mcp("molint-mcp", "dev", 8, "Modular lint engine", "模块化 Lint 引擎", ["lint"]),
  ]),
  oneMcpTool("DT", "airnd.devsvcs", "Distributed Tracing for builds", "构建分布式追踪", "trace-collect-mcp", "dev", 18, ["trace"]),
  tool("CodeNav", "airnd.devsvcs", "Repo-scale code search & xref", "仓库级代码检索与交叉引用", [
    mcp("code-search-mcp", "released", 10, "Full-text + symbol code search", "全文与符号代码检索", ["search"]),
    mcp("code-xref-mcp", "released", 7, "Cross-reference + call graph", "交叉引用与调用图", ["xref"]),
  ]),
  oneMcpTool("SnippetHub", "airnd.devsvcs", "Reusable snippet registry", "可复用代码片段注册表", "snippet-registry-mcp", "dev", 8, ["snippet"]),
  oneMcpTool("RefactorBot", "airnd.devsvcs", "Bulk refactor proposer", "批量重构建议器", "bulk-refactor-mcp", "dev", 5, ["refactor"]),

  // ── Public · AI R&D · Testing Services ─────────────────────────
  tool("TestForge", "airnd.testsvcs", "Test plan + suite generator", "测试计划与用例生成器", [
    mcp("testplan-mcp", "released", 8, "Test plan authoring", "测试计划编辑", ["tests"]),
    mcp("suite-gen-mcp", "released", 5, "Test suite scaffolding", "测试套件脚手架", ["tests"]),
  ]),
  tool("AutoTest", "airnd.testsvcs", "Browser/device test farm", "浏览器/终端测试集群", [
    mcp("browser-test-mcp", "released", 6, "Playwright-style browser runs", "Playwright 风格浏览器测试", ["e2e", "browser"]),
    mcp("device-test-mcp", "released", 4, "Physical-device test runs", "物理设备测试", ["e2e", "device"]),
  ]),
  oneMcpTool("PerfBench", "airnd.testsvcs", "Reproducible perf benchmarks", "可复现性能基准", "perf-bench-mcp", "dev", 7, ["perf"]),
  oneMcpTool("ChaosKit", "airnd.testsvcs", "Chaos engineering scenarios", "混沌工程场景", "chaos-scenario-mcp", "dev", 3, ["chaos"]),
  oneMcpTool("CoverageVue", "airnd.testsvcs", "Coverage drift visualizer", "覆盖率漂移可视化", "coverage-drift-mcp", "dev", 4, ["coverage"]),

  // ── Public · AI R&D · R&D Maintenance ──────────────────────────
  tool("BugTracker", "airnd.rndmaint", "Issue tracker + SLA workflows", "缺陷跟踪与 SLA 工作流", [
    mcp("issue-mcp", "released", 22, "Issue CRUD + queries", "缺陷增删改查与查询", ["bugs"]),
    mcp("sla-mcp", "released", 8, "SLA timer + escalation", "SLA 计时与升级", ["sla"]),
  ]),
  oneMcpTool("IncidentMgr", "airnd.rndmaint", "Incident response coordination", "事故响应协同", "incident-coord-mcp", "released", 18, ["sre"]),
  oneMcpTool("RootCause", "airnd.rndmaint", "Causality across telemetry", "全链路根因分析", "rca-mcp", "dev", 11, ["rca", "ml"]),
  oneMcpTool("HotfixPilot", "airnd.rndmaint", "Hotfix branching automation", "热修复分支自动化", "hotfix-branch-mcp", "dev", 4, ["hotfix"]),

  // ── Public · AI R&D · AI Production Line ───────────────────────
  tool("ModelHub", "airnd.aiprod", "Model registry + lineage", "模型注册与血缘", [
    mcp("model-registry-mcp", "released", 16, "Model versioning + tags", "模型版本与标签", ["mlops"]),
    mcp("lineage-mcp", "dev", 6, "Training data + run lineage", "训练数据与运行血缘", ["lineage"]),
  ]),
  oneMcpTool("DataPipe", "airnd.aiprod", "Pipeline orchestrator", "流水线编排器", "pipeline-orch-mcp", "released", 16, ["etl"]),
  oneMcpTool("TrainOps", "airnd.aiprod", "Distributed training scheduler", "分布式训练调度", "train-scheduler-mcp", "dev", 14, ["train"]),
  tool("EvalSuite", "airnd.aiprod", "Model eval & A/B harness", "模型评估与 A/B 框架", [
    mcp("eval-harness-mcp", "dev", 5, "Model evaluation harness", "模型评测框架", ["eval"]),
    mcp("ab-test-mcp", "dev", 3, "A/B comparison runs", "A/B 对比实验", ["ab"]),
  ]),
  oneMcpTool("ServeMesh", "airnd.aiprod", "Model serving with autoscale", "弹性扩缩的模型服务", "model-serve-mcp", "released", 11, ["serve"]),

  // ── Public · AI R&D · Knowledge Services ───────────────────────
  oneMcpTool("WikiSync", "airnd.knowsvcs", "Wiki ingestion + sync", "Wiki 接入与同步", "wiki-sync-mcp", "released", 19, ["wiki"]),
  tool("DocsGen", "airnd.knowsvcs", "Auto-generated reference docs", "自动生成参考文档", [
    mcp("docs-gen-mcp", "released", 9, "Markdown doc generation", "Markdown 文档生成", ["docs"]),
    mcp("api-ref-mcp", "released", 5, "API reference extraction", "API 参考抽取", ["docs", "api"]),
  ]),
  oneMcpTool("KnowledgeGraph", "airnd.knowsvcs", "Org-wide entity graph", "组织级实体图谱", "entity-graph-mcp", "dev", 9, ["graph"]),
  oneMcpTool("AskOrg", "airnd.knowsvcs", "Org RAG-style Q&A", "组织 RAG 问答", "org-rag-mcp", "dev", 6, ["rag"]),
  oneMcpTool("Onboarding", "airnd.knowsvcs", "New-hire knowledge path", "新人知识路径", "onboarding-path-mcp", "dev", 3, ["onboard"]),

  // ── Public · Product & Software · Research ─────────────────────
  oneMcpTool("IdeaPad", "prodsw.research", "Idea capture + scoring", "创意收集与评分", "idea-score-mcp", "dev", 5, ["ideation"]),
  oneMcpTool("PatentSearch", "prodsw.research", "Patent prior-art search", "专利现有技术检索", "patent-search-mcp", "released", 3, ["patent"]),

  // ── Public · Product & Software · Product Mgmt ─────────────────
  tool("RoadmapHub", "prodsw.prodmgmt", "Org-wide roadmap & dependencies", "组织级路线图与依赖", [
    mcp("roadmap-mcp", "released", 8, "Roadmap entry CRUD", "路线图条目增删改查", ["roadmap"]),
    mcp("deps-mcp", "released", 4, "Cross-team dependency graph", "跨团队依赖图", ["roadmap", "deps"]),
  ]),
  oneMcpTool("FeatureFlags", "prodsw.prodmgmt", "Targeted feature rollout", "定向特性灰度", "flags-mcp", "released", 8, ["flags"]),
  oneMcpTool("CustomerVoice", "prodsw.prodmgmt", "Voice-of-customer aggregator", "客户之声聚合", "voc-aggregator-mcp", "dev", 4, ["voc"]),

  // ── Public · Product & Software · Build ────────────────────────
  tool("BuildBot", "prodsw.buildsvcs", "Distributed build farm", "分布式构建集群", [
    mcp("build-runner-mcp", "released", 26, "Submit + tail build jobs", "提交与跟踪构建任务", ["build"]),
    mcp("build-cache-mcp", "dev", 7, "Remote build cache lookup", "远端构建缓存查询", ["build", "cache"]),
  ]),
  oneMcpTool("ArtifactReg", "prodsw.buildsvcs", "Binary artifact store", "二进制制品库", "artifact-mcp", "released", 24, ["artifact"]),
  oneMcpTool("PipelineHub", "prodsw.buildsvcs", "Pipeline-as-code platform", "流水线即代码平台", "pipeline-as-code-mcp", "dev", 15, ["ci"]),
  oneMcpTool("CacheGrid", "prodsw.buildsvcs", "Cross-job build cache", "跨任务构建缓存", "cache-grid-mcp", "dev", 6, ["cache"]),

  // ── Public · Product & Software · Release ──────────────────────
  oneMcpTool("ReleaseTrain", "prodsw.release", "Release train coordinator", "发布列车协同", "release-train-mcp", "released", 11, ["release"]),
  oneMcpTool("CanaryGuard", "prodsw.release", "Progressive delivery guard", "渐进式发布守门员", "canary-guard-mcp", "dev", 7, ["canary"]),

  // ── Public · Product & Software · UX ───────────────────────────
  oneMcpTool("DesignTokens", "prodsw.uxdesign", "Cross-platform token sync", "跨平台设计令牌同步", "tokens-sync-mcp", "released", 9, ["tokens"]),
  oneMcpTool("ComponentLab", "prodsw.uxdesign", "Component playground + a11y", "组件实验室与无障碍检查", "component-a11y-mcp", "dev", 6, ["ui"]),

  // ── Public · Product & Software · i18n ─────────────────────────
  oneMcpTool("LocoSync", "prodsw.i18n", "Translation memory sync", "翻译记忆同步", "tm-sync-mcp", "released", 4, ["i18n"]),
  noMcpTool("PseudoLocale", "prodsw.i18n", "Pseudo-locale generator", "伪本地化生成器"),

  // ── Public · Product & Software · Support ──────────────────────
  oneMcpTool("TicketPilot", "prodsw.support", "Support ticket triage", "工单分诊", "ticket-triage-mcp", "released", 7, ["support"]),
  oneMcpTool("KBPilot", "prodsw.support", "Self-serve KB authoring", "自助知识库编辑", "kb-author-mcp", "dev", 3, ["kb"]),

  // ── Public · Product & Software · Analytics ────────────────────
  oneMcpTool("EventBus", "prodsw.analytics", "Product event ingestion", "产品事件接入", "event-ingest-mcp", "released", 18, ["analytics"]),
  oneMcpTool("FunnelLab", "prodsw.analytics", "Funnel/cohort analytics", "漏斗与群组分析", "funnel-cohort-mcp", "dev", 5, ["funnel"]),

  // ── Public · Hardware ──────────────────────────────────────────
  oneMcpTool("SchemaPilot", "hardware.schematic", "Schematic linting + reuse", "原理图检查与复用", "schematic-lint-mcp", "released", 6, ["schematic"]),
  oneMcpTool("PCBFlow", "hardware.pcb", "PCB layout review tools", "PCB 布局评审工具", "pcb-review-mcp", "released", 8, ["pcb"]),
  oneMcpTool("MechCAD-Sync", "hardware.mech", "Mechanical CAD versioning", "机械 CAD 版本管理", "cad-version-mcp", "dev", 4, ["cad"]),
  oneMcpTool("ThermSim", "hardware.thermals", "Thermal simulation runner", "热仿真运行器", "thermal-sim-mcp", "dev", 3, ["thermal"]),
  noMcpTool("EMC-Lab", "hardware.thermals", "EMC test orchestration", "EMC 测试编排"),
  oneMcpTool("HWVerif", "hardware.hwverif", "HW verification dashboard", "硬件验证仪表盘", "hw-verif-mcp", "released", 5, ["verif"]),

  // ── Public · Product Digitization ─────────────────────────────
  oneMcpTool("PLM-Bridge", "proddigi.plm", "PLM data bridge to R&D", "PLM 数据桥接研发", "plm-bridge-mcp", "released", 14, ["plm"]),
  oneMcpTool("TwinForge", "proddigi.twin", "Digital twin authoring", "数字孪生编辑器", "twin-author-mcp", "dev", 6, ["twin"]),
  oneMcpTool("DataCatalog", "proddigi.datacat", "Org data catalog", "组织数据目录", "data-catalog-mcp", "released", 21, ["data"]),
  oneMcpTool("ProcessFlow", "proddigi.process", "Process automation studio", "流程自动化编辑器", "process-studio-mcp", "dev", 8, ["bpm"]),
  oneMcpTool("FormBuilder", "proddigi.process", "Internal form builder", "内部表单构建器", "form-builder-mcp", "released", 5, ["forms"]),

  // ── Public · Infrastructure ───────────────────────────────────
  oneMcpTool("ComputePilot", "infra.compute", "Compute fleet manager", "算力集群管理", "compute-fleet-mcp", "released", 28, ["compute"]),
  oneMcpTool("NetCore", "infra.network", "Internal network control", "内部网络管控", "net-control-mcp", "released", 19, ["network"]),
  tool("StoreOps", "infra.storage", "Storage tiering + backup", "存储分层与备份", [
    mcp("storage-tier-mcp", "released", 12, "Tiering + lifecycle policy", "分层与生命周期策略", ["storage"]),
    mcp("backup-mcp", "released", 5, "Backup schedule + restore", "备份调度与恢复", ["backup"]),
  ]),
  tool("VaultID", "infra.iam", "Identity + secrets", "身份与机密管理", [
    mcp("identity-mcp", "released", 22, "User + role identity", "用户与角色身份", ["iam"]),
    mcp("secrets-mcp", "released", 9, "Secret read + rotate", "机密读取与轮换", ["iam", "secrets"]),
  ]),
  // ObservHub is the second 3-MCP showcase: metrics + logs + traces are
  // distinct surfaces in real observability stacks.
  tool("ObservHub", "infra.observ", "Metrics/logs/traces hub", "指标/日志/追踪中枢", [
    mcp("metrics-mcp", "released", 14, "Time-series metrics query", "时序指标查询", ["o11y", "metrics"]),
    mcp("logs-mcp", "released", 9, "Log search + tail", "日志检索与跟踪", ["o11y", "logs"]),
    mcp("traces-mcp", "dev", 3, "Distributed trace lookup", "分布式追踪查询", ["o11y", "traces"]),
  ]),
  oneMcpTool("AlertPilot", "infra.observ", "Alert routing & dedupe", "告警路由与去重", "alert-route-mcp", "dev", 12, ["alert"]),
  oneMcpTool("SecOpsCenter", "infra.secops", "Security operations console", "安全运营控制台", "secops-console-mcp", "released", 14, ["secops"]),
  oneMcpTool("ThreatHunt", "infra.secops", "Threat hunting playbooks", "威胁狩猎剧本", "threat-hunt-mcp", "dev", 7, ["threat"]),
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
