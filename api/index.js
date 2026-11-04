// server/app.ts
import "dotenv/config";
import express from "express";
import cors from "cors";

// server/orchestrator.ts
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

// server/data/account_cache.json
var account_cache_default = {};

// server/rorkClient.ts
var RorkError = class extends Error {
};
async function callRorkLlm(messages, options = {}) {
  const { timeoutMs = 6e4, maxRetries = 3 } = options;
  let lastError = null;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch("https://toolkit.rork.com/text/llm/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "AccountIQ-Agent/1.0"
          // required — endpoint 403s without it
        },
        body: JSON.stringify({ messages }),
        signal: controller.signal
      });
      const text = await response.text();
      if (!response.ok) {
        throw new RorkError(`Rork API HTTP ${response.status}: ${text.slice(0, 300)}`);
      }
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new RorkError(`Rork returned non-JSON: ${text.slice(0, 200)}`);
      }
      if (data.error) throw new RorkError(`Rork error ${data.error.code || ""}: ${data.error.message || "unknown"}`);
      if (typeof data.completion !== "string") throw new RorkError("Rork response missing completion field");
      return data.completion;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      console.warn(`[RorkClient] attempt ${attempt}/${maxRetries} failed: ${lastError.message}`);
      if (attempt < maxRetries) await new Promise((r) => setTimeout(r, 1200 * attempt));
    } finally {
      clearTimeout(timer);
    }
  }
  throw lastError || new RorkError("Failed to obtain completion from Rork LLM");
}
function cleanAndRepairJson(raw) {
  let s = raw.trim();
  s = s.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  const firstObj = s.indexOf("{");
  const firstArr = s.indexOf("[");
  let start = -1;
  if (firstObj === -1) start = firstArr;
  else if (firstArr === -1) start = firstObj;
  else start = Math.min(firstObj, firstArr);
  if (start !== -1) {
    s = s.slice(start);
  }
  let insideString = false;
  let escape = false;
  let out = "";
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    const next = s[i + 1];
    if (insideString) {
      if (escape) {
        escape = false;
        out += c;
      } else if (c === "\\") {
        escape = true;
        out += c;
      } else if (c === '"') {
        insideString = false;
        out += c;
      } else if (c === "\n") {
        out += "\\n";
      } else if (c === "\r") {
        out += "\\r";
      } else if (c === "	") {
        out += "\\t";
      } else {
        out += c;
      }
    } else {
      if (c === '"') {
        insideString = true;
        out += c;
      } else if (c === "/" && next === "/") {
        while (i < s.length && s[i] !== "\n" && s[i] !== "\r") i++;
        if (i < s.length) out += s[i];
      } else if (c === "/" && next === "*") {
        i += 2;
        while (i < s.length - 1 && !(s[i] === "*" && s[i + 1] === "/")) i++;
        i++;
      } else {
        out += c;
      }
    }
  }
  s = out.replace(/,\s*([}\]])/g, "$1");
  try {
    JSON.parse(s);
    return s;
  } catch {
    s = s.replace(/\}"\s*([,\]])/g, "}$1");
    s = s.replace(/([\[,])\s*"\s*\{/g, "$1{");
    insideString = false;
    escape = false;
    const stack = [];
    for (let i = 0; i < s.length; i++) {
      const c = s[i];
      if (insideString) {
        if (escape) escape = false;
        else if (c === "\\") escape = true;
        else if (c === '"') insideString = false;
      } else {
        if (c === '"') insideString = true;
        else if (c === "{" || c === "[") stack.push(c);
        else if (c === "}") {
          if (stack.length && stack[stack.length - 1] === "{") stack.pop();
        } else if (c === "]") {
          if (stack.length && stack[stack.length - 1] === "[") stack.pop();
        }
      }
    }
    let rep = s;
    if (insideString) rep += '"';
    rep = rep.trim().replace(/,\s*$/, "");
    rep = rep.replace(/:\s*$/, ": null");
    rep = rep.replace(/,\s*([}\]])/g, "$1");
    while (stack.length > 0) {
      const open = stack.pop();
      if (open === "{") rep += "}";
      else if (open === "[") rep += "]";
    }
    rep = rep.replace(/,\s*([}\]])/g, "$1");
    return rep;
  }
}
async function callRorkJson(systemPrompt, userPrompt, options = {}) {
  const parseRetries = options.parseRetries ?? 2;
  let lastRaw = "";
  for (let attempt = 0; attempt <= parseRetries; attempt++) {
    const prompt = attempt === 0 ? userPrompt : `${userPrompt}

IMPORTANT: Your previous response was not valid JSON. Return ONLY compact, valid JSON and keep each text field concise enough that the entire JSON fits in one response. No commentary, no code fences.`;
    lastRaw = await callRorkLlm(
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ],
      options
    );
    try {
      return JSON.parse(cleanAndRepairJson(lastRaw));
    } catch {
      console.warn(`[RorkClient] parse attempt ${attempt + 1}/${parseRetries + 1} failed; retrying.`);
    }
  }
  console.error("[RorkClient] JSON parse failed after retries. Raw snippet:\n", lastRaw.slice(0, 1200));
  throw new RorkError("Could not parse JSON from LLM after retries");
}

