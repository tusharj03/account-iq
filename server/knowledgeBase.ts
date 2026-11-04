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
    flagshipProducts: ['PowerMax 2500 / 8500', 'PowerStore', 'PowerScale (Isilon)', 'PowerProtect'],
    vulnerabilities: [
      'Post-warranty maintenance cliff: support/maintenance pricing tends to rise sharply in years 4–5, nudging customers toward expensive forklift refreshes.',
      'Fragmented OS estate: PowerMax, PowerStore, and PowerScale each run different operating systems — no single control plane like IBM Storage Virtualize.',
      'Ransomware detection is largely post-process/software (CloudIQ) rather than inline at the drive module like IBM FCM5.',
      'PowerScale can bottleneck on single-stream throughput for large GPU training vs a true parallel file system.',
    ],
    trapsToSet: [
      'Ask: "When Dell quoted your refresh, were years 4, 5, and 6 of maintenance locked in writing — or are you exposed to the post-warranty increase?"',
      'Ask: "How many minutes after an active encryption event does your current tooling notify SecOps — is detection inline at the drive, or delayed in analytics?"',
    ],
    ibmCounterPosition:
      'IBM FlashSystem 9600 with FCM5 gives sub-minute inline ransomware detection and ~60-second safeguarded-copy recovery, virtualizes existing Dell arrays to protect prior investment, and offers transparent flat-rate maintenance via FlashWatch.',
  },
  pure: {
    vendor: 'Pure Storage',
    flagshipProducts: ['FlashArray //X (performance)', 'FlashArray //XL (flagship)', 'FlashArray //C & //E (capacity)', 'FlashBlade //S & //E', 'Evergreen//One'],
    vulnerabilities: [
      'Evergreen//One subscription economics can exceed capex ownership over a multi-year horizon — worth modeling cumulative 5-year spend.',
      'Compression/dedup runs on the controllers; heavy concurrent random writes can produce latency tail spikes.',
      'FlashBlade can hit network/controller choke points feeding very large GPU training clusters vs GPUDirect parallel streaming.',
      'No dedicated inline hardware ransomware detection on the flash module itself (relies on snapshot cadence + software).',
    ],
    trapsToSet: [
      'Ask: "Have you modeled cumulative 5-year Evergreen//One spend against owning capacity with guaranteed data reduction?"',
      'Ask: "At peak GPU data-loader bandwidth, have you seen NFS/S3 choke points on FlashBlade?"',
    ],
    ibmCounterPosition:
      'IBM Storage Scale delivers parallel GPUDirect throughput for AI pipelines, while FlashSystem with FCM5 offloads compression/dedup to module hardware — protecting host IOPS — and adds inline cyber detection Pure lacks.',
  },
  netapp: {
    vendor: 'NetApp',
    flagshipProducts: ['AFF A-Series (A20 / A50 / A70 / A90 / A1K)', 'FAS Series', 'StorageGRID', 'FSx for NetApp ONTAP'],
    vulnerabilities: [
      'WAFL snapshot/metadata sprawl can degrade read performance on high-churn databases over time.',
      'FSx for ONTAP in cloud can accrue meaningful egress and capacity charges as datasets grow.',
      'Traditional dual-controller HA pairs can cap IOPS vs multi-node scale-out clustering.',
    ],
    trapsToSet: [
      'Ask: "How does database latency behave during heavy snapshot rotation under ONTAP?"',
      'Ask: "What are your projected FSx for ONTAP egress/capacity costs over the next 3 years as AI datasets expand?"',
    ],
    ibmCounterPosition:
      'IBM FlashSystem with Safeguarded Copy avoids snapshot-driven latency degradation, and IBM Storage Scale provides true hybrid-cloud data mobility (AFM) without punitive egress.',
  },
  hpe: {
    vendor: 'HPE',
    flagshipProducts: ['Alletra Storage MP (B10000 / X10000)', 'Alletra 9000', 'GreenLake for Block Storage'],
    vulnerabilities: [
      'GreenLake consumption billing can be hard to forecast and may exceed owned-capacity TCO at steady-state.',
      'Disaggregated Alletra MP is relatively newer in enterprise mission-critical track record vs IBM FlashSystem lineage.',
      'Cyber-resilience depends on surrounding software stack rather than inline module-level detection.',
    ],
    trapsToSet: [
      'Ask: "How predictable has GreenLake billing actually been quarter to quarter against your original estimate?"',
      'Ask: "Where does ransomware detection happen in your Alletra stack — inline at the drive, or in downstream software?"',
    ],
    ibmCounterPosition:
      'IBM FlashSystem offers a long mission-critical track record with inline FCM5 cyber detection and transparent maintenance, and can virtualize HPE arrays under one control plane during transition.',
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
