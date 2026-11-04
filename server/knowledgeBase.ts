/**
 * IBM Storage Knowledge Base & Competitive Battlecards
 *
 * Reflects the IBM Storage portfolio as of the February 2026 FlashSystem refresh
 * (GA March 6, 2026): FlashSystem 5600 / 7600 / 9600, FlashCore Module 5 (FCM5),
 * and the FlashSystem.ai autonomous management layer.
 *
 * This is curated, factual product knowledge — not generated or fabricated.
 * Sources: IBM product pages + Feb 2026 launch coverage (blocksandfiles, NAND Research,
 * StorageNewsletter, Futurum). Keep this file current as IBM ships new models.
 */

export interface IbmProduct {
  key: string;
  name: string;
  tagline: string;
  positioning: string;
  keyCapabilities: string[];
  targetWorkloads: string[];
  displacementTargets: string[];
}

export const IBM_STORAGE_PORTFOLIO: Record<string, IbmProduct> = {
  flashSystem: {
    key: 'flashSystem',
    name: 'IBM FlashSystem 5600 / 7600 / 9600',
    tagline: 'Autonomous mission-critical block storage with inline cyber resilience',
    positioning:
      'Primary enterprise block storage. The Feb 2026 refresh replaces the 5300/7300/9500 with the 5600 (2.6M IOPS, edge/space-constrained), 7600 (4.3M IOPS, 2U), and 9600 flagship (6.3M IOPS, 2U, up to 3.3PB raw / ~11.8PBe effective). All run IBM Storage Virtualize and FlashSystem.ai.',
    keyCapabilities: [
      'FlashCore Module 5 (FCM5): 6.6 / 13.2 / 26.4 / 52.8 and 105.6 TB options (105.6TB exclusive to 9600), PCIe Gen4, with deduplication now offloaded to module hardware for up to 40% greater data efficiency vs the prior generation',
      'FlashSystem.ai: agentic autonomous management that executes thousands of automated decisions/day and cuts manual storage administration by up to 90%',
      'Guaranteed sub-minute ransomware anomaly detection with a <1% false-positive rate, plus recovery of safeguarded copies within ~60 seconds',
      'Safeguarded Copy: immutable, isolated snapshots that cannot be altered or deleted via array admin credentials',
      'IBM Storage Virtualize: single control plane that virtualizes 500+ existing third-party arrays (Dell, Pure, NetApp) to extend their life and unify management',
      'Consistent low-microsecond latency for core banking, trading (OLTP), and large databases',
    ],
    targetWorkloads: ['Core banking / trading (OLTP)', 'Epic / Oracle / SAP HANA databases', 'VMware & Red Hat OpenShift virtualization', 'Mission-critical consolidation'],
    displacementTargets: ['Dell PowerMax 2500/8500', 'Dell PowerStore', 'Pure Storage FlashArray //X & //XL', 'NetApp AFF A-Series'],
  },
  c200: {
    key: 'c200',
    name: 'IBM FlashSystem C200',
    tagline: 'High-density capacity flash for secondary and data-heavy tiers',
    positioning:
      'Capacity-optimized FlashSystem using high-density FlashCore Modules (~46TB/module) for cost-efficient secondary storage, backup targets, and large-but-cooler datasets where QLC-class economics matter more than peak IOPS.',
    keyCapabilities: [
      'Very high density per rack unit to collapse storage footprint and power/cooling',
      'Same Storage Virtualize + Safeguarded Copy data services as the performance tier',
      'Strong $/TB for backup landing zones, content repositories, and capacity tiers',
    ],
    targetWorkloads: ['Backup & recovery targets', 'Capacity / secondary tier', 'Content repositories', 'Flash-based archive'],
    displacementTargets: ['Dell PowerStore (capacity)', 'Pure FlashArray //C & //E', 'Bulk disk-based NAS'],
  },
  storageScale: {
    key: 'storageScale',
    name: 'IBM Storage Scale (formerly GPFS)',
    tagline: 'Parallel file & object data platform for AI and HPC',
    positioning:
      'Ultra-high-throughput parallel file system for AI model training, HPC, and analytics where GPUs must be fed without starving. Delivers a single global namespace across on-prem, edge, and cloud.',
    keyCapabilities: [
      'NVIDIA GPUDirect Storage (GDS) support to stream data straight to GPU memory for DGX / SuperPOD-class clusters',
      'Massive parallel aggregate throughput so GPU fleets stay saturated during training',
      'Global Data Platform: one namespace spanning on-prem, edge, AWS, Azure, Google Cloud',
      'Active File Management (AFM): intelligent caching / sync across sites without cloud lock-in',
      'Automated tiering to object or tape for low-cost retention of cold training data',
    ],
    targetWorkloads: ['LLM / GenAI pre-training & fine-tuning', 'HPC & quantitative research', 'Genomics & imaging', 'High-throughput analytics'],
    displacementTargets: ['NetApp ONTAP / FSx for ONTAP', 'Pure Storage FlashBlade //S', 'Dell PowerScale (Isilon)', 'VAST Data', 'WEKA'],
  },
  storageDefender: {
    key: 'storageDefender',
    name: 'IBM Storage Defender',
    tagline: 'End-to-end cyber resilience and automated recovery',
    positioning:
      'Cyber-resilience orchestration across the data estate: early ransomware detection, immutable copies, and automated clean recovery that satisfies DORA and SEC incident-response expectations.',
    keyCapabilities: [
      'Unified management plane that integrates with SIEM/SOAR (QRadar, Splunk, Microsoft Sentinel)',
      'Storage-side and VM-side anomaly detection to flag encryption events early',
      'Clean-room recovery orchestration: validate data in an isolated sandbox before restoring to production',
      'Auditable recovery workflows aligned to DORA (EU) and SEC cyber-incident disclosure rules',
      'Cuts ransomware recovery time from days/weeks to hours',
    ],
    targetWorkloads: ['Enterprise DR / BCP', 'Mission-critical database recovery', 'Regulatory compliance', 'Ransomware response'],
    displacementTargets: ['Commvault', 'Cohesity', 'Rubrik', 'Dell PowerProtect / Cyber Recovery'],
  },
  storageCeph: {
    key: 'storageCeph',
    name: 'IBM Storage Ceph',
    tagline: 'Software-defined unified block, file, and object at scale',
    positioning:
      'Open, software-defined storage for cloud-native platforms and large data lakes — S3-compatible object, block, and file from one cluster, scaling to exabytes.',
    keyCapabilities: [
      'Scale-out from petabytes to exabytes on commodity hardware',
      'S3-compatible object with multi-site replication',
      'Open-source foundation with enterprise-hardened IBM support',
      'Cost-effective tier for AI/RAG corpora, vector data, and data lakes',
    ],
    targetWorkloads: ['Data lakes & object repositories', 'Cloud-native / Kubernetes persistent volumes', 'RAG & AI data corpora', 'Archival repositories'],
    displacementTargets: ['Dell ECS / ObjectScale', 'Scality', 'MinIO', 'Pure FlashBlade //E'],
  },
  storageFusion: {
    key: 'storageFusion',
    name: 'IBM Storage Fusion',
    tagline: 'Container-native data services for Red Hat OpenShift',
    positioning:
      'Turnkey data platform for OpenShift — software or HCI appliance — delivering persistent storage, backup, and data protection for stateful Kubernetes apps and AI/watsonx on OpenShift.',
    keyCapabilities: [
      'Software-only or integrated HCI deployment on bare metal / cloud',
      'Container-granular backup & restore (both app manifests and stateful volumes)',
      'Data services for watsonx and AI pipelines running on OpenShift',
      'Global data access that connects OpenShift to Storage Scale data',
    ],
    targetWorkloads: ['Stateful Kubernetes apps', 'OpenShift modernization', 'watsonx / AI on OpenShift', 'Hybrid-cloud container pipelines'],
    displacementTargets: ['Portworx by Pure Storage', 'NetApp Astra / Trident', 'Dell Container Storage Modules'],
  },
  tapeAndArchive: {
    key: 'tapeAndArchive',
    name: 'IBM Tape (Diamondback / TS4500)',
    tagline: 'Air-gapped, low-cost, low-carbon deep archive',
    positioning:
      'The lowest-cost, lowest-power retention and ransomware fallback tier. A true physical air gap plus very low $/TB make it ideal for long-term compliance and cold AI data.',
    keyCapabilities: [
      'Tens of petabytes of capacity in a single rack (Diamondback)',
      'True physical air gap: offline media is unreachable over the network',
      'A fraction of the power/cooling of disk or flash — lowest carbon footprint',
      'Very low $/TB with multi-decade media longevity',
    ],
    targetWorkloads: ['Long-term compliance (SEC 17a-4, FINRA, HIPAA)', 'Cold AI training-data retention', 'Final ransomware fallback copy'],
    displacementTargets: ['Spectra Logic', 'Quantum Scalar', 'AWS Glacier Deep Archive (repatriation)'],
  },
};