// server/knowledgeBase.ts
var IBM_STORAGE_PORTFOLIO = {
  flashSystem: {
    key: "flashSystem",
    name: "IBM FlashSystem 5600 / 7600 / 9600",
    tagline: "Autonomous mission-critical block storage with inline cyber resilience",
    positioning: "Primary enterprise block storage. The Feb 2026 refresh replaces the 5300/7300/9500 with the 5600 (2.6M IOPS, edge/space-constrained), 7600 (4.3M IOPS, 2U), and 9600 flagship (6.3M IOPS, 2U, up to 3.3PB raw / ~11.8PBe effective). All run IBM Storage Virtualize and FlashSystem.ai.",
    keyCapabilities: [
      "FlashCore Module 5 (FCM5): 6.6 / 13.2 / 26.4 / 52.8 and 105.6 TB options (105.6TB exclusive to 9600), PCIe Gen4, with deduplication now offloaded to module hardware for up to 40% greater data efficiency vs the prior generation",
      "FlashSystem.ai: agentic autonomous management that executes thousands of automated decisions/day and cuts manual storage administration by up to 90%",
      "Guaranteed sub-minute ransomware anomaly detection with a <1% false-positive rate, plus recovery of safeguarded copies within ~60 seconds",
      "Safeguarded Copy: immutable, isolated snapshots that cannot be altered or deleted via array admin credentials",
      "IBM Storage Virtualize: single control plane that virtualizes 500+ existing third-party arrays (Dell, Pure, NetApp) to extend their life and unify management",
      "Consistent low-microsecond latency for core banking, trading (OLTP), and large databases"
    ],
    targetWorkloads: ["Core banking / trading (OLTP)", "Epic / Oracle / SAP HANA databases", "VMware & Red Hat OpenShift virtualization", "Mission-critical consolidation"],
    displacementTargets: ["Dell PowerMax 2500/8500", "Dell PowerStore", "Pure Storage FlashArray //X & //XL", "NetApp AFF A-Series"]
  },
  c200: {
    key: "c200",
    name: "IBM FlashSystem C200",
    tagline: "High-density capacity flash for secondary and data-heavy tiers",
    positioning: "Capacity-optimized FlashSystem using high-density FlashCore Modules (~46TB/module) for cost-efficient secondary storage, backup targets, and large-but-cooler datasets where QLC-class economics matter more than peak IOPS.",
    keyCapabilities: [
      "Very high density per rack unit to collapse storage footprint and power/cooling",
      "Same Storage Virtualize + Safeguarded Copy data services as the performance tier",
      "Strong $/TB for backup landing zones, content repositories, and capacity tiers"
    ],
    targetWorkloads: ["Backup & recovery targets", "Capacity / secondary tier", "Content repositories", "Flash-based archive"],
    displacementTargets: ["Dell PowerStore (capacity)", "Pure FlashArray //C & //E", "Bulk disk-based NAS"]
  },
  ds8000: {
    key: "ds8000",
    name: "IBM Storage DS8A00 (DS8000 G10)",
    tagline: "Enterprise tier-1 storage co-engineered for IBM zSystems and LinuxONE",
    positioning: "The current Generation 10 flagship tier-1 storage platform for IBM Z mainframes and mission-critical enterprise estates. Powered by POWER9+ active-active processor nodes and HPFE Gen3 NVMe flash, delivering 99.99999% availability, sub-20\xB5s latency via zHyperLink, Safeguarded Copy with IBM Z Cyber Vault integration, automated multi-target GDPS disaster recovery, and Transparent Cloud Tiering (TCT) that offloads DFSMShsm CPU overhead from host mainframes.",
    keyCapabilities: [
      "POWER9+ active-active server pairs with High-Performance Flash Enclosure (HPFE Gen3) NVMe architecture for peak IOPS and ultra-low latency",
      "zHyperLink: Direct PCIe attachment to IBM zSystems processors providing <20-microsecond read response times for DB2 and IMS transactional workloads",
      "Safeguarded Copy & IBM Z Cyber Vault: Automated, immutable, logically air-gapped recovery copies with continuous forensic integrity analysis for z/OS",
      "Seven 9s (99.99999%) guaranteed data availability with zero-data-loss multi-target GDPS (Metro Mirror + Global Mirror)",
      "Transparent Cloud Tiering (TCT): Directly migrates cold mainframe datasets from storage controller to cloud/object storage without burning host mainframe MIPS",
      "Unified FICON, zHyperLink, and Fibre Channel connectivity supporting both mainframe z/OS and distributed open systems workloads",
      "Pervasive encryption and line-rate hardware cryptographic offload for regulatory compliance"
    ],
    targetWorkloads: [
      "IBM zSystems / z/OS mainframe core workloads",
      "Mainframe Managed Service Providers (MSPs) & hosting (Ensono, Kyndryl, DXC)",
      "High-throughput DB2 for z/OS, CICS, and IMS transaction processing",
      "Mission-critical financial, insurance, health, and government core systems"
    ],
    displacementTargets: ["Dell PowerMax 2500 / 8500 (FICON attached)", "Hitachi VSP 5000 (Mainframe attached)"]
  },
  ts7700: {
    key: "ts7700",
    name: "IBM TS7700 (TS7770 / TS7760)",
    tagline: "High-performance virtual tape server and grid for IBM Z mainframes",
    positioning: "The industry-standard mainframe virtual tape architecture. Replaces physical tape handling with high-speed all-flash/disk cache, automated multi-node active-active grid clustering across up to 8 sites, transparent object storage tiering, and native z/OS DFSMS integration.",
    keyCapabilities: [
      "Active-Active Grid Architecture: Up to 8 multi-site grid nodes providing continuous automated disaster recovery with zero host intervention",
      "Safeguarded Copy for Virtual Tape: Protects mainframe batch datasets, catalog backups, and logs from ransomware tampering",
      "Cloud & Object Storage Tiering: Transparently offloads cold mainframe tape data to IBM Storage Ceph, IBM Cloud, or AWS S3 without mainframe CPU tax",
      "Dramatically shrinks mainframe batch processing and backup windows for high-MIPS environments"
    ],
    targetWorkloads: [
      "Mainframe batch processing & backup",
      "z/OS DFSMShsm and DFSMSdss automated dataset migration",
      "Multi-tenant mainframe MSP hosting and service delivery (e.g. Ensono)",
      "Long-term mainframe regulatory archiving"
    ],
    displacementTargets: ["Dell DLm (Disk Library for mainframe)", "Luminex Channel Gateway", "Oracle StorageTek VSM"]
  },
  storageScale: {
    key: "storageScale",
    name: "IBM Storage Scale (formerly GPFS)",
    tagline: "Parallel file & object data platform for AI and HPC",
    positioning: "Ultra-high-throughput parallel file system for AI model training, HPC, and analytics where GPUs must be fed without starving. Delivers a single global namespace across on-prem, edge, and cloud.",
    keyCapabilities: [
      "NVIDIA GPUDirect Storage (GDS) support to stream data straight to GPU memory for DGX / SuperPOD-class clusters",
      "Massive parallel aggregate throughput so GPU fleets stay saturated during training",
      "Global Data Platform: one namespace spanning on-prem, edge, AWS, Azure, Google Cloud",
      "Active File Management (AFM): intelligent caching / sync across sites without cloud lock-in",
      "Automated tiering to object or tape for low-cost retention of cold training data"
    ],
    targetWorkloads: ["LLM / GenAI pre-training & fine-tuning", "HPC & quantitative research", "Genomics & imaging", "High-throughput analytics"],
    displacementTargets: ["NetApp ONTAP / FSx for ONTAP", "Pure Storage FlashBlade //S", "Dell PowerScale (Isilon)", "VAST Data", "WEKA"]
  },
  storageDefender: {
    key: "storageDefender",
    name: "IBM Storage Defender",
    tagline: "End-to-end cyber resilience and automated recovery",
    positioning: "Cyber-resilience orchestration across the data estate: early ransomware detection, immutable copies, and automated clean recovery that satisfies DORA and SEC incident-response expectations.",
    keyCapabilities: [
      "Unified management plane that integrates with SIEM/SOAR (QRadar, Splunk, Microsoft Sentinel)",
      "Storage-side and VM-side anomaly detection to flag encryption events early",
      "Clean-room recovery orchestration: validate data in an isolated sandbox before restoring to production",
      "Auditable recovery workflows aligned to DORA (EU) and SEC cyber-incident disclosure rules",
      "Cuts ransomware recovery time from days/weeks to hours"
    ],
    targetWorkloads: ["Enterprise DR / BCP", "Mission-critical database recovery", "Regulatory compliance", "Ransomware response"],
    displacementTargets: ["Commvault", "Cohesity", "Rubrik", "Dell PowerProtect / Cyber Recovery"]
  },
  storageFusion: {
    key: "storageFusion",
    name: "IBM Storage Fusion (HCI & Software)",
    tagline: "Turnkey container data platform, backup, and DR for Red Hat OpenShift & hybrid cloud",
    positioning: "IBM's primary strategic platform for modern application data services, Red Hat OpenShift, stateful Kubernetes microservices, and hybrid cloud app modernization. Available as turnkey integrated HCI or software-defined on bare metal/cloud. Delivers persistent container storage, app-consistent backup and restore (manifests + volumes), multi-cluster automated disaster recovery (Metro-DR / Regional-DR), and seamless hybrid cloud mobility.",
    keyCapabilities: [
      "Turnkey container-native data platform directly integrated into Red Hat OpenShift control plane",
      "Application-consistent backup and rapid restore (protects both stateful persistent volumes and complete Kubernetes metadata/manifests)",
      "Automated zero-RPO Metro-DR and asynchronous Regional-DR across multi-cluster OpenShift estates",
      "Direct data services and acceleration for watsonx and enterprise AI pipelines on OpenShift",
      "Global data access bridging OpenShift clusters to IBM Storage Scale and cloud data sources",
      "The definitive enterprise alternative to Portworx, NetApp Astra, and complex DIY container storage stacks"
    ],
    targetWorkloads: [
      "Red Hat OpenShift application modernization & stateful microservices",
      "Enterprise container backup, disaster recovery, and mobility",
      "watsonx & AI pipelines running on OpenShift",
      "MSP multi-tenant cloud-native hosting and service delivery"
    ],
    displacementTargets: ["Portworx by Pure Storage", "NetApp Astra / Trident", "Dell Container Storage Modules (CSM)", "DIY Rook/Ceph on Kubernetes"]
  },
  storageCeph: {
    key: "storageCeph",
    name: "IBM Storage Ceph",
    tagline: "Software-defined unified block, file, and object for exabyte-scale bulk data",
    positioning: "Open, software-defined storage for standalone, exabyte-scale S3 object repositories, telemetry lakes, and bulk archival tiers on commodity x86 servers. (Note: For Red Hat OpenShift, stateful microservices, and container application modernization, IBM strategically leads with IBM Storage Fusion).",
    keyCapabilities: [
      "Scale-out from petabytes to exabytes on commodity hardware without proprietary appliance markups",
      "S3-compatible object storage with multi-site asynchronous replication",
      "Open-source foundation with enterprise-hardened IBM support and lifecycle management",
      "Cost-effective bulk tier for raw telemetry, IoT logs, video archives, and long-term uncurated data lakes"
    ],
    targetWorkloads: ["Raw telemetry & IoT log archives", "Secondary S3 object repositories", "Multi-petabyte uncurated data lakes", "Commodity hardware bulk storage"],
    displacementTargets: ["Dell ECS / ObjectScale", "Scality", "MinIO", "Pure FlashBlade //E"]
  },
  tapeAndArchive: {
    key: "tapeAndArchive",
    name: "IBM Tape (Diamondback / TS4500)",
    tagline: "Air-gapped, low-cost, low-carbon deep archive",
    positioning: "The lowest-cost, lowest-power retention and ransomware fallback tier. A true physical air gap plus very low $/TB make it ideal for long-term compliance and cold AI data.",
    keyCapabilities: [
      "Tens of petabytes of capacity in a single rack (Diamondback)",
      "True physical air gap: offline media is unreachable over the network",
      "A fraction of the power/cooling of disk or flash \u2014 lowest carbon footprint",
      "Very low $/TB with multi-decade media longevity"
    ],
    targetWorkloads: ["Long-term compliance (SEC 17a-4, FINRA, HIPAA)", "Cold AI training-data retention", "Final ransomware fallback copy"],
    displacementTargets: ["Spectra Logic", "Quantum Scalar", "AWS Glacier Deep Archive (repatriation)"]
  }
};
var COMPETITOR_BATTLECARDS = {
  dell: {
    vendor: "Dell Technologies",
    flagshipProducts: ["PowerMax 2500 / 8500 (Open Systems & Mainframe FICON)", "PowerStore", "PowerScale (Isilon)", "PowerProtect / Cyber Recovery", "ECS / ObjectScale", "DLm (Disk Library for mainframe)"],
    vulnerabilities: [
      "Post-warranty maintenance cliff: support/maintenance pricing tends to rise sharply in years 4\u20135, nudging customers toward expensive forklift refreshes.",
      "Fragmented OS estate: PowerMax, PowerStore, PowerScale, and ECS each run completely different operating systems \u2014 no single unified control plane.",
      "Mainframe / FICON attachments: PowerMax lacks native co-engineering with IBM z16 \u2014 no zHyperLink (<20\xB5s latency), no IBM Z Cyber Vault integration, and cannot offload DFSMShsm dataset migration via Transparent Cloud Tiering (TCT), consuming expensive host mainframe MIPS.",
      "Ransomware detection is largely post-process software (CloudIQ) rather than inline drive hardware, and recovery orchestration is fragmented.",
      "PowerScale can bottleneck on single-stream throughput for large GPU clusters vs parallel file systems.",
      "ECS appliance lock-in limits open S3 scaling across commodity servers."
    ],
    trapsToSet: [
      'Ask: "When Dell quoted your refresh, were years 4, 5, and 6 of maintenance locked in writing \u2014 or are you exposed to post-warranty escalation?"',
      'Ask: "For mainframe workloads on PowerMax, how many host MIPS are burned during daily backup and migration compared to IBM Storage DS8A00 Transparent Cloud Tiering?"',
      'Ask: "For cyber recovery, how long does clean-room validation take across multi-tier workloads before restoring to production?"',
      'Ask: "How many disparate management consoles do you log into to manage Dell block, file, object, backup, and mainframe silos?"'
    ],
    ibmCounterPosition: "IBM offers a cohesive multi-product portfolio: IBM Storage DS8A00 and TS7700 for IBM zSystems mainframe tier-1 storage and virtual tape (displacing PowerMax and DLm with sub-20\xB5s zHyperLink and seven-9s reliability); IBM Storage Defender for automated clean-room cyber resilience across the entire estate; IBM Storage Fusion for turnkey container data services and backup on OpenShift; IBM Storage Scale for GPU/AI parallel streaming (displacing PowerScale); IBM Storage Ceph for open S3 bulk object lakes (displacing ECS); and IBM FlashSystem 9600 with FCM5 for mission-critical distributed block."
  },
  pure: {
    vendor: "Pure Storage",
    flagshipProducts: ["FlashArray //X & //XL", "FlashArray //C & //E", "FlashBlade //S & //E", "Portworx", "Evergreen//One"],
    vulnerabilities: [
      "Evergreen//One subscription economics can heavily exceed capex ownership over a multi-year horizon \u2014 cumulative 5-year spend is often significantly higher.",
      "Compression and deduplication run on controllers; heavy concurrent writes can trigger latency tail spikes.",
      "FlashBlade can hit controller choke points feeding large GPU training fleets vs true parallel file streaming.",
      "No inline hardware ransomware detection on the flash module itself (relies on scheduled snapshots and software alerts).",
      "Portworx adds complex separate licensing and management on top of Kubernetes."
    ],
    trapsToSet: [
      'Ask: "Have you modeled cumulative 5-year Evergreen//One subscription spend against owning capacity with guaranteed hardware data reduction?"',
      'Ask: "At peak GPU training throughput, have you seen NFS/S3 controller choke points on FlashBlade?"',
      'Ask: "For Kubernetes microservices, how many separate tooling layers do you maintain between Portworx and your underlying storage?"'
    ],
    ibmCounterPosition: "IBM Storage Fusion provides turnkey container-native data services, backup, and DR directly integrated with Red Hat OpenShift (displacing Portworx); IBM Storage Scale delivers GPUDirect parallel throughput for AI (displacing FlashBlade); IBM Storage Ceph provides exabyte-scale open object; and IBM FlashSystem with FCM5 offloads compression/dedup to drive silicon with guaranteed sub-minute inline ransomware detection."
  },
  netapp: {
    vendor: "NetApp",
    flagshipProducts: ["AFF A-Series (A20\u2013A1K)", "FAS Series", "StorageGRID", "FSx for NetApp ONTAP", "NetApp Astra / Trident"],
    vulnerabilities: [
      "WAFL snapshot metadata sprawl degrades latency on high-churn transactional databases over time.",
      "Cloud data mobility (FSx for ONTAP) incurs steep egress and capacity fees as telemetry and AI data grow.",
      "Dual-controller HA architecture caps IOPS ceiling vs modern scale-out clusters.",
      "StorageGRID appliances have proprietary hardware ties compared to open software-defined object storage."
    ],
    trapsToSet: [
      'Ask: "How does database latency behave during heavy snapshot rotation under ONTAP?"',
      'Ask: "What are your projected FSx for ONTAP egress and capacity costs over the next 3 years as analytics datasets expand?"',
      'Ask: "What is your automated clean-room recovery plan if your primary NetApp arrays and snapshots are compromised?"'
    ],
    ibmCounterPosition: "IBM Storage Defender provides unified cyber resilience and audited clean-room recovery across heterogeneous arrays; IBM Storage Ceph delivers open S3 object storage at multi-petabyte scale without appliance markups (displacing StorageGRID); IBM Storage Fusion delivers container-native backup on OpenShift (displacing Astra); and IBM Storage Scale provides true hybrid-cloud global mobility (AFM) without cloud lock-in."
  },
  hpe: {
    vendor: "HPE",
    flagshipProducts: ["Alletra Storage MP (B10000 / X10000)", "Alletra 9000", "GreenLake for Block Storage", "Zerto"],
    vulnerabilities: [
      "GreenLake consumption billing can be unpredictable quarter-to-quarter and exceeds owned-capacity TCO at scale.",
      "Disaggregated Alletra MP architecture is newer with a shorter enterprise mission-critical track record vs established platforms.",
      "Ransomware detection depends on downstream software tools rather than inline module-level drive hardware.",
      "Lacks native deep-tier exabyte object integration without third-party bolt-ons."
    ],
    trapsToSet: [
      'Ask: "How predictable has GreenLake billing actually been against your original forecast?"',
      'Ask: "Where does ransomware detection happen in your Alletra stack \u2014 inline at the hardware drive, or delayed in host software?"',
      'Ask: "How do you coordinate disaster recovery between containerized apps and legacy SAN volumes?"'
    ],
    ibmCounterPosition: "IBM FlashSystem offers proven reliability with inline FCM5 hardware cyber detection and transparent flat-rate maintenance via FlashWatch; IBM Storage Defender orchestrates enterprise-wide cyber recovery; IBM Storage Fusion unifies container data protection for OpenShift; and IBM Tape provides a true physical air-gapped compliance tier."
  }
};
function portfolioContextForPrompt() {
  return Object.values(IBM_STORAGE_PORTFOLIO).map((p) => `- ${p.name} \u2014 ${p.tagline}. Positioning: ${p.positioning} Displaces: ${p.displacementTargets.join(", ")}.`).join("\n");
}
function competitorContextForPrompt() {
  return Object.values(COMPETITOR_BATTLECARDS).map((c) => `- ${c.vendor} (flagships: ${c.flagshipProducts.join(", ")}). Weak spots: ${c.vulnerabilities.join(" ")}`).join("\n");
}

