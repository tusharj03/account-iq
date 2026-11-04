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
  ds8000: {
    key: 'ds8000',
    name: 'IBM Storage DS8A00 (DS8000 G10)',
    tagline: 'Enterprise tier-1 storage co-engineered for IBM zSystems and LinuxONE',
    positioning:
      'The current Generation 10 flagship tier-1 storage platform for IBM Z mainframes and mission-critical enterprise estates. Powered by POWER9+ active-active processor nodes and HPFE Gen3 NVMe flash, delivering 99.99999% availability, sub-20µs latency via zHyperLink, Safeguarded Copy with IBM Z Cyber Vault integration, automated multi-target GDPS disaster recovery, and Transparent Cloud Tiering (TCT) that offloads DFSMShsm CPU overhead from host mainframes.',
    keyCapabilities: [
      'POWER9+ active-active server pairs with High-Performance Flash Enclosure (HPFE Gen3) NVMe architecture for peak IOPS and ultra-low latency',
      'zHyperLink: Direct PCIe attachment to IBM zSystems processors providing <20-microsecond read response times for DB2 and IMS transactional workloads',
      'Safeguarded Copy & IBM Z Cyber Vault: Automated, immutable, logically air-gapped recovery copies with continuous forensic integrity analysis for z/OS',
      'Seven 9s (99.99999%) guaranteed data availability with zero-data-loss multi-target GDPS (Metro Mirror + Global Mirror)',
      'Transparent Cloud Tiering (TCT): Directly migrates cold mainframe datasets from storage controller to cloud/object storage without burning host mainframe MIPS',
      'Unified FICON, zHyperLink, and Fibre Channel connectivity supporting both mainframe z/OS and distributed open systems workloads',
      'Pervasive encryption and line-rate hardware cryptographic offload for regulatory compliance',
    ],
    targetWorkloads: [
      'IBM zSystems / z/OS mainframe core workloads',
      'Mainframe Managed Service Providers (MSPs) & hosting (Ensono, Kyndryl, DXC)',
      'High-throughput DB2 for z/OS, CICS, and IMS transaction processing',
      'Mission-critical financial, insurance, health, and government core systems',
    ],
    displacementTargets: ['Dell PowerMax 2500 / 8500 (FICON attached)', 'Hitachi VSP 5000 (Mainframe attached)'],
  },
  ts7700: {
    key: 'ts7700',
    name: 'IBM TS7700 (TS7770 / TS7760)',
    tagline: 'High-performance virtual tape server and grid for IBM Z mainframes',
    positioning:
      'The industry-standard mainframe virtual tape architecture. Replaces physical tape handling with high-speed all-flash/disk cache, automated multi-node active-active grid clustering across up to 8 sites, transparent object storage tiering, and native z/OS DFSMS integration.',
    keyCapabilities: [
      'Active-Active Grid Architecture: Up to 8 multi-site grid nodes providing continuous automated disaster recovery with zero host intervention',
      'Safeguarded Copy for Virtual Tape: Protects mainframe batch datasets, catalog backups, and logs from ransomware tampering',
      'Cloud & Object Storage Tiering: Transparently offloads cold mainframe tape data to IBM Storage Ceph, IBM Cloud, or AWS S3 without mainframe CPU tax',
      'Dramatically shrinks mainframe batch processing and backup windows for high-MIPS environments',
    ],
    targetWorkloads: [
      'Mainframe batch processing & backup',
      'z/OS DFSMShsm and DFSMSdss automated dataset migration',
      'Multi-tenant mainframe MSP hosting and service delivery (e.g. Ensono)',
      'Long-term mainframe regulatory archiving',
    ],
    displacementTargets: ['Dell DLm (Disk Library for mainframe)', 'Luminex Channel Gateway', 'Oracle StorageTek VSM'],
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
  storageFusion: {
    key: 'storageFusion',
    name: 'IBM Storage Fusion (HCI & Software)',
    tagline: 'Turnkey container data platform, backup, and DR for Red Hat OpenShift & hybrid cloud',
    positioning:
      'IBM\'s primary strategic platform for modern application data services, Red Hat OpenShift, stateful Kubernetes microservices, and hybrid cloud app modernization. Available as turnkey integrated HCI or software-defined on bare metal/cloud. Delivers persistent container storage, app-consistent backup and restore (manifests + volumes), multi-cluster automated disaster recovery (Metro-DR / Regional-DR), and seamless hybrid cloud mobility.',
    keyCapabilities: [
      'Turnkey container-native data platform directly integrated into Red Hat OpenShift control plane',
      'Application-consistent backup and rapid restore (protects both stateful persistent volumes and complete Kubernetes metadata/manifests)',
      'Automated zero-RPO Metro-DR and asynchronous Regional-DR across multi-cluster OpenShift estates',
      'Direct data services and acceleration for watsonx and enterprise AI pipelines on OpenShift',
      'Global data access bridging OpenShift clusters to IBM Storage Scale and cloud data sources',
      'The definitive enterprise alternative to Portworx, NetApp Astra, and complex DIY container storage stacks',
    ],
    targetWorkloads: [
      'Red Hat OpenShift application modernization & stateful microservices',
      'Enterprise container backup, disaster recovery, and mobility',
      'watsonx & AI pipelines running on OpenShift',
      'MSP multi-tenant cloud-native hosting and service delivery',
    ],
    displacementTargets: ['Portworx by Pure Storage', 'NetApp Astra / Trident', 'Dell Container Storage Modules (CSM)', 'DIY Rook/Ceph on Kubernetes'],
  },
  storageCeph: {
    key: 'storageCeph',
    name: 'IBM Storage Ceph',
    tagline: 'Software-defined unified block, file, and object for exabyte-scale bulk data',
    positioning:
      'Open, software-defined storage for standalone, exabyte-scale S3 object repositories, telemetry lakes, and bulk archival tiers on commodity x86 servers. (Note: For Red Hat OpenShift, stateful microservices, and container application modernization, IBM strategically leads with IBM Storage Fusion).',
    keyCapabilities: [
      'Scale-out from petabytes to exabytes on commodity hardware without proprietary appliance markups',
      'S3-compatible object storage with multi-site asynchronous replication',
      'Open-source foundation with enterprise-hardened IBM support and lifecycle management',
      'Cost-effective bulk tier for raw telemetry, IoT logs, video archives, and long-term uncurated data lakes',
    ],
    targetWorkloads: ['Raw telemetry & IoT log archives', 'Secondary S3 object repositories', 'Multi-petabyte uncurated data lakes', 'Commodity hardware bulk storage'],
    displacementTargets: ['Dell ECS / ObjectScale', 'Scality', 'MinIO', 'Pure FlashBlade //E'],
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
    flagshipProducts: ['PowerMax 2500 / 8500 (Open Systems & Mainframe FICON)', 'PowerStore', 'PowerScale (Isilon)', 'PowerProtect / Cyber Recovery', 'ECS / ObjectScale', 'DLm (Disk Library for mainframe)'],
    vulnerabilities: [
      'Post-warranty maintenance cliff: support/maintenance pricing tends to rise sharply in years 4–5, nudging customers toward expensive forklift refreshes.',
      'Fragmented OS estate: PowerMax, PowerStore, PowerScale, and ECS each run completely different operating systems — no single unified control plane.',
      'Mainframe / FICON attachments: PowerMax lacks native co-engineering with IBM z16 — no zHyperLink (<20µs latency), no IBM Z Cyber Vault integration, and cannot offload DFSMShsm dataset migration via Transparent Cloud Tiering (TCT), consuming expensive host mainframe MIPS.',
      'Ransomware detection is largely post-process software (CloudIQ) rather than inline drive hardware, and recovery orchestration is fragmented.',
      'PowerScale can bottleneck on single-stream throughput for large GPU clusters vs parallel file systems.',
      'ECS appliance lock-in limits open S3 scaling across commodity servers.',
    ],
    trapsToSet: [
      'Ask: "When Dell quoted your refresh, were years 4, 5, and 6 of maintenance locked in writing — or are you exposed to post-warranty escalation?"',
      'Ask: "For mainframe workloads on PowerMax, how many host MIPS are burned during daily backup and migration compared to IBM Storage DS8A00 Transparent Cloud Tiering?"',
      'Ask: "For cyber recovery, how long does clean-room validation take across multi-tier workloads before restoring to production?"',
      'Ask: "How many disparate management consoles do you log into to manage Dell block, file, object, backup, and mainframe silos?"',
    ],
    ibmCounterPosition:
      'IBM offers a cohesive multi-product portfolio: IBM Storage DS8A00 and TS7700 for IBM zSystems mainframe tier-1 storage and virtual tape (displacing PowerMax and DLm with sub-20µs zHyperLink and seven-9s reliability); IBM Storage Defender for automated clean-room cyber resilience across the entire estate; IBM Storage Fusion for turnkey container data services and backup on OpenShift; IBM Storage Scale for GPU/AI parallel streaming (displacing PowerScale); IBM Storage Ceph for open S3 bulk object lakes (displacing ECS); and IBM FlashSystem 9600 with FCM5 for mission-critical distributed block.',
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