export interface CompetitorBattlecard {
  vendor: string;
  flagshipProducts: string[];
  vulnerabilities: string[];
  trapsToSet: string[];
  ibmCounterPosition: string;
}

export const COMPETITOR_BATTLECARDS: Record<string, CompetitorBattlecard> = {
  dell: {
    vendor: 'Dell Technologies',
    flagshipProducts: ['PowerMax 2500 / 8500', 'PowerStore', 'PowerScale (Isilon)', 'PowerProtect / Cyber Recovery', 'ECS / ObjectScale'],
    vulnerabilities: [
      'Post-warranty maintenance cliff: support/maintenance pricing tends to rise sharply in years 4–5, nudging customers toward expensive forklift refreshes.',
      'Fragmented OS estate: PowerMax, PowerStore, PowerScale, and ECS each run completely different operating systems — no single unified control plane.',
      'Ransomware detection is largely post-process software (CloudIQ) rather than inline drive hardware, and recovery orchestration is fragmented.',
      'PowerScale can bottleneck on single-stream throughput for large GPU clusters vs parallel file systems.',
      'ECS appliance lock-in limits open S3 scaling across commodity servers.',
    ],
    trapsToSet: [
      'Ask: "When Dell quoted your refresh, were years 4, 5, and 6 of maintenance locked in writing — or are you exposed to post-warranty escalation?"',
      'Ask: "For cyber recovery, how long does clean-room validation take across multi-tier workloads before restoring to production?"',
      'Ask: "How many disparate management consoles do you log into to manage Dell block, file, object, and backup silos?"',
    ],
    ibmCounterPosition:
      'IBM offers a cohesive multi-product portfolio: IBM Storage Defender for automated clean-room cyber resilience across the entire estate; IBM Storage Ceph for open, software-defined S3 telemetry and object lakes (displacing ECS); IBM Storage Scale for GPU/AI parallel streaming (displacing PowerScale); and IBM FlashSystem 9600 with FCM5 for mission-critical block with inline hardware ransomware detection.',
  },
  pure: {
    vendor: 'Pure Storage',
    flagshipProducts: ['FlashArray //X & //XL', 'FlashArray //C & //E', 'FlashBlade //S & //E', 'Portworx', 'Evergreen//One'],
    vulnerabilities: [
      'Evergreen//One subscription economics can heavily exceed capex ownership over a multi-year horizon — cumulative 5-year spend is often significantly higher.',
      'Compression and deduplication run on controllers; heavy concurrent writes can trigger latency tail spikes.',
      'FlashBlade can hit controller choke points feeding large GPU training fleets vs true parallel file streaming.',
      'No inline hardware ransomware detection on the flash module itself (relies on scheduled snapshots and software alerts).',
      'Portworx adds complex separate licensing and management on top of Kubernetes.',
    ],
    trapsToSet: [
      'Ask: "Have you modeled cumulative 5-year Evergreen//One subscription spend against owning capacity with guaranteed hardware data reduction?"',
      'Ask: "At peak GPU training throughput, have you seen NFS/S3 controller choke points on FlashBlade?"',
      'Ask: "For Kubernetes microservices, how many separate tooling layers do you maintain between Portworx and your underlying storage?"',
    ],
    ibmCounterPosition:
      'IBM Storage Fusion provides turnkey container-native data services, backup, and DR directly integrated with Red Hat OpenShift (displacing Portworx); IBM Storage Scale delivers GPUDirect parallel throughput for AI (displacing FlashBlade); IBM Storage Ceph provides exabyte-scale open object; and IBM FlashSystem with FCM5 offloads compression/dedup to drive silicon with guaranteed sub-minute inline ransomware detection.',
  },
  netapp: {
    vendor: 'NetApp',
    flagshipProducts: ['AFF A-Series (A20–A1K)', 'FAS Series', 'StorageGRID', 'FSx for NetApp ONTAP', 'NetApp Astra / Trident'],
    vulnerabilities: [
      'WAFL snapshot metadata sprawl degrades latency on high-churn transactional databases over time.',
      'Cloud data mobility (FSx for ONTAP) incurs steep egress and capacity fees as telemetry and AI data grow.',
      'Dual-controller HA architecture caps IOPS ceiling vs modern scale-out clusters.',
      'StorageGRID appliances have proprietary hardware ties compared to open software-defined object storage.',
    ],
    trapsToSet: [
      'Ask: "How does database latency behave during heavy snapshot rotation under ONTAP?"',
      'Ask: "What are your projected FSx for ONTAP egress and capacity costs over the next 3 years as analytics datasets expand?"',
      'Ask: "What is your automated clean-room recovery plan if your primary NetApp arrays and snapshots are compromised?"',
    ],
    ibmCounterPosition:
      'IBM Storage Defender provides unified cyber resilience and audited clean-room recovery across heterogeneous arrays; IBM Storage Ceph delivers open S3 object storage at multi-petabyte scale without appliance markups (displacing StorageGRID); IBM Storage Fusion delivers container-native backup on OpenShift (displacing Astra); and IBM Storage Scale provides true hybrid-cloud global mobility (AFM) without cloud lock-in.',
  },
  hpe: {
    vendor: 'HPE',
    flagshipProducts: ['Alletra Storage MP (B10000 / X10000)', 'Alletra 9000', 'GreenLake for Block Storage', 'Zerto'],
    vulnerabilities: [
      'GreenLake consumption billing can be unpredictable quarter-to-quarter and exceeds owned-capacity TCO at scale.',
      'Disaggregated Alletra MP architecture is newer with a shorter enterprise mission-critical track record vs established platforms.',
      'Ransomware detection depends on downstream software tools rather than inline module-level drive hardware.',
      'Lacks native deep-tier exabyte object integration without third-party bolt-ons.',
    ],
    trapsToSet: [
      'Ask: "How predictable has GreenLake billing actually been against your original forecast?"',
      'Ask: "Where does ransomware detection happen in your Alletra stack — inline at the hardware drive, or delayed in host software?"',
      'Ask: "How do you coordinate disaster recovery between containerized apps and legacy SAN volumes?"',
    ],
    ibmCounterPosition:
      'IBM FlashSystem offers proven reliability with inline FCM5 hardware cyber detection and transparent flat-rate maintenance via FlashWatch; IBM Storage Defender orchestrates enterprise-wide cyber recovery; IBM Storage Fusion unifies container data protection for OpenShift; and IBM Tape provides a true physical air-gapped compliance tier.',
  },
};

/** Short, flat summary string used to inject portfolio context into LLM prompts. */
export function portfolioContextForPrompt(): string {
  return Object.values(IBM_STORAGE_PORTFOLIO)
    .map((p) => `- ${p.name} — ${p.tagline}. Positioning: ${p.positioning} Displaces: ${p.displacementTargets.join(', ')}.`)
    .join('\n');
}

export function competitorContextForPrompt(): string {
  return Object.values(COMPETITOR_BATTLECARDS)
    .map((c) => `- ${c.vendor} (flagships: ${c.flagshipProducts.join(', ')}). Weak spots: ${c.vulnerabilities.join(' ')}`)
    .join('\n');
}