// server/researchProvider.ts
function isWebSearchEnabled() {
  return Boolean(process.env.SEARCH_API_KEY && process.env.SEARCH_API_KEY.trim());
}
async function webSearch(query, maxResults = 6) {
  if (!isWebSearchEnabled()) return [];
  const provider = (process.env.SEARCH_PROVIDER || "tavily").toLowerCase();
  try {
    if (provider === "tavily") {
      return await tavilySearch(query, maxResults);
    }
    console.warn(`[researchProvider] Unknown SEARCH_PROVIDER "${provider}" \u2014 skipping.`);
    return [];
  } catch (err) {
    console.warn(`[researchProvider] Search failed for "${query}":`, err?.message || err);
    return [];
  }
}
async function tavilySearch(query, maxResults) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 2e4);
  try {
    const res = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: process.env.SEARCH_API_KEY,
        query,
        max_results: maxResults,
        search_depth: "advanced",
        include_answer: false
      }),
      signal: controller.signal
    });
    if (!res.ok) throw new Error(`Tavily HTTP ${res.status}`);
    const data = await res.json();
    return (data.results || []).map((r) => ({
      title: r.title,
      url: r.url,
      snippet: r.content,
      publishedDate: r.published_date
    }));
  } finally {
    clearTimeout(timer);
  }
}
function formatResultsForPrompt(results, snippetCap = 420) {
  if (results.length === 0) return "";
  return results.map(
    (r, i) => `[${i + 1}] ${r.title}${r.publishedDate ? ` (${r.publishedDate})` : ""}
URL: ${r.url}
${(r.snippet || "").slice(0, snippetCap)}`
  ).join("\n\n");
}

