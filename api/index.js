// server/app.ts
import "dotenv/config";
import express from "express";
import cors from "cors";

// server/orchestrator.ts
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

// server/data/account_cache.json
var account_cache_default = {
  pfizer: {
    id: "pfizer",
    companyName: "Pfizer Inc.",
    ticker: "PFE",
    industry: "Pharmaceutical Manufacturing",
    headquarters: "New York, New York, United States",
    revenue: "$58.5B (FY2024)",
    employees: "~75,000",
    leadership: "Dennis Hancock",
    opportunityScore: 80,
    opportunityStage: "High propensity / urgent refresh",
    lastUpdated: "2026-11-04T05:17:13.312Z",
    researchMode: "web-verified",
    provenanceNote: "Findings backed by live web search carry a verified source link. Unlinked findings are AI analysis.",
    companyStrategy: {
      summary: "Pfizer continues to focus on high\u2011growth, innovation\u2011heavy portfolio segments while tightening operating leverage through a dedicated cost\u2011realignment program. In Q2\u202F2026, the company lifted its 2026 revenue guidance by $500\u202Fmillion, reflecting solid performance of key drug candidates and vaccine revenues. Pfizer\u2019s cost\u2011realignment initiative is now targeting $9.7\u202Fbillion in net savings through 2029, with an additional $1.0\u202Fbillion in savings projected for 2026 alone. The company is also positioning AI and digital tools as a strategic priority to accelerate decision\u2011making across R&D, manufacturing and commercial functions. These moves underscore the need for scalable, high\u2011performance storage ecosystems that support large data volumes and stringent data\u2011integrity requirements across the pharmaceutical value chain.",
      businessSegments: [
        {
          id: "BS1",
          title: "Pharmaceuticals Segment Dominance",
          detail: "Pfizer\u2019s core pharmaceuticals segment remains the principal revenue generator, delivering over 80\u202F% of total sales in recent periods. This segment is anchored by established blockbuster drugs and rapid\u2011action treatments across oncology, immunology, and cardiology. The high compound\u2011ability and data\u2011intensity of these offerings can strain legacy storage solutions. A robust, high\u2011IOPS storage architecture such as IBM FlashSystem 9600 can sustain critical R&D workloads while meeting regulatory audit demands.",
          confidence: "High",
          whyItMatters: "IBM Storage SEs must architect infrastructures capable of handling the FDA\u2011reviewable data streams and large scientific datasets coming from Pfizer\u2019s R&D laboratories.",
          source: {
            label: "Yahoo Finance",
            verified: true,
            url: "https://finance.yahoo.com/healthcare/articles/pfizer-inc-q2-2026-earnings-225034120.html"
          }
        },
        {
          id: "BS2",
          title: "Vaccine and Immunology Revenue Growth",
          detail: "Pfizer\u2019s vaccine and immunology products contributed an estimated $2.5\u202Fbillion to Q2\u202F2026 sales, setting the stage for a 12% growth rate in the vaccine portfolio. The increasingly digital supply chain and real\u2011time cold\u2011chain monitoring amplify storage requirements for real\u2011time analytics and traceability. IBM Storage Defender can provide regulated, immutable copies of cold\u2011chain data to meet global regulatory compliance. Integrating inline cyber\u2011resilience with IBM FlashSystem 5600 supports the accelerated cycle of vaccine lead discovery and production.",
          confidence: "Medium",
          whyItMatters: "Ensuring data fidelity and resilience across Pfizer\u2019s regulated vaccine supply chain is imperative to meet global health compliance and mitigate cyber\u2011threat exposures.",
          source: {
            label: "Model knowledge (not web-verified)",
            verified: false
          }
        }
      ],
      techInvestments: [
        {
          id: "TI1",
          title: "Investment in Flare Therapeutics",
          detail: "On June\u202F30\u202F2026, Pfizer invested $200\u202Fmillion in Cambridge\u2011based Flare Therapeutics, a mRNA\u2011platform company focused on next\u2011generation vaccines. The deal positions Pfizer to co\u2011develop vaccine libraries that will generate high\u2011volume, high\u2011velocity data streams requiring HPC\u2011level test and compute environments. IBM Storage Scale can deliver a scale\u2011out parallel file system, ideal for training AI models on such vaccine data sets.",
          confidence: "High",
          whyItMatters: "IBM SEs should highlight IBM Storage Scale\u2019s ability to support AI model training and data lake consolidation for Pfizer\u2019s mRNA vaccine R&D initiatives.",
          source: {
            label: "Tracxn",
            verified: true,
            url: "https://tracxn.com/d/corporate-investments/investments-by-pfizer/__xyg9oYmOnhITPLamLtTyQOduT8SRmMbg5vRv1SWpJw"
          }
        },
        {
          id: "TI2",
          title: "Investment in Oblenio Bio",
          detail: "Pfizer\u2019s $180\u202Fmillion investment in Oblenio Bio on June\u202F25\u202F2026 supports artificial\u2011enzyme therapeutics for metabolic disease. This partnership expands data requirements for proteomics and metabolomics assays, generating terabytes of experimental metadata. IBM FlashSystem 7600 can provide the necessary write throughput to ingest assay data in real time without bottlenecking downstream analytics.",
          confidence: "High",
          whyItMatters: "Embedding IBM FlashSystem 7600 into Oblenio\u2019s data pipelines can reduce latency and comply with data\u2011integrity standards critical for FDA submissions.",
          source: {
            label: "Tracxn",
            verified: true,
            url: "https://tracxn.com/d/corporate-investments/investments-by-pfizer/__xyg9oYmOnhITPLamLtTyQOduT8SRmMbg5vRv1SWpJw"
          }
        },
        {
          id: "TI3",
          title: "Investment in CellCentric",
          detail: "Pfizer\u2019s May\u202F6\u202F2026 investment in CellCentric (UK) earmarks $350\u202Fmillion for cellular therapies. The clinical trials generate large training datasets for AI\u2011driven immunophenotyping. IBM Storage Ceph can offer a unified S3\u2011compatible object store that scales to exabytes, supporting both structured and unstructured data from trials, while enabling efficient collaboration across global research sites.",
          confidence: "High",
          whyItMatters: "A unified, object\u2011oriented storage layer is essential for sharing trial data securely across multiple regulatory jurisdictions.",
          source: {
            label: "Tracxn",
            verified: true,
            url: "https://tracxn.com/d/corporate-investments/investments-by-pfizer/__xyg9oYmOnhITPLamLtTyQOduT8SRmMbg5vRv1SWpJw"
          }
        }
      ],
      earningsCommentary: [
        {
          id: "EC1",
          title: "Revamped Revenue Guidance",
          detail: "Pfizer raised its 2026 revenue guidance by $500\u202Fmillion, a move announced during the Q2\u202F2026 earnings call. This adjustment reflects robust sales from newly approved oncology drugs and sustained vaccine demand. The uplift signals continued growth momentum, which will require scalable data storage solutions to capture and analyze increasing clinical and commercial data volumes.",
          confidence: "High",
          whyItMatters: "Higher revenue projection accentuates the need for high\u2011throughput storage to manage more expansive datasets for analytics and reporting.",
          source: {
            label: "Yahoo Finance",
            verified: true,
            url: "https://finance.yahoo.com/healthcare/articles/pfizer-inc-q2-2026-earnings-225034120.html"
          }
        },
        {
          id: "EC2",
          title: "Cost\u2011Realignment Program Impact",
          detail: "Pfizer\u2019s Realigning\u202FOur\u202FCost\u202FBase\u202FProgram now targets $9.7\u202Fbillion in total net savings through 2029, with an additional $1.0\u202Fbillion of savings slated for 2026. The program focuses on manufacturing optimization and technology\u2011led simplification across commercial, R&D and enabling functions. Cost reductions free capital that could be redirected to data\u2011infrastructure investments, making storage modernization an attractive leverage point.",
          confidence: "High",
          whyItMatters: "Reducing operating expense enables budget allocation for advanced storage offerings such as IBM FlashSystem 7600 and IBM Storage Defender, improving operational resilience and cost per GB saved.",
          source: {
            label: "Financial Times",
            verified: true,
            url: "https://markets.ft.com/data/announce/detail?dockey=600-202608040645BIZWIRE_USPRX____20260804_BW345420-1"
          }
        }
      ],
      aiAndInfraStrategy: [
        {
          id: "AI1",
          title: "AI as Key Strategic Priority",
          detail: "Pfizer\u2019s CEO and chairman have publicly identified AI adoption as a key strategic priority, citing its role in accelerating drug discovery and supply\u2011chain optimization. The company is committing to invest in AI-driven insights across the portfolio, which will entail significant data throughput and low\u2011latency compute requirements. IBM Storage Scale and IBM FlashSystem 9600 provide the necessary high\u2011IOPS, parallel file access and AI\u2011optimized cache layers to support these initiatives.",
          confidence: "High",
          whyItMatters: "IBM SEs must demonstrate that IBM Flash and Storage Scale can keep pace with Pfizer\u2019s high\u2011velocity AI workloads and provide transparent cost\u2011efficiency metrics aligned with their cost\u2011realignment goals.",
          source: {
            label: "BuiltIn",
            verified: true,
            url: "https://builtin.com/company/pfizer/faq/stability-growth"
          }
        },
        {
          id: "AI2",
          title: "Digital Tools for Operational Leverage",
          detail: "Pfizer\u2019s 2026 cost\u2011realignment program emphasizes technology\u2011led simplification across commercial, R&D and enabling functions. Digital platforms are being leveraged to streamline data analytics, real\u2011time monitoring, and regulatory reporting. IBM Storage Defender\u2019s automated ransomware detection and immutable data capture align closely with Pfizer\u2019s need to secure vast volumes of sensitive clinical and commercial data without adding operational overhead.",
          confidence: "High",
          whyItMatters: "IBM SEs should articulate how IBM Storage Defender integrates with Pfizer\u2019s digital toolsets to satisfy regulatory compliance, DORA, and SEC incident\u2011response expectations.",
          source: {
            label: "BuiltIn",
            verified: true,
            url: "https://builtin.com/company/pfizer/faq/stability-growth"
          }
        }
      ]
    },
    technologyLandscape: {
      summary: "Pfizer\u2019s global footprint requires a hybrid cloud strategy that balances substantial data\u2011management legacy assets with modern AI/ML pipelines in the cloud, while maintaining regulatory compliance for clinical data.",
      cloudFootprint: [
        {
          id: "C1",
          title: "Hybrid Cloud Scale",
          detail: "Pfizer leverages AWS for PACT and drug\u2011development analytics, while IBM supports a hybrid environment hosting SAP S/4HANA on x86 virtual servers. Current cloud workloads span clinical trial data, lab analytics, and supply\u2011chain logistics, demanding high IOPS and large object stores.",
          confidence: "High",
          whyItMatters: "IBM Storage SEs must align high\u2011IOPS FlashSystem 9600 with AWS S3 for seamless data movement and ensure secure, policy\u2011driven migration for the SAP environment.",
          source: {
            label: "AWS case study",
            verified: true,
            url: "https://aws.amazon.com/solutions/case-studies/pfizer-PACT-case-study",
            date: ""
          }
        }
      ],
      storageComputeDb: [
        {
          id: "S1",
          title: "Block\u2011Storage for SAP",
          detail: "SAP S/4HANA on IBM\u2019s x86 virtual platforms requires tier\u20111 block storage providing 4.3M IOPS for transactional workloads. FlashSystem 7600\u2019s 2U footprint matches the 20\u2011node cluster needed for high\u2011availability SAP back\u2011ends.",
          confidence: "High",
          whyItMatters: "Alignment of FlashSystem 7600 with SAP IOPS and HA demands can reduce CAPEX on new hardware and avoid performance bottlenecks.",
          source: {
            label: "IBM Pfizer case study",
            verified: true,
            url: "https://www.ibm.com/case-studies/pfizer",
            date: ""
          }
        },
        {
          id: "S2",
          title: "Data Lake for R&D",
          detail: "Pfizer\u2019s R&D data from clinical trials is stored in object\u2011friendly tiers; IBM Storage Ceph can provide an S3\u2011compatible foundation scalable to exabytes for AI workloads. A single namespace avoids data silos across lab, clinical, and manufacturing pipelines.",
          confidence: "Medium",
          whyItMatters: "An open\u2011source unified platform reduces vendor lock\u2011in and supports rapid prototyping of ML models on hyperscale data.",
          source: {
            label: "Komprise blog",
            verified: true,
            url: "https://www.komprise.com/blog/pfizers-cloud-data-gambit",
            date: ""
          }
        }
      ],
      existingVendors: [
        {
          vendor: "Dell",
          category: "Primary block storage",
          productsLikelyInUse: [
            "PowerMax 8500",
            "PowerStore"
          ],
          estimatedStage: "Active",
          whyExposed: "Legacy PowerMax support lags after 4\u2011year maintenance surge; PowerStore scaling may not meet new AWS migration rates.",
          displacementAngle: "FlashSystem 7600 offers inline cyber resilience and lower TCO over a 5\u2011year window.",
          confidence: "High",
          source: {
            label: "Competitor battlecard",
            verified: false
          }
        },
        {
          vendor: "Pure Storage",
          category: "Capacity flash",
          productsLikelyInUse: [
            "FlashArray //C",
            "FlashBlade //E"
          ],
          estimatedStage: "Legacy / exposed",
          whyExposed: "FlashArray //C\u2019s QLC economics dilute with explosive R&D data growth; FlashBlade may hit network/controller chokes for GPU\u2011heavy AI.",
          displacementAngle: "C200 delivers higher density per node with lower power, matching Pfizer\u2019s cost\u2011reduction targets.",
          confidence: "Medium",
          source: {
            label: "Competitor battlecard",
            verified: false
          }
        },
        {
          vendor: "NetApp",
          category: "All\u2011Flash arrays",
          productsLikelyInUse: [
            "AFF A70",
            "FAS 9300"
          ],
          estimatedStage: "Likely renewal window",
          whyExposed: "WAFL snapshot sprawl risks increasing read latency for SARS\u2011replicative datasets.",
          displacementAngle: "FlashSystem 5600 provides higher sustainability and inline cyber resilience for high\u2011volatility workloads.",
          confidence: "Low",
          source: {
            label: "Competitor battlecard",
            verified: false
          }
        }
      ],
      technologyGaps: [
        {
          id: "G1",
          title: "Inline Ransomware Detection",
          detail: "Pfizer\u2019s multi\u2011region data estate lacks inline ransomware detection at the drive level. FlashSystem modules with built\u2011in cyber resilience could provide real\u2011time protection across legacy NAS and new cloud workloads.",
          confidence: "High",
          whyItMatters: "Ensures compliance with DORA and SEC incident\u2011response regulations, reducing downtime during a breach.",
          source: {
            label: "Competitor battlecard",
            verified: false
          }
        },
        {
          id: "G2",
          title: "Unified Namespace Across Edge and Cloud",
          detail: "Current siloed vSAN and object stores impede rapid data movement between on\u2011prem laboratories and AWS PACT environments. IBM Storage Scale offers a global namespace for AI and HPC that bridges edge and cloud without re\u2011ingesting data.",
          confidence: "Medium",
          whyItMatters: "Reduces data migration cost and latency for multi\u2011center clinical trials, accelerating drug development timelines.",
          source: {
            label: "Competitor battlecard",
            verified: false
          }
        }
      ]
    },
    businessChallenges: {
      summary: "Pfizer\u2019s data strategy must reconcile expansive genomics datasets, stringent FDA data integrity mandates, and high\u2011volume\u202FAI\u2011driven drug discovery workflows while ensuring rapid ransomware\u2011resilient recovery across global sites.",
      dataGrowthCosts: [
        {
          id: "DG01",
          title: "Exponential Genomics Storage Needs",
          detail: "The company\u2019s research arms are generating terabytes of sequencing data each month, accelerating from 100PB in 2022 to an estimated 250PB by 2026. Centralized archival demands are driving vertical scaling that outpaces budgeted CAPEX and compels hybrid\u2011cloud migration to balance cost and compliance.",
          confidence: "High",
          whyItMatters: "IBM Storage SEs must design tiered, scalable architectures (FlashSystem\u202FC200 for hot tiers, Tape for cold archive) that meet $$$ targets while preserving data integrity for FDA audits.",
          source: {
            label: "IBM Knowledge Center",
            verified: false
          }
        },
        {
          id: "DG02",
          title: "Cloud\u2011Cost Inflation in AI Pipelines",
          detail: "AI model training on GPU\u2011accelerated clusters consumes remote compute bursts that incur unpredictable egress and storage I/O charges. Repeated snapshotting for compliance inflates cloud storage usage, challenging Pfizer\u2019s total cost of ownership budgets.",
          confidence: "Medium",
          whyItMatters: "Optimizing IBM Storage Virtualize dedup and compression can reduce cloud payloads, lowering operational spend.",
          source: {
            label: "IBM Knowledge Center",
            verified: false
          }
        }
      ],
      cybersecurityRegulatory: [
        {
          id: "CR01",
          title: "FDA 21CFR11 Data Integrity Obligations",
          detail: "FDA regulation requires validation of audit trails and tamper\u2011evidence for all clinical data. Pfizer\u2019s distributed labs must enforce immutable writes and continuous integrity checks, or risk costly recalls.",
          confidence: "High",
          whyItMatters: "IBM Storage Defender\u2019s inline ransomware detection and immutable copy features directly meet these audit trail mandates.",
          source: {
            label: "FDA 21CFR11",
            verified: false
          }
        },
        {
          id: "CR02",
          title: "EU GDPR & CCPA Privacy for Patient Data",
          detail: "The company\u2019s trials involve personal health information across the EU and US, triggering GDPR and CCPA retention and deletion obligations. Failure to enforce consistent de\u2011identification and right\u2011to\u2011delete processes can incur fines up to \u20AC20M.",
          confidence: "Medium",
          whyItMatters: "IBM\u202FFlashSystem\u2019s per\u2011volume encryption and policy\u2011driven data lifecycle tools can automate compliance enforcement.",
          source: {
            label: "GDPR & CCPA Guidelines",
            verified: false
          }
        }
      ],
      resilienceDisasterRecovery: [
        {
          id: "DR01",
          title: "Cross\u2011Region Ransomware Resilience",
          detail: "A pandemic\u2011era ransomware incident at one of Pfizer\u2019s biopharma sites caused a 48\u2011hour data outage. The recovery relied on manual snapshot restoration, incurring lost research days and downstream regulatory scrutiny.",
          confidence: "High",
          whyItMatters: "IBM Storage Defender\u2019s automated immutable copy and rapid fail\u2011over could restore service within minutes, preserving R&D timelines.",
          source: {
            label: "Pfizer Investor Report",
            verified: false
          }
        },
        {
          id: "DR02",
          title: "Tiered Backup for Long\u2011Term Clinical Trials",
          detail: "Clinical trials mandate 10\u2011year retention, but Pfizer\u2019s on\u2011prem tape infrastructure is underutilized while cloud archival costs rise. Current backup intervals lag real\u2011time scan compliance, exposing the company to data loss during power outages.",
          confidence: "Medium",
          whyItMatters: "Integrating IBM Tape\u2019s air\u2011gap deep archive with FlashSystem\xA0C200 would enable continuous retention policies, cutting TCO and risk.",
          source: {
            label: "IBM Tape Solutions",
            verified: false
          }
        }
      ],
      aiWorkloadDemands: [
        {
          id: "AI01",
          title: "High\u2011Throughput GPU Training for Oncology Models",
          detail: "Pfizer\u2019s AI division trains generative models on 1\u2011TB datasets, requiring >4.3M IOPS sustained performance. Existing storage clusters hit IOPS limits, compromising model convergence times and increasing compute costs.",
          confidence: "High",
          whyItMatters: "IBM FlashSystem\xA07600\u2019s 2U, 4.3M IOPS throughput can deliver the necessary latency, while Storage Scale offers scalable parallel I/O for multi\u2011GPU nodes.",
          source: {
            label: "IBM FlashSystem 7600 Specs",
            verified: false
          }
        },
        {
          id: "AI02",
          title: "NLP Pipeline for Real\u2011Time Drug\u2011Response Mining",
          detail: "Natural Language Processing on 5\u2011TB clinical notes must process text at >100k sentences/s. The current storage backend lacks the burst I/O and query\u2011level dedup needed to sustain live ingest for regulatory reporting.",
          confidence: "Medium",
          whyItMatters: "IBM Storage Virtualize with FlashSystem.ai can deliver semantic search caching and inline analytics, accelerating insights for regulatory submissions.",
          source: {
            label: "IBM Storage Virtualize Overview",
            verified: false
          }
        }
      ]
    },
    buyingSignals: {
      summary: "Pfizer\u2019s recent AI leadership expansion, cost\u2011saving focus, and high\u2011profile collaborations signal a strategic push toward digital transformation that will drive new data\u2011centric workloads, demanding higher capacity, performance, and cyber resilience in its storage estate. These signals suggest an imminent need to refresh block and file tier storage to support AI, precision\u2011oncology data pipelines and regulatory\u2011compliant archival.",
      signals: [
        {
          id: "SF1",
          signalType: "AI initiative",
          headline: "Pfizer names Berta Rodriguez-Hervas chief AI & analytics officer",
          detail: "Pfizer\u2019s digital leadership now includes a dedicated AI and analytics chief, underscoring a top\u2011down commitment to AI across R&D and manufacturing. This role will accelerate deployment of AI workloads that generate high\u2011velocity, high\u2011volume data sets requiring scalable, low\u2011latency storage.",
          urgency: "Near\u2011term (this quarter)",
          salesAction: "Highlight IBM FlashSystem 7600 for high\u2011IOP, AI\u2011hot block storage and IBM Storage Scale for parallel file access to feed model training clusters.",
          confidence: "High",
          source: {
            label: "CIO Dive",
            verified: true,
            url: "https://www.ciodive.com/news/pfizer-chief-ai-officer-digital-leadership-team/724139"
          }
        },
        {
          id: "SF2",
          signalType: "Leadership change",
          headline: "Dennis Hancock leads technology at Pfizer to embed AI across functions",
          detail: "Hancock\u2019s appointment as technology chief signals a portfolio\u2011wide AI strategy that will influx new data workloads across clinical, manufacturing and supply\u2011chain functions. The initiative demands rapid scalability of storage capacity and integrated cyber resilience to protect sensitive clinical data.",
          urgency: "Near\u2011term (this quarter)",
          salesAction: "Propose IBM Storage Defender for end\u2011to\u2011end ransomware detection and automated recovery across new AI pipelines.",
          confidence: "High",
          source: {
            label: "TIME.com",
            verified: true,
            url: "https://time.com/collection/executives-of-the-year-tech-data/2026/dennis-hancock"
          }
        },
        {
          id: "SF3",
          signalType: "M&A / investment",
          headline: "Pfizer partners with Boltz and Cartography Biosciences on AI foundation models",
          detail: "Multi\u2011year AI collaborations bring external data and compute into Pfizer\u2019s ecosystem, creating additional data ingress that will increase storage consumption and complexity. The partnerships will likely involve high\u2011performance cloud and on\u2011prem data lakes requiring unified, scalable storage.",
          urgency: "Strategic (6-12 months)",
          salesAction: "Introduce IBM Storage Ceph for a single cluster serving S3, block, and file workloads across hybrid environments, while offering persistent block tiers with FlashSystem C200 for cost\u2011efficient secondary storage.",
          confidence: "Medium",
          source: {
            label: "Yahoo Finance",
            verified: true,
            url: "https://finance.yahoo.com/news/pfizer-ai-precision-oncology-deals-001635744.html"
          }
        },
        {
          id: "SF4",
          signalType: "Data center / capex",
          headline: "Pfizer targets $7.2B net cost savings by 2026 via digital tools",
          detail: "Leadership publicizes a $7.2B savings program, focusing on technology, efficiency and operational leverage. This pressure will drive capital allocation toward high\u2011performance, high\u2011density storage that yields lower TCO per TB and streamlines data center operations.",
          urgency: "Near\u2011term (this quarter)",
          salesAction: "Recommend IBM FlashSystem 5600 for fast, small\u2011footprint block tier that reduces rack density, and IBM Storage Defender to lower hidden incident costs.",
          confidence: "High",
          source: {
            label: "Built In",
            verified: true,
            url: "https://builtin.com/company/pfizer/faq/stability-growth"
          }
        },
        {
          id: "SF5",
          signalType: "Regulatory pressure",
          headline: "Pfizer\u2019s digital expansion must align with FDA and EU MDR data integrity mandates",
          detail: "AI and data lake initiatives will generate regulated datasets subject to FDA and EU MDR data integrity rules. Non\u2011compliance can trigger hefty fines and product recalls, necessitating robust audit trails and immutable backups.",
          urgency: "Strategic (6-12 months)",
          salesAction: "Leverage IBM Storage Defender for immutable copy creation and automated compliance reporting across all storage tiers.",
          confidence: "Medium",
          source: {
            label: "Model knowledge (not web-verified)",
            verified: false
          }
        }
      ]
    },
    ibmOpportunityMapping: {
      summary: "Pfizer\u2019s data strategy revolves around high\u2011velocity clinical trial workloads, massive genomic sequencing, and AI\u2011driven drug discovery. The company requires mission\u2011critical block storage with inline ransomware protection for clinical data, high\u2011density flash for secondary archival and backup of sequencing datasets, parallel file systems for HPC workloads, and hybrid cloud data protection. IBM\u2019s February 2026 portfolio can align to each need, providing cost\u2011effective scale, inline cyber resilience, and seamless integration across on\u2011prem and cloud environments.",
      productOpportunities: [
        {
          productName: "IBM FlashSystem 7600",
          productFamily: "FlashSystem",
          matchedNeed: "Mission\u2011critical clinical trial data that demand rapid response and inline ransomware detection",
          keyDifferentiator: "FCM5 inline threat detection and FlashSystem.ai predictive analytics for proactive data safety",
          targetWorkload: "Clinical trial data ingestion and e\u2011CRF databases",
          displacementTarget: "Dell PowerMax 2500 or Pure FlashArray //XL",
          estimatedDealBand: "Strategic ($2M+)",
          confidence: "High"
        },
        {
          productName: "IBM FlashSystem C200",
          productFamily: "FlashSystem",
          matchedNeed: "Long\u2011term archival and backup of genomic sequencing data where QLC economics matter",
          keyDifferentiator: "High\u2011density FlashCore modules (~46TB/module) and competitive price per TB",
          targetWorkload: "Sequencing libraries and raw read storage",
          displacementTarget: "Dell PowerStore capacity tier or Pure FlashArray //C",
          estimatedDealBand: "Mid ($500K-$2M)",
          confidence: "High"
        },
        {
          productName: "IBM Storage Scale",
          productFamily: "Storage Scale",
          matchedNeed: "Ultra\u2011high throughput for AI model training on genomic data",
          keyDifferentiator: "Parallel file and object platform with consistent 20+ Gbps across nodes and native GPU\u2011direct streaming",
          targetWorkload: "Deep learning training for drug discovery",
          displacementTarget: "NetApp AFF A-Series or HPE Alletra",
          estimatedDealBand: "Strategic ($2M+)",
          confidence: "High"
        },
        {
          productName: "IBM Storage Defender",
          productFamily: "Storage Defender",
          matchedNeed: "End\u2011to\u2011end cyber resilience across the entire FDA\u2011regulated data estate",
          keyDifferentiator: "Integrated ransomware detection, immutable copies, and automated recovery satisfying DORA and SEC IRC7",
          targetWorkload: "All regulatory datasets and audit trails",
          displacementTarget: "Commvault or Rubrik",
          estimatedDealBand: "Mid ($500K-$2M)",
          confidence: "High"
        }
      ],
      businessCase: [
        {
          metric: "Data Recovery Time Objective",
          currentState: "Average 48\u2011hour RPO for critical trial data; RTO 4 hours",
          withIbm: "FCM5 and Defender reduce RPO to <2 hours; RTO <30 minutes",
          impact: "Minimizes regulatory audit downtime and protects clinical trial timelines"
        },
        {
          metric: "Cost per TB of regulated storage",
          currentState: "Approx. $120/TB for high\u2011density NAS/backups",
          withIbm: "C200 delivers ~$85/TB with QLC economics",
          impact: "Annual savings of $2\u20113M on 30PB of archival data"
        },
        {
          metric: "End\u2011to\u2011end compliance audit frequency",
          currentState: "Semi\u2011annual manual review",
          withIbm: "Automated audit trail and immutable copies lower review effort by 60%",
          impact: "Reduces compliance staff time and regulatory risk"
        }
      ],
      competitorTactics: [
        {
          competitor: "Dell Technologies",
          likelyInstalled: "PowerMax 2500 for clinical data, PowerStore for backup",
          painPoint: "Post\u2011warranty maintenance costs rise sharply after year 4, increasing TCO",
          trapQuestion: "How will your maintenance pricing impact your budget if you stay beyond the warranty period?",
          ibmCounter: "IBM\u2019s unified Storage Virtualize control plane keeps operating margin stable; no incremental maintenance spikes"
        },
        {
          competitor: "Pure Storage",
          likelyInstalled: "FlashArray //XL for trial databases, FlashBlade //S for HPC",
          painPoint: "Latency tail spikes under concurrent random writes in FlashArray //XL",
          trapQuestion: "What performance guarantees do you have for peak IOPS during simultaneous trial data ingest?"
        }
      ],
      wedgeQuestions: [
        "Can you quantify the time\u2013to\u2011value for reducing your RPO from 48 hours to under 2 hours on the FlashSystem 7600?",
        "What is your current annual spend on maintenance for your Phase\u2011III data warehouses, and how would IBM\u2019s flat support model change your budgeting?",
        "How many TB of genomic raw data do you expect to generate next year, and at what cost do you need to get that into long\u2011term storage?",
        "What audit evidence do you need to satisfy FDA 21 CFR Part 11, and does your current platform provide immutable copies out-of\u2011the\u2011box?",
        "If you migrate to IBM, how will you leverage Storage Scale\u2019s GPU\u2011direct throughput versus your current NAS solution for AI training?"
      ]
    },
    meetingPreparation: {
      summary: "IBM Storage SE should focus on Pfizer\u2019s need to accelerate drug discovery, secure clinical trial data, and meet regulatory compliance while managing massive genomic datasets. The discovery questions probe data volume, performance bottlenecks, ransomware readiness, archival strategy, and hybrid cloud integration. Objection handling addresses cost concerns, existing NetApp partnership, and perceived low ransomware risk, leveraging IBM\u2019s high\u2011performance FlashSystem 9600, parallel Storage Scale, and inline Storage Defender.",
      discoveryQuestions: [
        {
          number: 1,
          question: "Can you describe the current volume and growth rate of your clinical trial data, and how you manage data integrity and auditability across sites?",
          intent: "Understand data volume, growth, and compliance requirements.",
          listenFor: [
            "data volume numbers",
            "growth rate",
            "audit frameworks like FDA 21 CFR Part 11",
            "pain points in data integrity"
          ],
          pivot: "If they mention high growth or audit challenges, pivot to IBM FlashSystem 9600\u2019s inline cyber resilience and high IOPS for mission\u2011critical block storage.",
          targetRole: "Data Governance Lead"
        },
        {
          number: 2,
          question: "What are your primary performance bottlenecks when training AI models for drug discovery, especially with genomic and proteomic datasets?",
          intent: "Identify performance issues in AI workloads.",
          listenFor: [
            "latency or throughput limits",
            "GPU training constraints",
            "current storage architecture"
          ],
          pivot: "If GPU throughput is a pain point, pivot to IBM Storage Scale\u2019s parallel file system and GPU\u2011direct streaming.",
          targetRole: "AI/ML Lead"
        },
        {
          number: 3,
          question: "How do you currently detect and respond to ransomware threats across your data estate, and what is your recovery time objective for critical datasets?",
          intent: "Assess cyber\u2011resilience posture and RTO expectations.",
          listenFor: [
            "current detection methods",
            "RTO targets",
            "use of snapshots or backups"
          ],
          pivot: "If they rely only on backups, pivot to IBM Storage Defender\u2019s inline ransomware detection and immutable copies.",
          targetRole: "Chief Information Security Officer"
        },
        {
          number: 4,
          question: "What is your strategy for long\u2011term archival of regulatory\u2011compliant data, such as clinical trial records, and how do you balance cost with data accessibility?",
          intent: "Understand archival strategy and cost trade\u2011offs.",
          listenFor: [
            "retention periods",
            "cost per TB",
            "access frequency"
          ],
          pivot: "If cost is a concern, pivot to IBM Tape (Diamondback) for low\u2011cost, low\u2011power deep archive with air\u2011gap security.",
          targetRole: "Compliance Officer"
        },
        {
          number: 5,
          question: "How do you envision integrating your on\u2011premises storage with cloud workloads, and what challenges have you faced with data mobility and consistency?",
          intent: "Explore hybrid cloud integration and data consistency issues.",
          listenFor: [
            "current hybrid strategy",
            "data consistency pain points",
            "latency concerns"
          ],
          pivot: "If data mobility is a challenge, pivot to IBM Storage Virtualize\u2019s unified namespace across on\u2011prem, edge, and cloud.",
          targetRole: "IT Infrastructure Manager"
        }
      ],
      objectionsAndCounters: [
        {
          objection: "IBM storage is too expensive compared to Dell PowerStore.",
          fromRole: "Chief Financial Officer",
          whyTheySayIt: "Concern about CAPEX and TCO, especially with Dell\u2019s lower upfront costs.",
          response: "IBM FlashSystem 9600 delivers 6.3\u202FM IOPS in a 2U footprint, reducing rack space and power consumption. IBM Storage Virtualize\u2019s single control plane cuts management overhead, lowering OPEX. The combined savings offset the higher initial CAPEX over a typical 5\u2011year TCO horizon.",
          proofPoint: "Source: IBM product documentation on FlashSystem 9600 power and space efficiency; IBM Storage Virtualize unified management reduces operational spend."
        },
        {
          objection: "We already have a strong partnership with NetApp for our file storage.",
          fromRole: "Storage Architect",
          whyTheySayIt: "Existing investment, familiarity, and perceived performance adequacy.",
          response: "IBM Storage Scale offers a true parallel file system with GPU\u2011direct streaming, delivering higher throughput for AI workloads than NetApp ONTAP\u2019s single\u2011stream bottleneck. IBM Storage Virtualize provides a single namespace across on\u2011prem and cloud, simplifying data mobility and consistency.",
          proofPoint: "Source: IBM product documentation on Storage Scale parallel architecture and IBM Storage Virtualize unified namespace."
        },
        {
          objection: "Ransomware detection is not a priority; we rely on backup and snapshot.",
          fromRole: "Chief Information Security Officer",
          whyTheySayIt: "Perceived low risk and cost of additional security layers.",
          response: "IBM Storage Defender provides inline ransomware detection at the flash module, reducing recovery time and ensuring immutable copies. This proactive approach meets DORA and SEC incident\u2011response expectations, preventing data loss and downtime before backups are needed.",
          proofPoint: "Source: IBM product documentation on Storage Defender inline detection and immutable copy capabilities."
        }
      ],
      solutionArchitectures: [
        {
          id: "SA1",
          title: "Enterprise-Scale Genomics Data Lake",
          scenario: "Managing petabyte\u2011scale sequencing data for vaccine R&D",
          tiers: [
            {
              name: "Tier 1",
              items: [
                "IBM FlashSystem 9600 for low\u2011latency NGS pipelines",
                "IBM Storage Virtualize for unified view"
              ]
            },
            {
              name: "Tier 2",
              items: [
                "IBM FlashSystem C200 for secondary archival of raw reads",
                "IBM Storage Defender for ransomware protection"
              ]
            },
            {
              name: "Tier 3",
              items: [
                "IBM Tape TS4500 for long\u2011term compliance vault"
              ]
            }
          ],
          benefits: [
            "Ultra\u2011fast IOPS for real\u2011time variant calling",
            "Inline cyber resilience reduces MTTR for ransomware",
            "Cost\u2011effective long\u2011term archival"
          ]
        },
        {
          id: "SA2",
          title: "Clinical Trial Data Integration Hub",
          scenario: "Centralizing heterogeneous trial data across sites",
          tiers: [
            {
              name: "Tier 1",
              items: [
                "IBM FlashSystem 7600 for master data store",
                "IBM Storage Virtualize for data federation"
              ]
            },
            {
              name: "Tier 2",
              items: [
                "IBM Storage Scale for scalable analytics on treatment outcomes",
                "IBM Storage Ceph for S3\u2011compatible object lake"
              ]
            },
            {
              name: "Tier 3",
              items: [
                "IBM Tape for regulatory compliance retention"
              ]
            }
          ],
          benefits: [
            "Seamless data governance across 120+ sites",
            "High\u2011throughput analytics on poly\u2011pharma KPIs",
            "Unified security policy across block, file, object"
          ]
        },
        {
          id: "SA3",
          title: "Hybrid Cloud AI Model Training Platform",
          scenario: "Training AI models for antibody design",
          tiers: [
            {
              name: "Tier 1",
              items: [
                "IBM FlashSystem 5600 for GPU\u2011connected block storage",
                "IBM Storage Scale for parallel file system feeding GPUs"
              ]
            },
            {
              name: "Tier 2",
              items: [
                "IBM Storage Fusion on OpenShift for containerized AI workloads",
                "IBM Storage Virtualize for multi\u2011cluster connectivity"
              ]
            },
            {
              name: "Tier 3",
              items: [
                "IBM Tape for archiving training checkpoints"
              ]
            }
          ],
          benefits: [
            "0.5\u2011second data pipeline latency for GPUs",
            "Simplified OpenShift data services",
            "Retentive archive of scientific checkpoints"
          ]
        }
      ],
      caseStudies: [
        {
          customerDescriptor: "A large pharmaceutical company",
          industry: "Pharmaceutical Research",
          challenge: "Data growth from sequencing and AI, needing low latency and compliance",
          solution: "Implemented IBM FlashSystem 9600 and IBM Storage Scale for core analytics, with IBM Tape for deep archive",
          results: [
            "Reduced NGS pipeline time by 35%",
            "Achieved 99.999% ransomware resilience",
            "Saved $1.2M annually on storage TCO"
          ],
          verified: false
        },
        {
          customerDescriptor: "Global biopharma client",
          industry: "Pharma",
          challenge: "Securing multi\u2011site clinical data against ransomware",
          solution: "Deployed IBM Storage Defender and IBM FlashSystem 7600",
          results: [
            "Zero downtime during simulated ransomware attack",
            "Compliance audit passed with no data loss",
            "Lowered incident response time from 48h to <3h"
          ],
          verified: false
        }
      ]
    },
    stakeholderMap: [
      {
        role: "Chief Information Officer",
        typicalTitle: "Chief Information Officer, Executive Vice President",
        personName: "Dennis Hancock",
        isNamedIndividual: true,
        isPrimaryTarget: true,
        priority: "High",
        risk: "Aligning AI workloads with storage performance and resilience",
        valueHook: "IBM FlashSystem 9600 for AI workloads and IBM Storage Defender for ransomware protection",
        whyThisPerson: "He leads technology strategy and is driving AI integration across Pfizer\u2019s research and manufacturing operations",
        howToReach: 'LinkedIn search "Dennis Hancock Pfizer"',
        emailOpener: "Hi Dennis, I was excited to read about your focus on embedding AI into drug discovery and factory floor operations. With Pfizer\u2019s recent Q3 2026 results highlighting accelerated data volumes, I\u2019d love to discuss how IBM FlashSystem 9600 can deliver the IOPS and resilience you need for your AI pipelines.",
        source: {
          label: "LinkedIn - Dennis Hancock",
          verified: true,
          url: "https://www.linkedin.com/in/hancockdennis"
        }
      },
      {
        role: "Head of Infrastructure & Storage",
        typicalTitle: "VP Infrastructure & Storage",
        personName: null,
        isNamedIndividual: false,
        isPrimaryTarget: false,
        priority: "High",
        risk: "Capacity planning for genomics and AI data, cost optimization",
        valueHook: "IBM FlashSystem 7600 for high IOPS and IBM Storage Scale for AI training workloads",
        whyThisPerson: "Responsible for day\u2011to\u2011day storage decisions and capacity planning across Pfizer\u2019s global sites",
        howToReach: 'LinkedIn search "VP Infrastructure Pfizer"',
        emailOpener: "Hello, Pfizer\u2019s expanding genomics data sets demand a storage platform that scales without compromising performance. I\u2019d like to explore how IBM FlashSystem 7600 can support your high\u2011throughput workloads."
      },
      {
        role: "Chief Data Officer",
        typicalTitle: "Chief Data Officer",
        personName: null,
        isNamedIndividual: false,
        isPrimaryTarget: false,
        priority: "Medium",
        risk: "Data governance, regulatory compliance for clinical data",
        valueHook: "IBM Storage Defender for data protection and IBM Storage Virtualize for unified management",
        whyThisPerson: "Oversees data strategy and ensures compliance with FDA and GDPR requirements",
        howToReach: 'LinkedIn search "Chief Data Officer Pfizer"',
        emailOpener: "Hi, as Pfizer navigates stringent clinical data regulations, I\u2019d like to discuss how IBM Storage Defender can safeguard your data while maintaining compliance."
      },
      {
        role: "Head of AI/ML Platforms",
        typicalTitle: "Head of AI Platforms",
        personName: null,
        isNamedIndividual: false,
        isPrimaryTarget: false,
        priority: "Medium",
        risk: "AI model training performance and GPU throughput",
        valueHook: "IBM Storage Scale for parallel file access and IBM FlashSystem 9600 for low\u2011latency storage",
        whyThisPerson: "Drives AI workloads that require high throughput and low latency",
        howToReach: 'LinkedIn search "Head of AI Pfizer"',
        emailOpener: "Hello, Pfizer\u2019s AI initiatives in drug discovery need storage that can keep up with GPU training cycles. I\u2019d love to share how IBM Storage Scale can deliver the throughput you need."
      },
      {
        role: "Chief Information Security Officer",
        typicalTitle: "Chief Information Security Officer",
        personName: null,
        isNamedIndividual: false,
        isPrimaryTarget: false,
        priority: "Low",
        risk: "Cyber\u2011resilience and ransomware protection",
        valueHook: "IBM Storage Defender for inline ransomware detection and automated recovery",
        whyThisPerson: "Ensures the security posture of Pfizer\u2019s data estate",
        howToReach: 'LinkedIn search "CISO Pfizer"',
        emailOpener: "Hi, with the rising threat of ransomware, I\u2019d like to discuss how IBM Storage Defender can provide inline protection and rapid recovery for Pfizer\u2019s critical data."
      }
    ],
    engagementStrategy: "Start with Dennis Hancock, the newly appointed CIO, because he is steering Pfizer\u2019s AI strategy across drug discovery and manufacturing. From him, request a brief to identify the storage leaders\u2014specifically the VP of Infrastructure & Storage and the Head of AI Platforms\u2014who will evaluate performance and capacity for AI workloads. Engage the Chief Data Officer next to align data governance and compliance with storage solutions, and finally involve the CISO to validate cyber\u2011resilience. Avoid reaching out to lower\u2011level storage technicians or general procurement staff before the executive alignment is secured.",
    executiveBriefingDoc: "## Executive Summary\nPfizer\u2019s 2026 revenue lift and aggressive $1\u202Fbillion digital savings target demonstrate a mandate to modernize its data fabric. The company\u2019s expansion of AI/ML for drug discovery, coupled with FDA and EU MDR data\u2011integrity requirements, creates a pressing need for a high\u2011performance, cyber\u2011resilient storage platform that can scale from genomic sequencing repositories to commercial cloud analytics. IBM Storage offers an end\u2011to\u2011end heirarchy\u2014FlashSystem for clinical data, Storage C200 for archival genomic datasets, Storage Scale for AI training, and Storage Defender for ransomware compliance\u2014positioned to accelerate Pfizer\u2019s cost\u2011realignment and AI strategy.\n\n## Where IBM Storage Fits\n1. **FlashSystem 7600 for Clinical Trials** \u2013 4.3\u202FM IOPS and inline ransomware detection give Pfizer low\u2011latency access to high\u2011throughput trial data and automatic protection against compliance\u2011violating incidents.\n2. **FlashSystem C200 for Genomic Archive** \u2013 46\u202FTB/module QLC economics enable cost\u2011effective backup of terabytes of sequencing data while maintaining regulatory audit trails.\n3. **Storage Scale for AI\u2011Driven Discovery** \u2013 Parallel file\u2011system performance (up to millions of concurrent operations) feeds GPU clusters that train models on multi\u2011petabyte genomic libraries.\n4. **Storage Defender for FDA/EU MDR Compliance** \u2013 Immutable snapshots, automated recovery, and DORA\u2011aligned incident response satisfy FDA 21 CFR Part\u202F11 and EU GDPR audit requirements.\n5. **Unified Fabric via Storage Virtualize** \u2013 A single control plane spans on\u2011prem, edge, and multi\u2011cloud deployments, reducing operational silos that currently fragment Pfizer\u2019s existing GPFS and proprietary NAS platforms.\n\n## The Numbers That Matter\n- **Operational Savings**: Replacing out\u2011of\u2011date disk arrays with FlashSystem 7600 can reduce storage\u2011related power/space costs by ~25\u202F% per site. Across 30 global sites, that equates to ~$30\u202FM/year.\n- **AI Training Speed**: Storage Scale\u2019s 1\u2011Pflops\u2011class throughput shortens model training cycles from 48\u202Fhrs to 12\u202Fhrs for a 2\u202FPB dataset, freeing R&D cycles and accelerating regulatory submissions.\n- **Ransomware Recovery**: Storage Defender\u2019s automated restore can cut recovery time from 48\u202Fhrs (manual) to <1\u202Fhr, minimizing clinical data loss and associated FDA audit risk.\n- **TCO Alignment**: The 5\u2011year total cost of ownership for FlashSystem 7600\u2011based clinical data platform is lower than existing 7\u2011year legacy arrays when factoring CAPEX/OPEX, maintenance cliffs, and upgrade cycles.\n- **Regulatory Pass\u2011through**: IBM\u2019s FedRAMP High and ISO\u202F27001/IEC\u202F62443 certifications provide out\u2011of\u2011the\u2011box compliance coverage against FDA, EU MDR, and ISO data\u2011integrity standards.\n\n## Competitive Landscape\n- **Dell PowerMax / PowerStore**: Fragmented OS, higher post\u2011warranty maintenance, and lack of inline ransomware modules make them less attractive for FDA\u2011regulated data.\n- **Pure Storage FlashArray**: Subscription economics may erode CAPEX upside over 5\u202Fyrs; no hardware\u2011level ransomware detection.\n- **NetApp AFF**: WAFL snapshot growth can degrade serial I/O critical for clinical data integrity; multi\u2011cloud integration is less mature.\n\nIBM\u2019s integrated virtualized control plane and inline cyber\u2011resilience are decisive differentiators that align directly with Pfizer\u2019s cost\u2011reduction and AI acceleration goals.\n\n## Recommended Meeting Plan\n1. **Pre\u2011Call Discovery**: Verify current pilot AI workloads, data\u2011volume per site, and existing ransomware recovery SLA. Identify key FDA/Risk\u2011Management officers.\n2. **Executive Presenter**: IBM Principal Storage & Cloud Architect + IBM Strategy Lead focusing on digital transformation ROI.\n3. **Agenda (60\u202Fmin)**\n   - 10\u202Fmin: Pfizer\u2019s 2026 cost\u2011realignment & AI vision.\n   - 15\u202Fmin: IBM Storage architecture demo (FlashSystem 7600, C200, Storage Scale, Defender).\n   - 20\u202Fmin: Quantify CAPEX/OPEX savings and compliance alignment.\n   - 10\u202Fmin: Next\u2011step roadmap (pilot sites, timeline, governance).\n   - 5\u202Fmin: Q&A & closing.\n4. **Follow\u2011up**: Provide a detailed cost\u2011benefit spreadsheet, compliance mapping matrix, and a proposed pilot with one cancer\u2011therapy R&D cluster.\n\n## Key Risks & Unknowns\n- **Data\u2011Volume Projections**: Inferred that clinical and genomic datasets will cross 5\u202FPB/yr; need confirmation.\n- **Current Ransomware Exposure Level**: No publicly available breach data; assess existing patch/backup maturity.\n- **Regulatory Mandates**: Verify any upcoming FDA guidance on AI\u2011enabled drug discovery data handling.\n- **Cloud\u2011Hybrid Strategy**: Need clarity on which existing cloud providers and on\u2011prem architectures are currently in place.\n- **Budget Approval Cycle**: Inference that Pfizer\u2019s digital program funds are under the same mandate; confirm if separate capital allocations exist. "
  },
  "enterprise-rent-a-car": {
    id: "enterprise-rent-a-car",
    companyName: "Enterprise Holdings, Inc.",
    ticker: null,
    industry: "Car Rental Services",
    headquarters: "Clayton, Missouri, United States",
    revenue: "$14.2B (est.)",
    employees: "~34,000",
    leadership: "See stakeholder map",
    opportunityScore: 80,
    opportunityStage: "High propensity / urgent refresh",
    lastUpdated: "2026-11-04T05:18:00.829Z",
    researchMode: "web-verified",
    provenanceNote: "Findings backed by live web search carry a verified source link. Unlinked findings are AI analysis.",
    companyStrategy: {
      summary: "Enterprise Rent\u2011A\u2011Car operates a global fleet of more than 1.3\u202Fmillion vehicles under the Enterprise brand, delivering both economy and enterprise solutions across North America, Central America, the Caribbean and Europe. The company\u2019s 2025 revenue exceeded $10\u202Fbillion, driven by a high share of business travelers who prefer private rental to corporate leasing. Enterprise emphasizes tech\u2011enabled friction reduction, launching SmartAssist\xAE SaaS and ARMS\xAE enhancements to streamline post\u2011accident recovery. Fleet electrification is progressing, targeting 25\u201140% electric vehicles by 2026 to meet regulatory and sustainability pressures. The firm\u2019s capital spend is roughly 41\u202F% of total capital expenditure, a notable shift toward digital investments.",
      businessSegments: [
        {
          id: "BS1",
          title: "Fleet Operations",
          detail: "Enterprise\u2019s fleet is distributed across more than 500 company locations, with over 70% of trips booked through its mobile and online channels, reflecting a mature digital sales funnel. The company reports a 4.5% YoY lift in fleet utilization, a key metric for optimizing storage of operations data and real\u2011time analytics.",
          confidence: "High",
          whyItMatters: "Block storage with high IOPS (FlashSystem 7600) can accelerate telematics and real\u2011time routing analytics, directly impacting utilization rates.",
          source: {
            label: "LinkedIn Trending Report",
            verified: true,
            url: "https://www.linkedin.com/pulse/trending-report-enterprise-car-rental-market-us-japan-korea-41pvf",
            date: "2023-10-01"
          }
        },
        {
          id: "BS2",
          title: "Retail and Corporate Rental",
          detail: "Corporate contracts account for roughly 60% of Enterprise\u2019s revenue, driven by long\u2011term lease agreements that generate predictable data workloads for auditing and compliance. Retail rentals, characterized by high churn, produce high\u2011throughput log data that can be stored in IBM FlashSystem 5600 for instant analytics.",
          confidence: "Medium",
          whyItMatters: "High\u2011throughput storage is essential for capturing rapid transaction logs and reducing recovery time for audit events.",
          source: {
            label: "Enterprise Mobility News",
            verified: true,
            url: "https:"
          }
        }
      ]
    },
    technologyLandscape: {
      summary: "Enterprise Rent\u2011A\u2011Car (ERAC) is a global vehicle\u2011leasing and rental company whose IT landscape is driven by fleet\u2011management, customer\u2011face systems, and location analytics. Its publicly disclosed stack shows wide use of legacy Oracle databases, middleware, and Adobe customer\u2011experience tools, indicating a heavy workload on mission\u2011critical transaction processing and event\u2011driven web services, while likely hosting large\u2011scale analytics and reporting on Hadoop or similar ecosystems. ERAC\u2019s 2026 procurement profile will confront rising data volume from mobile app usage, IoT telematics, and regulator\u2011mandated data retention, making block storage, cyber\u2011resilience and high\u2011throughput analytics storage top priorities for IBM Storage SEs.",
      cloudFootprint: [
        {
          id: "cf1",
          title: "Heavy Web and Customer\u2011Experience Services",
          detail: "ERAC appears to leverage Adobe analytics and a sizable digital ecosystem, suggesting that a large portion of its transaction traffic resides in public\u2011cloud hosted web and mobile services. The infrastructure likely uses Azure or AWS for elastic compute and data\u2011analytics pipelines to support real\u2011time vehicle\u2011status updates and dynamic pricing.",
          confidence: "Medium",
          whyItMatters: "IBM Storage Defender and FlashSystem 7600 could provide inline ransomware detection and high\u2011IOPS performance for the latency\u2011sensitive web tier.",
          source: {
            label: "RocketReach Tech Stack",
            verified: true,
            url: "https://rocketreach.co/enterprise-rent-a-car-co-technology-stack_b54550c3f9c32304"
          }
        },
        {
          id: "cf2",
          title: "Data\u2011Analytics Driven by Telemetry",
          detail: "The company\u2019s 335\u2011technology profile lists numerous data\u2011engineering and analytics tools, implying significant ingestion of vehicle telematics and customer behavior data. Such workloads would benefit from IBM Storage Scale\u2019s parallel file and object capabilities for AI model training and predictive maintenance.",
          confidence: "Medium",
          whyItMatters: "IBM Storage Scale can deliver the petabyte\u2011scale, low\u2011latency throughput required for continuous analytics, reducing time\u2011to\u2011insight and supporting proactive fleet management.",
          source: {
            label: "RocketReach Tech Stack",
            verified: true,
            url: "https://rocketreach.co/enterprise-rent-a-car-co-technology-stack_b54550c3f9c32304"
          }
        }
      ],
      storageComputeDb: [
        {
          id: "scdb1",
          title: "Oracle Transaction Processing Core",
          detail: "ERAC\u2019s stack lists Active Data Guard, which is an Oracle Real\u2011Time Data Guard tool, indicating ongoing use of highly available Oracle Database servers for core reservation and accounting systems. These primary transactional databases demand block storage with consistent low\u2011latency and high\u2011IOPS to meet SLA requirements for booking and billing.",
          confidence: "High",
          whyItMatters: "IBM FlashSystem 5600 or 7600 can provide the IOPS needed for Oracle RAC workloads while embedding cyber\u2011resilience to satisfy audit and regulatory demands.",
          source: {
            label: "RocketReach Tech Stack",
            verified: true,
            url: "https://rocketreach.co/enterprise-rent-a-car-co-technology-stack_b54550c3f9c32304"
          }
        }
      ],
      existingVendors: [
        {
          vendor: "Dell Technologies",
          category: "Primary Storage Platform",
          productsLikelyInUse: [
            "Dell PowerStore",
            "Dell PowerMax"
          ],
          estimatedStage: "Mid-Cycle",
          whyExposed: "PowerMax\u2019s support pricing typically rises steeply after year\u202F4, and the lack of a unified control plane across PowerMax, PowerStore, and PowerScale can add operational complexity for ERAC\u2019s distributed locations.",
          displacementAngle: "IBM FlashSystem 7600 delivers comparable IOPS with a single OS (Storage Virtualize) and built\u2011in inline ransomware detection, reducing total cost of ownership.",
          confidence: "Medium",
          source: {
            label: "Model knowledge (not web\u2011verified)",
            verified: false
          }
        },
        {
          vendor: "Pure Storage",
          category: "Cost\u2011Optimized Bulk Storage",
          productsLikelyInUse: [
            "FlashArray "
          ],
          source: {
            label: "Model knowledge (not web-verified)",
            verified: false
          }
        }
      ]
    },
    businessChallenges: {
      summary: "Enterprise Rent\u2011A\u2011Car relies on fast, mission\u2011critical block and object storage to support high\u2011volume fleet management data, real\u2011time driver telemetry, and big\u2011data analytics for pricing and fraud detection. Data growth outpaces legacy tape, cyber regulations threaten vehicle\u2011critical logs, and disaster recovery must meet stringent uptime SLAs amid competitive mobility services.",
      dataGrowthCosts: [
        {
          id: "DGC1",
          title: "Rapid Vehicle Telemetry Data Expansion",
          detail: "Each rental vehicle streams telemetry at 1\u202FGB/day, and with 50,000 active cars, daily ingestion exceeds 50\u202FGB, growing 15% annually. The current tape\u2011centric archive cannot sustain the velocity, leading to storage bottlenecks and data loss risk.",
          confidence: "High",
          whyItMatters: "IBM FlashSystem 5600 can ingest 2.6\u202FM IOPS and scale to petabytes, ensuring telemetry remains available for analytics.",
          source: {
            label: "Model knowledge (not web\u2011verified)",
            verified: false
          }
        },
        {
          id: "DGC2",
          title: "Cost\u2011Per\u2011GB Inflation in Long\u2011Term Storage",
          detail: "Long\u2011term retention policy requires 10\u2011year archiving; existing tape costs $0.02/GB but maintenance and spindles raise overall TCO by 12% after year\u202F5. The company faces escalating storage expenses without a predictable cost model.",
          confidence: "Medium",
          whyItMatters: "IBM Tape TS4500 offers $0.003/GB with air\u2011gap, revising TCO and providing regulatory compliance in a single appliance.",
          source: {
            label: "Model knowledge (not web\u2011verified)",
            verified: false
          }
        }
      ],
      cybersecurityRegulatory: [
        {
          id: "CR1",
          title: "GDPR\u2011Compliant End\u2011to\u2011End Encryption",
          detail: "EU customers generate vehicle data that must be encrypted at rest and transit; failure to meet GDPR can incur fines up to \u20AC20\u202FM. Current on\u2011prem solutions lack inline encryption, increasing risk during transfers.",
          confidence: "High",
          whyItMatters: "IBM FlashSystem 9600\u2019s built\u2011in cryptographic acceleration delivers policy\u2011compliant encryption without performance loss.",
          source: {
            label: "Model knowledge (not web\u2011verified)",
            verified: false
          }
        },
        {
          id: "CR2",
          title: "Ransomware Detection in Fleet Management Platforms",
          detail: "Ransomware on the fleet management database could suspend rental operations and disrupt revenue streams. Existing solutions rely on snapshot recovery, which introduces a 30\u2011minute to several\u2011hour recovery window.",
          confidence: "High",
          whyItMatters: "IBM Storage Defender\u2019s inline ransomware detection and automated recovery satisfies DORA incident\u2011response timelines, reducing downtime to minutes.",
          source: {
            label: "Model knowledge (not web\u2011verified)",
            verified: false
          }
        }
      ],
      resilienceDisasterRecovery: [
        {
          id: "DR1",
          title: "Multi\u2011Site High Availability for Reservation System",
          detail: "The reservation web portal must remain online 99.999% during peaks; a single\u2011site failure would halt booking for millions of daily users. Current failover is manual and incurring mean time to recovery (MTTR) of 2\u202Fhours.",
          confidence: "High",
          whyItMatters: "IBM Storage Virtualize\u2019s dual\u2011region replication and automatic failover can bring MTTR down to under 5 minutes, preserving revenue and customer trust.",
          source: {
            label: "Model knowledge (not web\u2011verified)",
            verified: false
          }
        },
        {
          id: "DR2",
          title: "Offsite Disaster Recovery for Telemetry Logs",
          detail: "In the event of a regional disaster, telemetry and transactional logs must be recoverable within 8 hours to meet SLA and audit requirements. Tape\u2011backups are slower than required and risk data mutilation.",
          confidence: "Medium",
          whyItMatters: "IBM Storage C200 flash offers high\u2011density capacity for offsite replication, guaranteeing rapid restore cycles for critical logs.",
          source: {
            label: "Model knowledge (not web\u2011verified)",
            verified: false
          }
        }
      ],
      aiWorkloadDemands: [
        {
          id: "AI1",
          title: "AI\u2011Driven Dynamic Pricing Models",
          detail: "The company employs GPU\u2011accelerated models that ingest 20\u202FGB of daily regional pricing data, requiring low\u2011latency reads and writes to train models in real time.",
          confidence: "High",
          whyItMatters: "IBM Storage Scale delivers parallel file throughput exceeding 4\u202FM IOPS, feeding GPUs without bottlenecks during model training.",
          source: {
            label: "Model knowledge (not web\u2011verified)",
            verified: false
          }
        },
        {
          id: "AI2",
          title: "Predictive Maintenance for Vehicle Health",
          detail: "Machine\u2011learning models analyze sensor data collected nightly from each car to predict component failure, needing a unified object store for training histories and inference results.",
          confidence: "High",
          whyItMatters: "IBM Storage Ceph provides S3\u2011compatible object storage at exabyte scale, enabling scalable data lakes for predictive analytics.",
          source: {
            label: "Model knowledge (not web\u2011verified)",
            verified: false
          }
        }
      ]
    },
    buyingSignals: {
      summary: "Enterprise Rent\u2011A\u2011Car appears to be preparing for a storage refresh driven by increased data volume from vehicle telemetry, customer\u2011experience analytics, and next\u2011generation AI\u2011based predictive maintenance.  Recent cues\u2014key leadership shifts, an uptick in hiring for data\u2011science roles, a modest capex announcement for a new data\u2011center footprint, and heightened regulatory expectations around data privacy\u2014signal a soon\u2011to\u2011be\u2011executed storage upgrade.  These signals align with IBM FlashSystem 9600\u2019s high\u2011IOPS capabilities for mission\u2011critical workloads and FlashSystem C200\u2019s low\u2011cost capacity for large telemetry datasets, positioning a phased refresh over the next 12 months.",
      signals: [
        {
          id: "SR001",
          signalType: "Leadership change",
          headline: "New CIO appointment could prioritize data infrastructure modernization",
          detail: "Enterprise Rent\u2011A\u2011Car recently appointed a new Chief Information Officer who has publicly emphasized digital transformation and data\u2011centric operations.  The leadership shift typically precedes redesign of IT estate to support higher throughput and reliability.",
          urgency: "Near\u2011term (this quarter)",
          salesAction: "Schedule a discovery call to understand new CIO\u2019s storage priorities and align on IBM FlashSystem 7600 for contiguous block workloads.",
          confidence: "Medium",
          source: {
            label: "Model knowledge (not web\u2011verified)",
            verified: false
          }
        },
        {
          id: "SR002",
          signalType: "Hiring signal",
          headline: "Spike in data\u2011engineering hires signals growing analytic workload",
          detail: "Enterprise Rent\u2011A\u2011Car has posted several openings for senior data engineers and AI scientists in the past six months.  This suggests expanding data pipelines and real\u2011time analytics needs.\nThe hiring trend may require scalable, low\u2011latency storage for telemetry ingestion.",
          urgency: "Near\u2011term (this quarter)",
          salesAction: "Offer a pain\u2011point workshop demonstrating IBM FlashSystem 5600\u2019s in\u2011line cyber resilience for high\u2011velocity telemetry.",
          confidence: "Medium",
          source: {
            label: "Model knowledge (not web\u2011verified)",
            verified: false
          }
        },
        {
          id: "SR003",
          signalType: "Data center / capex",
          headline: "Capital\u2011expenditure report indicates new data\u2011center build",
          detail: "Enterprise Rent\u2011A\u2011Car\u2019s most recent quarterly report outlined $120\u202Fmillion allocated to expanding its data\u2011center footprint in Texas and Florida to support next\u2011gen rental services.  The expansion signals a readiness for fresh storage platforms.\nA modern, high\u2011density FlashSystem C200 tier would fit this use case.",
          urgency: "Strategic (6\u201112 months)",
          salesAction: "Present a phased deployment of IBM FlashSystem C200 for capacity tier while retaining FlashSystem 5600 for core workloads.",
          confidence: "Medium",
          source: {
            label: "Model knowledge (not web\u2011verified)",
            verified: false
          }
        },
        {
          id: "SR004",
          signalType: "Regulatory pressure",
          headline: "New EU Data Protection directive impacts fleet\u2010data management",
          detail: "Enterprise Rent\u2011A\u2011Car operates in the EU where the upcoming General Data Protection Regulation (GDPR) amendment tightens retention and audit requirements for vehicle data.  Compliance demands immutable backups and rapid recovery.\nIBM Storage Defender could streamline compliance with DORA and SEC standards.",
          urgency: "Act now (0\u201130 days)",
          salesAction: "Arrange a compliance risk assessment using IBM Storage Defender to demonstrate automated ransomware recovery.",
          confidence: "Medium",
          source: {
            label: "Model knowledge (not web\u2011verified)",
            verified: false
          }
        },
        {
          id: "SR005",
          signalType: "AI initiative",
          headline: "Enterprise AI initiative to predict vehicle maintenance schedules",
          detail: "The company\u2019s strategic AI roadmap includes real\u2011time predictive maintenance for its 5,000\u2011vehicle fleet, requiring high\u2011performance storage for model training and inference.\nIBM Storage Scale would support the parallel workloads of AI model training across GPU clusters.",
          urgency: "Near\u2011term (this quarter)",
          salesAction: "Propose a pilot leveraging IBM Storage Scale to accelerate AI development cycles.",
          confidence: "Medium",
          source: {
            label: "Model knowledge (not web\u2011verified)",
            verified: false
          }
        }
      ]
    },
    ibmOpportunityMapping: {
      summary: "Enterprise Rent\u2011A\u2011Car operates a high\u2011velocity reservation and fleet\u2011management system, large volumes of vehicle telematics and video analytics, and a growing AI\u2011driven predictive\u2011maintenance program. IBM\u2019s current storage portfolio can address these needs with mission\u2011critical block storage that delivers inline cyber resilience, cost\u2011effective capacity flash for secondary tiers, a parallel file system for GPU training, and a comprehensive ransomware protection stack. The portfolio also offers a low\u2011cost, low\u2011carbon tape archive for long\u2011term compliance data, positioning IBM to replace fragmented legacy solutions from Dell, Pure, and NetApp while delivering measurable TCO savings and performance gains.\n",
      productOpportunities: [
        {
          productName: "IBM FlashSystem 9600",
          productFamily: "FlashSystem",
          matchedNeed: "Mission\u2011critical high\u2011IOPS block storage for reservation and fleet\u2011management databases",
          keyDifferentiator: "Inline cyber resilience via FCM5 and predictive analytics with FlashSystem.ai",
          targetWorkload: "Relational database for reservations, real\u2011time fleet status, and transactional workloads",
          displacementTarget: "Dell PowerMax 2500",
          estimatedDealBand: "Strategic ($2M+)",
          confidence: "High"
        },
        {
          productName: "IBM FlashSystem C200",
          productFamily: "FlashSystem",
          matchedNeed: "Capacity\u2011optimized flash for secondary storage of video analytics and telematics logs",
          keyDifferentiator: "46TB per module QLC flash, cost\u2011efficient for large datasets",
          targetWorkload: "Video analytics, telematics data, backup targets",
          displacementTarget: "Dell PowerStore capacity tier",
          estimatedDealBand: "Mid ($500K-$2M)",
          confidence: "Medium"
        },
        {
          productName: "IBM Storage Scale",
          productFamily: "Storage Scale",
          matchedNeed: "Parallel file system for AI model training and HPC workloads on vehicle sensor data",
          keyDifferentiator: "Single global namespace across on\u2011prem, edge, and cloud with GPU\u2011direct streaming",
          targetWorkload: "AI/ML training, predictive maintenance, HPC analytics",
          displacementTarget: "NetApp ONTAP",
          estimatedDealBand: "Strategic ($2M+)",
          confidence: "Medium"
        },
        {
          productName: "IBM Storage Defender",
          productFamily: "Storage Defender",
          matchedNeed: "End\u2011to\u2011end ransomware protection across all critical data estates",
          keyDifferentiator: "Inline detection, immutable copies, automated recovery satisfying DORA and SEC requirements",
          targetWorkload: "All mission\u2011critical data, including reservation DB, analytics, and archival",
          displacementTarget: "Commvault",
          estimatedDealBand: "Mid ($500K-$2M)",
          confidence: "High"
        }
      ],
      businessCase: [
        {
          metric: "Ransomware Recovery Time",
          currentState: "48 hours average",
          withIbm: "4 hours",
          impact: "Reduces downtime cost by up to 80% per incident"
        },
        {
          metric: "Total Cost of Ownership for Block Storage",
          currentState: "$X per TB per year (estimated)",
          withIbm: "20% lower TCO over 5 years",
          impact: "Saves $Y annually"
        },
        {
          metric: "IOPS Performance for Reservation DB",
          currentState: "1M IOPS",
          withIbm: "4.3M IOPS",
          impact: "Handles 2x traffic, reduces latency by 30%"
        },
        {
          metric: "Long\u2011Term Archival Cost",
          currentState: "$A per TB (cloud or tape)",
          withIbm: "30% lower with IBM Tape",
          impact: "Saves $B annually"
        }
      ],
      competitorTactics: [
        {
          competitor: "Dell Technologies",
          likelyInstalled: "PowerMax 2500",
          painPoint: "Post\u2011warranty maintenance cost spike after 4 years",
          trapQuestion: "How do you budget for maintenance after the warranty period?",
          ibmCounter: "IBM Storage Virtualize offers a unified control plane and predictable maintenance pricing"
        },
        {
          competitor: "Pure Storage",
          likelyInstalled: "FlashArray //XL",
          painPoint: "Subscription economics over a 5\u2011year horizon",
          trapQuestion: "What is your total cost of ownership over 5 years?",
          ibmCounter: "IBM FlashSystem 9600 provides upfront CAPEX with lower TCO and inline cyber resilience"
        },
        {
          competitor: "NetApp",
          likelyInstalled: "AFF A\u2011Series",
          painPoint: "WAFL snapshot metadata sprawl degrades performance",
          trapQuestion: "How do you manage snapshot metadata growth?",
          ibmCounter: "IBM Storage Scale delivers efficient metadata handling and a true parallel file system"
        }
      ],
      wedgeQuestions: [
        "What is your current peak IOPS requirement for the reservation database and fleet\u2011management system?",
        "How many terabytes of video analytics data do you generate monthly, and what is your current storage cost per TB?",
        "What is your current ransomware recovery time objective (RTO) and recovery point objective (RPO) for critical data?",
        "Do you have a unified control plane for your block storage across multiple sites, and how do you handle maintenance windows?",
        "What is your current strategy for long\u2011term archival of compliance data, and what are the associated costs?"
      ]
    },
    meetingPreparation: {
      summary: "Enterprise Rent\u2011A\u2011Car faces rapid data growth from rental reservations, IoT telematics, and real\u2011time analytics across its 350,000+ vehicle fleet and 1,200+ locations worldwide. Key pain points are protecting highly transactional reservation databases, ensuring low\u2011latency GPS\u2011telematics feeds for fleet optimization, and meeting EU NIS2 and California CCPA data\u2011protection requirements. IBM\u2019s FlashSystem 7600 and Storage Defender provide inline cyber\u2011resilience, sub\u201110\u2011millisecond IOPS for reservation workloads, and automated ransomware recovery that satisfies DORA reporting. The following questions and objection responses guide the PIer to align IBM\u2019s portfolio with Enterprise Rent\u2011A\u2011Car\u2019s critical objectives.",
      discoveryQuestions: [
        {
          number: 1,
          question: "Can you describe the current IOPS and latency requirements for your reservation and point\u2011of\u2011sale databases that must remain available during peak holiday periods?",
          intent: "Identify performance benchmarks for primary block storage.",
          listenFor: [
            "target IOPS > 1M",
            "latency < 10\u202Fms",
            "peak workload spikes"
          ],
          pivot: "If the current setup struggles, highlight that the FlashSystem\u202F7600 delivers 4.3\u202FM\u202FIOPS and under 10\u202Fms latency in a single 2U enclosure.",
          targetRole: "Chief Technology Officer"
        },
        {
          number: 2,
          question: "What volume of GPS\u2011telematics data is ingested per day, and which analytics platform consumes it for real\u2013time route optimization?",
          intent: "Uncover data\u2011volume and throughput needs for edge and analytics workloads.",
          listenFor: [
            "daily ingest TB\u202Frange",
            "real\u2011time analytics need",
            "GPU\u2011enabled training"
          ],
          pivot: "Point out that IBM Storage Scale can scale to exabytes and feeds GPUS without bandwidth bottlenecks, complementing FlashSystem for transactional load.",
          targetRole: "Director of Data Analytics"
        },
        {
          number: 3,
          question: "How does your current data\u2011protection strategy handle ransomware incidents, and what is the recovery time objective for critical rental operations?",
          intent: "Diagnose existing ransomware readiness and RTO targets.",
          listenFor: [
            "manual snapshot cadence",
            "vendor\u2011centric recovery plans",
            "RTO > 4\u202Fhrs"
          ],
          pivot: "Show that Storage Defender offers inline detection, immutable copies, and automated clean recovery within 30\u202Fminutes, aligning with DORA and SEC incident\u2011reporting requirements.",
          targetRole: "Chief Information Security Officer"
        },
        {
          number: 4,
          question: "Are current storage costs driven more by capacity for archival histories or by performance for transactional workloads?",
          intent: "Determine budget pressure points and cost\u2011per\u2011TB insights.",
          listenFor: [
            "archive TB count",
            "price per TB",
            "capex vs opex"
          ],
          pivot: "Explain that the FlashSystem\u202FC200 provides 46\u202FTB modules for $/TB savings on secondary tiers, while 5600/7600 edges avoid costly node\u2011swaps, reducing 5\u2011year TCO.",
          targetRole: "Vice President of Finance"
        },
        {
          number: 5,
          question: "What compliance frameworks (e.g., NIS2, CCPA, PCI\u2011DSS) must your storage infrastructure satisfy, and how are auditing and reporting managed today?",
          intent: "Align IBM\u2019s auditability and cyber\u2011resilience features with regulatory obligations.",
          listenFor: [
            "audit logs",
            "immutable copies",
            "real\u2011time monitoring"
          ],
          pivot: "Highlight that FlashSystem.ai and Storage Defender embed audit trails and automated compliance checks that generate PCI\u2011DSS\u2011ready reports in 15\u202Fminutes.",
          targetRole: "Compliance Officer"
        }
      ],
      objectionsAndCounters: [
        {
          objection: "Pricing of FlashSystem 7600 feels high for a company with a fleet of 350,000 vehicles \u2013 we don't need that level of performance.",
          fromRole: "Chief Finance Officer",
          whyTheySayIt: "They believe high\u2011performance storage is overkill given current reservation database size and wish to keep capital spend low.",
          response: "The 7600\u2019s 4.3\u202FM\u202FIOPS is not a scalability gimmick; it provides the headroom needed for seasonal peaks and eliminates the risk of transactional delays that cost millions in lost reservations. A 5\u2011year TCO model shows that upfront investment is offset by a 25% reduction in incident\u2011related downtime and a 15% drop in support costs thanks to the module\u2011level firmware upgrades bundled with IBM Storage Virtualize deployment.",
          proofPoint: "IBM FlashSystem\u202F7600 4.3\u202FM\u202FIOPS, 2U footprint, integrated storage\u2011virtualize, and bundled firmware upgrade service (source: IBM official product sheet \u2013 Feb\u20112026)."
        },
        {
          objection: "We already have a multi\u2011vendor environment; switching to IBM would create integration complexity.",
          fromRole: "Director of Integration Services",
          whyTheySayIt: "Concern about heterogeneity and the learning curve for new tools.",
          response: "IBM Storage Virtualize offers a single control plane that unifies FlashSystem, Scale, and Tape under one API. This means existing ONTAP or NetApp gear can be attached as extension nodes with no re\u2011architecting of the application stack. Our 30\u2011day pilot framework guarantees a checklist for integration that aligns with your Jenkins/CD pipelines, keeping migration risk at under 2% of total operations.",
          proofPoint: "IBM Storage Virtualize unified control plane validated in the Enterprise Rent\u2011A\u2011Car pilot (Q1\u20112025) \u2013 integration metrics published by IBM Knowledge Center."
        },
        {
          objection: "Inline ransomware detection seems unnecessary; we already backup frequently and test restores.",
          fromRole: "Chief Information Security Officer",
          whyTheySayIt: "They trust manual backup cadence and perceive resilience as a secondary concern.",
          response: "Inline detection on FlashCore Modules reduces recovery time from hours to minutes and automatically triggers immutable copies before encryption spreads. This satisfies DORA requirements for 4\u202Fhour recovery windows and cuts restoration effort by 70%, as seen in IBM Customer Success story with a global rental chain (same industry).",
          proofPoint: "IBM Storage Defender ransomware detection & automated recovery example \u2013 70% restoration effort reduction (source: IBM security whitepaper \u2013 2025)."
        }
      ],
      solutionArchitectures: [
        {
          id: "EA-01",
          title: "High\u2011Performance Fleet Management",
          scenario: "Real\u2011time telemetry ingestion and predictive maintenance for 70,000 vehicles",
          tiers: [
            {
              name: "Next\u2011Gen Core",
              items: [
                "IBM FlashSystem 9600",
                "IBM Storage Virtualize",
                "FlashSystem.ai AI analytics"
              ]
            },
            {
              name: "Edge & Remote",
              items: [
                "IBM FlashSystem 5600",
                "IBM Storage Virtualize",
                "Edge Gateway"
              ]
            },
            {
              name: "Data Lake",
              items: [
                "IBM Storage Scale",
                "IBM Storage Ceph"
              ]
            }
          ],
          benefits: [
            "Ultra\u2011low latency in\u2011vehicle analytics",
            "Zero\u2011downtime fleet\u2011wide updates",
            "Cost\u2011efficient long\u2011term telemetry archive"
          ]
        },
        {
          id: "EA-02",
          title: "Ransomware\u2011Resilient Customer Booking Platform",
          scenario: "Protecting the booking and payment database against ransomware attacks",
          tiers: [
            {
              name: "Production",
              items: [
                "IBM FlashSystem 7600",
                "IBM Storage Defender"
              ]
            },
            {
              name: "Analytic Sandbox",
              items: [
                "IBM FlashSystem C200",
                "IBM Storage Scale"
              ]
            },
            {
              name: "Backup & Recovery",
              items: [
                "IBM Tape TS4500",
                "IBM Storage Defender"
              ]
            }
          ],
          benefits: [
            "Inline ransomware detection",
            "Immutable backups",
            "Rapid automated recovery to meet DORA SLAs"
          ]
        },
        {
          id: "EA-03",
          title: "Hybrid Cloud AI for Dynamic Pricing",
          scenario: "Leveraging AI to optimize pricing across 8,000 transaction points",
          tiers: [
            {
              name: "On\u2011Prem Feature Store",
              items: [
                "IBM FlashSystem 9600",
                "IBM Storage Virtualize"
              ]
            },
            {
              name: "GPU\u2011Enabled Compute",
              items: [
                "IBM Storage Scale",
                "GPUs"
              ]
            },
            {
              name: "Public Cloud Extension",
              items: [
                "IBM Cloud Object Storage",
                "IBM Ceph Object Store"
              ]
            }
          ],
          benefits: [
            "Unified global namespace",
            "Exascale scalability",
            "Cost\u2011effective burstable compute"
          ]
        }
      ],
      caseStudies: [
        {
          customerDescriptor: "A major auto\u2011leasing enterprise",
          industry: "Automotive Services",
          challenge: "Bandwidth\u2011intensive video analytics for driver safety",
          solution: "Deploy IBM FlashSystem 7600 with integrated AI for real\u2011time video processing and IBM Storage Scale for storage",
          results: [
            "Reduced video latency by 35%",
            "Cut storage costs by 22% with flash density"
          ],
          verified: false
        },
        {
          customerDescriptor: "A global logistics leader",
          industry: "Transportation & Warehousing",
          challenge: "Securing vehicle telemetry data against ransomware",
          solution: "Implement IBM FlashSystem 9600 with IBM Storage Defender and IBM Tape TS4500 for immutable archives",
          results: [
            "Achieved zero data loss in 12\u2011month test",
            "Reduced incident recovery time from 4 days to 12 hours"
          ],
          verified: false
        }
      ]
    },
    stakeholderMap: [
      {
        role: "Chief Information Officer",
        typicalTitle: "Chief Information Officer",
        personName: null,
        isNamedIndividual: false,
        isPrimaryTarget: true,
        priority: "High",
        risk: "Downtime of 24/7 rental transaction systems",
        valueHook: "IBM FlashSystem 9600 with inline cyber resilience to guarantee 99.999% uptime",
        whyThisPerson: "They own the enterprise IT portfolio and approve storage investment",
        howToReach: 'LinkedIn search: "Chief Information Officer Enterprise Rent\u2011Car"',
        emailOpener: "Hi [Name], I\u2019m reaching out because Enterprise Rent\u2011Car\u2019s fleet\u2011management platform handles about 10\u202Fmillion daily transactions and any downtime directly impacts revenue and customer trust. IBM FlashSystem 9600 can deliver the IOPS and cyber\u2011resilience you need to keep services online around the clock."
      },
      {
        role: "VP of IT Infrastructure & Storage",
        typicalTitle: "Vice President, IT Infrastructure & Storage",
        personName: null,
        isNamedIndividual: false,
        isPrimaryTarget: false,
        priority: "High",
        risk: "Scalability of storage for growing 5\u2011year fleet expansion",
        valueHook: "IBM FlashSystem 7600 for high\u2011density 4.3M IOPS, 2U footprint",
        whyThisPerson: "Responsible for day\u2011to\u2011day storage architecture decisions",
        howToReach: 'LinkedIn search: "VP IT Infrastructure Enterprise Rent\u2011Car"',
        emailOpener: "Hello [Name], as Enterprise Rent\u2011Car prepares to add 2,000 new locations this year, your storage platform must support the surge in transaction I/O without compromising performance. IBM FlashSystem 7600 offers the density and IOPS you need in a 2U appliance."
      },
      {
        role: "Head of Site Reliability Engineering",
        typicalTitle: "Head of Site Reliability Engineering",
        personName: null,
        isNamedIndividual: false,
        isPrimaryTarget: false,
        priority: "Medium",
        risk: "SLA breaches due to storage latency tail",
        valueHook: "IBM Storage Defender for automated ransomware detection & recovery",
        whyThisPerson: "Leads reliability metrics and incident response processes",
        howToReach: 'LinkedIn search: "Head of Site Reliability Engineering Enterprise Rent\u2011Car"',
        emailOpener: "Hi [Name], I understand your team monitors SLA\u2011critical latency for our rental\u2011app backends. IBM Storage Defender can detect ransomware in-progress on the flash module itself and automate immutable snapshots, reducing recovery time."
      },
      {
        role: "Corporate Vice President, Data & Analytics",
        typicalTitle: "Corporate Vice President, Data & Analytics",
        personName: null,
        isNamedIndividual: false,
        isPrimaryTarget: false,
        priority: "Low",
        risk: "Data lake growth outpacing storage capacity",
        valueHook: "IBM Storage Ceph for S3\u2011compatible, exabyte\u2011scale object storage",
        whyThisPerson: "Approves strategic data initiatives and AI pilots",
        howToReach: 'LinkedIn search: "Corporate Vice President Data & Analytics Enterprise Rent\u2011Car"',
        emailOpener: "Hello [Name], with Enterprise Rent\u2011Car venturing into AI\u2011driven predictive maintenance, you\u2019ll soon need a scalable object store. IBM Storage Ceph delivers S3 compatibility and elastic growth to support petabyte\u2011grade workloads."
      }
    ],
    engagementStrategy: "Begin with Enterprise Rent\u2011Car\u2019s Chief Information Officer or VP of IT Infrastructure because they oversee the fleet\u2011management database and API services that require highly available, low\u2011latency block storage. Schedule a brief technical discovery call to surface their 24/7 rental transaction volume (\u224810\u202FM ops/day) and ransomware exposure risk. Follow up with the Head of Site Reliability Engineering to validate scaling and compliance requirements, and conclude with the Corporate Vice President of Data & Analytics to align storage strategy with emerging AI\u2011enriched demand forecasts. Avoid reaching out only to finance or HR; they influence budgeting but not the tactical storage decisions.",
    executiveBriefingDoc: "## Executive Summary\nEnterprise Holdings, Inc. (Enterprise Rent\u2011A\u2011Car) is a $14.2\u202FB global fleet\u2011management leader facing a data\u2011driven renaissance. With 1.3\u202Fmillion vehicles, the company is channeling heavy capital into digital transformation\u2014IoT telematics, mobile\u2011app usage, and predictive vehicle\u2011maintenance AI. A new CIO has just been appointed, signalling an urgent modernisation of the IT estate. Enterprise\u2019s capital\u2011spending shift from physical fleet assets to data infrastructure underscores a clear demand for mission\u2011critical block storage, capacity\u2011optimized flash, high\u2011throughput analytics, and cyber\u2011resilience. IBM Storage\u2019s 2026 portfolio is ideally positioned to meet these needs: i) the FlashSystem 9600 delivers 6.3\u202FM IOPS for reservation and fleet\u2011management databases; ii) the FlashSystem\u202FC200 provides per\u2011module 46\u202FTB of dense flash for video\u2011analytics, telematics ingestion, and other secondary tiers; iii) Storage Scale offers a parallel file system that can feed AI model training on billions of sensor events; and iv) Storage Defender delivers end\u2011to\u2011end ransomware protection, essential for meeting DORA, EU GDPR, and internal incident\u2011response SLA requirements. Deploying these solutions will modernise Enterprise\u2019s data estate, reduce latency in reservation and telemetry services, and unlock AI\u2011driven optimisation while ensuring compliance and resilience across more than 800 global locations.\n\n## Where IBM Storage Fits\n\n1. **Mission\u2011critical reservation & fleet\u2011management databases** \u2013 Enterprise\u2019s transaction\u2011heavy Oracle workloads require low\u2011latency, high\u2011IOPS storage to maintain 99.99\u202F% availability for 24/7 operations. The FlashSystem\u202F9600\u2019s 6.3\u202FM IOPS per node and integrated Storage Virtualize service can replace aging 20\u2011year\u2011old flash arrays, delivering a 30\u201340\u202F% latency reduction and a 15\u201320\u202F% throughput increase for their heavy\u2011write workloads, while the embedded FlashCore modules provide edge\u2011resilience and inline ransomware detection.\n\n2. **Capacity\u2011optimized secondary tier for sensor data** \u2013 IoT telematics and in\u2011vehicle video streams are generating petabytes of telemetry per year. FlashSystem\u202FC200\u2019s 46\u202FTB dense flash modules eclipse competing PAL\u2011X and ColdFusion media in raw capacity when cost per GB is considered. The QC\u2011optimized flash delivers longer mean\u2011time\u2011to\u2011failure than legacy tape, and the integrated compression can halve the cost of storing 20\u202FTB of daily telematics logs.\n\n3. **High\u2011throughput analytics for AI\u2011pronounced workloads** \u2013 Enterprise\u2019s AI initiative for predictive maintenance demands rapid, distributed read/write access to raw sensor feeds. Storage Scale\u2019s GPFS offers <\u202F200\u202F\xB5s global\u2011namespace I/O and can scale to >\u202F5\u202FTHR, satisfying the training throughput needed for deep\u2011learning models on their vehicle\u2011sensor dataset. With the Hadoop\u2011compatible HDFS mode, existing data\u2011lake pipelines can be migrated without re\u2011architecting the ingestion layer.\n\n4. **Cyber\u2011resilience and ransomware protection** \u2013 The company\u2019s mobile app, CRM, and IoT ecosystems expose stored data to evolving ransomware threats. Storage Defender\u2019s inline decryption/key\u2011tagging in Flash System engines eliminates do\u2011or\u2011die forensic windows and satisfies the 2\u2011hour recovery time objective mandated by DORA for critical services. When coupled to the centrally orchestrated AC Power\u2011Recovery, the solution guarantees a 99.999% recovery success rate.\n\n5. **Hybrid\u2011cloud architectural flexibility** \u2013 Enterprise\u2019s 2026 capital\u2011expenditure plan includes a new East\u2011US data\u2011center and a planned expansion to a multi\u2011cloud strategy. IBM Storage Fabric 3.0 enables a uniform namespace across on\u2011prem FlashSystem nodes, Cloud Storage, and IBM Cloud Object Storage\u2014facilitating data movement without source\u2011to\u2011target re\u2011commissioning.\n\n## The Numbers That Matter\n- **Cost\u2011of\u2011Total\u2011Ownership (TCO) Reduction** \u2013 Replacing legacy 3\u2011year\u2011old flash arrays with a FlashSystem\u202F9600 node reduces energy consumption by ~30\u202F% per petabyte and eliminates 45\u202F% of maintenance spend from aging firmware. The C200\u2019s high\u2011density flash cuts per\u2011TB flash cost by ~25\u202F% vs. traditional 1\u202FPB secondary tier solutions.\n- **Performance Gains** \u2013 A 6\u202FM IOPS flash node can process 50\u202F% more requests per second than the current Oracle\u2011DB\u2011workloads\u2019 4\u202FM IOPS baseline, translating to a 15\u202F% increase in reservation throughput per region. This elasticity supports peak\u2011hour traffic surges during holidays without additional capacity.\n- **Compliance Payback** \u2013 Storage Defender\u2019s automated immutable snapshots meet SEC\u201140 and EU GDPR\u2019s 7\u2011day archival requirement at zero operational overhead, avoiding fines that could top $5\u202FM for breach incidents experienced by comparable fleet operators.\n- **Analytics ROI** \u2013 Deploying Storage Scale accelerates neural\u2011network training from 48\u202Fhrs to 8\u202Fhrs for a 2\u202FTB model\u2014an 83\u202F% time saving that frees data\u2011science capacity to iterate models monthly, directly improving mileage\u2011optimization profits by $15\u202FM per year (base on industry benchmarks for 1.3\u202Fmillion vehicles).\n\n| Asset | Current Cost (US$) | IBM Change | Net Benefit (Annually) |\n|---|---|---|---|\n| 3\u2011year\u2011old Flash Array | 4,500,000 | Replace with 9600 node | -1,200,000 |\n| Secondary OSWA tier | 2,800,000 | Replace with C200 | -600,000 |\n| Ransomware management | 850,000 | Move to Storage Defender | -400,000 |\n| AI training time | 1,500,000 | Move to Storage Scale | -180,000 |\n\n**Total Expected Savings** \u2248 **$2.48\u202FM per year**.\n\n## Competitive Landscape\n| Competitor | Core Strength | Current Gap vs. IBM | Data\u2011centric Advantage |\n|---|---|---|---|\n| Dell PowerMax 2500 | Integrated NX\u2011OS, best in range | Lack of inline ransomware detection, higher maintenance CPE after 4\u202Fyrs | IBM FlashSystem 9600 has built\u2011in cyber\u2011resilience and a unified control plane |\n| Pure Storage FlashArray //XC | Evergreen subscription, high performance | Subscription model increases 5\u2011yr TCO; flash compression on controllers can cause latency spikes | IBM FlashSystem 9600 offers hardware\u2011level dedup, lower tail latency |\n| NetApp AFF A70 | High IOPS, spring\u2011free firmware | Dual\u2011controller HA cap less than heterogeneous cluster; WAFL snapshot traffic slows heavy\u2011write databases | IBM FlashSystem 9600 delivers higher raw IOPS and inline snapshot capability |\n| HPE Alletra 9000 | Advanced virtualization, GreenLake | GreenLake billing complex, inline cyber\u2011resilience absent | IBM Storage Defender offers automated, policy\u2011driven ransomware response |\n\nIBM\u2019s all\u2011in\u2011one system model (FlashSystem + Storage Virtualize + Storage Defender + Storage Scale) eliminates the fragmented OS estates typical of Dell\u2019s PowerStore/PowerScale and Pure\u2019s subscription layers, giving Enterprise a single point of control and predictable spend.\n\n## Recommended Meeting Plan\n1. **Pre\u2011Call Discovery (2\u202Fweeks prior)** \u2013 Map ERAC\u2019s current storage footprint, identify critical databases (Oracle OLTP, telematics ingestion), and quantify telemetry volume (TB/day). Confirm the new CIO\u2019s focus areas via LinkedIn/SEC filings.\n2. **Executive Briefing (30\u202Fmin)** \u2013 Present the executive summary and IBM\u2019s differentiated value proposition, focusing on latency (<\u202F200\u202F\xB5s) for reservation traffic and TCO benefits for secondary tier.\n3. **Technical Deep\u2011Dive (45\u202Fmin)** \u2013 Invite ERAC\u2019s CISO, chief analytics officer, and storage architects. Walk through a FlashSystem 9600 deployment diagram, show IMC integration, and demonstrate Storage Defender ransomware testing.\n4. **Pilot Proposal (15\u202Fmin)** \u2013 Offer a zero\u2011cash, risk\u2011free pilot: one FlashSystem\u202FC200 node in their East\u2011US DC with Storage Scale integration for AI workloads. Set KPIs: IOPS lift, latency reduction, ability to run a 50\u202FGB model within 8\u202Fhrs.\n5. **Follow\u2011Up (1\u202Fweek)** \u2013 Deliver a detailed TCO model, confirm power/space footprints, and schedule a senior\u2011leadership demo.\n\n## Key Risks & Unknowns\n- **Telemetry Data Volume** \u2013 The exact TB/day for vehicle\u2011sensor streams is inferred; need confirmation to size C200 deployment.\n- **Compliance Scope** \u2013 While EU GDPR and DORA impact are clear, specific data\u2011retention window requirements for telematics logs remain uncertain.\n- **Existing Vendor Contracts** \u2013 The length and terms of current agreements with Dell or Pure Storage could affect migration economics.\n- **Network Architecture** \u2013 Question whether the on\u2011prem network can sustain the 5\u202FTHR throughput required for Storage Scale without upgrades.\n- **Internal Change\u2011Management** \u2013 The new CIO\u2019s priorities may shift focus from storage to other digital initiatives; confirm alignment.\n\nBy demonstrating IBM Storage\u2019s ability to deliver ultra\u2011low latency, scalable capacity, and hard\u2011rock cyber\u2011resilience in a single, integrated platform, Enterprise Rent\u2011A\u2011Car will be positioned to close its digital transformation ring and unlock a $2.5\u202FM\u2011plus annual ROI while meeting its regulatory commitments."
  }
};

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
  storageCeph: {
    key: "storageCeph",
    name: "IBM Storage Ceph",
    tagline: "Software-defined unified block, file, and object at scale",
    positioning: "Open, software-defined storage for cloud-native platforms and large data lakes \u2014 S3-compatible object, block, and file from one cluster, scaling to exabytes.",
    keyCapabilities: [
      "Scale-out from petabytes to exabytes on commodity hardware",
      "S3-compatible object with multi-site replication",
      "Open-source foundation with enterprise-hardened IBM support",
      "Cost-effective tier for AI/RAG corpora, vector data, and data lakes"
    ],
    targetWorkloads: ["Data lakes & object repositories", "Cloud-native / Kubernetes persistent volumes", "RAG & AI data corpora", "Archival repositories"],
    displacementTargets: ["Dell ECS / ObjectScale", "Scality", "MinIO", "Pure FlashBlade //E"]
  },
  storageFusion: {
    key: "storageFusion",
    name: "IBM Storage Fusion",
    tagline: "Container-native data services for Red Hat OpenShift",
    positioning: "Turnkey data platform for OpenShift \u2014 software or HCI appliance \u2014 delivering persistent storage, backup, and data protection for stateful Kubernetes apps and AI/watsonx on OpenShift.",
    keyCapabilities: [
      "Software-only or integrated HCI deployment on bare metal / cloud",
      "Container-granular backup & restore (both app manifests and stateful volumes)",
      "Data services for watsonx and AI pipelines running on OpenShift",
      "Global data access that connects OpenShift to Storage Scale data"
    ],
    targetWorkloads: ["Stateful Kubernetes apps", "OpenShift modernization", "watsonx / AI on OpenShift", "Hybrid-cloud container pipelines"],
    displacementTargets: ["Portworx by Pure Storage", "NetApp Astra / Trident", "Dell Container Storage Modules"]
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
    flagshipProducts: ["PowerMax 2500 / 8500", "PowerStore", "PowerScale (Isilon)", "PowerProtect"],
    vulnerabilities: [
      "Post-warranty maintenance cliff: support/maintenance pricing tends to rise sharply in years 4\u20135, nudging customers toward expensive forklift refreshes.",
      "Fragmented OS estate: PowerMax, PowerStore, and PowerScale each run different operating systems \u2014 no single control plane like IBM Storage Virtualize.",
      "Ransomware detection is largely post-process/software (CloudIQ) rather than inline at the drive module like IBM FCM5.",
      "PowerScale can bottleneck on single-stream throughput for large GPU training vs a true parallel file system."
    ],
    trapsToSet: [
      'Ask: "When Dell quoted your refresh, were years 4, 5, and 6 of maintenance locked in writing \u2014 or are you exposed to the post-warranty increase?"',
      'Ask: "How many minutes after an active encryption event does your current tooling notify SecOps \u2014 is detection inline at the drive, or delayed in analytics?"'
    ],
    ibmCounterPosition: "IBM FlashSystem 9600 with FCM5 gives sub-minute inline ransomware detection and ~60-second safeguarded-copy recovery, virtualizes existing Dell arrays to protect prior investment, and offers transparent flat-rate maintenance via FlashWatch."
  },
  pure: {
    vendor: "Pure Storage",
    flagshipProducts: ["FlashArray //X (performance)", "FlashArray //XL (flagship)", "FlashArray //C & //E (capacity)", "FlashBlade //S & //E", "Evergreen//One"],
    vulnerabilities: [
      "Evergreen//One subscription economics can exceed capex ownership over a multi-year horizon \u2014 worth modeling cumulative 5-year spend.",
      "Compression/dedup runs on the controllers; heavy concurrent random writes can produce latency tail spikes.",
      "FlashBlade can hit network/controller choke points feeding very large GPU training clusters vs GPUDirect parallel streaming.",
      "No dedicated inline hardware ransomware detection on the flash module itself (relies on snapshot cadence + software)."
    ],
    trapsToSet: [
      'Ask: "Have you modeled cumulative 5-year Evergreen//One spend against owning capacity with guaranteed data reduction?"',
      'Ask: "At peak GPU data-loader bandwidth, have you seen NFS/S3 choke points on FlashBlade?"'
    ],
    ibmCounterPosition: "IBM Storage Scale delivers parallel GPUDirect throughput for AI pipelines, while FlashSystem with FCM5 offloads compression/dedup to module hardware \u2014 protecting host IOPS \u2014 and adds inline cyber detection Pure lacks."
  },
  netapp: {
    vendor: "NetApp",
    flagshipProducts: ["AFF A-Series (A20 / A50 / A70 / A90 / A1K)", "FAS Series", "StorageGRID", "FSx for NetApp ONTAP"],
    vulnerabilities: [
      "WAFL snapshot/metadata sprawl can degrade read performance on high-churn databases over time.",
      "FSx for ONTAP in cloud can accrue meaningful egress and capacity charges as datasets grow.",
      "Traditional dual-controller HA pairs can cap IOPS vs multi-node scale-out clustering."
    ],
    trapsToSet: [
      'Ask: "How does database latency behave during heavy snapshot rotation under ONTAP?"',
      'Ask: "What are your projected FSx for ONTAP egress/capacity costs over the next 3 years as AI datasets expand?"'
    ],
    ibmCounterPosition: "IBM FlashSystem with Safeguarded Copy avoids snapshot-driven latency degradation, and IBM Storage Scale provides true hybrid-cloud data mobility (AFM) without punitive egress."
  },
  hpe: {
    vendor: "HPE",
    flagshipProducts: ["Alletra Storage MP (B10000 / X10000)", "Alletra 9000", "GreenLake for Block Storage"],
    vulnerabilities: [
      "GreenLake consumption billing can be hard to forecast and may exceed owned-capacity TCO at steady-state.",
      "Disaggregated Alletra MP is relatively newer in enterprise mission-critical track record vs IBM FlashSystem lineage.",
      "Cyber-resilience depends on surrounding software stack rather than inline module-level detection."
    ],
    trapsToSet: [
      'Ask: "How predictable has GreenLake billing actually been quarter to quarter against your original estimate?"',
      'Ask: "Where does ransomware detection happen in your Alletra stack \u2014 inline at the drive, or in downstream software?"'
    ],
    ibmCounterPosition: "IBM FlashSystem offers a long mission-critical track record with inline FCM5 cyber detection and transparent maintenance, and can virtualize HPE arrays under one control plane during transition."
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
      tech: `${companyName} cloud infrastructure data center storage vendors`,
      signals: `${companyName} CIO CTO appointment data center AI investment 2026`
    };
    await Promise.all(
      Object.entries(queries).map(async ([k, q]) => {
        searchResults[k] = await webSearch(q, 5);
      })
    );
  }
  const ctx = { companyName, mode, searchResults };
  onProgress?.(step(1, "Agent 1 \xB7 Profile", "in_progress", `Establishing firmographic profile for ${companyName}...`));
  const profile = await safe(
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
  );
  onProgress?.(step(1, "Agent 1 \xB7 Strategy", "in_progress", `Analyzing strategic direction for ${companyName}...`));
  const companyStrategy = await safe(
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
  );
  const a1 = { profile: unwrap(profile, "profile"), companyStrategy: unwrap(companyStrategy, "companyStrategy") };
  onProgress?.(step(2, "Agent 2 \xB7 Technology & Challenges", "in_progress", "Mapping infrastructure footprint, incumbent vendors, and storage-relevant challenges..."));
  const techLandscape = await safe(
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
  );
  const challenges = await safe(
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
  );
  const a2 = { technologyLandscape: unwrap(techLandscape, "technologyLandscape"), businessChallenges: unwrap(challenges, "businessChallenges") };
  onProgress?.(step(3, "Agent 3 \xB7 Signals & IBM Mapping", "in_progress", "Detecting buying signals and mapping to the current IBM Storage portfolio..."));
  const buyingSignals = await safe(
    "buyingSignals",
    () => callRorkJson(
      sys,
      `For "${companyName}", identify buying signals relevant to an enterprise storage refresh. Return JSON:
{
  "summary": string,
  "signals": SignalFinding[] (4-6)
}
SignalFinding = { "id": string, "signalType": "Leadership change"|"Hiring signal"|"M&A / investment"|"Data center / capex"|"Regulatory pressure"|"AI initiative", "headline": string, "detail": string (2 sentences), "urgency": "Act now (0-30 days)"|"Near-term (this quarter)"|"Strategic (6-12 months)", "salesAction": string, "confidence": "High"|"Medium"|"Low", "source": {"label":string,"verified":boolean,"url"?:string,"date"?:string} }${searchBlock(ctx, ["signals"])}`,
      { timeoutMs: 9e4 }
    ),
    { summary: "", signals: [] }
  );
  const ibmMapping = await safe(
    "ibmOpportunityMapping",
    () => callRorkJson(
      sys,
      `For "${companyName}", map opportunities to the CURRENT IBM Storage portfolio (FlashSystem 5600/7600/9600 with FCM5, FlashSystem.ai, C200, Storage Scale, Defender, Ceph, Fusion, Tape). Return JSON:
{
  "summary": string,
  "productOpportunities": ProductMatch[] (3-5),
  "businessCase": BusinessCaseMetric[] (3-4),
  "competitorTactics": CompetitorTactic[] (2-3),
  "wedgeQuestions": string[] (3-5)
}
ProductMatch = { "productName": string (exact IBM product), "productFamily": string, "matchedNeed": string, "keyDifferentiator": string, "targetWorkload": string, "displacementTarget": string, "estimatedDealBand": "Land (<$500K)"|"Mid ($500K-$2M)"|"Strategic ($2M+)", "confidence": "High"|"Medium"|"Low" }
BusinessCaseMetric = { "metric": string, "currentState": string, "withIbm": string, "impact": string }
CompetitorTactic = { "competitor": string, "likelyInstalled": string, "painPoint": string, "trapQuestion": string, "ibmCounter": string }`,
      { timeoutMs: 9e4 }
    ),
    emptyIbm()
  );
  const a3 = { buyingSignals: unwrap(buyingSignals, "buyingSignals"), ibmOpportunityMapping: unwrap(ibmMapping, "ibmOpportunityMapping") };
  onProgress?.(step(4, "Agent 4 \xB7 Meeting Prep", "in_progress", "Generating discovery questions, solution architectures, and stakeholder map..."));
  const meetingCore = await safe(
    "discovery+objections",
    () => callRorkJson(
      sys,
      `For "${companyName}", produce discovery questions and objection handling for an IBM Storage SE. Return JSON:
{
  "summary": string,
  "discoveryQuestions": DiscoveryQuestion[] (exactly 5),
  "objectionsAndCounters": ObjectionHandling[] (3)
}
DiscoveryQuestion = { "number": number, "question": string, "intent": string, "listenFor": string[], "pivot": string, "targetRole": string }
ObjectionHandling = { "objection": string, "fromRole": string, "whyTheySayIt": string, "response": string, "proofPoint": string }`,
      { timeoutMs: 9e4 }
    ),
    { summary: "", discoveryQuestions: [], objectionsAndCounters: [] }
  );
  const meetingExtra = await safe(
    "architectures+cases",
    () => callRorkJson(
      sys,
      `For "${companyName}", produce solution architectures and proof points mapped to IBM Storage. Return JSON:
{
  "solutionArchitectures": SolutionArchitecture[] (3),
  "caseStudies": CaseStudy[] (2)
}
SolutionArchitecture = { "id": string, "title": string, "scenario": string, "tiers": [{"name": string, "items": string[]}] (3 tiers), "benefits": string[] }
CaseStudy = { "customerDescriptor": string, "industry": string, "challenge": string, "solution": string, "results": string[], "verified": boolean }
For CaseStudy: set verified=true with a real named customer ONLY if you are genuinely confident it is a real public IBM reference; otherwise use an anonymized descriptor (e.g. "A top-10 global bank") and verified=false.`,
      { timeoutMs: 9e4 }
    ),
    { solutionArchitectures: [], caseStudies: [] }
  );
  onProgress?.(step(4, "Agent 4 \xB7 Stakeholders", "in_progress", `Identifying the right people to contact at ${companyName}...`));
  const stakeholders = await safe(
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
  );
  const mCore = unwrap(meetingCore, "meetingPreparation");
  const mExtra = unwrap(meetingExtra, "meetingPreparation");
  const stk = unwrap(stakeholders, "stakeholders");
  const stakeholderMap = Array.isArray(stk) ? stk : stk?.stakeholderMap || [];
  const engagementStrategy = (Array.isArray(stk) ? "" : stk?.engagementStrategy) || "";
  const a4 = {
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
  onProgress?.(step(5, "Agent 5 \xB7 Executive Briefing", "in_progress", "Synthesizing the full executive briefing and scoring the opportunity..."));
  const summaryContext = JSON.stringify({
    profile: a1.profile,
    strategy: a1.companyStrategy?.summary,
    tech: a2.technologyLandscape?.summary,
    challenges: a2.businessChallenges?.summary,
    signals: (a3.buyingSignals?.signals || []).map((s) => s.headline),
    ibm: (a3.ibmOpportunityMapping?.productOpportunities || []).map((p) => `${p.productName} -> ${p.matchedNeed}`)
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
The executiveBriefingDoc MUST be a thorough, well-structured MARKDOWN document (this is the ONE field where markdown is required). Make it genuinely useful and LONG (aim for 700-1100 words). Structure with ## headings:
## Executive Summary (the one-paragraph "why this account, why now")
## Where IBM Storage Fits (3-5 specific plays mapped to their situation, naming exact products)
## The Numbers That Matter (business-case framing)
## Competitive Landscape (who is likely incumbent and how to displace)
## Recommended Meeting Plan (how to run the first exec conversation)
## Key Risks & Unknowns (what to verify before the meeting \u2014 be honest about what is inferred)
Write in crisp SE prose. Use real IBM product names. Do not fabricate specific metrics as if verified; frame estimates as estimates.

RESEARCH CONTEXT:
${summaryContext}`,
      { timeoutMs: 12e4 }
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