// server/orchestrator.ts
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var CACHE_FILE = path.join(__dirname, "data", "account_cache.json");
var accountCache = /* @__PURE__ */ new Map();
if (account_cache_default && typeof account_cache_default === "object") {
  Object.values(account_cache_default).forEach((acc) => {
    if (acc?.id) accountCache.set(acc.id, acc);
  });
}
(function loadDiskCache() {
  try {
    const targetFile = fs.existsSync(CACHE_FILE) ? CACHE_FILE : process.env.VERCEL && fs.existsSync(path.join("/tmp", "account_cache.json")) ? path.join("/tmp", "account_cache.json") : null;
    if (targetFile) {
      const parsed = JSON.parse(fs.readFileSync(targetFile, "utf-8"));
      Object.values(parsed).forEach((acc) => {
        if (acc?.id) accountCache.set(acc.id, acc);
      });
    }
  } catch (e) {
    console.warn("[orchestrator] could not read disk cache:", e);
  }
})();
function saveDiskCache() {
  try {
    const obj = {};
    for (const acc of accountCache.values()) obj[acc.id] = acc;
    const targetFile = process.env.VERCEL ? path.join("/tmp", "account_cache.json") : CACHE_FILE;
    fs.mkdirSync(path.dirname(targetFile), { recursive: true });
    fs.writeFileSync(targetFile, JSON.stringify(obj, null, 2), "utf-8");
  } catch (e) {
    console.warn("[orchestrator] failed saving cache:", e);
  }
}
function slugify(name) {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
function getAllCachedAccounts() {
  return Array.from(accountCache.values());
}
function getAccountByIdOrName(query) {
  const q = query.toLowerCase().trim();
  if (accountCache.has(q)) return accountCache.get(q);
  for (const acc of accountCache.values()) {
    if (acc.id === q || acc.companyName.toLowerCase() === q) return acc;
  }
  for (const acc of accountCache.values()) {
    if (acc.companyName.toLowerCase().includes(q)) return acc;
  }
  return void 0;
}
function deleteAccount(id) {
  const existing = getAccountByIdOrName(id);
  if (!existing) return false;
  accountCache.delete(existing.id);
  saveDiskCache();
  return true;
}
function baseSystemPrompt(mode) {
  const sourcingRules = mode === "web-verified" ? `SOURCING (web-verified mode): You are given real web search results, each numbered [n] with a URL and sometimes a date.
- Base factual claims ONLY on those results. For each finding's "source", set verified=true, label=the publication/source name, url=the real URL from the result, and date=the real date if present.
- If a specific claim is NOT supported by any provided result, set source.verified=false and label="Model knowledge (not web-verified)" and OMIT url/date. Never attach a URL you were not given.` : `SOURCING (AI-analysis mode): You have NO web access. This is critical and non-negotiable:
- NEVER invent a URL. NEVER invent a specific publication date or document name.
- For EVERY finding's "source": set verified=false, label="Model knowledge (not web-verified)", and OMIT url and date entirely.
- Express how well-established each claim is via the "confidence" field (High = widely known/stable fact; Medium = reasonable inference; Low = speculative/time-sensitive).
- Prefer durable, structural facts over anything that changes month-to-month.`;
  return `You are AccountIQ, an elite enterprise-storage Solutions Engineer and equity analyst rolled into one. You prepare IBM Storage SEs for executive meetings with large enterprises.

You reason like a Principal Storage & Cloud Architect who also reads 10-Ks and earnings calls. You are specific, quantitative where defensible, and you connect findings to concrete IBM Storage capabilities \u2014 never generic fluff.

Accuracy over bravado:
- Do NOT fabricate facts, names, numbers, customer logos, or sources.
- If you don't reliably know something (e.g. the current CIO's name), say so plainly rather than guessing.
- When you infer rather than know, say it's an inference and lower the confidence.

BE SPECIFIC, NOT GENERIC (this is the difference between a useful dossier and ChatGPT fluff):
- Every finding, question, and email opener MUST anchor to something concrete about THIS company \u2014 a named initiative or product, a specific facility or region, a regulation it actually faces, a real figure, or a named executive.
- Before writing any sentence, ask: "Could I paste this into a report about a different company and have it still read fine?" If yes, it is too generic \u2014 rewrite it with a specific detail or cut it.
- Do not default to boilerplate like "they face data growth and cybersecurity challenges." Say what KIND of data, from which workload, under which regulation, at what scale for THIS company.
- Well-known public firmographics (headquarters city, approximate annual revenue, approximate employee count) for large/public companies ARE established facts \u2014 state them with High confidence. Reserve "not reliably known" for things that genuinely change and that you are actually unsure of (like a current individual's name when you lack a source).

INDUSTRY-AUTHENTIC WORKLOAD FIDELITY (CRITICAL):
- Ground all findings and storage workloads strictly in the target company's ACTUAL industry:
  * Electric / Gas / Water Utilities: SCADA/EMS systems, AMI/smart meter telemetry ingestion, GIS geospatial networks, grid sensor time-series data, NERC CIP compliance, substation edge data, operational DR and clean-room isolation. NEVER suggest medical imaging, hospital PACS, retail POS, or algorithmic trading for a utility!
  * Managed Service Providers (MSPs) & Hosting Providers (e.g. Ensono, Kyndryl, DXC): Identify whether they manage or host **Mainframe (IBM Z / zSystems / z/OS / LinuxONE / MIPS)** environments. Ensono in particular is a premier Mainframe MSP managing massive MIPS fleets alongside hybrid cloud. For mainframe-centric MSPs like Ensono, anchor storage plays in **IBM Storage DS8A00 (DS8000 G10)** (tier-1 zSystems flash with zHyperLink) and **IBM TS7700** (mainframe virtual tape grid) alongside **IBM Storage Defender** (for Cyber Vault resilience) and **IBM Storage Fusion** (for OpenShift/container modernization). Do NOT mischaracterize them as an open-cloud-only company!
  * Healthcare / Life Sciences: PACS / VNA medical imaging, Epic / Cerner EHR, HIPAA/HITECH compliance, genomic sequencing, clinical AI inference.
  * Financial Services: Core banking OLTP, payment settlement, fraud detection, algorithmic trading, SEC 17a-4 compliance, DORA compliance.
  * Manufacturing / Logistics: MES, IoT sensor telematics, supply chain ERP, warehouse automation, computer vision QA.
  * Technology / SaaS: Multi-tenant Kubernetes clusters, CI/CD telemetry, real-time analytics data pipelines, customer-facing microservices.
- Never map an industry-inappropriate workload to the target company.

BALANCED MULTI-PRODUCT RECOMMENDATIONS (DO NOT DEFAULT TO FLASHSYSTEM):
- IBM Storage is a rich, multi-tiered portfolio. DO NOT recommend FlashSystem for every opportunity! You must match the right tool to the right problem:
  * IBM Storage DS8A00 (DS8000 G10): The current Generation 10 flagship tier-1 storage platform co-engineered for IBM zSystems / LinuxONE with sub-20\xB5s zHyperLink latency, seven-9s availability, IBM Z Cyber Vault integration, and Transparent Cloud Tiering (TCT). Highlight for any enterprise or MSP running or hosting mainframes (e.g. Ensono, Kyndryl, DXC, core banking, insurance).
  * IBM TS7700: High-performance virtual tape server and active-active grid for IBM Z mainframe backup, batch processing, and DFSMShsm dataset migration.
  * IBM Storage Fusion (HCI & Software): IBM's PRIMARY STRATEGIC platform for container data services, stateful Kubernetes apps, Red Hat OpenShift modernization, and multi-cluster backup/DR. Lead with Fusion for all containerized, cloud-native, and OpenShift modernization initiatives.
  * IBM Storage Defender: Highlight for enterprise cyber resilience, ransomware detection, clean-room recovery orchestration, and regulatory compliance (NERC CIP for utilities, DORA for finance, SEC for public companies).
  * IBM Storage Scale: Highlight for high-throughput AI GPU clusters (GPUDirect), HPC simulation, genomics, and global parallel file data platforms.
  * IBM Tape (Diamondback / TS4500): Highlight for air-gapped immutable compliance archive, lowest $/TB, and lowest carbon footprint.
  * IBM FlashSystem (5600/7600/9600 & C200): Highlight for core primary transactional databases, OLTP, low-latency block consolidation, and capacity flash.
  * IBM Storage Ceph: Position strictly for standalone bulk S3 object repositories and raw telemetry archives on commodity hardware (do NOT position Ceph for OpenShift/container apps where Fusion is the strategic path).
- Ensure your recommendations across the dossier actively utilize this diverse portfolio rather than over-indexing on FlashSystem alone.

PRODUCT-NAMING PRECISION (the model's training data is stale \u2014 these are the CURRENT names):
- The mainframe tier-1 flagship is "IBM Storage DS8A00 (DS8000 G10)". NEVER write "DS8900F", "DS8950F", or "DS8880" \u2014 those are superseded generations. Always say DS8A00.
- The primary block family is "FlashSystem 5600 / 7600 / 9600" with "FCM5". NEVER write "FlashSystem 9500", "9200", "7300", "5300", or "FCM4" \u2014 those are the prior generation. Always use the 5600/7600/9600 + FCM5 names.
- For OpenShift / Kubernetes / container / cloud-native application data, lead with "IBM Storage Fusion". Position "IBM Storage Ceph" ONLY for standalone raw bulk S3 object repositories and uncurated telemetry archives \u2014 NEVER for container apps, stateful microservices, or edge app platforms (that is Fusion's job).
- If you are about to name any product, verify it exists in the CURRENT portfolio list below. Do not invent model numbers or carry over an older name from memory.

SELF-AUDIT BEFORE YOU RETURN (do this silently, then fix violations):
1. Count your product recommendations. If more than TWO come from the FlashSystem family, replace the weakest FlashSystem pick with the correct product for that workload (DS8A00/TS7700 for mainframe, Fusion for containers, Scale for AI/GPU, Defender for cyber-recovery, Ceph for bulk object, Tape for archive).
2. Re-read every targetWorkload. If any workload would not realistically run at a company in THIS exact industry, delete or rewrite it. (A utility does not run hospital PACS; an MSP does not run algorithmic trading; a SaaS firm does not run DFSMShsm batch unless it demonstrably hosts mainframes.)
3. Confirm you span at least THREE distinct IBM product families across the dossier.

${sourcingRules}

OUTPUT FORMAT:
- Respond with STRICT JSON only. No prose before or after. No markdown code fences.
- Inside string values, write clean prose. Do NOT use markdown asterisks (** **), bullet characters, or headers inside JSON string fields \u2014 just plain sentences. (The executiveBriefingDoc field is the ONLY place you may use markdown.)

CURRENT IBM STORAGE PORTFOLIO (use exact product names \u2014 this is the Feb 2026 lineup):
${portfolioContextForPrompt()}

COMPETITOR BATTLECARDS:
${competitorContextForPrompt()}`;
}
var FINDING_SCHEMA = `Finding = {
  "id": string,
  "title": string,
  "detail": string (2-4 substantive sentences, specific to THIS company),
  "confidence": "High" | "Medium" | "Low",
  "whyItMatters": string (why an IBM Storage SE should care),
  "source": { "label": string, "verified": boolean, "url"?: string, "date"?: string }
}`;
function groundingDigest(companyName, a1, a2) {
  const tech = a2?.technologyLandscape || {};
  const ch = a2?.businessChallenges || {};
  const titles = (arr, n = 3) => (arr || []).slice(0, n).map((f) => typeof f === "object" ? f.title : null).filter(Boolean).join("; ") || "n/a";
  const vendors = (tech.existingVendors || []).slice(0, 4).map((v) => `${v.vendor} (${v.category || "?"}; ${v.estimatedStage || "?"})`).join("; ") || "n/a";
  return `GROUNDED RESEARCH ON ${companyName} \u2014 these are the verified/analyzed facts from the earlier research agents. Every product match, workload, and architecture you produce MUST be consistent with them. Do NOT introduce a different industry or an implausible workload.
- Industry (specific sub-industry): ${a1?.profile?.industry || "unknown"}
- Strategy: ${a1?.companyStrategy?.summary || "n/a"}
- Tech landscape: ${tech.summary || "n/a"}
- Likely incumbent storage/infra vendors: ${vendors}
- Storage / compute / DB footprint: ${titles(tech.storageComputeDb)}
- Cloud footprint: ${titles(tech.cloudFootprint)}
- Technology gaps: ${titles(tech.technologyGaps)}
- Data growth & cost pressures: ${titles(ch.dataGrowthCosts, 2)}
- Cyber / regulatory exposure: ${titles(ch.cybersecurityRegulatory, 2)}
- Resilience / DR needs: ${titles(ch.resilienceDisasterRecovery, 2)}
- AI / workload demands: ${titles(ch.aiWorkloadDemands, 2)}`;
}
function searchBlock(ctx, keys) {
  if (ctx.mode !== "web-verified") return "";
  const merged = [];
  keys.forEach((k) => (ctx.searchResults[k] || []).forEach((r) => merged.push(r)));
  if (merged.length === 0) return "\n\n(No web results available for this section \u2014 fall back to AI-analysis sourcing rules for any unsupported claim.)";
  return `

WEB SEARCH RESULTS (cite these with real URLs):
${formatResultsForPrompt(merged)}`;
}
async function runResearchPipeline(companyName, onProgress) {
  const id = slugify(companyName);
  const existing = accountCache.get(id);
  if (existing) {
    onProgress?.(step(5, "Cache", "completed", `Loaded existing dossier for ${existing.companyName}.`));
    return existing;
  }
  const mode = isWebSearchEnabled() ? "web-verified" : "ai-analysis";
  const sys = baseSystemPrompt(mode);
  const searchResults = {};
  if (mode === "web-verified") {
    onProgress?.(step(1, "Web research", "in_progress", `Searching public sources for ${companyName}...`));
    const queries = {
      firmographics: `${companyName} headquarters annual revenue number of employees company profile`,
      people: `${companyName} CIO CTO "chief information officer" "chief technology officer" head of infrastructure VP infrastructure 2026`,
      strategy: `${companyName} strategy earnings technology investments 2026`,
      tech: `${companyName} infrastructure data center storage mainframe IBM Z zSystems cloud vendors`,
      signals: `${companyName} CIO CTO appointment data center AI investment 2026`
    };
    await Promise.all(
      Object.entries(queries).map(async ([k, q]) => {
        searchResults[k] = await webSearch(q, 5);
      })
    );
  }
  const ctx = { companyName, mode, searchResults };
  onProgress?.(step(1, "Agent Swarm", "in_progress", `Investigating ${companyName} across all intelligence dimensions in parallel...`));
  const completedSteps = /* @__PURE__ */ new Set();
  const reportProgress = (completedStep, label, detail) => {
    completedSteps.add(completedStep);
    let nextActive = 1;
    while (nextActive <= 4 && completedSteps.has(nextActive)) {
      nextActive++;
    }
    onProgress?.(step(Math.min(nextActive, 4), label, "in_progress", detail));
  };
  const runAgent1 = async () => {
    const [profile, companyStrategy] = await Promise.all([
      safe(
        "profile",
        () => callRorkJson(
          sys,
          `Give the firmographic profile of "${companyName}". Return JSON ONLY:
{
  "companyName": string (official legal name),
  "ticker": string | null (stock ticker if public, else null),
  "industry": string (specific sub-industry, not just "Technology"),
  "headquarters": string (City, State/Country \u2014 this is a known public fact for major companies; provide it),
  "revenue": string (most recent annual revenue as a clean figure like "$25.1B (FY2024)"; for large public companies this is known \u2014 provide it, mark (est.) only if estimating),
  "employees": string (approximate headcount as a clean figure like "~33,000"; provide it for major companies),
  "leadership": string (name the CURRENT CIO/CTO/top infrastructure leader ONLY if you are confident or it appears in the sources below; otherwise exactly "See stakeholder map")
}
Do NOT answer "Unknown" or "Not reliably known" for headquarters, revenue, or employees of a well-known company \u2014 those are established facts.${searchBlock(ctx, ["firmographics", "people"])}`,
          { timeoutMs: 6e4 }
        ),
        { companyName }
      ),
      safe(
        "companyStrategy",
        () => callRorkJson(
          sys,
          `Analyze the strategy of "${companyName}". Return JSON ONLY:
{
  "summary": string (3-5 sentences, plain prose, specific to this company),
  "businessSegments": Finding[] (3-4),
  "techInvestments": Finding[] (2-3),
  "earningsCommentary": Finding[] (2),
  "aiAndInfraStrategy": Finding[] (2-3)
}
Keep each "detail" to 2-3 sentences, each anchored to a specific ${companyName} detail. ${FINDING_SCHEMA}${searchBlock(ctx, ["strategy"])}`,
          { timeoutMs: 9e4 }
        ),
        emptyStrategy()
      )
    ]);
    reportProgress(1, "Agent 1 Complete", `Established firmographics and strategy for ${companyName}.`);
    return { profile: unwrap(profile, "profile"), companyStrategy: unwrap(companyStrategy, "companyStrategy") };
  };
  const runAgent2 = async () => {
    const [techLandscape, challenges] = await Promise.all([
      safe(
        "technologyLandscape",
        () => callRorkJson(
          sys,
          `For "${companyName}", analyze the technology landscape. Return JSON:
{
  "summary": string,
  "cloudFootprint": Finding[] (2-3),
  "storageComputeDb": Finding[] (2-3),
  "existingVendors": VendorFinding[] (3-4),
  "technologyGaps": Finding[] (2-3)
}
Keep each "detail" to 2 sentences. ${FINDING_SCHEMA}
VendorFinding = { "vendor": string, "category": string, "productsLikelyInUse": string[], "estimatedStage": "Active / mid-cycle"|"Likely renewal window"|"Legacy / exposed"|"Expanding", "whyExposed": string, "displacementAngle": string, "confidence": "High"|"Medium"|"Low", "source": {"label":string,"verified":boolean} }
Be concrete about likely incumbents (Dell, Pure, NetApp, HPE, hyperscalers) but mark confidence honestly \u2014 you are inferring.${searchBlock(ctx, ["tech"])}`,
          { timeoutMs: 9e4 }
        ),
        emptyTech()
      ),
      safe(
        "businessChallenges",
        () => callRorkJson(
          sys,
          `For "${companyName}", analyze storage-relevant business challenges. Return JSON:
{
  "summary": string,
  "dataGrowthCosts": Finding[] (2),
  "cybersecurityRegulatory": Finding[] (2),
  "resilienceDisasterRecovery": Finding[] (2),
  "aiWorkloadDemands": Finding[] (2)
}
Keep each "detail" to 2 sentences. ${FINDING_SCHEMA}`,
          { timeoutMs: 9e4 }
        ),
        emptyChallenges()
      )
    ]);
    reportProgress(2, "Agent 2 Complete", "Mapped infrastructure footprint and storage challenges.");
    return {
      technologyLandscape: unwrap(techLandscape, "technologyLandscape"),
      businessChallenges: unwrap(challenges, "businessChallenges")
    };
  };
  const runAgent3 = async (digest) => {
    const [buyingSignals, ibmMapping] = await Promise.all([
      safe(
        "buyingSignals",
        () => callRorkJson(
          sys,
          `For "${companyName}", identify buying signals relevant to an enterprise storage refresh. Return JSON:
{
  "summary": string,
  "signals": SignalFinding[] (4-6)
}
SignalFinding = { "id": string, "signalType": "Leadership change"|"Hiring signal"|"M&A / investment"|"Data center / capex"|"Regulatory pressure"|"AI initiative", "headline": string, "detail": string (2 sentences), "urgency": "Act now (0-30 days)"|"Near-term (this quarter)"|"Strategic (6-12 months)", "salesAction": string, "confidence": "High"|"Medium"|"Low", "source": {"label":string,"verified":boolean,"url"?:string,"date"?:string} }

${digest}${searchBlock(ctx, ["signals"])}`,
          { timeoutMs: 9e4 }
        ),
        { summary: "", signals: [] }
      ),
      safe(
        "ibmOpportunityMapping",
        () => callRorkJson(
          sys,
          `For "${companyName}", map opportunities to the CURRENT IBM Storage portfolio (IBM Storage DS8A00, IBM TS7700, IBM Storage Fusion, IBM Storage Defender, IBM Storage Scale, FlashSystem 5600/7600/9600 with FCM5, FlashSystem.ai, C200, IBM Storage Ceph, Tape).

${digest}

Return JSON:
{
  "summary": string,
  "productOpportunities": ProductMatch[] (3-5),
  "businessCase": BusinessCaseMetric[] (3-4),
  "competitorTactics": CompetitorTactic[] (2-3),
  "wedgeQuestions": string[] (3-5)
}
ProductMatch = { "productName": string (exact IBM product), "productFamily": string, "matchedNeed": string, "keyDifferentiator": string, "targetWorkload": string, "displacementTarget": string, "estimatedDealBand": "Land (<$500K)"|"Mid ($500K-$2M)"|"Strategic ($2M+)", "confidence": "High"|"Medium"|"Low" }
BusinessCaseMetric = { "metric": string, "currentState": string, "withIbm": string, "impact": string }
CompetitorTactic = { "competitor": string, "likelyInstalled": string, "painPoint": string, "trapQuestion": string, "ibmCounter": string }

STRICT REQUIREMENTS FOR PRODUCT MATCHING:
1. Workload authenticity: Every targetWorkload MUST belong to THIS company's actual industry operations (e.g. for an MSP like Ensono: mainframe hosting/MIPS management, hybrid cloud DR, backup as a service; for a utility: smart meter data, SCADA telemetry, outage management, NERC CIP compliance; NEVER suggest hospital PACS or medical imaging for an MSP or utility!).
2. Diverse portfolio balance: DO NOT default to FlashSystem for every opportunity! You MUST span at least 3 distinct IBM Storage product families. For example:
   - IBM Storage DS8A00 (DS8000 G10) & IBM TS7700 for IBM Z mainframe estates, z/OS transactional cores, and Mainframe MSPs (like Ensono, Kyndryl)
   - IBM Storage Fusion (HCI & Software) as the PRIMARY STRATEGIC choice for containerized apps, Red Hat OpenShift, Kubernetes backup/DR, and modern hybrid cloud (prefer Fusion over Ceph for application modernization)
   - IBM Storage Defender for automated cyber recovery & compliance (including IBM Z Cyber Vault)
   - IBM Storage Scale for high-throughput AI GPU clusters & parallel files
   - IBM Tape for air-gapped deep compliance archive
   - IBM FlashSystem for core latency-sensitive databases / transactional block storage
   - IBM Storage Ceph strictly for secondary bulk S3 object repositories / uncurated telemetry
   At most TWO recommendations may be from FlashSystem.${searchBlock(ctx, ["tech", "strategy"])}`,
          { timeoutMs: 9e4 }
        ),
        emptyIbm()
      )
    ]);
    reportProgress(3, "Agent 3 Complete", "Identified buying signals and matched IBM Storage portfolio.");
    return {
      buyingSignals: unwrap(buyingSignals, "buyingSignals"),
      ibmOpportunityMapping: unwrap(ibmMapping, "ibmOpportunityMapping")
    };
  };
  const runAgent4 = async (digest) => {
    const [meetingCore, meetingExtra, stakeholders] = await Promise.all([
      safe(
        "discovery+objections",
        () => callRorkJson(
          sys,
          `For "${companyName}", produce discovery questions and objection handling for an IBM Storage SE.

${digest}

Return JSON:
{
  "summary": string,
  "discoveryQuestions": DiscoveryQuestion[] (exactly 5),
  "objectionsAndCounters": ObjectionHandling[] (3)
}
DiscoveryQuestion = { "number": number, "question": string, "intent": string, "listenFor": string[], "pivot": string, "targetRole": string }
ObjectionHandling = { "objection": string, "fromRole": string, "whyTheySayIt": string, "response": string, "proofPoint": string }${searchBlock(ctx, ["tech"])}`,
          { timeoutMs: 9e4 }
        ),
        { summary: "", discoveryQuestions: [], objectionsAndCounters: [] }
      ),
      safe(
        "architectures+cases",
        () => callRorkJson(
          sys,
          `For "${companyName}", produce solution architectures and proof points mapped to IBM Storage.

${digest}

Return JSON:
{
  "solutionArchitectures": SolutionArchitecture[] (3),
  "caseStudies": CaseStudy[] (2)
}
SolutionArchitecture = { "id": string, "title": string, "scenario": string, "tiers": [{"name": string, "items": string[]}] (3 tiers), "benefits": string[] }
CaseStudy = { "customerDescriptor": string, "industry": string, "challenge": string, "solution": string, "results": string[], "verified": boolean }
All 3 SolutionArchitectures MUST reflect this company's actual industry (e.g. for a utility: Smart Grid Telemetry Lake with Ceph, Substation & OT Clean-Room Resilience with Defender, and Core Grid Analytics with FlashSystem; NEVER generate medical imaging or banking trading architectures for a utility!). For CaseStudy: set verified=true with a real named customer ONLY if you are genuinely confident it is a real public IBM reference; otherwise use an anonymized descriptor (e.g. "A major regional electric utility") and verified=false.${searchBlock(ctx, ["tech", "strategy"])}`,
          { timeoutMs: 9e4 }
        ),
        { solutionArchitectures: [], caseStudies: [] }
      ),
      safe(
        "stakeholders",
        () => callRorkJson(
          sys,
          `For "${companyName}", determine WHO an IBM Storage SE should actually engage \u2014 the specific right people, not a generic list. Return JSON ONLY:
{
  "engagementStrategy": string (3-4 sentences: who to lead with FIRST and why, the sequence to work the account, and who NOT to lead with. Be specific to THIS company's situation \u2014 e.g. if they are AI-heavy, the Head of AI/ML Platforms may matter more than a generic CIO.),
  "stakeholderMap": StakeholderPersona[] (4-5, chosen for THIS account's situation)
}
StakeholderPersona = {
  "role": string (the function that matters here, e.g. "Head of Infrastructure & Storage", "Chief Data/AI Officer", "Head of Site Reliability", "CISO" \u2014 pick the roles that actually drive a storage decision at THIS company),
  "typicalTitle": string,
  "personName": string | null (the ACTUAL current person if named in the sources below or you are confident; else null),
  "isNamedIndividual": boolean (true only with a real current name),
  "isPrimaryTarget": boolean (true for exactly ONE \u2014 the single best first contact),
  "priority": "High" | "Medium" | "Low",
  "risk": string (their top concern that storage touches),
  "valueHook": string (the specific IBM Storage angle that lands with THIS person, naming a product),
  "whyThisPerson": string (why they are, or are not, the right entry point for THIS deal specifically),
  "howToReach": string (a practical next step, e.g. a LinkedIn search string like 'VP Infrastructure ${companyName}'),
  "emailOpener": string (2-3 sentences, references a SPECIFIC ${companyName} fact),
  "source": { "label": string, "verified": boolean, "url"?: string } (only when a name comes from a source below; else omit)
}
Name real individuals when the sources below support it. Exactly one persona must have isPrimaryTarget=true.${searchBlock(ctx, ["people"])}`,
          { timeoutMs: 9e4 }
        ),
        { engagementStrategy: "", stakeholderMap: [] }
      )
    ]);
    reportProgress(4, "Agent 4 Complete", "Synthesized discovery questions, architectures, and stakeholder map.");
    const mCore = unwrap(meetingCore, "meetingPreparation");
    const mExtra = unwrap(meetingExtra, "meetingPreparation");
    const stk = unwrap(stakeholders, "stakeholders");
    const stakeholderMap = Array.isArray(stk) ? stk : stk?.stakeholderMap || [];
    const engagementStrategy = (Array.isArray(stk) ? "" : stk?.engagementStrategy) || "";
    return {
      meetingPreparation: {
        summary: mCore.summary || "",
        discoveryQuestions: mCore.discoveryQuestions || [],
        objectionsAndCounters: mCore.objectionsAndCounters || [],
        solutionArchitectures: mExtra.solutionArchitectures || [],
        caseStudies: mExtra.caseStudies || []
      },
      stakeholderMap,
      engagementStrategy
    };
  };
  let a1, a2, a3, a4;
  if (mode === "web-verified") {
    [a1, a2, a3, a4] = await Promise.all([runAgent1(), runAgent2(), runAgent3(""), runAgent4("")]);
  } else {
    [a1, a2] = await Promise.all([runAgent1(), runAgent2()]);
    const digest = groundingDigest(companyName, a1, a2);
    [a3, a4] = await Promise.all([runAgent3(digest), runAgent4(digest)]);
  }
  onProgress?.(step(5, "Agent 5 \xB7 Executive Briefing", "in_progress", "Synthesizing the full executive briefing and scoring the opportunity..."));
  const summaryContext = JSON.stringify({
    profile: a1.profile,
    strategy: a1.companyStrategy?.summary,
    tech: a2.technologyLandscape?.summary,
    incumbentVendors: (a2.technologyLandscape?.existingVendors || []).map((v) => `${v.vendor} (${v.category}; ${v.estimatedStage})`),
    challenges: a2.businessChallenges?.summary,
    signals: (a3.buyingSignals?.signals || []).map((s) => s.headline),
    ibm: (a3.ibmOpportunityMapping?.productOpportunities || []).map((p) => `${p.productName} -> ${p.matchedNeed}`),
    competitorTactics: (a3.ibmOpportunityMapping?.competitorTactics || []).map((c) => `${c.competitor}: ${c.ibmCounter}`)
  });
  const a5 = await safe(
    "executiveBriefing",
    () => callRorkJson(
      sys,
      `Using the research below for "${companyName}", produce the final synthesis. Return JSON:
{
  "opportunityScore": number (0-100, your honest propensity-to-buy IBM Storage estimate),
  "opportunityStage": "High propensity / urgent refresh" | "Strategic expansion" | "Competitive takeout" | "Early / nurture",
  "executiveBriefingDoc": string
}
The executiveBriefingDoc MUST be a thorough, well-structured MARKDOWN document (this is the ONE field where markdown is required). Aim for 450-650 words with crisp, punchy SE prose and bullet points under each ## heading:
## Executive Summary (the one-paragraph "why this account, why now")
## Where IBM Storage Fits (3-5 specific plays mapped to their situation across DS8A00, TS7700, Fusion, Defender, Scale, and FlashSystem)
## The Numbers That Matter (business-case framing)
## Competitive Landscape (who is likely incumbent and how to displace)
## Recommended Meeting Plan (how to run the first exec conversation)
## Key Risks & Unknowns (what to verify before the meeting \u2014 be honest about what is inferred)
Write in crisp SE prose. Ground all workloads strictly in this company's actual industry. Real IBM product names only. Frame estimates as estimates.

RESEARCH CONTEXT:
${summaryContext}`,
      { timeoutMs: 9e4 }
    ),
    { opportunityScore: 50, opportunityStage: "Early / nurture", executiveBriefingDoc: "" }
  );
  const report = {
    id,
    companyName: a1.profile?.companyName || companyName,
    ticker: a1.profile?.ticker ?? null,
    industry: a1.profile?.industry || "Unknown",
    headquarters: a1.profile?.headquarters || "Unknown",
    revenue: a1.profile?.revenue || "Unknown",
    employees: a1.profile?.employees || "Unknown",
    leadership: a1.profile?.leadership || "See stakeholder map",
    opportunityScore: clampScore(a5.opportunityScore),
    opportunityStage: a5.opportunityStage || "Early / nurture",
    lastUpdated: (/* @__PURE__ */ new Date()).toISOString(),
    researchMode: mode,
    provenanceNote: mode === "web-verified" ? "Findings backed by live web search carry a verified source link. Unlinked findings are AI analysis." : "This report is AI analysis generated from the model's knowledge. It is NOT web-verified \u2014 confirm time-sensitive facts before your meeting.",
    companyStrategy: a1.companyStrategy || emptyStrategy(),
    technologyLandscape: a2.technologyLandscape || emptyTech(),
    businessChallenges: a2.businessChallenges || emptyChallenges(),
    buyingSignals: a3.buyingSignals || { summary: "", signals: [] },
    ibmOpportunityMapping: a3.ibmOpportunityMapping || emptyIbm(),
    meetingPreparation: a4.meetingPreparation || emptyMeeting(),
    stakeholderMap: a4.stakeholderMap || [],
    engagementStrategy: a4.engagementStrategy || "",
    executiveBriefingDoc: a5.executiveBriefingDoc || ""
  };
  try {
    normalizeSources(report, mode);
  } catch (e) {
    console.warn("[orchestrator] normalizeSources failed (non-fatal):", e);
  }
  accountCache.set(id, report);
  saveDiskCache();
  onProgress?.(step(5, "Complete", "completed", `Dossier for ${report.companyName} ready.`));
  return report;
}
async function askAccountCopilot(account, question, history) {
  const sys = `You are AccountIQ's meeting-prep copilot for an IBM Storage Solutions Engineer. You answer questions about the account "${account.companyName}" grounded in the dossier below and in current IBM Storage product knowledge.

Rules:
- Be concise, specific, and practical. Answer in clean markdown (short paragraphs, bold for emphasis, bullets where helpful).
- Use exact IBM product names (FlashSystem 5600/7600/9600, FCM5, FlashSystem.ai, Storage Scale, Defender, Ceph, Fusion).
- Do NOT fabricate facts, customer names, or sources. If something isn't in the dossier and you're unsure, say so and suggest how to verify.

DOSSIER (JSON):
${JSON.stringify({
    profile: {
      companyName: account.companyName,
      industry: account.industry,
      revenue: account.revenue,
      leadership: account.leadership,
      stage: account.opportunityStage
    },
    strategy: account.companyStrategy?.summary,
    tech: account.technologyLandscape,
    challenges: account.businessChallenges?.summary,
    signals: account.buyingSignals?.signals,
    ibm: account.ibmOpportunityMapping
  }).slice(0, 9e3)}

IBM PORTFOLIO:
${portfolioContextForPrompt()}`;
  const messages = [
    { role: "system", content: sys },
    ...history.slice(-6).map((h) => ({ role: h.role, content: h.content })),
    { role: "user", content: question }
  ];
  return callRorkLlm(messages, { timeoutMs: 6e4 });
}
function step(n, agentName, status, message) {
  return { step: n, totalSteps: 5, agentName, status, message, timestamp: (/* @__PURE__ */ new Date()).toISOString() };
}
async function safe(label, fn, fallback) {
  try {
    return await fn();
  } catch (e) {
    console.warn(`[orchestrator] section "${label}" failed: ${e?.message || e}`);
    return fallback;
  }
}
function clampScore(v) {
  const n = Number(v);
  if (!Number.isFinite(n)) return 50;
  return Math.max(0, Math.min(100, Math.round(n)));
}
function unwrap(obj, key) {
  if (obj && typeof obj === "object" && !Array.isArray(obj) && obj[key] && typeof obj[key] === "object") {
    return obj[key];
  }
  return obj;
}
function normalizeSources(report, mode) {
  const fix = (src) => {
    if (!src || typeof src !== "object") return { label: "Model knowledge (not web-verified)", verified: false };
    if (mode === "ai-analysis" || !src.verified) {
      return { label: src.label || "Model knowledge (not web-verified)", verified: false };
    }
    if (!src.url) return { label: "Model knowledge (not web-verified)", verified: false };
    return { label: src.label || "Web source", verified: true, url: src.url, date: src.date };
  };
  const fixFindings = (arr) => {
    if (!Array.isArray(arr)) return;
    for (let i = 0; i < arr.length; i++) {
      let f = arr[i];
      if (typeof f === "string") {
        try {
          f = JSON.parse(f);
          arr[i] = f;
        } catch {
          continue;
        }
      }
      if (f && typeof f === "object") f.source = fix(f.source);
    }
  };
  const s = report;
  [s.companyStrategy.businessSegments, s.companyStrategy.techInvestments, s.companyStrategy.earningsCommentary, s.companyStrategy.aiAndInfraStrategy].forEach(fixFindings);
  [s.technologyLandscape.cloudFootprint, s.technologyLandscape.storageComputeDb, s.technologyLandscape.technologyGaps].forEach(fixFindings);
  fixFindings(s.technologyLandscape.existingVendors);
  [s.businessChallenges.dataGrowthCosts, s.businessChallenges.cybersecurityRegulatory, s.businessChallenges.resilienceDisasterRecovery, s.businessChallenges.aiWorkloadDemands].forEach(fixFindings);
  fixFindings(s.buyingSignals.signals);
  (s.stakeholderMap || []).forEach((p) => {
    if (!p || typeof p !== "object") return;
    if (p.source) {
      const fixed = fix(p.source);
      if (fixed.verified) p.source = fixed;
      else delete p.source;
    }
    if (p.isNamedIndividual && (!p.personName || mode === "web-verified" && !p.source)) {
      if (mode === "web-verified" && !p.source) p.isNamedIndividual = p.isNamedIndividual && Boolean(p.personName);
    }
    if (!p.personName) p.isNamedIndividual = false;
  });
}
var emptyStrategy = () => ({ summary: "", businessSegments: [], techInvestments: [], earningsCommentary: [], aiAndInfraStrategy: [] });
var emptyTech = () => ({ summary: "", cloudFootprint: [], storageComputeDb: [], existingVendors: [], technologyGaps: [] });
var emptyChallenges = () => ({ summary: "", dataGrowthCosts: [], cybersecurityRegulatory: [], resilienceDisasterRecovery: [], aiWorkloadDemands: [] });
var emptyIbm = () => ({ summary: "", productOpportunities: [], businessCase: [], competitorTactics: [], wedgeQuestions: [] });
var emptyMeeting = () => ({ summary: "", discoveryQuestions: [], solutionArchitectures: [], caseStudies: [], objectionsAndCounters: [] });

// server/app.ts
var app = express();
app.use(cors());
app.use(express.json());
var router = express.Router();
router.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "AccountIQ \u2014 IBM Storage Account Intelligence",
    researchMode: isWebSearchEnabled() ? "web-verified" : "ai-analysis",
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
});
router.get("/accounts", (_req, res) => {
  const summary = getAllCachedAccounts().map((a) => ({
    id: a.id,
    companyName: a.companyName,
    ticker: a.ticker,
    industry: a.industry,
    opportunityScore: a.opportunityScore,
    opportunityStage: a.opportunityStage,
    revenue: a.revenue,
    researchMode: a.researchMode,
    lastUpdated: a.lastUpdated
  })).sort((a, b) => a.lastUpdated < b.lastUpdated ? 1 : -1);
  res.json(summary);
});
router.get("/accounts/:id", (req, res) => {
  const account = getAccountByIdOrName(String(req.params.id));
  if (!account) {
    res.status(404).json({ error: "Account not found" });
    return;
  }
  res.json(account);
});
router.delete("/accounts/:id", (req, res) => {
  const ok = deleteAccount(String(req.params.id));
  res.status(ok ? 200 : 404).json({ ok });
});
router.post("/research", async (req, res) => {
  const { companyName } = req.body;
  if (!companyName || typeof companyName !== "string" || !companyName.trim()) {
    res.status(400).json({ error: "companyName is required" });
    return;
  }
  const isStream = req.query.stream === "true" || req.headers.accept === "text/event-stream";
  if (isStream) {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders?.();
    const send = (event, data) => res.write(`event: ${event}
data: ${JSON.stringify(data)}

`);
    try {
      const report = await runResearchPipeline(companyName.trim(), (p) => send("progress", p));
      send("complete", report);
      res.end();
    } catch (err) {
      console.error("[Research SSE] error:", err);
      send("error", { message: err?.message || "Research failed" });
      res.end();
    }
  } else {
    try {
      const report = await runResearchPipeline(companyName.trim());
      res.json(report);
    } catch (err) {
      console.error("[Research] error:", err);
      res.status(500).json({ error: err?.message || "Research failed" });
    }
  }
});
router.post("/chat", async (req, res) => {
  const { accountId, companyName, question, history } = req.body;
  if (!question) {
    res.status(400).json({ error: "question is required" });
    return;
  }
  const account = getAccountByIdOrName(accountId || companyName || "");
  if (!account) {
    res.status(404).json({ error: "Research this account first, then ask the copilot." });
    return;
  }
  try {
    const answer = await askAccountCopilot(account, question, history || []);
    res.json({ answer });
  } catch (err) {
    console.error("[Chat] error:", err);
    res.status(500).json({ error: err?.message || "Copilot failed" });
  }
});
app.use("/api", router);
app.use("/", router);
var app_default = app;
export {
  app_default as default
};
